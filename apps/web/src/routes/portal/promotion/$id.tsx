import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Pencil, Send, Trash2 } from 'lucide-react'
import { api } from '#/lib/api-client'
import { properName } from '#/lib/text-case'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Textarea } from '#/components/ui/input'
import { useConfirm } from '#/components/admin/confirm'
import { FileField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { FileView, StateBadge } from '#/components/promotion/file-view'
import { TYPE_LABELS } from '#/components/promotion/labels'

export const Route = createFileRoute('/portal/promotion/$id')({ component: MyApplication })

function MyApplication() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { confirm, dialog } = useConfirm()
  const { data: f, isLoading } = useQuery({ queryKey: ['portal', 'promotion-file', id], queryFn: () => api.get<Record<string, any>>(`/portal/promotion/${id}`) })
  const remove = useSave(() => api.delete(`/portal/promotion/${id}`), { invalidate: ['portal'], success: 'Draft deleted', onDone: () => navigate({ to: '/portal/promotion' }) })
  if (isLoading) return <ProfileSkeleton />
  if (!f) return <EmptyState title="Application not found" />
  const draft = Number(f.promoStatus) === 0
  const returned = [8, 9, 10, 11, 13].includes(Number(f.stageStatus)) && !draft
  return (
    <>
      {dialog}
      <PageHeader
        back={{ to: '/portal/promotion', label: 'Promotion' }}
        eyebrow={`${TYPE_LABELS[Number(f.type)] ?? 'Application'} #${f.promotionId}`}
        title={f.appliedRank ? `Application for ${properName(f.appliedRank)}` : 'Application'}
        meta={<StateBadge state={f.state} />}
        actions={
          draft && (
            <>
              <Button variant="outline" onClick={() => confirm({ title: 'Delete this draft?', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(undefined) })}>
                <Trash2 /> Delete draft
              </Button>
              <Button asChild>
                <Link to="/portal/promotion/apply" search={{ type: Number(f.type), draft: Number(f.promotionId) }}>
                  <Pencil /> Continue draft
                </Link>
              </Button>
            </>
          )
        }
      />
      {returned && <ResubmitPanel id={id} stage={Number(f.stageStatus)} />}
      <FileView file={f} docHref={(path) => `/api/portal/promotion/${id}/file?path=${encodeURIComponent(path)}`} />
    </>
  )
}

function ResubmitPanel({ id, stage }: { id: string; stage: number }) {
  const [cv, setCv] = useState<string | null>(null)
  const [papers, setPapers] = useState<string | null>(null)
  const [letter, setLetter] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const needCv = stage === 8 || stage === 10 || stage === 13
  const needPapers = stage === 9 || stage === 10 || stage === 13
  const needForm = stage === 11 || stage === 10 || stage === 13
  const send = useSave(() => api.post(`/portal/promotion/${id}/resubmit`, { appCv: cv, papersFile: papers, appLetter: letter, comment }), {
    invalidate: ['portal'],
    success: 'Sent back for review',
    onError: setError,
  })
  const pdf = (label: string, value: string | null, set: (v: string | null) => void) => (
    <Field label={label} className="sm:col-span-2">
      <FileField accept=".pdf,application/pdf" endpoint="/portal/files" value={{ url: value, name: value ? label : null }} onChange={(f) => set(f.url)} />
    </Field>
  )
  return (
    <Card className="mb-4 border-amber-200">
      <CardHeader title="Returned to you" description="Upload what was asked for, then send it back. It returns to the level that returned it. The reason is in the trail below." />
      <CardBody className="grid gap-4 sm:grid-cols-2">
        {needCv && pdf('Updated CV', cv, setCv)}
        {needPapers && pdf('Updated papers', papers, setPapers)}
        {needForm && pdf('Updated application form / letter', letter, setLetter)}
        <Field label="Note (optional)" className="sm:col-span-2">
          <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>
        {error && <p className="rounded-xl bg-secondary-light px-3 py-2 text-sm font-medium text-secondary-light-foreground sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <Button onClick={() => (setError(null), send.mutate(undefined))} disabled={send.isPending}>
            {send.isPending ? <Loader2 className="animate-spin" /> : <Send />} Send back
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
