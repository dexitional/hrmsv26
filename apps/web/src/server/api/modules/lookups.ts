// Option lists for pickers, and staff look-up by number or name.
//   GET /api/lookups/units | jobs | scales | titles | leave-types
//   GET /api/lookups/staff?q=           up to 20 matches (number prefix or name)
//   GET /api/lookups/staff/:staffNo     one staff member's current placement
import { Hono } from 'hono'
import { requireUser } from '../lib/auth'
import { like, rows } from '../lib/db'
import { AppError } from '../lib/errors'
import { BRIEF_COLUMNS, PLACEMENT, nameSql, staffBrief } from '../lib/hr'

export const lookupsRoute = new Hono()
  .use('*', requireUser)
  .get('/units', async (c) =>
    c.json(
      await rows(
        `SELECT u.id AS value, u.long_name AS label,
                CONCAT_WS(' · ', NULLIF(CONVERT(u.short_name USING utf8mb4), ''), CONVERT(p.long_name USING utf8mb4)) AS hint, u.type, u.level, u.active
           FROM unit u LEFT JOIN unit p ON p.id = u.parent_id AND p.id <> u.id
          WHERE u.long_name IS NOT NULL AND u.long_name <> ''
            ${c.req.query('all') ? '' : "AND u.active = '1' AND u.merged_into IS NULL"}
          ORDER BY u.long_name`,
      ),
    ),
  )
  .get('/jobs', async (c) =>
    c.json(
      await rows(
        `SELECT id AS value, title AS label, CONCAT_WS(' · ', CONVERT(staff_group USING utf8mb4), CONVERT(type USING utf8mb4)) AS hint, staff_group, type
           FROM job WHERE title IS NOT NULL AND title <> ''
            ${c.req.query('all') ? '' : "AND active = '1' AND merged_into IS NULL"}
          ORDER BY title`,
      ),
    ),
  )
  .get('/scales', async (c) =>
    c.json(
      await rows(
        `SELECT id AS value, CONCAT(CONVERT(grade USING utf8mb4), ' · Notch ', notch) AS label,
                CONCAT_WS(' · ', CONVERT(staff_group USING utf8mb4),
                  IF(notch_amount > 0, CONCAT('GHS ', FORMAT(notch_amount, 2)), NULL)) AS hint
           FROM scale WHERE active = '1' ORDER BY grade_num IS NULL, grade_num, level, grade, notch`,
      ),
    ),
  )
  .get('/titles', async (c) =>
    c.json(await rows('SELECT id AS value, name AS label FROM titles ORDER BY title_weight, name')),
  )
  .get('/leave-types', async (c) =>
    c.json(await rows('SELECT id AS value, title AS label, active FROM leave_type ORDER BY title')),
  )
  .get('/staff', async (c) => {
    const q = (c.req.query('q') ?? '').trim()
    if (!q) return c.json([])
    const isNumber = /^\d+$/.test(q)
    return c.json(
      await rows(
        `SELECT ${BRIEF_COLUMNS} FROM staff s ${PLACEMENT}
          WHERE ${isNumber ? 'CAST(s.staff_no AS CHAR) LIKE ?' : `${nameSql()} LIKE ?`}
          ORDER BY s.staff_status = 'PERMANENT' DESC, s.staff_no LIMIT 20`,
        [isNumber ? `${q}%` : like(q)],
      ),
    )
  })
  .get('/staff/:staffNo', async (c) => {
    const staffNo = Number(c.req.param('staffNo'))
    const staff = Number.isInteger(staffNo) && staffNo > 0 ? await staffBrief(staffNo) : null
    if (!staff) throw new AppError(`No staff member has staff number ${c.req.param('staffNo')}.`, 404)
    return c.json(staff)
  })
