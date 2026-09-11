// src/components/DataManagement.jsx
//
// ============================================================================
//  DATA MANAGEMENT
//  ----------------------------------------------------------------------
//  Central screen for the "assign an employee/vendor to a check, then let
//  them fill it in" workflow described in dataManagementRoutes.js.
//
//  IMPORTANT (this revision): stopped checks/workorders are NO LONGER
//  hidden from the main "Active" list. They remain visible there with
//  their status shown as "Stopped" and all interactive actions disabled
//  (since a stop is permanent) — and the SAME record continues to also
//  appear in the separate "Stopped" tab. Both views always agree.
//
//  Per-check actions (inside the expanded panel):
//    - Assign / Reassign (Internal employee or External vendor) — emails them
//    - Data Entry / View — the SAME dedicated check form used during
//      creation (CheckFormRouter), fully editable, with an explicit
//      View <-> Edit toggle. "Save & Mark Complete" finalizes the check.
//    - Insufficiency (light red) — pop-up with a description of what's
//      missing/incorrect; emails the candidate; check moves to the
//      Insufficiency screen until cleared there.
//    - Check Hold (amber) — pop-up with a hold reason; pauses just this
//      one check; emails admin/assignee. Resumed from "On Hold" tab.
//      REVERSIBLE, no time restriction.
//    - Stop Check (red) — pop-up with a stop reason; PERMANENTLY halts
//      just this one check. May be raised AT ANY TIME — there is no
//      time restriction on the action itself. The pop-up shows a
//      professional notice about Verifitech's payment-liability policy
//      (informational only, never blocks the stop). If the person
//      performing this is a client, the client's Customer Supporter is
//      emailed automatically.
//
//  Per-group (whole-case) actions:
//    - Case Hold (amber, header level) — pauses the ENTIRE workorder
//      (every check on it) in one action. Resumed from "On Hold" tab.
//      REVERSIBLE, no time restriction.
//    - Stop Workorder (red, header level) — PERMANENTLY halts every
//      check on the workorder at once. May be raised AT ANY TIME.
//      Customer Supporter notified if a client performed it.
//
//  Tabs on this screen:
//    - "Active"  — the grouped table described above, INCLUDING stopped
//      items (status badge shows "Stopped", actions disabled for them).
//    - "On Hold" — everything currently paused, each with a Resume action.
//    - "Stopped" — everything permanently stopped (checks and/or whole
//      workorders), read-only, with who/when/why and payment status.
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  IoArrowBackOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoEyeOutline,
  IoPencilOutline,
  IoPersonAddOutline,
  IoSaveOutline,
  IoCheckmarkDoneOutline,
  IoFilterOutline,
  IoFlagOutline,
  IoChevronForward,
  IoChevronDown,
  IoMailOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoPauseCircleOutline,
  IoPlayCircleOutline,
  IoBriefcaseOutline,
  IoLayersOutline,
  IoStopCircleOutline,
  IoCardOutline,
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
  insufficient: 'Insufficient',
  hold: 'On Hold',
  stopped: 'Stopped',
};
const ACTIVE_STATUS_FILTERS = ['assignment-pending', 'verification-pending', 'qc', 'stopped'];
const CHECK_STATUS_STYLES = {
  'assignment-pending': 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]',
  'verification-pending': 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]',
  qc: 'bg-[#EDE9FE] text-[#7C3AED] border-[#A78BFA]',
  report: 'bg-[#D1FAE5] text-[#10B981] border-[#34D399]',
  completed: 'bg-[#D1FAE5] text-[#10B981] border-[#34D399]',
  insufficient: 'bg-red-50 text-red-500 border-red-200',
  hold: 'bg-amber-50 text-amber-600 border-amber-300',
  stopped: 'bg-red-100 text-red-700 border-red-300',
};

// --------------------------------------------------------------------
// PAYMENT-LIABILITY POLICY (client-side mirror, informational only)
// --------------------------------------------------------------------
const PAYMENT_GRACE_WINDOW_MS = 24 * 60 * 60 * 1000;
const isPaymentDuePreview = (createdAt) => {
  if (!createdAt) return true;
  return Date.now() - new Date(createdAt).getTime() > PAYMENT_GRACE_WINDOW_MS;
};
const paymentPolicyMessage = (paymentDue) =>
  paymentDue
    ? "As this request falls outside Verifitech's 24-hour payment-review window from workorder creation, payment is due for the verification work already initiated on this record."
    : "As this request falls within Verifitech's 24-hour payment-review window from workorder creation, no payment is due for this stop.";

const StatusBadge = ({ status }) => {
  const s = status || 'assignment-pending';
  const cls = CHECK_STATUS_STYLES[s] || 'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${cls}`}>
      {CHECK_STATUS_LABELS[s] || s}
    </span>
  );
};

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

const getEmployeeIdentity = () => {
  try {
    const raw = localStorage.getItem('employee') || localStorage.getItem('user') || '{}';
    const parsed = JSON.parse(raw) || {};
    return {
      origin: 'employee',
      name: parsed.name || parsed.fullName || parsed.displayName || 'Employee',
      email: parsed.email || '',
      userId: parsed._id || parsed.id || '',
    };
  } catch {
    return { origin: 'employee', name: 'Employee', email: '', userId: '' };
  }
};

