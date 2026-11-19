// The frame shared by the admin and the staff portal: brand, identity pill,
// grouped navigation, account menu at the foot, a mobile drawer, and the
// white content card with the top-right slot (alerts / notifications).
import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { cn } from '@hrms/ui'

export interface ShellNavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
  /** A small count beside the label (e.g. pending approvals). */
  badge?: number | null
}

export interface ShellNavGroup {
  heading: string
  items: Array<ShellNavItem>
}

export function AppShell({
  home,
  title,
  subtitle,
  identity,
  groups,
  footer,
  topRight,
  children,
}: {
  home: string
  title: string
  subtitle: string
  identity: React.ReactNode
  groups: Array<ShellNavGroup>
  footer: React.ReactNode
  topRight?: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => setMobileOpen(false), [pathname])

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to={home} className="flex items-center gap-2.5 px-3 pt-1 pb-4">
        <img src="/ucc-crest-sm.png" alt="" className="h-9 w-auto" />
        <div className="leading-tight">
          <p className="text-[0.95rem] font-extrabold tracking-tight text-primary">{title}</p>
          <p className="text-[0.68rem] font-medium text-muted-foreground">{subtitle}</p>
        </div>
      </Link>

      {identity}

      <nav className="no-scrollbar -mx-1 flex-1 overflow-y-auto px-1" aria-label={title}>
        {groups
          .filter((g) => g.items.length)
          .map((group) => (
            <div key={group.heading} className="mb-3">
              <p className="eyebrow px-3 py-2">{group.heading}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      activeOptions={{ exact: item.exact ?? false }}
                      className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-900 [&.active]:bg-white [&.active]:font-semibold [&.active]:text-primary [&.active]:shadow-[0_1px_2px_rgb(15_23_42/0.06),0_0_0_1px_var(--border)]"
                    >
                      <item.icon className="size-4 text-slate-400 group-[.active]:text-secondary-foreground" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-secondary-light px-1.5 font-mono text-[0.65rem] font-bold text-secondary-light-foreground">{item.badge}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </nav>

      <div className="border-t border-border/70 pt-3">{footer}</div>
    </div>
  )

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas p-3 max-lg:block max-lg:h-auto max-lg:min-h-dvh max-lg:overflow-visible max-lg:p-0">
      <aside className="w-64 shrink-0 pr-3 max-lg:hidden">{sidebar}</aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link to={home} className="flex items-center gap-2">
          <img src="/ucc-crest-sm.png" alt="" className="h-8 w-auto" />
          <span className="font-extrabold text-primary">{title}</span>
        </Link>
        <div className="flex items-center gap-2">
          {topRight}
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-full bg-white p-2.5 shadow-xs" aria-label="Open menu">
            <Menu className="size-4" />
          </button>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <div className="relative h-full w-72 bg-canvas p-3 animate-in duration-200 slide-in-from-left">
            {sidebar}
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute top-4 -right-12 rounded-full bg-white p-2" aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col overflow-clip rounded-2xl border border-border bg-white shadow-sm',
          'max-lg:min-h-[calc(100dvh-62px)] max-lg:rounded-none max-lg:border-0 max-lg:shadow-none',
        )}
      >
        <div className="relative flex flex-1 flex-col overflow-y-auto overscroll-y-contain max-lg:overflow-visible" style={{ scrollbarGutter: 'stable' }}>
          <NavigationProgress />
          {topRight && (
            <div className="pointer-events-none sticky top-0 z-30 -mb-14 hidden h-14 justify-end px-5 pt-4 lg:flex">
              <div className="pointer-events-auto">{topRight}</div>
            </div>
          )}
          <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col p-6 lg:pr-20 max-md:px-4">{children}</main>
        </div>
      </div>
    </div>
  )
}

function NavigationProgress() {
  const pending = useRouterState({ select: (s) => s.status === 'pending' })
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden transition-opacity duration-300', pending ? 'opacity-100' : 'opacity-0')}
    >
      <div className="nav-progress h-full w-1/3 rounded-full bg-primary" />
    </div>
  )
}

/** The rounded pill under the brand: photo, name and a second line. */
export function IdentityPill({ avatar, name, detail }: { avatar: React.ReactNode; name: string; detail: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5 rounded-full border border-border bg-white py-1.5 pr-3 pl-1.5 shadow-xs">
      {avatar}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-xs font-semibold text-slate-800">{name}</p>
        <p className="truncate text-[0.68rem] text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}
