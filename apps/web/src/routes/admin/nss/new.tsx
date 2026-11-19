import { createFileRoute } from '@tanstack/react-router'
import { NssForm } from '#/components/forms/nss-form'
import { PageHeader } from '#/components/admin/page'

export const Route = createFileRoute('/admin/nss/new')({ component: () => (
  <>
    <PageHeader back={{ to: '/admin/nss', label: 'National Service' }} title="New national service personnel" />
    <NssForm />
  </>
) })
