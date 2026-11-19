import { useCallback, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Layers, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { SCALE_LEVELS, STAFF_GROUPS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { money, num } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { scaleSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { StatCard } from '#/components/admin/charts'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { useLocalTable } from '#/components/admin/use-local-table'

export const Route = createFileRoute('/admin/scales')({ component: ScalesPage })

type Row = Record<string, any> & { id: number }
type In = z.input<typeof scaleSchema>
const LEVEL_LABELS: Record<string, string> = { L: 'Lower', H: 'Higher', AH: 'Above higher' }

function ScalesPage() {
  const canEdit = useCan('scales', 'edit')
  const canManage = useCan('scales', 'manage')
  const { confirm, dialog } = useConfirm()
  const [group, setGroup] = useState('')
  const [level, setLevel] = useState('')
  const [editing, setEditing] = useState<Row | null>(null)
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['scales'], queryFn: () => api.get<Array<Row>>('/scales') })
  const match = useCallback(
    (r: Row, q: string) =>
      (!q || String(r.grade).toLowerCase().includes(q)) &&
      (!group || r.staffGroup === group) &&
      (!level || r.level === level),
    [group, level],
  )
  const table = useLocalTable(data, match)
  const remove = useSave((id: number) => api.delete(`/scales/${id}`), { invalidate: ['scales'], success: 'Grade deleted' })
  const grades = new Set((data ?? []).map((r) => r.grade)).size
  const assigned = (data ?? []).reduce((s, r) => s + Number(r.staffCount), 0)
  return (
    <>
      {dialog}
      <ScaleDialog open={open} onOpenChange={setOpen} scale={editing} />
      <PageHeader
        eyebrow="Utilities"
        title="Grades & Notches"
        description="The salary grades, levels and notches staff are placed on."
        actions={
          canEdit && (
            <Button onClick={() => (setEditing(null), setOpen(true))}>
              <Plus /> New grade / notch
            </Button>
          )
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Grades" value={num(grades)} icon={Layers} accent />
        <StatCard label="Grade–notch entries" value={num(data?.length ?? 0)} sub={`${num((data ?? []).filter((r) => r.active === '1').length)} active`} icon={Layers} />
        <StatCard label="Active staff placed" value={num(assigned)} icon={Users} />
      </div>
      <Toolbar>
        <SearchInput value={table.q} onChange={table.setQ} placeholder="Search grade (e.g. 23H)…" />
        <FilterSelect label="Category" value={group} onChange={(v) => (setGroup(v), table.reset())} options={STAFF_GROUPS.map((g) => ({ value: g, label: GROUP_LABELS[g]! }))} />
        <FilterSelect label="Level" value={level} onChange={(v) => (setLevel(v), table.reset())} options={SCALE_LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l]! }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={table.rows}
        empty={<EmptyState icon={Layers} title="No grades match" />}
        columns={[
          { header: 'Grade', cell: (r) => <span className="font-mono text-base font-bold text-primary">{r.grade}</span> },
          { header: 'Notch', align: 'center', cell: (r) => <span className="inline-flex size-7 items-center justify-center rounded-full bg-secondary-light font-mono text-xs font-bold text-secondary-light-foreground">{r.notch}</span> },
          { header: 'Level', cell: (r) => (r.level ? LEVEL_LABELS[r.level] : '—') },
          { header: 'Grade no.', align: 'center', cell: (r) => r.gradeNum ?? '—' },
          { header: 'Notch amount', align: 'right', cell: (r) => (Number(r.notchAmount) ? <span className="font-mono text-xs">{money(r.notchAmount)}</span> : '—') },
          { header: 'Category', cell: (r) => (r.staffGroup ? <Badge tone="brand" dot={false}>{r.staffGroup}</Badge> : '—') },
          { header: 'Staff', align: 'right', cell: (r) => <span className="font-mono text-xs">{num(r.staffCount)}</span> },
          { header: 'Status', cell: (r) => (r.active === '1' ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>) },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => (setEditing(r), setOpen(true)) },
                  {
                    label: 'Delete',
                    icon: Trash2,
                    danger: true,
                    hidden: !canManage,
                    onSelect: () =>
                      confirm({
                        title: `Delete grade ${r.grade} notch ${r.notch}?`,
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
      <Pagination page={table.page} pageSize={table.pageSize} total={table.total} onChange={table.setPage} />
    </>
  )
}

function ScaleDialog({ open, onOpenChange, scale }: { open: boolean; onOpenChange: (o: boolean) => void; scale: Row | null }) {
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(scaleSchema) })
  useEffect(() => {
    if (!open) return
    setError(null)
    reset({
      grade: scale?.grade ?? '',
      notch: scale?.notch ?? 1,
      level: scale?.level ?? '',
      gradeNum: scale?.gradeNum ?? '',
      notchAmount: scale?.notchAmount ?? 0,
      staffGroup: scale?.staffGroup ?? '',
      active: scale ? scale.active === '1' : true,
    })
  }, [open, scale, reset])
  const save = useSave((v: In) => (scale ? api.put(`/scales/${scale.id}`, v) : api.post('/scales', v)), {
    invalidate: ['scales', 'lookups'],
    success: scale ? 'Grade updated' : 'Grade added',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={scale ? 'Edit grade / notch' : 'New grade / notch'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Grade" required error={errors.grade?.message} hint="e.g. 23H, 15L, 25AL">
        <Input {...register('grade')} className="font-mono uppercase" />
      </Field>
      <Field label="Notch" required error={errors.notch?.message}>
        <Input type="number" min={1} {...register('notch')} />
      </Field>
      <Field label="Level">
        <NativeSelect {...register('level')}>
          <option value="">—</option>
          {SCALE_LEVELS.map((l) => (
            <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Grade number" hint="Orders grades from lowest to highest" error={errors.gradeNum?.message}>
        <Input type="number" {...register('gradeNum')} />
      </Field>
      <Field label="Notch amount (GHS)" error={errors.notchAmount?.message}>
        <Input type="number" step="0.01" {...register('notchAmount')} />
      </Field>
      <Field label="Staff category">
        <NativeSelect {...register('staffGroup')}>
          <option value="">Any</option>
          {STAFF_GROUPS.map((g) => (
            <option key={g} value={g}>{GROUP_LABELS[g]}</option>
          ))}
        </NativeSelect>
      </Field>
      <label className="flex items-center gap-3 sm:col-span-2">
        <Controller control={control} name="active" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
        <span className="text-sm font-medium">Active (offered on staff and elevation forms)</span>
      </label>
    </FormDialog>
  )
}
