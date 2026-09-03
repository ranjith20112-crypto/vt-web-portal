// routes/forms/bankStatement.js
module.exports = {
  key: 'bank-statement',
  title: 'Bank Statement Verification Report',
  matchKeywords: ['bank statement'],
  sections: [
    {
      heading: 'Candidate',
      fields: [
        { key: 'address', label: 'Address', type: 'textarea' },
      ],
    },
    {
      heading: 'Particulars of Verification',
      fields: [
        { key: 'methodOfSearch', label: 'Method of Search & Source of Contact', type: 'select', options: ['Bank Statement', 'Form 26AS / Net Banking'] },
        { key: 'periodOfSearch', label: 'Period of Search', type: 'select', options: ['1 Month', '6 Months'] },
        { key: 'panNumber', label: 'Permanent Account Number', type: 'text' },
        { key: 'bankAccountNo', label: 'Bank Account No.', type: 'text' },
        { key: 'nameOfBank', label: 'Name of the Bank', type: 'text' },
        { key: 'bankStatementStatus', label: 'Bank Statement Status', type: 'select', options: ['Recommended', 'Not Recommended'] },
        { key: 'remarks', label: 'Remarks (if any)', type: 'textarea' },
        { key: 'adverseFound', label: 'Adverse Remarks Found?', type: 'yesno' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark Report', 'RED'],
    ['Partially Verified / Minor Discrepancies', 'ORANGE'],
  ],
};
