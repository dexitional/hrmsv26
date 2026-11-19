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
import { exec, insert, one, parseId, rows, update } from '../lib/db'
import { notFound } from '../lib/errors'
import { flag, requireStaff } from '../lib/hr'
import { validate } from '../lib/validate'

const view = requirePermission('staff', 'view')
const edit = requirePermission('staff', 'edit')
const manage = requirePermission('staff', 'manage')
const staffParam = (v: string | undefined) => Number(v)

/** Next relative code for a staff member: 14023A, 14023B, … 14023Z, 14023AA… */
async function nextRelativeCode(staffNo: number) {
  const codes = await rows<{ code: string | null }>('SELECT code FROM staff_rel WHERE staff_no = ?', [staffNo])
  const suffixes = codes.map((c) => (c.code ?? '').replace(String(staffNo), '')).filter((s) => /^[A-Z]+$/.test(s))
  const toNum = (s: string) => [...s].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0)
  const toStr = (n: number): string => (n <= 0 ? '' : toStr(Math.floor((n - 1) / 26)) + String.fromCharCode(65 + ((n - 1) % 26)))
  const max = Math.max(0, ...suffixes.map(toNum))
  return `${staffNo}${toStr(max + 1)}`
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
          ORDER BY active DESC, FIELD(relation, 'SPOUSE', 'CHILD', 'FATHER', 'MOTHER') = 0, FIELD(relation, 'SPOUSE', 'CHILD', 'FATHER', 'MOTHER'), dob`,
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
    const id = await insert('staff_rel', { ...relativeColumns(data), staffNo: staff.staffNo, code: await nextRelativeCode(staff.staffNo) })
    audit(c.get('user'), 'create', 'staff', staff.staffNo, `Added ${data.relation.toLowerCase()} ${data.fname} ${data.lname} to ${staff.fullName}`)
    return c.json({ id }, 201)
  })
  .put('/relatives/:id', edit, validate('json', relativeSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const data = c.req.valid('json')
    const rel = await one<{ staffNo: number }>('SELECT staff_no FROM staff_rel WHERE id = ?', [id])
    if (!rel) throw notFound('Relative')
    // One next of kin per staff member.
    if (data.kin) await exec("UPDATE staff_rel SET kin = '0' WHERE staff_no = ? AND id <> ?", [rel.staffNo, id])
    await update('staff_rel', id, relativeColumns(data))
    audit(c.get('user'), 'update', 'staff', rel.staffNo, `Updated relative ${data.fname} ${data.lname}`)
    return c.json({ id })
  })
  .delete('/relatives/:id', manage, async (c) => {
    const id = parseId(c.req.param('id'))
    const rel = await one<{ staffNo: number; fname: string; lname: string }>('SELECT staff_no, fname, lname FROM staff_rel WHERE id = ?', [id])
    if (!rel) throw notFound('Relative')
    await exec('DELETE FROM staff_rel WHERE id = ?', [id])
    audit(c.get('user'), 'delete', 'staff', rel.staffNo, `Removed relative ${rel.fname} ${rel.lname}`)
    return c.json({ ok: true })
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
