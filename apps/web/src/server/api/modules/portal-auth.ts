// Staff portal sign-in. Staff never get passwords here:
//   - Google, with the UCC email on their staff record (shares the admin's
//     Google client: GET /api/auth/google?portal=1);
//   - a one-time code sent by SMS and email to the contact details on their
//     staff record.
// HR officers and IT support who are also staff move between the admin and
// the portal without signing in again.
//
//   GET  /api/portal/auth/config
//   POST /api/portal/auth/code      { identifier }   staff number or UCC email → code sent
//   POST /api/portal/auth/verify    { identifier, code }
//   GET  /api/portal/auth/dev?staffNo=&next=        development only (DEV_LOGIN=true)
//   POST /api/portal/auth/logout    GET /api/portal/auth/me
//   POST /api/portal/auth/to-admin  portal → admin (an active admin account with this staff number; not while switched)
//   POST /api/portal/auth/switch-back  ends an administrator's switched access
//   POST /api/auth/to-portal        admin → portal (in modules/auth.ts)
import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'
import { PORTAL_COOKIE, PORTAL_TTL_SECONDS, SWITCH_TTL_SECONDS } from '#/server/portal-session'
import { getPortalUser, signStaffToken } from '#/server/portal-session-core'
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from '#/server/session'
import { signSessionToken } from '#/server/session-core'
import { audit } from '../lib/audit'
import { exec, one } from '../lib/db'
import { AppError } from '../lib/errors'
import { ACTIVE_IN } from '../lib/hr'
import { normalizeEmail, normalizePhone, notify } from '../lib/messaging'
import { portalUser, requireStaffUser } from '../lib/portal'
import { clientIp, rateLimit } from '../lib/rate-limit'
import { validate } from '../lib/validate'

const CODE_MINUTES = 10
const MAX_ATTEMPTS = 5
const MAX_CODES = 3 // per staff member per 15 minutes

const devLoginEnabled = () => process.env.NODE_ENV !== 'production' && process.env.DEV_LOGIN === 'true'
const googleEnabled = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
const hash = (staffNo: number, code: string) => createHash('sha256').update(`${staffNo}:${code}:${process.env.SESSION_SECRET ?? ''}`).digest('hex')
const safeNext = (value: string | undefined) => (value && value.startsWith('/portal') && !value.startsWith('//') ? value.slice(0, 300) : '/portal')

/** `actor`: the administrator using switched access (Admin → Staff → Switch Access). */
export async function startStaffSession(c: Context, staffNo: number, method: 'google' | 'code' | 'admin' | 'dev' | 'switch', actor?: number) {
  setCookie(c, PORTAL_COOKIE, await signStaffToken(staffNo, actor), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: actor ? SWITCH_TTL_SECONDS : PORTAL_TTL_SECONDS,
  })
  void exec('INSERT INTO hrms_staff_logins (staff_no, method, ip) VALUES (?, ?, ?)', [staffNo, method, clientIp(c).slice(0, 64)]).catch(() => undefined)
}

/** An active staff member by staff number, UCC email or personal email. */
export async function findStaff(identifier: string) {
  const id = identifier.trim().toLowerCase()
  const byNumber = /^\d{3,6}$/.test(id)
  return one<{ staffNo: number; fname: string | null; phone: string | null; uccMail: string | null; email: string | null }>(
    `SELECT staff_no, fname, phone, LOWER(TRIM(ucc_mail)) AS ucc_mail, LOWER(TRIM(email)) AS email FROM staff
      WHERE ${byNumber ? 'staff_no = ?' : '(LOWER(TRIM(ucc_mail)) = ? OR LOWER(TRIM(email)) = ?)'}
        AND staff_status IN ${ACTIVE_IN} AND COALESCE(flag_delete, 0) = 0 AND staff_no > 0
      ORDER BY staff_no DESC LIMIT 1`,
    byNumber ? [Number(id)] : [id, id],
  )
}

const maskPhone = (p: string) => `•••• ${p.slice(-3)}`
const maskEmail = (e: string) => {
  const [user, domain] = e.split('@')
  return `${user!.slice(0, 2)}${'•'.repeat(Math.max(1, Math.min(6, user!.length - 2)))}@${domain}`
}

