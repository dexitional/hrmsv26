// A payslip exactly as the University's XPay portal laid it out: one 9-column
// table (particulars, employer contributions, allowances beside deductions,
// the pay summary, outstanding loans). Styles are in styles.css (.xpay-slip).
// Shared by the staff portal, the admin and the printout. `masked` hides
// every amount (for viewing in company).

export interface PayslipLineView {
  name: string
  amount: number
  isArrears?: boolean
}
export interface PayslipView {
  id: number
  staffNo: number
  year: number
  month: number
  monthName: string
  staffName: string
  jobTitle: string | null
  unitName: string | null
  location: string | null
  grade: string | null
  notch: string | null
  ssn: string | null
  bankName: string | null
  bankBranch: string | null
  bankAccountNo: string | null
  currency: string | null
  basicSalary: number
  grossSalary: number
  taxablePay: number
  netSalary: number
  irsTax: number
  ssfEmployee: number
  ssfEmployer: number
  supEmployee: number
  supEmployer: number
  provEmployee: number
  provEmployer: number
  totalAllowances: number
  totalDeductions: number
  allowances: Array<PayslipLineView>
  deductions: Array<PayslipLineView>
  reliefs: Array<PayslipLineView>
  loans: Array<{ loanType: string; loanAmount: number | null; openingBalance: number | null; repayment: number; closingBalance: number | null }>
}

