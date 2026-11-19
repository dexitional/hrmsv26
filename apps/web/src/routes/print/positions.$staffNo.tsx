import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api, errorMessage } from '#/lib/api-client'
import { date } from '#/lib/format'
import { POST_LABELS } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/positions/$staffNo')({
  head: () => ({ meta: [{ title: 'Position history · UCC HRMS' }] }),
  component: PrintPositions,
})

function PrintPositions() {
  const { staffNo } = Route.useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['position-history', staffNo],
    queryFn: () => api.get<{ staff: Record<string, any>; positions: Array<Record<string, any>> }>(`/positions/history/${staffNo}`),
  })
  const s = data?.staff
  return (
    <PrintPage title="Position History" subtitle={s?.fullName} loading={isLoading} error={error ? errorMessage(error) : null}>
      {s && (
        <>
          <PrintParticulars items={[['Name', s.fullName], ['Staff number', s.staffNo], ['Designation', s.jobTitle], ['Unit', s.unitName]]} />
          <PrintTable
            empty="No positions recorded."
            head={['#', 'Position', 'Rank', 'Unit of jurisdiction', 'From', 'To', 'Status']}
            rows={data!.positions.map((p, i) => [
              i + 1,
              p.title,
              p.post ? POST_LABELS[p.post] : null,
              p.unitName,
              date(p.startDate),
              date(p.endDate),
              p.active !== '1' ? 'Ended' : Number(p.daysLeft) < 0 ? 'Past end date' : Number(p.daysLeft) <= 90 ? `Ends in ${p.daysLeft} days` : 'Current',
            ])}
          />
        </>
      )}
    </PrintPage>
  )
}
