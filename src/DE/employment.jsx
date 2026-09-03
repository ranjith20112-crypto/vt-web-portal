// src/components/DE/employment.jsx
'use client';

import React from 'react';
import { IoBriefcaseOutline, IoAddOutline, IoTrashOutline } from 'react-icons/io5';
import { Field, CheckboxField, FileUpload, SectionTitle } from '../DE/formcontrols';
import api from '../apiroute/apiroute';

const EMPLOYMENT_TYPES = ['Permanent', 'Contract', 'Temporary', 'Intern', 'Consultant'];
const SALARY_TYPES = ['Monthly', 'Weekly', 'Daily', 'Stipend'];

const emptyRecord = () => ({
  companyName: '',
  companyNameOther: '',
  companyAddress: '',
  positionHeld: '',
  department: '',
  officeLandline: '',
  employeeCode: '',
  typeOfEmployment: '',
  lastSalaryDrawn: '',
  salaryType: '',
  reportingAuthorityName: '',
  reportingAuthorityDesignation: '',
  reportingAuthorityContactNo: '',
  reportingAuthorityEmail: '',
  reasonForLeaving: '',
  companyWebsite: '',
  companySocialMediaLink: '',
  hrName: '',
  hrEmail: '',
  hrContactNo: '',
  hrSocialMediaLink: '',
  serviceDate: '',
  yetToRelieve: false,
  notApplicable: false,
  files: [],
});

