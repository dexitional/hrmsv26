// Validation shared by the admin forms (via zodResolver) and the API (via
// validate()), so a rule is written once and enforced on both sides. Field
// names are camelCase versions of the legacy HR columns (staffNo → staff_no).
import { z } from 'zod'
import {
  ELEVATION_TYPES,
  HOLIDAY_CATEGORIES,
  LEGACY_STAFF_STATUSES,
  MARITAL_STATUSES,
  POSTS,
  SCALE_LEVELS,
  STAFF_GROUPS,
  STAFF_STATUSES,
  UNIT_LEVELS,
  UNIT_TYPES,
  USER_ROLES,
  DISCIPLINARY_ACTIONS,
  PROMOTION_KINDS,
  QUALIFICATION_TYPES,
  RELATIONS,
  STUDY_LEAVE_STATUSES,
  STUDY_NATURES,
  STUDY_TYPES,
} from '@hrms/db/types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v)

const req = (max = 255, message = 'Required') => z.string().trim().min(1, message).max(max)
const opt = (max = 255) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable()).transform((v) => (v ? v : null))
const optEmail = (max = 150) =>
  z.preprocess(emptyToNull, z.string().trim().toLowerCase().email('Enter a valid email').max(max).nullable())
const date = z.string().regex(ISO_DATE, 'Pick a date')
const optDate = z.preprocess(emptyToNull, z.string().regex(ISO_DATE, 'Pick a date').nullable())
const id = (message = 'Choose one') => z.coerce.number({ error: message }).int().positive(message)
const optId = z.preprocess((v) => (v === '' || v == null ? null : Number(v)), z.number().int().positive().nullable())
const optInt = (min: number, max: number) =>
  z.preprocess((v) => (v === '' || v == null ? null : Number(v)), z.number().int().min(min).max(max).nullable())
const optEnum = <T extends readonly [string, ...Array<string>]>(values: T) =>
  z.preprocess(emptyToNull, z.enum(values).nullable())
const staffNo = z.coerce.number({ error: 'Enter a staff number' }).int().positive('Enter a staff number')
const optStaffNo = optInt(1, 99_999_999)
const year = z.coerce.number({ error: 'Enter a year' }).int().min(1950).max(2100)
const days = z.coerce.number({ error: 'Enter the number of days' }).int().min(0).max(366)
const file = z.object({ url: z.string().max(500), name: z.string().max(255) }).nullable().default(null)

const datesInOrder = (startKey: string, endKey: string) => (v: Record<string, unknown>, ctx: z.RefinementCtx) => {
  const start = v[startKey]
  const end = v[endKey]
  if (typeof start === 'string' && typeof end === 'string' && end < start) {
    ctx.addIssue({ code: 'custom', path: [endKey], message: 'Must be on or after the start date' })
  }
}

// ---------------------------------------------------------------- Accounts

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().default(''),
    newPassword: z.string().min(8, 'Use at least 8 characters').max(200),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })

export const userSchema = z.object({
  fullName: req(150),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(190),
  role: z.enum(USER_ROLES),
  staffNo: optStaffNo,
  isActive: z.boolean().default(true),
  // Optional: accounts without a password sign in with Google only.
  password: z.preprocess(emptyToNull, z.string().min(8, 'Use at least 8 characters').max(200).nullable()),
})

// ---------------------------------------------------------------- Utilities

export const scaleSchema = z.object({
  grade: req(50),
  notch: z.coerce.number({ error: 'Enter the notch' }).int().min(1).max(60),
  level: optEnum(SCALE_LEVELS),
  gradeNum: optInt(0, 999),
  notchAmount: z.coerce.number().min(0).max(1e9).default(0),
  staffGroup: optEnum(STAFF_GROUPS),
  active: z.boolean().default(true),
})

export const unitSchema = z.object({
  longName: req(300),
  shortName: opt(60),
  unitCode: opt(50),
  type: optEnum(UNIT_TYPES),
  level: optEnum(UNIT_LEVELS),
  parentId: optId,
  unitHead: optStaffNo,
  unitSubhead: optStaffNo,
  location: opt(255),
  active: z.boolean().default(true),
})

