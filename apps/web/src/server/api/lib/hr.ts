// SQL building blocks for the legacy HR schema.
//
// A staff member's current job, grade and unit live on their current
// appointment/promotion record (staff.promo_id → promotion). The copies on
// the staff row are often stale in the legacy data, so reads prefer the
// promotion record and writes update both (syncPlacement).
import { ACTIVE_STAFF_STATUSES, RETIREMENT_AGE } from '@hrms/db'
import type { PoolConnection } from 'mysql2/promise'
import { exec, one, rows, scalar } from './db'
import { AppError } from './errors'

/** "Dr. Ama Serwaa Mensah" from a staff-like row aliased `a`. */
export const nameSql = (a = 's') =>
  `TRIM(CONCAT_WS(' ', NULLIF(NULLIF(TRIM(${a}.title), ''), '-- Select --'), TRIM(${a}.fname), NULLIF(TRIM(${a}.mname), ''), TRIM(${a}.lname)))`

/** Name of a row without a title column (NSS personnel). */
export const bareNameSql = (a: string) =>
  `TRIM(CONCAT_WS(' ', TRIM(${a}.fname), NULLIF(TRIM(${a}.mname), ''), TRIM(${a}.lname)))`

/** Name without the title, for sorting and searching. */
export const plainNameSql = (a = 's') => `TRIM(CONCAT_WS(' ', TRIM(${a}.fname), NULLIF(TRIM(${a}.mname), ''), TRIM(${a}.lname)))`

/** Joins a staff row `s` to its current promotion `cp`, unit `u`, job `j` and grade `g`. */
export const PLACEMENT = `
  LEFT JOIN promotion cp ON cp.id = s.promo_id
  LEFT JOIN unit u ON u.id = COALESCE(cp.unit_id, s.unit_id)
  LEFT JOIN job j ON j.id = COALESCE(cp.job_id, s.job_id)
  LEFT JOIN scale g ON g.id = COALESCE(cp.scale_id, s.scale_id)`

export const groupSql = `COALESCE(cp.staff_group, s.staff_group)`

/**
 * A usable date of birth. Legacy rows hold '0000-00-00' or placeholders such
 * as 1900-01-01 for unknown dates; anything before 1920 is treated as unknown.
 */
export const dobSql = (a = 's') => `IF(${a}.dob >= '1920-01-01', ${a}.dob, NULL)`
export const ageSql = (a = 's') => `TIMESTAMPDIFF(YEAR, ${dobSql(a)}, CURDATE())`

export const ACTIVE_IN = `(${ACTIVE_STAFF_STATUSES.map((s) => `'${s}'`).join(', ')})`
export const activeStaffSql = (a = 's') => `${a}.staff_status IN ${ACTIVE_IN} AND COALESCE(${a}.flag_delete, 0) = 0`

/** Columns describing a staff member's current placement. */
export const BRIEF_COLUMNS = `
  s.staff_no, ${nameSql()} AS full_name, s.fname, s.lname, s.gender, ${dobSql()} AS dob, ${ageSql()} AS age,
  s.phone, s.ucc_mail, s.email, s.staff_status, ${groupSql} AS staff_group, s.promo_id,
  u.id AS unit_id, u.long_name AS unit_name, u.short_name AS unit_short,
  j.id AS job_id, j.title AS job_title, g.id AS scale_id, g.grade, g.notch`

export interface StaffBrief {
  staffNo: number
  fullName: string
  gender: string | null
  dob: string | null
  age: number | null
  phone: string | null
  uccMail: string | null
  staffStatus: string | null
  staffGroup: string | null
  promoId: number | null
  unitId: number | null
  unitName: string | null
  jobId: number | null
  jobTitle: string | null
  scaleId: number | null
  grade: string | null
  notch: number | null
}

export function staffBrief(staffNo: number, conn?: PoolConnection) {
  return one<StaffBrief>(`SELECT ${BRIEF_COLUMNS} FROM staff s ${PLACEMENT} WHERE s.staff_no = ?`, [staffNo], conn)
}