// data shape persisted into checkData[slNo].__structured : { records: [ ... ] }
const EmploymentCheckForm = ({ data, onDataChange, workorderId, slNo }) => {
  const records = (data?.records && data.records.length ? data.records : [emptyRecord()]);

  const updateRecord = (idx, key, val) => {
    const next = records.map((r, i) => (i === idx ? { ...r, [key]: val } : r));
    onDataChange({ records: next });
  };

  const addFile = (idx, fileMeta) => {
    const next = records.map((r, i) => (i === idx ? { ...r, files: [...(r.files || []), fileMeta] } : r));
    onDataChange({ records: next });
  };

  const addRecord = () => onDataChange({ records: [...records, emptyRecord()] });
  const removeRecord = (idx) => onDataChange({ records: records.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon={IoBriefcaseOutline} title="Employment Verification" />
        <button onClick={addRecord} className="flex items-center gap-1 text-xs font-semibold text-[#2A3EB1] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100">
          <IoAddOutline size={16} /> Add Employer
        </button>
      </div>

      {records.map((rec, idx) => (
        <div key={idx} className="bg-[#F5F5F5] border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-[#EEF0FA] border-b border-gray-200">
            <span className="font-bold text-[#2A3EB1]">Employment {idx + 1}</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={rec.notApplicable} onChange={(e) => updateRecord(idx, 'notApplicable', e.target.checked)} className="w-4 h-4" />
                Not Applicable
              </label>
              {records.length > 1 && (
                <button onClick={() => removeRecord(idx)} className="text-red-600 hover:text-red-800">
                  <IoTrashOutline size={18} />
                </button>
              )}
            </div>
          </div>

          <div className={`p-6 space-y-6 ${rec.notApplicable ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Company Name" name="companyName" value={rec.companyName} onChange={(e) => updateRecord(idx, 'companyName', e.target.value)} placeholder="Select company name" />
              <Field label="Company Name (if not found in list)" name="companyNameOther" value={rec.companyNameOther} onChange={(e) => updateRecord(idx, 'companyNameOther', e.target.value)} placeholder="Enter company name" />
              <Field label="Company Address" name="companyAddress" as="textarea" required value={rec.companyAddress} onChange={(e) => updateRecord(idx, 'companyAddress', e.target.value)} />

              <Field label="Position Held" name="positionHeld" value={rec.positionHeld} onChange={(e) => updateRecord(idx, 'positionHeld', e.target.value)} />
              <Field label="Department" name="department" value={rec.department} onChange={(e) => updateRecord(idx, 'department', e.target.value)} />
              <Field label="Office Landline Number" name="officeLandline" value={rec.officeLandline} onChange={(e) => updateRecord(idx, 'officeLandline', e.target.value)} />

              <Field label="Employee Code" name="employeeCode" value={rec.employeeCode} onChange={(e) => updateRecord(idx, 'employeeCode', e.target.value)} />
              <Field label="Type of Employment" name="typeOfEmployment" as="select" required options={EMPLOYMENT_TYPES} value={rec.typeOfEmployment} onChange={(e) => updateRecord(idx, 'typeOfEmployment', e.target.value)} />
              <Field label="Last Salary Drawn" name="lastSalaryDrawn" type="number" value={rec.lastSalaryDrawn} onChange={(e) => updateRecord(idx, 'lastSalaryDrawn', e.target.value)} />

              <Field label="Salary Type" name="salaryType" as="select" options={SALARY_TYPES} value={rec.salaryType} onChange={(e) => updateRecord(idx, 'salaryType', e.target.value)} />
              <Field label="Reporting Authority Name" name="reportingAuthorityName" required value={rec.reportingAuthorityName} onChange={(e) => updateRecord(idx, 'reportingAuthorityName', e.target.value)} />
              <Field label="Reporting Authority Designation" name="reportingAuthorityDesignation" required value={rec.reportingAuthorityDesignation} onChange={(e) => updateRecord(idx, 'reportingAuthorityDesignation', e.target.value)} />

              <Field label="Reporting Authority Contact No" name="reportingAuthorityContactNo" type="tel" required value={rec.reportingAuthorityContactNo} onChange={(e) => updateRecord(idx, 'reportingAuthorityContactNo', e.target.value)} />
              <Field label="Reporting Authority Email Id" name="reportingAuthorityEmail" type="email" required value={rec.reportingAuthorityEmail} onChange={(e) => updateRecord(idx, 'reportingAuthorityEmail', e.target.value)} />
              <Field label="Reason for Leaving" name="reasonForLeaving" as="textarea" value={rec.reasonForLeaving} onChange={(e) => updateRecord(idx, 'reasonForLeaving', e.target.value)} />

              <Field label="Company Website" name="companyWebsite" value={rec.companyWebsite} onChange={(e) => updateRecord(idx, 'companyWebsite', e.target.value)} />
              <Field label="Company Social Media Link" name="companySocialMediaLink" value={rec.companySocialMediaLink} onChange={(e) => updateRecord(idx, 'companySocialMediaLink', e.target.value)} />
              <Field label="HR Name" name="hrName" required value={rec.hrName} onChange={(e) => updateRecord(idx, 'hrName', e.target.value)} />

              <Field label="HR Email" name="hrEmail" type="email" required value={rec.hrEmail} onChange={(e) => updateRecord(idx, 'hrEmail', e.target.value)} />
              <Field label="HR Contact No" name="hrContactNo" type="tel" value={rec.hrContactNo} onChange={(e) => updateRecord(idx, 'hrContactNo', e.target.value)} />
              <Field label="HR Social Media Link" name="hrSocialMediaLink" value={rec.hrSocialMediaLink} onChange={(e) => updateRecord(idx, 'hrSocialMediaLink', e.target.value)} />

              <Field label="Service Date" name="serviceDate" type="date" required value={rec.serviceDate} onChange={(e) => updateRecord(idx, 'serviceDate', e.target.value)} />
            </div>

            <CheckboxField
              label="Yet to relieve from this organization"
              name="yetToRelieve"
              checked={rec.yetToRelieve}
              onChange={(e) => updateRecord(idx, 'yetToRelieve', e.target.checked)}
            />

            <div className="px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-800">
              <p className="font-semibold mb-1">Following documents are required:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Last 3 months payslip / 3 months bank statement</li>
                <li>Offer letter from this current organisation</li>
                <li>Relieving letter from the organisation</li>
                <li>Bonus letters / Appraisal letters (if available)</li>
                <li>ESOPS document</li>
              </ul>
            </div>

            <FileUpload
              label="Add Supporting Document"
              apiClient={api}
              uploadUrl={`/workorders/${workorderId}/checks/${slNo}/documents`}
              fieldName={`employment_${idx}`}
              onUploaded={(meta) => addFile(idx, meta)}
            />
            {rec.files?.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#EEF0FA] text-xs text-gray-500">
                      <th className="px-4 py-2 text-left">File Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.files.map((f, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-4 py-2 text-[#2A3EB1]">
                          <a href={f.url} target="_blank" rel="noreferrer" className="underline">{f.originalName || 'document'}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmploymentCheckForm;