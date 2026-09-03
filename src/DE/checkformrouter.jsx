// src/components/DE/checkformrouter.jsx
'use client';

import React from 'react';
import AddressCheckForm from './address';
import EmploymentCheckForm from './employment';
import EducationCheckForm from './education';

// Order matters: more specific keyword groups should be checked before
// generic ones. 'criminal' is treated as an Address-style check (present
// address form) since that's the closest fit for a criminal verification.
const FORM_REGISTRY = [
  {
    keywords: ['education', 'educational', 'school', 'college', 'university', 'degree', 'academic'],
    Component: EducationCheckForm,
  },
  {
    keywords: ['employment', 'employer', 'work experience', 'non-technical', 'technical', 'job'],
    Component: EmploymentCheckForm,
  },
  {
    keywords: ['address', 'present address', 'permanent address', 'residential', 'criminal'],
    Component: AddressCheckForm,
  },
];

const resolveForm = (checkType = '', subType = '') => {
  const fullText = `${checkType} ${subType}`.toLowerCase().trim();

  for (const entry of FORM_REGISTRY) {
    if (entry.keywords.some((keyword) => fullText.includes(keyword))) {
      return entry.Component;
    }
  }

  // Anything unrecognized falls back to the Address form.
  return AddressCheckForm;
};

const CheckFormRouter = ({
  checkType = '',
  subType = '',
  data,
  onDataChange,
  workorderId,
  slNo,
}) => {
  const Component = resolveForm(checkType, subType);

  return (
    <Component
      data={data || {}}
      onDataChange={onDataChange}
      checkType={checkType}
      subType={subType}
      workorderId={workorderId}
      slNo={slNo}
    />
  );
};

export default CheckFormRouter;