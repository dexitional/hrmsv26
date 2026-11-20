// Intentions to study in the staff portal: the approval chain of the old
// portal (tndapproval), run by the heads who hold each level.
//
//   appstatus 1  head of the applicant's unit (department / section)
//   appstatus 2  dean (academic: the faculty) / director (non-academic: the parent unit)
//   appstatus 3  provost (the college) / registrar
//   appstatus 4  HR (Admin → Study leave), which gives the final decision (5 / 6)
//
// Approving moves the application to the next level (stage_status 1);
// disapproving stops it where it is (stage_status 2), as the old portal did.
// A level with no unit or no head other than the applicant is skipped, so an
// application never waits for no one (a dean's own application goes past the
// dean, a unit that reports straight to the registrar skips the director).
// Each decision is a row in tndstudy_activities (promo_status = the new
// appstatus, activity 1 approved / 2 disapproved) with the head's comment.
import type { PortalUser } from '#/server/portal-session-core'
import { exec, one, withTransaction } from './db'
import { AppError } from './errors'
import { PLACEMENT, nameSql } from './hr'
import { levelUnits, unitMap } from './promotion'
import type { UnitNode } from './promotion'

export const STUDY_LEVEL_NAMES: Record<number, { academic: string; other: string }> = {
  1: { academic: 'Head of department', other: 'Head of section / unit' },
  2: { academic: 'Dean', other: 'Director' },
  3: { academic: 'Provost', other: 'Registrar' },
  4: { academic: 'HR', other: 'HR' },
}

const headsOf = (u: UnitNode | undefined, applicant: number) =>
  [u?.unitHead, u?.unitSubhead].map(Number).filter((n) => n > 0 && n !== applicant)

/** Where an application at this appstatus really waits: the first level from it that has someone to act (4 = HR). */
export function effectiveLevel(units: Map<number, UnitNode>, unitId: number | null, applicant: number, appstatus: number) {
  const levels = levelUnits(units, unitId)
  for (let l = Math.max(1, appstatus); l <= 3; l++) if (headsOf(units.get(levels[l] ?? -1), applicant).length) return { level: l, unitId: levels[l]!, levels }
  return { level: 4, unitId: null, levels }
}

/** The level after this one that has someone to act (4 = HR). */
export function nextLevel(units: Map<number, UnitNode>, unitId: number | null, applicant: number, after: number) {
  return after >= 3 ? 4 : effectiveLevel(units, unitId, applicant, after + 1).level
}

/** Open at a head's level: submitted, not yet with HR, not disapproved. */
export const isOpen = (appstatus: number, stageStatus: number) => appstatus >= 1 && appstatus <= 3 && stageStatus !== 2

export type StudyFile = { id: number; staffNo: number; unitId: number | null; appstatus: number; stageStatus: number; unitType?: string | null }

/** For each application: the level it waits at, whether this head holds it, and their level there. */
export async function studyActing(me: PortalUser, files: Array<StudyFile>) {
  const units = await unitMap()
  return files.map((f) => {
    const open = isOpen(f.appstatus, f.stageStatus)
    const eff = open ? effectiveLevel(units, f.unitId, f.staffNo, f.appstatus) : { level: f.appstatus, unitId: null, levels: levelUnits(units, f.unitId) }
    const u = eff.unitId ? units.get(eff.unitId) : undefined
    const mine = open && eff.level <= 3 && f.staffNo !== me.staffNo && headsOf(u, f.staffNo).includes(me.staffNo)
    return { waitingAt: eff.level, actingUnit: eff.unitId, mine }
  })
}

export function levelName(level: number, unitType: string | null | undefined) {
  const n = STUDY_LEVEL_NAMES[level]
  return n ? (unitType === 'ACADEMIC' ? n.academic : n.other) : `Level ${level}`
}

/** The application with what a decision needs. */
export async function studyFile(id: number) {
  return one<StudyFile & { fullName: string; intProg: string | null }>(
    `SELECT i.id, i.staff_no, u.id AS unit_id, u.type AS unit_type, i.appstatus, COALESCE(i.stage_status, 0) AS stage_status, ${nameSql()} AS full_name, i.int_prog
       FROM study_intention i JOIN staff s ON s.staff_no = i.staff_no ${PLACEMENT} WHERE i.id = ?`,
    [id],
  ).then((r) => (r ? { ...r, id: Number(r.id), staffNo: Number(r.staffNo), appstatus: Number(r.appstatus), stageStatus: Number(r.stageStatus) } : null))
}

/** A head approves or disapproves at their level. */
export async function decideStudy(me: PortalUser, id: number, decision: 'approve' | 'disapprove', comment: string) {
  const f = await studyFile(id)
  if (!f) throw new AppError('Application not found.', 404)
  const [acting] = await studyActing(me, [f])
  if (!isOpen(f.appstatus, f.stageStatus)) throw new AppError('This application is not waiting for a decision.', 409)
  if (!acting?.mine) throw new AppError('This application is not with you.', 403)
  const units = await unitMap()
  const level = acting.waitingAt
  const approve = decision === 'approve'
  const next = approve ? nextLevel(units, f.unitId, f.staffNo, level) : level
  const label = approve ? 'Approved' : 'Disapproved'
  await withTransaction(async (conn) => {
    const done = await exec(
      `UPDATE study_intention SET appstatus = ?, stage_status = ?, remarks = ?, remark_reason = ? WHERE id = ? AND appstatus = ? AND COALESCE(stage_status, 0) = ?`,
      [next, approve ? 1 : 2, approve ? 'RECOMMENDED' : 'DECLINED', comment, id, f.appstatus, f.stageStatus],
      conn,
    )
    if (!done.affectedRows) throw new AppError('Someone else has just acted on this application. Reload to see where it is.', 409)
    await exec(
      'INSERT INTO tndstudy_activities (unit_id, user_id, studyform_id, stage_activity, comments, promo_status, activity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [String(acting.actingUnit ?? me.unitId ?? ''), String(me.staffNo), id, label, comment, next, approve ? '1' : '2'],
      conn,
    )
  })
  return { ...f, level, next, label, levelName: levelName(level, f.unitType), nextName: levelName(next, f.unitType) }
}

const latin1 = (t: string) => t.replace(/[‘’]/g, "'").replace(/[–—]/g, '-').replace(/[^\x00-\xFF]/g, '')

function inbox(staffNo: number, action: string, title: string, message: string, priority = '1') {
  void exec("INSERT INTO notification (type, staff_no, action, title, message, read_flag, priority, datetime) VALUES ('STUDY', ?, ?, ?, ?, '0', ?, NOW())", [
    staffNo,
    action,
    latin1(title),
    latin1(message),
    priority,
  ]).catch(() => undefined)
}

/** Tells the head (and deputy) now holding the application, in their portal inbox. */
export async function notifyStudyLevel(id: number) {
  const f = await studyFile(id)
  if (!f || !isOpen(f.appstatus, f.stageStatus)) return
  const units = await unitMap()
  const eff = effectiveLevel(units, f.unitId, f.staffNo, f.appstatus)
  if (eff.level > 3) return
  for (const head of new Set(headsOf(units.get(eff.unitId ?? -1), f.staffNo)))
    inbox(head, 'Study leave - Approval', 'An intention to study is waiting for you', `The intention to study of ${f.fullName} (#${id}) is waiting for your decision in the staff portal (Study leave manager).`, '2')
}

export const notifyStudyApplicant = (staffNo: number, title: string, message: string) => inbox(staffNo, 'Study leave - Update', title, message)
