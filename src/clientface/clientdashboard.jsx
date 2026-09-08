 import React, { useState, useEffect, useCallback, useRef } from 'react';
    import {
   FiGrid, FiBox, FiFileText, FiHeadphones, FiDollarSign,
  FiPlus, FiUpload, FiEye, FiBarChart2, FiPrinter,
  FiCheckCircle, FiClock, FiX, FiSearch,
  FiArrowLeft, FiMenu, FiX as FiClose, FiHome,
  FiChevronRight, FiAlertCircle, FiCheck,
  FiBriefcase, FiActivity, FiUser,
  FiLayers, FiChevronDown, FiFilter, FiDownload,
  FiMail, FiPhone, FiHash, FiShield,
  FiFilePlus, FiTrash2,
  FiLoader, FiAlertTriangle, FiRefreshCw,
  FiSend, FiMessageSquare, FiEdit2,
  FiFile, FiPaperclip, FiPlusCircle,
  FiChevronLeft,
  FiSkipBack,
  FiSkipForward
    } from 'react-icons/fi';
    import theme from '../theme/theme';
    import Header from '../screens/header';
    import { useNavigate } from "react-router-dom";

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-r6xl.onrender.com';
    const API = `${API_BASE_URL}/api`;

    const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token') || '';
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
    try {
        const res = await fetch(`${API}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        return data;
    } catch (err) { console.error(`API Error [${endpoint}]:`, err.message); throw err; }
    };

    const getClientAuth = () => { try { const s = localStorage.getItem('clientUser') || localStorage.getItem('user') || '{}'; return typeof s === 'string' ? JSON.parse(s) : s; } catch { return {}; } };

    const statusConfig = {
    pending: { bg: 'rgba(245,166,35,0.12)', color: '#F59E0B', icon: FiClock, border: 'rgba(245,166,35,0.3)', label: 'Pending' },
    draft: { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF', icon: FiClock, border: 'rgba(156,163,175,0.3)', label: 'Draft' },
    'in-progress': { bg: 'rgba(6,182,212,0.12)', color: '#06B6D4', icon: FiActivity, border: 'rgba(6,182,212,0.3)', label: 'In Progress' },
    'candidate-details': { bg: 'rgba(99,102,241,0.12)', color: '#6366F1', icon: FiUser, border: 'rgba(99,102,241,0.3)', label: 'Candidate Details' },
    completed: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', icon: FiCheckCircle, border: 'rgba(16,185,129,0.3)', label: 'Completed' },
    'assignment-pending': { bg: 'rgba(245,166,35,0.12)', color: '#F59E0B', icon: FiClock, border: 'rgba(245,166,35,0.3)', label: 'Assignment Pending' },
    'on-hold': { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6', icon: FiClock, border: 'rgba(139,92,246,0.3)', label: 'On Hold' },
    hold: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6', icon: FiClock, border: 'rgba(139,92,246,0.3)', label: 'On Hold' },
    stopped: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', icon: FiX, border: 'rgba(239,68,68,0.3)', label: 'Stopped' },
    overdue: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', icon: FiAlertTriangle, border: 'rgba(239,68,68,0.3)', label: 'Overdue' },
    cancelled: { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF', icon: FiX, border: 'rgba(156,163,175,0.3)', label: 'Cancelled' },
    open: { bg: 'rgba(6,182,212,0.12)', color: '#06B6D4', icon: FiAlertCircle, border: 'rgba(6,182,212,0.3)', label: 'Open' },
    closed: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', icon: FiCheckCircle, border: 'rgba(16,185,129,0.3)', label: 'Resolved' },
    clear: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', icon: FiCheckCircle, border: 'rgba(16,185,129,0.3)', label: 'Clear' },
    'insuff-clear': { bg: 'rgba(245,166,35,0.12)', color: '#F59E0B', icon: FiAlertTriangle, border: 'rgba(245,166,35,0.3)', label: 'Insuff. Clear' },
    };
    const getStatusConfig = (status) => statusConfig[status?.toString().trim().toLowerCase()] || statusConfig.draft;

    const STATUS_GROUPS = {
    'active': { label: 'Active', color: '#06B6D4', statuses: ['pending', 'in-progress', 'candidate-details', 'assignment-pending', 'draft', 'open'] },
    'hold': { label: 'On Hold', color: '#8B5CF6', statuses: ['on-hold', 'hold'] },
    'stopped': { label: 'Stopped', color: '#EF4444', statuses: ['stopped'] },
    'insuff': { label: 'Insuff', color: '#F59E0B', statuses: ['insuff-clear'] },
    'completed': { label: 'Completed', color: '#10B981', statuses: ['completed', 'clear', 'closed'] },
    'overdue': { label: 'Overdue', color: '#EF4444', statuses: ['overdue'] },
    'cancelled': { label: 'Cancelled', color: '#9CA3AF', statuses: ['cancelled'] },
    };

    const priorityStyles = {
    urgent: 'bg-red-100 text-red-700 border border-red-300', high: 'bg-red-50 text-red-600 border border-red-200',
    medium: 'bg-amber-50 text-amber-600 border border-amber-200', low: 'bg-green-50 text-green-600 border border-green-200',
    standard: 'bg-gray-50 text-gray-600 border border-gray-200',
    };

    const sidebarMenu = [
    { name: 'Dashboard', icon: FiGrid, color: '#06B6D4', type: 'page', content: 'dashboard', items: [] },
    { name: 'Track Cases', icon: FiEye, color: '#0891b2', type: 'page', content: 'track-cases', items: [] },
    { name: 'Work Order', icon: FiBox, color: '#8B5CF6', type: 'page', content: 'cards', items: [
        { name: 'Create / View Workorder', icon: FiPlus, desc: 'Create new work order', path: '/workorder-dashboard' },
        { name: 'Bulk Workorder', icon: FiBox, desc: 'Bulk work order upload' },
        // { name: 'Bulk Upload Document', icon: FiUpload, desc: 'Upload multiple files' },
    ]},
    { name: 'Report', icon: FiFileText, color: '#10B981', type: 'page', content: 'cards', items: [
        { name: 'Checkwise Report', icon: FiBarChart2, desc: 'View checkwise analysis' },
        { name: 'View Published Reports', icon: FiPrinter, desc: 'Browse published reports' }
    ]},
    { name: 'Support', icon: FiHeadphones, color: '#F59E0B', type: 'page', content: 'support-dashboard', items: [] },
    { name: 'Fee Approvals', icon: FiDollarSign, color: '#EC4899', type: 'page', content: 'fee-approvals', items: [] }
    ];

    // --- UI Components ---
    function Toast({ message, type, onClose }) {
    if (!message) return null;
    const colors = { success: { bg: '#10B981', icon: FiCheckCircle }, error: { bg: '#EF4444', icon: FiX }, info: { bg: '#06B6D4', icon: FiAlertCircle }, warning: { bg: '#F59E0B', icon: FiAlertTriangle } };
    const cfg = colors[type] || colors.info; const Icon = cfg.icon;
    return (<div className="fixed top-28 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium" style={{ background: cfg.bg, animation: 'fadeInUp 0.3s both', minWidth: '280px' }}><Icon size={18} /><span className="flex-1">{message}</span><button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20"><FiClose size={14} /></button></div>);
    }
    function LoadingState({ message }) { return (<div className="flex flex-col items-center justify-center py-16 px-4"><div className="w-12 h-12 rounded-full border-3 border-cyan-200 border-t-cyan-500 animate-spin mb-4" style={{ borderWidth: '3px' }} /><p className="text-sm font-medium text-gray-600">{message || 'Loading...'}</p></div>); }
    function EmptyTableState({ icon: Icon, title, subtitle }) { return (<div className="flex flex-col items-center justify-center py-12 px-4"><div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-gray-100 border border-gray-200"><Icon size={24} style={{ color: '#9ca3af' }} /></div><p className="text-xs font-medium text-gray-600 mb-1">{title}</p><p className="text-[10px] text-gray-500">{subtitle}</p></div>); }
    function StatusBadge({ status }) { const cfg = getStatusConfig(status); const StatusIcon = cfg.icon; return (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}><StatusIcon size={10} /> {cfg.label}</span>); }
    function ProgressBar({ current, total, color = '#06B6D4' }) { const pct = total > 0 ? Math.round((current / total) * 100) : 0; return (<div className="flex items-center gap-2"><div className="h-1.5 rounded-full bg-gray-100 overflow-hidden w-20"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} /></div><span className="text-[10px] text-gray-500">{pct}%</span></div>); }

    function Sidebar({ activeMenu, onMenuClick, isOpen, onClose }) {
    return (<>
        {isOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />}
        <aside className={`fixed left-0 top-24 h-[calc(100vh-96px)] z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ width: '260px', background: '#fff', borderRight: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-200"><div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center"><FiGrid size={18} className="text-cyan-600" /></div><span className="text-lg font-bold text-gray-900">Client Portal</span><button onClick={onClose} className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-gray-100"><FiClose size={18} className="text-gray-500" /></button></div>
        <div className="py-3 px-3 overflow-y-auto" style={{ height: 'calc(100% - 64px)' }}>{sidebarMenu.map((menu) => { const isActive = activeMenu === menu.name; const MenuIcon = menu.icon; return (<div key={menu.name} className="mb-1"><button onClick={() => onMenuClick(menu.name, menu.content)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: isActive ? '#f0f9ff' : 'transparent', color: isActive ? '#0f172a' : '#374151', border: isActive ? '1px solid #67e8f9' : '1px solid transparent' }}><MenuIcon size={18} style={{ color: isActive ? menu.color : '#6b7280' }} /><span className="flex-1 text-left">{menu.name}</span>{isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ background: menu.color }} />}</button></div>); })}</div>
        </aside>
    </>);
    }

    function CardGridView({ title, subtitle, items, menuColor, onCardClick, activeCard }) {
    const rgb = menuColor.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16)).join(',');
    return (<div className="space-y-6"><div><h1 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>{title}</h1><p className="text-xs sm:text-sm mt-1 text-gray-600">{subtitle}</p></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{items.map((item, index) => { const isActive = activeCard === item.name; const ItemIcon = item.icon; return (<button key={index} onClick={() => onCardClick(item)} className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.03] border" style={{ background: isActive ? `rgba(${rgb}, 0.08)` : '#fff', borderColor: isActive ? `${menuColor}80` : '#e5e7eb' }}><div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `rgba(${rgb}, 0.1)` }}><ItemIcon size={22} style={{ color: menuColor }} /></div><span className="text-xs font-medium text-center text-gray-800">{item.name}</span><span className="text-[10px] text-center hidden sm:block text-gray-500">{item.desc}</span></button>); })}</div></div>);
    }

    function StatCard({ title, value, icon: Icon, color, colorRgb, loading }) {
    return (<div className="relative rounded-2xl p-4 sm:p-5 overflow-hidden group transition-all duration-300 hover:scale-[1.02] border" style={{ background: '#fff', borderColor: '#e5e7eb' }}><div className="relative flex items-start justify-between mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `rgba(${colorRgb}, 0.08)` }}>{loading ? <FiLoader size={20} style={{ color, animation: 'spin 1s linear infinite' }} /> : <Icon size={20} style={{ color }} />}</div></div><div className="relative"><h3 className="text-2xl font-bold mb-1 text-gray-900" style={{ fontFamily: theme.fonts.display }}>{loading ? '—' : value}</h3><p className="text-xs text-gray-600">{title}</p></div></div>);
    }

    function QuickActionCard({ icon: Icon, title, color, colorRgb, onClick }) {
    return (<button onClick={onClick} className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.03] w-full border" style={{ background: '#fff', borderColor: '#e5e7eb' }}><div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `rgba(${colorRgb}, 0.08)` }}><Icon size={26} style={{ color }} /></div><span className="text-xs font-medium text-center text-gray-700">{title}</span></button>);
    }

    function FormInput({ label, placeholder, icon: Icon, type = 'text', value, onChange, required }) {
    return (<div className="space-y-1.5"><label className="flex items-center gap-1 text-xs font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label><div className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all focus-within:ring-1 focus-within:ring-cyan-400 border" style={{ background: '#fff', borderColor: '#e5e7eb' }}>{Icon && <Icon size={14} style={{ color: '#6b7280' }} />}<input type={type} placeholder={placeholder} value={value} onChange={onChange} className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-400" /></div></div>);
    }

    function FormSelect({ label, value, onChange, options, placeholder }) {
    return (<div className="space-y-1.5"><label className="text-xs font-medium text-gray-700">{label}</label><div className="relative"><select value={value} onChange={onChange} className="w-full appearance-none px-3 py-2.5 rounded-xl text-sm outline-none text-gray-900 bg-white cursor-pointer border" style={{ borderColor: '#e5e7eb' }}><option value="">{placeholder}</option>{options.map((opt, i) => { const val = typeof opt === 'object' ? opt.value : opt; const lbl = typeof opt === 'object' ? opt.label : opt; return <option key={i} value={val}>{lbl}</option>; })}</select><FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" /></div></div>);
    }



    /* ================================================================
    ★ BULK WORKORDER UPLOAD MODAL ★
    - Download: XLSX only (dynamic import, no crash if missing)
    - Upload: accepts both CSV + XLSX
    - Endpoint: POST /api/workorder-assignment/bulk
    ================================================================ */
    function BulkUploadModal({ isOpen, onClose, clientAuth, onUploadSuccess }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [parsingFile, setParsingFile] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const fileInputRef = useRef(null);

    const BULK_UPLOAD_ENDPOINT = '/workorder-assignment/bulk';

    const TEMPLATE_HEADERS = [
        'HEAD', 'candidateName', 'fatherName', 'emailId', 'gender', 'dob', 'phoneNumber',
        'placeOfJoin', 'isAddressPresentRequired', 'isAddressPermanentRequired',
        'isEducationPgRequired', 'isEducationUgRequired', 'isEducationDiplomaRequired',
        'isEducation12thRequired', 'isEducation10thRequired', 'isEmploymentLatestRequired',
        'totalEmploymentToBeVerify', 'isCriminalPresentRequired', 'isCriminalPermanentRequired',
        'isCourtPresentRequired', 'isCourtPermanentRequired', 'numberOfReferences',
        'isDrugPanel10Required', 'isDrugPanel5Required', 'isDrugPanel4Required',
        'isDrugPanel3Required', 'isDrugPanel2Required', 'isIdPanCardRequired',
        'isIdDrivingLicenseRequired', 'isIdVoterIdRequired', 'isIdAadharIdRequired',
        'isIdPassportIdRequired'
    ];
    const SAMPLE_ROW = [
        0, 'Username', 'Fname', 'user@gmail.com', 'Male', '10-12-2024', '1234567890',
        '10-10-2024', 'Yes', 'Yes', 'No', 'No', 'No', 'No', 'No', 'No', 0,
        'No', 'No', 'No', 'No', 0, 'No', 'No', 'No', 'No', 'No',
        'No', 'No', 'No', 'No', 'No'
    ];

    useEffect(() => {
        if (!isOpen) {
        const timer = setTimeout(() => {
            setSelectedFile(null); setIsDragging(false); setUploading(false);
            setUploadProgress(0); setUploadResult(null); setError('');
            setPreviewData(null); setParsingFile(false); setDownloadingTemplate(false);
        }, 300);
        return () => clearTimeout(timer);
        }
    }, [isOpen]);

    /* ---------- DOWNLOAD TEMPLATE: XLSX only (dynamic import) ---------- */
    const handleDownloadTemplate = async () => {
        setDownloadingTemplate(true);
        setError('');

        try {
        // Dynamic import — works reliably with Vite, won't crash if missing
        const XLSX = await import('xlsx');

        const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, SAMPLE_ROW]);

        // Auto-size columns
        ws['!cols'] = TEMPLATE_HEADERS.map(h => ({
            wch: Math.max(String(h).length + 4, 14)
        }));

        // Style header row
        const headerRange = XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: 0, c: TEMPLATE_HEADERS.length - 1 }
        });
        if (!ws[headerRange]) ws[headerRange] = {};
        ws[headerRange].s = {
            font: { bold: true, sz: 11, color: { rgb: '1E3A5F' } },
            fill: { fgColor: { rgb: 'E0F2FE' } },
            alignment: { horizontal: 'center' }
        };

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'VT_Bulk_Workorder_Template.xlsx');

        } catch (err) {
        console.error('XLSX download error:', err);
        // Fallback: download as CSV if xlsx package not available
        setError('xlsx package not found on frontend. Downloading as CSV instead. Run "npm install xlsx" in your frontend project for XLSX downloads.');
        const csvContent = [TEMPLATE_HEADERS.join(','), SAMPLE_ROW.join(',')].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'VT_Bulk_Workorder_Template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        } finally {
        setDownloadingTemplate(false);
        }
    };

    /* ---------- FILE SELECT ---------- */
    const handleFileSelect = (file) => {
        setError(''); setUploadResult(null); setPreviewData(null);
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = file?.name?.toLowerCase() || '';
        const ext = validExtensions.find(e => fileName.endsWith(e));
        if (!ext) { setError('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.'); return; }
        if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB.'); return; }
        setSelectedFile(file);
        parseFileForPreview(file, ext);
    };

    /* ---------- SMART PARSER ---------- */
    const parseFileForPreview = (file, ext) => {
        setParsingFile(true);

        if (ext === '.xlsx' || ext === '.xls') {
        // Try to parse XLSX in browser using dynamic import
        (async () => {
            try {
            const XLSX = await import('xlsx');
            const buffer = await file.arrayBuffer();
            const data = new Uint8Array(buffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });

            if (rawRows.length < 2) {
                setError('Excel file needs a header row + at least 1 data row.');
                setParsingFile(false);
                return;
            }

            const headers = rawRows[0].map(h => String(h || '').trim());
            const dataRows = rawRows.slice(1, 6).map(row => {
                const obj = {};
                headers.forEach((h, i) => {
                obj[h] = row[i] !== undefined && row[i] !== null ? String(row[i]).trim() : '';
                });
                return obj;
            }).filter(row => Object.values(row).some(v => v !== ''));

            setPreviewData({ headers, rows: dataRows, totalRows: rawRows.length - 1, fileType: 'xlsx' });
            } catch {
            // xlsx not available — show info card, server will parse
            setPreviewData({
                headers: TEMPLATE_HEADERS,
                rows: [],
                totalRows: null,
                fileType: 'xlsx',
                binaryFile: true,
            });
            } finally {
            setParsingFile(false);
            }
        })();

        } else {
        // Parse CSV with built-in FileReader
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
            const text = e.target.result;
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            if (lines.length < 2) { setError('CSV needs header row + at least 1 data row.'); setParsingFile(false); return; }
            const headers = parseCSVLine(lines[0]);
            const dataRows = lines.slice(1, 6).map(line => {
                const values = parseCSVLine(line);
                const row = {};
                headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
                return row;
            }).filter(row => Object.values(row).some(v => v !== ''));
            setPreviewData({ headers, rows: dataRows, totalRows: lines.length - 1, fileType: 'csv' });
            } catch { setError('Failed to parse CSV file.'); }
            finally { setParsingFile(false); }
        };
        reader.readAsText(file);
        }
    };

    const parseCSVLine = (line) => {
        const result = []; let current = ''; let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
            else if (ch === '"') { inQuotes = false; }
            else { current += ch; }
        } else {
            if (ch === '"') { inQuotes = true; }
            else if (ch === ',') { result.push(current); current = ''; }
            else { current += ch; }
        }
        }
        result.push(current);
        return result;
    };

    /* ---------- DRAG & DROP ---------- */
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.length > 0) handleFileSelect(e.dataTransfer.files[0]); };
    const handleFileInputChange = (e) => { if (e.target.files?.length > 0) handleFileSelect(e.target.files[0]); };
    const handleRemoveFile = () => { setSelectedFile(null); setPreviewData(null); setError(''); if (fileInputRef.current) fileInputRef.current.value = ''; };

    /* ---------- UPLOAD: Real XHR to backend ---------- */
    const handleUpload = () => {
        if (!selectedFile) { setError('Please select a file first.'); return; }
        setError(''); setUploading(true); setUploadProgress(0);

        const token = localStorage.getItem('clientToken') || localStorage.getItem('token') || '';
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        });

        xhr.addEventListener('load', () => {
        setUploading(false);
        try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            setUploadResult({
                success: true,
                message: data.message || 'Bulk upload completed successfully!',
                total: data.total ?? data.totalRows ?? 0,
                created: data.created ?? data.successCount ?? 0,
                failed: data.failed ?? data.failedCount ?? 0,
                errors: data.errors ?? data.failedRows ?? [],
                workorderIds: data.workorderIds ?? [],
            });
            if (onUploadSuccess) onUploadSuccess(data);
            } else {
            setUploadResult({
                success: false,
                message: data.message || `Server error (${xhr.status})`,
                total: 0, created: 0, failed: 0,
                errors: data.errors || [data.message || `Upload failed (HTTP ${xhr.status})`],
            });
            }
        } catch {
            setUploadResult({
            success: false, message: 'Invalid response from server.',
            total: 0, created: 0, failed: 0,
            errors: ['Could not parse server response. Is the backend running?'],
            });
        }
        });

        xhr.addEventListener('error', () => {
        setUploading(false);
        setUploadResult({
            success: false, message: 'Network error — could not reach the server.',
            total: 0, created: 0, failed: 0,
            errors: [`Failed to connect to ${API}${BULK_UPLOAD_ENDPOINT}. Ensure backend is running on port 5000.`],
        });
        });

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('clientCode', clientAuth?.clientCode || '');
        formData.append('companyName', clientAuth?.companyName || '');
        formData.append('clientId', clientAuth?._id || '');
        formData.append('uploadedBy', clientAuth?.email || '');
        formData.append('portalEmail', clientAuth?.portalEmail || clientAuth?.email || '');
        formData.append('uploadedByName', clientAuth?.companyName || clientAuth?.displayName || '');
        formData.append('origin', 'client');

        xhr.open('POST', `${API}${BULK_UPLOAD_ENDPOINT}`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    const getFileExtension = (name) => { const parts = name?.split('.'); return parts?.length > 1 ? parts.pop().toUpperCase() : 'FILE'; };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={uploading ? undefined : onClose} style={{ animation: 'fadeIn 0.2s ease' }} />

        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ background: '#fff', border: '1px solid #e5e7eb', animation: 'fadeInUp 0.3s ease' }}>

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
                <FiUpload size={18} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>Bulk Workorder Upload</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Client / Work Orders</p>
                </div>
            </div>
            <button onClick={onClose} disabled={uploading} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40">
                <FiX size={18} className="text-gray-500" />
            </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">

            {/* Download Template — XLSX only */}
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'rgba(6,182,212,0.03)', borderColor: 'rgba(6,182,212,0.15)' }}>
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)' }}>
                    <FiFile size={18} style={{ color: '#0891b2' }} />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-800">Download Template</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">XLSX format with all 32 required columns</p>
                </div>
                </div>
                <button
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white transition-all hover:scale-[1.03] hover:shadow-md disabled:opacity-50"
                style={{ background: '#0891b2' }}
                >
                {downloadingTemplate
                    ? <><FiLoader size={13} className="animate-spin" /> Generating...</>
                    : <><FiDownload size={13} /> Download .xlsx</>
                }
                </button>
            </div>

            {/* Upload Area */}
            {!uploadResult && (
                <div>
                {!selectedFile ? (
                    <div
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300"
                    style={{
                        borderColor: isDragging ? '#8B5CF6' : '#d1d5db',
                        background: isDragging ? 'rgba(139,92,246,0.04)' : 'rgba(249,250,251,0.8)'
                    }}
                    >
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300" style={{ background: isDragging ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)', transform: isDragging ? 'scale(1.1)' : 'scale(1)' }}>
                        <FiUpload size={28} style={{ color: isDragging ? '#7c3aed' : '#8B5CF6' }} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-800">{isDragging ? 'Drop your file here' : 'Drop an xlsx / csv file here or click to upload'}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Supports .xlsx, .xls, .csv files (max 10MB)</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileInputChange} className="hidden" />
                    </div>
                ) : (
                    <div className="space-y-4">

                    {/* Selected File Card */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.08)' }}>
                        <FiFile size={22} style={{ color: '#10B981' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500">{formatFileSize(selectedFile.size)}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.08)', color: '#7c3aed' }}>{getFileExtension(selectedFile.name)}</span>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                        {parsingFile ? (
                            <span className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-md" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                            <FiLoader size={10} className="animate-spin" /> Parsing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-md" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>
                            <FiCheck size={10} /> Ready
                            </span>
                        )}
                        <button onClick={handleRemoveFile} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                            <FiTrash2 size={14} className="text-red-400" />
                        </button>
                        </div>
                    </div>

                    {/* Parsing spinner */}
                    {parsingFile && (
                        <div className="flex items-center justify-center gap-3 py-6">
                        <div className="w-5 h-5 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin" style={{ borderWidth: '2px' }} />
                        <span className="text-xs text-gray-500">Parsing {getFileExtension(selectedFile.name)} file...</span>
                        </div>
                    )}

                    {/* Preview */}
                    {!parsingFile && previewData && (
                        previewData.binaryFile ? (
                        /* XLSX: info card when xlsx lib not available in browser */
                        <div className="flex flex-col items-center gap-3 py-6 px-4 rounded-xl border" style={{ borderColor: '#e5e7eb', background: 'rgba(139,92,246,0.02)' }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
                            <FiFile size={22} style={{ color: '#8B5CF6' }} />
                            </div>
                            <div className="text-center">
                            <p className="text-xs font-semibold text-gray-800">Excel file ready for upload</p>
                            <p className="text-[10px] text-gray-500 mt-1">The server will parse the .{previewData.fileType} file and create workorders</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                            {previewData.headers.slice(0, 10).map((h, i) => (
                                <span key={i} className="text-[8px] font-medium px-2 py-1 rounded" style={{ background: '#f1f5f9', color: '#64748b' }}>{h}</span>
                            ))}
                            <span className="text-[8px] font-medium px-2 py-1 rounded" style={{ background: '#f1f5f9', color: '#94a3b8' }}>+{previewData.headers.length - 10} more</span>
                            </div>
                        </div>
                        ) : (
                        /* CSV or parsed XLSX: full preview table */
                        <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
                            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ background: '#f9fafb', borderColor: '#e5e7eb' }}>
                            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                                Preview (first {previewData.rows.length} rows{previewData.totalRows ? ` of ${previewData.totalRows}` : ''})
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: previewData.fileType === 'xlsx' ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)', color: previewData.fileType === 'xlsx' ? '#059669' : '#2563eb' }}>
                                .{previewData.fileType?.toUpperCase()}
                            </span>
                            </div>
                            <div className="overflow-x-auto" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                            <table className="w-full">
                                <thead className="sticky top-0 z-[1]">
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th className="px-2.5 py-2 text-left text-[8px] font-bold uppercase text-gray-500 whitespace-nowrap border-r" style={{ borderColor: '#e2e8f0', minWidth: '28px' }}>#</th>
                                    {previewData.headers.map((h, i) => (
                                    <th key={i} className="px-2.5 py-2 text-left text-[8px] font-bold uppercase text-gray-500 whitespace-nowrap border-r last:border-r-0" style={{ borderColor: '#e2e8f0', minWidth: '85px' }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {previewData.rows.map((row, ri) => (
                                    <tr key={ri} className="hover:bg-cyan-50/30 transition-colors" style={{ background: ri % 2 === 0 ? '#fff' : '#fafbfc' }}>
                                    <td className="px-2.5 py-1.5 text-[9px] text-gray-400 font-mono border-r" style={{ borderColor: '#f1f5f9' }}>{ri + 1}</td>
                                    {previewData.headers.map((h, ci) => (
                                        <td key={ci} className="px-2.5 py-1.5 text-[9px] text-gray-700 whitespace-nowrap border-r last:border-r-0 max-w-[140px] truncate" style={{ borderColor: '#f1f5f9' }}>
                                        {row[h] || <span className="text-gray-300">—</span>}
                                        </td>
                                    ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>
                            {previewData.totalRows > 5 && (
                            <div className="px-4 py-2 border-t text-center" style={{ background: '#f9fafb', borderColor: '#e5e7eb' }}>
                                <span className="text-[10px] text-gray-400">+ {previewData.totalRows - 5} more rows</span>
                            </div>
                            )}
                        </div>
                        )
                    )}
                    </div>
                )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs text-red-700 border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
                <FiAlertCircle size={16} className="shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError('')}><FiX size={14} /></button>
                </div>
            )}

            {/* Progress */}
            {uploading && (
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Uploading {selectedFile?.name}...</span>
                    <span className="text-xs font-bold" style={{ color: '#8B5CF6' }}>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%`, background: uploadProgress < 100 ? 'linear-gradient(90deg, #8B5CF6, #a78bfa)' : '#10B981' }} />
                </div>
                <p className="text-[10px] text-gray-400 text-center">Sending to server — please don't close this window</p>
                </div>
            )}

            {/* Result */}
            {uploadResult && (
                <div className="space-y-4">
                <div className="flex flex-col items-center gap-4 p-6 rounded-xl border" style={{ background: uploadResult.success ? 'rgba(16,185,129,0.03)' : 'rgba(239,68,68,0.03)', borderColor: uploadResult.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: uploadResult.success ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                    {uploadResult.success ? <FiCheckCircle size={32} style={{ color: '#10B981' }} /> : <FiAlertCircle size={32} style={{ color: '#EF4444' }} />}
                    </div>
                    <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{uploadResult.message}</p>
                    <div className="flex items-center justify-center gap-6 mt-3">
                        <div className="text-center"><p className="text-lg font-bold" style={{ color: '#8B5CF6' }}>{uploadResult.total}</p><p className="text-[10px] text-gray-500">Total</p></div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center"><p className="text-lg font-bold" style={{ color: '#10B981' }}>{uploadResult.created}</p><p className="text-[10px] text-gray-500">Created</p></div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center"><p className="text-lg font-bold" style={{ color: uploadResult.failed > 0 ? '#EF4444' : '#9CA3AF' }}>{uploadResult.failed}</p><p className="text-[10px] text-gray-500">Failed</p></div>
                    </div>
                    </div>
                </div>
                {uploadResult.errors?.length > 0 && (
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                    <div className="px-4 py-2.5 border-b" style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}>
                        <span className="text-[10px] font-semibold text-red-600 uppercase">Errors ({uploadResult.errors.length})</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-3 space-y-1.5">
                        {uploadResult.errors.map((err, i) => {
                        const msg = typeof err === 'string' ? err : err.message || err.row || JSON.stringify(err);
                        return <p key={i} className="text-[10px] text-red-600 flex items-start gap-1.5"><FiX size={10} className="shrink-0 mt-0.5" /><span>{msg}</span></p>;
                        })}
                    </div>
                    </div>
                )}
                </div>
            )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
            <button onClick={onClose} disabled={uploading} className="px-5 py-2.5 rounded-xl text-xs font-semibold border text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40" style={{ borderColor: '#e5e7eb' }}>
                {uploadResult ? 'Close' : 'Cancel'}
            </button>
            {!uploadResult && (
                <button onClick={handleUpload} disabled={!selectedFile || uploading || parsingFile} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100" style={{ background: '#10b981' }}>
                {uploading ? (<><FiLoader size={14} className="animate-spin" /> Uploading {Math.round(uploadProgress)}%...</>) : (<><FiUpload size={14} /> Upload Workorder</>)}
                </button>
            )}
            {uploadResult && (
                <button onClick={() => { setUploadResult(null); setSelectedFile(null); setPreviewData(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02]" style={{ background: '#8B5CF6' }}>
                <FiUpload size={14} /> Upload Another
                </button>
            )}
            </div>
        </div>
        </div>
    );
    }
    /* ================================================================
    INITIATE CASE FORM
    ================================================================ */
    function InitiateCaseForm({ onBack, onSubmitted, clientAuth }) {
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', client: '', branch: '', package: '', priority: 'Standard', clientRef: '', checks: [{ checkType: '', count: 1 }] });
    const [checkTypes, setCheckTypes] = useState([]); const [loading, setLoading] = useState(false); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState('');
    useEffect(() => { let c = false; (async () => { setLoading(true); try { const d = await apiCall('/checktypes'); if (!c && d.success) setCheckTypes(d.checkTypes || []); } catch {} finally { if (!c) setLoading(false); } })(); return () => { c = true; }; }, []);
    useEffect(() => { if (clientAuth) setFormData(p => ({ ...p, client: p.client || clientAuth.companyName || clientAuth.clientCode || '', clientRef: p.clientRef || clientAuth.clientCode || '' })); }, [clientAuth]);
    const uf = (f, v) => setFormData(p => ({ ...p, [f]: v }));
    const addC = () => setFormData(p => ({ ...p, checks: [...p.checks, { checkType: '', count: 1 }] }));
    const rmC = (i) => setFormData(p => ({ ...p, checks: p.checks.filter((_, idx) => idx !== i) }));
    const upC = (i, f, v) => setFormData(p => ({ ...p, checks: p.checks.map((c, idx) => idx === i ? { ...c, [f]: v } : c) }));
    const ctOpts = checkTypes.length > 0 ? checkTypes.map(ct => ({ value: ct._id, label: ct.name || ct.checkTypeName || ct.code })) : ['Employment Verification', 'Education Verification', 'Criminal Background', 'Address Verification'];
    const handleSubmit = async () => { setError(''); if (!formData.fullName.trim()) return setError('Full name required.'); if (!formData.email.trim()) return setError('Email required.'); if (!formData.phone.trim()) return setError('Phone required.'); if (!formData.client.trim()) return setError('Client required.'); const vc = formData.checks.filter(c => c.checkType); if (!vc.length) return setError('Add at least one check.'); setSubmitting(true); try { const cp = vc.map(c => { const d = checkTypes.find(ct => ct._id === c.checkType); return { checkType: d ? (d.name || d.checkTypeName) : c.checkType, checkTypeId: d?._id || '', subType: d?.subChecks?.[0] || '', count: c.count || 1, fields: [], data: {}, status: 'pending', notes: '' }; }); const pl = { ...formData, checks: cp, status: 'draft', initiationMode: 'Candidate', createdBy: { origin: 'client', userId: clientAuth?._id || '', name: clientAuth?.companyName || '', email: clientAuth?.email || '', clientCode: clientAuth?.clientCode || '', portalEmail: (clientAuth?.portalEmail || clientAuth?.email || '').trim() } }; const r = await apiCall('/workorders?as=client', { method: 'POST', body: JSON.stringify(pl) }); if (r.success) onSubmitted?.(r.workorder); else setError(r.message || 'Failed.'); } catch (e) { setError(e.message); } finally { setSubmitting(false); } };
    return (<div className="space-y-6"><div className="flex items-center gap-2 text-xs text-gray-500"><FiHome size={12} /><FiChevronRight size={12} /><span>Work Order</span><FiChevronRight size={12} /><span>Initiate Case</span></div><button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border text-gray-600 hover:bg-gray-100"><FiArrowLeft size={14} /> Back</button><div className="max-w-4xl"><h1 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: theme.fonts.display }}>Initiate Case</h1>{error && <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-xs text-red-700 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}><FiAlertCircle size={16} /><span className="flex-1">{error}</span><button onClick={() => setError('')}><FiX size={14} /></button></div>}<div className="rounded-2xl p-5 mb-4 border" style={{ background: '#fff', borderColor: '#e5e7eb' }}><h3 className="text-sm font-semibold text-gray-900 mb-4">Candidate Information</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><FormInput label="Full Name" placeholder="Name" icon={FiUser} value={formData.fullName} onChange={(e) => uf('fullName', e.target.value)} required /><FormInput label="Email" placeholder="email@example.com" icon={FiMail} type="email" value={formData.email} onChange={(e) => uf('email', e.target.value)} required /><FormInput label="Phone" placeholder="+91..." icon={FiPhone} type="tel" value={formData.phone} onChange={(e) => uf('phone', e.target.value)} required /></div></div><div className="rounded-2xl p-5 mb-4 border" style={{ background: '#fff', borderColor: '#e5e7eb' }}><h3 className="text-sm font-semibold text-gray-900 mb-4">Configuration</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><FormInput label="Client" placeholder="Client" value={formData.client} onChange={(e) => uf('client', e.target.value)} required /><FormSelect label="Priority" value={formData.priority} onChange={(e) => uf('priority', e.target.value)} options={['Standard', 'High', 'Urgent']} placeholder="Select" /><FormInput label="Client Ref" placeholder="EMP-123" icon={FiHash} value={formData.clientRef} onChange={(e) => uf('clientRef', e.target.value)} /></div></div><div className="rounded-2xl p-5 mb-6 border" style={{ background: '#fff', borderColor: '#e5e7eb' }}><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-gray-900">Checks {loading && <FiLoader size={12} className="animate-spin inline ml-2" />} </h3><button onClick={addC} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-emerald-700 border border-emerald-300 hover:scale-105" style={{ background: 'rgba(16,185,129,0.1)' }}><FiFilePlus size={12} /> Add</button></div><div className="space-y-3">{formData.checks.map((ch, i) => (<div key={i} className="flex items-end gap-3 p-3 rounded-xl border bg-gray-50" style={{ borderColor: '#e5e7eb' }}><div className="flex-1"><label className="text-[10px] text-gray-500 mb-1 block">Check Type</label><select value={ch.checkType} onChange={(e) => upC(i, 'checkType', e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs border bg-white" style={{ borderColor: '#e5e7eb' }}><option value="">-- Select --</option>{ctOpts.map((o, j) => { const v = typeof o === 'object' ? o.value : o; const l = typeof o === 'object' ? o.label : o; return <option key={j} value={v}>{l}</option>; })}</select></div><div className="w-20"><label className="text-[10px] text-gray-500 mb-1 block">Count</label><input type="number" min="1" value={ch.count} onChange={(e) => upC(i, 'count', parseInt(e.target.value) || 1)} className="w-full px-3 py-2 rounded-lg text-xs border text-center" style={{ borderColor: '#e5e7eb' }} /></div>{formData.checks.length > 1 && <button onClick={() => rmC(i)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><FiTrash2 size={14} /></button>}</div>))}</div></div><div className="flex gap-3"><button onClick={handleSubmit} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#10b981' }}>{submitting ? <><FiLoader size={18} className="animate-spin" /> Creating...</> : <><FiCheckCircle size={18} /> Submit Case</>}</button><button onClick={onBack} className="px-6 py-3 rounded-xl text-sm font-semibold border text-gray-600">Cancel</button></div></div></div>);
    }
    /* ================================================================
   SUPPORT DASHBOARD — Clean version, fixed timeline & textarea
   ================================================================ */
  function SupportDashboard({ clientAuth }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ subject: "", message: "", priority: "Medium", category: "General Inquiry" });
  const [formFiles, setFormFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [counts, setCounts] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 4000);
  };

  const getMyClientCode = () => clientAuth?.clientCode?.trim() || "";
  const getMyEmail = () => (clientAuth?.portalEmail || clientAuth?.email || "").trim();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      const myCode = getMyClientCode();
      if (myCode) p.set("clientCode", myCode);
      const res = await fetch(`${API}/support-tickets?${p.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
        if (data.counts) {
          setCounts({ total: data.counts.total || 0, open: data.counts.open || 0, inProgress: data.counts.inProgress || 0, resolved: data.counts.resolved || 0, closed: data.counts.closed || 0 });
        } else {
          const t = data.tickets || [];
          setCounts({ total: t.length, open: t.filter(x => x.status === 'open').length, inProgress: t.filter(x => x.status === 'in-progress').length, resolved: t.filter(x => x.status === 'resolved').length, closed: t.filter(x => x.status === 'closed').length });
        }
      } else { showToast(data.message || "Failed to load", "error"); setTickets([]); }
    } catch (err) { console.error(err); showToast("Network error", "error"); setTickets([]); }
    finally { setLoading(false); }
  }, [clientAuth]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { setCurrentPage(1); }, [tickets]);

  const fetchTicketDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/support-tickets/${id}`);
      const data = await res.json();
      if (data.success) setSelectedTicket(data.ticket);
      else showToast(data.message, "error");
    } catch { showToast("Network error", "error"); }
    finally { setDetailLoading(false); }
  };

  const handleViewTicket = (t) => { fetchTicketDetail(t._id || t.ticketId); setReplyText(""); setReplyFiles([]); };
  const handleCloseDetail = () => { setSelectedTicket(null); setReplyText(""); setReplyFiles([]); };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    const message = replyText.trim();
    if (!message && replyFiles.length === 0) { showToast("Please enter a message or attach a file.", "error"); return; }
    if (!selectedTicket?._id) { showToast("No ticket selected.", "error"); return; }
    if (replySubmitting) return;
    setReplySubmitting(true);
    try {
      const fd = new FormData();
      fd.append("message", message || "(attachment only)");
      fd.append("sender", "client");
      fd.append("senderName", clientAuth?.companyName || clientAuth?.displayName || "Client");
      replyFiles.forEach((file) => { fd.append("attachments", file); });
      const response = await fetch(`${API}/support-tickets/${selectedTicket._id}/replies`, { method: "POST", body: fd });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || `HTTP ${response.status}`);
      setReplyText(""); setReplyFiles([]);
      showToast("Reply sent successfully!", "success");
      await fetchTicketDetail(selectedTicket._id);
      await fetchTickets();
    } catch (error) { console.error("Reply error:", error); showToast(error.message || "Failed to send reply.", "error"); }
    finally { setReplySubmitting(false); }
  };

  /* ═══════════════════════════════════════════════
     ★ THESE WERE MISSING — NOW ADDED ★
     ═══════════════════════════════════════════════ */
  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setShowForm(false);
    setEditingTicket(null);
    setFormData({ subject: "", message: "", priority: "Medium", category: "General Inquiry" });
    setFormFiles([]);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.subject.trim()) { setFormError("Subject is required."); return; }
    if (!formData.message.trim()) { setFormError("Message is required."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("subject", formData.subject);
      fd.append("message", formData.message);
      fd.append("priority", formData.priority);
      fd.append("category", formData.category);
      fd.append("clientCode", getMyClientCode());
      fd.append("email", getMyEmail());
      fd.append("companyName", clientAuth?.companyName || "");
      fd.append("source", "client");
      formFiles.forEach(f => fd.append("attachments", f));
      const res = await fetch(`${API}/support-tickets`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) { showToast(editingTicket ? "Ticket updated!" : "Ticket raised!", "success"); resetForm(); fetchTickets(); }
      else { setFormError(data.message || "Failed to submit."); }
    } catch (err) { setFormError(err.message || "Network error."); }
    finally { setSubmitting(false); }
  };

  const handleEditTicket = (t) => {
    setEditingTicket(t);
    setFormData({ subject: t.subject || "", message: t.message || "", priority: t.priority || "Medium", category: t.category || "General Inquiry" });
    setShowForm(true);
  };

  const handleDeleteTicket = async (t) => {
    if (!window.confirm(`Delete ticket #${t.ticketId}?`)) return;
    try {
      const res = await fetch(`${API}/support-tickets/${t._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { showToast("Ticket deleted.", "success"); if (selectedTicket?._id === t._id) handleCloseDetail(); fetchTickets(); }
      else showToast(data.message || "Failed.", "error");
    } catch { showToast("Network error.", "error"); }
  };
  /* ═══════════════════════════════════════════════ */

  const timelineDotStyle = (status, isFirst) => {
    if (isFirst) return { dot: "bg-amber-400 border-amber-300", ring: "ring-4 ring-amber-100" };
    const map = {
      "open": { dot: "bg-cyan-400 border-cyan-300", ring: "ring-4 ring-cyan-50" },
      "in-progress": { dot: "bg-violet-400 border-violet-300", ring: "ring-4 ring-violet-50" },
      "resolved": { dot: "bg-emerald-400 border-emerald-300", ring: "ring-4 ring-emerald-50" },
      "closed": { dot: "bg-gray-400 border-gray-300", ring: "ring-4 ring-gray-100" },
    };
    return map[status] || { dot: "bg-gray-300 border-gray-200", ring: "ring-4 ring-gray-50" };
  };

  const totalPages = Math.ceil(tickets.length / rowsPerPage);
  const paginatedTickets = tickets.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const startRecord = tickets.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const DetailPanel = ({ ticket, loading, replyText, setReplyText, replyFiles, setReplyFiles, replySubmitting, onSubmitReply, onClose, onDelete }) => {
    const replies = ticket?.replies || [];
    const attachments = ticket?.attachments || [];
    const statusHistory = ticket?.statusHistory || [];
    const replyFileRef = useRef(null);
    const timeline = [
      { type: "created", status: "open", changedBy: ticket.createdBy || "client", changedAt: ticket.createdAt, note: "Ticket raised" },
      ...statusHistory.filter((sh, i) => { if (i === 0 && sh.status === "open" && sh.note === "Ticket created") return false; return true; })
    ];
    if (loading) return (
      <div className="rounded-2xl border p-8 text-center" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
        <FiLoader size={20} className="animate-spin mx-auto text-gray-400" />
        <p className="text-xs text-gray-500 mt-2">Loading…</p>
      </div>
    );
    return (
      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><FiArrowLeft size={16} className="text-gray-600" /></button>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">#{ticket.ticketId}</h3>
              <p className="text-[10px] text-gray-500">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${priorityStyles[ticket.priority?.toLowerCase()] || priorityStyles.standard}`}>{ticket.priority}</span>
            <StatusBadge status={ticket.status} />
            <button onClick={onDelete} className="ml-2 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"><FiTrash2 size={14} /></button>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">{ticket.subject}</h2>
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">{ticket.category}</span>
          </div>
          <div className="rounded-xl p-4 border" style={{ borderColor: "#e5e7eb", background: "#FAFBFC" }}>
            <h4 className="text-[10px] font-semibold uppercase text-gray-500 mb-4 flex items-center gap-1.5"><FiActivity size={11} className="text-gray-400" /> Ticket Flow</h4>
            <div className="space-y-0">
              {timeline.map((step, i) => {
                const isFirst = i === 0; const isLast = i === timeline.length - 1; const dotStyle = timelineDotStyle(step.status, isFirst);
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center" style={{ width: "20px" }}>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${dotStyle.dot} ${isFirst ? dotStyle.ring : ""}`} />
                      {!isLast && <div className="w-px flex-1 my-1 bg-gray-200" />}
                    </div>
                    <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-4"}`}>
                      {isFirst ? (
                        <div className="rounded-lg p-3 border border-amber-200" style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" }}>
                          <div className="flex items-center gap-2 mb-1"><FiPlusCircle size={13} className="text-amber-600" /><span className="text-xs font-bold text-amber-800">Ticket Raised</span></div>
                          <div className="flex items-center gap-2 text-[10px] text-amber-700">
                            <span className="font-medium">{step.changedBy === "client" ? (ticket.companyName || "Client") : step.changedBy}</span>
                            <span className="text-amber-400">•</span>
                            <span>{step.changedAt ? new Date(step.changedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg p-3 border border-gray-200 bg-white">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={step.status} />
                            <span className="text-[10px] text-gray-400">by</span>
                            <span className="text-[10px] font-semibold text-gray-700">{step.changedBy === "client" ? (ticket.companyName || "Client") : (step.changedBy === "admin" ? "Support Team" : step.changedBy)}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{step.changedAt ? new Date(step.changedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</p>
                          {step.note && <p className="text-[10px] text-gray-500 mt-1 italic">{step.note}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed" style={{ borderColor: "#e5e7eb", background: "#F8FAFC" }}>
              <div className={`w-2 h-2 rounded-full ${timelineDotStyle(ticket.status, false).dot}`} />
              <span className="text-[10px] text-gray-500">Current status:</span>
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <div className="rounded-xl p-4 border" style={{ borderColor: "#e5e7eb", background: "#FAFAFA" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center"><FiUser size={12} className="text-amber-600" /></div>
              <span className="text-xs font-semibold text-gray-800">{ticket.companyName || "You"}</span>
              <span className="text-[10px] text-gray-400">{ticket.email || "—"}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                {attachments.map((a, i) => (
                  <a key={i} href={a.dataUri} download={a.name} className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 transition-colors">
                    <FiPaperclip size={10} />{a.name}{a.size && <span className="text-gray-400">({(a.size / 1024).toFixed(0)}KB)</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
          {replies.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase text-gray-500 mb-3">Replies ({replies.length})</h4>
              <div className="space-y-3">
                {replies.map((r, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${r.sender === "admin" ? "bg-cyan-50/50 border-cyan-100" : "bg-gray-50 border-gray-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${r.sender === "admin" ? "bg-cyan-100" : "bg-amber-100"}`}>
                        {r.sender === "admin" ? <FiHeadphones size={12} className="text-cyan-600" /> : <FiUser size={12} className="text-amber-600" />}
                      </div>
                      <span className="text-xs font-semibold text-gray-800">{r.senderName || (r.sender === "admin" ? "Support Team" : "You")}</span>
                      <span className="text-[10px] text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.message}</p>
                    {r.attachments && r.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/60">
                        {r.attachments.map((a, j) => (
                          <a key={j} href={a.dataUri} download={a.name} className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 transition-colors">
                            <FiPaperclip size={10} />{a.name}{a.size && <span className="text-gray-400">({(a.size / 1024).toFixed(0)}KB)</span>}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {ticket.status !== "closed" ? (
            <form onSubmit={onSubmitReply} className="space-y-3 pt-3 border-t" style={{ borderColor: "#e5e7eb" }}>
              <h4 className="text-[10px] font-semibold uppercase text-gray-500">Reply</h4>
              <textarea rows={4} placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); }}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                style={{ borderColor: "#e5e7eb", direction: "ltr", textAlign: "left", writingMode: "horizontal-tb" }}
                required={replyFiles.length === 0}
              />
              <div className="space-y-2">
                <input ref={replyFileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length + replyFiles.length > 5) { showToast("Max 5 attachments", "error"); return; }
                    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
                    if (oversized) { showToast(`${oversized.name} exceeds 5MB`, "error"); return; }
                    setReplyFiles((prev) => [...prev, ...files]); e.target.value = "";
                  }}
                />
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => replyFileRef.current?.click()} disabled={replyFiles.length >= 5}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-40"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                  ><FiPaperclip size={13} /> Attach file <span className="text-gray-400">({replyFiles.length}/5)</span></button>
                  {replyFiles.length > 0 && <button type="button" onClick={() => setReplyFiles([])} className="text-[10px] text-red-500 hover:text-red-700 font-medium">Clear all</button>}
                </div>
                {replyFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {replyFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                        <FiPaperclip size={10} /><span className="max-w-[120px] truncate">{f.name}</span>
                        <span className="text-amber-400">({f.size < 1024 ? f.size + "B" : f.size < 1048576 ? (f.size / 1024).toFixed(0) + "KB" : (f.size / 1048576).toFixed(1) + "MB"})</span>
                        <button type="button" onClick={() => setReplyFiles((prev) => prev.filter((_, idx) => idx !== i))} className="hover:text-red-600"><FiX size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={replySubmitting || (!replyText.trim() && replyFiles.length === 0)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ background: "#F59E0B" }}
                >{replySubmitting ? <><FiLoader size={14} className="animate-spin" />Sending…</> : <><FiSend size={14} />Send</>}</button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl p-4 bg-gray-50 border border-gray-200 text-center"><p className="text-xs text-gray-500">This ticket is closed.</p></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>Support Center</h1>
          <p className="text-xs text-gray-600 mt-1">Get help from our team</p>
        </div>
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-90" style={{ background: "#F59E0B" }}>
          <FiPlus size={14} />{showForm ? "Close" : "Raise Ticket"}
        </button>
      </div>

      {toast.show && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium border ${toast.type === "error" ? "text-red-700 border-red-300 bg-red-50" : "text-emerald-700 border-emerald-300 bg-emerald-50"}`}>
          {toast.type === "error" ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl p-5 border shadow-sm" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{editingTicket ? "Edit" : "Submit"} Ticket</h3>
          {formError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-xs text-red-700 border" style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
              <FiAlertCircle size={16} /><span className="flex-1">{formError}</span>
              <button onClick={() => setFormError("")}><FiX size={14} /></button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Subject" placeholder="Brief description" icon={FiMessageSquare} value={formData.subject} onChange={(e) => updateForm("subject", e.target.value)} required />
              <FormSelect label="Priority" value={formData.priority} onChange={(e) => updateForm("priority", e.target.value)} options={["Low", "Medium", "High", "Urgent"]} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect label="Category" value={formData.category} onChange={(e) => updateForm("category", e.target.value)} options={["General Inquiry", "Issue Reading", "Tech Cases", "Report", "Case Delay", "Report Discrepancy", "Billing / Fees", "Feature Request", "Other"]} />
              {!editingTicket ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Attachments</label>
                  <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs border cursor-pointer hover:bg-gray-50" style={{ borderColor: "#e5e7eb" }}>
                    <FiPaperclip size={14} className="text-gray-400" />
                    <span className="text-gray-500 truncate">{formFiles.length > 0 ? `${formFiles.length} file(s)` : "Choose files (max 5)"}</span>
                    <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length + formFiles.length > 5) return showToast("Max 5 files", "error");
                      setFormFiles((prev) => [...prev, ...files]); e.target.value = "";
                    }} />
                  </label>
                </div>
              ) : <div />}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
              <textarea rows={4} placeholder="Describe your issue..." value={formData.message} onChange={(e) => updateForm("message", e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-1 focus:ring-amber-400 resize-none" style={{ borderColor: "#e5e7eb" }} required />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-xs font-semibold border text-gray-600 hover:bg-gray-50" style={{ borderColor: "#e5e7eb" }}>Cancel</button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60" style={{ background: "#F59E0B" }}>
                {submitting ? <><FiLoader size={14} className="animate-spin" />Saving…</> : <><FiSend size={14} />{editingTicket ? "Update" : "Submit"}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total" value={counts.total} icon={FiMessageSquare} color="#F59E0B" colorRgb="245,158,11" loading={loading} />
        <StatCard title="Open" value={counts.open} icon={FiAlertCircle} color="#06B6D4" colorRgb="6,182,212" loading={loading} />
        <StatCard title="In Progress" value={counts.inProgress} icon={FiClock} color="#8B5CF6" colorRgb="139,92,246" loading={loading} />
        <StatCard title="Resolved" value={counts.resolved + counts.closed} icon={FiCheckCircle} color="#10B981" colorRgb="16,185,129" loading={loading} />
      </div>

      {selectedTicket && (
        <DetailPanel
          ticket={selectedTicket} loading={detailLoading}
          replyText={replyText} setReplyText={setReplyText}
          replyFiles={replyFiles} setReplyFiles={setReplyFiles}
          replySubmitting={replySubmitting} onSubmitReply={handleSubmitReply}
          onClose={handleCloseDetail} onDelete={() => handleDeleteTicket(selectedTicket)}
        />
      )}

      <div className="rounded-2xl overflow-hidden border" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#e5e7eb" }}><h3 className="text-sm font-semibold text-gray-900">Your Tickets</h3></div>
        {loading ? (
          <LoadingState message="Loading tickets…" />
        ) : paginatedTickets.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500 tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500 tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Replies</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Date</th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase text-gray-500 tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.map((t, idx) => (
                    <tr key={t._id} className="border-b last:border-0 hover:bg-amber-50/30 transition-colors" style={{ borderColor: "#f1f5f9" }}>
                      <td className="px-4 py-3.5 text-[11px] text-gray-400 font-mono">{startRecord + idx}</td>
                      <td className="px-4 py-3.5 text-xs font-mono cursor-pointer hover:underline" style={{ color: "#F59E0B" }} onClick={() => handleViewTicket(t)}>#{t.ticketId}</td>
                      <td className="px-4 py-3.5 text-xs font-medium text-gray-900 max-w-[200px] truncate cursor-pointer hover:underline" onClick={() => handleViewTicket(t)}>{t.subject}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${priorityStyles[t.priority?.toLowerCase()] || priorityStyles.standard}`}>{t.priority}</span></td>
                      <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{(t.replies || []).length}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleViewTicket(t)} className="p-1.5 rounded-md bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100" title="View"><FiEye size={11} /></button>
                          {(t.status === "open" || t.status === "in-progress") && <button onClick={() => handleEditTicket(t)} className="p-1.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100" title="Edit"><FiEdit2 size={11} /></button>}
                          <button onClick={() => handleDeleteTicket(t)} className="p-1.5 rounded-md bg-red-50 text-red-500 border border-red-200 hover:bg-red-100" title="Delete"><FiTrash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t" style={{ borderColor: "#e5e7eb", background: "#fafbfc" }}>
                <span className="text-[11px] text-gray-500 font-medium">
                  Page <span className="font-semibold text-gray-700">{currentPage}</span> of <span className="font-semibold text-gray-700">{totalPages}</span>
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="font-semibold text-gray-700">{tickets.length}</span> records
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">Rows:</span>
                    <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="px-2 py-1 rounded-md text-[10px] font-medium border outline-none bg-white cursor-pointer" style={{ borderColor: "#d1d5db", color: "#374151" }}
                    >{[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}</select>
                  </div>
                  <div className="w-px h-5 bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95" style={{ borderColor: "#d1d5db" }} title="First"><FiSkipBack size={13} className="text-gray-600" /></button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95" style={{ borderColor: "#d1d5db" }} title="Previous"><FiChevronLeft size={13} className="text-gray-600" /></button>
                    <div className="flex items-center gap-0.5 mx-1">
                      {getPageNumbers().map((page, i) => {
                        if (page === '...') return <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-[11px] text-gray-400 font-medium select-none">…</span>;
                        const isActive = page === currentPage;
                        return (
                          <button key={page} onClick={() => setCurrentPage(page)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all active:scale-95"
                            style={{ background: isActive ? '#F59E0B' : 'transparent', color: isActive ? '#fff' : '#374151', border: isActive ? '1px solid #F59E0B' : '1px solid #d1d5db', boxShadow: isActive ? '0 1px 3px rgba(245,158,11,0.3)' : 'none' }}
                          >{page}</button>
                        );
                      })}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95" style={{ borderColor: "#d1d5db" }} title="Next"><FiChevronRight size={13} className="text-gray-600" /></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-95" style={{ borderColor: "#d1d5db" }} title="Last"><FiSkipForward size={13} className="text-gray-600" /></button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyTableState icon={FiHeadphones} title="No tickets found" subtitle="Raise a ticket to get help from our team" />
        )}
      </div>
    </div>
  );
}
 
 
   /* ================================================================
    DASHBOARD CONTENT
    ================================================================ */
    function DashboardContent({ onNavigate, clientAuth }) {
    const [workorders, setWorkorders] = useState([]); const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, overdue: 0, onHold: 0 }); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
    const fetchData = useCallback(async () => { setLoading(true); setError(''); try { const data = await apiCall('/workorders'); if (data.success) { let all = data.workorders || []; if (clientAuth?.clientCode || clientAuth?.portalEmail || clientAuth?.email || clientAuth?.companyName) { const cCode = (clientAuth.clientCode || '').toLowerCase().trim(); const cEmail = (clientAuth.portalEmail || clientAuth.email || '').toLowerCase().trim(); const cCo = (clientAuth.companyName || '').toLowerCase().trim(); const cId = clientAuth._id || ''; all = all.filter(wo => { if (cCode && (wo.clientCode || '').toLowerCase().trim() === cCode) return true; if (cCode && (wo.createdBy?.clientCode || '').toLowerCase().trim() === cCode) return true; if (cEmail) { const e = (wo.createdBy?.portalEmail || wo.createdBy?.email || wo.portalEmail || wo.email || '').toLowerCase().trim(); if (e === cEmail) return true; } if (cCo && (wo.client || '').toLowerCase().trim() === cCo) return true; if (cId && (wo.createdBy?.userId || wo.createdBy?.clientId) === cId) return true; return false; }); } else all = []; setWorkorders(all); setStats({ total: all.length, active: all.filter(w => !['completed', 'cancelled', 'overdue'].includes(w.status)).length, completed: all.filter(w => w.status === 'completed').length, overdue: all.filter(w => w.status === 'overdue').length, onHold: all.filter(w => ['on-hold', 'hold'].includes(w.status)).length }); } else setError(data.message || 'Failed.'); } catch (err) { setError(err.message); } finally { setLoading(false); } }, [clientAuth]);
    useEffect(() => { fetchData(); }, [fetchData]);
    const recentCases = workorders.slice(0, 5); const clientName = clientAuth?.companyName || clientAuth?.displayName || 'User';
    const donutData = [{ label: 'Active', value: stats.active, color: '#06B6D4' }, { label: 'Completed', value: stats.completed, color: '#10B981' }, { label: 'On Hold', value: stats.onHold, color: '#8B5CF6' }, { label: 'Overdue', value: stats.overdue, color: '#EF4444' }].filter(d => d.value > 0); const totalForChart = donutData.reduce((s, d) => s + d.value, 0) || 1;
    return (<div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>Client Dashboard</h1><p className="text-xs text-gray-600 mt-1">Welcome back, <span className="font-semibold" style={{ color: '#0891b2' }}>{clientName}</span></p></div><button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border text-gray-600 disabled:opacity-50"><FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh</button></div><div className="grid grid-cols-3 gap-3">
      {/* <QuickActionCard icon={FiPlus} title="Initiate Case" color="#8B5CF6" colorRgb="139,92,246" onClick={() => onNavigate('initiate-case')} /> */}
        <QuickActionCard icon={FiActivity} title="Track Cases" color="#06B6D4" colorRgb="6,182,212" onClick={() => onNavigate('track-cases')} /><QuickActionCard icon={FiFileText} title="Get Reports" color="#10B981" colorRgb="16,185,129" onClick={() => onNavigate('reports')} /></div><div className="grid grid-cols-2 lg:grid-cols-5 gap-3"><StatCard title="Total Cases" value={stats.total} icon={FiBriefcase} color="#8B5CF6" colorRgb="139,92,246" loading={loading} /><StatCard title="Active" value={stats.active} icon={FiActivity} color="#06B6D4" colorRgb="6,182,212" loading={loading} /><StatCard title="Completed" value={stats.completed} icon={FiCheckCircle} color="#10B981" colorRgb="16,185,129" loading={loading} /><StatCard title="On Hold" value={stats.onHold} icon={FiClock} color="#8B5CF6" colorRgb="139,92,246" loading={loading} /><div className="relative rounded-2xl p-4 sm:p-5 overflow-hidden group transition-all duration-300 hover:scale-[1.02] border" style={{ background: !loading && stats.overdue > 0 ? 'rgba(239,68,68,0.03)' : '#fff', borderColor: !loading && stats.overdue > 0 ? 'rgba(239,68,68,0.3)' : '#e5e7eb' }}>{!loading && stats.overdue > 0 && (<div className="absolute top-3 right-3"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-red-500"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span></div>)}<div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(239,68,68,0.08)' }}>{loading ? <FiLoader size={20} style={{ color: '#EF4444', animation: 'spin 1s linear infinite' }} /> : <FiAlertTriangle size={20} style={{ color: '#EF4444' }} />}</div><h3 className="text-2xl font-bold mb-1" style={{ color: !loading && stats.overdue > 0 ? '#EF4444' : '#111827', fontFamily: theme.fonts.display }}>{loading ? '—' : stats.overdue}</h3><p className="text-xs" style={{ color: !loading && stats.overdue > 0 ? '#b91c1c' : '#4b5563' }}>Overdue</p>{!loading && stats.overdue > 0 && (<div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ background: 'linear-gradient(90deg, #EF4444, #f87171)' }} />)}</div></div>{error && <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-700 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}><FiAlertCircle size={16} /><span className="flex-1">{error}</span></div>}<div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2 rounded-2xl overflow-hidden border" style={{ background: '#fff', borderColor: '#e5e7eb' }}><div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#e5e7eb' }}><div className="flex items-center gap-2"><FiLayers size={16} style={{ color: '#10b981' }} /><h3 className="text-sm font-semibold text-gray-900">Recent Cases</h3></div><button onClick={() => onNavigate('track-cases')} className="flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50 transition-all">View All <FiChevronRight size={12} /></button></div>{loading ? <LoadingState message="Loading cases..." /> : recentCases.length > 0 ? (<div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b" style={{ borderColor: '#e5e7eb' }}><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Candidate</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">BGV Ref</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Status</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Checks</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Created</th></tr></thead><tbody>{recentCases.map((wo) => (<tr key={wo._id} className="border-b last:border-0 hover:bg-gray-50/50 cursor-pointer" style={{ borderColor: '#e5e7eb' }} onClick={() => onNavigate('workorder-detail', wo._id)}><td className="px-4 py-3.5"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(6,182,212,0.1)', color: '#0891b2' }}>{(wo.fullName || 'N').charAt(0).toUpperCase()}</div><div><span className="text-xs font-medium text-gray-900 block">{wo.fullName || 'Unnamed'}</span><span className="text-[10px] text-gray-500">{wo.email || ''}</span></div></div></td><td className="px-4 py-3.5 text-xs font-mono" style={{ color: '#0891b2' }}>{wo.bgvRef || wo._id?.slice(-8)}</td><td className="px-4 py-3.5"><StatusBadge status={wo.status} /></td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><span className="text-xs text-gray-600">{wo.progressDone || 0}/{wo.progressTotal || 0}</span><ProgressBar current={wo.progressDone || 0} total={wo.progressTotal || 0} /></div></td><td className="px-4 py-3.5 text-xs text-gray-500">{wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td></tr>))}</tbody></table></div>) : <EmptyTableState icon={FiBriefcase} title="No cases yet" subtitle="Initiate your first case" />}</div><div className="rounded-2xl overflow-hidden border" style={{ background: '#fff', borderColor: '#e5e7eb' }}><div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: '#e5e7eb' }}><FiBarChart2 size={16} style={{ color: '#10b981' }} /><h3 className="text-sm font-semibold text-gray-900">Status Overview</h3></div><div className="p-5">{stats.total > 0 ? (<div className="flex flex-col items-center gap-5"><div className="relative w-32 h-32"><svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">{donutData.reduce((acc, seg, i) => { const pct = (seg.value / totalForChart) * 100; acc.elems.push(<circle key={i} cx="18" cy="18" r="15.915" fill="none" stroke={seg.color} strokeWidth="3.2" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={`${-acc.off}`} strokeLinecap="round" style={{ transition: 'all 0.8s ease' }} />); acc.off += pct; return acc; }, { elems: [], off: 0 }).elems}</svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-bold text-gray-900">{stats.total}</span><span className="text-[9px] text-gray-500 uppercase">Total</span></div></div><div className="w-full space-y-3">{[{ label: 'Active', value: stats.active, color: '#06B6D4' }, { label: 'Completed', value: stats.completed, color: '#10B981' }, { label: 'On Hold', value: stats.onHold, color: '#8B5CF6' }, { label: 'Overdue', value: stats.overdue, color: '#EF4444' }].map(item => (<div key={item.label} className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} /><div className="flex-1"><div className="flex justify-between"><span className="text-[11px] text-gray-700">{item.label}</span><span className="text-[11px] font-bold" style={{ color: item.color }}>{item.value} ({Math.round((item.value / stats.total) * 100)}%)</span></div><div className="h-1 rounded-full bg-gray-100 overflow-hidden mt-1"><div className="h-full rounded-full" style={{ width: `${(item.value / stats.total) * 100}%`, background: item.color, transition: 'width 0.7s' }} /></div></div></div>))}</div>{stats.overdue > 0 && <button onClick={() => onNavigate('track-cases')} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-semibold text-white" style={{ background: 'linear-gradient(135deg, #EF4444, #dc2626)' }}><FiAlertTriangle size={14} />{stats.overdue} Overdue — Review Now</button>}</div>) : <EmptyTableState icon={FiBarChart2} title="No data" subtitle="Create a case to see stats" />}</div></div></div></div>);
    }

    function PlaceholderView({ title, subtitle, icon: Icon, color }) { return (<div className="flex flex-col items-center justify-center py-20 px-4"><div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border" style={{ background: `${color}15`, borderColor: `${color}30` }}><Icon size={28} style={{ color }} /></div><h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2><p className="text-xs text-gray-500 text-center max-w-xs">{subtitle}</p></div>); }

    /* ================================================================
    TRACK CASE DASHBOARD
    ================================================================ */

    function TrackCaseDashboard({ clientAuth, onNavigate }) {
    const [workorders, setWorkorders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCase, setSelectedCase] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [caseChecks, setCaseChecks] = useState([]);
    const [loadingChecks, setLoadingChecks] = useState(false);
    const pageSize = 10;

    const fetchData = useCallback(async () => {
        setLoading(true); setError('');
        try {
        const data = await apiCall('/workorders');
        if (data.success) {
            let all = data.workorders || [];
            if (clientAuth?.clientCode || clientAuth?.portalEmail || clientAuth?.email || clientAuth?.companyName) {
            const cCode = (clientAuth.clientCode || '').toLowerCase().trim(); const cEmail = (clientAuth.portalEmail || clientAuth.email || '').toLowerCase().trim(); const cCo = (clientAuth.companyName || '').toLowerCase().trim(); const cId = clientAuth._id || '';
            all = all.filter(wo => { if (cCode && (wo.clientCode || '').toLowerCase().trim() === cCode) return true; if (cCode && (wo.createdBy?.clientCode || '').toLowerCase().trim() === cCode) return true; if (cEmail) { const e = (wo.createdBy?.portalEmail || wo.createdBy?.email || wo.portalEmail || wo.email || '').toLowerCase().trim(); if (e === cEmail) return true; } if (cCo && (wo.client || '').toLowerCase().trim() === cCo) return true; if (cId && (wo.createdBy?.userId || wo.createdBy?.clientId) === cId) return true; return false; });
            } else all = [];
            setWorkorders(all); setFilteredOrders(all);
        } else setError(data.message || 'Failed.');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, [clientAuth]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        let r = [...workorders];
        if (searchQuery.trim()) { const q = searchQuery.toLowerCase().trim(); r = r.filter(wo => (wo.fullName || '').toLowerCase().includes(q) || (wo.email || '').toLowerCase().includes(q) || (wo.bgvRef || '').toLowerCase().includes(q) || (wo.clientRef || '').toLowerCase().includes(q)); }
        if (statusFilter && STATUS_GROUPS[statusFilter]) { const allowedStatuses = STATUS_GROUPS[statusFilter].statuses; r = r.filter(wo => allowedStatuses.includes((wo.status || '').toLowerCase())); }
        if (priorityFilter) r = r.filter(wo => (wo.priority || '').toLowerCase() === priorityFilter.toLowerCase());
        if (dateFilter) { const n = new Date(); let c; if (dateFilter === 'today') c = new Date(n.getFullYear(), n.getMonth(), n.getDate()); else if (dateFilter === 'week') c = new Date(n.getTime() - 7*86400000); else if (dateFilter === 'month') c = new Date(n.getFullYear(), n.getMonth(), 1); else if (dateFilter === 'quarter') { const m = n.getMonth(); c = new Date(n.getFullYear(), m-(m%3), 1); } if (c) r = r.filter(wo => wo.createdAt && new Date(wo.createdAt) >= c); }
        setFilteredOrders(r); setCurrentPage(1);
    }, [searchQuery, statusFilter, priorityFilter, dateFilter, workorders]);

    const clearFilters = () => { setSearchQuery(''); setStatusFilter(''); setPriorityFilter(''); setDateFilter(''); };
    const hasActiveFilters = searchQuery || statusFilter || priorityFilter || dateFilter;
    const stats = { total: workorders.length, active: workorders.filter(w => STATUS_GROUPS.active.statuses.includes(w.status)).length, completed: workorders.filter(w => STATUS_GROUPS.completed.statuses.includes(w.status)).length, onHold: workorders.filter(w => STATUS_GROUPS.hold.statuses.includes(w.status)).length, overdue: workorders.filter(w => STATUS_GROUPS.overdue.statuses.includes(w.status)).length, stopped: workorders.filter(w => STATUS_GROUPS.stopped.statuses.includes(w.status)).length, insuff: workorders.filter(w => STATUS_GROUPS.insuff.statuses.includes(w.status)).length };
    const totalPages = Math.ceil(filteredOrders.length / pageSize);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleViewCase = async (wo) => { setSelectedCase(wo); setShowDetail(true); setLoadingChecks(true); try { const d = await apiCall(`/workorders/${wo._id}`); if (d.success && d.workorder) setCaseChecks(d.workorder.checks || wo.checks || []); else setCaseChecks(wo.checks || []); } catch { setCaseChecks(wo.checks || []); } finally { setLoadingChecks(false); } };
    const closeDetail = () => { setShowDetail(false); setSelectedCase(null); setCaseChecks([]); };
    const handleExportCSV = () => { const h = ['BGV Ref','Name','Email','Phone','Client Ref','Status','Priority','Checks','Created']; const rows = filteredOrders.map(wo => [wo.bgvRef||wo._id?.slice(-8)||'',wo.fullName||'',wo.email||'',wo.phone||'',wo.clientRef||'',wo.status||'',wo.priority||'',`${wo.progressDone||0}/${wo.progressTotal||0}`,wo.createdAt?new Date(wo.createdAt).toLocaleDateString('en-IN'):'']); const csv = [h,...rows].map(r=>r.map(c=>`"${c}"`).join(',')).join('\n'); const b = new Blob([csv],{type:'text/csv'}); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`cases_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(u); };

    const statusFilterOptions = Object.entries(STATUS_GROUPS).map(([key, group]) => {
        const count = workorders.filter(wo => group.statuses.includes(wo.status)).length;
        return { value: key, label: `${group.label} (${count})`, color: group.color };
    }).filter(opt => opt.label.split('(')[1]?.trim() !== '0)');

    const priorityCounts = {}; workorders.forEach(wo => { const p = wo.priority || 'Standard'; priorityCounts[p] = (priorityCounts[p] || 0) + 1; });
    const priorityFilterOptions = Object.entries(priorityCounts).map(([k, v]) => ({ value: k, label: `${k} (${v})` }));

    return (
        <div className="space-y-5">
        <button onClick={() => onNavigate('back-to-dashboard')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border text-gray-600 hover:bg-gray-100 transition-colors" style={{ borderColor: '#e5e7eb' }}><FiArrowLeft size={14} /> Back to Dashboard</button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><FiHome size={11} /><FiChevronRight size={11} /><span className="cursor-pointer hover:text-gray-600" onClick={() => onNavigate('back-to-dashboard')}>Dashboard</span><FiChevronRight size={11} /><span className="text-gray-700 font-medium">Track Cases</span></div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: theme.fonts.display }}>Track Cases</h1>
            <p className="text-xs text-gray-500 mt-0.5">Monitor and manage all your background verification cases</p>
            </div>
            <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} disabled={filteredOrders.length === 0} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-semibold border text-gray-600 disabled:opacity-40 hover:bg-gray-50" style={{ borderColor: '#e5e7eb' }}><FiDownload size={13} /> Export</button>
            <button onClick={() => onNavigate('initiate-case')} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-white" style={{ background: '#8B5CF6' }}><FiPlus size={13} /> New Case</button>
            </div>
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2">
            {statusFilterOptions.map(opt => (
            <button key={opt.value} onClick={() => setStatusFilter(statusFilter === opt.value ? '' : opt.value)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all" style={{ background: statusFilter === opt.value ? `${opt.color}12` : '#fff', borderColor: statusFilter === opt.value ? `${opt.color}50` : '#e5e7eb', color: statusFilter === opt.value ? opt.color : '#6b7280' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: opt.color }} />
                {opt.label}
            </button>
            ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by name, email, BGV ref..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border outline-none focus:ring-1 focus:ring-cyan-400" style={{ borderColor: '#e5e7eb' }} /></div>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2.5 rounded-xl text-xs border outline-none bg-white" style={{ borderColor: '#e5e7eb' }}><option value="">All Priorities</option>{priorityFilterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2.5 rounded-xl text-xs border outline-none bg-white" style={{ borderColor: '#e5e7eb' }}><option value="">All Dates</option><option value="today">Today</option><option value="week">Last 7 Days</option><option value="month">This Month</option><option value="quarter">This Quarter</option></select>
            {hasActiveFilters && <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-[10px] font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100"><FiX size={12} /> Clear</button>}
        </div>

        {error && <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-700 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}><FiAlertCircle size={16} /><span className="flex-1">{error}</span></div>}

        {/* Cases Table */}
        <div className="rounded-2xl overflow-hidden border" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
            {loading ? <LoadingState message="Loading cases..." /> : paginatedOrders.length > 0 ? (
            <><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b" style={{ borderColor: '#e5e7eb' }}><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Candidate</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">BGV Ref</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Client Ref</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Status</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Priority</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Progress</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Created</th><th className="px-4 py-3 text-left text-[10px] font-semibold uppercase text-gray-500">Action</th></tr></thead><tbody>{paginatedOrders.map((wo) => (<tr key={wo._id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors" style={{ borderColor: '#e5e7eb' }}><td className="px-4 py-3.5"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'rgba(6,182,212,0.1)', color: '#0891b2' }}>{(wo.fullName || 'N').charAt(0).toUpperCase()}</div><div className="min-w-0"><span className="text-xs font-medium text-gray-900 block truncate max-w-[150px]">{wo.fullName || 'Unnamed'}</span><span className="text-[10px] text-gray-500 truncate block max-w-[150px]">{wo.email || ''}</span></div></div></td><td className="px-4 py-3.5 text-xs font-mono font-semibold" style={{ color: '#0891b2' }}>{wo.bgvRef || wo._id?.slice(-8)}</td><td className="px-4 py-3.5 text-xs text-gray-600">{wo.clientRef || '—'}</td><td className="px-4 py-3.5"><StatusBadge status={wo.status} /></td><td className="px-4 py-3.5"><span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${priorityStyles[(wo.priority || '').toLowerCase()] || priorityStyles.standard}`}>{wo.priority || 'Standard'}</span></td><td className="px-4 py-3.5"><div className="flex items-center gap-2"><span className="text-[10px] text-gray-500 whitespace-nowrap">{wo.progressDone || 0}/{wo.progressTotal || 0}</span><ProgressBar current={wo.progressDone || 0} total={wo.progressTotal || 0} /></div></td><td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">{wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</td><td className="px-4 py-3.5"><button onClick={() => handleViewCase(wo)} className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border border-cyan-200 text-cyan-700 hover:bg-cyan-50 transition-all"><FiEye size={11} />View</button></td></tr>))}</tbody></table></div>
            {totalPages > 1 && (<div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#e5e7eb' }}><span className="text-[10px] text-gray-500">Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length}</span><div className="flex items-center gap-1"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium border disabled:opacity-30 hover:bg-gray-50" style={{ borderColor: '#e5e7eb' }}>Prev</button>{Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, i, arr) => (<React.Fragment key={p}>{i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-gray-400">…</span>}<button onClick={() => setCurrentPage(p)} className="w-7 h-7 rounded-lg text-[10px] font-medium" style={{ background: currentPage === p ? '#0891b2' : 'transparent', color: currentPage === p ? '#fff' : '#374151', border: currentPage === p ? '1px solid #0891b2' : '1px solid #e5e7eb' }}>{p}</button></React.Fragment>))}<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium border disabled:opacity-30 hover:bg-gray-50" style={{ borderColor: '#e5e7eb' }}>Next</button></div></div>)}</>
            ) : <EmptyTableState icon={FiBriefcase} title={hasActiveFilters ? 'No matching cases' : 'No cases yet'} subtitle={hasActiveFilters ? 'Try adjusting your filters' : 'Initiate your first case to get started'} />}
        </div>

        {/* Case Detail Slide-over */}
        {showDetail && selectedCase && (<div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeDetail} /><div className="relative w-full max-w-lg h-full overflow-y-auto shadow-2xl" style={{ background: '#fff', animation: 'slideInRight 0.3s ease' }}><div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b" style={{ background: '#fff', borderColor: '#e5e7eb' }}><h3 className="text-sm font-bold text-gray-900">Case Details</h3><button onClick={closeDetail} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><FiX size={18} className="text-gray-500" /></button></div><div className="p-5 space-y-5"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold" style={{ background: 'rgba(6,182,212,0.1)', color: '#0891b2' }}>{(selectedCase.fullName || 'N').charAt(0).toUpperCase()}</div><div><h2 className="text-base font-bold text-gray-900">{selectedCase.fullName || 'Unnamed'}</h2><p className="text-xs text-gray-500">{selectedCase.email || ''}</p><div className="flex items-center gap-2 mt-1"><StatusBadge status={selectedCase.status} /><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${priorityStyles[(selectedCase.priority || '').toLowerCase()] || priorityStyles.standard}`}>{selectedCase.priority || 'Standard'}</span></div></div></div><div className="grid grid-cols-2 gap-3">{[{ l: 'BGV Ref', v: selectedCase.bgvRef || selectedCase._id?.slice(-8) }, { l: 'Client Ref', v: selectedCase.clientRef || '—' }, { l: 'Phone', v: selectedCase.phone || '—' }, { l: 'Client', v: selectedCase.client || '—' }, { l: 'Created', v: selectedCase.createdAt ? new Date(selectedCase.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }, { l: 'Progress', v: `${selectedCase.progressDone || 0}/${selectedCase.progressTotal || 0}` }].map(f => (<div key={f.l} className="p-3 rounded-xl border" style={{ borderColor: '#e5e7eb' }}><p className="text-[10px] text-gray-500 mb-1">{f.l}</p><p className="text-xs font-semibold text-gray-900">{f.v}</p></div>))}</div><div><h4 className="text-xs font-semibold text-gray-900 mb-3">Checks</h4>{loadingChecks ? <div className="flex items-center gap-2 text-xs text-gray-500 py-4 justify-center"><FiLoader size={14} className="animate-spin" />Loading checks...</div> : caseChecks.length > 0 ? (<div className="space-y-2">{caseChecks.map((ch, i) => { const cfg = getStatusConfig(ch.status); return (<div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: '#e5e7eb' }}><div className="flex-1 min-w-0"><p className="text-xs font-medium text-gray-900 truncate">{ch.checkType || ch.name || `Check ${i + 1}`}</p>{ch.subType && <p className="text-[10px] text-gray-500">{ch.subType}</p>}</div><StatusBadge status={ch.status} /></div>); })}</div>) : <p className="text-xs text-gray-500 py-4 text-center">No checks found</p>}</div></div></div></div>)}
        </div>
    );
    }

    /* ================================================================
    MAIN CLIENT PORTAL COMPONENT
    ================================================================ */
    export default function ClientPortal() {
    const navigate = useNavigate();
    const clientAuth = getClientAuth();
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [activeContent, setActiveContent] = useState('dashboard');
    const [activeCard, setActiveCard] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info' });

    // ★ Bulk Upload Modal State ★
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

    const handleMenuClick = (menuName, contentType) => {
        setActiveMenu(menuName);
        setActiveContent(contentType);
        setActiveCard(null);
        setSidebarOpen(false);
    };

    const handleCardClick = (item) => {
        setActiveCard(item.name);

        // ★ Open Bulk Upload Modal when "Bulk Workorder" card is clicked ★
        if (item.name === 'Bulk Workorder') {
        setShowBulkUploadModal(true);
        return;
        }

        if (item.path) {
        navigate(item.path);
        return;
        }

        // Handle other card navigations
        if (item.name === 'Create / View Workorder') {
        navigate('/workorder-dashboard');
        }
    };

    const handleNavigate = (target, data) => {
        if (target === 'back-to-dashboard') {
        setActiveMenu('Dashboard');
        setActiveContent('dashboard');
        setActiveCard(null);
        } else if (target === 'initiate-case') {
        setActiveMenu('Work Order');
        setActiveContent('initiate-case');
        setActiveCard('Create / View Workorder');
        } else if (target === 'track-cases') {
        setActiveMenu('Track Cases');
        setActiveContent('track-cases');
        setActiveCard(null);
        } else if (target === 'reports') {
        setActiveMenu('Report');
        setActiveContent('cards');
        setActiveCard(null);
        } else if (target === 'workorder-detail' && data) {
        setActiveContent('workorder-detail');
        }
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
    };

    const handleCaseSubmitted = (wo) => {
        showToast('Case initiated successfully!', 'success');
        handleNavigate('back-to-dashboard');
    };

    const renderContent = () => {
        switch (activeContent) {
        case 'dashboard':
            return <DashboardContent onNavigate={handleNavigate} clientAuth={clientAuth} />;
        case 'track-cases':
            return <TrackCaseDashboard clientAuth={clientAuth} onNavigate={handleNavigate} />;
        case 'initiate-case':
            return <InitiateCaseForm onBack={() => handleNavigate('back-to-dashboard')} onSubmitted={handleCaseSubmitted} clientAuth={clientAuth} />;
        case 'support-dashboard':
            return <SupportDashboard clientAuth={clientAuth} />;
        case 'fee-approvals':
            return <PlaceholderView title="Fee Approvals" subtitle="Fee approval management will be available soon" icon={FiDollarSign} color="#EC4899" />;
        case 'cards':
            const currentMenu = sidebarMenu.find(m => m.name === activeMenu);
            if (currentMenu?.items?.length > 0) {
            return <CardGridView title={activeMenu} subtitle={currentMenu.items.length + ' options available'} items={currentMenu.items} menuColor={currentMenu.color} onCardClick={handleCardClick} activeCard={activeCard} />;
            }
            return <PlaceholderView title={activeMenu} subtitle="Content coming soon" icon={currentMenu?.icon || FiGrid} color={currentMenu?.color || '#6b7280'} />;
        default:
            return <DashboardContent onNavigate={handleNavigate} clientAuth={clientAuth} />;
        }
    };

    return (
        <div className="min-h-screen" style={{ background: '#f8fafc' }}>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        <Header />
        <div className="flex pt-24">
            <Sidebar
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            />
            <main className="flex-1 lg:ml-[260px] p-4 sm:p-6 min-h-[calc(100vh-96px)]">
            {renderContent()}
            </main>
        </div>

        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

        {/* ★ Bulk Upload Modal ★ */}
        <BulkUploadModal
            isOpen={showBulkUploadModal}
            onClose={() => setShowBulkUploadModal(false)}
            clientAuth={clientAuth}
        />
        </div>
    );
    }