export const jobSchema = z.object({
  title: req(255),
  type: optEnum(['ACADEMIC', 'NON-ACADEMIC'] as const),
  rankYears: optInt(0, 50),
  staffGroup: optEnum(STAFF_GROUPS),
  upgradable: z.boolean().default(false),
  active: z.boolean().default(true),
})

export const mergeSchema = z.object({
  masterId: id('Enter the ID of the master record'),
})

export const positionSchema = z
  .object({
    staffNo,
    title: req(255),
    post: optEnum(POSTS),
    unitId: id('Choose the unit of jurisdiction'),
    unitDomain: opt(300),
    access: optEnum(['HEAD', 'SUBHEAD'] as const),
    startDate: date,
    endDate: date,
    active: z.boolean().default(true),
    remark: opt(2000),
  })
  .superRefine(datesInOrder('startDate', 'endDate'))

export const dobChangeSchema = z.object({
  dob: date.refine((v) => v < new Date().toISOString().slice(0, 10), 'Must be in the past'),
  reason: req(1000, 'Give the reason for the change'),
  evidenceUrl: opt(500),
})

// ---------------------------------------------------------------- Staff

export const staffSchema = z
  .object({
    // On create: "new" staff get the next staff number; "existing" staff (being
    // captured from paper records) keep the number they already have.
    numbering: z.enum(['new', 'existing']).default('existing'),
    staffNo: optStaffNo,
    title: opt(100),
    fname: req(100),
    mname: opt(150),
    lname: req(100),
    gender: z.enum(['M', 'F'], { error: 'Choose a gender' }),
    dob: date,
    hometown: opt(100),
    district: opt(100),
    region: opt(100),
    nationality: opt(80),
    phone: opt(15),
    email: optEmail(150),
    paddress: opt(1000),
    address: opt(255),
    emergencyName: opt(150),
    emergencyRelation: opt(80),
    emergencyPhone: opt(30),
    emergencyAddress: opt(300),
    mstatus: optEnum(MARITAL_STATUSES),
    ssnit: opt(25),
    ghanaCardNo: opt(30),
    uccMail: optEmail(255),
    staffStatus: z.enum([...STAFF_STATUSES, ...LEGACY_STAFF_STATUSES], { error: 'Choose a status' }),
    firstAppointDate: optDate,
    assumeDate: optDate,
    probation: optInt(0, 10),
    jobId: id('Choose the designation'),
    unitId: id('Choose the unit'),
    scaleId: optId,
    staffGroup: z.enum(STAFF_GROUPS, { error: 'Choose a category' }),
    docs: z
      .object({ MARITAL: file, BIRTH: file, MEDICAL: file, CV: file })
      .default({ MARITAL: null, BIRTH: null, MEDICAL: null, CV: null }),
  })
  .superRefine((v, ctx) => {
    if (v.numbering === 'existing' && !v.staffNo) {
      ctx.addIssue({ code: 'custom', path: ['staffNo'], message: 'Enter the staff number' })
    }
  })

// ---------------------------------------------------------------- Leave

export const leaveTypeSchema = z.object({
  title: req(255),
  desc: opt(1000),
  active: z.boolean().default(true),
})

export const holidaySchema = z.object({
  holiday: date,
  desc: req(355),
  category: optEnum(HOLIDAY_CATEGORIES),
  active: z.boolean().default(true),
})

export const leaveConstantSchema = z.object({
  weight: days,
  type: z.enum(['ADD', 'SUB'], { error: 'Choose add or deduct' }),
  category: optEnum(STAFF_GROUPS),
  year,
  desc: req(1000),
  // Staff numbers left out of this adjustment.
  exclusion: z.array(z.coerce.number().int().positive()).max(5000).default([]),
  active: z.boolean().default(true),
})

export const entitlementSchema = z.object({
  typeId: id('Choose the leave type'),
  group: z.enum(STAFF_GROUPS, { error: 'Choose a category' }),
  // Designations this entitlement applies to; empty = the whole category.
  jobs: z.array(z.coerce.number().int().positive()).max(1000).default([]),
  weight: days,
})

