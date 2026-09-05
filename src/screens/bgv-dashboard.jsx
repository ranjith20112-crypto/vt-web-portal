/*============================================================
Dashboard.jsx — Verifitech BGV Dashboard
Light theme · Animated · Responsive

Support section shows a TICKET DASHBOARD — all tickets raised
by clients with stats, filters, status/priority badges, and
an inline "Raise Ticket" form triggered by a button.

Client Dashboard resides under its own sidebar icon with
client-scoped stats, charts, recent cases, billing, and
quick actions including Raise Ticket.
============================================================ */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield, FiBriefcase, FiCheckCircle, FiClock, FiAlertCircle,
  FiSearch, FiCalendar, FiBell, FiSettings, FiChevronDown,
  FiTrendingUp, FiTrendingDown, FiMoreVertical, FiArrowUpRight,
  FiRefreshCw, FiChevronRight, FiUsers, FiGlobe, FiFileText,
  FiDollarSign, FiClipboard, FiGrid, FiBook, FiMapPin,
  FiLayers, FiUserCheck, FiPackage, FiType, FiHome,
  FiUpload, FiSliders, FiPieChart, FiBarChart2, FiActivity,
  FiList, FiCheckSquare, FiAlertTriangle, FiEye, FiMessageSquare,
  FiInbox, FiMap, FiDatabase, FiCreditCard, FiPrinter,
  FiAward, FiHash, FiFlag, FiTool, FiEdit3, FiFolder,
  FiLock, FiMonitor, FiRepeat, FiUserPlus, FiPlusCircle,
  FiMinusCircle, FiNavigation, FiLayout, FiMenu, FiX,
  FiHelpCircle, FiSend, FiPaperclip, FiChevronsDown,
  FiUser, FiDownload, FiExternalLink, FiStar, FiZap,
  FiTarget, FiPercent, FiTruck, FiFilter, FiArrowLeft,
  FiMessageCircle, FiTrash2, FiEdit, FiCheck, FiXCircle
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import theme from '../theme/theme';
import api from '../apiroute/apiroute';
import { getCheckTypeVisual } from '../config/verificationPalette';

/* ───────── Light-theme card colours ───────── */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://backend-9fothcpv0-saaa7.vercel.app';
const API = `${API_BASE_URL}/api`;

const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#D6EDE6';
const CARD_HOVER_BG = '#F0FAF6';

const SIDE_BG_GRADIENT = 'linear-gradient(180deg, #FFFFFF 0%, #F6FBFA 100%)';
const SIDE_BORDER = '#E4F1ED';
const SIDE_TEXT = '#0F2A24';
const SIDE_TEXT_MUTED = '#6E9186';
const SIDE_ITEM_BG = '#FFFFFF';
const SIDE_ITEM_BORDER = '#E7F2EE';
const SIDE_MARGIN = 16;
const SIDE_WIDTH = 260;
const SIDE_RADIUS = 28;

const TEXT_PRIMARY = '#0F2A24';
const TEXT_SECONDARY = '#4A7A6B';
const TEXT_MUTED = '#7FA99C';

/* ───────── Menu Configuration ───────── */
const menuConfig = {
  'BGV Dashboard': {
    icon: FiLayout,
    color: '#06B6D4',
    isDashboard: true,
    items: []
  },
  'Client Dashboard': {
    icon: FiUser,
    color: '#6366F1',
    isClientDashboard: true,
    items: []
  },
  Masters: {
    icon: FiGrid,
    color: '#8B5CF6',
    isDashboard: false,
    items: [
      { name: 'Clients', icon: FiUsers, desc: 'Manage all client accounts' },
      { name: 'Vendors', icon: FiGlobe, desc: 'Vendor management' },
      { name: 'Check Types', icon: FiCheckSquare, desc: 'BGV check categories' },
      { name: 'Packages', icon: FiPackage, desc: 'Service packages & pricing' },
      { name: 'Document Types', icon: FiFileText, desc: 'Required documents' },
      { name: 'Departments', icon: FiHome, desc: 'Internal departments' },
      { name: 'Roles & Permissions', icon: FiLock, desc: 'Access control settings' },
      { name: 'BGV Users', icon: FiUserPlus, desc: 'User accounts & profiles' },
      { name: 'Universities', icon: FiBook, desc: 'University database' },
      { name: 'Courts', icon: FiFlag, desc: 'Court & legal records' },
      { name: 'Company Directory', icon: FiFolder, desc: 'Company listings' },
      { name: 'Form Templates', icon: FiEdit3, desc: 'Custom form builder' },
      { name: 'Check Fields Creation', icon: FiCheckSquare, desc: 'Bulk client import' },
      { name: 'SLA Settings', icon: FiClock, desc: 'Service level agreements' },
    ]
  },
  'Finance & Billing': {
    icon: FiDollarSign,
    color: '#10B981',
    isDashboard: false,
    items: [
      { name: 'Reports', icon: FiBarChart2, desc: 'Financial reports' },
      { name: 'Billing Annexure Report', icon: FiFileText, desc: 'Detailed billing data' },
      { name: 'International Billing Annexure Report', icon: FiGlobe, desc: 'Global billing overview' },
    ]
  },
  'Case Management': {
    icon: FiClipboard,
    color: '#F59E0B',
    isDashboard: false,
    items: [
      { name: 'All Cases', icon: FiList, desc: 'View all cases' },
      // { name: 'Create New Workorder', icon: FiPlusCircle, desc: 'Initiate new workorder' },
      { name: 'Case Reviews', icon: FiEye, desc: 'Review pending cases' },
      // { name: 'Bulk Upload', icon: FiUpload, desc: 'Batch case upload' },
      { name: 'Assignments', icon: FiUserCheck, desc: 'Assign cases to team' },
      { name: 'Insufficiencies', icon: FiAlertTriangle, desc: 'Track insufficiencies' },
      { name: 'Escalations', icon: FiAlertCircle, desc: 'Manage escalations' },
      { name: 'Fee Approvals', icon: FiDollarSign, desc: 'Approve fee requests' },
      { name: 'My Tasks', icon: FiClipboard, desc: 'Personal task list' },
      { name: 'Field Visits', icon: FiMapPin, desc: 'Field visit schedule' },
      { name: 'Verification Log', icon: FiActivity, desc: 'Activity history' },
    ]
  },
  'Quality Control': {
    icon: FiAward,
    color: '#EC4899',
    isDashboard: false,
    items: [
      { name: 'QC Queue', icon: FiInbox, desc: 'Pending QC reviews' },
      { name: 'QC Reviews', icon: FiEye, desc: 'Completed reviews' },
    ]
  },
  Reports: {
    icon: FiPieChart,
    color: '#3B82F6',
    isDashboard: false,
    items: [
      { name: 'Generate Report', icon: FiPrinter, desc: 'Create custom reports' },
      { name: 'Report Delivery', icon: FiNavigation, desc: 'Delivery settings' },
      { name: 'MIS Dashboard', icon: FiMonitor, desc: 'Management dashboard' },
      { name: 'TAT Report', icon: FiClock, desc: 'Turnaround time analysis' },
    ]
  },
  'Data Management': {
    icon: FiDatabase,
    color: '#14B8A6',
    isDashboard: false,
    items: [
      { name: 'Pending Workorders (TL)', icon: FiClipboard, desc: 'Team lead pending workorders' },
      { name: 'Pending Workorders (TM)', icon: FiClipboard, desc: 'Team member pending workorders' },
      { name: 'Insufficiency Management', icon: FiAlertTriangle, desc: 'Manage insufficiencies' },
    ]
  },
  /* ───────── Support: shows ticket dashboard directly ───────── */
  Support: {
    icon: FiHelpCircle,
    color: '#EF4444',
    isSupportDashboard: true,
    items: []
  }
};

/* ───────── Admin Dashboard Mock Data ───────── */
const statsData = [
  { title: 'Total Work Orders', value: 40, icon: FiBriefcase, change: +12, color: theme.colors.accent, colorRgb: theme.colors.accentRgb },
  { title: 'Total Checks', value: 151, icon: FiSearch, change: +8.5, color: theme.colors.indigo, colorRgb: theme.colors.indigoRgb },
  { title: 'Completed', value: 98, icon: FiCheckCircle, change: +24, color: theme.colors.success, colorRgb: theme.colors.successRgb || '16, 185, 129' },
  { title: 'In Progress', value: 42, icon: FiClock, change: -4, color: theme.colors.amber, colorRgb: theme.colors.amberRgb },
  { title: 'Discrepancies', value: 11, icon: FiAlertCircle, change: +2, color: theme.colors.error, colorRgb: theme.colors.errorRgb || '239, 68, 68' },
];

const trendData = [
  { month: 'Jan', checks: 65, wos: 20 },
  { month: 'Feb', checks: 78, wos: 25 },
  { month: 'Mar', checks: 90, wos: 30 },
  { month: 'Apr', checks: 81, wos: 28 },
  { month: 'May', checks: 115, wos: 38 },
  { month: 'Jun', checks: 151, wos: 40 },
];

const checkBreakdown = [
  { name: 'Address', value: 45, color: theme.colors.accent },
  { name: 'Education', value: 38, color: theme.colors.indigo },
  { name: 'Employment', value: 52, color: theme.colors.amber },
  { name: 'Criminal', value: 16, color: theme.colors.error },
];

const billingData = [
  { client: 'TechNova Inc.', wos: 12, checks: 45, amount: '₹1,35,000', status: 'Paid' },
  { client: 'Quantum Corp.', wos: 8, checks: 32, amount: '₹96,000', status: 'Pending' },
  { client: 'Stellar Systems', wos: 10, checks: 38, amount: '₹1,14,000', status: 'Paid' },
  { client: 'Apex Global', wos: 6, checks: 22, amount: '₹66,000', status: 'Overdue' },
  { client: 'Zenith Labs', wos: 4, checks: 14, amount: '₹42,000', status: 'Paid' },
];

/* ───────── CLIENT Dashboard Mock Data ───────── */
const clientStatsData = [
  { title: 'Total Cases', value: 128, icon: FiBriefcase, change: +15, color: '#6366F1', colorRgb: '99,102,241' },
  { title: 'Pending Checks', value: 34, icon: FiClock, change: -8, color: '#F59E0B', colorRgb: '245,158,11' },
  { title: 'Completed', value: 87, icon: FiCheckCircle, change: +22, color: '#10B981', colorRgb: '16,185,129' },
  { title: 'TAT Breaches', value: 5, icon: FiAlertTriangle, change: -3, color: '#EF4444', colorRgb: '239,68,68' },
  { title: 'Clear Cases', value: 79, icon: FiShield, change: +18, color: '#06B6D4', colorRgb: '6,182,212' },
  { title: 'Discrepancies', value: 8, icon: FiAlertCircle, change: +1, color: '#EC4899', colorRgb: '236,72,153' },
];

const clientTrendData = [
  { month: 'Jan', submitted: 12, completed: 8, pending: 4 },
  { month: 'Feb', submitted: 18, completed: 14, pending: 4 },
  { month: 'Mar', submitted: 22, completed: 19, pending: 3 },
  { month: 'Apr', submitted: 15, completed: 12, pending: 3 },
  { month: 'May', submitted: 28, completed: 22, pending: 6 },
  { month: 'Jun', submitted: 33, completed: 26, pending: 7 },
];

const clientCaseStatusData = [
  { name: 'Completed', value: 87, color: '#10B981' },
  { name: 'In Progress', value: 26, color: '#6366F1' },
  { name: 'Pending', value: 8, color: '#F59E0B' },
  { name: 'Insufficiency', value: 4, color: '#EF4444' },
  { name: 'On Hold', value: 3, color: '#7FA99C' },
];

const clientCheckTypeData = [
  { name: 'Address', completed: 32, total: 35, color: '#06B6D4' },
  { name: 'Education', completed: 24, total: 28, color: '#6366F1' },
  { name: 'Employment', completed: 20, total: 30, color: '#F59E0B' },
  { name: 'Criminal', completed: 8, total: 20, color: '#EF4444' },
  { name: 'Reference', completed: 3, total: 15, color: '#10B981' },
];

