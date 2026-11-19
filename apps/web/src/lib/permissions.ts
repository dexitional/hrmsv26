import type { UserRole } from '@hrms/db'

// Who can see and change what. "view" allows reads; "edit" also allows
// creating and updating; "manage" also allows deleting, merging and other
// irreversible changes. The API enforces this matrix on every route; the
// admin UI reads it only to decide what to show.
//
// - Administrators: everything, including sign-in accounts.
// - HR officers: run every HR module; no account administration.
// - IT support: keep sign-in accounts and the activity log, and correct HR
//   data (edit), but not delete or merge records.
// - Viewers: read-only access to every HR module.
export type Access = 'view' | 'edit' | 'manage'
export type Module =
  | 'dashboard'
  | 'staff'
  | 'scales'
  | 'units'
  | 'jobs'
  | 'positions'
  | 'dob'
  | 'leave'
  | 'elevation'
  | 'transfers'
  | 'nss'
  | 'disciplinary'
  | 'study'
  | 'promotions'
  | 'circulars'
  | 'servicedesk'
  | 'notifications'
  | 'users'
  | 'audit'

const HR: Partial<Record<UserRole, Access>> = {
  administrator: 'manage',
  hr_officer: 'manage',
  it_support: 'edit',
  viewer: 'view',
}

const MATRIX: Record<Module, Partial<Record<UserRole, Access>>> = {
  dashboard: HR,
  staff: HR,
  scales: HR,
  units: HR,
  jobs: HR,
  positions: HR,
  dob: HR,
  leave: HR,
  elevation: HR,
  transfers: HR,
  nss: HR,
  disciplinary: HR,
  study: HR,
  promotions: HR,
  // Drafting is editing; publishing to the university needs manage.
  circulars: HR,
  // Support requests from the staff portal: IT support answers them too.
  servicedesk: { administrator: 'manage', hr_officer: 'manage', it_support: 'manage', viewer: 'view' },
  notifications: { administrator: 'manage', it_support: 'manage', hr_officer: 'view' },
  users: { administrator: 'manage', it_support: 'manage' },
  audit: { administrator: 'view', it_support: 'view', hr_officer: 'view' },
}

const RANK: Record<Access, number> = { view: 1, edit: 2, manage: 3 }

export function can(role: UserRole, module: Module, level: Access = 'view'): boolean {
  const access = MATRIX[module][role]
  if (!access) return false
  return RANK[access] >= RANK[level]
}

export function rolesWith(module: Module, level: Access): Array<UserRole> {
  return (Object.keys(MATRIX[module]) as Array<UserRole>).filter((role) => can(role, module, level))
}

/** Who sees everyone's activity log; other roles with audit access see only their own. */
export const AUDIT_ALL_ROLES: Array<UserRole> = ['administrator', 'it_support']
