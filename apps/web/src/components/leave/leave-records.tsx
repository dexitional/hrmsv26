// Leave records: applications by status and year, with HR actions, plus the
// reliever and statistics tools.
import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { BarChart3, Ban, CalendarPlus, CheckCircle2, CircleStop, Pencil, Printer, UserMinus, XCircle } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { useLeaveTypes } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, StaffCell, StatusBadge } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffPrompt } from '#/components/admin/staff-prompt'
import { StatusTabs } from '#/components/admin/status-tabs'
import { LeaveApplicationDialog } from './application-dialog'
import { CURRENT_YEAR, YearSwitch } from './year-switch'

type Row = Record<string, any> & { id: number }
type Data = Page<Row> & { counts: Array<{ status: string; count: number }> }

const STATUSES = [
  { value: 'HR-PENDING', label: 'HR pended' },
  { value: 'HEAD-PENDING', label: 'Head pended' },
  { value: 'GRANTED', label: 'Active' },
  { value: 'ENDED', label: 'Ended' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function LeaveRecords({ status, year: yearParam, onFilter }: { status?: string; year?: number; onFilter: (p: { status?: string; year?: number }) => void }) {
  const year = yearParam === 0 ? null : (yearParam ?? CURRENT_YEAR)
  const canEdit = useCan('leave', 'edit')
  const { confirm, dialog } = useConfirm()
  const types = useLeaveTypes()
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [reliever, setReliever] = useState(false)
  const [stats, setStats] = useState(false)
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['leave-records', { status, year, q, type, page }],
    queryFn: () => api.get<Data>('/leave/records', { status, year: year ?? undefined, q, type, page }),
    placeholderData: keepPreviousData,
  })
  const act = useSave(({ id, action }: { id: number; action: string }) => api.post(`/leave/records/${id}/action`, { action }), {
    invalidate: ['leave-records'],
    success: 'Leave updated',
  })
  const ask = (r: Row, action: 'approve' | 'reject' | 'end' | 'cancel', label: string) =>
    confirm({
      title: `${label} leave of ${r.fullName}?`,
      description: `${r.type} leave, ${date(r.startDate)} – ${date(r.endDate)} (${r.approvedDays ?? '—'} days).`,
      danger: action === 'reject' || action === 'cancel',
      confirmLabel: label,
      onConfirm: () => act.mutateAsync({ id: r.id, action }),
    })
  return (
    <>
      {dialog}
      <RelieverPrompt open={reliever} onOpenChange={setReliever} />
      <LeaveApplicationDialog value={form} onClose={() => setForm(null)} />
      <StaffPrompt
        open={stats}
        onOpenChange={setStats}
        title="Leave statistics"
        description="A printable summary of a staff member's leave: entitlement, adjustments, days taken and balance by year."
        submitLabel="Open statistics"
        onSubmit={(s) => (setStats(false), window.open(`/print/leave/${s.staffNo}`, '_blank'))}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusTabs value={status ?? ''} onChange={(s) => (setPage(1), onFilter({ status: s || undefined, year: yearParam }))} options={STATUSES} counts={data?.counts} />
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setStats(true)}>
            <BarChart3 /> View statistics
          </Button>
          {canEdit && (
            <>
              <Button variant="secondary" onClick={() => setReliever(true)}>
                <UserMinus /> Remove reliever
              </Button>
              <Button onClick={() => setForm({ row: null })}>
                <CalendarPlus /> Apply for leave
              </Button>
            </>
          )}
        </div>
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
        <YearSwitch label="Year applied" value={year} onChange={(y) => (setPage(1), onFilter({ status, year: y === null ? 0 : y === CURRENT_YEAR ? undefined : y }))} />
        <FilterSelect label="Leave type" value={type} onChange={(v) => (setType(v), setPage(1))} options={(types.data ?? []).map((t) => ({ value: String(t.value), label: t.label }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState title="No leave applications here" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          { header: 'Type', cell: (r) => <Badge tone="brand" dot={false}>{r.type ?? '—'}</Badge> },
          { header: 'Applied', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.appliedDate)}</span> },
          { header: 'Period', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.startDate)} – {date(r.endDate)}</span> },
          { header: 'Days', align: 'right', cell: (r) => <span className="font-mono text-xs">{r.approvedDays ?? '—'}<span className="text-muted-foreground"> / {r.entitlement ?? '—'}</span></span> },
          { header: 'Reliever', cell: (r) => <span className="block max-w-40 truncate text-xs">{r.relieverName ?? '—'}</span> },
          { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
                <RowActions
                  actions={[
                    { label: 'Print application', icon: Printer, onSelect: () => window.open(`/print/leave-application/${r.id}`, '_blank') },
                    {
                      label: 'Edit application',
                      icon: Pencil,
                      hidden: !canEdit || !['HR-PENDING', 'HEAD-PENDING'].includes(r.status),
                      onSelect: () => void api.get<Row>(`/leave/records/${r.id}`).then((full) => setForm({ row: full })),
                    },
                    'separator',
                    { label: 'Approve (grant)', icon: CheckCircle2, hidden: !canEdit || !String(r.status).endsWith('PENDING'), onSelect: () => ask(r, 'approve', 'Approve') },
                    { label: 'Reject', icon: XCircle, hidden: !canEdit || !String(r.status).endsWith('PENDING'), onSelect: () => ask(r, 'reject', 'Reject') },
                    { label: 'End leave', icon: CircleStop, hidden: !canEdit || r.status !== 'GRANTED', onSelect: () => ask(r, 'end', 'End') },
                    { label: 'Cancel', icon: Ban, danger: true, hidden: !canEdit || !['GRANTED', 'HR-PENDING', 'HEAD-PENDING', 'STAFF-PENDING'].includes(r.status), onSelect: () => ask(r, 'cancel', 'Cancel') },
                  ]}
                />
              ),
          },
        ]}
      />
      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

const RELIEVER_LABELS: Record<number, string> = { 0: 'Not relieving anyone', 1: 'On leave', 2: 'On relief duty' }

function RelieverPrompt({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [error, setError] = useState<string | null>(null)
  const remove = useSave((staffNo: number) => api.post('/leave/reliever/remove', { staffNo }), {
    invalidate: ['leave-records', 'staff'],
    success: 'Reliever status removed',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <StaffPrompt
      open={open}
      onOpenChange={(o) => (setError(null), onOpenChange(o))}
      title="Remove reliever status"
      description="Sets the staff member's reliever status back to 0, so they are no longer held as relieving a colleague on leave."
      submitLabel="Remove reliever status"
      busy={remove.isPending}
      error={error}
      onSubmit={(s) => remove.mutate(s.staffNo)}
    >
      {(staff) => (staff ? <RelieverStatus staffNo={staff.staffNo} /> : null)}
    </StaffPrompt>
  )
}

function RelieverStatus({ staffNo }: { staffNo: number }) {
  const { data } = useQuery({
    queryKey: ['reliever', staffNo],
    queryFn: () => api.get<{ flagLeave: number | null; relieving: Array<Row> }>(`/leave/reliever/${staffNo}`),
  })
  if (!data) return null
  return (
    <div className="rounded-xl border bg-slate-50 p-3 text-sm">
      <p>
        Current status: <b>{RELIEVER_LABELS[data.flagLeave ?? 0] ?? `Flag ${data.flagLeave}`}</b> (flag {data.flagLeave ?? 'null'})
      </p>
      {data.relieving.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          {data.relieving.map((l) => (
            <li key={l.id}>
              Named reliever for {l.fullName} ({l.staffNo}), {date(l.startDate)} – {date(l.endDate)} · {l.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
