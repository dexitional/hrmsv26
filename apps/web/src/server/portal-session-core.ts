// Staff portal session (server only): a signed token naming the staff member,
// and who they are — their placement, the units they head (from the legacy
// unit.unit_head / unit_subhead), and whether they also have an admin account.
import { sign, verify } from 'hono/jwt'
import { ACTIVE_STAFF_STATUSES, getPool } from '@hrms/db'
import type { UserRole } from '@hrms/db'
import type { RowDataPacket } from 'mysql2'
import { properName } from '#/lib/text-case'
import { SWITCH_ACCESS_ROLES } from '#/lib/permissions'
import { PORTAL_TTL_SECONDS, SWITCH_TTL_SECONDS } from './portal-session'

function secret(): string {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set to at least 32 characters.')
  return s
}

// `kind` keeps admin and staff tokens apart: both are signed with the same
// secret, and an admin token's `sub` is an account id, not a staff number.
// `act` marks an administrator's switched access: the admin account acting
// as the staff member (Admin → Staff → Switch Access).
export async function signStaffToken(staffNo: number, actor?: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return sign(
    { sub: staffNo, kind: 'staff', ...(actor ? { act: actor } : {}), iat: now, exp: now + (actor ? SWITCH_TTL_SECONDS : PORTAL_TTL_SECONDS) },
    secret(),
    'HS256',
  )
}

export async function readStaffToken(token: string | undefined): Promise<{ staffNo: number; actor: number | null } | null> {
  if (!token) return null
  try {
    const payload = await verify(token, secret(), 'HS256')
    if (payload.kind !== 'staff') return null
    const no = Number(payload.sub)
    if (!Number.isInteger(no) || no <= 0) return null
    const actor = Number(payload.act)
    return { staffNo: no, actor: Number.isInteger(actor) && actor > 0 ? actor : null }
  } catch {
    return null
  }
}

export async function readStaffNoFromToken(token: string | undefined): Promise<number | null> {
  return (await readStaffToken(token))?.staffNo ?? null
}

/**
 * The portal user a token signs in. For switched access, `switchedBy` names
 * the admin user (administrator or HR officer); it stops working as soon as
 * that account is inactive or loses that role.
 */
export async function portalUserFromToken(token: string | undefined): Promise<PortalUser | null> {
  const t = await readStaffToken(token)
  if (!t) return null
  const user = await getPortalUser(t.staffNo)
  if (!user || !t.actor) return user
  const [[admin]] = await getPool().query<Array<RowDataPacket>>(
    `SELECT id, full_name FROM hrms_users WHERE id = ? AND is_active = 1 AND role IN (${SWITCH_ACCESS_ROLES.map(() => '?').join(', ')})`,
    [t.actor, ...SWITCH_ACCESS_ROLES],
  )
  if (!admin) return null
  return { ...user, switchedBy: { id: Number(admin.id), name: String(admin.full_name) } }
}

/** A unit the person heads (or deputises for), and the approval tier it gives. */
export interface HeadOf {
  unitId: number
  unitName: string
  level: string | null
  type: string | null
  role: 'head' | 'subhead'
}

export interface PortalUser {
  staffNo: number
  fullName: string
  firstName: string
  gender: string | null
  staffGroup: string | null
  staffStatus: string | null
  unitId: number | null
  unitName: string | null
  jobTitle: string | null
  uccMail: string | null
  phone: string | null
  heads: Array<HeadOf>
  /** "Head of department", "Dean", "Provost", "Registrar / Director"…, or null. */
  headTitle: string | null
  /** True when they approve anything: they head a unit or are a named leave approver. */
  isManager: boolean
  /** Units whose head has assigned them to raise procurement requests (unit.apply_procure). */
  procures: Array<{ unitId: number; unitName: string }>
  /** Their HRMS admin role, when they also have an active admin account. */
  adminRole: UserRole | null
  /** Set when an administrator is using the portal as this staff member (switched access). */
  switchedBy: { id: number; name: string } | null
}

