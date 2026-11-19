// Words staff see for their own leave (HR's admin labels are terser).
export const MY_LEAVE_LABELS: Record<string, string> = {
  'STAFF-PENDING': 'Draft',
  'HEAD-PENDING': 'With your head',
  'HEAD-REJECTED': 'Not recommended',
  'HR-PENDING': 'With HR',
  'HR-REJECTED': 'Declined by HR',
  GRANTED: 'Approved',
  ENDED: 'Ended',
  CANCELLED: 'Withdrawn',
}

export const REQUEST_STATUS_LABELS: Record<string, string> = { OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved', CLOSED: 'Closed' }
export const REQUEST_STATUS_TONES: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = { OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'neutral' }
