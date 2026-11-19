import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Megaphone, Paperclip } from 'lucide-react'
import { cn } from '@hrms/ui'
import { api } from '#/lib/api-client'
import type { Page } from '#/lib/api-client'
import { date } from '#/lib/format'
import { Card } from '#/components/ui/card'
import { Pagination, SearchInput, Toolbar } from '#/components/admin/data-table'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { CardSkeleton } from '#/components/admin/skeletons'

export const Route = createFileRoute('/portal/circulars/')({ component: MyCirculars })

function MyCirculars() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'circulars', { q, page }],
    queryFn: () => api.get<Page<Record<string, any>> & { unread: number }>('/portal/circulars', { q, page }),
    placeholderData: keepPreviousData,
  })
  return (
    <>
      <PageHeader eyebrow="Staff services" title="Circulars" description={data ? `Notices from the Directorate of Human Resource · ${data.unread} unread` : 'Notices from the Directorate of Human Resource'} />
      <Toolbar>
        <SearchInput value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Subject, reference or message…" />
      </Toolbar>
      {isLoading ? (
        <CardSkeleton lines={6} />
      ) : !data?.data.length ? (
        <EmptyState icon={Megaphone} title="No circulars" description="Circulars sent to you appear here." />
      ) : (
        <Card>
          <ul className="divide-y">
            {data.data.map((c) => (
              <li key={c.id}>
                <Link to="/portal/circulars/$id" params={{ id: String(c.id) }} className="flex gap-4 px-5 py-4 hover:bg-slate-50">
                  <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', c.isRead ? 'bg-slate-200' : 'bg-primary')} aria-label={c.isRead ? 'Read' : 'Unread'} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn('truncate', c.isRead ? 'text-slate-700' : 'font-semibold text-slate-900')}>{c.subject}</span>
                      {Boolean(c.hasAttachment) && <Paperclip className="size-3.5 shrink-0 text-muted-foreground" aria-label="PDF attached" />}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{c.excerpt}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted-foreground">
                    {date(c.publishedAt)}
                    {c.letterNo && <span className="mt-0.5 block font-mono">{c.letterNo}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {data && data.total > data.pageSize && <Pagination page={page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  )
}