/** The staff member, or a 422 naming the staff number that was not found. */
export async function requireStaff(staffNo: number, conn?: PoolConnection) {
  const staff = await staffBrief(staffNo, conn)
  if (!staff) throw new AppError(`No staff member has staff number ${staffNo}.`, 422)
  return staff
}

/**
 * Points a staff member at a promotion record and mirrors its job, grade,
 * unit and category onto the staff row (the legacy staff portal reads both).
 */
export async function syncPlacement(staffNo: number, promoId: number, conn?: PoolConnection) {
  await exec(
    `UPDATE staff s JOIN promotion p ON p.id = ?
        SET s.promo_id = p.id, s.job_id = p.job_id, s.scale_id = p.scale_id,
            s.unit_id = COALESCE(p.unit_id, s.unit_id), s.staff_group = COALESCE(p.staff_group, s.staff_group),
            s.updated_at = NOW()
      WHERE s.staff_no = ?`,
    [promoId, staffNo],
    conn,
  )
}

/** Moves a staff member to another unit (staff row and current appointment). */
export async function moveToUnit(staffNo: number, unitId: number, conn?: PoolConnection) {
  await exec('UPDATE staff SET unit_id = ?, updated_at = NOW() WHERE staff_no = ?', [unitId, staffNo], conn)
  await exec(
    'UPDATE promotion p JOIN staff s ON s.promo_id = p.id SET p.unit_id = ? WHERE s.staff_no = ?',
    [unitId, staffNo],
    conn,
  )
}

export const RETIREMENT = RETIREMENT_AGE

/** "green" under 59, "amber" from 59, "red" from the retirement age. */
export function ageBand(age: number | null): 'green' | 'amber' | 'red' | null {
  if (age === null || age === undefined) return null
  if (age >= RETIREMENT_AGE) return 'red'
  if (age >= RETIREMENT_AGE - 1) return 'amber'
  return 'green'
}

/** Parses a comma list of ids/staff numbers from a legacy text column. */
export function idList(value: string | null | undefined): Array<number> {
  return (value ?? '')
    .split(/[,\s]+/)
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0)
}

// ---------------------------------------------------------------- Leave

const ANNUAL_LEAVE_TYPE = 2

export interface LeaveYear {
  year: number
  entitlement: number
  constants: number
  balance: number
  /** Approved deferment carried in from the previous year. */
  deferred: number
  /** Approved deferment of this year's leave, carried to the next year. */
  deferredOut: number
  total: number
  /** Days on granted or ended annual leave starting this year. */
  used: number
  /** Days on applications still with the head or HR. */
  pending: number
  remaining: number
  adjustments: Array<{ desc: string; type: 'ADD' | 'SUB'; weight: number }>
  /** Why the entitlement is what it is, when it is not the usual rule. */
  note: string | null
}

/**
 * Annual leave for one staff member and year, following the legacy rules:
 *
 *   entitlement  leave_weight for their category: the row naming their
 *                designation if there is one, otherwise the category's first
 *                general row (the legacy system read the first; Senior Staff
 *                have a second, unused 35-day row). Academic Senior Members
 *                have no annual leave (they take vacation): 0.
 * + constants    the year's leave_constant rows for their category (ADD/SUB),
 *                unless they are in its exclusion list
 * + balance      the staff member's active legacy balance (leave_balance). HR keeps one
 *                active row per person and switches it off once it is used up; it
 *                counts from the year it was recorded onwards, as the old portal did
 * + deferred     approved deferment of the previous year's leave (leave_defer)
 * − deferredOut  approved deferment of this year's leave (it moves to next year)
 * = total
 * − used         days on granted/ended annual leave starting that year
 * − pending      days on applications still with the head or HR (so two
 *                pending applications cannot together exceed the total)
 * = remaining
 */
