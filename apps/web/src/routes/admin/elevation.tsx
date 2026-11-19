import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { BadgeCheck, FileClock, Hourglass, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { PageHeader } from '#/components/admin/page'
import { ContractsTab } from '#/components/elevation/contracts'
import { Confirmations, ElevationRecords } from '#/components/elevation/records'

const TABS = ['records', 'confirmations', 'renewals', 'postretire'] as const

export const Route = createFileRoute('/admin/elevation')({
  validateSearch: z.object({ tab: z.enum(TABS).optional(), status: z.string().optional() }),
  component: ElevationPage,
})

function ElevationPage() {
  const { tab = 'records', status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const go = (t: (typeof TABS)[number], s?: string) => navigate({ search: { tab: t, status: s } })
  return (
    <>
      <PageHeader
        eyebrow="Modules"
        title="Elevation"
        description="Staff progression: appointments, promotions and upgrades, confirmations, senior-member renewals and post-retirement contracts."
      />
      <Tabs value={tab} onValueChange={(t) => go(t as (typeof TABS)[number])}>
        <TabsList className="mb-5">
          <TabsTrigger value="records"><TrendingUp /> Appointment & promotion records</TabsTrigger>
          <TabsTrigger value="confirmations"><BadgeCheck /> Confirmations</TabsTrigger>
          <TabsTrigger value="renewals"><FileClock /> Senior membership renewals</TabsTrigger>
          <TabsTrigger value="postretire"><Hourglass /> Post-retirement contracts</TabsTrigger>
        </TabsList>
        <TabsContent value="records"><ElevationRecords /></TabsContent>
        <TabsContent value="confirmations"><Confirmations status={status} onStatus={(s) => go('confirmations', s)} /></TabsContent>
        <TabsContent value="renewals"><ContractsTab kind="renewals" status={status} onStatus={(s) => go('renewals', s)} /></TabsContent>
        <TabsContent value="postretire"><ContractsTab kind="postretire" status={status} onStatus={(s) => go('postretire', s)} /></TabsContent>
      </Tabs>
    </>
  )
}
