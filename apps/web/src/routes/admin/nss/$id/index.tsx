import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FileText, Pencil, Trash2 } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date, genderLabel } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { useConfirm } from '#/components/admin/confirm'
import { useSave } from '#/components/admin/mutations'
import { Avatar, DeadlineBadge, DetailList, EmptyState, PageHeader } from '#/components/admin/page'
import { useCan } from '#/components/admin/session'
import { ProfileSkeleton } from '#/components/admin/skeletons'

export const Route = createFileRoute('/admin/nss/$id/')({ component: NssProfile })

function NssProfile() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const canEdit = useCan('nss', 'edit')
  const canManage = useCan('nss', 'manage')
  const { confirm, dialog } = useConfirm()
  const { data: p, isLoading } = useQuery({ queryKey: ['nss', id], queryFn: () => api.get<Record<string, any>>(`/nss/${id}`) })
  const remove = useSave(() => api.delete(`/nss/${id}`), { invalidate: ['nss'], success: 'Record deleted', onDone: () => navigate({ to: '/admin/nss' }) })
  if (isLoading) return <ProfileSkeleton />
  if (!p) return <EmptyState title="Personnel not found" />
  const daysLeft = p.endDate ? Math.round((new Date(`${p.endDate}T00:00`).getTime() - Date.now()) / 86_400_000) : null
  return (
    <>
      {dialog}
      <PageHeader
        back={{ to: '/admin/nss', label: 'National Service' }}
        eyebrow={`NSS ${p.nssNo}`}
        title={
          <span className="flex items-center gap-4">
            <Avatar name={p.fullName} photoUrl={p.photo} className="size-16 text-lg ring-4 ring-secondary" />
            <span>
              {p.fullName}
              <span className="mt-1 block text-sm font-medium text-muted-foreground">{p.unitName ?? 'No unit assigned'}</span>
            </span>
          </span>
        }
        meta={
          <>
            <Badge tone="info" dot={false}>{p.entryYear} – {p.exitYear}</Badge>
            {p.serviceStatus === 'COMPLETED' ? (
              <Badge tone="success">Service completed{p.completedAt ? ` · ${date(p.completedAt)}` : ''}</Badge>
            ) : (
              <DeadlineBadge daysLeft={daysLeft} alertDays={60} doneLabel="Service period ended" runningLabel="Serving" />
            )}
          </>
        }
        actions={
          <>
            {canManage && (
              <Button variant="outline" onClick={() => confirm({ title: `Delete ${p.fullName}?`, danger: true, confirmLabel: 'Delete', onConfirm: () => remove.mutateAsync(undefined) })}>
                <Trash2 /> Delete
              </Button>
            )}
            {canEdit && (
              <Button asChild>
                <Link to="/admin/nss/$id/edit" params={{ id }}>
                  <Pencil /> Edit
                </Link>
              </Button>
            )}
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Personnel" />
          <CardBody>
            <DetailList
              columns={3}
              items={[
                ['NSS number', <span className="font-mono">{p.nssNo}</span>],
                ['Gender', genderLabel(p.gender)],
                ['Date of birth', date(p.dob)],
                ['Phone', p.mobile],
                ['Email', p.email],
                ['Hometown', p.hometown],
                ['Ghana Card', p.ghcardNo],
                ['Assigned unit', p.unitName],
                ['Service period', `${date(p.startDate)} – ${date(p.endDate)}`],
                ['Permanent address', p.address],
              ]}
            />
          </CardBody>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Emergency contact" />
            <CardBody>
              <DetailList
                columns={1}
                items={p.emergencyPhone || p.emergencyEmail ? [['Phone', p.emergencyPhone], ['Email', p.emergencyEmail], ['Address', p.emergencyAddress]] : [['Contact', p.emergencyContact]]}
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="NSS form" />
            <CardBody>
              {p.nssForm?.startsWith('/api/files/') ? (
                <a href={p.nssForm} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  <FileText className="size-4" /> Open NSS form
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">{p.nssForm ? 'Legacy file (staff portal)' : 'Not uploaded'}</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
