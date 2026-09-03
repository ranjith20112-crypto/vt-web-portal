import React, { useState, useEffect, useRef } from 'react';
import {
    IoAddOutline,
    IoSearchOutline,
    IoFilterOutline,
    IoCloseOutline,
    IoEyeOutline,
    IoCreateOutline,
    IoTrashOutline,
    IoChevronDownOutline,
    IoChevronUpOutline,
    IoChevronBackOutline,
    IoChevronForwardOutline,
    IoSettingsOutline,
    IoBusinessOutline,
    IoPersonOutline,
    IoCallOutline,
    IoMailOutline,
    IoLocationOutline,
    IoGlobeOutline,
    IoCashOutline,
    IoToggleOutline,
    IoCheckmarkCircleOutline,
    IoAlertCircleOutline,
    IoSaveOutline,
    IoArrowBackOutline,
    IoGridOutline,
    IoListOutline,
    IoCardOutline,
    IoRefreshOutline,
    IoDocumentTextOutline,
    IoCubeOutline,
    IoCloudUploadOutline,
    IoLockClosedOutline,
    IoPersonAddOutline,
    IoPeopleOutline,
    IoBriefcaseOutline,
    IoGitBranchOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import Header from '../screens/header';
import api from '../apiroute/apiroute';

// ─── Floating Input Component (Extracted) ─────────────────────────────
const FloatingInput = ({
    label,
    name,
    type = 'text',
    required = false,
    icon: Icon,
    value,
    onChange,
    readOnly,
    helperText,
    focusedField,
    setFocusedField,
    hasError
}) => {
    const isFocused = focusedField === name;
    const hasValue = value && value.toString().length > 0;

    return (
        <div className="relative group">
            {Icon && (
                <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? 'text-[#00D4AA]' : 'text-slate-400'}`}>
                    <Icon size={20} />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                onFocus={() => setFocusedField(name)}
                onBlur={() => setFocusedField(null)}
                required={required}
                readOnly={readOnly}
                className={`w-full bg-white border ${hasError ? 'border-[#FF5252] focus:border-[#FF5252]' : 'border-slate-200 focus:border-[#00D4AA]'} text-slate-800 rounded-xl ${Icon ? 'px-12' : 'px-4'} py-4 outline-none transition-all duration-300 placeholder-transparent peer shadow-inner ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={label}
                id={name}
            />
            <label
                htmlFor={name}
                className={`absolute ${Icon ? 'left-12' : 'left-4'} transition-all duration-300 pointer-events-none
${hasValue || isFocused
                        ? '-top-2.5 left-3 text-xs text-[#00D4AA] bg-white px-2 rounded border border-slate-200'
                        : 'top-4 text-slate-400 bg-transparent'
                    }`}
            >
                {label} {required && <span className="text-[#FF5252]">*</span>}
            </label>
            {hasError && (
                <p className="mt-1.5 text-xs text-[#FF5252] flex items-center gap-1">
                    <IoAlertCircleOutline size={12} /> {hasError}
                </p>
            )}
            {!hasError && helperText && (
                <p className="mt-1.5 text-[11px] text-slate-400 pl-1">{helperText}</p>
            )}
        </div>
    );
};

// ─── Section Header ──────────────────────────────────────
const SectionHeader = ({ title, color }) => (
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 pl-3" style={{ borderColor: color }}>
        {title}
    </h4>
);

// ─── Vendor Table Page (Dark Navy Theme) ──────────────────
const Vendorcreation = () => {
    const navigate = useNavigate();

    // ── State ────────────────────────────────────────────────
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: 'All',
        type: 'All',
        company: 'All'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewType, setViewType] = useState('list');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState(getEmptyForm());
    const [serviceInput, setServiceInput] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [saving, setSaving] = useState(false);
    const modalRef = useRef(null);

    // ── Fetch vendors from API ───────────────────────────────
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vendors');
            if (res.data?.success) {
                setVendors(res.data.vendors || []);
            } else {
                setVendors([]);
            }
        } catch (error) {
            console.error('Fetch Vendors Error:', error);
            setNotification({ type: 'error', message: 'Failed to load vendors' });
            setTimeout(() => setNotification(null), 3000);
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    // ── Helpers ──────────────────────────────────────────────
    function getEmptyForm() {
        return {
            id: null,
            code: '',
            company: '',
            type: 'Domestic',
            areaZone: '',
            pincode: '',
            zipcodeCoverage: '',
            contact: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            rate: '',
            status: 'Active',
            gstin: '',
            pan: '',
            portalEnabled: false,
            portalEmail: '',
            portalPassword: '',
            services: []
        };
    }

    const statusColors = {
        Active: { bg: 'bg-[#00D4AA]/15', text: 'text-[#00D4AA]', border: 'border-[#00D4AA]/30', dot: 'bg-[#00D4AA]' },
        Inactive: { bg: 'bg-[#4A5C6E]/20', text: 'text-slate-500', border: 'border-[#4A5C6E]/30', dot: 'bg-[#4A5C6E]' },
        Suspended: { bg: 'bg-[#F5A623]/15', text: 'text-[#F5A623]', border: 'border-[#F5A623]/30', dot: 'bg-[#F5A623]' },
    };

    const typeIcons = {
        Domestic: '🏠',
        International: '🌍'
    };

    const areaZoneOptions = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone', 'All Zones'];

    // ── Derive unique company list for filter dropdown ──────
    const uniqueCompanies = [...new Set(vendors.map(v => v.company).filter(Boolean))].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // ── Filtering & Sorting ─────────────────────────────────
    const filteredVendors = vendors.filter(v => {
        const matchesSearch = !searchQuery ||
            (v.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.contact || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filters.status === 'All' || v.status === filters.status;
        const matchesType = filters.type === 'All' || v.type === filters.type;
        const matchesCompany = filters.company === 'All' || v.company === filters.company;
        return matchesSearch && matchesStatus && matchesType && matchesCompany;
    });

    const sortedVendors = [...filteredVendors].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedVendors.length / pageSize) || 1;
    const paginatedVendors = sortedVendors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // ── Handlers ─────────────────────────────────────────────
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === paginatedVendors.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedVendors.map(v => v._id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };

    // ── Modal Handlers ───────────────────────────────────────
    const openAddModal = () => {
        setEditingVendor(null);
        setFormData(getEmptyForm());
        setErrors({});
        setServiceInput('');
        setFocusedField(null);
        setShowModal(true);
    };

    const openEditModal = (vendor) => {
        setEditingVendor(vendor);
        setFormData({
            ...getEmptyForm(),
            ...vendor,
            rate: (vendor.rate || '').replace(/[₹$,\s]/g, ''),
            areaZone: vendor.type === 'Domestic'
                ? (vendor.areaZone || (areaZoneOptions.includes(vendor.coverage) ? vendor.coverage : ''))
                : '',
            zipcodeCoverage: vendor.type === 'International'
                ? (vendor.zipcodeCoverage || vendor.coverage || '')
                : '',
            portalEnabled: vendor.portalEnabled || false,
            portalEmail: vendor.portalEmail || '',
            portalPassword: '' // never prefill hashed password; blank = keep existing
        });
        setErrors({});
        setServiceInput('');
        setFocusedField(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVendor(null);
        setFormData(getEmptyForm());
        setErrors({});
        setFocusedField(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleStatusChange = (status) => setFormData(prev => ({ ...prev, status }));
    const handleTypeChange = (type) => setFormData(prev => ({ ...prev, type, areaZone: '', zipcodeCoverage: '' }));

    const addService = () => {
        if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
            setFormData(prev => ({ ...prev, services: [...prev.services, serviceInput.trim()] }));
            setServiceInput('');
        }
    };

    const removeService = (index) => {
        setFormData(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.code.trim()) newErrors.code = 'Vendor code is required';

        const codeExists = vendors.some(v =>
            (v.code || '').toLowerCase() === formData.code.trim().toLowerCase() &&
            v._id !== (editingVendor?._id || null)
        );
        if (codeExists) newErrors.code = 'Vendor code already exists';

        if (!formData.company.trim()) newErrors.company = 'Company name is required';

        if (formData.type === 'Domestic') {
            if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        } else {
            if (!formData.zipcodeCoverage.trim()) newErrors.zipcodeCoverage = 'Zipcode coverage is required';
        }

        if (formData.portalEnabled) {
            if (!formData.portalEmail.trim()) {
                newErrors.portalEmail = 'Portal email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.portalEmail)) {
                newErrors.portalEmail = 'Invalid portal email format';
            }
            // On create, password required. On edit, blank means "keep existing".
            if (!editingVendor && !formData.portalPassword.trim()) {
                newErrors.portalPassword = 'Portal password is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);

        const payload = {
            ...formData,
            // backend derives `coverage`, but send it too for safety
            coverage: formData.type === 'Domestic' ? formData.areaZone : formData.zipcodeCoverage
        };

        try {
            if (editingVendor) {
                const res = await api.put(`/vendors/${editingVendor._id}`, payload);
                if (res.data?.success) {
                    setNotification({ type: 'success', message: 'Vendor updated successfully!' });
                    await fetchVendors();
                    closeModal();
                } else {
                    setNotification({ type: 'error', message: res.data?.message || 'Update failed' });
                }
            } else {
                const res = await api.post('/vendor/register', payload);
                if (res.data?.success) {
                    setNotification({ type: 'success', message: 'Vendor created successfully!' });
                    await fetchVendors();
                    closeModal();
                } else {
                    setNotification({ type: 'error', message: res.data?.message || 'Create failed' });
                }
            }
        } catch (error) {
            console.error('Save Vendor Error:', error);
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Something went wrong while saving'
            });
        } finally {
            setSaving(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                const res = await api.delete(`/vendors/${id}`);
                if (res.data?.success) {
                    setNotification({ type: 'success', message: 'Vendor deleted successfully!' });
                    await fetchVendors();
                } else {
                    setNotification({ type: 'error', message: res.data?.message || 'Delete failed' });
                }
            } catch (error) {
                console.error('Delete Vendor Error:', error);
                setNotification({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to delete vendor'
                });
            } finally {
                setTimeout(() => setNotification(null), 3000);
            }
        }
    };

    // ── Click outside to close modal ─────────────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                closeModal();
            }
        };
        if (showModal) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showModal]);

    // ── Render ───────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f8fefd] text-slate-800 font-sans selection:bg-[#00D4AA]/30 selection:text-[#00D4AA]">
            <Header showNavigation={false} />

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-20 right-6 z-50 px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in border
${notification.type === 'success' ? 'bg-white border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-white border-[#EF4444]/30 text-[#EF4444]'}`}>
                    {notification.type === 'success' ? <IoCheckmarkCircleOutline size={20} /> : <IoAlertCircleOutline size={20} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-slate-800">
                        <IoCloseOutline size={16} />
                    </button>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-8 py-12">

                {/* Back Button */}
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 transition-all active:scale-95"
                    >
                        <IoArrowBackOutline size={20} />
                        <span>Back</span>
                    </button>
                </div>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8 animate-fade-in-up">
                    <div className="md:w-1/2">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                                <IoBusinessOutline size={24} className="text-[#00D4AA]" />
                            </div>
                            <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Vendor Master</h2>
                        </div>
                        <p className="text-slate-500 text-base leading-relaxed flex items-center gap-2">
                            <IoGridOutline size={18} className="text-slate-400" />
                            Manage field verification agencies, rates, and service coverage.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72 lg:w-80">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Code, Company, Contact..."
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all"
                            />
                        </div>

                        <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                            <button onClick={() => setViewType('list')} className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#00D4AA] text-[#060D1B]' : 'text-slate-500 hover:text-slate-800'}`}>
                                <IoListOutline size={20} />
                            </button>
                            <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-[#00D4AA] text-[#060D1B]' : 'text-slate-500 hover:text-slate-800'}`}>
                                <IoCardOutline size={20} />
                            </button>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2
${Object.values(filters).some(val => val && val !== 'All') || searchQuery ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                        >
                            <IoFilterOutline size={18} />
                            <span>Filter</span>
                            {(filters.status !== 'All' || filters.type !== 'All' || filters.company !== 'All') && (
                                <span className="w-2 h-2 rounded-full bg-[#00D4AA]"></span>
                            )}
                        </button>

                        <button
                            onClick={openAddModal}
                            className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-[#060D1B] rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95 overflow-hidden"
                        >
                            <IoAddOutline size={18} className="relative z-10" />
                            <span className="relative z-10">Add Vendor</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'TOTAL VENDORS', val: vendors.length, color: 'text-[#00D4AA]' },
                        { label: 'ACTIVE', val: vendors.filter(v => v.status === 'Active').length, color: 'text-[#10B981]' },
                        { label: 'DOMESTIC', val: vendors.filter(v => v.type === 'Domestic').length, color: 'text-[#3B82F6]' },
                        { label: 'INTERNATIONAL', val: vendors.filter(v => v.type === 'International').length, color: 'text-[#818CF8]' }
                    ].map((stat, i) => (
                        <div key={i} className="group relative p-6 rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all hover:border-slate-300 hover:shadow-lg">
                            <div className="relative flex flex-col items-start justify-between h-full gap-2">
                                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">{stat.label}</div>
                                <div className={`text-5xl font-bold ${stat.color} tracking-tighter`}>{stat.val}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Status Filter */}
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold mb-3 block">Status</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['All', 'Active', 'Inactive', 'Suspended'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => { setFilters(prev => ({ ...prev, status: s })); setCurrentPage(1); }}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border
${filters.status === s
                                                    ? s === 'Active' ? 'bg-[#00D4AA]/20 border-[#00D4AA]/40 text-[#00D4AA]'
                                                        : s === 'Inactive' ? 'bg-[#4A5C6E]/20 border-[#4A5C6E]/40 text-slate-500'
                                                            : s === 'Suspended' ? 'bg-[#F5A623]/20 border-[#F5A623]/40 text-[#F5A623]'
                                                                : 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]'
                                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-500'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold mb-3 block">Type</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['All', 'Domestic', 'International'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => { setFilters(prev => ({ ...prev, type: t })); setCurrentPage(1); }}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border
${filters.type === t
                                                    ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]'
                                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-500'
                                                }`}
                                        >
                                            {t === 'Domestic' ? '🏠 ' : t === 'International' ? '🌍 ' : ''}{t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Company Filter */}
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold mb-3 block">Company</label>
                                <div className="relative">
                                    <IoBusinessOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    <select
                                        value={filters.company}
                                        onChange={(e) => { setFilters(prev => ({ ...prev, company: e.target.value })); setCurrentPage(1); }}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 focus:border-[#00D4AA]/50 rounded-lg pl-9 pr-10 py-2.5 text-xs text-slate-800 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="All">All Companies</option>
                                        {uniqueCompanies.map((company, idx) => (
                                            <option key={idx} value={company}>{company}</option>
                                        ))}
                                    </select>
                                    <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                                <button
                                    onClick={() => { setFilters({ status: 'All', type: 'All', company: 'All' }); setSearchQuery(''); setCurrentPage(1); }}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-400 hover:text-[#00D4AA] transition-colors"
                                >
                                    <IoRefreshOutline size={14} />
                                    Clear all filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-slate-500">
                        <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>
                        Loading vendors...
                    </div>
                ) : (
                    <>
                        {/* LIST VIEW */}
                        {viewType === 'list' && (
                            <div className="bg-white/70 border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl animate-fade-in-up">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                                <th className="p-5">
                                                    <input type="checkbox" checked={paginatedVendors.length > 0 && selectedRows.length === paginatedVendors.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-[#00D4AA] focus:ring-[#00D4AA]/30" />
                                                </th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('code')}>
                                                    <div className="flex items-center gap-1">Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div>
                                                </th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('company')}>
                                                    <div className="flex items-center gap-1">Company {sortConfig.key === 'company' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div>
                                                </th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Type</th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Coverage</th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Contact</th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Phone</th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('rate')}>
                                                    <div className="flex items-center gap-1">Rate/V. {sortConfig.key === 'rate' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div>
                                                </th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Status</th>
                                                <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedVendors.length > 0 ? (
                                                paginatedVendors.map((vendor) => {
                                                    const statusStyle = statusColors[vendor.status] || statusColors.Inactive;
                                                    return (
                                                        <tr key={vendor._id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
                                                            <td className="p-5"><input type="checkbox" checked={selectedRows.includes(vendor._id)} onChange={() => toggleSelectRow(vendor._id)} className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-[#00D4AA] focus:ring-[#00D4AA]/30" /></td>
                                                            <td className="p-5"><span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-[#00D4AA]">{vendor.code}</span></td>
                                                            <td className="p-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-[#00D4AA] overflow-hidden">{vendor.company?.charAt(0)}</div>
                                                                    <div>
                                                                        <div className="font-medium text-slate-800 text-sm">{vendor.company}</div>
                                                                        <div className="text-xs text-slate-400 mt-0.5">{vendor.email || vendor.contact}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-5">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${vendor.type === 'Domestic' ? 'bg-[#00D4AA]/10 border-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#818CF8]/10 border-[#818CF8]/20 text-[#818CF8]'}`}>{typeIcons[vendor.type]} {vendor.type}</span>
                                                            </td>
                                                            <td className="p-5 text-sm text-slate-500">{vendor.coverage || '—'}</td>
                                                            <td className="p-5 text-sm text-slate-800">{vendor.contact || '—'}</td>
                                                            <td className="p-5 text-sm text-slate-500">{vendor.phone || '—'}</td>
                                                            <td className="p-5"><span className="text-sm font-mono font-semibold text-[#F5A623]">{vendor.rate}</span></td>
                                                            <td className="p-5">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>{vendor.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-5 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => openEditModal(vendor)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] transition-all text-slate-400"><IoCreateOutline size={18} /></button>
                                                                    <button onClick={() => handleDelete(vendor._id)} className="p-2 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] transition-all text-slate-400"><IoTrashOutline size={18} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr><td colSpan={10} className="p-16 text-center text-slate-500">No vendors found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span>Page Size</span>
                                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-[#00D4AA]/50">
                                            {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30">First</button>
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30">Prev</button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-[#00D4AA] text-[#060D1B]' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800'}`}>{i + 1}</button>
                                        ))}
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30">Next</button>
                                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30">Last</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GRID VIEW */}
                        {viewType === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                                {paginatedVendors.length > 0 ? (
                                    paginatedVendors.map((vendor) => {
                                        const statusStyle = statusColors[vendor.status] || statusColors.Inactive;
                                        return (
                                            <div key={vendor._id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-200 to-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-[#00D4AA] overflow-hidden">{vendor.company?.charAt(0)}</div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-800 text-sm">{vendor.company}</h3>
                                                            <p className="text-xs text-slate-400 font-mono">{vendor.code}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>{vendor.status}</span>
                                                </div>
                                                <div className="space-y-4 mb-6 flex-1">
                                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${vendor.type === 'Domestic' ? 'bg-[#00D4AA]/10 border-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#818CF8]/10 border-[#818CF8]/20 text-[#818CF8]'}`}>{typeIcons[vendor.type]} {vendor.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500"><IoLocationOutline size={16} className="text-slate-400" /> {vendor.coverage || '—'}</div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500"><IoPersonOutline size={16} className="text-slate-400" /> {vendor.contact || '—'}</div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 truncate"><IoMailOutline size={16} className="text-slate-400" /> {vendor.email || '—'}</div>
                                                    <div className="flex items-center gap-3 text-xs text-[#F5A623] font-mono font-semibold"><IoCashOutline size={16} /> {vendor.rate}</div>
                                                </div>
                                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(vendor)} className="text-xs font-medium text-[#00D4AA] hover:text-[#00F0C0] flex items-center gap-1">Edit <IoCreateOutline size={14} /></button>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openEditModal(vendor)} className="p-2 rounded-lg bg-slate-50 hover:bg-[#00D4AA] hover:text-[#060D1B] transition-all text-[#00D4AA]"><IoCreateOutline size={16} /></button>
                                                        <button onClick={() => handleDelete(vendor._id)} className="p-2 rounded-lg bg-slate-50 hover:bg-[#FF5252] hover:text-slate-800 transition-all text-[#FF5252]"><IoTrashOutline size={16} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full p-16 text-center text-slate-500">No vendors found.</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#060D1B]/90 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
                    <div ref={modalRef} className="relative w-full max-w-4xl bg-white/95 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                                    <IoBusinessOutline size={20} className="text-[#00D4AA]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{editingVendor ? 'Edit Vendor' : 'New Vendor'}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{editingVendor ? 'Update Vendor Details' : 'Register New Agency'}</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="text-slate-500 hover:text-slate-800 p-2"><IoCloseOutline size={26} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            {/* COMPANY INFO */}
                            <div className="space-y-6">
                                <SectionHeader title="Company Information" color="#00D4AA" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FloatingInput label="Vendor Code" name="code" required icon={IoBusinessOutline} value={formData.code} onChange={handleFormChange} readOnly={!!editingVendor} focusedField={focusedField} setFocusedField={setFocusedField} hasError={errors.code} />
                                    <FloatingInput label="Company Name" name="company" required icon={IoBusinessOutline} value={formData.company} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} hasError={errors.company} />

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-3">VENDOR TYPE *</label>
                                        <div className="flex gap-2">
                                            {['Domestic', 'International'].map(t => (
                                                <button key={t} type="button" onClick={() => handleTypeChange(t)} className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all duration-300 ${formData.type === t ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:text-slate-800'}`}>
                                                    {t === 'Domestic' ? '🏠 ' : '🌍 '}{t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.type === 'Domestic' ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-3">LOCAL AREA/ZONE COVERAGE</label>
                                                <div className="relative">
                                                    <IoLocationOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                                    <select name="areaZone" value={formData.areaZone || ''} onChange={handleFormChange} className={`w-full appearance-none bg-white border ${errors.areaZone ? 'border-[#FF5252]' : 'border-slate-200 focus:border-[#00D4AA]'} text-slate-800 rounded-xl pl-12 pr-10 py-4 outline-none transition-all duration-300 text-sm cursor-pointer shadow-inner`}>
                                                        <option value="">Select Area / Zone</option>
                                                        {areaZoneOptions.map(z => <option key={z} value={z}>{z}</option>)}
                                                    </select>
                                                    <IoChevronDownOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                                {errors.areaZone && <p className="mt-1.5 text-xs text-[#FF5252] flex items-center gap-1"><IoAlertCircleOutline size={12} /> {errors.areaZone}</p>}
                                            </div>
                                            <FloatingInput label="Pincode" name="pincode" required icon={IoLocationOutline} value={formData.pincode} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} hasError={errors.pincode} helperText="e.g. 600001" />
                                        </>
                                    ) : (
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 mb-3">ZIPCODE-BASED COVERAGE</label>
                                            <FloatingInput label="Zipcode Coverage" name="zipcodeCoverage" required icon={IoLocationOutline} value={formData.zipcodeCoverage} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} hasError={errors.zipcodeCoverage} helperText="e.g. 10001, 90210, 600001" />
                                        </div>
                                    )}

                                    <FloatingInput label="Rate/Visit (₹)" name="rate" type="number" icon={IoCashOutline} value={formData.rate} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                    <FloatingInput label="GSTIN" name="gstin" icon={IoDocumentTextOutline} value={formData.gstin} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                    <FloatingInput label="PAN" name="pan" icon={IoDocumentTextOutline} value={formData.pan} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                </div>
                            </div>

                            {/* CONTACT INFO */}
                            <div className="space-y-6">
                                <SectionHeader title="Contact Information" color="#3B82F6" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FloatingInput label="Contact Person" name="contact" icon={IoPersonOutline} value={formData.contact} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                    <FloatingInput label="Email Address" name="email" type="email" icon={IoMailOutline} value={formData.email} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                    <FloatingInput label="Phone Number" name="phone" type="tel" icon={IoCallOutline} value={formData.phone} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                </div>
                            </div>

                            {/* ADDRESS */}
                            <div className="space-y-6">
                                <SectionHeader title="Address Details" color="#F5A623" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <FloatingInput label="Street Address" name="address" icon={IoLocationOutline} value={formData.address} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                    </div>
                                    <FloatingInput label="City" name="city" icon={IoLocationOutline} value={formData.city} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                    <FloatingInput label="State" name="state" icon={IoLocationOutline} value={formData.state} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                    <FloatingInput label="Country" name="country" icon={IoGlobeOutline} value={formData.country} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                                </div>
                            </div>

                            {/* STATUS */}
                            <div className="space-y-6">
                                <SectionHeader title="Status" color="#00D4AA" />
                                <div className="flex gap-2">
                                    {['Active', 'Inactive', 'Suspended'].map(s => (
                                        <button key={s} type="button" onClick={() => handleStatusChange(s)} className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all duration-300 ${formData.status === s ? (s === 'Active' ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.1)]' : s === 'Inactive' ? 'border-[#4A5C6E] bg-[#4A5C6E]/10 text-slate-500' : 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623] shadow-[0_0_15px_rgba(245,166,35,0.1)]') : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:text-slate-800'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>

                            {/* VENDOR PORTAL ACCESS */}
                            <div className="space-y-6">
                                <SectionHeader title="Vendor Portal Access" color="#818CF8" />
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-3">ENABLE PORTAL LOGIN FOR VENDOR *</label>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, portalEnabled: !prev.portalEnabled }))} className={`relative w-14 h-7 rounded-full transition-all duration-300 ${formData.portalEnabled ? 'bg-[#00D4AA]' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${formData.portalEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </button>
                                        <span className="text-sm text-slate-500 font-medium">{formData.portalEnabled ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                </div>
                                {formData.portalEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                        <FloatingInput label="Portal Email" name="portalEmail" type="email" required icon={IoMailOutline} value={formData.portalEmail} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} hasError={errors.portalEmail} helperText="Login Email" />
                                        <FloatingInput label="Portal Password" name="portalPassword" type="password" required={!editingVendor} icon={IoLockClosedOutline} value={formData.portalPassword} onChange={handleFormChange} focusedField={focusedField} setFocusedField={setFocusedField} hasError={errors.portalPassword} helperText={editingVendor ? 'Leave blank to keep existing password' : 'Set password for vendor'} />
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-slate-400">Fields marked with <span className="text-[#FF5252]">*</span> are required</p>

                            {/* ACTIONS */}
                            <div className="flex gap-4 pt-6 border-t border-slate-100 sticky bottom-0 bg-white/95">
                                <button type="button" onClick={closeModal} className="flex-1 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm transition-all" disabled={saving}>Cancel</button>
                                <button type="submit" disabled={saving} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${saving ? 'bg-[#00D4AA]/30 text-[#00D4AA]/50 cursor-not-allowed' : 'bg-[#00D4AA] text-[#060D1B] hover:bg-[#00F0C0] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] active:scale-[0.98]'}`}>
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-[#060D1B] border-t-transparent animate-spin rounded-full"></div>
                                    ) : (
                                        <>
                                            <IoSaveOutline size={18} />
                                            {editingVendor ? 'Update Vendor' : 'Create Vendor'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
 @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
 .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
 @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
 .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
 select option { background: #ffffff; color: #1e293b; }
 `}</style>
        </div>
    );
};

export default Vendorcreation;