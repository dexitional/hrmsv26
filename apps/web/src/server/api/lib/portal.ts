// Staff portal access: the signed-in staff member, and what a head may see.
//
// Who a head manages comes from the legacy data:
//   - Team: everyone placed in the units they head or deputise, and in every
//     unit beneath them. Academic units point up three ways: parent_id (often
//     the college), faculty_id (the dean's office) and college_id, so a dean
//     sees the faculty's departments and a provost the whole college.
//   - Leave approval: staff placed directly in those units, the heads and
//     deputies of the units that report to them (a unit reports to its
//     faculty when it has one, otherwise to its parent — so a dean approves
//     the heads of department), and anyone a leave_approver rule names (by
//     designation or staff number). Never their own leave.
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { PORTAL_COOKIE } from '#/server/portal-session'
import { portalUserFromToken } from '#/server/portal-session-core'
import type { PortalUser } from '#/server/portal-session-core'
import { rows } from './db'
import { AppError } from './errors'
import { ACTIVE_IN } from './hr'

declare module 'hono' {
  interface ContextVariableMap {
    staff: PortalUser
  }
}

export async function portalUser(c: Context): Promise<PortalUser | null> {
  return portalUserFromToken(getCookie(c, PORTAL_COOKIE))
}

export async function requireStaffUser(c: Context, next: Next) {
  const staff = await portalUser(c)
  if (!staff) throw new AppError('Please sign in to the staff portal.', 401)
  c.set('staff', staff)
  await next()
}

export async function requireManager(c: Context, next: Next) {
  const staff = await portalUser(c)
  if (!staff) throw new AppError('Please sign in to the staff portal.', 401)
  if (!staff.isManager) throw new AppError('This is for heads of units and approvers.', 403)
  c.set('staff', staff)
  await next()
}

const marks = (list: Array<unknown>) => list.map(() => '?').join(', ')

/** The units a head heads or deputises. */
export const headedUnits = (staff: PortalUser) => staff.heads.map((h) => h.unitId)

/** Those units and every unit beneath them. */
export async function teamUnits(staff: PortalUser): Promise<Array<number>> {
  const units = headedUnits(staff)
  if (!units.length) return []
  const found = await rows<{ id: number }>(
    `WITH RECURSIVE tree AS (
       SELECT id FROM unit WHERE id IN (${marks(units)})
       UNION
       SELECT u.id FROM unit u JOIN tree t ON (u.parent_id = t.id OR u.faculty_id = t.id OR u.college_id = t.id) AND u.id <> t.id
        WHERE u.active = '1'
     ) SELECT id FROM tree`,
    units,
  )
  return found.map((r) => r.id)
}

/** Staff numbers whose leave this person approves at the head stage. */
export async function leaveApprovees(staff: PortalUser): Promise<Array<number>> {
  const units = headedUnits(staff)
  const out = new Set<number>()
  if (units.length) {
    const direct = await rows<{ staffNo: number }>(
      `SELECT s.staff_no FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id
        WHERE COALESCE(cp.unit_id, s.unit_id) IN (${marks(units)}) AND s.staff_status IN ${ACTIVE_IN} AND COALESCE(s.flag_delete, 0) = 0`,
      units,
    )
    for (const r of direct) out.add(r.staffNo)
    // The unit each unit reports to: its faculty (dean's office), else its parent.
    const reportsTo = 'COALESCE(NULLIF(faculty_id, id), NULLIF(parent_id, id))'
    const subHeads = await rows<{ staffNo: number }>(
      `SELECT unit_head AS staff_no FROM unit WHERE active = '1' AND ${reportsTo} IN (${marks(units)}) AND unit_head IS NOT NULL
       UNION SELECT unit_subhead FROM unit WHERE active = '1' AND ${reportsTo} IN (${marks(units)}) AND unit_subhead IS NOT NULL`,
      [...units, ...units],
    )
    for (const r of subHeads) if (r.staffNo) out.add(Number(r.staffNo))
  }
  // Named approvers (legacy leave_approver: by designation or by staff number).
  const rules = await rows<{ field: string; value: string }>('SELECT field, value FROM leave_approver WHERE approver = ?', [staff.staffNo])
  const jobIds = rules.filter((r) => r.field === 'job_id').flatMap((r) => r.value.split(',').map(Number)).filter((n) => n > 0)
  const named = rules.filter((r) => r.field === 'staff_no').flatMap((r) => r.value.split(',').map(Number)).filter((n) => n > 0)
  for (const n of named) out.add(n)
  if (jobIds.length) {
    const byJob = await rows<{ staffNo: number }>(
      `SELECT s.staff_no FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id
        WHERE COALESCE(cp.job_id, s.job_id) IN (${marks(jobIds)}) AND s.staff_status IN ${ACTIVE_IN} AND COALESCE(s.flag_delete, 0) = 0`,
      jobIds,
    )
    for (const r of byJob) out.add(r.staffNo)
  }
  out.delete(staff.staffNo)
  return [...out]
}

/** Everyone in the team (for the staff, promotion, study and appraisal managers). */
export async function teamStaff(staff: PortalUser): Promise<Array<number>> {
  const units = await teamUnits(staff)
  const approvees = await leaveApprovees(staff)
  const out = new Set<number>(approvees)
  if (units.length) {
    const inTeam = await rows<{ staffNo: number }>(
      `SELECT s.staff_no FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id
        WHERE COALESCE(cp.unit_id, s.unit_id) IN (${marks(units)}) AND s.staff_status IN ${ACTIVE_IN} AND COALESCE(s.flag_delete, 0) = 0`,
      units,
    )
    for (const r of inTeam) out.add(r.staffNo)
  }
  out.delete(staff.staffNo)
  return [...out]
}

/** "staff_no IN (…)" for a list that may be empty. */
export const inList = (column: string, list: Array<number>) => (list.length ? `${column} IN (${marks(list)})` : '1 = 0')
