// Values shared by the database schema, the API and the web app. The lists
// mirror ENUM columns in the legacy HR schema and in migrations/.

export const USER_ROLES = ['administrator', 'hr_officer', 'it_support', 'viewer'] as const
export type UserRole = (typeof USER_ROLES)[number]

/** Staff category (staff.staff_group). */
export const STAFF_GROUPS = ['SM', 'SS', 'JS'] as const
export type StaffGroup = (typeof STAFF_GROUPS)[number]

/** Employment statuses offered on the staff form (staff.staff_status). */
export const STAFF_STATUSES = ['PERMANENT', 'TEMPORAL', 'CASUAL', 'PART-TIME', 'CONTRACT', 'RETIRED', 'DEAD'] as const
/** Further statuses found in legacy records. */
export const LEGACY_STAFF_STATUSES = ['RESIGNED', 'DISMISSED', 'ABSENCE', 'SECONDMENT'] as const
/** Statuses listed under the "Active" staff tab. */
export const ACTIVE_STAFF_STATUSES = ['PERMANENT', 'TEMPORAL', 'CASUAL', 'PART-TIME', 'SECONDMENT'] as const

export const ELEVATION_TYPES = ['APPOINTMENT', 'PROMOTION', 'UPGRADE'] as const
export type ElevationType = (typeof ELEVATION_TYPES)[number]

export const LEAVE_STATUSES = [
  'STAFF-PENDING',
  'HEAD-PENDING',
  'HEAD-REJECTED',
  'HR-PENDING',
  'HR-REJECTED',
  'GRANTED',
  'ENDED',
  'CANCELLED',
] as const
export type LeaveStatus = (typeof LEAVE_STATUSES)[number]

export const POSTS = [
  'VC',
  'PRO-VC',
  'REGISTRAR',
  'PROVOST',
  'DIRECTOR',
  'DEPUTY-DIRECTOR',
  'DEAN',
  'VICE-DEAN',
  'COORDINATOR',
  'HEAD',
] as const

export const UNIT_TYPES = ['ACADEMIC', 'NON-ACADEMIC'] as const
export const UNIT_LEVELS = ['1', '2', '3', '4'] as const
export const SCALE_LEVELS = ['L', 'H', 'AH'] as const
export const HOLIDAY_CATEGORIES = ['FESTIVE', 'PUBLIC', 'BREAK'] as const
export const MARITAL_STATUSES = ['SINGLE', 'MARRIED', 'SEPARATED', 'WIDOW', 'DIVORCED'] as const

/** Personal documents kept in the legacy `doc` table, by category. */
export const DOC_CATEGORIES = ['MARITAL', 'BIRTH', 'MEDICAL', 'CV'] as const
export type DocCategory = (typeof DOC_CATEGORIES)[number]

export const GHANA_REGIONS = [
  'AHAFO',
  'ASHANTI',
  'BONO',
  'BONO EAST',
  'CENTRAL',
  'EASTERN',
  'GREATER ACCRA',
  'NORTH EAST',
  'NORTHERN',
  'OTI',
  'SAVANNAH',
  'UPPER EAST',
  'UPPER WEST',
  'VOLTA',
  'WESTERN',
  'WESTERN NORTH',
] as const

/** Statutory retirement age. */
export const RETIREMENT_AGE = 60

// ---------------------------------------------------------------- Added modules

export const RELATIONS = ['SPOUSE', 'CHILD', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'SIBLING', 'WARD', 'NEPHEW', 'NIECE', 'UNCLE', 'AUNT', 'GUARDIAN', 'OTHER'] as const

/** Qualification types (certificate.cert_rate). */
export const QUALIFICATION_TYPES = ['PHD', 'MASTERS', 'DEGREE', 'POST-DIPLOMA', 'HND', 'DIPLOMA', 'PROFESSIONAL', 'TRADETEST', 'SSCE-WASSCE', 'A-LEVEL', 'O-LEVEL', 'BECE-MSLC'] as const

export const DISCIPLINARY_ACTIONS = ['WARNING', 'SUSPENSION', 'INTERDICTION', 'DISMISSAL', 'TERMINATION'] as const

/**
 * Intention-to-study applications (study_intention.appstatus): the stage the
 * application has reached. 0–4 come from the staff portal; 5/6 are HR's final
 * decision. stage_status: 0 pending, 1 approved, 2 declined at that stage.
 */
export const STUDY_STAGES: Record<number, string> = {
  0: 'Draft',
  1: 'Awaiting head of unit',
  2: 'Awaiting dean / director',
  3: 'Awaiting provost / registrar',
  4: 'Awaiting HR',
  5: 'Approved by HR',
  6: 'Declined by HR',
  7: 'Closed (legacy)',
}
export const STUDY_LEAVE_STATUSES = ['ON_LEAVE', 'RESUMED', 'EXTENDED', 'ABANDONED'] as const
export const STUDY_TYPES = ['FULL', 'PART'] as const
export const STUDY_NATURES = ['REGULAR', 'WEEKEND', 'SANDWICH', 'DISTANCE', 'ONLINE', 'OTHER'] as const

/**
 * Promotion / appointment applications (staff_promotion.promo_status): the
 * level reached. 0–4 move through the unit, faculty and college; from 4 the
 * Directorate of HR works through the hr_variable steps.
 */
export const PROMOTION_LEVELS: Record<number, string> = {
  0: 'Submitted',
  1: 'Head of department',
  2: 'Dean / faculty',
  3: 'College / provost',
  4: 'Directorate of HR',
  5: 'With assessors',
  6: 'A&P board',
  7: 'Approved',
  8: 'Disapproved',
}
/** staff_promotion.type */
export const APPLICATION_TYPES: Record<number, string> = { 0: 'Promotion', 1: 'Contract renewal', 2: 'Appointment' }
export const PROMOTION_KINDS = ['REGULAR PROMOTION', 'ACCELERATED PROMOTION', 'EXCEPTIONAL PROMOTION'] as const
