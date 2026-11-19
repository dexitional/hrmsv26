// The staff portal: Staff, Support and Management services, in the same
// frame as the admin. Management appears for heads of units and approvers.
import { useState } from 'react'
import { Link, Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  BookOpenCheck,
  CalendarDays,
  ChevronsUpDown,
  ClipboardCheck,
  Clock,
  FileStack,
  HeartHandshake,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Megaphone,
  Receipt,
  ShoppingCart,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  Wifi,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@hrms/ui'
import { getPortalSession } from '#/server/portal-session'
import { api, errorMessage } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { relative } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '#/components/ui/dropdown'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Avatar } from '#/components/admin/page'
import { AppShell, IdentityPill } from '#/components/shell/app-shell'
import type { ShellNavGroup } from '#/components/shell/app-shell'
import { PORTAL_SESSION_KEY, PORTAL_SESSION_STALE_MS } from '#/components/portal/session'

export const Route = createFileRoute('/portal')({
  beforeLoad: async ({ context, location }) => {
    const staff = await context.queryClient.ensureQueryData({
      queryKey: PORTAL_SESSION_KEY,
      queryFn: () => getPortalSession(),
      staleTime: PORTAL_SESSION_STALE_MS,
    })
    if (!staff) {
      context.queryClient.removeQueries({ queryKey: PORTAL_SESSION_KEY })
      throw redirect({ to: '/portal/login', search: { next: location.href } })
    }
    return { staff }
  },
  head: () => ({ meta: [{ title: 'Staff portal · UCC HRMS' }, { name: 'robots', content: 'noindex' }] }),
  component: PortalLayout,
})

function PortalLayout() {
  const { staff } = Route.useRouteContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const overview = useQuery({
    queryKey: ['portal', 'overview'],
    queryFn: () => api.get<Record<string, any>>('/portal/overview'),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  })
  const unread = Number(overview.data?.unread ?? 0)
  const approvals = Number(overview.data?.approvals ?? 0)
  const newCirculars = (overview.data?.circulars ?? []).filter((c: Record<string, any>) => !c.isRead).length

  const logout = async () => {
    await api.post('/portal/auth/logout')
    queryClient.clear()
    await navigate({ to: '/portal/login' })
  }
  const toAdmin = async () => {
    try {
      await api.post('/portal/auth/to-admin')
      window.location.assign('/admin')
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const groups: Array<ShellNavGroup> = [
    {
      heading: 'Staff services',
      items: [
        { to: '/portal', label: 'Overview', icon: LayoutDashboard, exact: true },
        { to: '/portal/profile', label: 'My profile', icon: UserRound },
        { to: '/portal/circulars', label: 'Circulars', icon: Megaphone, badge: newCirculars },
        { to: '/portal/leave', label: 'Leave', icon: CalendarDays },
        { to: '/portal/appraisal', label: 'Appraisal', icon: ClipboardCheck },
        { to: '/portal/promotion', label: 'Promotion', icon: TrendingUp },
        { to: '/portal/study', label: 'Study leave', icon: BookOpenCheck },
        { to: '/portal/attendance', label: 'Attendance', icon: Clock },
        { to: '/portal/tax', label: 'GRA ETD', icon: Receipt },
      ],
    },
    {
      heading: 'Support services',
      items: [
        { to: '/portal/support/counselling', label: 'Counselling', icon: HeartHandshake },
        { to: '/portal/support/eduroam', label: 'Eduroam & Wi-Fi', icon: Wifi },
        { to: '/portal/support/it', label: 'IT helpdesk', icon: Wrench },
        { to: '/portal/support/xpay', label: 'XPay support', icon: Wallet },
      ],
    },
    ...(staff.isManager
      ? [
          {
            heading: 'Management services',
            items: [
              { to: '/portal/manage/staff', label: 'Staff manager', icon: Users },
              { to: '/portal/manage/leave', label: 'Leave manager', icon: CalendarDays, badge: approvals },
              { to: '/portal/manage/appraisals', label: 'Appraisal manager', icon: ClipboardCheck },
              { to: '/portal/manage/promotions', label: 'Promotion manager', icon: FileStack },
              { to: '/portal/manage/study', label: 'Study leave manager', icon: BookOpenCheck },
              { to: '/portal/manage/procurement', label: 'Procurement manager', icon: ShoppingCart },
            ],
          },
        ]
      : []),
  ]

  return (
    <AppShell
      home="/portal"
      title="UCC Staff Portal"
      subtitle="Directorate of Human Resource"
      identity={
        <IdentityPill
          avatar={<Avatar name={staff.fullName} staffNo={staff.staffNo} className="size-7" />}
          name={staff.fullName}
          detail={staff.headTitle ?? `${staff.staffGroup ? (GROUP_LABELS[staff.staffGroup] ?? staff.staffGroup) : 'Staff'} · ${staff.staffNo}`}
        />
      }
      groups={groups}
      topRight={<NotificationsBell unread={unread} />}
      footer={
        <Dropdown>
          <DropdownTrigger className="flex w-full items-center gap-2.5 rounded-full p-2 text-left hover:bg-white/70 data-[state=open]:bg-white/70">
            <Avatar name={staff.fullName} staffNo={staff.staffNo} className="size-7" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{staff.uccMail ?? `Staff ${staff.staffNo}`}</span>
            <ChevronsUpDown className="size-4 text-slate-400" />
          </DropdownTrigger>
          <DropdownContent align="start" side="top" className="w-56">
            <DropdownItem onSelect={() => navigate({ to: '/portal/profile' })}>
              <UserRound /> My profile
            </DropdownItem>
            {staff.adminRole && (
              <DropdownItem onSelect={() => void toAdmin()}>
                <LayoutGrid /> Switch to HRMS admin
              </DropdownItem>
            )}
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

function NotificationsBell({ unread }: { unread: number }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const list = useQuery({
    queryKey: ['portal', 'notifications', 'bell'],
    queryFn: () => api.get<Page<Record<string, any>>>('/portal/notifications', { pageSize: 8 }),
    enabled: open,
  })
  const readAll = async () => {
    await api.post('/portal/notifications/read', {})
    await queryClient.invalidateQueries({ queryKey: ['portal'] })
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full border bg-white text-slate-600 shadow-xs hover:text-primary"
          aria-label={`Notifications (${unread} unread)`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[0.6rem] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread ? `${unread} unread` : 'All read'}</p>
          </div>
          {unread > 0 && (
            <button type="button" onClick={() => void readAll()} className="text-xs font-semibold text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <ul className="max-h-96 overflow-y-auto p-1.5">
          {list.data?.data.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing yet.</li>}
          {list.data?.data.map((n) => (
            <li key={n.id} className={cn('rounded-lg px-3 py-2', !n.isRead && 'bg-primary-soft/60')}>
              <p className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-semibold text-slate-800">{n.title || n.action}</span>
                <span className="shrink-0 text-muted-foreground">{relative(n.datetime)}</span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{n.message}</p>
            </li>
          ))}
        </ul>
        <div className="border-t p-2 text-center">
          <Link to="/portal/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-primary hover:underline">
            See all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
