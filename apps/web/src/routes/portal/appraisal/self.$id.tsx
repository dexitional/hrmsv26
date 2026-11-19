import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { api } from '#/lib/api-client'
import { Button } from '#/components/ui/button'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { FormBStatus, FormBView } from '#/components/appraisal/shared'
import { SelfAppraisalForm } from '#/components/appraisal/self-form'

export const Route = createFileRoute('/portal/appraisal/self/$id')({ component: SelfAppraisal })

function SelfAppraisal() {
  const { id } = Route.useParams()
  const [editing, setEditing] = useState(false)
  const { data: f, isLoading } = useQuery({ queryKey: ['portal', 'self-appraisal', id], queryFn: () => api.get<Record<string, any>>(`/portal/appraisal/b/${id}`) })
  if (isLoading) return <ProfileSkeleton />
  if (!f) return <EmptyState title="Self-appraisal not found" />
  const open = Number(f.appStatus) < 2
  return (
    <>
      <PageHeader
        back={{ to: '/portal/appraisal', label: 'Appraisal' }}
        eyebrow="Form B"
        title={`Self-appraisal ${f.year}`}
        meta={<FormBStatus status={Number(f.appStatus)} />}
        actions={
          open &&
          !editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </Button>
          )
        }
      />
      {editing ? <SelfAppraisalForm existing={f} year={f.year} /> : <FormBView form={f} />}
    </>
  )
}
