import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { CalendarDays, CalendarOff, Clock4, Equal, Layers, ListChecks, Scale } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { PageHeader } from '#/components/admin/page'
import { LeaveRecords } from '#/components/leave/leave-records'
import {
  BalancesTab,
  ConstantsTab,
  DefermentsTab,
  EntitlementsTab,
  HolidaysTab,
  LeaveTypesTab,
} from '#/components/leave/leave-settings'

const TABS = ['records', 'types', 'holidays', 'constants', 'entitlements', 'balances', 'deferments'] as const

export const Route = createFileRoute('/admin/leave')({
  validateSearch: z.object({
    tab: z.enum(TABS).optional(),
    status: z.string().optional(),
    year: z.coerce.number().optional(),
  }),
  component: LeavePage,
})

function LeavePage() {
  const { tab = 'records', status, year } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  return (
    <>
      <PageHeader
        eyebrow="Modules"
        title="Leave"
        description="Leave applications, and the types, holidays, adjustments, entitlements, balances and deferments that decide each staff member's leave."
      />
      <Tabs value={tab} onValueChange={(t) => navigate({ search: { tab: t as (typeof TABS)[number] } })}>
        <TabsList className="mb-5">
          <TabsTrigger value="records"><ListChecks /> Leave records</TabsTrigger>
          <TabsTrigger value="types"><Layers /> Types</TabsTrigger>
          <TabsTrigger value="holidays"><CalendarOff /> Holidays</TabsTrigger>
          <TabsTrigger value="constants"><Equal /> Leave constants</TabsTrigger>
          <TabsTrigger value="entitlements"><Scale /> Entitlements</TabsTrigger>
          <TabsTrigger value="balances"><CalendarDays /> Balances</TabsTrigger>
          <TabsTrigger value="deferments"><Clock4 /> Deferments</TabsTrigger>
        </TabsList>
        <TabsContent value="records">
          <LeaveRecords status={status} year={year} onFilter={(p) => navigate({ search: { tab: 'records', ...p } })} />
        </TabsContent>
        <TabsContent value="types"><LeaveTypesTab /></TabsContent>
        <TabsContent value="holidays"><HolidaysTab /></TabsContent>
        <TabsContent value="constants"><ConstantsTab /></TabsContent>
        <TabsContent value="entitlements"><EntitlementsTab /></TabsContent>
        <TabsContent value="balances"><BalancesTab /></TabsContent>
        <TabsContent value="deferments">
          <DefermentsTab status={status} onStatus={(s) => navigate({ search: { tab: 'deferments', status: s } })} />
        </TabsContent>
      </Tabs>
    </>
  )
}