const identifierSchema = z.object({ identifier: z.string().trim().min(3, 'Enter your staff number or UCC email').max(190) })
const verifySchema = identifierSchema.extend({ code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code') })

export const portalAuthRoute = new Hono()
  .get('/config', (c) => c.json({ google: googleEnabled(), devLogin: devLoginEnabled() }))

  .post('/code', rateLimit('portal-code', 10, 900), validate('json', identifierSchema), async (c) => {
    const staff = await findStaff(c.req.valid('json').identifier)
    // The same answer whether or not the staff number exists.
    const generic = { sent: false, message: 'If that staff number or email is active, a sign-in code is on its way.' }
    if (!staff) return c.json(generic)
    const recent = await one<{ n: number }>('SELECT COUNT(*) AS n FROM hrms_staff_codes WHERE staff_no = ? AND created_at > NOW() - INTERVAL 15 MINUTE', [staff.staffNo])
    if (Number(recent?.n ?? 0) >= MAX_CODES) throw new AppError('Too many codes requested. Please wait 15 minutes and try again.', 429)
    const phone = normalizePhone(staff.phone)
    const email = normalizeEmail(staff.uccMail) ?? normalizeEmail(staff.email)
    if (!phone && !email) throw new AppError('There is no phone number or email on your staff record. Please contact the Directorate of Human Resource.', 422)
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    await exec(`INSERT INTO hrms_staff_codes (staff_no, code_hash, expires_at) VALUES (?, ?, NOW() + INTERVAL ${CODE_MINUTES} MINUTE)`, [staff.staffNo, hash(staff.staffNo, code)])
    const text = `Your UCC staff portal sign-in code is ${code}. It expires in ${CODE_MINUTES} minutes. Do not share it with anyone. - DHR, UCC`
    const results = await notify({
      kind: 'signin_code',
      key: `signin:${staff.staffNo}:${Date.now()}`,
      staffNo: staff.staffNo,
      phone,
      email,
      sms: phone ? text : null,
      subject: email ? 'Your UCC staff portal sign-in code' : null,
      text,
      logText: '[sign-in code]',
    })
    const reached = results.filter((r) => r.status === 'sent' || r.status === 'simulated')
    if (!reached.length) throw new AppError('We could not send your code just now. Please try again in a few minutes.', 422)
    const to = reached.map((r) => (r.channel === 'sms' ? `your phone ${maskPhone(phone!)}` : `your email ${maskEmail(email!)}`))
    return c.json({ sent: true, message: `We sent a 6-digit code to ${to.join(' and ')}.` })
  })

  .post('/verify', rateLimit('portal-verify', 20, 900), validate('json', verifySchema), async (c) => {
    const { identifier, code } = c.req.valid('json')
    const staff = await findStaff(identifier)
    const wrong = new AppError('That code is not right or has expired. Request a new one.', 401)
    if (!staff) throw wrong
    const row = await one<{ id: number; codeHash: string; attempts: number }>(
      'SELECT id, code_hash, attempts FROM hrms_staff_codes WHERE staff_no = ? AND used_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [staff.staffNo],
    )
    if (!row || row.attempts >= MAX_ATTEMPTS) throw wrong
    const expected = Buffer.from(row.codeHash, 'hex')
    const given = Buffer.from(hash(staff.staffNo, code), 'hex')
    if (!timingSafeEqual(expected, given)) {
      await exec('UPDATE hrms_staff_codes SET attempts = attempts + 1 WHERE id = ?', [row.id])
      throw wrong
    }
    const used = await exec('UPDATE hrms_staff_codes SET used_at = NOW() WHERE id = ? AND used_at IS NULL', [row.id])
    if (!used.affectedRows) throw wrong
    await startStaffSession(c, staff.staffNo, 'code')
    return c.json({ ok: true })
  })

  // Stands in for Google and SMS while developing.
  .get('/dev', async (c) => {
    if (!devLoginEnabled()) return c.json({ error: 'Not found' }, 404)
    const next = safeNext(c.req.query('next'))
    const staff = await findStaff(c.req.query('staffNo') ?? '')
    if (!staff) return c.redirect(`/portal/login?error=no_staff&next=${encodeURIComponent(next)}`, 302)
    await startStaffSession(c, staff.staffNo, 'dev')
    return c.redirect(next, 302)
  })

  .post('/logout', (c) => {
    deleteCookie(c, PORTAL_COOKIE, { path: '/' })
    return c.json({ ok: true })
  })

  .get('/me', async (c) => {
    c.header('cache-control', 'private, no-store')
    return c.json({ user: await portalUser(c) })
  })

  // An administrator ends switched access: the staff session closes and their
  // own admin session (never touched) carries on.
  .post('/switch-back', requireStaffUser, async (c) => {
    const staff = c.get('staff')
    if (!staff.switchedBy) throw new AppError('This is not a switched session.', 409)
    deleteCookie(c, PORTAL_COOKIE, { path: '/' })
    audit({ id: staff.switchedBy.id } as never, 'switch', 'staff', staff.staffNo, `Switched back from the staff portal access of ${staff.fullName} (${staff.staffNo})`)
    return c.json({ ok: true, to: `/admin/staff/${staff.staffNo}` })
  })

  // HR officers and IT support who are also staff: straight to the admin.
  .post('/to-admin', requireStaffUser, async (c) => {
    const staff = c.get('staff')
    // Switched access never opens the staff member's own admin account.
    if (staff.switchedBy) throw new AppError('You are using switched access. Use “Switch back to admin” to return to your own account.', 403)
    const account = await one<{ id: number }>('SELECT id FROM hrms_users WHERE staff_no = ? AND is_active = 1 LIMIT 1', [staff.staffNo])
    if (!account) throw new AppError('You do not have an HRMS admin account.', 403)
    await exec('UPDATE hrms_users SET last_login_at = NOW() WHERE id = ?', [account.id])
    setCookie(c, SESSION_COOKIE, await signSessionToken(account.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    })
    return c.json({ ok: true })
  })

/** Google sign-in for staff: the verified Google email must be on an active staff record. */
export async function googleStaff(email: string) {
  const staff = await findStaff(email)
  if (!staff) return null
  return (await getPortalUser(staff.staffNo)) ? staff.staffNo : null
}
