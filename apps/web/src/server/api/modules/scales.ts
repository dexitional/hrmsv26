// Grades & notches (legacy `scale` table).
import { Hono } from 'hono'
import { scaleSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, one, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { activeStaffSql, flag } from '../lib/hr'
import { validate } from '../lib/validate'

export const scalesRoute = new Hono()
  .get('/', requirePermission('scales', 'view'), async (c) =>
    c.json(
      await rows(
        `SELECT g.id, g.grade, g.notch, g.level, g.grade_num, g.notch_amount, g.staff_group, g.active,
                COALESCE(n.cnt, 0) AS staff_count
           FROM scale g
           LEFT JOIN (SELECT COALESCE(cp.scale_id, s.scale_id) AS sid, COUNT(*) AS cnt
                        FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id
                       WHERE ${activeStaffSql()} GROUP BY sid) n ON n.sid = g.id
          ORDER BY g.grade_num IS NULL, g.grade_num, g.level, g.grade, g.notch`,
      ),
    ),
  )
  .post('/', requirePermission('scales', 'edit'), validate('json', scaleSchema), async (c) => {
    const data = c.req.valid('json')
    const id = await insert('scale', { ...data, active: flag(data.active) })
    audit(c.get('user'), 'create', 'scale', id, `Added grade ${data.grade} notch ${data.notch}`)
    return c.json({ id }, 201)
  })
  .put('/:id', requirePermission('scales', 'edit'), validate('json', scaleSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await one('SELECT id FROM scale WHERE id = ?', [id]))) throw notFound('Grade')
    await update('scale', id, { ...data, active: flag(data.active) })
    audit(c.get('user'), 'update', 'scale', id, `Updated grade ${data.grade} notch ${data.notch}`)
    return c.json({ id })
  })
  .delete('/:id', requirePermission('scales', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const scale = await one<{ grade: string; notch: number }>('SELECT grade, notch FROM scale WHERE id = ?', [id])
    if (!scale) throw notFound('Grade')
    const used = await scalar(
      'SELECT (SELECT COUNT(*) FROM promotion WHERE scale_id = ?) + (SELECT COUNT(*) FROM staff WHERE scale_id = ?)',
      [id, id],
    )
    if (Number(used) > 0)
      throw new AppError('This grade is on appointment records. Deactivate it instead of deleting it.', 409)
    await exec('DELETE FROM scale WHERE id = ?', [id])
    audit(c.get('user'), 'delete', 'scale', id, `Deleted grade ${scale.grade} notch ${scale.notch}`)
    return c.json({ ok: true })
  })
