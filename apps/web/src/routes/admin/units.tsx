import { useCallback, useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Building2, GitMerge, Pencil, Plus, Printer, Trash2, Users } from 'lucide-react'
import { UNIT_LEVELS, UNIT_TYPES } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { num } from '#/lib/format'
import { UNIT_LEVEL_LABELS } from '#/lib/labels'
import { unitSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { StatCard } from '#/components/admin/charts'
import { Combobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { MergeDialog } from '#/components/admin/merge-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'
import { useLocalTable } from '#/components/admin/use-local-table'

export const Route = createFileRoute('/admin/units')({ component: UnitsPage })

type Row = Record<string, any> & { id: number }
type In = z.input<typeof unitSchema>

function Person({ no, name }: { no: number | null; name: string | null }) {
  if (!no) return <span className="text-muted-foreground">—</span>
  return (
    <Link to="/admin/staff/$staffNo" params={{ staffNo: String(no) }} className="block max-w-48 hover:text-primary">
      <span className="block truncate text-sm font-medium">{name ?? 'Unknown'}</span>
      <span className="font-mono text-[0.7rem] text-muted-foreground">{no}</span>
    </Link>
  )
}

function UnitsPage() {
  const canEdit = useCan('units', 'edit')
  const canManage = useCan('units', 'manage')
  const { confirm, dialog } = useConfirm()
  const [type, setType] = useState('')
  const [level, setLevel] = useState('')
  const [status, setStatus] = useState('1')
  const [editing, setEditing] = useState<Row | null>(null)
  const [open, setOpen] = useState(false)
  const [merging, setMerging] = useState<Row | null>(null)
  const [mergeError, setMergeError] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['units'], queryFn: () => api.get<Array<Row>>('/units') })
  const match = useCallback(
    (r: Row, q: string) =>
      (!q ||
        `${r.longName} ${r.shortName ?? ''} ${r.id} ${r.headName ?? ''} ${r.parentName ?? ''}`.toLowerCase().includes(q)) &&
      (!type || r.type === type) &&
      (!level || r.level === level) &&
      (!status || r.active === status),
    [type, level, status],
  )
  const table = useLocalTable(data, match)
  const remove = useSave((id: number) => api.delete(`/units/${id}`), { invalidate: ['units', 'lookups'], success: 'Unit deleted' })
  const merge = useSave(
    ({ id, masterId }: { id: number; masterId: number }) =>
      api.post<{ moved: { staff: number; subUnits: number } }>(`/units/${id}/merge`, { masterId }),
    {
      invalidate: ['units', 'lookups', 'staff'],
      success: (r) => `Merged — ${r.moved.staff} staff and ${r.moved.subUnits} sub-units moved`,
      onDone: () => setMerging(null),
      onError: setMergeError,
    },
  )
  const active = (data ?? []).filter((u) => u.active === '1')
  return (
    <>
      {dialog}
      <UnitDialog open={open} onOpenChange={setOpen} unit={editing} />
      <MergeDialog
        open={Boolean(merging)}
        onOpenChange={(o) => !o && setMerging(null)}
        source={merging ? { id: merging.id, name: merging.longName } : null}
        noun="unit"
        candidates={(data ?? []).map((u) => ({ id: u.id, name: u.longName, active: u.active === '1' }))}
        consequences="Its staff, current appointments, sub-units, positions and NSS personnel move to the master unit, and this unit is deactivated. Past transfers keep their history."
        busy={merge.isPending}
        error={mergeError}
        onMerge={(masterId) => (setMergeError(null), merge.mutate({ id: merging!.id, masterId }))}
      />
      <PageHeader
        eyebrow="Utilities"
        title="Units & Offices"
        description="Colleges, faculties, departments, sections and offices, with their parent unit, head and sub-head."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/print/units" search={{ status, type }} target="_blank">
                <Printer /> Print list
              </Link>
            </Button>
            {canEdit && (
              <Button onClick={() => (setEditing(null), setOpen(true))}>
                <Plus /> New unit
              </Button>
            )}
          </>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="Active units" value={num(active.length)} icon={Building2} accent />
        <StatCard label="Academic" value={num(active.filter((u) => u.type === 'ACADEMIC').length)} icon={Building2} />
        <StatCard label="Non-academic" value={num(active.filter((u) => u.type === 'NON-ACADEMIC').length)} icon={Building2} />
        <StatCard label="Without a head" value={num(active.filter((u) => !u.unitHead).length)} icon={Users} />
      </div>
      <Toolbar>
        <SearchInput value={table.q} onChange={table.setQ} placeholder="Search name, ID or head…" />
        <FilterSelect label="Type" value={type} onChange={(v) => (setType(v), table.reset())} options={UNIT_TYPES.map((t) => ({ value: t, label: t === 'ACADEMIC' ? 'Academic' : 'Non-academic' }))} />
        <FilterSelect label="Level" value={level} onChange={(v) => (setLevel(v), table.reset())} options={UNIT_LEVELS.map((l) => ({ value: l, label: UNIT_LEVEL_LABELS[l]! }))} />
        <FilterSelect label="Status" value={status} onChange={(v) => (setStatus(v), table.reset())} options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive / merged' }]} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={table.rows}
        empty={<EmptyState icon={Building2} title="No units match" />}
        columns={[
          { header: 'ID', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
          {
            header: 'Unit',
            cell: (r) => (
              <span className="block max-w-72">
                <span className="block text-[0.8rem] font-semibold text-slate-800">{r.longName}</span>
                <span className="text-xs text-muted-foreground">
                  {[r.shortName, r.level && UNIT_LEVEL_LABELS[r.level]].filter(Boolean).join(' · ')}
                </span>
              </span>
            ),
          },
          { header: 'Parent unit', cell: (r) => <span className="block max-w-52 truncate text-xs">{r.parentName ?? '—'}</span> },
          { header: 'Head', cell: (r) => <Person no={r.unitHead} name={r.headName} /> },
          { header: 'Sub-head', cell: (r) => <Person no={r.unitSubhead} name={r.subheadName} /> },
          { header: 'Staff', align: 'right', cell: (r) => <span className="font-mono text-xs">{num(r.memberCount)}</span> },
          {
            header: 'Status',
            cell: (r) =>
              r.mergedInto ? <Badge tone="warning">Merged → {r.mergedInto}</Badge> : r.active === '1' ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>,
          },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => (setEditing(r), setOpen(true)) },
                  { label: 'Unit members list', icon: Users, onSelect: () => window.open(`/print/unit/${r.id}`, '_blank') },
                  'separator',
                  { label: 'Merge into…', icon: GitMerge, hidden: !canManage || Boolean(r.mergedInto), onSelect: () => (setMergeError(null), setMerging(r)) },
                  {
                    label: 'Delete',
                    icon: Trash2,
                    danger: true,
                    hidden: !canManage,
                    onSelect: () =>
                      confirm({ title: `Delete ${r.longName}?`, danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }),
                  },
                ]}
              />
            ),
          },
        ]}
      />
      <Pagination page={table.page} pageSize={table.pageSize} total={table.total} onChange={table.setPage} />
    </>
  )
}

