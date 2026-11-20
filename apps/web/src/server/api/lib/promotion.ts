// Promotion and contract-renewal files (legacy staff_promotion), as the old
// staff portal moved them:
//
//   promo_status: 0 draft · 1 head of department · 2 dean / director ·
//                 3 provost / registrar · 4 Directorate of HR · 5–8 HR's stages
//   stage_status: 0 new or resubmitted · 1 recommended by the previous level ·
//                 2 not recommended (waiting for HR) · 3 legacy "act" state ·
//                 8 / 9 / 11 / 10 returned to the applicant for a new CV /
//                 papers / application form / all three · 13 / 14 sent back a level
//
// The level that acts is promo_status (1–3); which unit's head that is comes
// from the file's unit: its own head (1), the unit it reports to — the
// faculty if it has one, otherwise its parent (2) — and the college, or the
// unit above that (3). Every action is logged in promo_activities.
import type { Context } from 'hono'
import type { z } from 'zod'
import { PROMOTION_LEVELS } from '@hrms/db'
import type { portalPromotionActionSchema, promotionApplySchema, promotionResubmitSchema } from '#/lib/schemas'
import type { PortalUser } from '#/server/portal-session-core'
import { exec, insert, one, rows, withTransaction } from './db'
import { AppError } from './errors'
import { cleanHtml } from './rich-text'
import { readStored } from './storage'
import { nameSql } from './hr'

export const RETURN_REASONS: Record<number, { label: string; resubmit: string }> = {
  8: { label: 'Re-submit Curriculum Vitae (CV)', resubmit: 'Updated CV Uploaded' },
  9: { label: 'Re-submit Papers', resubmit: 'Updated Papers Uploaded' },
  11: { label: 'Re-submit Application Form', resubmit: 'Updated Application Form Uploaded' },
  10: { label: 'Re-submit Curriculum Vitae (CV), Papers & Application form', resubmit: 'Updated CV, Papers and Application Form Uploaded' },
}
/** States in which the level holding the file can act on it. */
export const ACTIONABLE_STAGES = [0, 1, 3, 13, 14]
export const RETURNED_STAGES = [8, 9, 10, 11]
export const LEVEL_NAMES: Record<number, string> = { 1: 'Head of department', 2: 'Dean / Director', 3: 'Provost / Registrar' }

export interface UnitNode {
  id: number
  parentId: number | null
  facultyId: number | null
  collegeId: number | null
  unitHead: number | null
  unitSubhead: number | null
}

export async function unitMap() {
  const list = await rows<UnitNode>('SELECT id, parent_id, faculty_id, college_id, unit_head, unit_subhead FROM unit')
  return new Map(list.map((u) => [u.id, u]))
}

const reportsTo = (u: UnitNode | undefined) => {
  if (!u) return null
  if (u.facultyId && u.facultyId !== u.id) return u.facultyId
  if (u.parentId && u.parentId !== u.id) return u.parentId
  return null
}

/** The units whose heads act at levels 1–3 for a file in this unit. */
export function levelUnits(units: Map<number, UnitNode>, unitId: number | null) {
  const u1 = unitId ? units.get(unitId) : undefined
  const l2 = reportsTo(u1)
  const l3 = u1?.collegeId && u1.collegeId !== l2 && u1.collegeId !== u1.id ? u1.collegeId : reportsTo(l2 ? units.get(l2) : undefined)
  return { 1: u1?.id ?? null, 2: l2, 3: l3 } as Record<number, number | null>
}

const holds = (u: UnitNode | undefined, staffNo: number) => Boolean(u && (Number(u.unitHead) === staffNo || Number(u.unitSubhead) === staffNo))

/**
 * For each file, whether this head holds it now (its level is theirs and it
 * is in an actionable state) and which level they are.
 */
export async function actingLevels(staffNo: number, files: Array<{ unitId: number | null; promoStatus: number; staffNo: number }>) {
  const units = await unitMap()
  return files.map((f) => {
    const levels = levelUnits(units, f.unitId)
    const level = Number(f.promoStatus)
    const mine = level >= 1 && level <= 3 && holds(units.get(levels[level] ?? -1), staffNo)
    return { level, mine: mine && Number(f.staffNo) !== staffNo, levels }
  })
}

