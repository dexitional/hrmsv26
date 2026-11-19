// Dates of birth and retirement. Retirement is at RETIREMENT_AGE (60): staff
// aged 59 are flagged amber, 60 and over red, everyone younger green.
// Every change to a date of birth is logged (staff_dob_log) with its reason.
//   GET /api/dob?band=green|amber|red&q=&unit=&page=
//   PUT /api/dob/:staffNo            change a date of birth
//   GET /api/dob/:staffNo/log        that staff member's changes
//   GET /api/dob/log                 every change, newest first
import { Hono } from 'hono'
import { dobChangeSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, like, paging, rows, scalar } from '../lib/db'
import { AppError } from '../lib/errors'
import { PLACEMENT, RETIREMENT, activeStaffSql, ageSql, dobSql, nameSql, requireStaff } from '../lib/hr'
import { validate } from '../lib/validate'

const BAND_SQL = `CASE WHEN ${ageSql()} >= ${RETIREMENT} THEN 'red' WHEN ${ageSql()} >= ${RETIREMENT - 1} THEN 'amber' ELSE 'green' END`

export const dobRoute = new Hono()
  .get('/', requirePermission('dob', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = [activeStaffSql(), `${dobSql()} IS NOT NULL`]
    const params: Array<unknown> = []
    if (q.band) (where.push(`${BAND_SQL} = ?`), params.push(q.band))
    if (q.unit) (where.push('u.id = ?'), params.push(Number(q.unit)))
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR s.staff_no = ?)`), params.push(like(q.q), Number(q.q) || 0))
    const from = `FROM staff s ${PLACEMENT} WHERE ${where.join(' AND ')}`
    const [data, total, bands] = await Promise.all([
      rows(
        `SELECT s.staff_no, ${nameSql()} AS full_name, ${dobSql()} AS dob, ${ageSql()} AS age, ${BAND_SQL} AS band,
                DATE_ADD(${dobSql()}, INTERVAL ${RETIREMENT} YEAR) AS retirement_date,
                DATEDIFF(DATE_ADD(${dobSql()}, INTERVAL ${RETIREMENT} YEAR), CURDATE()) AS days_to_retirement,
                s.gender, s.staff_status, u.long_name AS unit_name, j.title AS job_title,
                (SELECT COUNT(*) FROM staff_dob_log l WHERE l.staff_no = s.staff_no) AS changes
           ${from} ORDER BY ${dobSql()} ASC, s.staff_no LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${from}`, params),
      rows(
        `SELECT ${BAND_SQL} AS status, COUNT(*) AS count FROM staff s
          WHERE ${activeStaffSql()} AND ${dobSql()} IS NOT NULL GROUP BY status`,
      ),
    ])
    return c.json({ data, total, page, pageSize, counts: bands })
  })
  .get('/log', requirePermission('dob', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const [data, total] = await Promise.all([
      rows(
        `SELECT l.*, ${nameSql()} AS full_name FROM staff_dob_log l LEFT JOIN staff s ON s.staff_no = l.staff_no
          ORDER BY l.id DESC LIMIT ? OFFSET ?`,
        [limit, offset],
      ),
      scalar('SELECT COUNT(*) FROM staff_dob_log'),
    ])
    return c.json({ data, total, page, pageSize })
  })
  .get('/:staffNo/log', requirePermission('dob', 'view'), async (c) => {
    const staff = await requireStaff(Number(c.req.param('staffNo')))
    const log = await rows('SELECT * FROM staff_dob_log WHERE staff_no = ? ORDER BY id DESC', [staff.staffNo])
    return c.json({ staff, log })
  })
  .put('/:staffNo', requirePermission('dob', 'edit'), validate('json', dobChangeSchema), async (c) => {
    const me = c.get('user')
    const staff = await requireStaff(Number(c.req.param('staffNo')))
    const { dob, reason, evidenceUrl } = c.req.valid('json')
    if (staff.dob === dob) throw new AppError('That is already the recorded date of birth.', 422)
    await exec(
      `INSERT INTO staff_dob_log (staff_no, old_dob, new_dob, reason, evidence_url, changed_by, changed_by_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [staff.staffNo, staff.dob, dob, reason, evidenceUrl, me.id, me.fullName],
    )
    await exec('UPDATE staff SET dob = ?, updated_at = NOW() WHERE staff_no = ?', [dob, staff.staffNo])
    audit(me, 'update', 'dob', staff.staffNo, `Date of birth of ${staff.fullName} changed ${staff.dob ?? '—'} → ${dob}`)
    return c.json({ ok: true })
  })
