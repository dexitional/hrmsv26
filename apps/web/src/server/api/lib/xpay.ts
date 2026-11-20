// XPay (the payslip portal) runs its own MySQL database on the University
// network, with its own credentials (XPAY_DB_* in .env). Staff reset their
// XPay password from Payslips: the old portal's xpayreset wrote a PHP bcrypt
// hash into <XPAY_DB_NAME>.auth_user for the username = UCC email name.
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import { AppError } from './errors'

const globalForXpay = globalThis as typeof globalThis & { __xpayPool?: mysql.Pool }

export const xpayConfigured = () => Boolean(process.env.XPAY_DB_HOST && process.env.XPAY_DB_USER && process.env.XPAY_DB_NAME)

function pool() {
  if (!xpayConfigured()) throw new AppError('XPay password reset is not set up on this server yet. Contact the Directorate of Finance or IT support.', 409)
  if (!globalForXpay.__xpayPool) {
    globalForXpay.__xpayPool = mysql.createPool({
      host: process.env.XPAY_DB_HOST,
      port: Number(process.env.XPAY_DB_PORT) || 3306,
      user: process.env.XPAY_DB_USER,
      password: process.env.XPAY_DB_PASSWORD,
      database: process.env.XPAY_DB_NAME,
      connectionLimit: 3,
      connectTimeout: 8000,
    })
  }
  return globalForXpay.__xpayPool
}

/** The XPay username: the part of the staff member's UCC email before the @ (as the old reset page took it). */
export function xpayUsername(uccMail: string | null | undefined) {
  const name = String(uccMail ?? '')
    .trim()
    .toLowerCase()
    .split('@')[0]
  return name || null
}

/** Sets a new XPay password (bcrypt, in PHP's $2y$ form as password_hash wrote it). */
export async function resetXpayPassword(username: string, password: string) {
  const hash = (await bcrypt.hash(password, 10)).replace(/^\$2[ab]\$/, '$2y$')
  const table = `\`${String(process.env.XPAY_DB_NAME).replace(/`/g, '')}\`.auth_user`
  try {
    const [res] = await pool().query<mysql.ResultSetHeader>(`UPDATE ${table} SET password = ? WHERE username = ?`, [hash, username])
    return res.affectedRows
  } catch (err) {
    if (err instanceof AppError) throw err
    console.error('xpay reset:', (err as Error).message)
    throw new AppError('XPay could not be reached just now. Please try again later, or contact IT support.', 409)
  }
}
