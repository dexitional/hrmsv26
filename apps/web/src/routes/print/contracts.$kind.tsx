import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { api, errorMessage } from '#/lib/api-client'
import { date, num } from '#/lib/format'
import { PrintPage, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/contracts/$kind')({
  validateSearch: z.object({ year: z.coerce.number().optional() }),
  head: () => ({ meta: [{ title: 'Expired contracts · UCC HRMS' }] }),
  component: PrintExpired,
})

function PrintExpired() {
  const { kind } = Route.useParams()
  const { year = new Date().getFullYear() } = Route.useSearch()
  const renewal = kind === 'renewals'
  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts-expired', kind, year],
    queryFn: () => api.get<{ data: Array<Record<string, any>> }>(`/elevation/${renewal ? 'renewals' : 'postretire'}/expired`, { year }),
  })
  return (
    <PrintPage
      landscape
      title={`${renewal ? 'Senior Membership Renewals' : 'Post-Retirement Contracts'} Expired in ${year}`}
      subtitle={data ? `${num(data.data.length)} contracts, latest first` : undefined}
      loading={isLoading}
      error={error ? errorMessage(error) : null}
    >
      {data && (
        <PrintTable
          empty={`No contracts expired in ${year}.`}
          head={['#', 'Staff no.', 'Name', 'Designation', 'Unit', 'Start date', renewal ? 'Renewed years' : 'Service years', 'Expired on']}
          rows={data.data.map((r, i) => [i + 1, r.staffNo, r.fullName, r.jobTitle, r.unitName, date(renewal ? r.startDate : r.startPost), renewal ? r.renewalPeriod : r.served, date(r.expiryDate)])}
        />
      )}
    </PrintPage>
  )
}
