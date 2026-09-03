// routes/forms/drugPanel10.js
module.exports = {
  key: 'drug-panel-10',
  title: 'Report on Employee Drug Abuse Screening (10-Panel)',
  matchKeywords: ['drug panel - 10', 'drug panel-10', 'drug panel 10', '10 panel drug', '10-panel drug'],
  sections: [
    {
      heading: 'Screening Details',
      fields: [
        {
          key: 'drugsScreened',
          label: 'Type(s) of Drug Screening',
          type: 'textarea',
          placeholder: 'Amphetamine, Cannabis (Marijuana), Cocaine, Opiates, PCP, Barbiturate, Benzodiazepine, Methadone, Propoxyphene, Cannabinoid',
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
