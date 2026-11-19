import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CalendarDays, Check, X } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import type { Option, Page } from '#/lib/api-client'
import { date } from '#/lib/format'
import { LEAVE_STATUS_LABELS } from '#/lib/labels'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/input'
import { DataTable, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Combobox } from '#/components/admin/combobox'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StaffCell, StatusBadge } from '#/components/admin/page'

export const Route = createFileRoute('/portal/manage/leave')({ component: LeaveManager })

type R = Record<string, any>

function LeaveManager() {
  const [view, setView] = useState('pending')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [deciding, setDeciding] = useState<{ row: R; decision: 'approve' | 'reject' } | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'manage-leave', { view, q, page }],
    queryFn: () => api.get<Page<R> & { pending: number; decided: number }>('/portal/manage/leave', { view, q, page }),
    placeholderData: keepPreviousData,
  })
  const pending = view === 'pending'
  return (
    <>
      <DecisionDialog deciding={deciding} onClose={() => setDeciding(null)} />
      <PageHeader eyebrow="Management services" title="Leave manager" description="Recommend your staff’s leave to the Directorate of Human Resource, or decline it with a reason." />
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {(
          [
            ['pending', 'Waiting for me', data?.pending],
            ['decided', 'Decided by me', data?.decided],
            ['all', 'All my staff’s leave', view === 'all' ? data?.total : undefined],
          ] as Array<[string, string, number | undefined]>
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            onClick={() => (setView(value), setPage(1))}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              view === value ? 'border-primary bg-primary text-white' : 'bg-white text-slate-600 hover:border-border-strong',
            )}
          >
            {label}
            {count !== undefined && <span className={cn('rounded-full px-1.5 font-mono text-[0.65rem]', view === value ? 'bg-white/15' : 'bg-muted')}>{count}</span>}
          </button>
        ))}
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={CalendarDays} title={pending ? 'Nothing waiting for you' : 'No applications'} description={pending ? 'New leave applications from your staff appear here.' : undefined} />}
        columns={[
          { header: 'Staff', cell: (r: R) => <StaffCell link={false} staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /> },
          { header: 'Applied', cell: (r: R) => <span className="text-xs whitespace-nowrap">{date(r.appliedDate)}</span> },
          {
            header: 'Leave',
            cell: (r: R) => (
              <span className="block whitespace-nowrap">
                <span className="font-semibold">{r.approvedDays} days</span> <span className="text-xs text-muted-foreground capitalize">{String(r.type ?? '').toLowerCase()}</span>
                <span className="block text-xs text-muted-foreground">
                  {date(r.startDate)} – {date(r.endDate)}
                </span>
              </span>
            ),
          },
          { header: 'Reliever', cell: (r: R) => <span className="block max-w-40 truncate text-xs">{r.relieverName ?? '—'}</span> },
          {
            header: 'Status',
            cell: (r: R) => (
              <span className="block max-w-48">
                <StatusBadge status={r.status} label={LEAVE_STATUS_LABELS[r.status]} />
                {r.headRemark && <span className="mt-1 block truncate text-xs text-muted-foreground">{r.headRemark}</span>}
              </span>
            ),
          },
          {
            header: '',
            align: 'right',
            cell: (r: R) =>
              ['HEAD-PENDING', 'STAFF-PENDING'].includes(r.status) ? (
                <span className="flex justify-end gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => setDeciding({ row: r, decision: 'reject' })}>
                    <X /> Decline
                  </Button>
                  <Button size="sm" onClick={() => setDeciding({ row: r, decision: 'approve' })}>
                    <Check /> Recommend
                  </Button>
                </span>
              ) : null,
          },
        ]}
      />
      {data && data.total > data.pageSize && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function DecisionDialog({ deciding, onClose }: { deciding: { row: R; decision: 'approve' | 'reject' } | null; onClose: () => void }) {
  const [remark, setRemark] = useState('')
  const [relievedBy, setRelievedBy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const r = deciding?.row
  const approve = deciding?.decision === 'approve'
  const relievers = useQuery({
    queryKey: ['portal', 'leave-relievers', r?.id],
    queryFn: () => api.get<Array<Option>>(`/portal/manage/leave/${r!.id}/relievers`),
    enabled: Boolean(approve && r),
  })
  const clear = () => (setRemark(''), setRelievedBy(null), setError(null))
  const save = useSave((v: { id: number; decision: string; remark: string; relievedBy: number | null }) => api.post(`/portal/manage/leave/${v.id}/decision`, { decision: v.decision, remark: v.remark, relievedBy: v.relievedBy }), {
    invalidate: ['portal'],
    success: deciding?.decision === 'approve' ? 'Recommended and sent to HR' : 'Leave declined',
    onDone: () => (clear(), onClose()),
    onError: setError,
  })
  return (
    <FormDialog
      open={Boolean(deciding)}
      onOpenChange={(o) => !o && (onClose(), clear())}
      title={approve ? 'Recommend this leave?' : 'Decline this leave?'}
      description={r ? `${r.fullName}: ${r.approvedDays} days from ${date(r.startDate, 'long')} to ${date(r.endDate, 'long')}, resuming ${date(r.resumeDate, 'long')}.${r.applyNote ? ` Note: “${r.applyNote}”` : ''}` : undefined}
      submitLabel={approve ? 'Recommend to HR' : 'Decline'}
      busy={save.isPending}
      error={error}
      onSubmit={(e) => (e.preventDefault(), r && save.mutate({ id: r.id, decision: deciding!.decision, remark, relievedBy: approve ? relievedBy : null }))}
    >
      {approve && (
        <Field label="Reliever" className="sm:col-span-2" hint="Who covers this staff member’s duties while they are away. Colleagues already on leave then are not listed.">
          <Combobox options={relievers.data} loading={relievers.isLoading} value={relievedBy} onChange={setRelievedBy} placeholder="Choose the reliever…" />
        </Field>
      )}
      <Field label={approve ? 'Remark (optional)' : 'Reason'} required={!approve} className="sm:col-span-2" hint={approve ? 'HR sees your remark.' : 'The staff member sees this reason.'}>
        <Textarea rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} />
      </Field>
    </FormDialog>
  )
}
