// Staff records (legacy `staff` table) and their personal documents (`doc`).
//   GET  /api/staff?tab=active|inactive|contract&q=&unit=&job=&group=&gender=&status=&page=
//   GET  /api/staff/next-number      the number a new staff member would get
//   GET  /api/staff/:staffNo         full profile with history
//   POST /api/staff                  create (new staff are numbered automatically)
//   PUT  /api/staff/:staffNo         update
import { Hono } from 'hono'
import { DOC_CATEGORIES } from '@hrms/db'
import type { PoolConnection } from 'mysql2/promise'
import { DOC_LABELS } from '#/lib/labels'
import { staffSchema } from '#/lib/schemas'
import type { z } from 'zod'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import {
  ACTIVE_IN,
  BRIEF_COLUMNS,
  PLACEMENT,
  ageBand,
  leaveYear,
  nameSql,
  plainNameSql,
  requireStaff,
  syncPlacement,
} from '../lib/hr'
import { validate } from '../lib/validate'

type StaffInput = z.infer<typeof staffSchema>

// Contract staff: on a contract appointment, or serving a post-retirement contract.
const CONTRACT_SQL = `(s.staff_status = 'CONTRACT' OR EXISTS (
  SELECT 1 FROM postretire pr WHERE pr.staff_no = s.staff_no AND pr.active = '1' AND pr.end_post >= CURDATE()))`

const TAB_SQL: Record<string, string> = {
  active: `s.staff_status IN ${ACTIVE_IN} AND NOT ${CONTRACT_SQL}`,
  contract: CONTRACT_SQL,
  inactive: `(s.staff_status IS NULL OR s.staff_status NOT IN ${ACTIVE_IN}) AND NOT ${CONTRACT_SQL}`,
}

/** Staff-row columns from the form (placement is written separately). */
function staffColumns(data: StaffInput) {
  const emergency = [
    data.emergencyName,
    data.emergencyRelation && `(${data.emergencyRelation})`,
    data.emergencyPhone,
    data.emergencyAddress,
  ]
    .filter(Boolean)
    .join(', ')
  return {
    title: data.title,
    fname: data.fname.toUpperCase(),
    mname: data.mname?.toUpperCase() ?? '',
    lname: data.lname.toUpperCase(),
    gender: data.gender,
    dob: data.dob,
    hometown: data.hometown,
    district: data.district,
    region: data.region,
    nationality: data.nationality,
    country: data.nationality,
    phone: data.phone,
    email: data.email,
    paddress: data.paddress,
    address: data.address,
    emergencyName: data.emergencyName,
    emergencyRelation: data.emergencyRelation,
    emergencyPhone: data.emergencyPhone,
    emergencyAddress: data.emergencyAddress,
    emergencyContact: emergency || null,
    mstatus: data.mstatus,
    ssnit: data.ssnit,
    ghanaCardNo: data.ghanaCardNo,
    uccMail: data.uccMail,
    staffStatus: data.staffStatus,
    firstAppointDate: data.firstAppointDate,
    appointDate: data.firstAppointDate,
    assumeDate: data.assumeDate,
    probation: data.probation,
    staffGroup: data.staffGroup,
    jobId: data.jobId,
    unitId: data.unitId,
    scaleId: data.scaleId,
  }
}

/** Keeps one active document per category; replaced or removed ones are deactivated. */
async function saveDocs(staffNo: number, docs: StaffInput['docs'], conn?: PoolConnection) {
  for (const category of DOC_CATEGORIES) {
    const next = docs[category]
    const current = await one<{ id: number; path: string }>(
      "SELECT id, path FROM doc WHERE staff_no = ? AND category = ? AND active = '1' ORDER BY id DESC LIMIT 1",
      [staffNo, category],
      conn,
    )
    if (current?.path === next?.url) continue
    if (current) await exec("UPDATE doc SET active = '0' WHERE staff_no = ? AND category = ?", [staffNo, category], conn)
    if (next) {
      await insert(
        'doc',
        { title: `${DOC_LABELS[category]} – ${next.name}`.slice(0, 255), path: next.url, staffNo, category, active: '1' },
        conn,
      )
    }
  }
}

