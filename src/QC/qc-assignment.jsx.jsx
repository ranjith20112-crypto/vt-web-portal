/* ============================================================
   src/employee-screens/QCAssignmentTeam.jsx

   Lists every check that has been moved to QC (qcStatus === 'pending')
   and lets an admin assign it to a QC member (internal employee or
   external vendor). Once assigned, the check disappears from this
   screen and shows up in that member's QCMemberScreen.jsx queue.
   ============================================================ */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiSearch, FiUserCheck, FiX, FiLayers,
} from 'react-icons/fi';
import { IoPersonOutline, IoBusinessOutline, IoCheckmarkOutline, IoDocumentTextOutline } from 'react-icons/io5';
import theme from '../theme/theme';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

async function fetchQcAssignmentList(status, search) {
  const res = await api.get('/qc/assignment/list', { params: { status, search } });
  return res.data;
}

async function fetchAssignees() {
  const res = await api.get('/qc/assignment/assignees');
  return res.data;
}

async function assignQc(payload) {
  const res = await api.post('/qc/assignment/assign', payload);
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

/* ───────── Assign QC Modal ───────── */
function AssignQcModal({ row, onClose, onSubmit, submitting, errorMessage, internal, external }) {
  const [assignType, setAssignType] = useState('internal');
  const [executive, setExecutive] = useState('');
  const [notes, setNotes] = useState('');

  const options = assignType === 'internal' ? internal : external;
  const currentOptions = [
    { id: '', name: assignType === 'internal' ? '— Select QC Executive —' : '— Select QC Vendor —', email: '' },
    ...options,
  ];

  const handleSubmit = () => {
    if (!executive) return;
    const selected = options.find((o) => o.id === executive);
    onSubmit({
      workorderId: row.workorderId,
      checkSlNo: row.checkSlNo,
      assignedToId: executive,
      assignedToName: selected?.name || '',
      assignedToEmail: selected?.email || '',
      assignmentType: assignType,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div className="w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center">
              <IoPersonOutline size={20} className="text-[#a855f7]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Assign to QC</h3>
              <p className="text-xs text-gray-500">{row.checkType} — {row.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all">
            <FiX size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          <ErrorBanner message={errorMessage} />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">BGV Ref</span>
              <span className="text-sm font-semibold text-gray-900">{row.bgvRef}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">Client</span>
              <span className="text-sm font-semibold text-gray-900">{row.client}</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 tracking-wider uppercase mb-2.5">
              QC Assignment Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => { setAssignType('internal'); setExecutive(''); }}
                className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all ${assignType === 'internal' ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-[#00d4aa]' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
              >
                <IoPersonOutline size={18} />
                <span className="font-semibold text-sm">Internal QC Executive</span>
              </button>
              <button
                onClick={() => { setAssignType('external'); setExecutive(''); }}
                className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all ${assignType === 'external' ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-[#00d4aa]' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
              >
                <IoBusinessOutline size={18} />
                <span className="font-semibold text-sm">External QC Vendor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 tracking-wider uppercase mb-2.5">
              Select {assignType === 'internal' ? 'QC Executive' : 'QC Vendor'} <span className="text-red-500">*</span>
            </label>
            <select
              value={executive}
              onChange={(e) => setExecutive(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-sm outline-none focus:border-[#00d4aa] transition-all appearance-none"
            >
              {currentOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 tracking-wider uppercase mb-2.5">
              <IoDocumentTextOutline size={14} className="text-[#3b82f6]" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions for the QC reviewer..."
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-[#00d4aa] resize-none transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-3 flex-shrink-0" style={{ borderColor: '#e2e8f0' }}>
          <button onClick={onClose} disabled={submitting} className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !executive}
            className="px-6 py-2.5 bg-[#00b494] hover:bg-[#009e82] rounded-xl text-sm font-semibold text-black flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /> : <IoCheckmarkOutline size={16} />}
            {submitting ? 'Assigning…' : 'Assign to QC'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QCAssignmentTeam() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'assigned'
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [internal, setInternal] = useState([]);
  const [external, setExternal] = useState([]);

  const [activeRow, setActiveRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await fetchQcAssignmentList(activeTab, search);
      setRows(json.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetchAssignees()
      .then((json) => {
        setInternal(json.internal || []);
        setExternal(json.external || []);
      })
      .catch(() => {});
  }, []);

  const handleAssign = async (payload) => {
    setSubmitting(true);
    setAssignError('');
    try {
      await assignQc(payload);
      setActiveRow(null);
      load();
    } catch (err) {
      setAssignError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8fefd' }}>
      <Header showNavigation={false} />

      <div className="max-w-[1300px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header row with Back button */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white border border-gray-200">
            <FiArrowLeft size={16} className="text-gray-500" />
          </button>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ede9fe' }}>
            <FiLayers size={16} className="text-[#7c3aed]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>
              QC Assignment Team
            </h1>
            <p className="text-xs text-gray-500">
              {rows.length} check{rows.length !== 1 ? 's' : ''} {activeTab === 'pending' ? 'awaiting QC assignment' : 'already assigned to a QC member'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 border-b border-gray-200">
          {[
            { key: 'pending', label: 'Pending Assignment' },
            { key: 'assigned', label: 'Assigned' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px"
              style={{
                borderColor: activeTab === tab.key ? '#7c3aed' : 'transparent',
                color: activeTab === tab.key ? '#7c3aed' : '#64748b',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative mb-4 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#64748b' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name or BGV ref..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900"
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
                {activeTab === 'pending' ? (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Moved to QC</th>
                ) : (
                  <>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">QC Assigned To</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Assigned At</th>
                  </>
                )}
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">
                  {activeTab === 'pending' ? 'Nothing awaiting QC assignment.' : 'No checks currently assigned to QC.'}
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
                    {activeTab === 'pending' ? (
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {row.movedToQCAt ? new Date(row.movedToQCAt).toLocaleString('en-GB') : '—'}
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-gray-700 text-xs font-medium">{row.qcAssignedTo || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {row.qcAssignedAt ? new Date(row.qcAssignedAt).toLocaleString('en-GB') : '—'}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-right">
                      {activeTab === 'pending' ? (
                        <button
                          onClick={() => { setActiveRow(row); setAssignError(''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}
                        >
                          <FiUserCheck size={13} /> Assign QC
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">In QC member's queue</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeRow && (
        <AssignQcModal
          row={activeRow}
          onClose={() => setActiveRow(null)}
          onSubmit={handleAssign}
          submitting={submitting}
          errorMessage={assignError}
          internal={internal}
          external={external}
        />
      )}
    </div>
  );
}