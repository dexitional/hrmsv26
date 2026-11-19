import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'

// Creates (or resets) the first HRMS administrator from SEED_ADMIN_* in .env.
// Run after `npm run db:migrate`. Re-running rotates the password.
async function main() {
  const { DATABASE_URL, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set.')
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in the environment.')
  }
  const connection = await mysql.createConnection({ uri: DATABASE_URL })
  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12)
  await connection.query(
    `INSERT INTO hrms_users (full_name, email, role, password_hash)
     VALUES (?, ?, 'administrator', ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'administrator',
       is_active = 1, failed_login_attempts = 0, locked_until = NULL`,
    [SEED_ADMIN_NAME ?? 'HR Administrator', SEED_ADMIN_EMAIL.toLowerCase(), passwordHash],
  )
  console.log(`Seeded administrator: ${SEED_ADMIN_EMAIL}`)
  await connection.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
