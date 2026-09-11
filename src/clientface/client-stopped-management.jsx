// src/components/ClientStoppedManagement.jsx
// Client-facing individual view of the LOGGED-IN CLIENT's own stopped
// checks / workorders only. Fetches GET /api/client/workorders/stopped/list
// scoped by clientId/clientCode/portalEmail (ownership-filtered server-side).
// Stops have NO time restriction and are PERMANENT — status is shown simply
// as "Stopped" (no "time exceeded" language), plus a payment-due /
// no-payment-due badge reflecting Verifitech's informational payment policy.
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
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';
import { useAuth } from '../context/AuthContext';

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

const getClientAuth = () => {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('client') || '{}';
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

const ClientStoppedManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stoppedChecks, setStoppedChecks] = useState([]);
  const [stoppedWorkorders, setStoppedWorkorders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('checks'); // 'checks' | 'workorders'

  const clientParams = useMemo(() => {
    const authUser = getClientAuth();
    return {
      clientId: user?._id || authUser._id || authUser.id || '',
      clientCode: user?.clientCode || authUser.clientCode || '',
      portalEmail: user?.email || user?.portalEmail || authUser.email || authUser.portalEmail || '',
    };
  }, [user]);

  const fetchStopped = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/client/workorders/stopped/list', { params: clientParams });
      if (res.data.success) {
        setStoppedChecks(res.data.stoppedChecks || []);
        setStoppedWorkorders(res.data.stoppedWorkorders || []);
      }
    } catch (err) {
      console.error('Failed to load stopped items:', err);
    } finally {
      setLoading(false);
    }
  }, [clientParams]);

  useEffect(() => {
    fetchStopped();
  }, [fetchStopped]);

  const filteredChecks = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return stoppedChecks;
    return stoppedChecks.filter((c) =>
      `${c.bgvRef} ${c.candidateName} ${c.checkType}`.toLowerCase().includes(term)
    );
  }, [stoppedChecks, searchQuery]);

  const filteredWorkorders = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return stoppedWorkorders;
    return stoppedWorkorders.filter((w) =>
      `${w.bgvRef} ${w.candidateName}`.toLowerCase().includes(term)
    );
  }, [stoppedWorkorders, searchQuery]);

  const paymentDueCount = useMemo(
    () => stoppedChecks.filter((c) => c.paymentDue).length + stoppedWorkorders.filter((w) => w.paymentDue).length,
    [stoppedChecks, stoppedWorkorders]
  );

  return (
    <div className="min-h-screen bg-[#f8fefd] text-gray-900 font-sans">
      <Header showNavigation={false} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/workorder-dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 transition-all"
          >
            <IoArrowBackOutline size={18} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <IoStopCircleOutline size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Stopped Management</h1>
            <p className="text-gray-600 mt-1">Your permanently stopped checks and workorders</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="STOPPED CHECKS" value={stoppedChecks.length} color="#EF4444" />
          <StatCard label="STOPPED WORKORDERS" value={stoppedWorkorders.length} color="#F97316" />
          <StatCard label="PAYMENT DUE" value={paymentDueCount} color="#B91C1C" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <IoSearchOutline size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by BGV ID or candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 focus:border-red-400 pl-12 py-3.5 rounded-2xl text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
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
            <button
              onClick={fetchStopped}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600"
              title="Refresh"
            >
              <IoRefreshOutline size={18} />
            </button>
          </div>
        </div>

        {view === 'checks' ? (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Workorder</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Candidate</th>
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
                    <tr><td colSpan={8} className="py-16 text-center text-gray-500">Loading…</td></tr>
                  ) : filteredChecks.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-500">No stopped checks found.</td></tr>
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
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Workorder</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Candidate</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped By</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={7} className="py-16 text-center text-gray-500">Loading…</td></tr>
                  ) : filteredWorkorders.length === 0 ? (
                    <tr><td colSpan={7} className="py-16 text-center text-gray-500">No stopped workorders found.</td></tr>
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

export default ClientStoppedManagement;
