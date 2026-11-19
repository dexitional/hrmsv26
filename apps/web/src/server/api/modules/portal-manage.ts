// Management services in the staff portal, for heads of units and named
// approvers. What each head sees is worked out in lib/portal.ts.
//
//   GET  /api/portal/manage/scope
//   GET  /api/portal/manage/staff?q=&unit=&group=&page=     GET /api/portal/manage/staff/:staffNo
//   GET  /api/portal/manage/leave?view=pending|decided|all&page=
//   GET  /api/portal/manage/leave/:id/relievers?q=   colleagues free to cover the applicant's duties
//   POST /api/portal/manage/leave/:id/decision   { decision: approve | reject, remark, relievedBy }
//   GET  /api/portal/manage/promotions   GET /api/portal/manage/promotions/:id   GET /api/portal/manage/promotions/:id/file?path=
//   POST /api/portal/manage/promotions/:id/action   { recommend | not_recommend | return | reverse }
//   GET  /api/portal/manage/study   (read-only for now)
//   GET  /api/portal/manage/appraisals?year=     GET /api/portal/manage/appraisals/:staffNo/:year
//   POST /api/portal/manage/appraisals/:staffNo/:year/form-a   POST /api/portal/manage/appraisals/self/:id/countersign
import { Hono } from 'hono'
import { STUDY_STAGES } from '@hrms/db'
import { countersignSchema, formASchema, leaveDecisionSchema, portalPromotionActionSchema } from '#/lib/schemas'
import type { PortalUser } from '#/server/portal-session-core'
import { SUPERVISOR_SIGNED, appraisalQuestions, formASummaries, loadFormA, loadFormB, notifyStaff, saveFormA } from '../lib/appraisal'
import { audit } from '../lib/audit'
import { ACTIONABLE_STAGES, LEVEL_NAMES, actingLevels, headAction, loadPromotion, notifyApplicant, notifyLevelHeads, promotionState, streamPromotionFile } from '../lib/promotion'
import { exec, like, one, paging, parseId, rows, scalar } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { BRIEF_COLUMNS, PLACEMENT, activeStaffSql, leaveYear, nameSql, requireStaff } from '../lib/hr'
import { inList, leaveApprovees, requireManager, teamStaff, teamUnits } from '../lib/portal'
import { validate } from '../lib/validate'

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
    const where = [inList('s.staff_no', team)]
    const params: Array<unknown> = [...team]
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR s.staff_no LIKE ?)`), params.push(like(q.q), like(q.q)))
    if (q.unit) (where.push('u.id = ?'), params.push(Number(q.unit)))
    if (q.group) (where.push('COALESCE(cp.staff_group, s.staff_group) = ?'), params.push(q.group))
    if (q.onLeave === '1') where.push('s.flag_leave = 1')
    const base = `FROM staff s ${PLACEMENT} WHERE ${where.join(' AND ')}`
    const [data, total, onLeave] = await Promise.all([
      rows(`SELECT ${BRIEF_COLUMNS}, s.flag_leave ${base} ORDER BY u.long_name, full_name LIMIT ? OFFSET ?`, [...params, limit, offset]),
      scalar(`SELECT COUNT(*) ${base}`, params),
      team.length ? scalar(`SELECT COUNT(*) FROM staff WHERE ${inList('staff_no', team)} AND flag_leave = 1`, team) : 0,
    ])
    return c.json({ data, total, page, pageSize, onLeave })
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
      actions: visible.canAct ? ['recommend', 'not_recommend', 'return', ...(visible.level >= 2 ? ['reverse'] : [])] : [],
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
