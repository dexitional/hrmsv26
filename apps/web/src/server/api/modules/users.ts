// HRMS sign-in accounts (administrators and IT support), plus the activity
// log (everyone's for administrators and IT support, otherwise only the
// user's own).
import bcrypt from 'bcryptjs'
import { Hono } from 'hono'
import { AUDIT_ALL_ROLES } from '#/lib/permissions'
import { userSchema } from '#/lib/schemas'
import { requirePermission } from '../lib/auth'
import { audit } from '../lib/audit'
import { exec, insert, like, one, paging, parseId, rows, scalar, update } from '../lib/db'
import { AppError, notFound } from '../lib/errors'
import { validate } from '../lib/validate'

export const usersRoute = new Hono()
  .use('*', requirePermission('users', 'manage'))
  .get('/', async (c) => {
    const q = c.req.query()
    const where: Array<string> = ['1 = 1']
    const params: Array<unknown> = []
    if (q.q) (where.push('(u.full_name LIKE ? OR u.email LIKE ?)'), params.push(like(q.q), like(q.q)))
    if (q.role) (where.push('u.role = ?'), params.push(q.role))
    return c.json(
      await rows(
        `SELECT u.id, u.full_name, u.email, u.role, u.staff_no, u.is_active, u.last_login_at, u.created_at,
                u.avatar_url, u.password_hash IS NOT NULL AS has_password, u.google_sub IS NOT NULL AS google_linked,
                u.locked_until > NOW() AS locked
           FROM hrms_users u WHERE ${where.join(' AND ')} ORDER BY u.role, u.full_name`,
        params,
      ),
    )
  })
  .post('/', validate('json', userSchema), async (c) => {
    const { password, ...data } = c.req.valid('json')
    const id = await insert('hrms_users', {
      ...data,
      passwordHash: password ? await bcrypt.hash(password, 12) : null,
    })
    audit(c.get('user'), 'create', 'user', id, `Created ${data.role} account for ${data.email}`)
    return c.json({ id }, 201)
  })
  .put('/:id', validate('json', userSchema), async (c) => {
    const id = parseId(c.req.param('id'))
    const me = c.get('user')
    const { password, ...data } = c.req.valid('json')
    if (id === me.id && (!['administrator', 'it_support'].includes(data.role) || !data.isActive)) {
      throw new AppError('You cannot remove your own access to accounts.', 409)
    }
    const changes: Record<string, unknown> = { ...data }
    if (password)
      Object.assign(changes, {
        passwordHash: await bcrypt.hash(password, 12),
        failedLoginAttempts: 0,
        lockedUntil: null,
      })
    if (!(await update('hrms_users', id, changes))) throw notFound('User')
    audit(me, 'update', 'user', id, `Updated account ${data.email}${password ? ' (password reset)' : ''}`)
    return c.json({ id })
  })
  .delete('/:id', async (c) => {
    const id = parseId(c.req.param('id'))
    if (id === c.get('user').id) throw new AppError('You cannot delete your own account.', 409)
    const user = await one<{ email: string }>('SELECT email FROM hrms_users WHERE id = ?', [id])
    if (!user) throw notFound('User')
    await exec('DELETE FROM hrms_users WHERE id = ?', [id])
    audit(c.get('user'), 'delete', 'user', id, `Deleted account ${user.email}`)
    return c.json({ ok: true })
  })

export const auditRoute = new Hono().get('/', requirePermission('audit', 'view'), async (c) => {
  const q = c.req.query()
  const user = c.get('user')
  const { page, pageSize, limit, offset } = paging(q, 30)
  const where: Array<string> = ['1 = 1']
  const params: Array<unknown> = []
  if (!AUDIT_ALL_ROLES.includes(user.role)) (where.push('a.user_id = ?'), params.push(user.id))
  if (q.q) (where.push('(a.summary LIKE ? OR u.full_name LIKE ?)'), params.push(like(q.q), like(q.q)))
  if (q.entity) (where.push('a.entity = ?'), params.push(q.entity))
  const from = `FROM hrms_audit_logs a LEFT JOIN hrms_users u ON u.id = a.user_id WHERE ${where.join(' AND ')}`
  const [data, total] = await Promise.all([
    rows(`SELECT a.*, u.full_name AS user_name, u.role AS user_role ${from} ORDER BY a.id DESC LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      offset,
    ]),
    scalar(`SELECT COUNT(*) ${from}`, params),
  ])
  return c.json({ data, total, page, pageSize })
})
