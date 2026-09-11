// src/components/StoppedManagement.jsx
// Employee-facing individual view of every stopped check / workorder,
// across all clients. Fetches GET /api/workorders/stopped/list.
// Stops have NO time restriction and are PERMANENT — this screen shows
// status simply as "Stopped" (no "time exceeded" language) plus a
// payment-due / no-payment-due badge reflecting Verifitech's informational
// payment-liability policy.
//
// Filters are all INLINE in the toolbar (no modal) so search and filter
// state is visible and adjustable at a glance:
//   - free-text search (BGV ID / candidate / client / check type)
//   - payment status (All / Payment Due / No Payment Due)
//   - client name
//   - check type (only shown in the "Checks" view)
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  IoArrowBackOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoStopCircleOutline,
  IoCardOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoFilterOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

const PaymentBadge = ({ paymentDue }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${
      paymentDue
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }`}
  >
    <IoCardOutline size={11} />
    {paymentDue ? 'Payment Due' : 'No Payment Due'}
  </span>
);

const StoppedBadge = () => (
  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-300 whitespace-nowrap">
    Stopped
  </span>
);

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

const PAYMENT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Payment Statuses' },
  { value: 'due', label: 'Payment Due' },
  { value: 'not-due', label: 'No Payment Due' },
];

const StoppedManagement = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stoppedChecks, setStoppedChecks] = useState([]);
  const [stoppedWorkorders, setStoppedWorkorders] = useState([]);
  const [view, setView] = useState('checks'); // 'checks' | 'workorders'

  // ---- Inline search + filter state (always visible, no modal) ----
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'due' | 'not-due'
  const [clientFilter, setClientFilter] = useState('');
  const [checkTypeFilter, setCheckTypeFilter] = useState('all');

  const fetchStopped = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/workorders/stopped/list');
      if (res.data.success) {
        setStoppedChecks(res.data.stoppedChecks || []);
        setStoppedWorkorders(res.data.stoppedWorkorders || []);
      }
    } catch (err) {
      console.error('Failed to load stopped items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStopped();
  }, [fetchStopped]);

  const matchesPaymentFilter = (paymentDue) => {
    if (paymentFilter === 'due') return !!paymentDue;
    if (paymentFilter === 'not-due') return !paymentDue;
    return true;
  };

  // Distinct check-type options derived from the stopped checks themselves,
  // so the dropdown only ever shows types that actually exist right now.
  const checkTypeOptions = useMemo(() => {
    const set = new Set();
    stoppedChecks.forEach((c) => {
      if (c.checkType) set.add(c.checkType);
    });
    return Array.from(set).sort();
  }, [stoppedChecks]);

  const filteredChecks = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    const clientTerm = clientFilter.toLowerCase().trim();
    return stoppedChecks.filter((c) => {
      if (!matchesPaymentFilter(c.paymentDue)) return false;
      if (clientTerm && !(c.client || '').toLowerCase().includes(clientTerm)) return false;
      if (checkTypeFilter !== 'all' && c.checkType !== checkTypeFilter) return false;
      if (!term) return true;
      return `${c.bgvRef} ${c.candidateName} ${c.client} ${c.checkType} ${c.subType || ''}`
        .toLowerCase()
        .includes(term);
    });
  }, [stoppedChecks, searchQuery, paymentFilter, clientFilter, checkTypeFilter]);

  const filteredWorkorders = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    const clientTerm = clientFilter.toLowerCase().trim();
    return stoppedWorkorders.filter((w) => {
      if (!matchesPaymentFilter(w.paymentDue)) return false;
      if (clientTerm && !(w.client || '').toLowerCase().includes(clientTerm)) return false;
      if (!term) return true;
      return `${w.bgvRef} ${w.candidateName} ${w.client}`.toLowerCase().includes(term);
    });
  }, [stoppedWorkorders, searchQuery, paymentFilter, clientFilter]);

  const paymentDueCount = useMemo(
    () => stoppedChecks.filter((c) => c.paymentDue).length + stoppedWorkorders.filter((w) => w.paymentDue).length,
    [stoppedChecks, stoppedWorkorders]
  );

  const activeFilterCount =
    (paymentFilter !== 'all' ? 1 : 0) +
    (clientFilter.trim() ? 1 : 0) +
    (checkTypeFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearFilters = () => {
    setSearchQuery('');
    setPaymentFilter('all');
    setClientFilter('');
    setCheckTypeFilter('all');
  };

  return (
    <div className="min-h-screen bg-[#f8fefd] text-gray-900 font-sans">
      <Header showNavigation={false} />

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
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <IoStopCircleOutline size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Stopped Management</h1>
              <p className="text-gray-600 mt-1">Every permanently stopped check and workorder, across all clients</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl p-1.5">
            <button
              onClick={() => setView('checks')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${view === 'checks' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Checks
            </button>
            <button
              onClick={() => setView('workorders')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${view === 'workorders' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Workorders
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="STOPPED CHECKS" value={stoppedChecks.length} color="#EF4444" />
          <StatCard label="STOPPED WORKORDERS" value={stoppedWorkorders.length} color="#F97316" />
          <StatCard label="PAYMENT DUE" value={paymentDueCount} color="#B91C1C" />
        </div>

        {/* ================= INLINE SEARCH + FILTER BAR (always visible) ================= */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <IoFilterOutline size={14} /> Search &amp; Filter
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold normal-case tracking-normal">
                {activeFilterCount} active
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="relative flex-1 min-w-[220px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <IoSearchOutline size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by BGV ID, candidate, client or check type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-red-400 pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-white border border-gray-300 focus:border-red-400 rounded-xl px-4 py-3 text-sm outline-none min-w-[180px]"
            >
              {PAYMENT_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by client..."
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-white border border-gray-300 focus:border-red-400 rounded-xl px-4 py-3 text-sm outline-none min-w-[180px]"
            />

            {view === 'checks' && (
              <select
                value={checkTypeFilter}
                onChange={(e) => setCheckTypeFilter(e.target.value)}
                className="bg-white border border-gray-300 focus:border-red-400 rounded-xl px-4 py-3 text-sm outline-none min-w-[180px]"
              >
                <option value="all">All Check Types</option>
                {checkTypeOptions.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-2 flex-shrink-0">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
                >
                  <IoCloseCircleOutline size={16} /> Clear
                </button>
              )}
              <button
                onClick={fetchStopped}
                className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600 flex-shrink-0"
                title="Refresh"
              >
                <IoRefreshOutline size={18} />
              </button>
            </div>
          </div>
        </div>

        {view === 'checks' ? (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Workorder</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Check</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped By</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={9} className="py-16 text-center text-gray-500">Loading…</td></tr>
                  ) : filteredChecks.length === 0 ? (
                    <tr><td colSpan={9} className="py-16 text-center text-gray-500">No stopped checks match your search/filters.</td></tr>
                  ) : (
                    filteredChecks.map((c) => (
                      <tr key={`${c.workorderId}-${c.slNo}`} className="hover:bg-red-50/30">
                        <td className="px-6 py-4">
                          <span className="font-mono text-red-500 text-sm">{c.bgvRef}</span>
                          {c.partOfWorkorderStop && (
                            <div className="text-[10px] text-orange-500 font-semibold mt-0.5">Part of full workorder stop</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-800">
                            <IoPersonOutline size={13} className="text-gray-400" /> {c.candidateName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <IoBusinessOutline size={13} className="text-gray-400" /> {c.client}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {c.checkType}{c.subType ? ` (${c.subType})` : ''}
                        </td>
                        <td className="px-6 py-4"><StoppedBadge /></td>
                        <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">{c.stopReason || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-700">{c.stoppedBy?.name || '—'}</div>
                          <div className="text-[10px] text-gray-400 uppercase">{c.stoppedBy?.origin || ''}</div>
                        </td>
                        <td className="px-6 py-4"><PaymentBadge paymentDue={c.paymentDue} /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <IoTimeOutline size={13} /> {formatDate(c.stoppedAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Workorder</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped By</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-500">Loading…</td></tr>
                  ) : filteredWorkorders.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-500">No stopped workorders match your search/filters.</td></tr>
                  ) : (
                    filteredWorkorders.map((w) => (
                      <tr key={w.workorderId} className="hover:bg-orange-50/30">
                        <td className="px-6 py-4">
                          <span className="font-mono text-orange-600 text-sm">{w.bgvRef}</span>
                          <div className="text-xs text-gray-500">{w.checkCount} check{w.checkCount === 1 ? '' : 's'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-800">
                            <IoPersonOutline size={13} className="text-gray-400" /> {w.candidateName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <IoBusinessOutline size={13} className="text-gray-400" /> {w.client}
                          </div>
                        </td>
                        <td className="px-6 py-4"><StoppedBadge /></td>
                        <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">{w.stopReason || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-700">{w.stoppedBy?.name || '—'}</div>
                          <div className="text-[10px] text-gray-400 uppercase">{w.stoppedBy?.origin || ''}</div>
                        </td>
                        <td className="px-6 py-4"><PaymentBadge paymentDue={w.paymentDue} /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <IoTimeOutline size={13} /> {formatDate(w.stoppedAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StoppedManagement;
