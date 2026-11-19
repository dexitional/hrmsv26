import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '#/components/admin/page'
import { CircularForm } from '#/components/circulars/circular-form'

export const Route = createFileRoute('/admin/circulars/new')({
  component: () => (
    <>
      <PageHeader back={{ to: '/admin/circulars', label: 'Circulars' }} title="New circular" description="Save it as a draft, check it, send yourself a test, then publish." />
      <CircularForm />
    </>
  ),
})
