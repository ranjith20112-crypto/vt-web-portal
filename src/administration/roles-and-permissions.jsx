import React, { useState, useEffect, useRef } from 'react';
import {
    IoSearchOutline,
    IoFilterOutline,
    IoCloseOutline,
    IoCreateOutline,
    IoTrashOutline,
    IoChevronDownOutline,
    IoChevronUpOutline,
    IoCheckmarkCircleOutline,
    IoSaveOutline,
    IoArrowBackOutline,
    IoShieldCheckmarkOutline,
    IoPeopleOutline,
    IoKeyOutline,
    IoSwapHorizontalOutline,
    IoBusinessOutline,
    IoPersonOutline,
    IoAddOutline,
    IoLockOpenOutline,
    IoInfiniteOutline,
    IoSyncOutline,
    IoAlertCircleOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';
import { appRoutesPayload } from '../routes/appRoutes';

const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

const UserAccessManagement = () => {
    const navigate = useNavigate();

    const [activeView, setActiveView] = useState('employees'); // 'employees' | 'vendors'
    const [employees, setEmployees] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]); // fetched live from /api/modules — no hardcoded list
    const [loading, setLoading] = useState(true);
    const [isSyncingModules, setIsSyncingModules] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ role: 'all', status: 'all' });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [showViewPopup, setShowViewPopup] = useState(false);
    const [showRolesPanel, setShowRolesPanel] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showSetAccessModal, setShowSetAccessModal] = useState(false);

    const [editingRole, setEditingRole] = useState(null);
    const [accessTarget, setAccessTarget] = useState(null); // the employee/vendor being assigned

    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [roleForm, setRoleForm] = useState({ roleName: '', description: '' });
    const [rolePermMatrix, setRolePermMatrix] = useState([]);

    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [useCustomPerms, setUseCustomPerms] = useState(false);
    const [accessPermMatrix, setAccessPermMatrix] = useState([]);

    const roleModalRef = useRef(null);
    const accessModalRef = useRef(null);
    const viewBtnRef = useRef(null);

    function buildEmptyMatrix(moduleList) {
        return moduleList.map((m) => ({
            moduleKey: m.moduleKey, moduleName: m.moduleName, moduleGroup: m.moduleGroup,
            view: false, create: false, edit: false, delete: false, approve: false, export: false
        }));
    }

    // ─── Fetch data ─────────────────────────────────────────────────────
    const fetchModules = async () => {
        try { const res = await api.get('/modules'); if (res.data.success) setModules(res.data.modules); }
        catch (error) { console.error('Fetch modules error:', error); }
    };

    const fetchRoles = async () => {
        try { const res = await api.get('/useraccess/roles'); if (res.data.success) setRoles(res.data.roles); }
        catch (error) { console.error('Fetch roles error:', error); }
    };

    const fetchEmployees = async () => {
        try { const res = await api.get('/useraccess/employees'); if (res.data.success) setEmployees(res.data.employees); }
        catch (error) { console.error('Fetch employees error:', error); }
    };

    const fetchVendors = async () => {
        try { const res = await api.get('/useraccess/vendors'); if (res.data.success) setVendors(res.data.vendors); }
        catch (error) { console.error('Fetch vendors error:', error); }
    };

    const loadCurrentView = async () => {
        setLoading(true);
        if (activeView === 'employees') await fetchEmployees();
        else await fetchVendors();
        setLoading(false);
    };

    // ─── Manual "Sync Modules" — visible, debuggable trigger ───────────
    const handleSyncModules = async () => {
        setIsSyncingModules(true);
        try {
            const res = await api.post('/modules/sync', appRoutesPayload);
            if (res.data.success) {
                await fetchModules();
                setNotification({ type: 'success', message: `Synced ${res.data.syncedCount} module(s) from appRoutes.js` });
            } else {
                setNotification({ type: 'error', message: res.data.message || 'Sync returned no modules' });
            }
        } catch (error) {
            console.error('Manual module sync error:', error);
            setNotification({
                type: 'error',
                message: error.response?.data?.message || error.message || 'Sync failed — check backend is running and CORS is enabled'
            });
        } finally {
            setIsSyncingModules(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };

    useEffect(() => { fetchModules(); fetchRoles(); }, []);
    useEffect(() => { loadCurrentView(); setCurrentPage(1); setFilters({ role: 'all', status: 'all' }); setSearchQuery(''); }, [activeView]);

    // ─── Normalize the two entity shapes into common display fields ────
    const normalize = (record) => {
        if (activeView === 'employees') {
            return {
                raw: record,
                id: record._id,
                name: record.fullName,
                code: record.employeeCode,
                email: record.email,
                subtitle: `${record.department || '—'} / ${record.team || '—'}`,
                tag: record.userType,
                isActive: Boolean(record.isActive),
                accessRoleId: record.accessRoleId || '',
                accessRoleName: record.accessRoleName,
                legacyRoleText: record.legacyRoleText || null,
                customPermissions: record.customPermissions || []
            };
        }
        return {
            raw: record,
            id: record._id,
            name: record.company,
            code: record.code,
            email: record.email,
            subtitle: `${record.city || '—'}, ${record.state || '—'}`,
            tag: record.type,
            isActive: record.status === 'Active',
            accessRoleId: record.accessRoleId || '',
            accessRoleName: record.accessRoleName,
            legacyRoleText: null,
            customPermissions: record.customPermissions || []
        };
    };

    const sourceList = activeView === 'employees' ? employees : vendors;
    const normalizedList = sourceList.map(normalize);

    const filteredList = normalizedList.filter(item => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query || item.name?.toLowerCase().includes(query) || item.email?.toLowerCase().includes(query) || item.code?.toLowerCase().includes(query);
        const matchesRole = filters.role === 'all' || item.accessRoleId === filters.role;
        const matchesStatus = filters.status === 'all' || (filters.status === 'active' ? item.isActive : !item.isActive);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const sortedList = [...filteredList].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedList.length / pageSize) || 1;
    const paginatedList = sortedList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const stats = {
        total: normalizedList.length,
        active: normalizedList.filter(i => i.isActive).length,
        assigned: normalizedList.filter(i => i.accessRoleId).length,
        overrides: normalizedList.filter(i => i.customPermissions.length > 0).length
    };

    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    // ─── Set / Update Access modal ──────────────────────────────────────
    const openSetAccess = (item) => {
        setAccessTarget(item);
        const matchedLegacyRole = !item.accessRoleId && item.legacyRoleText
            ? roles.find(r => r.roleName === item.legacyRoleText)
            : null;
        setSelectedRoleId(item.accessRoleId || matchedLegacyRole?._id || '');

        const hasOverrides = item.customPermissions.length > 0;
        setUseCustomPerms(hasOverrides);
        setAccessPermMatrix(modules.map(m => {
            const existing = item.customPermissions.find(p => p.moduleKey === m.moduleKey);
            return {
                moduleKey: m.moduleKey, moduleName: m.moduleName, moduleGroup: m.moduleGroup,
                view: existing?.view || false, create: existing?.create || false, edit: existing?.edit || false,
                delete: existing?.delete || false, approve: existing?.approve || false, export: existing?.export || false
            };
        }));
        setErrors({});
        setShowSetAccessModal(true);
    };

    const closeSetAccess = () => { setShowSetAccessModal(false); setAccessTarget(null); setErrors({}); };

    const toggleAccessMatrixCell = (moduleKey, action) => {
        setAccessPermMatrix(prev => prev.map(row => row.moduleKey === moduleKey ? { ...row, [action]: !row[action] } : row));
    };

    const handleSaveAccess = async (e) => {
        e.preventDefault();
        if (!selectedRoleId) { setErrors({ roleId: 'Select a role' }); return; }
        setIsSubmitting(true);
        try {
            const endpoint = activeView === 'employees' ? `/useraccess/employees/${accessTarget.id}/access` : `/useraccess/vendors/${accessTarget.id}/access`;
            const res = await api.patch(endpoint, {
                roleId: selectedRoleId,
                customPermissions: useCustomPerms ? accessPermMatrix : []
            });
            if (res.data.success) {
                await loadCurrentView();
                setNotification({ type: 'success', message: `Access ${accessTarget.accessRoleId ? 'updated' : 'assigned'} for ${accessTarget.name}!` });
            }
            closeSetAccess();
        } catch (error) {
            console.error('Set access error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Failed to update access' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // ─── Role management (auto-discovered + custom) ─────────────────────
    const openCreateRole = () => {
        setEditingRole(null);
        setRoleForm({ roleName: '', description: '' });
        setRolePermMatrix(buildEmptyMatrix(modules));
        setErrors({});
        setShowRoleModal(true);
    };

    const openEditRole = (role) => {
        setEditingRole(role);
        setRoleForm({ roleName: role.roleName, description: role.description || '' });
        setRolePermMatrix(modules.map(m => {
            const existing = role.permissions?.find(p => p.moduleKey === m.moduleKey);
            return {
                moduleKey: m.moduleKey, moduleName: m.moduleName, moduleGroup: m.moduleGroup,
                view: role.isFullAccess || existing?.view || false,
                create: role.isFullAccess || existing?.create || false,
                edit: role.isFullAccess || existing?.edit || false,
                delete: role.isFullAccess || existing?.delete || false,
                approve: role.isFullAccess || existing?.approve || false,
                export: role.isFullAccess || existing?.export || false
            };
        }));
        setErrors({});
        setShowRoleModal(true);
    };

    const closeRoleModal = () => { setShowRoleModal(false); setEditingRole(null); setErrors({}); };

    const toggleRoleMatrixCell = (moduleKey, action) => {
        setRolePermMatrix(prev => prev.map(row => row.moduleKey === moduleKey ? { ...row, [action]: !row[action] } : row));
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        if (!roleForm.roleName.trim()) { setErrors({ roleName: 'Required' }); return; }
        setIsSubmitting(true);
        try {
            const payload = { roleName: roleForm.roleName, description: roleForm.description, permissions: rolePermMatrix };
            if (editingRole) {
                const res = await api.put(`/useraccess/roles/${editingRole._id}`, payload);
                if (res.data.success) { await fetchRoles(); setNotification({ type: 'success', message: 'Role updated!' }); }
            } else {
                const res = await api.post('/useraccess/roles', payload);
                if (res.data.success) { await fetchRoles(); setNotification({ type: 'success', message: 'Role created!' }); }
            }
            closeRoleModal();
        } catch (error) {
            console.error('Submit role error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Operation failed' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleDeleteRole = async (role) => {
        if (!window.confirm(`Delete role "${role.roleName}"?`)) return;
        try {
            const res = await api.delete(`/useraccess/roles/${role._id}`);
            if (res.data.success) { await fetchRoles(); setNotification({ type: 'success', message: 'Role deleted!' }); }
        } catch (error) {
            console.error('Delete role error:', error);
            setNotification({ type: 'error', message: error.response?.data?.message || 'Delete failed' });
        } finally {
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const clearFilters = () => { setFilters({ role: 'all', status: 'all' }); setSearchQuery(''); };

    useEffect(() => { const h = (e) => { if (roleModalRef.current && !roleModalRef.current.contains(e.target)) closeRoleModal(); }; if (showRoleModal) document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [showRoleModal]);
    useEffect(() => { const h = (e) => { if (accessModalRef.current && !accessModalRef.current.contains(e.target)) closeSetAccess(); }; if (showSetAccessModal) document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [showSetAccessModal]);

    const roleBadgeColor = (roleName) => {
        if (!roleName) return { text: 'text-[#64748B]', bg: 'bg-black/5', bc: 'border-black/10' };
        if (/admin/i.test(roleName)) return { text: 'text-[#00A88A]', bg: 'bg-[#00D4AA]/10', bc: 'border-[#00D4AA]/20' };
        if (/lead/i.test(roleName)) return { text: 'text-[#B9790A]', bg: 'bg-[#F5A623]/10', bc: 'border-[#F5A623]/20' };
        if (/user|employee/i.test(roleName)) return { text: 'text-[#2563EB]', bg: 'bg-[#3B82F6]/10', bc: 'border-[#3B82F6]/20' };
        return { text: 'text-purple-600', bg: 'bg-purple-500/10', bc: 'border-purple-500/20' };
    };

    // Group modules by moduleGroup for a friendlier matrix (auto-updates as new pages sync in)
    const groupedModules = (matrix) => {
        const groups = {};
        matrix.forEach(row => {
            const g = row.moduleGroup || 'General';
            if (!groups[g]) groups[g] = [];
            groups[g].push(row);
        });
        return groups;
    };

    const renderMatrixTable = (matrix, toggleFn, disabled = false) => {
        const groups = groupedModules(matrix);
        return (
            <div className="space-y-4">
                {Object.keys(groups).length === 0 && (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#F5A623]/5 border border-[#F5A623]/20">
                        <IoAlertCircleOutline size={18} className="text-[#B9790A] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#B9790A]">No modules synced yet — click <strong>Sync Modules</strong> above to push pages from appRoutes.js to the backend.</p>
                    </div>
                )}
                {Object.entries(groups).map(([groupName, rows]) => (
                    <div key={groupName} className="overflow-x-auto rounded-xl border border-black/10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5 bg-black/[0.02]">
                                    <th className="p-4 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase">{groupName}</th>
                                    {ACTIONS.map(a => (
                                        <th key={a} className="p-4 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase text-center capitalize">{a}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr key={row.moduleKey} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                                        <td className="p-4 text-sm text-[#111827]">{row.moduleName}</td>
                                        {ACTIONS.map(a => (
                                            <td key={a} className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={row[a]}
                                                    disabled={disabled}
                                                    onChange={() => toggleFn(row.moduleKey, a)}
                                                    className="w-4 h-4 rounded border-gray-300 bg-white text-[#00D4AA] focus:ring-[#00D4AA]/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    };

    const viewLabel = activeView === 'employees' ? 'Employees' : 'Vendors';
    const ViewIcon = activeView === 'employees' ? IoPersonOutline : IoBusinessOutline;

    return (
        <div className="min-h-screen bg-[#f8fefd] text-[#111827] font-sans selection:bg-[#00D4AA]/30 selection:text-[#0F2A26]">
            <Header showNavigation={false} />

            {notification && (
                <div className={`fixed top-20 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in border max-w-md ${notification.type === 'success' ? 'bg-white border-[#00D4AA]/30 text-[#00A88A]' : 'bg-white border-[#EF4444]/30 text-[#EF4444]'}`}>
                    <IoCheckmarkCircleOutline size={20} className="flex-shrink-0" /><span className="text-sm font-medium">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 text-[#5B6B7A] hover:text-[#111827] flex-shrink-0"><IoCloseOutline size={16} /></button>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-8 py-12">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2.5 mb-5 bg-white hover:bg-[#EAF6F3] border border-black/10 rounded-xl text-sm font-medium text-[#5B6B7A] hover:text-[#111827] transition-all active:scale-95"
                >
                    <IoArrowBackOutline size={20} />
                    <span>Back</span>
                </button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-8 animate-fade-in-up">
                    <div className="lg:w-1/2">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20"><IoShieldCheckmarkOutline size={24} className="text-[#00A88A]" /></div>
                            <h2 className="text-4xl font-bold text-[#111827] tracking-tight">User Access Management</h2>
                        </div>
                        <p className="text-[#5B6B7A] text-base leading-relaxed flex items-center gap-2"><IoKeyOutline size={18} className="text-[#7A8B9A]" />Assign roles and permission overrides to existing employees and vendors.</p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        {[
                            { label: `TOTAL ${viewLabel.toUpperCase()}`, val: stats.total, color: 'text-[#00A88A]', bc: 'border-[#00D4AA]/20', bg: 'bg-[#00D4AA]/5' },
                            { label: 'ACTIVE', val: stats.active, color: 'text-[#0D9467]', bc: 'border-[#10B981]/20', bg: 'bg-[#10B981]/5' },
                            { label: 'ROLE ASSIGNED', val: stats.assigned, color: 'text-[#B9790A]', bc: 'border-[#F5A623]/20', bg: 'bg-[#F5A623]/5' },
                            { label: 'MODULES SYNCED', val: modules.length, color: modules.length === 0 ? 'text-[#EF4444]' : 'text-purple-600', bc: modules.length === 0 ? 'border-[#EF4444]/20' : 'border-purple-500/20', bg: modules.length === 0 ? 'bg-[#EF4444]/5' : 'bg-purple-500/5' }
                        ].map((s, i) => (
                            <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${s.bc} ${s.bg}`}><span className="text-[10px] font-bold text-[#5B6B7A] uppercase tracking-wider">{s.label}</span><span className={`text-2xl font-bold ${s.color} tracking-tight`}>{s.val}</span></div>
                        ))}
                    </div>
                </div>

                {modules.length === 0 && (
                    <div className="flex items-center justify-between gap-4 mb-6 px-5 py-4 rounded-xl bg-[#F5A623]/5 border border-[#F5A623]/20 animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <IoAlertCircleOutline size={20} className="text-[#B9790A] flex-shrink-0" />
                            <div>
                                <p className="text-sm text-[#B9790A] font-medium">No modules synced yet</p>
                                <p className="text-xs text-[#5B6B7A] mt-0.5">appRoutes.js hasn't reached the backend. Click Sync Modules, then check your server console for a <code className="text-[#B9790A]">[modules/sync]</code> log line.</p>
                            </div>
                        </div>
                        <button onClick={handleSyncModules} disabled={isSyncingModules} className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5A623] text-[#3A2A05] font-bold text-sm hover:shadow-[0_0_15px_rgba(245,166,35,0.3)] transition-all disabled:opacity-50">
                            <IoSyncOutline size={16} className={isSyncingModules ? 'animate-spin' : ''} /> {isSyncingModules ? 'Syncing...' : 'Sync Modules'}
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72 lg:w-80">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${viewLabel}...`} className="w-full bg-white border border-black/10 focus:border-[#00D4AA] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-[#111827] placeholder-gray-400 transition-all" />
                        </div>
                        <button onClick={() => setIsFilterOpen(true)} className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2 ${Object.values(filters).some(val => val && val !== 'all') || searchQuery ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00A88A]' : 'bg-white border-black/10 text-gray-500 hover:text-[#111827] hover:bg-black/5'}`}><IoFilterOutline size={18} /><span>Filter</span></button>

                        <button
                            onClick={() => setShowRolesPanel(true)}
                            className="px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2 bg-white border-black/10 text-gray-500 hover:text-[#111827] hover:bg-black/5"
                        >
                            <IoPeopleOutline size={18} />
                            <span>Manage Roles</span>
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-black/5 text-[10px] font-bold text-[#111827]">{roles.length}</span>
                        </button>

                        <button
                            onClick={handleSyncModules}
                            disabled={isSyncingModules}
                            className="px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2 bg-white border-black/10 text-gray-500 hover:text-[#111827] hover:bg-black/5 disabled:opacity-50"
                            title="Push appRoutes.js pages to the backend module registry"
                        >
                            <IoSyncOutline size={18} className={isSyncingModules ? 'animate-spin' : ''} />
                            <span>{isSyncingModules ? 'Syncing...' : 'Sync Modules'}</span>
                        </button>
                    </div>
                </div>

                {/* ★ SWITCH TABLE DROPDOWN — replaces "Create New User" ★ */}
                <div className="flex justify-start mb-3 relative z-50">
                    <div className="relative">
                        <button ref={viewBtnRef} onClick={() => setShowViewPopup(s => !s)} className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-[#0F2A26] rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] hover:scale-105 active:scale-95">
                            <IoSwapHorizontalOutline size={18} /><ViewIcon size={16} /><span>{viewLabel} Table</span>
                            <IoChevronDownOutline size={14} className={`transition-transform duration-300 ${showViewPopup ? 'rotate-180' : ''}`} />
                        </button>

                        {showViewPopup && (
                            <>
                                <div className="fixed inset-0" onClick={() => setShowViewPopup(false)} />
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                                    <div className="p-2">
                                        <button onClick={() => { setActiveView('employees'); setShowViewPopup(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-black/5 transition-all group/item text-left ${activeView === 'employees' ? 'bg-black/5' : ''}`}>
                                            <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#00D4AA]/20"><IoPersonOutline size={18} className="text-[#00A88A]" /></div>
                                            <div className="flex-1 min-w-0"><div className="text-sm font-bold text-[#111827] group-hover/item:text-[#00A88A] transition-colors">Employees Table</div><div className="text-[11px] text-[#7A8B9A] truncate">Assign roles to internal staff</div></div>
                                        </button>
                                        <div className="h-px bg-black/5 my-1 mx-3"></div>
                                        <button onClick={() => { setActiveView('vendors'); setShowViewPopup(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-black/5 transition-all group/item text-left ${activeView === 'vendors' ? 'bg-black/5' : ''}`}>
                                            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#3B82F6]/20"><IoBusinessOutline size={18} className="text-[#2563EB]" /></div>
                                            <div className="flex-1 min-w-0"><div className="text-sm font-bold text-[#111827] group-hover/item:text-[#2563EB] transition-colors">Vendors Table</div><div className="text-[11px] text-[#7A8B9A] truncate">Assign portal access to vendors</div></div>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-[#5B6B7A]"><div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>Loading {viewLabel.toLowerCase()}...</div>
                ) : (
                    <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up mt-3" style={{ animationDelay: '0.15s' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-black/5 bg-black/[0.02]">
                                        <th className="p-5 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase cursor-pointer" onClick={() => handleSort('name')}><div className="flex items-center gap-1">{activeView === 'employees' ? 'Name' : 'Company'} {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <IoChevronUpOutline size={12} /> : <IoChevronDownOutline size={12} />)}</div></th>
                                        <th className="p-5 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase">Code</th>
                                        <th className="p-5 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase">Email</th>
                                        <th className="p-5 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase">{activeView === 'employees' ? 'Dept / Team' : 'Location'}</th>
                                        <th className="p-5 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase">Access Role</th>
                                        <th className="p-5 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase">Overrides</th>
                                        <th className="p-5 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase">Status</th>
                                        <th className="p-5 text-xs font-bold text-[#5B6B7A] tracking-wider uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedList.length > 0 ? paginatedList.map((item) => {
                                        const displayRoleName = item.accessRoleName || item.legacyRoleText;
                                        const rc = roleBadgeColor(displayRoleName);
                                        const isFormallyAssigned = Boolean(item.accessRoleId);
                                        return (
                                            <tr key={item.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D9ECE8] to-[#EAF6F3] border border-black/10 flex items-center justify-center text-xs font-bold text-[#00A88A] flex-shrink-0">{item.name?.charAt(0)?.toUpperCase()}</div>
                                                        <div>
                                                            <div className="font-medium text-[#111827] text-sm">{item.name}</div>
                                                            {item.tag && <div className="text-[10px] text-[#7A8B9A]">{item.tag}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5"><span className="inline-flex px-2.5 py-1 rounded-lg bg-[#F1F5F8] border border-black/10 text-xs font-mono text-[#00A88A]">{item.code}</span></td>
                                                <td className="p-5 text-sm text-[#5B6B7A]">{item.email}</td>
                                                <td className="p-5 text-sm text-[#5B6B7A]">{item.subtitle}</td>
                                                <td className="p-5">
                                                    {displayRoleName ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-bold w-fit ${rc.text} ${rc.bg} ${rc.bc}`}>{displayRoleName}</span>
                                                            {!isFormallyAssigned && <span className="text-[10px] text-[#7A8B9A]">from employee record — not formally assigned</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 border border-black/10 text-xs text-[#7A8B9A]"><IoLockOpenOutline size={12} />Not Assigned</span>
                                                    )}
                                                </td>
                                                <td className="p-5">
                                                    {item.customPermissions.length > 0 ? (
                                                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 font-bold">{item.customPermissions.length} module(s)</span>
                                                    ) : <span className="text-xs text-[#B9C4CE]">—</span>}
                                                </td>
                                                <td className="p-5"><div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${item.isActive ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div><span className={`text-sm ${item.isActive ? 'text-[#0D9467]' : 'text-gray-500'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></div></td>
                                                <td className="p-5 text-right">
                                                    <button onClick={() => openSetAccess(item)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20 text-[#00A88A] text-xs font-bold hover:bg-[#00D4AA]/20 transition-all opacity-80 group-hover:opacity-100">
                                                        <IoShieldCheckmarkOutline size={14} /> {isFormallyAssigned ? 'Update Role' : 'Set Role'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : <tr><td colSpan={8} className="p-16 text-center text-[#5B6B7A]">No {viewLabel.toLowerCase()} found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-[#5B6B7A]"><span>Page Size</span><select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 bg-white border border-black/10 rounded-lg text-[#111827] text-xs focus:outline-none">{[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs text-[#5B6B7A] hover:text-[#111827] disabled:opacity-30">First</button>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs text-[#5B6B7A] hover:text-[#111827] disabled:opacity-30">Prev</button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (<button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? 'bg-[#00D4AA] text-[#0F2A26]' : 'bg-white border border-black/10 text-[#5B6B7A] hover:text-[#111827]'}`}>{i + 1}</button>))}
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs text-[#5B6B7A] hover:text-[#111827] disabled:opacity-30">Next</button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs text-[#5B6B7A] hover:text-[#111827] disabled:opacity-30">Last</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* SET / UPDATE ACCESS MODAL */}
            {showSetAccessModal && accessTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && closeSetAccess()} />
                    <div ref={accessModalRef} className="relative w-full max-w-3xl bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-black/[0.02]">
                            <div>
                                <h3 className="text-2xl font-bold text-[#111827]">{accessTarget.accessRoleId ? 'Update Access' : 'Set Access'} — {accessTarget.name}</h3>
                                <p className="text-xs text-[#5B6B7A] uppercase tracking-widest mt-1">{accessTarget.code} · {accessTarget.email}</p>
                            </div>
                            <button onClick={closeSetAccess} className="text-gray-400 hover:text-[#111827] p-2"><IoCloseOutline size={26} /></button>
                        </div>
                        <form onSubmit={handleSaveAccess} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-[#5B6B7A] uppercase tracking-widest border-l-2 border-[#00D4AA] pl-3">{accessTarget.accessRoleId ? 'Change Role' : 'Assign Role'}</h4>
                                <div className="relative">
                                    <IoShieldCheckmarkOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8B9A] pointer-events-none" size={18} />
                                    <select value={selectedRoleId} onChange={(e) => { setSelectedRoleId(e.target.value); if (errors.roleId) setErrors({}); }} className={`w-full appearance-none bg-[#F1F5F8] border ${errors.roleId ? 'border-[#FF5252]/50' : 'border-black/10'} focus:border-[#00D4AA] text-[#111827] rounded-xl pl-12 pr-10 py-3.5 outline-none transition-all cursor-pointer text-sm`}>
                                        <option value="">Select role...</option>
                                        {roles.map(r => <option key={r._id} value={r._id}>{r.roleName}{r.isFullAccess ? ' (Full Access)' : ''}</option>)}
                                    </select>
                                    <IoChevronDownOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A8B9A] pointer-events-none" size={16} />
                                </div>
                                {errors.roleId && <p className="text-[#FF5252] text-xs ml-1">{errors.roleId}</p>}
                                {roles.length === 0 && (
                                    <p className="text-xs text-[#B9790A]">No roles found yet — roles are auto-discovered from the `role` field on employee records. Add a role to an employee first, or create one manually via Manage Roles.</p>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-[#5B6B7A] uppercase tracking-widest border-l-2 border-purple-500 pl-3">Custom Permission Overrides</h4>
                                <label className={`flex items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${useCustomPerms ? 'border-purple-500/40 bg-purple-500/5' : 'border-black/10 bg-black/[0.02] hover:border-black/20'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" checked={useCustomPerms} onChange={() => setUseCustomPerms(s => !s)} className="w-5 h-5 rounded border-gray-300 bg-white text-purple-500 focus:ring-purple-500/30 cursor-pointer" />
                                        <div>
                                            <div className="text-sm font-medium text-[#111827]">Grant custom overrides for {accessTarget.name}</div>
                                            <div className="text-[11px] text-[#7A8B9A] mt-0.5">Overrides win over the role's default permissions, per action</div>
                                        </div>
                                    </div>
                                </label>

                                {useCustomPerms && renderMatrixTable(accessPermMatrix, toggleAccessMatrixCell)}
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-black/5">
                                <button type="button" onClick={closeSetAccess} className="flex-1 py-3.5 rounded-xl border border-black/10 hover:bg-black/5 text-gray-600 font-medium text-sm" disabled={isSubmitting}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-[#00D4AA]/30 text-[#00D4AA]/50 cursor-not-allowed' : 'bg-[#00D4AA] text-[#0F2A26] hover:bg-[#00F0C0] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)]'}`}>{isSubmitting ? <div className="w-5 h-5 border-2 border-[#0F2A26] border-t-transparent animate-spin rounded-full"></div> : <><IoSaveOutline size={18} />{accessTarget.accessRoleId ? 'Update Access' : 'Save Access'}</>}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE / EDIT ROLE MODAL */}
            {showRoleModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && closeRoleModal()} />
                    <div ref={roleModalRef} className="relative w-full max-w-4xl bg-white border border-black/10 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-black/[0.02]"><div><h3 className="text-2xl font-bold text-[#111827]">{editingRole ? `Edit Role: ${editingRole.roleName}` : 'New Role'}</h3><p className="text-xs text-[#5B6B7A] uppercase tracking-widest mt-1">{editingRole?.isFullAccess ? 'This role always has full access to every module' : editingRole?.isDiscovered ? 'Auto-discovered from employee records' : 'Define the permission matrix per module'}</p></div><button onClick={closeRoleModal} className="text-gray-400 hover:text-[#111827] p-2"><IoCloseOutline size={26} /></button></div>
                        <form onSubmit={handleRoleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-[#5B6B7A] uppercase tracking-widest border-l-2 border-[#00D4AA] pl-3">Role Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[#111827] mb-1.5">Role Name <span className="text-[#FF5252]">*</span></label>
                                        <input type="text" name="roleName" required disabled={editingRole?.isSystemRole || editingRole?.isDiscovered} value={roleForm.roleName} onChange={(e) => setRoleForm({ ...roleForm, roleName: e.target.value })} placeholder="e.g., Compliance Reviewer" className={`w-full bg-[#F1F5F8] border border-black/10 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-[#111827] placeholder-gray-400 transition-all ${(editingRole?.isSystemRole || editingRole?.isDiscovered) ? 'opacity-50 cursor-not-allowed' : ''} ${errors.roleName ? 'border-[#FF5252]/50' : ''}`} />
                                        {editingRole?.isDiscovered && <p className="text-[10px] text-[#7A8B9A] mt-1 ml-1">Name is locked — it must match the `role` value on employee records</p>}
                                        {errors.roleName && <p className="text-[#FF5252] text-xs mt-1 ml-1">{errors.roleName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#111827] mb-1.5">Description</label>
                                        <input type="text" name="description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Short description of this role" className="w-full bg-[#F1F5F8] border border-black/10 focus:border-[#00D4AA] rounded-xl px-4 py-3.5 outline-none text-sm text-[#111827] placeholder-gray-400 transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xs font-bold text-[#5B6B7A] uppercase tracking-widest border-l-2 border-purple-500 pl-3">Permission Matrix</h4>
                                {editingRole?.isFullAccess && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#00D4AA]/5 border border-[#00D4AA]/20 text-[#00A88A] text-xs">
                                        <IoInfiniteOutline size={16} /> This role auto-grants every action on every module — including ones added after today. Matrix shown for reference only.
                                    </div>
                                )}
                                {renderMatrixTable(rolePermMatrix, toggleRoleMatrixCell, editingRole?.isFullAccess)}
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-black/5">
                                <button type="button" onClick={closeRoleModal} className="flex-1 py-3.5 rounded-xl border border-black/10 hover:bg-black/5 text-gray-600 font-medium text-sm" disabled={isSubmitting}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-purple-500/30 text-purple-400/50 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'}`}>{isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <><IoSaveOutline size={18} />{editingRole ? 'Update Role' : 'Save Role'}</>}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ★ ROLES SLIDE-OVER PANEL ★ */}
            {showRolesPanel && (
                <div className="fixed inset-0 z-[50] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRolesPanel(false)} />
                    <div className="relative w-full max-w-md bg-white border-l border-black/10 shadow-2xl h-full overflow-y-auto animate-slide-in-right p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><IoPeopleOutline size={18} className="text-purple-600" /></div>
                                <div><h3 className="text-lg font-bold text-[#111827]">Roles</h3><p className="text-[10px] text-[#7A8B9A] uppercase tracking-widest">Auto-discovered from employees + custom</p></div>
                            </div>
                            <button onClick={() => setShowRolesPanel(false)} className="text-gray-400 hover:text-[#111827] p-1"><IoCloseOutline size={24} /></button>
                        </div>

                        <button onClick={() => { setShowRolesPanel(false); openCreateRole(); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 font-medium text-sm hover:bg-purple-500/20 transition-all mb-6">
                            <IoAddOutline size={18} /> New Custom Role
                        </button>

                        {roles.length === 0 && (
                            <p className="text-xs text-[#7A8B9A] text-center py-6">No roles yet. They auto-appear here once an employee record has a `role` value set, or create one manually above.</p>
                        )}

                        <div className="space-y-3">
                            {roles.map(role => {
                                const rc = roleBadgeColor(role.roleName);
                                const grantedCount = role.isFullAccess ? modules.length : (role.permissions || []).filter(p => ACTIONS.some(a => p[a])).length;
                                return (
                                    <div key={role._id} className="p-4 rounded-xl bg-black/[0.02] border border-black/10 hover:border-black/20 transition-all">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-bold ${rc.text} ${rc.bg} ${rc.bc}`}>{role.roleName}</span>
                                                {role.isDiscovered && <span className="text-[10px] text-[#7A8B9A] uppercase tracking-wider">From Employee Data</span>}
                                                {role.isFullAccess && <IoInfiniteOutline size={14} className="text-[#00A88A]" title="Full access" />}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => { setShowRolesPanel(false); openEditRole(role); }} className="p-1.5 rounded-lg hover:bg-[#3B82F6]/10 hover:text-[#2563EB] transition-all text-[#7A8B9A]"><IoCreateOutline size={15} /></button>
                                                <button onClick={() => handleDeleteRole(role)} className="p-1.5 rounded-lg hover:bg-[#FF5252]/10 hover:text-[#FF5252] transition-all text-[#7A8B9A]"><IoTrashOutline size={15} /></button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-[#7A8B9A] mb-2">{role.description || 'No description'}</p>
                                        <p className="text-[11px] text-[#5B6B7A]">{grantedCount} module(s) with granted access</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ★ FILTER SLIDE-OVER PANEL ★ */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[50] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
                    <div className="relative w-full max-w-sm bg-white border-l border-black/10 shadow-2xl h-full overflow-y-auto animate-slide-in-right p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center"><IoFilterOutline size={18} className="text-[#00A88A]" /></div>
                                <div><h3 className="text-lg font-bold text-[#111827]">Filters</h3><p className="text-[10px] text-[#7A8B9A] uppercase tracking-widest">Refine {viewLabel.toLowerCase()}</p></div>
                            </div>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-[#111827] p-1"><IoCloseOutline size={24} /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-3">Access Role</label>
                                <div className="space-y-2">
                                    <button onClick={() => setFilters(prev => ({ ...prev, role: 'all' }))} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${filters.role === 'all' ? 'bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00A88A] font-medium' : 'bg-black/[0.02] border border-black/10 text-gray-600 hover:text-[#111827] hover:border-black/20'}`}>All Roles</button>
                                    {roles.map(r => (
                                        <button key={r._id} onClick={() => setFilters(prev => ({ ...prev, role: r._id }))} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${filters.role === r._id ? 'bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00A88A] font-medium' : 'bg-black/[0.02] border border-black/10 text-gray-600 hover:text-[#111827] hover:border-black/20'}`}>{r.roleName}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#7A8B9A] uppercase tracking-widest mb-3">Status</label>
                                <div className="space-y-2">
                                    {[{ v: 'all', l: 'All Statuses' }, { v: 'active', l: 'Active' }, { v: 'inactive', l: 'Inactive' }].map(o => (
                                        <button key={o.v} onClick={() => setFilters(prev => ({ ...prev, status: o.v }))} className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${filters.status === o.v ? 'bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#B9790A] font-medium' : 'bg-black/[0.02] border border-black/10 text-gray-600 hover:text-[#111827] hover:border-black/20'}`}>{o.l}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-black/10 text-gray-600 text-sm font-medium hover:bg-black/5 transition-all">Clear All</button>
                            <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-[#0F2A26] text-sm font-bold hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all">Apply</button>
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
 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5DF; border-radius: 3px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B0C4CE; }
 `}</style>
        </div>
    );
};

export default UserAccessManagement;