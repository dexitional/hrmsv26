import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, PenLine } from 'lucide-react'
import { api } from '#/lib/api-client'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Textarea } from '#/components/ui/input'
import { Field } from '#/components/admin/form'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { FormAStatus, FormAView } from '#/components/appraisal/shared'

export const Route = createFileRoute('/portal/appraisal/a/$year')({ component: MyFormA })

function MyFormA() {
  const { year } = Route.useParams()
  const [comments, setComments] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: f, isLoading } = useQuery({ queryKey: ['portal', 'form-a', year], queryFn: () => api.get<Record<string, any>>(`/portal/appraisal/a/${year}`) })
  const sign = useSave(() => api.post(`/portal/appraisal/a/${year}/sign`, { comments, confirm }), { invalidate: ['portal'], success: 'Appraisal signed', onError: setError })
  if (isLoading) return <ProfileSkeleton />
  if (!f) return <EmptyState title="Appraisal not found" />
  const waiting = Number(f.status) === 1
  return (
    <>
      <PageHeader back={{ to: '/portal/appraisal', label: 'Appraisal' }} eyebrow="Form A" title={`Appraisal ${year}`} meta={<FormAStatus status={Number(f.status)} />} />
      <FormAView form={f} />
      {waiting && (
        <Card className="mt-4 border-primary/30">
          <CardHeader title="Your comments and signature" description="Once you sign, the appraisal is complete and can no longer be changed." />
          <CardBody className="space-y-4">
            <Field label="Your comments (optional)">
              <Textarea rows={4} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Anything you agree or disagree with, or want on record" />
            </Field>
            <label className="flex items-start gap-3 rounded-xl border p-3 text-sm">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" />
              <span>I have read this appraisal and sign it.</span>
            </label>
            {error && <p className="rounded-xl bg-secondary-light px-3 py-2 text-sm font-medium text-secondary-light-foreground">{error}</p>}
            <Button onClick={() => (setError(null), sign.mutate(undefined))} disabled={!confirm || sign.isPending}>
              {sign.isPending ? <Loader2 className="animate-spin" /> : <PenLine />} Sign appraisal
            </Button>
          </CardBody>
        </Card>
      )}
    </>
  )
}
