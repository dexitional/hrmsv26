// Study leave manager: the intentions to study of a head's staff. Those
// waiting at the head's level (head of unit, dean / director, provost /
// registrar) are approved or disapproved on the review page.
import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { BookOpenCheck, Printer } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { properName } from '#/lib/text-case'
import { Button } from '#/components/ui/button'
import { DataTable, SearchInput, Toolbar } from '#/components/admin/data-table'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { StudyState } from '#/components/study/stage-badge'

export const Route = createFileRoute('/portal/manage/study/')({ component: StudyManager })

type R = Record<string, any>
type View = 'mine' | 'progress' | 'decided' | 'all'

const inProgress = (r: R) => r.appstatus >= 1 && r.appstatus <= 4 && r.stageStatus !== 2
const FILTERS: Record<View, (r: R) => boolean> = { mine: (r) => r.canAct, progress: inProgress, decided: (r) => !inProgress(r), all: () => true }

function StudyManager() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('mine')
  const [q, setQ] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'manage-study'], queryFn: () => api.get<Array<R>>('/portal/manage/study') })
  const all = data ?? []
  const rows = all.filter((r) => FILTERS[view](r) && (!q || `${r.fullName} ${r.staffNo} ${r.id} ${r.intProg ?? ''} ${r.studyPlace ?? ''}`.toLowerCase().includes(q.toLowerCase())))
  const open = (r: R) => navigate({ to: '/portal/manage/study/$id', params: { id: String(r.id) } })
  return (
    <>
      <PageHeader
        eyebrow="Management services"
        title="Study leave manager"
        description="Intentions to study from your staff. Each goes from the head of unit to the dean or director, then the provost or registrar, then HR. Approve or disapprove those waiting for you."
      />
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {(
          [
            ['mine', 'Waiting for me'],
            ['progress', 'In progress'],
            ['decided', 'Decided'],
            ['all', 'All'],
          ] as Array<[View, string]>
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            className={cn('flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold', view === value ? 'border-primary bg-primary text-white' : 'bg-white text-slate-600 hover:border-border-strong')}
          >
            {label}
            {data && <span className={cn('rounded-full px-1.5 font-mono text-[0.65rem]', view === value ? 'bg-white/15' : 'bg-muted')}>{all.filter(FILTERS[value]).length}</span>}
          </button>
        ))}
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Name, staff number, programme or institution…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={rows}
        empty={<EmptyState icon={BookOpenCheck} title={view === 'mine' ? 'Nothing waiting for you' : 'No applications'} />}
        columns={[
          { header: 'Applicant', cell: (r: R) => <StaffCell link={false} staffNo={r.staffNo} name={r.fullName} sub={properName(r.unitName)} /> },
          {
            header: 'Programme',
            cell: (r: R) => (
              <span className="block max-w-72">
                <span className="line-clamp-1 font-semibold">{r.intProg || '—'}</span>
                <span className="block truncate text-xs text-muted-foreground">{r.studyPlace}</span>
              </span>
            ),
          },
          { header: 'Starts', cell: (r: R) => <span className="text-xs whitespace-nowrap">{date(r.dateCommence)}</span> },
          { header: 'Submitted', cell: (r: R) => <span className="text-xs whitespace-nowrap">{date(r.subDate ?? r.activityDate)}</span> },
          { header: 'Where it is', cell: (r: R) => <StudyState appstatus={r.appstatus} stageStatus={r.stageStatus} waitingFor={r.waitingFor} mine={r.canAct} /> },
          {
            header: '',
            align: 'right',
            cell: (r: R) => (
              <div className="flex justify-end gap-1.5">
                <Button size="sm" variant="ghost" aria-label="Print" title="Print the form" onClick={() => window.open(`/print/study-intention/${r.id}?from=manage`, '_blank')}>
                  <Printer />
                </Button>
                <Button size="sm" variant={r.canAct ? 'default' : 'outline'} onClick={() => open(r)}>
                  {r.canAct ? 'Review' : 'Open'}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
