/* ============================================================
   src/employee-screens/verification-split.jsx

   Two distinct modes, same component:

   1. PER-CHECK-TYPE MODE  ->  /verifications/:checkTypeId/:stage
      4 in-page tabs, all SCOPED to this one check type:
        - Assignment Pending
        - Verification Pending
        - Overall Verification  (assignment + verification + completed,
                                  but ONLY for this check type — not all)
        - Completed Verifications  (NEW — only fully-verified checks
                                  that have not yet been moved to QC;
                                  each row has a "Move to QC" action)

   2. GLOBAL MODE  ->  /verifications-overall  (no checkTypeId param)
      A single "All Verifications" view across every check type, with
      filters for Verification Type, Assigned User, and Status.

   The component detects which mode it's in purely from whether
   :checkTypeId is present in the URL.

   ASSIGNED TO DISPLAY:
   The backend (verificationRoutes.js) resolves assignedToName per row
   by preferring the check-level assignment (set via this screen's own
   Assign modal -> /verifications/assign) and falling back to the
   workorder-level assignedTo (set by the separate EmployeeAssignment
   screen -> /workorder-assignment). Either path lands in
   row.assignedToName here — so this screen just needs to render it,
   with a clear "Unassigned" badge when it's empty.

   ROW ACTIONS BY STATUS:
     - Unassigned, not terminal        -> "Assign" button (opens AssignModal)
     - Assigned, not terminal          -> "Verify Now" button (opens the
                                           check-type-specific verifier form)
     - Terminal (completed/discrepancy/
       insufficient)                   -> "View / Edit" button (re-opens the
                                           SAME verifier form — those screens
                                           already reload whatever was saved
                                           in check.verifier regardless of
                                           status, so this is just a matter
                                           of wiring up the navigation here)
     - Completed Verifications tab     -> "Move to QC" button (moves the
                                           check into the QC pipeline — see
                                           routes/qcRoutes.js + the QC
                                           Assignment Team / QC Member /
                                           Report screens)

   BACK NAVIGATION:
   The arrow button at top-left (navigate(-1)) is the "back" control for
   this module, consistent with QCAssignmentTeam.jsx, QCMemberScreen.jsx
   and ReportScreen.jsx.
   ============================================================ */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiSearch, FiUserCheck, FiCheckCircle, FiClock,
  FiChevronLeft, FiChevronRight, FiX, FiAlertTriangle, FiLoader,
  FiLayers, FiFilter, FiEye, FiArchive, FiUploadCloud, FiRefreshCcw, FiFileText,
} from 'react-icons/fi';
import {
  IoPersonOutline, IoBusinessOutline, IoShieldCheckmarkOutline,
  IoDocumentTextOutline, IoTimeOutline, IoCheckmarkOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { getCheckTypeVisual } from '../config/verificationPalette';
import theme from '../theme/theme';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

const PAGE_SIZE = 20;

// Statuses that mean "this check is done" — no more Assign/Verify actions,
// only View/Edit. Kept as a single source of truth so the pill, the action
// column, and the row-click handler all agree on what "terminal" means.
const TERMINAL_STATUSES = ['completed', 'verified', 'discrepancy', 'insufficient'];

/* ───────── API helpers ───────── */

async function fetchQueue({ checkTypeId, stage, page, search, assignedToId }) {
  const res = await api.get(`/verifications/${checkTypeId}/${stage}`, {
    params: { page, limit: PAGE_SIZE, search, assignedToId },
  });
  return res.data;
}

async function fetchOverall({ page, search, checkTypeId, assignedToId, status }) {
  const res = await api.get('/verifications/overall', {
    params: { page, limit: PAGE_SIZE, search, checkTypeId, assignedToId, status },
  });
  return res.data;
}

async function fetchCheckTypeInfo(checkTypeId) {
  const res = await api.get(`/checktypes/${checkTypeId}`);
  return res.data;
}

async function fetchAllCheckTypes() {
  const res = await api.get('/verifications/checktypes');
  return res.data;
}

async function fetchEmployeesList() {
  const res = await api.get('/employees');
  return res.data;
}

async function assignCheck(payload) {
  const res = await api.post('/verifications/assign', payload);
  return res.data;
}

async function completeCheck(payload) {
  const res = await api.post('/verifications/complete', payload);
  return res.data;
}

// NEW — Completed Verifications tab (only checks not yet in the QC
// pipeline) and the Move-to-QC action. Backed by routes/qcRoutes.js.
async function fetchCompletedForQC({ checkTypeId, search }) {
  const res = await api.get('/qc/completed/list', { params: { checkTypeId, search } });
  return res.data;
}

async function moveCheckToQC({ workorderId, checkSlNo, movedBy }) {
  const res = await api.put(`/qc/${workorderId}/checks/${checkSlNo}/move-to-qc`, { movedBy });
  return res.data;
}

// NEW — downloads the prefilled Residential Address Verification Form
// (.docx) for a field executive to carry into the visit. Only meaningful
// for address/criminal/identity-type checks (routes/addressFormRoutes.js
// generates a generic key/value doc otherwise — see WIRING_NOTES.md).
async function downloadAddressForm(workorderId, checkSlNo, fileHint) {
  const res = await api.get(`/address-form/${workorderId}/checks/${checkSlNo}/docx`, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${fileHint || 'AddressVerificationForm'}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

function isAddressLikeCheckType(checkType) {
  const t = (checkType || '').toLowerCase();
  return t.includes('address') || t.includes('criminal') || t.includes('identity');
}

// NEW — QC Request tab: checks a QC reviewer sent back for rework.
async function fetchQcRejected({ checkTypeId, search }) {
  const res = await api.get('/qc/rejected/list', { params: { checkTypeId, search } });
  return res.data;
}

/* ───────── Status pill ───────── */
function StatusPill({ status }) {
  const map = {
    pending: { bg: 'rgba(148,163,184,0.15)', color: '#475569', label: 'Pending' },
    'assignment-pending': { bg: 'rgba(148,163,184,0.15)', color: '#475569', label: 'Pending' },
    assigned: { bg: 'rgba(6,182,212,0.15)', color: '#0891b2', label: 'Assigned' },
    'in-progress': { bg: 'rgba(6,182,212,0.15)', color: '#0891b2', label: 'Assigned' },
    completed: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Completed' },
    verified: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Completed' },
    report: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Completed' },
    discrepancy: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Discrepancy' },
    insufficient: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Insufficient' },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

/* ───────── Assigned To badge ───────── */
function AssignedToBadge({ name }) {
  if (name && name.trim()) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
        {name}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-700">
      <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
      Unassigned
    </span>
  );
}

/* ───────── Error banner ───────── */
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
      <IoAlertCircleOutline size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
      <span className="text-xs text-red-700">{message}</span>
    </div>
  );
}

/* ───────── Tab bar (per-check-type mode only) ───────── */
function TabBar({ activeTab, onChange }) {
  const tabs = [
    { key: 'assignment', label: 'Assignment Pending', icon: FiUserCheck },
    { key: 'verification', label: 'Verification Pending', icon: FiCheckCircle },
    { key: 'overall', label: 'Overall Verification', icon: FiLayers },
    { key: 'completed', label: 'Completed Verifications', icon: FiArchive },
    { key: 'qcRequest', label: 'QC Request', icon: FiRefreshCcw },
  ];

  return (
    <div className="flex items-center gap-2 mb-5 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px whitespace-nowrap"
            style={{
              borderColor: isActive ? '#0ea5e9' : 'transparent',
              color: isActive ? '#0ea5e9' : '#64748b',
            }}
          >
            <Icon size={14} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── Assign Modal ───────── */
function AssignModal({ row, checkTypeName, onClose, onSubmit, submitting, errorMessage }) {
  const [assignType, setAssignType] = useState('internal');
  const [executive, setExecutive] = useState('');
  const [notes, setNotes] = useState('');
  const [slaDays, setSlaDays] = useState(7);

  const [employees, setEmployees] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      setLoadError('');
      try {
        if (assignType === 'internal') {
          if (employees.length === 0) {
            const res = await api.get('/employees');
            setEmployees(res.data?.employees || []);
          }
        } else {
          if (vendors.length === 0) {
            const res = await api.get('/vendors');
            setVendors(res.data?.vendors || []);
          }
        }
      } catch (err) {
        console.error('Failed to load assignment options:', err);
        setLoadError('Failed to load list. Please try again.');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignType]);

  const executiveOptions = [
    { value: '', label: '— Select Internal Executive —' },
    ...employees.map((e) => ({
      value: e._id,
      label: `${e.fullName || e.name || e.employeeName || 'Unnamed'}${e.department ? ` - ${e.department}` : ''}`,
    })),
  ];

  const vendorOptions = [
    { value: '', label: '— Select External Vendor —' },
    ...vendors.map((v) => ({
      value: v._id,
      label: v.companyName || v.vendorName || v.name || 'Unnamed Vendor',
    })),
  ];

  const currentOptions = assignType === 'internal' ? executiveOptions : vendorOptions;

  const slaDate = new Date();
  slaDate.setDate(slaDate.getDate() + Number(slaDays || 0));
  const slaFormatted = slaDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleSubmit = () => {
    if (!executive) return;
    const selected = (assignType === 'internal' ? employees : vendors).find((o) => o._id === executive);
    const assignedToName = assignType === 'internal'
      ? (selected?.fullName || selected?.name || selected?.employeeName || 'Unnamed')
      : (selected?.companyName || selected?.vendorName || selected?.name || 'Unnamed Vendor');

    onSubmit({
      workorderId: row._id,
      checkSlNo: row.checkSlNo,
      assignmentType: assignType,
      assignedToId: executive,
      assignedToName,
      notes,
      slaDays,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div
        className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center">
              <IoPersonOutline size={20} className="text-[#a855f7]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Assign Check</h3>
              <p className="text-xs text-gray-500">Assign a verifier for {checkTypeName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all">
            <FiX size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          <ErrorBanner message={errorMessage || loadError} />

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-0">
              <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">Check Type</span>
              <span className="text-sm font-semibold truncate block text-gray-900">{checkTypeName}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-0">
              <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">Candidate</span>
              <span className="text-sm font-semibold truncate block text-gray-900" title={row.fullName}>{row.fullName}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-0">
              <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">BGV Ref</span>
              <span className="text-sm font-semibold truncate block text-gray-900">{row.bgvRef}</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 tracking-wider uppercase mb-2.5">
              <IoShieldCheckmarkOutline size={14} className="text-[#00d4aa]" />
              Assignment Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => { setAssignType('internal'); setExecutive(''); }}
                className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all ${assignType === 'internal' ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-[#00d4aa]' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
              >
                <IoPersonOutline size={18} />
                <span className="font-semibold text-sm">Internal Executive</span>
              </button>
              <button
                onClick={() => { setAssignType('external'); setExecutive(''); }}
                className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all ${assignType === 'external' ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-[#00d4aa]' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
              >
                <IoBusinessOutline size={18} />
                <span className="font-semibold text-sm">External Vendor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 tracking-wider uppercase mb-2.5">
              <IoPersonOutline size={14} className="text-[#a855f7]" />
              Select {assignType === 'internal' ? 'Internal Executive' : 'External Vendor'} <span className="text-red-500">*</span>
            </label>
            <select
              value={executive}
              onChange={(e) => setExecutive(e.target.value)}
              disabled={loadingOptions}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm outline-none focus:border-[#00d4aa] transition-all appearance-none disabled:opacity-50"
            >
              {currentOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 tracking-wider uppercase mb-2.5">
              <IoDocumentTextOutline size={14} className="text-[#3b82f6]" />
              Assignment Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions..."
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-[#00d4aa] resize-none transition-all"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 tracking-wider uppercase mb-3">
              <IoTimeOutline size={14} className="text-amber-500" />
              SLA Information
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-0.5">SLA (Days)</span>
                <input
                  type="number"
                  min={1}
                  value={slaDays}
                  onChange={(e) => setSlaDays(e.target.value)}
                  className="w-full bg-transparent text-lg font-bold text-amber-600 outline-none"
                />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-0.5">DEADLINE</span>
                <span className="text-sm font-bold text-gray-900">{slaFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-3 flex-shrink-0" style={{ borderColor: '#e2e8f0' }}>
          <button onClick={onClose} disabled={submitting} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingOptions || !executive}
            className="px-6 py-2.5 bg-[#00b494] hover:bg-[#009e82] rounded-xl text-sm font-semibold text-black flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /> : <IoCheckmarkOutline size={16} />}
            {submitting ? 'Assigning…' : 'Assign Check'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Complete Modal ───────── */
function CompleteModal({ row, onClose, onSubmit, submitting }) {
  const [result, setResult] = useState('verified');
  const [notes, setNotes] = useState('');

  const resultOptions = [
    { value: 'verified', label: 'Verified — OK', icon: FiCheckCircle, color: '#10b981' },
    { value: 'discrepant', label: 'Discrepancy Found', icon: FiAlertTriangle, color: '#ef4444' },
    { value: 'insufficient', label: 'Insufficient Info', icon: FiClock, color: '#f59e0b' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-5 sm:p-6"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
            Update Verification — {row.fullName}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {resultOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setResult(opt.value)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left"
              style={{
                border: `1px solid ${result === opt.value ? opt.color : '#e2e8f0'}`,
                background: result === opt.value ? `${opt.color}15` : 'transparent',
                color: '#111827',
              }}
            >
              <opt.icon size={16} style={{ color: opt.color }} />
              {opt.label}
            </button>
          ))}
        </div>

        <label className="block text-xs mb-1 text-gray-600">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full mb-4 px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-900 resize-none"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600">
            Cancel
          </button>
          <button
            disabled={submitting}
            onClick={() => onSubmit({ workorderId: row._id, checkSlNo: row.checkSlNo, result, notes, data: {} })}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 flex items-center gap-2 text-black"
            style={{ background: '#0ea5e9' }}
          >
            {submitting && <FiLoader className="animate-spin" size={14} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const STAGE_VALUES = ['assignment', 'verification'];

/* ───────── Main Screen ───────── */
export default function VerificationQueueScreen() {
  const { checkTypeId, stage } = useParams();
  const navigate = useNavigate();

  // GLOBAL mode = accessed via /verifications-overall (no :checkTypeId in the URL).
  // PER-CHECK-TYPE mode = accessed via /verifications/:checkTypeId/:stage.
  const globalMode = !checkTypeId;

  // activeTab: 'assignment' | 'verification' | 'overall' | 'completed'
  // Only the first two are reflected in the URL; 'overall' and 'completed'
  // are local view swaps that stay scoped to the SAME checkTypeId.
  const [activeTab, setActiveTab] = useState(STAGE_VALUES.includes(stage) ? stage : 'assignment');

  const [checkTypeInfo, setCheckTypeInfo] = useState(null);
  const [metaLoading, setMetaLoading] = useState(!globalMode);
  const [metaError, setMetaError] = useState('');

  const visual = getCheckTypeVisual(checkTypeId || '');

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [employeesList, setEmployeesList] = useState([]);
  const [assignedUserFilter, setAssignedUserFilter] = useState('all'); // 'all' | 'unassigned' | <employeeId>
  const [allCheckTypes, setAllCheckTypes] = useState([]);
  const [checkTypeFilter, setCheckTypeFilter] = useState('all'); // Global mode's Verification Type filter
  const [statusFilter, setStatusFilter] = useState('all'); // Global mode's Status filter

  const [activeRow, setActiveRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');

  // NEW — "Move to QC" per-row loading + error state, keyed by
  // `${workorderId}-${checkSlNo}` so multiple rows can be in flight.
  const [movingToQC, setMovingToQC] = useState({});
  const [qcError, setQcError] = useState('');

  // Keep activeTab in sync with the URL for the two route-based tabs
  // (e.g. browser back/forward). Not applicable in global mode.
  useEffect(() => {
    if (!globalMode && STAGE_VALUES.includes(stage)) setActiveTab(stage);
  }, [stage, globalMode]);

  // Load check type name (per-check-type mode only — global mode has no single name)
  useEffect(() => {
    if (globalMode || !checkTypeId) return;
    let cancelled = false;
    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError('');
      try {
        const json = await fetchCheckTypeInfo(checkTypeId);
        if (!cancelled) {
          if (json.success) setCheckTypeInfo(json.checkType);
          else setMetaError(json.message || 'Check type not found');
        }
      } catch (err) {
        if (!cancelled) setMetaError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    };
    loadMeta();
    return () => { cancelled = true; };
  }, [checkTypeId, globalMode]);

  // Employees (Assigned User filter — all modes) + all check types
  // (Verification Type filter — global mode only), fetched once.
  useEffect(() => {
    fetchEmployeesList().then((json) => setEmployeesList(json?.employees || [])).catch(() => {});
    fetchAllCheckTypes().then((json) => { if (json.success) setAllCheckTypes(json.checkTypes || []); }).catch(() => {});
  }, []);

  // Is the currently-visible table effectively an "overall" (mixed-status) list?
  //   - true in global mode always
  //   - true in per-check-type mode when the Overall tab is selected
  const isOverallView = globalMode || activeTab === 'overall';
  const isCompletedQCView = !globalMode && activeTab === 'completed';
  const isQcRequestView = !globalMode && activeTab === 'qcRequest';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let json;
      if (isCompletedQCView) {
        // NEW — Completed Verifications tab pulls from the QC-eligible
        // list (finished verification, not yet moved to QC).
        json = await fetchCompletedForQC({ checkTypeId, search });
        setRows(json.data || []);
        setTotal(json.total || 0);
        setLoading(false);
        return;
      }
      if (isQcRequestView) {
        // NEW — QC Request tab: checks a QC reviewer sent back for rework,
        // scoped to this check type.
        json = await fetchQcRejected({ checkTypeId, search });
        setRows(json.data || []);
        setTotal(json.total || 0);
        setLoading(false);
        return;
      }
      if (globalMode) {
        json = await fetchOverall({
          page, search,
          checkTypeId: checkTypeFilter,
          assignedToId: assignedUserFilter,
          status: statusFilter,
        });
      } else if (activeTab === 'overall') {
        json = await fetchOverall({
          page, search,
          checkTypeId,
          assignedToId: assignedUserFilter,
          status: 'all',
        });
      } else {
        json = await fetchQueue({
          checkTypeId, stage: activeTab, page, search,
          assignedToId: assignedUserFilter,
        });
      }
      setRows(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [globalMode, activeTab, checkTypeId, page, search, assignedUserFilter, checkTypeFilter, statusFilter, isCompletedQCView, isQcRequestView]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [activeTab, checkTypeId, search, assignedUserFilter, checkTypeFilter, statusFilter]);

  // Assignment/Verification tabs update the URL (so refresh/back-forward
  // keeps working); the Overall and Completed tabs are just local view
  // swaps — they stay scoped to the SAME checkTypeId already in the URL,
  // no navigation needed.
  const handleTabClick = (tab) => {
    if (tab === 'overall' || tab === 'completed' || tab === 'qcRequest') {
      setActiveTab(tab);
      return;
    }
    if (checkTypeId) navigate(`/verifications/${checkTypeId}/${tab}`);
    setActiveTab(tab);
  };

  if (!globalMode && !checkTypeId) {
    return (
      <div className="min-h-screen" style={{ background: '#f8fefd' }}>
        <Header showNavigation={false} />
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-600">Unknown verification route.</p>
        </div>
      </div>
    );
  }

  const handleAssign = async (payload) => {
    setSubmitting(true);
    setAssignError('');
    try {
      await assignCheck(payload);
      setActiveRow(null);
      load();
    } catch (err) {
      setAssignError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (payload) => {
    setSubmitting(true);
    try {
      await completeCheck(payload);
      setActiveRow(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // NEW — Move a fully-verified check into the QC pipeline.
  const handleMoveToQC = async (row) => {
    const key = `${row.workorderId}-${row.checkSlNo}`;
    setMovingToQC((prev) => ({ ...prev, [key]: true }));
    setQcError('');
    try {
      await moveCheckToQC({
        workorderId: row.workorderId,
        checkSlNo: row.checkSlNo,
        movedBy: { name: 'Employee Portal' },
      });
      load();
    } catch (err) {
      setQcError(err.response?.data?.message || err.message);
    } finally {
      setMovingToQC((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ====================== NAVIGATE TO FORM ======================
  // Used for both "Verify Now" (still-open checks) and "View / Edit"
  // (terminal-status checks) — it's the exact same verifier-forms route
  // either way, since those screens reload check.verifier from the
  // workorder on mount regardless of the check's current status.
  //
  // NEW check types (registered in backend/routes/forms/*.js) route to
  // ONE shared GenericCheckVerifier.jsx via /verifier-forms/generic/:formKey;
  // check types with an existing bespoke screen (education, employment,
  // address, identity, criminal, reference) keep their dedicated routes
  // unchanged. This list mirrors backend/routes/forms/index.js's configs —
  // adding form #21+ needs one entry here too (see WIRING_NOTES.md).
  const GENERIC_FORM_KEYWORDS = [
    ['aml', 'aml', 'sanction list', 'media & sanction', 'media and sanction'],
    ['bankruptcy', 'bankrupt', 'insolvency', 'bifrc'],
    ['bank-statement', 'bank statement'],
    ['car-quotation', 'car quotation', 'vehicle quotation'],
    ['civil-litigation', 'litigation'],
    ['company-criminal', 'company criminal', 'company background record'],
    ['court-check', 'court check', 'court record search', 'court | criminal'],
    ['driving-license', 'driving license', 'driving licence'],
    ['drug-panel-5', 'drug panel - 5', 'drug panel-5', 'drug panel 5', '5 panel drug'],
    ['drug-panel-10', 'drug panel - 10', 'drug panel-10', 'drug panel 10', '10 panel drug'],
    ['form16', 'form 16', 'form16'],
    ['form26as', '26as', 'dual employment'],
    ['global-sanctions', 'global database', 'global sanction'],
    ['indian-sanctions', 'indian database', 'indian sanction'],
    ['idbi-property', 'idbi', 'property verification annexure'],
  ];

  const navigateToVerificationForm = (row) => {
    const hay = `${row.checkType || ''} ${row.subType || ''}`.toLowerCase();

    // Longest matching keyword wins (mirrors the backend's
    // resolveFormConfig scoring), so more specific phrases beat shorter
    // generic ones when a check type could plausibly match more than one.
    let bestFormKey = null;
    let bestScore = 0;
    GENERIC_FORM_KEYWORDS.forEach(([formKey, ...keywords]) => {
      keywords.forEach((kw) => {
        if (hay.includes(kw) && kw.length > bestScore) {
          bestScore = kw.length;
          bestFormKey = formKey;
        }
      });
    });

    if (bestFormKey) {
      navigate(`/verifier-forms/generic/${bestFormKey}/${row._id}`);
      return;
    }

    const typeToSlug = (checkType) => {
      if (!checkType) return null;
      const normalized = checkType.toLowerCase();
      if (normalized.includes('education')) return 'education';
      if (normalized.includes('employment')) return 'employment';
      if (normalized.includes('address')) return 'address';
      if (normalized.includes('identity')) return 'identity';
      if (normalized.includes('criminal')) return 'criminal';
      if (normalized.includes('reference')) return 'reference';
      return normalized.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const slug = typeToSlug(row.checkType);

    if (slug) {
      navigate(`/verifier-forms/${slug}/${row._id}`);
    } else {
      alert(`Verification form for "${row.checkType}" is not configured yet.`);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayName = globalMode
    ? 'All Verifications'
    : (metaLoading ? 'Loading…' : (checkTypeInfo?.name || 'Check Type'));

  const employeeFilterOptions = useMemo(() => ([
    { value: 'all', label: 'All Assigned Users' },
    { value: 'unassigned', label: 'Unassigned' },
    ...employeesList.map((e) => ({ value: e._id, label: e.fullName || e.name || 'Unnamed' })),
  ]), [employeesList]);

  const checkTypeFilterOptions = useMemo(() => ([
    { value: 'all', label: 'All Verification Types' },
    ...allCheckTypes.map((c) => ({ value: c._id, label: c.name })),
  ]), [allCheckTypes]);

  const statusFilterOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'assignment', label: 'Assignment Pending' },
    { value: 'verification', label: 'Verification Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  const tabLabel = {
    assignment: 'Assignment Pending',
    verification: 'Verification Pending',
    overall: 'Overall Verification',
    completed: 'Completed Verifications',
    qcRequest: 'QC Request',
  }[activeTab] || 'Overall Verification';

  return (
    <div className="min-h-screen" style={{ background: '#f8fefd' }}>
      <Header showNavigation={false} />

      <div className="max-w-[1300px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header row — Back button lives here for this module */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white border border-gray-200"
            title="Back"
          >
            <FiArrowLeft size={16} className="text-gray-500" />
          </button>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: globalMode ? '#e0f2fe' : `${visual.color}20` }}
          >
            {globalMode ? (
              <FiLayers size={16} className="text-[#0ea5e9]" />
            ) : (
              <visual.icon size={16} style={{ color: visual.color }} />
            )}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>
              {displayName}
              {!globalMode && ` — ${tabLabel}`}
            </h1>
            <p className="text-xs text-gray-500">{total} record{total !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Tabs — per-check-type mode only */}
        {!globalMode && <TabBar activeTab={activeTab} onChange={handleTabClick} />}

        {metaError && !globalMode && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {metaError}
          </div>
        )}

        {isCompletedQCView && (
          <div className="mb-4 px-4 py-3 rounded-lg text-xs bg-sky-50 text-sky-700 border border-sky-200">
            These checks have finished verification. Use <strong>Move to QC</strong> to send a check into the
            QC Assignment Team queue.
          </div>
        )}
        {isQcRequestView && (
          <div className="mb-4 px-4 py-3 rounded-lg text-xs bg-amber-50 text-amber-700 border border-amber-200">
            QC sent these checks back for rework. Click <strong>Verify</strong> to reopen the verifier form —
            once resubmitted, the check goes through the exact same Completed → Move to QC → QC Assignment flow
            as any other check.
          </div>
        )}

        {/* Filters row */}
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

          {/* Assigned User filter — hidden on the Completed Verifications tab
              since it isn't part of the QC-eligible endpoint's filters */}
          {!isCompletedQCView && !isQcRequestView && (
            <div className="flex items-center gap-2">
              <FiFilter size={14} style={{ color: '#64748b' }} />
              <select
                value={assignedUserFilter}
                onChange={(e) => setAssignedUserFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 outline-none text-gray-900"
              >
                {employeeFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Global-mode-only filters: Verification Type + Status */}
          {globalMode && (
            <>
              <select
                value={checkTypeFilter}
                onChange={(e) => setCheckTypeFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 outline-none text-gray-900"
              >
                {checkTypeFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 outline-none text-gray-900"
              >
                {statusFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}
        {isCompletedQCView && qcError && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {qcError}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">BGV Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Candidate</th>
                {(globalMode || isCompletedQCView || isQcRequestView) && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Verification Type</th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Sub Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                {isQcRequestView && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">QC Remarks</th>
                )}
                {!isCompletedQCView && !isQcRequestView && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Assigned To</th>
                )}
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Nothing found here.</td></tr>
              ) : isQcRequestView ? (
                // ---- QC Request tab: rejected checks + Verify (reopens the
                //      same verifier form used by every other tab) ----
                rows.map((row) => {
                  const rowVisual = getCheckTypeVisual(row.checkTypeId || '');
                  const key = `${row.workorderId}-${row.checkSlNo}`;

                  return (
                    <tr key={key} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: '#e2e8f0' }}>
                      <td className="px-4 py-3 text-gray-600">{row.bgvRef}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.fullName}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: `${rowVisual.color}15`, color: rowVisual.color }}
                        >
                          <rowVisual.icon size={12} />
                          {row.checkType || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.subType || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold" style={{ background: 'rgba(245,158,11,0.15)', color: '#d97706' }}>
                          QC Rejected
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[260px]">
                        <span className="text-xs">{row.qcRejectionReason || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigateToVerificationForm(row)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-black"
                          style={{ background: '#0ea5e9' }}
                        >
                          <FiCheckCircle size={13} /> Verify
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : isCompletedQCView ? (
                // ---- Completed Verifications tab: simplified row + Move to QC ----
                rows.map((row) => {
                  const rowVisual = getCheckTypeVisual(row.checkTypeId || '');
                  const key = `${row.workorderId}-${row.checkSlNo}`;
                  const isMoving = !!movingToQC[key];

                  return (
                    <tr key={key} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: '#e2e8f0' }}>
                      <td className="px-4 py-3 text-gray-600">{row.bgvRef}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.fullName}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: `${rowVisual.color}15`, color: rowVisual.color }}
                        >
                          <rowVisual.icon size={12} />
                          {row.checkType || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.subType || '—'}</td>
                      <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleMoveToQC(row)}
                          disabled={isMoving}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                          style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.3)' }}
                          title="Move to QC"
                        >
                          {isMoving ? <FiLoader className="animate-spin" size={13} /> : <FiUploadCloud size={13} />}
                          {isMoving ? 'Moving…' : 'Move to QC'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                rows.map((row) => {
                  const rowVisual = getCheckTypeVisual(row.checkTypeId || '');

                  const isTerminal = TERMINAL_STATUSES.includes(row.status);
                  const isAssigned = !!(row.assignedToName && row.assignedToName.trim());
                  const canAssign = !isAssigned && !isTerminal;
                  const canVerify = isAssigned && !isTerminal;
                  // Terminal checks (completed / discrepancy / insufficient)
                  // get a View/Edit action instead of Assign or Verify Now.
                  const canView = isTerminal;

                  const rowIsClickable = canVerify || canView;

                  return (
                    <tr
                        key={`${row._id}-${row.checkSlNo}`}
                        className={`border-t hover:bg-gray-50 transition-colors ${rowIsClickable ? 'cursor-pointer' : ''}`}
                        style={{ borderColor: '#e2e8f0' }}
                        onClick={() => rowIsClickable && navigateToVerificationForm(row)}
                      >
                      <td className="px-4 py-3 text-gray-600">{row.bgvRef}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.fullName}</td>
                      {globalMode && (
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ background: `${rowVisual.color}15`, color: rowVisual.color }}
                          >
                            <rowVisual.icon size={12} />
                            {row.checkType || '—'}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-600">{row.subType || '—'}</td>
                      <td className="px-4 py-3"><StatusPill status={row.status} /></td>

                      <td className="px-4 py-3">
                        <AssignedToBadge name={row.assignedToName} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                        {isAddressLikeCheckType(row.checkType) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAddressForm(row._id, row.checkSlNo, `${row.bgvRef}_${row.fullName}_AddressForm`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(100,116,139,0.12)', color: '#334155', border: '1px solid rgba(100,116,139,0.25)' }}
                            title="Download the field visit form for this check"
                          >
                            <FiFileText size={13} /> Form
                          </button>
                        )}
                        {canAssign && (
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setActiveRow(row); 
                              setAssignError(''); 
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: `${rowVisual.color}15`, color: rowVisual.color }}
                          >
                            <FiUserCheck size={13} /> Assign
                          </button>
                        )}

                        {canVerify && (
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              navigateToVerificationForm(row); 
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-black"
                            style={{ 
                              background: '#0ea5e9', 
                              fontWeight: 600 
                            }}
                          >
                            <FiCheckCircle size={13} /> Verify Now
                          </button>
                        )}

                        {canView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToVerificationForm(row);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold"
                            style={{
                              background: 'rgba(100,116,139,0.12)',
                              color: '#334155',
                              border: '1px solid rgba(100,116,139,0.25)',
                            }}
                            title="Review or amend the submitted verification"
                          >
                            <FiEye size={13} /> View / Edit
                          </button>
                        )}

                        {!canAssign && !canVerify && !canView && !isAddressLikeCheckType(row.checkType) && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — not shown on the Completed Verifications tab, which
            returns its full QC-eligible list unpaginated */}
        {!isCompletedQCView && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
            >
              <FiChevronLeft size={14} className="text-gray-500" />
            </button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
            >
              <FiChevronRight size={14} className="text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {activeRow && (activeRow.status === 'pending') && (
        <AssignModal
          row={activeRow}
          checkTypeName={globalMode ? (activeRow.checkType || 'Check') : displayName}
          onClose={() => setActiveRow(null)}
          onSubmit={handleAssign}
          submitting={submitting}
          errorMessage={assignError}
        />
      )}
      {activeRow && (activeRow.status === 'assigned' || activeRow.status === 'in-progress') && (
        <CompleteModal
          row={activeRow}
          onClose={() => setActiveRow(null)}
          onSubmit={handleComplete}
          submitting={submitting}
        />
      )}
    </div>
  );
}
