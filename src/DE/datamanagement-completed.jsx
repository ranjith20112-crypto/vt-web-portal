// src/components/DataManagement2.jsx
//
// ============================================================================
// DATA MANAGEMENT — COMPLETED
// ----------------------------------------------------------------------
// Companion screen to DataManagement.jsx. Once a check's status reaches
// 'report' (Completed) on the active Data Management screen, it disappears
// from there and shows up HERE instead — a dedicated, uncluttered view of
// everything that's finished, with the exact same capabilities:
// - full View (read-only) / Edit toggle using the same dedicated
// CheckFormRouter forms (Address / Employment / Education / ...)
// - Reassign (in case a completed check needs to be handed to someone
// else for a correction / re-verification)
// - Save changes
// - "Reopen" — sends a completed check back into the active pipeline
// (status -> 'qc') if it turns out more work is needed. This is the
// one action that's different from the active screen (which instead
// has "Save & Mark Complete").
//
// Backend: identical routes to DataManagement.jsx (routes/dataManagementRoutes.js).
// This screen simply always requests status=report.
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
 IoArrowBackOutline,
 IoSearchOutline,
 IoRefreshOutline,
 IoPersonOutline,
 IoBusinessOutline,
 IoCheckmarkDoneOutline,
 IoCloseOutline,
 IoCheckmarkCircleOutline,
 IoEyeOutline,
 IoPencilOutline,
 IoPersonAddOutline,
 IoSaveOutline,
 IoRefreshCircleOutline,
 IoFlagOutline,
 IoChevronForward,
 IoMailOutline,
 IoTimeOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';
import { Field, SectionTitle } from '../DE/formcontrols';
import CheckFormRouter from '../DE/checkformrouter';

const STRUCTURED_KEY = '__structured';

const CHECK_STATUS_OPTIONS = ['assignment-pending', 'verification-pending', 'qc', 'report'];
const CHECK_STATUS_LABELS = {
 'assignment-pending': 'Assignment Pending',
 'verification-pending': 'Verification Pending',
 qc: 'QC',
 report: 'Completed',
};
const CHECK_STATUS_STYLES = {
 'assignment-pending': 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]',
 'verification-pending': 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]',
 qc: 'bg-[#EDE9FE] text-[#7C3AED] border-[#A78BFA]',
 report: 'bg-[#D1FAE5] text-[#10B981] border-[#34D399]',
};