const clientRecentCases = [
  { id: 'WO-2025-00128', candidate: 'Rahul Sharma', checks: 5, completed: 3, status: 'In Progress', date: '2025-06-28', tat: 'Within SLA' },
  { id: 'WO-2025-00127', candidate: 'Priya Patel', checks: 4, completed: 4, status: 'Completed', date: '2025-06-27', tat: 'Within SLA' },
  { id: 'WO-2025-00126', candidate: 'Amit Kumar', checks: 6, completed: 2, status: 'In Progress', date: '2025-06-26', tat: 'SLA Breach' },
  { id: 'WO-2025-00125', candidate: 'Sneha Reddy', checks: 4, completed: 0, status: 'Pending', date: '2025-06-25', tat: 'Within SLA' },
  { id: 'WO-2025-00124', candidate: 'Vikram Singh', checks: 5, completed: 5, status: 'Completed', date: '2025-06-24', tat: 'Within SLA' },
  { id: 'WO-2025-00123', candidate: 'Deepa Nair', checks: 4, completed: 1, status: 'Insufficiency', date: '2025-06-23', tat: 'Within SLA' },
];

const clientBillingSummary = [
  { label: 'Total Billed', value: '₹4,52,000', icon: FiDollarSign, color: '#6366F1' },
  { label: 'Paid', value: '₹3,68,000', icon: FiCheckCircle, color: '#10B981' },
  { label: 'Pending', value: '₹68,000', icon: FiClock, color: '#F59E0B' },
  { label: 'Overdue', value: '₹16,000', icon: FiAlertCircle, color: '#EF4444' },
];

const clientNotifications = [
  { type: 'success', message: 'Case WO-2025-00127 completed successfully', time: '2 hours ago' },
  { type: 'warning', message: 'TAT breach alert for case WO-2025-00126', time: '5 hours ago' },
  { type: 'info', message: 'Invoice INV-2025-064 generated for ₹68,000', time: '1 day ago' },
  { type: 'error', message: 'Insufficiency raised for Deepa Nair — Employment check', time: '2 days ago' },
  { type: 'success', message: 'Case WO-2025-00124 cleared with no discrepancies', time: '3 days ago' },
];

/* ───────── SUPPORT TICKET Mock Data ───────── */
const SUPPORT_COLOR = '#EF4444';
const SUPPORT_RGB = '239,68,68';

const mockTickets = [
  {
    id: 'TK-20250628-001',
    subject: 'Verification delay for candidate Rahul Sharma',
    category: 'Case / Verification Delay',
    priority: 'High',
    status: 'Open',
    client: 'TechNova Inc.',
    raisedBy: 'Ankit Mehta',
    email: 'ankit@technova.com',
    caseId: 'WO-2025-00128',
    description: 'The employment verification for Rahul Sharma has been pending for over 10 days. SLA is 7 days. Please expedite.',
    createdAt: '2025-06-28 09:15 AM',
    updatedAt: '2025-06-28 10:30 AM',
    assignee: 'Priya Deshmukh',
    replies: 2,
    attachment: 'employment_delay_proof.pdf',
  },
  {
    id: 'TK-20250627-003',
    subject: 'Incorrect billing amount in Invoice INV-2025-061',
    category: 'Billing & Invoice',
    priority: 'Critical',
    status: 'In Progress',
    client: 'Quantum Corp.',
    raisedBy: 'Suresh Iyer',
    email: 'suresh@quantumcorp.com',
    caseId: '',
    description: 'Invoice INV-2025-061 shows ₹1,20,000 but our package rate for 32 checks should be ₹96,000. Difference of ₹24,000 needs correction.',
    createdAt: '2025-06-27 02:45 PM',
    updatedAt: '2025-06-28 11:00 AM',
    assignee: 'Rahul Joshi',
    replies: 5,
    attachment: 'INV-2025-061.pdf',
  },
  {
    id: 'TK-20250626-002',
    subject: 'Unable to download BGV report for Priya Patel',
    category: 'Technical Issue',
    priority: 'Medium',
    status: 'Open',
    client: 'TechNova Inc.',
    raisedBy: 'Ankit Mehta',
    email: 'ankit@technova.com',
    caseId: 'WO-2025-00127',
    description: 'After the case was marked completed, clicking "Download Report" shows an error. Tried on Chrome and Edge, same issue.',
    createdAt: '2025-06-26 04:20 PM',
    updatedAt: '2025-06-26 04:20 PM',
    assignee: null,
    replies: 0,
    attachment: null,
  },
  {
    id: 'TK-20250625-004',
    subject: 'Request for additional check type — Drug Test',
    category: 'Feature Request',
    priority: 'Low',
    status: 'Resolved',
    client: 'Stellar Systems',
    raisedBy: 'Kavita Rao',
    email: 'kavita@stellar.in',
    caseId: '',
    description: 'We would like to add Drug Test as a check type in our package for all new hires starting next quarter.',
    createdAt: '2025-06-25 11:00 AM',
    updatedAt: '2025-06-27 03:30 PM',
    assignee: 'Admin Team',
    replies: 3,
    attachment: null,
  },
  {
    id: 'TK-20250624-001',
    subject: 'SLA breach for 5 cases — Apex Global batch',
    category: 'SLA Violation',
    priority: 'Critical',
    status: 'In Progress',
    client: 'Apex Global',
    raisedBy: 'Deepak Verma',
    email: 'deepak@apexglobal.com',
    caseId: 'WO-2025-00120 to WO-2025-00124',
    description: '5 out of 6 cases submitted on June 18 have breached the 7-day SLA. Only 1 case was completed on time. Need immediate escalation.',
    createdAt: '2025-06-24 09:00 AM',
    updatedAt: '2025-06-28 08:45 AM',
    assignee: 'Operations Lead',
    replies: 8,
    attachment: 'sla_breach_report.xlsx',
  },
  {
    id: 'TK-20250622-002',
    subject: 'Login issue for new team member',
    category: 'Account & Access',
    priority: 'Medium',
    status: 'Closed',
    client: 'Zenith Labs',
    raisedBy: 'Meera Shah',
    email: 'meera@zenithlabs.com',
    caseId: '',
    description: 'New team member Ravi cannot log in. Credentials were shared but login page shows "Account not activated".',
    createdAt: '2025-06-22 10:30 AM',
    updatedAt: '2025-06-22 02:00 PM',
    assignee: 'IT Support',
    replies: 4,
    attachment: null,
  },
  {
    id: 'TK-20250620-003',
    subject: 'Address verification showing wrong location',
    category: 'Bug Report',
    priority: 'High',
    status: 'Resolved',
    client: 'TechNova Inc.',
    raisedBy: 'Ankit Mehta',
    email: 'ankit@technova.com',
    caseId: 'WO-2025-00115',
    description: 'The address verification report for WO-2025-00115 shows "Mumbai" but the candidate resides in "Pune". Pin code is correct (411001).',
    createdAt: '2025-06-20 03:15 PM',
    updatedAt: '2025-06-23 11:20 AM',
    assignee: 'Verification Team',
    replies: 6,
    attachment: 'address_proof.png',
  },
  {
    id: 'TK-20250618-001',
    subject: 'General inquiry about TAT for international checks',
    category: 'General Inquiry',
    priority: 'Low',
    status: 'Closed',
    client: 'Quantum Corp.',
    raisedBy: 'Suresh Iyer',
    email: 'suresh@quantumcorp.com',
    caseId: '',
    description: 'What is the standard TAT for international education and employment verification? Do you have partners in the US and UK?',
    createdAt: '2025-06-18 09:45 AM',
    updatedAt: '2025-06-18 01:00 PM',
    assignee: 'Sales Team',
    replies: 2,
    attachment: null,
  },
];

/* ───────── Ticket Categories & Priorities ───────── */
const ticketCategories = [
  'General Inquiry', 'Technical Issue', 'Case / Verification Delay',
  'Billing & Invoice', 'Report Generation', 'Account & Access',
  'Feature Request', 'Bug Report', 'SLA Violation', 'Other',
];

