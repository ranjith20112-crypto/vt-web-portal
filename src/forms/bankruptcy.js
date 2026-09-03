// routes/forms/bankruptcy.js
module.exports = {
  key: 'bankruptcy',
  title: 'Bankruptcy and Insolvency Financial Check Report',
  matchKeywords: ['bankrupt', 'insolvency', 'bifrc'],
  sections: [
    {
      heading: 'Candidate Information',
      fields: [
        { key: 'sOf', label: 'S/o', type: 'text' },
        { key: 'residentialAddress', label: 'Residential Address', type: 'textarea' },
        { key: 'documentDetails', label: 'Details of Documents (PAN, etc.)', type: 'text' },
        { key: 'dob', label: 'Date of Birth', type: 'date' },
      ],
    },
    {
      heading: 'Verification Result',
      fields: [
        {
          key: 'scopeOfVerification',
          label: 'Scope of Verification',
          type: 'textarea',
          placeholder: 'Economic Default List (MCA), Insolvency and Bankruptcy Board of India (IBBI), National Company Law Tribunal (NCLT), Board for Industrial & Financial Reconstruction (BIFR), CIBIL / Equifax / EPF defaulters list…',
        },
        { key: 'result', label: 'Result', type: 'select', options: ['No Records Found', 'Records Found'] },
        { key: 'remarks', label: 'Remarks (if any)', type: 'textarea' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