/** A staff member's full profile: record, placement and every sub-record HR keeps (admin and staff portal). */
export async function loadStaffProfile(staffNo: number) {
    const record = await one(
      `SELECT s.*, NULLIF(s.dob, '0000-00-00') AS dob, ${nameSql()} AS full_name, TIMESTAMPDIFF(YEAR, NULLIF(s.dob, '0000-00-00'), CURDATE()) AS age,
              u.id AS cur_unit_id, u.long_name AS unit_name, j.id AS cur_job_id, j.title AS job_title,
              g.id AS cur_scale_id, g.grade, g.notch, COALESCE(cp.staff_group, s.staff_group) AS cur_staff_group,
              cp.apply_type AS current_type, cp.appoint_date AS current_since
         FROM staff s ${PLACEMENT} WHERE s.staff_no = ?`,
      [staffNo],
    )
    if (!record) throw notFound('Staff member')
    const brief = await requireStaff(staffNo)
    const [docs, elevations, transfers, positions, renewals, postRetire, dobLog, leaves, leave] = await Promise.all([
      rows("SELECT id, category, title, path FROM doc WHERE staff_no = ? AND active = '1' ORDER BY id DESC", [staffNo]),
      rows(
        `SELECT p.id, p.apply_type, p.appoint_date, p.confirm_date, p.letter_date, p.probation, p.staff_group,
                j.title AS job_title, u.long_name AS unit_name, g.grade, g.notch, p.id = ? AS is_current
           FROM promotion p LEFT JOIN job j ON j.id = p.job_id LEFT JOIN unit u ON u.id = p.unit_id
           LEFT JOIN scale g ON g.id = p.scale_id
          WHERE p.staff_no = ? ORDER BY p.appoint_date DESC, p.id DESC`,
        [record.promoId ?? 0, staffNo],
      ),
      rows(
        `SELECT t.id, t.transfer_date, t.reason, f.long_name AS from_unit_name, tu.long_name AS to_unit_name
           FROM transfer t LEFT JOIN unit f ON f.id = t.from_unit LEFT JOIN unit tu ON tu.id = t.to_unit
          WHERE t.staff_no = ? AND COALESCE(t.flag_delete, 0) = 0 ORDER BY t.transfer_date DESC`,
        [staffNo],
      ),
      rows(
        `SELECT p.id, COALESCE(NULLIF(p.title, ''), NULLIF(p.post, ''),
                CASE p.access WHEN 'HEAD' THEN 'Head' WHEN 'SUBHEAD' THEN 'Sub-head' END) AS title, p.start_date, p.end_date, p.active,
                u.long_name AS unit_name, DATEDIFF(p.end_date, CURDATE()) AS days_left
           FROM position p LEFT JOIN unit u ON u.id = p.unit_id WHERE p.staff_no = ? ORDER BY p.start_date DESC`,
        [staffNo],
      ),
      rows('SELECT * FROM renewal WHERE staff_no = ? ORDER BY start_date DESC', [staffNo]),
      rows('SELECT * FROM postretire WHERE staff_no = ? ORDER BY start_post DESC', [staffNo]),
      rows('SELECT * FROM staff_dob_log WHERE staff_no = ? ORDER BY id DESC', [staffNo]),
      rows(
        `SELECT l.id, t.title AS type, l.start_date, l.end_date, l.approved_days, l.status
           FROM leave_dump l LEFT JOIN leave_type t ON t.id = l.type_id
          WHERE l.staff_no = ? ORDER BY l.start_date DESC LIMIT 10`,
        [staffNo],
      ),
      leaveYear(brief, new Date().getFullYear()),
    ])
    return {
      ...record,
      band: ageBand(record.age),
      docs,
      elevations,
      transfers,
      positions,
      renewals,
      postRetire,
      dobLog,
      leaves,
      leave,
    }
}

