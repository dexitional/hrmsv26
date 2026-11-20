// Payslips from the payroll system: a pay month at a time, any payslip in
// full, the payroll export import, and payslip PIN resets.
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Banknote, Eye, FileUp, KeyRound, Landmark, Loader2, ReceiptText, Upload, Users } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { dateTime, num } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { StatCard } from '#/components/admin/charts'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { useCan } from '#/components/admin/session'
import { PayslipDialog } from '#/components/payslip/payslip-dialog'

export const Route = createFileRoute('/admin/payslips')({ component: PayslipsPage })

type R = Record<string, any>
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const cedis = (v: unknown) => Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function PayslipsPage() {
  const canEdit = useCan('payslips', 'edit')
  const { confirm, dialog } = useConfirm()
  const [period, setPeriod] = useState('')
  const [q, setQ] = useState('')
  const [viewed, setViewed] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<R | null>(null)
  const [importing, setImporting] = useState(false)
  const periods = useQuery({ queryKey: ['payslip-periods'], queryFn: () => api.get<Array<R>>('/payslips/periods') })
  const [year, month] = period ? period.split('-').map(Number) : [undefined, undefined]
  const { data, isLoading } = useQuery({
    queryKey: ['payslips', { period, q, viewed, page }],
    queryFn: () => api.get<Page<R> & { year: number | null; month: number | null; monthName?: string; totals: R | null }>('/payslips', { year, month, q, viewed, page }),
    placeholderData: keepPreviousData,
  })
  const resetPin = useSave((staffNo: number) => api.delete(`/payslips/pins/${staffNo}`), { invalidate: ['payslip'], success: 'PIN reset. The staff member’s PIN lock is off until they turn it on again.' })
  const t = data?.totals
  const current = data?.year ? `${data.year}-${data.month}` : ''

  return (
    <>
      {dialog}
      <ImportDialog open={importing} onClose={() => setImporting(false)} />
      {viewing && (
        <PayslipDialog
          id={viewing.id}
          title={`${viewing.staffName} · ${MONTHS[(data?.month ?? 1) - 1]} ${data?.year} Payslip`}
          endpoint={`/payslips/${viewing.id}`}
          onClose={() => setViewing(null)}
          actions={(slip) =>
            canEdit && slip.pin ? (
              <button
                type="button"
                className="btn btn-default"
                onClick={() =>
                  confirm({
                    title: 'Reset this payslip PIN?',
                    description: `This turns off ${slip.staffName}’s PIN lock, so their payslips open without a PIN until they turn it on again with a new PIN.${slip.pin.locked ? ' Their PIN is locked after too many wrong tries.' : ''}`,
                    confirmLabel: 'Reset PIN',
                    onConfirm: () => resetPin.mutateAsync(slip.staffNo),
                  })
                }
              >
                <KeyRound /> Reset PIN
              </button>
            ) : null
          }
        />
      )}

      <PageHeader
        eyebrow="Modules"
        title="Payslips"
        description="Monthly payslips from the payroll system. Staff see their own in the staff portal once payroll releases them, behind a 4-digit PIN if they turned the PIN lock on."
        actions={
          canEdit && (
            <Button onClick={() => setImporting(true)}>
              <FileUp /> Import payroll export
            </Button>
          )
        }
      />

      {!isLoading && !data?.year ? (
        <EmptyState icon={Banknote} title="No payslips yet" description="Import the payroll system’s payslip export (JSON) to make payslips available to staff." />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard accent icon={ReceiptText} label={`${data?.monthName ?? ''} ${data?.year ?? ''}`} value={num(Number(t?.count ?? 0))} sub="payslips" />
            <StatCard icon={Banknote} label="Gross pay" value={cedis(t?.gross)} sub="GHS" />
            <StatCard icon={Landmark} label="Net pay" value={cedis(t?.net)} sub={`PAYE ${cedis(t?.paye)} · SSNIT ${cedis(t?.ssnit)}`} />
            <StatCard icon={Users} label="Opened by staff" value={num(Number(t?.viewed ?? 0))} sub={t?.count ? `${Math.round((Number(t.viewed) / Number(t.count)) * 100)}% of the month’s payslips` : undefined} />
          </div>
          <Toolbar>
            <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, staff number or unit…" />
            <FilterSelect
              label="Pay month"
              value={period || current}
              onChange={(v) => (setPeriod(v), setPage(1))}
              options={(periods.data ?? []).map((p) => ({ value: `${p.year}-${p.month}`, label: `${MONTHS[p.month - 1]} ${p.year} (${num(p.count)})` }))}
            />
            <FilterSelect
              label="Opened"
              value={viewed}
              onChange={(v) => (setViewed(v), setPage(1))}
              options={[
                { value: '', label: 'All' },
                { value: 'yes', label: 'Opened by staff' },
                { value: 'no', label: 'Not opened' },
              ]}
            />
          </Toolbar>
          <DataTable
            loading={isLoading}
            rows={data?.data}
            empty={<EmptyState icon={Banknote} title="No payslips match" />}
            columns={[
              { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.staffName} sub={r.jobTitle} link={false} /> },
              { header: 'Unit', cell: (r) => <span className="block max-w-56 truncate text-xs text-slate-600">{r.unitName}</span> },
              { header: 'Grade', cell: (r) => <span className="font-mono text-xs whitespace-nowrap">{[r.grade, r.notch].filter(Boolean).join(' · ')}</span> },
              { header: 'Gross', align: 'right', cell: (r) => <span className="font-mono text-xs">{cedis(r.grossSalary)}</span> },
              { header: 'Deductions', align: 'right', cell: (r) => <span className="font-mono text-xs text-slate-600">{cedis(r.totalDeductions)}</span> },
              { header: 'Net', align: 'right', cell: (r) => <span className="font-mono text-xs font-bold text-primary">{cedis(r.netSalary)}</span> },
              {
                header: 'Portal',
                cell: (r) =>
                  !r.approved || !r.hasAccess ? (
                    <Badge tone="warning">Not released</Badge>
                  ) : r.firstViewedAt ? (
                    <span className="text-xs whitespace-nowrap text-slate-600" title={`Opened ${r.viewCount} time${r.viewCount === 1 ? '' : 's'}`}>
                      Opened {dateTime(r.firstViewedAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not opened</span>
                  ),
              },
              {
                header: '',
                align: 'right',
                cell: (r) => (
                  <Button size="sm" variant="ghost" onClick={() => setViewing(r)} aria-label={`View payslip of ${r.staffName}`}>
                    <Eye />
                  </Button>
                ),
              },
            ]}
          />
          {data && data.total > data.pageSize && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
        </>
      )}
    </>
  )
}

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ imported: number; periods: Array<string>; unbalanced: Array<string> } | null>(null)
  const run = useSave((f: File) => api.upload<{ imported: number; periods: Array<string>; unbalanced: Array<string> }>('/payslips/import', f), {
    invalidate: ['payslips', 'payslip-periods', 'payslip'],
    success: (r) => `Imported ${num(r.imported)} payslips`,
    onDone: setResult,
    onError: setError,
  })
  const close = () => (onClose(), setFile(null), setError(null), setResult(null))
  const label = (p: string) => {
    const [y, m] = p.split('-').map(Number)
    return `${MONTHS[m! - 1]} ${y}`
  }
  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !o && close()}
      title="Import payroll export"
      description="The payslip export from the payroll system (a .json file). Payslips already imported are replaced with the file’s figures; nothing is sent to staff."
      submitLabel={result ? 'Done' : 'Import'}
      busy={run.isPending}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        if (result) return close()
        if (!file) return setError('Choose the export file.')
        setError(null)
        run.mutate(file)
      }}
    >
      {result ? (
        <div className="space-y-3 sm:col-span-2">
          <p className="rounded-xl bg-success-soft px-4 py-3 text-sm text-emerald-800">
            <b>{num(result.imported)} payslips</b> imported for {result.periods.map(label).join(', ')}.
          </p>
          {result.unbalanced.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <p className="mb-1 font-semibold">Net pay does not add up on {result.unbalanced.length} payslip(s); imported as exported:</p>
              <ul className="max-h-32 list-disc overflow-y-auto pl-4">
                {result.unbalanced.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center hover:border-primary/50 sm:col-span-2">
          {run.isPending ? <Loader2 className="size-6 animate-spin text-primary" /> : <Upload className="size-6 text-primary" />}
          <span className="text-sm font-semibold text-slate-800">{file ? file.name : 'Choose the payslip export (.json)'}</span>
          <span className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(0)} KB` : 'Up to 25 MB'}</span>
          <input type="file" accept=".json,application/json" className="sr-only" onChange={(e) => (setFile(e.target.files?.[0] ?? null), setError(null))} />
        </label>
      )}
    </FormDialog>
  )
}
