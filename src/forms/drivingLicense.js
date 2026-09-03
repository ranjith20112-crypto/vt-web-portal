// routes/forms/drivingLicense.js
module.exports = {
  key: 'driving-license',
  title: 'Driving License Verification Report',
  matchKeywords: ['driving license', 'driving licence'],
  sections: [
    {
      heading: 'Particulars of the Candidate',
      fields: [
        { key: 'fatherName', label: 'Father Name', type: 'text' },
        { key: 'dob', label: 'D.O.B', type: 'date' },
      ],
    },
    {
      heading: 'License Details',
      layout: 'split',
      fields: [
        { key: 'licenseNumber', label: 'Driving License Number', type: 'text' },
        { key: 'nameOnLicense', label: 'Name on License', type: 'text' },
        { key: 'licenseStatus', label: 'Driving License Status', type: 'select', options: ['Valid', 'Invalid / Not Found'] },
      ],
    },
    {
      heading: 'Conclusion',
      fields: [
        { key: 'documentGenuine', label: 'Enclosed Documents Found To Be', type: 'select', options: ['GENUINE', 'NOT GENUINE'] },
        { key: 'verifiedByNameDesignation', label: 'Verified By: Name / Designation', type: 'text' },
        { key: 'databaseSearchResult', label: 'Database Search Result', type: 'text' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to Validate', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
