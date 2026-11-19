import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Send } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { NativeSelect, Textarea } from '#/components/ui/input'
import { FileField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { FileView, StateBadge } from '#/components/promotion/file-view'
import { RETURN_OPTIONS, TYPE_LABELS } from '#/components/promotion/labels'

export const Route = createFileRoute('/portal/manage/promotions/$id')({ component: ReviewApplication })

const ACTIONS: Record<string, { label: string; hint: string }> = {
  recommend: { label: 'Recommend', hint: 'Sends it on to the next level.' },
  not_recommend: { label: 'Do not recommend', hint: 'Stops it here; HR sees your reason.' },
  return: { label: 'Return to applicant', hint: 'Asks the applicant to send corrected documents; it comes back to you.' },
  reverse: { label: 'Send back a level', hint: 'Returns it to the previous level to look at again.' },
}

function ReviewApplication() {
  const { id } = Route.useParams()
  const { data: f, isLoading } = useQuery({ queryKey: ['portal', 'manage-promotion', id], queryFn: () => api.get<Record<string, any>>(`/portal/manage/promotions/${id}`) })
  if (isLoading) return <ProfileSkeleton />
  if (!f) return <EmptyState title="Application not found" />
  return (
    <>
      <PageHeader back={{ to: '/portal/manage/promotions', label: 'Promotion manager' }} eyebrow={`${TYPE_LABELS[Number(f.type)]} #${f.promotionId}`} title={f.fullName} meta={<StateBadge state={f.state} />} />
      {f.canAct && <DecisionPanel id={id} actions={f.actions} />}
      <FileView file={f} docHref={(path) => `/api/portal/manage/promotions/${id}/file?path=${encodeURIComponent(path)}`} />
    </>
  )
}

function DecisionPanel({ id, actions }: { id: string; actions: Array<string> }) {
  const navigate = useNavigate()
  const [action, setAction] = useState('recommend')
  const [comment, setComment] = useState('')
  const [returnWhat, setReturnWhat] = useState('8')
  const [document, setDocument] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const act = useSave(() => api.post(`/portal/manage/promotions/${id}/action`, { action, comment, returnWhat: Number(returnWhat), document }), {
    invalidate: ['portal'],
    success: action === 'recommend' ? 'Recommended and sent to the next level' : 'Decision recorded',
    onDone: () => navigate({ to: '/portal/manage/promotions' }),
    onError: setError,
  })
  return (
    <Card className="mb-4 border-primary/30">
      <CardHeader title="Your decision" description="Read the application, documents and trail below first." />
      <CardBody className="space-y-4">
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={action === a}
              onClick={() => setAction(a)}
              className={cn('rounded-xl border p-3 text-left', action === a ? 'border-primary bg-primary-soft ring-1 ring-primary' : 'bg-white hover:border-border-strong')}
            >
              <span className="block text-sm font-semibold text-slate-900">{ACTIONS[a]?.label}</span>
              <span className="text-xs text-muted-foreground">{ACTIONS[a]?.hint}</span>
            </button>
          ))}
        </div>
        {action === 'return' && (
          <Field label="What the applicant must send again" required>
            <NativeSelect value={returnWhat} onChange={(e) => setReturnWhat(e.target.value)}>
              {RETURN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
        )}
        <Field label="Comment" required hint="Recorded in the trail; the applicant sees it when you return or decline the application.">
          <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>
        <Field label="Endorsement document (optional)" hint="A signed recommendation letter or minutes, as a PDF.">
          <FileField accept=".pdf,application/pdf" endpoint="/portal/files" value={{ url: document, name: document ? 'Endorsement document' : null }} onChange={(fl) => setDocument(fl.url)} />
        </Field>
        {error && <p className="rounded-xl bg-secondary-light px-3 py-2 text-sm font-medium text-secondary-light-foreground">{error}</p>}
        <Button onClick={() => (setError(null), act.mutate(undefined))} disabled={act.isPending || !comment.trim()}>
          {act.isPending ? <Loader2 className="animate-spin" /> : <Send />} {ACTIONS[action]?.label}
        </Button>
      </CardBody>
    </Card>
  )
}
