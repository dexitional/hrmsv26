import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, ExternalLink } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date } from '#/lib/format'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'

export const Route = createFileRoute('/portal/circulars/$id')({ component: Circular })

function Circular() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const { data: c, isLoading } = useQuery({ queryKey: ['portal', 'circular', id], queryFn: () => api.get<Record<string, any>>(`/portal/circulars/${id}`) })
  // Opening it marks it read: refresh the counts.
  useEffect(() => {
    if (c) void queryClient.invalidateQueries({ queryKey: ['portal', 'overview'] })
  }, [c, queryClient])
  if (isLoading) return <ProfileSkeleton />
  if (!c) return <EmptyState title="Circular not found" />
  const inline = String(c.pdfUrl ?? '').includes('/api/circulars/public/')
  return (
    <>
      <PageHeader back={{ to: '/portal/circulars', label: 'Circulars' }} eyebrow={c.letterNo ? `Ref: ${c.letterNo}` : 'Circular'} title={c.subject} description={date(c.publishedAt, 'long')} />
      <div className="space-y-4">
        {c.message && (
          <Card>
            <CardBody className="text-[0.95rem] leading-relaxed break-words whitespace-pre-line text-slate-700">{c.message}</CardBody>
          </Card>
        )}
        {c.pdfUrl && (
          <Card>
            <CardHeader
              title={c.attachmentName ?? 'Circular document'}
              action={
                <span className="flex gap-1.5">
                  <Button variant="outline" size="sm" asChild>
                    <a href={c.pdfUrl} target="_blank" rel="noreferrer">
                      <ExternalLink /> Open
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={c.pdfUrl} download>
                      <Download /> Download
                    </a>
                  </Button>
                </span>
              }
            />
            {inline && <iframe src={c.pdfUrl} title={c.subject} className="h-[75dvh] min-h-[28rem] w-full rounded-b-2xl bg-slate-100" />}
          </Card>
        )}
      </div>
    </>
  )
}
