// Cached option lists for pickers.
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api-client'
import type { Option } from '#/lib/api-client'

const options = (path: string) => ({
  queryKey: ['lookups', path],
  queryFn: () => api.get<Array<Option>>(`/lookups/${path}`),
  staleTime: 5 * 60_000,
})

export const useUnits = () => useQuery(options('units'))
export const useJobs = () => useQuery(options('jobs'))
export const useScales = () => useQuery(options('scales'))
export const useTitles = () => useQuery(options('titles'))
export const useLeaveTypes = () => useQuery(options('leave-types'))

export interface StaffBrief {
  staffNo: number
  fullName: string
  gender: string | null
  dob: string | null
  age: number | null
  phone: string | null
  uccMail: string | null
  staffStatus: string | null
  staffGroup: string | null
  promoId: number | null
  unitId: number | null
  unitName: string | null
  jobId: number | null
  jobTitle: string | null
  scaleId: number | null
  grade: string | null
  notch: number | null
}
