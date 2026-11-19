// Disciplinary actions against staff (legacy `disciplinary` table).
//   GET  /api/disciplinary?action=&year=&q=&page=
//   GET  /api/disciplinary/history/:staffNo     printable record for one staff member
//   POST /api/disciplinary   PUT/DELETE /api/disciplinary/:id
import { Hono } from 'hono'
import { disciplinarySchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update } from '../lib/db'
import { notFound } from '../lib/errors'
import { PLACEMENT, nameSql, requireStaff, staffContact } from '../lib/hr'
import { notifyLater } from '../lib/messaging'
import { disciplinaryIssued, salutation } from '../lib/templates'
import { validate } from '../lib/validate'
import { sentenceCase } from '#/lib/text-case'

/** Reasons were typed in capitals in the legacy system. */
const readable = <T extends Record<string, any>>(r: T) => ({ ...r, reason: sentenceCase(r.reason), remark: sentenceCase(r.remark) })

const COLUMNS = `d.id, d.staff_no, ${nameSql()} AS full_name, u.long_name AS unit_name, j.title AS job_title,
  d.action_type, d.issue_date, d.reason, d.remark`
const FROM = `FROM disciplinary d LEFT JOIN staff s ON s.staff_no = d.staff_no ${PLACEMENT}`

export const disciplinaryRoute = new Hono()
  .get('/', requirePermission('disciplinary', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ["d.active = '1'"]
    const params: Array<unknown> = []
    if (q.year) (where.push('YEAR(d.issue_date) = ?'), params.push(Number(q.year)))
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR d.staff_no = ? OR d.reason LIKE ?)`), params.push(like(q.q), Number(q.q) || 0, like(q.q)))
    const base = `${FROM} WHERE ${where.join(' AND ')}`
    const aw = q.action ? ' AND d.action_type = ?' : ''
    const ap = q.action ? [q.action] : []
    const [data, total, counts] = await Promise.all([
      rows(`SELECT ${COLUMNS} ${base}${aw} ORDER BY d.issue_date DESC, d.id DESC LIMIT ? OFFSET ?`, [...params, ...ap, limit, offset]),
      scalar(`SELECT COUNT(*) ${base}${aw}`, [...params, ...ap]),
      rows(`SELECT d.action_type AS status, COUNT(*) AS count ${base} GROUP BY d.action_type`, params),
    ])
    return c.json({ data: data.map(readable), total, page, pageSize, counts })
  })
  .get('/history/:staffNo', requirePermission('disciplinary', 'view'), async (c) => {
    const staff = await requireStaff(Number(c.req.param('staffNo')))
    const records = await rows(`SELECT ${COLUMNS} ${FROM} WHERE d.staff_no = ? AND d.active = '1' ORDER BY d.issue_date DESC`, [staff.staffNo])
    return c.json({ staff, records: records.map(readable) })
  })
  .post('/', requirePermission('disciplinary', 'edit'), validate('json', disciplinarySchema), async (c) => {
    const data = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    const id = await insert('disciplinary', { ...data, active: '1', createdAt: new Date() })
    const person = await staffContact(data.staffNo)
    if (person) {
      const msg = disciplinaryIssued({ salute: salutation(person), actionType: data.actionType, issueDate: data.issueDate })
      notifyLater({ kind: 'disciplinary', key: `disciplinary:${id}`, staffNo: data.staffNo, entityId: id, name: salutation(person), phone: person.phone, email: person.uccMail || person.email, ...msg })
    }
    audit(c.get('user'), 'create', 'disciplinary', id, `${data.actionType} issued to ${staff.fullName} (${data.staffNo})`)
    return c.json({ id }, 201)
  })
  .put('/:id', requirePermission('disciplinary', 'edit'), validate('json', disciplinarySchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    await requireStaff(data.staffNo)
    if (!(await one('SELECT id FROM disciplinary WHERE id = ?', [id]))) throw notFound('Disciplinary record')
    await update('disciplinary', id, data)
    audit(c.get('user'), 'update', 'disciplinary', id, `Updated ${data.actionType} of staff ${data.staffNo}`)
    return c.json({ id })
  })
  .delete('/:id', requirePermission('disciplinary', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const result = await exec("UPDATE disciplinary SET active = '0' WHERE id = ?", [id])
    if (!result.affectedRows) throw notFound('Disciplinary record')
    audit(c.get('user'), 'delete', 'disciplinary', id, `Deleted disciplinary record #${id}`)
    return c.json({ ok: true })
  })
