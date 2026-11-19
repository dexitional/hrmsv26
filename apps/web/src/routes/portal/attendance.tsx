import { createFileRoute } from '@tanstack/react-router'
import { Clock } from 'lucide-react'
import { EmptyState, PageHeader } from '#/components/admin/page'

export const Route = createFileRoute('/portal/attendance')({
  component: () => (
    <>
      <PageHeader eyebrow="Staff services" title="Attendance" description="Clock-in records from the University’s attendance devices." />
      <EmptyState
        icon={Clock}
        title="Attendance is not connected yet"
        description="Your clock-in and clock-out records will appear here once the attendance system is linked to the HRMS."
      />
    </>
  ),
})
