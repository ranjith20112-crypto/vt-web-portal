// routes/forms/educationReport.js
// ----------------------------------------------------------------------
// REPORT-ONLY config: Education Verification already has a bespoke
// data-entry screen (per verification-split.jsx's typeToSlug ->
// 'education', and the `transformEducation()` provided-data mapping in
// routes/verificationDataRoutes.js: degree, department, collegeName,
// collegeAddress, affiliatedUniversity, serialNo, periodFrom, periodTo).
// This config's field keys mirror that same shape for the VERIFIED side.
// noFrontend: true — no new data-entry UI needed.
// ----------------------------------------------------------------------
module.exports = {
  key: 'education',
  title: 'Education Verification Report',
  matchKeywords: ['education'],
  noFrontend: true,
  sections: [
    {
      heading: 'Details as per Application Form',
      fields: [
        { key: 'collegeName', label: 'School / College / Institution / University Name', type: 'text' },
        { key: 'degree', label: 'Complete Name of Qualification / Degree Attained', type: 'text' },
        { key: 'qualificationType', label: 'Qualification Type', type: 'text' },
        { key: 'serialNo', label: 'Serial Number / Reg. No. / Enrollment No.', type: 'text' },
        { key: 'completedDegree', label: 'Has the Candidate Completed this Degree/Course?', type: 'select', options: ['Yes', 'No'] },
        { key: 'yearOfPassing', label: 'Year of Passing', type: 'text' },
      ],
    },
    {
      heading: 'Verifier Details',
      fields: [
        { key: 'verifiedByName', label: 'Verified By Name', type: 'text' },
        { key: 'designation', label: 'Designation', type: 'text' },
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
