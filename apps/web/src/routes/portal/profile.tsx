import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { BadgeCheck, CreditCard, GraduationCap, HeartPulse, IdCard, Pencil, Users } from 'lucide-react'
import { api } from '#/lib/api-client'
import { date, genderLabel } from '#/lib/format'
import { ELEVATION_LABELS, GROUP_LABELS, MARITAL_LABELS, QUALIFICATION_LABELS, statusLabel } from '#/lib/labels'
import { contactUpdateSchema } from '#/lib/schemas'
import { properName } from '#/lib/text-case'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardBody, CardHeader } from '#/components/ui/card'
import { Input, Textarea } from '#/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { DataTable } from '#/components/admin/data-table'
import { Field } from '#/components/admin/form'
import { FormDialog } from '#/components/admin/form-dialog'
import { useSave } from '#/components/admin/mutations'
import { Avatar, DetailList, EmptyState, PageHeader, StatusBadge } from '#/components/admin/page'
import { ProfileSkeleton } from '#/components/admin/skeletons'

export const Route = createFileRoute('/portal/profile')({ component: MyProfile })

type R = Record<string, any>
const blank = (v: unknown) => v === null || v === undefined || v === '' || String(v).startsWith('0000')

function MyProfile() {
  const [editing, setEditing] = useState(false)
  const { data: p, isLoading } = useQuery({ queryKey: ['portal', 'profile'], queryFn: () => api.get<R>('/portal/profile') })
  if (isLoading) return <ProfileSkeleton />
  if (!p) return <EmptyState title="Profile not found" />
  return (
    <>
      <ContactDialog open={editing} onClose={() => setEditing(false)} p={p} />
      <PageHeader
        eyebrow={`Staff ${p.staffNo}`}
        title={
          <span className="flex items-center gap-4">
            <Avatar name={p.fullName} staffNo={p.staffNo} className="size-16 text-lg ring-4 ring-secondary" />
            <span className="min-w-0">
              {p.fullName}
              <span className="mt-1 block text-sm font-medium text-muted-foreground">{[properName(p.jobTitle), properName(p.unitName)].filter(Boolean).join(" · ")}</span>
            </span>
          </span>
        }
        meta={
          <>
            <StatusBadge status={p.staffStatus} />
            {p.curStaffGroup && <Badge tone="info" dot={false}>{GROUP_LABELS[p.curStaffGroup] ?? p.curStaffGroup}</Badge>}
            {p.grade && <Badge dot={false}>{p.grade} · Notch {p.notch}</Badge>}
          </>
        }
        actions={
          <Button onClick={() => setEditing(true)}>
            <Pencil /> Update my details
          </Button>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="relatives">Relatives</TabsTrigger>
          <TabsTrigger value="banks">Bank</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="history">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
            <Card className="lg:col-span-2">
              <CardHeader title="Personal" />
              <CardBody>
                <DetailList
                  columns={3}
                  items={[
                    ['Gender', genderLabel(p.gender)],
                    ['Date of birth', blank(p.dob) ? '—' : `${date(p.dob, 'long')} (${p.age})`],
                    ['Marital status', p.mstatus ? (MARITAL_LABELS[p.mstatus] ?? p.mstatus) : null],
                    ['Hometown', properName(p.hometown)],
                    ['Region', properName(p.region)],
                    ['Nationality', properName(p.nationality ?? p.country)],
                    ['SSNIT', p.ssnit],
                    ['First appointment', date(p.firstAppointDate)],
                    ['Assumed duty', date(p.assumeDate)],
                  ]}
                />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Identity & health cover" description="You can update these yourself." />
              <CardBody className="space-y-3">
                <IdRow icon={IdCard} label="Ghana Card" value={p.ghanaCardNo} />
                <IdRow icon={HeartPulse} label="NHIS number" value={p.nhisNumber} sub={p.nhisExpireDate ? `Expires ${date(p.nhisExpireDate)}` : undefined} />
              </CardBody>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader title="Contact" action={<Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil /> Edit</Button>} />
              <CardBody>
                <DetailList
                  items={[
                    ['University email', p.uccMail],
                    ['Personal email', p.email?.toLowerCase()],
                    ['Phone', p.phone],
                    ['Residential address', p.address],
                    ['Permanent address', p.paddress],
                  ]}
                />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Emergency contact" />
              <CardBody>
                <DetailList
                  columns={1}
                  items={[
                    ['Name', properName(p.emergencyName) ?? p.emergencyContact],
                    ['Relation', properName(p.emergencyRelation)],
                    ['Phone', p.emergencyPhone],
                    ['Address', p.emergencyAddress],
                  ]}
                />
              </CardBody>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatives">
          <DataTable
            rows={p.relatives}
            empty={<EmptyState icon={Users} title="No relatives on record" description="Ask the Directorate of Human Resource to add your spouse, children or next of kin." />}
            columns={[
              { header: 'Relation', cell: (r: R) => statusLabel(r.relation ?? '') },
              { header: 'Name', cell: (r: R) => <span className="font-semibold text-slate-800">{properName([r.fname, r.mname, r.lname].filter(Boolean).join(' '))}</span> },
              { header: 'Date of birth', cell: (r: R) => date(r.dob) },
              { header: 'Gender', cell: (r: R) => genderLabel(r.gender) },
              { header: 'Next of kin', cell: (r: R) => (r.kin === '1' ? <Badge tone="brand">Next of kin</Badge> : '') },
            ]}
          />
        </TabsContent>

        <TabsContent value="banks">
          <DataTable
            rows={p.banks}
            empty={<EmptyState icon={CreditCard} title="No bank accounts on record" />}
            columns={[
              { header: 'Bank', cell: (r: R) => <span className="font-semibold text-slate-800">{r.bankName}</span> },
              { header: 'Account', cell: (r: R) => <span className="font-mono text-xs">{r.accountNo}</span> },
              { header: 'Branch', cell: (r: R) => r.accountBranch ?? '—' },
              { header: '', cell: (r: R) => (r.isDefault ? <Badge tone="success">Salary account</Badge> : '') },
            ]}
          />
        </TabsContent>

        <TabsContent value="qualifications">
          <DataTable
            rows={p.qualifications}
            empty={<EmptyState icon={GraduationCap} title="No qualifications on record" />}
            columns={[
              { header: 'Qualification', cell: (r: R) => QUALIFICATION_LABELS[r.certRate] ?? r.certRate },
              { header: 'Programme', cell: (r: R) => <span className="block max-w-64 truncate font-semibold text-slate-800">{r.qualify}</span> },
              { header: 'Institution', cell: (r: R) => <span className="block max-w-56 truncate text-xs">{r.institution}</span> },
              { header: 'Awarded', cell: (r: R) => date(r.gradDate) },
              { header: 'Verified', cell: (r: R) => (r.verified === '1' ? <Badge tone="success"><BadgeCheck className="size-3" /> Verified</Badge> : <Badge>Not yet</Badge>) },
            ]}
          />
        </TabsContent>

        <TabsContent value="history">
          <DataTable
            rows={p.elevations}
            empty={<EmptyState title="No appointment records" />}
            columns={[
              { header: 'Type', cell: (r: R) => <StatusBadge status={r.applyType ?? 'APPOINTMENT'} label={`${ELEVATION_LABELS[r.applyType ?? 'APPOINTMENT']}${r.isCurrent ? ' (current)' : ''}`} /> },
              { header: 'Date', cell: (r: R) => date(r.appointDate) },
              { header: 'Designation', cell: (r: R) => <span className="block max-w-64 truncate">{r.jobTitle}</span> },
              { header: 'Grade', cell: (r: R) => (r.grade ? `${r.grade} · ${r.notch}` : '—') },
              { header: 'Unit', cell: (r: R) => <span className="block max-w-56 truncate text-xs">{r.unitName}</span> },
            ]}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}

function IdRow({ icon: Icon, label, value, sub }: { icon: typeof IdCard; label: string; value: string | null; sub?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="eyebrow block">{label}</span>
        <span className="block truncate font-mono text-sm font-semibold text-slate-800">{value || 'Not provided'}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </span>
    </div>
  )
}

type In = z.input<typeof contactUpdateSchema>
const v = (x: unknown) => (blank(x) ? '' : String(x))

function ContactDialog({ open, onClose, p }: { open: boolean; onClose: () => void; p: R }) {
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<In>({
    resolver: zodResolver(contactUpdateSchema),
    values: {
      phone: v(p.phone),
      email: v(p.email).toLowerCase(),
      address: v(p.address),
      paddress: v(p.paddress),
      emergencyName: v(p.emergencyName),
      emergencyRelation: v(p.emergencyRelation),
      emergencyPhone: v(p.emergencyPhone),
      emergencyAddress: v(p.emergencyAddress),
      ghanaCardNo: v(p.ghanaCardNo),
      nhisNumber: v(p.nhisNumber),
      nhisExpireDate: v(p.nhisExpireDate).slice(0, 10),
    },
  })
  const save = useSave((d: In) => api.put('/portal/profile/contact', d), { invalidate: ['portal'], success: 'Your details were updated', onDone: onClose, onError: setError })
  const err = (k: keyof In) => (errors[k] as { message?: string } | undefined)?.message
  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !o && (onClose(), setError(null))}
      title="Update my details"
      description="Changes go straight onto your staff record. For anything else (name, date of birth, appointment) contact the Directorate of Human Resource."
      submitLabel="Save my details"
      busy={save.isPending}
      error={error}
      wide
      onSubmit={handleSubmit((d) => save.mutate(d))}
    >
      <Field label="Ghana Card number" error={err('ghanaCardNo')} hint="GHA-000000000-0">
        <Input {...register('ghanaCardNo')} className="font-mono uppercase" placeholder="GHA-000000000-0" />
      </Field>
      <Field label="NHIS number" error={err('nhisNumber')}>
        <Input {...register('nhisNumber')} className="font-mono" />
      </Field>
      <Field label="NHIS expiry date" error={err('nhisExpireDate')}>
        <Input type="date" {...register('nhisExpireDate')} />
      </Field>
      <Field label="Phone" error={err('phone')}>
        <Input type="tel" {...register('phone')} />
      </Field>
      <Field label="Personal email" error={err('email')} className="sm:col-span-2">
        <Input type="email" {...register('email')} />
      </Field>
      <Field label="Residential address" hint="House number, area and landmark" className="sm:col-span-2">
        <Textarea rows={2} {...register('address')} />
      </Field>
      <Field label="Permanent address" className="sm:col-span-2">
        <Textarea rows={2} {...register('paddress')} />
      </Field>
      <Field label="Emergency contact name">
        <Input {...register('emergencyName')} />
      </Field>
      <Field label="Relation">
        <Input {...register('emergencyRelation')} placeholder="Spouse, sibling…" />
      </Field>
      <Field label="Emergency phone">
        <Input type="tel" {...register('emergencyPhone')} />
      </Field>
      <Field label="Emergency address">
        <Input {...register('emergencyAddress')} />
      </Field>
    </FormDialog>
  )
}
