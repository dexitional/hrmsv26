import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { BookOpenCheck, Pencil, Printer, Trash2 } from 'lucide-react'
import { api, errorMessage } from '#/lib/api-client'
import { date } from '#/lib/format'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { DataTable } from '#/components/admin/data-table'
import { EmptyState, PageHeader, StatusBadge } from '#/components/admin/page'
import { useConfirm } from '#/components/admin/confirm'
import { useSave } from '#/components/admin/mutations'
import { RowActions } from '#/components/admin/row-actions'
import { IntentionDialog } from '#/components/study/intention-dialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/portal/study')({ component: MyStudy })

type R = Record<string, any>

function MyStudy() {
  const { data, isLoading } = useQuery({ queryKey: ['portal', 'study'], queryFn: () => api.get<{ intentions: Array<R>; requests: Array<R>; leaves: Array<R> }>('/portal/study') })
  const { confirm, dialog } = useConfirm()
  const [editing, setEditing] = useState<R | null>(null)
  const remove = useSave((id: number) => api.delete(`/portal/study/intentions/${id}`), { invalidate: ['portal'], success: 'Application withdrawn and deleted' })
  // The full form is loaded when editing starts (the list carries only a summary).
  const edit = async (id: number) => {
    try {
      setEditing(await api.get<R>(`/portal/study/intentions/${id}`))
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }
  return (
    <>
      {dialog}
      <IntentionDialog intention={editing} asStaff onClose={() => setEditing(null)} />
      <PageHeader eyebrow="Staff services" title="Study leave" description="Your intentions to study, study leave requests and study leave on record." />
      <div className="space-y-4">
        <Card>
          <CardHeader title="Intentions to study" description="Recommended by your head, dean and provost, then decided by HR. You can edit or withdraw one until your head of unit acts on it." />
          <CardBody className="p-0">
            <DataTable
              loading={isLoading}
              rows={data?.intentions}
              className="rounded-none border-0"
              empty={<EmptyState icon={BookOpenCheck} title="No intentions to study" />}
              columns={[
                { header: 'Programme', cell: (r: R) => <span className="block max-w-72 truncate font-semibold text-slate-800">{r.intProg}</span> },
                { header: 'Institution', cell: (r: R) => <span className="block max-w-56 truncate text-xs">{r.studyPlace}</span> },
                { header: 'Starts', cell: (r: R) => date(r.dateCommence) },
                { header: 'Stage', cell: (r: R) => <Badge tone={Number(r.appstatus) === 5 ? 'success' : Number(r.appstatus) === 6 ? 'danger' : 'info'}>{r.stageLabel}</Badge> },
                {
                  header: '',
                  align: 'right',
                  cell: (r: R) => (
                    <span className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => window.open(`/print/study-intention/${r.id}?from=portal`, '_blank')}>
                        <Printer /> View / print
                      </Button>
                      {/* Only while it is still with the head of unit and no one has acted on it. */}
                      <RowActions
                        actions={[
                          { label: 'Edit application', icon: Pencil, hidden: !Number(r.editable), onSelect: () => void edit(r.id) },
                          {
                            label: 'Withdraw and delete',
                            icon: Trash2,
                            danger: true,
                            hidden: !Number(r.editable),
                            onSelect: () =>
                              confirm({
                                title: 'Withdraw this application?',
                                description: `Your intention to study ${r.intProg ? `“${r.intProg}”` : ''} is deleted and your head of unit will no longer see it. You can apply again.`,
                                confirmLabel: 'Withdraw and delete',
                                danger: true,
                                onConfirm: () => remove.mutateAsync(r.id),
                              }),
                          },
                        ]}
                      />
                    </span>
                  ),
                },
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Study leave requests" />
          <CardBody className="p-0">
            <DataTable
              loading={isLoading}
              rows={data?.requests}
              className="rounded-none border-0"
              empty={<EmptyState icon={BookOpenCheck} title="No requests" />}
              columns={[
                { header: 'Programme', cell: (r: R) => <span className="block max-w-72 truncate font-semibold text-slate-800">{r.studyProgram}</span> },
                { header: 'Institution', cell: (r: R) => <span className="block max-w-56 truncate text-xs">{r.studyInstitute}</span> },
                { header: 'Period', cell: (r: R) => `${date(r.studyStart)} – ${date(r.studyEnd)}` },
                { header: 'Status', cell: (r: R) => <StatusBadge status={r.applyStatus} /> },
              ]}
            />
          </CardBody>
        </Card>
      </div>
    </>
  )
}
