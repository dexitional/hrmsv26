import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { BookOpenCheck } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { DataTable } from '#/components/admin/data-table'
import { EmptyState, PageHeader, StatusBadge } from '#/components/admin/page'

export const Route = createFileRoute('/portal/study')({ component: MyStudy })

type R = Record<string, any>

function MyStudy() {
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'study'], queryFn: () => api.get<{ intentions: Array<R>; requests: Array<R>; leaves: Array<R> }>('/portal/study') })
  return (
    <>
      <PageHeader eyebrow="Staff services" title="Study leave" description="Your intentions to study, study leave requests and study leave on record." />
      <div className="space-y-4">
        <Card>
          <CardHeader title="Intentions to study" description="Recommended by your head, dean and provost, then decided by HR" />
          <CardBody className="p-0">
            <DataTable
              loading={isLoading}
              rows={data?.intentions}
              className="rounded-none border-0"
              empty={<EmptyState icon={BookOpenCheck} title="No intentions to study" />}
              columns={[
                { header: 'Programme', cell: (r: R) => <span className="block max-w-72 truncate font-semibold text-slate-800">{r.intProg}</span> },
                { header: 'Institution', cell: (r: R) => <span className="block max-w-56 truncate text-xs">{r.studyPlace}</span> },
                { header: 'Starts', cell: (r: R) => date(r.dateCommence) },
                { header: 'Stage', cell: (r: R) => <Badge tone={Number(r.appstatus) === 5 ? 'success' : Number(r.appstatus) === 6 ? 'danger' : 'info'}>{r.stageLabel}</Badge> },
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Study leave requests" />
          <CardBody className="p-0">
            <DataTable
              loading={isLoading}
              rows={data?.requests}
              className="rounded-none border-0"
              empty={<EmptyState icon={BookOpenCheck} title="No requests" />}
              columns={[
                { header: 'Programme', cell: (r: R) => <span className="block max-w-72 truncate font-semibold text-slate-800">{r.studyProgram}</span> },
                { header: 'Institution', cell: (r: R) => <span className="block max-w-56 truncate text-xs">{r.studyInstitute}</span> },
                { header: 'Period', cell: (r: R) => `${date(r.studyStart)} – ${date(r.studyEnd)}` },
                { header: 'Status', cell: (r: R) => <StatusBadge status={r.applyStatus} /> },
              ]}
            />
          </CardBody>
        </Card>
      </div>
    </>
  )
}
