import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftRight, ArrowRight, CheckCircle2, History, Inbox, Pencil, Plus, Printer, Trash2, XCircle } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date, today } from '#/lib/format'
import { transferDecisionSchema, transferSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input, Textarea } from '#/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Combobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useUnits } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StaffCell, StatusBadge } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StaffField } from '#/components/admin/staff-field'
import { StaffPrompt } from '#/components/admin/staff-prompt'
import { StatusTabs } from '#/components/admin/status-tabs'

export const Route = createFileRoute('/admin/transfers')({
  validateSearch: z.object({ tab: z.enum(['effective', 'requests']).optional(), status: z.string().optional() }),
  component: TransfersPage,
})

type Row = Record<string, any> & { id: number }

function TransfersPage() {
  const { tab = 'effective', status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  return (
    <>
      <PageHeader eyebrow="Modules" title="Transfers" description="Staff moved between units, and transfer requests from staff awaiting a decision." />
      <Tabs value={tab} onValueChange={(t) => navigate({ search: { tab: t as 'effective' } })}>
        <TabsList className="mb-5">
          <TabsTrigger value="effective"><ArrowLeftRight /> Effective transfers</TabsTrigger>
          <TabsTrigger value="requests"><Inbox /> Transfer requests</TabsTrigger>
        </TabsList>
        <TabsContent value="effective"><EffectiveTransfers /></TabsContent>
        <TabsContent value="requests">
          <TransferRequests status={status} onStatus={(s) => navigate({ search: { tab: 'requests', status: s } })} />
        </TabsContent>
      </Tabs>
    </>
  )
}

function EffectiveTransfers() {
  const canEdit = useCan('transfers', 'edit')
  const canManage = useCan('transfers', 'manage')
  const { confirm, dialog } = useConfirm()
  const [q, setQ] = useState('')
  const [year, setYear] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<{ row: Row | null } | null>(null)
  const [history, setHistory] = useState(false)
  const years = useQuery({ queryKey: ['transfer-years'], queryFn: () => api.get<Array<number>>('/transfers/years'), staleTime: 300_000 })
  const { data, isLoading } = useQuery({
    queryKey: ['transfers', { q, year, page }],
    queryFn: () => api.get<Page<Row>>('/transfers', { q, year, page }),
    placeholderData: keepPreviousData,
  })
  const remove = useSave((id: number) => api.delete(`/transfers/${id}`), { invalidate: ['transfers'], success: 'Transfer deleted' })
  return (
    <>
      {dialog}
      <TransferDialog value={form} onClose={() => setForm(null)} />
      <StaffPrompt
        open={history}
        onOpenChange={setHistory}
        title="Transfer history"
        description="A printable sheet of every transfer of one staff member."
        submitLabel="Open transfer sheet"
        onSubmit={(s) => (setHistory(false), window.open(`/print/transfers/${s.staffNo}`, '_blank'))}
      />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, staff number or unit…" />
        <FilterSelect label="Year" value={year} onChange={(v) => (setYear(v), setPage(1))} options={(years.data ?? []).map((y) => ({ value: String(y), label: String(y) }))} />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setHistory(true)}>
            <History /> Transfer history
          </Button>
          {canEdit && (
            <Button onClick={() => setForm({ row: null })}>
              <Plus /> New transfer
            </Button>
          )}
        </div>
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={ArrowLeftRight} title="No transfers found" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
          { header: 'Transfer date', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.transferDate)}</span> },
          {
            header: 'From → To',
            cell: (r) => (
              <span className="flex max-w-96 items-center gap-2 text-xs">
                <span className="truncate text-muted-foreground">{r.fromUnitName ?? '—'}</span>
                <ArrowRight className="size-3.5 shrink-0 text-secondary-foreground" />
                <span className="truncate font-semibold text-slate-800">{r.toUnitName ?? '—'}</span>
              </span>
            ),
          },
          { header: 'Designation', cell: (r) => <span className="block max-w-44 truncate text-xs">{r.jobTitle ?? '—'}</span> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'Print transfer sheet', icon: Printer, onSelect: () => window.open(`/print/transfers/${r.staffNo}`, '_blank') },
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => setForm({ row: r }) },
                  'separator',
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: 'Delete this transfer record?', description: 'The staff member stays in their current unit.', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
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

