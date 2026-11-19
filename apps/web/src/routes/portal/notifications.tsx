import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { dateTime } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Pagination } from '#/components/admin/data-table'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { CardSkeleton } from '#/components/admin/skeletons'

export const Route = createFileRoute('/portal/notifications')({ component: Notifications })

function Notifications() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'notifications', page],
    queryFn: () => api.get<Page<Record<string, any>>>('/portal/notifications', { page }),
    placeholderData: keepPreviousData,
  })
  const readAll = useSave(() => api.post('/portal/notifications/read', {}), { invalidate: ['portal'], success: 'All marked as read' })
  return (
    <>
      <PageHeader
        eyebrow="Staff services"
        title="Notifications"
        description="Leave decisions, circulars and replies to your requests."
        actions={
          <Button variant="outline" onClick={() => readAll.mutate(undefined)} disabled={readAll.isPending}>
            <CheckCheck /> Mark all read
          </Button>
        }
      />
      {isLoading ? (
        <CardSkeleton lines={8} />
      ) : !data?.data.length ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <Card>
          <ul className="divide-y">
            {data.data.map((n) => (
              <li key={n.id} className={cn('flex gap-4 px-5 py-4', !n.isRead && 'bg-primary-soft/40')}>
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.isRead ? 'bg-slate-200' : 'bg-primary')} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800">{n.title || n.action}</span>
                    {Boolean(n.important) && <Badge tone="warning" dot={false}>Important</Badge>}
                  </span>
                  <span className="mt-0.5 block text-sm break-words text-slate-600">{n.message}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{dateTime(n.datetime)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {data && data.total > data.pageSize && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}
