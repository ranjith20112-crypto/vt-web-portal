// src/employee-screens/FieldVisit.jsx
//
// ============================================================================
//  FIELD VISIT — Integrated with /api/field-visits backend
//  Actions: View Detail, Download Report, Add Note
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
  IoMapOutline,
  IoLocationOutline,
  IoCallOutline,
  IoCameraOutline,
  IoNavigateOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoImageOutline,
  IoReceiptOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import api from "../apiroute/apiroute";

// >>> CHANGE THIS PATH to match where your Header component lives <<<
import Header from "./header";

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const VISIT_STATUS_LABELS = {
  "scheduled": "Scheduled",
  "in-progress": "In Progress",
  completed: "Completed",
  "needs-reschedule": "Needs Reschedule",
  cancelled: "Cancelled",
  "no-show": "No Show",
  "partially-completed": "Partially Completed",
  pending: "Pending",
  hold: "On Hold",
  stopped: "Stopped",
  "report-generated": "Report Generated",
};

const VISIT_STATUS_STYLES = {
  "scheduled": "bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]",
  "in-progress": "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]",
  completed: "bg-[#D1FAE5] text-[#10B981] border-[#34D399]",
  "needs-reschedule": "bg-amber-50 text-amber-700 border-amber-300",
  cancelled: "bg-red-50 text-red-600 border-red-300",
  "no-show": "bg-red-100 text-red-700 border-red-300",
  "partially-completed": "bg-orange-50 text-orange-600 border-orange-300",
  pending: "bg-gray-100 text-gray-600 border-gray-300",
  hold: "bg-amber-50 text-amber-600 border-amber-300",
  stopped: "bg-red-100 text-red-700 border-red-300",
  "report-generated": "bg-[#EDE9FE] text-[#7C3AED] border-[#A78BFA]",
};

const TASK_STATUS_LABELS = {
  "pending": "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  skipped: "Skipped",
  "not-applicable": "N/A",
  failed: "Failed",
  "insufficient": "Insufficient",
};

const TASK_STATUS_STYLES = {
  "pending": "bg-gray-100 text-gray-600 border-gray-300",
  "in-progress": "bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]",
  completed: "bg-[#D1FAE5] text-[#10B981] border-[#34D399]",
  skipped: "bg-sky-50 text-sky-600 border-sky-200",
  "not-applicable": "bg-gray-50 text-gray-400 border-gray-200",
  failed: "bg-red-50 text-red-500 border-red-200",
  "insufficient": "bg-orange-50 text-orange-600 border-orange-300",
};

const PRIORITY_LABELS = {
  high: "High",
  medium: "Medium",
  low: "Low",
  standard: "Standard",
  urgent: "Urgent",
};

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-sky-50 text-sky-600 border-sky-200",
  standard: "bg-sky-50 text-sky-600 border-sky-200",
  urgent: "bg-red-50 text-red-600 border-red-200",
};

const VISIT_TYPE_LABELS = {
  "address-verification": "Address Verification",
  "residence-check": "Residence Check",
  "office-verification": "Office Verification",
  "site-visit": "Site Visit",
  "reference-check": "Reference Check",
  "neighborhood-check": "Neighborhood Check",
  "employment-verification": "Employment Verification",
  "education-verification": "Education Verification",
  "other": "Other",
};

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

// ---------------------------------------------------------------------------
// DATE HELPERS
// ---------------------------------------------------------------------------
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
      const dw = today.getDay() || 7;
      const mon = new Date(today);
      mon.setDate(today.getDate() - dw + 1);
      return { from: mon, to: new Date(today.getTime() + 86399999) };
    }
    case "last-week": {
      const dw = today.getDay() || 7;
      const thisMon = new Date(today);
      thisMon.setDate(today.getDate() - dw + 1);
      const lastMon = new Date(thisMon);
      lastMon.setDate(thisMon.getDate() - 7);
      const lastSun = new Date(thisMon);
      lastSun.setDate(thisMon.getDate() - 1);
      return { from: lastMon, to: new Date(lastSun.getTime() + 86399999) };
    }
    case "this-month":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(today.getTime() + 86399999),
      };
    case "last-month": {
      const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const l = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from: f, to: l };
    }
    default:
      return null;
  }
};

// ---------------------------------------------------------------------------
// REUSABLE HELPERS
// ---------------------------------------------------------------------------
const isMongoId = (v) =>
  v && typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v.trim());

const formatClientName = (wo) => {
  const directFields = [
    wo.clientName,
    wo.companyName,
    wo.organizationName,
    wo.orgName,
    wo.clientLabel,
  ];
  for (const f of directFields) {
    if (f && typeof f === "string" && f.trim() && !isMongoId(f))
      return f.trim();
  }
  const deepPaths = [
    "client.companyName",
    "client.name",
    "client.clientName",
    "client.label",
    "clientId.companyName",
    "clientId.name",
    "clientId.clientName",
    "clientDetails.companyName",
    "clientDetails.name",
    "company.companyName",
    "company.name",
    "organization.companyName",
    "organization.name",
    "formData.clientName",
    "formData.companyName",
  ];
  for (const path of deepPaths) {
    const keys = path.split(".");
    let val = wo;
    for (const k of keys) {
      if (val == null || typeof val !== "object") break;
      val = val[k];
    }
    if (val && typeof val === "string" && val.trim() && !isMongoId(val))
      return val.trim();
  }
  for (const ok of ["client", "clientId", "clientDetails"]) {
    const obj = wo[ok];
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const nk of [
        "companyName",
        "name",
        "clientName",
        "label",
        "organizationName",
        "displayName",
        "businessName",
      ]) {
        const v = obj[nk];
        if (v && typeof v === "string" && v.trim() && !isMongoId(v))
          return v.trim();
      }
    }
  }
  return "—";
};