export const leaveBalanceSchema = z.object({
  staffNo,
  weight: days,
  year,
  history: opt(1000),
  active: z.boolean().default(true),
})

export const leaveDeferSchema = z.object({
  staffNo,
  weight: days,
  year,
  reason: req(2000),
})

export const staffNoSchema = z.object({ staffNo })

export const leaveActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'end', 'cancel']),
  remark: opt(1000),
})

// ---------------------------------------------------------------- Elevation

export const elevationSchema = z
  .object({
    type: z.enum(ELEVATION_TYPES),
    staffNo,
    // Assumption date for appointments; effective date for promotions/upgrades.
    appointDate: date,
    confirmDate: optDate,
    letterDate: optDate,
    probation: optInt(0, 10),
    jobId: id('Choose the designation'),
    unitId: optId,
    scaleId: optId,
    staffGroup: z.enum(STAFF_GROUPS, { error: 'Choose a category' }),
    remark: opt(2000),
    // Make this the staff member's current appointment (their job, grade,
    // unit and category follow it).
    makeCurrent: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.type === 'APPOINTMENT' && !v.unitId) {
      ctx.addIssue({ code: 'custom', path: ['unitId'], message: 'Choose the unit' })
    }
  })

export const confirmSchema = z.object({ confirmDate: date })

export const renewalSchema = z
  .object({
    staffNo,
    renewalPeriod: z.coerce.number({ error: 'Enter the years' }).int().min(1).max(10),
    startDate: date,
    endDate: date,
  })
  .superRefine(datesInOrder('startDate', 'endDate'))

export const postRetireSchema = z
  .object({
    staffNo,
    served: z.coerce.number({ error: 'Enter the years' }).int().min(1).max(10),
    startPost: date,
    endPost: date,
    remark: opt(2000),
  })
  .superRefine(datesInOrder('startPost', 'endPost'))

// ---------------------------------------------------------------- Transfers

export const transferSchema = z
  .object({
    staffNo,
    transferDate: date,
    fromUnit: id('Choose the unit transferred from'),
    toUnit: id('Choose the unit transferred to'),
    reason: req(2000),
    remark: opt(2000),
    approvedDate: optDate,
    approvedBy: optStaffNo,
    // A new transfer moves the staff member to the new unit now; recording an
    // existing (past) transfer only adds it to their history.
    effectNow: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.fromUnit === v.toUnit) {
      ctx.addIssue({ code: 'custom', path: ['toUnit'], message: 'Must differ from the unit transferred from' })
    }
  })

export const transferDecisionSchema = z.object({
  transferDate: optDate,
  remark: opt(2000),
})

// ---------------------------------------------------------------- NSS

export const nssSchema = z
  .object({
    nssNo: req(40),
    fname: req(255),
    mname: opt(255),
    lname: req(255),
    mobile: opt(20),
    email: optEmail(355),
    gender: z.enum(['M', 'F'], { error: 'Choose a gender' }),
    dob: optDate,
    hometown: opt(300),
    unitId: id('Choose the assigned unit'),
    ghcardNo: opt(50),
    photo: opt(500),
    nssForm: opt(500),
    address: opt(1000),
    emergencyAddress: opt(300),
    emergencyPhone: opt(30),
    emergencyEmail: optEmail(190),
    startDate: date,
    endDate: date,
  })
  .superRefine(datesInOrder('startDate', 'endDate'))

// ---------------------------------------------------------------- Staff sub-records

export const relativeSchema = z.object({
  relation: z.enum(RELATIONS, { error: 'Choose the relation' }),
  fname: req(255),
  mname: opt(255),
  lname: req(255),
  dob: optDate,
  gender: z.enum(['M', 'F'], { error: 'Choose a gender' }),
  phone: opt(20),
  address: opt(350),
  hometown: opt(150),
  kin: z.boolean().default(false),
  alive: z.boolean().default(true),
  photo: opt(255),
  path: opt(300),
  active: z.boolean().default(true),
})

