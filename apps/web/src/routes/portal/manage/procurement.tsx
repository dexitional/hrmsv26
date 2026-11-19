import { createFileRoute } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { EmptyState, PageHeader } from '#/components/admin/page'

export const Route = createFileRoute('/portal/manage/procurement')({
  component: () => (
    <>
      <PageHeader eyebrow="Management services" title="Procurement manager" description="Your unit’s procurement requests and their approval by dean, director and provost." />
      <EmptyState
        icon={ShoppingCart}
        title="Procurement is not connected yet"
        description="Procurement requests live in the procurement system’s own database, which the HRMS cannot reach yet. They will appear here once it is linked."
      />
    </>
  ),
})
