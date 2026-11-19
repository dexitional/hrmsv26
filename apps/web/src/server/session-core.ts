// DB/JWT-touching session implementation (server only).
import { sign, verify } from 'hono/jwt'
import { getPool } from '@hrms/db'
import type { UserRole } from '@hrms/db'
import type { RowDataPacket } from 'mysql2'
import { SESSION_TTL_SECONDS } from './session'

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be set to at least 32 characters.')
  return secret
}

export async function signSessionToken(userId: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return sign({ sub: userId, iat: now, exp: now + SESSION_TTL_SECONDS }, sessionSecret(), 'HS256')
}

export async function readUserIdFromToken(token: string | undefined): Promise<number | null> {
  if (!token) return null
  try {
    const payload = await verify(token, sessionSecret(), 'HS256')
    const id = Number(payload.sub)
    return Number.isFinite(id) ? id : null
  } catch {
    return null
  }
}

export interface SessionUser {
  id: number
  fullName: string
  email: string
  role: UserRole
  staffNo: number | null
  avatarUrl: string | null
  hasPassword: boolean
}

export async function getSessionUser(id: number): Promise<SessionUser | null> {
  const [rows] = await getPool().query<Array<RowDataPacket>>(
    `SELECT id, full_name, email, role, staff_no, avatar_url, password_hash IS NOT NULL AS has_password
       FROM hrms_users WHERE id = ? AND is_active = 1`,
    [id],
  )
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    staffNo: row.staff_no ?? null,
    avatarUrl: row.avatar_url ?? null,
    hasPassword: Boolean(row.has_password),
  }
}