const DataManagement = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('active');

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, unassigned: 0, inProgress: 0, qc: 0, completed: 0, insufficient: 0, hold: 0, stopped: 0 });
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignFilter, setAssignFilter] = useState('all');

  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const [assignees, setAssignees] = useState({ internal: [], external: [] });

  const [holdsLoading, setHoldsLoading] = useState(false);
  const [checkHolds, setCheckHolds] = useState([]);
  const [caseHolds, setCaseHolds] = useState([]);
  const [resumingKey, setResumingKey] = useState(null);

  const [stoppedLoading, setStoppedLoading] = useState(false);
  const [stoppedChecks, setStoppedChecks] = useState([]);
  const [stoppedWorkorders, setStoppedWorkorders] = useState([]);

  const [assignTarget, setAssignTarget] = useState(null);
  const [assignType, setAssignType] = useState('internal');
  const [assignPersonId, setAssignPersonId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [insufficiencyTarget, setInsufficiencyTarget] = useState(null);
  const [insufficiencyDescription, setInsufficiencyDescription] = useState('');
  const [isRaisingInsufficiency, setIsRaisingInsufficiency] = useState(false);

  const [checkHoldTarget, setCheckHoldTarget] = useState(null);
  const [checkHoldReason, setCheckHoldReason] = useState('');
  const [isRaisingCheckHold, setIsRaisingCheckHold] = useState(false);

  const [caseHoldTarget, setCaseHoldTarget] = useState(null);
  const [caseHoldReason, setCaseHoldReason] = useState('');
  const [isRaisingCaseHold, setIsRaisingCaseHold] = useState(false);

  const [stopCheckTarget, setStopCheckTarget] = useState(null);
  const [stopCheckReason, setStopCheckReason] = useState('');
  const [isStoppingCheck, setIsStoppingCheck] = useState(false);

  const [stopCaseTarget, setStopCaseTarget] = useState(null);
  const [stopCaseReason, setStopCaseReason] = useState('');
  const [isStoppingCase, setIsStoppingCase] = useState(false);

  const [activeRow, setActiveRow] = useState(null);
  const [activeWorkorder, setActiveWorkorder] = useState(null);
  const [activeCheck, setActiveCheck] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [structuredData, setStructuredData] = useState({});
  const [checkStatus, setCheckStatus] = useState('assignment-pending');
  const [checkNotes, setCheckNotes] = useState('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  const [notification, setNotification] = useState(null);
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3200);
  };

  // NOTE: excludeStopped is intentionally NOT sent here anymore — stopped
  // checks/workorders now stay visible in this Active list (status shown
  // as "Stopped", actions disabled) in addition to the separate Stopped tab.
  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = { excludeCompleted: 'true', excludeInsufficient: 'true', excludeHold: 'true' };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (assignFilter === 'unassigned') params.unassigned = 'true';
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/api/data-management', { params });
      if (res.data.success) {
        setRows(res.data.rows || []);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load data management list:', err);
      showNotification('error', 'Failed to load data management list.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, assignFilter, searchQuery]);

  const fetchHolds = useCallback(async () => {
    setHoldsLoading(true);
    try {
      const res = await api.get('/api/data-management/holds/list');
      if (res.data.success) {
        setCheckHolds(res.data.checkHolds || []);
        setCaseHolds(res.data.caseHolds || []);
      }
    } catch (err) {
      console.error('Failed to load holds:', err);
      showNotification('error', 'Failed to load holds.');
    } finally {
      setHoldsLoading(false);
    }
  }, []);

  const fetchStopped = useCallback(async () => {
    setStoppedLoading(true);
    try {
      const res = await api.get('/api/data-management/stopped/list');
      if (res.data.success) {
        setStoppedChecks(res.data.stoppedChecks || []);
        setStoppedWorkorders(res.data.stoppedWorkorders || []);
      }
    } catch (err) {
      console.error('Failed to load stopped items:', err);
      showNotification('error', 'Failed to load stopped items.');
    } finally {
      setStoppedLoading(false);
    }
  }, []);

  const fetchAssignees = useCallback(async () => {
    try {
      const res = await api.get('/api/data-management/assignees/list');
      if (res.data.success) {
        setAssignees({ internal: res.data.internal || [], external: res.data.external || [] });
      }
    } catch (err) {
      console.error('Failed to load assignees:', err);
    }
  }, []);

  useEffect(() => {
    fetchAssignees();
  }, [fetchAssignees]);

  useEffect(() => {
    if (activeTab !== 'active') return;
    const t = setTimeout(fetchRows, 250);
    return () => clearTimeout(t);
  }, [fetchRows, activeTab]);

  useEffect(() => {
    if (activeTab === 'holds') fetchHolds();
    if (activeTab === 'stopped') fetchStopped();
  }, [activeTab, fetchHolds, fetchStopped]);

  const groups = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      if (!map.has(row.workorderId)) {
        map.set(row.workorderId, {
          workorderId: row.workorderId,
          bgvRef: row.bgvRef,
          candidateName: row.candidateName,
          client: row.client,
          initiationMode: row.initiationMode,
          workorderCreatedAt: row.workorderCreatedAt,
          workorderStopped: false,
          checks: [],
        });
      }
      const g = map.get(row.workorderId);
      g.checks.push(row);
      if (row.workorderStopped) g.workorderStopped = true;
    });
    return Array.from(map.values());
  }, [rows]);

  const toggleGroup = (workorderId) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(workorderId)) next.delete(workorderId);
      else next.add(workorderId);
      return next;
    });
  };

  const openAssign = (row) => {
    if (row.stopped) return;
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
        `/api/data-management/${assignTarget.workorderId}/checks/${assignTarget.slNo}/assign`,
        {
          assignedToId: person.id,
          assignedToName: person.name,
          assignedToEmail: person.email,
          assignmentType: assignType,
        }
      );
      if (res.data.success) {
        showNotification('success', `Assigned to ${person.name}. Notification email sent.`);
        setAssignTarget(null);
        fetchRows();
      } else {
        showNotification('error', res.data.message || 'Failed to assign.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to assign.');
    } finally {
      setIsAssigning(false);
    }
  };

  const openInsufficiency = (row) => {
    if (row.stopped) return;
    setInsufficiencyTarget(row);
    setInsufficiencyDescription('');
  };
  const closeInsufficiency = () => {
    if (isRaisingInsufficiency) return;
    setInsufficiencyTarget(null);
    setInsufficiencyDescription('');
  };

  const submitInsufficiency = async () => {
    if (!insufficiencyTarget) return;
    if (!insufficiencyDescription.trim()) {
      showNotification('error', 'Please describe what is missing/incorrect.');
      return;
    }

    setIsRaisingInsufficiency(true);
    try {
      const res = await api.put(
        `/api/data-management/${insufficiencyTarget.workorderId}/checks/${insufficiencyTarget.slNo}/insufficiency`,
        { description: insufficiencyDescription.trim() }
      );
      if (res.data.success) {
        showNotification('success', 'Insufficiency raised — candidate has been emailed.');
        setInsufficiencyTarget(null);
        setInsufficiencyDescription('');
        fetchRows();
      } else {
        showNotification('error', res.data.message || 'Failed to raise insufficiency.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to raise insufficiency.');
    } finally {
      setIsRaisingInsufficiency(false);
    }
  };

  const openCheckHold = (row) => {
    if (row.stopped) return;
    setCheckHoldTarget(row);
    setCheckHoldReason('');
  };
  const closeCheckHold = () => {
    if (isRaisingCheckHold) return;
    setCheckHoldTarget(null);
    setCheckHoldReason('');
  };

  const submitCheckHold = async () => {
    if (!checkHoldTarget) return;
    if (!checkHoldReason.trim()) {
      showNotification('error', 'Please provide a reason for the hold.');
      return;
    }

    setIsRaisingCheckHold(true);
    try {
      const res = await api.put(
        `/api/data-management/${checkHoldTarget.workorderId}/checks/${checkHoldTarget.slNo}/hold`,
        { reason: checkHoldReason.trim(), raisedBy: getEmployeeIdentity() }
      );
      if (res.data.success) {
        showNotification('success', 'Check put on hold.');
        setCheckHoldTarget(null);
        setCheckHoldReason('');
        fetchRows();
      } else {
        showNotification('error', res.data.message || 'Failed to put check on hold.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to put check on hold.');
    } finally {
      setIsRaisingCheckHold(false);
    }
  };

  const openCaseHold = (group) => {
    if (group.workorderStopped) return;
    setCaseHoldTarget(group);
    setCaseHoldReason('');
  };
  const closeCaseHold = () => {
    if (isRaisingCaseHold) return;
    setCaseHoldTarget(null);
    setCaseHoldReason('');
  };

  const submitCaseHold = async () => {
    if (!caseHoldTarget) return;
    if (!caseHoldReason.trim()) {
      showNotification('error', 'Please provide a reason for the case hold.');
      return;
    }

    setIsRaisingCaseHold(true);
    try {
      const res = await api.put(`/api/data-management/${caseHoldTarget.workorderId}/case-hold`, {
        reason: caseHoldReason.trim(),
        raisedBy: getEmployeeIdentity(),
      });
      if (res.data.success) {
        showNotification('success', 'Entire case put on hold — every check on it is paused.');
        setCaseHoldTarget(null);
        setCaseHoldReason('');
        fetchRows();
      } else {
        showNotification('error', res.data.message || 'Failed to put case on hold.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to put case on hold.');
    } finally {
      setIsRaisingCaseHold(false);
    }
  };

  const openStopCheck = (row) => {
    if (row.stopped) return;
    setStopCheckTarget(row);
    setStopCheckReason('');
  };
  const closeStopCheck = () => {
    if (isStoppingCheck) return;
    setStopCheckTarget(null);
    setStopCheckReason('');
  };

  const submitStopCheck = async () => {
    if (!stopCheckTarget) return;
    if (!stopCheckReason.trim()) {
      showNotification('error', 'Please provide a reason for stopping this check.');
      return;
    }
    setIsStoppingCheck(true);
    try {
      const res = await api.put(
        `/api/data-management/${stopCheckTarget.workorderId}/checks/${stopCheckTarget.slNo}/stop`,
        { reason: stopCheckReason.trim(), stoppedBy: getEmployeeIdentity() }
      );
      if (res.data.success) {
        showNotification('success', 'Check stopped. It now shows as "Stopped" here and in Stopped Management.');
        setStopCheckTarget(null);
        setStopCheckReason('');
        fetchRows();
      } else {
        showNotification('error', res.data.message || 'Failed to stop check.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to stop check.');
    } finally {
      setIsStoppingCheck(false);
    }
  };

  const openStopCase = (group) => {
    if (group.workorderStopped) return;
    setStopCaseTarget(group);
    setStopCaseReason('');
  };
  const closeStopCase = () => {
    if (isStoppingCase) return;
    setStopCaseTarget(null);
    setStopCaseReason('');
  };

  const submitStopCase = async () => {
    if (!stopCaseTarget) return;
    if (!stopCaseReason.trim()) {
      showNotification('error', 'Please provide a reason for stopping this workorder.');
      return;
    }
    setIsStoppingCase(true);
    try {
      const res = await api.put(`/api/data-management/${stopCaseTarget.workorderId}/stop`, {
        reason: stopCaseReason.trim(),
        stoppedBy: getEmployeeIdentity(),
      });
      if (res.data.success) {
        showNotification('success', 'Workorder stopped — every check halted. It now shows as "Stopped" here and in Stopped Management.');
        setStopCaseTarget(null);
        setStopCaseReason('');
        fetchRows();
      } else {
        showNotification('error', res.data.message || 'Failed to stop workorder.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to stop workorder.');
    } finally {
      setIsStoppingCase(false);
    }
  };

  const resumeCheckHold = async (row) => {
    const key = `${row.workorderId}-${row.slNo}`;
    setResumingKey(key);
    try {
      const res = await api.put(`/api/data-management/${row.workorderId}/checks/${row.slNo}/hold/clear`);
      if (res.data.success) {
        showNotification('success', 'Check hold cleared — moved back to Data Management.');
        fetchHolds();
      } else {
        showNotification('error', res.data.message || 'Failed to clear check hold.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to clear check hold.');
    } finally {
      setResumingKey(null);
    }
  };

  const resumeCaseHold = async (caseRow) => {
    setResumingKey(caseRow.workorderId);
    try {
      const res = await api.put(`/api/data-management/${caseRow.workorderId}/case-hold/clear`);
      if (res.data.success) {
        showNotification('success', 'Case hold cleared — workorder moved back to Data Management.');
        fetchHolds();
      } else {
        showNotification('error', res.data.message || 'Failed to clear case hold.');
      }
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to clear case hold.');
    } finally {
      setResumingKey(null);
    }
  };

  const openDetail = async (row, mode) => {
    setActiveRow(row);
    setModalMode(row.stopped ? 'view' : mode);
    setIsLoadingDetail(true);
    try {
      const res = await api.get(`/api/data-management/${row.workorderId}`);
      if (res.data.success) {
        const wo = res.data.workorder;
        const check = (wo.checks || []).find((c) => String(c.slNo) === String(row.slNo));
        setActiveWorkorder(wo);
        setActiveCheck(check || null);
        setStructuredData((check?.data && check.data[STRUCTURED_KEY]) || {});
        setCheckStatus(check?.status || 'assignment-pending');
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

  const saveDetail = async (andComplete = false) => {
    if (!activeRow || !activeCheck || activeRow.stopped) return;
    setIsSavingDetail(true);
    try {
      const mergedData = { ...(activeCheck.data || {}), [STRUCTURED_KEY]: structuredData };
      const res = await api.put(
        `/api/data-management/${activeRow.workorderId}/checks/${activeRow.slNo}/data`,
        { data: mergedData, status: checkStatus, notes: checkNotes }
      );
      if (!res.data.success) {
        showNotification('error', res.data.message || 'Failed to save.');
        return;
      }

      if (andComplete) {
        const completeRes = await api.put(
          `/api/data-management/${activeRow.workorderId}/checks/${activeRow.slNo}/complete`
        );
        if (!completeRes.data.success) {
          showNotification('error', completeRes.data.message || 'Failed to mark complete.');
          return;
        }
        showNotification('success', 'Check saved and marked complete.');
      } else {
        showNotification('success', 'Check data saved.');
      }

      closeDetail();
      fetchRows();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to save check.');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const filteredStatusPill = (key, label) => (
    <button
      key={key}
      onClick={() => setStatusFilter(key)}
      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
        statusFilter === key
          ? 'bg-[#00D4AA] text-black border-[#00D4AA]'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

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
            <div className="w-12 h-12 bg-gradient-to-br from-[#00D4AA] to-[#3B82F6] rounded-2xl flex items-center justify-center">
              <IoShieldCheckmarkOutline size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Data Management</h1>
              <p className="text-gray-600 mt-1">One row per case — expand to assign, verify, hold, stop, or flag any check</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/insufficiency-management')}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-red-200 hover:border-red-400 rounded-2xl text-sm font-semibold text-red-500 hover:text-red-600 transition-all shadow-sm"
            >
              <IoWarningOutline size={18} />
              View Insufficiency
            </button>
            <button
              onClick={() => navigate('/data-management-completed')}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-[#00D4AA] rounded-2xl text-sm font-semibold text-gray-700 hover:text-[#00806E] transition-all shadow-sm"
            >
              <IoCheckmarkDoneOutline size={18} className="text-[#10B981]" />
              View Completed
            </button>
            <button
              onClick={() => navigate('/stop-management')}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-red-200 hover:border-red-400 rounded-2xl text-sm font-semibold text-red-600 hover:text-red-700 transition-all shadow-sm"
            >
              <IoStopCircleOutline size={18} />
              Stopped Management
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 bg-white border border-gray-200 rounded-2xl p-1.5 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'active' ? 'bg-[#00D4AA] text-black' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <IoLayersOutline size={16} /> Active
          </button>
          <button
            onClick={() => setActiveTab('holds')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'holds' ? 'bg-amber-400 text-black' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <IoPauseCircleOutline size={16} /> On Hold
            {(stats.hold || 0) + caseHolds.length > 0 && activeTab !== 'holds' && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                {(stats.hold || 0) + caseHolds.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stopped')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'stopped' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <IoStopCircleOutline size={16} /> Stopped
            {(stats.stopped || 0) > 0 && activeTab !== 'stopped' && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                {stats.stopped}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'active' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <StatCard label="TOTAL ACTIVE" value={stats.total || 0} color="#00D4AA" />
              <StatCard label="UNASSIGNED" value={stats.unassigned || 0} color="#F59E0B" />
              <StatCard label="IN PROGRESS" value={stats.inProgress || 0} color="#3B82F6" />
              <StatCard label="QC" value={stats.qc || 0} color="#7C3AED" />
              <StatCard label="INSUFFICIENT" value={stats.insufficient || 0} color="#EF4444" />
              <StatCard label="STOPPED" value={stats.stopped || 0} color="#DC2626" />
            </div>

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
                {filteredStatusPill('all', 'All Statuses')}
                {ACTIVE_STATUS_FILTERS.map((s) => filteredStatusPill(s, CHECK_STATUS_LABELS[s]))}
                <button
                  onClick={() => setAssignFilter(assignFilter === 'unassigned' ? 'all' : 'unassigned')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    assignFilter === 'unassigned'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IoFilterOutline size={14} /> Unassigned Only
                </button>
                <button
                  onClick={fetchRows}
                  className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600"
                  title="Refresh"
                >
                  <IoRefreshOutline size={18} />
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 w-10"></th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Workorder</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Checks</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Case Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-gray-500">Loading…</td>
                      </tr>
                    ) : groups.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-gray-500">No cases found for the selected filters.</td>
                      </tr>
                    ) : (
                      groups.map((group) => {
                        const isExpanded = expandedGroups.has(group.workorderId);
                        const unassignedCount = group.checks.filter((c) => !c.assignedToId && !c.stopped).length;
                        return (
                          <React.Fragment key={group.workorderId}>
                            <tr
                              className={`hover:bg-gray-50 transition-colors cursor-pointer ${group.workorderStopped ? 'bg-red-50/30' : ''}`}
                              onClick={() => toggleGroup(group.workorderId)}
                            >
                              <td className="px-6 py-5 text-gray-400">
                                {isExpanded ? <IoChevronDown size={18} /> : <IoChevronForward size={18} />}
                              </td>
                              <td className="px-6 py-5">
                                <span className="font-mono text-[#00D4AA] font-semibold text-sm">{group.bgvRef}</span>
                                {group.workorderStopped && (
                                  <div className="mt-1"><StatusBadge status="stopped" /></div>
                                )}
                              </td>
                              <td className="px-6 py-5">
                                <div className="font-medium text-gray-900 text-sm">{group.candidateName}</div>
                              </td>
                              <td className="px-6 py-5 text-sm text-gray-600">{group.client}</td>
                              <td className="px-6 py-5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                                  {group.initiationMode === 'Verifitech' ? <IoBusinessOutline size={12} /> : <IoPersonOutline size={12} />}
                                  {group.initiationMode}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-800">{group.checks.length} check{group.checks.length === 1 ? '' : 's'}</span>
                                  {unassignedCount > 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
                                      {unassignedCount} unassigned
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => openCaseHold(group)}
                                    disabled={group.workorderStopped}
                                    title={group.workorderStopped ? 'This workorder has been permanently stopped' : 'Put entire case on hold (reversible)'}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 text-xs font-semibold transition-all disabled:opacity-40"
                                  >
                                    <IoBriefcaseOutline size={15} />
                                    Case Hold
                                  </button>
                                  <button
                                    onClick={() => openStopCase(group)}
                                    disabled={group.workorderStopped}
                                    title={group.workorderStopped ? 'Already stopped' : 'Permanently stop entire workorder'}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold transition-all disabled:opacity-40"
                                  >
                                    <IoStopCircleOutline size={15} />
                                    {group.workorderStopped ? 'Stopped' : 'Stop Workorder'}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr>
                                <td colSpan={7} className="bg-gray-50/70 px-6 py-5">
                                  <div className="space-y-3">
                                    {group.checks.map((row) => (
                                      <div
                                        key={`${row.workorderId}-${row.slNo}`}
                                        className={`bg-white border rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 ${
                                          row.stopped ? 'border-red-200' : 'border-gray-200'
                                        }`}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-semibold text-gray-900">{row.checkType}</div>
                                          {row.subType && <div className="text-xs text-gray-500 italic">{row.subType}</div>}
                                          {row.stopped && row.stopReason && (
                                            <div className="text-[11px] text-red-600 mt-1">Stop reason: {row.stopReason}</div>
                                          )}
                                        </div>
                                        <div className="w-36 flex-shrink-0">
                                          <StatusBadge status={row.status} />
                                        </div>
                                        {row.stopped && (
                                          <div className="w-32 flex-shrink-0">
                                            <PaymentBadge paymentDue={row.paymentDue} />
                                          </div>
                                        )}
                                        <div className="w-48 flex-shrink-0">
                                          {row.assignedTo ? (
                                            <div>
                                              <div className="text-sm text-gray-800">{row.assignedTo}</div>
                                              <div className="text-[10px] text-gray-400 uppercase">{row.assignmentType}</div>
                                            </div>
                                          ) : (
                                            <span className="text-xs text-amber-600 font-medium">{row.stopped ? '—' : 'Unassigned'}</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                                          <button
                                            onClick={() => openAssign(row)}
                                            disabled={row.stopped}
                                            title={row.stopped ? 'Stopped — no further action possible' : row.assignedTo ? 'Reassign' : 'Assign'}
                                            className="p-2 hover:bg-gray-100 rounded-xl text-[#3B82F6] transition-all disabled:opacity-30"
                                          >
                                            <IoPersonAddOutline size={18} />
                                          </button>
                                          <button
                                            onClick={() => openDetail(row, row.status === 'report' ? 'view' : 'edit')}
                                            title={row.stopped ? 'View (read-only — stopped)' : 'Data Entry'}
                                            className="p-2 hover:bg-gray-100 rounded-xl text-[#00806E] transition-all"
                                          >
                                            <IoPencilOutline size={18} />
                                          </button>
                                          <button
                                            onClick={() => openDetail(row, 'view')}
                                            title="View"
                                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
                                          >
                                            <IoEyeOutline size={18} />
                                          </button>
                                          <button
                                            onClick={() => openInsufficiency(row)}
                                            disabled={row.stopped}
                                            title={row.stopped ? 'Stopped — no further action possible' : 'Raise Insufficiency'}
                                            className="p-2 hover:bg-red-50 rounded-xl text-red-400 hover:text-red-500 transition-all disabled:opacity-30"
                                          >
                                            <IoAlertCircleOutline size={18} />
                                          </button>
                                          <button
                                            onClick={() => openCheckHold(row)}
                                            disabled={row.stopped}
                                            title={row.stopped ? 'Stopped — no further action possible' : 'Put this check on hold (reversible)'}
                                            className="p-2 hover:bg-amber-50 rounded-xl text-amber-500 hover:text-amber-600 transition-all disabled:opacity-30"
                                          >
                                            <IoPauseCircleOutline size={18} />
                                          </button>
                                          <button
                                            onClick={() => openStopCheck(row)}
                                            disabled={row.stopped}
                                            title={row.stopped ? 'Already stopped' : 'Permanently stop this check'}
                                            className="p-2 hover:bg-red-100 rounded-xl text-red-600 hover:text-red-700 transition-all disabled:opacity-30"
                                          >
                                            <IoStopCircleOutline size={18} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === 'holds' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
              <StatCard label="CHECK HOLDS" value={checkHolds.length} color="#F59E0B" />
              <StatCard label="CASE HOLDS" value={caseHolds.length} color="#D97706" />
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={fetchHolds}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600"
                title="Refresh"
              >
                <IoRefreshOutline size={18} />
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <IoBriefcaseOutline size={20} className="text-amber-600" /> Case Holds (entire workorder paused)
              </h3>
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Workorder</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Raised By</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Raised At</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {holdsLoading ? (
                        <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading…</td></tr>
                      ) : caseHolds.length === 0 ? (
                        <tr><td colSpan={6} className="py-12 text-center text-gray-500">No cases on hold.</td></tr>
                      ) : (
                        caseHolds.map((c) => (
                          <tr key={c.workorderId} className="hover:bg-amber-50/40">
                            <td className="px-6 py-4">
                              <span className="font-mono text-[#00D4AA] font-medium text-sm">{c.bgvRef}</span>
                              <div className="text-xs text-gray-500">{c.checkCount} check{c.checkCount === 1 ? '' : 's'}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">{c.candidateName}</td>
                            <td className="px-6 py-4 max-w-sm">
                              <div className="text-xs text-amber-700 line-clamp-2">{c.caseHoldReason || '—'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-gray-600">{c.caseHoldRaisedBy?.name || '—'}</div>
                              <div className="text-[10px] text-gray-400 uppercase">{c.caseHoldRaisedBy?.origin || ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <IoTimeOutline size={13} /> {formatDate(c.caseHoldRaisedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => resumeCaseHold(c)}
                                  disabled={resumingKey === c.workorderId}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  <IoPlayCircleOutline size={16} />
                                  {resumingKey === c.workorderId ? 'Resuming...' : 'Resume Case'}
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
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <IoPauseCircleOutline size={20} className="text-amber-500" /> Check Holds (single check paused)
              </h3>
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Workorder</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Check</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Raised By</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Raised At</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {holdsLoading ? (
                        <tr><td colSpan={7} className="py-12 text-center text-gray-500">Loading…</td></tr>
                      ) : checkHolds.length === 0 ? (
                        <tr><td colSpan={7} className="py-12 text-center text-gray-500">No checks on hold.</td></tr>
                      ) : (
                        checkHolds.map((row) => (
                          <tr key={`${row.workorderId}-${row.slNo}`} className="hover:bg-amber-50/40">
                            <td className="px-6 py-4">
                              <span className="font-mono text-[#00D4AA] font-medium text-sm">{row.bgvRef}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">{row.candidateName}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-800 font-medium">{row.checkType}</div>
                              {row.subType && <div className="text-xs text-gray-500 italic">{row.subType}</div>}
                            </td>
                            <td className="px-6 py-4 max-w-sm">
                              <div className="text-xs text-amber-700 line-clamp-2">{row.holdReason || '—'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-gray-600">{row.holdRaisedBy?.name || '—'}</div>
                              <div className="text-[10px] text-gray-400 uppercase">{row.holdRaisedBy?.origin || ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <IoTimeOutline size={13} /> {formatDate(row.holdRaisedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => resumeCheckHold(row)}
                                  disabled={resumingKey === `${row.workorderId}-${row.slNo}`}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  <IoPlayCircleOutline size={16} />
                                  {resumingKey === `${row.workorderId}-${row.slNo}` ? 'Resuming...' : 'Resume Check'}
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
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatCard label="STOPPED CHECKS" value={stoppedChecks.length} color="#EF4444" />
              <StatCard label="STOPPED WORKORDERS" value={stoppedWorkorders.length} color="#F97316" />
            </div>

            <div className="flex justify-end mb-4">
              <button
                onClick={fetchStopped}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600"
                title="Refresh"
              >
                <IoRefreshOutline size={18} />
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm mb-8">
              <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-800">Stopped Checks</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Workorder</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Candidate</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Check</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped By</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stoppedLoading ? (
                      <tr><td colSpan={7} className="py-12 text-center text-gray-500">Loading…</td></tr>
                    ) : stoppedChecks.length === 0 ? (
                      <tr><td colSpan={7} className="py-12 text-center text-gray-500">No stopped checks.</td></tr>
                    ) : (
                      stoppedChecks.map((c) => (
                        <tr key={`${c.workorderId}-${c.slNo}`} className="hover:bg-red-50/30">
                          <td className="px-6 py-4">
                            <span className="font-mono text-red-500 text-sm">{c.bgvRef}</span>
                            {c.partOfWorkorderStop && (
                              <div className="text-[10px] text-orange-500 font-semibold mt-0.5">Part of full workorder stop</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800">{c.candidateName}</td>
                          <td className="px-6 py-4 text-sm text-gray-800">{c.checkType}{c.subType ? ` (${c.subType})` : ''}</td>
                          <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">{c.stopReason || '—'}</td>
                          <td className="px-6 py-4 text-xs text-gray-600">{c.stoppedBy?.name || '—'} ({c.stoppedBy?.origin || '—'})</td>
                          <td className="px-6 py-4"><PaymentBadge paymentDue={c.paymentDue} /></td>
                          <td className="px-6 py-4 text-xs text-gray-500">{formatDate(c.stoppedAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-800">Stopped Workorders</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Workorder</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Candidate</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped By</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stopped At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stoppedLoading ? (
                      <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading…</td></tr>
                    ) : stoppedWorkorders.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-gray-500">No stopped workorders.</td></tr>
                    ) : (
                      stoppedWorkorders.map((w) => (
                        <tr key={w.workorderId} className="hover:bg-orange-50/30">
                          <td className="px-6 py-4">
                            <span className="font-mono text-orange-600 text-sm">{w.bgvRef}</span>
                            <div className="text-xs text-gray-500">{w.checkCount} check{w.checkCount === 1 ? '' : 's'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800">{w.candidateName}</td>
                          <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">{w.stopReason || '—'}</td>
                          <td className="px-6 py-4 text-xs text-gray-600">{w.stoppedBy?.name || '—'} ({w.stoppedBy?.origin || '—'})</td>
                          <td className="px-6 py-4"><PaymentBadge paymentDue={w.paymentDue} /></td>
                          <td className="px-6 py-4 text-xs text-gray-500">{formatDate(w.stoppedAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {assignTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeAssign}>
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assign Check</h3>
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
                <p className="text-xs text-sky-700">The assignee will automatically receive an email notification with a link to this check.</p>
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
                {isAssigning ? 'Assigning...' : 'Assign & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {insufficiencyTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeInsufficiency}>
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <IoAlertCircleOutline size={22} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Raise Insufficiency</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {insufficiencyTarget.bgvRef} — {insufficiencyTarget.checkType}
                    {insufficiencyTarget.subType ? ` (${insufficiencyTarget.subType})` : ''}
                  </p>
                </div>
              </div>
              <button onClick={closeInsufficiency} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-7 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  What is missing / incorrect?
                </label>
                <textarea
                  value={insufficiencyDescription}
                  onChange={(e) => setInsufficiencyDescription(e.target.value)}
                  rows={5}
                  placeholder="e.g. Aadhaar card copy is blurred and unreadable. Please re-upload a clear scan. Previous employer's HR contact number is missing."
                  className="w-full bg-white border border-gray-300 focus:border-red-400 rounded-xl px-4 py-3 text-sm outline-none resize-y"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  This description will be included exactly as written in the email sent to the candidate.
                </p>
              </div>

              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <IoMailOutline size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  The candidate ({insufficiencyTarget.candidateName || 'candidate'}) will be emailed the workorder
                  details and this description automatically. The check will move to the separate
                  Insufficiency screen until it's cleared.
                </p>
              </div>
            </div>

            <div className="px-7 py-5 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={closeInsufficiency} disabled={isRaisingInsufficiency} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={submitInsufficiency}
                disabled={isRaisingInsufficiency || !insufficiencyDescription.trim()}
                className="px-6 py-2.5 bg-red-400 hover:bg-red-500 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <IoAlertCircleOutline size={18} />
                {isRaisingInsufficiency ? 'Raising...' : 'Raise & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {checkHoldTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeCheckHold}>
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                  <IoPauseCircleOutline size={22} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Check Hold</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {checkHoldTarget.bgvRef} — {checkHoldTarget.checkType}
                    {checkHoldTarget.subType ? ` (${checkHoldTarget.subType})` : ''}
                  </p>
                </div>
              </div>
              <button onClick={closeCheckHold} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-7 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Reason for holding this check
                </label>
                <textarea
                  value={checkHoldReason}
                  onChange={(e) => setCheckHoldReason(e.target.value)}
                  rows={5}
                  placeholder="e.g. Waiting on employer HR to respond before this check can proceed."
                  className="w-full bg-white border border-gray-300 focus:border-amber-400 rounded-xl px-4 py-3 text-sm outline-none resize-y"
                />
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <IoMailOutline size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Admin (and the current assignee, if any) will be emailed this reason. This check will move
                  to the "On Hold" tab until it's resumed from there. This is reversible.
                </p>
              </div>
            </div>

            <div className="px-7 py-5 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={closeCheckHold} disabled={isRaisingCheckHold} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={submitCheckHold}
                disabled={isRaisingCheckHold || !checkHoldReason.trim()}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-black rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <IoPauseCircleOutline size={18} />
                {isRaisingCheckHold ? 'Holding...' : 'Hold & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {caseHoldTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeCaseHold}>
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                  <IoBriefcaseOutline size={22} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Case Hold</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {caseHoldTarget.bgvRef} — {caseHoldTarget.candidateName} ({caseHoldTarget.checks?.length || 0} checks)
                  </p>
                </div>
              </div>
              <button onClick={closeCaseHold} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-7 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Reason for holding the entire case
                </label>
                <textarea
                  value={caseHoldReason}
                  onChange={(e) => setCaseHoldReason(e.target.value)}
                  rows={5}
                  placeholder="e.g. Client has requested a temporary pause on this candidate's verification."
                  className="w-full bg-white border border-gray-300 focus:border-amber-400 rounded-xl px-4 py-3 text-sm outline-none resize-y"
                />
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <IoWarningOutline size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  This pauses <b>every check</b> on this workorder at once — not just one. Admin (and the
                  client's Customer Supporter, if resolvable) will be emailed. The whole case moves to the
                  "On Hold" tab until it's resumed from there. This is reversible.
                </p>
              </div>
            </div>

            <div className="px-7 py-5 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={closeCaseHold} disabled={isRaisingCaseHold} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
             <button
                onClick={submitCaseHold}
                disabled={isRaisingCaseHold || !caseHoldReason.trim()}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-90"
              >
                <IoBriefcaseOutline size={18} />
                {isRaisingCaseHold ? 'Holding...' : 'Hold Entire Case'}
              </button>
            </div>
          </div>
        </div>
      )}

      {stopCheckTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeStopCheck}>
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <IoStopCircleOutline size={22} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Stop Check</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {stopCheckTarget.bgvRef} — {stopCheckTarget.checkType}
                    {stopCheckTarget.subType ? ` (${stopCheckTarget.subType})` : ''}
                  </p>
                </div>
              </div>
              <button onClick={closeStopCheck} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-7 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Reason for stopping this check
                </label>
                <textarea
                  value={stopCheckReason}
                  onChange={(e) => setStopCheckReason(e.target.value)}
                  rows={5}
                  placeholder="e.g. Candidate requested cancellation of this specific check."
                  className="w-full bg-white border border-gray-300 focus:border-red-400 rounded-xl px-4 py-3 text-sm outline-none resize-y"
                />
              </div>

              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <IoCardOutline size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">
                  <b>Payment Notice:</b> {paymentPolicyMessage(isPaymentDuePreview(stopCheckTarget.workorderCreatedAt))}
                </p>
              </div>

              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <IoAlertCircleOutline size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  This action is permanent and <b>cannot be undone</b>. Once confirmed, this check remains
                  visible here with status "Stopped" and also appears in Stopped Management. If a client
                  performs this action, the client's Customer Supporter is emailed automatically.
                </p>
              </div>
            </div>

            <div className="px-7 py-5 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={closeStopCheck} disabled={isStoppingCheck} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={submitStopCheck}
                disabled={isStoppingCheck || !stopCheckReason.trim()}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <IoStopCircleOutline size={18} />
                {isStoppingCheck ? 'Stopping...' : 'Stop Check'}
              </button>
            </div>
          </div>
        </div>
      )}

      {stopCaseTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeStopCase}>
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <IoBriefcaseOutline size={22} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Stop Workorder</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {stopCaseTarget.bgvRef} — {stopCaseTarget.candidateName} ({stopCaseTarget.checks?.length || 0} checks)
                  </p>
                </div>
              </div>
              <button onClick={closeStopCase} className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-7 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Reason for stopping the entire workorder
                </label>
                <textarea
                  value={stopCaseReason}
                  onChange={(e) => setStopCaseReason(e.target.value)}
                  rows={5}
                  placeholder="e.g. Client has cancelled this candidate's background verification entirely."
                  className="w-full bg-white border border-gray-300 focus:border-red-400 rounded-xl px-4 py-3 text-sm outline-none resize-y"
                />
              </div>

              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <IoCardOutline size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">
                  <b>Payment Notice:</b> {paymentPolicyMessage(isPaymentDuePreview(stopCaseTarget.workorderCreatedAt))}
                </p>
              </div>

              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <IoAlertCircleOutline size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  This halts <b>every check</b> on this workorder at once and <b>cannot be undone</b>. Once
                  confirmed, this workorder remains visible here with status "Stopped" and also appears in
                  Stopped Management. The client's Customer Supporter is emailed automatically if a client
                  performed this.
                </p>
              </div>
            </div>

            <div className="px-7 py-5 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={closeStopCase} disabled={isStoppingCase} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={submitStopCase}
                disabled={isStoppingCase || !stopCaseReason.trim()}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <IoBriefcaseOutline size={18} />
                {isStoppingCase ? 'Stopping...' : 'Stop Entire Workorder'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {activeRow.stopped && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    This check was permanently stopped{activeRow.stopReason ? `: ${activeRow.stopReason}` : ''}. It is now read-only.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isReadOnly ? (
                  !activeRow.stopped && (
                    <button
                      onClick={() => setModalMode('edit')}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <IoPencilOutline size={16} /> Edit
                    </button>
                  )
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
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned To</div>
                      <div className="text-sm font-semibold text-gray-900">{activeCheck.assignedTo || 'Unassigned'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assignment Type</div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">{activeCheck.assignmentType || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Initiation Mode</div>
                      <div className="text-sm font-semibold text-gray-900">{activeWorkorder?.initiationMode || '—'}</div>
                    </div>
                  </div>

                  {isReadOnly && !activeRow.stopped && (
                    <div className="px-4 py-3 rounded-xl border border-sky-200 bg-sky-50 text-xs text-sky-700">
                      Viewing in read-only mode. Click "Edit" above to make changes.
                    </div>
                  )}

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

            {!isReadOnly && activeCheck && !activeRow.stopped && (
              <div className="px-8 py-5 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                <button onClick={closeDetail} disabled={isSavingDetail} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={() => saveDetail(false)}
                  disabled={isSavingDetail}
                  className="px-6 py-2.5 border border-[#00D4AA] text-[#00806E] rounded-xl font-semibold flex items-center gap-2 hover:bg-[#00D4AA]/10 disabled:opacity-50"
                >
                  <IoSaveOutline size={18} /> {isSavingDetail ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => saveDetail(true)}
                  disabled={isSavingDetail}
                  className="px-6 py-2.5 bg-[#00D4AA] text-black rounded-xl font-semibold flex items-center gap-2 hover:bg-[#00C29A] disabled:opacity-50"
                >
                  <IoCheckmarkDoneOutline size={18} /> {isSavingDetail ? 'Saving...' : 'Save & Mark Complete'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
