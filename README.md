# UCC HRMS — Directorate of Human Resource

Admin platform for HR officers and the IT technical support team of the University of Cape Coast. It runs on the **existing HR database** (`hr26`, the legacy `hr` schema): legacy tables are reused as they are, and `packages/db/migrations` only adds tables and nullable columns, so the legacy staff portal keeps working against the same data.

## Stack

TanStack Start (React 19, file routes, SSR) with a Hono API at `/api`, MySQL via `mysql2`, Tailwind CSS v4 with shadcn-style (Radix) components and Recharts. npm workspaces + Turborepo, modelled on `dricms`:

```
apps/web            TanStack Start app (UI + /api)
  src/routes          /login, /admin/* pages, /print/* printouts, /api/$
  src/server/api      Hono app: modules/ (one per area) and lib/ (db, auth, hr helpers…)
  src/lib             shared by client and server: zod schemas, permissions, labels
packages/db         MySQL pool, SQL migrations, admin seed
packages/ui         brand tokens (navy #172554, blush #fee2e2) and cn()
```

## Setup

```bash
npm install
# DATABASE_URL points at hr26 (same MySQL server/credentials as capevars)
cp packages/db/.env.example packages/db/.env
cp apps/web/.env.example apps/web/.env      # SESSION_SECRET: openssl rand -hex 32
npm run db:migrate      # adds the HRMS tables/columns to hr26 (idempotent, tracked in _migrations)
npm run db:seed         # first administrator from SEED_ADMIN_* (re-run to reset its password)
npm run dev             # http://localhost:3030
```

Production: `npm run build`, then `npm start`. Set `STORAGE_DIR` to a persistent path for uploads.

## Sign-in

- **Email + password** (bcrypt; 5 failures lock the account for 15 minutes).
- **Google** for any account whose email an administrator has added — Google never creates accounts. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and register `{APP_URL}/api/auth/google/callback`. Accounts can be Google-only (no password).
- `DEV_LOGIN=true` (development only) shows an email box that stands in for Google.

Accounts live in the new `hrms_users` table, not the legacy `user` table.

| Role | Can |
| --- | --- |
| Administrator | Everything, including user accounts |
| HR Officer | Every HR module (create, edit, delete, merge); no account administration |
| IT Support | User accounts and the full activity log; can correct HR data but not delete or merge |
| Viewer | Read-only access to every HR module |

## What is where

