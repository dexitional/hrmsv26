// Staff transfers (legacy `transfer`) and transfer requests from staff
// (`transfer_request`).
//   GET    /api/transfers?q=&year=&page=          effected transfers
//   POST   /api/transfers                         record a transfer (effectNow moves the staff member)
//   PUT    /api/transfers/:id   DELETE /api/transfers/:id (soft)
//   GET    /api/transfers/history/:staffNo        printable transfer sheet
//   GET    /api/transfers/requests?status=&q=
//   POST   /api/transfers/requests/:id/approve | /reject
import { Hono } from 'hono'
import { transferDecisionSchema, transferSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { moveToUnit, nameSql, requireStaff, staffContact } from '../lib/hr'
import { notifyLater } from '../lib/messaging'
import { salutation, transferEffected } from '../lib/templates'
import { validate } from '../lib/validate'

const view = requirePermission('transfers', 'view')
const edit = requirePermission('transfers', 'edit')
const manage = requirePermission('transfers', 'manage')

const COLUMNS = `t.id, t.staff_no, ${nameSql()} AS full_name, t.transfer_date, t.from_unit, t.to_unit,
  f.long_name AS from_unit_name, tu.long_name AS to_unit_name, t.reason, t.remark, t.approved_by,
  ${nameSql('a')} AS approver_name, t.approved_date, t.request_date, j.title AS job_title`

const FROM = `FROM transfer t LEFT JOIN staff s ON s.staff_no = t.staff_no
  LEFT JOIN promotion cp ON cp.id = s.promo_id LEFT JOIN job j ON j.id = COALESCE(cp.job_id, s.job_id)
  LEFT JOIN unit f ON f.id = t.from_unit LEFT JOIN unit tu ON tu.id = t.to_unit
  LEFT JOIN staff a ON a.staff_no = t.approved_by`

async function checkApprover(staffNo: number | null) {
  if (staffNo && !(await one('SELECT id FROM staff WHERE staff_no = ?', [staffNo]))) {
    throw new AppError(`No staff member has staff number ${staffNo} (approved by).`, 422)
  }
}

export const transfersRoute = new Hono()
  .get('/', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['COALESCE(t.flag_delete, 0) = 0']
    const params: Array<unknown> = []
    if (q.year) (where.push('YEAR(t.transfer_date) = ?'), params.push(Number(q.year)))
    if (q.unit) (where.push('(t.from_unit = ? OR t.to_unit = ?)'), params.push(Number(q.unit), Number(q.unit)))
    if (q.q) {
      where.push(`(${nameSql()} LIKE ? OR t.staff_no = ? OR f.long_name LIKE ? OR tu.long_name LIKE ?)`)
      params.push(like(q.q), Number(q.q) || 0, like(q.q), like(q.q))
    }
    const from = `${FROM} WHERE ${where.join(' AND ')}`
    const [data, total] = await Promise.all([
      rows(`SELECT ${COLUMNS} ${from} ORDER BY t.transfer_date DESC, t.id DESC LIMIT ? OFFSET ?`, [
        ...params,
        limit,
        offset,
      ]),
      scalar(`SELECT COUNT(*) ${from}`, params),
    ])
    return c.json({ data, total, page, pageSize })
  })
  .get('/years', view, async (c) =>
    c.json(
      (
        await rows<{ year: number }>(
          'SELECT DISTINCT YEAR(transfer_date) AS year FROM transfer WHERE transfer_date IS NOT NULL HAVING year BETWEEN 1990 AND YEAR(CURDATE()) + 1 ORDER BY year DESC',
        )
      ).map((r) => r.year),
    ),
  )
  .get('/history/:staffNo', view, async (c) => {
    const staff = await requireStaff(Number(c.req.param('staffNo')))
    const transfers = await rows(
      `SELECT ${COLUMNS} ${FROM} WHERE t.staff_no = ? AND COALESCE(t.flag_delete, 0) = 0 ORDER BY t.transfer_date ASC`,
      [staff.staffNo],
    )
    return c.json({ staff, transfers })
  })
  .get('/:id', view, async (c) => {
    const row = await one(`SELECT ${COLUMNS} ${FROM} WHERE t.id = ?`, [parseId(c.req.param('id'))])
    if (!row) throw notFound('Transfer')
    return c.json(row)
  })
  .post('/', edit, validate('json', transferSchema), async (c) => {
    const { effectNow, ...data } = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    await checkApprover(data.approvedBy)
    const id = await insert('transfer', {
      ...data,
      approvedBy: data.approvedBy ?? 0,
      approveStatus: 1,
      flagDelete: 0,
      requestDate: new Date(),
      createdAt: new Date(),
    })
    if (effectNow) {
      await moveToUnit(data.staffNo, data.toUnit)
      await notifyTransfer(id, data.staffNo, data.fromUnit, data.toUnit, data.transferDate, staff.jobTitle)
    }
    audit(
      c.get('user'),
      'create',
      'transfer',
      id,
      `Transfer of ${staff.fullName} (${data.staffNo})${effectNow ? ' — unit changed' : ' — history only'}`,
    )
    return c.json({ id }, 201)
  })
  .put('/:id', edit, validate('json', transferSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { effectNow, ...data } = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    await checkApprover(data.approvedBy)
    if (!(await one('SELECT id FROM transfer WHERE id = ?', [id]))) throw notFound('Transfer')
    await update('transfer', id, { ...data, approvedBy: data.approvedBy ?? 0 })
    if (effectNow) await moveToUnit(data.staffNo, data.toUnit)
    audit(c.get('user'), 'update', 'transfer', id, `Updated transfer of ${staff.fullName}`)
    return c.json({ id })
  })
  .delete('/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const result = await exec('UPDATE transfer SET flag_delete = 1 WHERE id = ?', [id])
    if (!result.affectedRows) throw notFound('Transfer')
    audit(c.get('user'), 'delete', 'transfer', id, `Deleted transfer #${id}`)
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Requests
  .get('/requests/list', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR r.staff_no = ?)`), params.push(like(q.q), Number(q.q) || 0))
    const from = `FROM transfer_request r LEFT JOIN staff s ON s.staff_no = r.staff_no
      LEFT JOIN promotion cp ON cp.id = s.promo_id
      LEFT JOIN unit cu ON cu.id = COALESCE(cp.unit_id, s.unit_id) LEFT JOIN job j ON j.id = COALESCE(cp.job_id, s.job_id)
      LEFT JOIN unit tu ON tu.id = r.to_unit WHERE ${where.join(' AND ')}`
    const statusWhere = q.status ? ' AND r.transfer_status = ?' : ''
    const sp = q.status ? [q.status] : []
    const [data, total, counts] = await Promise.all([
      rows(
        `SELECT r.*, ${nameSql()} AS full_name, cu.long_name AS current_unit_name, cu.id AS current_unit_id,
                tu.long_name AS to_unit_name, j.title AS job_title, s.ucc_mail, s.phone
           ${from}${statusWhere} ORDER BY r.transfer_status = 'PENDING' DESC, r.applied_date DESC, r.id DESC LIMIT ? OFFSET ?`,
        [...params, ...sp, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${from}${statusWhere}`, [...params, ...sp]),
      rows(`SELECT r.transfer_status AS status, COUNT(*) AS count ${from} GROUP BY r.transfer_status`, params),
    ])
    return c.json({ data, total, page, pageSize, counts })
  })
  .post('/requests/:id/:decision{approve|reject}', edit, validate('json', transferDecisionSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const approve = c.req.param('decision') === 'approve'
    const { transferDate, remark } = c.req.valid('json')
    const me = c.get('user')
    const request = await one<{ staffNo: number; toUnit: number; reason: string; transferStatus: string; startDate: string | null }>(
      'SELECT staff_no, to_unit, reason, transfer_status, start_date FROM transfer_request WHERE id = ?',
      [id],
    )
    if (!request) throw notFound('Transfer request')
    if (request.transferStatus !== 'PENDING') throw new AppError('This request has already been decided.', 409)
    if (!approve) {
      await exec("UPDATE transfer_request SET transfer_status = 'REJECTED', remark = ? WHERE id = ?", [remark, id])
      audit(me, 'update', 'transfer_request', id, `Rejected transfer request of staff ${request.staffNo}`)
      return c.json({ ok: true })
    }
    const staff = await requireStaff(request.staffNo)
    if (!request.toUnit) throw new AppError('The request does not name a unit to transfer to.', 422)
    const today = new Date().toISOString().slice(0, 10)
    const transferId = await insert('transfer', {
      staffNo: request.staffNo,
      fromUnit: staff.unitId ?? 0,
      toUnit: request.toUnit,
      transferDate: transferDate ?? request.startDate ?? today,
      reason: request.reason,
      remark,
      requestBy: request.staffNo,
      requestDate: today,
      approvedBy: me.staffNo ?? 0,
      approvedDate: today,
      approveStatus: 1,
      flagDelete: 0,
      createdAt: new Date(),
    })
    await moveToUnit(request.staffNo, request.toUnit)
    await notifyTransfer(transferId, request.staffNo, staff.unitId, request.toUnit, transferDate ?? request.startDate ?? today, staff.jobTitle)
    await exec("UPDATE transfer_request SET transfer_status = 'APPROVED', transfer_id = ?, remark = ? WHERE id = ?", [
      transferId,
      remark,
      id,
    ])
    audit(me, 'update', 'transfer_request', id, `Approved transfer request of ${staff.fullName}`)
    return c.json({ ok: true, transferId })
  })

/** Tells the staff member (SMS and email) where they have been transferred to, and from when. */
async function notifyTransfer(transferId: number, staffNo: number, fromUnit: number | null, toUnit: number, date: string, designation: string | null) {
  const [person, names] = await Promise.all([
    staffContact(staffNo),
    rows<{ id: number; longName: string }>('SELECT id, long_name FROM unit WHERE id IN (?)', [[fromUnit ?? 0, toUnit]]),
  ])
  if (!person) return
  const unitName = (id: number | null) => names.find((u) => u.id === id)?.longName ?? null
  const msg = transferEffected({ salute: salutation(person), fromUnit: unitName(fromUnit), toUnit: unitName(toUnit) ?? 'your new unit', date, designation })
  notifyLater({ kind: 'transfer', key: `transfer:${transferId}`, staffNo, entityId: transferId, name: salutation(person), phone: person.phone, email: person.uccMail || person.email, ...msg })
}