export const bankSchema = z.object({
  bankName: req(255),
  accountNo: req(150),
  accountName: opt(350),
  accountBranch: opt(150),
  isDefault: z.boolean().default(false),
})

export const qualificationSchema = z
  .object({
    institution: req(355),
    qualify: req(2000, 'Enter the programme'),
    specialize: opt(2000),
    certRate: z.enum(QUALIFICATION_TYPES, { error: 'Choose the qualification' }),
    verified: z.boolean().default(false),
    path: opt(500),
    startDate: optDate,
    endDate: optDate,
    gradDate: optDate,
  })
  .superRefine(datesInOrder('startDate', 'endDate'))

// ---------------------------------------------------------------- Disciplinary

export const disciplinarySchema = z.object({
  staffNo,
  issueDate: date,
  reason: req(5000),
  actionType: z.enum(DISCIPLINARY_ACTIONS, { error: 'Choose the action taken' }),
  remark: opt(5000),
})

// ---------------------------------------------------------------- Study leave

export const studyDecisionSchema = z.object({
  decision: z.enum(['approve', 'decline']),
  comments: req(2000, 'Add a comment for the record'),
})

export const STUDY_MODES = ['REGULAR', 'SANDWICH', 'WEEKEND', 'ONLINE', 'EVENING', 'OTHERS'] as const
export const STUDY_SPONSORSHIPS = ['Study leave with pay only', 'Study leave without pay only', 'Study leave with pay and additional packages'] as const

/**
 * The declaration of intention to pursue further studies, as the staff
 * portal's form has it (legacy study_intention columns and sizes). HR edits
 * it on a staff member's behalf; the approval stage is not changed here.
 */
export const studyIntentionSchema = z
  .object({
    college: opt(150),
    department: opt(150),
    presentRank: opt(150),
    highEdu: opt(2000),
    studyLeave: opt(40),
    intProg: req(2000, 'Enter the intended programme'),
    studyPlace: req(2000, 'Enter the intended place of study'),
    dateCommence: optDate,
    progDuration: opt(15),
    progType: z.enum(['1', '2'], { error: 'Choose full- or part-time' }),
    studyMode: z.enum(STUDY_MODES, { error: 'Choose the mode of study' }),
    otherStudyMode: opt(200),
    sponsorKind: optEnum(STUDY_SPONSORSHIPS),
    otherScholarship: opt(80),
    estimatedFees: z.preprocess(emptyToNull, z.string().trim().regex(/^\d{1,12}(\.\d{1,2})?$/, 'Enter an amount, e.g. 4500.00').nullable()),
    progRelevance: opt(5000),
    subDate: optDate,
  })
  .superRefine((v, ctx) => {
    if (v.studyMode === 'OTHERS' && !v.otherStudyMode) ctx.addIssue({ code: 'custom', path: ['otherStudyMode'], message: 'Specify the mode of study' })
  })

export const studyLeaveSchema = z
  .object({
    staffNo,
    studyType: z.enum(STUDY_TYPES, { error: 'Choose full- or part-time' }),
    studyNature: z.enum(STUDY_NATURES, { error: 'Choose the mode of study' }),
    studyNatureOther: opt(255),
    studyProgram: req(400),
    studyInstitute: req(500),
    studyCountry: opt(300),
    studyStart: date,
    studyEnd: date,
    studyPeriod: optInt(0, 15),
    studyBenefits: z.array(z.coerce.number().int().positive()).max(20).default([]),
    studyBenefitOther: opt(500),
    studyGurantor1: optStaffNo,
    studyGurantor2: optStaffNo,
    studySupervisor1: optStaffNo,
    studySupervisor2: optStaffNo,
    studyReferName: opt(400),
    studyReferRelation: opt(255),
    studyReferAddress: opt(400),
    studyReferPhone: opt(15),
    studyReferEmail: optEmail(450),
    studyBondStart: optDate,
    studyBondEnd: optDate,
    studyBondPeriod: optInt(0, 20),
    studyCertTitle: opt(450),
    studyCertValidity: optEnum(['AUTHENTIC', 'FAKE'] as const),
    docPath: opt(450),
    status: z.enum(STUDY_LEAVE_STATUSES).default('ON_LEAVE'),
    remark: opt(2000),
    intentionId: optId,
    requestId: optId,
  })
  .superRefine(datesInOrder('studyStart', 'studyEnd'))
  .superRefine(datesInOrder('studyBondStart', 'studyBondEnd'))

