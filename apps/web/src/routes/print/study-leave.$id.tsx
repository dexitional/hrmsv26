import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api, errorMessage } from '#/lib/api-client'
import { date } from '#/lib/format'
import { statusLabel } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintSection } from '#/components/print/sheet'

export const Route = createFileRoute('/print/study-leave/$id')({
  head: () => ({ meta: [{ title: 'Study leave record · UCC HRMS' }] }),
  component: PrintStudyLeave,
})

function PrintStudyLeave() {
  const { id } = Route.useParams()
  const { data: l, isLoading, error } = useQuery({ queryKey: ['study-leave', id], queryFn: () => api.get<Record<string, any>>(`/study/leaves/${id}`) })
  const who = (no: number | null) => (no ? `${l?.names?.[no] ?? ''} (${no})` : null)
  return (
    <PrintPage title="Study Leave Record" subtitle={l?.fullName} loading={isLoading} error={error ? errorMessage(error) : null}>
      {l && (
        <>
          <PrintParticulars items={[['Name', l.fullName], ['Staff number', l.staffNo], ['Designation', l.jobTitle], ['Unit', l.unitName]]} />
          <PrintSection>Programme</PrintSection>
          <PrintParticulars
            items={[
              ['Programme', l.studyProgram],
              ['Institution', l.studyInstitute],
              ['Country', l.studyCountry],
              ['Type / mode', `${l.studyType === 'PART' ? 'Part-time' : 'Full-time'} · ${statusLabel(l.studyNature ?? '')}${l.studyNatureOther ? ` (${l.studyNatureOther})` : ''}`],
              ['Period', `${date(l.studyStart)} – ${date(l.studyEnd)}`],
              ['Duration', l.studyPeriod ? `${l.studyPeriod} years` : null],
              ['Benefits', [...(l.benefitTitles ?? []), l.studyBenefitOther].filter(Boolean).join('; ')],
              ['Status', statusLabel(l.status ?? '')],
            ]}
          />
          <PrintSection>Guarantors & supervisors</PrintSection>
          <PrintParticulars items={[['Guarantor 1', who(l.studyGurantor1)], ['Guarantor 2', who(l.studyGurantor2)], ['Supervisor 1', who(l.studySupervisor1)], ['Supervisor 2', who(l.studySupervisor2)]]} />
          <PrintSection>Emergency contact</PrintSection>
          <PrintParticulars items={[['Name', l.studyReferName], ['Relation', l.studyReferRelation], ['Phone', l.studyReferPhone], ['Email', l.studyReferEmail], ['Address', l.studyReferAddress]]} />
          <PrintSection>Completion & bond</PrintSection>
          <PrintParticulars
            items={[
              ['Certificate obtained', l.studyCertTitle],
              ['Certificate validity', l.studyCertValidity],
              ['Resumption / bond start', date(l.studyBondStart)],
              ['Bond end', date(l.studyBondEnd)],
              ['Bond period', l.studyBondPeriod ? `${l.studyBondPeriod} years` : null],
              ['Remark', l.remark],
            ]}
          />
        </>
      )}
    </PrintPage>
  )
}
