// A staff member's sub-records: relatives (staff_rel), bank accounts (bank)
// and qualifications (certificate).
//   GET/POST /api/staff-records/:staffNo/relatives        PUT/DELETE /api/staff-records/relatives/:id
//   GET/POST /api/staff-records/:staffNo/banks            PUT/DELETE /api/staff-records/banks/:id
//   POST     /api/staff-records/banks/:id/default         make it the salary account
//   GET/POST /api/staff-records/:staffNo/qualifications   PUT/DELETE /api/staff-records/qualifications/:id
import { Hono } from 'hono'
import { bankSchema, qualificationSchema, relativeSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, one, parseId, rows, update, withTransaction } from '../lib/db'
import { notFound } from '../lib/errors'
import { flag, requireStaff } from '../lib/hr'
import { validate } from '../lib/validate'

const view = requirePermission('staff', 'view')
const edit = requirePermission('staff', 'edit')
const manage = requirePermission('staff', 'manage')
const staffParam = (v: string | undefined) => Number(v)

/**
 * Relative codes are the staff number and a letter (14023A, 14023B, … 14023Z,
 * 14023AA…), handed out in a fixed order: spouses first, then children, then
 * parents, then every other relative; within each group, in the order they
 * were recorded. A code is the relative's place in that order, so the whole
 * family is renumbered whenever a relative is added, removed or changes
 * relation (most additions just take the next letter; a spouse recorded after
 * the children moves the children down one letter). Returns the relatives
 * whose code changed (the new one included).
 */
const RELATIVE_GROUP: Record<string, number> = { SPOUSE: 0, CHILD: 1, FATHER: 2, MOTHER: 2 }
const letters = (n: number): string => (n <= 0 ? '' : letters(Math.floor((n - 1) / 26)) + String.fromCharCode(65 + ((n - 1) % 26)))

async function renumberRelatives(staffNo: number) {
  return withTransaction(async (conn) => {
    const family = await rows<{ id: number; relation: string | null; code: string | null; fname: string; lname: string }>(
      'SELECT id, relation, code, fname, lname FROM staff_rel WHERE staff_no = ? ORDER BY id FOR UPDATE',
      [staffNo],
      conn,
    )
    const ordered = [...family].sort((a, b) => (RELATIVE_GROUP[a.relation ?? ''] ?? 3) - (RELATIVE_GROUP[b.relation ?? ''] ?? 3) || a.id - b.id)
    const changed: Array<{ id: number; name: string; from: string | null; to: string }> = []
    for (const [i, r] of ordered.entries()) {
      const code = `${staffNo}${letters(i + 1)}`
      if (r.code === code) continue
      await exec('UPDATE staff_rel SET code = ? WHERE id = ?', [code, r.id], conn)
      changed.push({ id: r.id, name: `${r.fname} ${r.lname}`, from: r.code || null, to: code })
    }
    return changed
  })
}

/** "Codes: ADJOA MENSAH 15666B → 15666C; …" for the activity log (only codes that moved, not new ones). */
const movedCodes = (changed: Awaited<ReturnType<typeof renumberRelatives>>, except?: number) => {
  const moved = changed.filter((c) => c.from && c.id !== except)
  return moved.length ? `; codes renumbered: ${moved.map((c) => `${c.name} ${c.from} → ${c.to}`).join(', ')}` : ''
}

const relativeColumns = (d: ReturnType<typeof relativeSchema.parse>) => ({
  ...d,
  fname: d.fname.toUpperCase(),
  mname: d.mname?.toUpperCase() ?? null,
  lname: d.lname.toUpperCase(),
  kin: flag(d.kin),
  alive: flag(d.alive),
  active: flag(d.active),
})

export const listRelatives = (staffNo: number) =>
  rows(
    `SELECT id, staff_no, relation, fname, mname, lname, NULLIF(dob, '0000-00-00') AS dob, gender, code, phone, address,
                hometown, kin, alive, active, photo, path,
                TIMESTAMPDIFF(YEAR, NULLIF(dob, '0000-00-00'), CURDATE()) AS age
           FROM staff_rel WHERE staff_no = ?
          ORDER BY CASE relation WHEN 'SPOUSE' THEN 0 WHEN 'CHILD' THEN 1 WHEN 'FATHER' THEN 2 WHEN 'MOTHER' THEN 2 ELSE 3 END, id`,
    [staffNo],
  )

