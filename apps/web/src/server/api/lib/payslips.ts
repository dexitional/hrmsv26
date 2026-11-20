// Payslips (hrms_payslips, from the payroll system's export) and the PIN that
// unlocks them in the staff portal.
import bcrypt from 'bcryptjs'
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { exec, one, rows } from './db'
import { AppError } from './errors'

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Only payslips payroll has approved and released to the staff member. */
export const RELEASED = 'p.approved = 1 AND p.has_access = 1'

export interface PayslipLine {
  name: string
  amount: number
  taxable: boolean | null
  isArrears: boolean
}
export interface PayslipLoan {
  loanType: string
  loanAmount: number | null
  openingBalance: number | null
  repayment: number
  closingBalance: number | null
}

/**
 * A payslip with everything the slip shows. Taxable pay is gross less the
 * employee's SSNIT (and provident/superannuation) contributions; total
 * deductions add PAYE and SSNIT to the other deductions and loan repayments,
 * as the XPay slip printed them. A loan's opening balance is this month's
 * closing balance plus the repayment.
 */
export async function loadPayslip(id: number) {
  const p = await one<Record<string, any>>('SELECT * FROM hrms_payslips WHERE id = ?', [id])
  if (!p) return null
  const [lines, loans] = await Promise.all([
    rows<{ kind: string; name: string; amount: number; taxable: number | null; isArrears: number }>(
      'SELECT kind, name, amount, taxable, is_arrears FROM hrms_payslip_lines WHERE payslip_id = ? ORDER BY id',
      [id],
    ),
    rows<{ loanType: string; principalPayment: number; interestPayment: number; loanBalance: number | null; loanAmount: number | null }>(
      'SELECT loan_type, principal_payment, interest_payment, loan_balance, loan_amount FROM hrms_payslip_loans WHERE payslip_id = ? ORDER BY id',
      [id],
    ),
  ])
  const line = (l: (typeof lines)[number]): PayslipLine => ({ name: l.name, amount: Number(l.amount), taxable: l.taxable === null ? null : Boolean(l.taxable), isArrears: Boolean(l.isArrears) })
  const n = (v: unknown) => Number(v) || 0
  const round = (v: number) => Math.round(v * 100) / 100
  const loanRows: Array<PayslipLoan> = loans.map((l) => {
    const repayment = round(n(l.principalPayment) + n(l.interestPayment))
    return {
      loanType: l.loanType,
      loanAmount: l.loanAmount === null ? null : n(l.loanAmount),
      openingBalance: l.loanBalance === null ? null : round(n(l.loanBalance) + n(l.principalPayment)),
      repayment,
      closingBalance: l.loanBalance === null ? null : n(l.loanBalance),
    }
  })
  return {
    id: Number(p.id),
    payrollId: p.payrollId as string,
    staffNo: Number(p.staffNo),
    year: Number(p.payYear),
    month: Number(p.payMonth),
    monthName: MONTHS[Number(p.payMonth) - 1]!,
    staffName: p.staffName as string,
    category: p.category,
    jobTitle: p.jobTitle,
    unitName: p.unitName,
    location: p.location,
    grade: p.grade,
    notch: p.notch,
    ssn: p.ssn,
    bankName: p.bankName,
    bankBranch: p.bankBranch,
    bankAccountNo: p.bankAccountNo,
    currency: p.currency,
    annualSalary: n(p.annualSalary),
    basicSalary: n(p.basicSalary),
    grossSalary: n(p.grossSalary),
    taxablePay: round(n(p.grossSalary) - n(p.ssfEmployee) - n(p.provEmployee) - n(p.supEmployee) - n(p.totalReliefs)),
    netSalary: n(p.netSalary),
    irsTax: n(p.irsTax),
    ssfEmployee: n(p.ssfEmployee),
    ssfEmployer: n(p.ssfEmployer),
    supEmployee: n(p.supEmployee),
    supEmployer: n(p.supEmployer),
    provEmployee: n(p.provEmployee),
    provEmployer: n(p.provEmployer),
    totalAllowances: n(p.totalAllowances),
    totalDeductions: round(n(p.irsTax) + n(p.ssfEmployee) + n(p.supEmployee) + n(p.provEmployee) + n(p.totalDeductions) + n(p.totalLoanRepayments)),
    allowances: lines.filter((l) => l.kind === 'ALLOWANCE').map(line),
    deductions: lines.filter((l) => l.kind === 'DEDUCTION').map(line),
    reliefs: lines.filter((l) => l.kind === 'RELIEF').map(line),
    loans: loanRows,
    approved: Boolean(p.approved),
    released: Boolean(p.hasAccess),
    approvedAt: p.approvedAt,
    approvalComment: p.approvalComment,
    firstViewedAt: p.firstViewedAt,
    lastViewedAt: p.lastViewedAt,
    viewCount: Number(p.viewCount) || 0,
    importedAt: p.importedAt,
    updatedAt: p.updatedAt,
  }
}
export type Payslip = NonNullable<Awaited<ReturnType<typeof loadPayslip>>>

