import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { STUDY_STAGES } from '@hrms/db/types'
import { api, errorMessage } from '#/lib/api-client'
import { date, dateTime } from '#/lib/format'
import { statusLabel } from '#/lib/labels'
import { PrintPage, PrintParticulars, PrintSection, PrintTable } from '#/components/print/sheet'

export const Route = createFileRoute('/print/study-intention/$id')({
  // ?from=portal: the staff member's own; ?from=manage: a head's team member (staff portal).
  validateSearch: z.object({ from: z.enum(['portal', 'manage']).optional() }),
  head: () => ({ meta: [{ title: 'Intention to pursue further studies · UCC HRMS' }] }),
  component: PrintIntention,
})

function PrintIntention() {
  const { id } = Route.useParams()
  const { from } = Route.useSearch()
  const endpoint = from === 'portal' ? `/portal/study/intentions/${id}` : from === 'manage' ? `/portal/manage/study/${id}` : `/study/intentions/${id}`
  const { data: a, isLoading, error } = useQuery({ queryKey: ['study-intention', id, from ?? 'admin'], queryFn: () => api.get<Record<string, any>>(endpoint) })
  return (
    <PrintPage
      title="Intention to Pursue Further Studies"
      subtitle={a ? `Application #${a.id} · ${a.stageLabel ?? STUDY_STAGES[a.appstatus]}` : undefined}
      loading={isLoading}
      error={error ? errorMessage(error) : null}
      backTo={from === 'portal' ? '/portal/study' : from === 'manage' ? '/portal/manage/study' : '/admin/study'}
    >
      {a && (
        <>
          <PrintSection>A. Particulars of applicant</PrintSection>
          <PrintParticulars
            items={[
              ['Name', a.fullName],
              ['Staff number', a.staffNo],
              ['Present rank', a.presentRank],
              ['College', a.college],
              ['Department / unit', a.department || a.unitName],
              ['Highest education', a.highEdu],
              ['Previous study leave', a.studyLeave],
              ['Date submitted', date(a.subDate)],
            ]}
          />
          <PrintSection>B. Intended programme of study</PrintSection>
          <PrintParticulars
            items={[
              ['Programme', a.intProg],
              ['Institution', a.studyPlace],
              ['Date of commencement', date(a.dateCommence, 'long')],
              ['Duration', a.progDuration],
              ['Programme type', a.progType === '1' ? 'Full-time' : a.progType === '2' ? 'Part-time' : a.progType],
              ['Mode of study', [statusLabel(a.studyMode ?? ''), a.otherStudyMode].filter(Boolean).join(' — ')],
              ['Sponsorship sought', a.sponsorKind],
              ['Other scholarship', a.otherScholarship],
              ['Estimated fees', a.estimatedFees],
            ]}
          />
          <table className="mb-4 text-[10pt]">
            <tbody>
              <tr>
                <td className="cell">
                  <span className="font-bold">Relevance of the programme to the applicant's work and the University:</span>
                  <p className="mt-1 font-sans text-[9.5pt] whitespace-pre-line">{a.progRelevance || '—'}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <PrintSection>C. Recommendations & approvals</PrintSection>
          <PrintTable
            empty="No recommendations recorded."
            head={['Date', 'Stage', 'Decision', 'By', 'Comments']}
            rows={a.activities.map((x: Record<string, any>) => [dateTime(x.activityDate), STUDY_STAGES[Number(x.promoStatus) - 1] ?? x.promoStatus, x.stageActivity, [x.userName, x.unitName].filter(Boolean).join(', '), x.comments])}
          />
          <table className="print-avoid-break mt-6 text-[10pt]">
            <tbody>
              <tr className="h-[22mm]">
                <td className="cell w-1/2 align-bottom">Director, Human Resource (signature & date)</td>
                <td className="cell align-bottom">Decision: {a.stageLabel}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </PrintPage>
  )
}
