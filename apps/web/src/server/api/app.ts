// The Hono app, mounted at /api/* by routes/api/$.ts (which strips the
// prefix before calling .fetch()).
import { Hono } from 'hono'
import { errorHandler } from './lib/errors'
import { authRoute } from './modules/auth'
import { dashboardRoute } from './modules/dashboard'
import { dobRoute } from './modules/dob'
import { elevationRoute } from './modules/elevation'
import { filesRoute } from './modules/files'
import { jobsRoute } from './modules/jobs'
import { leaveRoute } from './modules/leave'
import { lookupsRoute } from './modules/lookups'
import { nssRoute } from './modules/nss'
import { positionsRoute } from './modules/positions'
import { scalesRoute } from './modules/scales'
import { staffRoute } from './modules/staff'
import { transfersRoute } from './modules/transfers'
import { unitsRoute } from './modules/units'
import { auditRoute, usersRoute } from './modules/users'
import { disciplinaryRoute } from './modules/disciplinary'
import { promotionsRoute } from './modules/promotions'
import { staffRecordsRoute } from './modules/staff-records'
import { studyRoute } from './modules/study'
import { notificationsRoute } from './modules/notifications'
import { circularsRoute } from './modules/circulars'
import { portalRoute } from './modules/portal'
import { portalAuthRoute } from './modules/portal-auth'
import { portalManageRoute } from './modules/portal-manage'
import { portalProcurementRoute } from './modules/portal-procurement'
import { portalPayslipsRoute } from './modules/portal-payslips'
import { payslipsRoute } from './modules/payslips'
import { serviceDeskRoute } from './modules/service-desk'
import { startScheduler } from '#/server/jobs'

const app = new Hono()

app.onError(errorHandler)
app.get('/health', (c) => c.json({ ok: true }))

app.route('/auth', authRoute)
app.route('/files', filesRoute)
app.route('/lookups', lookupsRoute)
app.route('/dashboard', dashboardRoute)
app.route('/staff', staffRoute)
app.route('/scales', scalesRoute)
app.route('/units', unitsRoute)
app.route('/jobs', jobsRoute)
app.route('/positions', positionsRoute)
app.route('/dob', dobRoute)
app.route('/leave', leaveRoute)
app.route('/elevation', elevationRoute)
app.route('/transfers', transfersRoute)
app.route('/nss', nssRoute)
app.route('/staff-records', staffRecordsRoute)
app.route('/disciplinary', disciplinaryRoute)
app.route('/study', studyRoute)
app.route('/promotions', promotionsRoute)
app.route('/circulars', circularsRoute)
app.route('/service-desk', serviceDeskRoute)
app.route('/payslips', payslipsRoute)
// Staff portal. Sign-in and management are mounted before the staff
// services, whose sign-in check covers everything else under /portal.
app.route('/portal/auth', portalAuthRoute)
app.route('/portal/manage/procurement', portalProcurementRoute)
app.route('/portal/manage', portalManageRoute)
app.route('/portal/payslips', portalPayslipsRoute)
app.route('/portal', portalRoute)
app.route('/notifications', notificationsRoute)
app.route('/users', usersRoute)
app.route('/audit', auditRoute)

app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Scheduled notifications (leave ending, reminders, birthdays, national service).
startScheduler()

export { app as apiApp }
