// Staff portal: what a signed-in staff member sees and does for themselves.
// Every query is scoped to the session's staff number.
//
//   GET  /api/portal/overview
//   GET  /api/portal/profile           PUT /api/portal/profile/contact
//   GET  /api/portal/circulars         GET /api/portal/circulars/:id   (marks it read)
//   GET  /api/portal/notifications     POST /api/portal/notifications/read
//   GET  /api/portal/leave?year=       GET /api/portal/leave/:id
//   GET  /api/portal/leave/types       GET /api/portal/leave/period?start=&days=
//   POST /api/portal/leave             POST /api/portal/leave/:id/cancel
//   GET  /api/portal/colleagues?q=     relievers to choose from
//   GET  /api/portal/promotion          POST /api/portal/promotion (draft or submit)
//   GET|PUT|DELETE /api/portal/promotion/:id   POST /api/portal/promotion/:id/resubmit   GET /api/portal/promotion/:id/file?path=
//   GET  /api/portal/study
//   GET  /api/portal/appraisal          GET /api/portal/appraisal/questions
//   GET  /api/portal/appraisal/a/:year  POST /api/portal/appraisal/a/:year/sign   (Form A: comment and sign)
//   POST /api/portal/appraisal/b        GET|PUT /api/portal/appraisal/b/:id       (Form B: self-appraisal)
//   GET  /api/portal/tax?year=         GRA tax records (legacy gratax)
//   GET  /api/portal/requests?category=   POST /api/portal/requests   POST /api/portal/requests/:id/close
//   POST /api/portal/files              upload an attachment (PDF, Word, Excel or image)
import { Hono } from 'hono'
import { z } from 'zod'
import { STUDY_STAGES } from '@hrms/db'
import { contactUpdateSchema, formASignSchema, portalLeaveSchema, promotionApplySchema, promotionResubmitSchema, selfAppraisalSchema, serviceRequestSchema } from '#/lib/schemas'
import { EMPLOYEE_SIGNED, appraisalQuestions, formASummaries, loadFormA, loadFormB } from '../lib/appraisal'
import { audit } from '../lib/audit'
import { loadPromotion, notifyLevelHeads, promotionState, resubmit, saveApplication, streamPromotionFile } from '../lib/promotion'
import { exec, insert, like, one, paging, parseId, rows, scalar } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { BRIEF_COLUMNS, PLACEMENT, countsWeekends, leavePeriod, leaveYear, nameSql, requireStaff } from '../lib/hr'
import { inList, leaveApprovees, requireStaffUser, teamUnits } from '../lib/portal'
import { ATTACHMENT_EXTENSIONS, saveUpload } from '../lib/storage'
import { validate } from '../lib/validate'
import { properName } from '#/lib/text-case'
import { publicLink } from './circulars'
import { checkApplication } from './leave'
import { listBanks, listQualifications, listRelatives } from './staff-records'
import { loadStaffProfile } from './staff'

const OPEN_LEAVE = "('STAFF-PENDING', 'HEAD-PENDING', 'HR-PENDING')"
const say = (staff: { fullName: string; staffNo: number }, what: string) => `Staff portal: ${staff.fullName} (${staff.staffNo}) ${what}`

/** Circulars sent to this person (published from the HRMS). */
const MY_CIRCULARS = `FROM hrms_circular_recipients r
  JOIN circular c ON c.id = r.circular_id AND c.stage IN ('PUBLISHED', 'ARCHIVED') AND c.published_by IS NOT NULL
  LEFT JOIN notification n ON n.id = r.notification_id
  WHERE r.staff_no = ?`

