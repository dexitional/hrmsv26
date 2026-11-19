// System › Notifications: gateway status, scheduled jobs, the message log,
// test sends and message previews.
//   GET  /api/notifications?kind=&channel=&status=&q=&page=
//   GET  /api/notifications/status
//   GET  /api/notifications/previews
//   POST /api/notifications/jobs/:job/run     daily | nss (body: { year } for nss)
//   POST /api/notifications/test              { phone?, email? }
import { Hono } from 'hono'
import { z } from 'zod'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { like, one, paging, rows, scalar } from '../lib/db'
import { AppError } from '../lib/errors'
import { messagingStatus, notify, plainSms, sendTest } from '../lib/messaging'
import { birthday, disciplinaryIssued, leaveEnded, leaveReminder, greetingName, nssThanks, salutation, transferEffected } from '../lib/templates'
import type { Message } from '../lib/templates'
import { EMAIL_LOGO_CID, EMAIL_LOGO_DATA_URI } from '../lib/email-logo'
import { validate } from '../lib/validate'
import { DAILY_HOUR_GMT, runJob } from '#/server/jobs'

const TEMPLATES = ['plain', 'leave_ended', 'leave_reminder', 'birthday', 'transfer', 'disciplinary', 'nss_thanks'] as const

const testSchema = z
  .object({
    phone: z.string().trim().max(20).optional().nullable(),
    email: z.string().trim().email('Enter a valid email').max(190).optional().nullable().or(z.literal('')),
    // Which message to try: a plain gateway check, or one of the real messages.
    template: z.enum(TEMPLATES).default('plain'),
  })
  .refine((v) => v.phone || v.email, { message: 'Enter a phone number or an email address' })

