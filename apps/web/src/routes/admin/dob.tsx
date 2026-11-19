import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarClock, History, Pencil } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date, dateTime, daysPhrase, num } from '#/lib/format'
import { dobChangeSchema } from '#/lib/schemas'
import { Badge } from '#/components/ui/badge'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { Input, Textarea } from '#/components/ui/input'
import { DataTable, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { AgeBadge, EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'

export const Route = createFileRoute('/admin/dob')({
  validateSearch: z.object({ band: z.enum(['green', 'amber', 'red']).optional(), view: z.enum(['staff', 'log']).optional() }),
  component: DobPage,
})

type Row = Record<string, any> & { staffNo: number }
type Data = Page<Row> & { counts: Array<{ status: string; count: number }> }
type In = z.input<typeof dobChangeSchema>

const BANDS = [
  { value: 'red', label: '60 and above', hint: 'Due for retirement', ring: 'border-red-200 bg-secondary-soft', dot: 'bg-destructive', text: 'text-secondary-foreground' },
  { value: 'amber', label: 'Aged 59', hint: 'Retiring within a year', ring: 'border-amber-200 bg-warning-light/50', dot: 'bg-warning', text: 'text-warning-light-foreground' },
  { value: 'green', label: 'Below 59', hint: 'Not near retirement', ring: 'border-emerald-200 bg-success-soft/40', dot: 'bg-success', text: 'text-emerald-800' },
] as const

function DobPage() {
  const { band, view = 'staff' } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const canEdit = useCan('dob', 'edit')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Row | null>(null)
  const [logFor, setLogFor] = useState<Row | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ['dob', { band, q, page }],
    queryFn: () => api.get<Data>('/dob', { band, q, page }),
    placeholderData: keepPreviousData,
    enabled: view === 'staff',
  })
  const log = useQuery({
    queryKey: ['dob-log', { page }],
    queryFn: () => api.get<Page<Row>>('/dob/log', { page }),
    enabled: view === 'log',
  })
  const countOf = (s: string) => Number(data?.counts.find((c) => c.status === s)?.count ?? 0)
  return (
    <>
      <DobDialog staff={editing} onClose={() => setEditing(null)} />
      <LogDialog staff={logFor} onClose={() => setLogFor(null)} />
      <PageHeader
        eyebrow="Utilities"
        title="Date of Birth"
        description="Active staff by age, with retirement alerts at 60. Every change to a date of birth is logged with its reason."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {BANDS.map((b) => (
          <button
            key={b.value}
            type="button"
            onClick={() => (setPage(1), navigate({ search: { band: band === b.value ? undefined : b.value, view: 'staff' } }))}
            className={cn('lift rounded-2xl border p-4 text-left', b.ring, band === b.value && 'ring-2 ring-primary ring-offset-2')}
          >
            <span className="flex items-center gap-2">
              <span className={cn('size-2.5 rounded-full', b.dot)} />
              <span className={cn('eyebrow', b.text)}>{b.label}</span>
            </span>
            <span className={cn('mt-2 block text-3xl font-extrabold tabular-nums', b.text)}>{num(countOf(b.value))}</span>
            <span className="text-xs text-muted-foreground">{b.hint}</span>
          </button>
        ))}
      </div>
      <Tabs value={view} onValueChange={(v) => (setPage(1), navigate({ search: { band, view: v as 'staff' | 'log' } }))}>
        <TabsList className="mb-4">
          <TabsTrigger value="staff">
            <CalendarClock /> Staff ages
          </TabsTrigger>
          <TabsTrigger value="log">
            <History /> Change log
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {view === 'staff' ? (
        <>
          <Toolbar>
            <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Search name or staff number…" />
            {band && (
              <button type="button" onClick={() => navigate({ search: { view: 'staff' } })} className="mb-2 text-xs font-semibold text-primary hover:underline">
                Clear age filter
              </button>
            )}
          </Toolbar>
          <DataTable
            loading={isLoading}
            rows={data?.data}
            empty={<EmptyState icon={CalendarClock} title="No staff in this band" />}
            columns={[
              { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} sub={r.jobTitle} /> },
              { header: 'Date of birth', cell: (r) => <span className="text-sm whitespace-nowrap">{date(r.dob)}</span> },
              { header: 'Age', cell: (r) => <AgeBadge age={r.age} /> },
              {
                header: 'Retirement',
                cell: (r) => (
                  <span className="text-xs whitespace-nowrap">
                    <span className="block font-medium text-slate-800">{date(r.retirementDate)}</span>
                    <span className={cn(Number(r.daysToRetirement) < 0 ? 'text-secondary-foreground' : 'text-muted-foreground')}>{daysPhrase(r.daysToRetirement)}</span>
                  </span>
                ),
              },
              { header: 'Unit', cell: (r) => <span className="block max-w-52 truncate text-xs">{r.unitName ?? '—'}</span> },
              { header: 'Changes', align: 'center', cell: (r) => (Number(r.changes) ? <Badge tone="info" dot={false}>{r.changes}</Badge> : <span className="text-muted-foreground">—</span>) },
              {
                header: '',
                align: 'right',
                cell: (r) => (
                  <RowActions
                    actions={[
                      { label: 'Change date of birth', icon: Pencil, hidden: !canEdit, onSelect: () => setEditing(r) },
                      { label: 'View change log', icon: History, onSelect: () => setLogFor(r) },
                    ]}
                  />
                ),
              },
            ]}
          />
          {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
        </>
      ) : (
        <>
          <DataTable
            loading={log.isLoading}
            rows={log.data?.data}
            empty={<EmptyState icon={History} title="No dates of birth have been changed yet" />}
            columns={[
              { header: 'When', cell: (r) => <span className="text-xs whitespace-nowrap text-muted-foreground">{dateTime(r.createdAt)}</span> },
              { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} /> },
              { header: 'Change', cell: (r) => <span className="text-sm whitespace-nowrap"><s className="text-muted-foreground">{date(r.oldDob)}</s> → <b>{date(r.newDob)}</b></span> },
              { header: 'Reason', cell: (r) => <span className="block max-w-72 text-sm">{r.reason}</span> },
              { header: 'By', cell: (r) => <span className="text-xs">{r.changedByName ?? '—'}</span> },
            ]}
          />
          {log.data && <Pagination page={page} pageSize={log.data.pageSize} total={log.data.total} onChange={setPage} />}
        </>
      )}
    </>
  )
}

