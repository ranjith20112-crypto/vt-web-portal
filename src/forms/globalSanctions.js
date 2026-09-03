// routes/forms/globalSanctions.js
module.exports = {
  key: 'global-sanctions',
  title: 'Government / Criminal Sanctions Verification (Global Database)',
  matchKeywords: ['global database', 'global sanction'],
  sections: [
    {
      heading: 'Particulars of Candidate',
      fields: [
        { key: 'sOf', label: 'S/o', type: 'text' },
        { key: 'residenceAddress', label: 'Residence Address', type: 'textarea' },
        { key: 'dob', label: 'Date of Birth', type: 'date' },
        { key: 'passportNo', label: 'Passport No.', type: 'text' },
      ],
    },
    {
      heading: 'Particulars of Verification',
      fields: [
        { key: 'verifiedAt', label: 'Verified / Enquired At', type: 'text', placeholder: 'OFAC Portal Search' },
        { key: 'recordsAccessed', label: 'Type of Records Accessed', type: 'text', placeholder: 'Sanctions List Search' },
        { key: 'findings', label: 'Findings (Name Catch / Identifications / Aliases / Address)', type: 'textarea' },
        { key: 'methodOfSearch', label: 'Method of Search & Source of Contact', type: 'text', placeholder: 'Online Database' },
        { key: 'remarks', label: 'Remarks (if any)', type: 'textarea' },
        { key: 'adverseFound', label: 'Adverse Global Sanction Found?', type: 'yesno' },
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