function UnitDialog({ open, onOpenChange, unit }: { open: boolean; onOpenChange: (o: boolean) => void; unit: Row | null }) {
  const [error, setError] = useState<string | null>(null)
  const units = useQuery({ queryKey: ['lookups', 'units'], queryFn: () => api.get<Array<any>>('/lookups/units'), staleTime: 300_000 })
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(unitSchema) })
  useEffect(() => {
    if (!open) return
    setError(null)
    reset({
      longName: unit?.longName ?? '',
      shortName: unit?.shortName ?? '',
      unitCode: unit?.unitCode ?? '',
      type: unit?.type ?? '',
      level: unit?.level ?? '',
      parentId: unit && unit.parentId !== unit.id ? unit.parentId : '',
      unitHead: unit?.unitHead ?? '',
      unitSubhead: unit?.unitSubhead ?? '',
      location: unit?.location ?? '',
      active: unit ? unit.active === '1' : true,
    })
  }, [open, unit, reset])
  const save = useSave((v: In) => (unit ? api.put(`/units/${unit.id}`, v) : api.post('/units', v)), {
    invalidate: ['units', 'lookups'],
    success: unit ? 'Unit updated' : 'Unit added',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog wide open={open} onOpenChange={onOpenChange} title={unit ? `Edit unit #${unit.id}` : 'New unit'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Full name" required error={errors.longName?.message} className="sm:col-span-2">
        <Input {...register('longName')} />
      </Field>
      <Field label="Short name">
        <Input {...register('shortName')} className="uppercase" />
      </Field>
      <Field label="Unit code" hint="Code used by other UCC systems">
        <Input {...register('unitCode')} />
      </Field>
      <Field label="Type">
        <NativeSelect {...register('type')}>
          <option value="">—</option>
          <option value="ACADEMIC">Academic</option>
          <option value="NON-ACADEMIC">Non-academic</option>
        </NativeSelect>
      </Field>
      <Field label="Level">
        <NativeSelect {...register('level')}>
          <option value="">—</option>
          {UNIT_LEVELS.map((l) => (
            <option key={l} value={l}>{UNIT_LEVEL_LABELS[l]}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Parent unit" hint="Leave empty for a top-level college or directorate" className="sm:col-span-2">
        <Controller control={control} name="parentId" render={({ field }) => <Combobox options={units.data?.filter((u) => u.value !== unit?.id)} loading={units.isLoading} value={field.value as number} onChange={field.onChange} placeholder="Choose parent unit…" />} />
      </Field>
      <Field label="Head of unit" error={errors.unitHead?.message}>
        <Controller control={control} name="unitHead" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />} />
      </Field>
      <Field label="Sub-head of unit" error={errors.unitSubhead?.message}>
        <Controller control={control} name="unitSubhead" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />} />
      </Field>
      <Field label="Location" className="sm:col-span-2">
        <Input {...register('location')} placeholder="e.g. Main Administration Block, Ground Floor" />
      </Field>
      <label className="flex items-center gap-3 sm:col-span-2">
        <Controller control={control} name="active" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
        <span className="text-sm font-medium">Active</span>
      </label>
    </FormDialog>
  )
}
