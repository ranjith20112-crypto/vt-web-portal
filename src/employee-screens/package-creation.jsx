import React, { useState, useEffect } from 'react';
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
    IoSaveOutline,
    IoGridOutline,
    IoListOutline,
    IoCardOutline,
    IoRefreshOutline,
    IoDocumentTextOutline,
    IoLayersOutline,
    IoTimeOutline,
    IoHomeOutline,
    IoEyeOutline,
    IoPricetagOutline,
    IoArrowBackOutline,
    IoGlobeOutline,
    IoCheckmarkDoneOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

const Packages = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: 'all', type: 'all' });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewType, setViewType] = useState('list');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [viewingPackage, setViewingPackage] = useState(null);
    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState({});

    // ─── Live check types + sub-checks from backend ──────────────────
    const [checkTypeList, setCheckTypeList] = useState([]); // active check types
    const [subChecksData, setSubChecksData] = useState([]); // all sub-check records

    const [formData, setFormData] = useState(getEmptyForm());
    const [isSubmitting, setIsSubmitting] = useState(false);

    function getEmptyForm() {
        return { id: null, code: '', name: '', description: '', active: true, checkComponents: [] };
    }

    // ─── Build lookup maps from live data ────────────────────────────
    // code -> name (for displaying checks in list/view)
    const checkTypeMap = checkTypeList.reduce((acc, c) => { acc[c.code] = c.name; return acc; }, {});
    // code -> [{ value, label }] sub-type options (from real sub-checks under that parent)
    const subTypeOptions = checkTypeList.reduce((acc, c) => {
        const subs = subChecksData.filter(s => s.parentCheckId === c.id);
        acc[c.code] = subs.map(s => ({ value: s.code || s.name, label: s.name }));
        return acc;
    }, {});

    // ─── Fetch packages ──────────────────────────────────────────────
    const fetchPackages = async () => {
        try {
            setLoading(true);
            const res = await api.get('/packages');
            if (res.data.success) {
                setPackages(res.data.packages.map(p => ({
                    ...p,
                    id: p._id,
                    checks: p.checks || (p.checkComponents || []).map(c => c.checkType),
                    createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : ''
                })));
            }
        } catch (error) {
            console.error('Fetch packages error:', error);
            setNotification({ type: 'error', message: 'Failed to load packages' });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    // ─── Fetch check types (active only) ─────────────────────────────
    const fetchCheckTypes = async () => {
        try {
            const res = await api.get('/checktypes');
            if (res.data.success) {
                setCheckTypeList(res.data.checkTypes
                    .map(c => ({ ...c, id: c._id }))
                    .filter(c => c.status === 'Active'));
            }
        } catch (error) {
            console.error('Fetch check types error:', error);
        }
    };

    // ─── Fetch sub-checks ────────────────────────────────────────────
    const fetchSubChecks = async () => {
        try {
            const res = await api.get('/subchecktypes');
            if (res.data.success) {
                setSubChecksData(res.data.subChecks.map(s => ({ ...s, id: s._id })));
            }
        } catch (error) {
            console.error('Fetch sub checks error:', error);
        }
    };

    useEffect(() => { fetchPackages(); fetchCheckTypes(); fetchSubChecks(); }, []);

    const filteredPackages = packages.filter(pkg => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query || pkg.name.toLowerCase().includes(query) || pkg.code.toLowerCase().includes(query);
        const matchesStatus = filters.status === 'all' || pkg.status.toLowerCase() === filters.status;
        const matchesType = filters.type === 'all' || (filters.type === 'global' ? pkg.isGlobal : !pkg.isGlobal);
        return matchesSearch && matchesStatus && matchesType;
    });

    const sortedPackages = [...filteredPackages].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedPackages.length / pageSize) || 1;
    const paginatedPackages = sortedPackages.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const stats = {
        total: packages.length,
        active: packages.filter(p => p.status === 'Active').length,
        global: packages.filter(p => p.isGlobal).length
    };

    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    const toggleSelectAll = () => setSelectedRows(prev => prev.length === paginatedPackages.length ? [] : paginatedPackages.map(p => p.id));
    const toggleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);

    const openCreateModal = () => {
        setEditingPackage(null);
        setFormData(getEmptyForm());
        setErrors({});
        setShowCreateModal(true);
    };

    const openEditModal = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            id: pkg.id,
            code: pkg.code || '',
            name: pkg.name || '',
            description: pkg.description || '',
            active: pkg.status === 'Active',
            checkComponents: (pkg.checkComponents || pkg.checks || []).map(code => ({
                checkType: typeof code === 'string' ? code : code.checkType,
                subType: typeof code === 'string' ? '' : (code.subType || ''),
                qty: typeof code === 'string' ? 1 : (code.qty || 1),
                slaDays: typeof code === 'string' ? '' : (code.slaDays ?? '')
            }))
        });
        setErrors({});
        setShowCreateModal(true);
    };

    const openViewModal = (pkg) => { setViewingPackage(pkg); setShowViewModal(true); };
    const closeCreateModal = () => { if (!isSubmitting) { setShowCreateModal(false); setEditingPackage(null); setFormData(getEmptyForm()); setErrors({}); } };
    const closeViewModal = () => { setShowViewModal(false); setViewingPackage(null); };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const e = {};
        if (!formData.name.trim()) e.name = 'Required';
        if (!formData.code.trim()) e.code = 'Required';
        if (!formData.checkComponents || formData.checkComponents.length === 0) e.checkComponents = 'Add at least one check';
        else if (formData.checkComponents.some(c => !c.checkType)) e.checkComponents = 'Please select a Check Type for all rows';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ─── Create / Update Package via API ─────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        // Enrich each component with names so the list/view can render without lookups
        const enrichedComponents = formData.checkComponents.map(c => {
            const ct = checkTypeList.find(x => x.code === c.checkType);
            const subList = subTypeOptions[c.checkType] || [];
            const sub = subList.find(s => s.value === c.subType);
            return {
                checkType: c.checkType,
                checkTypeName: ct?.name || '',
                subType: c.subType || '',
                subTypeName: sub?.label || '',
                qty: Number(c.qty) || 1,
                slaDays: c.slaDays === '' ? null : Number(c.slaDays)
            };
        });

        try {
            if (editingPackage) {
                const res = await api.put(`/packages/${editingPackage.id}`, {
                    name: formData.name,
                    description: formData.description,
                    active: formData.active,
                    isGlobal: editingPackage.isGlobal || false,
                    checkComponents: enrichedComponents
                });
                if (res.data.success) {
                    await fetchPackages();
                    setNotification({ type: 'success', message: 'Package updated successfully!' });
                }
            } else {
                const res = await api.post('/package/create', {
                    code: formData.code,
                    name: formData.name,
                    description: formData.description,
                    active: formData.active,
                    isGlobal: false,
                    checkComponents: enrichedComponents
                });
                if (res.data.success) {
                    await fetchPackages();
                    setNotification({ type: 'success', message: 'Package created successfully!' });
                }
            }
            closeCreateModal();
        } catch (error) {
            console.error('Submit package error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Operation failed' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // ─── Delete Package via API ──────────────────────────────────────
    const handleDeleteClick = async (id) => {
        if (!window.confirm('Delete this package?')) return;
        try {
            const res = await api.delete(`/packages/${id}`);
            if (res.data.success) {
                await fetchPackages();
                setNotification({ type: 'success', message: 'Deleted successfully!' });
            }
        } catch (error) {
            console.error('Delete package error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Delete failed' });
        } finally {
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const clearFilters = () => { setFilters({ status: 'all', type: 'all' }); setSearchQuery(''); };

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

                {/* Breadcrumb */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2.5 mb-5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-black transition-all active:scale-95"
                >
                    <IoArrowBackOutline size={20} />
                    <span>Back</span>
                </button>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-8 animate-fade-in-up">
                    <div className="lg:w-1/2">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                                <IoPricetagOutline size={24} className="text-[#00D4AA]" />
                            </div>
                            <h2 className="text-4xl font-bold text-black tracking-tight">Packages</h2>
                        </div>
                        <p className="text-gray-600 text-base leading-relaxed flex items-center gap-2">
                            <IoLayersOutline size={18} className="text-gray-400" />
                            Manage verification packages and assign check types
                        </p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        {[
                            { label: 'TOTAL', val: stats.total, color: 'text-[#00D4AA]', bc: 'border-[#00D4AA]/20', bg: 'bg-[#00D4AA]/5' },
                            { label: 'ACTIVE', val: stats.active, color: 'text-[#10B981]', bc: 'border-[#10B981]/20', bg: 'bg-[#10B981]/5' },
                            { label: 'GLOBAL', val: stats.global, color: 'text-[#F5A623]', bc: 'border-[#F5A623]/20', bg: 'bg-[#F5A623]/5' }
                        ].map((s, i) => (
                            <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${s.bc} ${s.bg}`}>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</span>
                                <span className={`text-2xl font-bold ${s.color} tracking-tight`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72 lg:w-80">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Code, Name..."
                                className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-black placeholder-gray-400 transition-all"
                            />
                        </div>
                        <div className="flex bg-white rounded-xl p-1 border border-gray-200">
                            <button onClick={() => setViewType('list')} className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#00D4AA] text-white' : 'text-gray-500 hover:text-black'}`}><IoListOutline size={20} /></button>
                            <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-[#00D4AA] text-white' : 'text-gray-500 hover:text-black'}`}><IoCardOutline size={20} /></button>
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2 ${Object.values(filters).some(val => val && val !== 'all') || searchQuery ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-white border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50'}`}
                        >
                            <IoFilterOutline size={18} /><span>Filter</span>
                        </button>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-white rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95"
                    >
                        <IoAddOutline size={18} /><span>Add Package</span>
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>
                        Loading packages...
                    </div>
                ) : (
                    <>
                        {viewType === 'list' && (
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50">
                                                <th className="p-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={paginatedPackages.length > 0 && selectedRows.length === paginatedPackages.length}
                                                        onChange={toggleSelectAll}
                                                        className="w-4 h-4 rounded border-gray-300 bg-white text-[#00D4AA] focus:ring-[#00D4AA]/30"
                                                    />
                                                </th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('code')}>
                                                    <div className="flex items-center gap-1">
                                                        Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}
                                                    </div>
                                                </th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase">Package Name</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-center">Checks</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-center">Type</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase">Status</th>
                                                <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedPackages.length > 0 ? paginatedPackages.map((pkg) => (
                                                <tr key={pkg.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                                                    <td className="p-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.includes(pkg.id)}
                                                            onChange={() => toggleSelectRow(pkg.id)}
                                                            className="w-4 h-4 rounded border-gray-300 bg-white text-[#00D4AA] focus:ring-[#00D4AA]/30"
                                                        />
                                                    </td>
                                                    <td className="p-5">
                                                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs font-mono text-[#00D4AA]">{pkg.code}</span>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="font-medium text-black text-sm">{pkg.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{pkg.description}</div>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <span className="inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-[#3B82F6]">
                                                            <IoCheckmarkDoneOutline size={14} className="text-gray-400" />
                                                            {pkg.checks.length}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        {pkg.isGlobal ?
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border border-[#F5A623]/20 text-[#F5A623] bg-[#F5A623]/10">
                                                                <IoGlobeOutline size={12} />Global
                                                            </span> :
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border border-[#3B82F6]/20 text-[#3B82F6] bg-[#3B82F6]/10">
                                                                <IoDocumentTextOutline size={12} />Standard
                                                            </span>
                                                        }
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${pkg.status === 'Active' ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                                                            <span className={`text-sm ${pkg.status === 'Active' ? 'text-[#10B981]' : 'text-gray-500'}`}>{pkg.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openViewModal(pkg)} className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all text-gray-500" title="View">
                                                                <IoEyeOutline size={18} />
                                                            </button>
                                                            <button onClick={() => openEditModal(pkg)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] transition-all text-gray-500" title="Edit">
                                                                <IoCreateOutline size={18} />
                                                            </button>
                                                            <button onClick={() => handleDeleteClick(pkg.id)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all text-gray-500" title="Delete">
                                                                <IoTrashOutline size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan={7} className="p-16 text-center text-gray-500">No packages found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>Page Size</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                            className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-black text-xs focus:outline-none"
                                        >
                                            {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">First</button>
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Prev</button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-[#00D4AA] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-black'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Next</button>
                                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Last</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewType === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                                {paginatedPackages.length > 0 ? paginatedPackages.map((pkg) => (
                                    <div key={pkg.id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-white border border-gray-200 flex items-center justify-center text-sm font-bold text-[#00D4AA]">
                                                    {pkg.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-black text-sm">{pkg.name}</h3>
                                                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{pkg.code}</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${pkg.status === 'Active' ? 'border-[#10B981]/20 text-[#10B981] bg-[#10B981]/10' : 'border-gray-300 text-gray-500 bg-gray-100'}`}>
                                                {pkg.status}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-4 line-clamp-2 flex-1">{pkg.description}</p>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[10px] text-[#3B82F6]">
                                                <IoCheckmarkDoneOutline size={10} />{pkg.checks.length} checks
                                            </span>
                                            {pkg.isGlobal && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#F5A623]/10 border border-[#F5A623]/20 text-[10px] text-[#F5A623]">
                                                    <IoGlobeOutline size={10} />Global
                                                </span>
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 flex justify-end items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openViewModal(pkg)} className="p-2 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-blue-600">
                                                <IoEyeOutline size={16} />
                                            </button>
                                            <button onClick={() => openEditModal(pkg)} className="p-2 rounded-lg bg-gray-100 hover:bg-[#00D4AA] hover:text-white transition-all text-[#00D4AA]">
                                                <IoCreateOutline size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(pkg.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white transition-all text-red-600">
                                                <IoTrashOutline size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )) : <div className="col-span-full p-16 text-center text-gray-500">No packages found.</div>}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* CREATE / EDIT MODAL (Table Format) */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && closeCreateModal()} />
                    <div className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-2xl font-bold text-black">{editingPackage ? 'Edit Package' : 'New Package'}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{editingPackage ? 'Update package' : 'Define a new verification package'}</p>
                            </div>
                            <button onClick={closeCreateModal} className="text-gray-400 hover:text-black p-2"><IoCloseOutline size={26} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                            {/* Package Info */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#00D4AA] pl-3">Package Info</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Package Code <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" name="code" required value={formData.code} onChange={handleFormChange}
                                            readOnly={!!editingPackage} placeholder="e.g., PKG - 001"
                                            className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${editingPackage ? 'opacity-50 cursor-not-allowed' : ''} ${errors.code ? 'border-red-300' : ''}`}
                                        />
                                        {errors.code && <p className="text-red-500 text-xs mt-1 ml-1">{errors.code}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1.5">Package Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" name="name" required value={formData.name} onChange={handleFormChange}
                                            placeholder="e.g., Standard Executive Package"
                                            className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.name ? 'border-red-300' : ''}`}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-black mb-1.5">Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Brief description of this package..." rows={3} className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* ★ STATUS TOGGLE (Active / Inactive) ★ */}
                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#10B981] pl-3">Status</h4>
                                <label className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.active ? 'border-[#10B981]/40 bg-[#10B981]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" name="active" checked={formData.active} onChange={handleFormChange} className="w-5 h-5 rounded border-gray-300 bg-white text-[#10B981] focus:ring-[#10B981]/30 cursor-pointer" />
                                        <div>
                                            <div className="text-sm font-medium text-black">{formData.active ? 'Active' : 'Inactive'}</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5">Make this package available for assignment to candidates</div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center flex-shrink-0 ${formData.active ? 'bg-[#10B981]' : 'bg-gray-200'}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-md mx-1 transition-transform duration-300 ${formData.active ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            </div>

                            {/* Check Components Table */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#3B82F6] pl-3">Check Components</h4>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, checkComponents: [...prev.checkComponents, { checkType: '', subType: '', qty: 1, slaDays: '' }] }))}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-medium hover:bg-[#3B82F6]/20 transition-all"
                                    >
                                        <IoAddOutline size={14} /> Add Check
                                    </button>
                                </div>

                                {errors.checkComponents && <p className="text-red-500 text-xs ml-1">{errors.checkComponents}</p>}

                                {formData.checkComponents?.length > 0 && (
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="grid grid-cols-12 gap-2 bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                                            <div className="col-span-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Check Type <span className="text-red-500">*</span></div>
                                            <div className="col-span-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sub Type</div>
                                            <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Qty</div>
                                            <div className="col-span-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">SLA Days</div>
                                            <div className="col-span-1"></div>
                                        </div>

                                        {formData.checkComponents.map((comp, index) => (
                                            <div key={index} className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-t border-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <div className="col-span-4">
                                                    <select value={comp.checkType} onChange={(e) => { const u = [...formData.checkComponents]; u[index] = { ...u[index], checkType: e.target.value, subType: '' }; setFormData(prev => ({ ...prev, checkComponents: u })); }} className="w-full bg-white border border-gray-200 focus:border-[#3B82F6] rounded-lg px-3 py-2 outline-none text-sm text-black transition-all cursor-pointer appearance-none">
                                                        <option value="">Select type</option>
                                                        {checkTypeList.map((c) => (<option key={c.code} value={c.code}>{c.name}</option>))}
                                                    </select>
                                                </div>
                                                <div className="col-span-3">
                                                    <select value={comp.subType} onChange={(e) => { const u = [...formData.checkComponents]; u[index] = { ...u[index], subType: e.target.value }; setFormData(prev => ({ ...prev, checkComponents: u })); }} disabled={!comp.checkType} className="w-full bg-white border border-gray-200 focus:border-[#3B82F6] rounded-lg px-3 py-2 outline-none text-sm text-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed appearance-none">
                                                        <option value="">Select sub type</option>
                                                        {comp.checkType && subTypeOptions[comp.checkType]?.map((sub) => (<option key={sub.value} value={sub.value}>{sub.label}</option>))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <input type="number" min="1" value={comp.qty} onChange={(e) => { const u = [...formData.checkComponents]; u[index] = { ...u[index], qty: Math.max(1, parseInt(e.target.value) || 1) }; setFormData(prev => ({ ...prev, checkComponents: u })); }} className="w-full bg-white border border-gray-200 focus:border-[#3B82F6] rounded-lg px-3 py-2 outline-none text-sm text-black text-center transition-all" />
                                                </div>
                                                <div className="col-span-2">
                                                    <input type="number" min="0" value={comp.slaDays} onChange={(e) => { const u = [...formData.checkComponents]; u[index] = { ...u[index], slaDays: e.target.value }; setFormData(prev => ({ ...prev, checkComponents: u })); }} placeholder="—" className="w-full bg-white border border-gray-200 focus:border-[#3B82F6] rounded-lg px-3 py-2 outline-none text-sm text-black text-center placeholder-gray-400 transition-all" />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, checkComponents: prev.checkComponents.filter((_, i) => i !== index) }))} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all" title="Remove check">
                                                        <IoTrashOutline size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {(!formData.checkComponents || formData.checkComponents.length === 0) && (
                                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-200 rounded-xl bg-white">
                                        <IoDocumentTextOutline size={32} className="text-gray-300 mb-3" />
                                        <p className="text-sm text-gray-500">No checks added yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Click "+ Add Check" to include verification checks</p>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500">{formData.checkComponents?.length || 0} check(s) in package</p>
                            </div>

                            <p className="text-xs text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button type="button" onClick={closeCreateModal} className="flex-1 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all" disabled={isSubmitting}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-[#00D4AA]/30 text-[#00D4AA]/50 cursor-not-allowed' : 'bg-[#00D4AA] text-white hover:bg-[#00F0C0] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)]'}`}>
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                    ) : (
                                        <>{editingPackage ? 'Update' : 'Create'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {showViewModal && viewingPackage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeViewModal} />
                    <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20">
                                    <IoPricetagOutline size={24} className="text-[#3B82F6]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-black">{viewingPackage.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{viewingPackage.code}</p>
                                </div>
                            </div>
                            <button onClick={closeViewModal} className="text-gray-400 hover:text-black p-2"><IoCloseOutline size={26} /></button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${viewingPackage.status === 'Active' ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                                <span className={`text-sm font-medium ${viewingPackage.status === 'Active' ? 'text-[#10B981]' : 'text-gray-500'}`}>{viewingPackage.status}</span>
                                {viewingPackage.isGlobal && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F5A623]/10 border border-[#F5A623]/20 text-[10px] text-[#F5A623]">
                                        <IoGlobeOutline size={10} />Global
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{viewingPackage.description}</p>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-[#00D4AA] pl-3">Included Checks ({(viewingPackage.checkComponents || viewingPackage.checks || []).length})</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {(viewingPackage.checkComponents && viewingPackage.checkComponents.length > 0
                                        ? viewingPackage.checkComponents
                                        : (viewingPackage.checks || []).map(code => ({ checkType: code }))
                                    ).map((comp, i) => {
                                        const code = comp.checkType;
                                        const name = comp.checkTypeName || checkTypeMap[code] || code;
                                        return (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="w-8 h-8 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center flex-shrink-0">
                                                    <IoCheckmarkDoneOutline size={14} className="text-[#00D4AA]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-black font-medium truncate">{name}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">
                                                        {code}{comp.subTypeName ? ` • ${comp.subTypeName}` : ''}{comp.qty ? ` • Qty ${comp.qty}` : ''}{comp.slaDays ? ` • ${comp.slaDays}d` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                                <span>Created: {viewingPackage.createdAt}</span>
                            </div>
                        </div>
                        <div className="px-8 py-4 border-t border-gray-100 flex gap-3">
                            <button onClick={closeViewModal} className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-sm">Close</button>
                            <button onClick={() => { closeViewModal(); openEditModal(viewingPackage); }} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-white font-bold text-sm hover:bg-[#00F0C0] transition-all">Edit Package</button>
                        </div>
                    </div>
                </div>
            )}

            {/* FILTER MODAL */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
                    <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl animate-fade-in-up p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2"><IoFilterOutline className="text-[#00D4AA]" />Filter</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-black"><IoCloseOutline size={24} /></button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['all', 'active', 'inactive'].map(s => (
                                        <button key={s} type="button" onClick={() => setFilters(prev => ({ ...prev, status: s }))} className={`py-3 rounded-lg text-xs font-medium capitalize ${filters.status === s ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Package Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['all', 'global', 'standard'].map(s => (
                                        <button key={s} type="button" onClick={() => setFilters(prev => ({ ...prev, type: s }))} className={`py-3 rounded-lg text-xs font-medium capitalize ${filters.type === s ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium"><IoRefreshOutline size={16} className="inline mr-1" />Clear</button>
                            <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-white font-bold text-sm">Apply</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default Packages;