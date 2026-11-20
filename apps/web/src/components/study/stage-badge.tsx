import { STUDY_STAGES } from '@hrms/db/types'
import { Badge } from '#/components/ui/badge'

export function StageBadge({ appstatus, stageStatus }: { appstatus: number; stageStatus: number }) {
  if (stageStatus === 2 || appstatus === 6) return <Badge tone="danger">Declined{appstatus !== 6 ? ` · ${STUDY_STAGES[appstatus]?.replace('Awaiting ', '')}` : ''}</Badge>
  if (appstatus === 5) return <Badge tone="success">Approved by HR</Badge>
  if (appstatus === 4) return <Badge tone="warning">Awaiting HR</Badge>
  if (appstatus === 7) return <Badge>Closed</Badge>
  return <Badge tone="info">{STUDY_STAGES[appstatus] ?? `Stage ${appstatus}`}</Badge>
}

/** Where an application is, as a head sees it: who it waits for (by name of level), or how it ended. */
export function StudyState({ appstatus, stageStatus, waitingFor, mine }: { appstatus: number; stageStatus: number; waitingFor?: string | null; mine?: boolean }) {
  if (mine) return <Badge tone="warning">Waiting for you</Badge>
  if (stageStatus === 2 && appstatus <= 4) return <Badge tone="danger">Disapproved · {STUDY_STAGES[appstatus]?.replace('Awaiting ', '') ?? `stage ${appstatus}`}</Badge>
  if (appstatus >= 1 && appstatus <= 3 && waitingFor) return <Badge tone="info">With the {waitingFor.toLowerCase().replace('hr', 'HR')}</Badge>
  return <StageBadge appstatus={appstatus} stageStatus={stageStatus} />
}
