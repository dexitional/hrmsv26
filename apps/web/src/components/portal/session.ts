import { useRouteContext } from '@tanstack/react-router'

// The signed-in staff member is fetched once per visit and cached, like the
// admin session; the API checks the portal cookie on every request.
export const PORTAL_SESSION_KEY = ['portal-session'] as const
export const PORTAL_SESSION_STALE_MS = 5 * 60_000

export function useStaff() {
  return useRouteContext({ from: '/portal', select: (c) => c.staff })
}
