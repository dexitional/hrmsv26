// Sign-in for HR officers and IT support. Two strategies:
//   - email and password (bcrypt, with lock-out after repeated failures)
//   - Google, for accounts whose email an administrator has already added.
//     Google never creates accounts.
//
//   GET  /api/auth/config               which sign-in methods are available
//   POST /api/auth/login                email + password
//   GET  /api/auth/google?next=/path    → Google consent screen
//   GET  /api/auth/google/callback      exchange the code, start a session
//   GET  /api/auth/dev?email=&next=     development only, when DEV_LOGIN=true
//   POST /api/auth/logout               GET /api/auth/me
//   POST /api/auth/password             change (or, for Google-only accounts, set) own password
//
// Configure GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and register
// {APP_URL}/api/auth/google/callback as an authorised redirect URI.
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { changePasswordSchema, loginSchema, switchAccessSchema } from '#/lib/schemas'
import { properName } from '#/lib/text-case'
import { SWITCH_ACCESS_ROLES } from '#/lib/permissions'
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from '#/server/session'
import { signSessionToken } from '#/server/session-core'
import { requireRoles, requireUser, sessionUser } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, one } from '../lib/db'
import { AppError } from '../lib/errors'
import { rateLimit } from '../lib/rate-limit'
import { validate } from '../lib/validate'
import { googleStaff, startStaffSession } from './portal-auth'

const STATE_COOKIE = 'hrms_oauth'
const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15
// Compared against when the email is unknown, so timing doesn't reveal which
// emails have accounts.
let dummyHash: string | null = null
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync('not-a-real-password', 12))

function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  return clientId && clientSecret ? { clientId, clientSecret } : null
}
const devLoginEnabled = () => process.env.NODE_ENV !== 'production' && process.env.DEV_LOGIN === 'true'

function redirectUri(c: Context) {
  const base = (process.env.APP_URL || new URL(c.req.url).origin).replace(/\/$/, '')
  return `${base}/api/auth/google/callback`
}

// Only same-site paths, so ?next= can't be used as an open redirect.
const safeNext = (value: string | undefined) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value.slice(0, 300) : '/admin'

const safePortalNext = (value: string | undefined) =>
  value && value.startsWith('/portal') && !value.startsWith('//') ? value.slice(0, 300) : '/portal'

