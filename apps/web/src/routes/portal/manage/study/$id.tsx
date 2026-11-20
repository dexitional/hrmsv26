// An intention to study as a head reviews it: the applicant, the intended
// programme, where the application is in the chain, and the trail, with the
// head's decision (approve and forward, or disapprove) in the page header.
import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Printer, XCircle } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date, dateTime } from '#/lib/format'
import { statusLabel } from '#/lib/labels'
import { properName } from '#/lib/text-case'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Textarea } from '#/components/ui/input'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { DetailList, EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { StudyState } from '#/components/study/stage-badge'

export const Route = createFileRoute('/portal/manage/study/$id')({ component: ReviewIntention })

type R = Record<string, any>
type Decision = 'approve' | 'decline'

function steps(academic: boolean) {
  return [academic ? 'Head of department' : 'Head of section / unit', academic ? 'Dean' : 'Director', academic ? 'Provost' : 'Registrar', 'HR', 'Decision']
}

function ReviewIntention() {
  const { id } = Route.useParams()
  const [deciding, setDeciding] = useState<Decision | null>(null)
  const { data: a, isLoading } = useQuery({ queryKey: ['portal', 'manage-study', id], queryFn: () => api.get<R>(`/portal/manage/study/${id}`) })
  if (isLoading) return <ProfileSkeleton />
  if (!a) return <EmptyState title="Application not found" />
  const academic = a.unitType === 'ACADEMIC'
  const stage = Number(a.appstatus)
  const stageStatus = Number(a.stageStatus)
  const declined = stageStatus === 2 || stage === 6
  // The step the application is really at (a level with no one to act is skipped).
  const at = a.waitingAt && stage <= 3 && !declined ? Number(a.waitingAt) : stage
  const STEPS = steps(academic)
  return (
    <>
      <DecisionDialog id={id} decision={deciding} applicant={a.fullName} level={a.myLevel} onClose={() => setDeciding(null)} />
      <PageHeader
        back={{ to: '/portal/manage/study', label: 'Study leave manager' }}
        eyebrow={`Intention to study #${a.id}`}
        title={a.intProg || 'Intention to study'}
        description={[a.fullName, a.studyPlace, properName(a.staff?.unitName ?? a.department)].filter(Boolean).join(' · ')}
        meta={<StudyState appstatus={stage} stageStatus={stageStatus} waitingFor={a.waitingFor} mine={a.canAct} />}
        actions={
          <>
            <Button variant="outline" onClick={() => window.open(`/print/study-intention/${a.id}?from=manage`, '_blank')}>
              <Printer /> Print
            </Button>
            {a.canAct && (
              <>
                <Button variant="outline" onClick={() => setDeciding('decline')}>
                  <XCircle /> Disapprove
                </Button>
                <Button onClick={() => setDeciding('approve')}>
                  <CheckCircle2 /> Approve & forward
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="mb-5 rounded-2xl border bg-white p-4">
        <ol className="grid grid-cols-5 gap-2">
          {STEPS.map((label, i) => {
            const n = i + 1
            const final = stage >= 5
            const done = n < at || (final && n <= 5 && !(stage === 6 && n === 5))
            const here = n === at && !final
            return (
              <li key={label} className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    'h-1.5 rounded-full',
                    (here && declined) || (stage === 6 && n === 5) ? 'bg-destructive' : done ? 'bg-primary' : here ? 'bg-warning' : 'bg-slate-100',
                  )}
                />
                <span className={cn('text-xs', done || here ? 'font-semibold text-slate-800' : 'text-muted-foreground')}>{label}</span>
              </li>
            )
          })}
        </ol>
        {a.canAct ? (
          <p className="mt-3 text-sm text-slate-600">
            <b className="text-slate-800">Waiting for your decision as {a.myLevel?.toLowerCase()}.</b> Approving forwards it to the next level; disapproving stops it here. Your comment goes on the record.
          </p>
        ) : a.waitingFor ? (
          <p className="mt-3 text-sm text-slate-600">With the {a.waitingFor.toLowerCase()}.</p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Applicant" />
            <CardBody className="space-y-4">
              <StaffCell link={false} staffNo={a.staffNo} name={a.fullName} sub={properName(a.staff?.jobTitle)} />
              <DetailList
                items={[
                  ['Present rank (as stated)', a.presentRank],
                  ['College', a.college],
                  ['Department / unit', a.department || properName(a.staff?.unitName)],
                  ['Highest education', a.highEdu],
                  ['Previous study leave', a.studyLeave],
                  ['Phone', a.staff?.phone],
                  ['Email', a.staff?.uccMail],
                ]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Intended programme" />
            <CardBody className="space-y-4">
              <DetailList
                items={[
                  ['Programme', a.intProg],
                  ['Institution', a.studyPlace],
                  ['Commencement', date(a.dateCommence, 'long')],
                  ['Duration', a.progDuration],
                  ['Programme type', a.progType === '1' ? 'Full-time' : a.progType === '2' ? 'Part-time' : a.progType],
                  ['Mode of study', [statusLabel(a.studyMode ?? ''), a.otherStudyMode].filter(Boolean).join(' — ')],
                  ['Sponsorship sought', a.sponsorKind],
                  ['Other scholarship', a.otherScholarship],
                  ['Estimated fees', a.estimatedFees],
                ]}
              />
              <div>
                <p className="eyebrow">Relevance of the programme</p>
                <p className="mt-1 text-sm whitespace-pre-line text-slate-700">{a.progRelevance || '—'}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="self-start lg:sticky lg:top-4">
          <CardHeader title="Approval trail" description={`Submitted ${date(a.subDate ?? a.activityDate, 'long')}`} />
          <CardBody>
            {!a.activities?.length ? (
              <p className="text-sm text-muted-foreground">No decisions recorded yet.</p>
            ) : (
              <ol className="relative space-y-5 border-l border-border pl-5">
                {(a.activities as Array<R>).map((x) => (
                  <li key={x.id}>
                    <span className={cn('absolute -left-1.5 mt-1 size-3 rounded-full border-2 border-white', String(x.activity) === '2' ? 'bg-destructive' : 'bg-success')} />
                    <p className="text-sm font-semibold text-slate-800">{x.stageActivity}</p>
                    {x.comments && <p className="text-sm break-words whitespace-pre-line text-slate-600">{x.comments}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">{[x.userName && properName(x.userName), x.unitName && properName(x.unitName), dateTime(x.activityDate)].filter(Boolean).join(' · ')}</p>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}

function DecisionDialog({ id, decision, applicant, level, onClose }: { id: string; decision: Decision | null; applicant: string; level: string | null; onClose: () => void }) {
  const navigate = useNavigate()
  const [comments, setComments] = useState('')
  const [error, setError] = useState<string | null>(null)
  const approve = decision === 'approve'
  const clear = () => (setComments(''), setError(null))
  const act = useSave(() => api.post<{ next: string }>(`/portal/manage/study/${id}/decision`, { decision, comments }), {
    invalidate: ['portal'],
    success: (r) => (approve ? `Approved and forwarded to the ${r.next.toLowerCase().replace(/^hr$/, 'HR')}` : 'Recorded as disapproved'),
    onDone: () => (clear(), onClose(), navigate({ to: '/portal/manage/study' })),
    onError: setError,
  })
  return (
    <FormDialog
      open={Boolean(decision)}
      onOpenChange={(o) => !o && (onClose(), clear())}
      title={approve ? 'Approve this intention to study' : 'Disapprove this intention to study'}
      description={`${applicant}${level ? ` · as ${level.toLowerCase()}` : ''}. ${approve ? 'It goes on to the next level.' : 'The application stops here; HR and the applicant see your reason.'}`}
      submitLabel={approve ? 'Approve & forward' : 'Disapprove'}
      busy={act.isPending}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        if (!comments.trim()) return setError('Write a comment for the record.')
        setError(null)
        act.mutate(undefined)
      }}
    >
      <Field label="Comment" required className="sm:col-span-2" hint="Recorded in the approval trail; the applicant is told of your decision in their portal.">
        <Textarea rows={4} value={comments} onChange={(e) => setComments(e.target.value)} placeholder={approve ? 'Recommended. The programme is relevant to…' : 'Not approved because…'} />
      </Field>
    </FormDialog>
  )
}
