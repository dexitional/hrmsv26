// The staff member's own disciplinary record, read-only, with a printable copy.
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Printer, ShieldCheck } from 'lucide-react'
import { DISCIPLINARY_ACTIONS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { statusLabel } from '#/lib/labels'
import { Button } from '#/components/ui/button'
import { DataTable } from '#/components/admin/data-table'
import { EmptyState, PageHeader, StatusBadge } from '#/components/admin/page'
import { useStaff } from '#/components/portal/session'

export const Route = createFileRoute('/portal/disciplinary')({ component: MyDisciplinary })

type R = Record<string, any>

function MyDisciplinary() {
  const staff = useStaff()
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'disciplinary'], queryFn: () => api.get<{ staff: R; records: Array<R> }>('/portal/disciplinary') })
  const records = data?.records ?? []
  return (
    <>
      <PageHeader
        eyebrow="Staff services"
        title="Disciplinary"
        description="Disciplinary actions on your record, as kept by the Directorate of Human Resource. Contact the Directorate if anything here looks wrong."
        actions={
          <Button variant="outline" onClick={() => window.open(`/print/disciplinary/${staff.staffNo}?from=portal`, '_blank')} disabled={!data}>
            <Printer /> Print record
          </Button>
        }
      />
      {data && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[...DISCIPLINARY_ACTIONS, null].map((a) => (
            <div key={a ?? 'total'} className={a ? 'rounded-xl border bg-white px-4 py-3' : 'rounded-xl bg-primary px-4 py-3 text-white'}>
              <p className={a ? 'eyebrow' : 'eyebrow text-white/70'}>{a ? statusLabel(a) : 'Total'}</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{a ? records.filter((r) => r.actionType === a).length : records.length}</p>
            </div>
          ))}
        </div>
      )}
      <DataTable
        loading={isLoading}
        rows={records}
        empty={<EmptyState icon={ShieldCheck} title="No disciplinary action on your record" description="Nothing has been recorded against you." />}
        columns={[
          { header: 'Date issued', cell: (r: R) => <span className="text-xs whitespace-nowrap">{date(r.issueDate, 'long')}</span> },
          { header: 'Action taken', cell: (r: R) => <StatusBadge status={r.actionType} label={statusLabel(r.actionType ?? '')} /> },
          { header: 'Reason', cell: (r: R) => <span className="block max-w-md text-sm whitespace-pre-line">{r.reason || '—'}</span> },
          { header: 'Remark', cell: (r: R) => <span className="block max-w-sm text-xs whitespace-pre-line text-slate-600">{r.remark || '—'}</span> },
        ]}
      />
    </>
  )
}
