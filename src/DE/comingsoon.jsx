// src/components/DE/comingsoon.jsx
'use client';

import React from 'react';
import { IoConstructOutline } from 'react-icons/io5';

// Fallback placeholder shown for any check type that doesn't yet have a
// dedicated form registered in checkformrouter.jsx (e.g. "Criminal Record",
// "Reference Check", etc). Keeps the tab usable instead of crashing.
const ComingSoonForm = ({ checkType, subType }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-8 bg-[#F5F5F5] border border-dashed border-gray-300 rounded-2xl">
    <div className="w-14 h-14 rounded-full bg-[#2A3EB1]/5 border border-gray-300 flex items-center justify-center mb-4">
      <IoConstructOutline size={26} className="text-[#2A3EB1]" />
    </div>
    <h4 className="text-lg font-bold text-[#2A3EB1] mb-1">
      {checkType || 'This check'} — Dedicated Form Coming Soon
    </h4>
    {subType && <p className="text-sm text-gray-500 mb-2">{subType}</p>}
    <p className="text-sm text-gray-500 max-w-md">
      A dedicated data entry form for this check type hasn't been built yet.
      You can still use the "Additional Fields (Configured)" section below to
      capture data, and set the status/notes for this check.
    </p>
  </div>
);

export default ComingSoonForm;