function TransferDialog({ value, onClose }: { value: { row: Row | null } | null; onClose: () => void }) {
  type In = z.input<typeof transferSchema>
  const [error, setError] = useState<string | null>(null)
  const units = useUnits()
  const allUnits = useQuery({ queryKey: ['lookups', 'units-all'], queryFn: () => api.get<Array<any>>('/lookups/units', { all: 1 }), staleTime: 300_000 })
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<In>({ resolver: zodResolver(transferSchema) })
  const row = value?.row ?? null
  useEffect(() => {
    if (!value) return
    setError(null)
    reset({
      staffNo: row?.staffNo ?? '',
      transferDate: row?.transferDate ?? today(),
      fromUnit: row?.fromUnit ?? '',
      toUnit: row?.toUnit ?? '',
      reason: row?.reason ?? '',
      remark: row?.remark ?? '',
      approvedDate: row?.approvedDate ?? '',
      approvedBy: row?.approvedBy || '',
      effectNow: !row,
    })
  }, [value, row, reset])
  const save = useSave((v: In) => (row ? api.put(`/transfers/${row.id}`, v) : api.post('/transfers', v)), {
    invalidate: ['transfers', 'staff', 'units'],
    success: () => (row ? 'Transfer updated' : watch('effectNow') ? 'Transfer recorded — staff unit changed' : 'Transfer added to history'),
    onDone: onClose,
    onError: setError,
  })
  const effectNow = watch('effectNow')
  return (
    <FormDialog wide open={Boolean(value)} onOpenChange={(o) => !o && onClose()} title={row ? 'Edit transfer' : 'New transfer'} onSubmit={handleSubmit((v) => save.mutate(v as In))} busy={save.isPending} error={error}>
      {!row && (
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
          {[
            { v: true, title: 'New transfer', text: "Moves the staff member to the new unit as soon as it's saved." },
            { v: false, title: 'Existing transfer', text: 'Records a past transfer in their history only.' },
          ].map((o) => (
            <button
              key={String(o.v)}
              type="button"
              onClick={() => setValue('effectNow', o.v)}
              className={cn('rounded-xl border-2 p-3 text-left', effectNow === o.v ? 'border-primary bg-primary-soft' : 'border-border hover:border-border-strong')}
            >
              <span className="block text-sm font-bold text-slate-900">{o.title}</span>
              <span className="text-xs text-muted-foreground">{o.text}</span>
            </button>
          ))}
        </div>
      )}
      <Field label="Staff number" required error={errors.staffNo?.message} className="sm:col-span-2">
        <Controller
          control={control}
          name="staffNo"
          render={({ field }) => (
            <StaffField value={field.value as number} onChange={field.onChange} disabled={Boolean(row)} onResolved={(s) => s && !row && s.unitId && setValue('fromUnit', s.unitId)} />
          )}
        />
      </Field>
      <Field label="Unit transferred from" required error={errors.fromUnit?.message}>
        <Controller control={control} name="fromUnit" render={({ field }) => <Combobox options={allUnits.data} loading={allUnits.isLoading} value={field.value as number} onChange={field.onChange} invalid={Boolean(errors.fromUnit)} placeholder="Choose unit…" />} />
      </Field>
      <Field label="Unit transferred to" required error={errors.toUnit?.message}>
        <Controller control={control} name="toUnit" render={({ field }) => <Combobox options={units.data} loading={units.isLoading} value={field.value as number} onChange={field.onChange} invalid={Boolean(errors.toUnit)} placeholder="Choose unit…" />} />
      </Field>
      <Field label="Effective transfer date" required error={errors.transferDate?.message}>
        <Input type="date" {...register('transferDate')} />
      </Field>
      <div />
      <Field label="Reason for transfer" required error={errors.reason?.message} className="sm:col-span-2">
        <Textarea rows={2} {...register('reason')} />
      </Field>
      <Field label="Transfer remarks / note" className="sm:col-span-2">
        <Textarea rows={2} {...register('remark')} />
      </Field>
      <Field label="Approved on (letter date)" error={errors.approvedDate?.message}>
        <Input type="date" {...register('approvedDate')} />
      </Field>
      <Field label="Approved by (staff number)" error={errors.approvedBy?.message}>
        <Controller control={control} name="approvedBy" render={({ field }) => <StaffField value={field.value as number} onChange={field.onChange} />} />
      </Field>
      {row && (
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" {...register('effectNow')} className="size-4 accent-[var(--primary)]" /> Also move the staff member to the "to" unit now
        </label>
      )}
    </FormDialog>
  )
}