export const studyBenefitSchema = z.object({ title: req(255) })

export const requestDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  remark: opt(2000),
})

// ---------------------------------------------------------------- Appointment & promotion

export const promotionApplicationSchema = z.object({
  staffNo,
  type: z.coerce.number().int().min(0).max(2),
  positionId: id('Choose the position applied for'),
  promoComments: z.enum(PROMOTION_KINDS).nullable().default('REGULAR PROMOTION'),
  appLetter: opt(500),
  applyForm: opt(500),
})

export const promotionActionSchema = z.discriminatedUnion('action', [
  // Move to a unit/faculty/college/HR level, or record an HR processing step.
  z.object({ action: z.literal('advance'), level: z.coerce.number().int().min(0).max(8), hrStep: opt(2), comments: opt(5000) }),
  // Send back to the applicant (and/or head) for corrections.
  z.object({ action: z.literal('return'), to: z.enum(['applicant', 'head']), comments: req(5000, 'Say what needs correcting') }),
  z.object({ action: z.literal('assessors'), assessors: z.array(z.coerce.number().int().positive()).max(6), comments: opt(5000) }),
  z.object({ action: z.literal('disapprove'), comments: req(5000, 'Give the reason') }),
])

export const effectPromotionSchema = z.object({
  appointDate: date,
  letterDate: optDate,
  scaleId: optId,
  staffGroup: z.enum(STAFF_GROUPS),
})

export const assessorSchema = z.object({
  fname: req(80),
  lname: req(80),
  email: optEmail(120),
  phoneNo: opt(20),
  institution: opt(80),
  eduLevel: opt(80),
  specialArea: opt(80),
  address: opt(150),
  city: opt(255),
  country: opt(80),
  active: z.boolean().default(true),
})

// ---------------------------------------------------------------- Leave applications

/** HR applying for leave on a staff member's behalf, or correcting a pending application. */
export const leaveApplicationSchema = z
  .object({
    staffNo,
    typeId: id('Choose the leave type'),
    startDate: date,
    endDate: date,
    relievedBy: optStaffNo,
    emergencyNote: opt(1000),
    emergencyContact: opt(20),
    applyNote: opt(5000),
    doc: opt(500),
    // Where the application goes: the head of unit first, or straight to HR.
    status: z.enum(['HEAD-PENDING', 'HR-PENDING']).default('HR-PENDING'),
  })
  .superRefine(datesInOrder('startDate', 'endDate'))
  .superRefine((v, ctx) => {
    if (v.relievedBy && v.relievedBy === v.staffNo) {
      ctx.addIssue({ code: 'custom', path: ['relievedBy'], message: 'The reliever must be someone else' })
    }
  })

// ---------------------------------------------------------------- Circulars

/** Longest SMS note: with the "DHR CIRCULAR (Ref…)" frame it stays within 3 SMS. */
export const CIRCULAR_SMS_MAX = 300

/**
 * Who a circular goes to. Nothing chosen = all active staff. Staff categories,
 * units and designations narrow the audience together ("SM in the Faculty of
 * Science"); heads-only keeps just the heads of the chosen (or all) units.
 * Named staff are always added on top.
 */
export const circularAudienceSchema = z.object({
  staffGroups: z.array(z.enum(STAFF_GROUPS)).default([]),
  unitIds: z.array(z.coerce.number().int().positive()).max(500).default([]),
  includeSubunits: z.boolean().default(true),
  headsOnly: z.boolean().default(false),
  jobIds: z.array(z.coerce.number().int().positive()).max(500).default([]),
  staffNos: z.array(z.coerce.number().int().positive()).max(10_000).default([]),
})

