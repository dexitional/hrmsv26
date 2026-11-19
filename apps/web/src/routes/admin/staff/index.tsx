import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { Eye, FileClock, Pencil, Plus, Printer, UserCheck, UserX, Users } from 'lucide-react'
import { cn } from '@hrms/ui'
import { LEGACY_STAFF_STATUSES, STAFF_GROUPS, STAFF_STATUSES } from '@hrms/db/types'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { num } from '#/lib/format'
import { GROUP_LABELS, statusLabel } from '#/lib/labels'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Combobox } from '#/components/admin/combobox'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { useJobs, useUnits } from '#/components/admin/lookups'
import { AgeBadge, EmptyState, PageHeader, StaffCell, StatusBadge } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'

const search = z.object({
  tab: z.enum(['active', 'inactive', 'contract']).optional(),
  unit: z.coerce.number().optional(),
  job: z.coerce.number().optional(),
  group: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/admin/staff/')({ validateSearch: search, component: StaffPage })

type Row = Record<string, any> & { staffNo: number }
type Data = Page<Row> & { counts: Array<{ status: string; count: number }> }

const TABS = [
  { value: 'active', label: 'Active', icon: UserCheck, hint: 'Permanent, temporal, casual, part-time' },
  { value: 'contract', label: 'Contract', icon: FileClock, hint: 'Contract and post-retirement' },
  { value: 'inactive', label: 'Inactive', icon: UserX, hint: 'Retired, deceased, resigned…' },
] as const

function StaffPage() {
  const s = Route.useSearch()
  const tab = s.tab ?? 'active'
  const navigate = useNavigate({ from: Route.fullPath })
  const set = (patch: Partial<z.infer<typeof search>>) => (setPage(1), navigate({ search: (prev) => ({ ...prev, ...patch }) }))
  const canEdit = useCan('staff', 'edit')
  const units = useUnits()
  const jobs = useJobs()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['staff', { ...s, tab, q, page }],
    queryFn: () => api.get<Data>('/staff', { ...s, tab, q, page }),
    placeholderData: keepPreviousData,
  })
  const countOf = (t: string) => data?.counts.find((c) => c.status === t)?.count ?? 0
  return (
    <>
      <PageHeader
        eyebrow="Modules"
        title="Staff"
        description="Every staff member of the University, with their current designation, unit and contact details."
        actions={
          canEdit && (
            <Button asChild>
              <Link to="/admin/staff/new">
                <Plus /> New staff
              </Link>
            </Button>
          )
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => set({ tab: t.value === 'active' ? undefined : t.value, status: undefined })}
            className={cn(
              'lift flex items-center gap-3 rounded-2xl border p-4 text-left',
              tab === t.value ? 'border-primary bg-primary text-white' : 'bg-white',
            )}
          >
            <span className={cn('flex size-10 items-center justify-center rounded-xl', tab === t.value ? 'bg-white/10' : 'bg-secondary-light text-secondary-light-foreground')}>
              <t.icon className="size-5" />
            </span>
            <span>
              <span className={cn('eyebrow block', tab === t.value && 'text-white/60')}>{t.label}</span>
              <span className="block text-2xl font-extrabold tabular-nums">{num(countOf(t.value))}</span>
              <span className={cn('text-xs', tab === t.value ? 'text-white/65' : 'text-muted-foreground')}>{t.hint}</span>
            </span>
          </button>
        ))}
      </div>
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Name, staff no., email or phone…" />
        <label className="flex w-64 flex-col gap-1">
          <span className="pl-3 text-xs font-medium text-muted-foreground">Unit</span>
          <Combobox options={units.data} loading={units.isLoading} value={s.unit} onChange={(v) => set({ unit: v ?? undefined })} placeholder="All units" />
        </label>
        <label className="flex w-64 flex-col gap-1">
          <span className="pl-3 text-xs font-medium text-muted-foreground">Designation</span>
          <Combobox options={jobs.data} loading={jobs.isLoading} value={s.job} onChange={(v) => set({ job: v ?? undefined })} placeholder="All designations" />
        </label>
        <FilterSelect label="Category" value={s.group ?? ''} onChange={(v) => set({ group: v || undefined })} options={STAFF_GROUPS.map((g) => ({ value: g, label: GROUP_LABELS[g]! }))} />
        <FilterSelect label="Gender" value={s.gender ?? ''} onChange={(v) => set({ gender: v || undefined })} options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]} />
        <FilterSelect
          label="Status"
          value={s.status ?? ''}
          onChange={(v) => set({ status: v || undefined })}
          options={[...STAFF_STATUSES, ...LEGACY_STAFF_STATUSES].map((st) => ({ value: st, label: statusLabel(st) }))}
        />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        rowLink={(r) => ({ to: '/admin/staff/$staffNo', params: { staffNo: String(r.staffNo) } })}
        empty={<EmptyState icon={Users} title="No staff match these filters" />}
        columns={[
          { header: 'Staff', cell: (r) => <StaffCell staffNo={r.staffNo} name={r.fullName} link={false} /> },
          { header: 'Institutional email', cell: (r) => <span className="block max-w-52 truncate text-xs">{r.uccMail || '—'}</span> },
          { header: 'Designation', cell: (r) => <span className="block max-w-52 truncate text-xs font-medium text-slate-700">{r.jobTitle ?? '—'}</span> },
          { header: 'Unit', cell: (r) => <span className="block max-w-52 truncate text-xs">{r.unitName ?? '—'}</span> },
          { header: 'Phone', cell: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.phone || '—'}</span> },
          { header: 'Age', cell: (r) => <AgeBadge age={r.age} /> },
          { header: 'Category', cell: (r) => (r.staffGroup ? <Badge tone="brand" dot={false}>{r.staffGroup}</Badge> : '—') },
          { header: 'Status', cell: (r) => <StatusBadge status={r.staffStatus} /> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'View profile', icon: Eye, onSelect: () => navigate({ to: '/admin/staff/$staffNo', params: { staffNo: String(r.staffNo) } }) },
                  { label: 'Print profile', icon: Printer, onSelect: () => window.open(`/print/staff/${r.staffNo}`, '_blank') },
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => navigate({ to: '/admin/staff/$staffNo/edit', params: { staffNo: String(r.staffNo) } }) },
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
