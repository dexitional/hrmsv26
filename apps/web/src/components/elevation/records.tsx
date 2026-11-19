// Elevation records (appointments, promotions, upgrades) and confirmations.
import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { ArrowUpCircle, BarChart3, BadgeCheck, Pencil, Printer, Sparkles, Trash2, UserPlus } from 'lucide-react'
import { STAFF_GROUPS } from '@hrms/db/types'
import type { ElevationType } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { addYears, date, today } from '#/lib/format'
import { ELEVATION_LABELS, GROUP_LABELS } from '#/lib/labels'
import { confirmSchema, elevationSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { Combobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useJobs, useScales, useUnits } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { DeadlineBadge, EmptyState, StaffCell, StatusBadge } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'
import { StaffPrompt } from '#/components/admin/staff-prompt'
import { StatusTabs } from '#/components/admin/status-tabs'

type Row = Record<string, any> & { id: number }
type Data = Page<Row> & { counts: Array<{ status: string; count: number }> }
type In = z.input<typeof elevationSchema>

const TYPES = [
  { value: 'APPOINTMENT', label: 'Appointments' },
  { value: 'PROMOTION', label: 'Promotions' },
  { value: 'UPGRADE', label: 'Upgrades' },
]

export function ElevationRecords() {
  const canEdit = useCan('elevation', 'edit')
  const canManage = useCan('elevation', 'manage')
  const { confirm, dialog } = useConfirm()
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [current, setCurrent] = useState(false)
  const [form, setForm] = useState<{ type: ElevationType; row: Row | null } | null>(null)
  const [stats, setStats] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['elevation', { type, q, page, current }],
    queryFn: () => api.get<Data>('/elevation/records', { type, q, page, current: current ? 1 : undefined }),
    placeholderData: keepPreviousData,
  })
  const remove = useSave((id: number) => api.delete(`/elevation/records/${id}`), { invalidate: ['elevation', 'staff'], success: 'Record deleted' })
  return (
    <>
      {dialog}
      <ElevationDialog value={form} onClose={() => setForm(null)} />
      <StaffPrompt
        open={stats}
        onOpenChange={setStats}
        title="Appointment & promotion statistics"
        description="A printable record of every appointment, promotion, upgrade and contract of one staff member."
        submitLabel="Open statistics"
        onSubmit={(s) => (setStats(false), window.open(`/print/elevation/${s.staffNo}`, '_blank'))}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusTabs value={type} onChange={(v) => (setType(v), setPage(1))} options={TYPES} counts={data?.counts} />
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setStats(true)}>
            <BarChart3 /> Staff statistics
          </Button>
          {canEdit && (
            <>
              <Button variant="secondary" onClick={() => setForm({ type: 'APPOINTMENT', row: null })}>
                <UserPlus /> Appointment
              </Button>
              <Button variant="secondary" onClick={() => setForm({ type: 'PROMOTION', row: null })}>
                <ArrowUpCircle /> Promotion
              </Button>
              <Button onClick={() => setForm({ type: 'UPGRADE', row: null })}>
                <Sparkles /> Upgrade
              </Button>
            </>
          )}
        </div>
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, staff number or designation…" />
        <label className="mb-2 flex items-center gap-2 text-sm">
          <Switch checked={current} onCheckedChange={(v) => (setCurrent(v), setPage(1))} /> Current records only
        </label>
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState title="No records here" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          { header: 'Type', cell: (r) => <StatusBadge status={r.applyType} label={ELEVATION_LABELS[r.applyType]} /> },
          { header: 'Assumption / effective', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.appointDate)}</span> },
          { header: 'Confirmed', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.confirmDate)}</span> },
          { header: 'Designation', cell: (r) => <span className="block max-w-52 text-xs font-medium">{r.jobTitle ?? '—'}</span> },
          { header: 'Grade / notch', cell: (r) => (r.grade ? <span className="font-mono text-xs">{r.grade} · {r.notch}</span> : '—') },
          { header: 'Category', cell: (r) => (r.staffGroup ? <Badge tone="brand" dot={false}>{r.staffGroup}</Badge> : '—') },
          { header: '', cell: (r) => (r.isCurrent ? <Badge tone="success">Current</Badge> : null) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ type: r.applyType, row: r }) },
                  { label: 'Print statistics', icon: Printer, onSelect: () => window.open(`/print/elevation/${r.staffNo}`, '_blank') },
                  'separator',
                  {
                    label: 'Delete',
                    icon: Trash2,
                    danger: true,
                    hidden: !canManage,
                    onSelect: () =>
                      confirm({
                        title: `Delete this ${ELEVATION_LABELS[r.applyType]?.toLowerCase()} record?`,
                        description: r.isCurrent ? 'It is the current record: the staff member moves back to their latest remaining record.' : undefined,
                        danger: true,
                        confirmLabel: 'Delete',
                        onConfirm: () => remove.mutateAsync(r.id),
                      }),
                  },
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

