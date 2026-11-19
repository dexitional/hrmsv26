import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api-client'
import { NssForm } from '#/components/forms/nss-form'
import { PageHeader } from '#/components/admin/page'
import { FormSkeleton } from '#/components/admin/skeletons'

export const Route = createFileRoute('/admin/nss/$id/edit')({ component: EditNss })

function EditNss() {
  const { id } = Route.useParams()
  const { data } = useQuery({ queryKey: ['nss', id], queryFn: () => api.get<Record<string, any>>(`/nss/${id}`) })
  return (
    <>
      <PageHeader back={{ to: '/admin/nss/$id', label: 'Profile', params: { id } }} title={data ? `Edit ${data.fullName}` : 'Edit personnel'} />
      {data ? <NssForm person={data} /> : <FormSkeleton />}
    </>
  )
}
