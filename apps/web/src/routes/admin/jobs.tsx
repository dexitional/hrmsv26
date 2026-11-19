import { useCallback, useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Briefcase, GitMerge, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { STAFF_GROUPS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import { num } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { jobSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { StatCard } from '#/components/admin/charts'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { MergeDialog } from '#/components/admin/merge-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { useLocalTable } from '#/components/admin/use-local-table'

export const Route = createFileRoute('/admin/jobs')({ component: JobsPage })

type Row = Record<string, any> & { id: number }
type In = z.input<typeof jobSchema>

function JobsPage() {
  const canEdit = useCan('jobs', 'edit')
  const canManage = useCan('jobs', 'manage')
  const { confirm, dialog } = useConfirm()
  const [type, setType] = useState('')
  const [group, setGroup] = useState('')
  const [status, setStatus] = useState('1')
  const [editing, setEditing] = useState<Row | null>(null)
  const [open, setOpen] = useState(false)
  const [merging, setMerging] = useState<Row | null>(null)
  const [mergeError, setMergeError] = useState<string | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['jobs'], queryFn: () => api.get<Array<Row>>('/jobs') })
  const match = useCallback(
    (r: Row, q: string) =>
      (!q || `${r.title} ${r.id}`.toLowerCase().includes(q)) &&
      (!type || r.type === type) &&
      (!group || r.staffGroup === group) &&
      (!status || r.active === status),
    [type, group, status],
  )
  const table = useLocalTable(data, match)
  const remove = useSave((id: number) => api.delete(`/jobs/${id}`), { invalidate: ['jobs', 'lookups'], success: 'Designation deleted' })
  const merge = useSave(
    ({ id, masterId }: { id: number; masterId: number }) =>
      api.post<{ moved: { appointments: number } }>(`/jobs/${id}/merge`, { masterId }),
    {
      invalidate: ['jobs', 'lookups', 'staff'],
      success: (r) => `Merged — ${r.moved.appointments} appointment records moved`,
      onDone: () => setMerging(null),
      onError: setMergeError,
    },
  )
  const active = (data ?? []).filter((j) => j.active === '1')
  return (
    <>
      {dialog}
      <JobDialog open={open} onOpenChange={setOpen} job={editing} />
      <MergeDialog
        open={Boolean(merging)}
        onOpenChange={(o) => !o && setMerging(null)}
        source={merging ? { id: merging.id, name: merging.title } : null}
        noun="designation"
        candidates={(data ?? []).map((j) => ({ id: j.id, name: j.title, active: j.active === '1' }))}
        consequences="Every appointment, promotion and leave entitlement that uses it moves to the master designation, and this one is deactivated."
        busy={merge.isPending}
        error={mergeError}
        onMerge={(masterId) => (setMergeError(null), merge.mutate({ id: merging!.id, masterId }))}
      />
      <PageHeader
        eyebrow="Utilities"
        title="Designations"
        description="Jobs and ranks staff are appointed to, with their type, years to the next rank and how many staff hold them."
        actions={
          canEdit && (
            <Button onClick={() => (setEditing(null), setOpen(true))}>
              <Plus /> New designation
            </Button>
          )
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="Active designations" value={num(active.length)} icon={Briefcase} accent />
        <StatCard label="Academic" value={num(active.filter((j) => j.type === 'ACADEMIC').length)} icon={Briefcase} />
        <StatCard label="Non-academic" value={num(active.filter((j) => j.type === 'NON-ACADEMIC').length)} icon={Briefcase} />
        <StatCard label="Unused (no staff)" value={num(active.filter((j) => !Number(j.staffCount)).length)} icon={Users} />
      </div>
      <Toolbar>
        <SearchInput value={table.q} onChange={table.setQ} placeholder="Search title or ID…" />
        <FilterSelect label="Type" value={type} onChange={(v) => (setType(v), table.reset())} options={[{ value: 'ACADEMIC', label: 'Academic' }, { value: 'NON-ACADEMIC', label: 'Non-academic' }]} />
        <FilterSelect label="Category" value={group} onChange={(v) => (setGroup(v), table.reset())} options={STAFF_GROUPS.map((g) => ({ value: g, label: GROUP_LABELS[g]! }))} />
        <FilterSelect label="Status" value={status} onChange={(v) => (setStatus(v), table.reset())} options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive / merged' }]} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={table.rows}
        empty={<EmptyState icon={Briefcase} title="No designations match" />}
        columns={[
          { header: 'ID', cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
          { header: 'Designation', cell: (r) => <span className="block max-w-80 text-[0.8rem] font-semibold text-slate-800">{r.title}</span> },
          { header: 'Type', cell: (r) => (r.type ? <Badge tone={r.type === 'ACADEMIC' ? 'info' : 'neutral'} dot={false}>{r.type === 'ACADEMIC' ? 'Academic' : 'Non-academic'}</Badge> : '—') },
          { header: 'Category', cell: (r) => (r.staffGroup ? <Badge tone="brand" dot={false}>{r.staffGroup}</Badge> : '—') },
          { header: 'Years to next rank', align: 'center', cell: (r) => r.rankYears ?? '—' },
          { header: 'Upgradable', align: 'center', cell: (r) => (r.upgradable === '1' ? 'Yes' : '—') },
          {
            header: 'Staff',
            align: 'right',
            cell: (r) =>
              Number(r.staffCount) ? (
                <Link to="/admin/staff" search={{ job: r.id }} className="font-mono text-xs font-semibold text-primary hover:underline">
                  {num(r.staffCount)}
                </Link>
              ) : (
                <span className="font-mono text-xs text-muted-foreground">0</span>
              ),
          },
          {
            header: 'Status',
            cell: (r) => (r.mergedInto ? <Badge tone="warning">Merged → {r.mergedIntoTitle ?? r.mergedInto}</Badge> : r.active === '1' ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>),
          },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => (setEditing(r), setOpen(true)) },
                  { label: 'Merge into…', icon: GitMerge, hidden: !canManage || Boolean(r.mergedInto), onSelect: () => (setMergeError(null), setMerging(r)) },
                  {
                    label: 'Delete',
                    icon: Trash2,
                    danger: true,
                    hidden: !canManage,
                    onSelect: () => confirm({ title: `Delete ${r.title}?`, danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }),
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

function JobDialog({ open, onOpenChange, job }: { open: boolean; onOpenChange: (o: boolean) => void; job: Row | null }) {
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(jobSchema) })
  useEffect(() => {
    if (!open) return
    setError(null)
    reset({
      title: job?.title ?? '',
      type: job?.type ?? '',
      rankYears: job?.rankYears ?? '',
      staffGroup: job?.staffGroup ?? '',
      upgradable: job?.upgradable === '1',
      active: job ? job.active === '1' : true,
    })
  }, [open, job, reset])
  const save = useSave((v: In) => (job ? api.put(`/jobs/${job.id}`, v) : api.post('/jobs', v)), {
    invalidate: ['jobs', 'lookups'],
    success: job ? 'Designation updated' : 'Designation added',
    onDone: () => onOpenChange(false),
    onError: setError,
  })
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={job ? `Edit designation #${job.id}` : 'New designation'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Title" required error={errors.title?.message} className="sm:col-span-2">
        <Input {...register('title')} className="uppercase" />
      </Field>
      <Field label="Type">
        <NativeSelect {...register('type')}>
          <option value="">—</option>
          <option value="ACADEMIC">Academic</option>
          <option value="NON-ACADEMIC">Non-academic</option>
        </NativeSelect>
      </Field>
      <Field label="Staff category">
        <NativeSelect {...register('staffGroup')}>
          <option value="">—</option>
          {STAFF_GROUPS.map((g) => (
            <option key={g} value={g}>{GROUP_LABELS[g]}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Years to next rank" error={errors.rankYears?.message}>
        <Input type="number" min={0} {...register('rankYears')} />
      </Field>
      <div className="flex flex-col justify-end gap-3 pb-1">
        <label className="flex items-center gap-3">
          <Controller control={control} name="upgradable" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
          <span className="text-sm font-medium">Upgradable</span>
        </label>
        <label className="flex items-center gap-3">
          <Controller control={control} name="active" render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />} />
          <span className="text-sm font-medium">Active</span>
        </label>
      </div>
    </FormDialog>
  )
}
