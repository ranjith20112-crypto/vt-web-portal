// routes/forms/companyCriminal.js
module.exports = {
  key: 'company-criminal',
  title: 'Company Report on Criminal Background Record Check',
  matchKeywords: ['company criminal', 'company background record'],
  sections: [
    {
      heading: 'Particulars of the Company',
      fields: [
        { key: 'companyName', label: 'Company Name', type: 'text' },
        { key: 'companyAddress', label: 'Company Residence Address', type: 'textarea' },
        { key: 'companyPan', label: 'Company PAN', type: 'text' },
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
