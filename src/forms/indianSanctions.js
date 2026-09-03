// routes/forms/indianSanctions.js
module.exports = {
  key: 'indian-sanctions',
  title: 'Government / Criminal Sanctions Verification (Indian Database)',
  matchKeywords: ['indian database', 'indian sanction'],
  sections: [
    {
      heading: 'Particulars of Candidate',
      fields: [
        { key: 'sOf', label: 'S/o', type: 'text' },
        { key: 'residenceAddress', label: 'Residence Address', type: 'textarea' },
        { key: 'dob', label: 'Date of Birth', type: 'date' },
      ],
    },
    {
      heading: 'Particulars of Verification',
      fields: [
        { key: 'verifiedAt', label: 'Verified / Enquired At', type: 'text', placeholder: 'Online Portal Search' },
        { key: 'recordsAccessed', label: 'Type of Records Accessed', type: 'text', placeholder: 'Sanctions List Search' },
        { key: 'findings', label: 'Findings (Name Catch / Identifications / Aliases / Address)', type: 'textarea' },
        { key: 'methodOfSearch', label: 'Method of Search & Source of Contact', type: 'text', placeholder: 'Online Database' },
        { key: 'remarks', label: 'Remarks (if any)', type: 'textarea' },
        { key: 'adverseFound', label: 'Adverse Indian Sanction Found?', type: 'yesno' },
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
