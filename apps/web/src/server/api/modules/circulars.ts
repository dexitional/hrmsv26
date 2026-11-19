// Circulars: DHR notices to the university community (legacy `circular` table).
//
//   GET    /api/circulars?stage=DRAFT|PUBLISHED|ARCHIVED&q=&year=&page=
//   GET    /api/circulars/years
//   POST   /api/circulars/audience          how many staff an audience reaches
//   GET    /api/circulars/:id               circular, audience, delivery figures
//   GET    /api/circulars/:id/recipients?q=&filter=&page=
//   POST   /api/circulars                   save a draft
//   PUT    /api/circulars/:id               edit a draft
//   DELETE /api/circulars/:id               drafts and archived circulars only
//   POST   /api/circulars/:id/test          send this circular to one phone/email
//   POST   /api/circulars/:id/publish       resolve the audience and send
//   POST   /api/circulars/:id/resend        retry SMS/email that did not go out
//   POST   /api/circulars/:id/archive       take it off the staff portal
//   GET    /api/circulars/public/:id/:sig/:name   the PDF for staff (signed link)
//
// Publishing writes one row per person to hrms_circular_recipients and to the
// legacy `notification` table (the staff portal inbox), sets circular.status =
// 1 for the portal's notices feed, then sends SMS and email in the background.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { Hono } from 'hono'
import { z } from 'zod'
import { circularAudienceSchema, circularSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, like, one, paging, parseId, rows, scalar } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { PLACEMENT, activeStaffSql, groupSql, nameSql } from '../lib/hr'
import { normalizeEmail, normalizePhone, notify, notifyBulk } from '../lib/messaging'
import type { BulkTally, MailAttachment } from '../lib/messaging'
import { readStored } from '../lib/storage'
import { circularEmail, circularSms } from '../lib/templates'
import type { CircularContent } from '../lib/templates'
import { validate } from '../lib/validate'

type Audience = z.output<typeof circularAudienceSchema>
type CircularInput = z.output<typeof circularSchema>
type Stage = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

const STAGES: Array<Stage> = ['DRAFT', 'PUBLISHED', 'ARCHIVED']

// ---------------------------------------------------------------- Legacy columns

const csv = (list: Array<number | string>) => (list.length ? list.join(',') : null)
const ids = (value: string | null | undefined) =>
  String(value ?? '')
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)

/** Form values → legacy targeting columns. */
function toColumns(d: CircularInput) {
  return {
    letter_no: d.letterNo,
    subject: d.subject,
    message: d.message,
    sms_note: d.smsNote,
    attachment: d.attachment,
    attachment_name: d.attachment ? (d.attachmentName ?? 'Circular.pdf') : null,
    cat_staff_no: csv(d.staffNos),
    cat_job_id: csv(d.jobIds),
    cat_unit_id: csv(d.unitIds),
    cat_unit_status: d.headsOnly ? 'HOD' : 'ALL',
    cat_unit_children: d.includeSubunits ? 1 : 0,
    cat_staff_group: csv(d.staffGroups),
    send_sms: d.sendSms ? 1 : 0,
    send_email: d.sendEmail ? 1 : 0,
    send_portal: d.sendPortal ? 1 : 0,
  }
}

/** A circular row → the audience it was aimed at. */
function audienceOf(r: Record<string, any>): Audience {
  return {
    staffGroups: String(r.catStaffGroup ?? '')
      .split(',')
      .map((g) => g.trim())
      .filter((g): g is 'SM' | 'SS' | 'JS' => ['SM', 'SS', 'JS'].includes(g)),
    unitIds: ids(r.catUnitId),
    includeSubunits: Number(r.catUnitChildren ?? 1) === 1,
    headsOnly: r.catUnitStatus === 'HOD',
    jobIds: ids(r.catJobId),
    staffNos: ids(r.catStaffNo),
  }
}

// ---------------------------------------------------------------- Audience

