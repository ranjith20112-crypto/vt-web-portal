// routes/forms/criminalReport.js
// ----------------------------------------------------------------------
// REPORT-ONLY config: Criminal Verification already has a bespoke
// data-entry screen (CriminalVerificationVerifier.jsx) — this config is
// used ONLY to render the PDF report, so its field keys deliberately
// match exactly what that screen already saves onto check.verifier
// (address, country, state, city, pinCode, searchType, courtName,
// policeStation, caseStatus, firNumber, caseNumber, sectionsOfLaw,
// natureOfOffense, verifyingAuthorityName, adverseRemarks,
// verifierComments, colorCode). `noFrontend: true` tells
// GenericCheckVerifier / the forms registry not to offer this as a
// "new form" — the existing screen keeps being used for data entry.
// ----------------------------------------------------------------------
module.exports = {
  key: 'criminal',
  title: 'Criminal Records Verification',
  matchKeywords: ['criminal'],
  noFrontend: true,
  colorField: 'colorCode',
  colorValueMap: { Green: 'GREEN', Amber: 'ORANGE', Red: 'RED' },
  sections: [
    {
      heading: 'Particulars of the Candidate',
      fields: [
        { key: 'address', label: 'Residence Present Address', type: 'textarea' },
        { key: 'state', label: 'State', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'pinCode', label: 'Pin', type: 'text' },
      ],
    },
    {
      heading: 'Verification Findings',
      fields: [
        { key: 'searchType', label: 'Search Type', type: 'text' },
        { key: 'courtName', label: 'Court Name', type: 'text' },
        { key: 'policeStation', label: 'Police Station', type: 'text' },
        { key: 'caseStatus', label: 'Case Status', type: 'text' },
        { key: 'firNumber', label: 'FIR Number', type: 'text' },
        { key: 'caseNumber', label: 'Case Number', type: 'text' },
        { key: 'sectionsOfLaw', label: 'Sections of Law Involved', type: 'text' },
        { key: 'natureOfOffense', label: 'Nature of Offense', type: 'textarea' },
        { key: 'verifyingAuthorityName', label: 'Verifying Authority Name', type: 'text' },
        { key: 'adverseRemarks', label: 'Adverse Remarks (if any)', type: 'textarea' },
        { key: 'verifierComments', label: "Verifier's Comments", type: 'textarea' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