/** Every unit whose head could act on some level of a file: used to find a head's queue. */
export async function unitsLevels(staffNo: number) {
  const units = await unitMap()
  const mine = [...units.values()].filter((u) => holds(u, staffNo)).map((u) => u.id)
  return { units, mine: new Set(mine) }
}

/** The paths of every document attached to a file, for access checks. */
export async function promotionPaths(id: number) {
  const [p, d, papers, acts] = await Promise.all([
    rows<Record<string, string | null>>('SELECT promo_doc1, promo_doc2, apply_form, app_letter FROM staff_promotion WHERE promotion_id = ?', [id]),
    rows<Record<string, string | null>>('SELECT app_cv, app_letter, papers, signature FROM promotion_data WHERE promo_id = ?', [id]),
    rows<{ file: string | null }>('SELECT file FROM promo_papers WHERE promo_id = ? AND COALESCE(deleted, 0) = 0', [id]),
    rows<Record<string, string | null>>('SELECT stage_file, updatedpapers, updatedcv, updatedform FROM promo_activities WHERE promotion_id = ?', [id]),
  ])
  const all = [...p, ...d, ...papers, ...acts].flatMap((r) => Object.values(r)).flatMap((v) => String(v ?? '').split(','))
  return new Set(all.map((v) => v.trim()).filter(Boolean))
}

/** Old portal files live on that server: their paths become its public links. */
export function legacyDocUrl(path: string) {
  const base = (process.env.LEGACY_PORTAL_URL || 'https://staffportal.ucc.edu.gh').replace(/\/$/, '')
  const m = path.match(/staffportal\.ucc\.edu\.gh(\/.*)$/)
  return m ? `${base}${m[1]}` : null
}

// ---------------------------------------------------------------- Reading a file


/** "With the dean", "Returned to you: re-submit your CV", … */
export function promotionState(p: { promoStatus: number; stageStatus: number; returned?: number | null }) {
  const level = Number(p.promoStatus)
  const stage = Number(p.stageStatus)
  if (level === 0) return { label: 'Draft — not submitted', tone: 'neutral' as const, withApplicant: true }
  if (RETURNED_STAGES.includes(stage)) return { label: `Returned to the applicant: ${RETURN_REASONS[stage]!.label.toLowerCase()}`, tone: 'warning' as const, withApplicant: true }
  if (stage === 13) return { label: `Sent back to the ${LEVEL_NAMES[level]?.toLowerCase() ?? 'previous level'} and the applicant`, tone: 'warning' as const, withApplicant: true }
  if (level >= 1 && level <= 3 && stage === 2) return { label: `Not recommended by the ${LEVEL_NAMES[level]!.toLowerCase()}`, tone: 'danger' as const, withApplicant: false }
  if (level >= 1 && level <= 3) return { label: `With the ${LEVEL_NAMES[level]!.toLowerCase()}${stage === 14 ? ' (sent back)' : ''}`, tone: 'info' as const, withApplicant: false }
  if (level === 7) return { label: stage === 2 ? 'Not approved' : 'Approved', tone: stage === 2 ? ('danger' as const) : ('success' as const), withApplicant: false }
  if (level === 8) return { label: 'Not approved', tone: 'danger' as const, withApplicant: false }
  return { label: PROMOTION_LEVELS[level] ?? 'In progress', tone: 'info' as const, withApplicant: false }
}

export async function loadPromotion(id: number) {
  const p = await one<Record<string, any>>(
    `SELECT p.*, ${nameSql()} AS full_name, j.title AS applied_rank, cj.title AS current_rank, u.long_name AS unit_name
       FROM staff_promotion p JOIN staff s ON s.staff_no = p.staff_no LEFT JOIN job j ON j.id = p.position_id
       LEFT JOIN job cj ON cj.id = p.job_id LEFT JOIN unit u ON u.id = p.unit_id WHERE p.promotion_id = ?`,
    [id],
  )
  if (!p) return null
  const [details, papers, trail] = await Promise.all([
    one<Record<string, any>>('SELECT * FROM promotion_data WHERE promo_id = ? ORDER BY id DESC LIMIT 1', [id]),
    rows('SELECT id, title, file, unique_num AS link, date_submitted FROM promo_papers WHERE promo_id = ? AND COALESCE(deleted, 0) = 0 ORDER BY id', [id]),
    rows(
      `SELECT a.activity_id AS id, a.stage_activity, a.comments, a.promo_status, a.activity, a.activity_date, a.stage_file, a.updatedcv, a.updatedpapers, a.updatedform,
              ${nameSql('s')} AS actor_name, u.long_name AS actor_unit
         FROM promo_activities a LEFT JOIN staff s ON s.staff_no = a.user_id LEFT JOIN unit u ON u.id = a.unit_id
        WHERE a.promotion_id = ? ORDER BY a.activity_date, a.activity_id`,
      [id],
    ),
  ])
  // Old-portal dossiers were typed in a rich-text editor: keep only safe HTML.
  const cleaned = details ? Object.fromEntries(Object.entries(details).map(([k, v]) => [k, typeof v === 'string' && /<[a-z][\s\S]*>/i.test(v) ? cleanHtml(v) : v])) : null
  return { ...p, staffNo: Number(p.staffNo), state: promotionState(p as never), details: cleaned, papers, trail } as Record<string, any>
}

