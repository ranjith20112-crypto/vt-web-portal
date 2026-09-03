// src/components/CaseReview.jsx
//
// ============================================================================
//  CASE REVIEW — Integrated with /api/workorders backend
//  Actions: View Detail, Download Report, Add Note only
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  IoArrowBackOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoPersonOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoEyeOutline,
  IoSaveOutline,
  IoCheckmarkDoneOutline,
  IoFlagOutline,
  IoChevronForward,
  IoChevronDown,
  IoMailOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoPauseCircleOutline,
  IoStopCircleOutline,
  IoLayersOutline,
  IoDownloadOutline,
  IoChatbubbleOutline,
  IoThumbsUpOutline,
  IoThumbsDownOutline,
  IoReturnDownBackOutline,
  IoDocumentTextOutline,
  IoClipboardOutline,
  IoCalendarOutline,
  IoBusinessOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import api from "../apiroute/apiroute";
import Header from "./header";

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const REVIEW_STATUS_LABELS = {
  "pending-review": "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  "revision-requested": "Revision Requested",
  qc: "In QC",
  stopped: "Stopped",
  open: "Open",
  "in-progress": "In Progress",
  completed: "Completed",
  pending: "Pending",
};

const REVIEW_STATUS_STYLES = {
  "pending-review": "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]",
  approved: "bg-[#D1FAE5] text-[#10B981] border-[#34D399]",
  rejected: "bg-red-50 text-red-600 border-red-300",
  "revision-requested": "bg-amber-50 text-amber-700 border-amber-300",
  qc: "bg-[#EDE9FE] text-[#7C3AED] border-[#A78BFA]",
  stopped: "bg-red-100 text-red-700 border-red-300",
  open: "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]",
  "in-progress": "bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]",
  completed: "bg-[#D1FAE5] text-[#10B981] border-[#34D399]",
  pending: "bg-gray-100 text-gray-600 border-gray-300",
};

const CHECK_STATUS_LABELS = {
  "assignment-pending": "Assignment Pending",
  "verification-pending": "Verification Pending",
  qc: "QC",
  report: "Completed",
  completed: "Completed",
  insufficient: "Insufficient",
  hold: "On Hold",
  stopped: "Stopped",
  pending: "Pending",
  "in-progress": "In Progress",
  open: "Open",
};

const CHECK_STATUS_STYLES = {
  "assignment-pending": "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]",
  "verification-pending": "bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]",
  qc: "bg-[#EDE9FE] text-[#7C3AED] border-[#A78BFA]",
  report: "bg-[#D1FAE5] text-[#10B981] border-[#34D399]",
  completed: "bg-[#D1FAE5] text-[#10B981] border-[#34D399]",
  insufficient: "bg-red-50 text-red-500 border-red-200",
  hold: "bg-amber-50 text-amber-600 border-amber-300",
  stopped: "bg-red-100 text-red-700 border-red-300",
  pending: "bg-gray-100 text-gray-600 border-gray-300",
  "in-progress": "bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]",
  open: "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]",
};

const PRIORITY_LABELS = { high: "High", medium: "Medium", low: "Low", standard: "Standard", urgent: "Urgent" };
const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-sky-50 text-sky-600 border-sky-200",
  standard: "bg-sky-50 text-sky-600 border-sky-200",
  urgent: "bg-red-50 text-red-600 border-red-200",
};

// Date preset options — "Last 3 Months" removed, "Custom Date" added
const DATE_PRESETS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "this-week", label: "This Week" },
  { key: "last-week", label: "Last Week" },
  { key: "this-month", label: "This Month" },
  { key: "last-month", label: "Last Month" },
  { key: "custom", label: "Custom Date" },
];

// Helper: get date range from preset key
const getDateRangeFromPreset = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return { from: today, to: new Date(today.getTime() + 86399999) };
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { from: y, to: new Date(y.getTime() + 86399999) };
    }
    case "this-week": {
      const dayOfWeek = today.getDay() || 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - dayOfWeek + 1);
      return { from: monday, to: new Date(today.getTime() + 86399999) };
    }
    case "last-week": {
      const dayOfWeek = today.getDay() || 7;
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - dayOfWeek + 1);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);
      return { from: lastMonday, to: new Date(lastSunday.getTime() + 86399999) };
    }
    case "this-month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(today.getTime() + 86399999) };
    case "last-month": {
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from: firstOfLastMonth, to: lastOfLastMonth };
    }
    default:
      return null;
  }
};

// ---------------------------------------------------------------------------
// REUSABLE HELPERS
// ---------------------------------------------------------------------------