const REQUEST_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

function TransferRequests({ status, onStatus }: { status?: string; onStatus: (s?: string) => void }) {
  const canEdit = useCan('transfers', 'edit')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [deciding, setDeciding] = useState<{ row: Row; approve: boolean } | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['transfer-requests', { status, q, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/transfers/requests/list', { status, q, page }),
    placeholderData: keepPreviousData,
  })
  return (
    <>
      <DecisionDialog value={deciding} onClose={() => setDeciding(null)} />
      <StatusTabs value={status ?? ''} onChange={(s) => (setPage(1), onStatus(s || undefined))} options={REQUEST_STATUSES} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name or staff number…" />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={Inbox} title="No transfer requests" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /> },
          { header: 'Reason', cell: (r) => <span className="line-clamp-2 min-w-52 max-w-72 text-xs" title={r.reason}>{r.reason}</span> },
          {
            header: 'Profile',
            cell: (r) => (
              <Link to="/admin/staff/$staffNo" params={{ staffNo: String(r.staffNo) }} className="text-xs font-semibold text-primary hover:underline">
                View profile
              </Link>
            ),
          },
          {
            header: 'Current → Aspired unit',
            cell: (r) => (
              <span className="block max-w-72 text-xs">
                <span className="block truncate text-muted-foreground">{r.currentUnitName ?? '—'}</span>
                <span className="block truncate font-semibold text-slate-800">→ {r.toUnitName ?? '—'}</span>
              </span>
            ),
          },
          { header: 'Applied', cell: (r) => <span className="text-xs whitespace-nowrap">{date(r.appliedDate)}</span> },
          { header: 'Status', cell: (r) => <StatusBadge status={r.transferStatus} /> },
          {
            header: '',
            align: 'right',
            cell: (r) =>
              canEdit && r.transferStatus === 'PENDING' ? (
                <span className="flex justify-end gap-1.5">
                  <Button size="sm" onClick={() => setDeciding({ row: r, approve: true })}>
                    <CheckCircle2 /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeciding({ row: r, approve: false })}>
                    <XCircle /> Reject
                  </Button>
                </span>
              ) : null,
          },
        ]}
      />
      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}

function DecisionDialog({ value, onClose }: { value: { row: Row; approve: boolean } | null; onClose: () => void }) {
  type In = z.input<typeof transferDecisionSchema>
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(transferDecisionSchema) })
  useEffect(() => {
    if (value) (setError(null), reset({ transferDate: value.row.startDate ?? today(), remark: '' }))
  }, [value, reset])
  const approve = value?.approve
  const save = useSave((v: In) => api.post(`/transfers/requests/${value!.row.id}/${approve ? 'approve' : 'reject'}`, v), {
    invalidate: ['transfer-requests', 'transfers', 'staff'],
    success: approve ? 'Request approved — staff transferred' : 'Request rejected',
    onDone: onClose,
    onError: setError,
  })
  return (
    <FormDialog
      open={Boolean(value)}
      onOpenChange={(o) => !o && onClose()}
      title={approve ? 'Approve transfer request' : 'Reject transfer request'}
      description={value ? `${value.row.fullName}: ${value.row.currentUnitName ?? '—'} → ${value.row.toUnitName ?? '—'}` : undefined}
      submitLabel={approve ? 'Approve and transfer' : 'Reject request'}
      onSubmit={handleSubmit((v) => save.mutate(v as In))}
      busy={save.isPending}
      error={error}
    >
      {approve && (
        <Field label="Effective transfer date" error={errors.transferDate?.message}>
          <Input type="date" {...register('transferDate')} />
        </Field>
      )}
      <Field label="Remark" className="sm:col-span-2">
        <Textarea rows={3} {...register('remark')} />
      </Field>
    </FormDialog>
  )
}