const ticketPriorities = [
  { label: 'Low', color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
  { label: 'High', color: '#EF4444', bg: 'rgba(239,68,68,0.10)' },
  { label: 'Critical', color: '#7C3AED', bg: 'rgba(124,58,237,0.10)' },
];

const statusConfig = {
  'Open':        { bg: 'rgba(99,102,241,0.10)',  text: '#4F46E5', dot: '#6366F1' },
  'In Progress': { bg: 'rgba(245,158,11,0.10)',  text: '#D97706', dot: '#F59E0B' },
  'Resolved':    { bg: 'rgba(16,185,129,0.10)',  text: '#059669', dot: '#10B981' },
  'Closed':      { bg: 'rgba(127,169,156,0.10)', text: '#4A7A6B', dot: '#7FA99C' },
};

const priorityConfig = {
  'Low':      { color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  'Medium':   { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
  'High':     { color: '#EF4444', bg: 'rgba(239,68,68,0.10)' },
  'Critical': { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)' },
};

/* ───────── Custom Tooltip for Charts ───────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', fontFamily: theme.fonts.body }}>
        <p className="mb-1 font-semibold" style={{ color: TEXT_PRIMARY }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>)}
      </div>
    );
  }
  return null;
};

/* ───────── Animated Counter Hook ───────── */
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let startTime;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return count;
}

/* ───────── Stat Card ───────── */
function StatCard({ title, value, icon: Icon, change, color, colorRgb, delay }) {
  const animatedValue = useCountUp(value, 1200 + delay * 100);
  const isPositive = change >= 0;
  return (
    <div className="relative rounded-2xl p-4 sm:p-5 overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animation: `fadeInUp 0.6s ${0.1 + delay * 0.1}s cubic-bezier(0.34,1.56,0.64,1) both` }}>
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, rgba(${colorRgb},0.08), transparent 60%)` }} />
      <div className="relative flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center" style={{ background: `rgba(${colorRgb}, 0.10)` }}>
          <Icon size={18} className="sm:text-[20px]" style={{ color }} />
        </div>
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md"
          style={{ background: isPositive ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)', color: isPositive ? '#059669' : '#DC2626' }}>
          {isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}{Math.abs(change)}%
        </div>
      </div>
      <div className="relative">
        <h3 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: TEXT_PRIMARY, fontFamily: theme.fonts.display }}>{animatedValue}</h3>
        <p className="text-[10px] sm:text-xs" style={{ color: TEXT_SECONDARY, fontFamily: theme.fonts.body }}>{title}</p>
      </div>
    </div>
  );
}

/* ───────── Chart Wrapper ───────── */
function ChartCard({ title, children, delay = 0, extra }) {
  return (
    <div className="rounded-2xl p-4 sm:p-6 overflow-hidden"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animation: `fadeInUp 0.6s ${delay}s cubic-bezier(0.34,1.56,0.64,1) both` }}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-semibold" style={{ color: TEXT_PRIMARY, fontFamily: theme.fonts.display }}>{title}</h3>
        {extra || <button className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-gray-100"><FiMoreVertical size={16} style={{ color: TEXT_MUTED }} /></button>}
      </div>
      {children}
    </div>
  );
}

/* ───────── Card Grid SubMenu ───────── */
function CardGridMenu({ activeMenu, menuConfig, onCardClick, activeCard }) {
  const currentMenu = menuConfig[activeMenu];
  if (!currentMenu || currentMenu.items.length === 0) return null;
  const items = currentMenu.items;
  const menuColor = currentMenu.color;
  const rgb = menuColor.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(',');
  return (
    <div className="mb-6 sm:mb-8" style={{ animation: 'fadeInUp 0.4s 0.1s both' }}>
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: `rgba(${rgb}, 0.12)`, color: menuColor, border: `1px solid ${menuColor}30` }}>
          <currentMenu.icon size={14} />{activeMenu}
        </div>
        <div className="flex-1 h-px" style={{ background: CARD_BORDER }} />
        <span className="text-xs hidden sm:inline" style={{ color: TEXT_MUTED }}>{items.length} items</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {items.map((item, index) => {
          const isActive = activeCard === item.name;
          const ItemIcon = item.icon;
          return (
            <button key={item.route || item.name || index} onClick={() => onCardClick(item)}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.03]"
              style={{ background: isActive ? `rgba(${rgb}, 0.10)` : CARD_BG, border: `1px solid ${isActive ? `${menuColor}50` : CARD_BORDER}`, boxShadow: isActive ? `0 0 20px ${menuColor}12` : '0 1px 3px rgba(0,0,0,0.04)', animation: `fadeInUp 0.4s ${0.05 + index * 0.03}s both` }}>
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `linear-gradient(135deg, rgba(${rgb},0.06), transparent 70%)` }} />
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ background: isActive ? `rgba(${rgb}, 0.18)` : `rgba(${rgb}, 0.08)` }}>
                <ItemIcon size={18} className="sm:text-[20px]" style={{ color: isActive ? menuColor : `rgba(${rgb}, 0.7)` }} />
              </div>
              <span className="relative text-[10px] sm:text-xs font-medium text-center leading-tight" style={{ color: isActive ? TEXT_PRIMARY : TEXT_SECONDARY }}>{item.name}</span>
              <span className="relative text-[9px] sm:text-[10px] text-center leading-tight hidden sm:block" style={{ color: TEXT_MUTED }}>{item.desc}</span>
              {isActive && <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 rounded-full" style={{ background: menuColor }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Side Menu ───────── */
function SideMenu({ menuConfig, activeMenu, onMenuChange, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} style={{ animation: 'fadeIn 0.2s ease' }} />}
      <aside className={`fixed z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}
        style={{ top: SIDE_MARGIN, left: SIDE_MARGIN, width: SIDE_WIDTH, maxHeight: `calc(100vh - ${SIDE_MARGIN * 2}px)`, height: 'auto', borderRadius: SIDE_RADIUS, background: SIDE_BG_GRADIENT, border: `1px solid ${SIDE_BORDER}`, boxShadow: '0 20px 50px rgba(15, 42, 36, 0.12), 0 4px 14px rgba(15, 42, 36, 0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-end px-4 pt-4 lg:hidden flex-shrink-0">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors"><FiX size={20} style={{ color: SIDE_TEXT_MUTED }} /></button>
        </div>
        <div className="py-4 px-3 overflow-y-auto scrollbar-hide">
          {Object.entries(menuConfig).map(([menuName, menuData]) => {
            const isActive = activeMenu === menuName;
            const MenuIcon = menuData.icon;
            const rgb = menuData.color.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(',');
            return (
              <button key={menuName} onClick={() => onMenuChange(menuName)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-2 last:mb-0"
                style={{ background: isActive ? `linear-gradient(145deg, rgba(${rgb},0.14), rgba(${rgb},0.06))` : SIDE_ITEM_BG, color: isActive ? menuData.color : SIDE_TEXT, border: `1px solid ${isActive ? `${menuData.color}45` : SIDE_ITEM_BORDER}`, boxShadow: isActive ? `0 4px 14px rgba(${rgb},0.20), inset 0 1px 0 rgba(255,255,255,0.6)` : '0 2px 6px rgba(15,42,36,0.05), 0 1px 2px rgba(15,42,36,0.04)' }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,42,36,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.boxShadow = '0 2px 6px rgba(15,42,36,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isActive ? `rgba(${rgb},0.16)` : `rgba(${rgb},0.08)` }}>
                  <MenuIcon size={16} style={{ color: isActive ? menuData.color : `rgba(${rgb},0.75)` }} />
                </div>
                <span className="flex-1 text-left">{menuName}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: menuData.color, boxShadow: `0 0 8px ${menuData.color}` }} />}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}

/* ───────── Coming Soon ───────── */
function ComingSoonPage({ menuName, menuColor, menuIcon: MenuIcon }) {
  const rgb = menuColor.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(',');
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[50vh] px-4" style={{ animation: 'fadeInUp 0.5s both' }}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6" style={{ background: `rgba(${rgb}, 0.10)`, border: `1px solid ${menuColor}30` }}>
        <MenuIcon size={28} className="sm:text-[36px]" style={{ color: menuColor }} />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center" style={{ color: TEXT_PRIMARY, fontFamily: theme.fonts.display }}>{menuName}</h2>
      <p className="text-xs sm:text-sm mb-6 sm:mb-8 text-center max-w-md" style={{ color: TEXT_SECONDARY }}>This section is under development.</p>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium" style={{ background: `rgba(${rgb}, 0.10)`, color: menuColor, border: `1px solid ${menuColor}30` }}><FiClock size={14} /> Coming Soon</div>
    </div>
  );
}
/* ───────── Teams & Departments Mock Data ───────── */
const departments = ['Operations', 'IT Support', 'Billing & Finance', 'Verification', 'Sales', 'Admin'];

const teamsByDepartment = {
  'Operations': ['Ops Team A', 'Ops Team B', 'Escalation Team'],
  'IT Support': ['L1 Support', 'L2 Technical', 'Product Team'],
  'Billing & Finance': ['Invoicing Team', 'Refunds Team'],
  'Verification': ['Address Verification', 'Employment Verification', 'Education Verification'],
  'Sales': ['Account Management', 'New Sales'],
  'Admin': ['Super Admins'],
};
//* ───────── Assign Ticket Modal ───────── */
function AssignTicketModal({
  tickets,
  specificTicket,
  onClose,
  onAssign
}) {
  const [selectedTicketId, setSelectedTicketId] = useState(
  specificTicket ? (specificTicket._id || specificTicket.ticketId) : ''
);

  const [dept, setDept] = useState('');
  const [team, setTeam] = useState('');

  // CS SPOC
  const [spoc, setSpoc] = useState('');
  const [spocs, setSpocs] = useState([]);
  const [spocLoading, setSpocLoading] = useState(false);

  const [assigning, setAssigning] = useState(false);

  const availableTeams =
    dept ? teamsByDepartment[dept] || [] : [];

  const unassignedTickets =
    tickets.filter(t => !t.assignee);

useEffect(() => {
  const fetchSPOCs = async () => {
    try {
      setSpocLoading(true);

      console.log(
        'Fetching SPOCs from:',
        `${API}/data-management/assignees/list`
      );

      const response = await api.get(
        `${API}/data-management/assignees/list`
      );

      console.log('========== SPOC API ==========');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      console.log('Internal:', response.data?.internal);
      console.log('================================');

      // Backend returns:
      // {
      //   success: true,
      //   internal: [...],
      //   external: [...]
      // }

      const assigneeList = Array.isArray(response.data?.internal)
        ? response.data.internal
        : [];

      console.log('FINAL SPOC LIST:', assigneeList);

      setSpocs(assigneeList);

    } catch (error) {
      console.error('SPOC API ERROR:', error);
      console.error('Response:', error.response?.data);

      setSpocs([]);
    } finally {
      setSpocLoading(false);
    }
  };

  fetchSPOCs();
}, []);
  // Find the ticket object for status display
  const selectedTicket =
  tickets.find(t => (t._id || t.ticketId) === selectedTicketId) || specificTicket;

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (['open', 'new'].includes(s)) return { bg: '#ECFDF5', color: '#059669', dot: '#10B981', label: 'Open' };
    if (['in-progress', 'in progress', 'working'].includes(s)) return { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6', label: 'In Progress' };
    if (['pending', 'on-hold', 'hold'].includes(s)) return { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', label: 'Pending' };
    if (['resolved', 'closed', 'done', 'completed'].includes(s)) return { bg: '#F0FDF4', color: '#16A34A', dot: '#22C55E', label: 'Resolved' };
    if (['escalated'].includes(s)) return { bg: '#FEF2F2', color: '#DC2626', dot: '#EF4444', label: 'Escalated' };
    return { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', label: status || 'Unknown' };
  };

  const getPriorityStyle = (priority) => {
    const p = (priority || '').toLowerCase().trim();
    if (p === 'critical' || p === 'urgent') return { bg: '#FEF2F2', color: '#DC2626', label: 'Urgent' };
    if (p === 'high') return { bg: '#FFF1F2', color: '#E11D48', label: 'High' };
    if (p === 'medium') return { bg: '#FFFBEB', color: '#D97706', label: 'Medium' };
    return { bg: '#F3F4F6', color: '#6B7280', label: p || 'Normal' };
  };

  const handleAssign = () => {
    const assignee = spoc;
    if (selectedTicketId && spoc) {
      setAssigning(true);
      // Small delay to show the assigning animation
      setTimeout(() => {
        onAssign(selectedTicketId, assignee);
        setAssigning(false);
        onClose();
      }, 600);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-start p-4 py-8 bg-black/40 backdrop-blur-sm overflow-y-auto"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-5 sm:p-6 mb-8 relative"
        style={{
          background: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          animation: 'fadeInUp 0.3s ease'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${SUPPORT_COLOR}15` }}>
              <FiUserCheck size={18} style={{ color: SUPPORT_COLOR }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: TEXT_PRIMARY }}>Assign Ticket</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <FiX size={18} style={{ color: TEXT_MUTED }} />
          </button>
        </div>

        {/* ── TICKET SELECTION ── */}
        {specificTicket ? (
          <div className="mb-4 p-3.5 rounded-xl" style={{ background: '#FAFDFB', border: `1px solid ${CARD_BORDER}` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Selected Ticket</p>
            <p className="text-xs font-semibold mb-0.5" style={{ color: TEXT_PRIMARY }}>{specificTicket.subject}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${SUPPORT_COLOR}12`, color: SUPPORT_COLOR }}>{specificTicket.id}</span>
              {(() => {
                const ps = getPriorityStyle(specificTicket.priority);
                return (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: ps.bg, color: ps.color }}>{ps.label}</span>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Select Unassigned Ticket</label>
            <select
              value={selectedTicketId}
              onChange={(e) => setSelectedTicketId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all"
              style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
            >
              <option value="">Choose a ticket to assign...</option>
              {unassignedTickets.map(t => {
                const ticketId = t._id || t.ticketId;

                      return (
                       <option key={ticketId} value={ticketId}>
                       {t.ticketId || ticketId} - {t.subject}
                       </option>
  );
})}
            </select>
          </div>
        )}

        {/* ── TICKET STATUS + PRIORITY INFO CARD ── */}
        {selectedTicket && (
          <div className="mb-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5" style={{ background: '#F9FAFB', borderBottom: `1px solid ${CARD_BORDER}` }}>
              <div className="flex items-center gap-2">
                {(() => {
                  const ss = getStatusStyle(selectedTicket.status);
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{ background: ss.bg, color: ss.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.dot }} />
                      {ss.label}
                    </span>
                  );
                })()}
                {(() => {
                  const ps = getPriorityStyle(selectedTicket.priority);
                  return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold" style={{ background: ps.bg, color: ps.color }}>
                      {ps.label}
                    </span>
                  );
                })()}
              </div>
              <span className="text-[9px] font-mono" style={{ color: TEXT_MUTED }}>#{selectedTicket.id}</span>
            </div>

            {/* Details grid */}
            <div className="p-3.5 space-y-2.5">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: TEXT_PRIMARY }}>{selectedTicket.subject}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: TEXT_MUTED }}>{selectedTicket.description || selectedTicket.message || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                {/* Reporter */}
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Reporter</p>
                  <p className="text-[11px] font-medium truncate" style={{ color: TEXT_PRIMARY }}>{selectedTicket.requesterName || selectedTicket.createdBy || selectedTicket.email || '—'}</p>
                  {selectedTicket.email && (
                    <p className="text-[9px] truncate" style={{ color: TEXT_MUTED }}>{selectedTicket.email}</p>
                  )}
                </div>

                {/* Current Assignee */}
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Current Assignee</p>
                  {selectedTicket.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold" style={{ background: `${SUPPORT_COLOR}15`, color: SUPPORT_COLOR }}>
                        {(selectedTicket.assignee || 'U').charAt(0).toUpperCase()}
                      </div>
                      <p className="text-[11px] font-medium truncate" style={{ color: TEXT_PRIMARY }}>{selectedTicket.assignee}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#F3F4F6' }}>
                        <FiUser size={10} style={{ color: '#9CA3AF' }} />
                      </div>
                      <p className="text-[11px] italic" style={{ color: '#9CA3AF' }}>Unassigned</p>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Category</p>
                  <p className="text-[11px] font-medium" style={{ color: TEXT_PRIMARY }}>{selectedTicket.category || 'General'}</p>
                </div>

                {/* Created */}
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>Created</p>
                  <p className="text-[11px] font-medium" style={{ color: TEXT_PRIMARY }}>
                    {selectedTicket.createdAt
                      ? new Date(selectedTicket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Timeline status steps */}
              <div className="pt-2" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Ticket Timeline</p>
                <StatusTimeline currentStatus={selectedTicket.status || 'open'} />
              </div>
            </div>
          </div>
        )}

        {/* ── ASSIGNMENT FORM ── */}
        
        <div className="space-y-3">
          
          {/* Department */}
  <div>
    <label
      className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block"
      style={{ color: TEXT_MUTED }}
    >
      Department
    </label>

    <select
      value={dept}
      onChange={(e) => {
        setDept(e.target.value);
        setTeam('');
        setSpoc('');
      }}
      className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all"
      style={{
        border: `1px solid ${CARD_BORDER}`,
        background: '#FAFDFB',
        color: TEXT_PRIMARY
      }}
    >
      <option value="">Select Department</option>

      {departments.map(d => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  </div>


  {/* Team */}
  <div>
    <label
      className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block"
      style={{ color: TEXT_MUTED }}
    >
      Team
    </label>

    <select
      value={team}
      onChange={(e) => {
        setTeam(e.target.value);
        setSpoc('');
      }}
      disabled={!dept}
      className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all disabled:opacity-50"
      style={{
        border: `1px solid ${CARD_BORDER}`,
        background: '#FAFDFB',
        color: TEXT_PRIMARY
      }}
    >
      <option value="">Select Team</option>

      {availableTeams.map(t => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  </div>

{/* ── CS SPOC ── */}
<div>
  <label
    className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block"
    style={{ color: TEXT_MUTED }}
  >
    CS SPOC
  </label>
<select
  value={spoc}
  onChange={(e) => setSpoc(e.target.value)}
  disabled={spocLoading}
  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none"
  style={{
    border: `1px solid ${CARD_BORDER}`,
    background: '#FAFDFB',
    color: TEXT_PRIMARY
  }}
>
  <option value="">
    {spocLoading ? 'Loading CS SPOCs...' : 'Select CS SPOC'}
  </option>

  {spocs.map((user, index) => {
  const userEmail =
    user.email ||
    user.emailAddress ||
    user.workEmail ||
    `assignee-${index}`;

  const userName =
    user.name ||
    user.fullName ||
    user.employeeName ||
    user.displayName ||
    user.username ||
    userEmail;

  return (
    <option key={userEmail} value={userEmail}>
      {userName} - {userEmail}
    </option>
  );
})}
</select>
  {/* Debug count */}
  {!spocLoading && (
    <p
      className="text-[9px] mt-1"
      style={{ color: TEXT_MUTED }}
    >
      {spocs.length} CS SPOC{spocs.length !== 1 ? 's' : ''} available
    </p>
  )}
</div>
          {/* Assignment Preview */}
  {spoc && (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{
        background: `${SUPPORT_COLOR}08`,
        border: `1px solid ${SUPPORT_COLOR}25`
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{
          background: `${SUPPORT_COLOR}18`
        }}
      >
        <FiUserCheck
          size={16}
          style={{ color: SUPPORT_COLOR }}
        />
      </div>

      <div>
        <p
          className="text-[10px] font-semibold"
          style={{ color: TEXT_PRIMARY }}
        >
         {spocs.find(
  user =>
    String(user.id || user._id || user.userId) ===
    String(spoc)
)?.name ||
  spocs.find(
    user =>
      String(user.id || user._id || user.userId) ===
      String(spoc)
  )?.fullName ||
  spoc}
        </p>

        <p
          className="text-[9px]"
          style={{ color: TEXT_MUTED }}
        >
          {team} • {dept}
        </p>
      </div>

      <FiCheckCircle
        size={16}
        className="ml-auto"
        style={{ color: SUPPORT_COLOR }}
      />
    </div>
  )}
</div>


        {/* ── ACTION BUTTONS ── */}
        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors hover:bg-gray-100"
            style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_SECONDARY }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedTicketId || !spoc || assigning}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{ background: SUPPORT_COLOR }}
          >
            {assigning ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" style={{ borderWidth: '2px' }} />
                Assigning...
              </>
            ) : (
              <>
                <FiUserCheck size={14} />
                Assign Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
const handleAssign = () => {
  const assignee = spoc;

  if (selectedTicketId && assignee) {
    setAssigning(true);

    setTimeout(() => {
      onAssign(selectedTicketId, assignee);
      setAssigning(false);
      onClose();
    }, 600);
  }
};
/* ───────── Ticket Status Timeline Component ───────── */
function StatusTimeline({ currentStatus }) {
  const status = (currentStatus || 'open').toLowerCase().trim();

  const steps = [
    { key: 'open', label: 'Open', icon: FiAlertCircle },
    { key: 'in-progress', label: 'In Progress', icon: FiActivity },
    { key: 'pending', label: 'Pending Review', icon: FiClock },
    { key: 'resolved', label: 'Resolved', icon: FiCheckCircle },
    { key: 'closed', label: 'Closed', icon: FiCheckSquare },
  ];

  const stepOrder = ['open', 'in-progress', 'pending', 'resolved', 'closed'];
  const currentIndex = stepOrder.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Dot + Label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isCompleted ? '#10B981' : isCurrent ? SUPPORT_COLOR : '#E5E7EB',
                  boxShadow: isCurrent ? `0 0 0 4px ${SUPPORT_COLOR}25` : 'none',
                }}
              >
                <step.icon size={11} style={{ color: isCompleted || isCurrent ? '#fff' : '#9CA3AF' }} />
              </div>
              <span
                className="text-[8px] font-semibold text-center leading-tight max-w-[52px]"
                style={{ color: isCompleted ? '#10B981' : isCurrent ? SUPPORT_COLOR : '#9CA3AF' }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 rounded-full mx-1 mt-[-14px] transition-all duration-500"
                style={{
                  background: isCompleted ? '#10B981' : '#E5E7EB',
                  marginLeft: '4px',
                  marginRight: '4px',
                  maxWidth: '40px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
/* ================================================================
SUPPORT TICKET DASHBOARD — Fully Integrated with Backend API
GET    /api/support-tickets          → Fetch all tickets
POST   /api/support-tickets          → Create a new ticket
PUT    /api/support-tickets/:id      → Update ticket (status, assignee)
POST   /api/support-tickets/:id/reply → Add a reply
DELETE /api/support-tickets/:id      → Delete a ticket
=============================================================== */
function SupportTicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [expandedTicketData, setExpandedTicketData] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModalTicket, setAssignModalTicket] = useState(null);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // tracks which ticket action is loading
  const [toast, setToast] = useState(null);

  /* ── Raise Ticket Form State ── */
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'Medium',
    description: '',
    companyName: '',
    clientcode: '',
    email: '',
    phone: '',
    caseId: '',
  });

  /* ── Reply State ── */
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  /* ───────── Fetch Tickets from Backend ───────── */
  const fetchTickets = async () => {
  try {
    setLoading(true);
    setError(null);

    console.log("Refreshing support tickets...");

    const response = await api.get(`${API}/support-tickets`, {
      params: {
        limit: 100,
        _t: Date.now()
      }
    });

    console.log("Support tickets response:", response.data);

    if (response.data.success) {
      const latestTickets = response.data.tickets || [];

      setTickets(latestTickets);

      // Keep expanded ticket data synchronized after refresh
      if (expandedTicket) {
        const updatedExpandedTicket = latestTickets.find(
          t => (t._id || t.ticketId) === expandedTicket
        );

        if (updatedExpandedTicket) {
          setExpandedTicketData(updatedExpandedTicket);
        }
      }
    } else {
      setError(
        response.data.message || 'Failed to fetch tickets'
      );
    }

  } catch (err) {
    console.error("Error fetching tickets:", err);

    setError(
      err.response?.data?.message ||
      'Network error. Please try again.'
    );

  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchTickets();
  }, []);

  /* ───────── Toast Helper ───────── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ───────── Raise Ticket (POST) ───────── */
  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.category || !newTicket.description || !newTicket.email) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...newTicket,
        status: 'open',
        priority: newTicket.priority || 'Medium',
      };
      const response = await api.post(`${API}/support-tickets`, payload);
     
      if (response.data.success) {
        showToast('Ticket raised successfully!');
        setNewTicket({
          subject: '', category: '', priority: 'Medium', description: '',
          companyName: '', email: '', phone: '', caseId: '',clientcode:'',
        });
        setShowRaiseForm(false);
        await fetchTickets(true);
      } else {
        showToast(response.data.message || 'Failed to raise ticket', 'error');
      }
    } catch (err) {
      console.error("Error raising ticket:", err);
      showToast(err.response?.data?.message || 'Failed to raise ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────── Update Ticket Status (PUT) ───────── */
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setActionLoading(`status-${ticketId}`);
      const response = await api.put(`${API}/support-tickets/${ticketId}`, { status: newStatus });
     
      if (response.data.success) {
        setTickets(prev => prev.map(t => {
          const id = t._id || t.ticketId;
          if (id === ticketId) return { ...t, status: newStatus };
          return t;
        }));
        if (expandedTicketData && (expandedTicketData._id || expandedTicketData.ticketId) === ticketId) {
          setExpandedTicketData(prev => ({ ...prev, status: newStatus }));
        }
        showToast(`Status updated to ${formatStatus(newStatus)}`);
      } else {
        showToast(response.data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  /* ───────── Assign Ticket (PUT) ───────── */
  const handleAssignTicket = async (ticketId, assignee) => {
    try {
      setActionLoading(`assign-${ticketId}`);
      const response = await api.put(`${API}/support-tickets/${ticketId}`, {
        assignee,
        status: 'in-progress'
      });
     
      if (response.data.success) {
        setTickets(prev => prev.map(t => {
          const id = t._id || t.ticketId;
          if (id === ticketId) return { ...t, assignee, status: 'in-progress' };
          return t;
        }));
        if (expandedTicketData && (expandedTicketData._id || expandedTicketData.ticketId) === ticketId) {
          setExpandedTicketData(prev => ({ ...prev, assignee, status: 'in-progress' }));
        }
        showToast(`Ticket assigned to ${assignee}`);
      } else {
        showToast(response.data.message || 'Failed to assign ticket', 'error');
      }
    } catch (err) {
      console.error("Error assigning ticket:", err);
      showToast(err.response?.data?.message || 'Failed to assign ticket', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  /* ───────── Add Reply (POST) ───────── */
const handleAddReply = async (ticketId) => {
  if (!replyText.trim()) return;

  try {
    setActionLoading(`reply-${ticketId}`);

    const response = await api.post(
      `${API}/support-tickets/${ticketId}/replies`,
      {
        message: replyText.trim(),
        sender: 'admin',
        senderName: 'Support Team',
      }
    );

    if (response.data.success) {

      // Check whether backend returned the updated ticket
      const updatedTicket =
        response.data.ticket ||
        response.data.data ||
        null;

      if (updatedTicket) {

        // Update only the matching ticket
        setTickets(prev =>
          prev.map(t => {
            if (!t) return t;

            const id = t._id || t.ticketId;

            if (id === ticketId) {
              return updatedTicket;
            }

            return t;
          })
        );

        // Update expanded ticket
        if (
          expandedTicketData &&
          (expandedTicketData._id ||
            expandedTicketData.ticketId) === ticketId
        ) {
          setExpandedTicketData(updatedTicket);
        }

      } else {

        // Backend did not return updated ticket.
        // Refresh tickets from backend instead of inserting undefined.
        console.log(
          'Reply added successfully. Refreshing ticket data...'
        );

        await fetchTickets(true);

        // Fetch the updated ticket details
        try {
          const detailResponse = await api.get(
            `${API}/support-tickets/${ticketId}`
          );

          if (detailResponse.data.success) {

            const refreshedTicket =
              detailResponse.data.ticket ||
              detailResponse.data.data ||
              null;

            if (refreshedTicket) {
              setExpandedTicketData(refreshedTicket);
            }
          }

        } catch (detailErr) {
          console.error(
            'Error refreshing ticket detail:',
            detailErr
          );
        }
      }

      setReplyText('');
      setReplyingTo(null);

      showToast('Reply added successfully');

    } else {

      showToast(
        response.data.message ||
        'Failed to add reply',
        'error'
      );
    }

  } catch (err) {

    console.error(
      'Error adding reply:',
      err
    );

    showToast(
      err.response?.data?.message ||
      'Failed to add reply',
      'error'
    );

  } finally {

    setActionLoading(null);

  }
};
  /* ───────── Delete Ticket (DELETE) ───────── */
  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
    try {
      setActionLoading(`delete-${ticketId}`);
      const response = await api.delete(`${API}/support-tickets/${ticketId}`);
     
      if (response.data.success) {
        setTickets(prev => prev.filter(t => (t._id || t.ticketId) !== ticketId));
        if (expandedTicket === ticketId) {
          setExpandedTicket(null);
          setExpandedTicketData(null);
        }
        showToast('Ticket deleted successfully');
      } else {
        showToast(response.data.message || 'Failed to delete ticket', 'error');
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
      showToast(err.response?.data?.message || 'Failed to delete ticket', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  /* ───────── Expand Ticket & Fetch Full Detail ───────── */
  const handleExpandTicket = async (ticket) => {
    const ticketId = ticket._id || ticket.ticketId;
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
      setExpandedTicketData(null);
      return;
    }
    setExpandedTicket(ticketId);
    setExpandedTicketData(ticket);
    setReplyingTo(null);
    setReplyText('');

    // Optionally fetch full ticket detail with replies from backend
    try {
      const response = await api.get(`${API}/support-tickets/${ticketId}`);
      if (response.data.success) {
        setExpandedTicketData(response.data.ticket || response.data.data);
      }
    } catch (err) {
      console.error("Error fetching ticket detail:", err);
      // Fallback: use the ticket data we already have
    }
  };

  /* ───────── Open Assign Modal ───────── */
  const openAssignModal = (ticket = null) => {
    setAssignModalTicket(ticket);
    setShowAssignModal(true);
  };

  /* ───────── Filtered Tickets ───────── */
const filteredTickets = tickets.filter((t) => {
  const search = searchQuery.trim().toLowerCase();

  const matchSearch =
    search === '' ||
    (t.subject || '').toLowerCase().includes(search) ||
    (t.ticketId || '').toLowerCase().includes(search) ||
    (t.companyName || '').toLowerCase().includes(search) ||
    (t.contactName || '').toLowerCase().includes(search) ||
    (t.email || '').toLowerCase().includes(search);

  const tStatus = String(t.status || '').trim().toLowerCase();
  const tPriority = String(t.priority || '').trim().toLowerCase();
  const tCategory = String(t.category || '').trim().toLowerCase();

  const selectedStatus =
    String(filterStatus || '').trim().toLowerCase();

  const selectedPriority =
    String(filterPriority || '').trim().toLowerCase();

  const selectedCategory =
    String(filterCategory || '').trim().toLowerCase();

  const matchStatus =
    filterStatus === 'All' ||
    tStatus === selectedStatus;

  const matchPriority =
    filterPriority === 'All' ||
    tPriority === selectedPriority;

  const matchCategory =
    filterCategory === 'All' ||
    tCategory === selectedCategory;

  return (
    matchSearch &&
    matchStatus &&
    matchPriority &&
    matchCategory
  );
});

  /* ───────── Computed Stats ───────── */
  const ticketStats = [
  {
    title: 'Total Tickets',
    value: tickets.length,
    icon: FiMessageCircle,
    change: 0,
    color: SUPPORT_COLOR,
    colorRgb: SUPPORT_RGB
  },

  {
    title: 'Unassigned',
    value: tickets.filter(t => !t?.assignee).length,
    icon: FiUserPlus,
    change: 0,
    color: '#F59E0B',
    colorRgb: '245,158,11'
  },

  {
    title: 'Open',
    value: tickets.filter(
      t => (t?.status || '').toLowerCase() === 'open'
    ).length,
    icon: FiAlertCircle,
    change: 0,
    color: '#6366F1',
    colorRgb: '99,102,241'
  },

  {
    title: 'In Progress',
    value: tickets.filter(
      t => (t?.status || '').toLowerCase() === 'in-progress'
    ).length,
    icon: FiClock,
    change: 0,
    color: '#F59E0B',
    colorRgb: '245,158,11'
  },

  {
    title: 'Resolved',
    value: tickets.filter(
      t => (t?.status || '').toLowerCase() === 'resolved'
    ).length,
    icon: FiCheckCircle,
    change: 0,
    color: '#10B981',
    colorRgb: '16,185,129'
  },
];

 const statusTrend = [
  { name: 'Open',value: tickets.filter(t => (t?.status || '').toLowerCase() === 'open').length,color: '#6366F1'},
  { name: 'In Progress',value: tickets.filter(t => (t?.status || '').toLowerCase() === 'in-progress').length,color: '#F59E0B'},
  { name: 'Resolved',value: tickets.filter(t => (t?.status || '').toLowerCase() === 'resolved').length,color: '#10B981'},
  { name: 'Closed',value: tickets.filter(t => (t?.status || '').toLowerCase() === 'closed').length,color: '#7FA99C'},

].filter(s => s.value > 0);

  const priorityTrend = [
    { name: 'Low', value: tickets.filter(t => (t.priority || '').toLowerCase() === 'low').length, color: '#10B981' },
    { name: 'Medium', value: tickets.filter(t => (t.priority || '').toLowerCase() === 'medium').length, color: '#F59E0B' },
    { name: 'High', value: tickets.filter(t => (t.priority || '').toLowerCase() === 'high').length, color: '#EF4444' },
    { name: 'Urgent', value: tickets.filter(t => (t.priority || '').toLowerCase() === 'urgent' || (t.priority || '').toLowerCase() === 'critical').length, color: '#7C3AED' },
  ].filter(s => s.value > 0);

  /* ───────── Unique Categories from Backend Data ───────── */
  const uniqueStatuses = [
  ...new Set(
    tickets
      .map(t => String(t.status || '').trim())
      .filter(Boolean)
  )
].sort((a, b) => a.localeCompare(b));

const uniquePriorities = [
  ...new Set(
    tickets
      .map(t => String(t.priority || '').trim())
      .filter(Boolean)
  )
].sort((a, b) => a.localeCompare(b));

const uniqueCategories = [
  ...new Set(
    tickets
      .map(t => String(t.category || '').trim())
      .filter(Boolean)
      .filter(cat => cat.toLowerCase() !== 'kidney')
  )
].sort((a, b) => a.localeCompare(b));

  const formatStatus = (status) => {
    if (!status) return '';
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getStatusConfig = (status) => {
    if (!status) return statusConfig['Open'];
    const s = status.toLowerCase();
    if (s === 'open') return statusConfig['Open'];
    if (s === 'in-progress') return statusConfig['In Progress'];
    if (s === 'resolved') return statusConfig['Resolved'];
    if (s === 'closed') return statusConfig['Closed'];
    return statusConfig['Open'];
  };

  const getPriorityConfig = (priority) => {
    if (!priority) return priorityConfig['Medium'];
    const p = priority.toLowerCase();
    if (p === 'low') return priorityConfig['Low'];
    if (p === 'medium') return priorityConfig['Medium'];
    if (p === 'high') return priorityConfig['High'];
    if (p === 'critical' || p === 'urgent') return priorityConfig['Critical'];
    return priorityConfig['Medium'];
  };

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="relative">
      {/* ── Toast Notification ── */}
      {toast && (
        <div className="fixed top-6 right-6 z-[99999] flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold shadow-lg"
          style={{
            background: toast.type === 'error' ? '#FEF2F2' : '#F0FDF4',
            color: toast.type === 'error' ? '#DC2626' : '#059669',
            border: `1px solid ${toast.type === 'error' ? '#FECACA' : '#BBF7D0'}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            animation: 'fadeInUp 0.3s ease',
          }}>
          {toast.type === 'error' ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* ── Assign Modal ── */}
      {showAssignModal && (
        <AssignTicketModal
          tickets={tickets}
          specificTicket={assignModalTicket}
          onClose={() => { setShowAssignModal(false); setAssignModalTicket(null); }}
          onAssign={(ticketId, assignee) => handleAssignTicket(ticketId, assignee)}
        />
      )}

      {/* ── Raise Ticket Modal ── */}
      {showRaiseForm && (
        <div className="fixed inset-0 z-[9999] flex justify-center items-start p-4 py-6 bg-black/40 backdrop-blur-sm overflow-y-auto" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="w-full max-w-lg rounded-2xl p-5 sm:p-6 mb-8 relative" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 20px 50px rgba(0,0,0,0.15)', animation: 'fadeInUp 0.3s ease' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `rgba(${SUPPORT_RGB}, 0.10)` }}>
                  <FiPlusCircle size={18} style={{ color: SUPPORT_COLOR }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>Raise New Ticket</h3>
                  <p className="text-[10px]" style={{ color: TEXT_MUTED }}>Submit a support request</p>
                </div>
              </div>
              <button onClick={() => setShowRaiseForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <FiX size={18} style={{ color: TEXT_MUTED }} />
              </button>
            </div>

            <form onSubmit={handleRaiseTicket} className="space-y-3">
              {/* Subject */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Subject <span style={{ color: SUPPORT_COLOR }}>*</span></label>
                <input type="text" required value={newTicket.subject} onChange={(e) => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all"
                  style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
                  onFocus={(e) => { e.target.style.borderColor = SUPPORT_COLOR; e.target.style.boxShadow = `0 0 0 3px ${SUPPORT_COLOR}15`; }}
                  onBlur={(e) => { e.target.style.borderColor = CARD_BORDER; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Category + Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Category <span style={{ color: SUPPORT_COLOR }}>*</span></label>
                  <select required value={newTicket.category} onChange={(e) => setNewTicket(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none"
                    style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}>
                    <option value="">Select...</option>
                    {ticketCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Priority</label>
                  <select value={newTicket.priority} onChange={(e) => setNewTicket(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none"
                    style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}>
                    {ticketPriorities.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Description <span style={{ color: SUPPORT_COLOR }}>*</span></label>
                <textarea required rows={4} value={newTicket.description} onChange={(e) => setNewTicket(p => ({ ...p, description: e.target.value }))}
                  placeholder="Provide detailed information about the issue..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all resize-none"
                  style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
                  onFocus={(e) => { e.target.style.borderColor = SUPPORT_COLOR; e.target.style.boxShadow = `0 0 0 3px ${SUPPORT_COLOR}15`; }}
                  onBlur={(e) => { e.target.style.borderColor = CARD_BORDER; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Client Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Company Name</label>
                  <input type="text" value={newTicket.companyName} onChange={(e) => setNewTicket(p => ({ ...p, companyName: e.target.value }))}
                    placeholder="Company name"
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all"
                    style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Contact Name</label>
                  <input type="text" value={newTicket.contactName} onChange={(e) => setNewTicket(p => ({ ...p, contactName: e.target.value }))}
                    placeholder="Full name"
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all"
                    style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
                  />
                </div>
              </div>

              {/* Email + Phone Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Email <span style={{ color: SUPPORT_COLOR }}>*</span></label>
                  <input type="email" required value={newTicket.email} onChange={(e) => setNewTicket(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@company.com"
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all"
                    style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Phone</label>
                  <input type="text" value={newTicket.phone} onChange={(e) => setNewTicket(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all"
                    style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
                  />
                </div>
              </div>

              {/* Case ID */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: TEXT_MUTED }}>Related Case ID (optional)</label>
                <input type="text" value={newTicket.caseId} onChange={(e) => setNewTicket(p => ({ ...p, caseId: e.target.value }))}
                  placeholder="e.g. WO-2025-00128"
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all"
                  style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowRaiseForm(false)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors hover:bg-gray-100" style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_SECONDARY }}>Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2" style={{ background: SUPPORT_COLOR, boxShadow: `0 4px 14px rgba(${SUPPORT_RGB},0.30)` }}>
                  {submitting ? <><FiRefreshCw size={13} className="animate-spin" /> Submitting...</> : <><FiSend size={13} /> Raise Ticket</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Header Row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6" style={{ animation: 'fadeInUp 0.4s 0s both' }}>
        <div>
          <p className="text-xs" style={{ color: TEXT_SECONDARY }}>
            Track and manage all support tickets raised by your clients
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
  type="button"
  onClick={fetchTickets}
  disabled={loading}
  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
  style={{
    border: `1px solid ${CARD_BORDER}`,
    color: TEXT_SECONDARY
  }}
>
  <FiRefreshCw
    size={14}
    className={loading ? 'animate-spin' : ''}
  />
  {loading ? 'Refreshing...' : 'Refresh'}
</button>
          <button onClick={() => openAssignModal()} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.03]" style={{ background: '#FFFFFF', border: `1px solid ${SUPPORT_COLOR}40`, color: SUPPORT_COLOR }}>
            <FiUserPlus size={14} /> Assign
          </button>
          {/* <button onClick={() => setShowRaiseForm(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.03]" style={{ background: SUPPORT_COLOR, boxShadow: `0 4px 14px rgba(${SUPPORT_RGB},0.30)` }}>
            <FiPlusCircle size={14} /> Raise Ticket
          </button> */}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-5 sm:mb-6">
        {ticketStats.map((s, i) => (
          <StatCard key={i} {...s} delay={i} />
        ))}
      </div>

      {/* ── Search + Filters + Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="lg:col-span-3 rounded-2xl p-4 sm:p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animation: 'fadeInUp 0.5s 0.15s both' }}>
          {/* Search */}
          <div className="relative mb-3">
            <FiSearch size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: TEXT_MUTED }} />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, client, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '12px', border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY, fontSize: '13px', outline: 'none', transition: 'all 0.2s ease' }}
              onFocus={(e) => { e.target.style.borderColor = SUPPORT_COLOR; e.target.style.boxShadow = `0 0 0 3px ${SUPPORT_COLOR}18`; }}
              onBlur={(e) => { e.target.style.borderColor = CARD_BORDER; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <div className="flex items-center gap-1 text-[10px] font-semibold mr-1" style={{ color: TEXT_MUTED }}><FiFilter size={11} /> Status:</div>
            {['All', 'open', 'in-progress', 'resolved', 'closed'].map(s => {
              const sc = getStatusConfig(s);
              const isActive = filterStatus === s;
              const count = s === 'All' ? tickets.length : tickets.filter(t => (t.status || '').toLowerCase() === s).length;
              return (
                <button key={s} onClick={() => setFilterStatus(s)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200"
                  style={{ background: isActive ? sc.dot : sc.bg, color: isActive ? '#FFFFFF' : sc.text, border: `1px solid ${isActive ? sc.dot : `${sc.dot}30`}` }}>
                  {s === 'All' ? 'All' : formatStatus(s)} ({count})
                </button>
              );
            })}
          </div>

          {/* Priority Filters */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <div className="flex items-center gap-1 text-[10px] font-semibold mr-1" style={{ color: TEXT_MUTED }}>Priority:</div>
            {['All', 'Low', 'Medium', 'High', 'Urgent', 'Critical'].map(p => {
              const pc = getPriorityConfig(p);
              const isActive = filterPriority === p;
              const count = p === 'All' ? tickets.length : tickets.filter(t => (t.priority || '').toLowerCase() === p.toLowerCase()).length;
              if (p !== 'All' && count === 0) return null;
              return (
                <button key={p} onClick={() => setFilterPriority(p)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200"
                  style={{ background: isActive ? pc.color : pc.bg, color: isActive ? '#FFFFFF' : pc.color, border: `1px solid ${isActive ? pc.color : `${pc.color}30`}` }}>
                  {p} {p !== 'All' && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Category Filters (dynamic from backend data) */}
          {uniqueCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1 text-[10px] font-semibold mr-1" style={{ color: TEXT_MUTED }}>Category:</div>
              <button onClick={() => setFilterCategory('All')} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200"
                style={{ background: filterCategory === 'All' ? SUPPORT_COLOR : `${SUPPORT_COLOR}10`, color: filterCategory === 'All' ? '#FFFFFF' : SUPPORT_COLOR, border: `1px solid ${filterCategory === 'All' ? SUPPORT_COLOR : `${SUPPORT_COLOR}25`}` }}>
                All
              </button>
              {uniqueCategories.map(cat => {
                const isActive = filterCategory === cat;
                return (
                  <button key={cat} onClick={() => setFilterCategory(cat)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200"
                    style={{ background: isActive ? SUPPORT_COLOR : `${SUPPORT_COLOR}08`, color: isActive ? '#FFFFFF' : TEXT_SECONDARY, border: `1px solid ${isActive ? SUPPORT_COLOR : `${CARD_BORDER}`}` }}>
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div> 
        {/* Pie Charts */}
        <div className="space-y-3">
          <ChartCard title="Status" delay={0.2}>
            <div className="h-[110px] flex items-center justify-center">
              {statusTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusTrend} dataKey="value" nameKey="name" innerRadius="40%" outerRadius="70%" paddingAngle={3} strokeWidth={0}>
                      {statusTrend.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[10px]" style={{ color: TEXT_MUTED }}>No data</p>
              )}
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center">
              {statusTrend.map((s, i) => (
                <div key={i} className="flex items-center gap-1 text-[9px]">
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ background: s.color }} />
                  <span style={{ color: TEXT_MUTED }}>{s.name}</span>
                  <span className="font-bold" style={{ color: TEXT_PRIMARY }}>{s.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Priority" delay={0.25}>
            <div className="h-[110px] flex items-center justify-center">
              {priorityTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityTrend} dataKey="value" nameKey="name" innerRadius="40%" outerRadius="70%" paddingAngle={3} strokeWidth={0}>
                      {priorityTrend.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[10px]" style={{ color: TEXT_MUTED }}>No data</p>
              )}
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center">
              {priorityTrend.map((s, i) => (
                <div key={i} className="flex items-center gap-1 text-[9px]">
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ background: s.color }} />
                  <span style={{ color: TEXT_MUTED }}>{s.name}</span>
                  <span className="font-bold" style={{ color: TEXT_PRIMARY }}>{s.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── Results Count + Clear ── */}
      <div className="flex items-center justify-between mb-3 px-1" style={{ animation: 'fadeInUp 0.4s 0.25s both' }}>
        <p className="text-[11px] font-medium" style={{ color: TEXT_MUTED }}>
          Showing <span className="font-bold" style={{ color: TEXT_PRIMARY }}>{filteredTickets.length}</span> of {tickets.length} tickets
        </p>
        {(searchQuery || filterStatus !== 'All' || filterPriority !== 'All' || filterCategory !== 'All') && (
          <button onClick={() => { setSearchQuery(''); setFilterStatus('All'); setFilterPriority('All'); setFilterCategory('All'); }}
            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors hover:bg-gray-100" style={{ color: SUPPORT_COLOR }}>
            <FiX size={10} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Error State ── */}
      {error && !loading && (
        <div className="rounded-2xl p-6 text-center mb-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA', animation: 'fadeInUp 0.4s 0.3s both' }}>
          <FiAlertCircle size={28} style={{ color: '#DC2626' }} className="mx-auto mb-2" />
          <p className="text-sm font-semibold mb-1" style={{ color: '#DC2626' }}>Error loading tickets</p>
          <p className="text-xs mb-3" style={{ color: '#991B1B' }}>{error}</p>
          <button onClick={() => fetchTickets()} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: '#DC2626' }}>Retry</button>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="rounded-2xl p-10 text-center" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, animation: 'fadeInUp 0.4s 0.3s both' }}>
          <FiRefreshCw size={28} style={{ color: SUPPORT_COLOR }} className="mx-auto mb-3 animate-spin" />
          <p className="text-sm font-semibold" style={{ color: TEXT_PRIMARY }}>Loading tickets...</p>
          <p className="text-xs mt-1" style={{ color: TEXT_MUTED }}>Fetching from server</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && filteredTickets.length === 0 && (
        <div className="rounded-2xl p-10 text-center" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, animation: 'fadeInUp 0.4s 0.3s both' }}>
          <FiInbox size={36} style={{ color: TEXT_MUTED }} className="mx-auto mb-3" />
          <p className="text-sm font-semibold mb-1" style={{ color: TEXT_PRIMARY }}>No tickets found</p>
          <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>
            {tickets.length === 0 ? 'No support tickets have been raised yet.' : 'Try adjusting your search or filter criteria'}
          </p>
          {tickets.length === 0 && (
            <button onClick={() => setShowRaiseForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.03]" style={{ background: SUPPORT_COLOR, boxShadow: `0 4px 14px rgba(${SUPPORT_RGB},0.30)` }}>
              <FiPlusCircle size={14} /> Raise First Ticket
            </button>
          )}
        </div>
      )}

      {/* ── Ticket List ── */}
      {!loading && !error && filteredTickets.length > 0 && (
        <div className="space-y-2 sm:space-y-2.5">
          {filteredTickets.map((ticket, i) => {
            const sc = getStatusConfig(ticket.status);
            const pc = getPriorityConfig(ticket.priority);
            const ticketId = ticket._id || ticket.ticketId;
            const isExpanded = expandedTicket === ticketId;
            const isActionLoading = actionLoading && actionLoading.includes(ticketId);

            return (
              <div key={ticketId} className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{ background: CARD_BG, border: `1px solid ${isExpanded ? `${sc.dot}40` : CARD_BORDER}`, boxShadow: isExpanded ? `0 4px 20px ${sc.dot}12` : '0 1px 3px rgba(0,0,0,0.04)', animation: `fadeInUp 0.4s ${0.3 + i * 0.04}s both` }}>

                {/* ── Collapsed Row ── */}
                <button onClick={() => handleExpandTicket(ticket)} className="w-full text-left p-4 sm:p-5 transition-colors duration-200 hover:bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: `rgba(${SUPPORT_RGB},0.08)`, color: SUPPORT_COLOR }}>
                          {ticket.ticketId || ticketId?.slice(-8)}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: pc.bg, color: pc.color }}>
                          {ticket.priority || 'Medium'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: sc.bg, color: sc.text }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} /> {formatStatus(ticket.status)}
                        </span>
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: TEXT_MUTED }}>
                            <FiPaperclip size={10} /> {ticket.attachments.length}
                          </span>
                        )}
                        {ticket.assignee && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: 'rgba(16,185,129,0.10)', color: '#059669' }}>
                            <FiUserCheck size={10} /> {ticket.assignee}
                          </span>
                        )}
                        {!ticket.assignee && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706' }}>
                            <FiUserPlus size={10} /> Unassigned
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold mb-1 truncate" style={{ color: TEXT_PRIMARY }}>
                        {ticket.subject}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[10px]" style={{ color: TEXT_MUTED }}>
                          <span className="font-medium" style={{ color: TEXT_SECONDARY }}>{ticket.companyName || ticket.contactName || 'Unknown'}</span>
                          {ticket.email && ` · ${ticket.email}`}
                        </span>
                        {ticket.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: TEXT_MUTED }}>{ticket.category}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] font-medium" style={{ color: TEXT_SECONDARY }}>
                          {formatDate(ticket.createdAt)}
                        </p>
                        {(ticket.replies && ticket.replies.length > 0) && (
                          <p className="text-[10px] flex items-center gap-1 justify-end" style={{ color: TEXT_MUTED }}>
                            <FiMessageSquare size={9} /> {ticket.replies.length}
                          </p>
                        )}
                      </div>
                      <FiChevronDown size={16} style={{ color: TEXT_MUTED, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                    </div>
                  </div>
                </button>

                {/* ── Expanded Detail Panel ── */}
                {isExpanded && expandedTicketData && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5" style={{ borderTop: `1px solid ${CARD_BORDER}`, animation: 'fadeIn 0.25s ease' }}>
                    <div className="pt-4">

                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Description</p>
                        <div className="p-3 rounded-xl text-xs leading-relaxed" style={{ background: '#FAFDFB', border: `1px solid ${CARD_BORDER}`, color: TEXT_PRIMARY }}>
                          {expandedTicketData.description || 'No description provided.'}
                        </div>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: 'Client', value: expandedTicketData.companyName || '—' },
                          { label: 'Clientcode', value: expandedTicketData.clientCode|| '—' },
                          // { label: 'Contact', value: expandedTicketData.contactName || '—' },
                          { label: 'Email', value: expandedTicketData.email || '—' },
                          // { label: 'Phone', value: expandedTicketData.phone || '—' },
                          { label: 'Category', value: expandedTicketData.category || '—' },
                          { label: 'Case ID', value: expandedTicketData.ticketId || '—' },
                          { label: 'Assigned To', value: expandedTicketData.assignee || 'Unassigned' },
                          { label: 'Created', value: formatDateTime(expandedTicketData.createdAt) },
                        ].map((meta, mi) => (
                          <div key={mi} className="p-2.5 rounded-lg" style={{ background: '#FAFDFB', border: `1px solid ${CARD_BORDER}` }}>
                            <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: TEXT_MUTED }}>{meta.label}</p>
                            <p className="text-[11px] font-semibold truncate" style={{ color: TEXT_PRIMARY }}>{meta.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Attachments */}
                      {expandedTicketData.attachments && expandedTicketData.attachments.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Attachments</p>
                          <div className="flex flex-wrap gap-2">
                            {expandedTicketData.attachments.map((att, ai) => (
                              <div key={ai} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium" style={{ background: '#F3F4F6', color: TEXT_SECONDARY, border: `1px solid ${CARD_BORDER}` }}>
                                <FiPaperclip size={11} />
                                <span className="truncate max-w-[150px]">{typeof att === 'string' ? att : att.name || 'File'}</span>
                                <FiDownload size={11} className="cursor-pointer hover:text-blue-500 transition-colors" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Replies / Thread */}
                      <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                          Replies {expandedTicketData.replies && expandedTicketData.replies.length > 0 && `(${expandedTicketData.replies.length})`}
                        </p>
                        {expandedTicketData.replies && expandedTicketData.replies.length > 0 ? (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {expandedTicketData.replies.map((reply, ri) => (
                              <div key={ri} className="p-3 rounded-xl" style={{ background: ri % 2 === 0 ? '#FAFDFB' : '#F9FAFB', border: `1px solid ${CARD_BORDER}` }}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
  style={{ background: SUPPORT_COLOR }}
>
  {(
    String(reply.sender || '').toLowerCase() === 'admin'
      ? 'You'
      : (
          reply.repliedBy ||
          expandedTicketData.contactName ||
          expandedTicketData.companyName ||
          'Client'
        )
  ).charAt(0).toUpperCase()}
</div>

<span
  className="text-[11px] font-semibold"
  style={{ color: TEXT_PRIMARY }}
>
  {String(reply.sender || '').toLowerCase() === 'admin'
    ? 'You'
    : (
        reply.repliedBy ||
        expandedTicketData.contactName ||
        expandedTicketData.companyName ||
        'Client'
      )}
</span>
</div>
                                  <span className="text-[9px]" style={{ color: TEXT_MUTED }}>{formatDateTime(reply.createdAt || reply.repliedAt)}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed pl-8" style={{ color: TEXT_SECONDARY }}>{reply.message}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] italic py-2" style={{ color: TEXT_MUTED }}>No replies yet.</p>
                        )}

                        {/* Reply Input */}
                        {replyingTo === ticketId ? (
                          <div className="mt-3 flex gap-2" style={{ animation: 'fadeIn 0.2s ease' }}>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              rows={2}
                              className="flex-1 px-3 py-2.5 rounded-xl text-xs font-medium outline-none resize-none transition-all"
                              style={{ border: `1px solid ${CARD_BORDER}`, background: '#FAFDFB', color: TEXT_PRIMARY }}
                              autoFocus
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleAddReply(ticketId)} disabled={actionLoading === `reply-${ticketId}` || !replyText.trim()}
                                className="px-3 py-2 rounded-xl text-[10px] font-semibold text-white disabled:opacity-50" style={{ background: SUPPORT_COLOR }}>
                                {actionLoading === `reply-${ticketId}` ? <FiRefreshCw size={12} className="animate-spin" /> : <FiSend size={12} />}
                              </button>
                              <button onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                className="px-3 py-2 rounded-xl text-[10px] font-semibold" style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_MUTED }}>
                                <FiX size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setReplyingTo(ticketId)} className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-colors hover:bg-gray-50" style={{ border: `1px solid ${CARD_BORDER}`, color: TEXT_SECONDARY }}>
                            <FiMessageSquare size={11} /> Reply
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                        {/* Status Change Buttons */}
                        {(expandedTicketData.status || '').toLowerCase() === 'open' && (
                          <button onClick={() => handleStatusChange(ticketId, 'in-progress')} disabled={isActionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706', border: '1px solid rgba(245,158,11,0.25)' }}>
                            {actionLoading === `status-${ticketId}` ? <FiRefreshCw size={11} className="animate-spin" /> : <FiClock size={11} />} Start Progress
                          </button>
                        )}
                        {(expandedTicketData.status || '').toLowerCase() === 'in-progress' && (
                          <button onClick={() => handleStatusChange(ticketId, 'resolved')} disabled={isActionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{ background: 'rgba(16,185,129,0.10)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}>
                            {actionLoading === `status-${ticketId}` ? <FiRefreshCw size={11} className="animate-spin" /> : <FiCheckCircle size={11} />} Mark Resolved
                          </button>
                        )}
                        {(expandedTicketData.status || '').toLowerCase() === 'resolved' && (
                          <button onClick={() => handleStatusChange(ticketId, 'closed')} disabled={isActionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{ background: 'rgba(127,169,156,0.10)', color: '#4A7A6B', border: '1px solid rgba(127,169,156,0.25)' }}>
                            {actionLoading === `status-${ticketId}` ? <FiRefreshCw size={11} className="animate-spin" /> : <FiCheck size={11} />} Close Ticket
                          </button>
                        )}

                        {/* Reopen */}
                        {(expandedTicketData.status || '').toLowerCase() === 'closed' && (
                          <button onClick={() => handleStatusChange(ticketId, 'open')} disabled={isActionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{ background: 'rgba(99,102,241,0.10)', color: '#4F46E5', border: '1px solid rgba(99,102,241,0.25)' }}>
                            {actionLoading === `status-${ticketId}` ? <FiRefreshCw size={11} className="animate-spin" /> : <FiRefreshCw size={11} />} Reopen
                          </button>
                        )}

                        {/* Assign */}
                        <button onClick={() => openAssignModal(ticket)} disabled={isActionLoading}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                          style={{ background: 'rgba(99,102,241,0.10)', color: '#4F46E5', border: '1px solid rgba(99,102,241,0.25)' }}>
                          <FiUserPlus size={11} /> {expandedTicketData.assignee ? 'Reassign' : 'Assign'}
                        </button>

                        {/* Delete */}
                        <button onClick={() => handleDeleteTicket(ticketId)} disabled={isActionLoading}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 ml-auto"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.20)' }}>
                          {actionLoading === `delete-${ticketId}` ? <FiRefreshCw size={11} className="animate-spin" /> : <FiTrash2 size={11} />} Delete
                        </button>
                      </div>

                      {/* Updated At */}
                      {expandedTicketData.updatedAt && expandedTicketData.updatedAt !== expandedTicketData.createdAt && (
                        <p className="text-[9px] mt-3 text-right" style={{ color: TEXT_MUTED }}>
                          Last updated: {formatDateTime(expandedTicketData.updatedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================================================================
CLIENT DASHBOARD CONTENT
=============================================================== */
function ClientDashboardContent({ onRaiseTicket }) {
  const CC = '#6366F1';
  const CR = '99,102,241';
  const statusColorMap = { 'Completed': { bg: 'rgba(16,185,129,0.10)', text: '#059669', dot: '#10B981' }, 'In Progress': { bg: 'rgba(99,102,241,0.10)', text: '#4F46E5', dot: '#6366F1' }, 'Pending': { bg: 'rgba(245,158,11,0.10)', text: '#D97706', dot: '#F59E0B' }, 'Insufficiency': { bg: 'rgba(239,68,68,0.10)', text: '#DC2626', dot: '#EF4444' }, 'On Hold': { bg: 'rgba(127,169,156,0.10)', text: '#4A7A6B', dot: '#7FA99C' } };
  const tatColorMap = { 'Within SLA': { bg: 'rgba(16,185,129,0.08)', text: '#059669' }, 'SLA Breach': { bg: 'rgba(239,68,68,0.08)', text: '#DC2626' } };
  const notifColorMap = { success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.20)', icon: FiCheckCircle, color: '#059669' }, warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.20)', icon: FiAlertTriangle, color: '#D97706' }, info: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.20)', icon: FiBell, color: '#4F46E5' }, error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.20)', icon: FiAlertCircle, color: '#DC2626' } };

  return (
    <div>
      <div className="rounded-2xl p-5 sm:p-6 mb-5 sm:mb-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, rgba(${CR},0.12) 0%, rgba(${CR},0.04) 50%, rgba(6,182,212,0.06) 100%)`, border: `1px solid rgba(${CR},0.15)`, animation: 'fadeInUp 0.5s 0s both' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${CC}, transparent 70%)` }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(145deg, ${CC}, #4F46E5)`, boxShadow: `0 8px 24px rgba(${CR},0.30)` }}><FiUser size={24} className="text-white" /></div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: TEXT_PRIMARY, fontFamily: theme.fonts.display }}>Welcome back, TechNova Inc.</h2>
              <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Active · Package: <span className="font-semibold" style={{ color: CC }}>Standard BGV</span> · SLA: <span className="font-semibold" style={{ color: CC }}>7 Days</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold" style={{ background: 'rgba(16,185,129,0.10)', color: '#059669' }}><div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981' }} />Active</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-5 sm:mb-6">{clientStatsData.map((s, i) => <StatCard key={i} {...s} delay={i} />)}</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6" style={{ animation: 'fadeInUp 0.5s 0.2s both' }}>
        {[{ label: 'Raise Ticket', icon: FiMessageSquare, color: '#EF4444', rgb: '239,68,68', action: onRaiseTicket }, { label: 'View Reports', icon: FiFileText, color: '#6366F1', rgb: '99,102,241', action: () => {} }, { label: 'Download Invoice', icon: FiDownload, color: '#10B981', rgb: '16,185,129', action: () => {} }, { label: 'Submit Cases', icon: FiUpload, color: '#F59E0B', rgb: '245,158,11', action: () => {} }].map((b, i) => (
          <button key={i} onClick={b.action} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] group" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: TEXT_PRIMARY, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animation: `fadeInUp 0.4s ${0.25 + i * 0.05}s both` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${b.color}40`; e.currentTarget.style.boxShadow = `0 4px 16px rgba(${b.rgb},0.15)`; e.currentTarget.style.background = `rgba(${b.rgb},0.04)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = CARD_BORDER; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.background = CARD_BG; }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `rgba(${b.rgb}, 0.10)` }}><b.icon size={15} style={{ color: b.color }} /></div>
            <span>{b.label}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="lg:col-span-2">
          <ChartCard title="Case Submission vs Completion" delay={0.35}>
            <div className="h-[220px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clientTrendData}>
                  <defs>
                    <linearGradient id="csg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CC} stopOpacity={0.25} /><stop offset="95%" stopColor={CC} stopOpacity={0} /></linearGradient>
                    <linearGradient id="ccg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.20} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CARD_BORDER} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="submitted" stroke={CC} strokeWidth={2} fillOpacity={1} fill="url(#csg)" name="Submitted" />
                  <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#ccg)" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
        <div>
          <ChartCard title="Case Status" delay={0.4}>
            <div className="h-[220px] sm:h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={clientCaseStatusData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="78%" paddingAngle={2}>{clientCaseStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 justify-center">{clientCaseStatusData.map((s, i) => <div key={i} className="flex items-center gap-1.5 text-[10px]"><div className="w-2 h-2 rounded-sm" style={{ background: s.color }} /><span style={{ color: TEXT_MUTED }}>{s.name}</span><span className="font-semibold" style={{ color: TEXT_PRIMARY }}>{s.value}</span></div>)}</div>
          </ChartCard>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
        <ChartCard title="Check Type Progress" delay={0.45}>
          <div className="space-y-3">{clientCheckTypeData.map((ct, i) => { const pct = Math.round((ct.completed / ct.total) * 100); return (<div key={i} style={{ animation: `fadeInUp 0.3s ${0.5 + i * 0.06}s both` }}><div className="flex items-center justify-between mb-1.5"><span className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>{ct.name}</span><span className="text-[10px] font-semibold" style={{ color: ct.color }}>{ct.completed}/{ct.total} · {pct}%</span></div><div className="w-full h-2 rounded-full" style={{ background: `${ct.color}15` }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${ct.color}, ${ct.color}CC)`, boxShadow: `0 0 8px ${ct.color}40`, animation: `barGrow 1s ${0.6 + i * 0.1}s both` }} /></div></div>); })}</div>
        </ChartCard>
        <ChartCard title="Billing Summary" delay={0.5}>
          <div className="grid grid-cols-2 gap-3 mb-4">{clientBillingSummary.map((b, i) => { const br = b.color.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(','); return (<div key={i} className="rounded-xl p-3" style={{ background: `rgba(${br}, 0.06)`, border: `1px solid ${b.color}18`, animation: `fadeInUp 0.3s ${0.55 + i * 0.06}s both` }}><div className="flex items-center gap-2 mb-1.5"><b.icon size={13} style={{ color: b.color }} /><span className="text-[10px] font-medium" style={{ color: TEXT_MUTED }}>{b.label}</span></div><span className="text-sm sm:text-base font-bold" style={{ color: TEXT_PRIMARY, fontFamily: theme.fonts.display }}>{b.value}</span></div>); })}</div>
          <div className="rounded-xl p-3" style={{ background: `rgba(${CR},0.04)`, border: `1px solid rgba(${CR},0.10)` }}><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-semibold" style={{ color: TEXT_MUTED }}>COMPLETION RATE</span><span className="text-xs font-bold" style={{ color: CC }}>68%</span></div><div className="w-full h-2.5 rounded-full" style={{ background: `${CC}15` }}><div className="h-full rounded-full" style={{ width: '68%', background: `linear-gradient(90deg, ${CC}, #818CF8)`, boxShadow: `0 0 10px ${CC}40`, animation: 'barGrow 1.2s 0.8s both' }} /></div></div>
        </ChartCard>
      </div>
      <ChartCard title="Recent Cases" delay={0.55} extra={<button className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.02]" style={{ background: `rgba(${CR},0.08)`, color: CC, border: `1px solid rgba(${CR},0.15)` }}>View All <FiArrowUpRight size={11} /></button>}>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[600px]">
            <thead><tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>{['Case ID', 'Candidate', 'Checks', 'Progress', 'Status', 'TAT', 'Date', ''].map((h, i) => <th key={i} className="text-left text-[10px] font-semibold py-2.5 px-2" style={{ color: TEXT_MUTED }}>{h}</th>)}</tr></thead>
            <tbody>{clientRecentCases.map((c, i) => { const sc = statusColorMap[c.status] || statusColorMap['Pending']; const tc = tatColorMap[c.tat] || tatColorMap['Within SLA']; const pct = Math.round((c.completed / c.checks) * 100); return (<tr key={i} className="transition-colors hover:bg-gray-50/50" style={{ borderBottom: `1px solid ${CARD_BORDER}60`, animation: `fadeInUp 0.3s ${0.6 + i * 0.04}s both` }}><td className="py-2.5 px-2"><span className="text-[11px] font-semibold" style={{ color: CC }}>{c.id}</span></td><td className="py-2.5 px-2"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: `${CC}30`, color: CC }}>{c.candidate.split(' ').map(n => n[0]).join('')}</div><span className="text-[11px] font-medium" style={{ color: TEXT_PRIMARY }}>{c.candidate}</span></div></td><td className="py-2.5 px-2 text-[11px]" style={{ color: TEXT_SECONDARY }}>{c.completed}/{c.checks}</td><td className="py-2.5 px-2"><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full" style={{ background: `${sc.dot}20` }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: sc.dot }} /></div><span className="text-[10px] font-semibold" style={{ color: sc.dot }}>{pct}%</span></div></td><td className="py-2.5 px-2"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold" style={{ background: sc.bg, color: sc.text }}><div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />{c.status}</span></td><td className="py-2.5 px-2"><span className="px-2 py-1 rounded-md text-[10px] font-semibold" style={{ background: tc.bg, color: tc.text }}>{c.tat}</span></td><td className="py-2.5 px-2 text-[10px]" style={{ color: TEXT_MUTED }}>{c.date}</td><td className="py-2.5 px-2"><button className="p-1 rounded-lg hover:bg-gray-100"><FiExternalLink size={12} style={{ color: TEXT_MUTED }} /></button></td></tr>); })}</tbody>
          </table>
        </div>
      </ChartCard>
      <div className="mt-4 sm:mt-5" style={{ animation: 'fadeInUp 0.5s 0.7s both' }}>
        <ChartCard title="Notifications" delay={0}>
          <div className="space-y-2">{clientNotifications.map((n, i) => { const nc = notifColorMap[n.type] || notifColorMap.info; const NI = nc.icon; return (<div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all hover:scale-[1.005]" style={{ background: nc.bg, border: `1px solid ${nc.border}`, animation: `fadeInUp 0.3s ${0.75 + i * 0.05}s both` }}><div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${nc.color}15` }}><NI size={13} style={{ color: nc.color }} /></div><div className="flex-1 min-w-0"><p className="text-[11px] font-medium leading-snug" style={{ color: TEXT_PRIMARY }}>{n.message}</p><p className="text-[10px] mt-1" style={{ color: TEXT_MUTED }}>{n.time}</p></div></div>); })}</div>
        </ChartCard>
      </div>
    </div>
  );
}

/* ───────── BGV Dashboard Content (Admin) ───────── */
function BGVContent({ activeFilter, setActiveFilter }) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">{statsData.map((s, i) => <StatCard key={i} {...s} delay={i} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="lg:col-span-2"><ChartCard title="Verification Trends" delay={0.5}><div className="h-[200px] sm:h-[260px] lg:h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><defs><linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.colors.accent} stopOpacity={0.3} /><stop offset="95%" stopColor={theme.colors.accent} stopOpacity={0} /></linearGradient><linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.colors.indigo} stopOpacity={0.2} /><stop offset="95%" stopColor={theme.colors.indigo} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={CARD_BORDER} vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 12 }} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="checks" stroke={theme.colors.accent} strokeWidth={2} fillOpacity={1} fill="url(#accentGrad)" name="Checks" /><Area type="monotone" dataKey="wos" stroke={theme.colors.indigo} strokeWidth={2} fillOpacity={1} fill="url(#indigoGrad)" name="Work Orders" /></AreaChart></ResponsiveContainer></div></ChartCard></div>
        <div><ChartCard title="Check Breakdown" delay={0.6}><div className="h-[200px] sm:h-[260px] lg:h-[300px] flex items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={checkBreakdown} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3}>{checkBreakdown.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart></ResponsiveContainer></div></ChartCard></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2"><ChartCard title="Monthly Work Orders" delay={0.7}><div className="h-[200px] sm:h-[240px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke={CARD_BORDER} vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: TEXT_MUTED, fontSize: 12 }} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="wos" fill={theme.colors.accent} radius={[6, 6, 0, 0]} name="Work Orders" /></BarChart></ResponsiveContainer></div></ChartCard></div>
        <div><ChartCard title="Top Clients (Billing)" delay={0.8}><div className="space-y-3">{billingData.slice(0, 5).map((b, i) => <div key={i} className="flex items-center justify-between text-xs"><span style={{ color: TEXT_SECONDARY }}>{b.client}</span><span className="font-semibold" style={{ color: TEXT_PRIMARY }}>{b.amount}</span></div>)}</div></ChartCard></div>
      </div>
    </>
  );
}

/* ============================================================
MAIN DASHBOARD COMPONENT
=========================================================== */
export default function BGVDashboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('monthly');
  const [activeMenu, setActiveMenu] = useState('BGV Dashboard');
  const [activeCard, setActiveCard] = useState('Clients');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);

  const [dynamicCheckTypes, setDynamicCheckTypes] = useState([]);
  const [loadingCheckTypes, setLoadingCheckTypes] = useState(true);

  useEffect(() => {
    let c = false;
    const fetch = async () => {
      try { setLoadingCheckTypes(true); const r = await api.get('/verifications/checktypes'); if (!c && r.data.success) setDynamicCheckTypes(r.data.checkTypes || []); } catch {} finally { if (!c) setLoadingCheckTypes(false); }
    };
    fetch();
    return () => { c = true; };
  }, []);

  const verificationItems = [
    { name: 'All Verifications', icon: FiLayers, desc: 'Cross-check-type view', route: '/verifications-overall' },
    ...dynamicCheckTypes.map(ct => { const v = getCheckTypeVisual(ct._id); return { name: ct.name, icon: v.icon, desc: `Queue for ${ct.name.toLowerCase()}`, route: `/verifications/${ct._id}/assignment` }; }),
  ];

  const fullMenuConfig = { ...menuConfig, Verifications: { icon: FiCheckSquare, color: '#F97316', isDashboard: false, items: verificationItems } };

  const currentMenu = fullMenuConfig[activeMenu];
  const isDashboardView = currentMenu?.isDashboard;
  const isClientDashboardView = currentMenu?.isClientDashboard;
  const isSupportDashboardView = currentMenu?.isSupportDashboard;
  const isVerificationsView = activeMenu === 'Verifications';

  const handleRaiseTicket = () => {
    setActiveMenu('Support');
    setShowTicketForm(true);
    setSideMenuOpen(false);
  };

  const handleBackToSupport = () => {
    setShowTicketForm(false);
  };

  const handleCardClick = (item) => {
    if (item.route) { navigate(item.route); return; }
    const routes = { 'BGV Users': '/employee-creation', 'Clients': '/client-creation', 'Vendors': '/vendor-creation', 'Check Types': '/checktype-creation', 'Packages': '/package-creation', 'Document Types': '/documenttype-creation', 'Departments': '/department-creation', 'Company Directory': '/company-directory', 'Courts': '/court-creation', 'Universities': '/university-creation', 'Check Fields Creation': '/checktype-customfields', 'Roles & Permissions': '/roles-and-permissions', 'All Cases': '/employee-workorder-dashboard','Case Reviews': '/casereviews' , 'Assignments': '/employee-assignment', 'Insufficiencies':'/insufficiency-management', 'Pending Workorders (TL)': '/data-management', 'Pending Workorders (TM)': '/data-management-completed', 'Insufficiency Management': '/insufficiency-management', 'QC Queue': '/qc-assignment-team', 'Field Visits':'/field-visits', 'QC Reviews': '/qc-member-screen', 'Generate Report': '/reports', 'Report Delivery': '/report-delivery-screen' };
    if (routes[item.name]) navigate(routes[item.name]);
    else setActiveCard(item.name);
  };

  // Ticket form view (full screen, no sidebar cards)
  if (showTicketForm && isSupportDashboardView) {
    return (
      <div className="min-h-screen relative" style={{ background: '#f8fefd' }}>
        <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes barGrow{from{width:0}}.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
        <SideMenu menuConfig={fullMenuConfig} activeMenu={activeMenu} onMenuChange={(m) => { setActiveMenu(m); setShowTicketForm(false); const items = fullMenuConfig[m]?.items || []; if (items.length > 0) setActiveCard(items[0].name); setSideMenuOpen(false); }} isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
        <button onClick={() => setSideMenuOpen(true)} className="fixed top-4 left-4 z-30 lg:hidden p-2.5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><FiMenu size={20} style={{ color: TEXT_PRIMARY }} /></button>
        <div className="relative z-10 flex flex-col min-h-screen">
          <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1440px] mx-auto w-full">
            <div className="lg:pl-[292px]">
              <RaiseTicketForm menuColor={fullMenuConfig.Support.color} onBack={handleBackToSupport} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#f8fefd' }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes barGrow{from{width:0}}.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <SideMenu menuConfig={fullMenuConfig} activeMenu={activeMenu} onMenuChange={(m) => { setActiveMenu(m); setShowTicketForm(false); const items = fullMenuConfig[m]?.items || []; if (items.length > 0) setActiveCard(items[0].name); setSideMenuOpen(false); }} isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
      <button onClick={() => setSideMenuOpen(true)} className="fixed top-4 left-4 z-30 lg:hidden p-2.5 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}><FiMenu size={20} style={{ color: TEXT_PRIMARY }} /></button>
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1440px] mx-auto w-full">
          <div className="lg:pl-[292px]">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: TEXT_PRIMARY, fontFamily: theme.fonts.display }}>{activeMenu}</h1>
            </div>
            {!isDashboardView && !isClientDashboardView && !isSupportDashboardView && (
              <CardGridMenu activeMenu={activeMenu} menuConfig={fullMenuConfig} onCardClick={handleCardClick} activeCard={activeCard} />
            )}
            {isVerificationsView && !loadingCheckTypes && dynamicCheckTypes.length === 0 && (
              <p className="text-xs mb-4" style={{ color: TEXT_MUTED }}>No check types yet. Queues appear automatically after creating check types under Masters → Check Types.</p>
            )}
            {isDashboardView ? (
              <BGVContent activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            ) : isClientDashboardView ? (
              <ClientDashboardContent onRaiseTicket={handleRaiseTicket} />
            ) : isSupportDashboardView ? (
              <SupportTicketDashboard onRaiseTicket={handleRaiseTicket} />
            ) : !isVerificationsView ? (
              <ComingSoonPage menuName={activeMenu} menuColor={currentMenu.color} menuIcon={currentMenu.icon} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}