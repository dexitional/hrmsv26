import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { BookOpenCheck, Printer } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { DataTable } from '#/components/admin/data-table'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { ReadOnlyNote } from '#/components/portal/read-only-note'

export const Route = createFileRoute('/portal/manage/study')({ component: StudyManager })

type R = Record<string, any>

function StudyManager() {
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'manage-study'], queryFn: () => api.get<Array<R>>('/portal/manage/study') })
  return (
    <>
      <PageHeader eyebrow="Management services" title="Study leave manager" description="Intentions to study from your staff that are still on their way to HR." />
      <ReadOnlyNote what="Recommending intentions to study" />
      <DataTable
        loading={isLoading}
        rows={data}
        empty={<EmptyState icon={BookOpenCheck} title="Nothing in progress" />}
        columns={[
          { header: 'Staff', cell: (r: R) => <StaffCell link={false} staffNo={r.staffNo} name={r.fullName} sub={r.unitName} /> },
          { header: 'Programme', cell: (r: R) => <span className="block max-w-64 truncate">{r.intProg}</span> },
          { header: 'Institution', cell: (r: R) => <span className="block max-w-48 truncate text-xs">{r.studyPlace}</span> },
          { header: 'Starts', cell: (r: R) => date(r.dateCommence) },
          { header: 'Stage', cell: (r: R) => <Badge tone="info">{r.stageLabel}</Badge> },
          {
            header: '',
            align: 'right',
            cell: (r: R) => (
              <Button size="sm" variant="outline" onClick={() => window.open(`/print/study-intention/${r.id}?from=manage`, '_blank')}>
                <Printer /> View / print
              </Button>
            ),
          },
        ]}
      />
    </>
  )
}
