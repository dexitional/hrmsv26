// Appointment & promotion applications (legacy staff_promotion) as they move
// through the approval stages:
//
//   0 submitted → 1 head of department → 2 dean/faculty → 3 college/provost
//   → 4 Directorate of HR → 5 assessors → 6 A&P board → 7 approved | 8 disapproved
//
// From level 4 HR also records its processing steps (hr_variable: received by
// DHR, nomination by VC, assessors' consent, …). Every action is logged in
// promo_activities, the same trail the staff portal writes to.
//
//   GET  /api/promotions/applications?level=&type=&kind=&q=&page=
//   GET  /api/promotions/applications/:id            application, form, papers, timeline, assessors
//   POST /api/promotions/applications                HR records an application on a staff member's behalf
//   POST /api/promotions/applications/:id/action     advance | return | assessors | disapprove
//   POST /api/promotions/applications/:id/effect     create the appointment/promotion record and approve
//   GET  /api/promotions/steps                       HR processing steps
//   CRUD /api/promotions/assessors
import { Hono } from 'hono'
import { APPLICATION_TYPES, PROMOTION_LEVELS } from '@hrms/db'
import { assessorSchema, effectPromotionSchema, promotionActionSchema, promotionApplicationSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { BRIEF_COLUMNS, PLACEMENT, idList, nameSql, requireStaff, syncPlacement } from '../lib/hr'
import { cleanHtml } from '../lib/rich-text'
import { validate } from '../lib/validate'

const view = requirePermission('promotions', 'view')
const edit = requirePermission('promotions', 'edit')
const manage = requirePermission('promotions', 'manage')

const COLUMNS = `p.promotion_id AS id, p.staff_no, ${nameSql()} AS full_name, p.type, p.promo_comments, p.promo_status,
  p.stage_status, p.stage, p.returned, p.hr_step, v.data AS hr_step_label, p.position_id, tj.title AS position_title,
  p.job_id, cj.title AS current_title, p.unit_id, u.long_name AS unit_name, p.staff_group, p.submitted_at,
  p.activity_date, p.updated_at, p.app_letter, p.apply_form, p.promo_doc1, p.promo_doc2, p.effected_promo_id,
  p.assessor1, p.assessor2, p.assessor3, p.assessor4, p.assessor5, p.assessor6`

const FROM = `FROM staff_promotion p LEFT JOIN staff s ON s.staff_no = p.staff_no
  LEFT JOIN job tj ON tj.id = p.position_id LEFT JOIN job cj ON cj.id = p.job_id
  LEFT JOIN unit u ON u.id = p.unit_id LEFT JOIN hr_variable v ON v.id = p.hr_step`

/** promotion_data columns holding rich text from the staff portal. */
const FORM_HTML = [
  'firstDegreeDetails',
  'pgDegreeDetails',
  'prizesGrantAward',
  'previousPostDuties',
  'teachingDutiesExperience',
  'conferenceSeminarsEtc',
  'publicationsForPreviousPromotion',
  'newPublicationSubmitted',
  'professionalMembershipBodies',
  'otherRelevantInfo',
  'areaSpecialization',
  'researchMajorProjects',
  'otherQualification',
  'studAppraisal',
] as const

async function hrUnitId() {
  return Number((await scalar("SELECT id FROM unit WHERE long_name LIKE 'DIRECTORATE OF HUMAN RESOURCE%' ORDER BY id LIMIT 1")) ?? 0)
}

async function logActivity(
  promotionId: number,
  me: { staffNo: number | null; id: number; fullName: string },
  entry: { stage: string; level: number; activity: number; comments?: string | null; returned?: boolean },
) {
  await insert('promo_activities', {
    userId: me.staffNo ?? me.id,
    unitId: await hrUnitId(),
    promotionId,
    stageActivity: entry.stage,
    comments: [entry.comments, `— ${me.fullName} (HR)`].filter(Boolean).join('\n'),
    promoStatus: entry.level,
    activity: entry.activity,
    type: 0,
    returned: entry.returned ? 1 : 0,
  })
}

export const promotionsRoute = new Hono()
  .get('/steps', view, async (c) => c.json(await rows('SELECT id, data AS label FROM hr_variable ORDER BY id')))

  .get('/applications', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.type !== undefined && q.type !== '') (where.push('p.type = ?'), params.push(Number(q.type)))
    if (q.kind) (where.push('p.promo_comments = ?'), params.push(q.kind))
    if (q.year) (where.push('YEAR(p.submitted_at) = ?'), params.push(Number(q.year)))
    if (q.q) (where.push(`(${nameSql()} LIKE ? OR p.staff_no = ? OR tj.title LIKE ?)`), params.push(like(q.q), q.q, like(q.q)))
    const base = `${FROM} WHERE ${where.join(' AND ')}`
    const lw = q.level === 'returned' ? ' AND p.stage_status >= 10' : q.level ? ' AND p.promo_status = ?' : ''
    const lp = q.level && q.level !== 'returned' ? [Number(q.level)] : []
    const [data, total, counts, returned] = await Promise.all([
      rows(`SELECT ${COLUMNS} ${base}${lw} ORDER BY COALESCE(p.updated_at, p.submitted_at) DESC, p.promotion_id DESC LIMIT ? OFFSET ?`, [
        ...params,
        ...lp,
        limit,
        offset,
      ]),
      scalar(`SELECT COUNT(*) ${base}${lw}`, [...params, ...lp]),
      rows(`SELECT p.promo_status AS status, COUNT(*) AS count ${base} GROUP BY p.promo_status`, params),
      scalar(`SELECT COUNT(*) ${base} AND p.stage_status >= 10`, params),
    ])
    return c.json({
      data,
      total,
      page,
      pageSize,
      counts: [...counts.map((r) => ({ status: String(r.status), count: Number(r.count) })), { status: 'returned', count: Number(returned) }],
    })
  })

  .get('/applications/:id', view, async (c) => {
    const id = parseId(c.req.param('id'))
    const app = await one(`SELECT ${COLUMNS} ${FROM} WHERE p.promotion_id = ?`, [id])
    if (!app) throw notFound('Application')
    const assessorIds = idList([app.assessor1, app.assessor2, app.assessor3, app.assessor4, app.assessor5, app.assessor6].filter(Boolean).join(','))
    const [staff, form, papers, activities, assessors] = await Promise.all([
      one(`SELECT ${BRIEF_COLUMNS}, NULLIF(s.first_appoint_date, '0000-00-00') AS first_appoint_date FROM staff s ${PLACEMENT} WHERE s.staff_no = ?`, [app.staffNo]),
      one('SELECT * FROM promotion_data WHERE promo_id = ? ORDER BY id DESC LIMIT 1', [id]),
      rows('SELECT id, title, link, file, type, status, date_submitted FROM promo_papers WHERE promo_id = ? AND COALESCE(deleted, 0) = 0 ORDER BY id', [id]),
      rows(
        `SELECT a.activity_id AS id, a.stage_activity, a.comments, a.promo_status, a.activity, a.returned, a.activity_date,
                a.user_id, ${nameSql()} AS user_name, u.long_name AS unit_name
           FROM promo_activities a LEFT JOIN staff s ON s.staff_no = a.user_id LEFT JOIN unit u ON u.id = a.unit_id
          WHERE a.promotion_id = ? ORDER BY a.activity_date, a.activity_id`,
        [id],
      ),
      assessorIds.length ? rows('SELECT * FROM assessors WHERE assessor_id IN (?)', [assessorIds]) : [],
    ])
    if (form) for (const key of FORM_HTML) form[key] = cleanHtml(form[key])
    return c.json({
      ...app,
      typeLabel: APPLICATION_TYPES[app.type] ?? 'Promotion',
      levelLabel: PROMOTION_LEVELS[app.promoStatus] ?? `Level ${app.promoStatus}`,
      assessorIds,
      staff,
      form,
      papers,
      activities,
      assessors,
    })
  })

  .post('/applications', edit, validate('json', promotionApplicationSchema), async (c) => {
    const data = c.req.valid('json')
    const me = c.get('user')
    const staff = await requireStaff(data.staffNo)
    // Applications HR records itself start at the Directorate of HR.
    const id = await insert('staff_promotion', {
      staffNo: String(staff.staffNo),
      positionId: data.positionId,
      jobId: staff.jobId,
      unitId: staff.unitId,
      scaleId: staff.scaleId,
      staffGroup: staff.staffGroup,
      type: data.type,
      promoComments: data.type === 0 ? data.promoComments : APPLICATION_TYPES[data.type]?.toUpperCase(),
      appLetter: data.appLetter,
      applyForm: data.applyForm,
      stage: 'RECEIVED BY DHR',
      promoStatus: 4,
      stageStatus: 0,
      hrStep: '01',
      returned: 0,
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    await logActivity(id, me, { stage: `${APPLICATION_TYPES[data.type]} application recorded by HR`, level: 4, activity: 0 })
    audit(me, 'create', 'promotion', id, `${APPLICATION_TYPES[data.type]} application for ${staff.fullName}`)
    return c.json({ id }, 201)
  })

  .post('/applications/:id/action', edit, validate('json', promotionActionSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const me = c.get('user')
    const body = c.req.valid('json')
    const app = await one<{ promoStatus: number; staffNo: string; effectedPromoId: number | null }>(
      'SELECT promo_status, staff_no, effected_promo_id FROM staff_promotion WHERE promotion_id = ?',
      [id],
    )
    if (!app) throw notFound('Application')
    if (app.promoStatus === 8) throw new AppError('This application was disapproved.', 409)

    if (body.action === 'advance') {
      const step = body.hrStep ? await one<{ data: string }>('SELECT data FROM hr_variable WHERE id = ?', [body.hrStep]) : null
      if (body.hrStep && !step) throw new AppError('Unknown HR processing step.', 422)
      const stage = step?.data ?? (body.level === 7 ? 'Approved' : `Forwarded to ${PROMOTION_LEVELS[body.level]}`)
      await exec(
        `UPDATE staff_promotion SET promo_status = ?, stage_status = 1, stage = ?, hr_step = COALESCE(?, hr_step),
                returned = 0, promo_comments = COALESCE(promo_comments, ''), updated_at = NOW() WHERE promotion_id = ?`,
        [body.level, stage, body.hrStep, id],
      )
      await logActivity(id, me, { stage, level: body.level, activity: 1, comments: body.comments })
      audit(me, 'update', 'promotion', id, `Application of staff ${app.staffNo}: ${stage}`)
    } else if (body.action === 'return') {
      const toHead = body.to === 'head'
      const stage = toHead ? 'Reverse to HOD' : 'Re-submit Curriculum Vitae (CV), Papers & Application form'
      const level = toHead ? 1 : app.promoStatus
      await exec('UPDATE staff_promotion SET stage_status = ?, stage = ?, returned = 1, promo_status = ?, updated_at = NOW() WHERE promotion_id = ?', [
        toHead ? 14 : 10,
        stage,
        level,
        id,
      ])
      await logActivity(id, me, { stage, level, activity: toHead ? 14 : 10, comments: body.comments, returned: true })
      audit(me, 'update', 'promotion', id, `Returned application of staff ${app.staffNo} to the ${body.to}`)
    } else if (body.action === 'assessors') {
      const ids = body.assessors
      const known = ids.length ? await rows<{ assessorId: number }>('SELECT assessor_id FROM assessors WHERE assessor_id IN (?)', [ids]) : []
      if (known.length !== ids.length) throw new AppError('One of the assessors no longer exists.', 422)
      const slots = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`assessor${i + 1}`, ids[i] ? String(ids[i]) : null]))
      await update('staff_promotion', id, { ...slots, promoStatus: 5, stageStatus: 1, stage: 'Assessor Assigned', hrStep: '04', updatedAt: new Date() }, undefined, 'promotion_id')
      await logActivity(id, me, { stage: 'Assessor Assigned', level: 5, activity: 1, comments: body.comments ?? `${ids.length} assessor(s) assigned` })
      audit(me, 'update', 'promotion', id, `Assigned ${ids.length} assessor(s) to application of staff ${app.staffNo}`)
    } else {
      await exec("UPDATE staff_promotion SET promo_status = 8, stage_status = 2, stage = 'DISAPPROVED', hr_step = '11', updated_at = NOW() WHERE promotion_id = ?", [id])
      await logActivity(id, me, { stage: 'Disapproved', level: 8, activity: 2, comments: body.comments })
      audit(me, 'update', 'promotion', id, `Disapproved application of staff ${app.staffNo}`)
    }
    return c.json({ ok: true })
  })

  .post('/applications/:id/effect', manage, validate('json', effectPromotionSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const me = c.get('user')
    const data = c.req.valid('json')
    const app = await one<{ staffNo: string; type: number; positionId: number; effectedPromoId: number | null; promoStatus: number }>(
      'SELECT staff_no, type, position_id, effected_promo_id, promo_status FROM staff_promotion WHERE promotion_id = ?',
      [id],
    )
    if (!app) throw notFound('Application')
    if (app.effectedPromoId) throw new AppError('This application has already been effected.', 409)
    if (app.promoStatus === 8) throw new AppError('This application was disapproved.', 409)
    if (app.type === 1) throw new AppError('Record contract renewals under Elevation › Senior membership renewals.', 422)
    const staff = await requireStaff(Number(app.staffNo))
    const promoId = await insert('promotion', {
      staffNo: staff.staffNo,
      jobId: app.positionId,
      unitId: staff.unitId,
      scaleId: data.scaleId,
      staffGroup: data.staffGroup,
      appointDate: data.appointDate,
      letterDate: data.letterDate,
      applyType: app.type === 2 ? 'APPOINTMENT' : 'PROMOTION',
      promodId: id,
      createdAt: new Date(),
    })
    await syncPlacement(staff.staffNo, promoId)
    await exec(
      "UPDATE staff_promotion SET promo_status = 7, stage_status = 1, stage = 'Approved', hr_step = '08', effected_promo_id = ?, updated_at = NOW() WHERE promotion_id = ?",
      [promoId, id],
    )
    await logActivity(id, me, { stage: 'Approved', level: 7, activity: 1, comments: `Effective ${data.appointDate}; elevation record #${promoId} created.` })
    audit(me, 'update', 'promotion', id, `Effected ${APPLICATION_TYPES[app.type]?.toLowerCase()} of ${staff.fullName}`)
    return c.json({ ok: true, promoId })
  })

  // ------------------------------------------------------------ Assessors
  .get('/assessors', view, async (c) =>
    c.json(
      await rows(
        `SELECT a.*, (SELECT COUNT(*) FROM staff_promotion p
                       WHERE a.assessor_id IN (p.assessor1, p.assessor2, p.assessor3, p.assessor4, p.assessor5, p.assessor6)) AS assignments
           FROM assessors a ORDER BY a.active DESC, a.lname, a.fname`,
      ),
    ),
  )
  .post('/assessors', edit, validate('json', assessorSchema), async (c) => {
    const data = c.req.valid('json')
    const id = await insert('assessors', { ...data, active: data.active ? 1 : 0, addedUnitId: await hrUnitId() })
    audit(c.get('user'), 'create', 'assessor', id, `Added assessor ${data.fname} ${data.lname}`)
    return c.json({ id }, 201)
  })
  .put('/assessors/:id', edit, validate('json', assessorSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await update('assessors', id, { ...data, active: data.active ? 1 : 0 }, undefined, 'assessor_id'))) throw notFound('Assessor')
    audit(c.get('user'), 'update', 'assessor', id, `Updated assessor ${data.fname} ${data.lname}`)
    return c.json({ id })
  })
  .delete('/assessors/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const used = Number(
      await scalar(
        'SELECT COUNT(*) FROM staff_promotion WHERE ? IN (assessor1, assessor2, assessor3, assessor4, assessor5, assessor6)',
        [String(id)],
      ),
    )
    if (used) {
      await exec('UPDATE assessors SET active = 0 WHERE assessor_id = ?', [id])
      return c.json({ ok: true, deactivated: true })
    }
    const result = await exec('DELETE FROM assessors WHERE assessor_id = ?', [id])
    if (!result.affectedRows) throw notFound('Assessor')
    audit(c.get('user'), 'delete', 'assessor', id, 'Deleted assessor')
    return c.json({ ok: true })
  })

