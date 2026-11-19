// Scheduled jobs and the in-process scheduler.
//
//   daily  — 07:00 GMT every day:
//            · granted leave whose end date has passed is marked ENDED (the staff
//              member and their reliever are released) and, when it ended within
//              the last 7 days, the staff member is told it ended and when to resume;
//            · staff whose granted leave ends within the next 3 days get a reminder;
//            · staff celebrating their birthday get birthday wishes.
//   nss    — 1 November, 07:00 GMT (caught up until 7 November if missed):
//            personnel whose national service has ended are marked COMPLETED and
//            thanked by SMS.
//
// Set SCHEDULER_ENABLED=true for the server to run these on schedule; they can
// always be run by hand from System › Notifications.
import { exec, insert, rows, scalar } from '../api/lib/db'
import { ACTIVE_IN, PLACEMENT, dobSql } from '../api/lib/hr'
import { notify } from '../api/lib/messaging'
import { birthday, leaveEnded, leaveReminder, nssThanks, greetingName, salutation } from '../api/lib/templates'
import { properName } from '#/lib/text-case'

export const DAILY_HOUR_GMT = 7
export type JobName = 'daily' | 'nss'

type Tally = Record<string, number>
const count = (t: Tally, key: string, n = 1) => (t[key] = (t[key] ?? 0) + n)
const deliveries = (t: Tally, results: Awaited<ReturnType<typeof notify>>) => {
  for (const r of results) count(t, `${r.channel}_${r.status}`)
}
/** True when at least one channel actually went out (sent or simulated) this time. */
const delivered = (results: Awaited<ReturnType<typeof notify>>) => results.some((r) => r.status === 'sent' || r.status === 'simulated')

// ---------------------------------------------------------------- Leave

async function endFinishedLeave(t: Tally) {
  const due = await rows<Record<string, any>>(
    `SELECT l.id, l.staff_no, l.relieved_by, l.start_date, l.end_date, l.resume_date, t.title AS type,
            s.title, s.fname, s.lname, s.gender, s.phone, s.ucc_mail, s.email,
            l.end_date >= CURDATE() - INTERVAL 7 DAY AS recent
       FROM leave_dump l JOIN staff s ON s.staff_no = l.staff_no LEFT JOIN leave_type t ON t.id = l.type_id
      WHERE l.status = 'GRANTED' AND l.end_date < CURDATE()`,
  )
  for (const l of due) {
    const changed = await exec("UPDATE leave_dump SET status = 'ENDED', auto_end = 1, updated_at = NOW() WHERE id = ? AND status = 'GRANTED'", [l.id])
    if (!changed.affectedRows) continue
    count(t, 'leave_ended')
    await exec('UPDATE staff SET flag_leave = 0 WHERE staff_no = ? AND flag_leave = 1', [l.staffNo])
    if (l.relievedBy) await exec('UPDATE staff SET flag_leave = 0 WHERE staff_no = ? AND flag_leave = 2', [l.relievedBy])
    // Only recent endings are announced; old backlog is closed quietly.
    if (!Number(l.recent)) {
      count(t, 'leave_ended_quietly')
      continue
    }
    const msg = leaveEnded({ salute: salutation(l), type: l.type ?? 'annual', startDate: l.startDate, endDate: l.endDate, resumeDate: l.resumeDate })
    deliveries(t, await notify({ kind: 'leave_ended', key: `leave_ended:${l.id}`, staffNo: l.staffNo, entityId: l.id, name: salutation(l), phone: l.phone, email: l.uccMail || l.email, ...msg }))
  }
}

async function remindLeaveEnding(t: Tally) {
  const ending = await rows<Record<string, any>>(
    `SELECT l.id, l.staff_no, l.end_date, l.resume_date, t.title AS type, DATEDIFF(l.end_date, CURDATE()) AS days_left,
            s.title, s.fname, s.lname, s.gender, s.phone, s.ucc_mail, s.email
       FROM leave_dump l JOIN staff s ON s.staff_no = l.staff_no LEFT JOIN leave_type t ON t.id = l.type_id
      WHERE l.status = 'GRANTED' AND l.end_date BETWEEN CURDATE() + INTERVAL 1 DAY AND CURDATE() + INTERVAL 3 DAY`,
  )
  for (const l of ending) {
    const msg = leaveReminder({ salute: salutation(l), type: l.type ?? 'annual', endDate: l.endDate, resumeDate: l.resumeDate, daysLeft: Number(l.daysLeft) })
    const results = await notify({ kind: 'leave_reminder', key: `leave_reminder:${l.id}`, staffNo: l.staffNo, entityId: l.id, name: salutation(l), phone: l.phone, email: l.uccMail || l.email, ...msg })
    if (delivered(results)) count(t, 'leave_reminders')
    deliveries(t, results)
  }
}

// ---------------------------------------------------------------- Birthdays

