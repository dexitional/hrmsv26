import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { FileSpreadsheet, Printer, Users } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Combobox } from '#/components/admin/combobox'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { DetailList, EmptyState, PageHeader, StaffCell, StatusBadge } from '#/components/admin/page'
import { StatusTabs } from '#/components/admin/status-tabs'
import { MY_LEAVE_LABELS } from '#/components/portal/labels'

export const Route = createFileRoute('/portal/manage/staff')({ component: StaffManager })

type R = Record<string, any>

function StaffManager() {
  const [q, setQ] = useState('')
  const [unit, setUnit] = useState<number | null>(null)
  const [group, setGroup] = useState('')
  const [tab, setTab] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState<number | null>(null)
  const scope = useQuery({ queryKey: ['portal', 'manage-scope'], queryFn: () => api.get<R>('/portal/manage/scope') })
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'manage-staff', { q, unit, group, tab, page }],
    queryFn: () => api.get<Page<R> & { onLeave: number; teamCount: number }>('/portal/manage/staff', { q, unit: unit ?? undefined, group, onLeave: tab === 'leave' ? '1' : undefined, page }),
    placeholderData: keepPreviousData,
  })
  const reset = () => setPage(1)
  // The printed list and the Excel export carry the same filters as the screen, but every page of it.
  const filterParams = () => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (unit) params.set('unit', String(unit))
    if (group) params.set('group', group)
    if (tab === 'leave') params.set('onLeave', '1')
    return params.size ? `?${params}` : ''
  }
  const printList = () => window.open(`/print/team${filterParams()}`, '_blank')
  const exportList = () => window.location.assign(`/api/portal/manage/staff/export${filterParams()}`)
  return (
    <>
      <StaffDialog staffNo={open} onClose={() => setOpen(null)} />
      <PageHeader
        eyebrow="Management services"
        title="Staff manager"
        description={scope.data ? `${scope.data.headTitle ?? 'Approver'} · ${(scope.data.heads as Array<R>).map((h) => h.unitName).join(', ') || 'named approver'}` : undefined}
        actions={
          <>
            <Button variant="outline" onClick={exportList} disabled={!data?.total}>
              <FileSpreadsheet /> Export list
            </Button>
            <Button variant="outline" onClick={printList} disabled={!data?.total}>
              <Printer /> Print list
            </Button>
          </>
        }
      />
      <StatusTabs
        value={tab}
        onChange={(t) => (setTab(t), reset())}
        options={[{ value: 'leave', label: 'On leave now' }]}
        counts={data ? [{ status: 'leave', count: data.onLeave }] : undefined}
        total={data?.teamCount}
      />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), reset())} placeholder="Name or staff number…" />
        {(scope.data?.units?.length ?? 0) > 1 && (
          <label className="flex w-64 flex-col gap-1">
            <span className="pl-3 text-xs font-medium text-muted-foreground">Unit</span>
            <Combobox options={scope.data?.units} value={unit} onChange={(v) => (setUnit(v), reset())} placeholder="All my units" />
          </label>
        )}
        <FilterSelect label="Category" value={group} onChange={(v) => (setGroup(v), reset())} options={Object.entries(GROUP_LABELS).map(([value, label]) => ({ value, label }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={Users} title="No staff found" />}
        columns={[
          { header: 'Staff', cell: (r: R) => <button type="button" onClick={() => setOpen(r.staffNo)} className="text-left"><StaffCell link={false} staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /></button> },
          { header: 'Unit', cell: (r: R) => <span className="block max-w-56 truncate text-xs">{r.unitName}</span> },
          { header: 'Category', cell: (r: R) => <Badge dot={false}>{r.staffGroup}</Badge> },
          { header: 'Phone', cell: (r: R) => <span className="font-mono text-xs">{r.phone || '—'}</span> },
          { header: 'Status', cell: (r: R) => (Number(r.flagLeave) === 1 ? <Badge tone="info">On leave</Badge> : <StatusBadge status={r.staffStatus} />) },
        ]}
      />
      {data && data.total > data.pageSize && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function StaffDialog({ staffNo, onClose }: { staffNo: number | null; onClose: () => void }) {
  const { data: s } = useQuery({ queryKey: ['portal', 'manage-staff-one', staffNo], queryFn: () => api.get<R>(`/portal/manage/staff/${staffNo}`), enabled: staffNo !== null })
  return (
    <Dialog open={staffNo !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={s?.fullName ?? 'Staff member'} className="max-w-2xl">
        {s && (
          <div className="space-y-5">
            <StaffCell link={false} staffNo={s.staffNo} name={s.fullName} sub={`${s.jobTitle ?? ''} · ${s.unitName ?? ''}`} />
            <DetailList
              items={[
                ['Staff number', s.staffNo],
                ['Category', GROUP_LABELS[s.staffGroup] ?? s.staffGroup],
                ['Grade', s.grade ? `${s.grade} · Notch ${s.notch}` : null],
                ['University email', s.uccMail],
                ['Phone', s.phone],
                ['First appointment', date(s.firstAppointDate)],
                ['Annual leave left', s.leave ? `${num(s.leave.remaining)} of ${num(s.leave.total)} days` : null],
                ['Status', Number(s.flagLeave) === 1 ? 'On leave' : 'At post'],
              ]}
            />
            <div>
              <p className="eyebrow mb-2">Recent leave</p>
              <DataTable
                rows={s.leaves}
                empty={<p className="p-4 text-sm text-muted-foreground">No leave on record.</p>}
                columns={[
                  { header: 'Period', cell: (r: R) => `${date(r.startDate)} – ${date(r.endDate)}` },
                  { header: 'Days', align: 'right', cell: (r: R) => r.approvedDays },
                  { header: 'Status', cell: (r: R) => <StatusBadge status={r.status} label={MY_LEAVE_LABELS[r.status]} /> },
                ]}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
