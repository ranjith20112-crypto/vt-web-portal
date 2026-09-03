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
    IoCloudUploadOutline,
    IoArrowBackOutline,
    IoDocumentTextOutline,
    IoLayersOutline,
    IoHomeOutline,
    IoEyeOutline,
    IoSettingsOutline,
    IoPricetagOutline,
    IoCheckmarkDoneOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import Header from '../screens/header';

const DocumentTypes = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [docTypes, setDocTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [viewingDoc, setViewingDoc] = useState(null);
    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState(getEmptyForm());
    const [selectedFile, setSelectedFile] = useState(null);

    const mockDocTypes = [
        { id: 1, code: 'AADHAR', name: 'Aadhar Card', category: 'Identity', sortOrder: 1, maxFileSize: 5, active: true, isMandatory: true, createdAt: '2024-01-15' },
        { id: 2, code: 'PAN', name: 'PAN Card', category: 'Identity', sortOrder: 2, maxFileSize: 5, active: true, isMandatory: true, createdAt: '2024-01-16' },
        { id: 3, code: 'PASSPORT', name: 'Passport', category: 'Identity', sortOrder: 3, maxFileSize: 10, active: true, isMandatory: false, createdAt: '2024-01-20' },
        { id: 4, code: 'DL', name: 'Driving License', category: 'Identity', sortOrder: 4, maxFileSize: 5, active: true, isMandatory: false, createdAt: '2024-02-10' },
        { id: 5, code: 'SSC_MARKSHEET', name: 'SSC Marksheet', category: 'Education', sortOrder: 5, maxFileSize: 5, active: true, isMandatory: true, createdAt: '2024-02-15' },
        { id: 6, code: 'HSC_MARKSHEET', name: 'HSC/Diploma Marksheet', category: 'Education', sortOrder: 6, maxFileSize: 5, active: true, isMandatory: true, createdAt: '2024-02-20' },
        { id: 7, code: 'GRADUATION', name: 'Graduation Degree', category: 'Education', sortOrder: 7, maxFileSize: 10, active: true, isMandatory: false, createdAt: '2024-03-05' },
        { id: 8, code: 'SLIP_PREV', name: 'Previous Company Slip', category: 'Employment', sortOrder: 8, maxFileSize: 5, active: true, isMandatory: true, createdAt: '2024-03-10' },
        { id: 9, code: 'EXP_LETTER', name: 'Experience Letter', category: 'Employment', sortOrder: 9, maxFileSize: 10, active: true, isMandatory: false, createdAt: '2024-03-15' },
        { id: 10, code: 'BANK_STMT', name: 'Bank Statement', category: 'Address', sortOrder: 10, maxFileSize: 10, active: true, isMandatory: false, createdAt: '2024-04-01' },
        { id: 11, code: 'UTILITY_BILL', name: 'Utility Bill', category: 'Address', sortOrder: 11, maxFileSize: 5, active: true, isMandatory: false, createdAt: '2024-04-10' },
        { id: 12, code: 'PASSPORT_PHOTO', name: 'Passport Size Photo', category: 'Other', sortOrder: 12, maxFileSize: 2, active: true, isMandatory: true, createdAt: '2024-04-15' },
    ];

    const categories = ['Identity', 'Education', 'Employment', 'Address', 'Other', 'Criminal', 'Health'];

    useEffect(() => {
        setTimeout(() => {
            setDocTypes(mockDocTypes);
            setLoading(false);
        }, 600);
    }, []);

    function getEmptyForm() {
        return { id: null, code: '', name: '', category: '', sortOrder: 1, maxFileSize: 5, active: true };
    }

    const stats = {
        total: docTypes.length,
        active: docTypes.filter(d => d.active).length,
        mandatory: docTypes.filter(d => d.isMandatory).length
    };

    const filteredDocs = docTypes.filter(doc => {
        const query = searchQuery.toLowerCase();
        return !query || doc.name.toLowerCase().includes(query) || doc.code.toLowerCase().includes(query) || doc.category.toLowerCase().includes(query);
    });

    const sortedDocs = [...filteredDocs].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedDocs.length / pageSize) || 1;
    const paginatedDocs = sortedDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const openCreateModal = () => {
        setEditingDoc(null);
        setFormData(getEmptyForm());
        setSelectedFile(null);
        setErrors({});
        setShowCreateModal(true);
    };

    const openEditModal = (doc) => {
        setEditingDoc(doc);
        setFormData({ id: doc.id, code: doc.code, name: doc.name, category: doc.category, sortOrder: doc.sortOrder, maxFileSize: doc.maxFileSize, active: doc.active });
        setSelectedFile(null);
        setErrors({});
        setShowCreateModal(true);
    };

    const openViewModal = (doc) => {
        setViewingDoc(doc);
        setShowViewModal(true);
    };

    const closeCreateModal = () => {
        if (!isSubmitting) {
            setShowCreateModal(false);
            setEditingDoc(null);
            setSelectedFile(null);
        }
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewingDoc(null);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const validateForm = () => {
        const e = {};
        if (!formData.code.trim()) e.code = 'Required';
        if (!formData.name.trim()) e.name = 'Required';
        if (!formData.category) e.category = 'Required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        setTimeout(() => {
            if (editingDoc) {
                setDocTypes(prev => prev.map(d => d.id === editingDoc.id ? { ...d, ...formData } : d));
                setNotification({ type: 'success', message: 'Document type updated successfully!' });
            } else {
                const newId = Math.max(...docTypes.map(d => d.id), 0) + 1;
                setDocTypes(prev => [...prev, { ...formData, id: newId, isMandatory: false, createdAt: new Date().toISOString().split('T')[0] }]);
                setNotification({ type: 'success', message: 'Document type created successfully!' });
            }
            setIsSubmitting(false);
            closeCreateModal();
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Delete this document type?')) {
            setDocTypes(prev => prev.filter(d => d.id !== id));
            setNotification({ type: 'success', message: 'Deleted successfully!' });
            setTimeout(() => setNotification(null), 3000);
        }
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
                                <IoDocumentTextOutline size={24} className="text-[#00D4AA]" />
                            </div>
                            <h2 className="text-4xl font-bold text-black tracking-tight">Document Types</h2>
                        </div>
                        <p className="text-gray-600 text-base leading-relaxed flex items-center gap-2">
                            <IoLayersOutline size={18} className="text-gray-400" />
                            Manage required document types for verifications
                        </p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        {[
                            { label: 'TOTAL', val: stats.total, color: 'text-[#00D4AA]', bc: 'border-[#00D4AA]/20', bg: 'bg-[#00D4AA]/5' },
                            { label: 'ACTIVE', val: stats.active, color: 'text-[#10B981]', bc: 'border-[#10B981]/20', bg: 'bg-[#10B981]/5' },
                            { label: 'MANDATORY', val: stats.mandatory, color: 'text-[#F5A623]', bc: 'border-[#F5A623]/20', bg: 'bg-[#F5A623]/5' }
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
                    <div className="relative flex-1 md:w-72 lg:w-80">
                        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            placeholder="Search Code, Name, Category..."
                            className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-black placeholder-gray-400 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="group flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium text-sm transition-all hover:text-black hover:bg-gray-50">
                            <IoSettingsOutline size={18} /><span>Settings</span>
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-white rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95"
                        >
                            <IoAddOutline size={18} /><span>Add Doc Type</span>
                        </button>
                    </div>
                </div>

                {/* Content Table */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>
                        Loading document types...
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('id')}>
                                            <div className="flex items-center gap-1">ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div>
                                        </th>
                                        <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('code')}>
                                            <div className="flex items-center gap-1">Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div>
                                        </th>
                                        <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div>
                                        </th>
                                        <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-center">Category</th>
                                        <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-center">Sort</th>
                                        <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase">Status</th>
                                        <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDocs.length > 0 ? paginatedDocs.map((doc) => (
                                        <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                                            <td className="p-5 text-sm text-gray-500 font-mono">{doc.id}</td>
                                            <td className="p-5">
                                                <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs font-mono text-[#00D4AA]">{doc.code}</span>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-medium text-black text-sm">{doc.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">Max: {doc.maxFileSize}MB</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border border-[#3B82F6]/20 text-[#3B82F6] bg-[#3B82F6]/10">
                                                    {doc.category}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center text-sm font-mono text-gray-500">{doc.sortOrder}</td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${doc.active ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                                                    <span className={`text-sm ${doc.active ? 'text-[#10B981]' : 'text-gray-500'}`}>{doc.active ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openViewModal(doc)} className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all text-gray-500" title="View"><IoEyeOutline size={18} /></button>
                                                    <button onClick={() => openEditModal(doc)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] transition-all text-gray-500" title="Edit"><IoCreateOutline size={18} /></button>
                                                    <button onClick={() => handleDeleteClick(doc.id)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all text-gray-500" title="Delete"><IoTrashOutline size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="p-16 text-center text-gray-500">No document types found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Page Size</span>
                                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-black text-xs focus:outline-none">
                                    {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">First</button>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Prev</button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-[#00D4AA] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-black'}`}>{i + 1}</button>
                                ))}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Next</button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30">Last</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* CREATE / EDIT MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && closeCreateModal()} />
                    <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-2xl font-bold text-black">{editingDoc ? 'Edit Document Type' : 'New Document Type'}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{editingDoc ? 'Update document type details' : 'Define a new required document'}</p>
                            </div>
                            <button onClick={closeCreateModal} className="text-gray-400 hover:text-black p-2"><IoCloseOutline size={26} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1.5">Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" name="code" required value={formData.code} onChange={handleFormChange}
                                        readOnly={!!editingDoc} placeholder="e.g., AADHAR, PAN"
                                        className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${editingDoc ? 'opacity-50 cursor-not-allowed' : ''} ${errors.code ? 'border-red-300' : ''}`}
                                    />
                                    {errors.code && <p className="text-red-500 text-xs mt-1 ml-1">{errors.code}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1.5">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" name="name" required value={formData.name} onChange={handleFormChange}
                                        placeholder="e.g., Aadhar Card"
                                        className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black placeholder-gray-400 transition-all ${errors.name ? 'border-red-300' : ''}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1.5">Category <span className="text-red-500">*</span></label>
                                    <select
                                        name="category" value={formData.category} onChange={handleFormChange}
                                        className={`w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black transition-all appearance-none ${errors.category ? 'border-red-300' : ''}`}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    {errors.category && <p className="text-red-500 text-xs mt-1 ml-1">{errors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1.5">Sort Order</label>
                                    <input
                                        type="number" name="sortOrder" min="0" value={formData.sortOrder} onChange={handleFormChange}
                                        className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black text-center transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-black mb-1.5">Max File Size (MB)</label>
                                    <input
                                        type="number" name="maxFileSize" min="1" max="50" value={formData.maxFileSize} onChange={handleFormChange}
                                        className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-black transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox" name="active" checked={formData.active} onChange={handleFormChange}
                                            className="w-4 h-4 rounded border-gray-300 bg-white text-[#10B981] focus:ring-[#10B981]/30 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-black">Active</span>
                                    </label>
                                </div>
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-black">Template / Sample File</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 hover:border-[#3B82F6]/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-white hover:bg-[#3B82F6]/5 group"
                                >
                                    <IoCloudUploadOutline size={36} className="text-gray-300 mb-3 group-hover:text-[#3B82F6] transition-colors" />
                                    <p className="text-sm text-gray-500 mb-1">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400">PNG, JPG, PDF up to 5MB</p>
                                    {selectedFile && (
                                        <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20">
                                            <IoDocumentTextOutline className="text-[#00D4AA]" size={16} />
                                            <span className="text-sm text-[#00D4AA] font-medium">{selectedFile.name}</span>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} />
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">Fields marked with <span className="text-red-500">*</span> are required</p>

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button type="button" onClick={closeCreateModal} className="flex-1 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-sm transition-all" disabled={isSubmitting}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-[#00D4AA]/30 text-[#00D4AA]/50 cursor-not-allowed' : 'bg-[#00D4AA] text-white hover:bg-[#00F0C0] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)]'}`}>
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                    ) : (
                                        <>{editingDoc ? 'Update' : 'Create'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {showViewModal && viewingDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeViewModal} />
                    <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20">
                                    <IoDocumentTextOutline size={24} className="text-[#3B82F6]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-black">{viewingDoc.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{viewingDoc.code}</p>
                                </div>
                            </div>
                            <button onClick={closeViewModal} className="text-gray-400 hover:text-black p-2"><IoCloseOutline size={26} /></button>
                        </div>
                        <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</p>
                                    <p className="text-sm text-black font-medium">{viewingDoc.category}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sort Order</p>
                                    <p className="text-sm text-black font-medium">{viewingDoc.sortOrder}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Max File Size</p>
                                    <p className="text-sm text-black font-medium">{viewingDoc.maxFileSize} MB</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2.5 h-2.5 rounded-full ${viewingDoc.active ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                                        <span className={`text-sm font-medium ${viewingDoc.active ? 'text-[#10B981]' : 'text-gray-500'}`}>{viewingDoc.active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                                Created: {viewingDoc.createdAt}
                            </div>
                        </div>
                        <div className="px-8 py-4 border-t border-gray-100 flex gap-3">
                            <button onClick={closeViewModal} className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-sm">Close</button>
                            <button onClick={() => { closeViewModal(); openEditModal(viewingDoc); }} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-white font-bold text-sm hover:bg-[#00F0C0] transition-all">Edit Doc Type</button>
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
`}</style>
        </div>
    );
};

export default DocumentTypes;