const isMongoId = (val) => {
  if (!val || typeof val !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(val.trim());
};

const formatClientName = (wo) => {
  const directFields = [
    wo.clientName,
    wo.companyName,
    wo.organizationName,
    wo.orgName,
    wo.clientLabel,
  ];
  for (const f of directFields) {
    if (f && typeof f === "string" && f.trim() && !isMongoId(f)) return f.trim();
  }

  const deepPaths = [
    "client.companyName",
    "client.name",
    "client.clientName",
    "client.label",
    "client.organizationName",
    "client.orgName",
    "clientId.companyName",
    "clientId.name",
    "clientId.clientName",
    "clientId.label",
    "clientId.organizationName",
    "clientDetails.companyName",
    "clientDetails.name",
    "clientDetails.clientName",
    "company.companyName",
    "company.name",
    "company.label",
    "organization.companyName",
    "organization.name",
    "organization.organizationName",
    "formData.clientName",
    "formData.companyName",
    "formData.client.label",
    "formData.client.name",
    "formData.clientId.companyName",
    "formData.clientId.name",
    "pkg.clientName",
    "package.clientName",
  ];
  for (const path of deepPaths) {
    const keys = path.split(".");
    let val = wo;
    for (const key of keys) {
      if (val == null || typeof val !== "object") break;
      val = val[key];
    }
    if (val && typeof val === "string" && val.trim() && !isMongoId(val)) return val.trim();
  }

  for (const objKey of ["client", "clientId", "clientDetails"]) {
    const obj = wo[objKey];
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const nameKey of ["companyName", "name", "clientName", "label", "organizationName", "orgName", "displayName", "title", "businessName"]) {
        const v = obj[nameKey];
        if (v && typeof v === "string" && v.trim() && !isMongoId(v)) return v.trim();
      }
      for (const k of Object.keys(obj)) {
        if (k === "_id" || k === "id" || k === "__v") continue;
        const v = obj[k];
        if (v && typeof v === "string" && v.trim() && !isMongoId(v) && v.length > 1 && v.length < 120) return v.trim();
      }
    }
  }

  for (const key of ["client", "clientId", "clientName", "companyName"]) {
    const v = wo[key];
    if (v && typeof v === "string" && v.trim() && !isMongoId(v)) return v.trim();
  }

  return "—";
};

