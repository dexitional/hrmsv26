// Leave (legacy leave_* tables; applications live in `leave_dump`).
//   GET  /api/leave/records?status=&year=&type=&q=&page=   applications
//   POST /api/leave/records/:id/action                     approve | reject | end | cancel
//   GET  /api/leave/records/:id                           one application (print / edit)
//   POST /api/leave/records    PUT /api/leave/records/:id  HR applies on a staff member's behalf / edits a pending one
//   GET  /api/leave/working-days?start=&end=&staffNo=     leave days (by the staff member's category), resumption date, holidays
//   GET  /api/leave/reliever/:staffNo                      reliever status
//   POST /api/leave/reliever/remove                        clear a staff member's reliever flag
//   GET  /api/leave/statistics/:staffNo                    yearly summary + records (printable)
//   CRUD /api/leave/types | holidays | constants | entitlements | balances | deferments
//   POST /api/leave/deferments/:id/approve | /reject
import { Hono } from 'hono'
import {
  leaveApplicationSchema,
  entitlementSchema,
  holidaySchema,
  leaveActionSchema,
  leaveBalanceSchema,
  leaveConstantSchema,
  leaveDeferSchema,
  leaveTypeSchema,
  staffNoSchema,
} from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { BRIEF_COLUMNS, PLACEMENT, adjustGrantedLeaveForHoliday, countsWeekends, idList, leaveYear, nameSql, requireStaff, workingDays } from '../lib/hr'
import type { LeaveAdjustment } from '../lib/hr'
import { validate } from '../lib/validate'

const view = requirePermission('leave', 'view')
const edit = requirePermission('leave', 'edit')
const manage = requirePermission('leave', 'manage')

async function remove(table: string, id: number, what: string) {
  const result = await exec(`DELETE FROM \`${table}\` WHERE id = ?`, [id])
  if (!result.affectedRows) throw notFound(what)
}

