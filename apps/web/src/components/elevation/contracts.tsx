// Senior-member contract renewals and post-retirement contracts. A contract
// expires the given number of years after its start date.
import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarX2, CircleStop, FileClock, Pencil, Plus } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { addYears, date } from '#/lib/format'
import { postRetireSchema, renewalSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input, Textarea } from '#/components/ui/input'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { DeadlineBadge, EmptyState, StaffCell } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'
import { StatusTabs } from '#/components/admin/status-tabs'

type Row = Record<string, any> & { id: number }
type Kind = 'renewals' | 'postretire'

export const CONTRACT_KINDS = {
  renewals: {
    title: 'Senior membership renewal',
    intro: 'Current contract renewals of senior members. A renewal expires its renewed years after the start date.',
    start: 'startDate',
    end: 'endDate',
    years: 'renewalPeriod',
    yearsLabel: 'Renewed years',
    schema: renewalSchema,
  },
  postretire: {
    title: 'Post-retirement contract',
    intro: 'Current contracts of staff retained after retirement. A contract expires its service years after the start date.',
    start: 'startPost',
    end: 'endPost',
    years: 'served',
    yearsLabel: 'Contract service years',
    schema: postRetireSchema,
  },
} as const

const STATUSES = [
  { value: 'running', label: 'Running' },
  { value: 'expiring', label: 'Expiring ≤ 90 days' },
  { value: 'expired', label: 'Contract expired' },
]

export function ContractsTab({ kind, status, onStatus }: { kind: Kind; status?: string; onStatus: (s?: string) => void }) {
  const k = CONTRACT_KINDS[kind]
  const canEdit = useCan('elevation', 'edit')
  const canManage = useCan('elevation', 'manage')
  const { confirm, dialog } = useConfirm()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['contracts', kind, { status, q, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>(`/elevation/${kind}`, { status, q, page }),
    placeholderData: keepPreviousData,
  })
  const close = useSave((id: number) => api.delete(`/elevation/${kind}/${id}`), { invalidate: ['contracts'], success: 'Contract closed' })
  return (
    <>
      {dialog}
      <ContractDialog kind={kind} value={form} onClose={() => setForm(null)} />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">{k.intro}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/print/contracts/${kind}?year=${new Date().getFullYear()}`, '_blank')}>
            <CalendarX2 /> Newly expired this year
          </Button>
          {canEdit && (
            <Button onClick={() => setForm({ row: null })}>
              <Plus /> New {kind === 'renewals' ? 'renewal' : 'contract'}
            </Button>
          )}
        </div>
      </div>
      <StatusTabs value={status ?? ''} onChange={(s) => (setPage(1), onStatus(s || undefined))} options={STATUSES} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={FileClock} title="No contracts here" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          { header: 'Start date', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r[k.start])}</span> },
          { header: 'Current designation', cell: (r) => <span className="block max-w-52 text-xs font-medium">{r.jobTitle ?? '—'}</span> },
          { header: kind === 'renewals' ? 'Renewal period' : 'Service years', align: 'center', cell: (r) => `${r[k.years] ?? '—'} yrs` },
          { header: 'Expiry', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.expiryDate)}</span> },
          {
            header: 'Remarks',
            cell: (r) =>
              r.daysLeft === null ? (
                <Badge>No start date</Badge>
              ) : Number(r.daysLeft) < 0 ? (
                <Badge tone="danger">Contract expired</Badge>
              ) : (
                <DeadlineBadge daysLeft={r.daysLeft} runningLabel={`${r.daysLeft} days to expiry`} />
              ),
          },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ row: r }) },
                  {
                    label: 'Close contract',
                    icon: CircleStop,
                    danger: true,
                    hidden: !canManage,
                    onSelect: () => confirm({ title: `Close ${r.fullName}'s contract?`, description: 'It leaves the current list but stays in their history.', confirmLabel: 'Close contract', danger: true, onConfirm: () => close.mutateAsync(r.id) }),
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

function ContractDialog({ kind, value, onClose }: { kind: Kind; value: { row: Row | null } | null; onClose: () => void }) {
  const k = CONTRACT_KINDS[kind]
  const [error, setError] = useState<string | null>(null)
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Record<string, any>>({ resolver: zodResolver(k.schema as any) })
  const row = value?.row ?? null
  useEffect(() => {
    if (!value) return
    setError(null)
    reset({
      staffNo: row?.staffNo ?? '',
      [k.years]: row?.[k.years] ?? (kind === 'renewals' ? 3 : 1),
      [k.start]: row?.[k.start] ?? '',
      [k.end]: row?.[k.end] ?? '',
      ...(kind === 'postretire' ? { remark: row?.remark ?? '' } : {}),
    })
  }, [value, row, k, kind, reset])
  const save = useSave((v: Record<string, any>) => (row ? api.put(`/elevation/${kind}/${row.id}`, v) : api.post(`/elevation/${kind}`, v)), {
    invalidate: ['contracts', 'staff'],
    success: `${k.title} saved`,
    onDone: onClose,
    onError: setError,
  })
  const start = watch(k.start) as string
  const years = Number(watch(k.years))
  const fill = () => start && years && setValue(k.end, addYears(start, years, true))
  const err = (name: string) => (errors[name]?.message as string | undefined) ?? undefined
  return (
    <FormDialog
      open={Boolean(value)}
      onOpenChange={(o) => !o && onClose()}
      title={`${row ? 'Edit' : 'New'} ${k.title.toLowerCase()}`}
      description={row ? undefined : 'Saving replaces any running contract of this kind for the staff member.'}
      onSubmit={handleSubmit((v) => save.mutate(v))}
      busy={save.isPending}
      error={error}
    >
      <Field label="Staff number" required error={err('staffNo')} className="sm:col-span-2">
        <Controller control={control} name="staffNo" render={({ field }) => <StaffField value={field.value} onChange={field.onChange} disabled={Boolean(row)} />} />
      </Field>
      <Field label={k.yearsLabel} required error={err(k.years)}>
        <Input type="number" min={1} max={10} {...register(k.years, { onChange: () => setTimeout(fill) })} />
      </Field>
      <div />
      <Field label="Start date" required error={err(k.start)}>
        <Input type="date" {...register(k.start, { onChange: () => setTimeout(fill) })} />
      </Field>
      <Field label="End date" required error={err(k.end)} hint="Filled from the start date and years; adjust if needed">
        <Input type="date" {...register(k.end)} />
      </Field>
      {kind === 'postretire' && (
        <Field label="Remark" className="sm:col-span-2">
          <Textarea rows={2} {...register('remark')} />
        </Field>
      )}
    </FormDialog>
  )
}