export function ElevationDialog({ value, onClose }: { value: { type: ElevationType; row: Row | null } | null; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const jobs = useJobs()
  const units = useUnits()
  const scales = useScales()
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<In>({ resolver: zodResolver(elevationSchema) })
  const row = value?.row ?? null
  const type = value?.type ?? 'APPOINTMENT'
  useEffect(() => {
    if (!value) return
    setError(null)
    reset({
      type,
      staffNo: row?.staffNo ?? '',
      appointDate: row?.appointDate ?? '',
      confirmDate: row?.confirmDate ?? '',
      letterDate: row?.letterDate ?? '',
      probation: row?.probation ?? (type === 'APPOINTMENT' ? 2 : ''),
      jobId: row?.jobId ?? '',
      unitId: row?.unitId ?? '',
      scaleId: row?.scaleId ?? '',
      staffGroup: row?.staffGroup ?? '',
      remark: row?.remark ?? '',
      makeCurrent: row ? Boolean(row.isCurrent) : true,
    })
  }, [value, row, type, reset])
  const save = useSave((v: In) => (row ? api.put(`/elevation/records/${row.id}`, v) : api.post('/elevation/records', v)), {
    invalidate: ['elevation', 'staff', 'elevation-confirmations'],
    success: `${ELEVATION_LABELS[type]} saved`,
    onDone: onClose,
    onError: setError,
  })
  const appointment = type === 'APPOINTMENT'
  const start = watch('appointDate') as string
  const probation = Number(watch('probation'))
  return (
    <FormDialog
      wide
      open={Boolean(value)}
      onOpenChange={(o) => !o && onClose()}
      title={`${row ? 'Edit' : 'New'} ${ELEVATION_LABELS[type]?.toLowerCase()}`}
      description={appointment ? 'Appointment of a staff member to a designation and unit.' : `${ELEVATION_LABELS[type]} to a new designation and/or grade. The staff member stays in their current unit.`}
      onSubmit={handleSubmit((v) => save.mutate(v as In))}
      busy={save.isPending}
      error={error}
    >
      <Field label="Staff number" required error={errors.staffNo?.message} className="sm:col-span-2">
        <Controller
          control={control}
          name="staffNo"
          render={({ field }) => (
            <StaffField
              value={field.value as number}
              onChange={field.onChange}
              disabled={Boolean(row)}
              onResolved={(s) => {
                if (s && !row) {
                  if (!watch('staffGroup') && s.staffGroup) setValue('staffGroup', s.staffGroup as 'SM')
                  if (!watch('jobId') && s.jobId && !appointment) setValue('jobId', s.jobId)
                  if (!watch('scaleId') && s.scaleId && !appointment) setValue('scaleId', s.scaleId)
                }
              }}
            />
          )}
        />
      </Field>
      <Field label={appointment ? 'Assumption date' : 'Effective date'} required error={errors.appointDate?.message}>
        <Input type="date" {...register('appointDate')} />
      </Field>
      {appointment ? (
        <Field
          label="Confirmation date"
          error={errors.confirmDate?.message}
          hint={start && probation ? <>Due {date(addYears(start, probation))} (after {probation}-year probation)</> : 'Leave empty until confirmed'}
        >
          <Input type="date" {...register('confirmDate')} />
        </Field>
      ) : (
        <Field label="Letter date" error={errors.letterDate?.message}>
          <Input type="date" {...register('letterDate')} />
        </Field>
      )}
      {appointment && (
        <Field label="Probation period (years)" error={errors.probation?.message}>
          <Input type="number" min={0} max={10} {...register('probation')} />
        </Field>
      )}
      <Field label="Staff category" required error={errors.staffGroup?.message}>
        <NativeSelect {...register('staffGroup')}>
          <option value="">Choose…</option>
          {STAFF_GROUPS.map((g) => (
            <option key={g} value={g}>{g} – {GROUP_LABELS[g]}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Job title / designation" required error={errors.jobId?.message} className="sm:col-span-2">
        <Controller control={control} name="jobId" render={({ field }) => <Combobox options={jobs.data} loading={jobs.isLoading} value={field.value as number} onChange={field.onChange} invalid={Boolean(errors.jobId)} placeholder="Choose designation…" />} />
      </Field>
      {appointment && (
        <Field label="Section / unit" required error={errors.unitId?.message}>
          <Controller control={control} name="unitId" render={({ field }) => <Combobox options={units.data} loading={units.isLoading} value={field.value as number} onChange={field.onChange} invalid={Boolean(errors.unitId)} placeholder="Choose unit…" />} />
        </Field>
      )}
      <Field label="Grade / scale" className={appointment ? undefined : 'sm:col-span-2'}>
        <Controller control={control} name="scaleId" render={({ field }) => <Combobox options={scales.data} loading={scales.isLoading} value={field.value as number} onChange={field.onChange} placeholder="Choose grade and notch…" />} />
      </Field>
      <Field label="Remark" className="sm:col-span-2">
        <Textarea rows={2} {...register('remark')} />
      </Field>
      <label className="flex items-center gap-3 sm:col-span-2">
        <Controller control={control} name="makeCurrent" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
        <span className="text-sm font-medium">Make this the staff member's current {appointment ? 'appointment' : 'record'} (their designation, grade and category follow it)</span>
      </label>
    </FormDialog>
  )
}

// ---------------------------------------------------------------- Confirmations

const CONFIRM_STATUSES = [
  { value: 'due', label: 'Confirmation due' },
  { value: 'pending', label: 'On probation' },
  { value: 'confirmed', label: 'Confirmed' },
]

export function Confirmations({ status, onStatus }: { status?: string; onStatus: (s?: string) => void }) {
  const canEdit = useCan('elevation', 'edit')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [confirming, setConfirming] = useState<Row | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['elevation-confirmations', { status, q, page }],
    queryFn: () => api.get<Data>('/elevation/confirmations', { status, q, page }),
    placeholderData: keepPreviousData,
  })
  return (
    <>
      <ConfirmDialog row={confirming} onClose={() => setConfirming(null)} />
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Current appointments, promotions and upgrades with a probation period. Confirmation falls due when the probation years have passed since the assumption date.
      </p>
      <StatusTabs value={status ?? ''} onChange={(s) => (setPage(1), onStatus(s || undefined))} options={CONFIRM_STATUSES} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={BadgeCheck} title="Nothing awaiting confirmation" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          { header: 'Current designation', cell: (r) => <span className="block max-w-52 text-xs font-medium">{r.jobTitle ?? '—'}</span> },
          { header: 'Assumption date', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.appointDate)}</span> },
          { header: 'Probation', align: 'center', cell: (r) => `${r.probation} yr${Number(r.probation) === 1 ? '' : 's'}` },
          { header: 'Category', cell: (r) => (r.staffGroup ? <Badge tone="brand" dot={false}>{r.staffGroup}</Badge> : '—') },
          {
            header: 'Remarks',
            cell: (r) =>
              r.confirmDate ? (
                <Badge tone="success">Confirmed {date(r.confirmDate)}</Badge>
              ) : Number(r.daysLeft) <= 0 ? (
                <Badge tone="danger">Confirmation due</Badge>
              ) : (
                <span className="text-xs">
                  <DeadlineBadge daysLeft={r.daysLeft} runningLabel={`${r.daysLeft} days to confirmation`} />
                  <span className="mt-0.5 block text-muted-foreground">Due {date(r.dueDate)}</span>
                </span>
              ),
          },
          {
            header: '',
            align: 'right',
            cell: (r) =>
              canEdit && !r.confirmDate ? (
                <Button size="sm" variant={Number(r.daysLeft) <= 0 ? 'default' : 'outline'} onClick={() => setConfirming(r)}>
                  <BadgeCheck /> Confirm
                </Button>
              ) : null,
          },
        ]}
      />
      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function ConfirmDialog({ row, onClose }: { row: Row | null; onClose: () => void }) {
  type C = z.input<typeof confirmSchema>
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<C>({ resolver: zodResolver(confirmSchema) })
  useEffect(() => {
    if (row) (setError(null), reset({ confirmDate: row.dueDate && row.dueDate <= today() ? row.dueDate : today() }))
  }, [row, reset])
  const save = useSave((v: C) => api.post(`/elevation/confirmations/${row!.id}/confirm`, v), {
    invalidate: ['elevation-confirmations', 'elevation', 'staff'],
    success: 'Appointment confirmed',
    onDone: onClose,
    onError: setError,
  })
  return (
    <FormDialog open={Boolean(row)} onOpenChange={(o) => !o && onClose()} title="Confirm appointment" description={row ? `${row.fullName} — ${row.jobTitle ?? ''}` : undefined} onSubmit={handleSubmit((v) => save.mutate(v))} busy={save.isPending} error={error} submitLabel="Confirm">
      <Field label="Confirmation date" required error={errors.confirmDate?.message}>
        <Input type="date" {...register('confirmDate')} />
      </Field>
      <div className="flex items-end pb-2 text-xs text-muted-foreground">{row?.dueDate ? `Due ${date(row.dueDate)}` : null}</div>
    </FormDialog>
  )
}

