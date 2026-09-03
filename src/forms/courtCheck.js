// routes/forms/courtCheck.js
module.exports = {
  key: 'court-check',
  title: 'Court | Criminal Record Search Report',
  matchKeywords: ['court check', 'court record search', 'court | criminal'],
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
        { key: 'verifiedAt', label: 'Verified / Enquired At (Court)', type: 'text', placeholder: 'District Court / Magistrate Court / Tribunal / Labour Court / High Court / Supreme Court' },
        { key: 'recordsAccessed', label: 'Type of Records Accessed', type: 'select', options: ['Civil', 'Criminal', 'Both'] },
        { key: 'methodOfSearch', label: 'Method of Search & Source of Contact', type: 'text' },
        { key: 'remarks', label: 'Remarks (if any)', type: 'textarea' },
        { key: 'adverseFound', label: 'Adverse Remarks / Cases Pending?', type: 'yesno' },
        { key: 'firCaseNo', label: 'FIR / Case No.', type: 'text' },
        { key: 'caseDate', label: 'Date', type: 'date' },
        { key: 'chargeMade', label: 'Charge Made / Crime Charged', type: 'text' },
        { key: 'currentStatus', label: 'Current Status of the Case', type: 'textarea' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
