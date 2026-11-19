# DESCRIPTION OF SYSTEM
- Build a Human Resource management system for the Directorate of Human resource of University of Cape Coast. The system has only admin page for admin users such as HR officers or users and IT Technical support team. It utilizes normal password strategy and google authentication strategy for signing in.

- /Users/dexitional/Documents/projects/FullStack/coreos/frontend/ehub/src/pages/hrmsv26

- Analyze the database file for details since we are upgrading the system using the existing database file so we maintain and re-use existing tables whiles adding unto it with new ones or fields. 
[text](hr-nov-16-2026.sql).

The Admin platform has a models for the following:
- Admin System has two main section:

-- "Utilities" which has the following:

--- Grades & Notches: Manages the list of the various grades, scale, notches, levels tied to staff.

--- Units & Offices: Manages the list of offices, departments,sections and their assigned parent unit, head of section and sub-head of section of that units. Has ability to merge two units by providing the master unit id in a prompt aswell, The is also a printable list of units with details like heads, and parent unit name. Also a button to generate list of unit members; thus staff linked to that unit

--- Designations: Manages list of designations (jobs) with details like their type, years to next rank, count of staff assigned to that job or designation. Allow admins to merger designation (job) into another one ( master job).

--- Positions: Manages positions of staff from start period to end period and the assigned unit of jurisdiction. The title of the position. allow admin to generate printable list of position history for a staff. with propers alerts to admin on end of position cycle; period before expiration.

--- Date of Birth (DOB): Manages the change of date of birth of staff for every but log every change for audit. Allow alerts and notification on staff approaching retirement which is age 60. so alert admins and show those age around 59 in amber color and those 60 and above in red and those below 59 in green.

-- "Modules" which has the following:

--- Staff: Manages the list of staff in tabs; active tab,inactive tab,contract staff. Staff lists show institutional emails, unit, designation or job, phone, full name, age, and profile photo fetched from https://cdn.ucc.edu.gh/photos/?tag=[staff number].
Staff form should contain this details: Personal information [title,first name, middle names, last name, Gender, Hometown, District, Region, nationality ( dropdown of countries),phone, e-mail address, permanent address,current residential address (please state house no, area and landmark), emergency contact ( state full name, relation, phone number, contact address), marital status], Personal Documents [ marriage certificates - pdf upload, Birth certificates - pdf upload, Medical reports - pdf upload ], University information [ SSNIT number, Ghana card number, university email, Staff number, Staff current Status [TEMPORAL|PERMANENT|CASUAL|PART-TIME
CONTRACT|RETIRED|DEAD]], Appointment Information [Appointment Date, Assumption Date, Probation Period (Years)],Curriculum vitae (CV) - pdf upload, Job Title/Designation, Section/Unit, Grade/Scale, Staff Category[SM - Senior Member|JS - Junior Staff |SS - Senior Staff]. Allow new staff to have staff numbers automatically generated but existing staff manually enterred. A staff has sub records in tabs such as Overview tab (thus the default staff view page), Relatives tab, Bank Info tab, Qualification tab
---- Relatives tab shows list of relatives with information such as relation, full name,date of birth, gender, Code, contact, is alive?, is next of kin?. The relatives form contain (relation, first name, middle name, last name, date of birth, gender, phone, address, hometown, next of kin ( Yes/No), is alive (yes/no), photo - image upload, birth certificate - pdf upload, active (yes/no)) 

---- Bank Information tab show list of bank accounts with information such as bank name, account number, bank branch, date added, is default salary account?, action ( make default, edit, delete)

---- Qualification tab shows list of qualification with information such as qualification type, program of study, specialization, date awarded, program start date, program end date, verification status ( verified| not verified ), document ( onclick, pdf popup view of document), action ( edit , delete). The qualification form contains institution, programme, area of specialization, qualification, certificate verified?, certificate document - pdf upload, program start date, program end date, date of certificate

--- Leave: Manages the leave information in tabs; Leave records tab ( with filter on status (HR Pended | Head Pended | Active | Ended ),Year filter for applied date), Types tab ( Major type of leave and their statuses); Add Remove reliever button to set the reliever status of a staff to 0 or null, Add view statistics for a staff by entering staff number in a popup and showing a printable statistics page of the staff leave records , Holidays tab (Show list of holidays, descriptions, year and status), leave constants tab (allows addition or deduction of leave days to a staff category and also an option to exclude some members from that category for that action), Leave entitlements tab ( controls the actual main entitlement for each staff category for the various leave types with the leave weight or leave days), Leave Balances tab ( manages balance from existing manual or legacy leave data. This grants staff extra leave days for the leave calculation), Leave deferment tab ( manages deferred leave from the previous year for which when approved is allowed in the staff leave calculations). 
Note: Leave calculation starts with getting the entitlement from the staff category and adding deferred days then adding any existing leave balance then adding or deducting any leave constant

