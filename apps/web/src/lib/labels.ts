import type { UserRole } from '@hrms/db'

export const ROLE_LABELS: Record<UserRole, string> = {
  administrator: 'Administrator',
  hr_officer: 'HR Officer',
  it_support: 'IT Support',
  viewer: 'Viewer (read-only)',
}

export const GROUP_LABELS: Record<string, string> = {
  SM: 'Senior Member',
  SS: 'Senior Staff',
  JS: 'Junior Staff',
}

export const ELEVATION_LABELS: Record<string, string> = {
  APPOINTMENT: 'Appointment',
  PROMOTION: 'Promotion',
  UPGRADE: 'Upgrade',
}

export const LEAVE_STATUS_LABELS: Record<string, string> = {
  'STAFF-PENDING': 'Staff pending',
  'HEAD-PENDING': 'Head pended',
  'HEAD-REJECTED': 'Head rejected',
  'HR-PENDING': 'HR pended',
  'HR-REJECTED': 'HR rejected',
  GRANTED: 'Active',
  ENDED: 'Ended',
  CANCELLED: 'Cancelled',
}

export const UNIT_LEVEL_LABELS: Record<string, string> = {
  '1': 'College / Directorate',
  '2': 'Faculty / School / Division',
  '3': 'Department / Section / Unit',
  '4': 'Sub-unit',
}

export const POST_LABELS: Record<string, string> = {
  VC: 'Vice-Chancellor',
  'PRO-VC': 'Pro Vice-Chancellor',
  REGISTRAR: 'Registrar',
  PROVOST: 'Provost',
  DIRECTOR: 'Director',
  'DEPUTY-DIRECTOR': 'Deputy Director',
  DEAN: 'Dean',
  'VICE-DEAN': 'Vice-Dean',
  COORDINATOR: 'Coordinator',
  HEAD: 'Head',
}

export const MARITAL_LABELS: Record<string, string> = {
  SINGLE: 'Single',
  MARRIED: 'Married',
  SEPARATED: 'Separated',
  WIDOW: 'Widowed',
  DIVORCED: 'Divorced',
  NONE: '—',
}

export const DOC_LABELS: Record<string, string> = {
  MARITAL: 'Marriage certificate',
  BIRTH: 'Birth certificate',
  MEDICAL: 'Medical report',
  CV: 'Curriculum vitae (CV)',
}

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'brand'

export const STATUS_TONES: Record<string, Tone> = {
  PERMANENT: 'success',
  TEMPORAL: 'info',
  CASUAL: 'info',
  'PART-TIME': 'info',
  CONTRACT: 'brand',
  SECONDMENT: 'brand',
  RETIRED: 'neutral',
  DEAD: 'danger',
  RESIGNED: 'neutral',
  DISMISSED: 'danger',
  ABSENCE: 'warning',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  'HEAD-PENDING': 'warning',
  'HR-PENDING': 'warning',
  'STAFF-PENDING': 'warning',
  'HEAD-REJECTED': 'danger',
  'HR-REJECTED': 'danger',
  GRANTED: 'success',
  ENDED: 'neutral',
  CANCELLED: 'neutral',
  APPOINTMENT: 'info',
  PROMOTION: 'success',
  UPGRADE: 'brand',
  WARNING: 'warning',
  SUSPENSION: 'danger',
  INTERDICTION: 'danger',
  DISMISSAL: 'danger',
  TERMINATION: 'danger',
  ON_LEAVE: 'info',
  RESUMED: 'success',
  EXTENDED: 'warning',
  ABANDONED: 'danger',
}

export const QUALIFICATION_LABELS: Record<string, string> = {
  PHD: 'Doctorate (PhD)',
  MASTERS: "Master's degree",
  DEGREE: "Bachelor's degree",
  'POST-DIPLOMA': 'Post-diploma',
  HND: 'HND',
  DIPLOMA: 'Diploma',
  PROFESSIONAL: 'Professional certificate',
  TRADETEST: 'Trade test',
  'SSCE-WASSCE': 'SSCE / WASSCE',
  'A-LEVEL': 'A-Level',
  'O-LEVEL': 'O-Level',
  'BECE-MSLC': 'BECE / MSLC',
}

export const statusLabel = (s: string) =>
  LEAVE_STATUS_LABELS[s] ??
  s
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase())