export const circularSchema = circularAudienceSchema
  .extend({
    letterNo: opt(100),
    subject: req(300, 'Enter the subject'),
    message: opt(10_000),
    smsNote: opt(CIRCULAR_SMS_MAX),
    attachment: opt(500),
    attachmentName: opt(255),
    sendSms: z.boolean().default(true),
    sendEmail: z.boolean().default(true),
    sendPortal: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (!v.sendSms && !v.sendEmail && !v.sendPortal)
      ctx.addIssue({ code: 'custom', path: ['sendPortal'], message: 'Choose at least one way to send the circular' })
    if (!v.message && !v.attachment)
      ctx.addIssue({ code: 'custom', path: ['message'], message: 'Write the message or attach the circular' })
  })

// ---------------------------------------------------------------- Staff portal

/**
 * A staff member's own leave application (the staff number comes from the
 * session): how many leave days and the expected start date. The server works
 * out the last day and the resumption date; the head assigns the reliever.
 */
export const portalLeaveSchema = z
  .object({
    typeId: id('Choose the leave type'),
    days: z.coerce.number({ error: 'Enter the number of leave days' }).int('Whole days only').min(1, 'Enter at least 1 day').max(366),
    startDate: date,
    emergencyContact: opt(20),
    emergencyNote: opt(1000),
    applyNote: opt(2000),
  })
  .superRefine((v, ctx) => {
    const today = new Date().toISOString().slice(0, 10)
    if (v.startDate < today) ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Leave cannot start in the past' })
  })

/** What staff may correct on their own record; HR keeps everything else. */
export const contactUpdateSchema = z.object({
  phone: opt(20),
  email: optEmail(150),
  address: opt(500),
  paddress: opt(500),
  emergencyName: opt(150),
  emergencyRelation: opt(60),
  emergencyPhone: opt(20),
  emergencyAddress: opt(300),
  ghanaCardNo: z.preprocess(
    emptyToNull,
    z.string().trim().toUpperCase().regex(/^GHA-\d{9}-\d$/, 'Use the format GHA-000000000-0').nullable(),
  ),
  nhisNumber: opt(30),
  nhisExpireDate: optDate,
})

export const SERVICE_CATEGORIES = ['IT', 'EDUROAM', 'XPAY', 'COUNSELLING', 'HR'] as const
export const SERVICE_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

export const serviceRequestSchema = z.object({
  category: z.enum(SERVICE_CATEGORIES),
  title: req(200, 'Say briefly what you need'),
  description: req(5000, 'Describe the request'),
  attachment: opt(500),
  attachmentName: opt(255),
})

export const serviceResponseSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'RESOLVED']),
  response: req(5000, 'Write a response for the staff member'),
})

export const leaveDecisionSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    remark: opt(1000),
    /** The head assigns who covers the staff member's duties while away. */
    relievedBy: optStaffNo,
  })
  .superRefine((v, ctx) => {
    if (v.decision === 'reject' && !v.remark) ctx.addIssue({ code: 'custom', path: ['remark'], message: 'Give a reason for rejecting' })
  })

// ---------------------------------------------------------------- Appraisals (legacy codes kept)

/** Form A ratings, as the legacy rows store them. */
export const APPRAISAL_RATINGS = { U: 'Unsatisfactory', S: 'Satisfactory', X: 'Successful', A: 'Above expectations', E: 'Exceptional' } as const
/** Overall rating values, exactly as the legacy portal stored them. */
export const OVERALL_RATINGS = ['Unsatisfactory', 'satisfactory', 'Successful', 'Above Expectations', 'Exceptional'] as const
export const REVIEW_PURPOSES = ['Annual Appraisal', 'Provisional Mid-Point', 'Special'] as const

const reviewYear = z.string().regex(/^20\d{2}$/, 'Choose the year under review')
const confirmed = z.literal(true, { error: 'Tick to confirm' })

/** Form B: the staff member's own self-appraisal. */
export const selfAppraisalSchema = z.object({
  year: reviewYear,
  supervisorName: req(150, 'Name your supervisor'),
  supervisorsRank: opt(100),
  accomplishments: req(5000, 'Describe your main accomplishments'),
  barriersChallenges: opt(5000),
  barriersChallengesGoal: opt(5000),
  strengthImprovement: opt(5000),
  newKnowledge: opt(5000),
  otherInformation: opt(5000),
  confirm: confirmed,
})

