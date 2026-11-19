import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api, errorMessage } from '#/lib/api-client'
import { date } from '#/lib/format'
import { PrintPage, PrintParticulars, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/transfers/$staffNo')({
  head: () => ({ meta: [{ title: 'Transfer history · UCC HRMS' }] }),
  component: PrintTransfers,
})

function PrintTransfers() {
  const { staffNo } = Route.useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['transfer-history', staffNo],
    queryFn: () => api.get<{ staff: Record<string, any>; transfers: Array<Record<string, any>> }>(`/transfers/history/${staffNo}`),
  })
  const s = data?.staff
  return (
    <PrintPage landscape title="Staff Transfer Sheet" subtitle={s?.fullName} loading={isLoading} error={error ? errorMessage(error) : null}>
      {s && (
        <>
          <PrintParticulars items={[['Name', s.fullName], ['Staff number', s.staffNo], ['Designation', s.jobTitle], ['Current unit', s.unitName]]} />
          <PrintTable
            empty="No transfers recorded."
            head={['#', 'Date', 'Transferred from', 'Transferred to', 'Reason', 'Remarks', 'Approved on', 'Approved by']}
            rows={data!.transfers.map((t, i) => [i + 1, date(t.transferDate), t.fromUnitName, t.toUnitName, t.reason, t.remark, date(t.approvedDate), t.approvedBy ? `${t.approverName ?? ''} (${t.approvedBy})` : null])}
          />
        </>
      )}
    </PrintPage>
  )
}