/** The chosen units and, optionally, every unit beneath them. */
async function expandUnits(unitIds: Array<number>, children: boolean) {
  if (!unitIds.length || !children) return unitIds
  const found = await rows<{ id: number }>(
    `WITH RECURSIVE tree AS (
       SELECT id FROM unit WHERE id IN (${unitIds.map(() => '?').join(', ')})
       UNION
       SELECT u.id FROM unit u JOIN tree t ON u.parent_id = t.id
     ) SELECT id FROM tree`,
    unitIds,
  )
  return found.map((r) => r.id)
}

interface Person {
  staffNo: number
  fullName: string
  phone: string | null
  uccMail: string | null
  email: string | null
  unitName: string | null
  staffGroup: string | null
}

/** Everyone a circular reaches: the filtered staff plus the named ones. */
async function resolveAudience(a: Audience): Promise<Array<Person>> {
  const marks = (list: Array<unknown>) => list.map(() => '?').join(', ')
  const filtered = a.staffGroups.length || a.unitIds.length || a.jobIds.length || a.headsOnly
  const clauses: Array<{ sql: string; params: Array<unknown> }> = []
  // Staff number 0 is a placeholder record ("Internal Arrangement"), not a person.
  if (filtered) {
    const parts: Array<{ sql: string; params: Array<unknown> }> = [{ sql: activeStaffSql(), params: [] }]
    if (a.staffGroups.length) parts.push({ sql: `${groupSql} IN (${marks(a.staffGroups)})`, params: a.staffGroups })
    if (a.jobIds.length) parts.push({ sql: `j.id IN (${marks(a.jobIds)})`, params: a.jobIds })
    const units = await expandUnits(a.unitIds, a.includeSubunits)
    if (a.headsOnly) {
      // Heads of the chosen units (or of every unit), wherever they are placed.
      parts.push(
        units.length
          ? { sql: `s.staff_no IN (SELECT unit_head FROM unit WHERE active = '1' AND unit_head IS NOT NULL AND id IN (${marks(units)}))`, params: units }
          : { sql: "s.staff_no IN (SELECT unit_head FROM unit WHERE active = '1' AND unit_head IS NOT NULL)", params: [] },
      )
    } else if (units.length) {
      parts.push({ sql: `u.id IN (${marks(units)})`, params: units })
    }
    clauses.push({ sql: `(${parts.map((x) => x.sql).join(' AND ')})`, params: parts.flatMap((x) => x.params) })
  } else if (!a.staffNos.length) {
    clauses.push({ sql: `(${activeStaffSql()})`, params: [] })
  }
  if (a.staffNos.length) clauses.push({ sql: `(s.staff_no IN (${marks(a.staffNos)}) AND COALESCE(s.flag_delete, 0) = 0)`, params: a.staffNos })
  return rows<Person>(
    `SELECT DISTINCT s.staff_no, ${nameSql()} AS full_name, s.phone, LOWER(TRIM(s.ucc_mail)) AS ucc_mail, LOWER(TRIM(s.email)) AS email,
            u.long_name AS unit_name, ${groupSql} AS staff_group
       FROM staff s ${PLACEMENT}
      WHERE s.staff_no > 0 AND (${clauses.map((x) => x.sql).join(' OR ')})
      ORDER BY s.staff_no`,
    clauses.flatMap((x) => x.params),
  )
}

const emailOf = (p: { uccMail: string | null; email: string | null }) => normalizeEmail(p.uccMail) ?? normalizeEmail(p.email)

function summarise(people: Array<Person>) {
  const groups: Record<string, number> = {}
  for (const p of people) groups[p.staffGroup ?? 'Other'] = (groups[p.staffGroup ?? 'Other'] ?? 0) + 1
  return {
    count: people.length,
    withPhone: people.filter((p) => normalizePhone(p.phone)).length,
    withEmail: people.filter((p) => emailOf(p)).length,
    groups,
    sample: people.slice(0, 6).map((p) => ({ staffNo: p.staffNo, fullName: p.fullName, unitName: p.unitName })),
  }
}

// ---------------------------------------------------------------- Attachments

