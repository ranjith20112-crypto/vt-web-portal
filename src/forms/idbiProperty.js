// routes/forms/idbiProperty.js
module.exports = {
  key: 'idbi-property',
  title: 'IDBI Property Verification (Annexure)',
  matchKeywords: ['idbi', 'property verification annexure'],
  sections: [
    {
      heading: 'Visit Details',
      fields: [
        { key: 'residenceAddress', label: 'Residence Address', type: 'textarea' },
        { key: 'dateOfVisit', label: 'Date of Visit', type: 'date' },
        { key: 'timeOfVisit', label: 'Time', type: 'text' },
        { key: 'personMet', label: 'Person Met', type: 'text' },
        { key: 'relationship', label: 'Relationship', type: 'text' },
        { key: 'approxAreaOfPlot', label: 'Approx. Area of the Plot (sq. ft.)', type: 'text' },
        { key: 'comment', label: 'Comment', type: 'textarea' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
