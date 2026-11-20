// Imports payslips from a payroll export (a JSON array, as files/bkp/payslip.json)
// into hrms_payslips, hrms_payslip_lines and hrms_payslip_loans. HR can also
// upload the export in the admin (Payslips → Import).
//
//   npm run db:import-payslips -- path/to/payslips.json [--dry-run]
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

import { importPayslips, parsePayrollExport } from '../src/payslips'
import { LEGACY_SQL_MODE } from '../src/pool'

async function main() {
  const file = process.argv.slice(2).find((a) => !a.startsWith('--'))
  const dryRun = process.argv.includes('--dry-run')
  if (!file) throw new Error('Usage: npm run db:import-payslips -- path/to/payslips.json [--dry-run]')
  const payslips = parsePayrollExport(JSON.parse(await readFile(file, 'utf8')))

  const uri = process.env.DATABASE_URL
  if (!uri) throw new Error('DATABASE_URL is not set.')
  const db = await mysql.createConnection({ uri })
  await db.query(`SET SESSION sql_mode = '${LEGACY_SQL_MODE}'`)
  const result = await importPayslips(db, payslips, dryRun)
  await db.end()

  console.log(`${dryRun ? 'Checked' : 'Imported'} ${result.imported} payslip${result.imported === 1 ? '' : 's'} (${result.periods.join(', ')}) from ${file}.`)
  if (result.unbalanced.length) console.log(`Net pay does not reconcile on ${result.unbalanced.length}:\n  ${result.unbalanced.join('\n  ')}`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
