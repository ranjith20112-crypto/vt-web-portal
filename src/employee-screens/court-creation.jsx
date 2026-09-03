// src/components/Courts.jsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  IoAdd,
  IoGridOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoEye as IoViewIcon,
  IoFilterOutline,
  IoCloseOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoListOutline,
  IoCardOutline,
  IoArrowBackOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoBusinessOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoLibraryOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

// ---- Static Data ----
const COURT_TYPES = ['Supreme', 'High', 'District', 'Sessions', 'Magistrate'];

// ---- FloatingInput Component ----
const FloatingInput = ({
  label,
  name,
  type = 'text',
  required = false,
  icon: Icon,
  value,
  onChange,
  focusedField,
  setFocusedField,
}) => {
  const isFocused = focusedField === name;
  const hasValue = value && value.toString().length > 0;

  return (
    <div className="relative group">
      {Icon && (
        <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? 'text-[#00D4AA]' : 'text-[#7A8B9A]'}`}>
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
        className={`w-full bg-white border border-black/10 focus:border-[#00D4AA] text-[#0A1628] rounded-xl ${Icon ? 'px-12' : 'px-4'} py-4 outline-none transition-all duration-300 placeholder-transparent peer shadow-inner`}
        placeholder={label}
        id={name}
        autoComplete="off"
      />
      <label
        htmlFor={name}
        className={`absolute ${Icon ? 'left-12' : 'left-4'} transition-all duration-300 pointer-events-none
 ${hasValue || isFocused
            ? '-top-2.5 left-3 text-xs text-[#00D4AA] bg-white px-2 rounded border border-black/10'
            : 'top-4 text-[#7A8B9A] bg-transparent'
          }`}
      >
        {label} {required && <span className="text-[#FF5252]">*</span>}
      </label>
    </div>
  );
};

// ---- Section Header ----
const SectionHeader = ({ title, color }) => (
  <h4 className="text-xs font-bold text-[#7A8B9A] uppercase tracking-widest border-l-2 pl-3" style={{ borderColor: color }}>
    {title}
  </h4>
);

const Courts = () => {
  const navigate = useNavigate();

  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [viewType, setViewType] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingCourt, setViewingCourt] = useState(null);

  const [courts, setCourts] = useState([]);

  const [filterCriteria, setFilterCriteria] = useState({
    courtName: '',
    jurisdiction: '',
    type: 'all',
    status: 'all',
  });

  const initialFormState = {
    courtName: '',
    type: '',
    jurisdiction: '',
    ecourtCode: '',
    portalUrl: '',
    address: '',
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- API Calls ---
  const fetchCourts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/courts');
      if (response.data.success) {
        setCourts(response.data.courts || []);
      }
    } catch (error) {
      console.error('Failed to fetch courts:', error);
      alert('Failed to load court directory. Please ensure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type) {
      alert('Please select a court type.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/courts/${editingId}`, formData);
        alert('Court updated successfully!');
      } else {
        await api.post('/courts', formData);
        alert('Court created successfully!');
      }
      await fetchCourts();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Submit Error:', error);
      alert(error.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (court) => {
    setFormData({
      courtName: court.courtName || '',
      type: court.type || '',
      jurisdiction: court.jurisdiction || '',
      ecourtCode: court.ecourtCode || '',
      portalUrl: court.portalUrl || '',
      address: court.address || '',
      isActive: court.isActive !== undefined ? court.isActive : true,
    });
    setEditingId(court._id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/courts/${deletingId}`);
      alert('Court deleted successfully');
      await fetchCourts();
    } catch (error) {
      console.error(error);
      alert('Failed to delete court');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleView = (court) => {
    setViewingCourt(court);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setFocusedField(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilterCriteria({ courtName: '', jurisdiction: '', type: 'all', status: 'all' });
    setSearchQuery('');
  };

  const filteredCourts = useMemo(() => {
    return courts.filter(c => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        c.courtName?.toLowerCase().includes(query) ||
        c.jurisdiction?.toLowerCase().includes(query) ||
        c.ecourtCode?.toLowerCase().includes(query) ||
        c.type?.toLowerCase().includes(query);

      const matchesName = !filterCriteria.courtName ||
        c.courtName?.toLowerCase().includes(filterCriteria.courtName.toLowerCase());

      const matchesJurisdiction = !filterCriteria.jurisdiction ||
        c.jurisdiction?.toLowerCase().includes(filterCriteria.jurisdiction.toLowerCase());

      const matchesType = filterCriteria.type === 'all' || c.type === filterCriteria.type;

      const matchesStatus = filterCriteria.status === 'all'
        ? true
        : filterCriteria.status === 'active' ? c.isActive : !c.isActive;

      return matchesSearch && matchesName && matchesJurisdiction && matchesType && matchesStatus;
    });
  }, [courts, filterCriteria, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FEFD] text-[#0A1628] font-sans selection:bg-[#00D4AA]/30 selection:text-[#00695C]">
      <Header showNavigation={false} />

      <main className="max-w-7xl mx-auto px-8 py-12">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#EAF6F4] border border-black/10 rounded-xl text-sm font-medium text-[#5C6B7A] hover:text-[#0A1628] transition-all active:scale-95"
          >
            <IoArrowBackOutline size={20} />
            <span>Back</span>
          </button>
        </div>

        {/* HEADING */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8 animate-fade-in-up">
          <div className="md:w-1/2">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                <IoLibraryOutline size={24} className="text-[#00A88A]" />
              </div>
              <h2 className="text-4xl font-bold text-[#0A1628] tracking-tight">Courts</h2>
            </div>
            <p className="text-[#5C6B7A] text-base leading-relaxed flex items-center gap-2">
              <IoShieldCheckmarkOutline size={18} className="text-[#7A8B9A]" />
              Court directory for legal verification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 lg:w-80">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search court, jurisdiction, code..."
                className="w-full bg-white border border-black/10 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-[#0A1628] placeholder-gray-400 transition-all shadow-sm"
              />
            </div>

            <div className="flex bg-white rounded-xl p-1 border border-black/5 shadow-sm">
              <button
                onClick={() => setViewType('list')}
                className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#00D4AA] text-white' : 'text-gray-400 hover:text-[#0A1628]'}`}
              >
                <IoListOutline size={20} />
              </button>
              <button
                onClick={() => setViewType('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-[#00D4AA] text-white' : 'text-gray-400 hover:text-[#0A1628]'}`}
              >
                <IoCardOutline size={20} />
              </button>
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2
 ${Object.values(filterCriteria).some(val => val && val !== 'all') || searchQuery
                  ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00A88A]'
                  : 'bg-white border-black/5 text-gray-500 hover:text-[#0A1628] hover:bg-black/5 shadow-sm'
                }`}
            >
              <IoFilterOutline size={18} />
              <span>Filter</span>
            </button>

            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-white rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95"
            >
              <IoAdd size={18} />
              <span>Add Court</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'TOTAL', val: courts.length, color: 'text-[#00A88A]' },
            { label: 'ACTIVE', val: courts.filter(c => c.isActive).length, color: 'text-[#059669]' },
            { label: 'ONLINE', val: courts.filter(c => c.isOnline).length, color: 'text-[#3B82F6]' },
          ].map((stat, i) => (
            <div key={i} className="group relative p-6 rounded-2xl bg-white border border-black/10 overflow-hidden transition-all hover:border-black/20 hover:shadow-lg shadow-sm">
              <div className="relative flex flex-col items-start justify-between h-full gap-2">
                <div className="text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">{stat.label}</div>
                <div className={`text-5xl font-bold ${stat.color} tracking-tighter`}>{stat.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE / GRID */}
        {loading ? (
          <div className="text-center py-20 text-[#5C6B7A]">Loading court directory...</div>
        ) : (
          <>
            {/* LIST VIEW */}
            {viewType === 'list' && (
              <div className="bg-white border border-black/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl animate-fade-in-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 bg-black/[0.02]">
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Court Name</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Type</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Jurisdiction</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">eCourt Code</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Portal</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Status</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourts.length > 0 ? (
                        filteredCourts.map((court) => (
                          <tr key={court._id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EAF6F4] to-white border border-black/10 flex items-center justify-center text-sm font-bold text-[#00A88A]">
                                  {court.courtName?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-[#0A1628] text-sm">{court.courtName}</div>
                                  {court.address && (
                                    <div className="text-xs text-[#7A8B9A] mt-0.5 max-w-xs truncate">{court.address}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <span className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-purple-500/10 text-purple-700 border-purple-500/20">
                                {court.type || '—'}
                              </span>
                            </td>
                            <td className="p-5 text-sm text-gray-600">{court.jurisdiction || '—'}</td>
                            <td className="p-5 text-sm font-mono text-gray-600">{court.ecourtCode || '—'}</td>
                            <td className="p-5">
                              {court.isOnline ? (
                                <a href={court.portalUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 hover:bg-[#3B82F6]/20 transition-all">
                                  <IoGlobeOutline size={13} /> Online
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-black/[0.03] text-[#7A8B9A] border-black/5">
                                  <IoGlobeOutline size={13} /> Offline
                                </span>
                              )}
                            </td>
                            <td className="p-5">
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${court.isActive ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-600">{court.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleView(court)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00A88A] transition-all"><IoViewIcon size={18} /></button>
                                <button onClick={() => handleEdit(court)} className="p-2 rounded-lg hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all"><IoPencilOutline size={18} /></button>
                                <button onClick={() => handleDeleteClick(court._id)} className="p-2 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] transition-all"><IoTrashOutline size={18} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={7} className="p-16 text-center text-[#5C6B7A]">No courts found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GRID VIEW */}
            {viewType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                {filteredCourts.length > 0 ? (
                  filteredCourts.map((court) => (
                    <div key={court._id} className="group relative bg-white border border-black/10 rounded-2xl p-6 hover:border-black/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#EAF6F4] to-white border border-black/10 flex items-center justify-center text-base font-bold text-[#00A88A]">
                            {court.courtName?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#0A1628] text-sm leading-tight">{court.courtName}</h3>
                            <p className="text-[10px] text-[#7A8B9A] mt-0.5">{court.type} Court</p>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${court.isActive ? 'border-[#10B981] text-[#059669] bg-[#10B981]/10' : 'border-gray-300 text-gray-500 bg-gray-500/10'}`}>
                          {court.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center gap-3 text-xs text-gray-600"><IoLocationOutline size={14} /> {court.jurisdiction || '—'}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-600"><IoDocumentTextOutline size={14} /> {court.ecourtCode || '—'}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <IoGlobeOutline size={14} /> {court.isOnline ? 'Portal Available' : 'No Portal'}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-black/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(court)} className="text-xs font-medium flex items-center gap-1 hover:text-[#00A88A]">View Details</button>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(court)} className="p-2 rounded-lg bg-black/5 hover:bg-[#3B82F6] hover:text-white transition-all text-[#3B82F6]"><IoPencilOutline size={15} /></button>
                          <button onClick={() => handleDeleteClick(court._id)} className="p-2 rounded-lg bg-black/5 hover:bg-[#FF5252] hover:text-white transition-all text-[#FF5252]"><IoTrashOutline size={15} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-16 text-center text-[#5C6B7A]">No courts found.</div>
                )}
              </div>
            )}
          </>
        )}

        {/* CREATE / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
            <div className="relative w-full max-w-3xl bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
              <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-black/[0.02]">
                <div>
                  <h3 className="text-2xl font-bold text-[#0A1628]">{editingId ? 'Edit Court' : 'New Court'}</h3>
                  <p className="text-xs text-[#5C6B7A] uppercase tracking-widest mt-1">{editingId ? 'Update Court Details' : 'Add Court for Legal Verification'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-[#0A1628] p-2"><IoCloseOutline size={26} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                {/* COURT INFO */}
                <div className="space-y-6">
                  <SectionHeader title="Court Information" color="#00D4AA" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Court Name"
                      name="courtName"
                      required
                      icon={IoLibraryOutline}
                      value={formData.courtName}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <div>
                      <label className="block text-xs font-medium text-[#5C6B7A] mb-2">TYPE <span className="text-[#FF5252]">*</span></label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 outline-none focus:border-[#00D4AA] text-[#0A1628]"
                      >
                        <option value="">Select...</option>
                        {COURT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <FloatingInput
                      label="Jurisdiction"
                      name="jurisdiction"
                      icon={IoLocationOutline}
                      value={formData.jurisdiction}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <FloatingInput
                      label="eCourt Code"
                      name="ecourtCode"
                      icon={IoDocumentTextOutline}
                      value={formData.ecourtCode}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <div className="md:col-span-2">
                      <FloatingInput
                        label="Portal URL"
                        name="portalUrl"
                        type="url"
                        icon={IoGlobeOutline}
                        value={formData.portalUrl}
                        onChange={handleInputChange}
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                      />
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="space-y-6">
                  <SectionHeader title="Location" color="#3B82F6" />
                  <div>
                    <label className="block text-xs font-medium text-[#5C6B7A] mb-2 flex items-center gap-2">
                      <IoLocationOutline size={14} /> ADDRESS
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter the court's full address..."
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] text-[#0A1628] resize-none placeholder-[#7A8B9A]"
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className="space-y-6">
                  <SectionHeader title="Status" color="#10B981" />
                  <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#00D4AA]/5 to-transparent border border-[#00D4AA]/10">
                    <span className="text-sm font-semibold text-[#0A1628]">{formData.isActive ? 'Active' : 'Inactive'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D4AA]"></div>
                    </label>
                  </div>
                </div>

                <p className="text-xs text-[#7A8B9A]">Fields marked with <span className="text-[#FF5252]">*</span> are required</p>

                {/* ACTIONS */}
                <div className="flex gap-4 pt-6 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl border border-black/10 hover:bg-black/5 text-gray-600 font-medium text-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#00D4AA] hover:bg-[#00C09A] transition-all flex justify-center items-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    ) : editingId ? 'Update Court' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white border border-red-500/20 rounded-2xl p-8 shadow-2xl animate-fade-in-up text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <IoTrashOutline size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-2">Delete Court?</h3>
              <p className="text-gray-500 text-sm mb-8">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-black/10 hover:bg-black/5 text-gray-600 text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 text-sm font-bold transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {isViewModalOpen && viewingCourt && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-white border border-black/10 rounded-2xl p-0 shadow-2xl animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
              <div className="h-28 bg-gradient-to-r from-[#00D4AA]/20 to-[#3B82F6]/20 relative flex items-end p-8 flex-shrink-0">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-[#00D4AA] shadow-xl text-2xl font-bold text-[#00A88A]">
                  {viewingCourt.courtName?.charAt(0)}
                </div>
              </div>
              <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0A1628]">{viewingCourt.courtName}</h3>
                    <p className="text-sm text-[#5C6B7A] mt-1">{viewingCourt.type} Court</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${viewingCourt.isActive ? 'border-[#10B981] text-[#059669] bg-[#10B981]/10' : 'border-gray-300 text-gray-500 bg-gray-500/10'}`}>
                    {viewingCourt.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Type', viewingCourt.type],
                    ['Jurisdiction', viewingCourt.jurisdiction],
                    ['eCourt Code', viewingCourt.ecourtCode],
                    ['Portal', viewingCourt.isOnline ? 'Online' : 'Offline'],
                  ].map(([label, val], i) => (
                    <div key={i} className="p-4 bg-black/5 rounded-xl">
                      <div className="text-[#5C6B7A] text-xs mb-1">{label}</div>
                      <div className="text-[#0A1628] truncate">{val || '—'}</div>
                    </div>
                  ))}
                  {viewingCourt.portalUrl && (
                    <div className="col-span-2 p-4 bg-black/5 rounded-xl">
                      <div className="text-[#5C6B7A] text-xs mb-1">Portal URL</div>
                      <a href={viewingCourt.portalUrl} target="_blank" rel="noopener noreferrer" className="text-[#00A88A] text-sm truncate block hover:underline">{viewingCourt.portalUrl}</a>
                    </div>
                  )}
                  {viewingCourt.address && (
                    <div className="col-span-2 p-4 bg-black/5 rounded-xl">
                      <div className="text-[#5C6B7A] text-xs mb-1">Address</div>
                      <div className="text-[#0A1628] text-sm">{viewingCourt.address}</div>
                    </div>
                  )}
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="w-full mt-4 py-3.5 rounded-xl border border-black/10 hover:bg-black/5 text-[#0A1628] font-medium transition-colors">Close Details</button>
              </div>
            </div>
          </div>
        )}

        {/* FILTER MODAL */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
            <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl shadow-2xl animate-fade-in-up p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-[#0A1628] flex items-center gap-2">
                  <IoFilterOutline className="text-[#00A88A]" />Advanced Filter
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-[#0A1628]">
                  <IoCloseOutline size={24} />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Court Name</label>
                  <input type="text" name="courtName" value={filterCriteria.courtName} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]" placeholder="e.g. Madras High Court" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Jurisdiction</label>
                  <input type="text" name="jurisdiction" value={filterCriteria.jurisdiction} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]" placeholder="e.g. Tamil Nadu" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Type</label>
                  <select name="type" value={filterCriteria.type} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]">
                    <option value="all">All Types</option>
                    {COURT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['all', 'active', 'inactive'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFilterCriteria(prev => ({ ...prev, status: s }))}
                        className={`py-3 rounded-lg text-xs font-medium capitalize ${filterCriteria.status === s ? 'bg-[#00D4AA]/10 text-[#00A88A] border border-[#00D4AA]' : 'bg-white border border-black/5 text-gray-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-black/10 text-gray-600 text-sm font-medium">
                  <IoRefreshOutline size={16} className="inline mr-1" />Clear
                </button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-white font-bold text-sm">Apply</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.02); }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.2); }
 @keyframes fadeInUp {
 from { opacity: 0; transform: translateY(20px); }
 to { opacity: 1; transform: translateY(0); }
 }
 .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
 `}</style>
    </div>
  );
};

export default Courts;