export function recordView(id: number) {
  void exec(
    'UPDATE hrms_payslips SET first_viewed_at = COALESCE(first_viewed_at, NOW()), last_viewed_at = NOW(), view_count = view_count + 1 WHERE id = ?',
    [id],
  ).catch(() => undefined)
}

// ---------------------------------------------------------------- PIN

const UNLOCK_COOKIE = 'hrms_payslips'
const UNLOCK_SECONDS = 15 * 60
const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15

function secret(): string {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set to at least 32 characters.')
  return s
}

export async function pinState(staffNo: number) {
  const pin = await one<{ failedAttempts: number; lockedUntil: string | null; locked: number }>(
    'SELECT failed_attempts, locked_until, locked_until > NOW() AS locked FROM hrms_payslip_pins WHERE staff_no = ?',
    [staffNo],
  )
  return { set: Boolean(pin), lockedUntil: pin?.locked ? pin.lockedUntil : null }
}

export async function setPin(staffNo: number, pin: string) {
  const hash = await bcrypt.hash(pin, 10)
  await exec(
    `INSERT INTO hrms_payslip_pins (staff_no, pin_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE pin_hash = VALUES(pin_hash), failed_attempts = 0, locked_until = NULL, set_at = NOW()`,
    [staffNo, hash],
  )
}

/** Checks a PIN, counting wrong tries; throws when it is wrong or locked. */
export async function checkPin(staffNo: number, pin: string) {
  const row = await one<{ pinHash: string; failedAttempts: number; locked: number }>(
    'SELECT pin_hash, failed_attempts, locked_until > NOW() AS locked FROM hrms_payslip_pins WHERE staff_no = ?',
    [staffNo],
  )
  if (!row) throw new AppError('Set your payslip PIN first.', 409)
  if (row.locked) throw new AppError(`Too many wrong PINs. Try again in ${LOCK_MINUTES} minutes, or ask HR to reset your PIN.`, 429)
  if (await bcrypt.compare(pin, row.pinHash)) {
    if (row.failedAttempts) await exec('UPDATE hrms_payslip_pins SET failed_attempts = 0, locked_until = NULL WHERE staff_no = ?', [staffNo])
    return
  }
  const attempts = Number(row.failedAttempts) + 1
  const lock = attempts >= MAX_ATTEMPTS
  await exec(
    `UPDATE hrms_payslip_pins SET failed_attempts = ?, locked_until = ${lock ? `NOW() + INTERVAL ${LOCK_MINUTES} MINUTE` : 'NULL'} WHERE staff_no = ?`,
    [lock ? 0 : attempts, staffNo],
  )
  throw new AppError(
    lock ? `Too many wrong PINs. Your payslips are locked for ${LOCK_MINUTES} minutes.` : `That PIN is not right. ${MAX_ATTEMPTS - attempts} ${MAX_ATTEMPTS - attempts === 1 ? 'try' : 'tries'} left.`,
    lock ? 429 : 422,
  )
}

/** After the right PIN: payslips stay open in this browser for 15 minutes. */
export async function grantUnlock(c: Context, staffNo: number) {
  const now = Math.floor(Date.now() / 1000)
  setCookie(c, UNLOCK_COOKIE, await sign({ sub: staffNo, kind: 'payslips', iat: now, exp: now + UNLOCK_SECONDS }, secret(), 'HS256'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/api/portal/payslips',
    maxAge: UNLOCK_SECONDS,
  })
  return new Date((now + UNLOCK_SECONDS) * 1000).toISOString()
}

export function revokeUnlock(c: Context) {
  deleteCookie(c, UNLOCK_COOKIE, { path: '/api/portal/payslips' })
}

/** When this browser's unlock for the staff member ends, or null if locked. */
export async function unlockedUntil(c: Context, staffNo: number): Promise<string | null> {
  const token = getCookie(c, UNLOCK_COOKIE)
  if (!token) return null
  try {
    const payload = await verify(token, secret(), 'HS256')
    if (payload.kind !== 'payslips' || Number(payload.sub) !== staffNo) return null
    return new Date(Number(payload.exp) * 1000).toISOString()
  } catch {
    return null
  }
}
