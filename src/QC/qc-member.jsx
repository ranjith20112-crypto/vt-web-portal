/* ============================================================
   src/employee-screens/QCMemberScreen.jsx

   A QC member's own queue: every check assigned to them
   (qcStatus === 'assigned'). Clicking "Verify QC" opens a split-screen
   modal — LEFT side is everything captured during Data Management /
   candidate data entry (check.data.__structured), RIGHT side is
   everything the verifier filled in (check.verifier) — so the QC
   reviewer can compare the two side by side before Approving or
   Rejecting.

   "Viewing as" selector: since this project doesn't expose an auth
   context to this component, the QC member is chosen from a dropdown
   (falls back to a value stored in localStorage under 'employeeId' if
   present, so it can be wired to real auth later with zero changes to
   the data-fetching logic below).
   ============================================================ */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiSearch, FiCheckCircle, FiX, FiLayers, FiXCircle, FiCheck, FiEye,
} from 'react-icons/fi';
import { IoPersonOutline, IoDocumentTextOutline } from 'react-icons/io5';
import theme from '../theme/theme';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

async function fetchMemberQueue({ assignedToId, checkTypeId, from, to, search }) {
  const res = await api.get('/qc/member/list', { params: { assignedToId, checkTypeId, from, to, search } });
  return res.data;
}

async function fetchMemberCompleted({ assignedToId, checkTypeId, from, to, search }) {
  const res = await api.get('/qc/member/completed/list', { params: { assignedToId, checkTypeId, from, to, search } });
  return res.data;
}

async function fetchEmployeesList() {
  const res = await api.get('/employees');
  return res.data;
}

async function fetchQcDetail(workorderId, slNo) {
  const res = await api.get(`/qc/${workorderId}/checks/${slNo}/detail`);
  return res.data;
}

async function submitQcVerify(workorderId, slNo, payload) {
  const res = await api.put(`/qc/${workorderId}/checks/${slNo}/verify`, payload);
  return res.data;
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
      {message}
    </div>
  );
}

/* ───────── Generic key/value renderer ─────────
   Check types vary (Address uses present/permanent, Employment/Education
   use records[], Criminal reuses the address shape). Rather than
   hand-coding a form per check type, this renders whatever structured
   data exists as clean label/value rows, recursing into nested
   objects/arrays so every check type is covered automatically.        */
function humanizeKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatValue(val) {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) {
    if (val.length === 0) return '—';
    if (val.every((v) => typeof v !== 'object')) return val.join(', ');
    return null; // handled as nested block by caller
  }
  return String(val);
}