export const listBanks = (staffNo: number) =>
  rows(
    `SELECT b.id, b.staff_no, b.bank_name, b.account_no, b.account_name, b.account_branch, b.date_added,
                (b.active = '1' OR s.bank_id = b.id) AS is_default
           FROM bank b LEFT JOIN staff s ON s.staff_no = b.staff_no
          WHERE b.staff_no = ? ORDER BY is_default DESC, b.id DESC`,
    [staffNo],
  )

export const listQualifications = (staffNo: number) =>
  rows(
    `SELECT id, staff_no, institution, qualify, specialize, cert_rate, verified, path,
                NULLIF(start_date, '0000-00-00') AS start_date, NULLIF(end_date, '0000-00-00') AS end_date,
                NULLIF(grad_date, '0000-00-00') AS grad_date
           FROM certificate WHERE staff_no = ? AND active = '1'
          ORDER BY FIELD(cert_rate, 'PHD', 'MASTERS', 'DEGREE', 'POST-DIPLOMA', 'HND', 'DIPLOMA', 'PROFESSIONAL') = 0,
                   FIELD(cert_rate, 'PHD', 'MASTERS', 'DEGREE', 'POST-DIPLOMA', 'HND', 'DIPLOMA', 'PROFESSIONAL'), grad_date DESC`,
    [staffNo],
  )

