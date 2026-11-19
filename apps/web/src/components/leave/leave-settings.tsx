// Leave configuration tabs: types, holidays, constants, entitlements,
// balances and deferments.
import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { CheckCircle2, Minus, Pencil, Plus, Trash2, XCircle } from 'lucide-react'
import { HOLIDAY_CATEGORIES, STAFF_GROUPS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import {
  entitlementSchema,
  holidaySchema,
  leaveBalanceSchema,
  leaveConstantSchema,
  leaveDeferSchema,
  leaveTypeSchema,
} from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { MultiCombobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useJobs, useLeaveTypes } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, StaffCell } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'
import { StatusTabs } from '#/components/admin/status-tabs'
import { YearSwitch } from './year-switch'

type Row = Record<string, any> & { id: number }
const thisYear = new Date().getFullYear()

function ActiveSwitch({ control, name = 'active', label = 'Active' }: { control: any; name?: string; label?: string }) {
  return (
    <label className="flex items-center gap-3 sm:col-span-2">
      <Controller control={control} name={name} render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
}

const isOn = (v: unknown) => v === 1 || v === '1' || v === true

/** Header row of a settings tab: a description and the "add" button. */
function TabIntro({ text, onAdd, addLabel }: { text: string; onAdd?: () => void; addLabel: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <p className="max-w-2xl text-sm text-muted-foreground">{text}</p>
      {onAdd && (
        <Button onClick={onAdd}>
          <Plus /> {addLabel}
        </Button>
      )}
    </div>
  )
}

/** Shared state for "edit in a dialog" tabs. */
function useEditor() {
  const [editing, setEditing] = useState<Row | null>(null)
  const [open, setOpen] = useState(false)
  return { editing, open, setOpen, add: () => (setEditing(null), setOpen(true)), edit: (r: Row) => (setEditing(r), setOpen(true)) }
}

// ---------------------------------------------------------------- Types

export function LeaveTypesTab() {
  const canEdit = useCan('leave', 'edit')
  const canManage = useCan('leave', 'manage')
  const { confirm, dialog } = useConfirm()
  const ed = useEditor()
  const { data, isLoading } = useQuery({ queryKey: ['leave-types'], queryFn: () => api.get<Array<Row>>('/leave/types') })
  const remove = useSave((id: number) => api.delete(`/leave/types/${id}`), { invalidate: ['leave-types', 'lookups'], success: 'Leave type deleted' })
  return (
    <>
      {dialog}
      <TypeDialog open={ed.open} onOpenChange={ed.setOpen} row={ed.editing} />
      <TabIntro text="The major types of leave and whether staff can currently apply for them." onAdd={canEdit ? ed.add : undefined} addLabel="New leave type" />
      <DataTable
        loading={isLoading}
        rows={data}
        columns={[
          { header: 'Leave type', cell: (r) => <span className="font-semibold text-slate-800">{r.title}</span> },
          { header: 'Description', cell: (r) => <span className="text-sm text-slate-600">{r.desc ?? '—'}</span> },
          { header: 'Applications', align: 'right', cell: (r) => <span className="font-mono text-xs">{num(r.applications)}</span> },
          { header: 'On leave now', align: 'right', cell: (r) => <span className="font-mono text-xs">{num(r.onLeave)}</span> },
          { header: 'Status', cell: (r) => (isOn(r.active) ? <Badge tone="success">Open</Badge> : <Badge>Closed</Badge>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => ed.edit(r) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: `Delete ${r.title} leave?`, danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

function TypeDialog({ open, onOpenChange, row }: { open: boolean; onOpenChange: (o: boolean) => void; row: Row | null }) {
  type In = z.input<typeof leaveTypeSchema>
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(leaveTypeSchema) })
  useEffect(() => {
    if (open) (setError(null), reset({ title: row?.title ?? '', desc: row?.desc ?? '', active: row ? isOn(row.active) : true }))
  }, [open, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/leave/types/${row.id}`, v) : api.post('/leave/types', v)), {
    invalidate: ['leave-types', 'lookups'],
    success: 'Leave type saved',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={row ? 'Edit leave type' : 'New leave type'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Title" required error={errors.title?.message} className="sm:col-span-2">
        <Input {...register('title')} className="uppercase" placeholder="e.g. MATERNITY" />
      </Field>
      <Field label="Description" className="sm:col-span-2">
        <Textarea rows={2} {...register('desc')} />
      </Field>
      <ActiveSwitch control={control} label="Open for applications" />
    </FormDialog>
  )
}

// ---------------------------------------------------------------- Holidays

const adjustedMessage = (adjusted: Array<unknown> | undefined) =>
  adjusted?.length ? ` — ${adjusted.length} granted leave${adjusted.length === 1 ? '' : 's'} re-dated` : ''

export function HolidaysTab() {
  const canEdit = useCan('leave', 'edit')
  const canManage = useCan('leave', 'manage')
  const { confirm, dialog } = useConfirm()
  const ed = useEditor()
  const [year, setYear] = useState<number | null>(thisYear)
  const { data, isLoading } = useQuery({ queryKey: ['holidays', year], queryFn: () => api.get<Array<Row>>('/leave/holidays', { year: year ?? undefined }) })
  const remove = useSave((id: number) => api.delete<{ adjusted: Array<unknown> }>(`/leave/holidays/${id}`), {
    invalidate: ['holidays', 'leave-records'],
    success: (r) => `Holiday deleted${adjustedMessage(r.adjusted)}`,
  })
  return (
    <>
      {dialog}
      <HolidayDialog open={ed.open} onOpenChange={ed.setOpen} row={ed.editing} />
      <TabIntro
        text="Public holidays and breaks are never charged as leave days. A holiday within a granted leave's period gives the staff member the day back (later end and resumption dates); one after the leave, up to the resumption date, moves resumption to the next working day."
        onAdd={canEdit ? ed.add : undefined}
        addLabel="New holiday"
      />
      <Toolbar>
        <YearSwitch label="Year" value={year} onChange={setYear} extra={[thisYear + 1]} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data}
        empty={<EmptyState title={year ? `No holidays recorded for ${year}` : 'No holidays recorded'} />}
        columns={[
          { header: 'Date', cell: (r) => <span className="font-semibold whitespace-nowrap">{date(r.holiday, 'long')}</span> },
          { header: 'Day', cell: (r) => <span className="text-xs text-muted-foreground">{r.holiday ? new Date(`${r.holiday}T00:00`).toLocaleDateString('en-GB', { weekday: 'long' }) : '—'}</span> },
          { header: 'Description', cell: (r) => r.desc },
          { header: 'Year', cell: (r) => <span className="font-mono text-xs">{r.year}</span> },
          { header: 'Category', cell: (r) => (r.category ? <Badge tone="brand" dot={false}>{r.category.toLowerCase()}</Badge> : '—') },
          { header: 'Status', cell: (r) => (isOn(r.active) ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => ed.edit(r) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: `Delete ${r.desc}?`, danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

function HolidayDialog({ open, onOpenChange, row }: { open: boolean; onOpenChange: (o: boolean) => void; row: Row | null }) {
  type In = z.input<typeof holidaySchema>
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(holidaySchema) })
  useEffect(() => {
    if (open) (setError(null), reset({ holiday: row?.holiday ?? '', desc: row?.desc ?? '', category: row?.category ?? '', active: row ? isOn(row.active) : true }))
  }, [open, row, reset])
  const save = useSave((v: In) => (row ? api.put<{ adjusted: Array<unknown> }>(`/leave/holidays/${row.id}`, v) : api.post<{ adjusted: Array<unknown> }>('/leave/holidays', v)), {
    invalidate: ['holidays', 'leave-records'],
    success: (r) => `Holiday saved${adjustedMessage(r.adjusted)}`,
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={row ? 'Edit holiday' : 'New holiday'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Date" required error={errors.holiday?.message}>
        <Input type="date" {...register('holiday')} />
      </Field>
      <Field label="Category">
        <NativeSelect {...register('category')}>
          <option value="">—</option>
          {HOLIDAY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Description" required error={errors.desc?.message} className="sm:col-span-2">
        <Input {...register('desc')} placeholder="e.g. Independence Day" />
      </Field>
      <ActiveSwitch control={control} />
    </FormDialog>
  )
}

// ---------------------------------------------------------------- Constants

export function ConstantsTab() {
  const canEdit = useCan('leave', 'edit')
  const canManage = useCan('leave', 'manage')
  const { confirm, dialog } = useConfirm()
  const ed = useEditor()
  const [year, setYear] = useState<number | null>(thisYear)
  const { data, isLoading } = useQuery({ queryKey: ['leave-constants'], queryFn: () => api.get<Array<Row>>('/leave/constants') })
  const remove = useSave((id: number) => api.delete(`/leave/constants/${id}`), { invalidate: ['leave-constants'], success: 'Leave constant deleted' })
  const rows = (data ?? []).filter((r) => year === null || Number(r.year) === year)
  return (
    <>
      {dialog}
      <ConstantDialog open={ed.open} onOpenChange={ed.setOpen} row={ed.editing} />
      <TabIntro text="Days added to or deducted from a whole staff category's leave for a year (e.g. extended Christmas break), with named staff excluded." onAdd={canEdit ? ed.add : undefined} addLabel="New leave constant" />
      <Toolbar>
        <YearSwitch label="Year" value={year} onChange={setYear} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={rows}
        columns={[
          { header: 'Year', cell: (r) => <span className="font-mono text-sm font-bold">{r.year}</span> },
          { header: 'Description', cell: (r) => <span className="block max-w-72">{r.desc}</span> },
          {
            header: 'Adjustment',
            cell: (r) => (
              <Badge tone={r.type === 'ADD' ? 'success' : 'danger'} dot={false}>
                {r.type === 'ADD' ? <Plus className="size-3" /> : <Minus className="size-3" />} {r.weight} days
              </Badge>
            ),
          },
          { header: 'Category', cell: (r) => (r.category ? GROUP_LABELS[r.category] : 'All staff') },
          { header: 'Excluded', align: 'right', cell: (r) => <span className="font-mono text-xs">{r.exclusion.length ? `${r.exclusion.length} staff` : '—'}</span> },
          { header: 'Status', cell: (r) => (isOn(r.active) ? <Badge tone="success">Applied</Badge> : <Badge>Off</Badge>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => ed.edit(r) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: 'Delete this leave constant?', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

function ConstantDialog({ open, onOpenChange, row }: { open: boolean; onOpenChange: (o: boolean) => void; row: Row | null }) {
  type In = z.input<typeof leaveConstantSchema>
  const [error, setError] = useState<string | null>(null)
  const [exclusion, setExclusion] = useState('')
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(leaveConstantSchema) })
  useEffect(() => {
    if (!open) return
    setError(null)
    setExclusion((row?.exclusion ?? []).join(', '))
    reset({ weight: row?.weight ?? '', type: row?.type ?? 'SUB', category: row?.category ?? '', year: row?.year ?? thisYear, desc: row?.desc ?? '', exclusion: [], active: row ? isOn(row.active) : true })
  }, [open, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/leave/constants/${row.id}`, v) : api.post('/leave/constants', v)), {
    invalidate: ['leave-constants'],
    success: 'Leave constant saved',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  const excluded = [...new Set(exclusion.split(/[^\d]+/).filter(Boolean).map(Number))]
  return (
    <FormDialog
      wide
      open={open}
      onOpenChange={onOpenChange}
      title={row ? 'Edit leave constant' : 'New leave constant'}
      onSubmit={handleSubmit((v) => save.mutate({ ...(v as In), exclusion: excluded }))}
      busy={save.isPending}
      error={error}
    >
      <Field label="Add or deduct" required>
        <NativeSelect {...register('type')}>
          <option value="SUB">Deduct days</option>
          <option value="ADD">Add days</option>
        </NativeSelect>
      </Field>
      <Field label="Number of days" required error={errors.weight?.message}>
        <Input type="number" min={0} {...register('weight')} />
      </Field>
      <Field label="Staff category" hint="Leave empty to apply to every category">
        <NativeSelect {...register('category')}>
          <option value="">All staff</option>
          {STAFF_GROUPS.map((g) => (
            <option key={g} value={g}>{GROUP_LABELS[g]}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Year" required error={errors.year?.message}>
        <Input type="number" {...register('year')} />
      </Field>
      <Field label="Description" required error={errors.desc?.message} className="sm:col-span-2">
        <Input {...register('desc')} placeholder="e.g. Christmas / New Year holidays" />
      </Field>
      <Field label="Exclude these staff" hint={`Staff numbers separated by commas or spaces · ${excluded.length} excluded`} className="sm:col-span-2">
        <Textarea rows={3} value={exclusion} onChange={(e) => setExclusion(e.target.value)} className="font-mono text-xs" placeholder="e.g. 10489, 9769, 14116" />
      </Field>
      <ActiveSwitch control={control} label="Apply in leave calculations" />
    </FormDialog>
  )
}

// ---------------------------------------------------------------- Entitlements

export function EntitlementsTab() {
  const canEdit = useCan('leave', 'edit')
  const canManage = useCan('leave', 'manage')
  const { confirm, dialog } = useConfirm()
  const ed = useEditor()
  const jobs = useJobs()
  const { data, isLoading } = useQuery({ queryKey: ['entitlements'], queryFn: () => api.get<Array<Row>>('/leave/entitlements') })
  const remove = useSave((id: number) => api.delete(`/leave/entitlements/${id}`), { invalidate: ['entitlements'], success: 'Entitlement deleted' })
  const jobName = (id: number) => jobs.data?.find((j) => j.value === id)?.label ?? `#${id}`
  return (
    <>
      {dialog}
      <EntitlementDialog open={ed.open} onOpenChange={ed.setOpen} row={ed.editing} />
      <TabIntro text="The days each staff category is entitled to per leave type. An entitlement limited to named designations overrides the category's general one for those staff." onAdd={canEdit ? ed.add : undefined} addLabel="New entitlement" />
      <DataTable
        loading={isLoading}
        rows={data}
        columns={[
          { header: 'Leave type', cell: (r) => <span className="font-semibold">{r.type ?? '—'}</span> },
          { header: 'Category', cell: (r) => <Badge tone="brand" dot={false}>{r.group} · {GROUP_LABELS[r.group]}</Badge> },
          {
            header: 'Applies to',
            cell: (r) =>
              r.jobs.length ? (
                <span className="block max-w-96 text-xs text-slate-600" title={r.jobs.map(jobName).join(', ')}>
                  <b>{r.jobs.length} designations:</b> {r.jobs.slice(0, 4).map(jobName).join(', ')}
                  {r.jobs.length > 4 ? '…' : ''}
                </span>
              ) : (
                <span className="text-xs">Whole category</span>
              ),
          },
          { header: 'Days', align: 'right', cell: (r) => <span className="font-mono text-base font-bold text-primary">{r.weight}</span> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => ed.edit(r) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: 'Delete this entitlement?', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

function EntitlementDialog({ open, onOpenChange, row }: { open: boolean; onOpenChange: (o: boolean) => void; row: Row | null }) {
  type In = z.input<typeof entitlementSchema>
  const [error, setError] = useState<string | null>(null)
  const types = useLeaveTypes()
  const jobs = useJobs()
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(entitlementSchema) })
  useEffect(() => {
    if (open) (setError(null), reset({ typeId: row?.typeId ?? 2, group: row?.group ?? '', jobs: row?.jobs ?? [], weight: row?.weight ?? '' }))
  }, [open, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/leave/entitlements/${row.id}`, v) : api.post('/leave/entitlements', v)), {
    invalidate: ['entitlements'],
    success: 'Entitlement saved',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog wide open={open} onOpenChange={onOpenChange} title={row ? 'Edit entitlement' : 'New entitlement'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Leave type" required error={errors.typeId?.message}>
        <NativeSelect {...register('typeId')}>
          {types.data?.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Staff category" required error={errors.group?.message}>
        <NativeSelect {...register('group')}>
          <option value="">Choose…</option>
          {STAFF_GROUPS.map((g) => (
            <option key={g} value={g}>{GROUP_LABELS[g]}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Days entitled (leave weight)" required error={errors.weight?.message}>
        <Input type="number" min={0} {...register('weight')} />
      </Field>
      <div />
      <Field label="Only for these designations" hint="Leave empty for the whole category" className="sm:col-span-2">
        <Controller control={control} name="jobs" render={({ field }) => <MultiCombobox options={jobs.data} loading={jobs.isLoading} value={(field.value ?? []) as Array<number>} onChange={field.onChange} placeholder="Whole category" />} />
      </Field>
    </FormDialog>
  )
}

// ---------------------------------------------------------------- Balances

export function BalancesTab() {
  const canEdit = useCan('leave', 'edit')
  const canManage = useCan('leave', 'manage')
  const { confirm, dialog } = useConfirm()
  const ed = useEditor()
  const [q, setQ] = useState('')
  const [year, setYear] = useState<number | null>(thisYear)
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['leave-balances', { q, year, page }],
    queryFn: () => api.get<Page<Row>>('/leave/balances', { q, year: year ?? undefined, page }),
    placeholderData: keepPreviousData,
  })
  const remove = useSave((id: number) => api.delete(`/leave/balances/${id}`), { invalidate: ['leave-balances'], success: 'Balance deleted' })
  return (
    <>
      {dialog}
      <BalanceDialog open={ed.open} onOpenChange={ed.setOpen} row={ed.editing} />
      <TabIntro text="Extra leave days from manual or legacy records. Active balances are added to the staff member's leave for that year." onAdd={canEdit ? ed.add : undefined} addLabel="New balance" />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
        <YearSwitch label="Year" value={year} onChange={(y) => (setYear(y), setPage(1))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          { header: 'Year', cell: (r) => <span className="font-mono text-sm">{r.year}</span> },
          { header: 'Extra days', align: 'right', cell: (r) => <span className="font-mono text-base font-bold text-primary">{r.weight}</span> },
          { header: 'History', cell: (r) => <span className="block max-w-56 truncate font-mono text-xs text-muted-foreground">{r.history ?? '—'}</span> },
          { header: 'Status', cell: (r) => (isOn(r.active) ? <Badge tone="success">Counted</Badge> : <Badge>Not counted</Badge>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => ed.edit(r) },
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: 'Delete this balance?', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
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

function BalanceDialog({ open, onOpenChange, row }: { open: boolean; onOpenChange: (o: boolean) => void; row: Row | null }) {
  type In = z.input<typeof leaveBalanceSchema>
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(leaveBalanceSchema) })
  useEffect(() => {
    if (open) (setError(null), reset({ staffNo: row?.staffNo ?? '', weight: row?.weight ?? '', year: row?.year ?? thisYear, history: row?.history ?? '', active: row ? isOn(row.active) : true }))
  }, [open, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/leave/balances/${row.id}`, v) : api.post('/leave/balances', v)), {
    invalidate: ['leave-balances'],
    success: 'Balance saved',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={row ? 'Edit leave balance' : 'New leave balance'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Staff number" required error={errors.staffNo?.message} className="sm:col-span-2">
        <Controller control={control} name="staffNo" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />} />
      </Field>
      <Field label="Extra days" required error={errors.weight?.message}>
        <Input type="number" min={0} {...register('weight')} />
      </Field>
      <Field label="Year" required error={errors.year?.message}>
        <Input type="number" {...register('year')} />
      </Field>
      <Field label="Source / history" hint="Where the balance comes from (legacy record, file reference…)" className="sm:col-span-2">
        <Input {...register('history')} />
      </Field>
      <ActiveSwitch control={control} label="Count in the leave calculation" />
    </FormDialog>
  )
}

// ---------------------------------------------------------------- Deferments

const DEFER_STATUS = [
  { value: '0', label: 'Awaiting approval' },
  { value: '1', label: 'Approved' },
  { value: '2', label: 'Rejected' },
]

export function DefermentsTab({ status, onStatus }: { status?: string; onStatus: (s?: string) => void }) {
  const canEdit = useCan('leave', 'edit')
  const canManage = useCan('leave', 'manage')
  const { confirm, dialog } = useConfirm()
  const ed = useEditor()
  const [q, setQ] = useState('')
  const [year, setYear] = useState<number | null>(thisYear - 1)
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['leave-deferments', { q, year, status, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/leave/deferments', { q, year: year ?? undefined, status, page }),
    placeholderData: keepPreviousData,
  })
  const decide = useSave(({ id, d }: { id: number; d: 'approve' | 'reject' }) => api.post(`/leave/deferments/${id}/${d}`), {
    invalidate: ['leave-deferments'],
    success: 'Deferment updated',
  })
  const remove = useSave((id: number) => api.delete(`/leave/deferments/${id}`), { invalidate: ['leave-deferments'], success: 'Deferment removed' })
  return (
    <>
      {dialog}
      <DeferDialog open={ed.open} onOpenChange={ed.setOpen} row={ed.editing} />
      <TabIntro text="Leave deferred from the previous year. Once approved, the deferred days are added to the following year's leave." onAdd={canEdit ? ed.add : undefined} addLabel="New deferment" />
      <StatusTabs value={status ?? ''} onChange={(s) => (setPage(1), onStatus(s || undefined))} options={DEFER_STATUS} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
        <YearSwitch label="Deferred from" value={year} onChange={(y) => (setYear(y), setPage(1))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          { header: 'Deferred from', cell: (r) => <span className="font-mono text-sm">{r.year} <span className="text-xs text-muted-foreground">→ {Number(r.year) + 1}</span></span> },
          { header: 'Days', align: 'right', cell: (r) => <span className="font-mono text-base font-bold text-primary">{r.weight}</span> },
          { header: 'Reason', cell: (r) => <span className="block max-w-64 text-sm">{r.reason}</span> },
          {
            header: 'Status',
            cell: (r) =>
              Number(r.approvedStatus) === 1 ? <Badge tone="success">Approved</Badge> : Number(r.approvedStatus) === 2 ? <Badge tone="danger">Rejected</Badge> : <Badge tone="warning">Awaiting</Badge>,
          },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Approve', icon: CheckCircle2, hidden: !canEdit || Number(r.approvedStatus) === 1, onSelect: () => decide.mutate({ id: r.id, d: 'approve' }) },
                  { label: 'Reject', icon: XCircle, hidden: !canEdit || Number(r.approvedStatus) === 2, onSelect: () => decide.mutate({ id: r.id, d: 'reject' }) },
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => ed.edit(r) },
                  'separator',
                  { label: 'Remove', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: 'Remove this deferment?', danger: true, confirmLabel: 'Remove', onConfirm: () => remove.mutateAsync(r.id) }) },
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

function DeferDialog({ open, onOpenChange, row }: { open: boolean; onOpenChange: (o: boolean) => void; row: Row | null }) {
  type In = z.input<typeof leaveDeferSchema>
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(leaveDeferSchema) })
  useEffect(() => {
    if (open) (setError(null), reset({ staffNo: row?.staffNo ?? '', weight: row?.weight ?? '', year: row?.year ?? thisYear - 1, reason: row?.reason ?? '' }))
  }, [open, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/leave/deferments/${row.id}`, v) : api.post('/leave/deferments', v)), {
    invalidate: ['leave-deferments'],
    success: 'Deferment saved',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={row ? 'Edit deferment' : 'New leave deferment'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Staff number" required error={errors.staffNo?.message} className="sm:col-span-2">
        <Controller control={control} name="staffNo" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />} />
      </Field>
      <Field label="Days deferred" required error={errors.weight?.message}>
        <Input type="number" min={0} {...register('weight')} />
      </Field>
      <Field label="Deferred from year" required error={errors.year?.message} hint="Counts towards the next year once approved">
        <Input type="number" {...register('year')} />
      </Field>
      <Field label="Reason" required error={errors.reason?.message} className="sm:col-span-2">
        <Textarea rows={3} {...register('reason')} />
      </Field>
    </FormDialog>
  )
}
