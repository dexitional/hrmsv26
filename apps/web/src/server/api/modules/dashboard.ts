// Overview figures, charts and the alerts shown in the header bell.
//   GET /api/dashboard          everything on the dashboard
//   GET /api/dashboard/alerts   counts that need attention (positions, retirements, contracts…)
import { Hono } from 'hono'
import { requirePermission } from '../lib/auth'
import { rows } from '../lib/db'
import { PLACEMENT, RETIREMENT, activeStaffSql, ageSql, dobSql, groupSql, nameSql } from '../lib/hr'
import { CONTRACT_ALERT_DAYS } from './elevation'
import { POSITION_ALERT_DAYS } from './positions'

async function alertCounts() {
  const [r] = await rows(
    `SELECT
      (SELECT COUNT(*) FROM staff s WHERE ${activeStaffSql()} AND ${ageSql()} >= ${RETIREMENT}) AS retirement_due,
      (SELECT COUNT(*) FROM staff s WHERE ${activeStaffSql()} AND ${ageSql()} = ${RETIREMENT - 1}) AS retirement_near,
      (SELECT COUNT(*) FROM position p WHERE p.active = '1'
          AND p.end_date BETWEEN CURDATE() AND CURDATE() + INTERVAL ${POSITION_ALERT_DAYS} DAY) AS positions_expiring,
      (SELECT COUNT(*) FROM position p WHERE p.active = '1' AND p.end_date < CURDATE()) AS positions_expired,
      (SELECT COUNT(*) FROM renewal x WHERE x.active = '1' AND DATE_ADD(x.start_date, INTERVAL x.renewal_period YEAR)
          BETWEEN CURDATE() AND CURDATE() + INTERVAL ${CONTRACT_ALERT_DAYS} DAY) AS renewals_expiring,
      (SELECT COUNT(*) FROM renewal x WHERE x.active = '1'
          AND DATE_ADD(x.start_date, INTERVAL x.renewal_period YEAR) < CURDATE()) AS renewals_expired,
      (SELECT COUNT(*) FROM postretire x WHERE x.active = '1' AND DATE_ADD(x.start_post, INTERVAL x.served YEAR)
          BETWEEN CURDATE() AND CURDATE() + INTERVAL ${CONTRACT_ALERT_DAYS} DAY) AS postretire_expiring,
      (SELECT COUNT(*) FROM postretire x WHERE x.active = '1'
          AND DATE_ADD(x.start_post, INTERVAL x.served YEAR) < CURDATE()) AS postretire_expired,
      (SELECT COUNT(*) FROM staff s JOIN promotion p ON p.id = s.promo_id WHERE ${activeStaffSql()}
          AND p.probation > 0 AND p.confirm_date IS NULL
          AND DATE_ADD(p.appoint_date, INTERVAL p.probation YEAR) <= CURDATE()) AS confirmations_due,
      (SELECT COUNT(*) FROM transfer_request WHERE transfer_status = 'PENDING') AS transfer_requests,
      (SELECT COUNT(*) FROM leave_dump WHERE status = 'HR-PENDING') AS leave_hr_pending,
      (SELECT COUNT(*) FROM leave_defer WHERE active = '1' AND approved_status = 0) AS deferments_pending,
      (SELECT COUNT(*) FROM staff_promotion WHERE promo_status = 4 AND stage_status < 10) AS promotions_at_hr,
      (SELECT COUNT(*) FROM study_intention WHERE appstatus = 4 AND stage_status <> 2) AS study_at_hr,
      (SELECT COUNT(*) FROM study_leave WHERE status IN ('ON_LEAVE', 'EXTENDED') AND study_end < CURDATE()) AS study_overdue`,
  )
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(r ?? {})) out[k] = Number(v ?? 0)
  return out
}

