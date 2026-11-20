// Management services in the staff portal, for heads of units and named
// approvers. What each head sees is worked out in lib/portal.ts.
//
//   GET  /api/portal/manage/scope
//   GET  /api/portal/manage/staff?q=&unit=&group=&onLeave=&page=&all=1     GET /api/portal/manage/staff/:staffNo
//   GET  /api/portal/manage/staff/export?q=&unit=&group=&onLeave=   the same list as an Excel workbook
//   GET  /api/portal/manage/leave?view=pending|decided|all&page=
//   GET  /api/portal/manage/leave/:id/relievers?q=   colleagues free to cover the applicant's duties
//   POST /api/portal/manage/leave/:id/decision   { decision: approve | reject, remark, relievedBy }
//   GET  /api/portal/manage/promotions   GET /api/portal/manage/promotions/:id   GET /api/portal/manage/promotions/:id/file?path=
//   POST /api/portal/manage/promotions/:id/action   { recommend | not_recommend (signed endorsement PDF required) | return | reverse | reverse_applicant }
//   GET  /api/portal/manage/advisers?year=   POST /api/portal/manage/advisers   DELETE /api/portal/manage/advisers/:id
//   GET  /api/portal/manage/plans?year=   GET/PUT /api/portal/manage/plans/:id   POST /api/portal/manage/plans
//   GET  /api/portal/manage/procurement   GET/PUT/DELETE /api/portal/manage/procurement/:id   POST /api/portal/manage/procurement
//   GET  /api/portal/manage/study   (read-only for now)   GET /api/portal/manage/study/:id (printable)
//   GET  /api/portal/manage/appraisals?year=     GET /api/portal/manage/appraisals/:staffNo/:year
//   POST /api/portal/manage/appraisals/:staffNo/:year/form-a   POST /api/portal/manage/appraisals/self/:id/countersign
import { Hono } from 'hono'
import type { z } from 'zod'
import { STUDY_STAGES } from '@hrms/db'
import { adviserNominationSchema, operationalPlanSchema, procurementRequestSchema, countersignSchema, formASchema, leaveDecisionSchema, portalPromotionActionSchema } from '#/lib/schemas'
import type { PortalUser } from '#/server/portal-session-core'
import { SUPERVISOR_SIGNED, appraisalQuestions, formASummaries, loadFormA, loadFormB, notifyStaff, saveFormA } from '../lib/appraisal'
import { audit } from '../lib/audit'
import { ACTIONABLE_STAGES, LEVEL_NAMES, actingLevels, headAction, loadPromotion, notifyApplicant, notifyLevelHeads, promotionState, streamPromotionFile } from '../lib/promotion'
import { exec, insert, like, one, paging, parseId, rows, scalar, withTransaction } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { BRIEF_COLUMNS, PLACEMENT, activeStaffSql, leaveYear, nameSql, requireStaff } from '../lib/hr'
import { inList, leaveApprovees, requireManager, teamStaff, teamUnits } from '../lib/portal'
import { validate } from '../lib/validate'
import { loadIntention } from './study'
import { XLSX_TYPE, buildXlsx } from '../lib/xlsx'
import { GROUP_LABELS } from '#/lib/labels'

/** Promotion files a head can see: their team's, and any in a unit below them. Marks those waiting for them. */
async function visibleFiles(me: PortalUser) {
  const [team, units] = await Promise.all([teamStaff(me), teamUnits(me)])
  if (!team.length && !units.length) return []
  const where = [team.length ? inList('p.staff_no', team) : null, units.length ? inList('p.unit_id', units) : null].filter(Boolean).join(' OR ')
  const files = await rows<Record<string, any>>(
    `SELECT p.promotion_id AS id, p.staff_no, ${nameSql()} AS full_name, u.long_name AS unit_name, j.title AS applied_rank,
            p.type, p.promo_comments AS kind, p.promo_status, p.stage_status, p.returned, p.unit_id, p.submitted_at, p.activity_date
       FROM staff_promotion p JOIN staff s ON s.staff_no = p.staff_no LEFT JOIN unit u ON u.id = p.unit_id LEFT JOIN job j ON j.id = p.position_id
      WHERE p.promo_status BETWEEN 1 AND 8 AND p.staff_no <> ? AND (${where})
      ORDER BY p.promo_status, COALESCE(p.submitted_at, p.activity_date) DESC LIMIT 500`,
    [String(me.staffNo), ...team, ...units],
  )
  const acting = await actingLevels(
    me.staffNo,
    files.map((f) => ({ unitId: f.unitId, promoStatus: Number(f.promoStatus), staffNo: Number(f.staffNo) })),
  )
  return files.map((f, i) => ({
    ...f,
    id: Number(f.id),
    staffNo: Number(f.staffNo),
    level: acting[i]!.level,
    canAct: acting[i]!.mine && ACTIONABLE_STAGES.includes(Number(f.stageStatus)),
    state: promotionState(f as never),
  }))
}

/** The Staff manager's filters (search, unit, category, on leave now) over the head's team. */
function teamFilter(team: Array<number>, q: Record<string, string | undefined>) {
  const where = [inList('s.staff_no', team)]
  const params: Array<unknown> = [...team]
  if (q.q) (where.push(`(${nameSql()} LIKE ? OR s.staff_no LIKE ?)`), params.push(like(q.q), like(q.q)))
  if (q.unit) (where.push('u.id = ?'), params.push(Number(q.unit)))
  if (q.group) (where.push('COALESCE(cp.staff_group, s.staff_group) = ?'), params.push(q.group))
  if (q.onLeave === '1') where.push('s.flag_leave = 1')
  return { base: `FROM staff s ${PLACEMENT} WHERE ${where.join(' AND ')}`, params }
}

/** The academic year as the old portal counted it: this calendar year to the next ("2026/2027"). */
function academicYear(d = new Date()) {
  return `${d.getFullYear()}/${d.getFullYear() + 1}`
}

