import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api-client'
import { PageHeader } from '#/components/admin/page'
import { FormSkeleton } from '#/components/admin/skeletons'
import { SelfAppraisalForm } from '#/components/appraisal/self-form'

export const Route = createFileRoute('/portal/appraisal/self')({ component: NewSelfAppraisal })

function NewSelfAppraisal() {
  const { data } = useQuery({ queryKey: ['portal', 'appraisal'], queryFn: () => api.get<Record<string, any>>('/portal/appraisal') })
  return (
    <>
      <PageHeader back={{ to: '/portal/appraisal', label: 'Appraisal' }} eyebrow="Form B" title="Self-appraisal" description="Your own account of the year. Your supervisor reads and countersigns it." />
      {data ? <SelfAppraisalForm year={data.year} supervisor={data.supervisor} /> : <FormSkeleton />}
    </>
  )
}
