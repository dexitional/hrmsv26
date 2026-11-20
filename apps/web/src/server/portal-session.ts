// Client-safe surface of the staff portal session (see session.ts for why the
// real work is loaded dynamically). Staff and heads have their own cookie, so
// an HR officer can be signed in to the admin and the portal at once.
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

export const PORTAL_COOKIE = 'hrms_staff'
export const PORTAL_TTL_SECONDS = 60 * 60 * 8 // 8 hours
/** An administrator's switched access to a staff member's portal ends sooner. */
export const SWITCH_TTL_SECONDS = 60 * 60 * 2 // 2 hours

export type { PortalUser, HeadOf } from './portal-session-core'

export const getPortalSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { portalUserFromToken } = await import('./portal-session-core')
  return portalUserFromToken(getCookie(PORTAL_COOKIE))
})
