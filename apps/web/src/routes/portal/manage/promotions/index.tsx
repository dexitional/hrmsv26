import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FileStack } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { properName } from '#/lib/text-case'
import { Button } from '#/components/ui/button'
import { DataTable, SearchInput, Toolbar } from '#/components/admin/data-table'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { StateBadge } from '#/components/promotion/file-view'
import { TYPE_LABELS } from '#/components/promotion/labels'

export const Route = createFileRoute('/portal/manage/promotions/')({ component: PromotionManager })

type R = Record<string, any>

function PromotionManager() {
  const navigate = useNavigate()
  const [view, setView] = useState<'mine' | 'all'>('mine')
  const [q, setQ] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'manage-promotions'], queryFn: () => api.get<{ data: Array<R>; counts: R }>('/portal/manage/promotions') })
  const rows = (data?.data ?? []).filter((r) => (view === 'all' || r.canAct) && (!q || `${r.fullName} ${r.staffNo} ${r.id}`.toLowerCase().includes(q.toLowerCase())))
  const open = (r: R) => navigate({ to: '/portal/manage/promotions/$id', params: { id: String(r.id) } })
  return (
    <>
      <PageHeader eyebrow="Management services" title="Promotion manager" description="Promotion and contract-renewal applications from your staff. Recommend them, return them for correction, or decline them." />
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {(
          [
            ['mine', 'Waiting for me', data?.counts.waiting],
            ['all', 'All my staff’s applications', data?.counts.total],
          ] as const
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            className={cn('flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold', view === value ? 'border-primary bg-primary text-white' : 'bg-white text-slate-600 hover:border-border-strong')}
          >
            {label}
            {count !== undefined && <span className={cn('rounded-full px-1.5 font-mono text-[0.65rem]', view === value ? 'bg-white/15' : 'bg-muted')}>{count}</span>}
          </button>
        ))}
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Name, staff or application number…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={rows}
        empty={<EmptyState icon={FileStack} title={view === 'mine' ? 'Nothing waiting for you' : 'No applications'} />}
        columns={[
          { header: 'Applicant', cell: (r: R) => <StaffCell link={false} staffNo={r.staffNo} name={r.fullName} sub={properName(r.unitName)} /> },
          {
            header: 'Application',
            cell: (r: R) => (
              <span className="block max-w-64">
                <span className="font-semibold">
                  {TYPE_LABELS[Number(r.type)]} #{r.id}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{properName(r.appliedRank) ?? '—'}</span>
              </span>
            ),
          },
          { header: 'Submitted', cell: (r: R) => <span className="text-xs whitespace-nowrap">{date(r.submittedAt ?? r.activityDate)}</span> },
          { header: 'Where it is', cell: (r: R) => <span className="block max-w-64"><StateBadge state={r.state} /></span> },
          { header: '', align: 'right', cell: (r: R) => <Button size="sm" variant={r.canAct ? 'default' : 'outline'} onClick={() => open(r)}>{r.canAct ? 'Review' : 'Open'}</Button> },
        ]}
      />
    </>
  )
}
