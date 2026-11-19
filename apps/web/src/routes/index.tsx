import { createFileRoute, redirect } from '@tanstack/react-router'

// The HRMS is an admin platform only: the root opens the dashboard (which
// sends signed-out visitors to the sign-in page).
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin' })
  },
})
