// src/components/shared/FormControls.jsx
'use client';

import React, { useRef } from 'react';
import { IoCheckmarkCircle, IoCloudUploadOutline } from 'react-icons/io5';

// ---- Generic labeled input/select/textarea ----
// Defined once here so every form (candidate form + all per-check forms)
// renders fields identically and doesn't lose focus on keystroke.
export const Field = ({
  label,
  name,
  type = 'text',
  required = false,
  value,
  onChange,
  placeholder = '',
  as = 'input',
  options = [],
  ...rest
}) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 tracking-wider uppercase mb-2">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {as === 'select' ? (
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 outline-none focus:border-[#2A3EB1] text-[#2A3EB1] transition-all"
        {...rest}
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((o, i) => (
          <option key={i} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    ) : as === 'textarea' ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rest.rows || 3}
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#2A3EB1] text-[#2A3EB1] resize-none placeholder-gray-400 transition-all"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 outline-none focus:border-[#2A3EB1] text-[#2A3EB1] placeholder-gray-400 transition-all"
        {...rest}
      />
    )}
  </div>
);

export const CheckboxField = ({ label, name, checked, onChange, description }) => (
  <div
    className="flex items-start gap-3 p-4 bg-[#EEF0FA] border border-gray-300 rounded-xl hover:border-[#2A3EB1] transition-all cursor-pointer"
    onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
  >
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${checked ? 'bg-[#2A3EB1] border-[#2A3EB1]' : 'border-gray-400 bg-transparent'}`}>
      {checked && <IoCheckmarkCircle size={14} className="text-white" />}
    </div>
    <div>
      <div className="text-sm font-medium text-[#2A3EB1]">{label}</div>
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
  </div>
);

// FileUpload — optionally uploads immediately to the backend (uploadUrl) and
// reports back the saved file's URL via onUploaded({ url, originalName }).
// If no uploadUrl is given it just tracks the raw File object locally
// (used by the main Candidate Details tab, which uploads on final submit).
export const FileUpload = ({ label, file, savedUrl, onSelect, onUploaded, uploadUrl, apiClient, fieldName }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const isImage = file && file.type?.startsWith('image/');

  const handleChange = async (e) => {
    const f = e.target.files?.[0] || null;
    onSelect?.(f);
    if (!f || !uploadUrl || !apiClient) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append(fieldName || 'file', f);
      const res = await apiClient.post(uploadUrl, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.success && res.data.files?.[0]) {
        onUploaded?.(res.data.files[0]);
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && <label className="block text-xs font-bold text-gray-600 tracking-wider uppercase mb-2">{label}</label>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-dashed border-gray-400 rounded-xl text-left hover:border-[#2A3EB1] transition-all"
      >
        {isImage ? (
          <img src={URL.createObjectURL(file)} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-gray-300" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#2A3EB1]/5 border border-gray-300 flex items-center justify-center text-[#2A3EB1]">
            {(file || savedUrl) ? <IoCheckmarkCircle size={20} /> : <IoCloudUploadOutline size={20} />}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm text-[#2A3EB1] truncate">
            {uploading ? 'Uploading...' : file ? file.name : savedUrl ? 'File uploaded' : 'Choose file'}
          </div>
          <div className="text-[10px] text-gray-500">JPG / PNG / PDF, max 5MB</div>
        </div>
      </button>
      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleChange} />
    </div>
  );
};

export const CardHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-200 bg-[#EEF0FA]">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#2A3EB1]/5 border border-gray-300">
      <Icon size={18} className="text-[#2A3EB1]" />
    </div>
    <h3 className="text-lg font-bold text-[#2A3EB1]">{title}</h3>
  </div>
);

export const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={18} className="text-[#2A3EB1]" />
    <h4 className="text-base font-bold text-[#2A3EB1]">{title}</h4>
  </div>
);

const FormControls = {
  Field,
  CheckboxField,
  FileUpload,
  CardHeader,
  SectionTitle
};

export default FormControls;