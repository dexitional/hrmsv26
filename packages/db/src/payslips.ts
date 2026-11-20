// Payslips from the payroll system (Directorate of Finance), imported from its
// JSON export into hrms_payslips, hrms_payslip_lines and hrms_payslip_loans
// (migration 0040). Used by the CLI importer and by the admin upload.
//
// Safe to repeat: a payslip is matched on its payroll id and replaced (header
// updated, lines and loans rewritten), so a corrected export overwrites the
// earlier one. The staff member's viewing history is kept.
import type mysql from 'mysql2/promise'

type Line = { id?: string; amount?: number; taxable?: number; frequency?: string } & Record<string, unknown>
type Loan = { id?: string; loanType?: string; principalPayment?: number; interestPayment?: number; loanBalance?: number; loanAmount?: number }

/** One payslip as the payroll system exports it. */
export interface PayrollPayslip {
  id: string
  hrId: number
  staffCode: string
  staffName: string
  category?: string
  jobTitle?: string
  unitName?: string
  location?: string
  grade?: string
  notch?: string
  ssn?: string
  payMonth: number
  payYear: number
  daysWorked?: number
  bankAccountNo?: string
  bankName?: string
  bankBranch?: string
  currency?: string
  salary?: number
  basicSalary?: number
  netSalary?: number
  irsTax?: number
  ssfDeductEmployee?: number
  ssfDeductEmployer?: number
  supEmployee?: number
  supEmployer?: number
  provEmployee?: number
  provEmployer?: number
  createdDate?: string
  createdBy?: string | null
  isHead?: number
  headId?: number | null
  employee?: { workEmail?: string; activePhone?: string }
  payslipMainApproval?: {
    id?: string
    approved?: number
    comment?: string | null
    approvedByHod?: number | null
    approvedDate?: string | null
    hasAccess?: number
    hasApproved?: number | null
  } | null
  payslipAllowance?: Array<Line>
  payslipDeduction?: Array<Line>
  payslipRelief?: Array<Line>
  payslipLoan?: Array<Loan>
}

export interface PayslipImportResult {
  imported: number
  /** Payslips whose net pay does not add up from their figures (imported as exported). */
  unbalanced: Array<string>
  /** Distinct pay periods in the file, as YYYY-MM. */
  periods: Array<string>
}

/** Payroll text is fixed-width ("19L ", "ADB BANK ") and sometimes double-spaced. */
const text = (v: unknown, max = 255) => {
  const s = String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim()
  return s ? s.slice(0, max) : null
}
const money = (v: unknown) => Math.round((Number(v) || 0) * 100) / 100
const sum = (list: Array<{ amount?: number }> | undefined) => money((list ?? []).reduce((t, x) => t + (Number(x.amount) || 0), 0))
/** ISO timestamps from the export, as MySQL DATETIME (UTC). */
const when = (v: unknown) => {
  if (!v) return null
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace('T', ' ')
}
const ARREARS = /arrears\s*$/i

/** Checks the export's shape before anything is written; throws with the first problem found. */
export function parsePayrollExport(data: unknown): Array<PayrollPayslip> {
  if (!Array.isArray(data)) throw new Error('The file must be a JSON array of payslips, as the payroll system exports them.')
  if (!data.length) throw new Error('The file has no payslips.')
  data.forEach((p: Partial<PayrollPayslip>, i) => {
    const where = `Payslip ${i + 1}${p?.id ? ` (${p.id})` : ''}`
    if (!p || typeof p !== 'object') throw new Error(`${where} is not a payslip.`)
    if (!p.id || !p.hrId) throw new Error(`${where} has no payroll id.`)
    if (!Number(p.staffCode)) throw new Error(`${where} has no staff number (staffCode).`)
    if (!(Number(p.payYear) > 2000) || !(Number(p.payMonth) >= 1 && Number(p.payMonth) <= 12)) throw new Error(`${where} has no valid pay month.`)
  })
  return data as Array<PayrollPayslip>
}

