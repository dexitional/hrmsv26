// Procurement in the staff portal (the procurement database, same server).
// A head raises requests for the units they head; the head may also assign one
// staff member per unit to raise them (unit.apply_procure, as in the old
// portal), who then has the Procurement manager too. Requests go in as
// request + request_breakdown, every step in request_log; submitted ones go to
// the Procurement Directorate (stage 4, status 1). Requests of units below a
// head are read-only.
//
//   GET  /api/portal/manage/procurement           requests, units, categories, assignments
//   GET  /api/portal/manage/procurement/members?unit=   who a head can assign
//   PUT  /api/portal/manage/procurement/assign    { unitId, staffNo | null }
//   POST /api/portal/manage/procurement           GET/PUT/DELETE /api/portal/manage/procurement/:id
import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import type { z } from 'zod'
import { procurementAssignSchema, procurementRequestSchema } from '#/lib/schemas'
import type { PortalUser } from '#/server/portal-session-core'
import { properName } from '#/lib/text-case'
import { audit } from '../lib/audit'
import { exec, one, parseId, rows, withTransaction } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { PLACEMENT, activeStaffSql, nameSql } from '../lib/hr'
import { inList, portalUser, teamUnits } from '../lib/portal'
import { validate } from '../lib/validate'

/** Heads, and staff a head has assigned to raise requests. */
async function requireProcurer(c: Context, next: Next) {
  const staff = await portalUser(c)
  if (!staff) throw new AppError('Please sign in to the staff portal.', 401)
  if (!staff.heads.length && !staff.procures.length)
    throw new AppError('This is for heads of units and the staff they assign to raise procurement requests.', 403)
  c.set('staff', staff)
  await next()
}

/** Units the person can raise requests for: those they head, and those they are assigned to. */
function raisingUnits(me: PortalUser) {
  const units = new Map<number, string>()
  for (const h of me.heads) units.set(h.unitId, h.unitName)
  for (const p of me.procures) units.set(p.unitId, p.unitName)
  return [...units].map(([value, label]) => ({ value, label }))
}
const canRaise = (me: PortalUser, unitId: number) => raisingUnits(me).some((u) => u.value === unitId)

/** A row in the staff member's portal inbox (legacy notification table, Latin-1). */
function notifyProcurer(staffNo: number, title: string, message: string) {
  const latin1 = (t: string) =>
    t
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[^\x00-\xFF]/g, '')
  void exec(
    "INSERT INTO notification (type, staff_no, action, title, message, read_flag, priority, datetime) VALUES ('PROCUREMENT', ?, ?, ?, ?, '0', '1', NOW())",
    [staffNo, '/portal/manage/procurement', latin1(title), latin1(message)],
  ).catch(() => undefined)
}

/** Item categories of the procurement system. */
async function procurementCategories() {
  return rows<{ value: number; label: string }>(
    'SELECT id AS value, TRIM(cat_name) AS label FROM procurement.item_cat ORDER BY cat_name',
  )
}

/**
 * Writes a procurement request as the old portal did: the header (with a
 * random order number), one breakdown row per item, and request_log entries.
 * Submitting sends it to the Procurement Directorate (stage 4, status 1).
 */
