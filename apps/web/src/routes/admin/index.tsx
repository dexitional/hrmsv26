import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Building2,
  CalendarClock,
  CalendarDays,
  Crown,
  FileClock,
  GraduationCap,
  UserCheck,
  Users,
} from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import { date, daysPhrase, num } from '#/lib/format'
import { GROUP_LABELS, statusLabel } from '#/lib/labels'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { ColumnBars, Donut, RankBars, SplitBars, StackedColumns, StatCard } from '#/components/admin/charts'
import { AgeBadge, DeadlineBadge, PageHeader, StaffCell } from '#/components/admin/page'
import { useUser } from '#/components/admin/session'
import { DashboardSkeleton } from '#/components/admin/skeletons'

export const Route = createFileRoute('/admin/')({ component: Dashboard })

interface DashboardData {
  alerts: Record<string, number>
  totals: Record<string, number>
  byGroup: Array<{ label: string; male: number; female: number; total: number }>
  ageBuckets: Array<{ label: string; value: number }>
  appointments: Array<{ year: number; type: string; count: number }>
  leaveMonths: Array<{ month: string; count: number; days: number }>
  topUnits: Array<{ label: string; value: number }>
  byStatus: Array<{ label: string; value: number }>
  retiring: Array<Record<string, any>>
  positionsEnding: Array<Record<string, any>>
  contractsEnding: Array<Record<string, any>>
}

const AGE_ORDER = ['Under 30', '30–39', '40–49', '50–54', '55–58', '59', '60+']

function lastTwelveMonths(data: DashboardData['leaveMonths']) {
  const byMonth = new Map(data.map((d) => [d.month, d]))
  const now = new Date()
  return Array.from({ length: 12 }, (_, k) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - k), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      label: d.toLocaleDateString('en-GB', { month: 'short' }),
      title: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      value: byMonth.get(key)?.count ?? 0,
    }
  })
}

