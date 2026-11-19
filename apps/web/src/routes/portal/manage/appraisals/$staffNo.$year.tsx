import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PenLine } from 'lucide-react'
import { api } from '#/lib/api-client'
import { properName } from '#/lib/text-case'
import { Button } from '#/components/ui/button'
import { Card, CardBody } from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useConfirm } from '#/components/admin/confirm'
import { useSave } from '#/components/admin/mutations'
import { EmptyState, PageHeader, StaffCell } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'
import { FormAEditor } from '#/components/appraisal/form-a-editor'
import { FormAStatus, FormAView, FormBStatus, FormBView } from '#/components/appraisal/shared'

export const Route = createFileRoute('/portal/manage/appraisals/$staffNo/$year')({ component: AppraiseStaff })

function AppraiseStaff() {
  const { staffNo, year } = Route.useParams()
  const navigate = useNavigate()
  const { confirm, dialog } = useConfirm()
  const [editing, setEditing] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'appraise', staffNo, year], queryFn: () => api.get<Record<string, any>>(`/portal/manage/appraisals/${staffNo}/${year}`) })
  const countersign = useSave((id: number) => api.post(`/portal/manage/appraisals/self/${id}/countersign`, { confirm: true }), { invalidate: ['portal'], success: 'Self-appraisal countersigned' })
  if (isLoading) return <ProfileSkeleton />
  if (!data) return <EmptyState title="Not found" />
  const { staff, formA, formB } = data
  const formAOpen = !formA || Number(formA.status) < 2
  return (
    <>
      {dialog}
      <PageHeader
        back={{ to: '/portal/manage/appraisals', label: 'Appraisal manager' }}
        eyebrow={`Year under review · ${year}`}
        title={<StaffCell link={false} staffNo={staff.staffNo} name={staff.fullName} sub={[properName(staff.jobTitle), properName(staff.unitName)].filter(Boolean).join(' · ')} />}
        meta={
          <>
            <span className="text-xs text-muted-foreground">Form B</span> <FormBStatus status={formB ? Number(formB.appStatus) : null} />
            <span className="ml-2 text-xs text-muted-foreground">Form A</span> <FormAStatus status={formA ? Number(formA.status) : null} />
          </>
        }
      />
      <Tabs defaultValue={formB && Number(formB.appStatus) === 1 ? 'b' : 'a'}>
        <TabsList className="mb-4">
          <TabsTrigger value="b">Self-appraisal (Form B)</TabsTrigger>
          <TabsTrigger value="a">Appraisal (Form A)</TabsTrigger>
        </TabsList>
        <TabsContent value="b">
          {!formB ? (
            <EmptyState title={`No ${year} self-appraisal yet`} description="The staff member fills it from their portal. You can still complete Form A." />
          ) : (
            <div className="space-y-4">
              {Number(formB.appStatus) === 1 && (
                <Card className="border-primary/30">
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-700">Read the self-appraisal below, then countersign it.</p>
                    <Button
                      onClick={() =>
                        confirm({ title: 'Countersign this self-appraisal?', description: `You confirm you have read ${staff.fullName}’s ${year} self-appraisal.`, confirmLabel: 'Countersign', onConfirm: () => countersign.mutateAsync(formB.id) })
                      }
                    >
                      <PenLine /> Countersign
                    </Button>
                  </CardBody>
                </Card>
              )}
              <FormBView form={formB} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="a">
          {formA && !editing ? (
            <div className="space-y-4">
              {formAOpen && (
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-700">Waiting for {staff.fullName} to comment and sign. You can still change it until they do.</p>
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Edit appraisal
                    </Button>
                  </CardBody>
                </Card>
              )}
              <FormAView form={formA} />
            </div>
          ) : formAOpen ? (
            <FormAEditor
              staffNo={staff.staffNo}
              year={year}
              questions={data.questions}
              existing={formA}
              onDone={() => (setEditing(false), navigate({ to: '/portal/manage/appraisals' }))}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </>
  )
}