async function saveProcurement(
  staffNo: number,
  existingId: number | null,
  d: z.output<typeof procurementRequestSchema>,
) {
  const items = d.items.map((i) => ({ ...i, total: Math.round(i.quantity * i.unitPrice * 100) / 100 }))
  const total = Math.round(items.reduce((t, i) => t + i.total, 0) * 100) / 100
  const status = d.submit ? 1 : 0
  const stage = d.submit ? 4 : 1
  return withTransaction(async (conn) => {
    let id = existingId
    let orderNo: string
    if (id) {
      orderNo = String(
        (await one<{ orderNo: string }>('SELECT order_no FROM procurement.request WHERE request_id = ?', [id], conn))
          ?.orderNo ?? '',
      )
      await exec(
        `UPDATE procurement.request SET status = ?, stage = ?, stage_status = 1, total_price = ?, request_date = ${d.submit ? 'CURRENT_TIMESTAMP' : 'request_date'} WHERE request_id = ? AND status = 0`,
        [status, String(stage), total, id],
        conn,
      )
      await exec('DELETE FROM procurement.request_breakdown WHERE request_id = ?', [id], conn)
    } else {
      orderNo = `${100000 + Math.floor(Math.random() * 899_910)}${Math.floor(Date.now() / 1000)}`
      const [res] = await conn!.query<import('mysql2').ResultSetHeader>(
        'INSERT INTO procurement.request (unit_id, staff_no, order_no, status, stage, stage_status, total_price) VALUES (?, ?, ?, ?, ?, 1, ?)',
        [d.unitId, staffNo, orderNo, status, String(stage), total],
      )
      id = res.insertId
    }
    for (const i of items) {
      await exec(
        `INSERT INTO procurement.request_breakdown (unit_id, staff_no, request_id, order_no, item_desc, quantity, unit_price, total_price, product_cat, status, stage, stage_status${d.submit ? ', sub_date' : ''})
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1${d.submit ? ', CURRENT_TIMESTAMP' : ''})`,
        [
          d.unitId,
          staffNo,
          id,
          orderNo,
          i.description,
          String(i.quantity),
          i.unitPrice,
          i.total,
          i.categoryId,
          status,
          stage,
        ],
        conn,
      )
    }
    await exec(
      `INSERT INTO procurement.request_log (unit_id, request_id, staff_no, order_no, status, stage, stage_status, type, comments, item_description, total_price)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
      [
        d.unitId,
        id,
        staffNo,
        orderNo,
        status,
        stage,
        d.submit ? 'Submitted to the Procurement Directorate (staff portal)' : 'Saved draft (staff portal)',
        'Applied For Procurement of Item(s)',
        total,
      ],
      conn,
    )
    return id!
  })
}

export const portalProcurementRoute = new Hono()
  .use(requireProcurer)

  .get('/', async (c) => {
    const me = c.get('staff')
    const raising = raisingUnits(me)
    const own = raising.map((u) => u.value)
    const below = (await teamUnits(me)).filter((u) => !own.includes(u))
    const list = (units: Array<number>, extra = '') =>
      units.length
        ? rows<Record<string, any>>(
            `SELECT r.request_id AS id, r.unit_id, u.long_name AS unit_name, r.order_no, r.status, r.stage, r.request_date, r.date_added, r.staff_no,
                    ${nameSql()} AS full_name, COUNT(b.id) AS items, COALESCE(SUM(b.total_price), 0) AS total
               FROM procurement.request r JOIN unit u ON u.id = r.unit_id LEFT JOIN staff s ON s.staff_no = r.staff_no
               LEFT JOIN procurement.request_breakdown b ON b.request_id = r.request_id
              WHERE ${inList('r.unit_id', units)}${extra}
              GROUP BY r.request_id ORDER BY r.request_id DESC LIMIT 500`,
            units,
          )
        : Promise.resolve([])
    const headed = me.heads.map((h) => h.unitId)
    const [mine, theirs, categories, assignments] = await Promise.all([
      list(own),
      list(below, ' AND r.status > 0'),
      procurementCategories(),
      headed.length
        ? rows<Record<string, any>>(
            `SELECT u.id AS unit_id, u.long_name AS unit_name, s.staff_no, ${nameSql()} AS full_name, j.title AS job_title, s.phone, LOWER(TRIM(s.ucc_mail)) AS ucc_mail
               FROM unit u LEFT JOIN staff s ON s.staff_no = NULLIF(u.apply_procure, '') LEFT JOIN promotion cp ON cp.id = s.promo_id LEFT JOIN job j ON j.id = COALESCE(cp.job_id, s.job_id)
              WHERE ${inList('u.id', headed)} ORDER BY u.long_name`,
            headed,
          )
        : Promise.resolve([]),
    ])
    return c.json({
      units: raising,
      assignedUnits: me.procures.map((p) => p.unitId).filter((u) => !headed.includes(u)),
      categories,
      requests: mine.map((r) => ({ ...r, editable: Number(r.status) === 0 })),
      below: theirs,
      assignments: assignments.map((a) => ({ ...a, unitName: properName(a.unitName) ?? a.unitName, staffNo: a.staffNo ? Number(a.staffNo) : null })),
    })
  })

  // Who a head can assign: active staff in the units they head and below
  // (the unit itself first). Only heads assign, never an assignee.
  .get('/members', async (c) => {
    const me = c.get('staff')
    const unit = Number(c.req.query('unit'))
    if (!me.heads.some((h) => h.unitId === unit)) throw notFound('Unit')
    const units = await teamUnits(me)
    const found = await rows<{ value: number; fullName: string; unitName: string | null; jobTitle: string | null }>(
      `SELECT s.staff_no AS value, ${nameSql()} AS full_name, u.long_name AS unit_name, j.title AS job_title
         FROM staff s ${PLACEMENT}
        WHERE s.staff_no > 0 AND s.staff_no <> ? AND ${activeStaffSql()} AND ${inList('u.id', units)}
        ORDER BY u.id = ? DESC, full_name LIMIT 2000`,
      [me.staffNo, ...units, unit],
    )
    return c.json(
      found.map((r) => ({
        value: r.value,
        label: r.fullName,
        hint: `${r.value}${r.jobTitle ? ` · ${r.jobTitle}` : ''}${r.unitName ? ` · ${r.unitName}` : ''}`,
      })),
    )
  })
  .put('/assign', validate('json', procurementAssignSchema), async (c) => {
    const me = c.get('staff')
    const { unitId, staffNo } = c.req.valid('json')
    const unit = me.heads.find((h) => h.unitId === unitId)
    if (!unit) throw new AppError('Only the head of the unit can assign who raises its procurement requests.', 403)
    const before = await one<{ applyProcure: string | null }>('SELECT apply_procure FROM unit WHERE id = ?', [unitId])
    const previous = Number(before?.applyProcure) || null
    let name: string | null = null
    if (staffNo === me.staffNo) throw new AppError('As head you already raise requests; assign another member of staff.', 422)
    if (staffNo !== null) {
      const units = await teamUnits(me)
      const person = await one<{ fullName: string }>(
        `SELECT ${nameSql()} AS full_name FROM staff s ${PLACEMENT} WHERE s.staff_no = ? AND ${activeStaffSql()} AND ${inList('u.id', units)}`,
        [staffNo, ...units],
      )
      if (!person) throw new AppError('Choose an active member of your unit.', 422)
      name = person.fullName
    }
    if (previous === staffNo) return c.json({ ok: true })
    await exec('UPDATE unit SET apply_procure = ? WHERE id = ?', [staffNo === null ? null : String(staffNo), unitId])
    if (staffNo !== null)
      notifyProcurer(
        staffNo,
        'Procurement requests',
        `${me.fullName} has assigned you to raise procurement requests for ${unit.unitName}. Use the Procurement manager in the staff portal.`,
      )
    if (previous && previous !== staffNo)
      notifyProcurer(
        previous,
        'Procurement requests',
        `You no longer raise procurement requests for ${unit.unitName}; ${me.fullName} has ${staffNo ? 'assigned someone else' : 'withdrawn the assignment'}.`,
      )
    audit(
      null,
      'update',
      'unit',
      unitId,
      `Staff portal: ${me.fullName} (${me.staffNo}) ${staffNo ? `assigned ${name} (${staffNo}) to raise procurement requests for` : 'withdrew the procurement assignment of'} ${unit.unitName}${previous ? ` (was ${previous})` : ''}`,
    )
    return c.json({ ok: true })
  })

  .get('/:id', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const r = await one<Record<string, any>>(
      `SELECT r.request_id AS id, r.unit_id, u.long_name AS unit_name, r.order_no, r.status, r.stage, r.request_date, r.date_added, r.staff_no, ${nameSql()} AS full_name
         FROM procurement.request r JOIN unit u ON u.id = r.unit_id LEFT JOIN staff s ON s.staff_no = r.staff_no WHERE r.request_id = ?`,
      [id],
    )
    const own = raisingUnits(me).map((u) => u.value)
    const units = [...own, ...(await teamUnits(me))]
    if (!r || !units.includes(Number(r.unitId)) || (Number(r.status) === 0 && !own.includes(Number(r.unitId))))
      throw notFound('Request')
    const [items, log] = await Promise.all([
      rows(
        `SELECT b.id, b.product_cat AS category_id, c.cat_name AS category, b.item_desc AS description, b.quantity, b.unit_price, b.total_price, b.budget_state
           FROM procurement.request_breakdown b LEFT JOIN procurement.item_cat c ON c.id = b.product_cat WHERE b.request_id = ? ORDER BY b.id`,
        [id],
      ),
      rows(
        `SELECT l.id, l.stage, l.status, l.comments, l.item_description, l.date_added, l.staff_no, ${nameSql()} AS full_name
           FROM procurement.request_log l LEFT JOIN staff s ON s.staff_no = l.staff_no WHERE l.request_id = ? ORDER BY l.id`,
        [id],
      ),
    ])
    return c.json({ ...r, editable: Number(r.status) === 0 && own.includes(Number(r.unitId)), items, log })
  })
  .post('/', validate('json', procurementRequestSchema), async (c) => {
    const me = c.get('staff')
    const d = c.req.valid('json')
    if (!canRaise(me, d.unitId))
      throw new AppError('You can raise requests only for units you head or have been assigned to.', 403)
    const id = await saveProcurement(me.staffNo, null, d)
    audit(
      null,
      'create',
      'procurement',
      id,
      `Staff portal: ${me.fullName} (${me.staffNo}) ${d.submit ? 'submitted' : 'saved a draft'} procurement request #${id} (unit ${d.unitId})`,
    )
    return c.json({ id }, 201)
  })
  .put('/:id', validate('json', procurementRequestSchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const d = c.req.valid('json')
    const r = await one<{ unitId: number; status: number }>(
      'SELECT unit_id, status FROM procurement.request WHERE request_id = ?',
      [id],
    )
    if (!r || !canRaise(me, Number(r.unitId))) throw notFound('Request')
    if (Number(r.status) !== 0) throw new AppError('This request has been submitted and can no longer be changed.', 409)
    await saveProcurement(me.staffNo, id, { ...d, unitId: Number(r.unitId) })
    audit(
      null,
      'update',
      'procurement',
      id,
      `Staff portal: ${me.fullName} (${me.staffNo}) ${d.submit ? 'submitted' : 'updated the draft of'} procurement request #${id}`,
    )
    return c.json({ id })
  })
  .delete('/:id', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const r = await one<{ unitId: number; status: number }>(
      'SELECT unit_id, status FROM procurement.request WHERE request_id = ?',
      [id],
    )
    if (!r || !canRaise(me, Number(r.unitId))) throw notFound('Request')
    if (Number(r.status) !== 0) throw new AppError('Only a draft can be deleted.', 409)
    await withTransaction(async (conn) => {
      await exec('DELETE FROM procurement.request_breakdown WHERE request_id = ?', [id], conn)
      await exec('DELETE FROM procurement.request_log WHERE request_id = ?', [id], conn)
      await exec('DELETE FROM procurement.request WHERE request_id = ? AND status = 0', [id], conn)
    })
    audit(
      null,
      'delete',
      'procurement',
      id,
      `Staff portal: ${me.fullName} (${me.staffNo}) deleted draft procurement request #${id}`,
    )
    return c.json({ ok: true })
  })
