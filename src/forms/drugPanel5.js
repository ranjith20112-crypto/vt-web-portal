// routes/forms/drugPanel5.js
// NOTE on matching: "10" also contains no "5", so matching on 'drug' +
// '5' here and 'drug' + '10' in drugPanel10.js is unambiguous as long as
// the checkType/subType text itself says "Panel - 5" / "Panel - 10" (or
// similar) — see routes/forms/index.js resolveFormConfig() for the exact
// matching order (longer/more-specific keyword sets are checked first).
module.exports = {
  key: 'drug-panel-5',
  title: 'Report on Employee Drug Abuse Screening (5-Panel)',
  matchKeywords: ['drug panel - 5', 'drug panel-5', 'drug panel 5', '5 panel drug', '5-panel drug'],
  sections: [
    {
      heading: 'Screening Details',
      fields: [
        {
          key: 'drugsScreened',
          label: 'Type(s) of Drug Screening',
          type: 'textarea',
          placeholder: 'Cocaine, Morphine, Amphetamine, Barbiturates, Benzodiazepine',
        },
        { key: 'sampleMethod', label: 'Type(s) of Samples & Method(s) of Screening', type: 'text', placeholder: 'e.g. Urine, Immunochromatography & Creatinine, Jaffe Method' },
        { key: 'testingLab', label: 'Testing Laboratory', type: 'text' },
        { key: 'observedResult', label: 'Observed Result', type: 'select', options: ['Negative imprints', 'Positive imprints'] },
        { key: 'remarks', label: 'Overall Remarks / Recommendations', type: 'textarea' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
