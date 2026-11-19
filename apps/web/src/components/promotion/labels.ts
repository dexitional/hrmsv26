import type { PROMOTION_DETAIL_FIELDS } from '#/lib/schemas'

/** The senior member's dossier, in the order the old form asked for it. */
export const DETAIL_LABELS: Record<(typeof PROMOTION_DETAIL_FIELDS)[number], { label: string; short?: boolean; hint?: string }> = {
  presentRank: { label: 'Present rank', short: true },
  prEdate: { label: 'Date appointed to present rank', short: true },
  presentRankIfany: { label: 'Previous rank (if any)', short: true },
  ppEdate: { label: 'Date appointed to previous rank', short: true },
  areaSpecialization: { label: 'Area of specialization' },
  firstDegreeDetails: { label: 'First degree', hint: 'Institution, class and year' },
  pgDegreeDetails: { label: 'Postgraduate degrees', hint: 'Institution, degree and year for each' },
  otherQualification: { label: 'Other qualifications' },
  prizesGrantAward: { label: 'Prizes, grants and awards' },
  previousPostDuties: { label: 'Duties in previous posts' },
  teachingDutiesExperience: { label: 'Teaching duties and experience' },
  researchMajorProjects: { label: 'Research and major projects' },
  conferenceSeminarsEtc: { label: 'Conferences, seminars and workshops' },
  publicationsForPreviousPromotion: { label: 'Publications submitted for your previous promotion' },
  newPublicationSubmitted: { label: 'New publications for this promotion' },
  professionalMembershipBodies: { label: 'Professional bodies' },
  otherRelevantInfo: { label: 'Other relevant information' },
}

export const TYPE_LABELS: Record<number, string> = { 0: 'Promotion', 1: 'Contract renewal', 2: 'Appointment' }
export const RETURN_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 8, label: 'Updated CV' },
  { value: 9, label: 'Updated papers' },
  { value: 11, label: 'Updated application form / letter' },
  { value: 10, label: 'CV, papers and application form' },
]
