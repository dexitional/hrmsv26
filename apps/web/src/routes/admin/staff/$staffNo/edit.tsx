import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api-client'
import { StaffForm } from '#/components/forms/staff-form'
import { PageHeader } from '#/components/admin/page'
import { FormSkeleton } from '#/components/admin/skeletons'

export const Route = createFileRoute('/admin/staff/$staffNo/edit')({ component: EditStaff })

function EditStaff() {
  const { staffNo } = Route.useParams()
  const { data, isLoading } = useQuery({ queryKey: ['staff', staffNo], queryFn: () => api.get<Record<string, any>>(`/staff/${staffNo}`) })
  return (
    <>
      <PageHeader back={{ to: '/admin/staff/$staffNo', label: 'Profile', params: { staffNo } }} title={data ? `Edit ${data.fullName}` : 'Edit staff'} eyebrow={`Staff ${staffNo}`} />
      {isLoading || !data ? <FormSkeleton /> : <StaffForm staff={data} />}
    </>
  )
}
