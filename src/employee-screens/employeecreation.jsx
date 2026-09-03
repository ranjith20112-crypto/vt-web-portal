// src/components/EmployeeManagement.jsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  IoAdd,
  IoEye,
  IoEyeOff,
  IoPersonOutline,
  IoGridOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoEye as IoViewIcon,
  IoFilterOutline,
  IoCloseOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoLockClosedOutline,
  IoListOutline,
  IoCardOutline,
  IoArrowBackOutline
} from 'react-icons/io5';
import { FiUpload } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

// FloatingInput Component
const FloatingInput = ({
  label,
  name,
  type = "text",
  required = false,
  icon: Icon,
  value,
  onChange,
  focusedField,
  setFocusedField,
  showPassword,
  setShowPassword
}) => {
  const isFocused = focusedField === name;
  const hasValue = value && value.length > 0;

  return (
    <div className="relative group">
      {Icon && (
        <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? 'text-[#00D4AA]' : 'text-[#4A5C6E]'}`}>
          <Icon size={20} />
        </div>
      )}

      <input
        type={type === 'password' && !showPassword ? 'password' : type}
        name={name}
        value={value || ''}
        onChange={onChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField(null)}
        required={required}
        className="w-full bg-[#0A1628]/60 border border-[#1E3A5F] focus:border-[#00D4AA] text-[#F0F4F8] rounded-xl px-12 py-4 outline-none transition-all duration-300 placeholder-transparent peer shadow-inner"
        placeholder={label}
        id={name}
        autoComplete={name === 'password' ? 'new-password' : 'off'}
      />

      <label
        htmlFor={name}
        className={`absolute left-12 transition-all duration-300 pointer-events-none
 ${hasValue || isFocused
            ? '-top-2.5 left-3 text-xs text-[#00D4AA] bg-[#0A1628] px-2 rounded border border-[#1E3A5F]'
            : 'top-4 text-[#4A5C6E] bg-transparent'
          }`}
      >
        {label} {required && <span className="text-[#FF5252]">*</span>}
      </label>

      {name === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A5C6E] hover:text-white transition-colors"
        >
          {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
        </button>
      )}
    </div>
  );
};

const EmployeeManagement = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [viewType, setViewType] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [editingUserId, setEditingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const [filterCriteria, setFilterCriteria] = useState({
    employeeCode: '',
    email: '',
    name: '',
    status: 'all'
  });

  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    userType: 'Admin',
    role: '',
    department: '',
    team: '',
    isActive: true,
  });

  const [users, setUsers] = useState([]);

  const userTypes = ['Admin', 'Team Lead', 'Verifier'];
  const roles = ['Super Administrator', 'Team Lead', 'Verifier', 'Field Agent', 'Verification Analyst', 'QC Officer'];
  const departments = ['Operations', 'Field Verification', 'IT & Support', 'Quality Control', 'Finance', 'Management'];
  const teams = ['Management', 'Field Team North', 'Field Team South', 'QC Reviewers', 'Beta Team'];

  // --- API Calls ---
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        setUsers(response.data.employees || []);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUserId) {
        console.log("Updating employee with ID:", editingUserId); // ← Debug
        await api.put(`/employees/${editingUserId}`, formData);
      } else {
        await api.post('/employee/register', formData);
      }

      alert(editingUserId ? "Employee updated successfully!" : "Employee created successfully!");
      await fetchEmployees();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Submit Error:", error);
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    const cleanData = { ...user };

    // Remove sensitive/system fields
    delete cleanData._id;
    delete cleanData.id;
    delete cleanData.password;
    delete cleanData.createdAt;
    delete cleanData.updatedAt;

    setFormData({
      employeeCode: cleanData.employeeCode || '',
      fullName: cleanData.fullName || '',
      email: cleanData.email || '',
      password: '',
      phone: cleanData.phone || '',
      userType: cleanData.userType || 'Admin',
      role: cleanData.role || '',
      department: cleanData.department || '',
      team: cleanData.team || '',
      isActive: cleanData.isActive !== undefined ? cleanData.isActive : true,
    });

    setEditingUserId(user._id || user.id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingUserId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/employees/${deletingUserId}`);
      alert("Employee deleted successfully");
      await fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Failed to delete employee");
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingUserId(null);
    }
  };

  const handleView = (user) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employeeCode: '',
      fullName: '',
      email: '',
      password: '',
      phone: '',
      userType: 'Admin',
      role: '',
      department: '',
      team: '',
      isActive: true,
    });
    setEditingUserId(null);
    setFocusedField(null);
    setShowPassword(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilterCriteria({ employeeCode: '', email: '', name: '', status: 'all' });
    setSearchQuery('');
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const query = searchQuery.toLowerCase();

      const matchesGlobalSearch =
        !query ||
        user.employeeCode?.toLowerCase().includes(query) ||
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);

      const matchesCode = !filterCriteria.employeeCode ||
        user.employeeCode?.toLowerCase().includes(filterCriteria.employeeCode.toLowerCase());

      const matchesEmail = !filterCriteria.email ||
        user.email?.toLowerCase().includes(filterCriteria.email.toLowerCase());

      const matchesName = !filterCriteria.name ||
        user.fullName?.toLowerCase().includes(filterCriteria.name.toLowerCase());

      const matchesStatus = filterCriteria.status === 'all'
        ? true
        : filterCriteria.status === 'active' ? user.isActive : !user.isActive;

      return matchesGlobalSearch && matchesCode && matchesEmail && matchesName && matchesStatus;
    });
  }, [users, filterCriteria, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FEFD] text-[#0A1628] font-sans selection:bg-[#00D4AA]/30 selection:text-[#00695C]">
      <Header showNavigation={false} />

      <main className="max-w-7xl mx-auto px-8 py-12">

        <div className="flex items-center justify-between mb-10">

          {/* Left Side */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#EAF6F4] border border-black/10 rounded-xl text-sm font-medium text-[#5C6B7A] hover:text-[#0A1628] transition-all active:scale-95"
          >
            <IoArrowBackOutline size={20} />
            <span>Back</span>
          </button>

          {/* Right Side */}
          <button
            onClick={() => navigate('/employee-bulkupload')}
            className="group flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 overflow-hidden"
          >
            <FiUpload size={18} className="relative z-10" />
            <span className="relative z-10">Bulk Employee Upload</span>
          </button>

        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8 animate-fade-in-up">
          <div className="md:w-1/2">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                <IoPersonOutline size={24} className="text-[#00A88A]" />
              </div>
              <h2 className="text-4xl font-bold text-[#0A1628] tracking-tight">BGV Employee Management</h2>
            </div>
            <p className="text-[#5C6B7A] text-base leading-relaxed flex items-center gap-2">
              <IoGridOutline size={18} className="text-[#7A8B9A]" />
              Manage personnel, assign access levels (Admin, TL, Verifier), and monitor verification status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 lg:w-80">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, Name, Email..."
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
              className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-white rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95 overflow-hidden"
            >
              <IoAdd size={18} className="relative z-10" />
              <span className="relative z-10">Create Employee</span>
            </button>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'TOTAL', val: users.length, color: 'text-[#00A88A]' },
            { label: 'ACTIVE', val: users.filter(u => u.isActive).length, color: 'text-[#059669]' },
            { label: 'ADMINS', val: users.filter(u => u.userType === 'Admin').length, color: 'text-purple-600' },
            { label: 'VERIFIERS', val: users.filter(u => u.userType === 'Verifier').length, color: 'text-[#D9820F]' }
          ].map((stat, i) => (
            <div key={i} className="group relative p-6 rounded-2xl bg-white border border-black/10 overflow-hidden transition-all hover:border-black/20 hover:shadow-lg shadow-sm">
              <div className="relative flex flex-col items-start justify-between h-full gap-2">
                <div className="text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">{stat.label}</div>
                <div className={`text-5xl font-bold ${stat.color} tracking-tighter`}>{stat.val}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#5C6B7A]">Loading employees...</div>
        ) : (
          <>
            {viewType === 'list' && (
              <div className="bg-white border border-black/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl animate-fade-in-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 bg-black/[0.02]">
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Emp ID</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Employee</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">User Type</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase">Status</th>
                        <th className="p-5 text-xs font-bold text-[#7A8B9A] tracking-wider uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user._id || user.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                            <td className="p-5 font-mono text-sm text-[#5C6B7A]">{user.employeeCode}</td>
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EAF6F4] to-white border border-black/10 flex items-center justify-center text-sm font-bold text-[#00A88A]">
                                  {user.fullName?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-[#0A1628] text-sm">{user.fullName}</div>
                                  <div className="text-xs text-[#7A8B9A] mt-0.5">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border
 ${user.userType === 'Admin' ? 'bg-purple-500/10 text-purple-700 border-purple-500/20' :
                                  user.userType === 'Team Lead' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
                                    'bg-orange-500/10 text-orange-700 border-orange-500/20'}`}>
                                {user.userType}
                              </span>
                            </td>
                            <td className="p-5">
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${user.isActive ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-600">{user.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleView(user)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00A88A] transition-all"><IoViewIcon size={18} /></button>
                                <button onClick={() => handleEdit(user)} className="p-2 rounded-lg hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all"><IoPencilOutline size={18} /></button>
                                <button onClick={() => handleDeleteClick(user._id || user.id)} className="p-2 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] transition-all"><IoTrashOutline size={18} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="p-16 text-center text-[#5C6B7A]">No employees found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user._id || user.id} className="group relative bg-white border border-black/10 rounded-2xl p-6 hover:border-black/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full shadow-sm">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#EAF6F4] to-white border border-black/10 flex items-center justify-center text-lg font-bold text-[#00A88A]">
                            {user.fullName?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#0A1628] text-sm">{user.fullName}</h3>
                            <p className="text-xs text-[#7A8B9A] font-mono">{user.employeeCode}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase ${user.isActive ? 'border-[#10B981] text-[#059669] bg-[#10B981]/10' : 'border-gray-300 text-gray-500 bg-gray-500/10'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="space-y-4 mb-6 flex-1">
                        <div className="flex items-center gap-3 text-xs text-gray-600"><IoPersonOutline size={16} /> {user.role}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-600"><IoGridOutline size={16} /> {user.department}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 truncate"><IoSearchOutline size={16} /> {user.email}</div>
                      </div>
                      <div className="pt-4 border-t border-black/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(user)} className="text-xs font-medium flex items-center gap-1 hover:text-[#00A88A]">View Details</button>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(user)} className="p-2 rounded-lg bg-black/5 hover:bg-[#3B82F6] hover:text-white transition-all text-[#3B82F6]"><IoPencilOutline size={16} /></button>
                          <button onClick={() => handleDeleteClick(user._id || user.id)} className="p-2 rounded-lg bg-black/5 hover:bg-[#FF5252] hover:text-white transition-all text-[#FF5252]"><IoTrashOutline size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-16 text-center text-[#5C6B7A]">No employees found.</div>
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
                  <h3 className="text-2xl font-bold text-[#0A1628]">{editingUserId ? 'Edit Personnel' : 'New Personnel'}</h3>
                  <p className="text-xs text-[#5C6B7A] uppercase tracking-widest mt-1">{editingUserId ? 'Update All Details' : 'Create New Account'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-[#0A1628] p-2"><IoCloseOutline size={26} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-[#7A8B9A] uppercase tracking-widest border-l-2 border-[#00D4AA] pl-3">Identity Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput label="Employee Code (ID)" name="employeeCode" required icon={IoGridOutline} value={formData.employeeCode} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} showPassword={showPassword} setShowPassword={setShowPassword} />
                    <FloatingInput label="Full Name" name="fullName" required icon={IoPersonOutline} value={formData.fullName} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} showPassword={showPassword} setShowPassword={setShowPassword} />
                    <FloatingInput label="Email Address" name="email" type="email" required value={formData.email} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} showPassword={showPassword} setShowPassword={setShowPassword} />
                    <FloatingInput label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} showPassword={showPassword} setShowPassword={setShowPassword} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-[#7A8B9A] uppercase tracking-widest border-l-2 border-[#D9820F] pl-3">Access & Roles</h4>
                  <div>
                    <label className="block text-xs font-medium text-[#5C6B7A] mb-3">USER TYPE</label>
                    <div className="grid grid-cols-3 gap-4">
                      {userTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
                          className={`relative overflow-hidden py-3.5 rounded-xl border text-sm font-medium transition-all duration-300 ${formData.userType === type ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00A88A] shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'border-black/5 bg-black/5 text-gray-500 hover:border-black/10 hover:text-[#0A1628]'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-[#5C6B7A] mb-2">ROLE</label>
                      <select name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] text-[#0A1628]">
                        <option value="">Select Role...</option>
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5C6B7A] mb-2">DEPARTMENT</label>
                      <select name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] text-[#0A1628]">
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-[#5C6B7A] mb-2">TEAM</label>
                      <select name="team" value={formData.team} onChange={handleInputChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] text-[#0A1628]">
                        <option value="">Select Team...</option>
                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-[#7A8B9A] uppercase tracking-widest border-l-2 border-[#10B981] pl-3">Security</h4>
                  <FloatingInput
                    label="Password"
                    name="password"
                    type="password"
                    required={!editingUserId}
                    icon={IoLockClosedOutline}
                    value={formData.password}
                    onChange={handleInputChange}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                  />
                  <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#00D4AA]/5 to-transparent border border-[#00D4AA]/10">
                    <span className="text-sm font-semibold text-[#0A1628]">Active Account</span>
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
                    ) : editingUserId ? 'Update User' : 'Save User'}
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
              <h3 className="text-xl font-bold text-[#0A1628] mb-2">Delete User?</h3>
              <p className="text-gray-500 text-sm mb-8">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-black/10 hover:bg-black/5 text-gray-600 text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 text-sm font-bold transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {isViewModalOpen && viewingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-white border border-black/10 rounded-2xl p-0 shadow-2xl animate-fade-in-up overflow-hidden">
              <div className="h-28 bg-gradient-to-r from-[#00D4AA]/20 to-[#3B82F6]/20 relative flex items-end p-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-[#00D4AA] shadow-xl text-2xl font-bold text-[#00A88A]">
                  {viewingUser.fullName?.charAt(0)}
                </div>
              </div>
              <div className="p-8 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0A1628]">{viewingUser.fullName}</h3>
                    <p className="text-sm text-[#5C6B7A] mt-1">{viewingUser.role}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${viewingUser.isActive ? 'border-[#10B981] text-[#059669] bg-[#10B981]/10' : 'border-gray-300 text-gray-500 bg-gray-500/10'}`}>
                    {viewingUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-black/5 rounded-xl">
                    <div className="text-[#5C6B7A] text-xs mb-1">ID</div>
                    <div className="font-mono text-[#0A1628]">{viewingUser.employeeCode}</div>
                  </div>
                  <div className="p-4 bg-black/5 rounded-xl">
                    <div className="text-[#5C6B7A] text-xs mb-1">Type</div>
                    <div className="text-[#0A1628]">{viewingUser.userType}</div>
                  </div>
                  <div className="p-4 bg-black/5 rounded-xl">
                    <div className="text-[#5C6B7A] text-xs mb-1">Email</div>
                    <div className="text-[#0A1628] truncate">{viewingUser.email}</div>
                  </div>
                  <div className="p-4 bg-black/5 rounded-xl">
                    <div className="text-[#5C6B7A] text-xs mb-1">Phone</div>
                    <div className="text-[#0A1628]">{viewingUser.phone}</div>
                  </div>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="w-full mt-6 py-3.5 rounded-xl border border-black/10 hover:bg-black/5 text-[#0A1628] font-medium transition-colors">Close Details</button>
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
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Employee ID</label>
                  <input type="text" name="employeeCode" value={filterCriteria.employeeCode} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]" placeholder="e.g. EMP-001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Name</label>
                  <input type="text" name="name" value={filterCriteria.name} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]" placeholder="e.g. John" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C6B7A] mb-2">Email</label>
                  <input type="email" name="email" value={filterCriteria.email} onChange={handleFilterChange} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none text-[#0A1628]" placeholder="e.g. john@..." />
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
                <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-black/10 text-gray-600 text-sm font-medium"><IoRefreshOutline size={16} className="inline mr-1" />Clear</button>
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

export default EmployeeManagement;