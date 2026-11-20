// The GRA Employees Tax Deduction Form (Annual) — I.T. Form 51 (Supplementary)
// — for a staff member and tax year, from the PAYE records (legacy gratax),
// laid out as the old staff portal printed it. Staff print their own from the
// portal (GRA ETD).
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api, errorMessage } from '#/lib/api-client'
import { PrintPage } from '#/components/print/sheet'

export const Route = createFileRoute('/print/gra/$year')({
  head: () => ({ meta: [{ title: 'GRA tax deduction form · UCC Staff Portal' }] }),
  component: PrintGraForm,
})

type R = Record<string, any>

const EMPLOYER = { name: 'UNIVERSITY OF CAPE COAST', address: 'PMB CAPE COAST', tin: 'V0010763317' }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const n = (v: unknown) => Number(v ?? 0) || 0
const amount = (v: unknown) => n(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
/** Last day of the month, as 31-Jan-2025. */
const monthEnd = (year: number, month: number) => `${new Date(year, month, 0).getDate()}-${SHORT[month - 1]}-${year}`
const today = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}-${SHORT[d.getMonth()]}-${d.getFullYear()}`
}

/** Columns 1–8 of the form, from a gratax month. Column 2 is the taxable (cash) allowance, as GRA computes gross from it. */
const COLUMNS: Array<(m: R) => number> = [
  (m) => n(m.basic),
  (m) => n(m.taxableAllowance),
  () => 0, // benefits in kind are not recorded
  (m) => n(m.gross),
  (m) => n(m.relief),
  (m) => n(m.ssr),
  (m) => n(m.taxable),
  (m) => n(m.tax),
]

function PrintGraForm() {
  const { year } = Route.useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['portal', 'tax', year],
    queryFn: () => api.get<{ year: number | null; months: Array<R>; employee: R | null }>('/portal/tax', { year }),
  })
  const months = data?.year === Number(year) ? data.months : []
  const e = data?.employee ?? {}
  const totals = COLUMNS.map((col) => months.reduce((s, m) => s + col(m), 0))
  const missing = !isLoading && !error && !months.length ? `No PAYE records for ${year}.` : null

  return (
    <PrintPage title={`GRA tax deduction form ${year}`} loading={isLoading} error={error ? errorMessage(error) : missing} landscape bare backTo="/portal/tax">
      <div className="gra-form font-[Arial,Helvetica,sans-serif] text-[9pt] leading-snug">
        <style>{`
          .gra-form table { border-collapse: collapse; width: 100%; }
          .gra-form td, .gra-form th { border: 2px solid #000; padding: 1px 4px; vertical-align: top; }
          .gra-form thead th { vertical-align: middle; font-weight: 700; text-align: center; line-height: 1.15; }
          .gra-form tbody td.num, .gra-form tfoot th.num { text-align: right; font-variant-numeric: tabular-nums; }
          .gra-form small { font-size: 7pt; font-weight: 400; }
          /* One landscape page, as the old form printed. */
          @media print {
            .print-sheet:has(.gra-form) { padding: 8mm 10mm 6mm; }
            .gra-form { font-size: 8.5pt; }
            .gra-form td, .gra-form th { padding: 0 3px; }
            .gra-form img { height: 19mm; width: auto; }
          }
        `}</style>

        {/* Heading: GRA crest, title, coat of arms */}
        <div className="grid grid-cols-[1fr_2fr_1fr] items-center">
          <div className="flex flex-col items-center">
            <img src="/print/gra-logo.png" alt="Ghana Revenue Authority" className="size-[22mm] object-contain" />
            <b className="mt-0.5 text-[10pt]">GRA</b>
          </div>
          <div className="text-center">
            <h1 className="text-[15pt] font-bold tracking-wide">GHANA REVENUE AUTHORITY</h1>
            <p className="mt-1 text-[11pt]">DOMESTIC TAX REVENUE DIVISION</p>
            <p className="mt-1 text-[11pt] font-bold">EMPLOYEES TAX DEDUCTION FORM (ANNUAL)</p>
          </div>
          <div className="flex justify-center">
            <img src="/print/ghana-coat-of-arms.png" alt="Coat of arms of Ghana" className="h-[22mm] w-auto object-contain" />
          </div>
        </div>

        {/* Employee and employer */}
        <div className="mt-3 grid grid-cols-[3fr_1fr] gap-3">
          <div className="space-y-2">
            <div className="grid grid-cols-[7fr_5fr] gap-3">
              <table>
                <tbody>
                  <tr>
                    <td className="h-full">
                      Employee Name: {e.employeeName ?? ''}
                      <br />
                      Rank or Grade: {e.jobTitle ?? e.filedTitle ?? ''}
                      <br />
                      Address: {e.unitName ?? ''}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table>
                <tbody>
                  <tr>
                    <td>TIN \ GH Card: {e.ghanaCardNo ?? ''}</td>
                  </tr>
                  <tr>
                    <td>Social Security No.: {e.ssn ?? ''}</td>
                  </tr>
                  <tr>
                    <td>UCC TIN No.: {EMPLOYER.tin}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <table>
              <tbody>
                <tr>
                  <td>
                    Name of Employer: {EMPLOYER.name}
                    <br />
                    Address: {EMPLOYER.address}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <table className="h-full">
            <tbody>
              <tr>
                <td className="w-1/2">
                  <small>Employee&apos;s Signature OR Right Thumb Print</small>
                </td>
                <td className="relative text-center !align-middle">
                  <span className="absolute top-px left-1 text-left">Year Of Assessment:</span>
                  <b className="text-[12pt]">{year}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Monthly deductions */}
        <table className="mt-3">
          <thead>
            <tr>
              <th>Month</th>
              <th>
                1. Consolidated
                <br />
                Basic Salary
              </th>
              <th>
                2. Cash Allowance
                <br />
                Non-Consolidated
                <br />
                <small>(Specify On Reverse)</small>
              </th>
              <th>
                3. Benefits in Kind
                <br />
                <small>(Specify On Reverse)</small>
              </th>
              <th>
                4. Gross
                <br />
                Remuneration
                <br />
                <small>(Add 1 to 3)</small>
              </th>
              <th>
                5. Monthly
                <br />
                Deductible Relief
              </th>
              <th>
                6. Social Security
                <br />
                Relief
              </th>
              <th>
                7. Taxable
                <br />
                Emolument
                <br />
                <small>(Col. 4 less Col. 5 &amp; 6)</small>
              </th>
              <th>8. Tax Deducted</th>
              <th>
                9. Income Tax Receipt No. &amp;
                <br />
                Date Of Payment
              </th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <td>{MONTHS[Number(m.month) - 1] ?? m.month}</td>
                {COLUMNS.map((col, i) => (
                  <td key={i} className="num">
                    {amount(col(m))}
                  </td>
                ))}
                <td className="text-center">{monthEnd(Number(year), Number(m.month))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="text-left">Total</th>
              {totals.map((t, i) => (
                <th key={i} className="num">
                  {amount(t)}
                </th>
              ))}
              <th />
            </tr>
          </tfoot>
        </table>

        {/* Certificate */}
        <div className="mt-4 text-center">
          <p className="text-[10pt] font-bold">CERTIFICATE</p>
          <p className="mt-1">I certify the entries made above are correct in every detail and that the income tax deducted has been paid to the Ghana Revenue Authority.</p>
          <div className="mt-5 grid grid-cols-[5fr_7fr] text-left">
            <span>................................................................. 20............</span>
            <span>Signature &amp; Stamp of Employer ...........................................................</span>
          </div>
          <p className="mt-1 text-right">I.T.Form 51(Supplementary)</p>
        </div>

        <div className="mt-2 grid grid-cols-3 border-y-2 border-black py-1">
          <span>Report Printed On {today()}</span>
          <span className="text-center">Directorate of Finance, UCC</span>
          <span className="text-right">Page 1 of 1</span>
        </div>
      </div>
    </PrintPage>
  )
}
