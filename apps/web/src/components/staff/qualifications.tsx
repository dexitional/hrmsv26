import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { BadgeCheck, GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { QUALIFICATION_TYPES } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { QUALIFICATION_LABELS } from '#/lib/labels'
import { qualificationSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable } from '#/components/admin/data-table'
import { FileField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState } from '#/components/admin/page'
import { DocButton, PdfViewer } from '#/components/admin/pdf-viewer'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'

type Row = Record<string, any> & { id: number }
type In = z.input<typeof qualificationSchema>

export function QualificationsTab({ staffNo }: { staffNo: string }) {
  const canEdit = useCan('staff', 'edit')
  const canManage = useCan('staff', 'manage')
  const { confirm, dialog } = useConfirm()
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const [pdf, setPdf] = useState<{ url: string; title: string } | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['qualifications', staffNo], queryFn: () => api.get<Array<Row>>(`/staff-records/${staffNo}/qualifications`) })
  const remove = useSave((id: number) => api.delete(`/staff-records/qualifications/${id}`), { invalidate: ['qualifications'], success: 'Qualification removed' })
  return (
    <>
      {dialog}
      <PdfViewer url={pdf?.url ?? null} title={pdf?.title ?? ''} onClose={() => setPdf(null)} />
      <QualificationDialog staffNo={staffNo} value={form} onClose={() => setForm(null)} />
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <p className="text-sm text-muted-foreground">Academic and professional qualifications, with certificate verification.</p>
        {canEdit && (
          <Button onClick={() => setForm({ row: null })}>
            <Plus /> Add qualification
          </Button>
        )}
      </div>
      <DataTable
        className="rounded-none border-x-0 border-b-0"
        loading={isLoading}
        rows={data}
        empty={<EmptyState icon={GraduationCap} title="No qualifications recorded" />}
        columns={[
          { header: 'Qualification', cell: (r) => <Badge tone="brand" dot={false}>{QUALIFICATION_LABELS[r.certRate] ?? r.certRate ?? '—'}</Badge> },
          {
            header: 'Programme of study',
            cell: (r) => (
              <span className="block max-w-72">
                <span className="block font-semibold text-slate-800">{r.qualify}</span>
                <span className="text-xs text-muted-foreground">{r.institution}</span>
              </span>
            ),
          },
          { header: 'Specialization', cell: (r) => <span className="block max-w-52 text-xs">{r.specialize || '—'}</span> },
          { header: 'Date awarded', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.gradDate)}</span> },
          { header: 'Start', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.startDate)}</span> },
          { header: 'End', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.endDate)}</span> },
          { header: 'Verification', cell: (r) => (r.verified === '1' ? <Badge tone="success"><BadgeCheck className="size-3" /> Verified</Badge> : <Badge tone="warning">Not verified</Badge>) },
          { header: 'Document', cell: (r) => <DocButton path={r.path} onOpen={(url) => setPdf({ url, title: `${r.qualify} — ${r.institution}` })} /> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ row: r }) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: `Remove ${r.qualify}?`, danger: true, confirmLabel: 'Remove', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

function QualificationDialog({ staffNo, value, onClose }: { staffNo: string; value: { row: Row | null } | null; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(qualificationSchema) })
  const row = value?.row ?? null
  useEffect(() => {
    if (!value) return
    setError(null)
    reset({
      institution: row?.institution ?? '',
      qualify: row?.qualify ?? '',
      specialize: row?.specialize ?? '',
      certRate: row?.certRate ?? '',
      verified: row?.verified === '1',
      path: row?.path ?? '',
      startDate: row?.startDate ?? '',
      endDate: row?.endDate ?? '',
      gradDate: row?.gradDate ?? '',
    } as In)
  }, [value, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/staff-records/qualifications/${row.id}`, v) : api.post(`/staff-records/${staffNo}/qualifications`, v)), {
    invalidate: ['qualifications'],
    success: 'Qualification saved',
    onDone: onClose,
    onError: setError,
  })
  return (
    <FormDialog wide open={Boolean(value)} onOpenChange={(o) => !o && onClose()} title={row ? 'Edit qualification' : 'Add qualification'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Institution" required error={errors.institution?.message} className="sm:col-span-2">
        <Input {...register('institution')} className="uppercase" />
      </Field>
      <Field label="Programme" required error={errors.qualify?.message} hint="e.g. Master of Philosophy">
        <Input {...register('qualify')} className="uppercase" />
      </Field>
      <Field label="Area of specialization">
        <Input {...register('specialize')} className="uppercase" />
      </Field>
      <Field label="Qualification" required error={errors.certRate?.message}>
        <NativeSelect {...register('certRate')}>
          <option value="">Choose…</option>
          {QUALIFICATION_TYPES.map((t) => (
            <option key={t} value={t}>{QUALIFICATION_LABELS[t]}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Date of certificate" error={errors.gradDate?.message}>
        <Input type="date" {...register('gradDate')} />
      </Field>
      <Field label="Programme start date" error={errors.startDate?.message}>
        <Input type="date" {...register('startDate')} />
      </Field>
      <Field label="Programme end date" error={errors.endDate?.message}>
        <Input type="date" {...register('endDate')} />
      </Field>
      <Field label="Certificate document (PDF)" className="sm:col-span-2">
        <Controller
          control={control}
          name="path"
          render={({ field }) => (
            <FileField accept=".pdf,application/pdf" endpoint="/files/pdf" value={{ url: (field.value as string) || null, name: field.value ? 'Certificate' : null }} onChange={(f) => field.onChange(f.url ?? '')} />
          )}
        />
      </Field>
      <label className="flex items-center gap-3 sm:col-span-2">
        <Controller control={control} name="verified" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
        <span className="text-sm font-medium">Certificate verified</span>
      </label>
    </FormDialog>
  )
}
