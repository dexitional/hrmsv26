// Positions held by staff (legacy `position` table): head of department,
// dean, director… for a period, over a unit of jurisdiction.
//
// Alerts: a position is "expiring" from POSITION_ALERT_DAYS before its end
// date, and "expired" once the end date passes while it is still active.
//   GET /api/positions?status=current|expiring|expired|ended&q=&page=
//   GET /api/positions/history/:staffNo   (printable position history)
import { Hono } from 'hono'
import { positionSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update } from '../lib/db'
import { notFound } from '../lib/errors'
import { flag, nameSql, requireStaff } from '../lib/hr'
import { validate } from '../lib/validate'

export const POSITION_ALERT_DAYS = 90

const STATUS_SQL: Record<string, string> = {
  current: "p.active = '1' AND p.end_date >= CURDATE()",
  expiring: `p.active = '1' AND p.end_date BETWEEN CURDATE() AND CURDATE() + INTERVAL ${POSITION_ALERT_DAYS} DAY`,
  expired: "p.active = '1' AND p.end_date < CURDATE()",
  ended: "p.active = '0'",
}

const COLUMNS = `p.id, p.staff_no, p.start_date, p.end_date, p.unit_id, p.unit_domain, NULLIF(p.post, '') AS post,
  COALESCE(NULLIF(p.title, ''), NULLIF(p.post, '')) AS title, p.access, p.active, p.remark,
  DATEDIFF(p.end_date, CURDATE()) AS days_left, ${nameSql()} AS full_name, u.long_name AS unit_name`

/** Heads and sub-heads named on a current position become the unit's head/sub-head. */
async function syncUnitHead(data: { access: string | null; active: boolean; endDate: string; unitId: number; staffNo: number }) {
  if (!data.access || !data.active || data.endDate < new Date().toISOString().slice(0, 10)) return
  const column = data.access === 'HEAD' ? 'unit_head' : 'unit_subhead'
  await exec(`UPDATE unit SET ${column} = ? WHERE id = ?`, [data.staffNo, data.unitId])
}

export const positionsRoute = new Hono()
  .get('/', requirePermission('positions', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.status && STATUS_SQL[q.status]) where.push(STATUS_SQL[q.status]!)
    if (q.q) {
      where.push(`(${nameSql()} LIKE ? OR p.title LIKE ? OR p.post LIKE ? OR u.long_name LIKE ? OR p.staff_no = ?)`)
      params.push(like(q.q), like(q.q), like(q.q), like(q.q), Number(q.q) || 0)
    }
    const from = `FROM position p LEFT JOIN staff s ON s.staff_no = p.staff_no LEFT JOIN unit u ON u.id = p.unit_id
      WHERE ${where.join(' AND ')}`
    const order =
      q.status === 'expired' ? 'p.end_date DESC' : q.status === 'ended' ? 'p.end_date DESC' : 'p.end_date ASC, p.id DESC'
    const [data, total, counts] = await Promise.all([
      rows(`SELECT ${COLUMNS} ${from} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, limit, offset]),
      scalar(`SELECT COUNT(*) ${from}`, params),
      rows(
        `SELECT ${Object.entries(STATUS_SQL)
          .map(([k, sql]) => `SUM(${sql}) AS \`${k}\``)
          .join(', ')} FROM position p`,
      ),
    ])
    const c0 = counts[0] ?? {}
    return c.json({
      data,
      total,
      page,
      pageSize,
      counts: Object.keys(STATUS_SQL).map((status) => ({ status, count: Number(c0[status] ?? 0) })),
    })
  })
  .get('/history/:staffNo', requirePermission('positions', 'view'), async (c) => {
    const staff = await requireStaff(Number(c.req.param('staffNo')))
    const positions = await rows(
      `SELECT ${COLUMNS} FROM position p LEFT JOIN staff s ON s.staff_no = p.staff_no LEFT JOIN unit u ON u.id = p.unit_id
        WHERE p.staff_no = ? ORDER BY p.start_date DESC`,
      [staff.staffNo],
    )
    return c.json({ staff, positions })
  })
  .post('/', requirePermission('positions', 'edit'), validate('json', positionSchema), async (c) => {
    const data = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    const id = await insert('position', { ...data, active: flag(data.active), createdAt: new Date() })
    await syncUnitHead(data)
    audit(c.get('user'), 'create', 'position', id, `${data.title}: ${staff.fullName} (${data.startDate} – ${data.endDate})`)
    return c.json({ id }, 201)
  })
  .put('/:id', requirePermission('positions', 'edit'), validate('json', positionSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await one('SELECT id FROM position WHERE id = ?', [id]))) throw notFound('Position')
    const staff = await requireStaff(data.staffNo)
    await update('position', id, { ...data, active: flag(data.active) })
    await syncUnitHead(data)
    audit(c.get('user'), 'update', 'position', id, `${data.title}: ${staff.fullName}`)
    return c.json({ id })
  })
  .post('/:id/end', requirePermission('positions', 'edit'), async (c) => {
    const id = parseId(c.req.param('id'))
    const result = await exec("UPDATE position SET active = '0' WHERE id = ?", [id])
    if (!result.affectedRows) throw notFound('Position')
    audit(c.get('user'), 'update', 'position', id, 'Marked position as ended')
    return c.json({ ok: true })
  })
  .delete('/:id', requirePermission('positions', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const result = await exec('DELETE FROM position WHERE id = ?', [id])
    if (!result.affectedRows) throw notFound('Position')
    audit(c.get('user'), 'delete', 'position', id, 'Deleted position record')
    return c.json({ ok: true })
  })
