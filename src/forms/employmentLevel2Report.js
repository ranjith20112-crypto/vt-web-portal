// routes/forms/employmentLevel2Report.js
// ----------------------------------------------------------------------
// REPORT-ONLY config for the DEEPER "Level 2" employment report. Same
// noFrontend caveat as employmentLevel1Report.js — if your existing
// Employment verifier screen doesn't yet capture some of these extended
// fields (MCA check, data-confidentiality breach, work-ethics issues),
// they'll simply render as "NA" until the verifier UI is extended to
// collect them. Matched by matchKeywords + subType containing "level 2"
// / "2" — see routes/forms/index.js for how subType disambiguates
// Level 1 vs Level 2 when both share the "employment" keyword.
// ----------------------------------------------------------------------
module.exports = {
  key: 'employment-level2',
  title: 'Employment Verification Report (Level 2)',
  matchKeywords: ['employment level 2', 'employment level2', 'level 2 employment'],
  noFrontend: true,
  sections: [
    {
      heading: 'Employer Details',
      fields: [
        { key: 'employerNameAddress', label: 'Name and Address of the Employer', type: 'textarea' },
        { key: 'designation', label: 'Designation', type: 'text' },
        { key: 'department', label: 'Department', type: 'text' },
        { key: 'employeeId', label: 'Emp. ID', type: 'text' },
        { key: 'periodFrom', label: 'Period of Employment — From', type: 'date' },
        { key: 'periodTo', label: 'Period of Employment — To', type: 'date' },
        { key: 'finalSalaryDrawn', label: 'Final Salary Drawn', type: 'text' },
        { key: 'reportingOfficer', label: 'Reporting Officer', type: 'text' },
        { key: 'remunerations', label: 'Remunerations (Fixed + Variable Cost)', type: 'text' },
        { key: 'typeOfEmployment', label: 'Type of Employment', type: 'select', options: ['Permanent', 'Contract'] },
      ],
    },
    {
      heading: 'Exit & Conduct',
      fields: [
        { key: 'eligibleForRehire', label: 'Eligible for Re-Hiring', type: 'select', options: ['Yes', 'No'] },
        { key: 'rehireReasonIfNo', label: 'If No, Please Specify the Reason', type: 'textarea' },
        { key: 'reasonForLeaving', label: 'Reason for Relieving', type: 'text' },
        { key: 'exitFormalitiesCompleted', label: 'Exit Formalities Completed?', type: 'select', options: ['Yes', 'No'] },
        { key: 'dataBreachDuringTenure', label: 'Information Security / Data Confidentiality Breach During Employment?', type: 'yesno' },
        { key: 'pendingStatus', label: 'If Pending, Please Specify Status', type: 'textarea' },
        { key: 'employerMcaStatus', label: 'Employer Status Through MCA Check', type: 'text' },
        { key: 'workEthicsIssues', label: 'Issues Reported (Work Ethics / Credibility / Reputation)?', type: 'yesno' },
        { key: 'additionalRemarks', label: 'Additional Remarks by HR / Reporting Officer', type: 'textarea' },
      ],
    },
    {
      heading: 'Verifier Details',
      fields: [
        { key: 'verifiedByNameDesignation', label: 'Verified By: Name / Designation', type: 'text' },
        { key: 'verifiedByContact', label: 'Verified By Contact Details', type: 'text' },
        { key: 'documentGenuine', label: 'Employment Documents Found To Be', type: 'select', options: ['GENUINE', 'NOT GENUINE'] },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
