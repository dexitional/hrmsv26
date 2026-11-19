// Appraisals, kept in the legacy tables so the old portal's records read the same.
//
// Form A (staff_appraisal) is written by the supervisor: one row per question
// with the header (supervisor, year, purpose, summary, overall rating)
// repeated on every row. app_status 1 = completed by the supervisor; 2 =
// commented on and signed by the staff member.
// Form B (staff_self_appraisal) is the staff member's own: app_status 1 =
// submitted; 2 = countersigned by the supervisor.
import type { z } from 'zod'
import type { formASchema } from '#/lib/schemas'
import { exec, one, rows, withTransaction } from './db'
import { AppError } from './errors'

export const EMPLOYEE_SIGNED = 'Employee Signed'
export const SUPERVISOR_SIGNED = 'Supervisor Signed'

export async function appraisalQuestions() {
  const list = await rows<{ questionId: number; question: string; catId: number; catName: string; whichStaff: number }>(
    `SELECT q.question_id, q.question, q.which_staff, c.cat_id, c.cat_name
       FROM appraisal_question q JOIN appraisal_cat c ON c.cat_id = q.cat_id ORDER BY c.cat_id, q.question_id`,
  )
  const cats = new Map<number, { catId: number; catName: string; questions: Array<{ questionId: number; question: string }> }>()
  for (const q of list) {
    if (!cats.has(q.catId)) cats.set(q.catId, { catId: q.catId, catName: q.catName, questions: [] })
    cats.get(q.catId)!.questions.push({ questionId: q.questionId, question: q.question })
  }
  return [...cats.values()]
}

/** One Form A per staff member and year (from its per-question rows). */
export async function formASummaries(staffNos: Array<number>, year?: string) {
  if (!staffNos.length) return []
  return rows<{ staffNo: number; year: string; status: number; supervisorName: string | null; supervisorsRank: string | null; supRating: string | null; purpose: string | null; activityDate: string }>(
    `SELECT staff_no, yr_onreview AS year, MIN(app_status) AS status, MAX(supervisor_name) AS supervisor_name, MAX(supervisors_rank) AS supervisors_rank,
            MAX(sup_rating) AS sup_rating, MAX(purpose_curr_review) AS purpose, MAX(activity_date) AS activity_date
       FROM staff_appraisal WHERE staff_no IN (${staffNos.map(() => '?').join(', ')})${year ? ' AND yr_onreview = ?' : ''}
      GROUP BY staff_no, yr_onreview ORDER BY yr_onreview DESC`,
    year ? [...staffNos, year] : staffNos,
  )
}

export async function loadFormA(staffNo: number, year: string) {
  const answers = await rows<Record<string, any>>(
    `SELECT a.app_id, a.question, a.question_cat, a.reply, a.eg, a.supervisor_name, a.supervisors_rank, a.supervisor_staff_no, a.yr_onreview,
            a.purpose_curr_review, a.curr_year_obj, a.dev_needs, a.overall_summary, a.sup_rating, a.sup_signed, a.emp_signed, a.emp_comments,
            a.app_status, a.sup_signed_at, a.emp_signed_at, a.activity_date, q.question AS question_text, c.cat_name
       FROM staff_appraisal a LEFT JOIN appraisal_question q ON q.question_id = a.question LEFT JOIN appraisal_cat c ON c.cat_id = q.cat_id
      WHERE a.staff_no = ? AND a.yr_onreview = ? ORDER BY a.question_cat, a.question`,
    [staffNo, year],
  )
  const h = answers[0]
  if (!h) return null
  return {
    year,
    status: Math.min(...answers.map((a) => Number(a.appStatus) || 1)),
    supervisorName: h.supervisorName,
    supervisorsRank: h.supervisorsRank,
    supervisorStaffNo: h.supervisorStaffNo,
    purpose: h.purposeCurrReview,
    currYearObj: h.currYearObj,
    devNeeds: h.devNeeds,
    overallSummary: h.overallSummary,
    supRating: h.supRating,
    supSigned: h.supSigned,
    empSigned: h.empSigned,
    empComments: h.empComments,
    supSignedAt: h.supSignedAt ?? h.activityDate,
    empSignedAt: h.empSignedAt,
    answers: answers.map((a) => ({ questionId: Number(a.question), catId: Number(a.questionCat), catName: a.catName, question: a.questionText, rating: a.reply || null, example: a.eg || null })),
  }
}

