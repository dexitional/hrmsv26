// Designations / jobs (legacy `job` table).
//   POST /api/jobs/:id/merge   fold this designation into a master designation
import { Hono } from 'hono'
import { jobSchema, mergeSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, one, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { activeStaffSql, flag, idList } from '../lib/hr'
import { validate } from '../lib/validate'

export const jobsRoute = new Hono()
  .get('/', requirePermission('jobs', 'view'), async (c) =>
    c.json(
      await rows(
        `SELECT j.id, j.title, j.type, j.rank_years, j.upgradable, j.staff_group, j.active, j.merged_into,
                m.title AS merged_into_title, COALESCE(n.cnt, 0) AS staff_count
           FROM job j
           LEFT JOIN job m ON m.id = j.merged_into
           LEFT JOIN (SELECT COALESCE(cp.job_id, s.job_id) AS jid, COUNT(*) AS cnt
                        FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id
                       WHERE ${activeStaffSql()} GROUP BY jid) n ON n.jid = j.id
          WHERE j.title IS NOT NULL AND j.title <> ''
          ORDER BY j.title`,
      ),
    ),
  )
  .post('/', requirePermission('jobs', 'edit'), validate('json', jobSchema), async (c) => {
    const data = c.req.valid('json')
    const id = await insert('job', { ...data, upgradable: flag(data.upgradable), active: flag(data.active) })
    audit(c.get('user'), 'create', 'job', id, `Added designation ${data.title}`)
    return c.json({ id }, 201)
  })
  .put('/:id', requirePermission('jobs', 'edit'), validate('json', jobSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await one('SELECT id FROM job WHERE id = ?', [id]))) throw notFound('Designation')
    await update('job', id, { ...data, upgradable: flag(data.upgradable), active: flag(data.active) })
    audit(c.get('user'), 'update', 'job', id, `Updated designation ${data.title}`)
    return c.json({ id })
  })
  .delete('/:id', requirePermission('jobs', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const job = await one<{ title: string }>('SELECT title FROM job WHERE id = ?', [id])
    if (!job) throw notFound('Designation')
    const used = await scalar(
      'SELECT (SELECT COUNT(*) FROM promotion WHERE job_id = ?) + (SELECT COUNT(*) FROM staff WHERE job_id = ?)',
      [id, id],
    )
    if (Number(used) > 0)
      throw new AppError('Staff hold or have held this designation. Merge it into another one instead.', 409)
    await exec('DELETE FROM job WHERE id = ?', [id])
    audit(c.get('user'), 'delete', 'job', id, `Deleted designation ${job.title}`)
    return c.json({ ok: true })
  })
  .post('/:id/merge', requirePermission('jobs', 'manage'), validate('json', mergeSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { masterId } = c.req.valid('json')
    if (id === masterId) throw new AppError('A designation cannot be merged into itself.', 422)
    const [job, master] = await Promise.all([
      one<{ title: string }>('SELECT title FROM job WHERE id = ?', [id]),
      one<{ title: string; mergedInto: number | null }>('SELECT title, merged_into FROM job WHERE id = ?', [masterId]),
    ])
    if (!job) throw notFound('Designation')
    if (!master) throw new AppError(`There is no designation with ID ${masterId}.`, 422)
    if (master.mergedInto) throw new AppError('The master designation has itself been merged away.', 422)
    const appointments = (await exec('UPDATE promotion SET job_id = ? WHERE job_id = ?', [masterId, id])).affectedRows
    const staff = (await exec('UPDATE staff SET job_id = ? WHERE job_id = ?', [masterId, id])).affectedRows
    await exec('UPDATE establishment SET job_id = ? WHERE job_id = ?', [masterId, id])
    // Leave entitlements list designations as "id,id,…".
    for (const w of await rows<{ id: number; jobs: string }>('SELECT id, jobs FROM leave_weight WHERE jobs IS NOT NULL')) {
      const list = idList(w.jobs)
      if (!list.includes(id)) continue
      const next = [...new Set(list.map((j) => (j === id ? masterId : j)))]
      await exec('UPDATE leave_weight SET jobs = ? WHERE id = ?', [next.join(','), w.id])
    }
    await exec("UPDATE job SET active = '0', merged_into = ?, merged_at = NOW() WHERE id = ?", [masterId, id])
    audit(c.get('user'), 'merge', 'job', id, `Merged designation ${job.title} into ${master.title} (${appointments} records)`)
    return c.json({ ok: true, moved: { appointments, staff } })
  })
