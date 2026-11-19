import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { BarChart3, Gavel, Pencil, Plus, Trash2 } from 'lucide-react'
import { DISCIPLINARY_ACTIONS } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date, today } from '#/lib/format'
import { statusLabel } from '#/lib/labels'
import { disciplinarySchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input, NativeSelect, Textarea } from '#/components/ui/input'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StaffCell, StatusBadge } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'
import { StaffPrompt } from '#/components/admin/staff-prompt'
import { StatusTabs } from '#/components/admin/status-tabs'

export const Route = createFileRoute('/admin/disciplinary')({ component: DisciplinaryPage })

type Row = Record<string, any> & { id: number }
type In = z.input<typeof disciplinarySchema>
const thisYear = new Date().getFullYear()

function DisciplinaryPage() {
  const canEdit = useCan('disciplinary', 'edit')
  const canManage = useCan('disciplinary', 'manage')
  const { confirm, dialog } = useConfirm()
  const [action, setAction] = useState('')
  const [year, setYear] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const [stats, setStats] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['disciplinary', { action, year, q, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/disciplinary', { action, year, q, page }),
    placeholderData: keepPreviousData,
  })
  const remove = useSave((id: number) => api.delete(`/disciplinary/${id}`), { invalidate: ['disciplinary'], success: 'Record deleted' })
  return (
    <>
      {dialog}
      <DisciplinaryDialog value={form} onClose={() => setForm(null)} />
      <StaffPrompt
        open={stats}
        onOpenChange={setStats}
        title="Disciplinary statistics"
        description="A printable record of every disciplinary action against one staff member."
        submitLabel="Open record"
        onSubmit={(s) => (setStats(false), window.open(`/print/disciplinary/${s.staffNo}`, '_blank'))}
      />
      <PageHeader
        eyebrow="Modules"
        title="Staff Disciplinary"
        description="Warnings, suspensions, interdictions, dismissals and terminations issued to staff."
        actions={
          <>
            <Button variant="outline" onClick={() => setStats(true)}>
              <BarChart3 /> Staff statistics
            </Button>
            {canEdit && (
              <Button onClick={() => setForm({ row: null })}>
                <Plus /> New disciplinary action
              </Button>
            )}
          </>
        }
      />
      <StatusTabs value={action} onChange={(v) => (setAction(v), setPage(1))} options={DISCIPLINARY_ACTIONS.map((a) => ({ value: a, label: statusLabel(a) }))} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, staff number or reason…" />
        <FilterSelect label="Year issued" value={year} onChange={(v) => (setYear(v), setPage(1))} options={Array.from({ length: 10 }, (_, i) => String(thisYear - i)).map((y) => ({ value: y, label: y }))} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={Gavel} title="No disciplinary records" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          {
            header: 'Designation & unit',
            cell: (r) => (
              <span className="block max-w-56">
                <span className="block truncate text-xs font-medium text-slate-800">{r.jobTitle ?? '—'}</span>
                <span className="block truncate text-[0.7rem] text-muted-foreground">{r.unitName ?? '—'}</span>
              </span>
            ),
          },
          { header: 'Action taken', cell: (r) => <StatusBadge status={r.actionType} /> },
          { header: 'Date issued', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.issueDate)}</span> },
          { header: 'Reason', cell: (r) => <span className="line-clamp-2 min-w-48 max-w-96 text-xs" title={r.reason}>{r.reason}</span> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Printable statistics', icon: BarChart3, onSelect: () => window.open(`/print/disciplinary/${r.staffNo}`, '_blank') },
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ row: r }) },
                  'separator',
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: 'Delete this disciplinary record?', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
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

function DisciplinaryDialog({ value, onClose }: { value: { row: Row | null } | null; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(disciplinarySchema) })
  const row = value?.row ?? null
  useEffect(() => {
    if (value) (setError(null), reset({ staffNo: row?.staffNo ?? '', issueDate: row?.issueDate ?? today(), reason: row?.reason ?? '', actionType: row?.actionType ?? '', remark: row?.remark ?? '' } as In))
  }, [value, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/disciplinary/${row.id}`, v) : api.post('/disciplinary', v)), {
    invalidate: ['disciplinary'],
    success: 'Disciplinary record saved',
    onDone: onClose,
    onError: setError,
  })
  return (
    <FormDialog wide open={Boolean(value)} onOpenChange={(o) => !o && onClose()} title={row ? 'Edit disciplinary action' : 'New disciplinary action'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      <Field label="Staff number" required error={errors.staffNo?.message} className="sm:col-span-2">
        <Controller control={control} name="staffNo" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} disabled={Boolean(row)} />} />
      </Field>
      <Field label="Issued date" required error={errors.issueDate?.message}>
        <Input type="date" {...register('issueDate')} />
      </Field>
      <Field label="Action type" required error={errors.actionType?.message}>
        <NativeSelect {...register('actionType')}>
          <option value="">Choose…</option>
          {DISCIPLINARY_ACTIONS.map((a) => (
            <option key={a} value={a}>{statusLabel(a)}</option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Reason" required error={errors.reason?.message} className="sm:col-span-2">
        <Textarea rows={4} {...register('reason')} />
      </Field>
      <Field label="Remark" className="sm:col-span-2">
        <Textarea rows={2} {...register('remark')} />
      </Field>
    </FormDialog>
  )
}
