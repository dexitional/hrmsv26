import { createFileRoute } from '@tanstack/react-router'
import { StaffForm } from '#/components/forms/staff-form'
import { PageHeader } from '#/components/admin/page'

export const Route = createFileRoute('/admin/staff/new')({ component: NewStaff })

function NewStaff() {
  return (
    <>
      <PageHeader back={{ to: '/admin/staff', label: 'Staff' }} title="New staff record" description="Capture a newly appointed staff member, or one already employed whose record is not yet in the system." />
      <StaffForm />
    </>
  )
}