// ---------------------------------------------------------------- Writing (applicant)


type Apply = z.output<typeof promotionApplySchema>
const cut = (v: string | null | undefined, n: number) => (v ? v.slice(0, n) : null)
const DETAIL_LIMITS: Record<string, number> = { presentRank: 150, presentRankIfany: 150, prEdate: 20, ppEdate: 20, areaSpecialization: 2000 }
const toSnake = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

/** Short particulars are plain text; the dossier answers are rich text, cleaned to safe HTML. */
function detailColumns(details: Apply['details']) {
  return Object.fromEntries(
    Object.entries(details).map(([k, v]) => [k, DETAIL_LIMITS[k] ? cut(v as string | null, DETAIL_LIMITS[k]) : cut(cleanHtml(v as string | null), 60_000)]),
  )
}

async function writePapers(conn: Parameters<typeof exec>[2], staffNo: number, promoId: number, papers: Apply['papers']) {
  await exec('UPDATE promo_papers SET deleted = 1 WHERE promo_id = ?', [promoId], conn)
  for (const p of papers) {
    await exec('INSERT INTO promo_papers (staff_no, promo_id, title, file, link, unique_num, type, status, date_submitted) VALUES (?, ?, ?, ?, ?, ?, 0, 1, NOW())', [
      String(staffNo),
      promoId,
      cut(p.title, 200),
      p.file,
      cut(p.link, 200),
      cut(p.link, 80),
    ], conn)
  }
}

/**
 * The particulars the senior members' promotion form shows (and stores): the
 * department, the college or directorate above it, contacts, and the present
 * rank with the date it took effect.
 */
export async function applicantParticulars(staffNo: number) {
  const p = await one<{ dept: string | null; college: string | null; email: string | null; tel: string | null; presentRank: string | null; prEdate: string | null }>(
    `SELECT u.long_name AS dept, COALESCE(cu.long_name, pu.long_name) AS college, LOWER(TRIM(s.ucc_mail)) AS email, s.phone AS tel,
            j.title AS present_rank, NULLIF(cp.appoint_date, '0000-00-00') AS pr_edate
       FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id
       LEFT JOIN unit u ON u.id = COALESCE(cp.unit_id, s.unit_id)
       LEFT JOIN unit cu ON cu.id = NULLIF(u.college_id, u.id) LEFT JOIN unit pu ON pu.id = NULLIF(u.parent_id, u.id)
       LEFT JOIN job j ON j.id = COALESCE(cp.job_id, s.job_id)
      WHERE s.staff_no = ?`,
    [staffNo],
  )
  return p ? { ...p, prEdate: p.prEdate ? String(p.prEdate).slice(0, 10) : null } : null
}

/** Contract renewal is for senior members; their promotion form needs a signature before it is submitted. */
export function checkApplicant(me: PortalUser, d: Apply) {
  const sm = me.staffGroup === 'SM'
  if (d.type === 1 && !sm) throw new AppError('Contract renewal applications are for senior members.', 403)
  if (sm && d.type === 0 && d.submit && !d.signature) throw new AppError('Upload your signature (a picture of it) before you submit.', 422)
}