function DataBlock({ data, skipKeys = ['files'] }) {
  if (!data || typeof data !== 'object') return <p className="text-xs text-gray-400">No data captured.</p>;
  const entries = Object.entries(data).filter(([k]) => !skipKeys.includes(k));
  if (entries.length === 0) return <p className="text-xs text-gray-400">No data captured.</p>;

  return (
    <div className="space-y-3">
      {entries.map(([key, val]) => {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          return (
            <div key={key} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">{humanizeKey(key)}</p>
              <DataBlock data={val} skipKeys={skipKeys} />
            </div>
          );
        }
        if (Array.isArray(val) && val.some((v) => v && typeof v === 'object')) {
          return (
            <div key={key} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">{humanizeKey(key)}</p>
              <div className="space-y-2">
                {val.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-2 bg-white">
                    <DataBlock data={item} skipKeys={skipKeys} />
                  </div>
                ))}
              </div>
            </div>
          );
        }
        const display = formatValue(val);
        return (
          <div key={key} className="flex items-start justify-between gap-3 text-sm border-b border-dashed border-gray-200 pb-1.5">
            <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold pt-0.5">{humanizeKey(key)}</span>
            <span className="text-gray-900 font-medium text-right">{display ?? '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── Verify QC split-screen modal ───────── */
function VerifyQcModal({ workorderId, slNo, onClose, onDone, readOnly = false }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [decision, setDecision] = useState(''); // 'approved' | 'rejected'
  const [qcNotes, setQcNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const json = await fetchQcDetail(workorderId, slNo);
        if (!cancelled) setDetail(json);
      } catch (err) {
        if (!cancelled) setLoadError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [workorderId, slNo]);

  const handleSubmit = async (result) => {
    if (result === 'rejected' && !qcNotes.trim()) {
      setSubmitError('A reason is required when rejecting a check.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitQcVerify(workorderId, slNo, {
        qcResult: result,
        qcNotes: qcNotes.trim(),
        verifiedBy: { name: 'QC Reviewer' },
      });
      onDone();
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{readOnly ? 'QC Report (Completed)' : 'Verify QC'}</h3>
            {detail && (
              <p className="text-xs text-gray-500">
                {detail.candidate.bgvRef} — {detail.candidate.fullName} — {detail.check.checkType}
                {detail.check.subType ? ` (${detail.check.subType})` : ''}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all">
            <FiX size={16} className="text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Loading check details…</div>
        ) : loadError ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <ErrorBanner message={loadError} />
          </div>
        ) : (
          <>
            {/* Split screen */}
            <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x" style={{ borderColor: '#e2e8f0' }}>
              {/* LEFT — Data Management side */}
              <div className="overflow-y-auto p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                    <IoDocumentTextOutline size={14} className="text-sky-600" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Data Management (Provided)</h4>
                </div>

                {detail.dataManagementSide.performedBy && (
                  <div className="mb-4 bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center gap-2">
                    <IoPersonOutline size={16} className="text-sky-600" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{detail.dataManagementSide.performedBy.name}</p>
                      <p className="text-[10px] text-gray-500">{detail.dataManagementSide.performedBy.email || 'Data entry executive'}</p>
                    </div>
                  </div>
                )}

                <DataBlock data={detail.dataManagementSide.structured} />

                {Array.isArray(detail.documents) && detail.documents.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Documents</p>
                    <div className="space-y-1.5">
                      {detail.documents.map((d) => (
                        <a key={d.id} href={d.url} target="_blank" rel="noreferrer" className="block text-xs text-sky-600 underline">
                          {d.documentType || d.originalName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Verifier side */}
              <div className="overflow-y-auto p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FiCheckCircle size={14} className="text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Verifier (Verified)</h4>
                </div>

                <DataBlock data={detail.verifierSide.verifier} />

                {detail.check.notes && (
                  <div className="mt-5 bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Verifier Notes</p>
                    <p className="text-xs text-gray-700">{detail.check.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer — QC decision (hidden in read-only / Completed view) */}
            {readOnly ? (
              <div className="px-6 py-4 border-t flex-shrink-0" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">QC Result</p>
                    <p className="text-sm font-bold" style={{ color: detail.check.qcResult === 'approved' ? '#16a34a' : '#ef4444' }}>
                      {detail.check.qcResult === 'approved' ? 'Approved' : 'Rejected'}
                    </p>
                  </div>
                  {detail.check.qcNotes && (
                    <div className="max-w-md text-right">
                      <p className="text-xs text-gray-500">QC Notes</p>
                      <p className="text-xs text-gray-700">{detail.check.qcNotes}</p>
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 border-t flex-shrink-0 space-y-3" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
                <ErrorBanner message={submitError} />
                <textarea
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                  placeholder="QC notes (required if rejecting)…"
                  rows={2}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-[#00d4aa] resize-none transition-all"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setDecision('rejected'); handleSubmit('rejected'); }}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    <FiXCircle size={15} /> {submitting && decision === 'rejected' ? 'Rejecting…' : 'Reject'}
                  </button>
                  <button
                    onClick={() => { setDecision('approved'); handleSubmit('approved'); }}
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#00b494] hover:bg-[#009e82] rounded-xl text-sm font-semibold text-black flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <FiCheck size={15} /> {submitting && decision === 'approved' ? 'Approving…' : 'Approve & Move to Report'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function QCMemberScreen() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'completed'

  const [employees, setEmployees] = useState([]);
  const [checkTypes, setCheckTypes] = useState([]);

  // Filters — employee is optional ("All QC members" by default).
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [checkTypeFilter, setCheckTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeCheck, setActiveCheck] = useState(null); // { workorderId, slNo }

  useEffect(() => {
    fetchEmployeesList().then((json) => setEmployees(json?.employees || [])).catch(() => {});
    api.get('/verifications/checktypes').then((res) => setCheckTypes(res.data?.checkTypes || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        assignedToId: employeeFilter || undefined,
        checkTypeId: checkTypeFilter || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        search,
      };
      const json = activeTab === 'assigned'
        ? await fetchMemberQueue(params)
        : await fetchMemberCompleted(params);
      setRows(json.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, employeeFilter, checkTypeFilter, dateFrom, dateTo, search]);

  useEffect(() => { load(); }, [load]);

  const employeeOptions = useMemo(() => ([
    { value: '', label: 'All QC Members' },
    ...employees.map((e) => ({ value: e._id, label: e.fullName || e.name || e.email || 'Unnamed' })),
  ]), [employees]);

  const checkTypeOptions = useMemo(() => ([
    { value: '', label: 'All Verification Types' },
    ...checkTypes.map((c) => ({ value: c._id, label: c.name })),
  ]), [checkTypes]);

  return (
    <div className="min-h-screen" style={{ background: '#f8fefd' }}>
      <Header showNavigation={false} />

      <div className="max-w-[1300px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header row with Back button */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white border border-gray-200">
            <FiArrowLeft size={16} className="text-gray-500" />
          </button>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#d1fae5' }}>
            <FiLayers size={16} className="text-[#059669]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>
              QC Member Queue
            </h1>
            <p className="text-xs text-gray-500">
              {rows.length} check{rows.length !== 1 ? 's' : ''} {activeTab === 'assigned' ? 'awaiting QC review' : 'completed by QC'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 border-b border-gray-200">
          {[
            { key: 'assigned', label: 'Assigned' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px"
              style={{
                borderColor: activeTab === tab.key ? '#059669' : 'transparent',
                color: activeTab === tab.key ? '#059669' : '#64748b',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#64748b' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name or BGV ref..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900"
            />
          </div>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 outline-none text-gray-900"
          >
            {employeeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select
            value={checkTypeFilter}
            onChange={(e) => setCheckTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 outline-none text-gray-900"
          >
            {checkTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 outline-none text-gray-900"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 outline-none text-gray-900"
          />
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">BGV Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Check Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">QC Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{activeTab === 'assigned' ? 'Assigned' : 'Completed'}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">
                  {activeTab === 'assigned' ? 'No checks awaiting QC review.' : 'No completed QC records yet.'}
                </td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.workorderId}-${row.checkSlNo}`} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: '#e2e8f0' }}>
                    <td className="px-4 py-3 text-gray-600">{row.bgvRef}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.client}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.checkType}{row.subType ? ` — ${row.subType}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs font-medium">{row.qcAssignedTo || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {(activeTab === 'assigned' ? row.qcAssignedAt : row.qcCompletedAt)
                        ? new Date(activeTab === 'assigned' ? row.qcAssignedAt : row.qcCompletedAt).toLocaleString('en-GB')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {activeTab === 'assigned' ? (
                        <button
                          onClick={() => setActiveCheck({ workorderId: row.workorderId, slNo: row.checkSlNo })}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-black"
                          style={{ background: '#0ea5e9' }}
                        >
                          <FiCheckCircle size={13} /> Verify QC
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveCheck({ workorderId: row.workorderId, slNo: row.checkSlNo, readOnly: true })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}
                        >
                          <FiEye size={13} /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeCheck && (
        <VerifyQcModal
          workorderId={activeCheck.workorderId}
          slNo={activeCheck.slNo}
          readOnly={!!activeCheck.readOnly}
          onClose={() => setActiveCheck(null)}
          onDone={() => { setActiveCheck(null); load(); }}
        />
      )}
    </div>
  );
}