/** Form A: completed by the supervisor for a staff member. */
export const formASchema = z.object({
  purpose: z.enum(REVIEW_PURPOSES, { error: 'Choose the purpose of the review' }),
  answers: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        rating: z.enum(['U', 'S', 'X', 'A', 'E']).nullable(),
        example: opt(1000),
      }),
    )
    .min(1)
    .max(200),
  currYearObj: opt(5000),
  devNeeds: opt(5000),
  overallSummary: req(5000, 'Write the overall summary'),
  supRating: z.enum(OVERALL_RATINGS, { error: 'Choose the overall rating' }),
  confirm: confirmed,
})

/** The staff member's comments and sign-off on Form A. */
export const formASignSchema = z.object({ comments: opt(5000), confirm: confirmed })
export const countersignSchema = z.object({ confirm: confirmed })

// ---------------------------------------------------------------- Promotion applications (staff portal)

/** The senior member's dossier (legacy promotion_data columns). */
export const PROMOTION_DETAIL_FIELDS = [
  'presentRank',
  'prEdate',
  'presentRankIfany',
  'ppEdate',
  'areaSpecialization',
  'firstDegreeDetails',
  'pgDegreeDetails',
  'otherQualification',
  'prizesGrantAward',
  'previousPostDuties',
  'teachingDutiesExperience',
  'researchMajorProjects',
  'conferenceSeminarsEtc',
  'publicationsForPreviousPromotion',
  'newPublicationSubmitted',
  'professionalMembershipBodies',
  'otherRelevantInfo',
] as const

const paperSchema = z.object({
  title: req(500, 'Give the paper’s title'),
  file: opt(500),
  link: opt(300),
})

export const promotionApplySchema = z
  .object({
    /** 0 promotion · 1 contract renewal (legacy staff_promotion.type) */
    type: z.coerce.number().int().min(0).max(1),
    positionId: id('Choose the rank you are applying for'),
    kind: z.preprocess(emptyToNull, z.enum(PROMOTION_KINDS).nullable()),
    appLetter: opt(500),
    appCv: opt(500),
    papersFile: opt(500),
    papers: z.array(paperSchema).max(80).default([]),
    details: z.object(Object.fromEntries(PROMOTION_DETAIL_FIELDS.map((f) => [f, opt(10_000)])) as Record<(typeof PROMOTION_DETAIL_FIELDS)[number], ReturnType<typeof opt>>).partial().default({}),
    /** false saves a draft (senior members) */
    submit: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.type === 0 && !v.kind) ctx.addIssue({ code: 'custom', path: ['kind'], message: 'Choose the type of promotion' })
    if (!v.submit) return
    if (!v.appCv) ctx.addIssue({ code: 'custom', path: ['appCv'], message: 'Upload your CV' })
    if (v.type === 1 && !v.appLetter && !v.papersFile) ctx.addIssue({ code: 'custom', path: ['appLetter'], message: 'Upload your application letter' })
    if (v.type === 0 && !v.papersFile && v.papers.length === 0) ctx.addIssue({ code: 'custom', path: ['papers'], message: 'Add your papers' })
  })

/** Sending back what a level asked for. */
export const promotionResubmitSchema = z.object({
  appCv: opt(500),
  appLetter: opt(500),
  papersFile: opt(500),
  papers: z.array(paperSchema).max(80).optional(),
  comment: opt(2000),
})

export const portalPromotionActionSchema = z
  .object({
    action: z.enum(['recommend', 'not_recommend', 'return', 'reverse']),
    comment: req(2000, 'Write your comment'),
    returnWhat: z.coerce.number().int().optional(),
    document: opt(500),
  })
  .superRefine((v, ctx) => {
    if (v.action === 'return' && ![8, 9, 10, 11].includes(Number(v.returnWhat)))
      ctx.addIssue({ code: 'custom', path: ['returnWhat'], message: 'Choose what the applicant must send again' })
  })