const secret = () => process.env.SESSION_SECRET ?? 'hrms'
const sign = (id: number, path: string) => createHmac('sha256', secret()).update(`circular:${id}:${path}`).digest('hex').slice(0, 32)
const fileName = (name: string | null | undefined) => (name || 'circular.pdf').replace(/[^\w.\- ()]/g, '_').replace(/\s+/g, '_')
const appUrl = (origin: string) => (process.env.APP_URL || origin).replace(/\/$/, '')
/** Files uploaded through the old HRMS live on that server. */
const legacyUrl = (path: string) => `${(process.env.LEGACY_HRMS_URL || 'https://hrms.ucc.edu.gh').replace(/\/$/, '')}${path}`

/** The link staff open from the portal and SMS: no HRMS sign-in, but unguessable. */
export function publicLink(c: { id: number; attachment: string | null; attachmentName?: string | null }, origin: string) {
  if (!c.attachment) return null
  if (!c.attachment.startsWith('/api/files/')) return legacyUrl(c.attachment)
  return `${appUrl(origin)}/api/circulars/public/${c.id}/${sign(c.id, c.attachment)}/${fileName(c.attachmentName)}`
}

async function attachmentFile(c: { attachment: string | null; attachmentName: string | null }): Promise<Array<MailAttachment>> {
  if (!c.attachment?.startsWith('/api/files/')) return []
  const stored = await readStored(c.attachment.replace('/api/files/', ''))
  return stored ? [{ filename: fileName(c.attachmentName), content: stored.data, contentType: stored.mime }] : []
}

// ---------------------------------------------------------------- Delivery

interface Progress {
  running: boolean
  startedAt: string
  finishedAt: string | null
  total: number
  sms: BulkTally | null
  email: BulkTally | null
  error: string | null
}
const g = globalThis as typeof globalThis & { __hrmsCirculars?: Map<number, Progress> }
const progress = (g.__hrmsCirculars ??= new Map())

const content = (c: Record<string, any>): CircularContent => ({
  letterNo: c.letterNo,
  subject: c.subject,
  message: c.message,
  smsNote: c.smsNote,
  date: String(c.publishedAt ?? c.createdAt ?? new Date().toISOString()).slice(0, 10),
  attachmentName: c.attachment ? (c.attachmentName ?? 'Circular.pdf') : null,
})

const recipientsSql = `SELECT r.staff_no, ${nameSql()} AS full_name, s.phone, LOWER(TRIM(s.ucc_mail)) AS ucc_mail, LOWER(TRIM(s.email)) AS email
  FROM hrms_circular_recipients r JOIN staff s ON s.staff_no = r.staff_no WHERE r.circular_id = ? ORDER BY r.staff_no`

/** Sends SMS and email to everyone on the circular; people already reached are skipped. */
async function deliver(id: number) {
  if (progress.get(id)?.running) return
  const c = await one<Record<string, any>>('SELECT * FROM circular WHERE id = ?', [id])
  if (!c) return
  const people = await rows<Person>(recipientsSql, [id])
  const state: Progress = { running: true, startedAt: new Date().toISOString(), finishedAt: null, total: people.length, sms: null, email: null, error: null }
  progress.set(id, state)
  try {
    const body = content(c)
    const recipients = people.map((p) => ({ key: `circular:${id}:${p.staffNo}`, staffNo: p.staffNo, name: p.fullName, phone: p.phone, email: emailOf(p) }))
    if (Number(c.sendSms) === 1) {
      await notifyBulk({
        kind: 'circular',
        channel: 'sms',
        entityId: id,
        recipients,
        sms: circularSms(body, { email: Number(c.sendEmail) === 1, portal: Number(c.sendPortal) === 1 }),
        onProgress: (t) => void (state.sms = { ...t }),
      }).then((t) => (state.sms = t))
    }
    if (Number(c.sendEmail) === 1) {
      const mail = circularEmail(body, { portal: Number(c.sendPortal) === 1 })
      await notifyBulk({
        kind: 'circular',
        channel: 'email',
        entityId: id,
        recipients,
        ...mail,
        attachments: await attachmentFile(c as { attachment: string | null; attachmentName: string | null }),
        onProgress: (t) => void (state.email = { ...t }),
      }).then((t) => (state.email = t))
    }
  } catch (err) {
    state.error = err instanceof Error ? err.message : String(err)
    console.error(`[circular ${id}] delivery stopped:`, err)
  } finally {
    state.running = false
    state.finishedAt = new Date().toISOString()
  }
}

