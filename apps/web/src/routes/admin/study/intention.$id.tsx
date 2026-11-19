import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { CheckCircle2, GraduationCap, Pencil, Printer, Trash2, XCircle } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date, dateTime } from '#/lib/format'
import { statusLabel } from '#/lib/labels'
import { studyDecisionSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Textarea } from '#/components/ui/input'
import { useConfirm } from '#/components/admin/confirm'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { DetailList, EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { useCan } from '#/components/admin/session'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { IntentionDialog } from '#/components/study/intention-dialog'
import { StudyLeaveDialog } from '#/components/study/leave-dialog'
import type { StudyLeaveDraft } from '#/components/study/leave-dialog'
import { StageBadge } from '#/components/study/stage-badge'

export const Route = createFileRoute('/admin/study/intention/$id')({ component: IntentionPage })

type R = Record<string, any>
const STAGES = ['Submitted', 'Head of unit', 'Dean / director', 'Provost', 'HR']

/** "3 years" / "Two years" → years. */
function years(text: string | null | undefined) {
  const t = (text ?? '').toLowerCase()
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }
  const n = Number(t.match(/\d+/)?.[0]) || Object.entries(words).find(([w]) => t.includes(w))?.[1]
  return n || undefined
}

function IntentionPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const canEdit = useCan('study', 'edit')
  const canDelete = useCan('study', 'manage')
  const { confirm, dialog } = useConfirm()
  const [deciding, setDeciding] = useState<'approve' | 'decline' | null>(null)
  const [grant, setGrant] = useState<StudyLeaveDraft | null>(null)
  const [editing, setEditing] = useState<R | null>(null)
  const { data: a, isLoading } = useQuery({ queryKey: ['study-intention', id], queryFn: () => api.get<R>(`/study/intentions/${id}`) })
  const remove = useSave(() => api.delete(`/study/intentions/${id}`), {
    invalidate: ['study-intentions'],
    success: 'Application deleted',
    onDone: () => navigate({ to: '/admin/study' }),
  })
  if (isLoading) return <ProfileSkeleton />
  if (!a) return <EmptyState title="Application not found" />
  const stage = Number(a.appstatus)
  const declined = Number(a.stageStatus) === 2 || stage === 6
  const open = !declined && stage >= 1 && stage <= 4
  const startGrant = () =>
    setGrant({
      staffNo: Number(a.staffNo),
      studyProgram: a.intProg ?? '',
      studyInstitute: a.studyPlace ?? '',
      studyStart: a.dateCommence ?? '',
      studyPeriod: years(a.progDuration),
      studyType: a.progType === '1' ? 'FULL' : 'PART',
      studyNature: ['REGULAR', 'WEEKEND', 'SANDWICH', 'DISTANCE', 'ONLINE'].includes(a.studyMode) ? a.studyMode : 'OTHER',
      studyNatureOther: a.otherStudyMode ?? '',
      intentionId: Number(id),
    })
  return (
    <>
      <DecisionDialog id={id} decision={deciding} stageLabel={a.stageLabel} onClose={() => setDeciding(null)} />
      <StudyLeaveDialog value={grant} onClose={() => setGrant(null)} />
      <IntentionDialog intention={editing} onClose={() => setEditing(null)} />
      {dialog}
      <PageHeader
        back={{ to: '/admin/study', label: 'Study Leave' }}
        eyebrow={`Intention to study #${a.id}`}
        title={a.intProg || 'Intention to pursue further studies'}
        description={[a.studyPlace, a.studyMode && statusLabel(a.studyMode), a.progDuration].filter(Boolean).join(' · ')}
        meta={<StageBadge appstatus={stage} stageStatus={Number(a.stageStatus)} />}
        actions={
          <>
            <Button variant="outline" onClick={() => window.open(`/print/study-intention/${a.id}`, '_blank')}>
              <Printer /> Print form
            </Button>
            {canEdit && (
              <Button variant="outline" onClick={() => setEditing(a)}>
                <Pencil /> Edit form
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                aria-label="Delete application"
                onClick={() =>
                  confirm({
                    title: 'Delete this application?',
                    description: a.leaveId
                      ? 'Study leave was granted from this application. Delete that study leave record first.'
                      : `The intention to study of ${a.fullName} and its approval trail (${a.activities.length} record${a.activities.length === 1 ? '' : 's'}) are removed for good.`,
                    confirmLabel: 'Delete',
                    danger: true,
                    onConfirm: () => remove.mutateAsync(undefined),
                  })
                }
              >
                <Trash2 />
              </Button>
            )}
            {canEdit && open && (
              <>
                <Button variant="outline" onClick={() => setDeciding('decline')}>
                  <XCircle /> Decline
                </Button>
                <Button onClick={() => setDeciding('approve')}>
                  <CheckCircle2 /> {stage === 4 ? 'Approve (final)' : 'Recommend & forward'}
                </Button>
              </>
            )}
            {canEdit && (stage === 5 || stage === 4) && !a.leaveId && (
              <Button variant="secondary" onClick={startGrant}>
                <GraduationCap /> Grant study leave
              </Button>
            )}
          </>
        }
      />
      <div className="mb-5 rounded-2xl border bg-white p-4">
        <ol className="grid grid-cols-5 gap-2">
          {STAGES.map((label, i) => {
            const done = stage > i || stage === 5
            const here = stage === i && !declined
            return (
              <li key={label} className="flex flex-col gap-1.5">
                <span className={cn('h-1.5 rounded-full', declined && stage === i ? 'bg-destructive' : done ? 'bg-primary' : here ? 'bg-warning' : 'bg-slate-100')} />
                <span className={cn('text-xs', done || here ? 'font-semibold text-slate-800' : 'text-muted-foreground')}>{label}</span>
              </li>
            )
          })}
        </ol>
        {a.leaveId && (
          <p className="mt-3 text-sm">
            Study leave has been granted — <a className="font-semibold text-primary hover:underline" href={`/print/study-leave/${a.leaveId}`} target="_blank" rel="noreferrer">view the record</a>.
          </p>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Applicant" />
            <CardBody className="space-y-4">
              <StaffCell staffNo={a.staffNo} name={a.fullName} sub={a.staff?.jobTitle} />
              <DetailList
                items={[
                  ['Present rank (as stated)', a.presentRank],
                  ['College', a.college],
                  ['Department / unit', a.department || a.unitName],
                  ['Highest education', a.highEdu],
                  ['Previous study leave', a.studyLeave],
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
        <Card>
          <CardHeader title="Approval trail" description={`Submitted ${date(a.subDate ?? a.activityDate)}`} />
          <CardBody>
            {a.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No decisions recorded yet.</p>
            ) : (
              <ol className="relative space-y-5 border-l border-border pl-5">
                {a.activities.map((x: R) => (
                  <li key={x.id}>
                    <span className={cn('absolute -left-1.5 mt-1 size-3 rounded-full border-2 border-white', x.activity === '2' ? 'bg-destructive' : 'bg-success')} />
                    <p className="text-sm font-semibold text-slate-800">
                      {x.stageActivity} <span className="font-normal text-muted-foreground">· {STAGES[Number(x.promoStatus) - 1] ?? `stage ${x.promoStatus}`}</span>
                    </p>
                    <p className="text-sm whitespace-pre-line text-slate-600">{x.comments}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{[x.userName, x.unitName].filter(Boolean).join(' · ')} · {dateTime(x.activityDate)}</p>
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

function DecisionDialog({ id, decision, stageLabel, onClose }: { id: string; decision: 'approve' | 'decline' | null; stageLabel: string; onClose: () => void }) {
  type In = z.input<typeof studyDecisionSchema>
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(studyDecisionSchema) })
  useEffect(() => {
    if (decision) (setError(null), reset({ decision, comments: '' }))
  }, [decision, reset])
  const save = useSave((v: In) => api.post(`/study/intentions/${id}/decide`, v), {
    invalidate: ['study-intention', 'study-intentions'],
    success: decision === 'approve' ? 'Application approved' : 'Application declined',
    onDone: onClose,
    onError: setError,
  })
  return (
    <FormDialog
      open={Boolean(decision)}
      onOpenChange={(o) => !o && onClose()}
      title={decision === 'approve' ? 'Approve application' : 'Decline application'}
      description={`Currently: ${stageLabel}. HR can record a decision at any stage.`}
      onSubmit={handleSubmit((v) => save.mutate(v as In))}
      busy={save.isPending}
      error={error}
      submitLabel={decision === 'approve' ? 'Approve' : 'Decline'}
    >
      <Field label="Comments" required error={errors.comments?.message} className="sm:col-span-2">
        <Textarea rows={4} {...register('comments')} placeholder={decision === 'approve' ? 'e.g. Recommended for study leave with pay.' : 'Reason for declining'} />
      </Field>
    </FormDialog>
  )
}

