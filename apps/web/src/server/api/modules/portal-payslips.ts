// A staff member's own payslips in the staff portal. Payslips open freely by
// default; a staff member may turn on a 4-digit PIN lock (kept until they turn
// it off, or HR resets it): a saved PIN in hrms_payslip_pins means the lock is on.
//
//   GET  /api/portal/payslips?year=      years with payslips, the year's 12 months, lock and unlock state
//   POST /api/portal/payslips/pin        { current?, pin, confirm }   turn the lock on, or change the PIN
//   POST /api/portal/payslips/pin/off    { pin }   turn the lock off
//   POST /api/portal/payslips/unlock     { pin }   opens payslips in this browser for 15 minutes
//   POST /api/portal/payslips/lock
//   GET  /api/portal/payslips/:id        one payslip (needs the unlock while the lock is on)
//   GET  /api/portal/payslips/xpay       POST /api/portal/payslips/xpay-password { password, confirm }   reset the XPay login
import { Hono } from 'hono'
import { payslipPinSchema, payslipUnlockSchema, xpayPasswordSchema } from '#/lib/schemas'
import { audit } from '../lib/audit'
import { exec, parseId, rows } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { RELEASED, checkPin, grantUnlock, loadPayslip, pinState, recordView, revokeUnlock, setPin, unlockedUntil } from '../lib/payslips'
import { requireStaffUser } from '../lib/portal'
import { validate } from '../lib/validate'
import { rateLimit } from '../lib/rate-limit'
import { resetXpayPassword, xpayConfigured, xpayUsername } from '../lib/xpay'

const say = (me: { fullName: string; staffNo: number }, what: string) => `Staff portal: ${me.fullName} (${me.staffNo}) ${what}`

export const portalPayslipsRoute = new Hono()
  .use(requireStaffUser)

  .get('/', async (c) => {
    const me = c.get('staff')
    const years = (
      await rows<{ year: number }>(`SELECT DISTINCT p.pay_year AS year FROM hrms_payslips p WHERE p.staff_no = ? AND ${RELEASED} ORDER BY year DESC`, [me.staffNo])
    ).map((r) => Number(r.year))
    const year = Number(c.req.query('year')) || years[0] || new Date().getFullYear()
    const found = await rows<{ id: number; month: number }>(
      `SELECT p.id, p.pay_month AS month FROM hrms_payslips p WHERE p.staff_no = ? AND p.pay_year = ? AND ${RELEASED}`,
      [me.staffNo, year],
    )
    const byMonth = new Map(found.map((r) => [Number(r.month), Number(r.id)]))
    return c.json({
      years,
      year,
      months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, id: byMonth.get(i + 1) ?? null })),
      pin: await pinState(me.staffNo),
      unlockedUntil: await unlockedUntil(c, me.staffNo),
    })
  })

  .post('/pin', validate('json', payslipPinSchema), async (c) => {
    const me = c.get('staff')
    const { current, pin } = c.req.valid('json')
    const state = await pinState(me.staffNo)
    if (state.set) {
      if (!current) throw new AppError('Enter your current PIN.', 422)
      await checkPin(me.staffNo, current)
    }
    await setPin(me.staffNo, pin)
    audit(null, state.set ? 'update' : 'create', 'payslip_pin', me.staffNo, say(me, state.set ? 'changed their payslip PIN' : 'turned on the payslip PIN lock'))
    return c.json({ ok: true, unlockedUntil: await grantUnlock(c, me.staffNo) })
  })

  .post('/pin/off', validate('json', payslipUnlockSchema), async (c) => {
    const me = c.get('staff')
    await checkPin(me.staffNo, c.req.valid('json').pin)
    await exec('DELETE FROM hrms_payslip_pins WHERE staff_no = ?', [me.staffNo])
    revokeUnlock(c)
    audit(null, 'delete', 'payslip_pin', me.staffNo, say(me, 'turned off the payslip PIN lock'))
    return c.json({ ok: true })
  })

  .post('/unlock', validate('json', payslipUnlockSchema), async (c) => {
    const me = c.get('staff')
    await checkPin(me.staffNo, c.req.valid('json').pin)
    return c.json({ ok: true, unlockedUntil: await grantUnlock(c, me.staffNo) })
  })

  // XPay (the payslip portal) password: the staff member's own account only.
  .get('/xpay', (c) => {
    const me = c.get('staff')
    return c.json({ configured: xpayConfigured(), username: xpayUsername(me.uccMail) })
  })
  .post('/xpay-password', rateLimit('xpay-password', 5, 15 * 60), validate('json', xpayPasswordSchema), async (c) => {
    const me = c.get('staff')
    const username = xpayUsername(me.uccMail)
    if (!username) throw new AppError('Your staff record has no UCC email, which is your XPay username. Ask HR to add it.', 422)
    const changed = await resetXpayPassword(username, c.req.valid('json').password)
    if (!changed) throw new AppError(`No XPay account was found for ${username}. Contact the Directorate of Finance.`, 404)
    audit(null, 'update', 'xpay_password', me.staffNo, say(me, `reset their XPay password (${username})`))
    return c.json({ ok: true, username })
  })

  .post('/lock', (c) => {
    revokeUnlock(c)
    return c.json({ ok: true })
  })

  .get('/:id', async (c) => {
    const me = c.get('staff')
    // Only staff who turned the PIN lock on need to unlock first.
    if ((await pinState(me.staffNo)).set && !(await unlockedUntil(c, me.staffNo))) throw new AppError('Enter your PIN to open your payslips.', 423)
    const slip = await loadPayslip(parseId(c.req.param('id')))
    // Only the staff member's own, released payslips.
    if (!slip || slip.staffNo !== me.staffNo || !slip.approved || !slip.released) throw notFound('Payslip')
    recordView(slip.id)
    return c.json(slip)
  })
