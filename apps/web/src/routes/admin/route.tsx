import { useEffect, useState } from 'react'
import { Link, Outlet, createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, ArrowLeftRight, Bell, BookOpenCheck, Briefcase, Building2, CalendarClock, CalendarDays, ChevronsUpDown, Crown, FileStack, Gavel, GraduationCap, KeyRound, Layers, LayoutDashboard, LifeBuoy, LogOut, Megaphone, MessageSquareText, ShieldCheck, TrendingUp, UserRound, Users } from 'lucide-react'
import { cn } from '@hrms/ui'
import { getSession } from '#/server/session'
import { api, errorMessage } from '#/lib/api-client'
import { ROLE_LABELS } from '#/lib/labels'
import { AUDIT_ALL_ROLES, can } from '#/lib/permissions'
import type { Module } from '#/lib/permissions'
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '#/components/ui/dropdown'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Avatar } from '#/components/admin/page'
import { SESSION_QUERY_KEY, SESSION_STALE_MS } from '#/components/admin/session'
import { AppShell, IdentityPill } from '#/components/shell/app-shell'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData({
      queryKey: SESSION_QUERY_KEY,
      queryFn: () => getSession(),
      staleTime: SESSION_STALE_MS,
    })
    if (!user) {
      context.queryClient.removeQueries({ queryKey: SESSION_QUERY_KEY })
      throw redirect({ to: '/login', search: { next: location.href } })
    }
    return { user }
  },
  head: () => ({ meta: [{ title: 'UCC HRMS' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminLayout,
})

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; module: Module; exact?: boolean }

const NAV: Array<{ heading: string; items: Array<NavItem> }> = [
  {
    heading: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard', exact: true }],
  },
  {
    heading: 'Modules',
    items: [
      { to: '/admin/staff', label: 'Staff', icon: Users, module: 'staff' },
      { to: '/admin/leave', label: 'Leave', icon: CalendarDays, module: 'leave' },
      { to: '/admin/elevation', label: 'Elevation', icon: TrendingUp, module: 'elevation' },
      { to: '/admin/transfers', label: 'Transfers', icon: ArrowLeftRight, module: 'transfers' },
      { to: '/admin/promotions', label: 'Appointment & Promotion', icon: FileStack, module: 'promotions' },
      { to: '/admin/study', label: 'Study Leave', icon: BookOpenCheck, module: 'study' },
      { to: '/admin/disciplinary', label: 'Disciplinary', icon: Gavel, module: 'disciplinary' },
      { to: '/admin/nss', label: 'National Service', icon: GraduationCap, module: 'nss' },
      { to: '/admin/circulars', label: 'Circulars', icon: Megaphone, module: 'circulars' },
    ],
  },
  {
    heading: 'Utilities',
    items: [
      { to: '/admin/scales', label: 'Grades & Notches', icon: Layers, module: 'scales' },
      { to: '/admin/units', label: 'Units & Offices', icon: Building2, module: 'units' },
      { to: '/admin/jobs', label: 'Designations', icon: Briefcase, module: 'jobs' },
      { to: '/admin/positions', label: 'Positions', icon: Crown, module: 'positions' },
      { to: '/admin/dob', label: 'Date of Birth', icon: CalendarClock, module: 'dob' },
    ],
  },
  {
    heading: 'System',
    items: [
      { to: '/admin/service-desk', label: 'Service desk', icon: LifeBuoy, module: 'servicedesk' },
      { to: '/admin/notifications', label: 'Notifications', icon: MessageSquareText, module: 'notifications' },
      { to: '/admin/users', label: 'User accounts', icon: ShieldCheck, module: 'users' },
      { to: '/admin/activity', label: 'Activity log', icon: Activity, module: 'audit' },
    ],
  },
]

type Alerts = Record<string, number>

const ALERT_ITEMS: Array<{ key: string; label: string; to: string; search?: Record<string, string>; tone: 'red' | 'amber' }> = [
  { key: 'retirementDue', label: 'Staff aged 60 and above, still active', to: '/admin/dob', search: { band: 'red' }, tone: 'red' },
  { key: 'retirementNear', label: 'Staff aged 59 (retiring within a year)', to: '/admin/dob', search: { band: 'amber' }, tone: 'amber' },
  { key: 'positionsExpired', label: 'Positions past their end date', to: '/admin/positions', search: { status: 'expired' }, tone: 'red' },
  { key: 'positionsExpiring', label: 'Positions ending within 90 days', to: '/admin/positions', search: { status: 'expiring' }, tone: 'amber' },
  { key: 'confirmationsDue', label: 'Appointments due for confirmation', to: '/admin/elevation', search: { tab: 'confirmations', status: 'due' }, tone: 'amber' },
  { key: 'renewalsExpired', label: 'Senior member contracts expired', to: '/admin/elevation', search: { tab: 'renewals', status: 'expired' }, tone: 'red' },
  { key: 'renewalsExpiring', label: 'Senior member contracts expiring', to: '/admin/elevation', search: { tab: 'renewals', status: 'expiring' }, tone: 'amber' },
  { key: 'postretireExpired', label: 'Post-retirement contracts expired', to: '/admin/elevation', search: { tab: 'postretire', status: 'expired' }, tone: 'red' },
  { key: 'postretireExpiring', label: 'Post-retirement contracts expiring', to: '/admin/elevation', search: { tab: 'postretire', status: 'expiring' }, tone: 'amber' },
  { key: 'transferRequests', label: 'Transfer requests awaiting a decision', to: '/admin/transfers', search: { tab: 'requests', status: 'PENDING' }, tone: 'amber' },
  { key: 'promotionsAtHr', label: 'Promotion applications at HR', to: '/admin/promotions', search: { tab: 'applications', level: '4' }, tone: 'amber' },
  { key: 'studyAtHr', label: 'Intentions to study awaiting HR', to: '/admin/study', search: { tab: 'intentions', status: '4' }, tone: 'amber' },
  { key: 'studyOverdue', label: 'Study leave past its end date', to: '/admin/study', search: { tab: 'leaves', status: 'overdue' }, tone: 'red' },
  { key: 'leaveHrPending', label: 'Leave applications pended at HR', to: '/admin/leave', search: { tab: 'records', status: 'HR-PENDING' }, tone: 'amber' },
  { key: 'defermentsPending', label: 'Leave deferments awaiting approval', to: '/admin/leave', search: { tab: 'deferments', status: '0' }, tone: 'amber' },
]

function AlertsBell({ enabled }: { enabled: boolean }) {
  const alerts = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get<Alerts>('/dashboard/alerts'),
    enabled,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  })
  const [open, setOpen] = useState(false)
  const items = ALERT_ITEMS.filter((a) => (alerts.data?.[a.key] ?? 0) > 0)
  const urgent = items.filter((i) => i.tone === 'red').length
  if (!enabled) return null
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full border bg-white text-slate-600 shadow-xs hover:text-primary"
          aria-label={`Alerts (${items.length})`}
        >
          <Bell className="size-4" />
          {items.length > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[0.6rem] font-bold text-white',
                urgent ? 'bg-destructive' : 'bg-warning',
              )}
            >
              {items.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-bold text-slate-900">Alerts</p>
          <p className="text-xs text-muted-foreground">Things that need HR attention</p>
        </div>
        <ul className="max-h-96 overflow-y-auto p-1.5">
          {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">All clear.</li>}
          {items.map((a) => (
            <li key={a.key}>
              <Link
                to={a.to}
                search={a.search as never}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-accent"
              >
                <span className={cn('size-2 shrink-0 rounded-full', a.tone === 'red' ? 'bg-destructive' : 'bg-warning')} />
                <span className="flex-1 text-slate-700">{a.label}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-xs font-bold',
                    a.tone === 'red' ? 'bg-secondary-light text-secondary-light-foreground' : 'bg-warning-light text-warning-light-foreground',
                  )}
                >
                  {alerts.data?.[a.key]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function AdminLayout() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const router = useRouter()
  useEffect(() => {
    const targets = NAV.flatMap((g) => g.items)
      .filter((item) => can(user.role, item.module))
      .map((item) => item.to)
    const run = () => {
      for (const to of targets) void router.preloadRoute({ to }).catch(() => undefined)
    }
    const idle = window.requestIdleCallback?.(run, { timeout: 3000 })
    const timer = idle === undefined ? window.setTimeout(run, 1500) : undefined
    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [router, user.role])

  const logout = async () => {
    await api.post('/auth/logout')
    queryClient.clear()
    await navigate({ to: '/login' })
  }

  const openPortal = async () => {
    try {
      await api.post('/auth/to-portal')
      window.location.assign('/portal')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const groups = NAV.map((group) => ({
    heading: group.heading,
    items: group.items
      .filter((i) => can(user.role, i.module))
      .map((i) => ({ ...i, label: i.to === '/admin/activity' && !AUDIT_ALL_ROLES.includes(user.role) ? 'My activity' : i.label })),
  }))

  return (
    <AppShell
      home="/admin"
      title="UCC HRMS"
      subtitle="Directorate of Human Resource"
      identity={<IdentityPill avatar={<Avatar name={user.fullName} photoUrl={user.avatarUrl} staffNo={user.staffNo} className="size-7" />} name={user.fullName} detail={ROLE_LABELS[user.role]} />}
      groups={groups}
      topRight={<AlertsBell enabled={can(user.role, 'dashboard')} />}
      footer={
        <Dropdown>
          <DropdownTrigger className="flex w-full items-center gap-2.5 rounded-full p-2 text-left hover:bg-white/70 data-[state=open]:bg-white/70">
            <Avatar name={user.fullName} photoUrl={user.avatarUrl} staffNo={user.staffNo} className="size-7" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.email}</span>
            <ChevronsUpDown className="size-4 text-slate-400" />
          </DropdownTrigger>
          <DropdownContent align="start" side="top" className="w-56">
            {user.staffNo && (
              <>
                <DropdownItem onSelect={() => void openPortal()}>
                  <UserRound /> My staff portal
                </DropdownItem>
                <DropdownSeparator />
              </>
            )}
            <DropdownItem onSelect={() => navigate({ to: '/admin/account' })}>
              <KeyRound /> {user.hasPassword ? 'Change password' : 'Set a password'}
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem danger onSelect={() => void logout()}>
              <LogOut /> Sign out
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      }
    >
      <Outlet />
    </AppShell>
  )
}