export const leaveRoute = new Hono()
  // ------------------------------------------------------------ Records
  .get('/records', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.year) (where.push('YEAR(l.applied_date) = ?'), params.push(Number(q.year)))
    if (q.type) (where.push('l.type_id = ?'), params.push(Number(q.type)))
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR l.staff_no = ?)`), params.push(like(q.q), Number(q.q) || 0))
    const from = `FROM leave_dump l LEFT JOIN staff s ON s.staff_no = l.staff_no
      LEFT JOIN leave_type t ON t.id = l.type_id LEFT JOIN staff r ON r.staff_no = l.relieved_by
      WHERE ${where.join(' AND ')}`
    const statusWhere = q.status ? ' AND l.status = ?' : ''
    const statusParams = q.status ? [q.status] : []
    const [data, total, counts] = await Promise.all([
      rows(
        `SELECT l.id, l.staff_no, ${nameSql()} AS full_name, t.title AS type, l.type_id, l.start_date, l.end_date,
                l.resume_date, l.applied_date, l.entitlement, l.approved_days, l.status, l.relieved_by,
                ${nameSql('r')} AS reliever_name, l.head_date, l.hr_date, l.hr_remark, l.flag_resumed
           ${from}${statusWhere} ORDER BY l.applied_date DESC, l.id DESC LIMIT ? OFFSET ?`,
        [...params, ...statusParams, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${from}${statusWhere}`, [...params, ...statusParams]),
      rows(`SELECT l.status, COUNT(*) AS count ${from} GROUP BY l.status`, params),
    ])
    return c.json({ data, total, page, pageSize, counts })
  })
  .get('/years', view, async (c) =>
    c.json(
      (await rows<{ year: number }>(
        'SELECT DISTINCT YEAR(applied_date) AS year FROM leave_dump WHERE applied_date IS NOT NULL HAVING year BETWEEN 1990 AND YEAR(CURDATE()) + 1 ORDER BY year DESC',
      )).map((r) => r.year),
    ),
  )
  .get('/working-days', view, async (c) => {
    const start = c.req.query('start') ?? ''
    const end = c.req.query('end') ?? ''
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) throw new AppError('Pick both dates.', 422)
    // Senior Members' leave counts weekends; Junior and Senior Staff's does not.
    const staffNo = Number(c.req.query('staffNo'))
    const group = staffNo > 0 ? (await requireStaff(staffNo).catch(() => null))?.staffGroup : c.req.query('group')
    return c.json(await workingDays(start, end, countsWeekends(group)))
  })
  .get('/records/:id', view, async (c) => {
    const id = parseId(c.req.param('id'))
    const leave = await one(
      `SELECT l.*, t.title AS type, ${nameSql('r')} AS reliever_name, ${nameSql('h')} AS head_name, ${nameSql('a')} AS approver_name,
              u.full_name AS entered_by_name
         FROM leave_dump l LEFT JOIN leave_type t ON t.id = l.type_id
         LEFT JOIN staff r ON r.staff_no = l.relieved_by LEFT JOIN staff h ON h.staff_no = l.head_endorse
         LEFT JOIN staff a ON a.staff_no = l.hr_endorse LEFT JOIN hrms_users u ON u.id = l.entered_by
        WHERE l.id = ?`,
      [id],
    )
    if (!leave) throw notFound('Leave application')
    const staff = await one(
      `SELECT ${BRIEF_COLUMNS}, s.address, s.emergency_name, s.emergency_phone FROM staff s ${PLACEMENT} WHERE s.staff_no = ?`,
      [leave.staffNo],
    )
    const year = Number(String(leave.startDate ?? leave.appliedDate ?? '').slice(0, 4)) || new Date().getFullYear()
    const summary = staff ? await leaveYear(staff as never, year) : null
    return c.json({ ...leave, staff, summary })
  })
  .post('/records', edit, validate('json', leaveApplicationSchema), async (c) => {
    const data = c.req.valid('json')
    const me = c.get('user')
    const staff = await requireStaff(data.staffNo)
    if (data.relievedBy) await requireStaff(data.relievedBy)
    const counted = await checkApplication(data, staff, null)
    const id = await insert('leave_dump', {
      ...data,
      ...counted,
      appliedDate: new Date(),
      enteredBy: me.id,
      updatedAt: new Date(),
    })
    audit(me, 'create', 'leave', id, `Leave applied for ${staff.fullName} (${counted.approvedDays} days from ${data.startDate})`)
    return c.json({ id }, 201)
  })
  .put('/records/:id', edit, validate('json', leaveApplicationSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    const existing = await one<{ status: string; staffNo: number }>('SELECT status, staff_no FROM leave_dump WHERE id = ?', [id])
    if (!existing) throw notFound('Leave application')
    if (!['HR-PENDING', 'HEAD-PENDING'].includes(existing.status))
      throw new AppError('Only applications still pending with the head or HR can be edited.', 409)
    if (existing.staffNo !== data.staffNo) throw new AppError('An application cannot be moved to another staff member.', 422)
    const staff = await requireStaff(data.staffNo)
    if (data.relievedBy) await requireStaff(data.relievedBy)
    const counted = await checkApplication(data, staff, id)
    await update('leave_dump', id, { ...data, ...counted, updatedAt: new Date() })
    audit(c.get('user'), 'update', 'leave', id, `Edited leave application of ${staff.fullName}`)
    return c.json({ id })
  })
  .post('/records/:id/action', edit, validate('json', leaveActionSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const me = c.get('user')
    const { action, remark } = c.req.valid('json')
    const leave = await one<{ status: string; staffNo: number; relievedBy: number | null }>(
      'SELECT status, staff_no, relieved_by FROM leave_dump WHERE id = ?',
      [id],
    )
    if (!leave) throw notFound('Leave application')
    const allowed: Record<string, Array<string>> = {
      approve: ['HR-PENDING', 'HEAD-PENDING', 'STAFF-PENDING'],
      reject: ['HR-PENDING', 'HEAD-PENDING', 'STAFF-PENDING'],
      end: ['GRANTED'],
      cancel: ['HR-PENDING', 'HEAD-PENDING', 'STAFF-PENDING', 'GRANTED'],
    }
    if (!allowed[action]!.includes(leave.status)) throw new AppError(`A ${leave.status} application cannot be ${action}d.`, 409)
    const next = { approve: 'GRANTED', reject: 'HR-REJECTED', end: 'ENDED', cancel: 'CANCELLED' }[action]
    await exec('UPDATE leave_dump SET status = ?, hr_remark = COALESCE(?, hr_remark), hr_date = CURDATE() WHERE id = ?', [
      next,
      remark,
      id,
    ])
    // The applicant is on leave while it is granted; their reliever on relief duty.
    if (next === 'GRANTED') {
      await exec('UPDATE staff SET flag_leave = 1 WHERE staff_no = ?', [leave.staffNo])
      if (leave.relievedBy) await exec('UPDATE staff SET flag_leave = 2 WHERE staff_no = ?', [leave.relievedBy])
    } else if (leave.status === 'GRANTED') {
      await exec('UPDATE staff SET flag_leave = 0 WHERE staff_no = ?', [leave.staffNo])
      if (leave.relievedBy) await exec('UPDATE staff SET flag_leave = 0 WHERE staff_no = ? AND flag_leave = 2', [leave.relievedBy])
    }
    audit(me, 'update', 'leave', id, `Leave #${id} of staff ${leave.staffNo}: ${leave.status} → ${next}`)
    return c.json({ ok: true, status: next })
  })

  // ------------------------------------------------------------ Reliever
  .get('/reliever/:staffNo', view, async (c) => {
    const staff = await requireStaff(Number(c.req.param('staffNo')))
    const flagLeave = await scalar('SELECT flag_leave FROM staff WHERE staff_no = ?', [staff.staffNo])
    const relieving = await rows(
      `SELECT l.id, l.staff_no, ${nameSql()} AS full_name, l.start_date, l.end_date, l.status
         FROM leave_dump l LEFT JOIN staff s ON s.staff_no = l.staff_no
        WHERE l.relieved_by = ? AND l.status IN ('GRANTED', 'HR-PENDING', 'HEAD-PENDING') ORDER BY l.start_date DESC`,
      [staff.staffNo],
    )
    return c.json({ staff, flagLeave: flagLeave === null ? null : Number(flagLeave), relieving })
  })
  .post('/reliever/remove', edit, validate('json', staffNoSchema), async (c) => {
    const { staffNo } = c.req.valid('json')
    const staff = await requireStaff(staffNo)
    await exec('UPDATE staff SET flag_leave = 0 WHERE staff_no = ?', [staffNo])
    audit(c.get('user'), 'update', 'leave', staffNo, `Removed reliever status of ${staff.fullName} (${staffNo})`)
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Statistics
  .get('/statistics/:staffNo', view, async (c) => {
    const staff = await requireStaff(Number(c.req.param('staffNo')))
    const records = await rows(
      `SELECT l.id, t.title AS type, l.type_id, l.start_date, l.end_date, l.resume_date, l.applied_date,
              l.entitlement, l.approved_days, l.status, ${nameSql('r')} AS reliever_name
         FROM leave_dump l LEFT JOIN leave_type t ON t.id = l.type_id LEFT JOIN staff r ON r.staff_no = l.relieved_by
        WHERE l.staff_no = ? ORDER BY l.start_date DESC`,
      [staff.staffNo],
    )
    const thisYear = new Date().getFullYear()
    const years = [
      ...new Set([thisYear, ...records.map((r) => Number(String(r.startDate ?? '').slice(0, 4))).filter(Boolean)]),
    ]
      .sort((a, b) => b - a)
      .slice(0, 8)
    const summary = await Promise.all(years.map((y) => leaveYear(staff, y)))
    const [balances, deferments] = await Promise.all([
      rows('SELECT * FROM leave_balance WHERE staff_no = ? ORDER BY year DESC', [staff.staffNo]),
      rows('SELECT * FROM leave_defer WHERE staff_no = ? ORDER BY year DESC', [staff.staffNo]),
    ])
    return c.json({ staff, summary, records, balances, deferments })
  })

  // ------------------------------------------------------------ Types
  .get('/types', view, async (c) =>
    c.json(
      await rows(
        `SELECT t.id, t.title, t.desc, t.active,
                (SELECT COUNT(*) FROM leave_dump l WHERE l.type_id = t.id) AS applications,
                (SELECT COUNT(*) FROM leave_dump l WHERE l.type_id = t.id AND l.status = 'GRANTED') AS on_leave
           FROM leave_type t ORDER BY t.title`,
      ),
    ),
  )
  .post('/types', edit, validate('json', leaveTypeSchema), async (c) => {
    const data = c.req.valid('json')
    const id = await insert('leave_type', { ...data, title: data.title.toUpperCase(), active: data.active ? 1 : 0 })
    audit(c.get('user'), 'create', 'leave_type', id, `Added leave type ${data.title}`)
    return c.json({ id }, 201)
  })
  .put('/types/:id', edit, validate('json', leaveTypeSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await update('leave_type', id, { ...data, title: data.title.toUpperCase(), active: data.active ? 1 : 0 })))
      throw notFound('Leave type')
    audit(c.get('user'), 'update', 'leave_type', id, `Updated leave type ${data.title}`)
    return c.json({ id })
  })
  .delete('/types/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    if (Number(await scalar('SELECT COUNT(*) FROM leave_dump WHERE type_id = ?', [id])))
      throw new AppError('Leave has been taken under this type. Deactivate it instead.', 409)
    await remove('leave_type', id, 'Leave type')
    audit(c.get('user'), 'delete', 'leave_type', id, 'Deleted leave type')
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Holidays
  .get('/holidays', view, async (c) => {
    const year = c.req.query('year')
    return c.json(
      await rows(
        `SELECT id, holiday, \`desc\`, year, category, active FROM leave_exclude
          ${year ? 'WHERE year = ?' : ''} ORDER BY holiday DESC`,
        year ? [Number(year)] : [],
      ),
    )
  })
  .post('/holidays', edit, validate('json', holidaySchema), async (c) => {
    const data = c.req.valid('json')
    const id = await insert('leave_exclude', { ...data, year: Number(data.holiday.slice(0, 4)), active: data.active ? 1 : 0 })
    const adjusted = data.active ? await adjustGrantedLeaveForHoliday(data.holiday, 'added') : []
    audit(c.get('user'), 'create', 'holiday', id, `Added holiday ${data.desc} (${data.holiday})${adjustedNote(adjusted)}`)
    logAdjustments(c.get('user'), adjusted, data.desc)
    return c.json({ id, adjusted }, 201)
  })
  .put('/holidays/:id', edit, validate('json', holidaySchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    const before = await one<{ holiday: string; active: number }>('SELECT holiday, active FROM leave_exclude WHERE id = ?', [id])
    if (!before) throw notFound('Holiday')
    await update('leave_exclude', id, { ...data, year: Number(data.holiday.slice(0, 4)), active: data.active ? 1 : 0 })
    // A moved or (de)activated holiday: take the old day back, then give the new one.
    const adjusted: Array<LeaveAdjustment> = []
    const wasOn = Boolean(Number(before.active))
    if (wasOn && (!data.active || before.holiday !== data.holiday)) adjusted.push(...(await adjustGrantedLeaveForHoliday(before.holiday, 'removed')))
    if (data.active && (!wasOn || before.holiday !== data.holiday)) adjusted.push(...(await adjustGrantedLeaveForHoliday(data.holiday, 'added')))
    audit(c.get('user'), 'update', 'holiday', id, `Updated holiday ${data.desc}${adjustedNote(adjusted)}`)
    logAdjustments(c.get('user'), adjusted, data.desc)
    return c.json({ id, adjusted })
  })
  .delete('/holidays/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const before = await one<{ holiday: string; active: number; desc: string }>('SELECT holiday, active, `desc` FROM leave_exclude WHERE id = ?', [id])
    if (!before) throw notFound('Holiday')
    await remove('leave_exclude', id, 'Holiday')
    const adjusted = Number(before.active) ? await adjustGrantedLeaveForHoliday(before.holiday, 'removed') : []
    audit(c.get('user'), 'delete', 'holiday', id, `Deleted holiday ${before.desc} (${before.holiday})${adjustedNote(adjusted)}`)
    logAdjustments(c.get('user'), adjusted, before.desc)
    return c.json({ ok: true, adjusted })
  })

  // ------------------------------------------------------------ Constants
  .get('/constants', view, async (c) => {
    const list = await rows(
      'SELECT id, weight, type, category, exclusion, year, `desc`, active FROM leave_constant ORDER BY year DESC, id DESC',
    )
    return c.json(list.map((r) => ({ ...r, exclusion: idList(r.exclusion) })))
  })
  .post('/constants', edit, validate('json', leaveConstantSchema), async (c) => {
    const data = c.req.valid('json')
    const id = await insert('leave_constant', {
      ...data,
      exclusion: data.exclusion.length ? data.exclusion.join(',') : null,
      active: data.active ? 1 : 0,
    })
    audit(c.get('user'), 'create', 'leave_constant', id, `${data.type === 'ADD' ? 'Added' : 'Deducted'} ${data.weight} days for ${data.category ?? 'all staff'} in ${data.year}`)
    return c.json({ id }, 201)
  })
  .put('/constants/:id', edit, validate('json', leaveConstantSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    const changed = await update('leave_constant', id, {
      ...data,
      exclusion: data.exclusion.length ? data.exclusion.join(',') : null,
      active: data.active ? 1 : 0,
    })
    if (!changed) throw notFound('Leave constant')
    audit(c.get('user'), 'update', 'leave_constant', id, `Updated leave constant: ${data.desc}`)
    return c.json({ id })
  })
  .delete('/constants/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    await remove('leave_constant', id, 'Leave constant')
    audit(c.get('user'), 'delete', 'leave_constant', id, 'Deleted leave constant')
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Entitlements
  .get('/entitlements', view, async (c) => {
    const list = await rows(
      'SELECT w.id, w.type_id, t.title AS type, w.`group`, w.jobs, w.weight FROM leave_weight w LEFT JOIN leave_type t ON t.id = w.type_id ORDER BY t.title, FIELD(w.`group`, "SM", "SS", "JS"), w.id',
    )
    return c.json(list.map((r) => ({ ...r, jobs: idList(r.jobs) })))
  })
  .post('/entitlements', edit, validate('json', entitlementSchema), async (c) => {
    const data = c.req.valid('json')
    const id = await insert('leave_weight', { ...data, jobs: data.jobs.length ? data.jobs.join(',') : null })
    audit(c.get('user'), 'create', 'leave_weight', id, `Entitlement of ${data.weight} days for ${data.group}`)
    return c.json({ id }, 201)
  })
  .put('/entitlements/:id', edit, validate('json', entitlementSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await update('leave_weight', id, { ...data, jobs: data.jobs.length ? data.jobs.join(',') : null })))
      throw notFound('Entitlement')
    audit(c.get('user'), 'update', 'leave_weight', id, `Entitlement set to ${data.weight} days for ${data.group}`)
    return c.json({ id })
  })
  .delete('/entitlements/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    await remove('leave_weight', id, 'Entitlement')
    audit(c.get('user'), 'delete', 'leave_weight', id, 'Deleted leave entitlement')
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Balances
  .get('/balances', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.year) (where.push('b.year = ?'), params.push(Number(q.year)))
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR b.staff_no = ?)`), params.push(like(q.q), Number(q.q) || 0))
    const from = `FROM leave_balance b LEFT JOIN staff s ON s.staff_no = b.staff_no WHERE ${where.join(' AND ')}`
    const [data, total] = await Promise.all([
      rows(`SELECT b.*, ${nameSql()} AS full_name ${from} ORDER BY b.year DESC, b.id DESC LIMIT ? OFFSET ?`, [
        ...params,
        limit,
        offset,
      ]),
      scalar(`SELECT COUNT(*) ${from}`, params),
    ])
    return c.json({ data, total, page, pageSize })
  })
  .post('/balances', edit, validate('json', leaveBalanceSchema), async (c) => {
    const data = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    const id = await insert('leave_balance', { ...data, flagUsed: '0', active: data.active ? '1' : '0' })
    audit(c.get('user'), 'create', 'leave_balance', id, `Granted ${data.weight} extra days (${data.year}) to ${staff.fullName}`)
    return c.json({ id }, 201)
  })
  .put('/balances/:id', edit, validate('json', leaveBalanceSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    await requireStaff(data.staffNo)
    if (!(await update('leave_balance', id, { ...data, active: data.active ? '1' : '0' }))) throw notFound('Balance')
    audit(c.get('user'), 'update', 'leave_balance', id, `Leave balance of ${data.staffNo} set to ${data.weight} days (${data.year})`)
    return c.json({ id })
  })
  .delete('/balances/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    await remove('leave_balance', id, 'Balance')
    audit(c.get('user'), 'delete', 'leave_balance', id, 'Deleted leave balance')
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Deferments
  .get('/deferments', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ["d.active = '1'"]
    const params: Array<unknown> = []
    if (q.year) (where.push('d.year = ?'), params.push(Number(q.year)))
    if (q.status) (where.push('d.approved_status = ?'), params.push(Number(q.status)))
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR d.staff_no = ?)`), params.push(like(q.q), Number(q.q) || 0))
    const from = `FROM leave_defer d LEFT JOIN staff s ON s.staff_no = d.staff_no LEFT JOIN staff a ON a.staff_no = d.approved_by
      WHERE ${where.join(' AND ')}`
    const [data, total, counts] = await Promise.all([
      rows(
        `SELECT d.*, ${nameSql()} AS full_name, ${nameSql('a')} AS approver_name ${from}
          ORDER BY d.approved_status = 0 DESC, d.year DESC, d.id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${from}`, params),
      rows("SELECT approved_status AS status, COUNT(*) AS count FROM leave_defer WHERE active = '1' GROUP BY approved_status"),
    ])
    return c.json({ data, total, page, pageSize, counts: counts.map((r) => ({ ...r, status: String(r.status) })) })
  })
  .post('/deferments', edit, validate('json', leaveDeferSchema), async (c) => {
    const data = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    const id = await insert('leave_defer', { ...data, active: '1', approvedStatus: 0 })
    audit(c.get('user'), 'create', 'leave_defer', id, `Deferment of ${data.weight} days (${data.year}) for ${staff.fullName}`)
    return c.json({ id }, 201)
  })
  .put('/deferments/:id', edit, validate('json', leaveDeferSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    await requireStaff(data.staffNo)
    if (!(await update('leave_defer', id, data))) throw notFound('Deferment')
    audit(c.get('user'), 'update', 'leave_defer', id, `Updated deferment for ${data.staffNo}`)
    return c.json({ id })
  })
  .post('/deferments/:id/:decision{approve|reject}', edit, async (c) => {
    const id = parseId(c.req.param('id'))
    const approve = c.req.param('decision') === 'approve'
    const me = c.get('user')
    const result = await exec('UPDATE leave_defer SET approved_status = ?, approved_by = ? WHERE id = ?', [
      approve ? 1 : 2,
      me.staffNo ?? 0,
      id,
    ])
    if (!result.affectedRows) throw notFound('Deferment')
    audit(me, 'update', 'leave_defer', id, `${approve ? 'Approved' : 'Rejected'} leave deferment`)
    return c.json({ ok: true })
  })
  .delete('/deferments/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const result = await exec("UPDATE leave_defer SET active = '0' WHERE id = ?", [id])
    if (!result.affectedRows) throw notFound('Deferment')
    audit(c.get('user'), 'delete', 'leave_defer', id, 'Removed leave deferment')
    return c.json({ ok: true })
  })

