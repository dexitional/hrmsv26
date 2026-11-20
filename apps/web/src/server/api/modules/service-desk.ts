// Support requests staff raise from the portal (legacy staff_request):
// Helpdesk & Support, Eduroam & Wi-Fi, counselling and HR enquiries.
//   GET  /api/service-desk?category=&status=&q=&page=
//   POST /api/service-desk/:id/respond   { status: IN_PROGRESS | RESOLVED, response }
import { Hono } from 'hono'
import { SERVICE_CATEGORIES, serviceResponseSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, like, one, paging, parseId, rows, scalar } from '../lib/db'
import { notFound } from '../lib/errors'
import type { SessionUser } from '#/server/session-core'
import { PLACEMENT, nameSql } from '../lib/hr'
import { validate } from '../lib/validate'

// Counselling requests are confidential: only administrators and HR officers see them.
const seesCounselling = (u: SessionUser) => u.role === 'administrator' || u.role === 'hr_officer'

export const serviceDeskRoute = new Hono()
  .get('/', requirePermission('servicedesk', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 20)
    const where = [seesCounselling(c.get('user')) ? '1 = 1' : "r.category <> 'COUNSELLING'"]
    const params: Array<unknown> = []
    if (q.category && (SERVICE_CATEGORIES as ReadonlyArray<string>).includes(q.category)) (where.push('r.category = ?'), params.push(q.category))
    if (q.q) (where.push(`(r.title LIKE ? OR r.description LIKE ? OR ${nameSql()} LIKE ? OR r.staff_no LIKE ?)`), params.push(like(q.q), like(q.q), like(q.q), like(q.q)))
    const base = `FROM staff_request r JOIN staff s ON s.staff_no = r.staff_no ${PLACEMENT} LEFT JOIN hrms_users x ON x.id = r.responded_by WHERE ${where.join(' AND ')}`
    const sw = q.status ? ' AND r.status = ?' : ''
    const [data, total, counts] = await Promise.all([
      rows(
        `SELECT r.id, r.staff_no, ${nameSql()} AS full_name, u.long_name AS unit_name, s.phone, LOWER(TRIM(s.ucc_mail)) AS ucc_mail,
                r.category, r.title, r.description, r.attachment, r.attachment_name, r.status, r.response, r.responded_at,
                x.full_name AS responded_by_name, r.created_at
           ${base}${sw} ORDER BY FIELD(r.status, 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'), r.created_at DESC LIMIT ? OFFSET ?`,
        [...params, ...(q.status ? [q.status] : []), limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${base}${sw}`, [...params, ...(q.status ? [q.status] : [])]),
      rows<{ status: string; n: number }>(`SELECT r.status, COUNT(*) AS n ${base} GROUP BY r.status`, params),
    ])
    return c.json({ data, total, page, pageSize, counts: counts.map((x) => ({ status: x.status, count: Number(x.n) })) })
  })
  .post('/:id/respond', requirePermission('servicedesk', 'edit'), validate('json', serviceResponseSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { status, response } = c.req.valid('json')
    const row = await one<{ staffNo: number; title: string; category: string }>('SELECT staff_no, title, category FROM staff_request WHERE id = ?', [id])
    if (!row || (row.category === 'COUNSELLING' && !seesCounselling(c.get('user')))) throw notFound('Request')
    await exec('UPDATE staff_request SET status = ?, response = ?, responded_by = ?, responded_at = NOW() WHERE id = ?', [status, response, c.get('user').id, id])
    // Into the staff member's portal inbox.
    void exec(
      "INSERT INTO notification (type, staff_no, action, title, message, read_flag, priority, datetime) VALUES ('REQUEST', ?, 'Support request', ?, ?, '0', '1', NOW())",
      [row.staffNo, `${status === 'RESOLVED' ? 'Resolved' : 'Update'}: ${row.title}`.slice(0, 600).replace(/[^\x00-\xFF]/g, ''), response.replace(/[^\x00-\xFF]/g, '')],
    ).catch(() => undefined)
    audit(c.get('user'), 'update', 'service_request', id, `${status === 'RESOLVED' ? 'Resolved' : 'Responded to'} request #${id}: ${row.title}`)
    return c.json({ ok: true })
  })
