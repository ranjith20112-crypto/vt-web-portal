// src/components/Universities.jsx
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
  IoMailOutline,
  IoCallOutline,
  IoSchoolOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoCashOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

// ---- Static Data ----
const UNIVERSITY_TYPES = ['Central', 'State', 'Deemed', 'Private'];
const METHODS = ['Email', 'Phone', 'Letter', 'Portal'];

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

const Universities = () => {
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
  const [viewingUniversity, setViewingUniversity] = useState(null);

  const [universities, setUniversities] = useState([]);

  const [filterCriteria, setFilterCriteria] = useState({
    universityName: '',
    method: '',
    type: 'all',
    status: 'all',
  });

  const initialFormState = {
    universityName: '',
    type: '',
    website: '',
    verificationEmail: '',
    verificationPhone: '',
    method: '',
    avgDays: '',
    cost: '',
    contactPerson: '',
    contactPhone: '',
    designation: '',
    notes: '',
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- API Calls ---
  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/universities');
      if (response.data.success) {
        setUniversities(response.data.universities || []);
      }
    } catch (error) {
      console.error('Failed to fetch universities:', error);
      alert('Failed to load university directory. Please ensure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type) {
      alert('Please select a university type.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/universities/${editingId}`, formData);
        alert('University updated successfully!');
      } else {
        await api.post('/universities', formData);
        alert('University created successfully!');
      }
      await fetchUniversities();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Submit Error:', error);
      alert(error.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (uni) => {
    setFormData({
      universityName: uni.universityName || '',
      type: uni.type || '',
      website: uni.website || '',
      verificationEmail: uni.verificationEmail || '',
      verificationPhone: uni.verificationPhone || '',
      method: uni.method || '',
      avgDays: uni.avgDays ?? '',
      cost: uni.cost ?? '',
      contactPerson: uni.contactPerson || '',
      contactPhone: uni.contactPhone || '',
      designation: uni.designation || '',
      notes: uni.notes || '',
      isActive: uni.isActive !== undefined ? uni.isActive : true,
    });
    setEditingId(uni._id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/universities/${deletingId}`);
      alert('University deleted successfully');
      await fetchUniversities();
    } catch (error) {
      console.error(error);
      alert('Failed to delete university');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleView = (uni) => {
    setViewingUniversity(uni);
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
    setFilterCriteria({ universityName: '', method: '', type: 'all', status: 'all' });
    setSearchQuery('');
  };

  const filteredUniversities = useMemo(() => {
    return universities.filter(u => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        u.universityName?.toLowerCase().includes(query) ||
        u.verificationEmail?.toLowerCase().includes(query) ||
        u.contactPerson?.toLowerCase().includes(query) ||
        u.type?.toLowerCase().includes(query);

      const matchesName = !filterCriteria.universityName ||
        u.universityName?.toLowerCase().includes(filterCriteria.universityName.toLowerCase());

      const matchesMethod = !filterCriteria.method ||
        u.method?.toLowerCase().includes(filterCriteria.method.toLowerCase());

      const matchesType = filterCriteria.type === 'all' || u.type === filterCriteria.type;

      const matchesStatus = filterCriteria.status === 'all'
        ? true
        : filterCriteria.status === 'active' ? u.isActive : !u.isActive;

      return matchesSearch && matchesName && matchesMethod && matchesType && matchesStatus;
    });
  }, [universities, filterCriteria, searchQuery]);

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
                <IoSchoolOutline size={24} className="text-[#00A88A]" />
              </div>
              <h2 className="text-4xl font-bold text-[#0A1628] tracking-tight">Universities</h2>
            </div>
            <p className="text-[#5C6B7A] text-base leading-relaxed flex items-center gap-2">
              <IoDocumentTextOutline size={18} className="text-[#7A8B9A]" />
              University directory for education verification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 lg:w-80">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search university, email, contact..."
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
              <span>Add University</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'TOTAL', val: universities.length, color: 'text-[#00A88A]' },
            { label: 'ACTIVE', val: universities.filter(u => u.isActive).length, color: 'text-[#059669]' },
            { label: 'INACTIVE', val: universities.filter(u => !u.isActive).length, color: 'text-[#E53E3E]' },
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
          <div className="text-center py-20 text-[#5C6B7A]">Loading university directory...</div>
        ) : (
          <>
            {/* LIST VIEW */}
            {viewType === 'list' && (
              <div className="bg-white border border-black/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl animate-fade-in-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 bg-black/[0.02]">
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">University</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Type</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Cost (₹)</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Contact</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Phone</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Method</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Avg Days</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Status</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUniversities.length > 0 ? (
                        filteredUniversities.map((uni) => (
                          <tr key={uni._id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#EAF6F4] to-white border border-black/10 flex items-center justify-center text-sm font-bold text-[#00A88A]">
                                  {uni.universityName?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-[#0A1628] text-sm">{uni.universityName}</div>
                                  {uni.verificationEmail && (
                                    <div className="text-xs text-[#7A8B9A] mt-0.5 max-w-xs truncate">{uni.verificationEmail}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <span className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-purple-500/10 text-purple-700 border-purple-500/20">
                                {uni.type || '—'}
                              </span>
                            </td>
                            <td className="p-5 text-sm text-gray-600">{uni.cost ? `₹${uni.cost}` : '—'}</td>
                            <td className="p-5 text-sm text-gray-600">{uni.contactPerson || '—'}</td>
                            <td className="p-5 text-sm text-gray-600">{uni.verificationPhone || uni.contactPhone || '—'}</td>
                            <td className="p-5">
                              {uni.method ? (
                                <span className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-[#00D4AA]/10 text-[#00A88A] border-[#00D4AA]/20">
                                  {uni.method}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="p-5 text-sm text-gray-600">{uni.avgDays ? `${uni.avgDays} days` : '—'}</td>
                            <td className="p-5">
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${uni.isActive ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-600">{uni.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleView(uni)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00A88A] transition-all"><IoViewIcon size={18} /></button>
                                <button onClick={() => handleEdit(uni)} className="p-2 rounded-lg hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all"><IoPencilOutline size={18} /></button>
                                <button onClick={() => handleDeleteClick(uni._id)} className="p-2 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] transition-all"><IoTrashOutline size={18} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={9} className="p-16 text-center text-[#5C6B7A]">No universities found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GRID VIEW */}
            {viewType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((uni) => (
                    <div key={uni._id} className="group relative bg-white border border-black/10 rounded-2xl p-6 hover:border-black/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#EAF6F4] to-white border border-black/10 flex items-center justify-center text-base font-bold text-[#00A88A]">
                            {uni.universityName?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#0A1628] text-sm leading-tight">{uni.universityName}</h3>
                            <p className="text-[10px] text-[#7A8B9A] mt-0.5">{uni.type} University</p>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${uni.isActive ? 'border-[#10B981] text-[#059669] bg-[#10B981]/10' : 'border-gray-300 text-gray-500 bg-gray-500/10'}`}>
                          {uni.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center gap-3 text-xs text-gray-600"><IoMailOutline size={14} /> {uni.verificationEmail || '—'}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-600"><IoPersonOutline size={14} /> {uni.contactPerson || '—'}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-600"><IoCheckmarkCircleOutline size={14} /> {uni.method || '—'} {uni.avgDays ? `· ${uni.avgDays}d` : ''}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-600"><IoCashOutline size={14} /> {uni.cost ? `₹${uni.cost}` : '—'}</div>
                      </div>
                      <div className="pt-4 border-t border-black/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(uni)} className="text-xs font-medium flex items-center gap-1 hover:text-[#00A88A]">View Details</button>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(uni)} className="p-2 rounded-lg bg-black/5 hover:bg-[#3B82F6] hover:text-white transition-all text-[#3B82F6]"><IoPencilOutline size={15} /></button>
                          <button onClick={() => handleDeleteClick(uni._id)} className="p-2 rounded-lg bg-black/5 hover:bg-[#FF5252] hover:text-white transition-all text-[#FF5252]"><IoTrashOutline size={15} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-16 text-center text-[#5C6B7A]">No universities found.</div>
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
                  <h3 className="text-2xl font-bold text-[#0A1628]">{editingId ? 'Edit University' : 'New University'}</h3>
                  <p className="text-xs text-[#5C6B7A] uppercase tracking-widest mt-1">{editingId ? 'Update University Details' : 'Add University for Verification'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-[#0A1628] p-2"><IoCloseOutline size={26} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                {/* UNIVERSITY INFO */}
                <div className="space-y-6">
                  <SectionHeader title="University Information" color="#00D4AA" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="University Name"
                      name="universityName"
                      required
                      icon={IoSchoolOutline}
                      value={formData.universityName}
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
                        {UNIVERSITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <FloatingInput
                        label="Website"
                        name="website"
                        type="url"
                        icon={IoGlobeOutline}
                        value={formData.website}
                        onChange={handleInputChange}
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                      />
                    </div>
                  </div>
                </div>

                {/* VERIFICATION DETAILS */}
                <div className="space-y-6">
                  <SectionHeader title="Verification Details" color="#3B82F6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Verification Email"
                      name="verificationEmail"
                      type="email"
                      icon={IoMailOutline}
                      value={formData.verificationEmail}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <FloatingInput
                      label="Verification Phone"
                      name="verificationPhone"
                      type="tel"
                      icon={IoCallOutline}
                      value={formData.verificationPhone}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5C6B7A] mb-3">METHOD</label>
                    <div className="flex flex-wrap gap-3">
                      {METHODS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, method: m }))}
                          className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
 ${formData.method === m
                              ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00A88A] shadow-[0_0_12px_rgba(0,212,170,0.15)]'
                              : 'border-black/5 bg-black/5 text-gray-500 hover:border-black/15 hover:text-[#0A1628]'
                            }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Avg Response Days"
                      name="avgDays"
                      type="number"
                      icon={IoTimeOutline}
                      value={formData.avgDays}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <FloatingInput
                      label="Cost / Verification (₹)"
                      name="cost"
                      type="number"
                      icon={IoCashOutline}
                      value={formData.cost}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                  </div>
                </div>

                {/* CONTACT PERSON DETAILS */}
                <div className="space-y-6">
                  <SectionHeader title="Contact Person Details" color="#D9820F" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Contact Person"
                      name="contactPerson"
                      icon={IoPersonOutline}
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <FloatingInput
                      label="Contact Phone"
                      name="contactPhone"
                      type="tel"
                      icon={IoCallOutline}
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <div className="md:col-span-2">
                      <FloatingInput
                        label="Designation"
                        name="designation"
                        icon={IoBriefcaseOutline}
                        value={formData.designation}
                        onChange={handleInputChange}
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5C6B7A] mb-2 flex items-center gap-2">
                      <IoInformationCircleOutline size={14} /> NOTES
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter any notes about this university..."
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
                    ) : editingId ? 'Update University' : 'Create'}
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
              <h3 className="text-xl font-bold text-[#0A1628] mb-2">Delete University?</h3>
              <p className="text-gray-500 text-sm mb-8">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-black/10 hover:bg-black/5 text-gray-600 text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 text-sm font-bold transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {isViewModalOpen && viewingUniversity && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-white border border-black/10 rounded-2xl p-0 shadow-2xl animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
              <div className="h-28 bg-gradient-to-r from-[#00D4AA]/20 to-[#3B82F6]/20 relative flex items-end p-8 flex-shrink-0">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-[#00D4AA] shadow-xl text-2xl font-bold text-[#00A88A]">
                  {viewingUniversity.universityName?.charAt(0)}
                </div>
              </div>
              <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0A1628]">{viewingUniversity.universityName}</h3>
                    <p className="text-sm text-[#5C6B7A] mt-1">{viewingUniversity.type} University</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${viewingUniversity.isActive ? 'border-[#10B981] text-[#059669] bg-[#10B981]/10' : 'border-gray-300 text-gray-500 bg-gray-500/10'}`}>
                    {viewingUniversity.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Type', viewingUniversity.type],
                    ['Method', viewingUniversity.method],
                    ['Verification Email', viewingUniversity.verificationEmail],
                    ['Verification Phone', viewingUniversity.verificationPhone],
                    ['Avg Days', viewingUniversity.avgDays ? `${viewingUniversity.avgDays} days` : null],
                    ['Cost', viewingUniversity.cost ? `₹${viewingUniversity.cost}` : null],
                    ['Contact Person', viewingUniversity.contactPerson],
                    ['Contact Phone', viewingUniversity.contactPhone],
                    ['Designation', viewingUniversity.designation],
                  ].map(([label, val], i) => (
                    <div key={i} className="p-4 bg-black/5 rounded-xl">
                      <div className="text-[#5C6B7A] text-xs mb-1">{label}</div>
                      <div className="text-[#0A1628] truncate">{val || '—'}</div>
                    </div>
                  ))}
                  {viewingUniversity.website && (
                    <div className="col-span-2 p-4 bg-black/5 rounded-xl">
                      <div className="text-[#5C6B7A] text-xs mb-1">Website</div>
                      <a href={viewingUniversity.website} target="_blank" rel="noopener noreferrer" className="text-[#00A88A] text-sm truncate block hover:underline">{viewingUniversity.website}</a>
                    </div>
                  )}
                  {viewingUniversity.notes && (
                    <div className="col-span-2 p-4 bg-black/5 rounded-xl">
                      <div className="text-[#5C6B7A] text-xs mb-1">Notes</div>
                      <div className="text-[#0A1628] text-sm">{viewingUniversity.notes}</div>
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
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">University Name</label>
                  <input type="text" name="universityName" value={filterCriteria.universityName} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]" placeholder="e.g. Anna University" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Method</label>
                  <input type="text" name="method" value={filterCriteria.method} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]" placeholder="e.g. Email" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Type</label>
                  <select name="type" value={filterCriteria.type} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]">
                    <option value="all">All Types</option>
                    {UNIVERSITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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

export default Universities;