export const staffRoute = new Hono()
  .get('/', requirePermission('staff', 'view'), async (c) => {
    const q = c.req.query()
    const { page, pageSize, limit, offset } = paging(q, 25)
    const tab = TAB_SQL[q.tab ?? 'active'] ? (q.tab ?? 'active') : 'active'
    const where: Array<string> = ['COALESCE(s.flag_delete, 0) = 0']
    const params: Array<unknown> = []
    if (q.q) {
      const term = q.q.trim()
      where.push(`(${nameSql()} LIKE ? OR s.ucc_mail LIKE ? OR s.phone LIKE ? OR s.staff_no = ?)`)
      params.push(like(term), like(term), like(term), Number(term) || 0)
    }
    if (q.unit) (where.push('u.id = ?'), params.push(Number(q.unit)))
    if (q.job) (where.push('j.id = ?'), params.push(Number(q.job)))
    if (q.group) (where.push('COALESCE(cp.staff_group, s.staff_group) = ?'), params.push(q.group))
    if (q.gender) (where.push('s.gender = ?'), params.push(q.gender))
    if (q.status) (where.push('s.staff_status = ?'), params.push(q.status))
    const base = `FROM staff s ${PLACEMENT} WHERE ${where.join(' AND ')}`
    const sort =
      q.sort === 'number' ? 's.staff_no DESC' : q.sort === 'age' ? 's.dob ASC' : `${plainNameSql()} ASC`
    const [data, total, counts] = await Promise.all([
      rows(`SELECT ${BRIEF_COLUMNS} ${base} AND ${TAB_SQL[tab]} ORDER BY ${sort} LIMIT ? OFFSET ?`, [
        ...params,
        limit,
        offset,
      ]),
      scalar(`SELECT COUNT(*) ${base} AND ${TAB_SQL[tab]}`, params),
      rows(
        `SELECT ${Object.entries(TAB_SQL)
          .map(([k, sql]) => `SUM(${sql}) AS \`${k}\``)
          .join(', ')} ${base}`,
        params,
      ),
    ])
    const c0 = counts[0] ?? {}
    return c.json({
      data: data.map((r) => ({ ...r, band: ageBand(r.age) })),
      total,
      page,
      pageSize,
      counts: Object.keys(TAB_SQL).map((status) => ({ status, count: Number(c0[status] ?? 0) })),
    })
  })

  .get('/next-number', requirePermission('staff', 'view'), async (c) =>
    c.json({ staffNo: Number(await scalar('SELECT COALESCE(MAX(staff_no), 0) + 1 FROM staff')) }),
  )

  .get('/:staffNo', requirePermission('staff', 'view'), async (c) => c.json(await loadStaffProfile(Number(c.req.param('staffNo')))))

  .post('/', requirePermission('staff', 'edit'), validate('json', staffSchema), async (c) => {
    const data = c.req.valid('json')
    let staffNo = data.staffNo
    if (data.numbering === 'new') {
      staffNo = Number(await scalar('SELECT COALESCE(MAX(staff_no), 0) + 1 FROM staff'))
    } else if (await one('SELECT id FROM staff WHERE staff_no = ?', [staffNo])) {
      throw new AppError(`Staff number ${staffNo} is already in use.`, 409)
    }
    await insert('staff', { ...staffColumns(data), staffNo, createdAt: new Date(), updatedAt: new Date() })
    // Every staff member's job, grade and unit hang off an appointment record.
    const promoId = await insert('promotion', {
      staffNo,
      jobId: data.jobId,
      unitId: data.unitId,
      scaleId: data.scaleId,
      staffGroup: data.staffGroup,
      appointDate: data.assumeDate ?? data.firstAppointDate,
      probation: data.probation,
      applyType: 'APPOINTMENT',
      createdAt: new Date(),
    })
    await syncPlacement(staffNo!, promoId)
    await saveDocs(staffNo!, data.docs)
    audit(c.get('user'), 'create', 'staff', staffNo!, `Added staff ${staffNo} ${data.fname} ${data.lname}`)
    return c.json({ staffNo }, 201)
  })

  .put('/:staffNo', requirePermission('staff', 'edit'), validate('json', staffSchema), async (c) => {
    const staffNo = Number(c.req.param('staffNo'))
    const data = c.req.valid('json')
    const existing = await one<{ id: number; promoId: number | null }>(
      'SELECT id, promo_id FROM staff WHERE staff_no = ?',
      [staffNo],
    )
    if (!existing) throw notFound('Staff member')
    // Dates of birth change only through PUT /api/dob/:staffNo, which logs the reason.
    const { dob: _dob, ...columns } = staffColumns(data)
    await update('staff', existing.id, { ...columns, updatedAt: new Date() })
    const placement = { jobId: data.jobId, unitId: data.unitId, scaleId: data.scaleId, staffGroup: data.staffGroup }
    const current = existing.promoId
      ? await one('SELECT id FROM promotion WHERE id = ?', [existing.promoId])
      : null
    if (current) {
      await update('promotion', existing.promoId!, { ...placement, updatedAt: new Date() })
    } else {
      const promoId = await insert('promotion', {
        ...placement,
        staffNo,
        appointDate: data.assumeDate ?? data.firstAppointDate,
        probation: data.probation,
        applyType: 'APPOINTMENT',
        createdAt: new Date(),
      })
      existing.promoId = promoId
    }
    await syncPlacement(staffNo, existing.promoId!)
    await saveDocs(staffNo, data.docs)
    audit(c.get('user'), 'update', 'staff', staffNo, `Updated staff ${staffNo} ${data.fname} ${data.lname}`)
    return c.json({ staffNo })
  })
