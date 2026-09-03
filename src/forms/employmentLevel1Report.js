// routes/forms/employmentLevel1Report.js
// ----------------------------------------------------------------------
// REPORT-ONLY config: Employment Verification already has a bespoke
// data-entry screen (per verification-split.jsx's typeToSlug ->
// 'employment'). noFrontend: true — this file only drives the PDF.
//
// IMPORTANT: the field `key`s below are inferred from the reference
// Employment_Form_-_Level_1.docx labels. If your existing Employment
// verifier screen saves check.verifier under different key names, update
// the `key` values here to match exactly — the PDF pulls
// check.verifier[field.key] directly, so the keys must line up with
// whatever that screen actually persists.
// ----------------------------------------------------------------------
module.exports = {
  key: 'employment-level1',
  title: 'Employment Verification Report',
  matchKeywords: ['employment'],
  noFrontend: true,
  sections: [
    {
      heading: 'Employer Details',
      fields: [
        { key: 'employerNameAddress', label: 'Employer Name & Address', type: 'textarea' },
        { key: 'designation', label: 'Last Designation / Position', type: 'text' },
        { key: 'reasonForLeaving', label: 'Reason for Relieving', type: 'text' },
        { key: 'periodFrom', label: 'Dates of Employment — From', type: 'date' },
        { key: 'periodTo', label: 'Dates of Employment — To', type: 'date' },
        { key: 'additionalRemarks', label: 'Additional Remarks by HR / Reporting Officer', type: 'textarea' },
        { key: 'eligibleForRehire', label: 'Eligible for Re-Hiring', type: 'select', options: ['Yes', 'No'] },
        { key: 'exitFormalitiesCompleted', label: 'Exit Formalities Completed', type: 'select', options: ['Yes', 'No'] },
      ],
    },
    {
      heading: 'Verifier Details',
      fields: [
        { key: 'verifierName', label: 'Verifier Name', type: 'text' },
        { key: 'verifierDesignation', label: 'Verifier Designation', type: 'text' },
        { key: 'departmentName', label: 'Department Name', type: 'text' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