--- Elevation: Manages Staff progression information in tabs; 
---- Appointment & promotion records tab (shows the assumption date, confirmation date, designation, grade/notch, staff category, type ( an appointment or promotion or upgrade )) for every staff; so there is button that gives a printable statistics page of all the appointment and promotion data of a particular staff.Allow admin to edit each appointment/promotion/upgrade record.
These are the forms for the various elevation types:
----- appointment form ( staff number, assumption date, confirmation date, probation period (Years), Job Title/Designation, Section/Unit, Grade/Scale, Staff Category)
----- promotion form (staff number, effective date, letter date,  Job Title/Designation,Grade/Scale, Staff Category)
----- upgrade form (staff number, effective date, letter date,  Job Title/Designation,Grade/Scale, Staff Category)

---- Confirmations tab shows only list of active or current appointments or promotions or upgrade of a staff with the full name, current designation, assumption date, years of probation, staff category, remarks with information on ( Number of days to confirmation - calculated by adding the probation years to the assumption date| Confirmation due)

---- Senior membership Renewals tab shows only list of active or current renewals of a staff with the full name, renewal start date, current designation, renewal period of years, remarks with information on ( Number of days to contract expiry - calculated by adding the renewal years to renewal start date | Contract expired). Allow admin to edit form aswell.
Add button to view list of newly expired contracts for the year sorted from latest and make it printable. This is the renewal form ( Staff number, Renewed Years, Start date, End date)

---- Post-Retirement Contract tab shows only list of active or current post-retirement contracts of a staff with the full name, contract start date, current designation, service years, remarks with information on ( Number of days to contract expiry - calculated by adding the renewal years to renewal start date | Contract expired). Allow admin to edit form aswell
Add button to view list of newly expired contracts for the year sorted from latest and make it printable. This is the post-retirement form ( Staff number, Contract Service Years, Start date, End date)

--- Transfer: Manages staff transfers in tabs; 
---- Effective transfers tab shows list of effected transfer records like staff number, full name, transfer date, transfer from (unit), transfer to (unit), designation, action ( a button to list printable sheet of transfers of that staff, edit and delete button ). The effective transfer form contains (staff number, effective transfer date, unit transferred from, unit transferred to, reason for transfer,transfer remarks/note, approved on ( letter date), approved by (staff number)). Not that admin can create a new transfer request ( this one quickly effects a change of the staff current unit when saved) or an existing transfer request.

---- Transfer requests tab shows list of transfer request with information like staff number, full name, reason, profile, aspired unit, status, action ( allows admins to approve or reject)


--- NSS: manages reords of national service personnel with information like nss number, full name, gender, phone, email, assigned unit, entry year, exit year, action (view profile, edit and delete). The NSS form contains (NSS Number or Pin, First name, Middle name(s), Last name, phone number, email address, gender, Date of birth, hometown, Assigned unit, Ghana card, Photo upload, NSS form upload, permanent address of personnel, emergency contact (address, phone email ), service start date, service end date)

--- Staff Disciplinary: Manages disciplinary records with information such as staff number, full name, unit, designation, action taken,  date issued, reason, action ( view printable statistics, edit and delete). The disciplinary form contains staff number, Issued date, reason, action type (WARNING|SUSPENSION|INTERDICTION|DISMISSAL|TERMINATION)

--- Study Leave: manages study leave request. study database structure and implement features and any tabs or forms if must

--- Appointment & Promotion: manages Appointments process, promotion process as it moves through the various approval stages. Implement printable versions of the forms when needed in various pages, or tabs. study database structure and implement features and any tabs or forms if must.

--- Circulars: manages the disemmination of information to the university community via sms, email and staff portal notification dashboards. This information sometimes have pdf documents attached which should be rendered well in pdf viewers and sent via email as attachments aswell.

# TECHNOLOGY STACK
- Tanstack start, Mono repo
- Database should use mysql with same credential as @capevars but switch database to an already existing one called hr26.
 
# DESIGN SYSTEM
- Use advance modern styles with beautifully customized charts.
- Use this as primary color #172554, and #fee2e2 as secondary. Use tailwindcss and ShadCn for components and styling.
- You can take forms,buttons and components inspiration from https://uiverse.io/elements
- Use modern layout structure with minimalistic styling for the admin layouts. Take inspiration from this file: [text](files/layout.html)
- Use exactly the login page of @dricms signin page.