const StatusBadge = ({
  status,
  labels = REVIEW_STATUS_LABELS,
  styles = REVIEW_STATUS_STYLES,
}) => {
  const s = (status || "pending").toLowerCase();
  const cls = styles[s] || "bg-gray-100 text-gray-600 border-gray-300";
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${cls}`}>
      {labels[s] || status || "—"}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  if (!priority) return <span className="text-xs text-gray-400">—</span>;
  const p = (priority || "").toLowerCase();
  const cls = PRIORITY_STYLES[p] || "bg-gray-100 text-gray-600 border-gray-300";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase ${cls}`}>
      <IoFlagOutline size={10} className="mr-1" />
      {PRIORITY_LABELS[p] || priority}
    </span>
  );
};

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">{label}</div>
      {Icon && <Icon size={18} style={{ color, opacity: 0.5 }} />}
    </div>
    <div className="text-4xl font-bold" style={{ color }}>{value}</div>
  </div>
);

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day}-${month}-${year} ${time}`;
};

const formatDateShort = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

const getEmployeeIdentity = () => {
  try {
    const raw = localStorage.getItem("employee") || localStorage.getItem("user") || "{}";
    const parsed = JSON.parse(raw) || {};
    return {
      origin: "employee",
      name: parsed.name || parsed.fullName || parsed.displayName || "Employee",
      email: parsed.email || "",
      userId: parsed._id || parsed.id || "",
    };
  } catch {
    return { origin: "employee", name: "Employee", email: "", userId: "" };
  }
};

const deepGet = (obj, ...paths) => {
  for (const path of paths) {
    const keys = path.split(".");
    let val = obj;
    for (const key of keys) {
      if (val == null || typeof val !== "object") break;
      val = val[key];
    }
    if (val && typeof val === "string" && val.trim()) return val.trim();
    if (val && typeof val !== "object") return String(val);
  }
  return "";
};

// Convert a date input value (YYYY-MM-DD) to start of day Date object
const inputToDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

// Convert a date input value (YYYY-MM-DD) to end of day Date object
const inputToDateEnd = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
};

// ---------------------------------------------------------------------------
// EMPTY STATE
// ---------------------------------------------------------------------------
const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
      <Icon size={36} className="text-gray-300" />
    </div>
    <div className="text-base font-semibold text-gray-500 mb-1">{title}</div>
    <div className="text-sm text-gray-400">{subtitle}</div>
  </div>
);

// ---------------------------------------------------------------------------
// SKELETON LOADER
// ---------------------------------------------------------------------------
const TableSkeleton = ({ cols = 8, rows = 6 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, ri) => (
      <tr key={ri} className="border-b border-gray-100">
        {Array.from({ length: cols }).map((_, ci) => (
          <td key={ci} className="px-6 py-5">
            <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================
const CaseReview = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending-review");
  const [allWorkorders, setAllWorkorders] = useState([]);
  const [stats, setStats] = useState({
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    revisionRequested: 0,
    totalReviewedToday: 0,
    avgTurnaroundHours: 0,
  });
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [clientFilter, setClientFilter] = useState("all");
  const [clientOptions, setClientOptions] = useState([]);

  const [expandedCases, setExpandedCases] = useState(new Set());

  const [noteTarget, setNoteTarget] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [detailCase, setDetailCase] = useState(null);
  const [detailChecks, setDetailChecks] = useState([]);
  const [detailNotes, setDetailNotes] = useState([]);
  const [detailTab, setDetailTab] = useState("checks");

  const [downloadingId, setDownloadingId] = useState(null);

  const [notification, setNotification] = useState(null);
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3200);
  };

  // Handle date preset change
  const handleDatePresetChange = (value) => {
    setDatePreset(value);
    if (value === "custom") {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      setCustomDateFrom("");
      setCustomDateTo("");
    }
  };

  // Clear custom date — resets back to "All Time"
  const clearCustomDate = () => {
    setCustomDateFrom("");
    setCustomDateTo("");
    setDatePreset("all");
    setShowCustomDate(false);
  };

  // =======================================================================
  // NORMALIZE
  // =======================================================================
  const normalizeWorkorder = useCallback((wo) => {
    const candidateName =
      wo.fullName ||
      wo.candidateName ||
      wo.employeeName ||
      wo.applicantName ||
      wo.name ||
      deepGet(wo,
        "candidate.fullName",
        "candidate.name",
        "candidate.candidateName",
        "candidate.employeeName",
        "candidateId.fullName",
        "candidateId.name",
        "candidateId.candidateName",
        "candidateDetails.fullName",
        "candidateDetails.name",
        "personalInfo.fullName",
        "personalInfo.name",
        "formData.fullName",
        "formData.candidateName",
        "formData.name",
        "employee.fullName",
        "employee.name",
        "employee.employeeName",
        "applicant.fullName",
        "applicant.name"
      ) || "—";

    const candidateEmail =
      wo.email ||
      wo.candidateEmail ||
      deepGet(wo,
        "candidate.email",
        "candidate.emailAddress",
        "candidateId.email",
        "candidateDetails.email",
        "personalInfo.email",
        "personalInfo.emailAddress",
        "formData.email",
        "employee.email",
        "applicant.email"
      ) || "";

    const client = formatClientName(wo);

    const bgvRef =
      wo.bgvRef ||
      wo.referenceId ||
      wo.workorderNumber ||
      wo.workOrderId ||
      wo.woNumber ||
      wo.refNumber ||
      wo.caseId ||
      (wo._id ? wo._id.slice(-10) : "") ||
      "—";

    const priority =
      wo.priority ||
      wo.urgency ||
      wo.priorityLevel ||
      "medium";

    const rawChecks = wo.checks || wo.verificationChecks || wo.checkTypes || wo.checksData || [];
    const checks = rawChecks.map((c, idx) => {
      if (typeof c === "string") {
        return {
          slNo: idx + 1,
          checkType: c,
          subType: "",
          status: "pending",
          assignedTo: "",
          assignmentType: "",
          notes: "",
          insufficiencyReason: "",
          updatedAt: "",
          completedAt: "",
        };
      }
      return {
        slNo: idx + 1,
        checkType: c.checkType || c.checkTypeName || c.name || c.type || c.checkName || c.label || "Unknown",
        subType: c.subType || c.checkSubType || c.subTypeName || c.variant || "",
        status: (c.status || c.checkStatus || c.verificationStatus || "pending").toLowerCase(),
        assignedTo: c.assignedTo || c.verifiedBy || c.verifierName || deepGet(c, "verifier.name", "assignedUser.name") || "",
        assignmentType: c.assignedVia || c.assignmentType || "",
        notes: c.notes || c.remarks || c.comment || c.description || "",
        insufficiencyReason: c.insufficiencyReason || c.insufficiency || "",
        updatedAt: c.updatedAt || c.completedAt || c.verifiedAt || "",
        completedAt: c.completedAt || c.verifiedAt || "",
      };
    });

    const woStatus = (wo.status || wo.workorderStatus || "open").toLowerCase();
    let reviewStatus = "pending-review";

    if (wo.reviewStatus) {
      reviewStatus = (wo.reviewStatus || "").toLowerCase();
    } else {
      if (woStatus === "completed" || woStatus === "approved") reviewStatus = "approved";
      else if (woStatus === "rejected") reviewStatus = "rejected";
      else if (woStatus === "revision-requested" || woStatus === "revision") reviewStatus = "revision-requested";
      else if (woStatus === "qc") reviewStatus = "qc";
      else if (woStatus === "stopped") reviewStatus = "stopped";
    }

    const completedCount = checks.filter(
      (c) => c.status === "report" || c.status === "completed"
    ).length;

    return {
      workorderId: wo._id || wo.workorderId || wo.id || "",
      bgvRef,
      candidateName,
      candidateEmail,
      client,
      priority,
      checks,
      completedCount,
      totalChecks: checks.length,
      reviewStatus,
      submittedAt: wo.submittedAt || wo.createdAt || "",
      updatedAt: wo.updatedAt || "",
      workorderCreatedAt: wo.createdAt || "",
      initiationMode: wo.initiationMode || wo.source || wo.createdVia || "Manual",
      revisionCount: wo.revisionCount || (wo.revisions ? wo.revisions.length : 0),
      reviewHistory: wo.reviewHistory || wo.reviewTimeline || [],
      _raw: wo,
    };
  }, []);

  // =======================================================================
  // FETCH from /api/workorders
  // =======================================================================
  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/workorders");
      const rawData = Array.isArray(res.data)
        ? res.data
        : res.data?.workorders || res.data?.data || res.data?.cases || [];

      const normalized = rawData.map(normalizeWorkorder);
      setAllWorkorders(normalized);

      const clients = [...new Set(
        normalized.map((w) => w.client).filter((c) => c && c !== "—" && !isMongoId(c))
      )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
      setClientOptions(clients);
    } catch (err) {
      console.error("Failed to load workorders:", err);
      showNotification("error", "Failed to load workorders from backend.");
      setAllWorkorders([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeWorkorder]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // =======================================================================
  // COMPUTED: filter + tab + search + date
  // =======================================================================
  const cases = useMemo(() => {
    let filtered = allWorkorders;

    // Tab filter
    if (activeTab === "pending-review") {
      filtered = filtered.filter((c) => c.reviewStatus === "pending-review");
    } else if (activeTab === "approved") {
      filtered = filtered.filter((c) => c.reviewStatus === "approved");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter((c) => c.reviewStatus === "rejected");
    } else if (activeTab === "revision-requested") {
      filtered = filtered.filter((c) => c.reviewStatus === "revision-requested");
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.bgvRef || "").toLowerCase().includes(q) ||
          (c.candidateName || "").toLowerCase().includes(q) ||
          (c.client || "").toLowerCase().includes(q) ||
          (c.candidateEmail || "").toLowerCase().includes(q)
      );
    }

    // Date filter: preset or custom
    if (datePreset === "custom") {
      // Custom date range
      if (customDateFrom) {
        const fromDate = inputToDate(customDateFrom);
        const toDate = customDateTo ? inputToDateEnd(customDateTo) : new Date(Date.now());
        if (fromDate && toDate) {
          filtered = filtered.filter((c) => {
            if (!c.submittedAt) return false;
            const d = new Date(c.submittedAt);
            return d >= fromDate && d <= toDate;
          });
        }
      }
    } else {
      // Preset date range (All Time returns null → no filter)
      const range = getDateRangeFromPreset(datePreset);
      if (range) {
        filtered = filtered.filter((c) => {
          if (!c.submittedAt) return false;
          const d = new Date(c.submittedAt);
          return d >= range.from && d <= range.to;
        });
      }
    }

    // Client filter
    if (clientFilter !== "all") {
      filtered = filtered.filter((c) => c.client === clientFilter);
    }

    return filtered;
  }, [allWorkorders, activeTab, searchQuery, datePreset, customDateFrom, customDateTo, clientFilter]);

  // =======================================================================
  // Compute stats
  // =======================================================================
  useEffect(() => {
    const all = allWorkorders;
    const pendingReview = all.filter((c) => c.reviewStatus === "pending-review").length;
    const approved = all.filter((c) => c.reviewStatus === "approved").length;
    const rejected = all.filter((c) => c.reviewStatus === "rejected").length;
    const revisionRequested = all.filter((c) => c.reviewStatus === "revision-requested").length;

    const today = new Date().toDateString();
    const reviewedToday = all.filter((c) => {
      if (!c.updatedAt) return false;
      return new Date(c.updatedAt).toDateString() === today &&
        (c.reviewStatus === "approved" || c.reviewStatus === "rejected");
    }).length;

    const approvedCases = all.filter((c) => c.reviewStatus === "approved" && c.workorderCreatedAt && c.updatedAt);
    let avgHours = 0;
    if (approvedCases.length > 0) {
      const totalMs = approvedCases.reduce((sum, c) => {
        return sum + (new Date(c.updatedAt) - new Date(c.workorderCreatedAt));
      }, 0);
      avgHours = Math.round(totalMs / approvedCases.length / (1000 * 60 * 60));
    }

    setStats({ pendingReview, approved, rejected, revisionRequested, totalReviewedToday: reviewedToday, avgTurnaroundHours: avgHours });
  }, [allWorkorders]);

  // =======================================================================
  // ACTIONS
  // =======================================================================
  const openNote = (caseRow) => { setNoteTarget(caseRow); setNoteText(""); };
  const closeNote = () => { if (isSavingNote) return; setNoteTarget(null); setNoteText(""); };
  const submitNote = async () => {
    if (!noteTarget) return;
    if (!noteText.trim()) { showNotification("error", "Please write a note before saving."); return; }
    setIsSavingNote(true);
    try {
      await api.put(`/workorders/${noteTarget.workorderId}`, {
        $push: {
          reviewNotes: {
            text: noteText.trim(),
            addedBy: getEmployeeIdentity(),
            addedAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date().toISOString(),
      });
      showNotification("success", "Review note added.");
      setNoteTarget(null);
      setNoteText("");
      fetchCases();
    } catch (err) {
      showNotification("error", err.response?.data?.message || "Failed to add note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const downloadReport = async (caseRow) => {
    setDownloadingId(caseRow.workorderId);
    try {
      const res = await api.get(`/workorders/${caseRow.workorderId}/report`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `CaseReport_${caseRow.bgvRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification("success", `Report downloaded for ${caseRow.bgvRef}.`);
    } catch (err) {
      showNotification("error", "Failed to download report.");
    } finally {
      setDownloadingId(null);
    }
  };

  const openDetail = (caseRow) => {
    setDetailCase(caseRow);
    setDetailChecks(caseRow.checks || []);
    setDetailNotes(caseRow.reviewHistory || []);
    setDetailTab("checks");
  };
  const closeDetail = () => { setDetailCase(null); setDetailChecks([]); setDetailNotes([]); };

  const toggleCase = (workorderId) => {
    setExpandedCases((prev) => {
      const next = new Set(prev);
      if (next.has(workorderId)) next.delete(workorderId);
      else next.add(workorderId);
      return next;
    });
  };

  // =======================================================================
  // RENDER
  // =======================================================================
  return (
    <div className="min-h-screen bg-[#f8fefd] text-gray-900 font-sans">
      <Header showNavigation={false} />

      {notification && (
        <div
          className={`fixed top-20 right-6 z-[130] px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-xl ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {notification.type === "success" ? <IoCheckmarkCircleOutline size={22} /> : <IoCloseOutline size={22} />}
          <span>{notification.message}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* BACK BUTTON */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 transition-all"
          >
            <IoArrowBackOutline size={18} />
            <span>Back</span>
          </button>
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] rounded-2xl flex items-center justify-center">
              <IoClipboardOutline size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Case Review</h1>
              <p className="text-gray-600 mt-1">Review completed verification cases</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/data-management")}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-[#00D4AA] rounded-2xl text-sm font-semibold text-gray-700 hover:text-[#00806E] transition-all shadow-sm"
            >
              <IoLayersOutline size={18} className="text-[#00D4AA]" />
              Data Management
            </button>
            <button
              onClick={() => navigate("/stop-management")}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-red-200 hover:border-red-400 rounded-2xl text-sm font-semibold text-red-600 hover:text-red-700 transition-all shadow-sm"
            >
              <IoStopCircleOutline size={18} />
              Stopped Management
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 mb-6 bg-white border border-gray-200 rounded-2xl p-1.5 w-fit flex-wrap">
          {[
            { key: "pending-review", label: "Pending Review", icon: IoTimeOutline, countKey: "pendingReview", activeColor: "bg-[#00D4AA] text-black" },
            { key: "approved", label: "Approved", icon: IoThumbsUpOutline, countKey: "approved", activeColor: "bg-emerald-500 text-white" },
            { key: "rejected", label: "Rejected", icon: IoThumbsDownOutline, countKey: "rejected", activeColor: "bg-red-500 text-white" },
            { key: "revision-requested", label: "Revision Requested", icon: IoReturnDownBackOutline, countKey: "revisionRequested", activeColor: "bg-amber-500 text-black" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.key ? tab.activeColor : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
              {(stats[tab.countKey] || 0) > 0 && activeTab !== tab.key && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                  {stats[tab.countKey]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard label="PENDING" value={stats.pendingReview || 0} color="#F59E0B" icon={IoTimeOutline} />
          <StatCard label="APPROVED" value={stats.approved || 0} color="#10B981" icon={IoThumbsUpOutline} />
          <StatCard label="REJECTED" value={stats.rejected || 0} color="#EF4444" icon={IoThumbsDownOutline} />
          <StatCard label="REVISIONS" value={stats.revisionRequested || 0} color="#D97706" icon={IoReturnDownBackOutline} />
          <StatCard label="REVIEWED TODAY" value={stats.totalReviewedToday || 0} color="#3B82F6" icon={IoCheckmarkDoneOutline} />
          <StatCard label="AVG TURNAROUND" value={`${stats.avgTurnaroundHours || 0}h`} color="#7C3AED" icon={IoCalendarOutline} />
        </div>

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
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
            {/* Date Preset Dropdown */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IoCalendarOutline size={14} />
              </div>
              <select
                value={datePreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-600 outline-none focus:border-[#00D4AA] appearance-none cursor-pointer"
              >
                {DATE_PRESETS.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IoChevronDown size={14} />
              </div>
            </div>

            {/* Custom Date Range Inputs — shown only when "Custom Date" is selected */}
            {showCustomDate && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 bg-white text-gray-600 outline-none focus:border-[#00D4AA] cursor-pointer"
                />
                <span className="text-xs text-gray-400 font-medium">to</span>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  min={customDateFrom || undefined}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 bg-white text-gray-600 outline-none focus:border-[#00D4AA] cursor-pointer"
                />
                <button
                  onClick={clearCustomDate}
                  className="p-2 rounded-xl border border-red-200 hover:border-red-400 text-red-400 hover:text-red-600 transition-all"
                  title="Clear date filter"
                >
                  <IoCloseOutline size={14} />
                </button>
              </div>
            )}

            {/* Client Filter */}
            {clientOptions.length > 0 && (
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <IoBusinessOutline size={14} />
                </div>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="pl-8 pr-8 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-600 outline-none focus:border-[#00D4AA] appearance-none cursor-pointer"
                >
                  <option value="all">All Clients</option>
                  {clientOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <IoChevronDown size={14} />
                </div>
              </div>
            )}

            <button onClick={fetchCases} className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600 transition-all" title="Refresh">
              <IoRefreshOutline size={18} />
            </button>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Workorder</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Checks</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Review Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton cols={8} rows={6} />
                ) : cases.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState icon={IoClipboardOutline} title="No cases found" subtitle="Adjust your filters or check back later for new submissions." />
                    </td>
                  </tr>
                ) : (
                  cases.map((caseRow) => {
                    const isExpanded = expandedCases.has(caseRow.workorderId);
                    const progressPct = caseRow.totalChecks > 0 ? Math.round((caseRow.completedCount / caseRow.totalChecks) * 100) : 0;
                    const clientIsFallback = caseRow.client === "—";

                    return (
                      <React.Fragment key={caseRow.workorderId}>
                        <tr
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${caseRow.reviewStatus === "rejected" ? "bg-red-50/20" : ""}`}
                          onClick={() => toggleCase(caseRow.workorderId)}
                        >
                          <td className="px-6 py-5 text-gray-400">
                            {isExpanded ? <IoChevronDown size={18} /> : <IoChevronForward size={18} />}
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono text-[#00D4AA] font-semibold text-sm">{caseRow.bgvRef}</span>
                            {caseRow.revisionCount > 0 && (
                              <div className="text-[10px] text-amber-600 mt-0.5">{caseRow.revisionCount} revision{caseRow.revisionCount > 1 ? "s" : ""} requested</div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-gray-900 text-sm">{caseRow.candidateName}</div>
                            {caseRow.candidateEmail && (
                              <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <IoMailOutline size={10} /> {caseRow.candidateEmail}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            {clientIsFallback ? (
                              <span className="text-xs text-gray-300 italic">Not Available</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <IoBusinessOutline size={13} className="text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{caseRow.client}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-800">{caseRow.completedCount}/{caseRow.totalChecks}</span>
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? "#10B981" : "#F59E0B" }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5"><StatusBadge status={caseRow.reviewStatus} /></td>
                          <td className="px-6 py-5 text-xs text-gray-500 whitespace-nowrap">{formatDateShort(caseRow.submittedAt)}</td>
                          <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => openDetail(caseRow)} title="View Full Case" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-all">
                                <IoEyeOutline size={18} />
                              </button>
                              <button onClick={() => downloadReport(caseRow)} disabled={downloadingId === caseRow.workorderId} title="Download Report" className="p-2 hover:bg-sky-50 rounded-xl text-sky-500 hover:text-sky-600 transition-all disabled:opacity-30">
                                <IoDownloadOutline size={18} className={downloadingId === caseRow.workorderId ? "animate-bounce" : ""} />
                              </button>
                              <button onClick={() => openNote(caseRow)} title="Add Review Note" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-all">
                                <IoChatbubbleOutline size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED PANEL */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="bg-gray-50/70 px-6 py-5">
                              <div className="mb-4 flex items-center justify-between">
                                <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                  <IoDocumentTextOutline size={16} className="text-[#00D4AA]" />
                                  Checks in this case ({caseRow.totalChecks})
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <span className="flex items-center gap-1"><IoPersonOutline size={12} /> Initiated by: {caseRow.initiationMode}</span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1"><IoCalendarOutline size={12} /> Created: {formatDateShort(caseRow.workorderCreatedAt)}</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {(caseRow.checks || []).map((check, idx) => (
                                  <div key={`${caseRow.workorderId}-${check.slNo || idx}`} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900">{check.checkType}</span>
                                        {check.subType && <span className="text-xs text-gray-400 italic">{check.subType}</span>}
                                      </div>
                                      {check.assignedTo && <div className="text-[11px] text-gray-400 mt-0.5">Verified by: {check.assignedTo}</div>}
                                    </div>
                                    <div className="w-36 flex-shrink-0">
                                      <StatusBadge status={check.status} labels={CHECK_STATUS_LABELS} styles={CHECK_STATUS_STYLES} />
                                    </div>
                                    <div className="w-28 flex-shrink-0">
                                      {check.status === "report" || check.status === "completed" ? (
                                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><IoCheckmarkCircleOutline size={14} /> Done</span>
                                      ) : check.status === "stopped" ? (
                                        <span className="text-xs font-medium text-red-500 flex items-center gap-1"><IoStopCircleOutline size={14} /> Stopped</span>
                                      ) : check.status === "insufficient" ? (
                                        <span className="text-xs font-medium text-red-400 flex items-center gap-1"><IoAlertCircleOutline size={14} /> Insufficient</span>
                                      ) : check.status === "hold" ? (
                                        <span className="text-xs font-medium text-amber-500 flex items-center gap-1"><IoPauseCircleOutline size={14} /> On Hold</span>
                                      ) : (
                                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1"><IoTimeOutline size={14} /> In Progress</span>
                                      )}
                                    </div>
                                    <div className="w-40 flex-shrink-0 text-[11px] text-gray-400">{formatDateShort(check.updatedAt || check.completedAt)}</div>
                                    <div className="flex-shrink-0">
                                      {(check.notes || check.insufficiencyReason) && (
                                        <div className="flex items-center gap-1 text-amber-500" title={check.notes || check.insufficiencyReason}>
                                          <IoChatbubbleOutline size={14} />
                                          <span className="text-[10px] font-medium">Has Notes</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {caseRow.reviewHistory && caseRow.reviewHistory.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-gray-200">
                                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <IoTimeOutline size={13} /> Review History
                                  </div>
                                  <div className="space-y-2">
                                    {caseRow.reviewHistory.map((h, i) => (
                                      <div key={i} className="flex items-start gap-3 text-xs">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${h.action === "approved" ? "bg-emerald-400" : h.action === "rejected" ? "bg-red-400" : "bg-amber-400"}`} />
                                        <div className="flex-1">
                                          <span className="text-gray-700 font-medium">{h.action === "approved" ? "Approved" : h.action === "rejected" ? "Rejected" : "Revision Requested"}</span>
                                          {" by "} <span className="font-semibold">{h.by?.name || "—"}</span>
                                          {h.reason && <span className="text-gray-500 ml-1">— {h.reason}</span>}
                                          <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(h.at)}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
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
      </main>

      {/* NOTE MODAL */}
      {noteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closeNote}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Review Note</h3>
              <button onClick={closeNote} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><IoCloseOutline size={22} /></button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-sm font-semibold text-gray-800">{noteTarget.bgvRef} — {noteTarget.candidateName}</p>
              <p className="text-xs text-gray-500 mt-0.5">Client: {noteTarget.client}</p>
            </div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Note *</label>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} placeholder="Write an internal review note..." className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00D4AA] resize-none mb-6" />
            <div className="flex justify-end gap-3">
              <button onClick={closeNote} disabled={isSavingNote} className="px-6 py-3 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={submitNote} disabled={isSavingNote} className="px-6 py-3 rounded-2xl text-sm font-semibold bg-[#00D4AA] text-black hover:bg-[#00B894] transition-all flex items-center gap-2 disabled:opacity-50">
                {isSavingNote ? <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> : <IoSaveOutline size={16} />}
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL SLIDE-OVER PANEL */}
      {detailCase && (
        <div className="fixed inset-0 z-[120] flex justify-end" onClick={closeDetail}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto" style={{ animation: "slideIn 0.3s ease" }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Case Details</h3>
                <p className="text-xs text-gray-500 font-mono">{detailCase.bgvRef}</p>
              </div>
              <button onClick={closeDetail} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><IoCloseOutline size={22} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Candidate</p>
                  <p className="text-sm font-semibold text-gray-900">{detailCase.candidateName}</p>
                  {detailCase.candidateEmail && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <IoMailOutline size={11} /> {detailCase.candidateEmail}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Client</p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <IoBusinessOutline size={13} className="text-gray-400" />
                    {detailCase.client}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Review Status</p>
                  <StatusBadge status={detailCase.reviewStatus} />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</p>
                  <PriorityBadge priority={detailCase.priority} />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Submitted</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(detailCase.submittedAt)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(detailCase.updatedAt)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Check Progress</span>
                  <span className="text-sm font-bold text-gray-800">{detailCase.completedCount}/{detailCase.totalChecks}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${detailCase.totalChecks > 0 ? Math.round((detailCase.completedCount / detailCase.totalChecks) * 100) : 0}%`,
                      backgroundColor: detailCase.completedCount === detailCase.totalChecks ? "#10B981" : "#F59E0B",
                    }}
                  />
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setDetailTab("checks")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${detailTab === "checks" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Checks ({detailCase.totalChecks})
                </button>
                <button
                  onClick={() => setDetailTab("notes")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${detailTab === "notes" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Review Notes
                </button>
              </div>

              {detailTab === "checks" && (
                <div className="space-y-3">
                  {detailChecks.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No checks found in this case.</p>
                  ) : (
                    detailChecks.map((check, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{check.checkType}</span>
                            {check.subType && <span className="text-xs text-gray-400 italic">{check.subType}</span>}
                          </div>
                          {check.assignedTo && <div className="text-[11px] text-gray-400 mt-0.5">Verified by: {check.assignedTo}</div>}
                          {check.notes && <div className="text-[11px] text-gray-500 mt-1 italic">"{check.notes}"</div>}
                          {check.insufficiencyReason && <div className="text-[11px] text-red-500 mt-1">Insufficiency: {check.insufficiencyReason}</div>}
                        </div>
                        <div className="w-36 flex-shrink-0">
                          <StatusBadge status={check.status} labels={CHECK_STATUS_LABELS} styles={CHECK_STATUS_STYLES} />
                        </div>
                        <div className="w-32 flex-shrink-0 text-[11px] text-gray-400">{formatDateShort(check.updatedAt || check.completedAt)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === "notes" && (
                <div>
                  {detailNotes.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No review notes yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {detailNotes.map((note, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-700">{note.by?.name || "Unknown"}</span>
                            <span className="text-[10px] text-gray-400">{formatDate(note.at || note.addedAt)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{note.text || note.reason || note.note || "—"}</p>
                          {note.action && (
                            <div className="mt-2">
                              <StatusBadge status={note.action} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => downloadReport(detailCase)}
                  disabled={downloadingId === detailCase.workorderId}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <IoDownloadOutline size={16} />
                  {downloadingId === detailCase.workorderId ? "Downloading..." : "Download Report"}
                </button>
                <button
                  onClick={() => { openNote(detailCase); closeDetail(); }}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  <IoChatbubbleOutline size={16} />
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline style for slide animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CaseReview;