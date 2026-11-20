import type { PROMOTION_DETAIL_FIELDS } from '#/lib/schemas'

type Meta = { label: string; short?: boolean; hint?: string }

/** The senior member's dossier, worded as the old promotion form asked for it. */
export const DETAIL_LABELS: Record<(typeof PROMOTION_DETAIL_FIELDS)[number], Meta> = {
  presentRank: { label: 'Present rank', short: true },
  prEdate: { label: 'Effective date (present rank)', short: true },
  presentRankIfany: { label: 'Present position held (if any)', short: true },
  ppEdate: { label: 'Effective date (position held)', short: true },
  areaSpecialization: { label: 'Areas of specialization' },
  firstDegreeDetails: { label: 'Details of first degrees', hint: 'State when and where obtained, class and/or special distinctions' },
  pgDegreeDetails: { label: 'Details of postgraduate degrees', hint: 'State when and where obtained, class and/or special distinctions (if any)' },
  otherQualification: { label: 'Other qualifications with dates', hint: 'State when and where obtained' },
  prizesGrantAward: { label: 'Prizes, travel grants and awards, with dates' },
  previousPostDuties: { label: 'Previous posts and duties held, with dates' },
  researchMajorProjects: { label: 'Details of research or major projects undertaken, with dates' },
  teachingDutiesExperience: { label: 'Details of teaching experience in a university of equivalent level' },
  conferenceSeminarsEtc: { label: 'Conferences, seminars, symposia, workshops, etc. attended', hint: 'Give details of papers presented' },
  publicationsForPreviousPromotion: {
    label: 'Publications submitted in support of previous application for promotion',
    hint: 'Give details of books and articles and state exact references',
  },
  newPublicationSubmitted: {
    label: 'Publications submitted in support of current application for promotion',
    hint: 'Give details of books and articles and state exact references. Copies of articles and other publications (where possible) should accompany the application',
  },
  professionalMembershipBodies: { label: 'Membership of professional / learned bodies' },
  otherRelevantInfo: { label: 'Any other relevant information, with dates', hint: 'Public service, college or national committees, etc., on which you have served' },
}

/** Where the old form worded a section differently for non-academic senior members. */
const NON_ACADEMIC: Partial<Record<(typeof PROMOTION_DETAIL_FIELDS)[number], Meta>> = {
  previousPostDuties: { label: 'Previous posts and duties held, with dates, before joining the University' },
  teachingDutiesExperience: { label: 'Posts and duties, with dates, held in this University' },
  conferenceSeminarsEtc: {
    label: 'Particulars of conferences, special seminars and workshops in which you have participated',
    hint: 'Please list papers you read (if any)',
  },
}

/** The long-answer sections of the senior members' form, in the old form's order (research for academic staff only). */
export function dossierSections(academic: boolean) {
  const order = [
    'firstDegreeDetails',
    'pgDegreeDetails',
    'otherQualification',
    'prizesGrantAward',
    'previousPostDuties',
    ...(academic ? (['researchMajorProjects'] as const) : []),
    'teachingDutiesExperience',
    'conferenceSeminarsEtc',
    'publicationsForPreviousPromotion',
    'newPublicationSubmitted',
    'professionalMembershipBodies',
    'otherRelevantInfo',
  ] as const
  return order.map((key) => ({ key, ...(academic ? DETAIL_LABELS[key] : (NON_ACADEMIC[key] ?? DETAIL_LABELS[key])) }))
}

export const TYPE_LABELS: Record<number, string> = { 0: 'Promotion', 1: 'Contract renewal', 2: 'Appointment' }
export const RETURN_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 8, label: 'Updated CV' },
  { value: 9, label: 'Updated papers' },
  { value: 11, label: 'Updated application form / letter' },
  { value: 10, label: 'CV, papers and application form' },
]
