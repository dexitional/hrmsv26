import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PROMOTION_LEVELS } from '@hrms/db/types'
import { api, errorMessage } from '#/lib/api-client'
import { date, dateTime } from '#/lib/format'
import { GROUP_LABELS } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintSection, PrintTable } from '#/components/print/sheet'
import { FORM_SECTIONS } from '#/components/promotions/form-sections'

export const Route = createFileRoute('/print/promotion/$id')({
  head: () => ({ meta: [{ title: 'Application for appointment / promotion · UCC HRMS' }] }),
  component: PrintPromotion,
})

function PrintPromotion() {
  const { id } = Route.useParams()
  const { data: a, isLoading, error } = useQuery({ queryKey: ['promotion', id], queryFn: () => api.get<Record<string, any>>(`/promotions/applications/${id}`) })
  const form = a?.form
  return (
    <PrintPage
      title={a ? `Application for ${a.type === 1 ? 'Renewal of Contract' : a.type === 2 ? 'Appointment' : 'Promotion'}` : 'Application'}
      subtitle={a ? `#${a.id} · ${a.fullName} · ${PROMOTION_LEVELS[a.promoStatus] ?? ''}` : undefined}
      loading={isLoading}
      error={error ? errorMessage(error) : null}
    >
      {a && (
        <>
          <PrintSection>A. Particulars of applicant</PrintSection>
          <PrintParticulars
            items={[
              ['Name', a.fullName],
              ['Staff number', a.staffNo],
              ['Present rank', a.staff?.jobTitle ?? a.currentTitle],
              ['Position applied for', a.positionTitle],
              ['Department', form?.dept ?? a.unitName],
              ['College', form?.college],
              ['Category', a.staff?.staffGroup ? GROUP_LABELS[a.staff.staffGroup] : null],
              ['Kind of application', a.type === 0 ? a.promoComments : a.typeLabel],
              ['Date of first appointment', date(a.staff?.firstAppointDate)],
              ['Present rank since', date(form?.prEdate)],
              ['Email', form?.email ?? a.staff?.uccMail],
              ['Telephone', form?.tel ?? a.staff?.phone],
            ]}
          />
          {form && (
            <>
              <PrintSection>B. Application details</PrintSection>
              {FORM_SECTIONS.filter(([k]) => form[k]).map(([k, label]) => (
                <section key={k} className="print-avoid-break mb-3">
                  <p className="text-[10pt] font-bold">{label}</p>
                  <div className="report-content font-sans text-[9.5pt]" dangerouslySetInnerHTML={{ __html: form[k] }} />
                </section>
              ))}
            </>
          )}
          {a.papers.length > 0 && (
            <>
              <PrintSection>C. Papers submitted</PrintSection>
              <PrintTable head={['#', 'Title']} rows={a.papers.map((p: Record<string, any>, i: number) => [i + 1, p.title])} />
            </>
          )}
          {a.assessors.length > 0 && (
            <>
              <PrintSection>D. Assessors</PrintSection>
              <PrintTable head={['Name', 'Rank', 'Institution', 'Specialization']} rows={a.assessors.map((x: Record<string, any>) => [`${x.fname} ${x.lname}`, x.eduLevel, x.institution, x.specialArea])} />
            </>
          )}
          <PrintSection>{a.assessors.length ? 'E' : 'D'}. Processing record</PrintSection>
          <PrintTable
            head={['Date', 'Stage', 'Action', 'By', 'Comments']}
            rows={a.activities.map((x: Record<string, any>) => [dateTime(x.activityDate), PROMOTION_LEVELS[Number(x.promoStatus)] ?? '', x.stageActivity, [x.userName, x.unitName].filter(Boolean).join(', '), x.comments])}
          />
          <table className="print-avoid-break mt-6 text-[10pt]">
            <tbody>
              <tr className="h-[22mm]">
                <td className="cell w-1/2 align-bottom">Director, Human Resource (signature & date)</td>
                <td className="cell align-bottom">Current status: {PROMOTION_LEVELS[a.promoStatus]}{a.hrStepLabel ? ` — ${a.hrStepLabel}` : ''}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </PrintPage>
  )
}
