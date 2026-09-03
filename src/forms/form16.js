// routes/forms/form16.js
module.exports = {
  key: 'form16',
  title: 'Form 16 - Verification Report',
  matchKeywords: ['form 16', 'form16'],
  sections: [
    {
      heading: 'Candidate',
      fields: [
        { key: 'financialYear', label: 'Financial Year', type: 'text' },
        { key: 'panNumber', label: 'Permanent Account Number', type: 'text' },
        { key: 'panStatus', label: 'Status of PAN', type: 'select', options: ['Active', 'Inactive'] },
      ],
    },
    {
      heading: 'Particulars of Verification',
      fields: [
        { key: 'methodOfSearch', label: 'Method of Search & Source of Contact', type: 'select', options: ['Form 16', 'TDS Central Processing Cell'] },
        { key: 'periodOfSearch', label: 'Period of Search (FY)', type: 'text' },
        { key: 'typeOfReturn', label: 'Type of Return', type: 'text' },
        { key: 'tanOfDeductor', label: 'TAN of Deductor', type: 'text' },
        { key: 'quarterlyTdsStatus', label: 'Quarterly TDS Status (Q1-Q4)', type: 'text' },
        { key: 'form16Records', label: 'Form 16 Records', type: 'select', options: ['Recommended', 'Not Recommended'] },
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
