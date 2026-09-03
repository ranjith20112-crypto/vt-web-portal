// src/components/DE/education.jsx
'use client';

import React from 'react';
import { IoSchoolOutline, IoAddOutline, IoTrashOutline } from 'react-icons/io5';
import { Field, FileUpload, SectionTitle } from '../DE/formcontrols';
import api from '../apiroute/apiroute';

const COURSE_TYPES = ['10th', '12th', 'Diploma', "Bachelor's Degree", "Master's Degree", 'Doctorate', 'Other'];

const emptyRecord = () => ({
  courseType: '',
  degreeName: '',
  institutionName: '',
  institutionNameOther: '',
  universityNameAddress: '',
  studentId: '',
  courseCommencementDate: '',
  courseCompletionDate: '',
  majorSubject: '',
  notApplicable: false,
  files: [],
});

// data shape persisted into checkData[slNo].__structured : { records: [ ... ] }
const EducationCheckForm = ({ data, onDataChange, workorderId, slNo }) => {
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
        <SectionTitle icon={IoSchoolOutline} title="Education Verification" />
        <button onClick={addRecord} className="flex items-center gap-1 text-xs font-semibold text-[#2A3EB1] border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100">
          <IoAddOutline size={16} /> Add Education
        </button>
      </div>

      {records.map((rec, idx) => (
        <div key={idx} className="bg-[#F5F5F5] border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-[#EEF0FA] border-b border-gray-200">
            <span className="font-bold text-[#2A3EB1]">Education {idx + 1}</span>
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
              <Field label="Course Type" name="courseType" as="select" required options={COURSE_TYPES} value={rec.courseType} onChange={(e) => updateRecord(idx, 'courseType', e.target.value)} />
              <Field label="Name of the Degree (as in certificate)" name="degreeName" value={rec.degreeName} onChange={(e) => updateRecord(idx, 'degreeName', e.target.value)} />
              <Field label="Name of Educational Institution" name="institutionName" value={rec.institutionName} onChange={(e) => updateRecord(idx, 'institutionName', e.target.value)} placeholder="Select institution name" />

              <Field label="Education Institution (if not found in list)" name="institutionNameOther" value={rec.institutionNameOther} onChange={(e) => updateRecord(idx, 'institutionNameOther', e.target.value)} />
              <Field label="University / Board Name and Address" name="universityNameAddress" as="textarea" value={rec.universityNameAddress} onChange={(e) => updateRecord(idx, 'universityNameAddress', e.target.value)} />
              <Field label="Student ID / Enrolment No." name="studentId" required value={rec.studentId} onChange={(e) => updateRecord(idx, 'studentId', e.target.value)} />

              <Field label="Course Commencement Date" name="courseCommencementDate" type="date" required value={rec.courseCommencementDate} onChange={(e) => updateRecord(idx, 'courseCommencementDate', e.target.value)} />
              <Field label="Course Completion Date" name="courseCompletionDate" type="date" required value={rec.courseCompletionDate} onChange={(e) => updateRecord(idx, 'courseCompletionDate', e.target.value)} />
              <Field label="Major Subject" name="majorSubject" value={rec.majorSubject} onChange={(e) => updateRecord(idx, 'majorSubject', e.target.value)} />
            </div>

            <div className="px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-800">
              <p className="font-semibold mb-1">Following documents are required:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Consolidated Marksheet / All Semester Marksheet</li>
                <li>Convocation Certificate</li>
                <li>Provisional Certificate</li>
                <li>If currently pursuing, upload available semester marksheets</li>
              </ul>
            </div>

            <FileUpload
              label="Add Supporting Document"
              apiClient={api}
              uploadUrl={`/workorders/${workorderId}/checks/${slNo}/documents`}
              fieldName={`education_${idx}`}
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

export default EducationCheckForm;