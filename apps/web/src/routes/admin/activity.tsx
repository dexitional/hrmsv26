import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Activity } from 'lucide-react'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { dateTime } from '#/lib/format'
import { ROLE_LABELS } from '#/lib/labels'
import { AUDIT_ALL_ROLES } from '#/lib/permissions'
import { Badge } from '#/components/ui/badge'
import { DataTable, FilterSelect, Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { useUser } from '#/components/admin/session'

export const Route = createFileRoute('/admin/activity')({ component: ActivityPage })

type Row = Record<string, any> & { id: number }
const ENTITIES: Record<string, string> = {
  staff: 'Staff',
  dob: 'Date of birth',
  scale: 'Grade',
  unit: 'Unit',
  job: 'Designation',
  position: 'Position',
  leave: 'Leave',
  leave_type: 'Leave type',
  holiday: 'Holiday',
  leave_constant: 'Leave constant',
  leave_weight: 'Entitlement',
  leave_balance: 'Leave balance',
  leave_defer: 'Deferment',
  elevation: 'Elevation',
  renewal: 'Renewal',
  postretire: 'Post-retirement',
  transfer: 'Transfer',
  transfer_request: 'Transfer request',
  nss: 'NSS',
  disciplinary: 'Disciplinary',
  study: 'Study leave',
  promotion: 'Promotion application',
  assessor: 'Assessor',
  notification: 'Notifications',
  user: 'Account',
}
const TONES: Record<string, 'success' | 'info' | 'danger' | 'warning'> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  merge: 'warning',
}

function ActivityPage() {
  const seesAll = AUDIT_ALL_ROLES.includes(useUser().role)
  const [q, setQ] = useState('')
  const [entity, setEntity] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['audit', { q, entity, page }],
    queryFn: () => api.get<Page<Row>>('/audit', { q, entity, page }),
    placeholderData: keepPreviousData,
  })
  return (
    <>
      <PageHeader
        title={seesAll ? 'Activity log' : 'My activity'}
        description={seesAll ? 'Every change made in the HRMS, and by whom.' : 'Every change you have made in the HRMS.'}
      />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Search summaries or people…" />
        <FilterSelect
          label="Record"
          value={entity}
          onChange={(v) => (setEntity(v), setPage(1))}
          options={Object.entries(ENTITIES).map(([value, label]) => ({ value, label }))}
        />
      </Toolbar>
      <DataTable
        loading={isLoading}
        rows={data?.data}
        empty={<EmptyState icon={Activity} title="No activity recorded" />}
        columns={[
          {
            header: 'When',
            cell: (r) => <span className="text-xs whitespace-nowrap text-muted-foreground">{dateTime(r.createdAt)}</span>,
          },
          { header: 'Action', cell: (r) => <Badge tone={TONES[r.action] ?? 'neutral'}>{r.action}</Badge> },
          { header: 'Record', cell: (r) => <span className="text-xs text-slate-600">{ENTITIES[r.entity] ?? r.entity}</span> },
          { header: 'Summary', cell: (r) => <span className="text-sm">{r.summary}</span> },
          {
            header: 'By',
            cell: (r) => (
              <span className="text-xs">
                {r.userName ? `${r.userName} · ${ROLE_LABELS[r.userRole as keyof typeof ROLE_LABELS]}` : 'System'}
              </span>
            ),
          },
        ]}
      />
      {data && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}
