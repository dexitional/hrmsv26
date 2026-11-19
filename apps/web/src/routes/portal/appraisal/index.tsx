import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, FilePenLine, PenLine } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { DataTable } from '#/components/admin/data-table'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { FormAStatus, FormBStatus, OVERALL_LABELS } from '#/components/appraisal/shared'

export const Route = createFileRoute('/portal/appraisal/')({ component: MyAppraisal })

type R = Record<string, any>

function MyAppraisal() {
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'appraisal'], queryFn: () => api.get<{ formA: Array<R>; formB: Array<R>; year: string }>('/portal/appraisal') })
  const thisYearB = data?.formB.find((b) => b.year === data.year)
  const toSign = data?.formA.filter((a) => Number(a.status) === 1) ?? []
  return (
    <>
      <PageHeader
        eyebrow="Staff services"
        title="Appraisal"
        description="Your self-appraisal (Form B) and the appraisal your supervisor completes for you (Form A)."
        actions={
          data &&
          (thisYearB ? (
            <Button variant="outline" asChild>
              <Link to="/portal/appraisal/self/$id" params={{ id: String(thisYearB.id) }}>
                <FilePenLine /> My {data.year} self-appraisal
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/portal/appraisal/self">
                <PenLine /> Fill my {data.year} self-appraisal
              </Link>
            </Button>
          ))
        }
      />

      {toSign.length > 0 && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-warning-light px-5 py-4">
          <p className="font-semibold text-warning-light-foreground">Your supervisor has completed your appraisal</p>
          <p className="mt-0.5 text-sm text-slate-700">Read it, add your comments and sign it.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {toSign.map((a) => (
              <Button key={a.year} size="sm" asChild>
                <Link to="/portal/appraisal/a/$year" params={{ year: a.year }}>
                  <PenLine /> Review and sign {a.year}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Card>
          <CardHeader title="Self-appraisals · Form B" description="You write it; your supervisor countersigns" />
          <CardBody className="p-0">
            <DataTable
              loading={isLoading}
              rows={data?.formB}
              className="rounded-none border-0"
              rowLink={(r: R) => ({ to: '/portal/appraisal/self/$id', params: { id: String(r.id) } })}
              empty={<EmptyState icon={ClipboardCheck} title="No self-appraisals yet" description={`Fill your ${data?.year ?? ''} self-appraisal so your supervisor can review it.`} />}
              columns={[
                { header: 'Year', cell: (r: R) => <span className="font-semibold">{r.year}</span> },
                { header: 'Supervisor', cell: (r: R) => <span className="block max-w-64 truncate">{r.supervisorName}</span> },
                { header: 'Submitted', cell: (r: R) => date(r.submittedAt) },
                { header: 'Status', cell: (r: R) => <FormBStatus status={Number(r.appStatus)} /> },
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Appraisals · Form A" description="Your supervisor completes it; you comment and sign" />
          <CardBody className="p-0">
            <DataTable
              loading={isLoading}
              rows={data?.formA}
              className="rounded-none border-0"
              rowLink={(r: R) => ({ to: '/portal/appraisal/a/$year', params: { year: r.year } })}
              empty={<EmptyState icon={ClipboardCheck} title="No appraisals yet" description="Your supervisor starts this at review time." />}
              columns={[
                { header: 'Year', cell: (r: R) => <span className="font-semibold">{r.year}</span> },
                { header: 'Supervisor', cell: (r: R) => <span className="block max-w-64 truncate">{r.supervisorName}</span> },
                { header: 'Overall rating', cell: (r: R) => OVERALL_LABELS[r.supRating] ?? r.supRating ?? '—' },
                { header: 'Status', cell: (r: R) => <FormAStatus status={Number(r.status)} /> },
              ]}
            />
          </CardBody>
        </Card>
      </div>
    </>
  )
}
