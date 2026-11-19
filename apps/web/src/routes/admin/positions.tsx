import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, CircleStop, Crown, History, Pencil, Plus, Printer, Trash2 } from 'lucide-react'
import { POSTS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { addYears, date } from '#/lib/format'
import { POST_LABELS } from '#/lib/labels'
import { positionSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { Combobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useUnits } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { DeadlineBadge, EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'
import { StaffPrompt } from '#/components/admin/staff-prompt'
import { StatusTabs } from '#/components/admin/status-tabs'

export const Route = createFileRoute('/admin/positions')({
  validateSearch: z.object({ status: z.string().optional() }),
  component: PositionsPage,
})

type Row = Record<string, any> & { id: number }
type In = z.input<typeof positionSchema>
type Data = Page<Row> & { counts: Array<{ status: string; count: number }> }

const STATUSES = [
  { value: 'current', label: 'Current' },
  { value: 'expiring', label: 'Ending ≤ 90 days' },
  { value: 'expired', label: 'Past end date' },
  { value: 'ended', label: 'Ended' },
]

function PositionsPage() {
  const { status = 'current' } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const canEdit = useCan('positions', 'edit')
  const canManage = useCan('positions', 'manage')
  const { confirm, dialog } = useConfirm()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Row | null>(null)
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['positions', { status, q, page }],
    queryFn: () => api.get<Data>('/positions', { status, q, page }),
    placeholderData: keepPreviousData,
  })
  const end = useSave((id: number) => api.post(`/positions/${id}/end`), { invalidate: ['positions'], success: 'Position marked as ended' })
  const remove = useSave((id: number) => api.delete(`/positions/${id}`), { invalidate: ['positions'], success: 'Position deleted' })
  const countOf = (s: string) => data?.counts.find((c) => c.status === s)?.count ?? 0
  return (
    <>
      {dialog}
      <PositionDialog open={open} onOpenChange={setOpen} position={editing} />
      <StaffPrompt
        open={history}
        onOpenChange={setHistory}
        title="Position history"
        description="A printable list of every position the staff member has held."
        submitLabel="Open printable history"
        onSubmit={(s) => (setHistory(false), window.open(`/print/positions/${s.staffNo}`, '_blank'))}
      />
      <PageHeader
        eyebrow="Utilities"
        title="Positions"
        description="Offices held by staff — heads, deans, directors… — for a set period, over a unit of jurisdiction."
        actions={
          <>
            <Button variant="outline" onClick={() => setHistory(true)}>
              <History /> Position history
            </Button>
            {canEdit && (
              <Button onClick={() => (setEditing(null), setOpen(true))}>
                <Plus /> New position
              </Button>
            )}
          </>
        }
      />
      {(countOf('expired') > 0 || countOf('expiring') > 0) && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {countOf('expired') > 0 && (
            <button type="button" onClick={() => navigate({ search: { status: 'expired' } })} className="flex items-center gap-3 rounded-2xl border border-red-200 bg-secondary-soft p-4 text-left hover:border-red-300">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary-light text-secondary-light-foreground">
                <AlertTriangle className="size-5" />
              </span>
              <span>
                <span className="block font-bold text-secondary-foreground">{countOf('expired')} positions past their end date</span>
                <span className="text-xs text-muted-foreground">Still marked active — renew them or mark them ended.</span>
              </span>
            </button>
          )}
          {countOf('expiring') > 0 && (
            <button type="button" onClick={() => navigate({ search: { status: 'expiring' } })} className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-warning-light/60 p-4 text-left hover:border-amber-300">
              <span className="flex size-10 items-center justify-center rounded-xl bg-warning-light text-warning-light-foreground">
                <Crown className="size-5" />
              </span>
              <span>
                <span className="block font-bold text-amber-800">{countOf('expiring')} positions ending within 90 days</span>
                <span className="text-xs text-muted-foreground">Plan successors or renewals before the cycle ends.</span>
              </span>
            </button>
          )}
        </div>
      )}
      <StatusTabs value={status} onChange={(s) => (setPage(1), navigate({ search: { status: s || undefined } }))} options={STATUSES} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Search name, staff no., title or unit…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={Crown} title="No positions here" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          {
            header: 'Position',
            cell: (r) => (
              <span className="block max-w-56">
                <span className="block font-semibold text-slate-800">{r.title ?? '—'}</span>
                <span className="text-xs text-muted-foreground">{[r.post && POST_LABELS[r.post], r.access === 'SUBHEAD' ? 'Sub-head access' : r.access ? 'Head access' : null].filter(Boolean).join(' · ')}</span>
              </span>
            ),
          },
          { header: 'Unit of jurisdiction', cell: (r) => <span className="block max-w-56 text-xs">{r.unitName ?? '—'}</span> },
          { header: 'Period', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.startDate)} – {date(r.endDate)}</span> },
          { header: 'Cycle', cell: (r) => (r.active === '1' ? <DeadlineBadge daysLeft={r.daysLeft} /> : <Badge>Ended</Badge>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => (setEditing(r), setOpen(true)) },
                  { label: 'Print history', icon: Printer, onSelect: () => window.open(`/print/positions/${r.staffNo}`, '_blank') },
                  { label: 'Mark as ended', icon: CircleStop, hidden: !canEdit || r.active !== '1', onSelect: () => end.mutate(r.id) },
                  'separator',
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: 'Delete this position record?', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function PositionDialog({ open, onOpenChange, position }: { open: boolean; onOpenChange: (o: boolean) => void; position: Row | null }) {
  const [error, setError] = useState<string | null>(null)
  const units = useUnits()
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<In>({ resolver: zodResolver(positionSchema) })
  useEffect(() => {
    if (!open) return
    setError(null)
    reset({
      staffNo: position?.staffNo ?? '',
      title: position?.title ?? '',
      post: position?.post ?? '',
      unitId: position?.unitId ?? '',
      unitDomain: position?.unitDomain ?? '',
      access: position?.access ?? '',
      startDate: position?.startDate ?? '',
      endDate: position?.endDate ?? '',
      active: position ? position.active === '1' : true,
      remark: position?.remark ?? '',
    })
  }, [open, position, reset])
  const save = useSave((v: In) => (position ? api.put(`/positions/${position.id}`, v) : api.post('/positions', v)), {
    invalidate: ['positions', 'units'],
    success: position ? 'Position updated' : 'Position added',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  const start = watch('startDate') as string
  return (
    <FormDialog wide open={open} onOpenChange={onOpenChange} title={position ? 'Edit position' : 'New position'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Staff number" required error={errors.staffNo?.message}>
        <Controller control={control} name="staffNo" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />} />
      </Field>
      <Field label="Title of position" required error={errors.title?.message} hint="e.g. Head, Department of Mathematics">
        <Input {...register('title')} />
      </Field>
      <Field label="Rank of post">
        <NativeSelect
          {...register('post', {
            onChange: (e) => {
              if (!watch('title') && e.target.value) setValue('title', POST_LABELS[e.target.value] ?? '')
            },
          })}
        >
          <option value="">—</option>
          {POSTS.map((p) => (
            <option key={p} value={p}>{POST_LABELS[p]}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="HRMS access" hint="Head/sub-head access also sets the unit's head or sub-head">
        <NativeSelect {...register('access')}>
          <option value="">None</option>
          <option value="HEAD">Head</option>
          <option value="SUBHEAD">Sub-head</option>
        </NativeSelect>
      </Field>
      <Field label="Unit of jurisdiction" required error={errors.unitId?.message} className="sm:col-span-2">
        <Controller control={control} name="unitId" render={({ field }) => <Combobox options={units.data} loading={units.isLoading} value={field.value as number} onChange={field.onChange} invalid={Boolean(errors.unitId)} placeholder="Choose unit…" />} />
      </Field>
      <Field label="Start of period" required error={errors.startDate?.message}>
        <Input type="date" {...register('startDate')} />
      </Field>
      <Field
        label="End of period"
        required
        error={errors.endDate?.message}
        hint={
          start ? (
            <span className="flex gap-2">
              {[2, 3, 4].map((y) => (
                <button key={y} type="button" className="font-semibold text-primary hover:underline" onClick={() => setValue('endDate', addYears(start, y, true))}>
                  +{y} yrs
                </button>
              ))}
            </span>
          ) : undefined
        }
      >
        <Input type="date" {...register('endDate')} />
      </Field>
      <Field label="Domain under the unit" className="sm:col-span-2">
        <Input {...register('unitDomain')} />
      </Field>
      <Field label="Remark" className="sm:col-span-2">
        <Textarea rows={2} {...register('remark')} />
      </Field>
      <label className="flex items-center gap-3 sm:col-span-2">
        <Controller control={control} name="active" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
        <span className="text-sm font-medium">Current and active</span>
      </label>
    </FormDialog>
  )
}