/** Latin-1 only: the legacy notification table cannot store other characters. */
const latin1 = (text: string | null | undefined) =>
  (text ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x00-\xFF]/g, '')

/** Staff portal inbox rows, one per person, linked back to the recipients table. */
async function postToPortal(c: Record<string, any>, staffNos: Array<number>, origin: string) {
  const action = `DHR Circular${c.letterNo ? ` : ${c.letterNo}` : ''}`.slice(0, 255)
  const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const link = publicLink(c as { id: number; attachment: string | null; attachmentName: string | null }, origin)
  const message = latin1(c.message || c.smsNote || c.subject)
  for (let i = 0; i < staffNos.length; i += 500) {
    const chunk = staffNos.slice(i, i + 500)
    await exec(
      `INSERT INTO notification (type, staff_no, action, title, message, attachment, read_flag, priority, datetime)
       VALUES ${chunk.map(() => "('CIRCULAR', ?, ?, ?, ?, ?, '0', '2', ?)").join(', ')}`,
      chunk.flatMap((no) => [no, latin1(action), latin1(c.subject).slice(0, 600), message, link, stamp]),
    )
  }
  await exec(
    `UPDATE hrms_circular_recipients r
       JOIN notification n ON n.staff_no = r.staff_no AND n.type = 'CIRCULAR' AND n.datetime = ? AND n.action = ?
        SET r.notification_id = n.id
      WHERE r.circular_id = ?`,
    [stamp, latin1(action), c.id],
  )
}

// ---------------------------------------------------------------- Reads

const COLUMNS = `c.id, c.letter_no, c.subject, c.message, c.sms_note, c.attachment, c.attachment_name,
  c.cat_staff_no, c.cat_job_id, c.cat_unit_id, c.cat_unit_status, c.cat_unit_children, c.cat_staff_group,
  c.send_sms, c.send_email, c.send_portal, c.status, c.stage, c.recipient_count, c.created_at, c.updated_at,
  c.published_at, c.archived_at, cu.full_name AS created_by_name, pu.full_name AS published_by_name`
const FROM = `FROM circular c LEFT JOIN hrms_users cu ON cu.id = c.created_by LEFT JOIN hrms_users pu ON pu.id = c.published_by`

async function load(id: number) {
  const c = await one<Record<string, any>>(`SELECT ${COLUMNS} ${FROM} WHERE c.id = ?`, [id])
  if (!c) throw notFound('Circular')
  return c
}

async function deliveryFigures(id: number) {
  const [byStatus, portal] = await Promise.all([
    rows<{ channel: string; status: string; n: number }>(
      "SELECT channel, status, COUNT(*) AS n FROM hrms_notifications WHERE kind = 'circular' AND entity_id = ? GROUP BY channel, status",
      [id],
    ),
    one<{ posted: number; opened: number }>(
      `SELECT COUNT(n.id) AS posted, COALESCE(SUM(n.read_flag = '1'), 0) AS opened
         FROM hrms_circular_recipients r LEFT JOIN notification n ON n.id = r.notification_id WHERE r.circular_id = ?`,
      [id],
    ),
  ])
  const tally = (channel: string) =>
    Object.fromEntries(byStatus.filter((r) => r.channel === channel).map((r) => [r.status, Number(r.n)])) as Record<string, number>
  return { sms: tally('sms'), email: tally('email'), portal: { posted: Number(portal?.posted ?? 0), opened: Number(portal?.opened ?? 0) } }
}

// ---------------------------------------------------------------- Routes