export const portalRoute = new Hono()
  .use(requireStaffUser)

  .get('/overview', async (c) => {
    const me = c.get('staff')
    const year = new Date().getFullYear()
    const brief = await requireStaff(me.staffNo)
    const [leave, pendingLeave, nextLeave, circulars, unread, openRequests, approvals] = await Promise.all([
      leaveYear(brief, year),
      scalar(`SELECT COUNT(*) FROM leave_dump WHERE staff_no = ? AND status IN ${OPEN_LEAVE}`, [me.staffNo]),
      one(
        `SELECT l.id, t.title AS type, l.start_date, l.end_date, l.resume_date, l.approved_days, l.status
           FROM leave_dump l LEFT JOIN leave_type t ON t.id = l.type_id
          WHERE l.staff_no = ? AND l.status IN ('GRANTED', 'HR-PENDING', 'HEAD-PENDING') AND l.end_date >= CURDATE()
          ORDER BY l.start_date LIMIT 1`,
        [me.staffNo],
      ),
      rows(
        `SELECT c.id, c.letter_no, c.subject, c.published_at, c.attachment IS NOT NULL AS has_attachment, COALESCE(n.read_flag, '0') = '1' AS is_read
           ${MY_CIRCULARS} ORDER BY c.published_at DESC LIMIT 4`,
        [me.staffNo],
      ),
      scalar("SELECT COUNT(*) FROM notification WHERE staff_no = ? AND read_flag = '0'", [me.staffNo]),
      scalar("SELECT COUNT(*) FROM staff_request WHERE staff_no = ? AND status IN ('OPEN', 'IN_PROGRESS')", [me.staffNo]),
      me.isManager
        ? leaveApprovees(me).then((list) =>
            list.length ? scalar(`SELECT COUNT(*) FROM leave_dump WHERE ${inList('staff_no', list)} AND status IN ('HEAD-PENDING', 'STAFF-PENDING')`, list) : 0,
          )
        : 0,
    ])
    return c.json({ me, year, leave, pendingLeave, nextLeave, circulars, unread, openRequests, approvals })
  })

  // ------------------------------------------------------------ Profile

  .get('/profile', async (c) => {
    const me = c.get('staff')
    const [profile, relatives, banks, qualifications] = await Promise.all([
      loadStaffProfile(me.staffNo),
      listRelatives(me.staffNo),
      listBanks(me.staffNo),
      listQualifications(me.staffNo),
    ])
    // Staff see only the last digits of their account numbers.
    const masked = banks.map((b) => ({ ...b, accountNo: b.accountNo ? `•••• ${String(b.accountNo).slice(-4)}` : null }))
    const { dobLog: _dobLog, ...rest } = profile as Record<string, unknown>
    return c.json({ ...rest, relatives: relatives.filter((r) => r.active === '1'), banks: masked, qualifications })
  })
  .put('/profile/contact', validate('json', contactUpdateSchema), async (c) => {
    const me = c.get('staff')
    const d = c.req.valid('json')
    await exec(
      `UPDATE staff SET phone = ?, email = ?, address = ?, paddress = ?, emergency_name = ?, emergency_relation = ?, emergency_phone = ?,
              emergency_address = ?, ghana_card_no = ?, nhis_number = ?, nhis_expire_date = ?, updated_at = NOW() WHERE staff_no = ?`,
      [d.phone, d.email, d.address, d.paddress, d.emergencyName, d.emergencyRelation, d.emergencyPhone, d.emergencyAddress, d.ghanaCardNo, d.nhisNumber, d.nhisExpireDate, me.staffNo],
    )
    audit(null, 'update', 'staff', me.staffNo, say(me, 'updated their contact details'))
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Circulars & notifications

  .get('/circulars', async (c) => {
    const me = c.get('staff')
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 15)
    const search = q.q ? ' AND (c.subject LIKE ? OR c.letter_no LIKE ? OR c.message LIKE ?)' : ''
    const params = [me.staffNo, ...(q.q ? [like(q.q), like(q.q), like(q.q)] : [])]
    const [data, total, unread] = await Promise.all([
      rows(
        `SELECT c.id, c.letter_no, c.subject, LEFT(COALESCE(NULLIF(c.sms_note, ''), c.message), 220) AS excerpt, c.published_at,
                c.attachment IS NOT NULL AS has_attachment, COALESCE(n.read_flag, '0') = '1' AS is_read
           ${MY_CIRCULARS}${search} ORDER BY c.published_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${MY_CIRCULARS}${search}`, params),
      scalar(`SELECT COUNT(*) ${MY_CIRCULARS} AND COALESCE(n.read_flag, '0') = '0'`, [me.staffNo]),
    ])
    return c.json({ data, total, page, pageSize, unread })
  })
  .get('/circulars/:id', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const row = await one<Record<string, any>>(
      `SELECT c.id, c.letter_no, c.subject, c.message, c.published_at, c.attachment, c.attachment_name, r.notification_id ${MY_CIRCULARS} AND c.id = ?`,
      [me.staffNo, id],
    )
    if (!row) throw notFound('Circular')
    if (row.notificationId) await exec("UPDATE notification SET read_flag = '1' WHERE id = ? AND staff_no = ?", [row.notificationId, me.staffNo])
    const pdf = publicLink({ id, attachment: row.attachment, attachmentName: row.attachmentName }, new URL(c.req.url).origin)
    const { attachment: _a, notificationId: _n, ...rest } = row
    return c.json({ ...rest, pdfUrl: pdf })
  })
  .get('/notifications', async (c) => {
    const me = c.get('staff')
    const { page, pageSize, limit, offset } = paging(c.req.query(), 20)
    const [data, total] = await Promise.all([
      rows(
        `SELECT id, type, action, title, message, read_flag = '1' AS is_read, priority = '2' AS important, datetime
           FROM notification WHERE staff_no = ? ORDER BY datetime DESC, id DESC LIMIT ? OFFSET ?`,
        [me.staffNo, limit, offset],
      ),
      scalar('SELECT COUNT(*) FROM notification WHERE staff_no = ?', [me.staffNo]),
    ])
    return c.json({ data, total, page, pageSize })
  })
  .post('/notifications/read', validate('json', z.object({ ids: z.array(z.number().int().positive()).max(200).optional() })), async (c) => {
    const me = c.get('staff')
    const { ids } = c.req.valid('json')
    if (ids?.length) await exec(`UPDATE notification SET read_flag = '1' WHERE staff_no = ? AND ${inList('id', ids)}`, [me.staffNo, ...ids])
    else await exec("UPDATE notification SET read_flag = '1' WHERE staff_no = ? AND read_flag = '0'", [me.staffNo])
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Leave

  .get('/leave/types', async (c) => c.json(await rows("SELECT id, title, `desc` AS description FROM leave_type WHERE active = 1 ORDER BY title")))
  .get('/leave/period', async (c) => {
    const me = c.get('staff')
    const { start } = c.req.query()
    const days = Number(c.req.query('days'))
    if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !(days >= 1)) return c.json(null)
    return c.json(await leavePeriod(start, days, countsWeekends(me.staffGroup)))
  })
  .get('/leave', async (c) => {
    const me = c.get('staff')
    const year = Number(c.req.query('year')) || new Date().getFullYear()
    const [summary, applications] = await Promise.all([
      leaveYear(await requireStaff(me.staffNo), year),
      rows(
        `SELECT l.id, t.title AS type, l.start_date, l.end_date, l.resume_date, l.approved_days, l.applied_date, l.status,
                l.head_remark, l.hr_remark, ${nameSql('r')} AS reliever_name
           FROM leave_dump l LEFT JOIN leave_type t ON t.id = l.type_id LEFT JOIN staff r ON r.staff_no = l.relieved_by
          WHERE l.staff_no = ? AND (YEAR(l.start_date) = ? OR l.status IN ${OPEN_LEAVE})
          ORDER BY l.start_date DESC, l.id DESC`,
        [me.staffNo, year],
      ),
    ])
    return c.json({ year, summary, applications })
  })
  .get('/leave/:id', async (c) => {
    const me = c.get('staff')
    const leave = await one(
      `SELECT l.*, t.title AS type, ${nameSql('r')} AS reliever_name, ${nameSql('h')} AS head_name, ${nameSql('a')} AS approver_name
         FROM leave_dump l LEFT JOIN leave_type t ON t.id = l.type_id
         LEFT JOIN staff r ON r.staff_no = l.relieved_by LEFT JOIN staff h ON h.staff_no = l.head_endorse
         LEFT JOIN staff a ON a.staff_no = l.hr_endorse
        WHERE l.id = ? AND l.staff_no = ?`,
      [parseId(c.req.param('id')), me.staffNo],
    )
    if (!leave) throw notFound('Leave application')
    const staff = await one(`SELECT ${BRIEF_COLUMNS}, s.address, s.emergency_name, s.emergency_phone FROM staff s ${PLACEMENT} WHERE s.staff_no = ?`, [me.staffNo])
    const year = Number(String(leave.startDate ?? '').slice(0, 4)) || new Date().getFullYear()
    return c.json({ ...leave, staff, summary: await leaveYear(await requireStaff(me.staffNo), year) })
  })
  .post('/leave', validate('json', portalLeaveSchema), async (c) => {
    const me = c.get('staff')
    const { days, ...data } = c.req.valid('json')
    if (!(await one('SELECT id FROM leave_type WHERE id = ? AND active = 1', [data.typeId]))) throw new AppError('That leave type is not open for applications.', 422)
    const staff = await requireStaff(me.staffNo)
    // The staff member gives the days and the expected start; the last day and
    // the resumption date follow from the calendar. The head names the reliever.
    const period = await leavePeriod(data.startDate, days, countsWeekends(staff.staffGroup))
    const counted = await checkApplication({ ...data, staffNo: me.staffNo, startDate: period.startDate, endDate: period.endDate }, staff, null)
    const id = await insert('leave_dump', {
      ...data,
      ...counted,
      startDate: period.startDate,
      endDate: period.endDate,
      staffNo: me.staffNo,
      status: 'HEAD-PENDING',
      appliedDate: new Date(),
      updatedAt: new Date(),
    })
    audit(null, 'create', 'leave', id, say(me, `applied for ${counted.approvedDays} days of leave from ${period.startDate}`))
    return c.json({ id, days: counted.approvedDays, startDate: period.startDate, endDate: period.endDate, resumeDate: counted.resumeDate }, 201)
  })
  .post('/leave/:id/cancel', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const done = await exec(`UPDATE leave_dump SET status = 'CANCELLED', updated_at = NOW() WHERE id = ? AND staff_no = ? AND status IN ${OPEN_LEAVE}`, [id, me.staffNo])
    if (!done.affectedRows) throw new AppError('Only applications that are still pending can be withdrawn.', 409)
    audit(null, 'update', 'leave', id, say(me, `withdrew leave application #${id}`))
    return c.json({ ok: true })
  })
  .get('/colleagues', async (c) => {
    const me = c.get('staff')
    const q = (c.req.query('q') ?? '').trim()
    const units = me.unitId ? [me.unitId, ...(await teamUnits(me))] : await teamUnits(me)
    const scope = q.length >= 2 ? `(${nameSql()} LIKE ? OR s.staff_no LIKE ?)` : inList('u.id', units)
    const found = await rows<{ value: number; fullName: string; unitName: string | null }>(
        `SELECT s.staff_no AS value, ${nameSql()} AS full_name, u.long_name AS unit_name
           FROM staff s ${PLACEMENT}
          WHERE s.staff_no <> ? AND s.staff_no > 0 AND s.staff_status IN ('PERMANENT', 'TEMPORAL', 'CASUAL', 'PART-TIME', 'SECONDMENT')
            AND COALESCE(s.flag_delete, 0) = 0 AND COALESCE(s.flag_leave, 0) = 0 AND ${scope}
          ORDER BY full_name LIMIT 30`,
        [me.staffNo, ...(q.length >= 2 ? [like(q), like(q)] : units)],
      )
    // Display names are proper-cased by the row mapper (…_name columns).
    return c.json(found.map((r) => ({ value: r.value, label: r.fullName, hint: `${r.value}${r.unitName ? ` · ${r.unitName}` : ''}` })))
  })

  // ------------------------------------------------------------ Promotion, study, appraisal, tax

  // ------------------------------------------------------------ Promotion & contract renewal

  .get('/promotion', async (c) => {
    const me = c.get('staff')
    const [applications, mine] = await Promise.all([
      rows<Record<string, any>>(
        `SELECT p.promotion_id AS id, p.type, p.promo_status, p.stage_status, p.returned, p.promo_comments AS kind, p.submitted_at, p.activity_date,
                j.title AS applied_rank
           FROM staff_promotion p LEFT JOIN job j ON j.id = p.position_id
          WHERE p.staff_no = ? ORDER BY COALESCE(p.submitted_at, p.activity_date) DESC`,
        [String(me.staffNo)],
      ),
      one<{ jobType: string | null }>(
        'SELECT j.type AS job_type FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id LEFT JOIN job j ON j.id = COALESCE(cp.job_id, s.job_id) WHERE s.staff_no = ?',
        [me.staffNo],
      ),
    ])
    // Ranks to apply for: designations of the same kind as theirs (academic or not), as the old portal offered.
    const ranks = await rows(`SELECT id AS value, title AS label FROM job WHERE active = '1'${mine?.jobType ? ' AND type = ?' : ''} ORDER BY title`, mine?.jobType ? [mine.jobType] : [])
    const open = (type: number) => applications.find((a) => Number(a.type) === type && ![7, 8].includes(Number(a.promoStatus)))
    return c.json({
      applications: applications.map((a) => ({ ...a, state: promotionState(a as never) })),
      ranks,
      detailed: me.staffGroup === 'SM',
      open: { promotion: open(0)?.id ?? null, renewal: open(1)?.id ?? null },
    })
  })
  .get('/promotion/:id', async (c) => {
    const me = c.get('staff')
    const file = await loadPromotion(parseId(c.req.param('id')))
    if (!file || Number(file.staffNo) !== me.staffNo) throw notFound('Application')
    return c.json(file)
  })
  .get('/promotion/:id/file', async (c) => streamPromotionFile(c, parseId(c.req.param('id')), c.get('staff').staffNo, 'own'))
  .post('/promotion', validate('json', promotionApplySchema), async (c) => {
    const me = c.get('staff')
    const d = c.req.valid('json')
    if (!d.submit && me.staffGroup !== 'SM') d.submit = true
    const id = await saveApplication(me, d, null)
    audit(null, 'create', 'promotion', id, say(me, d.submit ? `applied for ${d.type === 1 ? 'contract renewal' : 'promotion'} (#${id})` : `saved a draft promotion application (#${id})`))
    if (d.submit) await notifyLevelHeads(id, 1)
    return c.json({ id }, 201)
  })
  .put('/promotion/:id', validate('json', promotionApplySchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const draft = await one('SELECT promotion_id FROM staff_promotion WHERE promotion_id = ? AND staff_no = ? AND promo_status = 0', [id, String(me.staffNo)])
    if (!draft) throw new AppError('Only a draft can be edited. A submitted application changes only when a level returns it to you.', 409)
    const d = c.req.valid('json')
    await saveApplication(me, d, id)
    audit(null, 'update', 'promotion', id, say(me, d.submit ? `submitted promotion application #${id}` : `updated draft promotion application #${id}`))
    if (d.submit) await notifyLevelHeads(id, 1)
    return c.json({ id })
  })
  .delete('/promotion/:id', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const done = await exec('DELETE FROM staff_promotion WHERE promotion_id = ? AND staff_no = ? AND promo_status = 0', [id, String(me.staffNo)])
    if (!done.affectedRows) throw new AppError('Only a draft can be deleted.', 409)
    await exec('DELETE FROM promotion_data WHERE promo_id = ?', [id])
    await exec('UPDATE promo_papers SET deleted = 1 WHERE promo_id = ?', [id])
    audit(null, 'delete', 'promotion', id, say(me, `deleted draft promotion application #${id}`))
    return c.json({ ok: true })
  })
  .post('/promotion/:id/resubmit', validate('json', promotionResubmitSchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const label = await resubmit(me, id, c.req.valid('json'))
    audit(null, 'update', 'promotion', id, say(me, `resubmitted promotion application #${id}: ${label}`))
    const level = Number((await one<{ promoStatus: number }>('SELECT promo_status FROM staff_promotion WHERE promotion_id = ?', [id]))?.promoStatus ?? 1)
    await notifyLevelHeads(id, level)
    return c.json({ ok: true })
  })
  .get('/study', async (c) => {
    const me = c.get('staff')
    const [intentions, requests, leaves] = await Promise.all([
      rows<Record<string, any>>(
        `SELECT id, int_prog, study_place, date_commence, prog_duration, study_mode, appstatus, stage_status, sub_date, remarks
           FROM study_intention WHERE staff_no = ? ORDER BY sub_date DESC, id DESC`,
        [me.staffNo],
      ),
      rows('SELECT id, study_type, study_nature, study_program, study_institute, study_start, study_end, apply_status, apply_date FROM study_request WHERE staff_no = ? ORDER BY apply_date DESC', [me.staffNo]),
      rows('SELECT * FROM study_leave WHERE staff_no = ? ORDER BY id DESC', [me.staffNo]),
    ])
    return c.json({ intentions: intentions.map((i) => ({ ...i, stageLabel: STUDY_STAGES[Number(i.appstatus)] ?? '—' })), requests, leaves })
  })
  // ------------------------------------------------------------ Appraisal (Form A from the supervisor, Form B by the staff member)

  .get('/appraisal', async (c) => {
    const me = c.get('staff')
    const [formA, formB, head] = await Promise.all([
      formASummaries([me.staffNo]),
      rows('SELECT app_self_id AS id, yr_onreview AS year, supervisor_name, app_status, sup_signed_at, COALESCE(emp_signed_at, activity_date) AS submitted_at FROM staff_self_appraisal WHERE staff_no = ? ORDER BY yr_onreview DESC, app_self_id DESC', [me.staffNo]),
      // Suggested supervisor: the head of their unit.
      me.unitId
        ? one<{ fullName: string; jobTitle: string | null }>(
            `SELECT ${nameSql('h')} AS full_name, j.title AS job_title FROM unit u JOIN staff h ON h.staff_no = u.unit_head
               LEFT JOIN promotion hp ON hp.id = h.promo_id LEFT JOIN job j ON j.id = COALESCE(hp.job_id, h.job_id) WHERE u.id = ? AND u.unit_head <> ?`,
            [me.unitId, me.staffNo],
          )
        : null,
    ])
    return c.json({ formA, formB, supervisor: head ? { name: head.fullName, rank: properName(head.jobTitle) ?? null } : null, year: String(new Date().getFullYear()) })
  })
  .get('/appraisal/questions', async (c) => c.json(await appraisalQuestions()))
  .get('/appraisal/a/:year', async (c) => {
    const form = await loadFormA(c.get('staff').staffNo, c.req.param('year'))
    if (!form) throw notFound('Appraisal')
    return c.json(form)
  })
  .post('/appraisal/a/:year/sign', validate('json', formASignSchema), async (c) => {
    const me = c.get('staff')
    const year = c.req.param('year')
    const done = await exec(
      `UPDATE staff_appraisal SET emp_comments = ?, emp_signed = ?, emp_signed_at = NOW(), app_status = 2
        WHERE staff_no = ? AND yr_onreview = ? AND app_status = 1`,
      [c.req.valid('json').comments, EMPLOYEE_SIGNED, me.staffNo, year],
    )
    if (!done.affectedRows) throw new AppError('There is no appraisal waiting for your signature for that year.', 409)
    audit(null, 'update', 'appraisal', me.staffNo, say(me, `signed their ${year} appraisal (Form A)`))
    return c.json({ ok: true })
  })
  .get('/appraisal/b/:id', async (c) => {
    const form = await loadFormB({ id: parseId(c.req.param('id')), staffNo: c.get('staff').staffNo })
    if (!form) throw notFound('Self-appraisal')
    return c.json(form)
  })
  .post('/appraisal/b', validate('json', selfAppraisalSchema), async (c) => {
    const me = c.get('staff')
    const d = c.req.valid('json')
    if (await one('SELECT app_self_id FROM staff_self_appraisal WHERE staff_no = ? AND yr_onreview = ?', [me.staffNo, d.year]))
      throw new AppError(`You have already submitted a self-appraisal for ${d.year}. Open it to make changes before your supervisor countersigns.`, 409)
    const id = await insert('staff_self_appraisal', {
      staffNo: me.staffNo,
      supervisorName: d.supervisorName,
      supervisorsRank: d.supervisorsRank,
      yrOnreview: d.year,
      accomplishments: d.accomplishments,
      barriersChallenges: d.barriersChallenges,
      barriersChallengesGoal: d.barriersChallengesGoal,
      strengthImprovement: d.strengthImprovement,
      newKnowledge: d.newKnowledge,
      otherInformation: d.otherInformation,
      empSigned: EMPLOYEE_SIGNED,
      empSignedAt: new Date(),
      appStatus: 1,
    })
    audit(null, 'create', 'appraisal', id, say(me, `submitted their ${d.year} self-appraisal (Form B)`))
    return c.json({ id }, 201)
  })
  .put('/appraisal/b/:id', validate('json', selfAppraisalSchema), async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const d = c.req.valid('json')
    const done = await exec(
      `UPDATE staff_self_appraisal SET supervisor_name = ?, supervisors_rank = ?, accomplishments = ?, barriers_challenges = ?, barriers_challenges_goal = ?,
              strength_improvement = ?, new_knowledge = ?, other_information = ?, emp_signed_at = NOW()
        WHERE app_self_id = ? AND staff_no = ? AND app_status = 1`,
      [d.supervisorName, d.supervisorsRank, d.accomplishments, d.barriersChallenges, d.barriersChallengesGoal, d.strengthImprovement, d.newKnowledge, d.otherInformation, id, me.staffNo],
    )
    if (!done.affectedRows) throw new AppError('This self-appraisal has been countersigned and can no longer be changed.', 409)
    audit(null, 'update', 'appraisal', id, say(me, `updated their ${d.year} self-appraisal`))
    return c.json({ id })
  })
  .get('/tax', async (c) => {
    const me = c.get('staff')
    const years = (await rows<{ year: number }>('SELECT DISTINCT CAST(TheYear AS UNSIGNED) AS year FROM gratax WHERE EmployeeNumber = ? ORDER BY year DESC', [String(me.staffNo)])).map((r) => r.year)
    const year = Number(c.req.query('year')) || years[0] || null
    const months = year
      ? await rows(
          `SELECT CAST(TheMonth AS UNSIGNED) AS month, BasicSalary AS basic, TaxableAllowance AS taxable_allowance, NonTaxableAllowance AS non_taxable_allowance,
                  gross, TaxRelief AS relief, ssr, Taxable_Emol AS taxable, IRSTax AS tax, JobTitle AS job_title, SSN AS ssn
             FROM gratax WHERE EmployeeNumber = ? AND TheYear = ? ORDER BY month`,
          [String(me.staffNo), String(year)],
        )
      : []
    return c.json({ years, year, months })
  })

  // ------------------------------------------------------------ Support requests

  .post('/files', async (c) => {
    const body = await c.req.parseBody()
    if (!(body.file instanceof File)) throw new AppError('Choose a file to upload.', 422)
    return c.json(await saveUpload(body.file, ATTACHMENT_EXTENSIONS), 201)
  })

  .get('/requests', async (c) => {
    const me = c.get('staff')
    const category = c.req.query('category')
    return c.json(
      await rows(
        `SELECT id, category, title, description, attachment, attachment_name, status, response, responded_at, created_at, updated_at
           FROM staff_request WHERE staff_no = ?${category ? ' AND category = ?' : ''} ORDER BY created_at DESC, id DESC`,
        category ? [me.staffNo, category] : [me.staffNo],
      ),
    )
  })
  .post('/requests', validate('json', serviceRequestSchema), async (c) => {
    const me = c.get('staff')
    const d = c.req.valid('json')
    const open = await scalar("SELECT COUNT(*) FROM staff_request WHERE staff_no = ? AND status IN ('OPEN', 'IN_PROGRESS')", [me.staffNo])
    if (Number(open) >= 10) throw new AppError('You have 10 open requests. Please wait for some to be resolved first.', 429)
    const id = await insert('staff_request', { staffNo: me.staffNo, category: d.category, title: d.title, description: d.description, attachment: d.attachment, attachmentName: d.attachment ? (d.attachmentName ?? 'Attachment') : null, status: 'OPEN' })
    audit(null, 'create', 'service_request', id, say(me, `opened a ${d.category.toLowerCase()} request: ${d.title}`))
    return c.json({ id }, 201)
  })
  .post('/requests/:id/close', async (c) => {
    const me = c.get('staff')
    const id = parseId(c.req.param('id'))
    const done = await exec("UPDATE staff_request SET status = 'CLOSED' WHERE id = ? AND staff_no = ? AND status <> 'CLOSED'", [id, me.staffNo])
    if (!done.affectedRows) throw notFound('Request')
    return c.json({ ok: true })
  })