| Area | Legacy tables used | Notes |
| --- | --- | --- |
| Staff (active / contract / inactive tabs) | `staff`, `promotion`, `doc` | Photos from `cdn.ucc.edu.gh/photos/?tag=<staff no>`. New staff get `MAX(staff_no)+1`; existing staff keep theirs. Personal documents (PDF) are kept in `doc` by category. |
| Grades & Notches | `scale` | |
| Units & Offices | `unit` | Merge (master unit ID prompt), printable list, printable unit members. |
| Designations | `job` | Staff counts; merge into a master designation (also rewrites leave entitlement job lists). |
| Positions | `position` | Expiry alerts 90 days before the end date; printable position history. A current HEAD/SUBHEAD position sets the unit's head/sub-head. |
| Date of Birth | `staff.dob`, new `staff_dob_log` | Every change logged with a reason. Green < 59, amber 59, red ≥ 60. |
| Leave | `leave_dump`, `leave_type`, `leave_exclude`, `leave_constant`, `leave_weight`, `leave_balance`, `leave_defer` | HR can apply on a staff member's behalf and edit applications while HR- or Head-pended (Junior and Senior Staff are charged business days, Senior Members calendar days with weekends counted; public holidays are never counted, and adding, moving, deactivating or deleting a holiday re-dates granted leave: within the leave period it moves the end date ±1 leave day; after the end date up to the resumption date it only moves resumption to the next working day; overlapping leave and annual leave beyond what remains are refused). Printable application with the staff photo; printable statistics; remove reliever (`staff.flag_leave` → 0). |
| Elevation | `promotion`, `renewal`, `postretire` | Appointment / promotion / upgrade forms, confirmations, renewals and post-retirement contracts with printable "expired this year" lists. |
| Transfers | `transfer`, `transfer_request` | A *new* transfer moves the staff member now; an *existing* one is history only. Approving a request creates the transfer and moves them. |
| NSS | `nss` | |
| Circulars | `circular`, `notification` (staff portal inbox) | `hrms_circular_recipients` |
| Staff › Relatives / Bank info / Qualifications | `staff_rel`, `bank`, `certificate` | Relative codes are the staff number and a letter in a fixed order: spouses, then children, then parents, then other relatives (`14023A`, `14023B`…; `relativeCodes` in `@hrms/db`). The family is renumbered whenever a relative is added, removed or changes relation; every code that moves is kept in `hrms_relative_code_history` (0043). All existing families were renumbered once with `npm run db:renumber-relatives` (`--dry-run` to preview). One next of kin; one default salary account (also `staff.bank_id`); certificate PDFs open in a popup. |
| Staff Disciplinary | `disciplinary` | Warning, suspension, interdiction, dismissal, termination; printable record per staff member. |
| Study Leave | `study_intention`, `tndstudy_activities`, `study_leave`, `study_request`, `study_benefit` | Intentions to study move head of unit → dean/director → provost → HR; every decision is logged. An approved intention or staff request becomes a study leave grant, tracked to resumption and bond end. Printable intention form and study leave record. |
| Appointment & Promotion | `staff_promotion`, `promo_activities`, `promotion_data`, `promo_papers`, `assessors`, `hr_variable` | Applications move department → faculty → college → Directorate of HR → assessors → A&P board → approved/disapproved, with HR's processing steps from `hr_variable`. HR can return, assign assessors, disapprove, or approve & effect (creates the promotion/appointment record). Printable application form and processing record. |

## Notifications (SMS & email)

System › Notifications shows gateway status, the scheduled jobs (with "Run now"), every message sent and previews of each message.

