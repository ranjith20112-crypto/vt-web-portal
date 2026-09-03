// routes/forms/form26as.js
module.exports = {
  key: 'form26as',
  title: 'Discreet Dual Employment Record Search Report',
  matchKeywords: ['26as', 'dual employment'],
  sections: [
    {
      heading: 'Candidate',
      fields: [
        { key: 'address', label: 'Address of the Candidate', type: 'textarea' },
        { key: 'dob', label: 'Date of Birth', type: 'date' },
        { key: 'panNumber', label: 'Permanent Account Number', type: 'text' },
        { key: 'panStatus', label: 'Status of PAN', type: 'select', options: ['Active', 'Inactive'] },
      ],
    },
    {
      heading: 'Particulars of Verification',
      fields: [
        { key: 'methodOfSearch', label: 'Method of Search & Source of Contact', type: 'select', options: ['Physical Follow-up', 'Bank Statement Validation', 'Credit Report', 'Form 26AS', 'EPFO'] },
        { key: 'periodOfSearch', label: 'Period of Search (FY)', type: 'text' },
      ],
    },
    {
      heading: 'Tax Deduction Details',
      fields: [
        { key: 'tds15G15H', label: 'TDS for 15G / 15H', type: 'text' },
        { key: 'tdsPropertyRentContractor', label: 'TDS on Property / Rent / Contractor (194IA/IB/M)', type: 'text' },
        { key: 'taxPaidOther', label: 'Tax Paid (other than TDS/TCS)', type: 'text' },
        { key: 'refundDetails', label: 'Details of Paid Refund', type: 'text' },
        { key: 'sftTransaction', label: 'Details of SFT Transaction', type: 'text' },
        { key: 'tdsDefaults', label: 'TDS Defaults', type: 'text' },
        { key: 'additionalRemarks', label: 'Additional Remarks', type: 'textarea' },
        { key: 'dualEmploymentStatus', label: 'Dual Employment Status', type: 'select', options: ['GENUINE', 'DISCREPANCY FOUND'] },
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
