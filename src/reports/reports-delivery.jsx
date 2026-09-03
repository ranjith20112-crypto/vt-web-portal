/* ============================================================
   src/employee-screens/ReportDeliveryScreen.jsx

   Where a check lands once "Finalize & Send to Client" is clicked on the
   Report screen. Shows every delivered (or attempted) report with its
   delivery status, the client email it was sent to, and when — plus
   filters for verification type, client, and date range, and a Resend
   action for anything that failed (or just needs re-sending).

   Includes an animated center-screen overlay (checkmark draw-in) that
   confirms successful delivery/resend with the candidate name and the
   client email address the report was sent to.
   ============================================================ */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiDownload, FiLoader, FiSend, FiTruck, FiCheckCircle, FiAlertTriangle, FiX, FiMail } from 'react-icons/fi';
import theme from '../theme/theme';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

async function fetchDeliveryList({ search, client, checkTypeId, from, to, status }) {
  const res = await api.get('/report-delivery/list', { params: { search, client, checkTypeId, from, to, status } });
  return res.data;
}

async function fetchCheckTypes() {
  const res = await api.get('/verifications/checktypes');
  return res.data;
}

async function resendReport(workorderId, slNo, clientEmail) {
  const res = await api.post(`/report-delivery/${workorderId}/checks/${slNo}/resend`, { clientEmail });
  return res.data;
}

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

function DeliveryStatusBadge({ status }) {
  if (status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
        <FiCheckCircle size={11} /> Sent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
      <FiAlertTriangle size={11} /> Failed
    </span>
  );
}