- **SMS:** mNotify (`MNOTIFY_API_KEY`), falling back to SMSOnlineGH (`SMSONLINEGH_API_KEY`) when mNotify is not set up or rejects a send. Sender ID `SMS_SENDER_ID` (max 11 characters, registered with both).
- **Email:** Google (Gmail) with an app password: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM_NAME`.
- **Scheduler** (`SCHEDULER_ENABLED=true`), times in GMT:
  - *Daily 07:00* — granted leave past its end date becomes ENDED (reliever released) and, if it ended within the last 7 days, the staff member is told it ended and when to resume; staff whose granted leave ends within 3 days get a reminder; staff celebrating their birthday get wishes (29 Feb birthdays on 28 Feb in other years).
  - *1 November 07:00* (caught up until 7 Nov) — national service personnel whose service ended before 1 November are marked COMPLETED (`nss.service_status`) and thanked by SMS. (The service year runs November–October, so this thanks the cohort finishing, not the one that has just started.)
- **On record changes:** a transfer that moves the staff member (new effective transfer or approved request) tells them their new unit and effective date; a new disciplinary record tells them the action and issue date (never the reason).
- Every message is logged in `hrms_notifications` with a unique key, so nothing is sent twice; failed/unconfigured sends — and simulated ones, once a gateway is configured — are retried on the next run.
- `MESSAGING_SIMULATE=true` (development only) logs messages as "simulated" when no keys are set.

## Staff portal (`/portal`)

A second section for staff and heads (built from the old Slim staff portal in `files/bkp`), in the same frame as the admin (`components/shell/app-shell.tsx`).

- **Sign-in** (`/portal/login`): Google with the UCC email on the staff record (`/api/auth/google?portal=1`, same Google client and callback as the admin), or a one-time 6-digit code sent by SMS and email to the contact details on the record (10 minutes, 5 attempts, 3 codes per 15 minutes; only a hash is stored and the message log keeps "[sign-in code]"). Legacy `user.password` values are not used. Own cookie (`hrms_staff`, token `kind: 'staff'`), so admin and portal sessions are separate. Only active staff (`staff_status` active, not deleted) can sign in.
- **HR officers / IT support who are staff**: an admin account with `hrms_users.staff_no` gets "My staff portal"; a portal user with an active admin account gets "Switch to HRMS admin". Neither asks to sign in again.
- **Switch Access** (administrators and HR officers, i.e. `staff: manage`; on each staff profile, Admin → Staff → a staff member): use the staff portal as a chosen active staff member sees it, head/dean/director tools included. The portal token carries the admin account id (`act`), lasts 2 hours, and stops working if that account is deactivated or loses the role. A banner in the portal says whose access is in use and has **Switch back to admin** (ends the portal session; the admin session is untouched). "Switch to HRMS admin" is refused while switched. Each switch and switch-back is in the activity log, and the sign-in is logged as `switch` (0042).
- **Access USP** (on each staff profile) opens the old staff portal's HRMS entry for that staff member, `https://staffportal.ucc.edu.gh/hrmsapp/{staff number}?token=YYYYMMDD` (today's date).
- **Staff services**: overview, my profile (staff update their own phone, personal email, addresses, emergency contact, **Ghana Card**, **NHIS number and expiry**; everything else stays with HR), circulars (inbox + PDF), notifications (legacy `notification` table), leave (apply — annual leave only while it is the only active type — follow, withdraw while pending, print), appraisal, promotion and study leave (status of their files), GRA ETD (legacy `gratax`).
- **Printouts and records for staff**: their own intention-to-study forms (Study leave → View / print) and their disciplinary record (Disciplinary page, read-only, printable). Heads print their team's intentions from the Study leave manager, and print or export (Excel, no extra dependency: `server/api/lib/xlsx.ts`) the Staff manager list with its filters.
- **Promotion forms**: contract renewal is offered to, and accepted from, senior members only. Senior members fill the senior members' form from the old portal (`promo_apply_sm.php`): particulars from their record (department, college/directorate, contacts, present rank and date), the dossier in the old order and wording (academic and non-academic variants; research for academic staff), a signed declaration (signature image, date) required to submit, then documents and papers. Dossier answers are rich text (a small built-in editor; pasted Word formatting kept, cleaned with `sanitize-html` on save). The form autosaves as a draft about 10 seconds after a change (once the rank and type are chosen) and has a formatted preview before saving or submitting.
- **Academic Advisor manager** (heads; legacy `academic_advisers`, `academic_advisers_log`): advisers nominated for the academic year (this year/next, e.g. 2026/2027) and the academic staff of the head's units who could be. Nominating names a programme (the head's department's undergraduate programmes from `osisauth.users`/`osis.prog_db`) and a level; the continuing students are counted from `osis.students_db`. Nominations wait for the VC (`VC-PENDING`, status 1; approved 2, not approved 3) and can be changed or withdrawn until approved.
- **Operational Plan manager** (heads; legacy `objectives` + `output`, `outcome`, `impact`, `activities`, `sp_review`): plans for the review year (last year/this, e.g. 2025/2026). Heads create and review plans for the units they head (objective with budget, targets, risks, responsibility, means of verification; output, outcome, impact; key activity; review status, opportunities, challenges, action taken, remarks); plans of units below them are read-only. The longer answers (summaries, indicators, risks and the review) are rich text (`PLAN_RICH_FIELDS`), cleaned with `cleanHtml` before saving; the list shows them as plain text, and older plain-text plans still display.
- **Promotion decisions** follow the old portal: recommend (→ next level) and not recommend both need the signed endorsement PDF; levels 2–3 can send a file back a level (14) or back a level and to the applicant (13), who may resubmit documents.
- **Procurement manager** (heads; the `procurement` database on the same MySQL server, through the app's connection, so its user needs rights on `procurement.*`): requests for the units the head heads (drafts included) and, read-only, from units below them. A request is items (category from `item_cat`, description, quantity, unit price → total) in `request_breakdown` under a `request` with a random order number; every step goes to `request_log`. Save as a draft (status 0, editable and deletable) or submit: status 1, stage 4, i.e. the Procurement Directorate, as the old portal now sends every request. A head can assign one member of staff per unit to raise requests (*Assigned staff* tab; `unit.apply_procure`, as in the old portal): that staff member gets the Procurement manager for the unit (and only it) and is told in their portal inbox, as is the one replaced; heads keep theirs. The procurement API is `modules/portal-procurement.ts`, gated to heads and assignees.
- **Support services**: counselling, Eduroam & Wi-Fi and Helpdesk & Support are requests in `staff_request` (`category`); HR and IT answer them in **Admin → Service desk**, and the reply lands in the staff member's portal inbox. Counselling requests are visible only to administrators and HR officers.
- **Management services** (heads and named approvers): who a head manages comes from the legacy data — the units where they are `unit_head` / `unit_subhead`, their sub-units (`parent_id`, `faculty_id`, `college_id`), the heads of the units that report to them (a unit reports to its faculty if it has one, else its parent), and `leave_approver` rules. **Leave manager** recommends (→ `HR-PENDING`, `head_endorse`) or declines (→ `HEAD-REJECTED`, reason required). Staff manager lists the team. **Study leave manager** runs the old portal's intention-to-study chain (`tndapproval`): `study_intention.appstatus` 1 head of unit → 2 dean (academic, the faculty) / director (non-academic, the parent unit) → 3 provost (the college) / registrar → 4 HR, which gives the final decision in Admin → Study leave. The head holding the level approves (forwarded, `stage_status` 1) or disapproves (stops there, `stage_status` 2) with a required comment; each decision is a `tndstudy_activities` row (`promo_status` = new appstatus, `activity` 1/2). A level with no unit, or whose only head is the applicant, is skipped. The next head and the applicant are told in their portal inbox (type `STUDY`). Tabs: waiting for me, in progress, decided, all; each application has a review page and the printable form (`lib/study-approval.ts`).
- **Appraisal** (legacy tables kept): staff fill **Form B** (self-appraisal, `staff_self_appraisal`, app_status 1) and the head countersigns it (2). The head completes **Form A** (`staff_appraisal`, one row per question from `appraisal_question`, ratings U/S/X/A/E, overall rating, app_status 1); the staff member comments and signs (2), after which it is locked. The legacy words "Employee Signed"/"Supervisor Signed" are still written; `*_signed_at` and `supervisor_staff_no` record who and when.
- **Promotion & contract renewal** (`staff_promotion`, `promotion_data`, `promo_papers`, `promo_activities`, `promo_apply_log`, exactly as the old portal wrote them): senior members fill the full dossier, list their papers and can save a draft (promo_status 0); senior/junior staff and renewals attach a CV and papers or letter. Submitting sends it to level 1. Each level (1 head of the file's unit, 2 the unit it reports to — faculty or parent, 3 the college or the unit above) can **recommend** (→ next level, stage_status 1), **not recommend** (stage_status 2, HR decides), **return to the applicant** for a new CV / papers / form (stage_status 8/9/11/10) or **send back a level** (stage_status 14). Returned files go back to the level that returned them when the applicant resubmits. From level 4 HR continues in Admin → Appointment & Promotion. Documents are served only to the applicant and the heads who can see the file; old-portal files open on `LEGACY_PORTAL_URL` (default https://staffportal.ucc.edu.gh).

## Circulars

Notices from the Directorate to staff, in the legacy `circular` table.

- **Workflow:** draft → publish → archive. Drafts can be edited, test-sent to one phone/email and deleted. Publishing (needs *manage*) fixes the audience, then sends; it cannot be undone. Archiving takes a circular off the portal notices feed (`circular.status = 0`); copies already in staff inboxes stay. Only drafts and archived circulars can be deleted, and deleting removes the inbox copies too.
- **Audience** (the legacy `cat_*` columns): nothing chosen = all active staff. Staff categories, units (optionally with all their sub-units) and designations narrow it together; "heads of units only" keeps the `unit.unit_head` of the chosen units (or all units). Named staff numbers are always added. The form shows a live count and how many have a phone number and an email address.
- **Channels:** the staff portal (one row per person in the legacy `notification` table, `type = 'CIRCULAR'`, linked from `hrms_circular_recipients`; read receipts come from its `read_flag`), SMS (the SMS note, or the message, framed as "DHR CIRCULAR (Ref …)") and email (branded, the PDF attached). SMS go to the gateway 100 numbers per request; email goes 50 recipients per message as BCC. Every person and channel is logged in `hrms_notifications` (kind `circular`), so **Resend failed** sends only to those not yet reached.
- **The PDF** is shown in the admin, attached to emails, and linked from the portal through a signed URL (`/api/circulars/public/:id/:signature/:name`) that works without an HRMS sign-in. The link is built from `APP_URL`, so set it to the public address in production. Files uploaded through the old HRMS (`/public/circular/…`) are linked on `LEGACY_HRMS_URL`.
- **Gmail limits** how many people one account can email per day (about 500; 2,000 on Google Workspace). Emails over the limit fail and can be resent the next day; the publish dialog warns when an audience is larger.

## Payslips

Payslips come from the payroll system (Directorate of Finance) as a JSON export: one record per staff member per month (`files/bkp/payslip.json` shows the shape).

- **Import:** Admin → Payslips → *Import payroll export*, or `npm run db:import-payslips -- path/to/export.json [--dry-run]`. Both use `importPayslips()` in `packages/db/src/payslips.ts`. A payslip is matched on its payroll id (`YYYYMM` + the 10-digit payroll employee id) and replaced on re-import. Staff are linked by `staffCode` = `staff.staff_no` (the export's `hrId` is the payroll system's own id). Imports report any payslip whose net pay does not add up.
- **Tables (0040):** `hrms_payslips` (particulars, bank, amounts, approval, staff viewing), `hrms_payslip_lines` (allowances, deductions, reliefs; `is_arrears` from the name) and `hrms_payslip_loans` (repayment, balance, loan amount).
- **How the slip adds up:** basic = annual salary ÷ 12; gross = basic + allowances; taxable pay = gross − employee SSNIT (and provident/superannuation); total deductions = PAYE + SSNIT + other deductions + loan repayments; net = gross − total deductions. A loan's opening balance = closing balance + repayment.
- **Staff portal** (`/portal/payslips`): a year at a time, a card per month. Only payslips payroll approved and released (`approved = 1 AND has_access = 1`) are shown, and only the staff member's own. Payslips open freely by default. A staff member may turn on a **4-digit PIN lock** (0041 `hrms_payslip_pins`, bcrypt; a saved PIN means the lock is on, and it stays on until they turn it off with the PIN or HR resets it). While it is on, the right PIN opens payslips in that browser for 15 minutes (cookie `hrms_payslips`, path `/api/portal/payslips`); five wrong PINs block it for 15 minutes. The slip can be masked and printed straight from its modal (portrait A4, on the security paper); views are counted.
- **Admin** (`payslips` permission: administrators manage, HR officers edit; IT support and viewers have none): a pay month's payslips and totals, who has opened theirs, any payslip in full and printable, and PIN resets (which turn the staff member's PIN lock off).
- **XPay password reset:** the *Reset XPay password* button on the Payslips page lets a staff member set a new password for XPay (the payroll's own payslip portal), as the old `xpayreset.php` did. The XPay username is the part of their UCC email before the `@`. The new password is hashed as PHP's `password_hash()` does (bcrypt, `$2y$`) and written to `auth_user` in the XPay database, which lives on a **separate MySQL server** with its own credentials: set `XPAY_DB_HOST`, `XPAY_DB_PORT`, `XPAY_DB_USER`, `XPAY_DB_PASSWORD` and `XPAY_DB_NAME` (see `.env.example`; in production in `shared/.env`). The server must be able to reach that host (it is on the University's internal network). Without the settings, the dialog says the reset is not set up. Resets are rate-limited (5 per 15 minutes) and audited (`xpay_password`); `apps/web/src/server/api/lib/xpay.ts` holds the connection.

## Business rules worth knowing

- **Current placement.** A staff member's job, grade, unit and category come from their current appointment record (`staff.promo_id → promotion`), falling back to the staff row. In the legacy data the staff row is often stale, so reads prefer the promotion and every write updates both.
- **Confirmation** is due `probation` years after the assumption date. **Contracts** expire `renewal_period` / `served` years after their start date. Both alert from 90 days before.
- **Annual leave** for a year starts from the entitlement for the staff category (or a designation-specific one), adds approved deferred days from the previous year, adds active legacy balances, then adds or deducts the year's leave constants (unless the staff member is excluded). Approved days on granted/ended annual leave starting that year are then subtracted.
- **Study intentions** (`appstatus`): 1 awaiting head, 2 dean/director, 3 provost, 4 HR, 5 approved by HR, 6 declined by HR, 7 closed (a legacy code with no recorded meaning). `stage_status` 2 marks a decline at any stage.
- **Promotion applications** (`promo_status`): 0 submitted … 4 Directorate of HR, 5 assessors, 6 A&P board, 7 approved, 8 disapproved. `stage_status` ≥ 10 means returned for correction (10 to the applicant, 14 to the head).
- Legacy columns named like `study_gurantor_1` need explicit mapping because camelCase → snake_case drops the underscore before a digit (`digitKeys()` in `modules/study.ts`).
- Person names computed by the API (`full_name`, `head_name`, …) are shown in proper case (`properName()` in `lib/text-case.ts`, applied in `server/api/lib/db.ts`); stored values are unchanged. Disciplinary reasons typed in capitals are shown in sentence case.
- Legacy dates of `0000-00-00`, and birth dates before 1920 (placeholders such as 1900-01-01), are treated as unknown.
- The legacy tables hold zero dates and mixed charsets, so the app's MySQL sessions run with `STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION` (`packages/db/src/pool.ts`).
- Legacy `ENUM('0','1')` flags are written as strings (`flag()` in `server/api/lib/hr.ts`): MySQL reads a numeric `1` as the enum's first value, `'0'`.

## Migrations added to hr26

`hrms_users`, `hrms_audit_logs`, `staff_dob_log`; `staff.nationality` + structured emergency contact; `promotion.apply_type` gains `UPGRADE` (+ `letter_date`, `remark`, timestamps); `unit`/`job` `merged_into`; `position.title`/`remark`; NSS emergency address/phone/email; lookup indexes on `promotion`, `position`, `transfer`, `leave_dump`, `renewal`, `postretire`, `nss`; relatives' and study contacts' phone columns widened from `INT ZEROFILL` to `VARCHAR(20)`; `disciplinary` "WARNINIG" corrected to "WARNING"; `study_leave` gains `intention_id`, `request_id`, `status`, `remark`; `staff_promotion` gains `hr_step` and `effected_promo_id`; six default study benefits seeded. `circular` gains `stage` (DRAFT/PUBLISHED/ARCHIVED; old rows archived), `send_email`, `send_portal`, `cat_unit_children`, `attachment_name`, `recipient_count`, `published_at/by`, `archived_at` and becomes utf8mb4; new `hrms_circular_recipients`; NSS emails lower-cased. Study tables converted to utf8mb4 (0039). Payslips: `hrms_payslips`, `hrms_payslip_lines`, `hrms_payslip_loans` (0040) and `hrms_payslip_pins` (0041).
# hrmsv26
