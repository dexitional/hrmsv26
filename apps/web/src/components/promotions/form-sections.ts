// The sections of the legacy promotion application form (promotion_data), in
// the order they appear on the paper form.
export const FORM_SECTIONS: Array<[string, string]> = [
  ['firstDegreeDetails', 'First degree(s)'],
  ['pgDegreeDetails', 'Postgraduate degree(s)'],
  ['otherQualification', 'Other qualifications'],
  ['areaSpecialization', 'Area(s) of specialization'],
  ['prizesGrantAward', 'Prizes, grants and awards'],
  ['previousPostDuties', 'Duties in previous post(s)'],
  ['teachingDutiesExperience', 'Teaching duties and experience'],
  ['researchMajorProjects', 'Research and major projects'],
  ['conferenceSeminarsEtc', 'Conferences, seminars and workshops'],
  ['publicationsForPreviousPromotion', 'Publications submitted for previous promotion'],
  ['newPublicationSubmitted', 'New publications submitted'],
  ['professionalMembershipBodies', 'Membership of professional bodies'],
  ['studAppraisal', 'Student appraisal'],
  ['otherRelevantInfo', 'Other relevant information'],
]

/** Legacy uploads live on the staff portal server; only our own are viewable. */
export const legacyFile = (path: string | null | undefined) => Boolean(path) && !path!.startsWith('/api/files/')