function AlertTile({
  to,
  search,
  count,
  label,
  tone,
  icon: Icon,
}: {
  to: string
  search?: Record<string, string>
  count: number
  label: string
  tone: 'red' | 'amber' | 'calm'
  icon: typeof AlertTriangle
}) {
  return (
    <Link
      to={to}
      search={search as never}
      className={cn(
        'lift flex items-center gap-3 rounded-2xl border p-3.5',
        tone === 'red' && count > 0 && 'border-red-200 bg-secondary-soft',
        tone === 'amber' && count > 0 && 'border-amber-200 bg-warning-light/40',
        (tone === 'calm' || count === 0) && 'bg-white',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl',
          count === 0 ? 'bg-slate-100 text-slate-400' : tone === 'red' ? 'bg-secondary-light text-secondary-light-foreground' : 'bg-warning-light text-warning-light-foreground',
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl leading-none font-extrabold text-slate-900 tabular-nums">{num(count)}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
      </span>
      <ArrowRight className="size-4 text-slate-300" />
    </Link>
  )
}

function Dashboard() {
  const user = useUser()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get<DashboardData>('/dashboard') })
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        title={`${greeting}, ${user.fullName.split(' ')[0]}`}
        description="The University's workforce at a glance, and what needs HR attention."
      />
      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active staff" value={num(data.totals.active)} sub={`${num(data.totals.female)} women · ${num(data.totals.male)} men`} icon={Users} accent />
            <StatCard label="On contract" value={num(data.totals.contract)} sub="Contract and post-retirement" icon={FileClock} />
            <StatCard label="On leave now" value={num(data.totals.onLeave)} sub="Granted, not yet ended" icon={CalendarDays} />
            <StatCard label="National service" value={num(data.totals.nssCurrent)} sub={`Serving across ${num(data.totals.units)} units`} icon={GraduationCap} />
          </div>

          <div>
            <p className="eyebrow mb-2 px-1">Needs attention</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AlertTile to="/admin/dob" search={{ band: 'red' }} count={data.alerts.retirementDue ?? 0} label="Aged 60+, still active" tone="red" icon={CalendarClock} />
              <AlertTile to="/admin/dob" search={{ band: 'amber' }} count={data.alerts.retirementNear ?? 0} label="Aged 59 — retiring within a year" tone="amber" icon={CalendarClock} />
              <AlertTile to="/admin/positions" search={{ status: 'expiring' }} count={data.alerts.positionsExpiring ?? 0} label="Positions ending within 90 days" tone="amber" icon={Crown} />
              <AlertTile to="/admin/positions" search={{ status: 'expired' }} count={data.alerts.positionsExpired ?? 0} label="Positions past end date" tone="red" icon={Crown} />
              <AlertTile to="/admin/elevation" search={{ tab: 'confirmations', status: 'due' }} count={data.alerts.confirmationsDue ?? 0} label="Appointments due for confirmation" tone="amber" icon={UserCheck} />
              <AlertTile to="/admin/elevation" search={{ tab: 'renewals', status: 'expiring' }} count={(data.alerts.renewalsExpiring ?? 0) + (data.alerts.postretireExpiring ?? 0)} label="Contracts expiring within 90 days" tone="amber" icon={FileClock} />
              <AlertTile to="/admin/elevation" search={{ tab: 'renewals', status: 'expired' }} count={(data.alerts.renewalsExpired ?? 0) + (data.alerts.postretireExpired ?? 0)} label="Contracts expired, still active" tone="red" icon={AlertTriangle} />
              <AlertTile to="/admin/transfers" search={{ tab: 'requests', status: 'PENDING' }} count={data.alerts.transferRequests ?? 0} label="Transfer requests pending" tone="amber" icon={ArrowLeftRight} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Age profile" description="Active staff by age band. Amber and red bars are at or near the retirement age of 60." />
              <CardBody>
                <ColumnBars
                  valueLabel="Staff"
                  data={AGE_ORDER.map((label) => ({ label, value: data.ageBuckets.find((b) => b.label === label)?.value ?? 0 }))}
                  highlight={{ '59': 'var(--chart-4)', '60+': 'var(--chart-2)' }}
                />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Staff categories" description="Active staff by category" />
              <CardBody>
                <Donut
                  items={['SM', 'SS', 'JS'].map((g) => ({ label: GROUP_LABELS[g]!, value: data.byGroup.find((b) => b.label === g)?.total ?? 0 }))}
                  centerLabel="Active"
                  centerValue={num(data.totals.active)}
                />
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Appointments, promotions & upgrades" description="Elevation records by year, last ten years" />
              <CardBody>
                <StackedColumns
                  series={[
                    { key: 'APPOINTMENT', label: 'Appointments' },
                    { key: 'PROMOTION', label: 'Promotions' },
                    { key: 'UPGRADE', label: 'Upgrades' },
                  ]}
                  data={Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 9 + i
                    const row: Record<string, number | string> = { label: String(year) }
                    for (const t of ['APPOINTMENT', 'PROMOTION', 'UPGRADE'])
                      row[t] = data.appointments.find((a) => a.year === year && a.type === t)?.count ?? 0
                    return row
                  })}
                />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Gender by category" description="Active staff" />
              <CardBody>
                <SplitBars
                  parts={['Men', 'Women']}
                  rows={data.byGroup.map((g) => ({ label: GROUP_LABELS[g.label] ?? 'Uncategorised', values: [g.male, g.female] }))}
                />
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Leave taken" description="Leave starting each month (granted or ended), last 12 months" />
              <CardBody>
                <ColumnBars valueLabel="Leaves started" data={lastTwelveMonths(data.leaveMonths)} height={220} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Largest units" description="Active staff by current unit" action={<Link to="/admin/units" className="text-xs font-semibold text-primary hover:underline">All units</Link>} />
              <CardBody>
                <RankBars items={data.topUnits} />
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="Retiring within 12 months" description="Active staff reaching 60" action={<Link to="/admin/dob" search={{ band: 'amber' }} className="text-xs font-semibold text-primary hover:underline">View all</Link>} />
              <ul className="divide-y">
                {data.retiring.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No one retires in the next year.</li>}
                {data.retiring.map((r) => (
                  <li key={r.staffNo} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1"><StaffCell staffNo={r.staffNo} name={r.fullName} sub={date(r.retirementDate)} /></div>
                    <span className="shrink-0"><AgeBadge age={r.age} /></span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Positions ending" description="Within 90 days, or already past" action={<Link to="/admin/positions" search={{ status: 'expiring' }} className="text-xs font-semibold text-primary hover:underline">View all</Link>} />
              <ul className="divide-y">
                {data.positionsEnding.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No positions end soon.</li>}
                {data.positionsEnding.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1"><StaffCell staffNo={p.staffNo} name={p.fullName} sub={p.title} /></div>
                    <span className="shrink-0"><DeadlineBadge daysLeft={p.daysLeft} /></span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Contracts expiring" description="Renewals and post-retirement, next 90 days" />
              <ul className="divide-y">
                {data.contractsEnding.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No contracts expire soon.</li>}
                {data.contractsEnding.map((c) => (
                  <li key={`${c.kind}${c.id}`} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <StaffCell staffNo={c.staffNo} name={c.fullName} sub={c.kind === 'renewal' ? 'SM renewal' : 'Post-retirement'} />
                    </div>
                    <span className="shrink-0 text-xs whitespace-nowrap text-amber-700">{daysPhrase(c.daysLeft)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <CardHeader title="Staff by employment status" description="Every staff record, active or not" />
            <CardBody className="grid gap-x-8 sm:grid-cols-2">
              <RankBars items={data.byStatus.map((s) => ({ label: statusLabel(s.label), value: s.value }))} />
              <div className="mt-6 grid grid-cols-2 gap-3 self-start sm:mt-0">
                <div className="rounded-2xl bg-primary-soft p-4">
                  <Building2 className="size-4 text-primary" />
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">{num(data.totals.units)}</p>
                  <p className="text-xs text-muted-foreground">Active units & offices</p>
                </div>
                <div className="rounded-2xl bg-secondary-soft p-4">
                  <Users className="size-4 text-secondary-foreground" />
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">{num(data.totals.inactive)}</p>
                  <p className="text-xs text-muted-foreground">Inactive records (retired, resigned…)</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  )
}