/** Undergraduate programmes of the head's department in the student system (osis); none if it cannot be reached. */
async function headProgrammes(staffNo: number): Promise<Array<{ value: string; label: string }>> {
  try {
    return await rows<{ value: string; label: string }>(
      `SELECT DISTINCT p.progid AS value, p.long_name AS label FROM osisauth.users o JOIN osis.prog_db p ON p.deptid = o.deptid
        WHERE o.staff_no = ? AND p.runtype = '01' AND p.progtype = '01' ORDER BY p.long_name`,
      [String(staffNo)],
    )
  } catch {
    return []
  }
}

/** Continuing students on a programme at a level (osis), as the old portal counted them for an adviser. */
async function studentCount(progid: string, level: number): Promise<number | null> {
  try {
    return Number(await scalar('SELECT COUNT(*) FROM osis.students_db WHERE progid = ? AND level = ? AND completed = 0 AND graduate = 0', [progid, String(level)]))
  } catch {
    return null
  }
}

/** The plan year as the old portal counted it: last year to this ("2025/2026"). */
function planYear(d = new Date()) {
  return `${d.getFullYear() - 1}/${d.getFullYear()}`
}

type Plan = z.output<typeof operationalPlanSchema>
type Conn = Parameters<typeof exec>[2]

function objectiveColumns(d: Plan) {
  return {
    unitId: d.unitId,
    projectSummary: d.projectSummary,
    performanceIndicators: d.performanceIndicators,
    ucspLink: d.ucspLink,
    bEstimated: d.bEstimated,
    bActual: d.bActual,
    riskAssump: d.riskAssump,
    responsibility: d.responsibility,
    tEstimated: d.tEstimated,
    tActual: d.tActual,
    sourcesMeans: d.sourcesMeans,
  }
}

/** The output, outcome, impact, activity and review rows of a plan (one each, as the old portal kept them). */
async function writePlanParts(conn: Conn, oid: number, d: Plan, creating: boolean) {
  const parts: Array<[string, Record<string, unknown>]> = [
    ['output', { project_summary_output: d.outputSummary, performance_indicators_output: d.outputIndicators }],
    ['outcome', { project_summary_outcome: d.outcomeSummary, performance_indicators_outcome: d.outcomeIndicators }],
    ['impact', { project_summary_impact: d.impactSummary, performance_indicators_impact: d.impactIndicators }],
    [
      'activities',
      {
        project_summary: d.activitySummary,
        performance_indicators_activities: d.activityIndicators,
        b_estimated_activities: d.activityBEstimated,
        b_actual_activities: d.activityBActual,
        t_estimated_activities: d.activityTEstimated,
        t_actual_activities: d.activityTActual,
      },
    ],
    ['sp_review', { opportunities: d.opportunities, challenges: d.challenges, action_taken: d.actionTaken, remarks: d.remarks, r_status: d.rStatus }],
  ]
  for (const [table, values] of parts) {
    const cols = Object.keys(values)
    const existing = creating ? null : await one<{ id: number }>(`SELECT MAX(id) AS id FROM ${table} WHERE objectives_id = ?`, [oid], conn)
    if (existing?.id) await exec(`UPDATE ${table} SET ${cols.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, [...Object.values(values), existing.id], conn)
    else await exec(`INSERT INTO ${table} (objectives_id, ${cols.join(', ')}) VALUES (?, ${cols.map(() => '?').join(', ')})`, [oid, ...Object.values(values)], conn)
  }
}

async function loadPlan(id: number) {
  const o = await one<Record<string, any>>(
    `SELECT o.*, u.long_name AS unit_name, ${nameSql()} AS full_name FROM objectives o JOIN unit u ON u.id = o.unit_id LEFT JOIN staff s ON s.staff_no = o.staff_no WHERE o.id = ?`,
    [id],
  )
  if (!o) return null
  const last = (table: string) => one<Record<string, any>>(`SELECT * FROM ${table} WHERE objectives_id = ? ORDER BY id DESC LIMIT 1`, [id])
  const [output, outcome, impact, activity, review] = await Promise.all([last('output'), last('outcome'), last('impact'), last('activities'), last('sp_review')])
  return {
    ...o,
    outputSummary: output?.projectSummaryOutput ?? null,
    outputIndicators: output?.performanceIndicatorsOutput ?? null,
    outcomeSummary: outcome?.projectSummaryOutcome ?? null,
    outcomeIndicators: outcome?.performanceIndicatorsOutcome ?? null,
    impactSummary: impact?.projectSummaryImpact ?? null,
    impactIndicators: impact?.performanceIndicatorsImpact ?? null,
    activitySummary: activity?.projectSummary ?? null,
    activityIndicators: activity?.performanceIndicatorsActivities ?? null,
    activityBEstimated: activity?.bEstimatedActivities ?? null,
    activityBActual: activity?.bActualActivities ?? null,
    activityTEstimated: activity?.tEstimatedActivities ?? null,
    activityTActual: activity?.tActualActivities ?? null,
    opportunities: review?.opportunities ?? null,
    challenges: review?.challenges ?? null,
    actionTaken: review?.actionTaken ?? null,
    remarks: review?.remarks ?? null,
    rStatus: review?.rStatus || null,
  } as Record<string, any>
}

/** Item categories of the procurement system. */
async function procurementCategories() {
  return rows<{ value: number; label: string }>('SELECT id AS value, TRIM(cat_name) AS label FROM procurement.item_cat ORDER BY cat_name')
}

/**
 * Writes a procurement request as the old portal did: the header (with a
 * random order number), one breakdown row per item, and request_log entries.
 * Submitting sends it to the Procurement Directorate (stage 4, status 1).
 */
async function saveProcurement(staffNo: number, existingId: number | null, d: z.output<typeof procurementRequestSchema>) {
  const items = d.items.map((i) => ({ ...i, total: Math.round(i.quantity * i.unitPrice * 100) / 100 }))
  const total = Math.round(items.reduce((t, i) => t + i.total, 0) * 100) / 100
  const status = d.submit ? 1 : 0
  const stage = d.submit ? 4 : 1
  return withTransaction(async (conn) => {
    let id = existingId
    let orderNo: string
    if (id) {
      orderNo = String((await one<{ orderNo: string }>('SELECT order_no FROM procurement.request WHERE request_id = ?', [id], conn))?.orderNo ?? '')
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
        [d.unitId, staffNo, id, orderNo, i.description, String(i.quantity), i.unitPrice, i.total, i.categoryId, status, stage],
        conn,
      )
    }
    await exec(
      `INSERT INTO procurement.request_log (unit_id, request_id, staff_no, order_no, status, stage, stage_status, type, comments, item_description, total_price)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
      [d.unitId, id, staffNo, orderNo, status, stage, d.submit ? 'Submitted to the Procurement Directorate (staff portal)' : 'Saved draft (staff portal)', 'Applied For Procurement of Item(s)', total],
      conn,
    )
    return id!
  })
}