export const notificationsRoute = new Hono()
  .get('/', requirePermission('notifications', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 30)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.kind) (where.push('kind = ?'), params.push(q.kind))
    if (q.channel) (where.push('channel = ?'), params.push(q.channel))
    if (q.status) (where.push('status = ?'), params.push(q.status))
    if (q.q) (where.push('(recipient LIKE ? OR recipient_name LIKE ? OR staff_no = ?)'), params.push(like(q.q), like(q.q), Number(q.q) || 0))
    const from = `FROM hrms_notifications WHERE ${where.join(' AND ')}`
    const [data, total] = await Promise.all([
      rows(`SELECT * ${from} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
      scalar(`SELECT COUNT(*) ${from}`, params),
    ])
    return c.json({ data, total, page, pageSize })
  })
  .get('/status', requirePermission('notifications', 'view'), async (c) => {
    const [runs, today, totals] = await Promise.all([
      rows(
        `SELECT r.* FROM hrms_job_runs r
          JOIN (SELECT job, MAX(id) AS id FROM hrms_job_runs GROUP BY job) last ON last.id = r.id`,
      ),
      rows("SELECT channel, status, COUNT(*) AS count FROM hrms_notifications WHERE created_at >= CURDATE() GROUP BY channel, status"),
      rows('SELECT kind, COUNT(*) AS count FROM hrms_notifications GROUP BY kind'),
    ])
    return c.json({
      ...messagingStatus(),
      dailyHourGmt: DAILY_HOUR_GMT,
      lastRuns: Object.fromEntries(runs.map((r) => [r.job, { ...r, summary: r.summary ? JSON.parse(r.summary) : {} }])),
      today,
      totals,
    })
  })
  .get('/previews', requirePermission('notifications', 'view'), (c) => {
    const salute = 'Dr. Mensah'
    const t = new Date()
    const d = (n: number) => new Date(t.getTime() + n * 86_400_000).toISOString().slice(0, 10)
    const previews = [
      { kind: 'leave_ended', label: 'Leave ended', ...leaveEnded({ salute, type: 'ANNUAL', startDate: d(-30), endDate: d(-1), resumeDate: d(0) }) },
      { kind: 'leave_reminder', label: 'Leave ending in 3 days', ...leaveReminder({ salute, type: 'ANNUAL', endDate: d(3), resumeDate: d(4), daysLeft: 3 }) },
      { kind: 'birthday', label: 'Birthday wishes', ...birthday({ salute, firstName: salute, yearsOfService: 12, unit: 'DEPARTMENT OF MATHEMATICS' }) },
      { kind: 'transfer', label: 'Transfer effected', ...transferEffected({ salute, fromUnit: 'DEPARTMENT OF PHYSICS', toUnit: 'DIRECTORATE OF ACADEMIC AFFAIRS', date: d(7), designation: 'SENIOR ADMINISTRATIVE ASSISTANT' }) },
      { kind: 'disciplinary', label: 'Disciplinary action', ...disciplinaryIssued({ salute, actionType: 'WARNING', issueDate: d(0) }) },
      { kind: 'nss_thanks', label: 'National service thank-you (SMS only)', sms: nssThanks({ firstName: 'Kwame', unit: 'DEPARTMENT OF CHEMISTRY', startDate: d(-365), endDate: d(-19) }), subject: null, html: null, text: null },
    ]
    // A browser cannot resolve the email's cid: logo link, so previews inline it.
    const inlineLogo = (html: string | null) => html?.replaceAll(`cid:${EMAIL_LOGO_CID}`, EMAIL_LOGO_DATA_URI) ?? null
    return c.json(previews.map((p) => ({ ...p, html: inlineLogo(p.html), sms: plainSms(p.sms), smsLength: plainSms(p.sms).length })))
  })
  .post('/jobs/:job{daily|nss}/run', requirePermission('notifications', 'manage'), async (c) => {
    const job = c.req.param('job') as 'daily' | 'nss'
    const body = (await c.req.json().catch(() => ({}))) as { year?: number }
    const year = Number(body.year) || new Date().getUTCFullYear()
    const result = await runJob(job, { trigger: 'manual', userId: c.get('user').id, year })
    if ('busy' in result && result.busy) throw new AppError('That job is already running.', 409)
    audit(c.get('user'), 'update', 'notification', null, `Ran the ${job === 'daily' ? 'daily leave & birthday' : `national service (${year})`} job by hand`)
    return c.json(result)
  })
  .post('/test', requirePermission('notifications', 'manage'), validate('json', testSchema), async (c) => {
    const { phone, email, template } = c.req.valid('json')
    if (template === 'plain') return c.json({ results: await sendTest({ phone: phone || null, email: email || null }) })
    // Personalise with the staff member who owns this phone or email, if any.
    const staff = await one<Record<string, any>>(
      `SELECT s.title, s.fname, s.lname, s.gender, u.long_name AS unit_name,
              TIMESTAMPDIFF(YEAR, NULLIF(s.first_appoint_date, '0000-00-00'), CURDATE()) AS years_of_service
         FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id LEFT JOIN unit u ON u.id = COALESCE(cp.unit_id, s.unit_id)
        WHERE (? <> '' AND (s.ucc_mail = ? OR s.email = ?)) OR (? <> '' AND REPLACE(s.phone, ' ', '') = ?)
        LIMIT 1`,
      [email ?? '', email ?? '', email ?? '', phone ?? '', (phone ?? '').replace(/\s/g, '')],
    )
    const salute = staff ? salutation(staff) : 'Dr. Mensah'
    const day = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10)
    const msg: Message | { sms: string } =
      template === 'birthday'
        ? birthday({ salute, firstName: staff ? greetingName(staff) : salute, yearsOfService: staff?.yearsOfService ?? 12, unit: staff?.unitName ?? 'DEPARTMENT OF MATHEMATICS' })
        : template === 'leave_ended'
          ? leaveEnded({ salute, type: 'ANNUAL', startDate: day(-30), endDate: day(-1), resumeDate: day(0) })
          : template === 'leave_reminder'
            ? leaveReminder({ salute, type: 'ANNUAL', endDate: day(3), resumeDate: day(4), daysLeft: 3 })
            : template === 'transfer'
              ? transferEffected({ salute, fromUnit: 'DEPARTMENT OF PHYSICS', toUnit: 'DIRECTORATE OF ACADEMIC AFFAIRS', date: day(7), designation: null })
              : template === 'disciplinary'
                ? disciplinaryIssued({ salute, actionType: 'WARNING', issueDate: day(0) })
                : { sms: nssThanks({ firstName: salute.split(' ').pop() ?? 'Kwame', unit: 'DEPARTMENT OF CHEMISTRY', startDate: day(-365), endDate: day(-19) }) }
    const results = await notify({
      kind: 'test',
      key: `test:${template}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      name: staff ? salute : null,
      phone: phone || null,
      email: email || null,
      ...msg,
      // Only the channels asked for.
      sms: phone ? msg.sms : null,
      ...('subject' in msg && email ? { subject: `[Test] ${msg.subject}` } : { subject: null }),
    })
    audit(c.get('user'), 'create', 'notification', null, `Sent a test ${template.replace('_', ' ')} message`)
    return c.json({ results, personalisedFor: staff ? salute : null })
  })