async function startSession(c: Context, userId: number) {
  setCookie(c, SESSION_COOKIE, await signSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

function decodeIdToken(idToken: string): Record<string, unknown> | null {
  try {
    const part = idToken.split('.')[1]
    return part ? (JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** Matches a Google identity to an existing, active HRMS account. */
async function googleAccount(profile: { sub: string; email: string; picture: string | null }) {
  const user = await one<{ id: number; isActive: number; googleSub: string | null }>(
    'SELECT id, is_active, google_sub FROM hrms_users WHERE google_sub = ? OR email = ? ORDER BY google_sub = ? DESC LIMIT 1',
    [profile.sub, profile.email, profile.sub],
  )
  if (!user) return { error: 'no_account' as const }
  if (!user.isActive) return { error: 'account_disabled' as const }
  if (user.googleSub && user.googleSub !== profile.sub) return { error: 'google_mismatch' as const }
  await exec(
    'UPDATE hrms_users SET google_sub = ?, avatar_url = COALESCE(?, avatar_url), last_login_at = NOW(), failed_login_attempts = 0 WHERE id = ?',
    [profile.sub, profile.picture, user.id],
  )
  return { id: user.id }
}

export const authRoute = new Hono()
  .get('/config', (c) => c.json({ google: Boolean(googleConfig()), devLogin: devLoginEnabled() }))

  .post('/login', rateLimit('login', 20, 300), validate('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json')
    const user = await one<{
      id: number
      passwordHash: string | null
      isActive: number
      failedLoginAttempts: number
      lockedUntil: string | null
    }>('SELECT id, password_hash, is_active, failed_login_attempts, locked_until FROM hrms_users WHERE email = ?', [
      email,
    ])
    const ok = await bcrypt.compare(password, user?.passwordHash ?? getDummyHash())
    if (!user || !user.isActive) throw new AppError('Incorrect email or password.', 401)
    if (!user.passwordHash) throw new AppError('This account signs in with Google. Use “Continue with Google”.', 401)
    if (user.lockedUntil && new Date(user.lockedUntil.replace(' ', 'T')) > new Date()) {
      throw new AppError(`Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.`, 423)
    }
    if (!ok) {
      const attempts = user.failedLoginAttempts + 1
      await exec(
        `UPDATE hrms_users SET failed_login_attempts = ?, locked_until = IF(? >= ?, NOW() + INTERVAL ? MINUTE, NULL) WHERE id = ?`,
        [attempts >= MAX_ATTEMPTS ? 0 : attempts, attempts, MAX_ATTEMPTS, LOCK_MINUTES, user.id],
      )
      throw new AppError('Incorrect email or password.', 401)
    }
    await exec(
      'UPDATE hrms_users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
      [user.id],
    )
    await startSession(c, user.id)
    return c.json({ ok: true })
  })

  // ?portal=1 signs a staff member in to the staff portal instead of the admin.
  .get('/google', (c) => {
    const portal = c.req.query('portal') === '1'
    const next = portal ? safePortalNext(c.req.query('next')) : safeNext(c.req.query('next'))
    const config = googleConfig()
    if (!config) return c.redirect(`${portal ? '/portal/login' : '/login'}?error=google_not_configured&next=${encodeURIComponent(next)}`, 302)
    const state = randomBytes(24).toString('base64url')
    setCookie(c, STATE_COOKIE, `${state}|${next}|${portal ? 'portal' : 'admin'}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/api/auth',
      maxAge: 600,
    })
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri(c),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    })
    return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302)
  })

  .get('/google/callback', async (c) => {
    const config = googleConfig()
    const [expected, nextRaw, mode] = (getCookie(c, STATE_COOKIE) ?? '').split('|')
    const portal = mode === 'portal'
    const next = portal ? safePortalNext(nextRaw) : safeNext(nextRaw)
    deleteCookie(c, STATE_COOKIE, { path: '/api/auth' })
    const fail = (error: string) => c.redirect(`${portal ? '/portal/login' : '/login'}?error=${error}&next=${encodeURIComponent(next)}`, 302)
    if (!config) return fail('google_not_configured')
    const code = c.req.query('code')
    const state = c.req.query('state')
    if (c.req.query('error')) return fail('cancelled')
    if (!code || !state || !expected || state !== expected) return fail('invalid_state')

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri(c),
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(15_000),
    }).catch(() => null)
    if (!res?.ok) return fail('google_failed')
    const tokens = (await res.json()) as { id_token?: string }
    // The id_token comes straight from Google's token endpoint over TLS in
    // exchange for our client secret, so (OpenID Connect Core 3.1.3.7) its
    // signature need not be re-verified; issuer and audience still are.
    const claims = tokens.id_token ? decodeIdToken(tokens.id_token) : null
    if (
      !claims ||
      claims.aud !== config.clientId ||
      !['accounts.google.com', 'https://accounts.google.com'].includes(String(claims.iss)) ||
      typeof claims.sub !== 'string' ||
      typeof claims.email !== 'string' ||
      claims.email_verified !== true
    ) {
      return fail('google_failed')
    }
    if (portal) {
      const staffNo = await googleStaff(claims.email.toLowerCase())
      if (!staffNo) return fail('no_staff')
      await startStaffSession(c, staffNo, 'google')
      return c.redirect(next, 302)
    }
    const result = await googleAccount({
      sub: claims.sub,
      email: claims.email.toLowerCase(),
      picture: typeof claims.picture === 'string' ? claims.picture : null,
    })
    if (result.error !== undefined) return fail(result.error)
    if (!result.id) return fail('google_failed')
    await startSession(c, result.id)
    return c.redirect(next, 302)
  })

  // Stands in for Google while developing: signs in an existing account by email.
  .get('/dev', async (c) => {
    if (!devLoginEnabled()) return c.json({ error: 'Not found' }, 404)
    const email = (c.req.query('email') ?? '').trim().toLowerCase()
    const next = safeNext(c.req.query('next'))
    const user = await one<{ id: number; isActive: number }>('SELECT id, is_active FROM hrms_users WHERE email = ?', [
      email,
    ])
    if (!user) return c.redirect(`/login?error=no_account&next=${encodeURIComponent(next)}`, 302)
    if (!user.isActive) return c.redirect(`/login?error=account_disabled&next=${encodeURIComponent(next)}`, 302)
    await exec('UPDATE hrms_users SET last_login_at = NOW() WHERE id = ?', [user.id])
    await startSession(c, user.id)
    return c.redirect(next, 302)
  })

  // HR officers and IT support who are also staff: open their staff portal.
  .post('/to-portal', requireUser, async (c) => {
    const me = c.get('user')
    if (!me.staffNo) throw new AppError('Your account is not linked to a staff number. Ask an administrator to add it.', 422)
    const staffNo = await googleStaff(String(me.staffNo))
    if (!staffNo) throw new AppError('Your staff record is not active, so the staff portal is not available.', 403)
    await startStaffSession(c, staffNo, 'admin')
    return c.json({ ok: true })
  })

  // Administrators and HR officers (staff: manage): use the staff portal as a
  // staff member sees it (their own menus, head of unit / dean / director tools
  // included), until they switch back. The admin session is left as it is; the
  // switch is audited.
  .post('/switch-access', requireRoles(SWITCH_ACCESS_ROLES), validate('json', switchAccessSchema), async (c) => {
    const me = c.get('user')
    const { staffNo: wanted } = c.req.valid('json')
    const staffNo = await googleStaff(String(wanted))
    if (!staffNo) throw new AppError('That staff record is not active, so it has no staff portal access.', 422)
    await startStaffSession(c, staffNo, 'switch', me.id)
    const name = await one<{ name: string }>(`SELECT TRIM(CONCAT_WS(' ', fname, lname)) AS name FROM staff WHERE staff_no = ?`, [staffNo])
    audit(me, 'switch', 'staff', staffNo, `Switched access to the staff portal as ${properName(name?.name ?? '') || 'staff'} (${staffNo})`)
    return c.json({ ok: true, to: '/portal' })
  })

  .post('/logout', (c) => {
    deleteCookie(c, SESSION_COOKIE, { path: '/' })
    return c.json({ ok: true })
  })

  .get('/me', async (c) => {
    c.header('cache-control', 'private, no-store')
    return c.json({ user: await sessionUser(c) })
  })

  .post('/password', requireUser, validate('json', changePasswordSchema), async (c) => {
    const me = c.get('user')
    const { currentPassword, newPassword } = c.req.valid('json')
    const row = await one<{ passwordHash: string | null }>('SELECT password_hash FROM hrms_users WHERE id = ?', [me.id])
    // Google-only accounts may set a first password without a current one.
    if (row?.passwordHash && !(await bcrypt.compare(currentPassword, row.passwordHash))) {
      throw new AppError('Your current password is incorrect.', 422)
    }
    await exec('UPDATE hrms_users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword, 12), me.id])
    audit(me, 'update', 'user', me.id, row?.passwordHash ? 'Changed own password' : 'Set a password')
    return c.json({ ok: true })
  })
