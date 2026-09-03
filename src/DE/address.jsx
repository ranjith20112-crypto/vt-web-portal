// src/components/DE/address.jsx
'use client';

import React from 'react';
import { IoHomeOutline, IoLocationOutline } from 'react-icons/io5';
import { Field, FileUpload, SectionTitle } from '../DE/formcontrols';
import api from '../apiroute/apiroute';

const RESIDENCE_TYPES = ['Owned', 'Rented', 'Company Provided', 'Family Owned', 'Other'];
const ACCOMMODATION_TYPES = ['Independent House', 'Apartment / Flat', 'PG / Hostel', 'Other'];

const emptyAddressBlock = () => ({
  address: '',
  landmark: '',
  country: 'India',
  state: '',
  city: '',
  pincode: '',
  residenceType: '',
  accommodationType: '',
  periodFrom: '',
  periodTo: '',
  files: [], // [{ url, originalName }]
});

const AddressBlock = React.memo(({
  title,
  blockKey,
  block,
  isPermanentDisabled,
  showSameAsPresent,
  sameAsPresent,
  onToggleSameAsPresent,
  onUpdateBlock,
  onAddFile,
  workorderId,
  slNo
}) => {
  return (
    <div className="bg-[#F5F5F5] border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-[#EEF0FA] border-b border-gray-200">
        <SectionTitle 
          icon={blockKey === 'present' ? IoHomeOutline : IoLocationOutline} 
          title={title} 
        />
        
        {showSameAsPresent && (
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAsPresent}
              onChange={(e) => onToggleSameAsPresent(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            Same as present address
          </label>
        )}
      </div>

      <div className={`p-6 space-y-6 ${isPermanentDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
        <Field
          label="Address"
          name="address"
          as="textarea"
          required
          value={block.address || ''}
          onChange={(e) => onUpdateBlock(blockKey, 'address', e.target.value)}
          placeholder="Enter full address"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Landmark"
            name="landmark"
            value={block.landmark || ''}
            onChange={(e) => onUpdateBlock(blockKey, 'landmark', e.target.value)}
            placeholder="Enter landmark"
          />

          <Field
            label="Country"
            name="country"
            as="select"
            required
            options={['India', 'Other']}
            value={block.country || 'India'}
            onChange={(e) => onUpdateBlock(blockKey, 'country', e.target.value)}
          />

          <Field
            label="State"
            name="state"
            required
            value={block.state || ''}
            onChange={(e) => onUpdateBlock(blockKey, 'state', e.target.value)}
            placeholder="Enter state"
          />

          <Field
            label="City"
            name="city"
            required
            value={block.city || ''}
            onChange={(e) => onUpdateBlock(blockKey, 'city', e.target.value)}
            placeholder="Enter city"
          />

          <Field
            label="Pincode"
            name="pincode"
            value={block.pincode || ''}
            onChange={(e) => onUpdateBlock(blockKey, 'pincode', e.target.value)}
            placeholder="Pincode"
          />

          <Field
            label="Residence Type"
            name="residenceType"
            as="select"
            required
            options={RESIDENCE_TYPES}
            value={block.residenceType || ''}
            onChange={(e) => onUpdateBlock(blockKey, 'residenceType', e.target.value)}
          />

          <Field
            label="Accommodation Type"
            name="accommodationType"
            as="select"
            required
            options={ACCOMMODATION_TYPES}
            value={block.accommodationType || ''}
            onChange={(e) => onUpdateBlock(blockKey, 'accommodationType', e.target.value)}
          />

          <Field
            label="Period of Stay — From"
            name="periodFrom"
            type="date"
            required
            value={block.periodFrom || ''}
            onChange={(e) => onUpdateBlock(blockKey, 'periodFrom', e.target.value)}
          />

          <Field
            label="Period of Stay — To"
            name="periodTo"
            type="date"
            value={block.periodTo || ''}
            onChange={(e) => onUpdateBlock(blockKey, 'periodTo', e.target.value)}
          />
        </div>

        {/* File Upload Section */}
        <div>
          <FileUpload
            label="Supporting Document"
            apiClient={api}
            uploadUrl={`/workorders/${workorderId}/checks/${slNo}/documents`}
            fieldName={`address_${blockKey}`}
            onUploaded={(meta) => onAddFile(blockKey, meta)}
          />

          {block.files?.length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EEF0FA] text-xs text-gray-500">
                    <th className="px-4 py-2 text-left">File Name</th>
                  </tr>
                </thead>
                <tbody>
                  {block.files.map((f, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-[#2A3EB1]">
                        <a 
                          href={f.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="underline hover:text-blue-700"
                        >
                          {f.originalName || 'document'}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const AddressCheckForm = ({ data, onDataChange, workorderId, slNo }) => {
  // Ensure stable value with proper merging
  const value = React.useMemo(() => {
    const present = { ...emptyAddressBlock(), ...(data?.present || {}) };
    const permanentRaw = { ...emptyAddressBlock(), ...(data?.permanent || {}) };

    return {
      sameAsPresent: data?.sameAsPresent ?? false,
      present,
      permanent: data?.sameAsPresent ? { ...present } : permanentRaw,
    };
  }, [data]);

  const updateBlock = React.useCallback((blockKey, key, val) => {
    const nextValue = { ...value };

    nextValue[blockKey] = {
      ...nextValue[blockKey],
      [key]: val,
    };

    // Auto-sync permanent when "same as present" is checked
    if (blockKey === 'present' && nextValue.sameAsPresent) {
      nextValue.permanent = { ...nextValue.present };
    }

    onDataChange(nextValue);
  }, [value, onDataChange]);

  const toggleSameAsPresent = React.useCallback((checked) => {
    const nextValue = {
      ...value,
      sameAsPresent: checked,
    };

    if (checked) {
      nextValue.permanent = { ...nextValue.present };
    }

    onDataChange(nextValue);
  }, [value, onDataChange]);

  const addBlockFile = React.useCallback((blockKey, fileMeta) => {
    const nextValue = {
      ...value,
      [blockKey]: {
        ...value[blockKey],
        files: [...(value[blockKey].files || []), fileMeta],
      },
    };

    onDataChange(nextValue);
  }, [value, onDataChange]);

  const presentBlock = value.present;
  const permanentBlock = value.permanent;
  const isPermanentDisabled = value.sameAsPresent;

  return (
    <div className="space-y-6">
      <AddressBlock 
        title="Present Address" 
        blockKey="present" 
        block={presentBlock}
        isPermanentDisabled={false}
        showSameAsPresent={false}
        sameAsPresent={value.sameAsPresent}
        onToggleSameAsPresent={toggleSameAsPresent}
        onUpdateBlock={updateBlock}
        onAddFile={addBlockFile}
        workorderId={workorderId}
        slNo={slNo}
      />
      
      <AddressBlock 
        title="Permanent Address" 
        blockKey="permanent" 
        block={permanentBlock}
        isPermanentDisabled={isPermanentDisabled}
        showSameAsPresent={true}
        sameAsPresent={value.sameAsPresent}
        onToggleSameAsPresent={toggleSameAsPresent}
        onUpdateBlock={updateBlock}
        onAddFile={addBlockFile}
        workorderId={workorderId}
        slNo={slNo}
      />
    </div>
  );
};

export default AddressCheckForm;