/** Creates a draft or a submitted application, or (id given) updates a draft. */
export async function saveApplication(me: PortalUser, d: Apply, draftId: number | null) {
  const current = await one<{ jobId: number | null; scaleId: number | null; unitId: number | null; staffGroup: string | null; unitName: string | null; collegeId: number | null; email: string | null; phone: string | null }>(
    `SELECT COALESCE(cp.job_id, s.job_id) AS job_id, COALESCE(cp.scale_id, s.scale_id) AS scale_id, COALESCE(cp.unit_id, s.unit_id) AS unit_id,
            COALESCE(cp.staff_group, s.staff_group) AS staff_group, u.long_name AS unit_name, COALESCE(u.college_id, u.parent_id) AS college_id,
            LOWER(TRIM(s.ucc_mail)) AS email, s.phone
       FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id LEFT JOIN unit u ON u.id = COALESCE(cp.unit_id, s.unit_id) WHERE s.staff_no = ?`,
    [me.staffNo],
  )
  if (!current) throw new AppError('Your staff record was not found.', 404)
  if (!draftId) {
    const open = await one<{ id: number }>('SELECT promotion_id AS id FROM staff_promotion WHERE staff_no = ? AND type = ? AND promo_status NOT IN (7, 8) LIMIT 1', [String(me.staffNo), d.type])
    if (open) throw new AppError(`You already have an open ${d.type === 1 ? 'contract renewal' : 'promotion'} application (#${open.id}). Follow it on this page.`, 409)
  }
  const submitting = d.submit
  const what = d.type === 1 ? 'contract renewal' : 'promotion'
  return withTransaction(async (conn) => {
    const fileColumns = {
      positionId: d.positionId,
      promoDoc1: d.appCv,
      promoDoc2: d.papersFile ?? '',
      appLetter: d.appLetter,
      promoComments: d.type === 0 ? d.kind : null,
      stage: submitting ? 'Waiting for acceptance' : 'Draft',
      promoStatus: submitting ? 1 : 0,
      stageStatus: 0,
      returned: 0,
      submittedAt: submitting ? new Date() : null,
    }
    let id = draftId
    if (id) {
      const cols = Object.entries(fileColumns)
      await exec(`UPDATE staff_promotion SET ${cols.map(([k]) => `${toSnake(k)} = ?`).join(', ')} WHERE promotion_id = ? AND promo_status = 0`, [...cols.map(([, v]) => v), id], conn)
    } else {
      id = await insert(
        'staff_promotion',
        { staffNo: String(me.staffNo), unitId: current.unitId, staffGroup: current.staffGroup, jobId: current.jobId, scaleId: current.scaleId, type: d.type, ...fileColumns },
        conn,
      )
    }
    // As the old form stored them: the department and college names, contacts,
    // the present rank and its date (prefilled from the record when left empty).
    const part = await applicantParticulars(me.staffNo)
    const details = detailColumns(d.details)
    const data = {
      applyType: d.type,
      promoComments: cut(d.kind, 50),
      dept: cut(part?.dept ?? current.unitName, 100),
      college: cut(part?.college, 100),
      email: cut(current.email, 200),
      tel: cut(current.phone, 20),
      fullname: cut(me.fullName, 150),
      staffNo: String(me.staffNo),
      appLetter: d.appLetter,
      appCv: d.appCv,
      papers: d.papersFile,
      signature: d.signature,
      status: submitting ? 1 : 0,
      subDate: d.subDate ?? new Date().toISOString().slice(0, 10),
      ...details,
      presentRank: details.presentRank ?? cut(part?.presentRank, 150),
      prEdate: details.prEdate ?? part?.prEdate ?? null,
    }
    const existing = await one<{ id: number }>('SELECT id FROM promotion_data WHERE promo_id = ? ORDER BY id DESC LIMIT 1', [id], conn)
    if (existing) {
      const cols = Object.entries(data)
      await exec(`UPDATE promotion_data SET ${cols.map(([k]) => `${toSnake(k)} = ?`).join(', ')} WHERE id = ?`, [...cols.map(([, v]) => v), existing.id], conn)
    } else {
      await insert('promotion_data', { promoId: id, ...data }, conn)
    }
    await writePapers(conn, me.staffNo, id!, d.papers)
    await exec('INSERT INTO promo_apply_log (promo_id, staff_no, activity_done) VALUES (?, ?, ?)', [id, String(me.staffNo), submitting ? `Submitted ${what} application (staff portal)` : 'Saved draft (staff portal)'], conn)
    if (submitting) {
      await exec(
        'INSERT INTO promo_activities (unit_id, user_id, promotion_id, stage_activity, comments, promo_status, activity, type) VALUES (?, ?, ?, ?, ?, 1, 0, ?)',
        [current.unitId, me.staffNo, id, `Applied for ${what}`, d.type === 1 ? 'Submitted files for renewal of contract' : 'Submitted files for promotion', d.type],
        conn,
      )
    }
    return id!
  })
}