export async function importPayslips(conn: mysql.Connection | mysql.PoolConnection, payslips: Array<PayrollPayslip>, dryRun = false): Promise<PayslipImportResult> {
  const result: PayslipImportResult = { imported: 0, unbalanced: [], periods: [] }
  const periods = new Set<string>()
  for (const p of payslips) {
    const allowances = p.payslipAllowance ?? []
    const deductions = p.payslipDeduction ?? []
    const reliefs = p.payslipRelief ?? []
    const loans = p.payslipLoan ?? []
    const basic = money(p.basicSalary)
    const totalAllowances = sum(allowances)
    const gross = money(basic + totalAllowances)
    const totalDeductions = sum(deductions)
    const totalLoans = money(loans.reduce((t, l) => t + (Number(l.principalPayment) || 0) + (Number(l.interestPayment) || 0), 0))
    const expected = money(gross - money(p.irsTax) - money(p.ssfDeductEmployee) - money(p.supEmployee) - money(p.provEmployee) - totalDeductions - totalLoans)
    if (Math.abs(expected - money(p.netSalary)) > 0.05) result.unbalanced.push(`${p.id} (staff ${p.staffCode}): net ${money(p.netSalary)}, figures give ${expected}`)
    periods.add(`${p.payYear}-${String(p.payMonth).padStart(2, '0')}`)

    const a = p.payslipMainApproval ?? {}
    const header = {
      payroll_id: String(p.id),
      payroll_employee_id: Number(p.hrId),
      staff_no: Number(p.staffCode),
      pay_year: Number(p.payYear),
      pay_month: Number(p.payMonth),
      staff_name: text(p.staffName, 200) ?? '',
      category: text(p.category, 60),
      job_title: text(p.jobTitle, 150),
      unit_name: text(p.unitName),
      location: text(p.location, 100),
      grade: text(p.grade, 10),
      notch: text(p.notch, 10),
      ssn: text(p.ssn, 30),
      days_worked: p.daysWorked ?? null,
      is_head: p.isHead ? 1 : 0,
      head_payroll_id: p.headId ?? null,
      work_email: text(p.employee?.workEmail, 150)?.toLowerCase() ?? null,
      phone: text(p.employee?.activePhone, 30),
      bank_name: text(p.bankName, 150),
      bank_branch: text(p.bankBranch, 150),
      bank_account_no: text(p.bankAccountNo, 40),
      currency: text(p.currency, 30) ?? 'Ghana Cedi',
      annual_salary: money(p.salary),
      basic_salary: basic,
      total_allowances: totalAllowances,
      gross_salary: gross,
      total_reliefs: sum(reliefs),
      irs_tax: money(p.irsTax),
      ssf_employee: money(p.ssfDeductEmployee),
      ssf_employer: money(p.ssfDeductEmployer),
      sup_employee: money(p.supEmployee),
      sup_employer: money(p.supEmployer),
      prov_employee: money(p.provEmployee),
      prov_employer: money(p.provEmployer),
      total_deductions: totalDeductions,
      total_loan_repayments: totalLoans,
      net_salary: money(p.netSalary),
      approval_id: text(a.id, 40),
      approved: a.approved ? 1 : 0,
      approved_by_payroll_id: a.approvedByHod ?? null,
      approved_at: when(a.approvedDate),
      approval_comment: text(a.comment, 500),
      has_access: a.hasAccess ? 1 : 0,
      has_approved: a.hasApproved ?? null,
      payroll_created_at: when(p.createdDate),
      payroll_created_by: text(p.createdBy, 100),
    }
    if (dryRun) {
      result.imported++
      continue
    }

    await conn.beginTransaction()
    try {
      const cols = Object.keys(header)
      await conn.query(
        `INSERT INTO hrms_payslips (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE ${cols
           .filter((c) => c !== 'payroll_id')
           .map((c) => `${c} = VALUES(${c})`)
           .join(', ')}`,
        Object.values(header),
      )
      const [[row]] = await conn.query<Array<mysql.RowDataPacket>>('SELECT id FROM hrms_payslips WHERE payroll_id = ?', [header.payroll_id])
      const payslipId = row!.id as number
      await conn.query('DELETE FROM hrms_payslip_lines WHERE payslip_id = ?', [payslipId])
      await conn.query('DELETE FROM hrms_payslip_loans WHERE payslip_id = ?', [payslipId])
      const lines = [
        ...allowances.map((l) => ['ALLOWANCE', l.allowanceType, l] as const),
        ...deductions.map((l) => ['DEDUCTION', l.deductionType, l] as const),
        ...reliefs.map((l) => ['RELIEF', l.reliefType, l] as const),
      ]
      for (const [kind, name, l] of lines) {
        const label = text(name, 150) ?? 'Unnamed'
        await conn.query(
          'INSERT INTO hrms_payslip_lines (payslip_id, source_id, kind, name, amount, taxable, is_arrears, frequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [payslipId, text(l.id, 40), kind, label, money(l.amount), kind === 'ALLOWANCE' ? (l.taxable ? 1 : 0) : null, ARREARS.test(label) ? 1 : 0, text(l.frequency, 20)],
        )
      }
      for (const l of loans) {
        await conn.query(
          'INSERT INTO hrms_payslip_loans (payslip_id, source_id, loan_type, principal_payment, interest_payment, loan_balance, loan_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [payslipId, text(l.id, 40), text(l.loanType, 150) ?? 'Loan', money(l.principalPayment), money(l.interestPayment), l.loanBalance ?? null, l.loanAmount ?? null],
        )
      }
      await conn.commit()
      result.imported++
    } catch (e) {
      await conn.rollback()
      throw e
    }
  }
  result.periods = [...periods].sort()
  return result
}
