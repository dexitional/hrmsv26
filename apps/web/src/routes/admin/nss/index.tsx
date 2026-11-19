import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Eye, GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { genderLabel } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Combobox } from '#/components/admin/combobox'
import { useConfirm } from '#/components/admin/confirm'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { useUnits } from '#/components/admin/lookups'
import { useSave } from '#/components/admin/mutations'
import { Avatar, EmptyState, PageHeader } from '#/components/admin/page'
import { RowActions } from '#/components/admin/row-actions'
import { useCan } from '#/components/admin/session'
import { StatusTabs } from '#/components/admin/status-tabs'

export const Route = createFileRoute('/admin/nss/')({ component: NssPage })

type Row = Record<string, any> & { id: number }

function NssPage() {
  const navigate = useNavigate()
  const canEdit = useCan('nss', 'edit')
  const canManage = useCan('nss', 'manage')
  const { confirm, dialog } = useConfirm()
  const units = useUnits()
  const [status, setStatus] = useState('current')
  const [q, setQ] = useState('')
  const [year, setYear] = useState('')
  const [unit, setUnit] = useState<number | null>(null)
  const [gender, setGender] = useState('')
  const [page, setPage] = useState(1)
  const years = useQuery({ queryKey: ['nss-years'], queryFn: () => api.get<Array<number>>('/nss/years'), staleTime: 300_000 })
  const { data, isLoading } = useQuery({
    queryKey: ['nss', { status, q, year, unit, gender, page }],
    queryFn: () => api.get<Page<Row> & { counts: Array<{ status: string; count: number }> }>('/nss', { status, q, year, unit, gender, page }),
    placeholderData: keepPreviousData,
  })
  const remove = useSave((id: number) => api.delete(`/nss/${id}`), { invalidate: ['nss'], success: 'Record deleted' })
  const reset = () => setPage(1)
  return (
    <>
      {dialog}
      <PageHeader
        eyebrow="Modules"
        title="National Service"
        description="National service personnel posted to the University, their units and service years."
        actions={
          canEdit && (
            <Button asChild>
              <Link to="/admin/nss/new">
                <Plus /> New personnel
              </Link>
            </Button>
          )
        }
      />
      <StatusTabs value={status} onChange={(s) => (setStatus(s), reset())} options={[{ value: 'current', label: 'Serving' }, { value: 'completed', label: 'Completed' }]} counts={data?.counts} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), reset())} placeholder="Name, NSS number, phone or email…" />
        <FilterSelect label="Entry year" value={year} onChange={(v) => (setYear(v), reset())} options={(years.data ?? []).map((y) => ({ value: String(y), label: String(y) }))} />
        <label className="flex w-64 flex-col gap-1">
          <span className="pl-3 text-xs font-medium text-muted-foreground">Assigned unit</span>
          <Combobox options={units.data} loading={units.isLoading} value={unit} onChange={(v) => (setUnit(v), reset())} placeholder="All units" />
        </label>
        <FilterSelect label="Gender" value={gender} onChange={(v) => (setGender(v), reset())} options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]} />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        rowLink={(r) => ({ to: '/admin/nss/$id', params: { id: String(r.id) } })}
        empty={<EmptyState icon={GraduationCap} title="No personnel found" />}
        columns={[
          { header: 'NSS number', cell: (r) => <span className="font-mono text-xs font-semibold text-primary">{r.nssNo}</span> },
          {
            header: 'Full name',
            cell: (r) => (
              <span className="flex items-center gap-2.5">
                <Avatar name={r.fullName} photoUrl={r.photo} className="size-8" />
                <span className="block max-w-48 truncate font-semibold text-slate-800">{r.fullName}</span>
              </span>
            ),
          },
          { header: 'Gender', cell: (r) => genderLabel(r.gender) },
          { header: 'Phone', cell: (r) => <span className="font-mono text-xs">{r.mobile || '—'}</span> },
          { header: 'Email', cell: (r) => <span className="block max-w-44 truncate text-xs">{r.email || '—'}</span> },
          { header: 'Assigned unit', cell: (r) => <span className="block max-w-48 truncate text-xs">{r.unitName ?? '—'}</span> },
          { header: 'Entry', cell: (r) => <Badge tone="info" dot={false}>{r.entryYear ?? '—'}</Badge> },
          { header: 'Exit', cell: (r) => <Badge dot={false}>{r.exitYear ?? '—'}</Badge> },
          {
            header: '',
            align: 'right',
            cell: (r) => (
              <RowActions
                actions={[
                  { label: 'View profile', icon: Eye, onSelect: () => navigate({ to: '/admin/nss/$id', params: { id: String(r.id) } }) },
                  { label: 'Edit', icon: Pencil, hidden: !canEdit, onSelect: () => navigate({ to: '/admin/nss/$id/edit', params: { id: String(r.id) } }) },
                  'separator',
                  { label: 'Delete', icon: Trash2, danger: true, hidden: !canManage, onSelect: () => confirm({ title: `Delete ${r.fullName}?`, description: 'The national service record is removed permanently.', danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(r.id) }) },
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
