// src/components/ClientManagement.jsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  IoAdd,
  IoEye,
  IoEyeOff,
  IoPersonOutline,
  IoBusinessOutline,
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
  IoArrowBackOutline,
  IoCallOutline,
  IoMailOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoDocumentTextOutline,
  IoCardOutline as IoBillingIcon,
  IoCloudUploadOutline,
  IoCubeOutline,
  IoPersonAddOutline,
  IoPeopleOutline,
  IoGitBranchOutline,
  IoBriefcaseOutline
} from 'react-icons/io5';
import { FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

// ---- Static Data ----
const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// Simple state -> city map (extend as needed)
const STATE_CITIES = {
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belagavi'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Varanasi'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota']
};

const COUNTRIES = ['India'];
const CATEGORIES = ['Cat A', 'Cat B', 'Cat C', 'Channel Partner'];
const BILLING_CYCLES = ['Monthly', 'Quarterly', 'Per Case'];
const DESIGNATIONS = ['CEO', 'CTO', 'HR', 'MANAGER', 'TL', 'Team Member', 'Accountant'];

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
  showPassword,
  setShowPassword,
  passwordFieldKey = 'password'
}) => {
  const isFocused = focusedField === name;
  const hasValue = value && value.toString().length > 0;
  const isPasswordField = type === 'password';

  return (
    <div className="relative group">
      {Icon && (
        <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors duration-300 ${isFocused ? 'text-[#00D4AA]' : 'text-slate-400'}`}>
          <Icon size={20} />
        </div>
      )}

      <input
        type={isPasswordField && !showPassword ? 'password' : (isPasswordField ? 'text' : type)}
        name={name}
        value={value || ''}
        onChange={onChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField(null)}
        required={required}
        className={`w-full bg-white border border-slate-200 focus:border-[#00D4AA] text-slate-800 rounded-xl ${Icon ? 'px-12' : 'px-4'} py-4 outline-none transition-all duration-300 placeholder-transparent peer shadow-inner`}
        placeholder={label}
        id={name}
        autoComplete={isPasswordField ? 'new-password' : 'off'}
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

      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors"
        >
          {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
        </button>
      )}
    </div>
  );
};

// ---- Section Header ----
const SectionHeader = ({ title, color }) => (
  <h4 className={`text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 pl-3`} style={{ borderColor: color }}>
    {title}
  </h4>
);

const ClientManagement = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [showPortalPassword, setShowPortalPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [viewType, setViewType] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [editingClientId, setEditingClientId] = useState(null);
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);

  // file previews
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [agreementFile, setAgreementFile] = useState(null);
  const [agreementName, setAgreementName] = useState('');

  // --- Dynamic data from backend ---
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // --- User (sub-user) management state ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [editingUserIndex, setEditingUserIndex] = useState(null);
  const initialUserState = {
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    designation: '',
    displayName: '',
    password: ''
  };
  const [userForm, setUserForm] = useState(initialUserState);
  // users attached to the client currently being created/edited
  const [clientUsers, setClientUsers] = useState([]);

  const [filterCriteria, setFilterCriteria] = useState({
    clientCode: '',
    companyName: '',
    contactEmail: '',
    category: 'all',
    status: 'all'
  });

  const initialFormState = {
    clientCode: '',
    companyName: '',
    displayName: '',
    industry: '',
    website: '',
    // branch
    branchName: '',
    branchCode: '',
    branchDescription: '',
    // address
    addressLine1: '',
    addressLine2: '',
    state: '',
    city: '',
    pinCode: '',
    country: 'India',
    // company details
    companyDate: '',
    category: '',
    customerSupporter: '',
    // primary contact
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    landline: '',
    // tax & billing
    gstin: '',
    pan: '',
    billingCycle: 'Monthly',
    // contract
    contractStartDate: '',
    contractEndDate: '',
    // portal access
    enablePortalLogin: false,
    portalEmail: '',
    portalPassword: '',
    // package
    assignedPackage: '',
    // status
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);
  const [clients, setClients] = useState([]);

  // --- API Calls ---
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients');
      if (response.data.success) {
        setClients(response.data.clients || []);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      alert('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees from backend for Customer Supporter dropdown
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Fetch all packages from backend for Assigned Package dropdown
  const fetchPackages = async () => {
    setPackagesLoading(true);
    try {
      const response = await api.get('/packages');
      if (response.data.success) {
        setPackages(response.data.packages || []);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setPackagesLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchEmployees();
    fetchPackages();
  }, []);

  // Helper: get employee display name
  const getEmployeeDisplayName = (emp) => {
    const firstName = emp.firstName || emp.first_name || '';
    const lastName = emp.lastName || emp.last_name || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    return fullName || emp.displayName || emp.name || emp.email || 'Unknown';
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // reset city when state changes
      if (name === 'state') {
        next.city = '';
      }
      return next;
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2MB');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleAgreementChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Agreement document must be under 10MB');
      return;
    }
    setAgreementFile(file);
    setAgreementName(file.name);
  };

  // --- User (sub-user) handlers ---
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddUserModal = () => {
    setUserForm(initialUserState);
    setEditingUserIndex(null);
    setShowUserPassword(false);
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (index) => {
    const u = clientUsers[index] || {};
    setUserForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      contactNo: u.contactNo || '',
      designation: u.designation || '',
      displayName: u.displayName || '',
      password: '' // do not prefill existing password
    });
    setEditingUserIndex(index);
    setShowUserPassword(false);
    setIsUserModalOpen(true);
  };

  const saveUser = () => {
    // Validation
    if (!userForm.firstName || !userForm.email) {
      alert('First Name and Email are required for a user.');
      return;
    }
    if (editingUserIndex === null && !userForm.password) {
      alert('Password is required for a new user.');
      return;
    }

    setClientUsers(prev => {
      const next = [...prev];
      if (editingUserIndex !== null) {
        // preserve existing password if not changed
        const existing = next[editingUserIndex] || {};
        next[editingUserIndex] = {
          ...existing,
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          contactNo: userForm.contactNo,
          designation: userForm.designation,
          displayName: userForm.displayName,
          // only overwrite password if a new one was typed
          password: userForm.password ? userForm.password : (existing.password || '')
        };
      } else {
        next.push({
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          contactNo: userForm.contactNo,
          designation: userForm.designation,
          displayName: userForm.displayName,
          password: userForm.password
        });
      }
      return next;
    });

    setIsUserModalOpen(false);
    setUserForm(initialUserState);
    setEditingUserIndex(null);
    setShowUserPassword(false);
  };

  const deleteUser = (index) => {
    setClientUsers(prev => prev.filter((_, i) => i !== index));
  };

  const buildPayload = () => {
    // Use multipart form data so files can be attached
    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      fd.append(key, val === null || val === undefined ? '' : val);
    });
    // attach users as JSON string
    fd.append('users', JSON.stringify(clientUsers));
    if (logoFile) fd.append('companyLogo', logoFile);
    if (agreementFile) fd.append('agreementDocument', agreementFile);
    return fd;
  };

  const handleEdit = (client) => {
    const c = { ...client };

    setFormData({
      clientCode: c.clientCode || '',
      companyName: c.companyName || '',
      displayName: c.displayName || '',
      industry: c.industry || '',
      website: c.website || '',
      branchName: c.branchName || '',
      branchCode: c.branchCode || '',
      branchDescription: c.branchDescription || '',
      addressLine1: c.addressLine1 || '',
      addressLine2: c.addressLine2 || '',
      state: c.state || '',
      city: c.city || '',
      pinCode: c.pinCode || '',
      country: c.country || 'India',
      companyDate: c.companyDate ? c.companyDate.substring(0, 10) : '',
      category: c.category || '',
      customerSupporter: c.customerSupporter || '',
      contactName: c.contactName || '',
      contactEmail: c.contactEmail || '',
      contactPhone: c.contactPhone || '',
      landline: c.landline || '',
      gstin: c.gstin || '',
      pan: c.pan || '',
      billingCycle: c.billingCycle || 'Monthly',
      contractStartDate: c.contractStartDate ? c.contractStartDate.substring(0, 10) : '',
      contractEndDate: c.contractEndDate ? c.contractEndDate.substring(0, 10) : '',
      enablePortalLogin: c.enablePortalLogin !== undefined ? c.enablePortalLogin : false,
      portalEmail: c.portalEmail || '',
      portalPassword: '',
      assignedPackage: c.assignedPackage || '',
      isActive: c.isActive !== undefined ? c.isActive : true
    });

    // load existing users (strip out password for display, keep flag if password exists)
    const existingUsers = Array.isArray(c.users) ? c.users.map(u => ({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      contactNo: u.contactNo || '',
      designation: u.designation || '',
      displayName: u.displayName || '',
      password: '', // never prefill hashed/raw password
      hasPassword: !!u.password
    })) : [];
    setClientUsers(existingUsers);

    setLogoFile(null);
    setLogoPreview(c.companyLogo || null);
    setAgreementFile(null);
    setAgreementName(c.agreementDocument ? 'Existing document' : '');

    setEditingClientId(client._id || client.id);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingClientId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/clients/${deletingClientId}`);
      alert('Client deleted successfully');
      await fetchClients();
    } catch (error) {
      console.error(error);
      alert('Failed to delete client');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingClientId(null);
    }
  };

  const handleView = (client) => {
    setViewingClient(client);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingClientId(null);
    setFocusedField(null);
    setShowPortalPassword(false);
    setLogoFile(null);
    setLogoPreview(null);
    setAgreementFile(null);
    setAgreementName('');
    setClientUsers([]);
    setUserForm(initialUserState);
    setEditingUserIndex(null);
    setShowUserPassword(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilterCriteria({ clientCode: '', companyName: '', contactEmail: '', category: 'all', status: 'all' });
    setSearchQuery('');
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const query = searchQuery.toLowerCase();

      const matchesGlobalSearch =
        !query ||
        client.clientCode?.toLowerCase().includes(query) ||
        client.companyName?.toLowerCase().includes(query) ||
        client.displayName?.toLowerCase().includes(query) ||
        client.contactEmail?.toLowerCase().includes(query);

      const matchesCode = !filterCriteria.clientCode ||
        client.clientCode?.toLowerCase().includes(filterCriteria.clientCode.toLowerCase());

      const matchesCompany = !filterCriteria.companyName ||
        client.companyName?.toLowerCase().includes(filterCriteria.companyName.toLowerCase());

      const matchesEmail = !filterCriteria.contactEmail ||
        client.contactEmail?.toLowerCase().includes(filterCriteria.contactEmail.toLowerCase());

      const matchesCategory = filterCriteria.category === 'all'
        ? true
        : client.category === filterCriteria.category;

      const matchesStatus = filterCriteria.status === 'all'
        ? true
        : filterCriteria.status === 'active' ? client.isActive : !client.isActive;

      return matchesGlobalSearch && matchesCode && matchesCompany && matchesEmail && matchesCategory && matchesStatus;
    });
  }, [clients, filterCriteria, searchQuery]);

  const availableCities = STATE_CITIES[formData.state] || [];

  return (
    <div className="min-h-screen bg-[#f8fefd] text-slate-800 font-sans selection:bg-[#00D4AA]/30 selection:text-[#00D4AA]">
      <Header showNavigation={false} />

      <main className="max-w-7xl mx-auto px-8 py-12">

        <div className="flex items-center justify-between mb-10">
          {/* Left Side */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 transition-all active:scale-95"
          >
            <IoArrowBackOutline size={20} />
            <span>Back</span>
          </button>

          <button
            onClick={() => navigate('/client-bulkupload')}
            className="group flex items-center gap-2 px-6 py-3 bg-blue-600 text-slate-800 rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 overflow-hidden"
        >
            <FiUpload size={18} className="relative z-10" />
            <span className="relative z-10">Bulk Client Upload</span>
        </button>

        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8 animate-fade-in-up">
          <div className="md:w-1/2">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                <IoBusinessOutline size={24} className="text-[#00D4AA]" />
              </div>
              <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Client Management</h2>
            </div>
            <p className="text-slate-500 text-base leading-relaxed flex items-center gap-2">
              <IoGridOutline size={18} className="text-slate-400" />
              Manage client companies, contracts, billing, and portal access in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 lg:w-80">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Code, Company, Email..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>

            <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
              <button
                onClick={() => setViewType('list')}
                className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#00D4AA] text-[#060D1B]' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <IoListOutline size={20} />
              </button>
              <button
                onClick={() => setViewType('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-[#00D4AA] text-[#060D1B]' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <IoCardOutline size={20} />
              </button>
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2
                ${Object.values(filterCriteria).some(val => val && val !== 'all') || searchQuery
                  ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00D4AA]'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              <IoFilterOutline size={18} />
              <span>Filter</span>
            </button>

            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-[#060D1B] rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95 overflow-hidden"
            >
              <IoAdd size={18} className="relative z-10" />
              <span className="relative z-10">Create Client</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'TOTAL CLIENTS', val: clients.length, color: 'text-[#00D4AA]' },
            { label: 'ACTIVE', val: clients.filter(c => c.isActive).length, color: 'text-[#10B981]' },
            { label: 'CHANNEL PARTNERS', val: clients.filter(c => c.category === 'Channel Partner').length, color: 'text-purple-400' },
            { label: 'PORTAL ENABLED', val: clients.filter(c => c.enablePortalLogin).length, color: 'text-[#F5A623]' }
          ].map((stat, i) => (
            <div key={i} className="group relative p-6 rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all hover:border-slate-300 hover:shadow-lg">
              <div className="relative flex flex-col items-start justify-between h-full gap-2">
                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">{stat.label}</div>
                <div className={`text-5xl font-bold ${stat.color} tracking-tighter`}>{stat.val}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading clients...</div>
        ) : (
          <>
            {/* LIST VIEW */}
            {viewType === 'list' && (
              <div className="bg-white/70 border border-slate-200 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl animate-fade-in-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Client Code</th>
                        <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Company</th>
                        <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Category</th>
                        <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Billing</th>
                        <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase">Status</th>
                        <th className="p-5 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <tr key={client._id || client.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
                            <td className="p-5 font-mono text-sm text-slate-500">{client.clientCode}</td>
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-[#00D4AA] overflow-hidden">
                                  {client.companyLogo ? (
                                    <img src={client.companyLogo} alt="logo" className="w-full h-full object-cover" />
                                  ) : (
                                    client.companyName?.charAt(0)
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800 text-sm">{client.companyName}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{client.contactEmail || client.displayName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-5">
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border
                                ${client.category === 'Cat A' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                  client.category === 'Cat B' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  client.category === 'Channel Partner' ? 'bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/20' :
                                  'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                {client.category || '—'}
                              </span>
                            </td>
                            <td className="p-5 text-sm text-slate-500">{client.billingCycle}</td>
                            <td className="p-5">
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${client.isActive ? 'bg-[#10B981]' : 'bg-gray-600'}`}></div>
                                <span className="text-sm text-slate-500">{client.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleView(client)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] transition-all"><IoViewIcon size={18} /></button>
                                <button onClick={() => handleEdit(client)} className="p-2 rounded-lg hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] transition-all"><IoPencilOutline size={18} /></button>
                                <button onClick={() => handleDeleteClick(client._id || client.id)} className="p-2 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] transition-all"><IoTrashOutline size={18} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} className="p-16 text-center text-slate-500">No clients found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GRID VIEW */}
            {viewType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <div key={client._id || client.id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-200 to-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-[#00D4AA] overflow-hidden">
                            {client.companyLogo ? (
                              <img src={client.companyLogo} alt="logo" className="w-full h-full object-cover" />
                            ) : (
                              client.companyName?.charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">{client.companyName}</h3>
                            <p className="text-xs text-slate-400 font-mono">{client.clientCode}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase ${client.isActive ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/10' : 'border-gray-600 text-slate-400 bg-gray-500/10'}`}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="space-y-4 mb-6 flex-1">
                        <div className="flex items-center gap-3 text-xs text-slate-500"><IoGridOutline size={16} /> {client.category || '—'}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500"><IoBillingIcon size={16} /> {client.billingCycle}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 truncate"><IoMailOutline size={16} /> {client.contactEmail || '—'}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500"><IoLocationOutline size={16} /> {client.city || '—'}, {client.state || '—'}</div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(client)} className="text-xs font-medium flex items-center gap-1 hover:text-[#00D4AA]">View Details</button>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(client)} className="p-2 rounded-lg bg-slate-50 hover:bg-[#3B82F6] hover:text-slate-800 transition-all text-[#3B82F6]"><IoPencilOutline size={16} /></button>
                          <button onClick={() => handleDeleteClick(client._id || client.id)} className="p-2 rounded-lg bg-slate-50 hover:bg-[#FF5252] hover:text-slate-800 transition-all text-[#FF5252]"><IoTrashOutline size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-16 text-center text-slate-500">No clients found.</div>
                )}
              </div>
            )}
          </>
        )}

        {/* CREATE / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#060D1B]/90 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
            <div className="relative w-full max-w-4xl bg-white/95 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{editingClientId ? 'Edit Client' : 'New Client'}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{editingClientId ? 'Update Client Details' : 'Create New Client'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800 p-2"><IoCloseOutline size={26} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                {/* BASIC INFO */}
                <div className="space-y-6">
                  <SectionHeader title="Basic Information" color="#00D4AA" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput label="Client Code" name="clientCode" required icon={IoGridOutline} value={formData.clientCode} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <FloatingInput label="Company Name" name="companyName" required icon={IoBusinessOutline} value={formData.companyName} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <FloatingInput label="Display Name" name="displayName" icon={IoPersonOutline} value={formData.displayName} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <FloatingInput label="Industry" name="industry" icon={IoGridOutline} value={formData.industry} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <div className="md:col-span-2">
                      <FloatingInput label="Website" name="website" icon={IoGlobeOutline} value={formData.website} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">COMPANY LOGO</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
                        ) : (
                          <IoBusinessOutline size={28} className="text-slate-400" />
                        )}
                      </div>
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-dashed border-slate-200 hover:border-[#00D4AA]/50 bg-slate-50 transition-all">
                          <IoCloudUploadOutline size={22} className="text-[#00D4AA]" />
                          <span className="text-sm text-slate-500">Click to upload logo (JPG/PNG, max 2MB)</span>
                        </div>
                        <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleLogoChange} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* BRANCH DETAILS */}
                <div className="space-y-6">
                  <SectionHeader title="Branch Details" color="#8B5CF6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput label="Branch Name" name="branchName" icon={IoGitBranchOutline} value={formData.branchName} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <FloatingInput label="Branch Code" name="branchCode" icon={IoGridOutline} value={formData.branchCode} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">DESCRIPTION</label>
                    <textarea
                      name="branchDescription"
                      value={formData.branchDescription}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter branch description..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] text-slate-800 resize-none placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="space-y-6">
                  <SectionHeader title="Address" color="#3B82F6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <FloatingInput label="Address Line 1" name="addressLine1" icon={IoLocationOutline} value={formData.addressLine1} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    </div>
                    <div className="md:col-span-2">
                      <FloatingInput label="Address Line 2" name="addressLine2" icon={IoLocationOutline} value={formData.addressLine2} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">STATE</label>
                      <select name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA]">
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">CITY</label>
                      <select name="city" value={formData.city} onChange={handleInputChange} disabled={!formData.state} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] disabled:opacity-50">
                        <option value="">{formData.state ? 'Select City' : 'Select state first'}</option>
                        {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <FloatingInput label="Pin Code" name="pinCode" icon={IoLocationOutline} value={formData.pinCode} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">COUNTRY NAME</label>
                      <select name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA]">
                        <option value="">Select Country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* COMPANY DETAILS */}
                <div className="space-y-6">
                  <SectionHeader title="Company Details" color="#F5A623" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">COMPANY DATE</label>
                      <input type="date" name="companyDate" value={formData.companyDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">CATEGORY</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA]">
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* CUSTOMER SUPPORTER — dynamic from backend /employees */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-2">
                        CUSTOMER SUPPORTER <span className="text-[#FF5252]">*</span>
                      </label>
                      <select
                        name="customerSupporter"
                        value={formData.customerSupporter}
                        onChange={handleInputChange}
                        required
                        disabled={employeesLoading}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] disabled:opacity-50"
                      >
                        <option value="">
                          {employeesLoading ? 'Loading employees...' : 'Select Supporter'}
                        </option>
                        {employees.map(emp => (
                          <option key={emp._id || emp.id} value={getEmployeeDisplayName(emp)}>
                            {getEmployeeDisplayName(emp)}
                          </option>
                        ))}
                      </select>
                      {!employeesLoading && employees.length === 0 && (
                        <p className="text-xs text-[#FF5252] mt-1 flex items-center gap-1">
                          No employees found.{' '}
                          <button
                            type="button"
                            onClick={fetchEmployees}
                            className="underline hover:text-slate-800 transition-colors"
                          >
                            Retry
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* PRIMARY CONTACT */}
                <div className="space-y-6">
                  <SectionHeader title="Primary Contact" color="#00D4AA" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput label="Contact Name" name="contactName" icon={IoPersonOutline} value={formData.contactName} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <FloatingInput label="Contact Email" name="contactEmail" type="email" icon={IoMailOutline} value={formData.contactEmail} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <FloatingInput label="Contact Phone (Mobile)" name="contactPhone" type="tel" icon={IoCallOutline} value={formData.contactPhone} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <FloatingInput label="Landline" name="landline" type="tel" icon={IoCallOutline} value={formData.landline} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                  </div>
                </div>

                {/* CLIENT USERS */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <SectionHeader title="Client Users" color="#EC4899" />
                    <button
                      type="button"
                      onClick={openAddUserModal}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#EC4899]/10 hover:bg-[#EC4899]/20 border border-[#EC4899]/30 rounded-xl text-sm font-semibold text-[#EC4899] transition-all active:scale-95"
                    >
                      <IoPersonAddOutline size={18} />
                      <span>Add User</span>
                    </button>
                  </div>

                  {clientUsers.length > 0 ? (
                    <div className="space-y-3">
                      {clientUsers.map((u, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 border border-[#EC4899]/20 flex items-center justify-center text-sm font-bold text-[#EC4899] flex-shrink-0">
                              {(u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '')}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-800 text-sm truncate">
                                {u.firstName} {u.lastName}
                                {u.designation && (
                                  <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 uppercase">
                                    {u.designation}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-3">
                                <span className="flex items-center gap-1"><IoMailOutline size={12} /> {u.email || '—'}</span>
                                <span className="flex items-center gap-1"><IoCallOutline size={12} /> {u.contactNo || '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditUserModal(idx)}
                              className="p-2 rounded-lg hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] text-slate-500 transition-all"
                            >
                              <IoPencilOutline size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteUser(idx)}
                              className="p-2 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] text-slate-500 transition-all"
                            >
                              <IoTrashOutline size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                      <IoPeopleOutline size={32} className="text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No users added yet. Click "Add User" to add users for this client.</p>
                    </div>
                  )}
                </div>

                {/* TAX & BILLING */}
                <div className="space-y-6">
                  <SectionHeader title="Tax & Billing" color="#F5A623" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput label="GSTIN" name="gstin" icon={IoDocumentTextOutline} value={formData.gstin} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                    <FloatingInput label="PAN" name="pan" icon={IoDocumentTextOutline} value={formData.pan} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-3">BILLING CYCLE <span className="text-[#FF5252]">*</span></label>
                    <div className="grid grid-cols-3 gap-4">
                      {BILLING_CYCLES.map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, billingCycle: cycle }))}
                          className={`relative overflow-hidden py-3.5 rounded-xl border text-sm font-medium transition-all duration-300 ${formData.billingCycle === cycle ? 'border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA] shadow-[0_0_15px_rgba(0,212,170,0.1)]' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:text-slate-800'}`}
                        >
                          {cycle}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CONTRACT */}
                <div className="space-y-6">
                  <SectionHeader title="Client Agreement / Contract" color="#3B82F6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">CONTRACT START DATE</label>
                      <input type="date" name="contractStartDate" value={formData.contractStartDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">CONTRACT END DATE</label>
                      <input type="date" name="contractEndDate" value={formData.contractEndDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] text-slate-800" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">AGREEMENT DOCUMENT</label>
                    <label className="block cursor-pointer">
                      <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-dashed border-slate-200 hover:border-[#00D4AA]/50 bg-slate-50 transition-all">
                        <IoCloudUploadOutline size={22} className="text-[#00D4AA]" />
                        <span className="text-sm text-slate-500">{agreementName || 'PDF/DOC/Image, max 10MB'}</span>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={handleAgreementChange} />
                    </label>
                  </div>
                </div>

                {/* PORTAL ACCESS */}
                <div className="space-y-6">
                  <SectionHeader title="Client Portal Access" color="#10B981" />
                  <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#00D4AA]/5 to-transparent border border-[#00D4AA]/10">
                    <span className="text-sm font-semibold text-slate-800">Enable Portal Login for Client <span className="text-[#FF5252]">*</span></span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="enablePortalLogin" checked={formData.enablePortalLogin} onChange={handleInputChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D4AA]"></div>
                    </label>
                  </div>
                  {formData.enablePortalLogin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FloatingInput label="Portal Email" name="portalEmail" type="email" required icon={IoMailOutline} value={formData.portalEmail} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                      <FloatingInput
                        label="Portal Password"
                        name="portalPassword"
                        type="password"
                        required={!editingClientId}
                        icon={IoLockClosedOutline}
                        value={formData.portalPassword}
                        onChange={handleInputChange}
                        focusedField={focusedField}
                        setFocusedField={setFocusedField}
                        showPassword={showPortalPassword}
                        setShowPassword={setShowPortalPassword}
                      />
                    </div>
                  )}
                </div>

                {/* ASSIGNED PACKAGE — dynamic from backend /packages */}
                <div className="space-y-6">
                  <SectionHeader title="Assigned Package" color="#F5A623" />
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2 flex items-center gap-2">
                      <IoCubeOutline size={16} /> PACKAGE (available to this client when creating workorders)
                    </label>
                    <select
                      name="assignedPackage"
                      value={formData.assignedPackage}
                      onChange={handleInputChange}
                      disabled={packagesLoading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#00D4AA] disabled:opacity-50"
                    >
                      <option value="">
                        {packagesLoading ? 'Loading packages...' : 'Select Package'}
                      </option>
                      {packages.map(pkg => (
                        <option key={pkg._id || pkg.id} value={pkg.name || pkg.packageName || pkg.title}>
                          {pkg.name || pkg.packageName || pkg.title || 'Unnamed Package'}
                        </option>
                      ))}
                    </select>
                    {!packagesLoading && packages.length === 0 && (
                      <p className="text-xs text-[#FF5252] mt-1 flex items-center gap-1">
                        No packages found.{' '}
                        <button
                          type="button"
                          onClick={fetchPackages}
                          className="underline hover:text-slate-800 transition-colors"
                        >
                          Retry
                        </button>
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">The selected package will be used when creating workorders for this client.</p>
                  </div>
                </div>

                {/* STATUS */}
                <div className="space-y-6">
                  <SectionHeader title="Status" color="#10B981" />
                  <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#00D4AA]/5 to-transparent border border-[#00D4AA]/10">
                    <span className="text-sm font-semibold text-slate-800">Active</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D4AA]"></div>
                    </label>
                  </div>
                </div>

                <p className="text-xs text-slate-400">Fields marked with <span className="text-[#FF5252]">*</span> are required</p>

                {/* ACTIONS */}
                <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-xl font-bold text-[#060D1B] bg-[#00D4AA] hover:bg-[#00F0C0] transition-all flex justify-center items-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-[#060D1B] border-t-transparent animate-spin rounded-full"></div>
                    ) : editingClientId ? 'Update Client' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT USER MODAL */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#060D1B]/90 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)} />
            <div className="relative w-full max-w-2xl bg-white/95 border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EC4899]/10 flex items-center justify-center border border-[#EC4899]/20">
                    <IoPersonAddOutline size={20} className="text-[#EC4899]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{editingUserIndex !== null ? 'Edit User' : 'Add User'}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{editingUserIndex !== null ? 'Update User Details' : 'Create New User'}</p>
                  </div>
                </div>
                <button onClick={() => setIsUserModalOpen(false)} className="text-slate-500 hover:text-slate-800 p-2"><IoCloseOutline size={26} /></button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput label="First Name" name="firstName" required icon={IoPersonOutline} value={userForm.firstName} onChange={handleUserFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                  <FloatingInput label="Last Name" name="lastName" icon={IoPersonOutline} value={userForm.lastName} onChange={handleUserFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                  <FloatingInput label="Email" name="email" type="email" required icon={IoMailOutline} value={userForm.email} onChange={handleUserFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                  <FloatingInput label="Contact No" name="contactNo" type="tel" icon={IoCallOutline} value={userForm.contactNo} onChange={handleUserFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2 flex items-center gap-2">
                      <IoBriefcaseOutline size={14} /> DESIGNATION
                    </label>
                    <select name="designation" value={userForm.designation} onChange={handleUserFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#00D4AA]">
                      <option value="">Select Designation</option>
                      {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <FloatingInput label="Display Name" name="displayName" icon={IoPersonOutline} value={userForm.displayName} onChange={handleUserFormChange} focusedField={focusedField} setFocusedField={setFocusedField} />
                  <div className="md:col-span-2">
                    <FloatingInput
                      label={editingUserIndex !== null ? 'Password (leave blank to keep current)' : 'Password'}
                      name="password"
                      type="password"
                      required={editingUserIndex === null}
                      icon={IoLockClosedOutline}
                      value={userForm.password}
                      onChange={handleUserFormChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      showPassword={showUserPassword}
                      setShowPassword={setShowUserPassword}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400">Fields marked with <span className="text-[#FF5252]">*</span> are required</p>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveUser}
                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-800 bg-[#EC4899] hover:bg-[#F472B6] transition-all flex justify-center items-center gap-2 text-sm"
                  >
                    {editingUserIndex !== null ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#060D1B]/90 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white border border-red-500/20 rounded-2xl p-8 shadow-2xl animate-fade-in-up text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <IoTrashOutline size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Client?</h3>
              <p className="text-slate-500 text-sm mb-8">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-bold transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {isViewModalOpen && viewingClient && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#060D1B]/90 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
            <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-0 shadow-2xl animate-fade-in-up overflow-hidden max-h-[90vh] flex flex-col">
              <div className="h-28 bg-gradient-to-r from-[#00D4AA]/20 to-[#3B82F6]/20 relative flex items-end p-8 flex-shrink-0">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-[#00D4AA] shadow-xl text-2xl font-bold text-[#00D4AA] overflow-hidden">
                  {viewingClient.companyLogo ? (
                    <img src={viewingClient.companyLogo} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    viewingClient.companyName?.charAt(0)
                  )}
                </div>
              </div>
              <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{viewingClient.companyName}</h3>
                    <p className="text-sm text-slate-500 mt-1">{viewingClient.displayName || viewingClient.industry}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${viewingClient.isActive ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/10' : 'border-gray-600 text-slate-400 bg-gray-500/10'}`}>
                    {viewingClient.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Client Code', viewingClient.clientCode],
                    ['Category', viewingClient.category],
                    ['Industry', viewingClient.industry],
                    ['Website', viewingClient.website],
                    ['Branch Name', viewingClient.branchName],
                    ['Branch Code', viewingClient.branchCode],
                    ['Customer Supporter', viewingClient.customerSupporter],
                    ['Billing Cycle', viewingClient.billingCycle],
                    ['Contact Name', viewingClient.contactName],
                    ['Contact Email', viewingClient.contactEmail],
                    ['Contact Phone', viewingClient.contactPhone],
                    ['Landline', viewingClient.landline],
                    ['GSTIN', viewingClient.gstin],
                    ['PAN', viewingClient.pan],
                    ['City', viewingClient.city],
                    ['State', viewingClient.state],
                    ['Pin Code', viewingClient.pinCode],
                    ['Country', viewingClient.country],
                    ['Assigned Package', viewingClient.assignedPackage],
                    ['Portal Login', viewingClient.enablePortalLogin ? 'Enabled' : 'Disabled'],
                    ['Portal Email', viewingClient.portalEmail],
                    ['Contract Start', viewingClient.contractStartDate ? viewingClient.contractStartDate.substring(0, 10) : ''],
                    ['Contract End', viewingClient.contractEndDate ? viewingClient.contractEndDate.substring(0, 10) : '']
                  ].map(([label, val], i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-slate-500 text-xs mb-1">{label}</div>
                      <div className="text-slate-800 truncate">{val || '—'}</div>
                    </div>
                  ))}
                  <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                    <div className="text-slate-500 text-xs mb-1">Branch Description</div>
                    <div className="text-slate-800">{viewingClient.branchDescription || '—'}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                    <div className="text-slate-500 text-xs mb-1">Address</div>
                    <div className="text-slate-800">
                      {[viewingClient.addressLine1, viewingClient.addressLine2, viewingClient.city, viewingClient.state, viewingClient.pinCode]
                        .filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>
                </div>

                {/* USERS LIST IN VIEW */}
                {Array.isArray(viewingClient.users) && viewingClient.users.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <IoPeopleOutline size={18} className="text-[#EC4899]" />
                      <h4 className="text-sm font-bold text-slate-800">Client Users ({viewingClient.users.length})</h4>
                    </div>
                    <div className="space-y-3">
                      {viewingClient.users.map((u, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 border border-[#EC4899]/20 flex items-center justify-center text-sm font-bold text-[#EC4899] flex-shrink-0">
                            {(u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-slate-800 text-sm">
                              {u.firstName} {u.lastName}
                              {u.designation && (
                                <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 uppercase">
                                  {u.designation}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1"><IoMailOutline size={12} /> {u.email || '—'}</span>
                              <span className="flex items-center gap-1"><IoCallOutline size={12} /> {u.contactNo || '—'}</span>
                              {u.displayName && <span className="flex items-center gap-1"><IoPersonOutline size={12} /> {u.displayName}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setIsViewModalOpen(false)} className="w-full mt-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium transition-colors">Close Details</button>
              </div>
            </div>
          </div>
        )}

        {/* FILTER MODAL */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#060D1B]/90 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
            <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl animate-fade-in-up p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <IoFilterOutline className="text-[#00D4AA]" />Advanced Filter
                </h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-slate-500 hover:text-slate-800">
                  <IoCloseOutline size={24} />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Client Code</label>
                  <input type="text" name="clientCode" value={filterCriteria.clientCode} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-800" placeholder="e.g. CLT-001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Company Name</label>
                  <input type="text" name="companyName" value={filterCriteria.companyName} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-800" placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Contact Email</label>
                  <input type="email" name="contactEmail" value={filterCriteria.contactEmail} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-800" placeholder="e.g. contact@..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Category</label>
                  <select name="category" value={filterCriteria.category} onChange={handleFilterChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-800">
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['all', 'active', 'inactive'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFilterCriteria(prev => ({ ...prev, status: s }))}
                        className={`py-3 rounded-lg text-xs font-medium capitalize ${filterCriteria.status === s ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium"><IoRefreshOutline size={16} className="inline mr-1" />Clear</button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-[#060D1B] font-bold text-sm">Apply</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ClientManagement;
