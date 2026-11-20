// Payslips in the admin: browse a pay month, open any payslip, import the
// payroll system's export, and reset a staff member's payslip PIN.
//
//   GET    /api/payslips?year=&month=&q=&page=   the month's payslips, with totals
//   GET    /api/payslips/periods                 pay months on file, newest first
//   GET    /api/payslips/:id                     one payslip
//   POST   /api/payslips/import                  multipart { file } — the payroll JSON export
//   DELETE /api/payslips/pins/:staffNo           reset a forgotten PIN (turns the staff member's PIN lock off)
import { Hono } from 'hono'
import { getPool, importPayslips, parsePayrollExport } from '@hrms/db'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, like, one, paging, parseId, rows, scalar } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { MONTHS, loadPayslip } from '../lib/payslips'

const view = requirePermission('payslips', 'view')
const edit = requirePermission('payslips', 'edit')

const MAX_UPLOAD = 25 * 1024 * 1024

export const payslipsRoute = new Hono()
  .get('/periods', view, async (c) =>
    c.json(
      await rows(
        `SELECT pay_year AS year, pay_month AS month, COUNT(*) AS count, SUM(net_salary) AS net, MAX(imported_at) AS imported_at
           FROM hrms_payslips GROUP BY pay_year, pay_month ORDER BY pay_year DESC, pay_month DESC`,
      ),
    ),
  )

  .get('/', view, async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    let year = Number(q.year)
    let month = Number(q.month)
    if (!year || !month) {
      const latest = await one<{ year: number; month: number }>('SELECT pay_year AS year, pay_month AS month FROM hrms_payslips ORDER BY pay_year DESC, pay_month DESC LIMIT 1')
      if (!latest) return c.json({ data: [], total: 0, page, pageSize, year: null, month: null, totals: null })
      year = Number(latest.year)
      month = Number(latest.month)
    }
    const where = ['p.pay_year = ?', 'p.pay_month = ?']
    const params: Array<unknown> = [year, month]
    if (q.q) (where.push('(p.staff_name LIKE ? OR p.staff_no = ? OR p.unit_name LIKE ?)'), params.push(like(q.q), Number(q.q) || 0, like(q.q)))
    if (q.viewed === 'yes') where.push('p.first_viewed_at IS NOT NULL')
    if (q.viewed === 'no') where.push('p.first_viewed_at IS NULL')
    const base = `FROM hrms_payslips p WHERE ${where.join(' AND ')}`
    const [data, total, totals] = await Promise.all([
      rows(
        `SELECT p.id, p.staff_no, p.staff_name, p.category, p.job_title, p.unit_name, p.grade, p.notch, p.basic_salary, p.gross_salary,
                p.irs_tax + p.ssf_employee + p.sup_employee + p.prov_employee + p.total_deductions + p.total_loan_repayments AS total_deductions,
                p.net_salary, p.approved, p.has_access, p.first_viewed_at, p.view_count
           ${base} ORDER BY p.staff_name LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      ),
      scalar(`SELECT COUNT(*) ${base}`, params),
      one(
        `SELECT COUNT(*) AS count, SUM(gross_salary) AS gross, SUM(irs_tax) AS paye, SUM(ssf_employee + ssf_employer) AS ssnit, SUM(net_salary) AS net,
                SUM(first_viewed_at IS NOT NULL) AS viewed
           FROM hrms_payslips WHERE pay_year = ? AND pay_month = ?`,
        [year, month],
      ),
    ])
    return c.json({ data, total, page, pageSize, year, month, monthName: MONTHS[month - 1], totals })
  })

  .get('/:id', view, async (c) => {
    const slip = await loadPayslip(parseId(c.req.param('id')))
    if (!slip) throw notFound('Payslip')
    const pin = await one<{ setAt: string; locked: number }>('SELECT set_at, locked_until > NOW() AS locked FROM hrms_payslip_pins WHERE staff_no = ?', [slip.staffNo])
    return c.json({ ...slip, pin: pin ? { setAt: pin.setAt, locked: Boolean(pin.locked) } : null })
  })

  .post('/import', edit, async (c) => {
    const body = await c.req.parseBody()
    const file = body.file
    if (!(file instanceof File)) throw new AppError('Choose the payroll export (a .json file).', 422)
    if (file.size > MAX_UPLOAD) throw new AppError('The file is larger than 25 MB.', 413)
    let data: unknown
    try {
      data = JSON.parse(await file.text())
    } catch {
      throw new AppError('That file is not valid JSON. Upload the payroll system’s payslip export.', 422)
    }
    let payslips
    try {
      payslips = parsePayrollExport(data)
    } catch (e) {
      throw new AppError(e instanceof Error ? e.message : 'The file is not a payslip export.', 422)
    }
    const conn = await getPool().getConnection()
    try {
      const result = await importPayslips(conn, payslips)
      audit(c.get('user'), 'import', 'payslips', null, `Imported ${result.imported} payslips (${result.periods.join(', ')}) from ${file.name}`)
      return c.json(result)
    } finally {
      conn.release()
    }
  })

  .delete('/pins/:staffNo', edit, async (c) => {
    const staffNo = parseId(c.req.param('staffNo'))
    const done = await exec('DELETE FROM hrms_payslip_pins WHERE staff_no = ?', [staffNo])
    if (!done.affectedRows) throw new AppError('This staff member has not set a payslip PIN.', 404)
    audit(c.get('user'), 'delete', 'payslip_pin', staffNo, `Reset the payslip PIN of staff ${staffNo} (PIN lock turned off)`)
    return c.json({ ok: true })
  })