export const portalManageRoute = new Hono()
  .use(requireManager)

  .get('/scope', async (c) => {
    const me = c.get('staff')
    const [team, approvees] = await Promise.all([teamStaff(me), leaveApprovees(me)])
    const units = await teamUnits(me)
    const unitList = units.length
      ? await rows(`SELECT id AS value, long_name AS label, level FROM unit WHERE ${inList('id', units)} ORDER BY level, long_name`, units)
      : []
    return c.json({ heads: me.heads, headTitle: me.headTitle, teamCount: team.length, approveeCount: approvees.length, units: unitList })
  })

  .get('/staff', async (c) => {
    const me = c.get('staff')
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const team = await teamStaff(me)
    const { base, params } = teamFilter(team, q)
    // all=1: every matching member, for the printed list (filters still apply).
    const all = q.all === '1'
    const [data, total, onLeave] = await Promise.all([
      rows(
        `SELECT ${BRIEF_COLUMNS}, s.flag_leave ${base} ORDER BY u.long_name, full_name LIMIT ? OFFSET ?`,
        [...params, all ? 5000 : limit, all ? 0 : offset],
      ),
      scalar(`SELECT COUNT(*) ${base}`, params),
      team.length ? scalar(`SELECT COUNT(*) FROM staff WHERE ${inList('staff_no', team)} AND flag_leave = 1`, team) : 0,
    ])
    return c.json({ data, total, page, pageSize, onLeave, teamCount: team.length })
  })
  // The same filtered list as an Excel workbook (Export list).
  .get('/staff/export', async (c) => {
    const me = c.get('staff')
    const { base, params } = teamFilter(await teamStaff(me), c.req.query())
    const list = await rows<Record<string, any>>(
      `SELECT ${BRIEF_COLUMNS}, s.flag_leave, s.email ${base} ORDER BY COALESCE(cp.staff_group, s.staff_group) = 'SM' DESC, COALESCE(cp.staff_group, s.staff_group), u.long_name, full_name LIMIT 5000`,
      params,
    )
    const header = ['#', 'Staff no.', 'Name', 'Gender', 'Category', 'Designation', 'Unit', 'Grade', 'Notch', 'Age', 'Phone', 'University email', 'Personal email', 'Status']
    const sheet = list.map((m, i) => [
      i + 1,
      Number(m.staffNo),
      m.fullName,
      m.gender === 'M' ? 'Male' : m.gender === 'F' ? 'Female' : m.gender,
      GROUP_LABELS[m.staffGroup] ?? m.staffGroup,
      m.jobTitle,
      m.unitName,
      m.grade,
      m.notch,
      m.age === null || m.age === undefined ? null : Number(m.age),
      m.phone ? String(m.phone) : null,
      m.uccMail,
      m.email,
      Number(m.flagLeave) === 1 ? 'On leave' : m.staffStatus ? String(m.staffStatus).charAt(0) + String(m.staffStatus).slice(1).toLowerCase() : null,
    ])
    const stamp = new Date().toISOString().slice(0, 10)
    audit(null, 'export', 'staff', null, `Staff portal: ${me.fullName} (${me.staffNo}) exported a list of ${list.length} staff`)
    return new Response(new Uint8Array(buildXlsx('Staff list', header, sheet)), {
      headers: {
        'content-type': XLSX_TYPE,
        'content-disposition': `attachment; filename="staff-list-${stamp}.xlsx"`,
        'cache-control': 'private, no-store',
      },
    })
  })
  .get('/staff/:staffNo', async (c) => {
    const me = c.get('staff')
    const staffNo = parseId(c.req.param('staffNo'))
    if (!(await teamStaff(me)).includes(staffNo)) throw notFound('Staff member')
    const staff = await requireStaff(staffNo)
    const [leave, leaves] = await Promise.all([
      leaveYear(staff, new Date().getFullYear()),
      rows(
        `SELECT l.id, t.title AS type, l.start_date, l.end_date, l.approved_days, l.status
           FROM leave_dump l LEFT JOIN leave_type t ON t.id = l.type_id WHERE l.staff_no = ? ORDER BY l.start_date DESC LIMIT 12`,
        [staffNo],
      ),
    ])
    const detail = await one(
      `SELECT s.first_appoint_date, s.assume_date, s.confirm_date, s.flag_leave, s.ucc_mail, s.phone, g.grade, g.notch
         FROM staff s ${PLACEMENT} WHERE s.staff_no = ?`,
      [staffNo],
    )
    return c.json({ ...staff, ...detail, leave, leaves })
  })

  // ------------------------------------------------------------ Leave approval

  .get('/leave', async (c) => {
    const me = c.get('staff')
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 20)
    const approvees = await leaveApprovees(me)
    const view = q.view === 'decided' ? "AND l.head_endorse = ? AND l.status NOT IN ('HEAD-PENDING', 'STAFF-PENDING')" : q.view === 'all' ? '' : "AND l.status IN ('HEAD-PENDING', 'STAFF-PENDING')"
    const params: Array<unknown> = [...approvees, ...(q.view === 'decided' ? [me.staffNo] : [])]
    const search = q.q ? ` AND (${nameSql()} LIKE ? OR s.staff_no LIKE ?)` : ''
    if (q.q) params.push(like(q.q), like(q.q))
    const base = `FROM leave_dump l JOIN staff s ON s.staff_no = l.staff_no ${PLACEMENT} LEFT JOIN leave_type t ON t.id = l.type_id
      LEFT JOIN staff r ON r.staff_no = l.relieved_by
      WHERE ${inList('l.staff_no', approvees)} ${view}${search}`
    const [data, total, pending, decided] = await Promise.all([
      rows(
        `SELECT l.id, l.staff_no, ${nameSql()} AS full_name, u.long_name AS unit_name, j.title AS job_title, COALESCE(cp.staff_group, s.staff_group) AS staff_group,
                t.title AS type, l.start_date, l.end_date, l.resume_date, l.approved_days, l.applied_date, l.status, l.apply_note,
                l.head_remark, l.head_date, ${nameSql('r')} AS reliever_name
           ${base} ORDER BY l.status IN ('HEAD-PENDING', 'STAFF-PENDING') DESC, l.applied_date DESC, l.id DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${base}`, params),
      approvees.length ? scalar(`SELECT COUNT(*) FROM leave_dump WHERE ${inList('staff_no', approvees)} AND status IN ('HEAD-PENDING', 'STAFF-PENDING')`, approvees) : 0,
      scalar("SELECT COUNT(*) FROM leave_dump WHERE head_endorse = ? AND status NOT IN ('HEAD-PENDING', 'STAFF-PENDING')", [me.staffNo]),
    ])
    return c.json({ data, total, page, pageSize, pending, decided })
  })
  .get('/leave/:id/relievers', async (c) => {
    const me = c.get('staff')
    const leave = await one<{ staffNo: number; startDate: string; endDate: string; unitId: number | null }>(
      `SELECT l.staff_no, l.start_date, l.end_date, u.id AS unit_id FROM leave_dump l JOIN staff s ON s.staff_no = l.staff_no ${PLACEMENT} WHERE l.id = ?`,
      [parseId(c.req.param('id'))],
    )
    if (!leave || !(await leaveApprovees(me)).includes(leave.staffNo)) throw notFound('Leave application')
    const q = (c.req.query('q') ?? '').trim()
    // The applicant's own unit first, then the rest of the head's units; a search reaches anyone.
    const units = [...new Set([...(leave.unitId ? [leave.unitId] : []), ...(await teamUnits(me))])]
    const scope = q.length >= 2 ? `(${nameSql()} LIKE ? OR s.staff_no LIKE ?)` : units.length ? inList('u.id', units) : '1 = 0'
    const found = await rows<{ value: number; fullName: string; unitName: string | null; unitId: number | null }>(
      `SELECT s.staff_no AS value, ${nameSql()} AS full_name, u.long_name AS unit_name, u.id AS unit_id
         FROM staff s ${PLACEMENT}
        WHERE s.staff_no <> ? AND s.staff_no > 0 AND ${activeStaffSql()} AND COALESCE(s.flag_leave, 0) = 0 AND ${scope}
          AND NOT EXISTS (SELECT 1 FROM leave_dump o WHERE o.staff_no = s.staff_no AND o.status IN ('HR-PENDING', 'GRANTED')
                           AND o.start_date <= ? AND o.end_date >= ?)
        ORDER BY u.id = ? DESC, full_name LIMIT 300`,
      [leave.staffNo, ...(q.length >= 2 ? [like(q), like(q)] : units), leave.endDate, leave.startDate, leave.unitId ?? 0],
    )
    return c.json(found.map((r) => ({ value: r.value, label: r.fullName, hint: `${r.value}${r.unitName ? ` · ${r.unitName}` : ''}` })))
  })
  .post('/leave/:id/decision', validate('json', leaveDecisionSchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const { decision, remark, relievedBy } = c.req.valid('json')
    const leave = await one<{ staffNo: number; status: string; startDate: string; endDate: string; approvedDays: number; relievedBy: number | null }>(
      'SELECT staff_no, status, start_date, end_date, approved_days, relieved_by FROM leave_dump WHERE id = ?',
      [id],
    )
    if (!leave || !(await leaveApprovees(me)).includes(leave.staffNo)) throw notFound('Leave application')
    const next = decision === 'approve' ? 'HR-PENDING' : 'HEAD-REJECTED'
    // The head assigns the reliever when recommending the leave.
    let reliever: { staffNo: number; fullName: string } | null = null
    if (decision === 'approve' && relievedBy) {
      if (relievedBy === leave.staffNo) throw new AppError('The reliever must be someone other than the applicant.', 422)
      reliever = await one<{ staffNo: number; fullName: string }>(`SELECT s.staff_no, ${nameSql()} AS full_name FROM staff s WHERE s.staff_no = ? AND ${activeStaffSql()}`, [relievedBy])
      if (!reliever) throw new AppError('That reliever is not an active member of staff.', 422)
      const away = await one<{ id: number }>(
        "SELECT id FROM leave_dump WHERE staff_no = ? AND status IN ('HR-PENDING', 'GRANTED') AND start_date <= ? AND end_date >= ? LIMIT 1",
        [relievedBy, leave.endDate, leave.startDate],
      )
      if (away) throw new AppError(`${reliever.fullName} is also on leave during this period. Choose another reliever.`, 409)
    }
    // Only from the head stage, and only once (a second click changes nothing).
    const done = await exec(
      `UPDATE leave_dump SET status = ?, head_endorse = ?, head_date = CURDATE(), head_remark = ?,
              relieved_by = ${decision === 'approve' ? '?' : 'relieved_by'}, updated_at = NOW()
        WHERE id = ? AND status IN ('HEAD-PENDING', 'STAFF-PENDING')`,
      decision === 'approve' ? [next, me.staffNo, remark, reliever?.staffNo ?? null, id] : [next, me.staffNo, remark, id],
    )
    if (!done.affectedRows) throw new AppError('This application has already been decided.', 409)
    // Into the staff member's portal inbox, as the legacy portal did.
    const words = decision === 'approve' ? 'recommended by your head and sent to the Directorate of Human Resource for approval' : `not recommended by your head${remark ? `: ${remark}` : ''}`
    void exec(
      "INSERT INTO notification (type, staff_no, action, title, message, read_flag, priority, datetime) VALUES ('LEAVE', ?, ?, ?, ?, '0', ?, NOW())",
      [
        leave.staffNo,
        `Leave ${decision === 'approve' ? 'Approval' : 'Rejection'} - Head`,
        decision === 'approve' ? 'Leave recommended' : 'Leave not recommended',
        `Your leave application of ${leave.approvedDays} day(s) from ${leave.startDate} has been ${words}.${reliever ? ` Your reliever is ${reliever.fullName}.` : ''}`.replace(/[^\x00-\xFF]/g, ''),
        decision === 'approve' ? '1' : '2',
      ],
    ).catch(() => undefined)
    audit(
      null,
      'update',
      'leave',
      id,
      `Staff portal: ${me.fullName} (${me.staffNo}) ${decision === 'approve' ? 'recommended' : 'rejected'} leave #${id} of staff ${leave.staffNo}${reliever ? `, reliever ${reliever.fullName} (${reliever.staffNo})` : ''}`,
    )
    return c.json({ ok: true, status: next })
  })

  // ------------------------------------------------------------ Read-only lists

  // ------------------------------------------------------------ Promotion & contract renewal

  .get('/promotions', async (c) => {
    const me = c.get('staff')
    const files = await visibleFiles(me)
    return c.json({
      data: files,
      counts: { waiting: files.filter((f) => f.canAct).length, total: files.length },
    })
  })
  .get('/promotions/:id', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const visible = (await visibleFiles(me)).find((f) => f.id === id)
    if (!visible) throw notFound('Application')
    const file = await loadPromotion(id)
    return c.json({
      ...file,
      canAct: visible.canAct,
      level: visible.level,
      actions: visible.canAct ? ['recommend', 'not_recommend', 'return', ...(visible.level >= 2 ? ['reverse', 'reverse_applicant'] : [])] : [],
    })
  })
  .get('/promotions/:id/file', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const visible = (await visibleFiles(me)).some((f) => f.id === id)
    return streamPromotionFile(c, id, me.staffNo, 'team', visible)
  })
  .post('/promotions/:id/action', validate('json', portalPromotionActionSchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const d = c.req.valid('json')
    const r = await headAction(me, id, d)
    const levelName = LEVEL_NAMES[r.level]?.toLowerCase() ?? 'reviewer'
    if (d.action === 'recommend') {
      notifyApplicant(r.staffNo, 'Application recommended', `Your application #${id} has been recommended by the ${levelName} and moved to the next level.`)
      await notifyLevelHeads(id, r.next)
    } else if (d.action === 'not_recommend') {
      notifyApplicant(r.staffNo, 'Application not recommended', `Your application #${id} was not recommended by the ${levelName}: ${d.comment}`)
    } else if (d.action === 'return') {
      notifyApplicant(r.staffNo, 'Application returned to you', `The ${levelName} returned your application #${id}: ${r.label}. ${d.comment} Please resubmit on the staff portal.`)
    } else {
      if (d.action === 'reverse_applicant')
        notifyApplicant(r.staffNo, 'Application sent back', `The ${levelName} sent your application #${id} back for another look by the previous level, and to you: ${d.comment} You may resubmit updated documents on the staff portal.`)
      await notifyLevelHeads(id, r.next)
    }
    audit(null, 'update', 'promotion', id, `Staff portal: ${me.fullName} (${me.staffNo}) as ${levelName}: ${r.label} — application #${id} of staff ${r.staffNo}`)
    return c.json({ ok: true, ...r })
  })
  .get('/study', async (c) => {
    const team = await teamStaff(c.get('staff'))
    const data = await rows<Record<string, any>>(
      `SELECT i.id, i.staff_no, ${nameSql()} AS full_name, u.long_name AS unit_name, i.int_prog, i.study_place, i.date_commence, i.prog_duration,
              i.appstatus, i.stage_status, i.sub_date
         FROM study_intention i JOIN staff s ON s.staff_no = i.staff_no ${PLACEMENT}
        WHERE ${inList('i.staff_no', team)} AND i.appstatus BETWEEN 1 AND 4
        ORDER BY i.appstatus, i.sub_date DESC LIMIT 300`,
      team,
    )
    return c.json(data.map((i) => ({ ...i, stageLabel: STUDY_STAGES[Number(i.appstatus)] ?? '—' })))
  })
  // One of the team's intentions to study, to read and print.
  .get('/study/:id', async (c) => {
    const intention = await loadIntention(parseId(c.req.param('id')))
    if (!intention || !(await teamStaff(c.get('staff'))).includes(Number(intention.staffNo))) throw notFound('Application')
    return c.json(intention)
  })
  // ------------------------------------------------------------ Academic advisers
  // Heads nominate academic staff in their units as advisers for a programme
  // and level for the academic year; the VC approves (legacy academic_advisers,
  // activity VC-PENDING → VC-APPROVED, status 1 → 2 approved / 3 disapproved).

  .get('/advisers', async (c) => {
    const me = c.get('staff')
    const year = c.req.query('year') || academicYear()
    const units = await teamUnits(me)
    const unitIn = units.length ? inList('u.id', units) : '1 = 0'
    const [candidates, advisers, years, programmes] = await Promise.all([
      units.length
        ? rows(
            `SELECT s.staff_no, ${nameSql()} AS full_name, j.title AS job_title, u.long_name AS unit_name,
                    a.id AS adviser_id, a.progid, a.level_ass AS level, a.status, a.activity
               FROM staff s ${PLACEMENT}
               LEFT JOIN academic_advisers a ON a.staff_no = s.staff_no AND a.academic_year = ?
              WHERE ${unitIn} AND j.type = 'ACADEMIC' AND ${activeStaffSql()}
              ORDER BY u.long_name, full_name LIMIT 1000`,
            [year, ...units],
          )
        : [],
      rows(
        `SELECT a.id, a.staff_no, ${nameSql()} AS full_name, j.title AS job_title, u.long_name AS unit_name, a.progid, a.level_ass AS level,
                a.total_students, a.status, a.activity, a.date_ass, a.academic_year, a.unit_head
           FROM academic_advisers a JOIN staff s ON s.staff_no = a.staff_no ${PLACEMENT}
          WHERE a.academic_year = ? AND (a.unit_head = ?${units.length ? ` OR ${inList('a.unit_id', units)}` : ''})
          ORDER BY a.status, a.level_ass, full_name`,
        [year, String(me.staffNo), ...units],
      ),
      rows<{ year: string }>('SELECT DISTINCT academic_year AS year FROM academic_advisers WHERE academic_year IS NOT NULL ORDER BY year DESC'),
      headProgrammes(me.staffNo),
    ])
    const progName = new Map(programmes.map((p) => [p.value, p.label]))
    const withProg = <T extends Record<string, any>>(r: T) => ({ ...r, programme: r.progid ? (progName.get(r.progid) ?? r.progid) : null })
    return c.json({
      year,
      years: [...new Set([academicYear(), ...years.map((y) => y.year)])],
      advisers: advisers.map(withProg),
      candidates: candidates.map(withProg),
      programmes,
    })
  })
  .post('/advisers', validate('json', adviserNominationSchema), async (c) => {
    const me = c.get('staff')
    const d = c.req.valid('json')
    const year = academicYear()
    const units = await teamUnits(me)
    const staff = await one<{ unitId: number; fullName: string }>(
      `SELECT u.id AS unit_id, ${nameSql()} AS full_name FROM staff s ${PLACEMENT} WHERE s.staff_no = ? AND j.type = 'ACADEMIC' AND ${activeStaffSql()}`,
      [d.staffNo],
    )
    if (!staff || !units.includes(Number(staff.unitId))) throw new AppError('Choose an academic staff member in one of your units.', 422)
    const current = await one<{ id: number; status: number }>('SELECT id, status FROM academic_advisers WHERE staff_no = ? AND academic_year = ? ORDER BY id DESC LIMIT 1', [String(d.staffNo), year])
    if (current && Number(current.status) === 2) throw new AppError('This adviser has already been approved for the year; ask the VC’s office to change it.', 409)
    const total = await studentCount(d.progid, d.level)
    const id = await withTransaction(async (conn) => {
      let aid = current?.id
      if (aid)
        await exec(
          "UPDATE academic_advisers SET unit_head = ?, unit_id = ?, level_ass = ?, progid = ?, total_students = ?, activity = 'VC-PENDING', approved = 0, stage_status = 0, status = 1 WHERE id = ?",
          [String(me.staffNo), String(staff.unitId), d.level, d.progid, total === null ? null : String(total), aid],
          conn,
        )
      else
        aid = await insert(
          'academic_advisers',
          { unitHead: String(me.staffNo), staffNo: String(d.staffNo), unitId: String(staff.unitId), levelAss: d.level, progid: d.progid, activity: 'VC-PENDING', approved: 0, stageStatus: 0, status: 1, academicYear: year, totalStudents: total === null ? null : String(total) },
          conn,
        )
      await exec(
        "INSERT INTO academic_advisers_log (aca_id, unit_head, unit_id, activity, approved, stage_status, status, academic_year) VALUES (?, ?, ?, 'VC-PENDING', 0, 0, 1, ?)",
        [aid, String(me.staffNo), String(staff.unitId), year],
        conn,
      )
      return aid!
    })
    audit(null, current ? 'update' : 'create', 'adviser', id, `Staff portal: ${me.fullName} (${me.staffNo}) nominated ${staff.fullName} (${d.staffNo}) as academic adviser for ${d.progid} level ${d.level}, ${year}`)
    return c.json({ id, totalStudents: total }, current ? 200 : 201)
  })
  .delete('/advisers/:id', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const units = await teamUnits(me)
    const a = await one<{ staffNo: string; status: number; unitHead: string; unitId: string }>('SELECT staff_no, status, unit_head, unit_id FROM academic_advisers WHERE id = ?', [id])
    if (!a || (a.unitHead !== String(me.staffNo) && !units.includes(Number(a.unitId)))) throw notFound('Nomination')
    if (Number(a.status) === 2) throw new AppError('An approved adviser can only be changed by the VC’s office.', 409)
    await exec('DELETE FROM academic_advisers WHERE id = ?', [id])
    audit(null, 'delete', 'adviser', id, `Staff portal: ${me.fullName} (${me.staffNo}) withdrew the academic adviser nomination of staff ${a.staffNo}`)
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Operational plans
  // Legacy objectives (+ output, outcome, impact, activities, sp_review). A
  // head creates and reviews plans for the units they head; plans of the units
  // below them are listed read-only (as deans and provosts saw them).

  .get('/plans', async (c) => {
    const me = c.get('staff')
    const year = c.req.query('year') || planYear()
    const own = me.heads.map((h) => h.unitId)
    const units = [...new Set([...own, ...(await teamUnits(me))])]
    const [plans, years] = await Promise.all([
      units.length
        ? rows<Record<string, any>>(
            `SELECT o.id, o.unit_id, u.long_name AS unit_name, o.project_summary, o.performance_indicators, o.ucsp_link, o.b_estimated, o.b_actual,
                    o.responsibility, o.t_estimated, o.t_actual, o.review_year, o.activity_date, o.staff_no, ${nameSql()} AS full_name, r.r_status
               FROM objectives o JOIN unit u ON u.id = o.unit_id LEFT JOIN staff s ON s.staff_no = o.staff_no
               LEFT JOIN sp_review r ON r.id = (SELECT MAX(id) FROM sp_review WHERE objectives_id = o.id)
              WHERE o.review_year = ? AND ${inList('o.unit_id', units)} ORDER BY u.long_name, o.id`,
            [year, ...units],
          )
        : [],
      rows<{ year: string }>('SELECT DISTINCT review_year AS year FROM objectives WHERE review_year IS NOT NULL ORDER BY year DESC'),
    ])
    return c.json({
      year,
      years: [...new Set([planYear(), ...years.map((y) => y.year)])],
      units: me.heads.map((h) => ({ value: h.unitId, label: h.unitName })),
      plans: plans.map((p) => ({ ...p, editable: own.includes(Number(p.unitId)) && p.reviewYear === planYear() })),
    })
  })
  .get('/plans/:id', async (c) => {
    const me = c.get('staff')
    const plan = await loadPlan(parseId(c.req.param('id')))
    const units = [...new Set([...me.heads.map((h) => h.unitId), ...(await teamUnits(me))])]
    if (!plan || !units.includes(Number(plan.unitId))) throw notFound('Plan')
    return c.json({ ...plan, editable: me.heads.some((h) => h.unitId === Number(plan.unitId)) && plan.reviewYear === planYear() })
  })
  .post('/plans', validate('json', operationalPlanSchema), async (c) => {
    const me = c.get('staff')
    const d = c.req.valid('json')
    if (!me.heads.some((h) => h.unitId === d.unitId)) throw new AppError('You can create plans only for units you head.', 403)
    const id = await withTransaction(async (conn) => {
      const oid = await insert('objectives', { staffNo: me.staffNo, reviewYear: planYear(), status: 1, ...objectiveColumns(d) }, conn)
      await writePlanParts(conn, oid, d, true)
      return oid
    })
    audit(null, 'create', 'plan', id, `Staff portal: ${me.fullName} (${me.staffNo}) created an operational plan for unit ${d.unitId} (${planYear()})`)
    return c.json({ id }, 201)
  })
  .put('/plans/:id', validate('json', operationalPlanSchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const d = c.req.valid('json')
    const plan = await one<{ unitId: number; reviewYear: string }>('SELECT unit_id, review_year FROM objectives WHERE id = ?', [id])
    if (!plan || !me.heads.some((h) => h.unitId === Number(plan.unitId))) throw notFound('Plan')
    if (plan.reviewYear !== planYear()) throw new AppError(`Only this year’s plans (${planYear()}) can be changed.`, 409)
    await withTransaction(async (conn) => {
      const cols = Object.entries({ ...objectiveColumns(d), unitId: Number(plan.unitId) })
      await exec(`UPDATE objectives SET ${cols.map(([k]) => `${k.replace(/[A-Z]/g, (x) => `_${x.toLowerCase()}`)} = ?`).join(', ')} WHERE id = ?`, [...cols.map(([, v]) => v), id], conn)
      await writePlanParts(conn, id, d, false)
    })
    audit(null, 'update', 'plan', id, `Staff portal: ${me.fullName} (${me.staffNo}) updated operational plan #${id}${d.rStatus ? ` (status: ${d.rStatus})` : ''}`)
    return c.json({ id })
  })

  // ------------------------------------------------------------ Procurement
  // The procurement database (same server): a head raises requests for the
  // units they head (request + request_breakdown, every step in request_log).
  // Submitted requests go to the Procurement Directorate (stage 4, status 1), as
  // the old portal now sends them. Requests of units below them are read-only.

  .get('/procurement', async (c) => {
    const me = c.get('staff')
    const own = me.heads.map((h) => h.unitId)
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
    const [mine, theirs, categories] = await Promise.all([list(own), list(below, ' AND r.status > 0'), procurementCategories()])
    return c.json({
      units: me.heads.map((h) => ({ value: h.unitId, label: h.unitName })),
      categories,
      requests: mine.map((r) => ({ ...r, editable: Number(r.status) === 0 })),
      below: theirs,
    })
  })
  .get('/procurement/:id', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const r = await one<Record<string, any>>(
      `SELECT r.request_id AS id, r.unit_id, u.long_name AS unit_name, r.order_no, r.status, r.stage, r.request_date, r.date_added, r.staff_no, ${nameSql()} AS full_name
         FROM procurement.request r JOIN unit u ON u.id = r.unit_id LEFT JOIN staff s ON s.staff_no = r.staff_no WHERE r.request_id = ?`,
      [id],
    )
    const own = me.heads.map((h) => h.unitId)
    const units = [...own, ...(await teamUnits(me))]
    if (!r || !units.includes(Number(r.unitId)) || (Number(r.status) === 0 && !own.includes(Number(r.unitId)))) throw notFound('Request')
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
  .post('/procurement', validate('json', procurementRequestSchema), async (c) => {
    const me = c.get('staff')
    const d = c.req.valid('json')
    if (!me.heads.some((h) => h.unitId === d.unitId)) throw new AppError('You can raise requests only for units you head.', 403)
    const id = await saveProcurement(me.staffNo, null, d)
    audit(null, 'create', 'procurement', id, `Staff portal: ${me.fullName} (${me.staffNo}) ${d.submit ? 'submitted' : 'saved a draft'} procurement request #${id} (unit ${d.unitId})`)
    return c.json({ id }, 201)
  })
  .put('/procurement/:id', validate('json', procurementRequestSchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const d = c.req.valid('json')
    const r = await one<{ unitId: number; status: number }>('SELECT unit_id, status FROM procurement.request WHERE request_id = ?', [id])
    if (!r || !me.heads.some((h) => h.unitId === Number(r.unitId))) throw notFound('Request')
    if (Number(r.status) !== 0) throw new AppError('This request has been submitted and can no longer be changed.', 409)
    await saveProcurement(me.staffNo, id, { ...d, unitId: Number(r.unitId) })
    audit(null, 'update', 'procurement', id, `Staff portal: ${me.fullName} (${me.staffNo}) ${d.submit ? 'submitted' : 'updated the draft of'} procurement request #${id}`)
    return c.json({ id })
  })
  .delete('/procurement/:id', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const r = await one<{ unitId: number; status: number }>('SELECT unit_id, status FROM procurement.request WHERE request_id = ?', [id])
    if (!r || !me.heads.some((h) => h.unitId === Number(r.unitId))) throw notFound('Request')
    if (Number(r.status) !== 0) throw new AppError('Only a draft can be deleted.', 409)
    await withTransaction(async (conn) => {
      await exec('DELETE FROM procurement.request_breakdown WHERE request_id = ?', [id], conn)
      await exec('DELETE FROM procurement.request_log WHERE request_id = ?', [id], conn)
      await exec('DELETE FROM procurement.request WHERE request_id = ? AND status = 0', [id], conn)
    })
    audit(null, 'delete', 'procurement', id, `Staff portal: ${me.fullName} (${me.staffNo}) deleted draft procurement request #${id}`)
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Appraisals

  // The team for a review year: who has a Form A from their supervisor, and
  // whose self-appraisal (Form B) is waiting for a countersignature.
  .get('/appraisals', async (c) => {
    const me = c.get('staff')
    const year = /^20\d{2}$/.test(c.req.query('year') ?? '') ? c.req.query('year')! : String(new Date().getFullYear())
    const team = await teamStaff(me)
    if (!team.length) return c.json({ year, data: [], counts: { toCountersign: 0, formADone: 0, formAPending: 0 } })
    const [people, formA, formB] = await Promise.all([
      rows<Record<string, any>>(
        `SELECT s.staff_no, ${nameSql()} AS full_name, j.title AS job_title, u.long_name AS unit_name, COALESCE(cp.staff_group, s.staff_group) AS staff_group
           FROM staff s ${PLACEMENT} WHERE ${inList('s.staff_no', team)} ORDER BY u.long_name, full_name`,
        team,
      ),
      formASummaries(team, year),
      rows<Record<string, any>>(`SELECT app_self_id AS id, staff_no, app_status FROM staff_self_appraisal WHERE ${inList('staff_no', team)} AND yr_onreview = ?`, [...team, year]),
    ])
    const a = new Map(formA.map((f) => [Number(f.staffNo), f]))
    const b = new Map(formB.map((f) => [Number(f.staffNo), f]))
    const data = people.map((p) => ({
      ...p,
      formA: a.get(Number(p.staffNo)) ? { status: Number(a.get(Number(p.staffNo))!.status), supRating: a.get(Number(p.staffNo))!.supRating } : null,
      formB: b.get(Number(p.staffNo)) ? { id: b.get(Number(p.staffNo))!.id, status: Number(b.get(Number(p.staffNo))!.appStatus) } : null,
    }))
    return c.json({
      year,
      data,
      counts: {
        toCountersign: data.filter((d) => d.formB?.status === 1).length,
        formADone: data.filter((d) => d.formA).length,
        formAPending: data.filter((d) => !d.formA).length,
      },
    })
  })
  .get('/appraisals/:staffNo/:year', async (c) => {
    const me = c.get('staff')
    const staffNo = parseId(c.req.param('staffNo'))
    const year = c.req.param('year')
    if (!(await teamStaff(me)).includes(staffNo)) throw notFound('Staff member')
    const [staff, formA, formB, questions] = await Promise.all([requireStaff(staffNo), loadFormA(staffNo, year), loadFormB({ staffNo, year }), appraisalQuestions()])
    return c.json({ staff, year, formA, formB, questions, supervisor: { name: me.fullName, rank: me.jobTitle } })
  })
  .post('/appraisals/:staffNo/:year/form-a', validate('json', formASchema), async (c) => {
    const me = c.get('staff')
    const staffNo = parseId(c.req.param('staffNo'))
    const year = c.req.param('year')
    if (!/^20\d{2}$/.test(year)) throw new AppError('Choose the year under review.', 422)
    if (!(await teamStaff(me)).includes(staffNo)) throw notFound('Staff member')
    const count = await saveFormA(staffNo, year, c.req.valid('json'), { staffNo: me.staffNo, name: me.fullName, rank: me.jobTitle })
    notifyStaff(staffNo, 'Appraisal - Supervisor', `Your ${year} appraisal is ready`, `${me.fullName} has completed your ${year} appraisal (Form A). Please read it on the staff portal, add your comments and sign it.`)
    audit(null, 'update', 'appraisal', staffNo, `Staff portal: ${me.fullName} (${me.staffNo}) completed the ${year} appraisal (Form A, ${count} questions) of staff ${staffNo}`)
    return c.json({ ok: true })
  })
  .post('/appraisals/self/:id/countersign', validate('json', countersignSchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const row = await one<{ staffNo: number; year: string }>('SELECT staff_no, yr_onreview AS year FROM staff_self_appraisal WHERE app_self_id = ?', [id])
    if (!row || !(await teamStaff(me)).includes(row.staffNo)) throw notFound('Self-appraisal')
    const done = await exec(
      'UPDATE staff_self_appraisal SET sup_signed = ?, sup_signed_at = NOW(), supervisor_staff_no = ?, app_status = 2 WHERE app_self_id = ? AND app_status = 1',
      [SUPERVISOR_SIGNED, me.staffNo, id],
    )
    if (!done.affectedRows) throw new AppError('This self-appraisal has already been countersigned.', 409)
    notifyStaff(row.staffNo, 'Appraisal - Supervisor', `Self-appraisal countersigned`, `${me.fullName} has countersigned your ${row.year} self-appraisal (Form B).`)
    audit(null, 'update', 'appraisal', id, `Staff portal: ${me.fullName} (${me.staffNo}) countersigned the ${row.year} self-appraisal of staff ${row.staffNo}`)
    return c.json({ ok: true })
  })
