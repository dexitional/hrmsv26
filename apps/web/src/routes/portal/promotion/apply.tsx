import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '#/lib/api-client'
import { EmptyState, PageHeader } from '#/components/admin/page'
import { FormSkeleton } from '#/components/admin/skeletons'
import { ApplicationForm } from '#/components/promotion/application-form'

export const Route = createFileRoute('/portal/promotion/apply')({
  validateSearch: z.object({ type: z.coerce.number().int().min(0).max(1).default(0), draft: z.coerce.number().int().optional() }),
  component: Apply,
})

function Apply() {
  const { type, draft } = Route.useSearch()
  const info = useQuery({ queryKey: ['portal', 'promotion'], queryFn: () => api.get<Record<string, any>>('/portal/promotion') })
  const existing = useQuery({ queryKey: ['portal', 'promotion-file', draft], queryFn: () => api.get<Record<string, any>>(`/portal/promotion/${draft}`), enabled: Boolean(draft) })
  const t = (existing.data ? Number(existing.data.type) : type) as 0 | 1
  const blocked = !draft && info.data && (t === 1 ? info.data.open.renewal : info.data.open.promotion)
  return (
    <>
      <PageHeader
        back={{ to: '/portal/promotion', label: 'Promotion' }}
        eyebrow={draft ? `Draft #${draft}` : 'New application'}
        title={t === 1 ? 'Apply for contract renewal' : 'Apply for promotion'}
        description="Your head of department receives it first, then your dean or director, provost or registrar, and the Directorate of Human Resource."
      />
      {!info.data || (draft && !existing.data) ? (
        <FormSkeleton />
      ) : blocked ? (
        <EmptyState title="You already have an open application" description="Follow it on the Promotion page; you can apply again once it is decided." />
      ) : (
        <ApplicationForm type={t} ranks={info.data.ranks} detailed={info.data.detailed} draft={existing.data} />
      )}
    </>
  )
}
