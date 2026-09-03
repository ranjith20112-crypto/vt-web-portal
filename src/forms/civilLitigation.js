// routes/forms/civilLitigation.js
module.exports = {
  key: 'civil-litigation',
  title: 'Employee Litigation Background Verification Report',
  matchKeywords: ['litigation'],
  sections: [
    {
      heading: 'Particulars of Employee',
      fields: [
        { key: 'residentialAddress', label: 'Residential Address', type: 'textarea' },
        { key: 'dob', label: 'D.O.B', type: 'date' },
      ],
    },
    {
      heading: 'Particulars of Verification',
      fields: [
        { key: 'verifiedAt', label: 'Verified / Enquired At', type: 'text' },
        { key: 'methodOfVerification', label: 'Method of Verification Carried Out', type: 'text' },
        { key: 'remarks', label: 'Remarks (if any)', type: 'textarea' },
        { key: 'adverseFound', label: 'Adverse Remarks / Criminal Cases Pending?', type: 'yesno' },
        { key: 'firCaseNo', label: 'FIR / Case No.', type: 'text' },
        { key: 'caseDate', label: 'Date', type: 'date' },
        { key: 'chargeMade', label: 'Charge Made / Crime Committed', type: 'text' },
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