const fmt = (v: number | null | undefined) => (v === null || v === undefined ? '' : Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const right = { textAlign: 'right', paddingRight: 10 } as const
/** XPay showed the department up to its first comma ("DIRECTORATE OF INFORMATION"). */
const dept = (unit: string | null) => (unit ?? '').split(',')[0]!.trim()

export function PayslipSheet({ slip, masked = false, paper = true, className }: { slip: PayslipView; masked?: boolean; paper?: boolean; className?: string }) {
  const amount = (v: number | null | undefined) => (masked ? '****' : fmt(v))
  // The first deduction (IRS Tax) sits on the basic salary row; the rest pair
  // with the allowances below it.
  const deductions: Array<PayslipLineView> = [
    { name: 'IRS Tax', amount: slip.irsTax },
    { name: 'Social Security (5.5%)', amount: slip.ssfEmployee },
    ...(slip.provEmployee ? [{ name: 'Provident Fund', amount: slip.provEmployee }] : []),
    ...(slip.supEmployee ? [{ name: 'Superannuation', amount: slip.supEmployee }] : []),
    ...slip.deductions,
    ...slip.loans.map((l) => ({ name: l.loanType, amount: l.repayment })),
  ]
  const [first, ...rest] = deductions
  const rows = Math.max(slip.allowances.length, rest.length)
  const totals = slip.loans.reduce(
    (t, l) => ({ amount: t.amount + (l.loanAmount ?? 0), opening: t.opening + (l.openingBalance ?? 0), repayment: t.repayment + l.repayment, closing: t.closing + (l.closingBalance ?? 0) }),
    { amount: 0, opening: 0, repayment: 0, closing: 0 },
  )

  return (
    <div className={['xpay-slip', paper ? 'xpay-slip-paper' : '', className].filter(Boolean).join(' ')}>
      <div className="table-responsive">
        <table className="slip">
          <tbody>
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', fontSize: 21 }}>
                <u>
                  <b>University of Cape Coast</b>
                </u>
              </td>
            </tr>
            <tr>
              <td colSpan={9} />
            </tr>
            <tr>
              <td colSpan={9} style={{ textAlign: 'center' }}>
                <div className="pull-left">
                  <b>Location: </b>
                  {slip.location || 'Cape Coast'}
                </div>
                <div style={{ fontSize: 14 }}>
                  <b style={{ marginLeft: -120 }}>
                    Payslip for {slip.monthName}, {slip.year}
                  </b>
                </div>
                <div style={{ clear: 'both' }} />
              </td>
            </tr>
            <tr>
              <td colSpan={9}>
                <hr />
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="nowrap">
                <span style={{ paddingRight: 20 }}>
                  <b>Name: </b>
                  {slip.staffName}
                </span>
              </td>
              <td colSpan={3} className="nowrap">
                <span>
                  <b>Notch:</b> {slip.notch}{' '}
                </span>
                <span style={{ paddingRight: 20 }}>
                  <b>Grade:</b> {slip.grade}
                </span>
              </td>
              <td colSpan={3}>
                <span style={{ marginRight: 40 }} />
                <span>
                  <b>SS No.:</b>
                  {slip.ssn}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="nowrap">
                <b>Employee ID:</b> {slip.staffNo}
              </td>
              <td colSpan={3} className="nowrap">
                <b>Bank:</b> {slip.bankName}
              </td>
              <td colSpan={3}>
                <span style={{ marginRight: 40 }} />
                <span>
                  <b>Bank Branch:</b> {slip.bankBranch}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="nowrap">
                <b>Dept.(OU): </b>
                {dept(slip.unitName)}
              </td>
              <td colSpan={3} className="nowrap">
                <b>Bank A/C No:</b> {masked ? '****************' : slip.bankAccountNo}
              </td>
              <td colSpan={3} className="nowrap">
                <span style={{ marginRight: 40 }} />
                <span>
                  <b>Job Title:</b> {slip.jobTitle}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan={9}>
                <hr />
              </td>
            </tr>
            <tr>
              <td colSpan={9} style={{ textAlign: 'right' }}>
                <b>SSF Contribution-Employer:</b> {amount(slip.ssfEmployer)}
              </td>
            </tr>
            <tr>
              <td colSpan={9} style={{ textAlign: 'right' }}>
                <b>S.A - Contribution Employer:</b> {amount(slip.supEmployer + slip.provEmployer)}
              </td>
            </tr>
            <tr style={{ textAlign: 'center' }}>
              <td colSpan={4}>
                <b>...........................Allowance/Special Earnings............................</b>
              </td>
              <td colSpan={5}>
                <b>...............................Deductions...................................</b>
              </td>
            </tr>
            <tr>
              <td colSpan={9}>
                <hr />
              </td>
            </tr>
            <tr>
              <td colSpan={9}>
                <b>Currency:</b> {slip.currency || 'Ghana Cedi'}
              </td>
            </tr>

            <tr>
              <td colSpan={2} style={{ width: 10, ...right }}>
                <b>Basic Salary</b>
              </td>
              <td colSpan={2} style={{ width: 10 }}>
                <b>
                  <u>Type of Allowance Due</u>
                </b>
              </td>
              <td style={{ ...right, width: 20 }}>
                <u>
                  <b>Amount</b>
                </u>
              </td>
              <td colSpan={2} style={{ width: 200 }}>
                <u>
                  <b>Type of Deductions</b>
                </u>
              </td>
              <td style={{ ...right, width: 50 }}>
                <u>
                  <b>Amount</b>
                </u>
              </td>
              <td style={{ ...right, width: 80 }} />
            </tr>
            <tr className="item">
              <td colSpan={2} style={{ width: 10, ...right }}>
                {amount(slip.basicSalary)}
              </td>
              <td colSpan={2} />
              <td />
              <td colSpan={2}>{first!.name}</td>
              <td style={right}>{amount(first!.amount)}</td>
              <td style={right} />
            </tr>
            {Array.from({ length: rows }, (_, i) => {
              const a = slip.allowances[i]
              const d = rest[i]
              return (
                <tr key={i} className="item">
                  <td colSpan={2} style={{ width: 10 }} />
                  <td colSpan={2}>{a?.name}</td>
                  <td style={right}>{a ? amount(a.amount) : null}</td>
                  <td colSpan={2}>{d?.name}</td>
                  <td style={right}>{d ? amount(d.amount) : null}</td>
                  <td />
                </tr>
              )
            })}
            <tr className="item">
              <td colSpan={2} style={{ width: 10 }} />
              <td colSpan={2}>
                <b>
                  <u>Total Allowances</u>
                </b>
              </td>
              <td style={right}>
                <b>
                  <u>{amount(slip.totalAllowances)}</u>
                </b>
              </td>
              <td colSpan={2}>
                <b>
                  <u>Total Deductions</u>
                </b>
              </td>
              <td style={right}>
                <b>
                  <u>{amount(slip.totalDeductions)}</u>
                </b>
              </td>
              <td />
            </tr>

            <tr style={{ height: 50 }}>
              <td colSpan={2} style={right}>
                <b>Basic Pay: </b>
              </td>
              <td colSpan={7} style={{ paddingRight: 0, textAlign: 'left' }}>
                <span className="dbl" style={{ marginRight: 20 }}>
                  <b>{amount(slip.basicSalary)}</b>
                </span>
                <b>Gross Pay: </b>
                <span className="dbl" style={{ marginRight: 20 }}>
                  <b>{amount(slip.grossSalary)}</b>
                </span>
                <b>Taxable Pay: </b>
                <span className="dbl">
                  <b>{amount(slip.taxablePay)}</b>
                </span>
                <span className="pull-right" style={{ paddingRight: 0, textAlign: 'right' }}>
                  <b>Total: </b>
                  <span className="dbl" style={{ marginRight: 20 }}>
                    <b>{amount(slip.grossSalary)}</b>
                  </span>
                  <b>Net Salary: </b>
                  <span className="dbl">
                    <b>{amount(slip.netSalary)}</b>
                  </span>
                </span>
              </td>
            </tr>

            {slip.loans.length > 0 && (
              <>
                <tr style={{ height: 20 }}>
                  <td colSpan={6} style={{ textAlign: 'center', borderBottom: '1px dashed #444' }}>
                    <b>Loan Outstanding Balance</b>
                  </td>
                  <td colSpan={3} />
                </tr>
                <tr>
                  <td colSpan={6}>
                    <table className="loans">
                      <tbody>
                        <tr style={{ height: 20 }}>
                          <td style={{ width: 150 }}>
                            <b>
                              <u>Loan Description</u>
                            </b>
                          </td>
                          {['Loan Amount', 'Opening Balance', 'Repayment', 'Closing Balance'].map((h) => (
                            <td key={h} style={{ width: 90, textAlign: 'right' }}>
                              <b>
                                <u>{h}</u>
                              </b>
                            </td>
                          ))}
                        </tr>
                        {slip.loans.map((l, i) => (
                          <tr key={i}>
                            <td style={{ width: 150 }}>{l.loanType}</td>
                            <td style={{ width: 90, textAlign: 'right' }}>{amount(l.loanAmount)}</td>
                            <td style={{ width: 90, textAlign: 'right' }}>{amount(l.openingBalance)}</td>
                            <td style={{ width: 90, textAlign: 'right' }}>{amount(l.repayment)}</td>
                            <td style={{ width: 90, textAlign: 'right' }}>{amount(l.closingBalance)}</td>
                          </tr>
                        ))}
                        <tr className="sum">
                          <td style={{ width: 150 }} />
                          <td style={{ width: 90, textAlign: 'right' }}>{amount(totals.amount)}</td>
                          <td style={{ width: 90, textAlign: 'right' }}>{amount(totals.opening)}</td>
                          <td style={{ width: 90, textAlign: 'right' }}>{amount(totals.repayment)}</td>
                          <td style={{ width: 90, textAlign: 'right' }}>{amount(totals.closing)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td colSpan={3} />
                </tr>
              </>
            )}

            <tr>
              <td colSpan={9}>
                <hr className="xpay-foot" />
              </td>
            </tr>
            <tr>
              <td colSpan={9} style={{ fontSize: 10, color: '#bbb', textAlign: 'center' }}>
                <em>UCC-XPay - Official Online Payslip **** Cape Coast</em>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
