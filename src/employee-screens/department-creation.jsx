import React, { useState, useEffect, useRef } from 'react';
import {
  IoAddOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoChevronForwardSharp,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoHomeOutline,
  IoEyeOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoInformationCircleOutline,
  IoFilterOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoMailOutline,
  IoCallOutline,
  IoArrowBackOutline,
  IoLocationOutline,
  IoShieldOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

const Departments = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [viewingDept, setViewingDept] = useState(null);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(getEmptyForm());
  const [teamFormData, setTeamFormData] = useState(getEmptyTeamForm());
  const [teamErrors, setTeamErrors] = useState({});
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  // View Users state
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedDeptForUsers, setSelectedDeptForUsers] = useState(null);
  const [deptUsersData, setDeptUsersData] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSortConfig, setUserSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  // View Teams state
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [selectedDeptForTeams, setSelectedDeptForTeams] = useState(null);
  const [deptTeamsData, setDeptTeamsData] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [teamStatusFilter, setTeamStatusFilter] = useState('all');
  const [teamSortConfig, setTeamSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [teamCurrentPage, setTeamCurrentPage] = useState(1);
  const [teamPageSize, setTeamPageSize] = useState(10);

  // ─── Fetch departments ──────────────────────────────────────────────
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments.map(d => ({ ...d, id: d._id })));
      }
    } catch (error) {
      console.error('Fetch departments error:', error);
      setNotification({ type: 'error', message: 'Failed to load departments' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCreateDropdown(false);
      }
    };
    if (showCreateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCreateDropdown]);

  function getEmptyForm() {
    return { id: null, name: '', active: true };
  }

  function getEmptyTeamForm() {
    return { id: null, name: '', departmentId: '', lead: '', memberCount: '', active: true };
  }

  const stats = {
    total: departments.length,
    active: departments.filter(d => d.active).length,
    inactive: departments.filter(d => !d.active).length
  };

  const filteredDepts = departments.filter(dept => {
    const query = searchQuery.toLowerCase();
    return !query || dept.name.toLowerCase().includes(query);
  });

  const sortedDepts = [...filteredDepts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedDepts.length / pageSize) || 1;
  const paginatedDepts = sortedDepts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  // Modal opening functions
  const openCreateModal = () => {
    setEditingDept(null);
    setFormData(getEmptyForm());
    setErrors({});
    requestAnimationFrame(() => setShowCreateModal(true));
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({ id: dept.id, name: dept.name, active: dept.active });
    setErrors({});
    requestAnimationFrame(() => setShowCreateModal(true));
  };

  const openViewModal = (dept) => {
    setViewingDept(dept);
    requestAnimationFrame(() => setShowViewModal(true));
  };

  const closeCreateModal = () => {
    if (!isSubmitting) {
      setShowCreateModal(false);
      setEditingDept(null);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingDept(null);
  };

  const openTeamModal = () => {
    setTeamFormData(getEmptyTeamForm());
    setTeamErrors({});
    requestAnimationFrame(() => setShowTeamModal(true));
  };

  const closeTeamModal = () => {
    if (!isSubmittingTeam) {
      setShowTeamModal(false);
    }
  };

  // View Users functions
  const openUsersModal = async (dept) => {
    setSelectedDeptForUsers(dept);
    setUserSearchQuery('');
    setUserStatusFilter('all');
    setUserRoleFilter('all');
    setUserCurrentPage(1);
    setDeptUsersData([]);
    requestAnimationFrame(() => setShowUsersModal(true));
    setUsersLoading(true);
    try {
      const res = await api.get(`/departments/${dept.id}/users`);
      if (res.data.success) setDeptUsersData(res.data.users || []);
    } catch (error) {
      console.error('Fetch dept users error:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const closeUsersModal = () => {
    setShowUsersModal(false);
    setSelectedDeptForUsers(null);
    setDeptUsersData([]);
  };

  const handleUserSort = (key) => setUserSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const getDeptUsers = () => {
    let list = [...deptUsersData];

    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    }

    if (userStatusFilter !== 'all') {
      list = list.filter(u => u.status === userStatusFilter);
    }

    if (userRoleFilter !== 'all') {
      list = list.filter(u => u.role === userRoleFilter);
    }

    list = list.sort((a, b) => {
      if (a[userSortConfig.key] < b[userSortConfig.key]) return userSortConfig.direction === 'asc' ? -1 : 1;
      if (a[userSortConfig.key] > b[userSortConfig.key]) return userSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  };

  const deptUsers = getDeptUsers();
  const userTotalPages = Math.ceil(deptUsers.length / userPageSize) || 1;
  const paginatedUsers = deptUsers.slice((userCurrentPage - 1) * userPageSize, userCurrentPage * userPageSize);

  const getUserPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, userCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(userTotalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const uniqueRoles = [...new Set(deptUsersData.map(u => u.role).filter(Boolean))];

  // View Teams functions
  const openTeamsModal = async (dept) => {
    setSelectedDeptForTeams(dept);
    setTeamSearchQuery('');
    setTeamStatusFilter('all');
    setTeamCurrentPage(1);
    setDeptTeamsData([]);
    requestAnimationFrame(() => setShowTeamsModal(true));
    setTeamsLoading(true);
    try {
      const res = await api.get(`/teams?departmentId=${dept.id}`);
      if (res.data.success) setDeptTeamsData(res.data.teams.map(t => ({ ...t, id: t._id })));
    } catch (error) {
      console.error('Fetch dept teams error:', error);
    } finally {
      setTeamsLoading(false);
    }
  };

  const closeTeamsModal = () => {
    setShowTeamsModal(false);
    setSelectedDeptForTeams(null);
    setDeptTeamsData([]);
  };

  const handleTeamSort = (key) => setTeamSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const getDeptTeams = () => {
    let list = [...deptTeamsData];

    if (teamSearchQuery) {
      const q = teamSearchQuery.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.lead || '').toLowerCase().includes(q)
      );
    }

    if (teamStatusFilter !== 'all') {
      list = list.filter(t => t.active === (teamStatusFilter === 'active'));
    }

    list = list.sort((a, b) => {
      if (a[teamSortConfig.key] < b[teamSortConfig.key]) return teamSortConfig.direction === 'asc' ? -1 : 1;
      if (a[teamSortConfig.key] > b[teamSortConfig.key]) return teamSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  };

  const deptTeams = getDeptTeams();
  const teamTotalPages = Math.ceil(deptTeams.length / teamPageSize) || 1;
  const paginatedTeams = deptTeams.slice((teamCurrentPage - 1) * teamPageSize, teamCurrentPage * teamPageSize);

  const getTeamPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, teamCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(teamTotalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Department name is required';
    else if (formData.name.trim().length < 2) e.name = 'Must be at least 2 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Create / Update Department via API ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (editingDept) {
        const res = await api.put(`/departments/${editingDept.id}`, {
          name: formData.name.trim(),
          active: formData.active
        });
        if (res.data.success) {
          await fetchDepartments();
          setNotification({ type: 'success', message: 'Department updated successfully!' });
        }
      } else {
        const res = await api.post('/departments', {
          name: formData.name.trim(),
          active: formData.active
        });
        if (res.data.success) {
          await fetchDepartments();
          setNotification({ type: 'success', message: 'Department created successfully!' });
        }
      }
      closeCreateModal();
    } catch (error) {
      console.error('Submit department error:', error);
      setNotification({ type: 'error', message: error.response?.data?.message || 'Operation failed' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // ─── Delete Department via API ──────────────────────────────────────
  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      const res = await api.delete(`/departments/${id}`);
      if (res.data.success) {
        await fetchDepartments();
        setNotification({ type: 'success', message: 'Department deleted successfully!' });
      }
    } catch (error) {
      console.error('Delete department error:', error);
      setNotification({ type: 'error', message: error.response?.data?.message || 'Delete failed' });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleTeamFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeamFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (teamErrors[name]) setTeamErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateTeamForm = () => {
    const e = {};
    if (!teamFormData.name.trim()) e.name = 'Team name is required';
    else if (teamFormData.name.trim().length < 2) e.name = 'Must be at least 2 characters';
    if (!teamFormData.departmentId) e.departmentId = 'Please select a department';
    setTeamErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Create Team via API ────────────────────────────────────────────
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (!validateTeamForm()) return;
    setIsSubmittingTeam(true);
    try {
      const res = await api.post('/teams', {
        name: teamFormData.name.trim(),
        departmentId: teamFormData.departmentId,
        lead: teamFormData.lead,
        memberCount: teamFormData.memberCount,
        active: teamFormData.active
      });
      if (res.data.success) {
        await fetchDepartments();
        setNotification({ type: 'success', message: 'Team created successfully!' });
      }
      closeTeamModal();
    } catch (error) {
      console.error('Submit team error:', error);
      setNotification({ type: 'error', message: error.response?.data?.message || 'Operation failed' });
    } finally {
      setIsSubmittingTeam(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Pagination page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Reusable section header component
  const SectionHeader = ({ title, color = '#00D4AA' }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-4 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
    </div>
  );

  // Reusable toggle row component
  const ToggleRow = ({ icon: Icon, title, subtitle, checked, onChange, name }) => (
    <div className="flex items-center justify-between py-4 px-5 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center">
          <Icon size={18} className="text-[#00D4AA]" />
        </div>
        <div>
          <div className="text-sm font-medium text-black">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00D4AA] peer-checked:after:translate-x-full"></div>
      </label>
    </div>
  );

  // User status badge
  const UserStatusBadge = ({ status }) => (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
      <span className={`text-xs font-medium ${status === 'active' ? 'text-[#10B981]' : 'text-gray-500'}`}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </span>
    </div>
  );

  // Team status badge
  const TeamStatusBadge = ({ active }) => (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
      <span className={`text-xs font-medium ${active ? 'text-[#10B981]' : 'text-gray-500'}`}>
        {active ? 'Active' : 'Inactive'}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fefd] text-black font-sans selection:bg-[#00D4AA]/30 selection:text-[#00D4AA]">
      <Header showNavigation={false} />

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in border ${notification.type === 'success' ? 'bg-white border-[#00D4AA]/30 text-[#00D4AA]' : 'bg-white border-red-300 text-red-600'}`}>
          <IoCheckmarkCircleOutline size={20} />
          <span className="text-sm font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
            <IoCloseOutline size={16} />
          </button>
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

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-8 animate-fade-in-up">
          <div className="lg:w-1/2">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                <IoBusinessOutline size={24} className="text-[#00D4AA]" />
              </div>
            </div>
            <p className="text-gray-600 text-base leading-relaxed flex items-center gap-2">
              <IoLayersOutline size={18} className="text-gray-400" />
              Manage BGV departments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { label: 'TOTAL', val: stats.total, color: 'text-[#00D4AA]', bc: 'border-[#00D4AA]/20', bg: 'bg-[#00D4AA]/5' },
              { label: 'ACTIVE', val: stats.active, color: 'text-[#10B981]', bc: 'border-[#10B981]/20', bg: 'bg-[#10B981]/5' },
              { label: 'INACTIVE', val: stats.inactive, color: 'text-[#64748B]', bc: 'border-[#64748B]/20', bg: 'bg-[#64748B]/5' }
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${s.bc} ${s.bg}`}>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</span>
                <span className={`text-2xl font-bold ${s.color} tracking-tight`}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 animate-fade-in-up relative" style={{ animationDelay: '0.1s', zIndex: 50 }}>

          {/* Search Input */}
          <div className="relative flex-1 md:w-72 lg:w-80">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search Department Name..."
              className="w-full bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-black placeholder-gray-400 transition-all"
            />
          </div>

          {/* CREATE DROPDOWN BUTTON */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowCreateDropdown(prev => !prev)}
              className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${showCreateDropdown ? 'bg-[#00D4AA] text-white shadow-[0_0_20px_rgba(0,212,170,0.4)]' : 'bg-[#00D4AA] text-white hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95'}`}
            >
              <IoAddOutline size={18} />
              <span>Create</span>
              <IoChevronDownOutline size={16} className={`transition-transform duration-200 ${showCreateDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU */}
            {showCreateDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ zIndex: 9999 }}>
                <div className="px-5 py-3.5 bg-gradient-to-r from-[#00D4AA] to-[#00B894] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoLayersOutline size={18} className="text-white" />
                    <span className="text-white font-bold text-sm">Create New</span>
                  </div>
                  <IoChevronUpOutline size={16} className="text-white" />
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateDropdown(false); openCreateModal(); }}
                    className="w-full flex items-start gap-4 px-4 py-4 text-left rounded-xl hover:bg-gray-50 transition-all group/item cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-11 h-11 rounded-lg bg-[#00D4AA]/20 border border-[#00D4AA]/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-[#00D4AA]/25 transition-colors">
                      <IoBusinessOutline size={22} className="text-[#00D4AA]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-semibold text-[15px] mb-1">Create Department</div>
                      <div className="text-gray-500 text-xs leading-relaxed">Add a new BGV department to manage teams and resources</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreateDropdown(false); openTeamModal(); }}
                    className="w-full flex items-start gap-4 px-4 py-4 text-left rounded-xl hover:bg-gray-50 transition-all group/item cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-[#3B82F6]/25 transition-colors">
                      <IoPeopleOutline size={22} className="text-[#3B82F6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-black font-semibold text-[15px] mb-1">Create Team</div>
                      <div className="text-gray-500 text-xs leading-relaxed">Add sub-team under existing department structure</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>
            Loading departments...
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        Department Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}
                      </div>
                    </th>
                    <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase">Status</th>
                    <th className="p-5 text-xs font-bold text-gray-500 tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDepts.length > 0 ? paginatedDepts.map((dept) => (
                    <tr key={dept.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                      <td className="p-5">
                        <div className="font-medium text-black text-sm">{dept.name}</div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${dept.active ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                          <span className={`text-sm ${dept.active ? 'text-[#10B981]' : 'text-gray-500'}`}>{dept.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openViewModal(dept)} className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all text-gray-500" title="View"><IoEyeOutline size={18} /></button>
                          <button onClick={() => openUsersModal(dept)} className="p-2 rounded-lg hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6] transition-all text-gray-500" title="View Users"><IoPeopleOutline size={18} /></button>
                          <button onClick={() => openTeamsModal(dept)} className="p-2 rounded-lg hover:bg-[#F59E0B]/10 hover:text-[#F59E0B] transition-all text-gray-500" title="View Teams"><IoShieldOutline size={18} /></button>
                          <button onClick={() => openEditModal(dept)} className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00D4AA] transition-all text-gray-500" title="Edit"><IoCreateOutline size={18} /></button>
                          <button onClick={() => handleDeleteClick(dept.id)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all text-gray-500" title="Delete"><IoTrashOutline size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="p-16 text-center text-gray-500">No departments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Page Size</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-black text-xs focus:outline-none focus:border-[#00D4AA]">
                  {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">First</button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Prev</button>
                {getPageNumbers().map((pageNum) => (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-[#00D4AA] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-black'}`}>{pageNum}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Next</button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Last</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== MODALS ==================== */}

      {/* NEW / EDIT DEPARTMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); if (!isSubmitting) closeCreateModal(); }} />
          <div className="relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-200" style={{ maxWidth: '560px' }}>
            <div className="px-8 pt-8 pb-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-black tracking-tight">{editingDept ? 'Edit Department' : 'New Department'}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{editingDept ? 'Update department details' : 'Add a new department to the system'}</p>
              </div>
              <button type="button" onClick={closeCreateModal} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-black" aria-label="Close">
                <IoCloseOutline size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-8">
                <SectionHeader title="Department Information" color="#00D4AA" />
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g., Operations, QC, Finance" className={`w-full px-4 py-3 bg-white border ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#00D4AA]'} rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none transition-colors`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                  {!errors.name && <p className="text-gray-400 text-xs mt-1.5">e.g., Operations, QC, Finance</p>}
                </div>
              </div>
              <div className="px-8 pb-6">
                <SectionHeader title="Status" color="#10B981" />
                <ToggleRow icon={IoCheckmarkCircleOutline} title="Active Status" subtitle="Mark this department as active in the system" checked={formData.active} onChange={handleFormChange} name="active" />
              </div>
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={closeCreateModal} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-black transition-all disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className={`px-6 py-2.5 rounded-xl font-medium text-sm text-white transition-all shadow-lg flex items-center gap-2 ${isSubmitting ? 'bg-[#00D4AA]/50 cursor-not-allowed' : 'bg-[#00D4AA] hover:bg-[#00B894]'}`}>
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : (editingDept ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DEPARTMENT MODAL */}
      {showViewModal && viewingDept && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); closeViewModal(); }} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-200">
            <div className="px-8 pt-8 pb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center">
                  <IoBusinessOutline size={24} className="text-[#00D4AA]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black tracking-tight">{viewingDept.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Department</p>
                </div>
              </div>
              <button onClick={closeViewModal} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-black" aria-label="Close">
                <IoCloseOutline size={20} />
              </button>
            </div>
            <div className="px-8 pb-6 space-y-6">
              <SectionHeader title="Details" color="#00D4AA" />
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Current Status</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${viewingDept.active ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                  <span className={`text-base font-bold ${viewingDept.active ? 'text-[#10B981]' : 'text-gray-500'}`}>{viewingDept.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-sm text-gray-500">Created Date</span><span className="text-sm font-semibold text-black">{viewingDept.createdAt ? new Date(viewingDept.createdAt).toISOString().split('T')[0] : '—'}</span></div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-sm text-gray-500">Total Teams</span><span className="text-sm font-semibold text-black">{viewingDept.teamCount ?? 0}</span></div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-sm text-gray-500">Total Users</span><span className="text-sm font-semibold text-black">{viewingDept.userCount ?? 0}</span></div>
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={closeViewModal} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 hover:text-black transition-all">Close</button>
              <button onClick={() => { closeViewModal(); openEditModal(viewingDept); }} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-white font-bold text-sm hover:bg-[#00B894] transition-all shadow-lg shadow-[#00D4AA]/10">Edit Department</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TEAMS MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); if (!isSubmittingTeam) closeTeamModal(); }} />
          <div className="relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-200" style={{ maxWidth: '560px' }}>
            <div className="px-8 pt-8 pb-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-black tracking-tight">New Teams</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Add a new team under a department</p>
              </div>
              <button type="button" onClick={closeTeamModal} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-black" aria-label="Close">
                <IoCloseOutline size={20} />
              </button>
            </div>
            <form onSubmit={handleTeamSubmit}>
              <div className="px-8">
                <SectionHeader title="Team Information" color="#00D4AA" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={teamFormData.name} onChange={handleTeamFormChange} placeholder="Enter team name..." className={`w-full px-4 py-3 bg-white border ${teamErrors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#00D4AA]'} rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none transition-colors`} />
                    {teamErrors.name && <p className="text-red-500 text-xs mt-1.5">{teamErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select name="departmentId" value={teamFormData.departmentId} onChange={handleTeamFormChange} className={`w-full px-4 py-3 bg-white border ${teamErrors.departmentId ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#00D4AA]'} rounded-xl text-sm text-black focus:outline-none transition-colors appearance-none pr-10`}>
                        <option value="" className="bg-white text-gray-400">Select...</option>
                        {departments.filter(d => d.active).map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                      </select>
                      <IoChevronDownOutline size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {teamErrors.departmentId && <p className="text-red-500 text-xs mt-1.5">{teamErrors.departmentId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Lead</label>
                    <input type="text" name="lead" value={teamFormData.lead} onChange={handleTeamFormChange} placeholder="Enter team lead name..." className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Count</label>
                    <input type="number" name="memberCount" value={teamFormData.memberCount} onChange={handleTeamFormChange} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-gray-200 focus:border-[#00D4AA] rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>
              <div className="px-8 pb-6">
                <SectionHeader title="Status" color="#10B981" />
                <ToggleRow icon={IoCheckmarkCircleOutline} title="Active Status" subtitle="Mark this team as active in the system" checked={teamFormData.active} onChange={handleTeamFormChange} name="active" />
              </div>
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={closeTeamModal} disabled={isSubmittingTeam} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-black transition-all disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmittingTeam} className={`px-6 py-2.5 rounded-xl font-medium text-sm text-white transition-all shadow-lg flex items-center gap-2 ${isSubmittingTeam ? 'bg-[#00D4AA]/50 cursor-not-allowed' : 'bg-[#00D4AA] hover:bg-[#00B894]'}`}>
                  {isSubmittingTeam ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USERS MODAL */}
      {showUsersModal && selectedDeptForUsers && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); closeUsersModal(); }} />
          <div className="relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-200 flex flex-col" style={{ maxWidth: '960px', maxHeight: '90vh' }}>

            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center">
                  <IoPeopleOutline size={24} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black tracking-tight">Users</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Department: {selectedDeptForUsers.name} · Total: {deptUsers.length} users</p>
                </div>
              </div>
              <button onClick={closeUsersModal} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-black" aria-label="Close">
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Filters Toolbar */}
            <div className="px-8 pb-4 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1 md:max-w-xs">
                  <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => { setUserSearchQuery(e.target.value); setUserCurrentPage(1); }}
                    placeholder="Search by name, email, role..."
                    className="w-full bg-white border border-gray-200 focus:border-[#8B5CF6] rounded-xl pl-11 pr-4 py-2.5 outline-none text-sm text-black placeholder-gray-400 transition-all"
                  />
                </div>
                <div className="relative">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => { setUserStatusFilter(e.target.value); setUserCurrentPage(1); }}
                    className="appearance-none bg-white border border-gray-200 focus:border-[#8B5CF6] rounded-xl pl-4 pr-10 py-2.5 text-sm text-black outline-none transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <IoChevronDownOutline size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => { setUserRoleFilter(e.target.value); setUserCurrentPage(1); }}
                    className="appearance-none bg-white border border-gray-200 focus:border-[#8B5CF6] rounded-xl pl-4 pr-10 py-2.5 text-sm text-black outline-none transition-all cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <IoChevronDownOutline size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {(userSearchQuery || userStatusFilter !== 'all' || userRoleFilter !== 'all') && (
                  <button
                    onClick={() => { setUserSearchQuery(''); setUserStatusFilter('all'); setUserRoleFilter('all'); setUserCurrentPage(1); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 hover:text-black transition-all"
                  >
                    <IoCloseOutline size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="flex-1 overflow-auto px-8 pb-4 min-h-0">
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleUserSort('name')}>
                          <div className="flex items-center gap-1">Name {userSortConfig.key === 'name' && (userSortConfig.direction === 'asc' ? <IoChevronUpOutline size={10} /> : <IoChevronDownOutline size={10} />)}</div>
                        </th>
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleUserSort('role')}>
                          <div className="flex items-center gap-1">Role {userSortConfig.key === 'role' && (userSortConfig.direction === 'asc' ? <IoChevronUpOutline size={10} /> : <IoChevronDownOutline size={10} />)}</div>
                        </th>
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase">Contact</th>
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleUserSort('status')}>
                          <div className="flex items-center gap-1">Status {userSortConfig.key === 'status' && (userSortConfig.direction === 'asc' ? <IoChevronUpOutline size={10} /> : <IoChevronDownOutline size={10} />)}</div>
                        </th>
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleUserSort('joinedAt')}>
                          <div className="flex items-center gap-1">Joined {userSortConfig.key === 'joinedAt' && (userSortConfig.direction === 'asc' ? <IoChevronUpOutline size={10} /> : <IoChevronDownOutline size={10} />)}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr><td colSpan={5} className="p-16 text-center text-gray-500"><div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent animate-spin rounded-full mx-auto mb-2"></div>Loading users...</td></tr>
                      ) : paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] text-xs font-bold">
                                {(user.name || '?').split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-black text-sm">{user.name}</div>
                                {user.location && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <IoLocationOutline size={10} />
                                    {user.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-medium">
                              {user.role || '—'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                <IoMailOutline size={11} className="text-gray-400" />
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                <IoCallOutline size={11} className="text-gray-400" />
                                {user.phone || '—'}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <UserStatusBadge status={user.status} />
                          </td>
                          <td className="p-4">
                            <div className="text-xs text-gray-500 flex items-center gap-1.5">
                              <IoCalendarOutline size={11} className="text-gray-400" />
                              {user.joinedAt || '—'}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="p-16 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                              <IoPeopleOutline size={40} className="text-gray-300" />
                              <p>No users found for this department.</p>
                              {(userSearchQuery || userStatusFilter !== 'all' || userRoleFilter !== 'all') && (
                                <button onClick={() => { setUserSearchQuery(''); setUserStatusFilter('all'); setUserRoleFilter('all'); }} className="text-[#8B5CF6] hover:text-[#A78BFA] text-sm transition-colors">
                                  Clear filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer / Pagination */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Page Size</span>
                <select value={userPageSize} onChange={(e) => { setUserPageSize(Number(e.target.value)); setUserCurrentPage(1); }} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-black text-xs focus:outline-none focus:border-[#8B5CF6]">
                  {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="ml-2">Showing {deptUsers.length} results</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setUserCurrentPage(1)} disabled={userCurrentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">First</button>
                <button onClick={() => setUserCurrentPage(p => Math.max(1, p - 1))} disabled={userCurrentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Prev</button>
                {getUserPageNumbers().map((pageNum) => (
                  <button key={pageNum} onClick={() => setUserCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${userCurrentPage === pageNum ? 'bg-[#8B5CF6] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-black'}`}>{pageNum}</button>
                ))}
                <button onClick={() => setUserCurrentPage(p => Math.min(userTotalPages, p + 1))} disabled={userCurrentPage === userTotalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Next</button>
                <button onClick={() => setUserCurrentPage(userTotalPages)} disabled={userCurrentPage === userTotalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Last</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TEAMS MODAL */}
      {showTeamsModal && selectedDeptForTeams && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); closeTeamsModal(); }} />
          <div className="relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-200 flex flex-col" style={{ maxWidth: '960px', maxHeight: '90vh' }}>

            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
                  <IoShieldOutline size={24} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black tracking-tight">Teams</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Department: {selectedDeptForTeams.name} · Total: {deptTeams.length} teams</p>
                </div>
              </div>
              <button onClick={closeTeamsModal} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-black" aria-label="Close">
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Filters Toolbar */}
            <div className="px-8 pb-4 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1 md:max-w-xs">
                  <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={teamSearchQuery}
                    onChange={(e) => { setTeamSearchQuery(e.target.value); setTeamCurrentPage(1); }}
                    placeholder="Search by team name, lead..."
                    className="w-full bg-white border border-gray-200 focus:border-[#F59E0B] rounded-xl pl-11 pr-4 py-2.5 outline-none text-sm text-black placeholder-gray-400 transition-all"
                  />
                </div>
                <div className="relative">
                  <select
                    value={teamStatusFilter}
                    onChange={(e) => { setTeamStatusFilter(e.target.value); setTeamCurrentPage(1); }}
                    className="appearance-none bg-white border border-gray-200 focus:border-[#F59E0B] rounded-xl pl-4 pr-10 py-2.5 text-sm text-black outline-none transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <IoChevronDownOutline size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {(teamSearchQuery || teamStatusFilter !== 'all') && (
                  <button
                    onClick={() => { setTeamSearchQuery(''); setTeamStatusFilter('all'); setTeamCurrentPage(1); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 hover:text-black transition-all"
                  >
                    <IoCloseOutline size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Teams Table */}
            <div className="flex-1 overflow-auto px-8 pb-4 min-h-0">
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleTeamSort('name')}>
                          <div className="flex items-center gap-1">Team Name {teamSortConfig.key === 'name' && (teamSortConfig.direction === 'asc' ? <IoChevronUpOutline size={10} /> : <IoChevronDownOutline size={10} />)}</div>
                        </th>
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase">Team Lead</th>
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase text-center">Members</th>
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleTeamSort('active')}>
                          <div className="flex items-center gap-1">Status {teamSortConfig.key === 'active' && (teamSortConfig.direction === 'asc' ? <IoChevronUpOutline size={10} /> : <IoChevronDownOutline size={10} />)}</div>
                        </th>
                        <th className="p-4 text-xs font-bold text-gray-500 tracking-wider uppercase cursor-pointer" onClick={() => handleTeamSort('createdAt')}>
                          <div className="flex items-center gap-1">Created {teamSortConfig.key === 'createdAt' && (teamSortConfig.direction === 'asc' ? <IoChevronUpOutline size={10} /> : <IoChevronDownOutline size={10} />)}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamsLoading ? (
                        <tr><td colSpan={5} className="p-16 text-center text-gray-500"><div className="w-6 h-6 border-2 border-[#F59E0B] border-t-transparent animate-spin rounded-full mx-auto mb-2"></div>Loading teams...</td></tr>
                      ) : paginatedTeams.length > 0 ? paginatedTeams.map((team) => (
                        <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                                <IoShieldOutline size={14} />
                              </div>
                              <div>
                                <div className="font-medium text-black text-sm">{team.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {team.lead ? (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] text-[10px] font-bold">
                                    {team.lead.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <span className="text-sm text-gray-600">{team.lead}</span>
                                </>
                              ) : <span className="text-sm text-gray-400">—</span>}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-medium">
                              {team.memberCount} members
                            </span>
                          </td>
                          <td className="p-4">
                            <TeamStatusBadge active={team.active} />
                          </td>
                          <td className="p-4">
                            <div className="text-xs text-gray-500 flex items-center gap-1.5">
                              <IoCalendarOutline size={11} className="text-gray-400" />
                              {team.createdAt ? new Date(team.createdAt).toISOString().split('T')[0] : '—'}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="p-16 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                              <IoShieldOutline size={40} className="text-gray-300" />
                              <p>No teams found for this department.</p>
                              {(teamSearchQuery || teamStatusFilter !== 'all') && (
                                <button onClick={() => { setTeamSearchQuery(''); setTeamStatusFilter('all'); }} className="text-[#F59E0B] hover:text-[#FBBF24] text-sm transition-colors">
                                  Clear filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer / Pagination */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Page Size</span>
                <select value={teamPageSize} onChange={(e) => { setTeamPageSize(Number(e.target.value)); setTeamCurrentPage(1); }} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-black text-xs focus:outline-none focus:border-[#F59E0B]">
                  {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="ml-2">Showing {deptTeams.length} results</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setTeamCurrentPage(1)} disabled={teamCurrentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">First</button>
                <button onClick={() => setTeamCurrentPage(p => Math.max(1, p - 1))} disabled={teamCurrentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Prev</button>
                {getTeamPageNumbers().map((pageNum) => (
                  <button key={pageNum} onClick={() => setTeamCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${teamCurrentPage === pageNum ? 'bg-[#F59E0B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-black'}`}>{pageNum}</button>
                ))}
                <button onClick={() => setTeamCurrentPage(p => Math.min(teamTotalPages, p + 1))} disabled={teamCurrentPage === teamTotalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Next</button>
                <button onClick={() => setTeamCurrentPage(teamTotalPages)} disabled={teamCurrentPage === teamTotalPages} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 hover:text-black disabled:opacity-30 transition-colors">Last</button>
              </div>
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

export default Departments;