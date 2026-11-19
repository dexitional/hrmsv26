// Staff progression: appointments, promotions and upgrades (legacy
// `promotion` table), confirmations, senior-member contract renewals
// (`renewal`) and post-retirement contracts (`postretire`).
//
//   GET    /api/elevation/records?type=&q=&page=      every elevation record
//   POST   /api/elevation/records                     appointment | promotion | upgrade
//   PUT    /api/elevation/records/:id   DELETE /api/elevation/records/:id
//   GET    /api/elevation/history/:staffNo            printable statistics for one staff member
//   GET    /api/elevation/confirmations?status=pending|due|confirmed
//   POST   /api/elevation/confirmations/:id/confirm
//   GET    /api/elevation/renewals?status=   CRUD   GET /renewals/expired?year=
//   GET    /api/elevation/postretire?status= CRUD   GET /postretire/expired?year=
//
// Confirmation falls due `probation` years after the assumption date.
// Contracts expire `renewal_period` (or `served`) years after their start.
import { Hono } from 'hono'
import { confirmSchema, elevationSchema, postRetireSchema, renewalSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { activeStaffSql, nameSql, requireStaff, syncPlacement } from '../lib/hr'
import { validate } from '../lib/validate'

const view = requirePermission('elevation', 'view')
const edit = requirePermission('elevation', 'edit')
const manage = requirePermission('elevation', 'manage')

export const CONTRACT_ALERT_DAYS = 90

const RECORD_COLUMNS = `p.id, p.staff_no, ${nameSql()} AS full_name, COALESCE(p.apply_type, 'APPOINTMENT') AS apply_type,
  p.appoint_date, p.confirm_date, p.letter_date, p.probation, p.staff_group, p.remark,
  p.job_id, j.title AS job_title, p.unit_id, u.long_name AS unit_name, p.scale_id, g.grade, g.notch,
  s.promo_id = p.id AS is_current`

const RECORD_FROM = `FROM promotion p LEFT JOIN staff s ON s.staff_no = p.staff_no
  LEFT JOIN job j ON j.id = p.job_id LEFT JOIN unit u ON u.id = p.unit_id LEFT JOIN scale g ON g.id = p.scale_id`

/** After a record is removed or loses "current", point the staff member at their latest remaining record. */
async function repointToLatest(staffNo: number) {
  const latest = await one<{ id: number }>(
    'SELECT id FROM promotion WHERE staff_no = ? ORDER BY appoint_date DESC, id DESC LIMIT 1',
    [staffNo],
  )
  if (latest) await syncPlacement(staffNo, latest.id)
  else await exec('UPDATE staff SET promo_id = NULL WHERE staff_no = ?', [staffNo])
}

// ---------------------------------------------------------------- Contracts

const CONTRACTS = {
  renewals: {
    table: 'renewal',
    start: 'start_date',
    end: 'end_date',
    years: 'renewal_period',
    entity: 'renewal',
    label: 'Senior member renewal',
    schema: renewalSchema,
  },
  postretire: {
    table: 'postretire',
    start: 'start_post',
    end: 'end_post',
    years: 'served',
    entity: 'postretire',
    label: 'Post-retirement contract',
    schema: postRetireSchema,
  },
} as const

function contractRoutes(kind: keyof typeof CONTRACTS) {
  const k = CONTRACTS[kind]
  const expiry = `DATE_ADD(x.${k.start}, INTERVAL x.${k.years} YEAR)`
  const STATUS: Record<string, string> = {
    running: `${expiry} >= CURDATE()`,
    expiring: `${expiry} BETWEEN CURDATE() AND CURDATE() + INTERVAL ${CONTRACT_ALERT_DAYS} DAY`,
    expired: `${expiry} < CURDATE()`,
  }
  const columns = `x.*, ${nameSql()} AS full_name, ${expiry} AS expiry_date, DATEDIFF(${expiry}, CURDATE()) AS days_left,
    j.title AS job_title, u.long_name AS unit_name, s.staff_status`
  const from = `FROM ${k.table} x LEFT JOIN staff s ON s.staff_no = x.staff_no
    LEFT JOIN promotion cp ON cp.id = s.promo_id
    LEFT JOIN job j ON j.id = COALESCE(cp.job_id, s.job_id) LEFT JOIN unit u ON u.id = COALESCE(cp.unit_id, s.unit_id)`

  return new Hono()
    .get('/', view, async (c) => {
      const q = c.req.query()
      const { page, pageSize, limit, offset } = paging(q, 25)
      const where: Array<string> = ["x.active = '1'"]
      const params: Array<unknown> = []
      if (q.status && STATUS[q.status]) where.push(STATUS[q.status]!)
      if (q.q) (where.push(`(${nameSql()} LIKE ? OR x.staff_no = ?)`), params.push(like(q.q), Number(q.q) || 0))
      const [data, total, counts] = await Promise.all([
        rows(`SELECT ${columns} ${from} WHERE ${where.join(' AND ')} ORDER BY ${expiry} ASC LIMIT ? OFFSET ?`, [
          ...params,
          limit,
          offset,
        ]),
        scalar(`SELECT COUNT(*) ${from} WHERE ${where.join(' AND ')}`, params),
        rows(
          `SELECT ${Object.entries(STATUS)
            .map(([key, sql]) => `SUM(${sql}) AS \`${key}\``)
            .join(', ')} FROM ${k.table} x WHERE x.active = '1'`,
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
    // Contracts that ran out during the year (up to today), latest first.
    .get('/expired', view, async (c) => {
      const year = Number(c.req.query('year')) || new Date().getFullYear()
      const data = await rows(
        `SELECT ${columns} ${from}
          WHERE x.active = '1' AND YEAR(${expiry}) = ? AND ${expiry} < CURDATE() ORDER BY ${expiry} DESC`,
        [year],
      )
      return c.json({ year, data })
    })
    .post('/', edit, validate('json', k.schema), async (c) => {
      const data = c.req.valid('json') as Record<string, unknown> & { staffNo: number }
      const staff = await requireStaff(data.staffNo)
      // A staff member has one running contract of each kind: the new one replaces it.
      await exec(`UPDATE ${k.table} SET active = '0' WHERE staff_no = ? AND active = '1'`, [data.staffNo])
      const extra = kind === 'renewals' ? { promoId: staff.promoId ?? 0, appliedDate: new Date(), hrApproved: '1' } : {}
      const id = await insert(k.table, { ...data, ...extra, active: '1' })
      audit(c.get('user'), 'create', k.entity, id, `${k.label} for ${staff.fullName} (${data.staffNo})`)
      return c.json({ id }, 201)
    })
    .put('/:id', edit, validate('json', k.schema), async (c) => {
      const id = parseId(c.req.param('id'))
      const data = c.req.valid('json') as Record<string, unknown> & { staffNo: number }
      const staff = await requireStaff(data.staffNo)
      if (!(await one(`SELECT id FROM ${k.table} WHERE id = ?`, [id]))) throw notFound(k.label)
      await update(k.table, id, data)
      audit(c.get('user'), 'update', k.entity, id, `Updated ${k.label.toLowerCase()} of ${staff.fullName}`)
      return c.json({ id })
    })
    .delete('/:id', manage, async (c) => {
      const id = parseId(c.req.param('id'))
      const result = await exec(`UPDATE ${k.table} SET active = '0' WHERE id = ?`, [id])
      if (!result.affectedRows) throw notFound(k.label)
      audit(c.get('user'), 'delete', k.entity, id, `Closed ${k.label.toLowerCase()} #${id}`)
      return c.json({ ok: true })
    })
}

// ---------------------------------------------------------------- Confirmations

const CONFIRM_DUE = 'DATE_ADD(p.appoint_date, INTERVAL p.probation YEAR)'
const CONFIRM_STATUS: Record<string, string> = {
  pending: `p.confirm_date IS NULL AND ${CONFIRM_DUE} > CURDATE()`,
  due: `p.confirm_date IS NULL AND ${CONFIRM_DUE} <= CURDATE()`,
  confirmed: 'p.confirm_date IS NOT NULL',
}

export const elevationRoute = new Hono()
  .get('/records', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.type) (where.push("COALESCE(p.apply_type, 'APPOINTMENT') = ?"), params.push(q.type))
    if (q.current) where.push('s.promo_id = p.id')
    if (q.q) {
      where.push(`(${nameSql()} LIKE ? OR p.staff_no = ? OR j.title LIKE ?)`)
      params.push(like(q.q), Number(q.q) || 0, like(q.q))
    }
    const from = `${RECORD_FROM} WHERE ${where.join(' AND ')}`
    const [data, total, counts] = await Promise.all([
      rows(`SELECT ${RECORD_COLUMNS} ${from} ORDER BY p.appoint_date DESC, p.id DESC LIMIT ? OFFSET ?`, [
        ...params,
        limit,
        offset,
      ]),
      scalar(`SELECT COUNT(*) ${from}`, params),
      rows("SELECT COALESCE(apply_type, 'APPOINTMENT') AS status, COUNT(*) AS count FROM promotion GROUP BY status"),
    ])
    return c.json({ data, total, page, pageSize, counts })
  })
  .get('/records/:id', view, async (c) => {
    const record = await one(`SELECT ${RECORD_COLUMNS} ${RECORD_FROM} WHERE p.id = ?`, [parseId(c.req.param('id'))])
    if (!record) throw notFound('Record')
    return c.json(record)
  })
  .post('/records', edit, validate('json', elevationSchema), async (c) => {
    const { makeCurrent, type, ...data } = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    const id = await insert('promotion', {
      ...data,
      // Promotions and upgrades keep the staff member in their current unit.
      unitId: data.unitId ?? staff.unitId,
      applyType: type,
      createdAt: new Date(),
    })
    if (makeCurrent) {
      await syncPlacement(data.staffNo, id)
      if (type === 'APPOINTMENT') {
        await exec('UPDATE staff SET assume_date = ?, probation = ?, confirm_date = ? WHERE staff_no = ?', [
          data.appointDate,
          data.probation,
          data.confirmDate,
          data.staffNo,
        ])
      }
    }
    audit(c.get('user'), 'create', 'elevation', id, `${type.toLowerCase()} of ${staff.fullName} (${data.staffNo})`)
    return c.json({ id }, 201)
  })
  .put('/records/:id', edit, validate('json', elevationSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { makeCurrent, type, ...data } = c.req.valid('json')
    const existing = await one<{ staffNo: number }>('SELECT staff_no FROM promotion WHERE id = ?', [id])
    if (!existing) throw notFound('Record')
    if (existing.staffNo !== data.staffNo) throw new AppError('A record cannot be moved to another staff member.', 422)
    const staff = await requireStaff(data.staffNo)
    await update('promotion', id, { ...data, unitId: data.unitId ?? staff.unitId, applyType: type, updatedAt: new Date() })
    if (makeCurrent || staff.promoId === id) await syncPlacement(data.staffNo, id)
    audit(c.get('user'), 'update', 'elevation', id, `Updated ${type.toLowerCase()} of ${staff.fullName}`)
    return c.json({ id })
  })
  .delete('/records/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const record = await one<{ staffNo: number }>('SELECT staff_no FROM promotion WHERE id = ?', [id])
    if (!record) throw notFound('Record')
    const wasCurrent = Number(await scalar('SELECT COUNT(*) FROM staff WHERE staff_no = ? AND promo_id = ?', [record.staffNo, id]))
    await exec('DELETE FROM promotion WHERE id = ?', [id])
    if (wasCurrent) await repointToLatest(record.staffNo)
    audit(c.get('user'), 'delete', 'elevation', id, `Deleted elevation record of staff ${record.staffNo}`)
    return c.json({ ok: true })
  })
  .get('/history/:staffNo', view, async (c) => {
    const staff = await requireStaff(Number(c.req.param('staffNo')))
    const [records, renewals, postRetire] = await Promise.all([
      rows(`SELECT ${RECORD_COLUMNS} ${RECORD_FROM} WHERE p.staff_no = ? ORDER BY p.appoint_date ASC, p.id ASC`, [
        staff.staffNo,
      ]),
      rows('SELECT * FROM renewal WHERE staff_no = ? ORDER BY start_date', [staff.staffNo]),
      rows('SELECT * FROM postretire WHERE staff_no = ? ORDER BY start_post', [staff.staffNo]),
    ])
    const extra = await one(
      "SELECT first_appoint_date, assume_date, confirm_date, NULLIF(dob, '0000-00-00') AS dob FROM staff WHERE staff_no = ?",
      [staff.staffNo],
    )
    return c.json({ staff: { ...staff, ...extra }, records, renewals, postRetire })
  })

  .get('/confirmations', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const base = [`s.promo_id = p.id`, activeStaffSql(), 'p.probation > 0', 'p.appoint_date IS NOT NULL']
    const where = [...base]
    const params: Array<unknown> = []
    const status = q.status && CONFIRM_STATUS[q.status] ? q.status : null
    if (status) where.push(CONFIRM_STATUS[status]!)
    else where.push('p.confirm_date IS NULL')
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR p.staff_no = ?)`), params.push(like(q.q), Number(q.q) || 0))
    const from = `${RECORD_FROM} WHERE ${where.join(' AND ')}`
    const [data, total, counts] = await Promise.all([
      rows(
        `SELECT ${RECORD_COLUMNS}, ${CONFIRM_DUE} AS due_date, DATEDIFF(${CONFIRM_DUE}, CURDATE()) AS days_left
           ${from} ORDER BY ${CONFIRM_DUE} ASC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${from}`, params),
      rows(
        `SELECT ${Object.entries(CONFIRM_STATUS)
          .map(([key, sql]) => `SUM(${sql}) AS \`${key}\``)
          .join(', ')} ${RECORD_FROM} WHERE ${base.join(' AND ')}`,
      ),
    ])
    const c0 = counts[0] ?? {}
    return c.json({
      data,
      total,
      page,
      pageSize,
      counts: Object.keys(CONFIRM_STATUS).map((s) => ({ status: s, count: Number(c0[s] ?? 0) })),
    })
  })
  .post('/confirmations/:id/confirm', edit, validate('json', confirmSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { confirmDate } = c.req.valid('json')
    const record = await one<{ staffNo: number }>('SELECT staff_no FROM promotion WHERE id = ?', [id])
    if (!record) throw notFound('Record')
    await exec('UPDATE promotion SET confirm_date = ?, updated_at = NOW() WHERE id = ?', [confirmDate, id])
    await exec('UPDATE staff SET confirm_date = ? WHERE staff_no = ? AND promo_id = ?', [confirmDate, record.staffNo, id])
    audit(c.get('user'), 'update', 'elevation', id, `Confirmed appointment of staff ${record.staffNo} on ${confirmDate}`)
    return c.json({ ok: true })
  })

  .route('/renewals', contractRoutes('renewals'))
  .route('/postretire', contractRoutes('postretire'))
