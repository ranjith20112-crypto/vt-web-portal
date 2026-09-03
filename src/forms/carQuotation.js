// routes/forms/carQuotation.js
module.exports = {
  key: 'car-quotation',
  title: 'Car Quotation Verification Report',
  matchKeywords: ['car quotation', 'vehicle quotation'],
  sections: [
    {
      heading: 'Particulars of the Candidate',
      fields: [
        { key: 'address', label: 'Address', type: 'textarea' },
        { key: 'cityPin', label: 'City / Pin', type: 'text' },
      ],
    },
    {
      heading: 'Vehicle Details',
      // 'split' sections render a Criteria / Provided / Verified table —
      // the "Provided" column reads check.providedData[field.key] if a
      // data-entry transformer for this check type populates it (see
      // routes/verificationDataRoutes.js), otherwise shows '-'.
      layout: 'split',
      fields: [
        { key: 'vehicleType', label: 'Vehicle Type', type: 'text' },
        { key: 'colourOfVehicle', label: 'Colour of the Vehicle', type: 'text' },
        { key: 'showroomName', label: 'Showroom Name', type: 'text' },
        { key: 'showroomLocation', label: 'Showroom Location', type: 'text' },
        { key: 'typeOfInvoice', label: 'Type of Invoice', type: 'select', options: ['Proforma', 'Tax Invoice'] },
        { key: 'onRoadPricing', label: 'On Road / Off Road Pricing', type: 'text' },
      ],
    },
    {
      heading: 'Conclusion',
      fields: [
        { key: 'documentGenuine', label: 'Enclosed Documents Found To Be', type: 'select', options: ['GENUINE', 'NOT GENUINE'] },
        { key: 'verifiedByNameDesignation', label: 'Verified By: Name / Designation', type: 'text' },
      ],
    },
  ],
  legend: [
    ['Clear Report', 'GREEN'],
    ['Information Unable to be Validated', 'YELLOW'],
    ['Adverse Remark / Report', 'RED'],
  ],
};
