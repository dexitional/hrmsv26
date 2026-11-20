// Renumbers every staff member's relative codes in the fixed order (spouses,
// children, parents, then others), as the app does when a family changes.
// Relatives without a code get one. Each code that changes is first written to
// hrms_relative_code_history (source 'bulk'), so the old codes can be traced.
//
//   npm run db:renumber-relatives -- [--dry-run]
import 'dotenv/config'
import mysql from 'mysql2/promise'

import { LEGACY_SQL_MODE } from '../src/pool'
import { relativeCodes } from '../src/relatives'

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const uri = process.env.DATABASE_URL
  if (!uri) throw new Error('DATABASE_URL is not set.')
  const db = await mysql.createConnection({ uri })
  await db.query(`SET SESSION sql_mode = '${LEGACY_SQL_MODE}'`)

  const [all] = await db.query<mysql.RowDataPacket[]>('SELECT id, staff_no, relation, code FROM staff_rel WHERE staff_no IS NOT NULL ORDER BY staff_no, id')
  const families = new Map<number, Array<{ id: number; relation: string | null; code: string | null }>>()
  for (const r of all) {
    const list = families.get(Number(r.staff_no)) ?? []
    list.push({ id: Number(r.id), relation: r.relation ?? null, code: r.code || null })
    families.set(Number(r.staff_no), list)
  }

  const changes: Array<{ id: number; staffNo: number; from: string | null; to: string }> = []
  for (const [staffNo, family] of families)
    for (const r of relativeCodes(staffNo, family)) if (r.code !== r.newCode) changes.push({ id: r.id, staffNo, from: r.code, to: r.newCode })

  const moved = changes.filter((c) => c.from)
  const summary = {
    relatives: all.length,
    families: families.size,
    codesMoved: moved.length,
    familiesWithMovedCodes: new Set(moved.map((c) => c.staffNo)).size,
    codesAdded: changes.length - moved.length,
  }
  console.log(dryRun ? 'Dry run, nothing written:' : 'Renumbering:', summary)
  for (const c of moved.slice(0, 5)) console.log(`  e.g. relative ${c.id}: ${c.from} → ${c.to}`)

  if (!dryRun && changes.length) {
    await db.beginTransaction()
    try {
      for (let i = 0; i < changes.length; i += 1000) {
        const batch = changes.slice(i, i + 1000)
        await db.query('INSERT INTO hrms_relative_code_history (relative_id, staff_no, old_code, new_code, source) VALUES ?', [batch.map((c) => [c.id, c.staffNo, c.from, c.to, 'bulk'])])
        await db.query(`UPDATE staff_rel SET code = CASE id ${batch.map(() => 'WHEN ? THEN ?').join(' ')} END WHERE id IN (?)`, [...batch.flatMap((c) => [c.id, c.to]), batch.map((c) => c.id)])
      }
      await db.commit()
      console.log(`Done: ${changes.length} codes written; the old ones are in hrms_relative_code_history.`)
    } catch (e) {
      await db.rollback()
      throw e
    }
  }
  await db.end()
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
