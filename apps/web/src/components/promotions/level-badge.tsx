import { PROMOTION_LEVELS } from '@hrms/db/types'
import { Badge } from '#/components/ui/badge'

/** Where an application stands: its level, or that it was sent back. */
export function LevelBadge({ level, stageStatus }: { level: number; stageStatus?: number }) {
  if (stageStatus !== undefined && stageStatus >= 10) return <Badge tone="warning">Returned for correction</Badge>
  if (level === 7) return <Badge tone="success">Approved</Badge>
  if (level === 8) return <Badge tone="danger">Disapproved</Badge>
  if (level >= 4) return <Badge tone="brand">{PROMOTION_LEVELS[level]}</Badge>
  return <Badge tone="info">{PROMOTION_LEVELS[level] ?? `Level ${level}`}</Badge>
}