export async function loadFormB(where: { id?: number; staffNo: number; year?: string }) {
  return one<Record<string, any>>(
    `SELECT app_self_id AS id, staff_no, supervisor_name, supervisors_rank, supervisor_staff_no, yr_onreview AS year, accomplishments, barriers_challenges,
            barriers_challenges_goal, strength_improvement, new_knowledge, other_information, sup_signed, emp_signed, app_status,
            sup_signed_at, COALESCE(emp_signed_at, activity_date) AS submitted_at, activity_date
       FROM staff_self_appraisal WHERE staff_no = ? AND ${where.id ? 'app_self_id = ?' : 'yr_onreview = ?'} ORDER BY app_self_id DESC LIMIT 1`,
    [where.staffNo, where.id ?? where.year],
  )
}

/** Writes a supervisor's Form A, replacing an earlier one the staff member has not yet signed. */
export async function saveFormA(
  staffNo: number,
  year: string,
  d: z.output<typeof formASchema>,
  supervisor: { staffNo: number; name: string; rank: string | null },
) {
  const existing = await one<{ status: number }>('SELECT MAX(app_status) AS status FROM staff_appraisal WHERE staff_no = ? AND yr_onreview = ?', [staffNo, year])
  if (existing?.status && Number(existing.status) >= 2) throw new AppError('The staff member has already signed this appraisal, so it can no longer be changed.', 409)
  const known = new Set((await rows<{ questionId: number }>('SELECT question_id FROM appraisal_question')).map((q) => q.questionId))
  const answers = d.answers.filter((a) => known.has(a.questionId))
  const cats = new Map((await rows<{ questionId: number; catId: number }>('SELECT question_id, cat_id FROM appraisal_question')).map((q) => [q.questionId, q.catId]))
  await withTransaction(async (conn) => {
    await exec('DELETE FROM staff_appraisal WHERE staff_no = ? AND yr_onreview = ? AND app_status < 2', [staffNo, year], conn)
    for (const a of answers) {
      await exec(
        `INSERT INTO staff_appraisal (staff_no, supervisor_name, supervisors_rank, supervisor_staff_no, yr_onreview, purpose_curr_review, question_cat, question,
            reply, eg, curr_year_obj, dev_needs, overall_summary, sup_rating, sup_signed, sup_signed_at, app_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
        [
          staffNo,
          supervisor.name.slice(0, 100),
          supervisor.rank?.slice(0, 100) ?? null,
          supervisor.staffNo,
          year,
          d.purpose,
          cats.get(a.questionId) ?? null,
          a.questionId,
          a.rating ?? '',
          a.example,
          d.currYearObj,
          d.devNeeds,
          d.overallSummary,
          d.supRating,
          SUPERVISOR_SIGNED,
        ],
        conn,
      )
    }
  })
  return answers.length
}

/** A row in the staff member's portal inbox (legacy notification table, Latin-1). */
export function notifyStaff(staffNo: number, action: string, title: string, message: string) {
  const latin1 = (t: string) => t.replace(/[‘’]/g, "'").replace(/[–—]/g, '-').replace(/[^\x00-\xFF]/g, '')
  void exec("INSERT INTO notification (type, staff_no, action, title, message, read_flag, priority, datetime) VALUES ('APPRAISAL', ?, ?, ?, ?, '0', '1', NOW())", [
    staffNo,
    latin1(action),
    latin1(title),
    latin1(message),
  ]).catch(() => undefined)
}
