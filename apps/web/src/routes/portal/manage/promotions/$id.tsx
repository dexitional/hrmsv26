// A promotion or contract-renewal file as a head reviews it: who is applying
// and for what, where the file is, the documents, papers and dossier, and the
// trail, with the head's decision in the page header.
import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ChevronDown, CornerUpLeft, Undo2, Users, XCircle } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date, dateTime } from '#/lib/format'
import { properName } from '#/lib/text-case'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '#/components/ui/dropdown'
import { NativeSelect, Textarea } from '#/components/ui/input'
import { FileField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { DetailList, EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { DocLink, DossierCard, PapersCard, StateBadge } from '#/components/promotion/file-view'
import { RETURN_OPTIONS, TYPE_LABELS } from '#/components/promotion/labels'

export const Route = createFileRoute('/portal/manage/promotions/$id')({ component: ReviewApplication })

type R = Record<string, any>
type Action = 'recommend' | 'not_recommend' | 'return' | 'reverse' | 'reverse_applicant'

const STEPS = ['Head of department', 'Dean / director', 'Provost / registrar', 'HR', 'Assessors', 'A&P board', 'Decision']
/** stage_status values that mean the file is held up at its level (not recommended, returned, sent back). */
const HELD = [2, 8, 9, 10, 11, 13, 14]

const ACTIONS: Record<Action, { label: string; title: string; hint: string; done: string }> = {
  recommend: { label: 'Recommend & forward', title: 'Recommend this application', hint: 'It goes on to the next level.', done: 'Recommended and sent to the next level' },
  not_recommend: { label: 'Do not recommend', title: 'Do not recommend', hint: 'The application stops here; HR and the applicant see your reason.', done: 'Recorded as not recommended' },
  return: { label: 'Return to applicant', title: 'Return to the applicant', hint: 'The applicant sends corrected documents and the application comes back to you.', done: 'Returned to the applicant' },
  reverse: { label: 'Send back a level', title: 'Send back a level', hint: 'The previous level looks at the application again.', done: 'Sent back to the previous level' },
  reverse_applicant: {
    label: 'Send back a level and to the applicant',
    title: 'Send back a level and to the applicant',
    hint: 'The previous level looks at it again, and the applicant may send updated documents.',
    done: 'Sent back to the previous level and the applicant',
  },
}

/** Trail dot colour from the legacy activity code. */
const dot = (activity: number) =>
  activity === 1 ? 'bg-success' : activity === 2 ? 'bg-destructive' : [8, 9, 10, 11, 13, 14].includes(activity) ? 'bg-warning' : 'bg-primary'

function ReviewApplication() {
  const { id } = Route.useParams()
  const [deciding, setDeciding] = useState<Action | null>(null)
  const { data: f, isLoading } = useQuery({ queryKey: ['portal', 'manage-promotion', id], queryFn: () => api.get<R>(`/portal/manage/promotions/${id}`) })
  if (isLoading) return <ProfileSkeleton />
  if (!f) return <EmptyState title="Application not found" />
  const d = (f.details ?? {}) as R
  const docHref = (path: string) => `/api/portal/manage/promotions/${id}/file?path=${encodeURIComponent(path)}`
  const level = Number(f.promoStatus)
  const stage = Number(f.stageStatus)
  const actions = (f.canAct ? f.actions : []) as Array<Action>
  const more = actions.filter((a) => a === 'return' || a === 'reverse' || a === 'reverse_applicant')
  const typeLabel = TYPE_LABELS[Number(f.type)] ?? 'Application'
  const documents: Array<[string | null | undefined, string]> = [
    [f.appLetter || d.appLetter, Number(f.type) === 1 ? 'Application letter' : 'Application letter / form'],
    [f.promoDoc1 || d.appCv, 'Curriculum vitae'],
    ...(f.promoDoc2 || d.papers ? [[f.promoDoc2 || d.papers, 'Papers (one PDF)'] as [string, string]] : []),
    ...(d.signature ? [[d.signature, 'Applicant’s signature'] as [string, string]] : []),
  ]

  return (
    <>
      <DecisionDialog id={id} action={deciding} applicant={f.fullName} onClose={() => setDeciding(null)} />
      <PageHeader
        back={{ to: '/portal/manage/promotions', label: 'Promotion manager' }}
        eyebrow={`${typeLabel} #${f.promotionId}`}
        title={properName(f.appliedRank) || typeLabel}
        description={[f.fullName, properName(f.promoComments), properName(f.unitName)].filter(Boolean).join(' · ')}
        meta={<StateBadge state={f.state} />}
        actions={
          actions.length > 0 && (
            <>
              {more.length > 0 && (
                <Dropdown>
                  <DropdownTrigger asChild>
                    <Button variant="outline">
                      More <ChevronDown />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent className="w-56">
                    {more.map((a) => (
                      <DropdownItem key={a} onSelect={() => setDeciding(a)}>
                        {a === 'return' ? <Undo2 /> : a === 'reverse_applicant' ? <Users /> : <CornerUpLeft />} {ACTIONS[a].label}
                      </DropdownItem>
                    ))}
                  </DropdownContent>
                </Dropdown>
              )}
              {actions.includes('not_recommend') && (
                <Button variant="outline" onClick={() => setDeciding('not_recommend')}>
                  <XCircle /> Do not recommend
                </Button>
              )}
              {actions.includes('recommend') && (
                <Button onClick={() => setDeciding('recommend')}>
                  <CheckCircle2 /> {ACTIONS.recommend.label}
                </Button>
              )}
            </>
          )
        }
      />

      <div className="mb-5 rounded-2xl border bg-white p-4">
        <ol className="grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-7">
          {STEPS.map((label, i) => {
            const n = i + 1
            const final = level >= 7
            const done = n < level || (final && n === 7)
            const here = n === level && !final
            return (
              <li key={label} className="flex flex-col gap-1.5">
                <span className={cn('h-1.5 rounded-full', here && HELD.includes(stage) ? (stage === 2 ? 'bg-destructive' : 'bg-warning') : done ? 'bg-primary' : here ? 'bg-warning' : 'bg-slate-100')} />
                <span className={cn('text-xs', done || here ? 'font-semibold text-slate-800' : 'text-muted-foreground')}>{label}</span>
              </li>
            )
          })}
        </ol>
        {f.canAct && (
          <p className="mt-3 text-sm text-slate-600">
            <b className="text-slate-800">Waiting for your decision.</b> Read the documents, papers and dossier, then decide from the buttons above.
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Applicant" />
            <CardBody className="space-y-4">
              <StaffCell link={false} staffNo={f.staffNo} name={f.fullName} sub={properName(f.currentRank)} />
              <DetailList
                items={[
                  ['Present rank', properName(f.currentRank || d.presentRank)],
                  ['In present rank since', d.prEdate ? date(d.prEdate, 'long') : null],
                  ['Rank applied for', properName(f.appliedRank)],
                  [Number(f.type) === 0 ? 'Type of promotion' : 'Application', Number(f.type) === 0 ? properName(f.promoComments) : typeLabel],
                  ['Department / unit', properName(d.dept || f.unitName)],
                  ['College / directorate', properName(d.college)],
                  ['Previous rank or post', [d.presentRankIfany, d.ppEdate && `since ${date(d.ppEdate)}`].filter(Boolean).join(', ') || null],
                  ['Email', d.email],
                  ['Phone', d.tel],
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Documents" description="PDFs open in a new tab" />
            <CardBody className="grid gap-2.5 sm:grid-cols-2">
              {documents.map(([path, label]) => (
                <div key={label} className={cn('flex min-h-12 items-center rounded-xl border px-3.5 py-3', path ? 'bg-primary-soft/40' : 'border-dashed')}>
                  <DocLink path={path} label={label} href={docHref} />
                </div>
              ))}
            </CardBody>
          </Card>

          <PapersCard papers={f.papers} docHref={docHref} />
          <DossierCard details={d} skip={['presentRank', 'prEdate', 'presentRankIfany', 'ppEdate']} />
        </div>

        <Card className="self-start lg:sticky lg:top-4">
          <CardHeader title="Trail" description={`Submitted ${date(f.submittedAt ?? f.activityDate, 'long')}`} />
          <CardBody>
            {!f.trail?.length ? (
              <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
            ) : (
              <ol className="relative space-y-5 border-l border-border pl-5">
                {(f.trail as Array<R>).map((t) => (
                  <li key={t.id}>
                    <span className={cn('absolute -left-1.5 mt-1 size-3 rounded-full border-2 border-white', dot(Number(t.activity)))} />
                    <p className="text-sm font-semibold text-slate-800">
                      {t.stageActivity} <span className="font-normal text-muted-foreground">· {STEPS[Number(t.promoStatus) - 1] ?? `level ${t.promoStatus}`}</span>
                    </p>
                    {t.comments && t.comments !== t.stageActivity && <p className="text-sm break-words whitespace-pre-line text-slate-600">{t.comments}</p>}
                    {t.stageFile && (
                      <span className="mt-1 block">
                        <DocLink path={t.stageFile} label="Attached document" href={docHref} />
                      </span>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">{[t.actorName && properName(t.actorName), t.actorUnit && properName(t.actorUnit), dateTime(t.activityDate)].filter(Boolean).join(' · ')}</p>
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

function DecisionDialog({ id, action, applicant, onClose }: { id: string; action: Action | null; applicant: string; onClose: () => void }) {
  const navigate = useNavigate()
  const [comment, setComment] = useState('')
  const [returnWhat, setReturnWhat] = useState('8')
  const [document, setDocument] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const clear = () => (setComment(''), setReturnWhat('8'), setDocument(null), setError(null))
  const meta = action ? ACTIONS[action] : null
  // As in the old portal, recommending either way comes with a signed endorsement.
  const needsDocument = action === 'recommend' || action === 'not_recommend'
  const act = useSave(() => api.post(`/portal/manage/promotions/${id}/action`, { action, comment, returnWhat: Number(returnWhat), document }), {
    invalidate: ['portal'],
    success: meta?.done ?? 'Decision recorded',
    onDone: () => (clear(), onClose(), navigate({ to: '/portal/manage/promotions' })),
    onError: setError,
  })
  return (
    <FormDialog
      open={Boolean(action)}
      onOpenChange={(o) => !o && (onClose(), clear())}
      title={meta?.title ?? ''}
      description={meta ? `${applicant}. ${meta.hint}` : undefined}
      submitLabel={meta?.label ?? 'Save'}
      busy={act.isPending}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        if (!comment.trim()) return setError('Write a comment for the trail.')
        if (needsDocument && !document) return setError('Upload the signed endorsement document (PDF).')
        setError(null)
        act.mutate(undefined)
      }}
    >
      {action === 'return' && (
        <Field label="What the applicant must send again" required className="sm:col-span-2">
          <NativeSelect value={returnWhat} onChange={(e) => setReturnWhat(e.target.value)}>
            {RETURN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}
      <Field label="Comment" required className="sm:col-span-2" hint="Recorded in the trail; the applicant sees it when you return or decline the application.">
        <Textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
      </Field>
      <Field label={needsDocument ? 'Signed endorsement document' : 'Endorsement document (optional)'} required={needsDocument} className="sm:col-span-2" hint="A signed recommendation letter or minutes, as a PDF.">
        <FileField accept=".pdf,application/pdf" endpoint="/portal/files" value={{ url: document, name: document ? 'Endorsement document' : null }} onChange={(fl) => setDocument(fl.url)} />
      </Field>
    </FormDialog>
  )
}
