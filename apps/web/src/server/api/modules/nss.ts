// National service personnel (legacy `nss` table).
//   GET /api/nss?status=current|completed&year=&unit=&q=&page=
//   GET /api/nss/:id    POST /api/nss    PUT /api/nss/:id    DELETE /api/nss/:id
import { Hono } from 'hono'
import { nssSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { bareNameSql } from '../lib/hr'
import { validate } from '../lib/validate'

// Personnel are marked COMPLETED (and thanked) by the 1 November job.
const STATUS: Record<string, string> = {
  current: "n.service_status = 'SERVING'",
  completed: "n.service_status = 'COMPLETED'",
}

const COLUMNS = `n.id, n.nss_no, n.fname, n.mname, n.lname, ${bareNameSql('n')} AS full_name, n.gender, n.mobile, LOWER(TRIM(n.email)) AS email,
  n.dob, n.hometown, n.unit_id, u.long_name AS unit_name, n.ghcard_no, n.photo, n.nss_form, n.address,
  n.emergency_contact, n.emergency_address, n.emergency_phone, LOWER(TRIM(n.emergency_email)) AS emergency_email, n.start_date, n.end_date,
  YEAR(n.start_date) AS entry_year, YEAR(n.end_date) AS exit_year, n.service_status, n.completed_at, n.created_at`

export const nssRoute = new Hono()
  .get('/', requirePermission('nss', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ["n.active = '1'"]
    const params: Array<unknown> = []
    if (q.year) (where.push('YEAR(n.start_date) = ?'), params.push(Number(q.year)))
    if (q.unit) (where.push('n.unit_id = ?'), params.push(Number(q.unit)))
    if (q.gender) (where.push('n.gender = ?'), params.push(q.gender))
    if (q.q) {
      where.push(`(${bareNameSql('n')} LIKE ? OR n.nss_no LIKE ? OR n.mobile LIKE ? OR n.email LIKE ?)`)
      params.push(like(q.q), like(q.q), like(q.q), like(q.q))
    }
    const base = `FROM nss n LEFT JOIN unit u ON u.id = n.unit_id WHERE ${where.join(' AND ')}`
    const sw = q.status && STATUS[q.status] ? ` AND ${STATUS[q.status]}` : ''
    const [data, total, counts] = await Promise.all([
      rows(`SELECT ${COLUMNS} ${base}${sw} ORDER BY n.start_date DESC, n.id DESC LIMIT ? OFFSET ?`, [
        ...params,
        limit,
        offset,
      ]),
      scalar(`SELECT COUNT(*) ${base}${sw}`, params),
      rows(
        `SELECT ${Object.entries(STATUS)
          .map(([k, sql]) => `SUM(${sql}) AS \`${k}\``)
          .join(', ')} ${base}`,
        params,
      ),
    ])
    const c0 = counts[0] ?? {}
    return c.json({
      data,
      total,
      page,
      pageSize,
      counts: Object.keys(STATUS).map((status) => ({ status, count: Number(c0[status] ?? 0) })),
    })
  })
  .get('/years', requirePermission('nss', 'view'), async (c) =>
    c.json(
      (
        await rows<{ year: number }>(
          "SELECT DISTINCT YEAR(start_date) AS year FROM nss WHERE start_date IS NOT NULL AND active = '1' HAVING year BETWEEN 1990 AND YEAR(CURDATE()) + 1 ORDER BY year DESC",
        )
      ).map((r) => r.year),
    ),
  )
  .get('/:id', requirePermission('nss', 'view'), async (c) => {
    const row = await one(`SELECT ${COLUMNS} FROM nss n LEFT JOIN unit u ON u.id = n.unit_id WHERE n.id = ?`, [
      parseId(c.req.param('id')),
    ])
    if (!row) throw notFound('National service personnel')
    return c.json(row)
  })
  .post('/', requirePermission('nss', 'edit'), validate('json', nssSchema), async (c) => {
    const data = c.req.valid('json')
    if (await one("SELECT id FROM nss WHERE nss_no = ? AND active = '1' AND start_date = ?", [data.nssNo, data.startDate]))
      throw new AppError(`${data.nssNo} is already recorded for this service year.`, 409)
    const id = await insert('nss', { ...data, active: '1', verified: '0', createdAt: new Date() })
    audit(c.get('user'), 'create', 'nss', id, `Added NSS personnel ${data.nssNo} ${data.fname} ${data.lname}`)
    return c.json({ id }, 201)
  })
  .put('/:id', requirePermission('nss', 'edit'), validate('json', nssSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await one('SELECT id FROM nss WHERE id = ?', [id]))) throw notFound('National service personnel')
    await update('nss', id, data)
    audit(c.get('user'), 'update', 'nss', id, `Updated NSS personnel ${data.nssNo}`)
    return c.json({ id })
  })
  .delete('/:id', requirePermission('nss', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const row = await one<{ nssNo: string }>('SELECT nss_no FROM nss WHERE id = ?', [id])
    if (!row) throw notFound('National service personnel')
    await exec('DELETE FROM nss WHERE id = ?', [id])
    audit(c.get('user'), 'delete', 'nss', id, `Deleted NSS personnel ${row.nssNo}`)
    return c.json({ ok: true })
  })