export const staffRecordsRoute = new Hono()
  // ------------------------------------------------------------ Relatives
  .get('/:staffNo/relatives', view, async (c) => c.json(await listRelatives(staffParam(c.req.param('staffNo')))))
  .post('/:staffNo/relatives', edit, validate('json', relativeSchema), async (c) => {
    const staff = await requireStaff(staffParam(c.req.param('staffNo')))
    const data = c.req.valid('json')
    if (data.kin) await exec("UPDATE staff_rel SET kin = '0' WHERE staff_no = ?", [staff.staffNo])
    const id = await insert('staff_rel', { ...relativeColumns(data), staffNo: staff.staffNo })
    const changed = await renumberRelatives(staff.staffNo)
    const code = changed.find((r) => r.id === id)?.to ?? null
    audit(c.get('user'), 'create', 'staff', staff.staffNo, `Added ${data.relation.toLowerCase()} ${data.fname} ${data.lname} (${code}) to ${staff.fullName}${movedCodes(changed, id)}`)
    return c.json({ id, code, renumbered: changed.filter((r) => r.from && r.id !== id).length }, 201)
  })
  .put('/relatives/:id', edit, validate('json', relativeSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    const rel = await one<{ staffNo: number; relation: string | null; code: string | null }>('SELECT staff_no, relation, code FROM staff_rel WHERE id = ?', [id])
    if (!rel) throw notFound('Relative')
    // One next of kin per staff member.
    if (data.kin) await exec("UPDATE staff_rel SET kin = '0' WHERE staff_no = ? AND id <> ?", [rel.staffNo, id])
    await update('staff_rel', id, relativeColumns(data))
    // A new relation can move the relative to another group (and so the codes), as can a missing code.
    const changed = rel.relation !== data.relation || !rel.code ? await renumberRelatives(rel.staffNo) : []
    audit(c.get('user'), 'update', 'staff', rel.staffNo, `Updated relative ${data.fname} ${data.lname}${movedCodes(changed)}`)
    return c.json({ id, renumbered: changed.filter((r) => r.from).length })
  })
  .delete('/relatives/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const rel = await one<{ staffNo: number; fname: string; lname: string }>('SELECT staff_no, fname, lname FROM staff_rel WHERE id = ?', [id])
    if (!rel) throw notFound('Relative')
    await exec('DELETE FROM staff_rel WHERE id = ?', [id])
    const changed = await renumberRelatives(rel.staffNo)
    audit(c.get('user'), 'delete', 'staff', rel.staffNo, `Removed relative ${rel.fname} ${rel.lname}${movedCodes(changed)}`)
    return c.json({ ok: true, renumbered: changed.filter((r) => r.from).length })
  })

  // ------------------------------------------------------------ Bank accounts
  .get('/:staffNo/banks', view, async (c) => c.json(await listBanks(staffParam(c.req.param('staffNo')))))
  .post('/:staffNo/banks', edit, validate('json', bankSchema), async (c) => {
    const staff = await requireStaff(staffParam(c.req.param('staffNo')))
    const { isDefault, ...data } = c.req.valid('json')
    const first = !(await one('SELECT id FROM bank WHERE staff_no = ?', [staff.staffNo]))
    const id = await insert('bank', { ...data, staffNo: staff.staffNo, dateAdded: new Date(), active: '0' })
    if (isDefault || first) await makeDefault(staff.staffNo, id)
    audit(c.get('user'), 'create', 'staff', staff.staffNo, `Added ${data.bankName} account for ${staff.fullName}`)
    return c.json({ id }, 201)
  })
  .put('/banks/:id', edit, validate('json', bankSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const { isDefault, ...data } = c.req.valid('json')
    const bank = await one<{ staffNo: number }>('SELECT staff_no FROM bank WHERE id = ?', [id])
    if (!bank) throw notFound('Bank account')
    await update('bank', id, data)
    if (isDefault) await makeDefault(bank.staffNo, id)
    audit(c.get('user'), 'update', 'staff', bank.staffNo, `Updated ${data.bankName} account`)
    return c.json({ id })
  })
  .post('/banks/:id/default', edit, async (c) => {
    const id = parseId(c.req.param('id'))
    const bank = await one<{ staffNo: number; bankName: string }>('SELECT staff_no, bank_name FROM bank WHERE id = ?', [id])
    if (!bank) throw notFound('Bank account')
    await makeDefault(bank.staffNo, id)
    audit(c.get('user'), 'update', 'staff', bank.staffNo, `Made ${bank.bankName} the salary account`)
    return c.json({ ok: true })
  })
  .delete('/banks/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const bank = await one<{ staffNo: number; bankName: string }>('SELECT staff_no, bank_name FROM bank WHERE id = ?', [id])
    if (!bank) throw notFound('Bank account')
    await exec('DELETE FROM bank WHERE id = ?', [id])
    await exec('UPDATE staff SET bank_id = NULL WHERE staff_no = ? AND bank_id = ?', [bank.staffNo, id])
    audit(c.get('user'), 'delete', 'staff', bank.staffNo, `Removed ${bank.bankName} account`)
    return c.json({ ok: true })
  })

  // ------------------------------------------------------------ Qualifications
  .get('/:staffNo/qualifications', view, async (c) => c.json(await listQualifications(staffParam(c.req.param('staffNo')))))
  .post('/:staffNo/qualifications', edit, validate('json', qualificationSchema), async (c) => {
    const staff = await requireStaff(staffParam(c.req.param('staffNo')))
    const data = c.req.valid('json')
    const id = await insert('certificate', {
      ...data,
      staffNo: staff.staffNo,
      verified: flag(data.verified),
      graduated: flag(Boolean(data.gradDate)),
      active: '1',
    })
    audit(c.get('user'), 'create', 'staff', staff.staffNo, `Added qualification ${data.qualify} for ${staff.fullName}`)
    return c.json({ id }, 201)
  })
  .put('/qualifications/:id', edit, validate('json', qualificationSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    const cert = await one<{ staffNo: number }>('SELECT staff_no FROM certificate WHERE id = ?', [id])
    if (!cert) throw notFound('Qualification')
    await update('certificate', id, { ...data, verified: flag(data.verified), graduated: flag(Boolean(data.gradDate)) })
    audit(c.get('user'), 'update', 'staff', cert.staffNo, `Updated qualification ${data.qualify}`)
    return c.json({ id })
  })
  .delete('/qualifications/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const cert = await one<{ staffNo: number; qualify: string }>('SELECT staff_no, qualify FROM certificate WHERE id = ?', [id])
    if (!cert) throw notFound('Qualification')
    await exec("UPDATE certificate SET active = '0' WHERE id = ?", [id])
    audit(c.get('user'), 'delete', 'staff', cert.staffNo, `Removed qualification ${cert.qualify}`)
    return c.json({ ok: true })
  })

/** One salary account per staff member: flagged on bank.active and staff.bank_id. */
async function makeDefault(staffNo: number, id: number) {
  await exec("UPDATE bank SET active = IF(id = ?, '1', '0') WHERE staff_no = ?", [id, staffNo])
  await exec('UPDATE staff SET bank_id = ? WHERE staff_no = ?', [id, staffNo])
}
