// Study leave.
//
// Intentions to study (study_intention) are filled in on the staff portal and
// approved stage by stage (head of unit → dean/director → provost → HR); each
// decision is logged in tndstudy_activities. HR records the final decision,
// and an approved intention can be turned into a study leave grant
// (study_leave). Staff may also submit study leave requests (study_request).
//
//   GET  /api/study/intentions?stage=&q=&page=      GET /api/study/intentions/:id
//   POST /api/study/intentions/:id/decide            approve | decline at the current stage
//   PUT  /api/study/intentions/:id                   HR edits the form on the staff member's behalf
//   DELETE /api/study/intentions/:id                 removes the application and its approval trail
//   GET  /api/study/leaves?status=&q=&page=          CRUD /api/study/leaves[/:id]
//   GET  /api/study/requests?status=&q=&page=        POST /api/study/requests/:id/decide
//   CRUD /api/study/benefits
import { Hono } from 'hono'
import { STUDY_STAGES } from '@hrms/db'
import { requestDecisionSchema, studyBenefitSchema, studyDecisionSchema, studyIntentionSchema, studyLeaveSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update, withTransaction } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { BRIEF_COLUMNS, PLACEMENT, idList, nameSql, requireStaff } from '../lib/hr'
import { validate } from '../lib/validate'

const view = requirePermission('study', 'view')
const edit = requirePermission('study', 'edit')
const manage = requirePermission('study', 'manage')

export const STUDY_ALERT_DAYS = 60

/** The Directorate of Human Resource, recorded as the unit acting on HR decisions. */
async function hrUnitId() {
  return Number(
    (await scalar("SELECT id FROM unit WHERE long_name LIKE 'DIRECTORATE OF HUMAN RESOURCE%' ORDER BY id LIMIT 1")) ?? 0,
  )
}

const INTENTION_COLUMNS = `i.id, i.staff_no, ${nameSql()} AS full_name, i.college, i.department, i.present_rank, i.high_edu,
  i.study_leave, i.int_prog, i.study_place, NULLIF(i.date_commence, '0000-00-00') AS date_commence, i.prog_duration,
  i.prog_type, i.study_mode, i.other_study_mode, i.sponsor_kind, i.other_scholarship, i.prog_relevance, i.estimated_fees,
  NULLIF(i.sub_date, '0000-00-00') AS sub_date, i.appstatus, i.stage_status, i.remarks, i.remark_reason, i.activity_date,
  u.long_name AS unit_name, j.title AS job_title,
  (SELECT sl.id FROM study_leave sl WHERE sl.intention_id = i.id LIMIT 1) AS leave_id`

/** The answers on the intention form that HR may edit for the staff member, with how the activity log names them. */
const INTENTION_LABELS: Record<string, string> = {
  college: 'college',
  department: 'department',
  present_rank: 'present rank',
  high_edu: 'highest qualification',
  study_leave: 'previous study leave',
  int_prog: 'programme',
  study_place: 'place of study',
  date_commence: 'commencement date',
  prog_duration: 'duration',
  prog_type: 'programme type',
  study_mode: 'mode of study',
  other_study_mode: 'other mode of study',
  sponsor_kind: 'sponsorship',
  other_scholarship: 'other scholarship',
  estimated_fees: 'estimated fees',
  prog_relevance: 'relevance',
  sub_date: 'date signed',
}
const INTENTION_FORM = Object.keys(INTENTION_LABELS)

const LEAVE_COLUMNS = `l.*, ${nameSql()} AS full_name, u.long_name AS unit_name, j.title AS job_title,
  DATEDIFF(l.study_end, CURDATE()) AS days_to_end, DATEDIFF(l.study_bond_end, CURDATE()) AS bond_days_left`

const LEAVE_STATUS: Record<string, string> = {
  on_leave: "l.status = 'ON_LEAVE'",
  ending: `l.status IN ('ON_LEAVE', 'EXTENDED') AND l.study_end BETWEEN CURDATE() AND CURDATE() + INTERVAL ${STUDY_ALERT_DAYS} DAY`,
  overdue: "l.status IN ('ON_LEAVE', 'EXTENDED') AND l.study_end < CURDATE()",
  bonded: "l.status = 'RESUMED' AND l.study_bond_end >= CURDATE()",
  resumed: "l.status = 'RESUMED'",
}