const testSchema = z
  .object({
    phone: z.string().trim().max(20).optional().nullable(),
    email: z.string().trim().email('Enter a valid email').max(190).optional().nullable().or(z.literal('')),
  })
  .refine((v) => v.phone || v.email, { message: 'Enter a phone number or an email address', path: ['phone'] })

export const circularsRoute = new Hono()
  .get('/', requirePermission('circulars', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 20)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.year) (where.push('YEAR(c.created_at) = ?'), params.push(Number(q.year)))
    if (q.q) {
      where.push('(c.subject LIKE ? OR c.letter_no LIKE ? OR c.message LIKE ? OR c.sms_note LIKE ?)')
      params.push(like(q.q), like(q.q), like(q.q), like(q.q))
    }
    const stage = STAGES.includes(q.stage as Stage) ? (q.stage as Stage) : null
    const sw = stage ? ' AND c.stage = ?' : ''
    const base = `${FROM} WHERE ${where.join(' AND ')}`
    const [data, total, counts] = await Promise.all([
      rows(`SELECT ${COLUMNS} ${base}${sw} ORDER BY COALESCE(c.published_at, c.created_at) DESC, c.id DESC LIMIT ? OFFSET ?`, [
        ...params,
        ...(stage ? [stage] : []),
        limit,
        offset,
      ]),
      scalar(`SELECT COUNT(*) ${base}${sw}`, [...params, ...(stage ? [stage] : [])]),
      rows<{ stage: string; n: number }>(`SELECT c.stage, COUNT(*) AS n ${base} GROUP BY c.stage`, params),
    ])
    return c.json({
      data: data.map((r) => ({ ...r, audience: audienceOf(r), sending: progress.get(r.id)?.running ?? false })),
      total,
      page,
      pageSize,
      counts: STAGES.map((s) => ({ status: s, count: Number(counts.find((x) => x.stage === s)?.n ?? 0) })),
    })
  })
  .get('/years', requirePermission('circulars', 'view'), async (c) =>
    c.json((await rows<{ year: number }>('SELECT DISTINCT YEAR(created_at) AS year FROM circular WHERE created_at IS NOT NULL ORDER BY year DESC')).map((r) => r.year)),
  )
  .post('/audience', requirePermission('circulars', 'view'), validate('json', circularAudienceSchema), async (c) =>
    c.json(summarise(await resolveAudience(c.req.valid('json')))),
  )
  // The PDF for staff, opened from the portal or an SMS. No HRMS sign-in: the
  // signature in the link proves it came from us.
  .get('/public/:id/:sig/:name', async (c) => {
    const id = parseId(c.req.param('id'))
    const row = await one<{ attachment: string | null; attachmentName: string | null; stage: string }>(
      'SELECT attachment, attachment_name, stage FROM circular WHERE id = ?',
      [id],
    )
    const sig = c.req.param('sig')
    const expected = row?.attachment ? sign(id, row.attachment) : ''
    const valid = Boolean(row?.attachment) && row!.stage !== 'DRAFT' && sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    if (!valid) throw new AppError('This circular is not available.', 404)
    const stored = await readStored(row!.attachment!.replace('/api/files/', ''))
    if (!stored) throw new AppError('This circular is not available.', 404)
    return c.body(new Uint8Array(stored.data), 200, {
      'content-type': stored.mime,
      'content-disposition': `inline; filename="${fileName(row!.attachmentName)}"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'public, max-age=86400',
    })
  })
  .get('/:id', requirePermission('circulars', 'view'), async (c) => {
    const id = parseId(c.req.param('id'))
    const row = await load(id)
    const audience = audienceOf(row)
    const [figures, units, jobs, named] = await Promise.all([
      deliveryFigures(id),
      audience.unitIds.length ? rows<{ id: number; name: string }>(`SELECT id, long_name AS name FROM unit WHERE id IN (${audience.unitIds.map(() => '?').join(', ')})`, audience.unitIds) : [],
      audience.jobIds.length ? rows<{ id: number; name: string }>(`SELECT id, title AS name FROM job WHERE id IN (${audience.jobIds.map(() => '?').join(', ')})`, audience.jobIds) : [],
      audience.staffNos.length
        ? rows<{ staffNo: number; fullName: string }>(`SELECT s.staff_no, ${nameSql()} AS full_name FROM staff s WHERE s.staff_no IN (${audience.staffNos.map(() => '?').join(', ')})`, audience.staffNos)
        : [],
    ])
    return c.json({
      ...row,
      audience,
      audienceNames: { units, jobs, staff: named },
      attachmentUrl: row.attachment ? (row.attachment.startsWith('/api/files/') ? row.attachment : legacyUrl(row.attachment)) : null,
      publicUrl: row.stage === 'DRAFT' ? null : publicLink(row as { id: number; attachment: string | null; attachmentName: string | null }, new URL(c.req.url).origin),
      delivery: figures,
      progress: progress.get(id) ?? null,
      sms: circularSms(content(row), { email: Number(row.sendEmail) === 1, portal: Number(row.sendPortal) === 1 }),
    })
  })
  .get('/:id/recipients', requirePermission('circulars', 'view'), async (c) => {
    const id = parseId(c.req.param('id'))
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where = ['r.circular_id = ?']
    const params: Array<unknown> = [id]
    if (q.q) {
      where.push(`(${nameSql()} LIKE ? OR r.staff_no LIKE ?)`)
      params.push(like(q.q), like(q.q))
    }
    const status = (ch: string) => `(SELECT x.status FROM hrms_notifications x WHERE x.dedupe_key = CONCAT('circular:', r.circular_id, ':', r.staff_no, ':${ch}'))`
    if (q.filter === 'sms_failed') where.push(`${status('sms')} IN ('failed', 'skipped')`)
    if (q.filter === 'email_failed') where.push(`${status('email')} IN ('failed', 'skipped')`)
    if (q.filter === 'unread') where.push("COALESCE(n.read_flag, '0') = '0'")
    if (q.filter === 'read') where.push("n.read_flag = '1'")
    const base = `FROM hrms_circular_recipients r JOIN staff s ON s.staff_no = r.staff_no ${PLACEMENT} LEFT JOIN notification n ON n.id = r.notification_id WHERE ${where.join(' AND ')}`
    const [data, total] = await Promise.all([
      rows(
        `SELECT r.staff_no, ${nameSql()} AS full_name, u.long_name AS unit_name, ${groupSql} AS staff_group, s.phone,
                COALESCE(NULLIF(LOWER(TRIM(s.ucc_mail)), ''), LOWER(TRIM(s.email))) AS email,
                ${status('sms')} AS sms_status, ${status('email')} AS email_status,
                r.notification_id, n.read_flag
           ${base} ORDER BY full_name LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${base}`, params),
    ])
    return c.json({ data, total, page, pageSize })
  })
  .post('/', requirePermission('circulars', 'edit'), validate('json', circularSchema), async (c) => {
    const data = c.req.valid('json')
    const user = c.get('user')
    const cols = toColumns(data)
    const result = await exec(
      `INSERT INTO circular SET ${Object.keys(cols).map((k) => `\`${k}\` = ?`).join(', ')}, stage = 'DRAFT', status = 0, created_by = ?, created_at = NOW()`,
      [...Object.values(cols), user?.id ?? null],
    )
    audit(user, 'create', 'circular', result.insertId, `Drafted circular "${data.subject}"`)
    return c.json({ id: result.insertId }, 201)
  })
  .put('/:id', requirePermission('circulars', 'edit'), validate('json', circularSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    const row = await load(id)
    if (row.stage !== 'DRAFT') throw new AppError('Only drafts can be edited. A published circular has already gone out.', 409)
    const cols = toColumns(data)
    await exec(`UPDATE circular SET ${Object.keys(cols).map((k) => `\`${k}\` = ?`).join(', ')} WHERE id = ?`, [...Object.values(cols), id])
    audit(c.get('user'), 'update', 'circular', id, `Edited circular "${data.subject}"`)
    return c.json({ id })
  })
  .delete('/:id', requirePermission('circulars', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const row = await load(id)
    if (row.stage === 'PUBLISHED') throw new AppError('Archive the circular before deleting it.', 409)
    // Its staff-portal copies go with it.
    await exec(
      'DELETE n FROM notification n JOIN hrms_circular_recipients r ON r.notification_id = n.id WHERE r.circular_id = ?',
      [id],
    )
    await exec('DELETE FROM hrms_circular_recipients WHERE circular_id = ?', [id])
    await exec('DELETE FROM circular WHERE id = ?', [id])
    audit(c.get('user'), 'delete', 'circular', id, `Deleted circular "${row.subject}"`)
    return c.json({ ok: true })
  })
  .post('/:id/test', requirePermission('circulars', 'edit'), validate('json', testSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { phone, email } = c.req.valid('json')
    const row = await load(id)
    const body = content(row)
    const mail = circularEmail(body, { portal: Number(row.sendPortal) === 1 })
    const results = await notify({
      kind: 'test',
      key: `test:circular:${id}:${Date.now()}`,
      entityId: id,
      phone: phone || null,
      email: email || null,
      sms: phone ? circularSms(body, { email: Number(row.sendEmail) === 1, portal: Number(row.sendPortal) === 1 }) : null,
      subject: email ? `[Test] ${mail.subject}` : null,
      html: mail.html,
      text: mail.text,
      attachments: email ? await attachmentFile(row as { attachment: string | null; attachmentName: string | null }) : [],
    })
    audit(c.get('user'), 'create', 'circular', id, `Sent a test of circular "${row.subject}"`)
    return c.json({ results })
  })
  .post('/:id/publish', requirePermission('circulars', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const row = await load(id)
    if (row.stage !== 'DRAFT') throw new AppError('This circular has already been published.', 409)
    const people = await resolveAudience(audienceOf(row))
    if (!people.length) throw new AppError('The audience is empty. Change who the circular is for.', 422)
    // Claim the draft so a double click cannot publish twice.
    const claimed = await exec("UPDATE circular SET stage = 'PUBLISHED', status = 1, published_at = NOW(), published_by = ?, recipient_count = ? WHERE id = ? AND stage = 'DRAFT'", [
      c.get('user')?.id ?? null,
      people.length,
      id,
    ])
    if (!claimed.affectedRows) throw new AppError('This circular has already been published.', 409)
    for (let i = 0; i < people.length; i += 1000) {
      const chunk = people.slice(i, i + 1000)
      await exec(`INSERT IGNORE INTO hrms_circular_recipients (circular_id, staff_no) VALUES ${chunk.map(() => '(?, ?)').join(', ')}`, chunk.flatMap((p) => [id, p.staffNo]))
    }
    if (Number(row.sendPortal) === 1) await postToPortal({ ...row, id }, people.map((p) => p.staffNo), new URL(c.req.url).origin)
    audit(c.get('user'), 'update', 'circular', id, `Published circular "${row.subject}" to ${people.length} staff`)
    void deliver(id)
    return c.json({ id, recipients: people.length })
  })
  .post('/:id/resend', requirePermission('circulars', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const row = await load(id)
    if (row.stage !== 'PUBLISHED') throw new AppError('Only published circulars can be resent.', 409)
    if (progress.get(id)?.running) throw new AppError('The circular is still being sent.', 409)
    audit(c.get('user'), 'update', 'circular', id, `Resent undelivered messages for circular "${row.subject}"`)
    void deliver(id)
    return c.json({ ok: true })
  })
  .post('/:id/archive', requirePermission('circulars', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const row = await load(id)
    if (row.stage !== 'PUBLISHED') throw new AppError('Only published circulars can be archived.', 409)
    if (progress.get(id)?.running) throw new AppError('Wait for the circular to finish sending.', 409)
    await exec("UPDATE circular SET stage = 'ARCHIVED', status = 0, archived_at = NOW() WHERE id = ?", [id])
    audit(c.get('user'), 'update', 'circular', id, `Archived circular "${row.subject}"`)
    return c.json({ ok: true })
  })