export async function leaveYear(staff: StaffBrief, year: number): Promise<LeaveYear> {
  const weights = await rows<{ id: number; jobs: string | null; weight: number }>(
    'SELECT id, jobs, weight FROM leave_weight WHERE type_id = ? AND `group` = ? ORDER BY id',
    [ANNUAL_LEAVE_TYPE, staff.staffGroup],
  )
  const byJob = weights.find((w) => staff.jobId && idList(w.jobs).includes(staff.jobId))
  const general = weights.find((w) => !w.jobs)
  let entitlement = Number((byJob ?? general)?.weight ?? 0)
  let note: string | null = null
  if (staff.staffGroup === 'SM') {
    const job = staff.jobId ? await one<{ type: string | null }>('SELECT type FROM job WHERE id = ?', [staff.jobId]) : null
    if (job?.type === 'ACADEMIC') {
      entitlement = 0
      note = 'Academic senior members take vacation, not annual leave.'
    }
  }

  const constantRows = await rows<{ desc: string; type: 'ADD' | 'SUB'; weight: number; exclusion: string | null }>(
    'SELECT `desc`, type, weight, exclusion FROM leave_constant WHERE active = 1 AND year = ? AND (category IS NULL OR category = ?)',
    [year, staff.staffGroup],
  )
  const adjustments = constantRows
    .filter((c) => !idList(c.exclusion).includes(staff.staffNo))
    .map((c) => ({ desc: c.desc, type: c.type, weight: Number(c.weight) }))
  const constants = adjustments.reduce((s, c) => s + (c.type === 'ADD' ? c.weight : -c.weight), 0)

  const [extra] = await rows<{ balance: number; deferred: number; deferredOut: number; used: number; pending: number }>(
    `SELECT
       (SELECT COALESCE(SUM(weight), 0) FROM leave_balance WHERE staff_no = ? AND year <= ? AND active = '1') AS balance,
       (SELECT COALESCE(SUM(weight), 0) FROM leave_defer
         WHERE staff_no = ? AND year = ? AND approved_status = 1 AND active = '1') AS deferred,
       (SELECT COALESCE(SUM(weight), 0) FROM leave_defer
         WHERE staff_no = ? AND year = ? AND approved_status = 1 AND active = '1') AS deferred_out,
       (SELECT COALESCE(SUM(approved_days), 0) FROM leave_dump
         WHERE staff_no = ? AND type_id = ? AND status IN ('GRANTED', 'ENDED') AND YEAR(start_date) = ?) AS used,
       (SELECT COALESCE(SUM(approved_days), 0) FROM leave_dump
         WHERE staff_no = ? AND type_id = ? AND status IN ('STAFF-PENDING', 'HEAD-PENDING', 'HR-PENDING') AND YEAR(start_date) = ?) AS pending`,
    [
      staff.staffNo, year,
      staff.staffNo, year - 1,
      staff.staffNo, year,
      staff.staffNo, ANNUAL_LEAVE_TYPE, year,
      staff.staffNo, ANNUAL_LEAVE_TYPE, year,
    ],
  )
  const balance = Number(extra?.balance ?? 0)
  const deferred = Number(extra?.deferred ?? 0)
  const deferredOut = Number(extra?.deferredOut ?? 0)
  const used = Number(extra?.used ?? 0)
  const pending = Number(extra?.pending ?? 0)
  // Never below zero (an academic senior member with no balance, after a deduction).
  const total = Math.max(0, entitlement + constants + balance + deferred - deferredOut)
  return { year, entitlement, constants, balance, deferred, deferredOut, total, used, pending, remaining: total - used - pending, adjustments, note }
}

/**
 * Legacy flags are ENUM('0','1'). Write them as strings: MySQL reads a numeric
 * 1 as the enum's *first* value, which is '0'.
 */
export const flag = (value: boolean) => (value ? '1' : '0')

