// routes/forms/aml.js
// ============================================================================
//  FORM CONFIG — AML, Media & Sanction List Check
//  ----------------------------------------------------------------------
//  Matched against a check's checkType/subType (case-insensitive substring
//  match on matchKeywords). Drives BOTH:
//    1. GenericCheckVerifier.jsx (frontend data-entry screen) — via
//       GET /api/forms/aml
//    2. The PDF report generator (routes/reportPdfRoutes.js) — via
//       resolveFormConfig(checkType, subType) from routes/forms/index.js
//
//  See routes/forms/index.js for the registry + shared field-type
//  contract, and WIRING_NOTES.md for how to add form #21+.
// ============================================================================

module.exports = {
  key: 'aml',
  title: 'AML, Media & Sanction List Check',
  matchKeywords: ['aml', 'sanction list', 'media & sanction', 'media and sanction'],
  sections: [
    {
      heading: 'Particulars of Candidate',
      fields: [
        { key: 'residenceAddress', label: 'Residence Address', type: 'textarea' },
        { key: 'dob', label: 'Date of Birth', type: 'date' },
        { key: 'passportNo', label: 'Passport No.', type: 'text' },
      ],
    },
    {
      heading: 'Particulars of Verification',
      fields: [
        { key: 'verifiedAt', label: 'Verified / Enquired At', type: 'select', options: ['AML Portal Search', 'Media Search', 'OFAC Record Search'] },
        { key: 'recordsAccessed', label: 'Type of Records Accessed', type: 'text' },
        { key: 'findings', label: 'Findings (Name Catch / Identifications / Aliases / Address)', type: 'textarea' },
        { key: 'methodOfSearch', label: 'Method of Search & Source of Contact', type: 'text' },
        { key: 'remarks', label: 'Remarks (if any)', type: 'textarea' },
        { key: 'adverseFound', label: 'Adverse AML / Media / Sanction Remarks Found?', type: 'yesno' },
        { key: 'adverseDetails', label: 'If Yes — Remarks', type: 'textarea' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to be Validated', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
