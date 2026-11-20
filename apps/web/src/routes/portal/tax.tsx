import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Printer, Receipt } from 'lucide-react'
import { api } from '#/lib/api-client'
import { money } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { DataTable, FilterSelect, Toolbar } from '#/components/admin/data-table'
import { EmptyState, PageHeader } from '#/components/admin/page'

export const Route = createFileRoute('/portal/tax')({ component: MyTax })

type R = Record<string, any>
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const sum = (rows: Array<R>, k: string) => rows.reduce((s, r) => s + Number(r[k] ?? 0), 0)

function MyTax() {
  const [year, setYear] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'tax', year], queryFn: () => api.get<{ years: Array<number>; year: number | null; months: Array<R> }>('/portal/tax', { year: year || undefined }) })
  const months = data?.months ?? []
  return (
    <>
      <PageHeader
        eyebrow="Staff services"
        title="GRA ETD"
        description="Your monthly PAYE records (emoluments, reliefs and tax) as filed with the Ghana Revenue Authority."
        actions={
          months.length > 0 && (
            <Button variant="outline" onClick={() => window.open(`/print/gra/${data?.year}`, '_blank')}>
              <Printer /> Print GRA form
            </Button>
          )
        }
      />
      {data && data.years.length > 0 && (
        <Toolbar>
          <FilterSelect label="Tax year" value={year || String(data.year ?? '')} onChange={setYear} options={data.years.map((y) => ({ value: String(y), label: String(y) }))} />
        </Toolbar>
      )}
      {!isLoading && !data?.years.length ? (
        <EmptyState icon={Receipt} title="No tax records" description="PAYE records filed for you appear here. Contact the Directorate of Finance if you expect to see some." />
      ) : (
        <>
          {months.length > 0 && (
            <Card className="mb-4">
              <CardHeader title={`${data?.year} totals`} />
              <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(
                  [
                    ['Gross', sum(months, 'gross')],
                    ['Reliefs', sum(months, 'relief')],
                    ['Taxable', sum(months, 'taxable')],
                    ['Tax paid', sum(months, 'tax')],
                  ] as Array<[string, number]>
                ).map(([label, v], i) => (
                  <div key={label} className={i === 3 ? 'rounded-xl bg-primary px-4 py-3 text-white' : 'rounded-xl bg-slate-50 px-4 py-3'}>
                    <p className={i === 3 ? 'eyebrow text-white/70' : 'eyebrow'}>{label}</p>
                    <p className="mt-1 text-xl font-extrabold tabular-nums">{money(v)}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
          <DataTable
            loading={isLoading}
            rows={months}
            columns={[
              { header: 'Month', cell: (r: R) => <span className="font-semibold">{MONTHS[Number(r.month) - 1] ?? r.month}</span> },
              { header: 'Basic', align: 'right', cell: (r: R) => <span className="font-mono text-xs">{money(r.basic)}</span> },
              { header: 'Allowances', align: 'right', cell: (r: R) => <span className="font-mono text-xs">{money(Number(r.taxableAllowance ?? 0) + Number(r.nonTaxableAllowance ?? 0))}</span> },
              { header: 'Gross', align: 'right', cell: (r: R) => <span className="font-mono text-xs">{money(r.gross)}</span> },
              { header: 'SSNIT', align: 'right', cell: (r: R) => <span className="font-mono text-xs">{money(r.ssr)}</span> },
              { header: 'Relief', align: 'right', cell: (r: R) => <span className="font-mono text-xs">{money(r.relief)}</span> },
              { header: 'Taxable', align: 'right', cell: (r: R) => <span className="font-mono text-xs">{money(r.taxable)}</span> },
              { header: 'PAYE', align: 'right', cell: (r: R) => <span className="font-mono text-xs font-bold text-primary">{money(r.tax)}</span> },
            ]}
          />
        </>
      )}
    </>
  )
}