// ---------------------------------------------------------------- Working days

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parseDay = (v: string) => {
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

/**
 * How many leave days a staff category is charged for weekends: Junior and
 * Senior Staff take leave in business days (Saturdays and Sundays are not
 * counted); Senior Members' leave runs in calendar days, weekends included.
 * Public holidays (active rows in leave_exclude) are never counted.
 */
export const countsWeekends = (staffGroup: string | null | undefined) => staffGroup === 'SM'

/**
 * Leave days from start to end (inclusive) — business days, or calendar days
 * when `includeWeekends` — less public holidays, and the day the staff member
 * resumes: the next working day (weekday, not a holiday) after the end date.
 */
export async function workingDays(start: string, end: string, includeWeekends = false) {
  const from = parseDay(start)
  const to = parseDay(end)
  if (to < from)
    return { days: 0, resumeDate: null as string | null, holidays: [] as Array<{ date: string; desc: string }>, includeWeekends }
  const horizon = new Date(to)
  horizon.setDate(horizon.getDate() + 30)
  const holidays = await rows<{ holiday: string; desc: string }>(
    'SELECT holiday, `desc` FROM leave_exclude WHERE active = 1 AND holiday BETWEEN ? AND ?',
    [start, iso(horizon)],
  )
  const off = new Set(holidays.map((h) => h.holiday))
  const isWorking = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6 && !off.has(iso(d))
  const counts = (d: Date) => !off.has(iso(d)) && (includeWeekends || (d.getDay() !== 0 && d.getDay() !== 6))
  let days = 0
  for (const d = new Date(from); d <= to && days < 1000; d.setDate(d.getDate() + 1)) if (counts(d)) days++
  const resume = new Date(to)
  do resume.setDate(resume.getDate() + 1)
  while (!isWorking(resume))
  return {
    days,
    resumeDate: iso(resume),
    holidays: holidays.filter((h) => h.holiday >= start && h.holiday <= end).map((h) => ({ date: h.holiday, desc: h.desc })),
    includeWeekends,
  }
}

/**
 * The leave period for a number of leave days from an expected start date,
 * the way the staff portal applies: the leave starts on the first chargeable
 * day on or after the date asked for (a weekday for Junior/Senior Staff, any
 * day for Senior Members; never a public holiday), ends on the day the last
 * leave day is used, and the staff member resumes on the next working day.
 */
export async function leavePeriod(start: string, days: number, includeWeekends = false) {
  const n = Math.max(1, Math.min(366, Math.floor(days)))
  // Generous horizon: holidays and weekends stretch the calendar span.
  const horizon = parseDay(start)
  horizon.setDate(horizon.getDate() + Math.ceil(n * (includeWeekends ? 1.2 : 1.6)) + 60)
  const holidays = await rows<{ holiday: string; desc: string }>(
    'SELECT holiday, `desc` FROM leave_exclude WHERE active = 1 AND holiday BETWEEN ? AND ?',
    [start, iso(horizon)],
  )
  const off = new Set(holidays.map((h) => h.holiday))
  const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6
  const counts = (d: Date) => !off.has(iso(d)) && (includeWeekends || !weekend(d))
  const d = parseDay(start)
  while (!counts(d)) d.setDate(d.getDate() + 1)
  const startDate = iso(d)
  for (let used = 1; used < n; ) {
    d.setDate(d.getDate() + 1)
    if (counts(d)) used++
  }
  const endDate = iso(d)
  do d.setDate(d.getDate() + 1)
  while (weekend(d) || off.has(iso(d)))
  return {
    days: n,
    startDate,
    endDate,
    resumeDate: iso(d),
    // Only holidays that would otherwise have been charged (not a Saturday holiday for weekday staff).
    holidays: holidays
      .filter((h) => h.holiday >= startDate && h.holiday <= endDate && (includeWeekends || !weekend(parseDay(h.holiday))))
      .map((h) => ({ date: h.holiday, desc: h.desc })),
    includeWeekends,
  }
}

// ---------------------------------------------------------------- Holidays and granted leave

export interface LeaveAdjustment {
  id: number
  staffNo: number
  fullName: string
  from: { endDate: string; resumeDate: string | null }
  to: { endDate: string; resumeDate: string | null }
}

/**
 * A public holiday was added to (or removed from) the calendar. Granted leave
 * is re-dated as follows:
 *
 *  - holiday within the leave period (start date to end date) on a day the
 *    staff member was charged for — any day for Senior Members, weekdays for
 *    Junior/Senior Staff: they get the day back, so the end date moves one
 *    leave day later (earlier when removed) and the resumption date follows;
 *  - holiday after the end date, up to the resumption date: they enjoy the
 *    holiday too and report on the next working day — only the resumption
 *    date moves, no leave day is added;
 *  - holidays before the leave or after the resumption date change nothing.
 *
 * The number of leave days approved never changes. Call this AFTER the
 * holiday row has been written, so the calendar already reflects the change.
 */
export async function adjustGrantedLeaveForHoliday(day: string, change: 'added' | 'removed'): Promise<Array<LeaveAdjustment>> {
  // Another active holiday on the same date means nothing changes.
  const others = Number(await scalar('SELECT COUNT(*) FROM leave_exclude WHERE active = 1 AND holiday = ?', [day]))
  if ((change === 'added' && others > 1) || (change === 'removed' && others > 0)) return []

  const leaves = await rows<{ id: number; staffNo: number; startDate: string; endDate: string; resumeDate: string | null; staffGroup: string | null; fullName: string }>(
    `SELECT l.id, l.staff_no, l.start_date, l.end_date, l.resume_date, ${groupSql} AS staff_group, ${nameSql()} AS full_name
       FROM leave_dump l JOIN staff s ON s.staff_no = l.staff_no LEFT JOIN promotion cp ON cp.id = s.promo_id
      WHERE l.status = 'GRANTED' AND l.start_date <= ? AND ? <= GREATEST(l.end_date, COALESCE(l.resume_date, l.end_date))`,
    [day, day],
  )
  if (!leaves.length) return []

  // Holidays from a little before the earliest leave to well after the latest.
  const lo = leaves.reduce((m, l) => (l.startDate < m ? l.startDate : m), day)
  const hiDate = parseDay(leaves.reduce((m, l) => (l.endDate > m ? l.endDate : m), day))
  hiDate.setDate(hiDate.getDate() + 60)
  const off = new Set(
    (await rows<{ holiday: string }>('SELECT holiday FROM leave_exclude WHERE active = 1 AND holiday BETWEEN ? AND ?', [lo, iso(hiDate)])).map(
      (h) => h.holiday,
    ),
  )
  const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6
  const isWorking = (d: Date) => !weekend(d) && !off.has(iso(d))
  const step = (from: string, dir: 1 | -1, ok: (d: Date) => boolean) => {
    const d = parseDay(from)
    do d.setDate(d.getDate() + dir)
    while (!ok(d))
    return iso(d)
  }
  const resumeAfter = (end: string) => step(end, 1, isWorking)

  const changed: Array<LeaveAdjustment> = []
  for (const l of leaves) {
    const includeWeekends = countsWeekends(l.staffGroup)
    const counted = (d: Date) => !off.has(iso(d)) && (includeWeekends || !weekend(d))
    let endDate = l.endDate
    if (day <= l.endDate) {
      // Within the leave: only a day this staff member is charged for earns a day back.
      if (!includeWeekends && weekend(parseDay(day))) continue
      endDate = change === 'added' ? step(l.endDate, 1, counted) : step(l.endDate, -1, counted)
      if (endDate < l.startDate) endDate = l.startDate
    }
    // Either way they report on the first working day after the (new) end date.
    const resumeDate = resumeAfter(endDate)
    if (endDate === l.endDate && resumeDate === l.resumeDate) continue
    await exec('UPDATE leave_dump SET end_date = ?, resume_date = ?, updated_at = NOW() WHERE id = ?', [endDate, resumeDate, l.id])
    changed.push({
      id: l.id,
      staffNo: l.staffNo,
      fullName: l.fullName,
      from: { endDate: l.endDate, resumeDate: l.resumeDate },
      to: { endDate, resumeDate },
    })
  }
  return changed
}

/** What a notification to a staff member needs: name parts, phone and email. */
export function staffContact(staffNo: number) {
  return one<{ title: string | null; fname: string | null; lname: string | null; gender: string | null; phone: string | null; uccMail: string | null; email: string | null }>(
    'SELECT title, fname, lname, gender, phone, ucc_mail, email FROM staff WHERE staff_no = ?',
    [staffNo],
  )
}
