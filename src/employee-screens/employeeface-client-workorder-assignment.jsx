// src/components/EmployeeAssignment.jsx
'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    IoHomeOutline,
    IoChevronForward,
    IoAddCircleOutline,
    IoCloudUploadOutline,
    IoSearchOutline,
    IoGridOutline,
    IoListOutline,
    IoEyeOutline,
    IoPencilOutline,
    IoSettingsOutline,
    IoTrashOutline,
    IoArrowUpOutline,
    IoArrowDownOutline,
    IoDocumentTextOutline,
    IoPeopleOutline,
    IoPersonAdd,
    IoArrowBackOutline,
    IoCloseOutline,
    IoPersonOutline,
    IoBusinessOutline,
    IoCalendarOutline,
    IoCheckmarkOutline,
    IoWarningOutline,
    IoFilterOutline,
    IoCheckmarkCircleOutline,
    IoAlertCircleOutline,
    IoTimeOutline,
    IoInformationCircleOutline,
    IoShieldCheckmarkOutline,
    IoAddOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

const STATUS_CONFIG = {
    initiated: { label: 'Initiated', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'candidate-details': { label: 'Candidate Details', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
    'document-review': { label: 'Document Review', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    'data-collection': { label: 'Data Collection', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    'ready-for-assignment': { label: 'Ready for Assignment', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
    'in-progress': { label: 'In Progress', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    assigned: { label: 'Assigned', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    completed: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    unassigned: { label: 'Unassigned', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
};

const isObjectIdLike = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
const displayOrFallback = (value, fallback) => {
    if (!value) return fallback;
    if (isObjectIdLike(value)) return fallback;
    return value;
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.draft;
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
        </span>
    );
};

const ProgressBar = ({ current, total }) => {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00D4AA] to-[#3B82F6] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap flex-shrink-0">{current}/{total}</span>
        </div>
    );
};

const ActionButton = ({ icon: Icon, color, onClick, title }) => (
    <button
        onClick={onClick}
        title={title}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = `${color}25`;
            e.currentTarget.style.borderColor = `${color}50`;
            e.currentTarget.style.boxShadow = `0 0 18px ${color}30`;
            e.currentTarget.style.transform = 'scale(1.15)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = `${color}15`;
            e.currentTarget.style.borderColor = `${color}30`;
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'scale(1)';
        }}
    >
        <Icon size={16} style={{ color }} />
    </button>
);

// ==================== FILTER DROPDOWN ====================
const FilterDropdown = ({ assignmentFilter, setAssignmentFilter, stats }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [
        { key: 'all', label: 'All', count: stats.total, icon: IoGridOutline },
        { key: 'unassigned', label: 'Unassigned', count: stats.unassignedCount, icon: IoCloseOutline },
        { key: 'assigned', label: 'Assigned', count: stats.assignedCount, icon: IoCheckmarkCircleOutline },
    ];
    const activeOption = options.find(o => o.key === assignmentFilter);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${open ? 'bg-purple-100 border-purple-300 text-purple-700' : assignmentFilter !== 'all' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}
            >
                <IoFilterOutline size={16} />
                <span>{activeOption?.label || 'Filter'}</span>
                {assignmentFilter !== 'all' && <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700">{activeOption?.count}</span>}
            </button>
            <div className={`absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top-left ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="px-4 py-3 border-b border-gray-100"><span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Assignment Filter</span></div>
                <div className="py-1.5">
                    {options.map((opt) => {
                        const isActive = assignmentFilter === opt.key;
                        const Icon = opt.icon;
                        return (
                            <button key={opt.key} onClick={() => { setAssignmentFilter(opt.key); setOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Icon size={16} className={isActive ? 'text-purple-600' : 'text-gray-400'} />
                                <span className="flex-1 text-left font-medium">{opt.label}</span>
                                <span className={`text-xs font-bold tabular-nums ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>{opt.count}</span>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                            </button>
                        );
                    })}
                </div>
                {assignmentFilter !== 'all' && (
                    <div className="px-3 py-2.5 border-t border-gray-100">
                        <button onClick={() => { setAssignmentFilter('all'); setOpen(false); }} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"><IoCloseOutline size={12} />Clear Filter</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== MODAL SHELL ====================
const ModalShell = ({ isOpen, onClose, children, width = 'max-w-xl' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white border border-gray-200 rounded-3xl shadow-2xl w-full ${width} overflow-hidden max-h-[90vh] flex flex-col`}>
                {children}
            </div>
        </div>
    );
};

const ErrorBanner = ({ message }) => {
    if (!message) return null;
    return (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <IoAlertCircleOutline size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-red-600">{message}</span>
        </div>
    );
};

// ==================== ASSIGN CHECK MODAL ====================
const AssignCheckModal = ({ isOpen, onClose, workorder, onAssigned }) => {
    const [assignType, setAssignType] = useState('internal');
    const [executive, setExecutive] = useState('');
    const [notes, setNotes] = useState('');

    const [employees, setEmployees] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setAssignType('internal');
            setExecutive('');
            setNotes('');
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchOptions = async () => {
            setLoadingOptions(true);
            setError('');
            try {
                if (assignType === 'internal') {
                    if (employees.length === 0) {
                        const res = await api.get('/employees');
                        setEmployees(res.data?.employees || []);
                    }
                } else {
                    if (vendors.length === 0) {
                        const res = await api.get('/vendors');
                        setVendors(res.data?.vendors || []);
                    }
                }
            } catch (err) {
                console.error('Failed to load assignment options:', err);
                setError('Failed to load list. Please try again.');
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, [isOpen, assignType]);

    if (!isOpen || !workorder) return null;

    const executiveOptions = [
        { value: '', label: '— Select Internal Executive —' },
        ...employees.map((e) => ({
            value: e._id,
            label: `${e.name || e.fullName || e.employeeName || 'Unnamed'}${e.designation ? ` - ${e.designation}` : ''}`,
        })),
    ];

    const vendorOptions = [
        { value: '', label: '— Select External Vendor —' },
        ...vendors.map((v) => ({
            value: v._id,
            label: v.companyName || v.vendorName || v.name || 'Unnamed Vendor',
        })),
    ];

    const currentOptions = assignType === 'internal' ? executiveOptions : vendorOptions;

    const slaDays = 7;
    const slaDate = new Date();
    slaDate.setDate(slaDate.getDate() + slaDays);
    const slaFormatted = slaDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleAssign = async () => {
        if (!executive) {
            setError('Please select an executive or vendor');
            return;
        }

        const selected = (assignType === 'internal' ? employees : vendors).find((o) => o._id === executive);
        const assignedToName = assignType === 'internal'
            ? (selected?.name || selected?.fullName || selected?.employeeName || 'Unnamed')
            : (selected?.companyName || selected?.vendorName || selected?.name || 'Unnamed Vendor');

        setSubmitting(true);
        setError('');
        try {
            await api.post('/workorder-assignment', {
                workorderId: workorder._id,
                bgvRef: workorder.bgvRef,
                candidateName: workorder.candidateName,
                assignmentType: assignType,
                assignedToId: executive,
                assignedToName,
                notes,
                slaDays,
                slaDeadline: slaDate.toISOString(),
            });
            onAssigned?.(workorder._id, assignedToName);
            onClose();
        } catch (err) {
            console.error('Assign Check Error:', err);
            setError(err?.response?.data?.message || 'Failed to assign check. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} width="max-w-2xl">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                        <IoPeopleOutline size={22} className="text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Assign Check</h3>
                        <p className="text-xs text-gray-500">Assign verifier to process this check</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-all">
                    <IoCloseOutline size={18} />
                </button>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                <ErrorBanner message={error} />

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-0">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">Check Type</span>
                        <span className="text-sm font-semibold text-gray-900 truncate block">Address Verification</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-0">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">Candidate</span>
                        <span className="text-sm font-semibold text-gray-900 truncate block" title={workorder.candidateName}>{workorder.candidateName}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-w-0">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">Status</span>
                        <StatusBadge status={workorder.status} />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 tracking-wider uppercase mb-2.5">
                        <IoShieldCheckmarkOutline size={14} className="text-[#00D4AA]" />
                        Assignment Type
                    </label>
                    <div className="flex gap-3">
                        <button onClick={() => { setAssignType('internal'); setExecutive(''); }} className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all ${assignType === 'internal' ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}>
                            <IoPersonOutline size={18} />
                            <span className="font-semibold text-sm">Internal Executive</span>
                        </button>
                        <button onClick={() => { setAssignType('external'); setExecutive(''); }} className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 transition-all ${assignType === 'external' ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}>
                            <IoBusinessOutline size={18} />
                            <span className="font-semibold text-sm">External Vendor</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 tracking-wider uppercase mb-2.5">
                        <IoPersonOutline size={14} className="text-purple-600" />
                        Select {assignType === 'internal' ? 'Internal Executive' : 'External Vendor'} <span className="text-red-500">*</span>
                    </label>
                    <select value={executive} onChange={(e) => setExecutive(e.target.value)} disabled={loadingOptions} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 text-sm outline-none focus:border-[#00D4AA] transition-all appearance-none disabled:opacity-50">
                        {currentOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 tracking-wider uppercase mb-2.5">
                        <IoDocumentTextOutline size={14} className="text-[#3B82F6]" />
                        Assignment Notes
                    </label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any special instructions..." rows={3} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-[#00D4AA] resize-none transition-all" />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">
                        <IoTimeOutline size={14} className="text-amber-500" />
                        SLA Information
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-0.5">DEFAULT SLA</span>
                            <span className="text-lg font-bold text-amber-600">{slaDays} <span className="text-xs font-medium text-amber-500/70">Days</span></span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-0.5">DEADLINE</span>
                            <span className="text-sm font-bold text-gray-900">{slaFormatted}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                <button onClick={onClose} disabled={submitting} className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
                <button onClick={handleAssign} disabled={submitting || loadingOptions || !executive} className="px-6 py-2.5 bg-[#00B494] hover:bg-[#009e82] rounded-xl text-sm font-semibold text-black flex items-center gap-2 transition-all disabled:opacity-50">
                    {submitting ? <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /> : <IoCheckmarkOutline size={16} />}
                    {submitting ? 'Assigning…' : 'Assign Check'}
                </button>
            </div>
        </ModalShell>
    );
};

// ==================== RAISE INSUFFICIENCY MODAL ====================
const RaiseInsufficiencyModal = ({ isOpen, onClose, workorder, onRaised }) => {
    const [description, setDescription] = useState('');
    const [docType, setDocType] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { if (!isOpen) { setDescription(''); setDocType(''); setError(''); } }, [isOpen]);

    if (!isOpen || !workorder) return null;

    const docTypes = [
        { value: '', label: '— Select —' },
        { value: 'aadhaar', label: 'Aadhaar Card' },
        { value: 'pan', label: 'PAN Card' },
        { value: 'passport', label: 'Passport' },
        { value: 'dl', label: 'Driving License' },
        { value: 'voter', label: 'Voter ID' },
        { value: 'utility', label: 'Utility Bill' },
        { value: 'bank', label: 'Bank Statement' },
        { value: 'other', label: 'Other' },
    ];

    const handleRaise = async () => {
        if (!description.trim()) { setError('Please describe the insufficiency'); return; }
        if (!docType) { setError('Please select a document type'); return; }

        setSubmitting(true);
        setError('');
        try {
            await api.post('/workorder-assignment/insufficiency', {
                workorderId: workorder._id,
                bgvRef: workorder.bgvRef,
                candidateName: workorder.candidateName,
                description,
                docType,
            });
            onRaised?.(workorder._id);
            onClose();
        } catch (err) {
            console.error('Raise Insufficiency Error:', err);
            setError(err?.response?.data?.message || 'Failed to raise insufficiency. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} width="max-w-lg">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
                        <IoAlertCircleOutline size={22} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Raise Insufficiency</h3>
                        <p className="text-xs text-gray-500">Report an issue with this check</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-all">
                    <IoCloseOutline size={18} />
                </button>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
                <ErrorBanner message={error} />

                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block">Workorder</span>
                        <span className="text-sm font-semibold text-purple-600 truncate block">{workorder.bgvRef}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 flex-shrink-0" />
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block">Candidate</span>
                        <span className="text-sm font-semibold text-gray-900 truncate block" title={workorder.candidateName}>{workorder.candidateName}</span>
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 tracking-wider uppercase mb-2.5">DESCRIPTION <span className="text-red-500">*</span></label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what's wrong..." rows={4} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-red-500 resize-none transition-all" />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 tracking-wider uppercase mb-2.5">REQUIRED DOCUMENT TYPE <span className="text-red-500">*</span></label>
                    <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 text-sm outline-none focus:border-red-500 transition-all appearance-none">
                        {docTypes.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
                <button onClick={onClose} disabled={submitting} className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
                <button onClick={handleRaise} disabled={submitting} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-50">
                    {submitting ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <IoWarningOutline size={16} />}
                    {submitting ? 'Raising…' : 'Raise'}
                </button>
            </div>
        </ModalShell>
    );
};

// ==================== UNASSIGN MODAL ====================
const UnassignModal = ({ isOpen, onClose, workorder, onUnassigned }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { if (!isOpen) setError(''); }, [isOpen]);

    if (!isOpen || !workorder) return null;

    const handleUnassign = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.put(`/workorder-assignment/${workorder._id}/unassign`, {});
            onUnassigned?.(workorder._id);
            onClose();
        } catch (err) {
            console.error('Unassign Error:', err);
            setError(err?.response?.data?.message || 'Failed to unassign.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 pt-7 pb-2 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mb-4">
                        <IoAlertCircleOutline size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1.5">Are you sure?</h3>
                    <p className="text-sm text-gray-500">Unassign this check?</p>
                </div>

                <div className="px-6 py-4 space-y-3">
                    {error && <ErrorBanner message={error} />}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block">Workorder</span>
                            <span className="text-sm font-semibold text-purple-600">{workorder.bgvRef}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-semibold text-emerald-600">{workorder.assigned}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 flex items-center gap-3">
                    <button onClick={onClose} disabled={submitting} className="flex-1 px-5 py-3 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                    <button onClick={handleUnassign} disabled={submitting} className="flex-1 px-5 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50">
                        {submitting ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <IoTrashOutline size={16} />}
                        {submitting ? 'Removing…' : 'Yes, Unassign'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== DELETE MODAL ====================
const DeleteWorkorderModal = ({ isOpen, onClose, workorder, onDeleted }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { if (!isOpen) setError(''); }, [isOpen]);

    if (!isOpen || !workorder) return null;

    const handleDelete = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.delete(`/workorders/${workorder._id}`);
            onDeleted?.(workorder._id);
            onClose();
        } catch (err) {
            console.error('Delete Error:', err);
            setError(err?.response?.data?.message || 'Failed to delete.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 pt-7 pb-2 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mb-4">
                        <IoTrashOutline size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1.5">Delete Workorder?</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>

                <div className="px-6 py-4 space-y-3">
                    {error && <ErrorBanner message={error} />}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block">Workorder</span>
                            <span className="text-sm font-semibold text-purple-600">{workorder.bgvRef}</span>
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-gray-900">{workorder.candidateName}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 flex items-center gap-3">
                    <button onClick={onClose} disabled={submitting} className="flex-1 px-5 py-3 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                    <button onClick={handleDelete} disabled={submitting} className="flex-1 px-5 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50">
                        {submitting ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <IoTrashOutline size={16} />}
                        {submitting ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== BULK ASSIGN MODAL ====================
const BulkAssignModal = ({ isOpen, onClose, selectedChecks = [], onBulkAssigned }) => {
    const [assignmentType, setAssignmentType] = useState('internal');
    const [selectedExecutive, setSelectedExecutive] = useState('');
    const [notes, setNotes] = useState('');
    const [targetDate, setTargetDate] = useState('');

    const [employees, setEmployees] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setAssignmentType('internal');
            setSelectedExecutive('');
            setNotes('');
            setTargetDate('');
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchOptions = async () => {
            setLoadingOptions(true);
            setError('');
            try {
                if (assignmentType === 'internal' && employees.length === 0) {
                    const res = await api.get('/employees');
                    setEmployees(res.data?.employees || []);
                } else if (assignmentType === 'external' && vendors.length === 0) {
                    const res = await api.get('/vendors');
                    setVendors(res.data?.vendors || []);
                }
            } catch (err) {
                setError('Failed to load options');
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchOptions();
    }, [isOpen, assignmentType]);

    if (!isOpen) return null;

    const executiveOptions = [{ value: '', label: '— Select Executive —' }, ...employees.map(e => ({ value: e._id, label: `${e.name || e.fullName || 'Unnamed'}${e.designation ? ` - ${e.designation}` : ''}` }))];
    const vendorOptions = [{ value: '', label: '— Select Agency —' }, ...vendors.map(v => ({ value: v._id, label: v.companyName || v.name || 'Unnamed' }))];
    const currentOptions = assignmentType === 'internal' ? executiveOptions : vendorOptions;

    const handleAssign = async () => {
        if (!selectedExecutive || selectedChecks.length === 0) {
            setError('Please select executive and checks');
            return;
        }

        const selected = (assignmentType === 'internal' ? employees : vendors).find(o => o._id === selectedExecutive);
        const assignedToName = assignmentType === 'internal' ? (selected?.name || selected?.fullName || 'Unnamed') : (selected?.companyName || selected?.name || 'Unnamed');

        setSubmitting(true);
        setError('');
        try {
            await api.post('/workorder-assignment/bulk', {
                workorderIds: selectedChecks,
                assignmentType,
                assignedToId: selectedExecutive,
                assignedToName,
                notes,
                targetDate: targetDate || null,
            });
            onBulkAssigned?.(selectedChecks, assignedToName);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Bulk assign failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center"><IoPeopleOutline size={20} className="text-purple-600" /></div>
                        <div><h3 className="text-lg font-bold text-gray-900">Bulk Assign</h3><p className="text-xs text-gray-500">({selectedChecks.length} selected)</p></div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IoCloseOutline size={18} /></button>
                </div>

                <div className="px-6 py-6 space-y-6">
                    {error && <ErrorBanner message={error} />}
                    <div className="flex gap-3">
                        <button onClick={() => { setAssignmentType('internal'); setSelectedExecutive(''); }} className={`flex-1 py-3 rounded-xl border-2 ${assignmentType === 'internal' ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]' : 'border-gray-300 bg-white text-gray-600'}`}>Internal</button>
                        <button onClick={() => { setAssignmentType('external'); setSelectedExecutive(''); }} className={`flex-1 py-3 rounded-xl border-2 ${assignmentType === 'external' ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]' : 'border-gray-300 bg-white text-gray-600'}`}>External</button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Assign To</label>
                        <select value={selectedExecutive} onChange={e => setSelectedExecutive(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900">
                            {currentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900" placeholder="Optional notes" />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 tracking-wider uppercase mb-2"><IoCalendarOutline size={14} />Target Date</label>
                        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900" />
                    </div>
                </div>

                <div className="px-6 py-5 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700">Cancel</button>
                    <button onClick={handleAssign} disabled={submitting || !selectedExecutive} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50">
                        {submitting ? 'Assigning…' : 'Assign All'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== CHECKBOX ====================
const Checkbox = ({ checked, onChange, indeterminate = false }) => (
    <button onClick={onChange} className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all ${checked || indeterminate ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300 hover:border-gray-400'}`}>
        {checked && !indeterminate && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        {indeterminate && <div className="w-2.5 h-[2px] bg-white rounded-full" />}
    </button>
);

// ==================== GRID CARD ====================
const GridCard = ({ wo, isSelected, onToggle, onAction }) => (
    <div className={`bg-white border rounded-2xl p-5 transition-all duration-200 group hover:border-purple-300 hover:shadow-md ${isSelected ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between mb-4 gap-2 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
                <Checkbox checked={isSelected} onChange={onToggle} />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-purple-100 border border-purple-200 text-xs font-semibold text-purple-700 truncate">{wo.bgvRef}</span>
            </div>
            <StatusBadge status={wo.status} />
        </div>
        <div className="mb-4 min-w-0">
            <h3 className="text-base font-bold text-gray-900 mb-1 truncate" title={wo.candidateName}>{wo.candidateName}</h3>
            <p className="text-xs text-gray-500 truncate" title={wo.client}>{displayOrFallback(wo.client, 'Unknown Client')}</p>
        </div>
        <div className="mb-4"><ProgressBar current={wo.progress?.current || 0} total={wo.progress?.total || 1} /></div>
        <div className="mb-4">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block mb-1">Assigned To</span>
            {(!wo.assigned || wo.assigned === 'Unassigned') ? (
                <StatusBadge status="unassigned" />
            ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200 text-[11px] font-medium text-emerald-600 truncate"><span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />{wo.assigned}</span>
            )}
        </div>
        <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 overflow-x-auto pb-1">
            <ActionButton icon={IoEyeOutline} color="#3B82F6" onClick={() => onAction('assign', wo)} title="View / Assign" />
            <ActionButton icon={IoAddOutline} color="#A855F7" onClick={() => onAction('assign', wo)} title="Assign" />
            <ActionButton icon={IoWarningOutline} color="#EF4444" onClick={() => onAction('insufficiency', wo)} title="Raise Insufficiency" />
            <ActionButton icon={IoPersonOutline} color="#6B7280" onClick={() => onAction('unassign', wo)} title="Unassign" />
            <ActionButton icon={IoTrashOutline} color="#F87171" onClick={() => onAction('delete', wo)} title="Delete Workorder" />
        </div>
    </div>
);

// ==================== MAIN COMPONENT ====================
const EmployeeAssignment = () => {
    const navigate = useNavigate();
    const [workorders, setWorkorders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [filterStatus, setFilterStatus] = useState('all');
    const [assignmentFilter, setAssignmentFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const [assignModal, setAssignModal] = useState({ open: false, wo: null });
    const [insufficiencyModal, setInsufficiencyModal] = useState({ open: false, wo: null });
    const [unassignModal, setUnassignModal] = useState({ open: false, wo: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, wo: null });

    const fetchWorkorders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/workorders');
            let orders = res.data?.workorders || [];

            orders = orders.map(wo => ({
                ...wo,
                candidateName: wo.fullName || wo.candidateName || wo.candidateDetails?.nameOnAadhaar || "Unnamed Candidate",
                client: displayOrFallback(wo.client, 'Unknown Client'),
                package: wo.packageName || wo.package || "—",
                assigned: wo.assignedTo || wo.assigned || "Unassigned",
                progress: wo.progress || { current: wo.progressDone || 0, total: wo.progressTotal || 2 }
            }));

            setWorkorders(orders);
        } catch (err) {
            console.error('Failed to fetch workorders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkorders();
    }, [fetchWorkorders]);

    const applyAssignmentUpdate = (workorderId, assignedToName) => {
        setWorkorders(prev => prev.map(w => w._id === workorderId ? { ...w, assigned: assignedToName } : w));
        setTimeout(fetchWorkorders, 500);
    };

    const applyBulkAssignmentUpdate = (workorderIds, assignedToName) => {
        setWorkorders(prev => prev.map(w => workorderIds.includes(w._id) ? { ...w, assigned: assignedToName } : w));
        setSelectedIds([]);
        setTimeout(fetchWorkorders, 500);
    };

    const applyUnassignUpdate = (workorderId) => {
        setWorkorders(prev => prev.map(w => w._id === workorderId ? { ...w, assigned: 'Unassigned' } : w));
        setTimeout(fetchWorkorders, 400);
    };

    const applyDeleteUpdate = (workorderId) => {
        setWorkorders(prev => prev.filter(w => w._id !== workorderId));
        setSelectedIds(prev => prev.filter(id => id !== workorderId));
    };

    const stats = useMemo(() => {
        const total = workorders.length;
        const unassignedCount = workorders.filter(w => !w.assigned || w.assigned === 'Unassigned').length;
        const assignedCount = total - unassignedCount;
        return { total, unassignedCount, assignedCount };
    }, [workorders]);

    const filteredWorkorders = useMemo(() => {
        let result = [...workorders];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(w => 
                w.bgvRef?.toLowerCase().includes(q) || 
                w.candidateName?.toLowerCase().includes(q) || 
                w.client?.toLowerCase().includes(q)
            );
        }
        if (filterStatus !== 'all') result = result.filter(w => w.status === filterStatus);
        if (assignmentFilter === 'unassigned') result = result.filter(w => !w.assigned || w.assigned === 'Unassigned');
        if (assignmentFilter === 'assigned') result = result.filter(w => w.assigned && w.assigned !== 'Unassigned');

        result.sort((a, b) => {
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';
            if (sortConfig.direction === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });
        return result;
    }, [workorders, searchQuery, filterStatus, sortConfig, assignmentFilter]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <IoArrowUpOutline size={12} className="text-gray-400 opacity-30" />;
        return sortConfig.direction === 'asc' ? <IoArrowUpOutline size={12} className="text-[#00D4AA]" /> : <IoArrowDownOutline size={12} className="text-[#00D4AA]" />;
    };

    const allFilteredIds = useMemo(() => filteredWorkorders.map(w => w._id), [filteredWorkorders]);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
    const isSomeSelected = allFilteredIds.some(id => selectedIds.includes(id)) && !isAllSelected;

    const toggleOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleAll = () => {
        if (isAllSelected) setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
        else setSelectedIds(prev => [...new Set([...prev, ...allFilteredIds])]);
    };

    const handleAction = (type, wo) => {
        if (type === 'assign') setAssignModal({ open: true, wo });
        else if (type === 'insufficiency') setInsufficiencyModal({ open: true, wo });
        else if (type === 'unassign') setUnassignModal({ open: true, wo });
        else if (type === 'delete') setDeleteModal({ open: true, wo });
    };

    return (
        <div className="min-h-screen bg-[#f8fefd] text-gray-900 font-sans">
            <Header showNavigation={true} />

            {/* All Modals */}
            <AssignCheckModal isOpen={assignModal.open} onClose={() => setAssignModal({ open: false, wo: null })} workorder={assignModal.wo} onAssigned={applyAssignmentUpdate} />
            <RaiseInsufficiencyModal isOpen={insufficiencyModal.open} onClose={() => setInsufficiencyModal({ open: false, wo: null })} workorder={insufficiencyModal.wo} />
            <UnassignModal isOpen={unassignModal.open} onClose={() => setUnassignModal({ open: false, wo: null })} workorder={unassignModal.wo} onUnassigned={applyUnassignUpdate} />
            <DeleteWorkorderModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, wo: null })} workorder={deleteModal.wo} onDeleted={applyDeleteUpdate} />
            <BulkAssignModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} selectedChecks={selectedIds} onBulkAssigned={applyBulkAssignmentUpdate} />

            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-5">
                <div className="max-w-[1600px] mx-auto px-6">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 transition-all active:scale-95 mb-3">
                        <IoArrowBackOutline size={20} /> Back
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Assignment</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Assign and manage BGV verifiers to workorders</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-center min-w-[70px]"><div className="text-xl font-bold text-gray-900">{stats.total}</div><div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Total</div></div>
                            <div className="bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-center min-w-[70px]"><div className="text-xl font-bold text-emerald-600">{stats.assignedCount}</div><div className="text-[10px] font-bold text-emerald-500/70 tracking-wider uppercase">Assigned</div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="max-w-[1600px] mx-auto px-6 pt-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#00B494] hover:bg-[#009e82] rounded-xl text-sm font-semibold text-black transition-all"><IoAddCircleOutline size={18} />Bulk Assign</button>
                        {selectedIds.length > 0 && <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-100 border border-purple-200 rounded-xl text-xs font-semibold text-purple-700"><span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />{selectedIds.length} selected</span>}
                        <FilterDropdown assignmentFilter={assignmentFilter} setAssignmentFilter={setAssignmentFilter} stats={stats} />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <IoSearchOutline size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search ID, Name, Client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#00D4AA] transition-all" />
                        </div>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#00D4AA] transition-all">
                            <option value="all">All Status</option>
                            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                        </select>
                        <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'text-gray-500 hover:text-gray-700'}`}><IoListOutline size={18} /></button>
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'text-gray-500 hover:text-gray-700'}`}><IoGridOutline size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">
                {viewMode === 'list' && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-4">
                            <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-4 items-center text-xs font-bold text-gray-500 tracking-wider uppercase">
                                <div className="col-span-1 flex items-center gap-2"><Checkbox checked={isAllSelected} indeterminate={isSomeSelected} onChange={toggleAll} />S.No</div>
                                <div className="col-span-2"><button onClick={() => handleSort('bgvRef')} className="flex items-center gap-1 hover:text-gray-900">Workorder No <SortIcon column="bgvRef" /></button></div>
                                <div className="col-span-2"><button onClick={() => handleSort('candidateName')} className="flex items-center gap-1 hover:text-gray-900">Candidate <SortIcon column="candidateName" /></button></div>
                                <div className="col-span-1"><button onClick={() => handleSort('client')} className="flex items-center gap-1 hover:text-gray-900">Client <SortIcon column="client" /></button></div>
                                <div className="col-span-1">Package</div>
                                <div className="col-span-1">Status</div>
                                <div className="col-span-1">DE Progress</div>
                                <div className="col-span-1">Assigned</div>
                                <div className="col-span-1"><button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-900">Created <SortIcon column="createdAt" /></button></div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center text-gray-500"><div className="animate-spin w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full mx-auto mb-4" />Loading...</div>
                        ) : filteredWorkorders.length === 0 ? (
                            <div className="p-20 text-center text-gray-500">No workorders found</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredWorkorders.map((wo, index) => {
                                    const isSelected = selectedIds.includes(wo._id);
                                    return (
                                        <div key={wo._id} className={`grid grid-cols-[repeat(13,minmax(0,1fr))] gap-4 px-4 py-4 items-center transition-all ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                                            <div className="col-span-1 flex items-center gap-2.5">
                                                <Checkbox checked={isSelected} onChange={() => toggleOne(wo._id)} />
                                                <span className="text-sm text-gray-500">{index + 1}</span>
                                            </div>
                                            <div className="col-span-2"><span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-100 border border-purple-200 text-sm font-semibold text-purple-700 truncate" title={wo.bgvRef}>{wo.bgvRef}</span></div>
                                            <div className="col-span-2 text-sm text-gray-900 font-medium truncate" title={wo.candidateName}>{wo.candidateName}</div>
                                            <div className="col-span-1 text-sm text-gray-600 truncate" title={wo.client}>{displayOrFallback(wo.client, 'Unknown')}</div>
                                            <div className="col-span-1 text-sm text-gray-600 truncate">{wo.package}</div>
                                            <div className="col-span-1"><StatusBadge status={wo.status} /></div>
                                            <div className="col-span-1"><ProgressBar current={wo.progress?.current || 0} total={wo.progress?.total || 1} /></div>
                                            <div className="col-span-1 min-w-0">
                                                {(!wo.assigned || wo.assigned === 'Unassigned') ? (
                                                    <StatusBadge status="unassigned" />
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-200 text-xs font-medium text-emerald-600 truncate" title={wo.assigned}>{wo.assigned}</span>
                                                )}
                                            </div>
                                            <div className="col-span-1 text-sm text-gray-500 truncate">{formatDate(wo.createdAt)}</div>
                                            <div className="col-span-2 flex justify-end gap-1 flex-nowrap">
                                                <ActionButton icon={IoEyeOutline} color="#3B82F6" onClick={() => handleAction('assign', wo)} title="Assign" />
                                                <ActionButton icon={IoWarningOutline} color="#EF4444" onClick={() => handleAction('insufficiency', wo)} title="Insufficiency" />
                                                <ActionButton icon={IoPersonOutline} color="#6B7280" onClick={() => handleAction('unassign', wo)} title="Unassign" />
                                                <ActionButton icon={IoTrashOutline} color="#F87171" onClick={() => handleAction('delete', wo)} title="Delete" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {filteredWorkorders.map(wo => (
                            <GridCard key={wo._id} wo={wo} isSelected={selectedIds.includes(wo._id)} onToggle={() => toggleOne(wo._id)} onAction={handleAction} />
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-8 px-2 text-sm text-gray-500">
                    <div>Showing <span className="text-gray-900 font-medium">{filteredWorkorders.length}</span> of <span className="text-gray-900 font-medium">{workorders.length}</span> workorders</div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeAssignment;