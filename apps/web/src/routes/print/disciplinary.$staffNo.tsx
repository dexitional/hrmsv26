import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { DISCIPLINARY_ACTIONS } from '@hrms/db/types'
import { api, errorMessage } from '#/lib/api-client'
import { date } from '#/lib/format'
import { GROUP_LABELS, statusLabel } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintSection, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/disciplinary/$staffNo')({
  head: () => ({ meta: [{ title: 'Disciplinary record · UCC HRMS' }] }),
  component: PrintDisciplinary,
})

function PrintDisciplinary() {
  const { staffNo } = Route.useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['disciplinary-history', staffNo],
    queryFn: () => api.get<{ staff: Record<string, any>; records: Array<Record<string, any>> }>(`/disciplinary/history/${staffNo}`),
  })
  const s = data?.staff
  return (
    <PrintPage title="Staff Disciplinary Record" subtitle={s?.fullName} loading={isLoading} error={error ? errorMessage(error) : null}>
      {s && data && (
        <>
          <PrintParticulars
            items={[
              ['Name', s.fullName],
              ['Staff number', s.staffNo],
              ['Designation', s.jobTitle],
              ['Unit', s.unitName],
              ['Category', s.staffGroup ? GROUP_LABELS[s.staffGroup] : null],
              ['Status', s.staffStatus],
            ]}
          />
          <PrintSection>Summary</PrintSection>
          <PrintTable
            head={[...DISCIPLINARY_ACTIONS.map(statusLabel), 'Total']}
            rows={[[...DISCIPLINARY_ACTIONS.map((a) => data.records.filter((r) => r.actionType === a).length), data.records.length]]}
          />
          <PrintSection>Actions</PrintSection>
          <PrintTable
            empty="No disciplinary action on record."
            head={['#', 'Date issued', 'Action taken', 'Reason', 'Remark']}
            rows={data.records.map((r, i) => [i + 1, date(r.issueDate), statusLabel(r.actionType ?? ''), r.reason, r.remark])}
          />
        </>
      )}
    </PrintPage>
  )
}
