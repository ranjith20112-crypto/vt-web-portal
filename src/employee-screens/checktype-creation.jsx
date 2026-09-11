import React, { useState, useEffect, useRef } from 'react';
import {
    IoAddOutline,
    IoSearchOutline,
    IoFilterOutline,
    IoCloseOutline,
    IoCreateOutline,
    IoTrashOutline,
    IoChevronDownOutline,
    IoChevronUpOutline,
    IoChevronForwardSharp,
    IoCheckmarkCircleOutline,
    IoAlertCircleOutline,
    IoSaveOutline,
    IoGridOutline,
    IoListOutline,
    IoCardOutline,
    IoRefreshOutline,
    IoDocumentTextOutline,
    IoGitBranchOutline,
    IoCheckboxOutline,
    IoLayersOutline,
    IoTimeOutline,
    IoMapOutline,
    IoLaptopOutline,
    IoHomeOutline,
    IoEyeOutline,
    IoArrowBackOutline,
    IoEyeOffOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';
const CheckTypes = () => {
    const navigate = useNavigate();
    const [checkTypes, setCheckTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: 'all', fieldVisit: 'all', digital: 'all' });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewType, setViewType] = useState('list');
    const [showSubChecks, setShowSubChecks] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);

    const [showCheckTypePopup, setShowCheckTypePopup] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSubCheckModal, setShowSubCheckModal] = useState(false);
    const [editingCheck, setEditingCheck] = useState(null);
    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState(getEmptyForm());
    const [subCheckInput, setSubCheckInput] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    

    // ─── Sub-check edit/delete state ──────────────────────────────────
    const [subChecksData, setSubChecksData] = useState([]); // full sub-check records from backend
    const [editingSubCheck, setEditingSubCheck] = useState(null);
    const [showEditSubCheckModal, setShowEditSubCheckModal] = useState(false);
    const [subEditForm, setSubEditForm] = useState({ code: '', name: '', dataInputMode: 'provided', sla: '', priority: 'normal', status: 'Active' });

    const modalRef = useRef(null);
    const subModalRef = useRef(null);
    const editSubModalRef = useRef(null);
    const checkTypeBtnRef = useRef(null);

    // ─── Fetch check types from backend ───────────────────────────────
    const fetchCheckTypes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/checktypes');
            if (res.data.success) {
                setCheckTypes(res.data.checkTypes.map(c => ({
                    ...c,
                    id: c._id,
                    subChecks: c.subChecks || []
                })));
            }
        } catch (error) {
            console.error('Fetch check types error:', error);
            setNotification({ type: 'error', message: 'Failed to load check types' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    // ─── Fetch full sub-check records (for edit/delete) ───────────────
    const fetchSubChecks = async () => {
        try {
            const res = await api.get('/api/subchecktypes');
            if (res.data.success) {
                setSubChecksData(res.data.subChecks.map(s => ({ ...s, id: s._id })));
            }
        } catch (error) {
            console.error('Fetch sub checks error:', error);
        }
    };

    useEffect(() => { fetchCheckTypes(); fetchSubChecks(); }, []);

    function getEmptyForm() { return { id: null, code: '', name: '', description: '', sla: '', fieldVisit: false, digital: false, status: 'Active', active: true, sortOrder: '', subChecks: [], parentCheck: '', dataInputMode: 'provided', priority: 'normal' }; }

    const filteredChecks = checkTypes.filter(v => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query || v.name.toLowerCase().includes(query) || v.code.toLowerCase().includes(query);
        const matchesStatus = filters.status === 'all' || v.status.toLowerCase() === filters.status;
        const matchesField = filters.fieldVisit === 'all' || v.fieldVisit === (filters.fieldVisit === 'yes');
        const matchesDigital = filters.digital === 'all' || v.digital === (filters.digital === 'yes');
        return matchesSearch && matchesStatus && matchesField && matchesDigital;
    });

    const sortedChecks = [...filteredChecks].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedChecks.length / pageSize) || 1;
    const paginatedChecks = sortedChecks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const stats = { total: checkTypes.length, active: checkTypes.filter(v => v.status === 'Active').length, fieldVisit: checkTypes.filter(v => v.fieldVisit).length, subChecks: checkTypes.reduce((sum, c) => sum + (c.subChecks?.length || 0), 0) };

    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    const toggleSelectAll = () => setSelectedRows(prev => prev.length === paginatedChecks.length ? [] : paginatedChecks.map(v => v.id));
    const toggleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    const toggleExpandedRow = (id) => setExpandedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);

    // ─── Helper: get full sub-check records for a parent check ────────
    const getSubChecksForParent = (parentId) => subChecksData.filter(s => s.parentCheckId === parentId);

    const openCheckTypePopup = () => setShowCheckTypePopup(true);
    const openCreateNewCheck = () => { setShowCheckTypePopup(false); setEditingCheck(null); setFormData(getEmptyForm()); setErrors({}); setShowCreateModal(true); };
    const openCreateSubCheck = () => { setShowCheckTypePopup(false); setEditingCheck(null); setFormData({ ...getEmptyForm(), fieldVisit: false, digital: true }); setErrors({}); setSubCheckInput(''); setShowSubCheckModal(true); };
    const openEditModal = (check) => { setEditingCheck(check); setFormData({ ...getEmptyForm(), ...check, sla: String(check.sla), active: check.status === 'Active' }); setErrors({}); setShowCreateModal(true); };
    const closeCreateModal = () => { setShowCreateModal(false); setEditingCheck(null); setFormData(getEmptyForm()); setErrors({}); };
    const closeSubCheckModal = () => { setShowSubCheckModal(false); setEditingCheck(null); setFormData(getEmptyForm()); setErrors({}); setSubCheckInput(''); };

    // ─── Sub-check edit modal open/close ──────────────────────────────
    const openEditSubCheckModal = (sub) => {
        setEditingSubCheck(sub);
        setSubEditForm({
            code: sub.code || '',
            name: sub.name || '',
            dataInputMode: sub.dataInputMode || 'provided',
            sla: String(sub.sla ?? ''),
            priority: sub.priority || 'normal',
            status: sub.status || 'Active'
        });
        setErrors({});
        setShowEditSubCheckModal(true);
    };
    const closeEditSubCheckModal = () => { setShowEditSubCheckModal(false); setEditingSubCheck(null); setErrors({}); };

    const handleFormChange = (e) => { const { name, value, type, checked } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' })); };
    const handleSubEditChange = (e) => { const { name, value } = e.target; setSubEditForm(prev => ({ ...prev, [name]: value })); if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' })); };
    const handleStatusChange = (status) => setFormData(prev => ({ ...prev, status }));
    const addSubCheck = () => { if (subCheckInput.trim() && !formData.subChecks.includes(subCheckInput.trim())) { setFormData(prev => ({ ...prev, subChecks: [...prev.subChecks, subCheckInput.trim()] })); setSubCheckInput(''); } };
    const removeSubCheck = (index) => setFormData(prev => ({ ...prev, subChecks: prev.subChecks.filter((_, i) => i !== index) }));

    const validateForm = () => { const e = {}; if (!formData.name.trim()) e.name = 'Required'; if (!formData.code.trim()) e.code = 'Required'; if (!formData.sla || formData.sla <= 0) e.sla = 'Required'; setErrors(e); return Object.keys(e).length === 0; };
    const validateSubCheckForm = () => { const e = {}; if (!formData.parentCheck) e.parentCheck = 'Required'; if (!formData.name.trim()) e.name = 'Required'; if (!formData.sla || formData.sla <= 0) e.sla = 'Required'; setErrors(e); return Object.keys(e).length === 0; };
    const validateSubEditForm = () => { const e = {}; if (!subEditForm.name.trim()) e.name = 'Required'; if (!subEditForm.sla || subEditForm.sla <= 0) e.sla = 'Required'; setErrors(e); return Object.keys(e).length === 0; };

    // ─── Create / Update Check Type via API ───────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault(); if (!validateForm()) return; setIsSubmitting(true);
        try {
            if (editingCheck) {
                const res = await api.put(`/api/checktypes/${editingCheck.id}`, {
                    name: formData.name,
                    description: formData.description,
                    sla: Number(formData.sla),
                    fieldVisit: formData.fieldVisit,
                    digital: formData.digital,
                    active: formData.active,
                    sortOrder: formData.sortOrder
                });
                if (res.data.success) {
                    await fetchCheckTypes();
                    setNotification({ type: 'success', message: 'Updated successfully!' });
                }
            } else {
                const res = await api.post('/api/checktype/create', {
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                    sla: Number(formData.sla),
                    fieldVisit: formData.fieldVisit,
                    digital: formData.digital,
                    status: formData.active ? 'Active' : 'Inactive',
                    sortOrder: formData.sortOrder
                });
                if (res.data.success) {
                    await fetchCheckTypes();
                    setNotification({ type: 'success', message: 'Created successfully!' });
                }
            }
            closeCreateModal();
        } catch (error) {
            console.error('Submit check type error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Operation failed' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // ─── Create Sub Check via API ─────────────────────────────────────
    const handleSubCheckSubmit = async (e) => {
        e.preventDefault(); if (!validateSubCheckForm()) return; setIsSubmitting(true);
        try {
            const res = await api.post('/api/subchecktype/create', {
                code: formData.code,
                name: formData.name.trim(),
                parentCheck: formData.parentCheck,
                dataInputMode: formData.dataInputMode,
                sla: Number(formData.sla),
                priority: formData.priority
            });
            if (res.data.success) {
                await fetchCheckTypes();
                await fetchSubChecks();
                setNotification({ type: 'success', message: 'Sub-check created!' });
            }
            closeSubCheckModal();
        } catch (error) {
            console.error('Submit sub check error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Operation failed' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // ─── Update Sub Check via API ─────────────────────────────────────
    const handleSubEditSubmit = async (e) => {
        e.preventDefault(); if (!validateSubEditForm()) return; setIsSubmitting(true);
        try {
            const res = await api.put(`/api/subchecktypes/${editingSubCheck.id}`, {
                code: subEditForm.code,
                name: subEditForm.name.trim(),
                dataInputMode: subEditForm.dataInputMode,
                sla: Number(subEditForm.sla),
                priority: subEditForm.priority,
                status: subEditForm.status
            });
            if (res.data.success) {
                await fetchCheckTypes();
                await fetchSubChecks();
                setNotification({ type: 'success', message: 'Sub-check updated!' });
            }
            closeEditSubCheckModal();
        } catch (error) {
            console.error('Update sub check error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Update failed' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // ─── Delete Sub Check via API ─────────────────────────────────────
    const handleSubCheckDelete = async (sub) => {
        if (!window.confirm(`Delete sub-check "${sub.name}"?`)) return;
        try {
            const res = await api.delete(`/api/subchecktypes/${sub.id}`);
            if (res.data.success) {
                await fetchCheckTypes();
                await fetchSubChecks();
                setNotification({ type: 'success', message: 'Sub-check deleted!' });
            }
        } catch (error) {
            console.error('Delete sub check error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Delete failed' });
        } finally {
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // ─── Delete Check Type via API ────────────────────────────────────
    const handleDeleteClick = async (id) => {
        if (!window.confirm('Delete this check type?')) return;
        try {
            const res = await api.delete(`/api/checktypes/${id}`);
            if (res.data.success) {
                await fetchCheckTypes();
                await fetchSubChecks();
                setNotification({ type: 'success', message: 'Deleted successfully!' });
            }
        } catch (error) {
            console.error('Delete check type error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Delete failed' });
        } finally {
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const clearFilters = () => { setFilters({ status: 'all', fieldVisit: 'all', digital: 'all' }); setSearchQuery(''); };

    useEffect(() => { const h = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) closeCreateModal(); }; if (showCreateModal) document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [showCreateModal]);
    useEffect(() => { const h = (e) => { if (subModalRef.current && !subModalRef.current.contains(e.target)) closeSubCheckModal(); }; if (showSubCheckModal) document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [showSubCheckModal]);
    useEffect(() => { const h = (e) => { if (editSubModalRef.current && !editSubModalRef.current.contains(e.target)) closeEditSubCheckModal(); }; if (showEditSubCheckModal) document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [showEditSubCheckModal]);

    const FloatingInput = ({ label, name, type = 'text', required = false, icon: Icon, value, onChange, readOnly }) => {
        const isFocused = focusedField === name;
        const hasValue = value && value.toString().length > 0;
        return (
            <div className="relative group">
                {Icon && (<div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? 'text-[#00D4AA]' : 'text-gray-400'}`}><Icon size={20} /></div>)}
                <input type={type} name={name} value={value || ''} onChange={onChange} onFocus={() => setFocusedField(name)} onBlur={() => setFocusedField(null)} required={required} readOnly={readOnly} className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] text-black rounded-xl ${Icon ? 'px-12' : 'px-4'} py-4 outline-none transition-all duration-300 placeholder-transparent peer shadow-sm ${readOnly ? 'opacity-50 cursor-not-allowed' : ''} ${errors[name] ? 'border-red-300' : ''}`} placeholder={label} id={name} />
                <label htmlFor={name} className={`absolute ${Icon ? 'left-12' : 'left-4'} transition-all duration-300 pointer-events-none ${hasValue || isFocused ? '-top-2.5 text-xs text-[#00D4AA] bg-white px-2 rounded border border-gray-200' : 'top-4 text-gray-500 bg-transparent'}`}>{label} {required && <span className="text-red-500">*</span>}</label>
                {errors[name] && (<p className="text-red-500 text-xs mt-1.5 ml-1">{errors[name]}</p>)}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fefd] text-black font-sans selection:bg-[#00D4AA]/30 selection:text-[#00D4AA]">
            <Header showNavigation={false} />

            {notification && (
                <div className={`fixed top-20 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in border ${notification.type === 'success' ? 'bg-white border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-white border-red-300 text-red-600'}`}>
                    <IoCheckmarkCircleOutline size={20} /><span className="text-sm font-medium">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 text-gray-400 hover:text-gray-600"><IoCloseOutline size={16} /></button>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-8 py-12">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2.5 mb-5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-black transition-all active:scale-95"
                >
                    <IoArrowBackOutline size={20} />
                    <span>Back</span>
                </button>


                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-8 animate-fade-in-up">
                    <div className="lg:w-1/2">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20"><IoCheckboxOutline size={24} className="text-[#00D4AA]" /></div>
                            <h2 className="text-4xl font-bold text-black tracking-tight">Check Types</h2>
                        </div>
                        <p className="text-gray-600 text-base leading-relaxed flex items-center gap-2"><IoGridOutline size={18} className="text-gray-400" />Verification check categories (Education, Employment, Address, etc.)</p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        {[{ label: 'TOTAL', val: stats.total, color: 'text-[#00D4AA]', bc: 'border-[#00D4AA]/20', bg: 'bg-[#00D4AA]/5' }, { label: 'ACTIVE', val: stats.active, color: 'text-[#10B981]', bc: 'border-[#10B981]/20', bg: 'bg-[#10B981]/5' }, { label: 'FIELD VISIT', val: stats.fieldVisit, color: 'text-[#F5A623]', bc: 'border-[#F5A623]/20', bg: 'bg-[#F5A623]/5' }, { label: 'SUB CHECKS', val: stats.subChecks, color: 'text-purple-600', bc: 'border-purple-500/20', bg: 'bg-purple-500/5' }].map((s, i) => (
                            <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${s.bc} ${s.bg}`}><span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</span><span className={`text-2xl font-bold ${s.color} tracking-tight`}>{s.val}</span></div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72 lg:w-80">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Code, Name..." className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-black placeholder-gray-400 transition-all" />
                        </div>
                        <div className="flex bg-white rounded-xl p-1 border border-gray-200">
                            <button onClick={() => setViewType('list')} className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#00D4AA] text-white' : 'text-gray-500 hover:text-black'}`}><IoListOutline size={20} /></button>
                            <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-[#00D4AA] text-white' : 'text-gray-500 hover:text-black'}`}><IoCardOutline size={20} /></button>
                        </div>
                        <button onClick={() => setIsFilterOpen(true)} className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2 ${Object.values(filters).some(val => val && val !== 'all') || searchQuery ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-white border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50'}`}><IoFilterOutline size={18} /><span>Filter</span></button>

                        {/* ★ VIEW SUBCHECK BUTTON — NEXT TO FILTER ★ */}
                        <button
                            onClick={() => {
                                setShowSubChecks(prev => !prev);
                                if (showSubChecks) setExpandedRows([]);
                            }}
                            className={`px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2 ${showSubChecks ? 'bg-purple-100 border-purple-300 text-purple-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50'}`}
                        >
                            {showSubChecks ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                            <span>View SubCheck</span>
                            {showSubChecks && (
                                <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">ON</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ★ SUBCHECK ACTIVE INDICATOR BAR ★ */}
                {showSubChecks && (
                    <div className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 animate-fade-in">
                        <IoGitBranchOutline size={16} className="text-purple-600 flex-shrink-0" />
                        <span className="text-xs text-purple-700">Sub-checks are visible — click the <IoChevronDownOutline size={12} className="inline mx-0.5" /> arrow on any row to expand/collapse its sub-checks</span>
                        <button onClick={() => { setShowSubChecks(false); setExpandedRows([]); }} className="ml-auto text-purple-500 hover:text-purple-700 transition-colors"><IoCloseOutline size={14} /></button>
                    </div>
                )}


                {/* ★ ISOLATED DROPDOWN ROW ★ */}
                <div className="flex justify-start mb-3 relative z-50">
                    <div className="relative">
                        <button ref={checkTypeBtnRef} onClick={openCheckTypePopup} className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-white rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95">
                            <IoLayersOutline size={18} /><span>Check Type</span>
                            <IoChevronDownOutline size={14} className={`transition-transform duration-300 ${showCheckTypePopup ? 'rotate-180' : ''}`} />
                        </button>

                        {showCheckTypePopup && (
                            <>
                                <div className="fixed inset-0" onClick={() => setShowCheckTypePopup(false)} />
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                                    <div className="p-2">
                                        <button onClick={openCreateNewCheck} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all group/item text-left">
                                            <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#00D4AA]/20"><IoDocumentTextOutline size={18} className="text-[#00D4AA]" /></div>
                                            <div className="flex-1 min-w-0"><div className="text-sm font-bold text-black group-hover/item:text-[#00D4AA] transition-colors">Create New Check</div><div className="text-[11px] text-gray-500 truncate">Add a new verification check type</div></div>
                                        </button>
                                        <div className="h-px bg-gray-100 my-1 mx-3"></div>
                                        <button onClick={openCreateSubCheck} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all group/item text-left">
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0 group-hover/item:bg-purple-200"><IoGitBranchOutline size={18} className="text-purple-600" /></div>
                                            <div className="flex-1 min-w-0"><div className="text-sm font-bold text-black group-hover/item:text-purple-600 transition-colors">Create Sub Check</div><div className="text-[11px] text-gray-500 truncate">Add sub-check under existing type</div></div>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>




                {loading ? (
                    <div className="text-center py-20 text-gray-500"><div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>Loading check types...</div>
                ) : (
                    <>
                        {viewType === 'list' && (
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up mt-3" style={{ animationDelay: '0.15s' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50">
                                                <th className="p-5 w-10">{showSubChecks && <span className="text-[10px] text-gray-400 block text-center">▸</span>}</th>
                                                <th className="p-5"><input type="checkbox" checked={paginatedChecks.length > 0 && selectedRows.length === paginatedChecks.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 bg-white text-[#00D4AA] focus:ring-[#00D4AA]/30" /></th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('code')}><div className="flex items-center gap-1">Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div></th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase">Name</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase">SLA</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-center">Field</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-center">Digital</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase">Sub Checks</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase">Status</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedChecks.length > 0 ? paginatedChecks.map((check) => {
                                                const isExpanded = expandedRows.includes(check.id);
                                                const fullSubChecks = getSubChecksForParent(check.id);
                                                return (
                                                    <React.Fragment key={check.id}>
                                                        <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors group ${showSubChecks && isExpanded ? 'bg-purple-50' : ''}`}>
                                                            {/* ★ EXPAND/COLLAPSE COLUMN ★ */}
                                                            <td className="p-5 w-10">
                                                                {showSubChecks && check.subChecks && check.subChecks.length > 0 ? (
                                                                    <button
                                                                        onClick={() => toggleExpandedRow(check.id)}
                                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-purple-100 text-purple-600 rotate-90' : 'bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                                                                    >
                                                                        <IoChevronForwardSharp size={12} className="transition-transform duration-300" />
                                                                    </button>
                                                                ) : showSubChecks ? (
                                                                    <span className="w-7 h-7 flex items-center justify-center text-gray-300 text-[10px]">—</span>
                                                                ) : null}
                                                            </td>
                                                            <td className="p-5"><input type="checkbox" checked={selectedRows.includes(check.id)} onChange={() => toggleSelectRow(check.id)} className="w-4 h-4 rounded border-gray-300 bg-white text-[#00D4AA] focus:ring-[#00D4AA]/30" /></td>
                                                            <td className="p-5"><span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs font-mono text-[#00D4AA]">{check.code}</span></td>
                                                            <td className="p-5"><div className="font-medium text-black text-sm">{check.name}</div><div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{check.description}</div></td>
                                                            <td className="p-5"><span className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-[#F5A623]"><IoTimeOutline size={14} className="text-gray-400" />{check.sla}d</span></td>
                                                            <td className="p-5 text-center">{check.fieldVisit ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/20"><IoMapOutline size={16} className="text-[#F5A623]" /></span> : <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 border border-gray-200"><IoMapOutline size={16} className="text-gray-400" /></span>}</td>
                                                            <td className="p-5 text-center">{check.digital ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20"><IoLaptopOutline size={16} className="text-[#3B82F6]" /></span> : <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 border border-gray-200"><IoLaptopOutline size={16} className="text-gray-400" /></span>}</td>
                                                            <td className="p-5">
                                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                    {check.subChecks && check.subChecks.length > 0 ? check.subChecks.slice(0, 2).map((sc, i) => (<span key={i} className="inline-flex px-2 py-0.5 rounded-md bg-purple-100 border border-purple-200 text-[10px] text-purple-700">{sc}</span>)) : <span className="text-xs text-gray-400">—</span>}
                                                                    {check.subChecks && check.subChecks.length > 2 && <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] text-gray-500">+{check.subChecks.length - 2}</span>}
                                                                </div>
                                                            </td>
                                                            <td className="p-5"><div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${check.status === 'Active' ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div><span className={`text-sm ${check.status === 'Active' ? 'text-[#10B981]' : 'text-gray-500'}`}>{check.status}</span></div></td>
                                                            <td className="p-5 text-right"><div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity"><button onClick={() => openEditModal(check)} className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all text-gray-500"><IoCreateOutline size={18} /></button><button onClick={() => handleDeleteClick(check.id)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all text-gray-500"><IoTrashOutline size={18} /></button></div></td>
                                                        </tr>

                                                        {/* ★ EXPANDED SUB-CHECK ROWS ★ */}
                                                        {showSubChecks && isExpanded && check.subChecks && check.subChecks.length > 0 && (
                                                            <tr key={`sub-header-${check.id}`}>
                                                                <td colSpan={10} className="p-0 border-b border-gray-100">
                                                                    <div className="bg-purple-50 border-l-2 border-l-purple-300 animate-fade-in">
                                                                        <div className="px-8 py-3">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <IoGitBranchOutline size={14} className="text-purple-600" />
                                                                                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-widest">Sub Checks ({check.subChecks.length})</span>
                                                                                <div className="flex-1 h-px bg-purple-100 ml-3"></div>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                                {check.subChecks.map((sc, i) => {
                                                                                    // Match this sub-check name to a full backend record for edit/delete
                                                                                    const fullRecord = fullSubChecks.find(fs => fs.name === sc);
                                                                                    return (
                                                                                        <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-purple-200 transition-all group/sub">
                                                                                            <div className="w-6 h-6 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0">
                                                                                                <span className="text-[10px] font-bold text-purple-700">{i + 1}</span>
                                                                                            </div>
                                                                                            <span className="text-sm text-black group-hover/sub:text-purple-700 transition-colors flex-1 min-w-0 truncate">{sc}</span>
                                                                                            <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">{fullRecord?.code || `${check.code}-SC${i + 1}`}</span>
                                                                                            {/* ★ EDIT / DELETE SUB-CHECK ACTIONS ★ */}
                                                                                            {fullRecord && (
                                                                                                <div className="flex items-center gap-1 flex-shrink-0 opacity-70 group-hover/sub:opacity-100 transition-opacity">
                                                                                                    <button onClick={() => openEditSubCheckModal(fullRecord)} className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all text-gray-500"><IoCreateOutline size={15} /></button>
                                                                                                    <button onClick={() => handleSubCheckDelete(fullRecord)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all text-gray-500"><IoTrashOutline size={15} /></button>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {showSubChecks && isExpanded && (!check.subChecks || check.subChecks.length === 0) && (
                                                            <tr key={`sub-empty-${check.id}`}>
                                                                <td colSpan={10} className="p-0 border-b border-gray-100">
                                                                    <div className="bg-purple-50 border-l-2 border-l-purple-200 px-8 py-4">
                                                                        <div className="flex items-center gap-2 text-gray-500">
                                                                            <IoAlertCircleOutline size={14} />
                                                                            <span className="text-xs">No sub-checks defined for this check type</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            }) : <tr><td colSpan={10} className="p-16 text-center text-gray-500">No check types found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500"><span>Page Size</span><select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-black text-xs focus:outline-none">{[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">First</button>
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Prev</button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (<button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-[#00D4AA] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-black'}`}>{i + 1}</button>))}
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Next</button>
                                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Last</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewType === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up mt-3" style={{ animationDelay: '0.15s' }}>
                                {paginatedChecks.length > 0 ? paginatedChecks.map((check) => {
                                    const fullSubChecks = getSubChecksForParent(check.id);
                                    return (
                                    <div key={check.id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-white border border-gray-200 flex items-center justify-center text-sm font-bold text-[#00D4AA]">{check.name?.charAt(0)}</div><div><h3 className="font-bold text-black text-sm">{check.name}</h3><p className="text-[10px] text-gray-500 font-mono mt-0.5">{check.code}</p></div></div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${check.status === 'Active' ? 'border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10' : 'border-gray-300 text-gray-500 bg-gray-100'}`}>{check.status}</div>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-4 line-clamp-2">{check.description}</p>

                                        {/* ★ GRID SUB-CHECKS SECTION ★ */}
                                        {showSubChecks && (
                                            <div className="mb-4 animate-fade-in">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <IoGitBranchOutline size={12} className="text-purple-600" />
                                                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">Sub Checks ({check.subChecks?.length || 0})</span>
                                                </div>
                                                {check.subChecks && check.subChecks.length > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {check.subChecks.map((sc, i) => {
                                                            const fullRecord = fullSubChecks.find(fs => fs.name === sc);
                                                            return (
                                                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100 group/gsub">
                                                                    <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-[9px] font-bold text-purple-700">{i + 1}</span>
                                                                    </div>
                                                                    <span className="text-[11px] text-black flex-1 min-w-0 truncate">{sc}</span>
                                                                    {/* ★ EDIT / DELETE SUB-CHECK ACTIONS (GRID) ★ */}
                                                                    {fullRecord && (
                                                                        <div className="flex items-center gap-1 flex-shrink-0 opacity-70 group-hover/gsub:opacity-100 transition-opacity">
                                                                            <button onClick={() => openEditSubCheckModal(fullRecord)} className="p-1 rounded hover:bg-blue-50 hover:text-blue-600 transition-all text-gray-500"><IoCreateOutline size={13} /></button>
                                                                            <button onClick={() => handleSubCheckDelete(fullRecord)} className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-all text-gray-500"><IoTrashOutline size={13} /></button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-[11px] text-gray-500 italic">No sub-checks defined</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(check)} className="p-2 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-blue-600"><IoCreateOutline size={16} /></button>
                                            <button onClick={() => handleDeleteClick(check.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white transition-all text-red-600"><IoTrashOutline size={16} /></button>
                                        </div>
                                    </div>
                                    );
                                }) : <div className="col-span-full p-16 text-center text-gray-500">No check types found.</div>}
                            </div>
                        )}
                    </>
                )}

            </main>







            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && closeCreateModal()} />
                    <div ref={modalRef} className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50"><div><h3 className="text-2xl font-bold text-black">{editingCheck ? 'Edit Check Type' : 'New Check Type'}</h3><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{editingCheck ? 'Update check' : 'Define a new category'}</p></div><button onClick={closeCreateModal} className="text-gray-400 hover:text-black p-2"><IoCloseOutline size={26} /></button></div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#00D4AA] pl-3">Check Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Code <span className="text-red-500">*</span></label>
                                        <input type="text" name="code" required value={formData.code} onChange={handleFormChange} readOnly={!!editingCheck} placeholder="e.g., EDU_UG, EMP_PREV" className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${editingCheck ? 'opacity-50 cursor-not-allowed' : ''} ${errors.code ? 'border-red-300' : ''}`} />
                                        <p className="text-[11px] text-gray-500 mt-1.5 ml-1">e.g., EDU_UG, EMP_PREV</p>
                                        {errors.code && <p className="text-red-500 text-xs mt-1 ml-1">{errors.code}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="name" required value={formData.name} onChange={handleFormChange} placeholder="e.g., Graduation Verification" className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.name ? 'border-red-300' : ''}`} />
                                        <p className="text-[11px] text-gray-500 mt-1.5 ml-1">e.g., Graduation Verification</p>
                                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-black mb-1.5">Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Brief description of this check type..." rows={3} className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Default SLA (Days) <span className="text-red-500">*</span></label>
                                        <input type="number" name="sla" required value={formData.sla} onChange={handleFormChange} placeholder="7" className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.sla ? 'border-red-300' : ''}`} />
                                        {errors.sla && <p className="text-red-500 text-xs mt-1 ml-1">{errors.sla}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Sort Order</label>
                                        <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleFormChange} placeholder="0" className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#F5A623] pl-3">Delivery Settings</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <label className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.fieldVisit ? 'border-[#F5A623]/40 bg-[#F5A623]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-4">
                                            <input type="checkbox" name="fieldVisit" checked={formData.fieldVisit} onChange={handleFormChange} className="w-5 h-5 rounded border-gray-300 bg-white text-[#F5A623] focus:ring-[#F5A623]/30 cursor-pointer" />
                                            <div>
                                                <div className="text-sm font-medium text-black flex items-center gap-2"><IoMapOutline size={16} className={formData.fieldVisit ? 'text-[#F5A623]' : 'text-gray-400'} /> Requires Field Visit</div>
                                                <div className="text-[11px] text-gray-500 mt-0.5">Physical site visit is needed to complete this check</div>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${formData.fieldVisit ? 'bg-[#F5A623]' : 'bg-gray-200'}`}>
                                            <div className={`w-5 h-5 rounded-full bg-white shadow-md mx-1 transition-transform duration-300 ${formData.fieldVisit ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </label>
                                    <label className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.digital ? 'border-[#3B82F6]/40 bg-[#3B82F6]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-4">
                                            <input type="checkbox" name="digital" checked={formData.digital} onChange={handleFormChange} className="w-5 h-5 rounded border-gray-300 bg-white text-[#3B82F6] focus:ring-[#3B82F6]/30 cursor-pointer" />
                                            <div>
                                                <div className="text-sm font-medium text-black flex items-center gap-2"><IoLaptopOutline size={16} className={formData.digital ? 'text-[#3B82F6]' : 'text-gray-400'} /> Digital Verification Possible</div>
                                                <div className="text-[11px] text-gray-500 mt-0.5">This check can be completed online without physical visit</div>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${formData.digital ? 'bg-[#3B82F6]' : 'bg-gray-200'}`}>
                                            <div className={`w-5 h-5 rounded-full bg-white shadow-md mx-1 transition-transform duration-300 ${formData.digital ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#10B981] pl-3">Status</h4>
                                <label className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.active ? 'border-[#10B981]/40 bg-[#10B981]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" name="active" checked={formData.active} onChange={handleFormChange} className="w-5 h-5 rounded border-gray-300 bg-white text-[#10B981] focus:ring-[#10B981]/30 cursor-pointer" />
                                        <div>
                                            <div className="text-sm font-medium text-black">{formData.active ? 'Active' : 'Inactive'}</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5">Make this check type available for use in verification packages</div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${formData.active ? 'bg-[#10B981]' : 'bg-gray-200'}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-md mx-1 transition-transform duration-300 ${formData.active ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            </div>

                            <p className="text-xs text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button type="button" onClick={closeCreateModal} className="flex-1 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-sm" disabled={isSubmitting}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-[#00D4AA]/30 text-[#00D4AA]/50 cursor-not-allowed' : 'bg-[#00D4AA] text-white hover:bg-[#00F0C0] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)]'}`}>{isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <><IoSaveOutline size={18} />{editingCheck ? 'Update' : 'Save'}</>}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* SUB CHECK MODAL */}
            {showSubCheckModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && closeSubCheckModal()} />
                    <div ref={subModalRef} className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50"><div><h3 className="text-2xl font-bold text-black">New Check Sub Type</h3><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Define a sub-check under existing type</p></div><button onClick={closeSubCheckModal} className="text-gray-400 hover:text-black p-2"><IoCloseOutline size={26} /></button></div>
                        <form onSubmit={handleSubCheckSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#00D4AA] pl-3">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Code <span className="text-red-500">*</span></label>
                                        <input type="text" name="code" required value={formData.code} onChange={handleFormChange} placeholder="e.g., EDU_10" className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.code ? 'border-red-300' : ''}`} />
                                        <p className="text-[11px] text-gray-500 mt-1.5 ml-1">e.g., EDU_10</p>
                                        {errors.code && <p className="text-red-500 text-xs mt-1 ml-1">{errors.code}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="name" required value={formData.name} onChange={handleFormChange} placeholder="e.g., 10th Board Verification" className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.name ? 'border-red-300' : ''}`} />
                                        <p className="text-[11px] text-gray-500 mt-1.5 ml-1">e.g., 10th Board Verification</p>
                                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-purple-600 pl-3">Check Type</h4>
                                <div className="relative">
                                    <IoDocumentTextOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                    <select name="parentCheck" value={formData.parentCheck} onChange={handleFormChange} className={`w-full appearance-none bg-white border ${errors.parentCheck ? 'border-red-300' : 'border-gray-200'} focus:border-purple-600 text-black rounded-xl pl-12 pr-10 py-3.5 outline-none transition-all cursor-pointer text-sm`}>
                                        <option value="">Select Check Type...</option>
                                        {checkTypes.filter(c => c.status === 'Active').map(c => (<option key={c.id} value={c.id}>{c.code} — {c.name}</option>))}
                                    </select>
                                    <IoChevronDownOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    {errors.parentCheck && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.parentCheck}</p>}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#3B82F6] pl-3">Data Input Settings</h4>
                                <p className="text-xs text-gray-500 -mt-3 ml-5 leading-relaxed">Configure whether this check requires data from the candidate or is handled internally.</p>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-3">Candidate Information Required?</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, dataInputMode: 'provided' }))} className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${formData.dataInputMode === 'provided' ? 'border-[#00D4AA]/40 bg-[#00D4AA]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${formData.dataInputMode === 'provided' ? 'border-[#00D4AA]' : 'border-gray-300'}`}>{formData.dataInputMode === 'provided' && <div className="w-2.5 h-2.5 rounded-full bg-[#00D4AA]" />}</div>
                                                <span className={`text-sm font-bold transition-colors ${formData.dataInputMode === 'provided' ? 'text-[#00D4AA]' : 'text-black'}`}>Provided Information (DE)</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed pl-8">Candidate provides info via portal</p>
                                        </button>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, dataInputMode: 'internal' }))} className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${formData.dataInputMode === 'internal' ? 'border-[#3B82F6]/40 bg-[#3B82F6]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${formData.dataInputMode === 'internal' ? 'border-[#3B82F6]' : 'border-gray-300'}`}>{formData.dataInputMode === 'internal' && <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />}</div>
                                                <span className={`text-sm font-bold transition-colors ${formData.dataInputMode === 'internal' ? 'text-[#3B82F6]' : 'text-black'}`}>Internal Only</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed pl-8">No candidate input, done internally</p>
                                        </button>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, dataInputMode: 'both' }))} className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${formData.dataInputMode === 'both' ? 'border-[#F5A623]/40 bg-[#F5A623]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${formData.dataInputMode === 'both' ? 'border-[#F5A623]' : 'border-gray-300'}`}>{formData.dataInputMode === 'both' && <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />}</div>
                                                <span className={`text-sm font-bold transition-colors ${formData.dataInputMode === 'both' ? 'text-[#F5A623]' : 'text-black'}`}>Both</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed pl-8">Combination of both modes</p>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#F5A623] pl-3">SLA & Priority</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">SLA (Days) <span className="text-red-500">*</span></label>
                                        <input type="number" name="sla" required value={formData.sla} onChange={handleFormChange} placeholder="5" className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.sla ? 'border-red-300' : ''}`} />
                                        {errors.sla && <p className="text-red-500 text-xs mt-1 ml-1">{errors.sla}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Priority</label>
                                        <select name="priority" value={formData.priority} onChange={handleFormChange} className="w-full appearance-none bg-white border border-gray-200 focus:border-[#00D4AA] text-black rounded-xl px-4 py-3.5 outline-none transition-all cursor-pointer text-sm">
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button type="button" onClick={closeSubCheckModal} className="flex-1 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-sm" disabled={isSubmitting}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-purple-300 text-purple-700 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'}`}>{isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <><IoSaveOutline size={18} />Create Sub Check</>}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ★ EDIT SUB CHECK MODAL ★ */}
            {showEditSubCheckModal && editingSubCheck && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && closeEditSubCheckModal()} />
                    <div ref={editSubModalRef} className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50"><div><h3 className="text-2xl font-bold text-black">Edit Sub Check</h3><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{editingSubCheck.parentCheckName ? `Under ${editingSubCheck.parentCheckName}` : 'Update sub-check'}</p></div><button onClick={closeEditSubCheckModal} className="text-gray-400 hover:text-black p-2"><IoCloseOutline size={26} /></button></div>
                        <form onSubmit={handleSubEditSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#00D4AA] pl-3">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Code</label>
                                        <input type="text" name="code" value={subEditForm.code} onChange={handleSubEditChange} placeholder="e.g., EDU_10" className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="name" required value={subEditForm.name} onChange={handleSubEditChange} placeholder="e.g., 10th Board Verification" className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.name ? 'border-red-300' : ''}`} />
                                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#3B82F6] pl-3">Data Input Settings</h4>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-3">Candidate Information Required?</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button type="button" onClick={() => setSubEditForm(prev => ({ ...prev, dataInputMode: 'provided' }))} className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${subEditForm.dataInputMode === 'provided' ? 'border-[#00D4AA]/40 bg-[#00D4AA]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${subEditForm.dataInputMode === 'provided' ? 'border-[#00D4AA]' : 'border-gray-300'}`}>{subEditForm.dataInputMode === 'provided' && <div className="w-2.5 h-2.5 rounded-full bg-[#00D4AA]" />}</div>
                                                <span className={`text-sm font-bold transition-colors ${subEditForm.dataInputMode === 'provided' ? 'text-[#00D4AA]' : 'text-black'}`}>Provided Information (DE)</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed pl-8">Candidate provides info via portal</p>
                                        </button>
                                        <button type="button" onClick={() => setSubEditForm(prev => ({ ...prev, dataInputMode: 'internal' }))} className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${subEditForm.dataInputMode === 'internal' ? 'border-[#3B82F6]/40 bg-[#3B82F6]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${subEditForm.dataInputMode === 'internal' ? 'border-[#3B82F6]' : 'border-gray-300'}`}>{subEditForm.dataInputMode === 'internal' && <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />}</div>
                                                <span className={`text-sm font-bold transition-colors ${subEditForm.dataInputMode === 'internal' ? 'text-[#3B82F6]' : 'text-black'}`}>Internal Only</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed pl-8">No candidate input, done internally</p>
                                        </button>
                                        <button type="button" onClick={() => setSubEditForm(prev => ({ ...prev, dataInputMode: 'both' }))} className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${subEditForm.dataInputMode === 'both' ? 'border-[#F5A623]/40 bg-[#F5A623]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${subEditForm.dataInputMode === 'both' ? 'border-[#F5A623]' : 'border-gray-300'}`}>{subEditForm.dataInputMode === 'both' && <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />}</div>
                                                <span className={`text-sm font-bold transition-colors ${subEditForm.dataInputMode === 'both' ? 'text-[#F5A623]' : 'text-black'}`}>Both</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed pl-8">Combination of both modes</p>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#F5A623] pl-3">SLA & Priority</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">SLA (Days) <span className="text-red-500">*</span></label>
                                        <input type="number" name="sla" required value={subEditForm.sla} onChange={handleSubEditChange} placeholder="5" className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.sla ? 'border-red-300' : ''}`} />
                                        {errors.sla && <p className="text-red-500 text-xs mt-1 ml-1">{errors.sla}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Priority</label>
                                        <select name="priority" value={subEditForm.priority} onChange={handleSubEditChange} className="w-full appearance-none bg-white border border-gray-200 focus:border-[#00D4AA] text-black rounded-xl px-4 py-3.5 outline-none transition-all cursor-pointer text-sm">
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#10B981] pl-3">Status</h4>
                                <label className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${subEditForm.status === 'Active' ? 'border-[#10B981]/40 bg-[#10B981]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" checked={subEditForm.status === 'Active'} onChange={(e) => setSubEditForm(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))} className="w-5 h-5 rounded border-gray-300 bg-white text-[#10B981] focus:ring-[#10B981]/30 cursor-pointer" />
                                        <div>
                                            <div className="text-sm font-medium text-black">{subEditForm.status === 'Active' ? 'Active' : 'Inactive'}</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5">Make this sub-check available for use</div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${subEditForm.status === 'Active' ? 'bg-[#10B981]' : 'bg-gray-200'}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-md mx-1 transition-transform duration-300 ${subEditForm.status === 'Active' ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            </div>

                            <p className="text-xs text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button type="button" onClick={closeEditSubCheckModal} className="flex-1 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-sm" disabled={isSubmitting}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-purple-300 text-purple-700 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'}`}>{isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <><IoSaveOutline size={18} />Update Sub Check</>}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ★ FILTER SLIDE-OVER PANEL ★ */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[50] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
                    <div className="relative w-full max-w-sm bg-white border-l border-gray-200 shadow-2xl h-full overflow-y-auto animate-slide-in-right p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center"><IoFilterOutline size={18} className="text-[#00D4AA]" /></div>
                                <div><h3 className="text-lg font-bold text-black">Filters</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest">Refine results</p></div>
                            </div>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-black p-1"><IoCloseOutline size={24} /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Status</label>
                                <div className="space-y-2">
                                    {[{ v: 'all', l: 'All Statuses' }, { v: 'active', l: 'Active' }, { v: 'inactive', l: 'Inactive' }].map(o => (
                                        <button key={o.v} onClick={() => setFilters(prev => ({ ...prev, status: o.v }))} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${filters.status === o.v ? 'bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] font-medium' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>{o.l}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Field Visit</label>
                                <div className="space-y-2">
                                    {[{ v: 'all', l: 'All' }, { v: 'yes', l: 'Yes — Requires Visit' }, { v: 'no', l: 'No — Digital Only' }].map(o => (
                                        <button key={o.v} onClick={() => setFilters(prev => ({ ...prev, fieldVisit: o.v }))} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${filters.fieldVisit === o.v ? 'bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] font-medium' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>{o.l}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Digital</label>
                                <div className="space-y-2">
                                    {[{ v: 'all', l: 'All' }, { v: 'yes', l: 'Yes — Digital' }, { v: 'no', l: 'No — Manual' }].map(o => (
                                        <button key={o.v} onClick={() => setFilters(prev => ({ ...prev, digital: o.v }))} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${filters.digital === o.v ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] font-medium' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>{o.l}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">Clear All</button>
                            <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-white text-sm font-bold hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all">Apply</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out both; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out both; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>
        </div>
    );
};

export default CheckTypes;
