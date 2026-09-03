/* ============================================================
   src/employee-screens/ReportScreen.jsx

   Final destination of the pipeline: every check that QC has approved
   (qcStatus === 'completed'). Read-only — reuses the exact same
   left/right split-screen layout as the QC Verify modal so reviewers
   and clients see identical data, just without the Approve/Reject
   controls.
   ============================================================ */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiEye, FiX, FiFileText, FiDownload, FiLoader, FiSend, FiMail, FiCheckCircle } from 'react-icons/fi';
import { IoPersonOutline, IoDocumentTextOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import theme from '../theme/theme';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

async function fetchReportList({ search, client, checkTypeId, from, to, finalized }) {
  const res = await api.get('/report/list', { params: { search, client, checkTypeId, from, to, finalized } });
  return res.data;
}

async function fetchCheckTypes() {
  const res = await api.get('/verifications/checktypes');
  return res.data;
}

async function finalizeReport(workorderId, slNo, payload) {
  const res = await api.post(`/report/${workorderId}/checks/${slNo}/finalize`, payload);
  return res.data;
}

async function fetchReportDetail(workorderId, slNo) {
  const res = await api.get(`/report/${workorderId}/checks/${slNo}`);
  return res.data;
}

// Downloads / opens the generated PDF for a single QC-approved check.
// Fetched as a blob (rather than a plain <a href>) so the api instance's
// auth headers / baseURL config are reused automatically.
async function downloadReportPdf(workorderId, slNo, fileHint) {
  const res = await api.get(`/report/${workorderId}/checks/${slNo}/pdf`, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${fileHint || 'Report'}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
      {message}
    </div>
  );
}

/* Same generic renderer used in QCMemberScreen.jsx, kept local here so
   this file has no cross-file coupling and can be dropped in standalone. */
function humanizeKey(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase()).trim();
}
function formatValue(val) {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) {
    if (val.length === 0) return '—';
    if (val.every((v) => typeof v !== 'object')) return val.join(', ');
    return null;
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

function ReportDetailModal({ workorderId, slNo, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const json = await fetchReportDetail(workorderId, slNo);
        if (!cancelled) setDetail(json);
      } catch (err) {
        if (!cancelled) setLoadError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [workorderId, slNo]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <IoCheckmarkCircleOutline className="text-emerald-500" /> Verification Report
            </h3>
            {detail && (
              <p className="text-xs text-gray-500">
                {detail.candidate.bgvRef} — {detail.candidate.fullName} — {detail.check.checkType}
                {detail.check.subType ? ` (${detail.check.subType})` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {detail && (
              <button
                onClick={() => downloadReportPdf(workorderId, slNo, `${detail.candidate.bgvRef}_${detail.candidate.fullName}_${detail.check.checkType}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }}
              >
                <FiDownload size={13} /> Download PDF
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all">
              <FiX size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Loading report…</div>
        ) : loadError ? (
          <div className="flex-1 flex items-center justify-center p-6"><ErrorBanner message={loadError} /></div>
        ) : (
          <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x" style={{ borderColor: '#e2e8f0' }}>
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
            </div>

            <div className="overflow-y-auto p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <IoCheckmarkCircleOutline size={14} className="text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Verifier (Verified)</h4>
              </div>
              <DataBlock data={detail.verifierSide.verifier} />

              {detail.check.qcNotes && (
                <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">QC Notes</p>
                  <p className="text-xs text-gray-700">{detail.check.qcNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── Finalize & Send to Client modal ───────── */
function FinalizeModal({ row, onClose, onDone }) {
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState(row.client || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!/^\S+@\S+\.\S+$/.test(clientEmail)) {
      setError('Enter a valid client email address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const json = await finalizeReport(row.workorderId, row.checkSlNo, {
        clientEmail: clientEmail.trim(),
        clientName: clientName.trim(),
        sentBy: { name: 'Report Screen' },
      });
      onDone(json);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
            <FiMail className="text-sky-500" /> Finalize &amp; Send to Client
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <FiX size={18} className="text-gray-500" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          {row.bgvRef} — {row.fullName} — {row.checkType}{row.subType ? ` (${row.subType})` : ''}
        </p>

        <ErrorBanner message={error} />

        <label className="block text-xs mb-1 text-gray-600 font-semibold">Client Name</label>
        <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-900"
        />

        <label className="block text-xs mb-1 text-gray-600 font-semibold">Client Email <span className="text-red-500">*</span></label>
        <input
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="client@company.com"
          className="w-full mb-4 px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-900"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={submitting} className="px-4 py-2 rounded-lg text-sm text-gray-600 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 flex items-center gap-2 text-black"
            style={{ background: '#0ea5e9' }}
          >
            {submitting ? <FiLoader className="animate-spin" size={14} /> : <FiSend size={14} />}
            {submitting ? 'Sending…' : 'Send to Client'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportScreen() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'finalized'

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [client, setClient] = useState('');
  const [checkTypeFilter, setCheckTypeFilter] = useState('');
  const [checkTypes, setCheckTypes] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeCheck, setActiveCheck] = useState(null);
  const [finalizeRow, setFinalizeRow] = useState(null);
  const [finalizeNotice, setFinalizeNotice] = useState(null); // { simulated, message }
  const [downloadingId, setDownloadingId] = useState('');
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    fetchCheckTypes().then((json) => setCheckTypes(json?.checkTypes || [])).catch(() => {});
  }, []);

  const checkTypeOptions = useMemo(() => ([
    { value: '', label: 'All Verification Types' },
    ...checkTypes.map((c) => ({ value: c._id, label: c.name })),
  ]), [checkTypes]);

  const handleDownload = async (row) => {
    const key = `${row.workorderId}-${row.checkSlNo}`;
    setDownloadingId(key);
    setDownloadError('');
    try {
      await downloadReportPdf(row.workorderId, row.checkSlNo, `${row.bgvRef}_${row.fullName}_${row.checkType}`);
    } catch (err) {
      setDownloadError(err.response?.data?.message || err.message);
    } finally {
      setDownloadingId('');
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await fetchReportList({
        search, client,
        checkTypeId: checkTypeFilter || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        finalized: activeTab === 'finalized' ? 'true' : undefined,
      });
      setRows(json.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, client, checkTypeFilter, dateFrom, dateTo, activeTab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen" style={{ background: '#f8fefd' }}>
      <Header showNavigation={false} />

      <div className="max-w-[1300px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header row with Back button */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white border border-gray-200">
            <FiArrowLeft size={16} className="text-gray-500" />
          </button>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#dcfce7' }}>
            <FiFileText size={16} className="text-[#16a34a]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>
              Report
            </h1>
            <p className="text-xs text-gray-500">{rows.length} {activeTab === 'finalized' ? 'finalized' : 'QC-approved'} record{rows.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 border-b border-gray-200">
          {[
            { key: 'all', label: 'All' },
            { key: 'finalized', label: 'Sent to Client (Finalized)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px"
              style={{
                borderColor: activeTab === tab.key ? '#16a34a' : 'transparent',
                color: activeTab === tab.key ? '#16a34a' : '#64748b',
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
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Filter by client..."
            className="px-4 py-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 min-w-[160px]"
          />
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
        {downloadError && <ErrorBanner message={downloadError} />}
        {finalizeNotice && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start justify-between gap-3"
            style={finalizeNotice.simulated
              ? { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }
              : { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
          >
            <span>{finalizeNotice.message}</span>
            <button onClick={() => setFinalizeNotice(null)} className="text-xs underline flex-shrink-0">Dismiss</button>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">BGV Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Check Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">QC Completed</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Delivery</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">No reports yet.</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.workorderId}-${row.checkSlNo}`} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: '#e2e8f0' }}>
                    <td className="px-4 py-3 text-gray-600">{row.bgvRef}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.client}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.checkType}{row.subType ? ` — ${row.subType}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {row.qcCompletedAt ? new Date(row.qcCompletedAt).toLocaleString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {row.reportFinalized ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                          <FiCheckCircle size={11} /> Sent{row.reportSentTo ? ` — ${row.reportSentTo}` : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not sent</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setActiveCheck({ workorderId: row.workorderId, slNo: row.checkSlNo })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}
                        >
                          <FiEye size={13} /> View Report
                        </button>
                        <button
                          onClick={() => handleDownload(row)}
                          disabled={downloadingId === `${row.workorderId}-${row.checkSlNo}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                          style={{ background: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }}
                          title="Download PDF"
                        >
                          {downloadingId === `${row.workorderId}-${row.checkSlNo}`
                            ? <FiLoader className="animate-spin" size={13} />
                            : <FiDownload size={13} />}
                          PDF
                        </button>
                        {!row.reportFinalized && activeTab === 'all' && (
                          <button
                            onClick={() => setFinalizeRow(row)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black"
                            style={{ background: '#0ea5e9' }}
                          >
                            <FiSend size={13} /> Finalize &amp; Send
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeCheck && (
        <ReportDetailModal
          workorderId={activeCheck.workorderId}
          slNo={activeCheck.slNo}
          onClose={() => setActiveCheck(null)}
        />
      )}

      {finalizeRow && (
        <FinalizeModal
          row={finalizeRow}
          onClose={() => setFinalizeRow(null)}
          onDone={(json) => {
            setFinalizeRow(null);
            setFinalizeNotice({ simulated: !!json?.simulated, message: json?.message || 'Report finalized.' });
            load();
          }}
        />
      )}
    </div>
  );
}