/**
 * Counts the working days of an application and checks it: no overlap with
 * the staff member's other open or granted leave, and annual leave within
 * what remains for the year. Returns the counted columns to store.
 */
export async function checkApplication(
  data: { staffNo: number; typeId: number; startDate: string; endDate: string },
  staff: Awaited<ReturnType<typeof requireStaff>>,
  ignoreId: number | null,
) {
  const { days, resumeDate } = await workingDays(data.startDate, data.endDate, countsWeekends(staff.staffGroup))
  if (days < 1) throw new AppError('The period has no leave days to count.', 422)
  const overlap = await one<{ id: number; startDate: string; endDate: string }>(
    `SELECT id, start_date, end_date FROM leave_dump
      WHERE staff_no = ? AND id <> ? AND status IN ('STAFF-PENDING', 'HEAD-PENDING', 'HR-PENDING', 'GRANTED')
        AND start_date <= ? AND end_date >= ? LIMIT 1`,
    [data.staffNo, ignoreId ?? 0, data.endDate, data.startDate],
  )
  if (overlap) throw new AppError(`This overlaps leave #${overlap.id} (${overlap.startDate} to ${overlap.endDate}).`, 409)
  const year = Number(data.startDate.slice(0, 4))
  let entitlement: number
  if (data.typeId === ANNUAL_TYPE) {
    const summary = await leaveYear(staff, year)
    // An application being edited no longer counts against itself.
    const own = ignoreId
      ? Number((await scalar("SELECT approved_days FROM leave_dump WHERE id = ? AND status = 'GRANTED'", [ignoreId])) ?? 0)
      : 0
    entitlement = summary.remaining + own
    if (days > entitlement) throw new AppError(`Only ${entitlement} days of annual leave remain for ${year}; this period has ${days}.`, 422)
  } else {
    entitlement = Number(
      (await scalar('SELECT weight FROM leave_weight WHERE type_id = ? AND `group` = ? ORDER BY jobs IS NULL, id LIMIT 1', [
        data.typeId,
        staff.staffGroup,
      ])) ?? days,
    )
  }
  return { approvedDays: days, entitlement, resumeDate }
}

export const ANNUAL_TYPE = 2

const adjustedNote = (a: Array<LeaveAdjustment>) => (a.length ? `; ${a.length} granted leave${a.length === 1 ? '' : 's'} re-dated` : '')

/** One activity-log line per leave whose dates a holiday change moved. */
function logAdjustments(user: Parameters<typeof audit>[0], adjusted: Array<LeaveAdjustment>, holiday: string) {
  for (const a of adjusted) {
    audit(
      user,
      'update',
      'leave',
      a.id,
      `${holiday}: leave of ${a.fullName} (${a.staffNo}) now ends ${a.to.endDate} (was ${a.from.endDate}), resumes ${a.to.resumeDate ?? '—'}`,
    )
  }
}
