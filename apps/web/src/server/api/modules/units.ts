// Units & offices (legacy `unit` table): colleges, faculties, departments,
// sections. Each has a parent unit, a head and a sub-head (staff numbers).
//   GET  /api/units                 every unit with parent, heads and member counts
//   GET  /api/units/:id/members     the unit and its active staff (printable list)
//   POST /api/units/:id/merge       fold this unit into a master unit
import { Hono } from 'hono'
import { mergeSchema, unitSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, one, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { BRIEF_COLUMNS, PLACEMENT, activeStaffSql, flag, nameSql, plainNameSql } from '../lib/hr'
import { validate } from '../lib/validate'

async function checkPeople(data: { unitHead: number | null; unitSubhead: number | null }) {
  for (const [key, label] of [
    ['unitHead', 'head'],
    ['unitSubhead', 'sub-head'],
  ] as const) {
    const no = data[key]
    if (no && !(await one('SELECT id FROM staff WHERE staff_no = ?', [no]))) {
      throw new AppError(`No staff member has staff number ${no} (unit ${label}).`, 422)
    }
  }
}

const UNIT_COLUMNS = `
  x.id, x.short_name, x.long_name, x.unit_code, x.type, x.level, x.parent_id, x.location, x.active,
  x.merged_into, x.unit_head, x.unit_subhead,
  IF(p.id = x.id, NULL, p.long_name) AS parent_name,
  ${nameSql('h')} AS head_name, ${nameSql('sh')} AS subhead_name`

const UNIT_JOINS = `
  LEFT JOIN unit p ON p.id = x.parent_id
  LEFT JOIN staff h ON h.staff_no = x.unit_head
  LEFT JOIN staff sh ON sh.staff_no = x.unit_subhead`

export const unitsRoute = new Hono()
  .get('/', requirePermission('units', 'view'), async (c) =>
    c.json(
      await rows(
        `SELECT ${UNIT_COLUMNS}, COALESCE(m.cnt, 0) AS member_count,
                (SELECT COUNT(*) FROM unit ch WHERE ch.parent_id = x.id AND ch.id <> x.id AND ch.active = '1') AS child_count
           FROM unit x ${UNIT_JOINS}
           LEFT JOIN (SELECT COALESCE(cp.unit_id, s.unit_id) AS uid, COUNT(*) AS cnt
                        FROM staff s LEFT JOIN promotion cp ON cp.id = s.promo_id
                       WHERE ${activeStaffSql()} GROUP BY uid) m ON m.uid = x.id
          WHERE x.long_name IS NOT NULL AND x.long_name <> ''
          ORDER BY x.long_name`,
      ),
    ),
  )
  .get('/:id/members', requirePermission('units', 'view'), async (c) => {
    const id = parseId(c.req.param('id'))
    const unit = await one(`SELECT ${UNIT_COLUMNS} FROM unit x ${UNIT_JOINS} WHERE x.id = ?`, [id])
    if (!unit) throw notFound('Unit')
    const members = await rows(
      `SELECT ${BRIEF_COLUMNS} FROM staff s ${PLACEMENT}
        WHERE COALESCE(cp.unit_id, s.unit_id) = ? AND ${activeStaffSql()}
        ORDER BY FIELD(${'COALESCE(cp.staff_group, s.staff_group)'}, 'SM', 'SS', 'JS'), ${plainNameSql()}`,
      [id],
    )
    return c.json({ unit, members })
  })
  .post('/', requirePermission('units', 'edit'), validate('json', unitSchema), async (c) => {
    const data = c.req.valid('json')
    await checkPeople(data)
    const id = await insert('unit', { ...data, active: flag(data.active) })
    // Top-level units are their own parent in the legacy data.
    if (!data.parentId) await exec('UPDATE unit SET parent_id = id, parent_flag = 1 WHERE id = ?', [id])
    audit(c.get('user'), 'create', 'unit', id, `Added unit ${data.longName}`)
    return c.json({ id }, 201)
  })
  .put('/:id', requirePermission('units', 'edit'), validate('json', unitSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    if (!(await one('SELECT id FROM unit WHERE id = ?', [id]))) throw notFound('Unit')
    if (data.parentId === id) data.parentId = null
    await checkPeople(data)
    await update('unit', id, { ...data, parentId: data.parentId ?? id, parentFlag: data.parentId ? null : 1, active: flag(data.active) })
    audit(c.get('user'), 'update', 'unit', id, `Updated unit ${data.longName}`)
    return c.json({ id })
  })
  .delete('/:id', requirePermission('units', 'manage'), async (c) => {
    const id = parseId(c.req.param('id'))
    const unit = await one<{ longName: string }>('SELECT long_name FROM unit WHERE id = ?', [id])
    if (!unit) throw notFound('Unit')
    const used = await scalar(
      `SELECT (SELECT COUNT(*) FROM staff WHERE unit_id = ?) + (SELECT COUNT(*) FROM promotion WHERE unit_id = ?)
            + (SELECT COUNT(*) FROM unit WHERE parent_id = ? AND id <> ?) + (SELECT COUNT(*) FROM transfer WHERE from_unit = ? OR to_unit = ?)`,
      [id, id, id, id, id, id],
    )
    if (Number(used) > 0)
      throw new AppError('This unit has staff, sub-units or history. Merge it into another unit instead.', 409)
    await exec('DELETE FROM unit WHERE id = ?', [id])
    audit(c.get('user'), 'delete', 'unit', id, `Deleted unit ${unit.longName}`)
    return c.json({ ok: true })
  })
  .post('/:id/merge', requirePermission('units', 'manage'), validate('json', mergeSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { masterId } = c.req.valid('json')
    if (id === masterId) throw new AppError('A unit cannot be merged into itself.', 422)
    const [unit, master] = await Promise.all([
      one<{ longName: string }>('SELECT long_name FROM unit WHERE id = ?', [id]),
      one<{ longName: string; mergedInto: number | null }>('SELECT long_name, merged_into FROM unit WHERE id = ?', [
        masterId,
      ]),
    ])
    if (!unit) throw notFound('Unit')
    if (!master) throw new AppError(`There is no unit with ID ${masterId}.`, 422)
    if (master.mergedInto) throw new AppError('The master unit has itself been merged away. Pick the unit it went into.', 422)
    // Current placements, sub-units and open records move to the master;
    // past transfers keep pointing at the old unit as history.
    const moved = {
      staff: (await exec('UPDATE staff SET unit_id = ? WHERE unit_id = ?', [masterId, id])).affectedRows,
      appointments: (await exec('UPDATE promotion SET unit_id = ? WHERE unit_id = ?', [masterId, id])).affectedRows,
      subUnits: (await exec('UPDATE unit SET parent_id = ? WHERE parent_id = ? AND id <> ?', [masterId, id, id]))
        .affectedRows,
      positions: (await exec('UPDATE position SET unit_id = ? WHERE unit_id = ?', [masterId, id])).affectedRows,
      nss: (await exec('UPDATE nss SET unit_id = ? WHERE unit_id = ?', [masterId, id])).affectedRows,
    }
    await exec('UPDATE staff SET p_unit_id = ? WHERE p_unit_id = ?', [masterId, id])
    await exec('UPDATE job SET unit_id = ? WHERE unit_id = ?', [masterId, id])
    await exec("UPDATE transfer_request SET to_unit = ? WHERE to_unit = ? AND transfer_status = 'PENDING'", [masterId, id])
    await exec("UPDATE leave_approver SET value = ? WHERE field = 'unit_id' AND value = ?", [String(masterId), String(id)])
    await exec("UPDATE unit SET active = '0', merged_into = ?, merged_at = NOW() WHERE id = ?", [masterId, id])
    audit(
      c.get('user'),
      'merge',
      'unit',
      id,
      `Merged unit ${unit.longName} into ${master.longName} (${moved.staff} staff, ${moved.subUnits} sub-units)`,
    )
    return c.json({ ok: true, moved })
  })