const ACTIVE = `(${ACTIVE_STAFF_STATUSES.map((s) => `'${s}'`).join(', ')})`

export function headTitle(heads: Array<HeadOf>): string | null {
  if (!heads.length) return null
  const top = Math.min(...heads.map((h) => Number(h.level) || 9))
  const academic = heads.some((h) => h.type === 'ACADEMIC')
  if (top === 1) return academic ? 'Provost' : 'Registrar / Director'
  if (top === 2) return academic ? 'Dean' : 'Director / Head of division'
  return academic ? 'Head of department' : 'Head of section / unit'
}

export async function getPortalUser(staffNo: number): Promise<PortalUser | null> {
  const pool = getPool()
  const [rows] = await pool.query<Array<RowDataPacket>>(
    `SELECT s.staff_no, s.title, s.fname, s.mname, s.lname, s.gender, s.staff_status, s.phone,
            LOWER(TRIM(s.ucc_mail)) AS ucc_mail, COALESCE(cp.staff_group, s.staff_group) AS staff_group,
            u.id AS unit_id, u.long_name AS unit_name, j.title AS job_title
       FROM staff s
       LEFT JOIN promotion cp ON cp.id = s.promo_id
       LEFT JOIN unit u ON u.id = COALESCE(cp.unit_id, s.unit_id)
       LEFT JOIN job j ON j.id = COALESCE(cp.job_id, s.job_id)
      WHERE s.staff_no = ? AND s.staff_status IN ${ACTIVE} AND COALESCE(s.flag_delete, 0) = 0`,
    [staffNo],
  )
  const s = rows[0]
  if (!s) return null
  const [heads] = await pool.query<Array<RowDataPacket>>(
    `SELECT id AS unit_id, long_name AS unit_name, level, type, IF(unit_head = ?, 'head', 'subhead') AS role
       FROM unit WHERE active = '1' AND (unit_head = ? OR unit_subhead = ?) ORDER BY level, long_name`,
    [staffNo, staffNo, staffNo],
  )
  const [[approver]] = await pool.query<Array<RowDataPacket>>('SELECT COUNT(*) AS n FROM leave_approver WHERE approver = ?', [staffNo])
  const [procures] = await pool.query<Array<RowDataPacket>>("SELECT id AS unit_id, long_name AS unit_name FROM unit WHERE active = '1' AND apply_procure = ? ORDER BY long_name", [String(staffNo)])
  const [[admin]] = await pool.query<Array<RowDataPacket>>('SELECT role FROM hrms_users WHERE staff_no = ? AND is_active = 1 LIMIT 1', [staffNo])
  const headList: Array<HeadOf> = heads.map((h) => ({
    unitId: h.unit_id,
    unitName: properName(h.unit_name) ?? h.unit_name,
    level: h.level ?? null,
    type: h.type ?? null,
    role: h.role,
  }))
  const title = s.title && s.title !== '-- Select --' ? String(s.title).trim() : ''
  const name = [title, s.fname, s.mname, s.lname].filter((x) => x && String(x).trim()).join(' ')
  return {
    staffNo: s.staff_no,
    fullName: properName(name) ?? name,
    firstName: properName(String(s.fname ?? '').trim().split(/\s+/)[0] ?? '') ?? '',
    gender: s.gender ?? null,
    staffGroup: s.staff_group ?? null,
    staffStatus: s.staff_status ?? null,
    unitId: s.unit_id ?? null,
    unitName: s.unit_name ? (properName(s.unit_name) ?? s.unit_name) : null,
    jobTitle: s.job_title ? (properName(s.job_title) ?? s.job_title) : null,
    uccMail: s.ucc_mail || null,
    phone: s.phone ?? null,
    heads: headList,
    headTitle: headTitle(headList),
    isManager: headList.length > 0 || Number(approver?.n ?? 0) > 0,
    procures: procures.map((u) => ({ unitId: u.unit_id, unitName: properName(u.unit_name) ?? u.unit_name })),
    adminRole: (admin?.role as UserRole) ?? null,
    switchedBy: null,
  }
}
