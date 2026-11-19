import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FilePlus2, RefreshCw, TrendingUp } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { properName } from '#/lib/text-case'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { CardSkeleton } from '#/components/admin/skeletons'
import { StateBadge, Stepper } from '#/components/promotion/file-view'
import { TYPE_LABELS } from '#/components/promotion/labels'

export const Route = createFileRoute('/portal/promotion/')({ component: MyPromotion })

type R = Record<string, any>

function MyPromotion() {
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'promotion'], queryFn: () => api.get<R>('/portal/promotion') })
  return (
    <>
      <PageHeader
        eyebrow="Staff services"
        title="Promotion"
        description="Apply for promotion or contract renewal, and follow your application through your head, dean, provost and HR."
        actions={
          data && (
            <>
              {data.open.renewal ? null : (
                <Button variant="outline" asChild>
                  <Link to="/portal/promotion/apply" search={{ type: 1 }}>
                    <RefreshCw /> Apply for contract renewal
                  </Link>
                </Button>
              )}
              {data.open.promotion ? null : (
                <Button asChild>
                  <Link to="/portal/promotion/apply" search={{ type: 0 }}>
                    <FilePlus2 /> Apply for promotion
                  </Link>
                </Button>
              )}
            </>
          )
        }
      />
      {isLoading ? (
        <CardSkeleton />
      ) : !data?.applications.length ? (
        <EmptyState icon={TrendingUp} title="No applications yet" description="When you apply, your head of department receives it first. You can follow every step here." />
      ) : (
        <div className="space-y-4">
          {(data.applications as Array<R>).map((a) => (
            <Card key={a.id}>
              <CardHeader
                title={
                  <Link to="/portal/promotion/$id" params={{ id: String(a.id) }} className="hover:underline">
                    {TYPE_LABELS[Number(a.type)] ?? 'Application'} #{a.id}
                    {a.appliedRank && <span className="font-normal text-muted-foreground"> · {properName(a.appliedRank)}</span>}
                  </Link>
                }
                description={Number(a.promoStatus) === 0 ? 'Draft' : `Submitted ${date(a.submittedAt ?? a.activityDate)}`}
                action={<StateBadge state={a.state} />}
              />
              <CardBody className="space-y-4">
                {Number(a.promoStatus) > 0 && <Stepper level={Number(a.promoStatus)} stage={Number(a.stageStatus)} />}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={a.state.withApplicant ? 'default' : 'outline'} asChild>
                    <Link to="/portal/promotion/$id" params={{ id: String(a.id) }}>
                      {Number(a.promoStatus) === 0 ? 'Continue draft' : a.state.withApplicant ? 'Resubmit documents' : 'Open'}
                    </Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