/* ------------------------------------------------------------
   DeliverySuccessOverlay
   Center-screen animated confirmation shown after a report is
   successfully delivered / resent to a client.
   - Backdrop fades + blurs in
   - Card scales/pops in
   - Checkmark circle draws in, then the tick strokes in after
   - Shows candidate name + client email
   - Auto-dismisses after `autoHideMs` (default 3800ms); can also
     be closed manually or by clicking the backdrop
------------------------------------------------------------ */
function DeliverySuccessOverlay({ visible, name, email, onClose, autoHideMs = 3800 }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, autoHideMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, autoHideMs, onClose]);

  if (!visible) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'dso-backdrop-fade 0.25s ease-out',
      }}
    >
      <style>{`
        @keyframes dso-backdrop-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dso-card-pop {
          0% { opacity: 0; transform: scale(0.85) translateY(8px); }
          60% { opacity: 1; transform: scale(1.03) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes dso-circle-draw {
          from { stroke-dashoffset: 220; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes dso-check-draw {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes dso-ring-pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          70% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes dso-text-rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dso-card {
          animation: dso-card-pop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .dso-ring {
          animation: dso-ring-pulse 1.4s ease-out 0.35s;
        }
        .dso-circle {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: dso-circle-draw 0.6s ease-out 0.05s forwards;
        }
        .dso-check {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: dso-check-draw 0.35s ease-out 0.55s forwards;
        }
        .dso-text-1 {
          animation: dso-text-rise 0.35s ease-out 0.65s both;
        }
        .dso-text-2 {
          animation: dso-text-rise 0.35s ease-out 0.78s both;
        }
        .dso-text-3 {
          animation: dso-text-rise 0.35s ease-out 0.9s both;
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="dso-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 380,
          margin: '0 16px',
          background: '#ffffff',
          borderRadius: 20,
          padding: '32px 28px 26px',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)',
          textAlign: 'center',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f1f5f9',
            color: '#64748b',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <FiX size={14} />
        </button>

        {/* Checkmark with pulsing ring */}
        <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 18px' }}>
          <div
            className="dso-ring"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid #10b981',
            }}
          />
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
            <circle
              className="dso-circle"
              cx="44"
              cy="44"
              r="35"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              transform="rotate(-90 44 44)"
            />
            <path
              className="dso-check"
              d="M28 45L39 56L61 32"
              stroke="#10b981"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          className="dso-text-1"
          style={{ fontFamily: theme.fonts.display, fontSize: 19, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}
        >
          Report Delivered!
        </h2>

        <p className="dso-text-2" style={{ fontSize: 13.5, color: '#475569', marginBottom: 14 }}>
          The report for <span style={{ fontWeight: 700, color: '#0f172a' }}>{name}</span> has been sent to the client.
        </p>

        <div
          className="dso-text-3"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 12,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <FiMail size={14} style={{ color: '#059669', flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#047857', wordBreak: 'break-all' }}>
            {email || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReportDeliveryScreen() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [client, setClient] = useState('');
  const [checkTypeFilter, setCheckTypeFilter] = useState('');
  const [checkTypes, setCheckTypes] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [resendingId, setResendingId] = useState('');
  const [downloadingId, setDownloadingId] = useState('');
  const [actionError, setActionError] = useState('');

  // Delivery success overlay state
  const [deliveryOverlay, setDeliveryOverlay] = useState({ visible: false, name: '', email: '' });

  const closeDeliveryOverlay = useCallback(() => {
    setDeliveryOverlay((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    fetchCheckTypes().then((json) => setCheckTypes(json?.checkTypes || [])).catch(() => {});
  }, []);

  const checkTypeOptions = useMemo(() => ([
    { value: '', label: 'All Verification Types' },
    ...checkTypes.map((c) => ({ value: c._id, label: c.name })),
  ]), [checkTypes]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await fetchDeliveryList({
        search, client,
        checkTypeId: checkTypeFilter || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        status: statusFilter || undefined,
      });
      setRows(json.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, client, checkTypeFilter, dateFrom, dateTo, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleResend = async (row) => {
    const key = `${row.workorderId}-${row.checkSlNo}`;
    setResendingId(key);
    setActionError('');
    try {
      await resendReport(row.workorderId, row.checkSlNo, row.reportSentTo);
      await load();
      setDeliveryOverlay({
        visible: true,
        name: row.fullName,
        email: row.reportSentTo,
      });
    } catch (err) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setResendingId('');
    }
  };

  const handleDownload = async (row) => {
    const key = `${row.workorderId}-${row.checkSlNo}`;
    setDownloadingId(key);
    setActionError('');
    try {
      await downloadReportPdf(row.workorderId, row.checkSlNo, `${row.bgvRef}_${row.fullName}_${row.checkType}`);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setDownloadingId('');
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
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#e0f2fe' }}>
            <FiTruck size={16} className="text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>
              Report Delivery
            </h1>
            <p className="text-xs text-gray-500">{rows.length} report{rows.length !== 1 ? 's' : ''} delivered to clients</p>
          </div>
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white border border-gray-200 outline-none text-gray-900"
          >
            <option value="">All Delivery Statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
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
        {actionError && <ErrorBanner message={actionError} />}

        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">BGV Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Candidate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Check Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Sent To</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Sent At</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-500">No reports have been delivered yet.</td></tr>
              ) : (
                rows.map((row) => {
                  const key = `${row.workorderId}-${row.checkSlNo}`;
                  return (
                    <tr key={key} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: '#e2e8f0' }}>
                      <td className="px-4 py-3 text-gray-600">{row.bgvRef}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{row.client}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.checkType}{row.subType ? ` — ${row.subType}` : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{row.reportSentTo || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {row.reportSentAt ? new Date(row.reportSentAt).toLocaleString('en-GB') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <DeliveryStatusBadge status={row.reportDeliveryStatus} />
                        {row.reportDeliveryStatus === 'failed' && row.reportDeliveryError && (
                          <p className="text-[10px] text-red-500 mt-1 max-w-[160px]">{row.reportDeliveryError}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(row)}
                            disabled={downloadingId === key}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                            style={{ background: 'rgba(14,165,233,0.12)', color: '#0ea5e9' }}
                            title="Download PDF"
                          >
                            {downloadingId === key ? <FiLoader className="animate-spin" size={13} /> : <FiDownload size={13} />}
                            PDF
                          </button>
                          <button
                            onClick={() => handleResend(row)}
                            disabled={resendingId === key}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black disabled:opacity-50"
                            style={{ background: '#0ea5e9' }}
                            title="Resend to client"
                          >
                            {resendingId === key ? <FiLoader className="animate-spin" size={13} /> : <FiSend size={13} />}
                            Resend
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeliverySuccessOverlay
        visible={deliveryOverlay.visible}
        name={deliveryOverlay.name}
        email={deliveryOverlay.email}
        onClose={closeDeliveryOverlay}
      />
    </div>
  );
}