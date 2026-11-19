import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api-client'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { FormSkeleton } from '#/components/admin/skeletons'
import { CircularForm } from '#/components/circulars/circular-form'

export const Route = createFileRoute('/admin/circulars/$id/edit')({ component: EditCircular })

function EditCircular() {
  const { id } = Route.useParams()
  const { data, isLoading } = useQuery({ queryKey: ['circulars', id], queryFn: () => api.get<Record<string, any>>(`/circulars/${id}`) })
  return (
    <>
      <PageHeader back={{ to: '/admin/circulars/$id', label: 'Circular', params: { id } }} title={data ? `Edit “${data.subject}”` : 'Edit circular'} />
      {isLoading ? <FormSkeleton /> : data?.stage === 'DRAFT' ? <CircularForm circular={data} /> : <EmptyState title="Only drafts can be edited" description="A published circular has already gone out to staff." />}
    </>
  )
}