const StatusBadge = ({
  status,
  labels = VISIT_STATUS_LABELS,
  styles = VISIT_STATUS_STYLES,
}) => {
  const s = (status || "pending").toLowerCase();
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
        styles[s] || "bg-gray-100 text-gray-600 border-gray-300"
      }`}
    >
      {labels[s] || status || "—"}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  if (!priority) return <span className="text-xs text-gray-400">—</span>;
  const p = (priority || "").toLowerCase();
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase ${
        PRIORITY_STYLES[p] || "bg-gray-100 text-gray-600 border-gray-300"
      }`}
    >
      <IoFlagOutline size={10} className="mr-1" />
      {PRIORITY_LABELS[p] || priority}
    </span>
  );
};

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
        {label}
      </div>
      {Icon && <Icon size={18} style={{ color, opacity: 0.5 }} />}
    </div>
    <div className="text-4xl font-bold" style={{ color }}>
      {value}
    </div>
  </div>
);

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day}-${month}-${year} ${time}`;
};

const formatDateShort = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEmployeeIdentity = () => {
  try {
    const r =
      localStorage.getItem("employee") ||
      localStorage.getItem("user") ||
      "{}";
    const p = JSON.parse(r) || {};
    return {
      origin: "employee",
      name: p.name || p.fullName || p.displayName || "Employee",
      email: p.email || "",
      userId: p._id || p.id || "",
    };
  } catch {
    return { origin: "employee", name: "Employee", email: "", userId: "" };
  }
};

const deepGet = (obj, ...paths) => {
  for (const path of paths) {
    const keys = path.split(".");
    let val = obj;
    for (const k of keys) {
      if (val == null || typeof val !== "object") break;
      val = val[k];
    }
    if (val && typeof val === "string" && val.trim()) return val.trim();
    if (val && typeof val !== "object") return String(val);
  }
  return "";
};

const inputToDate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

const inputToDateEnd = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
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
const TableSkeleton = ({ cols = 9, rows = 6 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, ri) => (
      <tr key={ri} className="border-b border-gray-100">
        {Array.from({ length: cols }).map((_, ci) => (
          <td key={ci} className="px-6 py-5">
            <div
              className="h-4 bg-gray-100 rounded-lg animate-pulse"
              style={{ width: `${50 + Math.random() * 50}%` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

// ---------------------------------------------------------------------------
// PROGRESS RING (for detail modal)
// ---------------------------------------------------------------------------
const ProgressRing = ({
  percentage,
  size = 64,
  strokeWidth = 5,
  color = "#00D4AA",
}) => {
  const r = (size - strokeWidth) / 2;
  const c = r * 2 * Math.PI;
  const o = c - (percentage / 100) * c;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={c}
        strokeDashoffset={o}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
};

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================
const FieldVisit = () => {
  const navigate = useNavigate();

  // --- State ---
  const [activeTab, setActiveTab] = useState("in-progress");
  const [allVisits, setAllVisits] = useState([]);
  const [stats, setStats] = useState({
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    needsReschedule: 0,
    totalVisitsToday: 0,
    avgCompletionHours: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [clientFilter, setClientFilter] = useState("all");
  const [clientOptions, setClientOptions] = useState([]);
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");

  // UI
  const [expandedVisits, setExpandedVisits] = useState(new Set());
  const [noteTarget, setNoteTarget] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [detailVisit, setDetailVisit] = useState(null);
  const [detailTasks, setDetailTasks] = useState([]);
  const [detailNotes, setDetailNotes] = useState([]);
  const [detailTab, setDetailTab] = useState("tasks");
  const [downloadingId, setDownloadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3200);
  };

  const handleDatePresetChange = (v) => {
    setDatePreset(v);
    setShowCustomDate(v === "custom");
    if (v !== "custom") {
      setCustomDateFrom("");
      setCustomDateTo("");
    }
  };

  const clearCustomDate = () => {
    setCustomDateFrom("");
    setCustomDateTo("");
    setDatePreset("all");
    setShowCustomDate(false);
  };

  // =======================================================================
  // NORMALIZE a raw API object into a flat visit row
  // =======================================================================
  const normalizeVisit = useCallback((fv) => {
    const candidateName =
      fv.fullName ||
      fv.candidateName ||
      fv.employeeName ||
      fv.applicantName ||
      fv.name ||
      deepGet(
        fv,
        "candidate.fullName",
        "candidate.name",
        "candidate.candidateName",
        "candidateId.fullName",
        "candidateId.name",
        "candidateDetails.fullName",
        "candidateDetails.name",
        "personalInfo.fullName",
        "personalInfo.name",
        "formData.fullName",
        "formData.candidateName",
        "formData.name",
        "employee.fullName",
        "employee.name"
      ) ||
      "—";

    const candidateEmail =
      fv.email ||
      fv.candidateEmail ||
      deepGet(
        fv,
        "candidate.email",
        "candidate.emailAddress",
        "candidateId.email",
        "candidateDetails.email",
        "personalInfo.email",
        "formData.email",
        "employee.email"
      ) ||
      "";

    const candidatePhone =
      fv.phone ||
      fv.mobile ||
      fv.contactNumber ||
      fv.phoneNumber ||
      deepGet(
        fv,
        "candidate.phone",
        "candidate.mobile",
        "candidateId.phone",
        "personalInfo.phone",
        "formData.phone",
        "employee.phone"
      ) ||
      "";

    const client = formatClientName(fv);

    const visitRef =
      fv.visitRef ||
      fv.referenceId ||
      fv.fieldVisitId ||
      fv.fvNumber ||
      fv.visitNumber ||
      fv.caseId ||
      fv.bgvRef ||
      (fv._id ? fv._id.slice(-10) : "") ||
      "—";

    const priority = fv.priority || fv.urgency || fv.priorityLevel || "medium";
    const visitType =
      fv.visitType || fv.type || fv.verificationType || fv.checkType || "other";

    const visitAddress =
      fv.address ||
      fv.visitAddress ||
      fv.location ||
      fv.siteAddress ||
      deepGet(
        fv,
        "address.fullAddress",
        "address.addressLine1",
        "visitDetails.address",
        "visitDetails.location",
        "formData.address",
        "candidate.address",
        "personalInfo.address"
      ) ||
      "—";

    const visitCity =
      fv.city ||
      deepGet(
        fv,
        "address.city",
        "visitDetails.city",
        "formData.city",
        "candidate.city",
        "personalInfo.city"
      ) ||
      "";

    const visitState =
      fv.state ||
      deepGet(
        fv,
        "address.state",
        "visitDetails.state",
        "formData.state",
        "candidate.state",
        "personalInfo.state"
      ) ||
      "";

    const scheduledDate =
      fv.scheduledDate || fv.scheduledAt || fv.visitDate || fv.date || "";
    const scheduledTime = fv.scheduledTime || fv.visitTime || fv.time || "";

    const assignedTo =
      fv.assignedTo ||
      fv.fieldAgent ||
      fv.agentName ||
      fv.verifierName ||
      deepGet(
        fv,
        "assignedUser.name",
        "agent.name",
        "fieldAgent.name",
        "verifier.name"
      ) ||
      "—";

    const rawTasks = fv.tasks || fv.visitTasks || fv.checklist || fv.taskItems || [];
    const tasks = rawTasks.map((t, idx) => {
      if (typeof t === "string") {
        return {
          slNo: idx + 1,
          taskName: t,
          description: "",
          status: "pending",
          completedBy: "",
          notes: "",
          photos: [],
          completedAt: "",
        };
      }
      return {
        slNo: idx + 1,
        taskName:
          t.taskName ||
          t.name ||
          t.checkType ||
          t.label ||
          t.title ||
          "Unknown Task",
        description: t.description || t.details || t.remarks || "",
        status: (t.status || t.taskStatus || "pending").toLowerCase(),
        completedBy:
          t.completedBy ||
          t.verifiedBy ||
          deepGet(t, "completedUser.name", "verifier.name") ||
          "",
        notes: t.notes || t.remarks || t.comment || "",
        photos: t.photos || t.images || t.evidence || [],
        completedAt: t.completedAt || t.verifiedAt || "",
      };
    });

    const visitStatus = (fv.status || fv.visitStatus || "pending").toLowerCase();
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const photosCount =
      tasks.reduce((s, t) => s + (t.photos ? t.photos.length : 0), 0) +
      (fv.photos ? fv.photos.length : 0) +
      (fv.evidence ? fv.evidence.length : 0);
    const hasReport =
      fv.reportGenerated ||
      fv.hasReport ||
      fv.reportUrl ||
      visitStatus === "report-generated";

    return {
      visitId: fv._id || fv.visitId || fv.id || "",
      visitRef,
      candidateName,
      candidateEmail,
      candidatePhone,
      client,
      priority,
      visitType,
      visitAddress,
      visitCity,
      visitState,
      scheduledDate,
      scheduledTime,
      assignedTo,
      tasks,
      completedTasks,
      totalTasks: tasks.length,
      visitStatus,
      photosCount,
      hasReport,
      submittedAt: fv.submittedAt || fv.completedAt || "",
      updatedAt: fv.updatedAt || "",
      createdAt: fv.createdAt || "",
      revisionCount:
        fv.revisionCount || (fv.revisions ? fv.revisions.length : 0),
      reviewNotes: fv.reviewNotes || fv.notes || [],
      visitHistory: fv.visitHistory || fv.timeline || [],
      _raw: fv,
    };
  }, []);

  // =======================================================================
  // FETCH from /api/field-visits
  // =======================================================================
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/field-visits");
      const raw = Array.isArray(res.data)
        ? res.data
        : res.data?.fieldVisits || res.data?.data || res.data?.visits || [];
      const norm = raw.map(normalizeVisit);
      setAllVisits(norm);

      const cls = [
        ...new Set(
          norm
            .map((v) => v.client)
            .filter((c) => c && c !== "—" && !isMongoId(c))
        ),
      ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
      setClientOptions(cls);
    } catch (e) {
      console.error("Failed to load field visits:", e);
      showNotification("error", "Failed to load field visits.");
      setAllVisits([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeVisit]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // =======================================================================
  // COMPUTED: filtered visits
  // =======================================================================
  const visits = useMemo(() => {
    let f = allVisits;

    // Tab filter
    if (activeTab === "scheduled")
      f = f.filter((v) => v.visitStatus === "scheduled");
    else if (activeTab === "in-progress")
      f = f.filter((v) => v.visitStatus === "in-progress");
    else if (activeTab === "completed")
      f = f.filter(
        (v) => v.visitStatus === "completed" || v.visitStatus === "report-generated"
      );
    else if (activeTab === "needs-reschedule")
      f = f.filter(
        (v) =>
          v.visitStatus === "needs-reschedule" ||
          v.visitStatus === "no-show" ||
          v.visitStatus === "cancelled"
      );

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter(
        (v) =>
          (v.visitRef || "").toLowerCase().includes(q) ||
          (v.candidateName || "").toLowerCase().includes(q) ||
          (v.client || "").toLowerCase().includes(q) ||
          (v.candidateEmail || "").toLowerCase().includes(q) ||
          (v.visitAddress || "").toLowerCase().includes(q) ||
          (v.assignedTo || "").toLowerCase().includes(q)
      );
    }

    // Date
    if (datePreset === "custom") {
      if (customDateFrom) {
        const fr = inputToDate(customDateFrom);
        const to = customDateTo
          ? inputToDateEnd(customDateTo)
          : new Date();
        if (fr && to)
          f = f.filter((v) => {
            if (!v.scheduledDate) return false;
            const d = new Date(v.scheduledDate);
            return d >= fr && d <= to;
          });
      }
    } else {
      const range = getDateRangeFromPreset(datePreset);
      if (range)
        f = f.filter((v) => {
          if (!v.scheduledDate) return false;
          const d = new Date(v.scheduledDate);
          return d >= range.from && d <= range.to;
        });
    }

    // Client
    if (clientFilter !== "all")
      f = f.filter((v) => v.client === clientFilter);

    // Visit type
    if (visitTypeFilter !== "all")
      f = f.filter((v) => v.visitType === visitTypeFilter);

    return f;
  }, [
    allVisits,
    activeTab,
    searchQuery,
    datePreset,
    customDateFrom,
    customDateTo,
    clientFilter,
    visitTypeFilter,
  ]);

  // =======================================================================
  // COMPUTE stats
  // =======================================================================
  useEffect(() => {
    const a = allVisits;
    const scheduled = a.filter((v) => v.visitStatus === "scheduled").length;
    const inProgress = a.filter(
      (v) => v.visitStatus === "in-progress"
    ).length;
    const completed = a.filter(
      (v) => v.visitStatus === "completed" || v.visitStatus === "report-generated"
    ).length;
    const needsReschedule = a.filter(
      (v) =>
        v.visitStatus === "needs-reschedule" ||
        v.visitStatus === "no-show" ||
        v.visitStatus === "cancelled"
    ).length;

    const today = new Date().toDateString();
    const visitsToday = a.filter(
      (v) => v.scheduledDate && new Date(v.scheduledDate).toDateString() === today
    ).length;

    const cv = a.filter(
      (v) =>
        (v.visitStatus === "completed" ||
          v.visitStatus === "report-generated") &&
        v.scheduledDate &&
        v.submittedAt
    );
    let avg = 0;
    if (cv.length > 0) {
      const ms = cv.reduce(
        (s, v) =>
          s + (new Date(v.submittedAt) - new Date(v.scheduledDate)),
        0
      );
      avg = Math.round(ms / cv.length / (1000 * 60 * 60));
    }

    setStats({
      scheduled,
      inProgress,
      completed,
      needsReschedule,
      totalVisitsToday: visitsToday,
      avgCompletionHours: avg,
    });
  }, [allVisits]);

  // =======================================================================
  // ACTIONS
  // =======================================================================
  const openNote = (vr) => {
    setNoteTarget(vr);
    setNoteText("");
  };
  const closeNote = () => {
    if (isSavingNote) return;
    setNoteTarget(null);
    setNoteText("");
  };
  const submitNote = async () => {
    if (!noteTarget) return;
    if (!noteText.trim()) {
      showNotification("error", "Please write a note before saving.");
      return;
    }
    setIsSavingNote(true);
    try {
      await api.put(`/api/field-visits/${noteTarget.visitId}`, {
        $push: {
          reviewNotes: {
            text: noteText.trim(),
            addedBy: getEmployeeIdentity(),
            addedAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date().toISOString(),
      });
      showNotification("success", "Visit note added.");
      setNoteTarget(null);
      setNoteText("");
      fetchVisits();
    } catch (e) {
      showNotification(
        "error",
        e.response?.data?.message || "Failed to add note."
      );
    } finally {
      setIsSavingNote(false);
    }
  };

  const downloadReport = async (vr) => {
    setDownloadingId(vr.visitId);
    try {
      const res = await api.get(`/api/field-visits/${vr.visitId}/report`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FieldVisit_${vr.visitRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification("success", `Report downloaded for ${vr.visitRef}.`);
    } catch (e) {
      showNotification("error", "Failed to download report.");
    } finally {
      setDownloadingId(null);
    }
  };

  const openDetail = (vr) => {
    setDetailVisit(vr);
    setDetailTasks(vr.tasks || []);
    setDetailNotes(vr.reviewNotes || []);
    setDetailTab("tasks");
  };
  const closeDetail = () => {
    setDetailVisit(null);
    setDetailTasks([]);
    setDetailNotes([]);
  };

  const toggleVisit = (id) => {
    setExpandedVisits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // =======================================================================
  // RENDER
  // =======================================================================
  return (
    <div className="min-h-screen bg-[#f8fefd] text-gray-900 font-sans">
      <Header showNavigation={false} />

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-[130] px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-xl ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <IoCheckmarkCircleOutline size={22} />
          ) : (
            <IoCloseOutline size={22} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-900 transition-all"
          >
            <IoArrowBackOutline size={18} />
            <span>Back</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00D4AA] to-[#7C3AED] rounded-2xl flex items-center justify-center">
              <IoMapOutline size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Field Visit
              </h1>
              <p className="text-gray-600 mt-1">
                Track and manage field verification visits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/field-visit-schedule")}
              className="flex items-center gap-2 px-5 py-3 bg-[#00D4AA] hover:bg-[#00B894] text-black rounded-2xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
            >
              <IoCalendarOutline size={18} />
              Schedule Visit
            </button>
            <button
              onClick={() => navigate("/field-agents")}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-[#00D4AA] rounded-2xl text-sm font-semibold text-gray-700 hover:text-[#00806E] transition-all shadow-sm"
            >
              <IoPersonOutline size={18} className="text-[#00D4AA]" />
              Field Agents
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-white border border-gray-200 rounded-2xl p-1.5 w-fit flex-wrap">
          {[
            {
              key: "in-progress",
              label: "In Progress",
              icon: IoNavigateOutline,
              countKey: "inProgress",
              activeColor: "bg-[#00D4AA] text-black",
            },
            {
              key: "scheduled",
              label: "Scheduled",
              icon: IoCalendarOutline,
              countKey: "scheduled",
              activeColor: "bg-[#2563EB] text-white",
            },
            {
              key: "completed",
              label: "Completed",
              icon: IoCheckmarkDoneOutline,
              countKey: "completed",
              activeColor: "bg-emerald-500 text-white",
            },
            {
              key: "needs-reschedule",
              label: "Reschedule / Issues",
              icon: IoWarningOutline,
              countKey: "needsReschedule",
              activeColor: "bg-amber-500 text-black",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? tab.activeColor
                  : "text-gray-500 hover:text-gray-800"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="SCHEDULED"
            value={stats.scheduled || 0}
            color="#2563EB"
            icon={IoCalendarOutline}
          />
          <StatCard
            label="IN PROGRESS"
            value={stats.inProgress || 0}
            color="#F59E0B"
            icon={IoNavigateOutline}
          />
          <StatCard
            label="COMPLETED"
            value={stats.completed || 0}
            color="#10B981"
            icon={IoCheckmarkDoneOutline}
          />
          <StatCard
            label="RESCHEDULE"
            value={stats.needsReschedule || 0}
            color="#D97706"
            icon={IoWarningOutline}
          />
          <StatCard
            label="VISITS TODAY"
            value={stats.totalVisitsToday || 0}
            color="#3B82F6"
            icon={IoMapOutline}
          />
          <StatCard
            label="AVG COMPLETION"
            value={`${stats.avgCompletionHours || 0}h`}
            color="#7C3AED"
            icon={IoTimeOutline}
          />
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <IoSearchOutline size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by visit ID, candidate, address or agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 focus:border-[#00D4AA] pl-12 py-3.5 rounded-2xl text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Preset */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IoCalendarOutline size={14} />
              </div>
              <select
                value={datePreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-600 outline-none focus:border-[#00D4AA] appearance-none cursor-pointer"
              >
                {DATE_PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IoChevronDown size={14} />
              </div>
            </div>

            {/* Custom Date Range */}
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

            {/* Visit Type Filter */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IoNavigateOutline size={14} />
              </div>
              <select
                value={visitTypeFilter}
                onChange={(e) => setVisitTypeFilter(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-600 outline-none focus:border-[#00D4AA] appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                {Object.entries(VISIT_TYPE_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <IoChevronDown size={14} />
              </div>
            </div>

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
                  {clientOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <IoChevronDown size={14} />
                </div>
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={fetchVisits}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600 transition-all"
              title="Refresh"
            >
              <IoRefreshOutline size={18} />
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Visit ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Visit Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton cols={9} rows={6} />
                ) : visits.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState
                        icon={IoMapOutline}
                        title="No field visits found"
                        subtitle="Adjust your filters or schedule new visits to get started."
                      />
                    </td>
                  </tr>
                ) : (
                  visits.map((vr) => {
                    const isExp = expandedVisits.has(vr.visitId);
                    const pct =
                      vr.totalTasks > 0
                        ? Math.round(
                            (vr.completedTasks / vr.totalTasks) * 100
                          )
                        : 0;
                    const cliFB = vr.client === "—";
                    const addrFB = vr.visitAddress === "—";
                    const isOverdue =
                      vr.visitStatus === "scheduled" &&
                      vr.scheduledDate &&
                      new Date(vr.scheduledDate) < new Date();

                    return (
                      <React.Fragment key={vr.visitId}>
                        {/* Row */}
                        <tr
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                            vr.visitStatus === "cancelled" ||
                            vr.visitStatus === "no-show"
                              ? "bg-red-50/20"
                              : vr.visitStatus === "needs-reschedule"
                              ? "bg-amber-50/20"
                              : ""
                          }`}
                          onClick={() => toggleVisit(vr.visitId)}
                        >
                          <td className="px-6 py-5 text-gray-400">
                            {isExp ? (
                              <IoChevronDown size={18} />
                            ) : (
                              <IoChevronForward size={18} />
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-mono text-[#00D4AA] font-semibold text-sm">
                              {vr.visitRef}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <PriorityBadge priority={vr.priority} />
                              <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                {VISIT_TYPE_LABELS[vr.visitType] ||
                                  vr.visitType}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-gray-900 text-sm">
                              {vr.candidateName}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              {vr.candidateEmail && (
                                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <IoMailOutline size={10} />{" "}
                                  {vr.candidateEmail}
                                </div>
                              )}
                              {vr.candidatePhone && (
                                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <IoCallOutline size={10} />{" "}
                                  {vr.candidatePhone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-1.5">
                              <IoLocationOutline
                                size={13}
                                className="text-gray-400 flex-shrink-0 mt-0.5"
                              />
                              <div className="min-w-0">
                                {addrFB ? (
                                  <span className="text-xs text-gray-300 italic">
                                    Not Available
                                  </span>
                                ) : (
                                  <>
                                    <div className="text-sm text-gray-600 truncate max-w-[220px]">
                                      {vr.visitAddress}
                                    </div>
                                    {(vr.visitCity || vr.visitState) && (
                                      <div className="text-[11px] text-gray-400 mt-0.5">
                                        {[vr.visitCity, vr.visitState]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-400">
                              <IoPersonOutline size={10} />
                              Agent:{" "}
                              <span className="font-medium text-gray-600">
                                {vr.assignedTo}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-800">
                                {vr.completedTasks}/{vr.totalTasks}
                              </span>
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor:
                                      pct === 100
                                        ? "#10B981"
                                        : vr.visitStatus === "in-progress"
                                        ? "#F59E0B"
                                        : "#D1D5DB",
                                  }}
                                />
                              </div>
                            </div>
                            {vr.photosCount > 0 && (
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                                <IoCameraOutline size={10} />{" "}
                                {vr.photosCount} photo
                                {vr.photosCount > 1 ? "s" : ""}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <StatusBadge status={vr.visitStatus} />
                              {isOverdue && (
                                <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                                  <IoAlertCircleOutline size={10} /> Overdue
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDateShort(vr.scheduledDate)}
                            </div>
                            {vr.scheduledTime && (
                              <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                <IoTimeOutline size={10} />{" "}
                                {vr.scheduledTime}
                              </div>
                            )}
                          </td>
                          <td
                            className="px-6 py-5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openDetail(vr)}
                                title="View Full Visit"
                                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-all"
                              >
                                <IoEyeOutline size={18} />
                              </button>
                              <button
                                onClick={() => downloadReport(vr)}
                                disabled={
                                  downloadingId === vr.visitId ||
                                  !vr.hasReport
                                }
                                title={
                                  vr.hasReport
                                    ? "Download Report"
                                    : "Report not yet generated"
                                }
                                className="p-2 hover:bg-sky-50 rounded-xl text-sky-500 hover:text-sky-600 transition-all disabled:opacity-30"
                              >
                                <IoDownloadOutline
                                  size={18}
                                  className={
                                    downloadingId === vr.visitId
                                      ? "animate-bounce"
                                      : ""
                                  }
                                />
                              </button>
                              <button
                                onClick={() => openNote(vr)}
                                title="Add Visit Note"
                                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-800 transition-all"
                              >
                                <IoChatbubbleOutline size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Panel */}
                        {isExp && (
                          <tr>
                            <td
                              colSpan={9}
                              className="bg-gray-50/70 px-6 py-5"
                            >
                              <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
                                <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                  <IoDocumentTextOutline
                                    size={16}
                                    className="text-[#00D4AA]"
                                  />
                                  Visit Tasks ({vr.totalTasks})
                                  {vr.completedTasks === vr.totalTasks &&
                                    vr.totalTasks > 0 && (
                                      <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                                        <IoCheckmarkCircle size={10} /> All
                                        Done
                                      </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <IoNavigateOutline size={12} />{" "}
                                    {VISIT_TYPE_LABELS[vr.visitType] ||
                                      vr.visitType}
                                  </span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <IoPersonOutline size={12} />{" "}
                                    {vr.assignedTo}
                                  </span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <IoCalendarOutline size={12} /> Created:{" "}
                                    {formatDateShort(vr.createdAt)}
                                  </span>
                                </div>
                              </div>

                              {/* Task Cards */}
                              <div className="space-y-3">
                                {(vr.tasks || []).map((task, idx) => (
                                  <div
                                    key={`${vr.visitId}-${task.slNo || idx}`}
                                    className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                          task.status === "completed"
                                            ? "bg-emerald-100 text-emerald-600"
                                            : task.status === "in-progress"
                                            ? "bg-amber-100 text-amber-600"
                                            : task.status === "failed"
                                            ? "bg-red-100 text-red-500"
                                            : "bg-gray-100 text-gray-400"
                                        }`}
                                      >
                                        {task.slNo}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-gray-900">
                                            {task.taskName}
                                          </span>
                                          {task.description && (
                                            <span className="text-xs text-gray-400 italic hidden lg:inline">
                                              — {task.description}
                                            </span>
                                          )}
                                        </div>
                                        {task.completedBy && (
                                          <div className="text-[11px] text-gray-400 mt-0.5">
                                            Completed by: {task.completedBy}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="w-36 flex-shrink-0">
                                      <StatusBadge
                                        status={task.status}
                                        labels={TASK_STATUS_LABELS}
                                        styles={TASK_STATUS_STYLES}
                                      />
                                    </div>
                                    <div className="w-28 flex-shrink-0">
                                      {task.status === "completed" ? (
                                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                          <IoCheckmarkCircleOutline
                                            size={14}
                                          />{" "}
                                          Done
                                        </span>
                                      ) : task.status === "in-progress" ? (
                                        <span className="text-xs font-medium text-amber-500 flex items-center gap-1">
                                          <IoNavigateOutline size={14} />{" "}
                                          Active
                                        </span>
                                      ) : task.status === "failed" ? (
                                        <span className="text-xs font-medium text-red-500 flex items-center gap-1">
                                          <IoAlertCircleOutline size={14} />{" "}
                                          Failed
                                        </span>
                                      ) : task.status === "skipped" ? (
                                        <span className="text-xs font-medium text-sky-500 flex items-center gap-1">
                                          <IoReturnDownBackOutline
                                            size={14}
                                          />{" "}
                                          Skipped
                                        </span>
                                      ) : (
                                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                          <IoTimeOutline size={14} /> Pending
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 w-48 flex-shrink-0">
                                      {task.photos &&
                                        task.photos.length > 0 && (
                                          <div
                                            className="flex items-center gap-1 text-sky-500"
                                            title={`${task.photos.length} photo(s)`}
                                          >
                                            <IoCameraOutline size={14} />
                                            <span className="text-[10px] font-medium">
                                              {task.photos.length}
                                            </span>
                                          </div>
                                        )}
                                      {task.notes && (
                                        <div
                                          className="flex items-center gap-1 text-amber-500"
                                          title={task.notes}
                                        >
                                          <IoChatbubbleOutline size={14} />
                                          <span className="text-[10px] font-medium">
                                            Notes
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="w-32 flex-shrink-0 text-[11px] text-gray-400">
                                      {formatDateShort(task.completedAt)}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Visit Timeline */}
                              {vr.visitHistory &&
                                vr.visitHistory.length > 0 && (
                                  <div className="mt-5 pt-4 border-t border-gray-200">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                      <IoTimeOutline size={13} /> Visit
                                      Timeline
                                    </div>
                                    <div className="space-y-2">
                                      {vr.visitHistory.map((h, i) => (
                                        <div
                                          key={i}
                                          className="flex items-start gap-3 text-xs"
                                        >
                                          <div
                                            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                              h.action === "completed"
                                                ? "bg-emerald-400"
                                                : h.action === "cancelled" ||
                                                  h.action === "no-show"
                                                ? "bg-red-400"
                                                : h.action === "rescheduled"
                                                ? "bg-amber-400"
                                                : "bg-blue-400"
                                            }`}
                                          />
                                          <div className="flex-1">
                                            <span className="text-gray-700 font-medium capitalize">
                                              {h.action || "Updated"}
                                            </span>{" "}
                                            by{" "}
                                            <span className="font-semibold">
                                              {h.by?.name ||
                                                h.agentName ||
                                                "—"}
                                            </span>
                                            {h.reason && (
                                              <span className="text-gray-500 ml-1">
                                                — {h.reason}
                                              </span>
                                            )}
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                              {formatDate(h.at || h.date)}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* Review Notes */}
                              {vr.reviewNotes &&
                                vr.reviewNotes.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                      <IoChatbubbleOutline size={13} />{" "}
                                      Review Notes
                                    </div>
                                    <div className="space-y-2">
                                      {vr.reviewNotes.map((n, i) => (
                                        <div
                                          key={i}
                                          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-gray-700">
                                              {n.addedBy?.name || "—"}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                              {formatDate(n.addedAt)}
                                            </span>
                                          </div>
                                          <div className="text-gray-600">
                                            {n.text}
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

          {/* Footer Count */}
          {!loading && visits.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="text-xs text-gray-400 font-medium">
                Showing{" "}
                <span className="text-gray-700 font-bold">
                  {visits.length}
                </span>{" "}
                visit{visits.length !== 1 ? "s" : ""}
              </div>
              <div className="text-xs text-gray-400">
                Total:{" "}
                <span className="text-gray-700 font-bold">
                  {allVisits.length}
                </span>{" "}
                visits
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================================================================= */}
      {/* NOTE MODAL                                                      */}
      {/* ================================================================= */}
      {noteTarget && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeNote}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Add Visit Note
              </h3>
              <button
                onClick={closeNote}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <IoMapOutline
                  size={13}
                  className="text-[#00D4AA]"
                />
                <span className="font-mono font-semibold text-[#00D4AA]">
                  {noteTarget.visitRef}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-800">
                {noteTarget.candidateName}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <IoLocationOutline size={10} /> {noteTarget.visitAddress}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Note
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                placeholder="Write your visit note, observation, or instruction..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#00D4AA] rounded-2xl px-5 py-4 text-sm outline-none resize-none placeholder:text-gray-300"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeNote}
                disabled={isSavingNote}
                className="px-6 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitNote}
                disabled={isSavingNote || !noteText.trim()}
                className="px-6 py-3 rounded-2xl text-sm font-bold bg-[#00D4AA] hover:bg-[#00B894] text-black transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {isSavingNote ? (
                  <IoRefreshOutline
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <IoSaveOutline size={16} />
                )}
                {isSavingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* DETAIL MODAL                                                     */}
      {/* ================================================================= */}
      {detailVisit && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Detail Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Visit Details
                </h3>
                <button
                  onClick={closeDetail}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"
                >
                  <IoCloseOutline size={22} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Progress Ring */}
                <div className="relative flex-shrink-0">
                  <ProgressRing
                    percentage={
                      detailVisit.totalTasks > 0
                        ? Math.round(
                            (detailVisit.completedTasks /
                              detailVisit.totalTasks) *
                              100
                          )
                        : 0
                    }
                    color={
                      detailVisit.completedTasks ===
                        detailVisit.totalTasks &&
                      detailVisit.totalTasks > 0
                        ? "#10B981"
                        : "#F59E0B"
                    }
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700">
                      {detailVisit.completedTasks}/{detailVisit.totalTasks}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-[#00D4AA] font-bold">
                      {detailVisit.visitRef}
                    </span>
                    <StatusBadge status={detailVisit.visitStatus} />
                    <PriorityBadge priority={detailVisit.priority} />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {detailVisit.candidateName}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                    {detailVisit.candidateEmail && (
                      <span className="flex items-center gap-1">
                        <IoMailOutline size={12} />{" "}
                        {detailVisit.candidateEmail}
                      </span>
                    )}
                    {detailVisit.candidatePhone && (
                      <span className="flex items-center gap-1">
                        <IoCallOutline size={12} />{" "}
                        {detailVisit.candidatePhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Client
                  </div>
                  <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <IoBusinessOutline
                      size={13}
                      className="text-gray-400"
                    />
                    {detailVisit.client}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Visit Type
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {VISIT_TYPE_LABELS[detailVisit.visitType] ||
                      detailVisit.visitType}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Scheduled
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {formatDateShort(detailVisit.scheduledDate)}
                  </div>
                  {detailVisit.scheduledTime && (
                    <div className="text-xs text-gray-400">
                      {detailVisit.scheduledTime}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Field Agent
                  </div>
                  <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <IoPersonOutline
                      size={13}
                      className="text-gray-400"
                    />
                    {detailVisit.assignedTo}
                  </div>
                </div>
              </div>

              {/* Address Box */}
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Visit Address
                </div>
                <div className="text-sm text-gray-700 flex items-start gap-2">
                  <IoLocationOutline
                    size={15}
                    className="text-[#00D4AA] flex-shrink-0 mt-0.5"
                  />
                  <span>
                    {detailVisit.visitAddress}
                    {detailVisit.visitCity
                      ? `, ${detailVisit.visitCity}`
                      : ""}
                    {detailVisit.visitState
                      ? `, ${detailVisit.visitState}`
                      : ""}
                  </span>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex items-center gap-2 mt-5">
                {[
                  {
                    key: "tasks",
                    label: "Tasks",
                    icon: IoClipboardOutline,
                    count: detailTasks.length,
                  },
                  {
                    key: "notes",
                    label: "Notes",
                    icon: IoChatbubbleOutline,
                    count: detailNotes.length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      detailTab === tab.key
                        ? "bg-[#00D4AA] text-black"
                        : "bg-gray-100 text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <tab.icon size={14} /> {tab.label}
                    {tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          detailTab === tab.key
                            ? "bg-black/10"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {detailTab === "tasks" && (
                <div className="space-y-3">
                  {detailTasks.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No tasks found for this visit.
                    </div>
                  ) : (
                    detailTasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                                task.status === "completed"
                                  ? "bg-emerald-100 text-emerald-600"
                                  : task.status === "in-progress"
                                  ? "bg-amber-100 text-amber-600"
                                  : task.status === "failed"
                                  ? "bg-red-100 text-red-500"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {task.slNo}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {task.taskName}
                              </div>
                              {task.description && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <StatusBadge
                            status={task.status}
                            labels={TASK_STATUS_LABELS}
                            styles={TASK_STATUS_STYLES}
                          />
                        </div>

                        <div className="flex items-center gap-4 ml-11 text-xs text-gray-400 flex-wrap">
                          {task.completedBy && (
                            <span className="flex items-center gap-1">
                              <IoPersonOutline size={11} />{" "}
                              {task.completedBy}
                            </span>
                          )}
                          {task.completedAt && (
                            <span className="flex items-center gap-1">
                              <IoCalendarOutline size={11} />{" "}
                              {formatDate(task.completedAt)}
                            </span>
                          )}
                          {task.photos && task.photos.length > 0 && (
                            <span className="flex items-center gap-1 text-sky-500">
                              <IoCameraOutline size={11} />{" "}
                              {task.photos.length} photo
                              {task.photos.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {task.notes && (
                          <div className="ml-11 mt-3 p-3 bg-white rounded-xl border border-gray-100 text-xs text-gray-600">
                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                              Notes
                            </div>
                            {task.notes}
                          </div>
                        )}

                        {/* Photo Thumbnails */}
                        {task.photos && task.photos.length > 0 && (
                          <div className="ml-11 mt-3 flex items-center gap-2 flex-wrap">
                            {task.photos.map((photo, pi) => (
                              <div
                                key={pi}
                                className="w-16 h-16 rounded-xl bg-gray-200 border border-gray-200 overflow-hidden flex items-center justify-center"
                              >
                                {typeof photo === "string" &&
                                (photo.startsWith("http") ||
                                  photo.startsWith("data:")) ? (
                                  <img
                                    src={photo}
                                    alt={`Task ${task.slNo} photo ${
                                      pi + 1
                                    }`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <IoImageOutline
                                    size={20}
                                    className="text-gray-400"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === "notes" && (
                <div className="space-y-3">
                  {detailNotes.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No notes added yet.
                    </div>
                  ) : (
                    detailNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#00D4AA]/10 flex items-center justify-center">
                              <IoPersonOutline
                                size={14}
                                className="text-[#00D4AA]"
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">
                              {note.addedBy?.name || "—"}
                            </span>
                            {note.addedBy?.email && (
                              <span className="text-xs text-gray-400">
                                {note.addedBy.email}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {formatDate(note.addedAt)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 ml-9">
                          {note.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Detail Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
              <div className="text-xs text-gray-400">
                Created: {formatDate(detailVisit.createdAt)}
                {detailVisit.updatedAt &&
                  detailVisit.updatedAt !== detailVisit.createdAt && (
                    <> · Updated: {formatDate(detailVisit.updatedAt)}</>
                  )}
              </div>
              <div className="flex items-center gap-2">
                {detailVisit.hasReport && (
                  <button
                    onClick={() => downloadReport(detailVisit)}
                    disabled={downloadingId === detailVisit.visitId}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-sky-600 hover:bg-sky-50 border border-sky-200 transition-all disabled:opacity-40"
                  >
                    <IoDownloadOutline
                      size={16}
                      className={
                        downloadingId === detailVisit.visitId
                          ? "animate-bounce"
                          : ""
                      }
                    />
                    Download Report
                  </button>
                )}
                <button
                  onClick={() => {
                    closeDetail();
                    openNote(detailVisit);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all"
                >
                  <IoChatbubbleOutline size={16} />
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldVisit;
