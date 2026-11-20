import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { HeartHandshake, Pencil, Plus, Trash2 } from 'lucide-react'
import { RELATIONS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { date, genderLabel } from '#/lib/format'
import { relativeSchema } from '#/lib/schemas'
import { properName } from '#/lib/text-case'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable } from '#/components/admin/data-table'
import { FileField, PhotoField } from '#/components/admin/file-upload'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { Avatar, EmptyState } from '#/components/admin/page'
import { DocButton, PdfViewer } from '#/components/admin/pdf-viewer'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'

type Row = Record<string, any> & { id: number }
type In = z.input<typeof relativeSchema>
const yes = (v: unknown) => v === '1' || v === 1 || v === true
const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()
/** Codes follow spouses → children → parents → others, so adding or removing one can move others. */
const renumberedNote = (n: number | undefined) => (n ? `; ${n} other code${n === 1 ? '' : 's'} renumbered` : '')

export function RelativesTab({ staffNo }: { staffNo: string }) {
  const canEdit = useCan('staff', 'edit')
  const canManage = useCan('staff', 'manage')
  const { confirm, dialog } = useConfirm()
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const [pdf, setPdf] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['relatives', staffNo], queryFn: () => api.get<Array<Row>>(`/staff-records/${staffNo}/relatives`) })
  const remove = useSave((id: number) => api.delete<{ renumbered: number }>(`/staff-records/relatives/${id}`), {
    invalidate: ['relatives'],
    success: (r) => `Relative removed${renumberedNote(r.renumbered)}`,
  })
  const name = (r: Row) => properName([r.fname, r.mname, r.lname].filter(Boolean).join(' ')) ?? ''
  return (
    <>
      {dialog}
      <PdfViewer url={pdf} title="Birth certificate" onClose={() => setPdf(null)} />
      <RelativeDialog staffNo={staffNo} value={form} onClose={() => setForm(null)} />
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <p className="text-sm text-muted-foreground">Spouse, children, parents and other relatives, and who is next of kin.</p>
        {canEdit && (
          <Button onClick={() => setForm({ row: null })}>
            <Plus /> Add relative
          </Button>
        )}
      </div>
      <DataTable
        className="rounded-none border-x-0 border-b-0"
        loading={isLoading}
        rows={data}
        empty={<EmptyState icon={HeartHandshake} title="No relatives recorded" />}
        columns={[
          { header: 'Relation', cell: (r) => <Badge tone="brand" dot={false}>{cap(r.relation ?? '—')}</Badge> },
          {
            header: 'Full name',
            cell: (r) => (
              <span className="flex items-center gap-2.5">
                <Avatar name={name(r)} photoUrl={r.photo?.startsWith('/api/files/') ? r.photo : null} className="size-8" />
                <span className="font-semibold text-slate-800">{name(r)}</span>
              </span>
            ),
          },
          { header: 'Date of birth', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.dob)}{r.age !== null && r.age !== undefined ? ` · ${r.age} yrs` : ''}</span> },
          { header: 'Gender', cell: (r) => genderLabel(r.gender) },
          { header: 'Code', cell: (r) => <span className="font-mono text-xs">{r.code ?? '—'}</span> },
          { header: 'Contact', cell: (r) => <span className="font-mono text-xs">{r.phone || '—'}</span> },
          { header: 'Alive?', cell: (r) => (yes(r.alive) ? <Badge tone="success">Yes</Badge> : <Badge>Deceased</Badge>) },
          { header: 'Next of kin?', cell: (r) => (yes(r.kin) ? <Badge tone="info">Next of kin</Badge> : <span className="text-xs text-muted-foreground">No</span>) },
          { header: 'Birth cert.', cell: (r) => <DocButton path={r.path} onOpen={setPdf} /> },
          { header: '', cell: (r) => (yes(r.active) ? null : <Badge>Inactive</Badge>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ row: r }) },
                  { label: 'Remove', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: `Remove ${name(r)}?`, danger: true, confirmLabel: 'Remove', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

function RelativeDialog({ staffNo, value, onClose }: { staffNo: string; value: { row: Row | null } | null; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<In>({ resolver: zodResolver(relativeSchema) })
  const row = value?.row ?? null
  useEffect(() => {
    if (!value) return
    setError(null)
    reset({
      relation: row?.relation ?? '',
      fname: row?.fname ?? '',
      mname: row?.mname ?? '',
      lname: row?.lname ?? '',
      dob: row?.dob ?? '',
      gender: row?.gender ?? '',
      phone: row?.phone ?? '',
      address: row?.address ?? '',
      hometown: row?.hometown ?? '',
      kin: row ? yes(row.kin) : false,
      alive: row ? yes(row.alive) : true,
      photo: row?.photo ?? '',
      path: row?.path ?? '',
      active: row ? yes(row.active) : true,
    } as In)
  }, [value, row, reset])
  type Saved = { code?: string | null; renumbered: number }
  const save = useSave((v: In) => (row ? api.put<Saved>(`/staff-records/relatives/${row.id}`, v) : api.post<Saved>(`/staff-records/${staffNo}/relatives`, v)), {
    invalidate: ['relatives'],
    success: (r) => `${r.code ? `Relative added as ${r.code}` : 'Relative saved'}${renumberedNote(r.renumbered)}`,
    onDone: onClose,
    onError: setError,
  })
  const toggle = (name: 'kin' | 'alive' | 'active', label: string) => (
    <label className="flex items-center gap-3">
      <Controller control={control} name={name} render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
  return (
    <FormDialog wide open={Boolean(value)} onOpenChange={(o) => !o && onClose()} title={row ? 'Edit relative' : 'Add relative'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Relation" required error={errors.relation?.message}>
        <NativeSelect {...register('relation')}>
          <option value="">Choose…</option>
          {RELATIONS.map((r) => (
            <option key={r} value={r}>{cap(r)}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Gender" required error={errors.gender?.message}>
        <NativeSelect {...register('gender')}>
          <option value="">Choose…</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </NativeSelect>
      </Field>
      <Field label="First name" required error={errors.fname?.message}>
        <Input {...register('fname')} className="uppercase" />
      </Field>
      <Field label="Middle name">
        <Input {...register('mname')} className="uppercase" />
      </Field>
      <Field label="Last name" required error={errors.lname?.message}>
        <Input {...register('lname')} className="uppercase" />
      </Field>
      <Field label="Date of birth" error={errors.dob?.message}>
        <Input type="date" {...register('dob')} />
      </Field>
      <Field label="Phone" error={errors.phone?.message}>
        <Input type="tel" {...register('phone')} />
      </Field>
      <Field label="Hometown">
        <Input {...register('hometown')} />
      </Field>
      <Field label="Address" className="sm:col-span-2">
        <Input {...register('address')} />
      </Field>
      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
        {toggle('kin', 'Next of kin')}
        {toggle('alive', 'Alive')}
        {toggle('active', 'Active')}
      </div>
      <Field label="Photo" className="sm:col-span-2">
        <Controller
          control={control}
          name="photo"
          render={({ field }) => (
            <PhotoField
              value={(field.value as string) || null}
              onChange={(u) => field.onChange(u ?? '')}
              preview={<Avatar name={`${watch('fname') ?? ''} ${watch('lname') ?? ''}`} photoUrl={(field.value as string)?.startsWith('/api/files/') ? (field.value as string) : null} className="size-16" />}
            />
          )}
        />
      </Field>
      <Field label="Birth certificate (PDF)" className="sm:col-span-2">
        <Controller
          control={control}
          name="path"
          render={({ field }) => (
            <FileField accept=".pdf,application/pdf" endpoint="/files/pdf" value={{ url: (field.value as string) || null, name: field.value ? 'Birth certificate' : null }} onChange={(f) => field.onChange(f.url ?? '')} />
          )}
        />
      </Field>
    </FormDialog>
  )
}