async function sendBirthdays(t: Tally) {
  // 29 February birthdays are celebrated on 28 February in other years.
  const people = await rows<Record<string, any>>(
    `SELECT s.staff_no, s.title, s.fname, s.lname, s.gender, s.phone, s.ucc_mail, s.email, u.long_name AS unit_name,
            TIMESTAMPDIFF(YEAR, NULLIF(s.first_appoint_date, '0000-00-00'), CURDATE()) AS years_of_service
       FROM staff s ${PLACEMENT}
      WHERE s.staff_status IN ${ACTIVE_IN} AND COALESCE(s.flag_delete, 0) = 0 AND ${dobSql()} IS NOT NULL
        AND (DATE_FORMAT(s.dob, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
             OR (DATE_FORMAT(s.dob, '%m-%d') = '02-29' AND DATE_FORMAT(CURDATE(), '%m-%d') = '02-28'
                 AND DAY(LAST_DAY(CURDATE())) = 28))`,
  )
  const year = new Date().getUTCFullYear()
  for (const s of people) {
    const salute = salutation(s)
    const firstName = greetingName(s)
    const msg = birthday({ salute, firstName, yearsOfService: s.yearsOfService === null ? null : Number(s.yearsOfService), unit: s.unitName })
    const results = await notify({ kind: 'birthday', key: `birthday:${year}:${s.staffNo}`, staffNo: s.staffNo, name: salute, phone: s.phone, email: s.uccMail || s.email, ...msg })
    if (delivered(results)) count(t, 'birthdays')
    deliveries(t, results)
  }
}

// ---------------------------------------------------------------- National service

async function completeNationalService(year: number, t: Tally) {
  const cutoff = `${year}-11-01`
  const people = await rows<Record<string, any>>(
    `SELECT n.id, n.nss_no, n.fname, n.lname, n.mobile, n.start_date, n.end_date, u.long_name AS unit_name
       FROM nss n LEFT JOIN unit u ON u.id = n.unit_id
      WHERE n.active = '1' AND n.service_status = 'SERVING' AND n.end_date IS NOT NULL AND n.end_date < ?`,
    [cutoff],
  )
  for (const n of people) {
    await exec("UPDATE nss SET service_status = 'COMPLETED', completed_at = NOW() WHERE id = ? AND service_status = 'SERVING'", [n.id])
    count(t, 'nss_completed')
    const firstName = (n.fname ?? '').trim().split(/\s+/)[0] ?? ''
    const sms = nssThanks({ firstName: firstName.charAt(0) + firstName.slice(1).toLowerCase(), unit: n.unitName, startDate: n.startDate, endDate: n.endDate })
    deliveries(t, await notify({ kind: 'nss_thanks', key: `nss_thanks:${year}:${n.id}`, nssId: n.id, name: properName(`${n.fname} ${n.lname}`), phone: n.mobile, sms }))
  }
}

// ---------------------------------------------------------------- Running jobs

const running = new Set<JobName>()

export async function runJob(job: JobName, opts: { trigger: 'schedule' | 'manual'; userId?: number | null; year?: number }) {
  if (running.has(job)) return { ok: false, busy: true, summary: {} as Tally }
  running.add(job)
  const today = new Date().toISOString().slice(0, 10)
  const period = job === 'nss' ? String(opts.year ?? new Date().getUTCFullYear()) : today
  const runId = await insert('hrms_job_runs', { job, period, triggerType: opts.trigger, triggeredBy: opts.userId ?? null, startedAt: new Date() })
  const t: Tally = {}
  try {
    if (job === 'daily') {
      await endFinishedLeave(t)
      await remindLeaveEnding(t)
      await sendBirthdays(t)
    } else {
      await completeNationalService(Number(period), t)
    }
    await exec('UPDATE hrms_job_runs SET finished_at = NOW(), summary = ? WHERE id = ?', [JSON.stringify(t), runId])
    return { ok: true, summary: t }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[jobs] ${job} failed:`, err)
    await exec('UPDATE hrms_job_runs SET finished_at = NOW(), summary = ?, error = ? WHERE id = ?', [JSON.stringify(t), message.slice(0, 500), runId])
    return { ok: false, error: message, summary: t }
  } finally {
    running.delete(job)
  }
}

async function ranOnSchedule(job: JobName, period: string) {
  return Number(await scalar("SELECT COUNT(*) FROM hrms_job_runs WHERE job = ? AND period = ? AND trigger_type = 'schedule'", [job, period])) > 0
}

/** Checks once a minute whether a scheduled job is due (times are GMT). */
async function tick() {
  const now = new Date()
  if (now.getUTCHours() < DAILY_HOUR_GMT) return
  const today = now.toISOString().slice(0, 10)
  if (!(await ranOnSchedule('daily', today))) await runJob('daily', { trigger: 'schedule' })
  // 1 November; caught up during the first week if the server was down.
  const year = now.getUTCFullYear()
  if (now.getUTCMonth() === 10 && now.getUTCDate() <= 7 && !(await ranOnSchedule('nss', String(year)))) {
    await runJob('nss', { trigger: 'schedule', year })
  }
}

const globalJobs = globalThis as typeof globalThis & { __hrmsScheduler?: ReturnType<typeof setInterval> }

/** Starts (or, after a hot reload, restarts) the scheduler when SCHEDULER_ENABLED=true. */
export function startScheduler() {
  if (globalJobs.__hrmsScheduler) clearInterval(globalJobs.__hrmsScheduler)
  globalJobs.__hrmsScheduler = undefined
  if (process.env.SCHEDULER_ENABLED !== 'true') return
  const safeTick = () => void tick().catch((err) => console.error('[jobs] scheduler tick failed:', err))
  globalJobs.__hrmsScheduler = setInterval(safeTick, 60_000)
  setTimeout(safeTick, 5_000)
  console.log(`[jobs] scheduler on: daily at ${String(DAILY_HOUR_GMT).padStart(2, '0')}:00 GMT, NSS on 1 November`)
}
