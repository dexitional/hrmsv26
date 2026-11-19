import { STUDY_STAGES } from '@hrms/db/types'
import { Badge } from '#/components/ui/badge'

export function StageBadge({ appstatus, stageStatus }: { appstatus: number; stageStatus: number }) {
  if (stageStatus === 2 || appstatus === 6) return <Badge tone="danger">Declined{appstatus !== 6 ? ` · ${STUDY_STAGES[appstatus]?.replace('Awaiting ', '')}` : ''}</Badge>
  if (appstatus === 5) return <Badge tone="success">Approved by HR</Badge>
  if (appstatus === 4) return <Badge tone="warning">Awaiting HR</Badge>
  if (appstatus === 7) return <Badge>Closed</Badge>
  return <Badge tone="info">{STUDY_STAGES[appstatus] ?? `Stage ${appstatus}`}</Badge>
}