export const dashboardRoute = new Hono()
  .get('/alerts', requirePermission('dashboard', 'view'), async (c) => c.json(await alertCounts()))
  .get('/', requirePermission('dashboard', 'view'), async (c) => {
    const active = activeStaffSql()
    const [
      alerts,
      [totals],
      byGroup,
      ageBuckets,
      appointments,
      leaveMonths,
      topUnits,
      byStatus,
      retiring,
      positionsEnding,
      contractsEnding,
    ] = await Promise.all([
      alertCounts(),
      rows(
        `SELECT SUM(${active}) AS active, SUM(NOT (${active})) AS inactive,
                SUM(${active} AND s.gender = 'F') AS female, SUM(${active} AND s.gender = 'M') AS male,
                (SELECT COUNT(*) FROM nss WHERE active = '1' AND end_date >= CURDATE()) AS nss_current,
                (SELECT COUNT(*) FROM leave_dump WHERE status = 'GRANTED') AS on_leave,
                (SELECT COUNT(*) FROM unit WHERE active = '1') AS units,
                (SELECT COUNT(*) FROM job WHERE active = '1') AS jobs,
                (SELECT COUNT(*) FROM staff s2 WHERE s2.staff_status = 'CONTRACT') +
                (SELECT COUNT(DISTINCT staff_no) FROM postretire WHERE active = '1' AND end_post >= CURDATE()) AS contract
           FROM staff s WHERE COALESCE(s.flag_delete, 0) = 0`,
      ),
      rows(
        `SELECT ${groupSql} AS label, SUM(s.gender = 'M') AS male, SUM(s.gender = 'F') AS female, COUNT(*) AS total
           FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id WHERE ${active} GROUP BY label ORDER BY FIELD(label, 'SM', 'SS', 'JS')`,
      ),
      rows(
        `SELECT CASE WHEN a < 30 THEN 'Under 30' WHEN a < 40 THEN '30–39' WHEN a < 50 THEN '40–49'
                     WHEN a < 55 THEN '50–54' WHEN a < 59 THEN '55–58' WHEN a < 60 THEN '59' ELSE '60+' END AS label,
                COUNT(*) AS value
           FROM (SELECT ${ageSql()} AS a FROM staff s WHERE ${active} AND ${dobSql()} IS NOT NULL) x
          GROUP BY label`,
      ),
      rows(
        `SELECT YEAR(appoint_date) AS year, COALESCE(apply_type, 'APPOINTMENT') AS type, COUNT(*) AS count
           FROM promotion WHERE appoint_date >= MAKEDATE(YEAR(CURDATE()) - 9, 1) AND appoint_date <= CURDATE()
          GROUP BY year, type ORDER BY year`,
      ),
      rows(
        `SELECT DATE_FORMAT(start_date, '%Y-%m') AS month, COUNT(*) AS count, COALESCE(SUM(approved_days), 0) AS days
           FROM leave_dump WHERE start_date >= DATE_FORMAT(CURDATE() - INTERVAL 11 MONTH, '%Y-%m-01')
            AND status IN ('GRANTED', 'ENDED') GROUP BY month ORDER BY month`,
      ),
      rows(
        `SELECT u.long_name AS label, COUNT(*) AS value FROM staff s ${PLACEMENT}
          WHERE ${active} AND u.id IS NOT NULL GROUP BY u.id ORDER BY value DESC LIMIT 8`,
      ),
      rows(
        `SELECT COALESCE(NULLIF(staff_status, ''), 'UNKNOWN') AS label, COUNT(*) AS value FROM staff
          WHERE COALESCE(flag_delete, 0) = 0 GROUP BY label ORDER BY value DESC`,
      ),
      rows(
        `SELECT s.staff_no, ${nameSql()} AS full_name, ${dobSql()} AS dob, ${ageSql()} AS age,
                DATE_ADD(${dobSql()}, INTERVAL ${RETIREMENT} YEAR) AS retirement_date, u.long_name AS unit_name, j.title AS job_title
           FROM staff s ${PLACEMENT}
          WHERE ${active} AND DATE_ADD(${dobSql()}, INTERVAL ${RETIREMENT} YEAR) <= CURDATE() + INTERVAL 12 MONTH
          ORDER BY ${dobSql()} DESC LIMIT 8`,
      ),
      rows(
        `SELECT p.id, p.staff_no, ${nameSql()} AS full_name, COALESCE(NULLIF(p.title, ''), NULLIF(p.post, '')) AS title,
                p.end_date, DATEDIFF(p.end_date, CURDATE()) AS days_left, u.long_name AS unit_name
           FROM position p LEFT JOIN staff s ON s.staff_no = p.staff_no LEFT JOIN unit u ON u.id = p.unit_id
          WHERE p.active = '1' AND p.end_date <= CURDATE() + INTERVAL ${POSITION_ALERT_DAYS} DAY
          ORDER BY p.end_date DESC LIMIT 6`,
      ),
      rows(
        `SELECT 'renewal' AS kind, x.id, x.staff_no, ${nameSql()} AS full_name,
                DATE_ADD(x.start_date, INTERVAL x.renewal_period YEAR) AS expiry_date,
                DATEDIFF(DATE_ADD(x.start_date, INTERVAL x.renewal_period YEAR), CURDATE()) AS days_left
           FROM renewal x LEFT JOIN staff s ON s.staff_no = x.staff_no
          WHERE x.active = '1' AND DATE_ADD(x.start_date, INTERVAL x.renewal_period YEAR)
                BETWEEN CURDATE() AND CURDATE() + INTERVAL ${CONTRACT_ALERT_DAYS} DAY
         UNION ALL
         SELECT 'postretire', x.id, x.staff_no, ${nameSql()}, DATE_ADD(x.start_post, INTERVAL x.served YEAR),
                DATEDIFF(DATE_ADD(x.start_post, INTERVAL x.served YEAR), CURDATE())
           FROM postretire x LEFT JOIN staff s ON s.staff_no = x.staff_no
          WHERE x.active = '1' AND DATE_ADD(x.start_post, INTERVAL x.served YEAR)
                BETWEEN CURDATE() AND CURDATE() + INTERVAL ${CONTRACT_ALERT_DAYS} DAY
         ORDER BY expiry_date LIMIT 6`,
      ),
    ])
    const num = (o: Record<string, unknown> | undefined) =>
      Object.fromEntries(Object.entries(o ?? {}).map(([k, v]) => [k, Number(v ?? 0)]))
    return c.json({
      alerts,
      totals: num(totals),
      byGroup: byGroup.map((r) => ({ label: r.label ?? '—', male: Number(r.male), female: Number(r.female), total: Number(r.total) })),
      ageBuckets: ageBuckets.map((r) => ({ label: r.label, value: Number(r.value) })),
      appointments: appointments.map((r) => ({ year: Number(r.year), type: r.type, count: Number(r.count) })),
      leaveMonths: leaveMonths.map((r) => ({ month: r.month, count: Number(r.count), days: Number(r.days) })),
      topUnits: topUnits.map((r) => ({ label: r.label, value: Number(r.value) })),
      byStatus: byStatus.map((r) => ({ label: r.label, value: Number(r.value) })),
      retiring,
      positionsEnding,
      contractsEnding,
    })
  })
