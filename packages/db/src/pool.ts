import mysql from 'mysql2/promise'

// Kept on globalThis so dev hot reloads reuse one pool instead of opening a
// new one (and orphaning the old connections) every time a module reloads.
// The legacy HR schema stores '0000-00-00' for unknown dates and relies on
// MySQL's older, looser grouping rules. Keep strict checking for the values we
// write, but allow zero dates and non-aggregated GROUP BY columns.
export const LEGACY_SQL_MODE = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'

const globalForPool = globalThis as typeof globalThis & { __hrmsPool?: mysql.Pool }

export function getPool(): mysql.Pool {
  if (!globalForPool.__hrmsPool) {
    const uri = process.env.DATABASE_URL
    if (!uri) throw new Error('DATABASE_URL is not set.')
    globalForPool.__hrmsPool = mysql.createPool({
      uri,
      waitForConnections: true,
      connectionLimit: 10,
      // DATE/DATETIME come back as plain strings (no timezone shifting), and
      // DECIMAL money columns as numbers rather than strings.
      dateStrings: true,
      decimalNumbers: true,
    })
    globalForPool.__hrmsPool.on('connection', (conn) => {
      conn.query(`SET SESSION sql_mode = '${LEGACY_SQL_MODE}'`)
    })
  }
  return globalForPool.__hrmsPool
}

/** Closes the pool so a CLI script can exit (servers never need this). */
export async function closePool() {
  const pool = globalForPool.__hrmsPool
  globalForPool.__hrmsPool = undefined
  await pool?.end()
}