function DobDialog({ staff, onClose }: { staff: Row | null; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<In>({ resolver: zodResolver(dobChangeSchema) })
  useEffect(() => {
    if (staff) (setError(null), reset({ dob: staff.dob ?? '', reason: '', evidenceUrl: '' }))
  }, [staff, reset])
  const save = useSave((v: In) => api.put(`/dob/${staff!.staffNo}`, v), {
    invalidate: ['dob', 'dob-log', 'staff'],
    success: 'Date of birth changed and logged',
    onDone: onClose,
    onError: setError,
  })
  return (
    <FormDialog
      open={Boolean(staff)}
      onOpenChange={(o) => !o && onClose()}
      title="Change date of birth"
      description={staff ? `${staff.fullName} (${staff.staffNo}) — currently ${date(staff.dob)}` : undefined}
      onSubmit={handleSubmit((v) => save.mutate(v as In))}
      busy={save.isPending}
      error={error}
      submitLabel="Save and log change"
    >
      <Field label="New date of birth" required error={errors.dob?.message}>
        <Input type="date" {...register('dob')} />
      </Field>
      <div />
      <Field label="Reason for the change" required error={errors.reason?.message} className="sm:col-span-2" hint="e.g. Correction from birth certificate submitted on …">
        <Textarea rows={3} {...register('reason')} />
      </Field>
    </FormDialog>
  )
}

function LogDialog({ staff, onClose }: { staff: Row | null; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['dob-log', staff?.staffNo],
    queryFn: () => api.get<{ log: Array<Row> }>(`/dob/${staff!.staffNo}/log`),
    enabled: Boolean(staff),
  })
  return (
    <Dialog open={Boolean(staff)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title="Date of birth changes" description={staff ? `${staff.fullName} (${staff.staffNo})` : undefined}>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data?.log.length ? (
          <p className="text-sm text-muted-foreground">No changes recorded.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {data.log.map((l) => (
              <li key={l.id}>
                <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-white bg-primary" />
                <p className="text-sm">
                  <s className="text-muted-foreground">{date(l.oldDob)}</s> → <b>{date(l.newDob)}</b>
                </p>
                <p className="text-sm text-slate-700">{l.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {l.changedByName ?? 'Unknown'} · {dateTime(l.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  )
}