/**
 * The legacy columns study_gurantor_1, study_supervisor_2… have an underscore
 * before the digit, which the camelCase → snake_case mapping would drop.
 */
const digitKeys = (row: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/(\D)(\d)$/, '$1_$2'), v]))

function leaveColumns(data: ReturnType<typeof studyLeaveSchema.parse>) {
  return digitKeys({ ...data, studyBenefits: data.studyBenefits.join(',') || null })
}

export const studyRoute = new Hono()
  // ------------------------------------------------------------ Intentions
  .get('/intentions', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['i.appstatus <> 0']
    const params: Array<unknown> = []
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR i.staff_no = ? OR i.int_prog LIKE ? OR i.study_place LIKE ?)`), params.push(like(q.q), q.q, like(q.q), like(q.q)))
    if (q.year) (where.push('YEAR(i.date_commence) = ?'), params.push(Number(q.year)))
    const from = `FROM study_intention i LEFT JOIN staff s ON s.staff_no = i.staff_no ${PLACEMENT} WHERE ${where.join(' AND ')}`
    const stageWhere =
      q.stage === 'declined' ? ' AND (i.stage_status = 2 OR i.appstatus = 6)' : q.stage ? ' AND i.appstatus = ? AND i.stage_status <> 2' : ''
    const stageParams = q.stage && q.stage !== 'declined' ? [Number(q.stage)] : []
    const [data, total, counts, declined] = await Promise.all([
      rows(`SELECT ${INTENTION_COLUMNS} ${from}${stageWhere} ORDER BY i.activity_date DESC, i.id DESC LIMIT ? OFFSET ?`, [
        ...params,
        ...stageParams,
        limit,
        offset,
      ]),
      scalar(`SELECT COUNT(*) ${from}${stageWhere}`, [...params, ...stageParams]),
      rows(`SELECT i.appstatus AS status, COUNT(*) AS count ${from} AND i.stage_status <> 2 GROUP BY i.appstatus`, params),
      scalar(`SELECT COUNT(*) ${from} AND (i.stage_status = 2 OR i.appstatus = 6)`, params),
    ])
    return c.json({
      data,
      total,
      page,
      pageSize,
      counts: [...counts.map((r) => ({ status: String(r.status), count: Number(r.count) })), { status: 'declined', count: Number(declined) }],
    })
  })
  .get('/intentions/:id', view, async (c) => {
    const id = parseId(c.req.param('id'))
    const intention = await one(`SELECT ${INTENTION_COLUMNS} FROM study_intention i LEFT JOIN staff s ON s.staff_no = i.staff_no ${PLACEMENT} WHERE i.id = ?`, [id])
    if (!intention) throw notFound('Application')
    const [staff, activities] = await Promise.all([
      one(`SELECT ${BRIEF_COLUMNS} FROM staff s ${PLACEMENT} WHERE s.staff_no = ?`, [intention.staffNo]),
      rows(
        `SELECT a.id, a.stage_activity, a.comments, a.promo_status, a.activity, a.activity_date, a.user_id,
                ${nameSql()} AS user_name, u.long_name AS unit_name
           FROM tndstudy_activities a LEFT JOIN staff s ON s.staff_no = a.user_id LEFT JOIN unit u ON u.id = a.unit_id
          WHERE a.studyform_id = ? ORDER BY a.activity_date, a.id`,
        [id],
      ),
    ])
    return c.json({ ...intention, stageLabel: STUDY_STAGES[intention.appstatus], staff, activities })
  })
  .post('/intentions/:id/decide', edit, validate('json', studyDecisionSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const me = c.get('user')
    const { decision, comments } = c.req.valid('json')
    const app = await one<{ appstatus: number; stageStatus: number; staffNo: string }>(
      'SELECT appstatus, stage_status, staff_no FROM study_intention WHERE id = ?',
      [id],
    )
    if (!app) throw notFound('Application')
    if (app.appstatus < 1 || app.appstatus > 4 || app.stageStatus === 2)
      throw new AppError(`This application is ${STUDY_STAGES[app.appstatus]?.toLowerCase() ?? 'closed'}; it cannot be decided on.`, 409)
    const approve = decision === 'approve'
    // HR may act at any stage; approving at HR (4) is the final approval.
    const next = approve ? (app.appstatus === 4 ? 5 : app.appstatus + 1) : app.appstatus === 4 ? 6 : app.appstatus
    await exec('UPDATE study_intention SET appstatus = ?, stage_status = ?, remarks = ?, remark_reason = ? WHERE id = ?', [
      next,
      approve ? 1 : 2,
      approve ? (next === 5 ? 'APPROVED' : 'RECOMMENDED') : 'DECLINED',
      comments,
      id,
    ])
    await insert('tndstudy_activities', {
      unitId: String(await hrUnitId()),
      userId: String(me.staffNo ?? me.id),
      studyformId: id,
      stageActivity: approve ? 'Approved' : 'Disapproved',
      comments: `${comments} — ${me.fullName} (HR)`,
      promoStatus: approve ? next : app.appstatus,
      activity: approve ? '1' : '2',
    })
    audit(me, 'update', 'study', id, `${approve ? 'Approved' : 'Declined'} intention to study of staff ${app.staffNo} (${STUDY_STAGES[next]})`)
    return c.json({ ok: true, appstatus: next })
  })

  .put('/intentions/:id', edit, validate('json', studyIntentionSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const me = c.get('user')
    const d = c.req.valid('json')
    const before = await one<Record<string, unknown>>(`SELECT ${INTENTION_FORM.join(', ')}, staff_no FROM study_intention WHERE id = ?`, [id])
    if (!before) throw notFound('Application')
    const values: Record<string, unknown> = {
      college: d.college,
      department: d.department,
      present_rank: d.presentRank,
      high_edu: d.highEdu,
      study_leave: d.studyLeave,
      int_prog: d.intProg,
      study_place: d.studyPlace,
      date_commence: d.dateCommence,
      prog_duration: d.progDuration,
      prog_type: d.progType,
      study_mode: d.studyMode,
      other_study_mode: d.studyMode === 'OTHERS' ? d.otherStudyMode : null,
      sponsor_kind: d.sponsorKind,
      other_scholarship: d.otherScholarship,
      estimated_fees: d.estimatedFees,
      prog_relevance: d.progRelevance,
      sub_date: d.subDate,
    }
    // Which answers changed, for the activity log (camel-cased keys from the row mapper).
    const camel = (k: string) => k.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase())
    const norm = (v: unknown) => (v == null || v === '' || v === '0000-00-00' ? '' : String(v).trim())
    const changed = INTENTION_FORM.filter((k) => norm(before[camel(k)]) !== norm(values[k]))
    if (!changed.length) return c.json({ ok: true, changed: 0 })
    await exec(`UPDATE study_intention SET ${INTENTION_FORM.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, [...INTENTION_FORM.map((k) => values[k]), id])
    audit(me, 'update', 'study', id, `Edited the intention to study of staff ${before.staffNo} on their behalf: ${changed.map((k) => INTENTION_LABELS[k]).join(', ')}`)
    return c.json({ ok: true, changed: changed.length })
  })
  .delete('/intentions/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const me = c.get('user')
    const app = await one<{ staffNo: string; intProg: string | null }>('SELECT staff_no, int_prog FROM study_intention WHERE id = ?', [id])
    if (!app) throw notFound('Application')
    const leave = await scalar('SELECT id FROM study_leave WHERE intention_id = ? LIMIT 1', [id])
    if (leave) throw new AppError(`Study leave #${leave} was granted from this application. Delete that study leave record first.`, 409)
    const trail = await withTransaction(async (conn) => {
      const a = await exec('DELETE FROM tndstudy_activities WHERE studyform_id = ?', [id], conn)
      await exec('DELETE FROM study_intention WHERE id = ?', [id], conn)
      return a.affectedRows
    })
    audit(me, 'delete', 'study', id, `Deleted the intention to study of staff ${app.staffNo}${app.intProg ? ` (${String(app.intProg).slice(0, 80)})` : ''} and ${trail} approval record${trail === 1 ? '' : 's'}`)
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Study leave grants
  .get('/leaves', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR l.staff_no = ? OR l.study_program LIKE ? OR l.study_institute LIKE ?)`), params.push(like(q.q), Number(q.q) || 0, like(q.q), like(q.q)))
    const base = `FROM study_leave l LEFT JOIN staff s ON s.staff_no = l.staff_no ${PLACEMENT} WHERE ${where.join(' AND ')}`
    const sw = q.status && LEAVE_STATUS[q.status] ? ` AND ${LEAVE_STATUS[q.status]}` : ''
    const [data, total, counts] = await Promise.all([
      rows(`SELECT ${LEAVE_COLUMNS} ${base}${sw} ORDER BY l.study_start DESC, l.id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
      scalar(`SELECT COUNT(*) ${base}${sw}`, params),
      rows(`SELECT ${Object.entries(LEAVE_STATUS).map(([k, sql]) => `SUM(${sql}) AS \`${k}\``).join(', ')} FROM study_leave l`),
    ])
    const c0 = counts[0] ?? {}
    return c.json({ data, total, page, pageSize, counts: Object.keys(LEAVE_STATUS).map((status) => ({ status, count: Number(c0[status] ?? 0) })) })
  })
  .get('/leaves/:id', view, async (c) => {
    const id = parseId(c.req.param('id'))
    const leave = await one(`SELECT ${LEAVE_COLUMNS} FROM study_leave l LEFT JOIN staff s ON s.staff_no = l.staff_no ${PLACEMENT} WHERE l.id = ?`, [id])
    if (!leave) throw notFound('Study leave')
    const people = idList([leave.studyGurantor1, leave.studyGurantor2, leave.studySupervisor1, leave.studySupervisor2].filter(Boolean).join(','))
    const [names, benefits] = await Promise.all([
      people.length ? rows(`SELECT s.staff_no, ${nameSql()} AS full_name FROM staff s WHERE s.staff_no IN (?)`, [people]) : [],
      rows('SELECT id, title FROM study_benefit'),
    ])
    const nameOf = Object.fromEntries(names.map((n) => [n.staffNo, n.fullName]))
    const ids = idList(leave.studyBenefits)
    return c.json({
      ...leave,
      studyBenefits: ids,
      benefitTitles: benefits.filter((b) => ids.includes(b.id)).map((b) => b.title),
      names: nameOf,
    })
  })
  .post('/leaves', edit, validate('json', studyLeaveSchema), async (c) => {
    const data = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    const id = await insert('study_leave', { ...leaveColumns(data), promoId: staff.promoId, createdAt: new Date() })
    if (data.intentionId) await exec('UPDATE study_intention SET appstatus = 5, stage_status = 1 WHERE id = ? AND appstatus IN (4, 5)', [data.intentionId])
    audit(c.get('user'), 'create', 'study', id, `Study leave granted to ${staff.fullName}: ${data.studyProgram}`)
    return c.json({ id }, 201)
  })
  .put('/leaves/:id', edit, validate('json', studyLeaveSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    const staff = await requireStaff(data.staffNo)
    if (!(await one('SELECT id FROM study_leave WHERE id = ?', [id]))) throw notFound('Study leave')
    await update('study_leave', id, leaveColumns(data))
    audit(c.get('user'), 'update', 'study', id, `Updated study leave of ${staff.fullName}`)
    return c.json({ id })
  })
  .delete('/leaves/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const result = await exec('DELETE FROM study_leave WHERE id = ?', [id])
    if (!result.affectedRows) throw notFound('Study leave')
    audit(c.get('user'), 'delete', 'study', id, `Deleted study leave #${id}`)
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Requests from staff
  .get('/requests', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR r.staff_no = ?)`), params.push(like(q.q), Number(q.q) || 0))
    const base = `FROM study_request r LEFT JOIN staff s ON s.staff_no = r.staff_no ${PLACEMENT} WHERE ${where.join(' AND ')}`
    const sw = q.status ? ' AND r.apply_status = ?' : ''
    const sp = q.status ? [q.status] : []
    const [data, total, counts] = await Promise.all([
      rows(`SELECT r.*, ${nameSql()} AS full_name, u.long_name AS unit_name, j.title AS job_title ${base}${sw}
             ORDER BY r.apply_status = 'PENDING' DESC, r.apply_date DESC LIMIT ? OFFSET ?`, [...params, ...sp, limit, offset]),
      scalar(`SELECT COUNT(*) ${base}${sw}`, [...params, ...sp]),
      rows(`SELECT r.apply_status AS status, COUNT(*) AS count ${base} GROUP BY r.apply_status`, params),
    ])
    return c.json({ data, total, page, pageSize, counts })
  })
  .post('/requests/:id/decide', edit, validate('json', requestDecisionSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { decision, remark } = c.req.valid('json')
    const req = await one<Record<string, any>>('SELECT * FROM study_request WHERE id = ?', [id])
    if (!req) throw notFound('Study leave request')
    if (req.applyStatus !== 'PENDING') throw new AppError('This request has already been decided.', 409)
    if (decision === 'reject') {
      await exec("UPDATE study_request SET apply_status = 'REJECTED' WHERE id = ?", [id])
      audit(c.get('user'), 'update', 'study', id, `Rejected study leave request of staff ${req.staffNo}`)
      return c.json({ ok: true })
    }
    // Approving grants the study leave with the details the staff member gave.
    const leaveId = await insert('study_leave', digitKeys({
      staffNo: req.staffNo,
      promoId: req.promoId,
      studyType: req.studyType,
      studyNature: req.studyNature,
      studyNatureOther: req.studyNatureOther,
      studyProgram: req.studyProgram,
      studyInstitute: req.studyInstitute,
      studyCountry: req.studyCountry,
      studyStart: req.studyStart,
      studyEnd: req.studyEnd,
      studyPeriod: req.studyPeriod,
      studyBenefits: req.studyBenefits,
      studyBenefitOther: req.studyBenefitOther,
      studyGurantor1: req.studyGurantor1,
      studyGurantor2: req.studyGurantor2,
      studySupervisor1: req.studySupervisor1,
      studySupervisor2: req.studySupervisor2,
      studyReferName: req.studyReferName,
      studyReferRelation: req.studyReferRelation,
      studyReferAddress: req.studyReferAddress,
      studyReferPhone: req.studyReferPhone,
      studyReferEmail: req.studyReferEmail,
      requestId: id,
      status: 'ON_LEAVE',
      remark,
      createdAt: new Date(),
    }))
    await exec("UPDATE study_request SET apply_status = 'APPROVED' WHERE id = ?", [id])
    audit(c.get('user'), 'update', 'study', id, `Approved study leave request of staff ${req.staffNo}`)
    return c.json({ ok: true, leaveId })
  })

  // ------------------------------------------------------------ Benefits
  .get('/benefits', view, async (c) =>
    c.json(
      await rows(
        `SELECT b.id, b.title,
                (SELECT COUNT(*) FROM study_leave l WHERE FIND_IN_SET(b.id, l.study_benefits)) AS used
           FROM study_benefit b ORDER BY b.title`,
      ),
    ),
  )
  .post('/benefits', edit, validate('json', studyBenefitSchema), async (c) => {
    const data = c.req.valid('json')
    const id = await insert('study_benefit', data)
    audit(c.get('user'), 'create', 'study', id, `Added study benefit ${data.title}`)
    return c.json({ id }, 201)
  })
  .put('/benefits/:id', edit, validate('json', studyBenefitSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await update('study_benefit', id, data))) throw notFound('Benefit')
    audit(c.get('user'), 'update', 'study', id, `Renamed study benefit to ${data.title}`)
    return c.json({ id })
  })
  .delete('/benefits/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    if (Number(await scalar('SELECT COUNT(*) FROM study_leave WHERE FIND_IN_SET(?, study_benefits)', [id])))
      throw new AppError('Study leave records use this benefit.', 409)
    const result = await exec('DELETE FROM study_benefit WHERE id = ?', [id])
    if (!result.affectedRows) throw notFound('Benefit')
    audit(c.get('user'), 'delete', 'study', id, 'Deleted study benefit')
    return c.json({ ok: true })
  })