/** The applicant sends back what was asked for; the file returns to the level that returned it. */
export async function resubmit(me: PortalUser, id: number, d: z.output<typeof promotionResubmitSchema>) {
  const p = await one<{ promoStatus: number; stageStatus: number; type: number; unitId: number | null }>('SELECT promo_status, stage_status, type, unit_id FROM staff_promotion WHERE promotion_id = ? AND staff_no = ?', [id, String(me.staffNo)])
  if (!p) throw new AppError('Application not found.', 404)
  const stage = Number(p.stageStatus)
  if (!RETURNED_STAGES.includes(stage) && stage !== 13) throw new AppError('This application has not been returned to you.', 409)
  const needCv = stage === 8 || stage === 10
  const needPapers = stage === 9 || stage === 10
  const needForm = stage === 11 || stage === 10
  if (needCv && !d.appCv) throw new AppError('Upload your updated CV.', 422)
  if (needPapers && !d.papersFile && !d.papers?.length) throw new AppError('Upload your updated papers.', 422)
  if (needForm && !d.appLetter) throw new AppError('Upload your updated application form.', 422)
  const label = RETURN_REASONS[stage]?.resubmit ?? 'Updated documents uploaded'
  await withTransaction(async (conn) => {
    await exec(
      `UPDATE staff_promotion SET stage_status = 0, returned = 0, stage = ?, promo_doc1 = COALESCE(?, promo_doc1), promo_doc2 = COALESCE(?, promo_doc2), app_letter = COALESCE(?, app_letter)
        WHERE promotion_id = ?`,
      [label, d.appCv ?? null, d.papersFile ?? null, d.appLetter ?? null, id],
      conn,
    )
    await exec('UPDATE promotion_data SET app_cv = COALESCE(?, app_cv), papers = COALESCE(?, papers), app_letter = COALESCE(?, app_letter) WHERE promo_id = ?', [d.appCv ?? null, d.papersFile ?? null, d.appLetter ?? null, id], conn)
    if (d.papers?.length) await writePapers(conn, me.staffNo, id, d.papers)
    await exec(
      `INSERT INTO promo_activities (unit_id, user_id, promotion_id, stage_activity, comments, promo_status, activity, type, updatedcv, updatedpapers, updatedform, returned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [p.unitId, me.staffNo, id, label, d.comment ?? label, p.promoStatus, stage, p.type, d.appCv ?? null, d.papersFile ?? null, d.appLetter ?? null],
      conn,
    )
    await exec('INSERT INTO promo_apply_log (promo_id, staff_no, activity_done) VALUES (?, ?, ?)', [id, String(me.staffNo), `${label} (staff portal)`], conn)
  })
  return label
}

// ---------------------------------------------------------------- Writing (heads)

type Action = z.output<typeof portalPromotionActionSchema>

/** A head's decision at their level, written as the old portal wrote it. */
export async function headAction(me: PortalUser, id: number, d: Action) {
  const p = await one<{ staffNo: string; promoStatus: number; stageStatus: number; type: number; unitId: number | null }>(
    'SELECT staff_no, promo_status, stage_status, type, unit_id FROM staff_promotion WHERE promotion_id = ?',
    [id],
  )
  if (!p) throw new AppError('Application not found.', 404)
  const [acting] = await actingLevels(me.staffNo, [{ unitId: p.unitId, promoStatus: Number(p.promoStatus), staffNo: Number(p.staffNo) }])
  const level = Number(p.promoStatus)
  if (!acting?.mine) throw new AppError('This application is not with you.', 403)
  if (!ACTIONABLE_STAGES.includes(Number(p.stageStatus))) throw new AppError('This application is not waiting for a decision.', 409)
  let next = level
  let stage = Number(p.stageStatus)
  let label: string
  let returned = 0
  if (d.action === 'recommend') (next = level + 1, (stage = 1), (label = 'Approved'))
  else if (d.action === 'not_recommend') ((stage = 2), (label = 'Disapproved'))
  else if (d.action === 'return') ((stage = Number(d.returnWhat)), (label = RETURN_REASONS[stage]!.label), (returned = 1))
  else {
    if (level < 2) throw new AppError('The head of department is the first level; return the form to the applicant instead.', 422)
    // 14: the previous level looks at it again; 13: the previous level and the applicant (who may resubmit documents).
    const both = d.action === 'reverse_applicant'
    ;(next = level - 1), (stage = both ? 13 : 14), (label = both ? 'Reverse to HOD and applicant' : 'Reverse to HOD'), (returned = 1)
  }
  await withTransaction(async (conn) => {
    const done = await exec(
      `UPDATE staff_promotion SET promo_status = ?, stage_status = ?, stage = ?, returned = ? WHERE promotion_id = ? AND promo_status = ? AND stage_status = ?`,
      [next, stage, label, returned, id, level, p.stageStatus],
      conn,
    )
    if (!done.affectedRows) throw new AppError('Someone else has just acted on this application. Reload to see where it is.', 409)
    await exec(
      'INSERT INTO promo_activities (unit_id, user_id, promotion_id, stage_activity, comments, promo_status, activity, stage_file, type, returned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [me.unitId, me.staffNo, id, label, d.comment, next, stage, d.document ?? null, p.type, returned],
      conn,
    )
  })
  return { staffNo: Number(p.staffNo), next, stage, label, level }
}

// ---------------------------------------------------------------- Notices and documents

/** Tells the head (and deputy) at the level now holding the file, in their portal inbox. */
export async function notifyLevelHeads(id: number, level: number) {
  if (level < 1 || level > 3) return
  const p = await one<{ unitId: number | null; type: number; fullName: string }>(
    `SELECT p.unit_id, p.type, ${nameSql()} AS full_name FROM staff_promotion p JOIN staff s ON s.staff_no = p.staff_no WHERE p.promotion_id = ?`,
    [id],
  )
  if (!p) return
  const units = await unitMap()
  const u = units.get(levelUnits(units, p.unitId)[level] ?? -1)
  const heads = [u?.unitHead, u?.unitSubhead].filter((n): n is number => Boolean(n))
  const what = Number(p.type) === 1 ? 'contract renewal' : 'promotion'
  for (const head of new Set(heads)) {
    void exec(
      "INSERT INTO notification (type, staff_no, action, title, message, read_flag, priority, datetime) VALUES ('PROMOTION', ?, 'Promotion - Approval', ?, ?, '0', '2', NOW())",
      [head, `A ${what} application is waiting for you`, `The ${what} application of ${p.fullName} (#${id}) is waiting for your recommendation in the staff portal (Promotion manager).`],
    ).catch(() => undefined)
  }
}

/** A portal notice to the applicant. */
export function notifyApplicant(staffNo: number, title: string, message: string) {
  void exec("INSERT INTO notification (type, staff_no, action, title, message, read_flag, priority, datetime) VALUES ('PROMOTION', ?, 'Promotion - Update', ?, ?, '0', '1', NOW())", [
    staffNo,
    title,
    message,
  ]).catch(() => undefined)
}

/**
 * Streams one document of a file to someone allowed to see the file: only
 * paths recorded on the file are served. Old-portal files open on that server.
 */
export async function streamPromotionFile(c: Context, id: number, staffNo: number, mode: 'own' | 'team', allowed = true) {
  const path = c.req.query('path') ?? ''
  const owner = await one<{ staffNo: string }>('SELECT staff_no FROM staff_promotion WHERE promotion_id = ?', [id])
  if (!owner || (mode === 'own' && Number(owner.staffNo) !== staffNo) || !allowed) throw new AppError('Document not found.', 404)
  if (!path || !(await promotionPaths(id)).has(path)) throw new AppError('Document not found.', 404)
  if (path.startsWith('/api/files/')) {
    const stored = await readStored(path.replace('/api/files/', ''))
    if (!stored) throw new AppError('Document not found.', 404)
    const inline = stored.mime === 'application/pdf' || stored.mime.startsWith('image/')
    return c.body(new Uint8Array(stored.data), 200, {
      'content-type': stored.mime,
      'content-disposition': `${inline ? 'inline' : 'attachment'}; filename="${path.split('/').pop()}"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, max-age=600',
    })
  }
  const legacy = legacyDocUrl(path)
  if (!legacy) throw new AppError('This document is on the old staff portal and cannot be opened here.', 404)
  return c.redirect(legacy, 302)
}