const StatusBadge = ({ status }) => {
 const s = status || 'report';
 const cls = CHECK_STATUS_STYLES[s] || 'bg-gray-100 text-gray-600 border-gray-300';
 return (
 <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${cls}`}>
 {CHECK_STATUS_LABELS[s] || s}
 </span>
 );
};

const StatCard = ({ label, value, color }) => (
 <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
 <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">{label}</div>
 <div className="text-4xl font-bold mt-1" style={{ color }}>{value}</div>
 </div>
);

const formatDate = (d) => {
 if (!d) return '—';
 const date = new Date(d);
 if (isNaN(date)) return '—';
 const day = String(date.getDate()).padStart(2, '0');
 const month = date.toLocaleString('en-US', { month: 'short' });
 const year = date.getFullYear();
 const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
 return `${day}-${month}-${year} ${time}`;
};

const DataManagement2 = () => {
 const navigate = useNavigate();

 const [rows, setRows] = useState([]);
 const [stats, setStats] = useState({ total: 0 });
 const [loading, setLoading] = useState(true);

 const [searchQuery, setSearchQuery] = useState('');
 const [modeFilter, setModeFilter] = useState('all'); // all | Verifitech | Candidate

 const [assignees, setAssignees] = useState({ internal: [], external: [] });

 // ---- Assign / Reassign modal ----
 const [assignTarget, setAssignTarget] = useState(null);
 const [assignType, setAssignType] = useState('internal');
 const [assignPersonId, setAssignPersonId] = useState('');
 const [isAssigning, setIsAssigning] = useState(false);

 // ---- Detail modal (View / Edit / Reopen) ----
 const [activeRow, setActiveRow] = useState(null);
 const [activeWorkorder, setActiveWorkorder] = useState(null);
 const [activeCheck, setActiveCheck] = useState(null);
 const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit'
 const [structuredData, setStructuredData] = useState({});
 const [checkStatus, setCheckStatus] = useState('report');
 const [checkNotes, setCheckNotes] = useState('');
 const [isLoadingDetail, setIsLoadingDetail] = useState(false);
 const [isSavingDetail, setIsSavingDetail] = useState(false);

 const [notification, setNotification] = useState(null);
 const showNotification = (type, message) => {
 setNotification({ type, message });
 setTimeout(() => setNotification(null), 3200);
 };

 // ------------------------------------------------------------------
 // FETCH ROWS (completed checks list) — DO NOT put assignee code here
 // ------------------------------------------------------------------
 const fetchRows = useCallback(async () => {
 setLoading(true);
 try {
 const params = { status: 'report' };
 if (searchQuery) params.search = searchQuery;

 const res = await api.get('/data-management', { params });
 if (res.data.success) {
 let list = res.data.rows || [];
 if (modeFilter !== 'all') {
 list = list.filter((r) => r.initiationMode === modeFilter);
 }
 setRows(list);
 setStats({ total: list.length });
 }
 } catch (err) {
 console.error('Failed to load completed checks:', err);
 showNotification('error', 'Failed to load completed checks.');
 } finally {
 setLoading(false);
 }
 }, [searchQuery, modeFilter]);

 // ------------------------------------------------------------------
 // FETCH ASSIGNEES (employee/vendor dropdown) — separate function
 // ------------------------------------------------------------------
 const fetchAssignees = useCallback(async () => {
 try {
 const res = await api.get('/data-management/assignees/list');
 if (res.data.success) {
 setAssignees({ internal: res.data.internal || [], external: res.data.external || [] });
 } else {
 setAssignees({ internal: [], external: [] });
 }
 } catch (err) {
 console.error('Failed to load assignees:', err);
 setAssignees({ internal: [], external: [] });
 }
 }, []);
 useEffect(() => {
 fetchAssignees();
 }, [fetchAssignees]);

 useEffect(() => {
 const t = setTimeout(fetchRows, 250);
 return () => clearTimeout(t);
 }, [fetchRows]);

 // ------------------------------------------------------------------
 // ASSIGN / REASSIGN MODAL
 // ------------------------------------------------------------------
 const openAssign = (row) => {
 setAssignTarget(row);
 setAssignType(row.assignmentType || 'internal');
 setAssignPersonId(row.assignedToId || '');
 };
 const closeAssign = () => {
 if (isAssigning) return;
 setAssignTarget(null);
 };

 const currentAssignPool = assignType === 'internal' ? assignees.internal : assignees.external;

 const submitAssign = async () => {
 if (!assignTarget || !assignPersonId) {
 showNotification('error', 'Please select a person to assign.');
 return;
 }
 const person = currentAssignPool.find((p) => p.id === assignPersonId);
 if (!person) return;

 setIsAssigning(true);
 try {
 const res = await api.put(
 `/data-management/${assignTarget.workorderId}/checks/${assignTarget.slNo}/assign`,
 {
 assignedToId: person.id,
 assignedToName: person.name,
 assignedToEmail: person.email,
 assignmentType: assignType,
 }
 );
 if (res.data.success) {
 showNotification('success', `Reassigned to ${person.name}. Notification email sent.`);
 setAssignTarget(null);
 fetchRows();
 } else {
 showNotification('error', res.data.message || 'Failed to reassign.');
 }
 } catch (err) {
 showNotification('error', err.response?.data?.message || 'Failed to reassign.');
 } finally {
 setIsAssigning(false);
 }
 };

 // ------------------------------------------------------------------
 // DETAIL MODAL (View / Edit / Reopen)
 // ------------------------------------------------------------------
 const openDetail = async (row, mode) => {
 setActiveRow(row);
 setModalMode(mode);
 setIsLoadingDetail(true);
 try {
 const res = await api.get(`/data-management/${row.workorderId}`);
 if (res.data.success) {
 const wo = res.data.workorder;
 const check = (wo.checks || []).find((c) => String(c.slNo) === String(row.slNo));
 setActiveWorkorder(wo);
 setActiveCheck(check || null);
 setStructuredData((check?.data && check.data[STRUCTURED_KEY]) || {});
 setCheckStatus(check?.status || 'report');
 setCheckNotes(check?.notes || '');
 }
 } catch (err) {
 console.error('Failed to load workorder detail:', err);
 showNotification('error', 'Failed to load check detail.');
 } finally {
 setIsLoadingDetail(false);
 }
 };

 const closeDetail = () => {
 if (isSavingDetail) return;
 setActiveRow(null);
 setActiveWorkorder(null);
 setActiveCheck(null);
 };

 // Save changes in place — does NOT force status back to 'report'; whatever
 // is selected in the Status dropdown is what gets saved (so this same
 // action doubles as a manual status correction if needed).
 const saveDetail = async () => {
 if (!activeRow || !activeCheck) return;
 setIsSavingDetail(true);
 try {
 const mergedData = { ...(activeCheck.data || {}), [STRUCTURED_KEY]: structuredData };
 const res = await api.put(
 `/data-management/${activeRow.workorderId}/checks/${activeRow.slNo}/data`,
 { data: mergedData, status: checkStatus, notes: checkNotes }
 );
 if (!res.data.success) {
 showNotification('error', res.data.message || 'Failed to save.');
 return;
 }
 showNotification('success', 'Check updated successfully.');
 closeDetail();
 fetchRows();
 } catch (err) {
 showNotification('error', err.response?.data?.message || 'Failed to save check.');
 } finally {
 setIsSavingDetail(false);
 }
 };

 // Sends a completed check back into the active pipeline (Data Management
 // screen) at the 'qc' stage, in case it needs another pass before it's
 // truly done.
 const reopenCheck = async () => {
 if (!activeRow || !activeCheck) return;
 setIsSavingDetail(true);
 try {
 const res = await api.put(
 `/data-management/${activeRow.workorderId}/checks/${activeRow.slNo}/data`,
 { status: 'qc', notes: checkNotes }
 );
 if (!res.data.success) {
 showNotification('error', res.data.message || 'Failed to reopen check.');
 return;
 }
 showNotification('success', 'Check reopened — moved back to Data Management (QC stage).');
 closeDetail();
 fetchRows();
 } catch (err) {
 showNotification('error', err.response?.data?.message || 'Failed to reopen check.');
 } finally {
 setIsSavingDetail(false);
 }
 };

 const isReadOnly = modalMode === 'view';

 return (
 <div className="min-h-screen bg-[#f8fefd] text-gray-900 font-sans">
 <Header showNavigation={false} />

 {notification && (
 <div
 className={`fixed top-20 right-6 z-[130] px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-xl ${
 notification.type === 'success'
 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
 : 'bg-red-50 border-red-200 text-red-700'
 }`}
 >
 {notification.type === 'success' ? <IoCheckmarkCircleOutline size={22} /> : <IoCloseOutline size={22} />}
 <span>{notification.message}</span>
 </div>
 )}

 <main className="max-w-7xl mx-auto px-6 py-8">
 <div className="mb-6">
 <button
 onClick={() => navigate(-1)}
 className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 transition-all"
 >
 <IoArrowBackOutline size={18} />
 <span>Back</span>
 </button>
 </div>

 <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#00D4AA] rounded-2xl flex items-center justify-center">
 <IoCheckmarkDoneOutline size={28} className="text-white" />
 </div>
 <div>
 <h1 className="text-4xl font-bold tracking-tight text-gray-900">Data Management — Completed</h1>
 <p className="text-gray-600 mt-1">Every check that has finished verification, in one place</p>
 </div>
 </div>
 <button
 onClick={() => navigate('/data-management')}
 className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-[#00D4AA] rounded-2xl text-sm font-semibold text-gray-700 hover:text-[#00806E] transition-all shadow-sm"
 >
 <IoArrowBackOutline size={18} />
 Back to Active Data Management
 </button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
 <StatCard label="TOTAL COMPLETED" value={stats.total || 0} color="#10B981" />
 <StatCard
 label="VERIFITECH MODE"
 value={rows.filter((r) => r.initiationMode === 'Verifitech').length}
 color="#3B82F6"
 />
 <StatCard
 label="CANDIDATE MODE"
 value={rows.filter((r) => r.initiationMode === 'Candidate').length}
 color="#7C3AED"
 />
 </div>

 {/* Controls */}
 <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
 <div className="relative flex-1 max-w-md w-full">
 <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
 <IoSearchOutline size={20} />
 </div>
 <input
 type="text"
 placeholder="Search by BGV ID, candidate or client..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white border border-gray-300 focus:border-[#00D4AA] pl-12 py-3.5 rounded-2xl text-sm outline-none"
 />
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 {[
 { key: 'all', label: 'All Modes' },
 { key: 'Verifitech', label: 'Verifitech' },
 { key: 'Candidate', label: 'Candidate' },
 ].map((m) => (
 <button
 key={m.key}
 onClick={() => setModeFilter(m.key)}
 className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
 modeFilter === m.key
 ? 'bg-[#00D4AA] text-black border-[#00D4AA]'
 : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
 }`}
 >
 {m.label}
 </button>
 ))}
 <button
 onClick={fetchRows}
 className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600"
 title="Refresh"
 >
 <IoRefreshOutline size={18} />
 </button>
 </div>
 </div>

 {/* Table */}
 <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full min-w-[1150px]">
 <thead>
 <tr className="border-b border-gray-200 bg-gray-50">
 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Workorder</th>
 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</th>
 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Check</th>
 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Completed By</th>
 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Completed At</th>
 <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {loading ? (
 <tr>
 <td colSpan={8} className="py-16 text-center text-gray-500">Loading…</td>
 </tr>
 ) : rows.length === 0 ? (
 <tr>
 <td colSpan={8} className="py-16 text-center text-gray-500">No completed checks yet.</td>
 </tr>
 ) : (
 rows.map((row) => (
 <tr key={`${row.workorderId}-${row.slNo}`} className="hover:bg-gray-50 transition-colors">
 <td className="px-6 py-4">
 <span className="font-mono text-[#00D4AA] font-medium text-sm">{row.bgvRef}</span>
 </td>
 <td className="px-6 py-4">
 <div className="font-medium text-gray-900 text-sm">{row.candidateName}</div>
 <div className="text-xs text-gray-500">{row.client}</div>
 </td>
 <td className="px-6 py-4">
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
 {row.initiationMode === 'Verifitech' ? <IoBusinessOutline size={12} /> : <IoPersonOutline size={12} />}
 {row.initiationMode}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="text-sm text-gray-800 font-medium">{row.checkType}</div>
 {row.subType && <div className="text-xs text-gray-500 italic">{row.subType}</div>}
 </td>
 <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
 <td className="px-6 py-4">
 <div className="text-sm text-gray-800">{row.assignedTo || '—'}</div>
 <div className="text-[10px] text-gray-400 uppercase">{row.assignmentType || ''}</div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-1.5 text-xs text-gray-500">
 <IoTimeOutline size={13} /> {formatDate(row.completedAt)}
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-center gap-2">
 <button
 onClick={() => openAssign(row)}
 title="Reassign"
 className="p-2 hover:bg-gray-100 rounded-xl text-[#3B82F6] transition-all"
 >
 <IoPersonAddOutline size={19} />
 </button>
 <button
 onClick={() => openDetail(row, 'edit')}
 title="Edit"
 className="p-2 hover:bg-gray-100 rounded-xl text-[#00806E] transition-all"
 >
 <IoPencilOutline size={19} />
 </button>
 <button
 onClick={() => openDetail(row, 'view')}
 title="View"
 className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
 >
 <IoEyeOutline size={19} />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </main>

 {/* ================= ASSIGN / REASSIGN MODAL ================= */}
 {assignTarget && (
 <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeAssign}>
 <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
 <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">
 <div>
 <h3 className="text-lg font-bold text-gray-900">Reassign Check</h3>
 <p className="text-xs text-gray-500 font-mono">{assignTarget.bgvRef} — {assignTarget.checkType}{assignTarget.subType ? ` (${assignTarget.subType})` : ''}</p>
 </div>
 <button onClick={closeAssign} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500">
 <IoCloseOutline size={20} />
 </button>
 </div>

 <div className="p-7 space-y-5">
 <div>
 <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Assignment Type</label>
 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={() => { setAssignType('internal'); setAssignPersonId(''); }}
 className={`py-3 rounded-xl border text-sm font-semibold transition-all ${assignType === 'internal' ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00806E]' : 'border-gray-200 text-gray-500'}`}
 >
 Internal (Employee)
 </button>
 <button
 onClick={() => { setAssignType('external'); setAssignPersonId(''); }}
 className={`py-3 rounded-xl border text-sm font-semibold transition-all ${assignType === 'external' ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00806E]' : 'border-gray-200 text-gray-500'}`}
 >
 External (Vendor)
 </button>
 </div>
 </div>

 <div>
 <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
 {assignType === 'internal' ? 'Select Employee' : 'Select Vendor'}
 </label>
 <select
 value={assignPersonId}
 onChange={(e) => setAssignPersonId(e.target.value)}
 className="w-full bg-white border border-gray-300 focus:border-[#00D4AA] rounded-xl px-4 py-3 text-sm outline-none"
 >
 <option value="">— Select —</option>
 {currentAssignPool.map((p) => (
 <option key={p.id} value={p.id}>{p.name}{p.email ? ` (${p.email})` : ''}</option>
 ))}
 </select>
 {currentAssignPool.length === 0 && (
 <p className="text-xs text-amber-600 mt-1.5">No {assignType === 'internal' ? 'employees' : 'vendors'} found.</p>
 )}
 </div>

 <div className="flex items-start gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
 <IoMailOutline size={16} className="text-sky-600 mt-0.5 flex-shrink-0" />
 <p className="text-xs text-sky-700">The new assignee will automatically receive an email notification with a link to this check.</p>
 </div>
 </div>

 <div className="px-7 py-5 border-t border-gray-200 flex justify-end gap-3">
 <button onClick={closeAssign} disabled={isAssigning} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
 Cancel
 </button>
 <button
 onClick={submitAssign}
 disabled={isAssigning || !assignPersonId}
 className="px-6 py-2.5 bg-[#00D4AA] text-black rounded-xl font-semibold flex items-center gap-2 hover:bg-[#00C29A] disabled:opacity-50"
 >
 <IoPersonAddOutline size={18} />
 {isAssigning ? 'Reassigning...' : 'Reassign & Notify'}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ================= DETAIL MODAL (View / Edit / Reopen) ================= */}
 {activeRow && (
 <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={closeDetail}>
 <div
 className="bg-white border border-gray-200 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
 <div>
 <h3 className="text-xl font-bold text-gray-900 font-mono">{activeRow.bgvRef}</h3>
 <p className="text-sm text-gray-500">
 {activeRow.checkType}{activeRow.subType ? ` — ${activeRow.subType}` : ''} · {activeRow.candidateName}
 </p>
 </div>
 <div className="flex items-center gap-3">
 {isReadOnly ? (
 <button
 onClick={() => setModalMode('edit')}
 className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
 >
 <IoPencilOutline size={16} /> Edit
 </button>
 ) : (
 <button
 onClick={() => setModalMode('view')}
 className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
 >
 <IoEyeOutline size={16} /> View Only
 </button>
 )}
 <button onClick={closeDetail} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500">
 <IoCloseOutline size={22} />
 </button>
 </div>
 </div>

 <div className="px-8 py-6 overflow-y-auto flex-1">
 {isLoadingDetail ? (
 <div className="py-24 text-center text-gray-500">Loading check details…</div>
 ) : !activeCheck ? (
 <div className="py-24 text-center text-red-500">Check not found.</div>
 ) : (
 <div className="space-y-10">
 {/* Summary */}
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completed By</div>
 <div className="text-sm font-semibold text-gray-900">{activeCheck.assignedTo || '—'}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assignment Type</div>
 <div className="text-sm font-semibold text-gray-900 capitalize">{activeCheck.assignmentType || '—'}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Initiation Mode</div>
 <div className="text-sm font-semibold text-gray-900">{activeWorkorder?.initiationMode || '—'}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completed At</div>
 <div className="text-sm font-semibold text-gray-900">{formatDate(activeCheck.completedAt)}</div>
 </div>
 </div>

 {isReadOnly && (
 <div className="px-4 py-3 rounded-xl border border-sky-200 bg-sky-50 text-xs text-sky-700">
 Viewing in read-only mode. Click "Edit" above to make changes, or use "Reopen" to send this
 check back to active Data Management.
 </div>
 )}

 {/* Dedicated check form (Address / Employment / Education / ...) */}
 <fieldset disabled={isReadOnly} className={isReadOnly ? 'opacity-90 pointer-events-none select-text' : ''}>
 <CheckFormRouter
 checkType={activeCheck.checkType}
 subType={activeCheck.subType}
 data={structuredData}
 onDataChange={(next) => setStructuredData(next)}
 workorderId={activeRow.workorderId}
 slNo={activeRow.slNo}
 />
 </fieldset>

 {/* Status & notes */}
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
 <SectionTitle icon={IoFlagOutline} title="Status & Notes" />
 <div className="flex items-center gap-2 mb-6 flex-wrap">
 {CHECK_STATUS_OPTIONS.map((st, idx) => {
 const activeIdx = CHECK_STATUS_OPTIONS.indexOf(checkStatus);
 const done = idx <= activeIdx;
 return (
 <React.Fragment key={st}>
 <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${done ? 'bg-[#00D4AA] text-black border-[#00D4AA]' : 'bg-white text-gray-400 border-gray-300'}`}>
 {CHECK_STATUS_LABELS[st]}
 </span>
 {idx < CHECK_STATUS_OPTIONS.length - 1 && <IoChevronForward size={12} className="text-gray-300" />}
 </React.Fragment>
 );
 })}
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-xs font-bold text-gray-600 tracking-wider uppercase mb-2">Status</label>
 <select
 value={checkStatus}
 onChange={(e) => setCheckStatus(e.target.value)}
 disabled={isReadOnly}
 className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 disabled:opacity-50"
 >
 {CHECK_STATUS_OPTIONS.map((st) => (
 <option key={st} value={st}>{CHECK_STATUS_LABELS[st]}</option>
 ))}
 </select>
 </div>
 <div>
 <Field
 label="Notes / Remarks"
 name="notes"
 as="textarea"
 value={checkNotes}
 onChange={(e) => setCheckNotes(e.target.value)}
 disabled={isReadOnly}
 placeholder="Any observations or additional remarks..."
 />
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {!isReadOnly && activeCheck && (
 <div className="px-8 py-5 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
 <button onClick={closeDetail} disabled={isSavingDetail} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
 Cancel
 </button>
 <button
 onClick={reopenCheck}
 disabled={isSavingDetail}
 className="px-6 py-2.5 border border-amber-300 text-amber-700 rounded-xl font-semibold flex items-center gap-2 hover:bg-amber-50 disabled:opacity-50"
 >
 <IoRefreshCircleOutline size={18} /> {isSavingDetail ? 'Working...' : 'Reopen (send to QC)'}
 </button>
 <button
 onClick={saveDetail}
 disabled={isSavingDetail}
 className="px-6 py-2.5 bg-[#00D4AA] text-black rounded-xl font-semibold flex items-center gap-2 hover:bg-[#00C29A] disabled:opacity-50"
 >
 <IoSaveOutline size={18} /> {isSavingDetail ? 'Saving...' : 'Save Changes'}
 </button>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
};

export default DataManagement2;