# Wiring the QC + Report module into Verifitech

## 0. Install pdf-lib + set up the logo and email credentials

```bash
npm install pdf-lib nodemailer docx
```

Place the company logo at `backend/images/verifitech-logoo.png` (referenced
exactly as given). If it's missing at runtime, the PDF still generates —
it just falls back to a text "Verifitech" wordmark instead of failing.

`config/reportEmailTemplate.js` sends via nodemailer's Gmail service,
using the SAME env vars already in your `.env`:

```
EMAIL_USER=aws500546@gmail.com
EMAIL_PASS=xxxxxxxxxxxxxxxx
EMAIL_FROM="Verifitech Reports <aws500546@gmail.com>"   # optional, defaults to EMAIL_USER
```

**`EMAIL_PASS` must be a 16-character Gmail App Password, not your normal
Gmail login password** — Gmail rejects the account password for SMTP
login once 2-Step Verification is on (and Google has fully removed "less
secure app access" as an alternative). To generate one:
1. Turn on 2-Step Verification on the Google account: https://myaccount.google.com/security
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password (any name, e.g. "Verifitech Reports") and copy
   the 16-character code Google shows you
4. Paste it into `EMAIL_PASS` in `.env` with no spaces

**Dev-mode fallback:** if `EMAIL_USER`/`EMAIL_PASS` are missing, or
`EMAIL_PASS` is under 16 characters (e.g. a placeholder like `t`),
Finalize & Send / Resend no longer fail with an auth or connection error —
`reportEmailTemplate.js` detects this and uses nodemailer's `jsonTransport`
instead, which simulates the send (logs the email to the server console)
rather than dialing out. The check is still marked finalized/sent so the
workflow isn't blocked locally, but `reportDeliveryError` and the API
response's `simulated: true` flag record that no real email went out —
the Report screen surfaces this as an amber notice banner instead of a
green one. Once a real 16-character `EMAIL_PASS` is set, this fallback is
skipped automatically and emails send for real through Gmail.

## 1. Register the new routers (server.js / app.js)

Wherever the existing routers are mounted, e.g.:

```js
const workorderRoutes = require('./routes/workorderRoutes');
const dataManagementRoutes = require('./routes/dataManagementRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const qcRoutes = require('./routes/qcRoutes');                     // <-- add this
const reportPdfRoutes = require('./routes/reportPdfRoutes');       // <-- add this
const reportDeliveryRoutes = require('./routes/reportDeliveryRoutes'); // <-- add this
const addressFormRoutes = require('./routes/addressFormRoutes');   // <-- add this
const formsRoutes = require('./routes/forms');                     // <-- add this (the forms registry)

app.use(workorderRoutes);
app.use(dataManagementRoutes);
app.use(verificationRoutes);
app.use(qcRoutes);                                                 // <-- add this
app.use(reportPdfRoutes);                                          // <-- add this
app.use(reportDeliveryRoutes);                                     // <-- add this
app.use(addressFormRoutes);                                        // <-- add this
app.use(formsRoutes);                                              // <-- add this
```

All five new route files define their own full paths (`/api/qc/...`,
`/api/report/...`, `/api/report-delivery/...`, `/api/address-form/...`,
`/api/forms/...`), same pattern as the other route files, so no extra
prefix/mounting path is needed — just `app.use(...)`.

**Important — mount order:** `reportPdfRoutes.js` does
`require('./forms')` internally (for `resolveFormConfig`), so
`routes/forms/index.js` must exist in `routes/forms/` before the server
starts, but the `app.use()` calls above can be in any order — the
`require()` at the top of `reportPdfRoutes.js` resolves the module
directly, independent of Express mount order.
`reportDeliveryRoutes.js` requires `buildReportPdf` from
`reportPdfRoutes.js`, so make sure both files sit in the same `routes/`
folder (no other wiring needed — it's a plain `require('./reportPdfRoutes')`).

## 2. Frontend routes (App.jsx / your router config)

```jsx
import VerificationQueueScreen from './employee-screens/verification-split'; // updated file
import QCAssignmentTeam from './employee-screens/QCAssignmentTeam';
import QCMemberScreen from './employee-screens/QCMemberScreen';
import ReportScreen from './employee-screens/ReportScreen';
import ReportDeliveryScreen from './employee-screens/ReportDeliveryScreen';
import GenericCheckVerifier from './employee-screens/GenericCheckVerifier';

// ...inside <Routes>
<Route path="/verifications/:checkTypeId/:stage" element={<VerificationQueueScreen />} />
<Route path="/verifications-overall" element={<VerificationQueueScreen />} />
<Route path="/qc-assignment" element={<QCAssignmentTeam />} />
<Route path="/qc-member" element={<QCMemberScreen />} />
<Route path="/report" element={<ReportScreen />} />
<Route path="/report-delivery" element={<ReportDeliveryScreen />} />
<Route path="/verifier-forms/generic/:formKey/:workorderId" element={<GenericCheckVerifier />} />
```

Link to `/qc-assignment`, `/qc-member`, `/report`, and `/report-delivery`
from wherever your sidebar/nav lives, same as the existing verification
links. The `/verifier-forms/generic/:formKey/:workorderId` route doesn't
need its own nav link — it's only ever reached via the "Verify Now" /
"View / Edit" / "Form" buttons in `verification-split.jsx`, which resolve
the right `formKey` automatically from the check's `checkType`.

## 3. Preserve QC fields on generic workorder saves (small patch)

`routes/workorderRoutes.js`'s `normalizeCheck()` is called every time a
whole workorder is re-saved from the employee edit screens (`PUT
/api/workorders/:id`). It currently only keeps the fields it explicitly
lists, so a QC field written by `qcRoutes.js` (e.g. `qcStatus`,
`qcAssignedToId`) would be silently dropped if someone edits and saves
the workorder from `EmployeeWorkorderCreation.jsx` after it's already in
the QC pipeline.

Add this block inside `normalizeCheck()` in `routes/workorderRoutes.js`,
next to the existing "Stop Check fields" block:

```js
  // ---- QC fields (preserved across saves) ----
  qcStatus: c.qcStatus || null,
  movedToQCAt: c.movedToQCAt || null,
  movedToQCBy: c.movedToQCBy || null,
  qcAssignedTo: c.qcAssignedTo || '',
  qcAssignedToId: c.qcAssignedToId || null,
  qcAssignedToEmail: c.qcAssignedToEmail || '',
  qcAssignmentType: c.qcAssignmentType || null,
  qcAssignedAt: c.qcAssignedAt || null,
  qcResult: c.qcResult || null,
  qcNotes: c.qcNotes || '',
  qcRejectionReason: c.qcRejectionReason || '',
  qcCompletedAt: c.qcCompletedAt || null,
  qcVerifiedBy: c.qcVerifiedBy || null,
  // ---- Report Delivery fields (preserved across saves) ----
  reportFinalized: c.reportFinalized || false,
  reportFinalizedAt: c.reportFinalizedAt || null,
  reportSentTo: c.reportSentTo || '',
  reportSentAt: c.reportSentAt || null,
  reportDeliveryStatus: c.reportDeliveryStatus || null,
  reportDeliveryError: c.reportDeliveryError || '',
  reportSentBy: c.reportSentBy || null,
```

`dataManagementRoutes.js` and `qcRoutes.js` both write directly with their
own `$set` on the `checks` array (they never call `normalizeCheck`), so
this patch only matters for the generic full-workorder save path.

## 4. New endpoints summary

### routes/qcRoutes.js

| Method | Path                                              | Used by                       |
|--------|----------------------------------------------------|--------------------------------|
| GET    | `/api/qc/completed/list`                            | Completed Verifications tab   |
| PUT    | `/api/qc/:workorderId/checks/:slNo/move-to-qc`       | "Move to QC" button            |
| GET    | `/api/qc/rejected/list`                              | QC Request tab                 |
| GET    | `/api/qc/assignment/list?status=pending\|assigned`   | QC Assignment Team — **both** Pending Assignment and Assigned tabs |
| GET    | `/api/qc/assignment/assignees`                        | QC Assignment "Assign" modal  |
| POST   | `/api/qc/assignment/assign`                            | QC Assignment "Assign" modal  |
| GET    | `/api/qc/member/list?assignedToId=&checkTypeId=&from=&to=&search=` | QC Member Queue — Assigned tab (assignedToId optional, defaults to all QC members) |
| GET    | `/api/qc/member/completed/list?...same filters`         | QC Member Queue — Completed tab |
| GET    | `/api/qc/:workorderId/checks/:slNo/detail`               | Verify QC split-screen modal (also reused read-only for Completed tab / Report viewer) |
| PUT    | `/api/qc/:workorderId/checks/:slNo/verify`                | Approve / Reject in QC modal  |
| GET    | `/api/report/list?search=&client=&checkTypeId=&from=&to=&finalized=` | Report screen — **both** All and Finalized tabs |
| GET    | `/api/report/:workorderId/checks/:slNo`                      | Report screen viewer (reuses the QC detail handler) |

### routes/reportPdfRoutes.js

| Method | Path                                                    | Used by                          |
|--------|-----------------------------------------------------------|-----------------------------------|
| GET    | `/api/report/:workorderId/checks/:slNo/pdf`                | Report / Report Delivery "PDF" buttons — streams a generated PDF matching the Verifitech report template, with the real logo image and green-filled checkboxes |

Also exports `buildReportPdf(db, workorderId, slNo)` for reuse by the
finalize/email flow below.

### routes/reportDeliveryRoutes.js

| Method | Path                                                              | Used by                              |
|--------|----------------------------------------------------------------------|-----------------------------------------|
| POST   | `/api/report/:workorderId/checks/:slNo/finalize`                     | Report screen "Finalize & Send" modal — generates the PDF, emails it to the client, stamps the check as delivered |
| GET    | `/api/report-delivery/list?search=&client=&checkTypeId=&from=&to=&status=` | Report Delivery screen               |
| POST   | `/api/report-delivery/:workorderId/checks/:slNo/resend`               | Report Delivery "Resend" button        |

### routes/addressFormRoutes.js

| Method | Path                                                       | Used by                                        |
|--------|----------------------------------------------------------------|--------------------------------------------------|
| GET    | `/api/address-form/:workorderId/checks/:slNo/docx`               | "Form" button in verification-split.jsx (address/criminal/identity checks) — generates a prefilled, blank Residential Address Verification Form (.docx) for a field executive to carry into a visit |

Prefills Case Reference No., Candidate Name, Address, Period of Stay,
Father Name, and Candidate Contact No. from live workorder/candidate
data. Every Verifier Feedback, Verifier, and Field Executive field, plus
all four Field Visit Photography boxes, are left blank — this is the
working form filled in *during* the visit, not the finished report
(that's `reportPdfRoutes.js`). Uses the `docx` npm package.

## 5. Status flow reference (updated — QC rejection loop)

```
assignment-pending -> verification-pending -> report (verifier done)
   -> [Move to QC]          status: 'qc',           qcStatus: 'pending'
   -> [QC Assignment Team]  (unchanged status)       qcStatus: 'assigned'
   -> [QC Member: Approve]  status: 'report',        qcStatus: 'completed'  -> Report screen
                                                                              -> PDF available
                                                                              -> [Finalize & Send]
                                                                                 reportFinalized: true,
                                                                                 reportDeliveryStatus: 'sent'
                                                                                 -> Report Delivery screen
   -> [QC Member: Reject]   status: 'qc-rejected',   qcStatus: null         -> QC Request tab
        -> [Verifier: Verify again, same verifier form + same
            POST /api/verifications/complete used everywhere else]
        -> status flips to 'completed' / 'discrepancy' / 'insufficient'
           via that endpoint's existing statusMap (no qcRoutes.js change
           needed there) -> reappears in Completed Verifications -> the
           whole cycle repeats
```

The **QC Request** tab lives inside `verification-split.jsx`, scoped per
check type exactly like Assignment Pending / Verification Pending. Its
row action is the same `navigateToVerificationForm()` used by "Verify
Now" / "View / Edit" elsewhere in that file — no new verifier screen was
needed, it just reopens the existing one.

## 6. The Forms Registry — 19 check types via one scalable architecture

Rather than 19 near-duplicate bespoke frontend pages and 19 bespoke PDF
drawers (thousands of lines, painful to maintain), every new check type
is defined as ONE small **config file** in `routes/forms/`, and two shared
engines — `GenericCheckVerifier.jsx` (frontend) and
`drawConfiguredReportPage()` (in `reportPdfRoutes.js`) — render *any*
config without needing form-specific code.

### 6.1 What's genuinely separate vs. shared

- **Separate, one file per form** (as requested): every form's field
  list, section headings, labels, types, and legend colors live in their
  own file under `routes/forms/`. This is what you edit to add a field,
  rename a label, or add a new form.
- **Shared, one copy for everything**: the actual Express routing
  (`routes/forms/index.js`), the frontend rendering
  (`GenericCheckVerifier.jsx`), and the PDF rendering
  (`drawConfiguredReportPage` in `reportPdfRoutes.js`). Having 19 separate
  `express.Router()` instances all mounted at the same `/api/forms`
  prefix would conflict with each other — so routing is centralized,
  while the *content* stays fully separated per form.

### 6.2 Files in `routes/forms/`

| File | Form | Has its own frontend? |
|---|---|---|
| `aml.js` | AML, Media & Sanction List Check | Yes — `GenericCheckVerifier` |
| `bankruptcy.js` | Bankruptcy and Insolvency Financial Check | Yes |
| `bankStatement.js` | Bank Statement Verification | Yes |
| `carQuotation.js` | Car Quotation Verification (split Provided/Verified) | Yes |
| `civilLitigation.js` | Employee Litigation Background Verification | Yes |
| `companyCriminal.js` | Company Criminal Background Record Check | Yes |
| `courtCheck.js` | Court / Criminal Record Search | Yes |
| `drivingLicense.js` | Driving License Verification (split) | Yes |
| `drugPanel5.js` | Drug Abuse Screening (5-Panel) | Yes |
| `drugPanel10.js` | Drug Abuse Screening (10-Panel) | Yes |
| `form16.js` | Form 16 Verification | Yes |
| `form26as.js` | Form 26AS / Dual Employment Record Search | Yes |
| `globalSanctions.js` | Government/Criminal Sanctions (Global Database) | Yes |
| `indianSanctions.js` | Government/Criminal Sanctions (Indian Database) | Yes |
| `idbiProperty.js` | IDBI Property Verification (Annexure) | Yes |
| `criminalReport.js` | Criminal Records Verification | **No** — reuses the existing `CriminalVerificationVerifier.jsx` screen; this config only drives the PDF. Field keys must match what that screen saves. |
| `employmentLevel1Report.js` | Employment Verification | **No** — reuses the existing Employment verifier screen. **Check the field `key`s match your actual screen's saved `check.verifier` shape** — they're inferred from the reference .docx and may need adjusting. |
| `employmentLevel2Report.js` | Employment Verification (Level 2, extended) | **No** — same caveat, plus several fields (MCA check, data-breach flag, work-ethics flag) may not be captured by your current Employment screen yet. |
| `educationReport.js` | Education Verification | **No** — reuses the existing Education verifier screen; field keys match `transformEducation()` in `verificationDataRoutes.js`. |

Address (`Address_Form.docx`) is handled separately — it has its own
bespoke layout (`drawAddressReportPage` + `addressFormRoutes.js`) since
it's visually much more complex (checkbox-style grids, Field Visit
Photography page) than a generic label/value table.

### 6.3 New endpoints

| Method | Path | Used by |
|---|---|---|
| GET | `/api/forms/registry` | Any screen listing available form types |
| GET | `/api/forms/:formKey` | `GenericCheckVerifier.jsx` — fetches the field config to render |

### 6.4 How PDF generation picks the right template

`buildReportPdf()` in `reportPdfRoutes.js` now resolves the layout in
this order:
1. **Address/Identity** → the bespoke `drawAddressReportPage` (unchanged).
2. **Everything else** → `resolveFormConfig(checkType, subType)` from the
   registry; if a config matches → `drawConfiguredReportPage()` renders
   it generically (section headers, label:value rows, split
   Criteria/Provided/Verified tables where configured, the form's own
   legend, and a FINAL STATUS banner).
3. **No match found** → falls back to the old flat key/value dump
   (`drawGenericReportPage`), so a report is *always* generated even for
   a check type nobody's written a config for yet.

`reportDeliveryRoutes.js` needs **zero changes** for any of this — it
already calls `buildReportPdf(db, workorderId, slNo)` generically for
Finalize & Send / Resend, so every one of these 19 forms (and any you add
later) is emailable to clients automatically.

### 6.5 How to add form #21+

1. Create `routes/forms/yourFormName.js`:
   ```js
   module.exports = {
     key: 'your-form-key',
     title: 'Your Form Title',
     matchKeywords: ['keyword that appears in checkType or subType'],
     sections: [
       {
         heading: 'Section Heading',
         fields: [
           { key: 'someField', label: 'Some Field', type: 'text' },
           { key: 'someNotes', label: 'Notes', type: 'textarea' },
           { key: 'someDate', label: 'Date', type: 'date' },
           { key: 'someChoice', label: 'Choice', type: 'select', options: ['A', 'B'] },
           { key: 'someFlag', label: 'Adverse Found?', type: 'yesno' },
         ],
       },
       // Optional: layout: 'split' for a Criteria/Provided/Verified section
     ],
     legend: [
       ['Clear Report', 'GREEN'],
       ['Information Unable to Validate', 'YELLOW'],
       ['Adverse Remark / Report', 'RED'],
       // add ['Partially Verified / Minor Discrepancies', 'ORANGE'] if needed
     ],
   };
   ```
2. Register it in `routes/forms/index.js` — add one line to the
   `ALL_CONFIGS` array: `require('./yourFormName'),`
3. Add one entry to `GENERIC_FORM_KEYWORDS` in `verification-split.jsx`
   so "Verify Now" / "Form" buttons route to it:
   `['your-form-key', 'keyword...'],`

That's it. No changes needed to `GenericCheckVerifier.jsx`,
`reportPdfRoutes.js`, or `reportDeliveryRoutes.js` — the form
automatically gets a data-entry screen, PDF generation, email delivery,
and Report Delivery listing for free.

If the new form type needs its own bespoke frontend (rather than the
generic one) because its layout doesn't fit label/value + optional split
sections — add `noFrontend: true` to its config (like `criminalReport.js`)
and build the dedicated screen separately, same as the existing
Address/Employment/Education/Criminal screens. The PDF side works
identically either way.
