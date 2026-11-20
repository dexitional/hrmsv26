import { useState } from 'react'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { HeartHandshake, LifeBuoy, Plus, Wifi, Wrench, X } from 'lucide-react'
import { api } from '#/lib/api-client'
import { dateTime } from '#/lib/format'
import { serviceRequestSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody } from '#/components/ui/card'
import { Input, Textarea } from '#/components/ui/input'
import { useConfirm } from '#/components/admin/confirm'
import { FileField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { CardSkeleton } from '#/components/admin/skeletons'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_TONES } from '#/components/portal/labels'

type Category = 'IT' | 'EDUROAM' | 'COUNSELLING'

const SERVICES: Record<string, { category: Category; title: string; description: string; icon: typeof Wrench; placeholder: string; note?: string }> = {
  it: {
    category: 'IT',
    title: 'Helpdesk & Support',
    description: 'Computer, printer, email, network and software problems. The ICT support team picks up your request.',
    icon: Wrench,
    placeholder: 'My office computer cannot connect to the shared printer…',
  },
  eduroam: {
    category: 'EDUROAM',
    title: 'Eduroam & Wi-Fi',
    description: 'Eduroam accounts, password resets and campus Wi-Fi access.',
    icon: Wifi,
    placeholder: 'Please reset my Eduroam password…',
  },
  counselling: {
    category: 'COUNSELLING',
    title: 'Counselling',
    description: 'Confidential support from the University’s counselling team, for work or personal matters.',
    icon: HeartHandshake,
    placeholder: 'I would like to speak with a counsellor about…',
    note: 'Counselling requests are confidential: only the Directorate of Human Resource’s counselling staff can read them. Share as much or as little as you are comfortable with; they will contact you to arrange a session.',
  },
}

export const Route = createFileRoute('/portal/support/$category')({
  beforeLoad: ({ params }) => {
    if (!SERVICES[params.category]) throw notFound()
  },
  component: Support,
})

type R = Record<string, any>

function Support() {
  const { category } = Route.useParams()
  const service = SERVICES[category]!
  const [open, setOpen] = useState(false)
  const { confirm, dialog } = useConfirm()
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'requests', service.category], queryFn: () => api.get<Array<R>>('/portal/requests', { category: service.category }) })
  const close = useSave((id: number) => api.post(`/portal/requests/${id}/close`), { invalidate: ['portal'], success: 'Request closed' })
  const Icon = service.icon
  return (
    <>
      {dialog}
      <RequestDialog open={open} onClose={() => setOpen(false)} category={service.category} placeholder={service.placeholder} note={service.note} title={service.title} />
      <PageHeader
        eyebrow="Support services"
        title={
          <span className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary-light text-secondary-light-foreground">
              <Icon className="size-5" />
            </span>
            {service.title}
          </span>
        }
        description={service.description}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> New request
          </Button>
        }
      />
      {isLoading ? (
        <CardSkeleton />
      ) : !data?.length ? (
        <EmptyState icon={LifeBuoy} title="No requests yet" description="Raise a request and follow the response here." action={<Button variant="outline" onClick={() => setOpen(true)}><Plus /> New request</Button>} />
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <Card key={r.id}>
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      #{r.id} · {dateTime(r.createdAt)}
                    </p>
                  </div>
                  <span className="flex items-center gap-2">
                    <Badge tone={REQUEST_STATUS_TONES[r.status] ?? 'neutral'}>{REQUEST_STATUS_LABELS[r.status] ?? r.status}</Badge>
                    {r.status !== 'CLOSED' && (
                      <Button variant="ghost" size="sm" onClick={() => confirm({ title: 'Close this request?', description: 'Close it if you no longer need help with it.', confirmLabel: 'Close request', onConfirm: () => close.mutateAsync(r.id) })}>
                        <X /> Close
                      </Button>
                    )}
                  </span>
                </div>
                <p className="text-sm break-words whitespace-pre-line text-slate-700">{r.description}</p>
                {r.response && (
                  <div className="rounded-xl border-l-4 border-primary bg-primary-soft/50 px-4 py-3">
                    <p className="eyebrow mb-1">Response · {dateTime(r.respondedAt)}</p>
                    <p className="text-sm break-words whitespace-pre-line text-slate-800">{r.response}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

type In = z.input<typeof serviceRequestSchema>

function RequestDialog({ open, onClose, category, placeholder, note, title }: { open: boolean; onClose: () => void; category: Category; placeholder: string; note?: string; title: string }) {
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<In>({
    resolver: zodResolver(serviceRequestSchema),
    values: { category, title: '', description: '', attachment: '', attachmentName: '' },
  })
  const save = useSave((d: In) => api.post('/portal/requests', d), { invalidate: ['portal'], success: 'Request sent', onDone: () => (reset(), onClose()), onError: setError })
  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !o && (onClose(), setError(null))}
      title={`New ${title.toLowerCase()} request`}
      description={note}
      submitLabel="Send request"
      busy={save.isPending}
      error={error}
      onSubmit={handleSubmit((d) => save.mutate(d))}
    >
      <Field label="Subject" required error={errors.title?.message} className="sm:col-span-2">
        <Input {...register('title')} />
      </Field>
      <Field label="Details" required error={errors.description?.message} className="sm:col-span-2">
        <Textarea rows={5} {...register('description')} placeholder={placeholder} />
      </Field>
      {category !== 'COUNSELLING' && (
        <Field label="Attachment (optional)" hint="A screenshot or document that helps explain the problem" className="sm:col-span-2">
          <Controller
            control={control}
            name="attachment"
            render={({ field }) => (
              <FileField
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                endpoint="/portal/files"
                value={{ url: (field.value as string) || null, name: (watch('attachmentName') as string) || null }}
                onChange={(f) => (field.onChange(f.url ?? ''), setValue('attachmentName', f.name ?? ''))}
              />
            )}
          />
        </Field>
      )}
    </FormDialog>
  )
}
