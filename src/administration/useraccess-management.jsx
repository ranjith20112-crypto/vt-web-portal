// src/components/UserAccessManagement.jsx
'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
 IoSearchOutline,
 IoArrowUpOutline,
 IoArrowDownOutline,
 IoDocumentTextOutline,
 IoArrowBackOutline,
 IoCloseOutline,
 IoSettingsOutline,
 IoPeopleOutline,
 IoBusinessOutline,
 IoCheckmarkCircleOutline,
 IoLockClosedOutline,
 IoShieldOutline,
 IoEyeOutline,
 IoGrid as IoGridIcon,
 IoPersonCircleOutline,
 IoShieldCheckmarkOutline,
 IoChevronDownOutline,
 IoAlertCircleOutline,
 IoCheckmarkDoneOutline,
 IoRefreshOutline,
 IoStarOutline,
 IoSaveOutline,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import Header from '../screens/header';

// ==================== API CONFIG ====================
const API_BASE_URL = 'http://backend-9fothcpv0-saaa7.vercel.app/api';
const EMPLOYEES_ENDPOINT = `${API_BASE_URL}/useraccess/employees`;
const ROLES_ENDPOINT = `${API_BASE_URL}/useraccess/roles`;

// ==================== DATA MAPPING ====================
const mapEmployeeFromApi = (emp) => ({
 _id: emp._id || emp.id || String(Math.random()),
 name: emp.name || emp.employeeName || emp.fullName || 'Unknown',
 email: emp.email || emp.employeeEmail || '',
 company: emp.company || emp.companyName || emp.organization || 'N/A',
 group: emp.group || emp.userGroup || emp.role || 'User',
 category: emp.category || emp.employeeType || 'Internal',
 accessType: emp.accessRoleName || emp.accessType || emp.access_level || 'Custom',
 menuCount: emp.menuCount || emp.menusCount || emp.assignedMenus || 0,
 avatar: (emp.name || emp.employeeName || 'U')[0]?.toUpperCase() || 'U',
 accessRoleId: emp.accessRoleId || null,
 accessRoleName: emp.accessRoleName || null,
 legacyRoleText: emp.legacyRoleText || null,
 customPermissions: emp.customPermissions || [],
});

// ==================== CONSTANTS ====================
const GROUP_COLORS = {
 superadmin: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
 admin: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500' },
 manager: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
 user: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
 verifier: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
 default: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
};

const ACCESS_COLORS = {
 full: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
 custom: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
 restricted: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
 readonly: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
};

const GroupBadge = ({ group }) => {
 const key = group?.toLowerCase()?.replace(/\s/g, '') || 'default';
 const c = GROUP_COLORS[key] || GROUP_COLORS.default;
 return (
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
 {group}
 </span>
 );
};

const AccessBadge = ({ type }) => {
 const c = ACCESS_COLORS[type?.toLowerCase()] || ACCESS_COLORS.custom;
 return (
 <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
 {type}
 </span>
 );
};

const MenuCountBadge = ({ count }) => (
 <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0A1628]">
 <IoGridIcon size={14} className="opacity-60" />
 {count} <span className="text-xs font-medium text-[#0A1628]">menu(s)</span>
 </span>
);

// ==================== FILTER DROPDOWN ====================
const FilterDropdown = ({ label, options, value, onChange, icon: Icon }) => {
 const [open, setOpen] = useState(false);
 const ref = useRef(null);

 useEffect(() => {
 const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
 document.addEventListener('mousedown', handler);
 return () => document.removeEventListener('mousedown', handler);
 }, []);

 const activeOption = options.find(o => o.key === value);
 const ActiveIcon = activeOption?.icon || Icon;

 return (
 <div className="relative" ref={ref}>
 <button
 onClick={() => setOpen(prev => !prev)}
 className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${open ? 'bg-[#A855F7]/15 border-[#A855F7]/40 text-[#7C3AED]' : value && value !== 'all' ? 'bg-[#A855F7]/10 border-[#A855F7]/25 text-[#7C3AED]' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'}`}
 >
 {ActiveIcon && <ActiveIcon size={15} />}
 <span>{activeOption?.label || label}</span>
 {value && value !== 'all' && activeOption?.count !== undefined && (
 <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-md text-[10px] font-bold bg-[#A855F7]/20 text-[#7C3AED]">{activeOption.count}</span>
 )}
 </button>
 <div className={`absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl shadow-black/10 z-50 overflow-hidden transition-all duration-200 origin-top-left ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
 <div className="px-4 py-3 border-b border-gray-100"><span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{label}</span></div>
 <div className="py-1.5 max-h-64 overflow-y-auto">
 {options.map((opt) => {
 const isActive = value === opt.key;
 const OptIcon = opt.icon;
 return (
 <button key={opt.key} onClick={() => { onChange(opt.key); setOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${isActive ? 'bg-[#A855F7]/10 text-[#7C3AED]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#0A1628]'}`}>
 {OptIcon && <OptIcon size={16} className={isActive ? 'text-[#7C3AED]' : 'text-gray-400'} />}
 <span className="flex-1 text-left font-medium">{opt.label}</span>
 {opt.count !== undefined && <span className={`text-xs font-bold tabular-nums ${isActive ? 'text-[#7C3AED]' : 'text-gray-400'}`}>{opt.count}</span>}
 {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />}
 </button>
 );
 })}
 </div>
 {value && value !== 'all' && (
 <div className="px-3 py-2.5 border-t border-gray-100">
 <button onClick={() => { onChange('all'); setOpen(false); }} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-[#0A1628] hover:bg-gray-50 transition-all"><IoCloseOutline size={12} />Clear</button>
 </div>
 )}
 </div>
 </div>
 );
};

// ==================== ACTION TOGGLE ====================
const ActionToggle = ({ label, enabled, disabled, onToggle }) => (
 <button onClick={onToggle} disabled={disabled}
 className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all capitalize ${
 enabled ? 'bg-[#A855F7] border-[#A855F7] text-white shadow-sm shadow-[#A855F7]/20'
 : disabled ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
 : 'bg-white border-gray-200 text-gray-500 hover:border-[#A855F7]/40 hover:text-[#7C3AED]'
 }`}
 >{label}</button>
);

// ==================== MANAGE ACCESS MODAL ====================
const ManageAccessModal = ({ isOpen, onClose, user, onSaved }) => {
 const [activeTab, setActiveTab] = useState('menus');
 const [searchMenu, setSearchMenu] = useState('');
 const [expandedGroups, setExpandedGroups] = useState({ dashboard: true, bgv: true });
 const [menuPermissions, setMenuPermissions] = useState({});
 const [actionPermissions, setActionPermissions] = useState({});

 // Backend
 const [roles, setRoles] = useState([]);
 const [selectedRoleId, setSelectedRoleId] = useState('');
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [saveStep, setSaveStep] = useState('');
 const [error, setError] = useState('');
 const [successMsg, setSuccessMsg] = useState('');
 const [roleDescription, setRoleDescription] = useState('');

 const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

 // ===== FETCH =====
 const fetchInitialData = useCallback(async () => {
 if (!user) return;
 setLoading(true); setError(''); setSuccessMsg('');
 try {
 const [rolesRes, permsRes] = await Promise.all([
 fetch(ROLES_ENDPOINT),
 fetch(`${EMPLOYEES_ENDPOINT}/${user._id}/permissions`).catch(() => null),
 ]);
 if (!rolesRes.ok) throw new Error(`Roles fetch failed: ${rolesRes.status}`);
 const rolesData = await rolesRes.json();
 if (!rolesData.success) throw new Error(rolesData.message);
 setRoles(rolesData.roles || []);

 const mp = {}, ap = {};
 mockMenuTree.forEach(g => g.items.forEach(i => {
 mp[i.key] = false;
 ap[i.key] = { view: false, create: false, edit: false, delete: false, approve: false, export: false };
 }));
 if (permsRes && permsRes.ok) {
 const pd = await permsRes.json();
 if (pd.success && pd.permissions) {
 Object.entries(pd.permissions).forEach(([k, a]) => {
 if (mp[k] !== undefined) {
 mp[k] = a.view || false;
 ap[k] = { view: a.view||false, create: a.create||false, edit: a.edit||false, delete: a.delete||false, approve: a.approve||false, export: a.export||false };
 }
 });
 }
 }
 setMenuPermissions(mp); setActionPermissions(ap);
 setSelectedRoleId(user.accessRoleId || ''); setRoleDescription('');
 } catch (err) { console.error(err); setError(err.message); }
 finally { setLoading(false); }
 }, [user]);

 useEffect(() => {
 if (isOpen && user) { fetchInitialData(); setActiveTab('menus'); setSearchMenu(''); setExpandedGroups({ dashboard: true, bgv: true }); setError(''); setSuccessMsg(''); }
 }, [isOpen, user, fetchInitialData]);

 // ===== ROLE CHANGE =====
 const handleRoleChange = (roleId) => {
 setSelectedRoleId(roleId); setSuccessMsg('');
 const mp = {}, ap = {};
 mockMenuTree.forEach(g => g.items.forEach(i => {
 mp[i.key] = false; ap[i.key] = { view:false, create:false, edit:false, delete:false, approve:false, export:false };
 }));
 if (roleId) {
 const role = roles.find(r => r._id === roleId);
 if (role) {
 setRoleDescription(role.description || '');
 (role.permissions || []).forEach(p => {
 if (mp[p.moduleKey] !== undefined) {
 mp[p.moduleKey] = p.view || false;
 ap[p.moduleKey] = { view:p.view||false, create:p.create||false, edit:p.edit||false, delete:p.delete||false, approve:p.approve||false, export:p.export||false };
 }
 });
 }
 } else { setRoleDescription(''); }
 setMenuPermissions(mp); setActionPermissions(ap);
 };

 // ===== TOGGLES =====
 const toggleGroup = (k) => setExpandedGroups(p => ({ ...p, [k]: !p[k] }));
 const toggleMenu = (k) => {
 const v = !menuPermissions[k];
 setMenuPermissions(p => ({ ...p, [k]: v }));
 setActionPermissions(p => ({ ...p, [k]: { ...(p[k]||{}), view: v } }));
 setSuccessMsg('');
 };
 const toggleGroupAll = (gk) => {
 const g = mockMenuTree.find(x => x.key === gk); if (!g) return;
 const all = g.items.every(i => menuPermissions[i.key]);
 const nm = { ...menuPermissions }, na = { ...actionPermissions };
 g.items.forEach(i => { nm[i.key] = !all; na[i.key] = { ...(na[i.key]||{}), view: !all }; });
 setMenuPermissions(nm); setActionPermissions(na); setSuccessMsg('');
 };
 const toggleAction = (mk, action) => {
 setActionPermissions(p => {
 const c = p[mk] || { view:false, create:false, edit:false, delete:false, approve:false, export:false };
 const n = { ...c, [action]: !c[action] };
 if (action !== 'view' && n[action] && !n.view) { n.view = true; setMenuPermissions(mp => ({ ...mp, [mk]: true })); }
 if (action === 'view' && !n.view) { ACTIONS.forEach(a => { n[a] = false; }); setMenuPermissions(mp => ({ ...mp, [mk]: false })); }
 return { ...p, [mk]: n };
 }); setSuccessMsg('');
 };

 // ===== OVERRIDE COUNT =====
 const overrideCount = useMemo(() => {
 if (!selectedRoleId) return 0;
 const role = roles.find(r => r._id === selectedRoleId);
 if (!role) return 0;
 const rm = {}; (role.permissions || []).forEach(p => { rm[p.moduleKey] = p; });
 return Object.entries(actionPermissions).filter(([k, a]) => {
 const rp = rm[k]; if (!rp) return ACTIONS.some(x => a[x]);
 return ACTIONS.some(x => (a[x]||false) !== (rp[x]||false));
 }).length;
 }, [actionPermissions, roles, selectedRoleId]);

 // ===== SAVE: PUT role + PATCH employee =====
 const handleSave = async () => {
 if (!selectedRoleId) { setError('Select a role first'); setActiveTab('settings'); return; }
 setSaving(true); setError(''); setSuccessMsg('');
 try {
 // STEP 1: PUT /roles/:id
 setSaveStep('role');
 const permissions = Object.entries(actionPermissions)
 .filter(([, a]) => ACTIONS.some(x => a[x]))
 .map(([moduleKey, a]) => ({ moduleKey, view:a.view||false, create:a.create||false, edit:a.edit||false, delete:a.delete||false, approve:a.approve||false, export:a.export||false }));

 const putRes = await fetch(`${ROLES_ENDPOINT}/${selectedRoleId}`, {
 method: 'PUT', headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ permissions, description: roleDescription }),
 });
 const putData = await putRes.json();
 if (!putData.success) throw new Error(putData.message || 'Role update failed');

 // Refresh roles
 const rr = await fetch(ROLES_ENDPOINT); if (rr.ok) { const rd = await rr.json(); if (rd.success) setRoles(rd.roles||[]); }

 // STEP 2: PATCH /employees/:id/access
 setSaveStep('assign');
 const patchRes = await fetch(`${EMPLOYEES_ENDPOINT}/${user._id}/access`, {
 method: 'PATCH', headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ roleId: selectedRoleId, customPermissions: [] }),
 });
 const patchData = await patchRes.json();
 if (!patchData.success) throw new Error(patchData.message || 'Assign failed');

 setSaveStep(''); setSuccessMsg('Role updated & assigned!');
 if (onSaved) onSaved({ putData, patchData });
 setTimeout(() => onClose(), 700);
 } catch (err) { console.error(err); setError(err.message); setSaveStep(''); }
 finally { setSaving(false); }
 };

 const handleReset = () => { handleRoleChange(selectedRoleId); setSuccessMsg(''); setError(''); };

 if (!isOpen || !user) return null;

 const checkedCount = Object.values(menuPermissions).filter(Boolean).length;
 const totalCount = Object.keys(menuPermissions).length;
 const selectedRole = roles.find(r => r._id === selectedRoleId);

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
 <div className="relative bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[85vh] flex flex-col">
 {/* HEADER */}
 <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center">
 <IoShieldCheckmarkOutline size={22} className="text-[#7C3AED]" />
 </div>
 <div>
 <h3 className="text-lg font-bold text-[#0A1628]">Manage Access</h3>
 <p className="text-xs text-gray-400">Edit role & assign to <span className="text-[#7C3AED] font-medium">{user.name}</span></p>
 </div>
 </div>
 <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#0A1628] transition-all"><IoCloseOutline size={18} /></button>
 </div>

 {/* USER BAR + ROLE SELECT */}
 <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 flex-shrink-0 flex-wrap">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center text-sm font-bold text-[#7C3AED]">{user.name?.[0]}</div>
 <div>
 <span className="text-sm font-semibold text-[#0A1628] block leading-tight">{user.name}</span>
 <span className="text-[11px] text-gray-400">{user.email}</span>
 </div>
 </div>
 <div className="h-6 w-px bg-gray-200" />
 <div className="flex items-center gap-2 flex-1 min-w-[200px]">
 <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap">Role</span>
 <select value={selectedRoleId} onChange={e => handleRoleChange(e.target.value)} disabled={loading||saving}
 className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1628] outline-none focus:border-[#A855F7] transition-all flex-1 min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed">
 <option value="">— Select Role —</option>
 {roles.map(r => <option key={r._id} value={r._id}>{r.isFullAccess?'⭐ ':''}{r.roleName}</option>)}
 </select>
 </div>
 <div className="bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-center">
 <span className="text-lg font-bold text-[#009e85]">{checkedCount}</span>
 <span className="text-xs text-gray-400">/{totalCount}</span>
 <span className="text-[10px] text-gray-400 block">Menus</span>
 </div>
 </div>

 {/* ERROR / SUCCESS */}
 {error && <div className="mx-6 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2 flex-shrink-0"><IoAlertCircleOutline size={16} className="flex-shrink-0" />{error}<button onClick={()=>setError('')} className="ml-auto"><IoCloseOutline size={14}/></button></div>}
 {successMsg && <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600 flex items-center gap-2 flex-shrink-0"><IoCheckmarkCircleOutline size={16} className="flex-shrink-0" />{successMsg}</div>}

 {/* TABS */}
 <div className="px-6 pt-4 flex items-center gap-1 border-b border-gray-100 flex-shrink-0">
 {[
 { key: 'menus', label: 'Menu Access', icon: IoGridIcon },
 { key: 'permissions', label: 'Action Permissions', icon: IoLockClosedOutline },
 { key: 'settings', label: 'Role Settings', icon: IoSettingsOutline },
 ].map(tab => (
 <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab===tab.key ? 'border-[#A855F7] text-[#7C3AED]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
 <tab.icon size={16} />{tab.label}
 {tab.key==='permissions' && overrideCount>0 && <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">{overrideCount}</span>}
 </button>
 ))}
 </div>

 {/* CONTENT */}
 <div className="flex-1 overflow-y-auto">
 {loading ? (
 <div className="p-12 flex flex-col items-center justify-center gap-3">
 <div className="w-8 h-8 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
 <span className="text-sm text-gray-400">Loading...</span>
 </div>
 ) : activeTab === 'menus' && (
 <div className="p-6">
 <div className="relative mb-4">
 <IoSearchOutline size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input type="text" placeholder="Search menus..." value={searchMenu} onChange={e => setSearchMenu(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0A1628] placeholder-gray-400 outline-none focus:border-[#A855F7] transition-all" />
 </div>
 <div className="space-y-2">
 {mockMenuTree.filter(g => !searchMenu || g.label.toLowerCase().includes(searchMenu.toLowerCase()) || g.items.some(i => i.label.toLowerCase().includes(searchMenu.toLowerCase()))).map(group => {
 const gc = group.items.filter(i => menuPermissions[i.key]).length;
 const ac = gc === group.items.length;
 return (
 <div key={group.key} className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
 <button onClick={() => toggleGroup(group.key)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all">
 <IoChevronDownOutline size={14} className={`text-gray-400 transition-transform ${expandedGroups[group.key]?'':'-rotate-90'}`} />
 <button onClick={e => { e.stopPropagation(); toggleGroupAll(group.key); }} className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all flex-shrink-0 ${ac?'bg-[#A855F7] border-[#A855F7]':gc>0?'bg-[#A855F7]/30 border-[#A855F7]/50':'bg-transparent border-gray-300'}`}>
 {ac && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
 {!ac && gc>0 && <div className="w-2.5 h-[2px] bg-[#C084FC] rounded-full"/>}
 </button>
 <span className="text-sm font-semibold text-[#0A1628] flex-1 text-left">{group.label}</span>
 <span className={`text-xs font-bold tabular-nums ${ac?'text-[#009e85]':gc>0?'text-amber-600':'text-gray-400'}`}>{gc}/{group.items.length}</span>
 </button>
 {expandedGroups[group.key] && (
 <div className="border-t border-gray-100">
 {group.items.filter(i => !searchMenu || i.label.toLowerCase().includes(searchMenu.toLowerCase())).map(item => (
 <button key={item.key} onClick={() => toggleMenu(item.key)} className="w-full flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-gray-50 transition-all group/item">
 <div className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all flex-shrink-0 ${menuPermissions[item.key]?'bg-[#A855F7] border-[#A855F7]':'bg-transparent border-gray-300 group-hover/item:border-gray-400'}`}>
 {menuPermissions[item.key] && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
 </div>
 <item.icon size={16} className={menuPermissions[item.key]?'text-[#7C3AED]':'text-gray-400'} />
 <span className={`text-sm flex-1 text-left transition-colors ${menuPermissions[item.key]?'text-[#0A1628] font-medium':'text-gray-600'}`}>{item.label}</span>
 {item.badge && <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${item.badge.color}`}>{item.badge.text}</span>}
 </button>
 ))}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}

 {activeTab === 'permissions' && (
 <div className="p-6">
 <div className="mb-4 px-4 py-3 bg-[#A855F7]/5 border border-[#A855F7]/15 rounded-xl">
 <p className="text-xs text-[#7C3AED]"><strong>Per-module actions.</strong> Changes update the role via <code className="bg-[#A855F7]/10 px-1.5 py-0.5 rounded text-[10px] font-mono">PUT /roles/:id</code>{overrideCount>0 && <span className="ml-2 text-amber-600 font-semibold">({overrideCount} changed)</span>}</p>
 </div>
 <div className="space-y-3">
 {mockMenuTree.map(group => (
 <div key={group.key} className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
 <div className="px-4 py-2.5 border-b border-gray-100"><span className="text-xs font-bold text-gray-500 tracking-wider uppercase">{group.label}</span></div>
 <div className="divide-y divide-gray-50">
 {group.items.map(item => {
 const a = actionPermissions[item.key]||{}; const v = menuPermissions[item.key]||false;
 return (
 <div key={item.key} className="px-4 py-3 flex items-center gap-4 hover:bg-white/50 transition-all">
 <div className="flex items-center gap-2 w-44 flex-shrink-0 min-w-0">
 <item.icon size={14} className={v?'text-[#7C3AED]':'text-gray-300'} />
 <span className={`text-sm truncate ${v?'text-[#0A1628] font-medium':'text-gray-400'}`}>{item.label}</span>
 </div>
 <div className="flex items-center gap-1.5 flex-wrap flex-1">
 {ACTIONS.map(action => <ActionToggle key={action} label={action} enabled={a[action]||false} disabled={action!=='view'&&!v} onToggle={()=>toggleAction(item.key,action)}/>)}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {activeTab === 'settings' && (
 <div className="p-6 space-y-4">
 <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
 <label className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-2">SELECTED ROLE</label>
 {selectedRole ? (
 <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
 {selectedRole.isFullAccess && <IoStarOutline size={16} className="text-amber-500"/>}
 <span className="text-sm font-semibold text-[#0A1628]">{selectedRole.roleName}</span>
 {selectedRole.isFullAccess && <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md text-[10px] font-bold text-amber-700">FULL ACCESS</span>}
 </div>
 ) : <div className="bg-white border border-red-200 rounded-xl px-4 py-3 text-sm text-red-500">⚠ Select a role above</div>}
 </div>
 <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
 <label className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-2">DESCRIPTION</label>
 <textarea value={roleDescription} onChange={e=>setRoleDescription(e.target.value)} placeholder="Role description..." rows={2} disabled={!selectedRoleId||saving}
 className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[#0A1628] text-sm placeholder-gray-400 outline-none focus:border-[#A855F7] resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"/>
 </div>
 <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
 <label className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-2">CHANGES</label>
 <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
 {overrideCount>0 ? <span className="text-sm text-amber-700 font-medium flex items-center gap-2"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">{overrideCount}</span>module{overrideCount>1?'s':''} differ from original</span>
 : selectedRole ? <span className="text-sm text-[#009e85] font-medium flex items-center gap-1.5"><IoCheckmarkCircleOutline size={14}/>Unchanged</span>
 : <span className="text-sm text-gray-400">—</span>}
 </div>
 </div>
 <div className="bg-[#7C3AED]/5 border border-[#7C3AED]/15 rounded-xl p-4">
 <label className="text-xs font-bold text-[#7C3AED] tracking-wider uppercase block mb-2">SAVE FLOW</label>
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-xs">
 <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${saveStep==='role'?'bg-[#A855F7] text-white animate-pulse':saving?'bg-emerald-100 text-emerald-600':'bg-gray-100 text-gray-400'}`}>1</span>
 <code className="text-gray-600 font-mono text-[11px]">PUT /api/useraccess/roles/{selectedRoleId?selectedRoleId.slice(-6):':id'}</code>
 </div>
 <div className="flex items-center gap-2 text-xs">
 <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${saveStep==='assign'?'bg-[#A855F7] text-white animate-pulse':saving?'bg-gray-100 text-gray-400':'bg-gray-100 text-gray-400'}`}>2</span>
 <code className="text-gray-600 font-mono text-[11px]">PATCH /api/useraccess/employees/{user?._id?.slice(-6)||':id'}/access</code>
 </div>
 </div>
 </div>
 {overrideCount>0 && (
 <div className="bg-red-50 border border-red-200 rounded-xl p-4">
 <label className="text-xs font-bold text-red-500 tracking-wider uppercase block mb-2">RESET</label>
 <p className="text-xs text-red-600/70 mb-3">Revert to role's original permissions.</p>
 <button onClick={handleReset} disabled={saving} className="px-4 py-2 bg-white border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50">Reset to Original</button>
 </div>
 )}
 </div>
 )}
 </div>

 {/* FOOTER */}
 <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
 <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#0A1628] hover:bg-gray-50 transition-all">Cancel</button>
 <div className="flex items-center gap-3">
 <button onClick={handleReset} disabled={!selectedRoleId||saving||overrideCount===0} className="px-5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-[#0A1628] transition-all disabled:opacity-40 disabled:cursor-not-allowed">Reset to Default</button>
 <button onClick={handleSave} disabled={saving||!selectedRoleId} className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${saving||!selectedRoleId?'bg-gray-200 text-gray-400 cursor-not-allowed':'bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-lg shadow-[#A855F7]/25'}`}>
 {saving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{saveStep==='role'?'Updating role...':'Assigning...'}</>) : (<><IoSaveOutline size={16}/>Save & Assign</>)}
 </button>
 </div>
 </div>
 </div>
 </div>
 );
};

// ==================== MENU TREE ====================
const mockMenuTree = [
 { key: 'dashboard', label: 'Dashboard', icon: IoGridIcon, items: [
 { key: 'dash_overview', label: 'Overview', icon: IoEyeOutline },
 { key: 'dash_analytics', label: 'Analytics', icon: IoGridIcon, badge: { text: 'NEW', color: 'bg-emerald-50 text-emerald-600' } },
 { key: 'dash_reports', label: 'Reports', icon: IoDocumentTextOutline },
 ]},
 { key: 'bgv', label: 'BGV Platform', icon: IoShieldCheckmarkOutline, items: [
 { key: 'bgv_workorders', label: 'Workorders', icon: IoDocumentTextOutline },
 { key: 'bgv_assignment', label: 'Employee Assignment', icon: IoPeopleOutline },
 { key: 'bgv_verification', label: 'Verification Queue', icon: IoCheckmarkCircleOutline },
 { key: 'bgv_insufficiency', label: 'Insufficiency Management', icon: IoAlertCircleOutline, badge: { text: '3', color: 'bg-red-50 text-red-600' } },
 { key: 'bgv_reports', label: 'BGV Reports', icon: IoDocumentTextOutline },
 { key: 'bgv_sla', label: 'SLA Tracking', icon: IoSettingsOutline },
 ]},
 { key: 'clients', label: 'Client Management', icon: IoBusinessOutline, items: [
 { key: 'client_list', label: 'Client List', icon: IoBusinessOutline },
 { key: 'client_packages', label: 'Packages', icon: IoGridIcon },
 { key: 'client_pricing', label: 'Pricing', icon: IoSettingsOutline },
 ]},
 { key: 'hr', label: 'HR Module', icon: IoPeopleOutline, items: [
 { key: 'hr_employees', label: 'Employees', icon: IoPeopleOutline },
 { key: 'hr_onboarding', label: 'Onboarding', icon: IoPersonCircleOutline },
 { key: 'hr_offboarding', label: 'Offboarding', icon: IoPersonCircleOutline },
 ]},
 { key: 'admin', label: 'Administration', icon: IoSettingsOutline, items: [
 { key: 'admin_users', label: 'User Management', icon: IoPeopleOutline },
 { key: 'admin_roles', label: 'Roles & Permissions', icon: IoLockClosedOutline },
 { key: 'admin_access', label: 'User Access', icon: IoShieldOutline },
 { key: 'admin_audit', label: 'Audit Log', icon: IoDocumentTextOutline },
 { key: 'admin_settings', label: 'System Settings', icon: IoSettingsOutline },
 ]},
];

// ==================== MAIN COMPONENT ====================
const UserAccessManagement = () => {
 const navigate = useNavigate();
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
 const [groupFilter, setGroupFilter] = useState('all');
 const [accessFilter, setAccessFilter] = useState('all');
 const [companyFilter, setCompanyFilter] = useState('all');
 const [manageModal, setManageModal] = useState({ open: false, user: null });

 const fetchEmployees = async (signal) => {
 setLoading(true); setError(null);
 try {
 const res = await fetch(EMPLOYEES_ENDPOINT, { method: 'GET', headers: { 'Content-Type': 'application/json' }, signal });
 if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
 const json = await res.json();
 let rawList = null;
 if (Array.isArray(json)) { rawList = json; } else {
 for (const key of ['data','employees','results','users','list','records']) { if (json[key]&&Array.isArray(json[key])) { rawList = json[key]; break; } }
 }
 if (!rawList) { console.error('API response:', json); throw new Error('API did not return an expected array.'); }
 setUsers(rawList.map(mapEmployeeFromApi));
 } catch (err) { if (err.name!=='AbortError') { console.error(err); setError(err.message); } }
 finally { if (!signal.aborted) setLoading(false); }
 };

 useEffect(() => { const c = new AbortController(); fetchEmployees(c.signal); return () => c.abort(); }, []);
 const handleAccessSaved = useCallback(() => { const c = new AbortController(); fetchEmployees(c.signal); }, []);
 const handleRetry = () => { const c = new AbortController(); fetchEmployees(c.signal); };

 const stats = useMemo(() => {
 const groups = {}, accesses = {}, companies = {};
 users.forEach(u => { groups[u.group]=(groups[u.group]||0)+1; accesses[u.accessType]=(accesses[u.accessType]||0)+1; companies[u.company]=(companies[u.company]||0)+1; });
 return { total: users.length, groups, accesses, companies };
 }, [users]);

 const groupOptions = useMemo(() => [
 { key: 'all', label: 'All Groups', count: stats.total, icon: IoPeopleOutline },
 ...Object.entries(stats.groups).map(([g, c]) => ({ key: g, label: g, count: c, icon: IoPersonCircleOutline })),
 ], [stats]);
 const accessOptions = useMemo(() => [
 { key: 'all', label: 'All Access', count: stats.total, icon: IoShieldOutline },
 ...Object.entries(stats.accesses).map(([a, c]) => ({ key: a, label: a, count: c, icon: IoLockClosedOutline })),
 ], [stats]);
 const companyOptions = useMemo(() => [
 { key: 'all', label: 'All Companies', count: stats.total, icon: IoBusinessOutline },
 ...Object.entries(stats.companies).map(([co, c]) => ({ key: co, label: co, count: c, icon: IoBusinessOutline })),
 ], [stats]);

 const filteredUsers = useMemo(() => {
 let r = [...users];
 if (searchQuery) { const q = searchQuery.toLowerCase(); r = r.filter(u => u.name?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q)||u.company?.toLowerCase().includes(q)||u.accessRoleName?.toLowerCase().includes(q)); }
 if (groupFilter!=='all') r = r.filter(u => u.group===groupFilter);
 if (accessFilter!=='all') r = r.filter(u => u.accessType===accessFilter);
 if (companyFilter!=='all') r = r.filter(u => u.company===companyFilter);
 r.sort((a,b) => { const av=a[sortConfig.key]||'', bv=b[sortConfig.key]||''; return sortConfig.direction==='asc'?(av>bv?1:-1):(av<bv?1:-1); });
 return r;
 }, [users, searchQuery, groupFilter, accessFilter, companyFilter, sortConfig]);

 const handleSort = (key) => setSortConfig(p => ({ key, direction: p.key===key&&p.direction==='asc'?'desc':'asc' }));
 const SortIcon = ({ column }) => { if (sortConfig.key!==column) return <IoArrowUpOutline size={12} className="text-gray-400 opacity-30"/>; return sortConfig.direction==='asc'?<IoArrowUpOutline size={12} className="text-[#009e85]"/>:<IoArrowDownOutline size={12} className="text-[#009e85]"/>; };
 const categoryColor = (cat) => cat==='Internal'?'text-emerald-600':'text-pink-600';

 return (
 <div className="min-h-screen bg-[#f8fefd] text-[#F0F4F8] font-sans selection:bg-[#00D4AA]/30 selection:text-[#009e85]">
 <Header showNavigation={true} />
 <ManageAccessModal isOpen={manageModal.open} onClose={() => setManageModal({ open: false, user: null })} user={manageModal.user} onSaved={handleAccessSaved} />

 <div className="bg-gray-50 border-b border-gray-100 py-5">
 <div className="max-w-[1600px] mx-auto px-6">
 <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-[#0A1628] transition-all mb-4"><IoArrowBackOutline size={18} /><span>Back</span></button>
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-[#0A1628] tracking-tight">User Access Management</h1>
 <p className="text-sm text-gray-400 mt-0.5">Edit role permissions and assign to users</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-center min-w-[70px]"><div className="text-xl font-bold text-[#0A1628]">{stats.total}</div><div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Users</div></div>
 <div className="bg-white border border-[#A855F7]/20 rounded-xl px-4 py-2.5 text-center min-w-[70px]"><div className="text-xl font-bold text-[#7C3AED]">{Object.keys(stats.groups).length}</div><div className="text-[10px] font-bold text-[#7C3AED]/60 tracking-wider uppercase">Groups</div></div>
 <div className="bg-white border border-[#00D4AA]/20 rounded-xl px-4 py-2.5 text-center min-w-[70px]"><div className="text-xl font-bold text-[#009e85]">{users.filter(u=>u.accessRoleId).length}</div><div className="text-[10px] font-bold text-[#009e85]/60 tracking-wider uppercase">Assigned</div></div>
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-[1600px] mx-auto px-6 pt-5">
 <div className="flex items-center justify-between gap-4 flex-wrap">
 <div className="flex items-center gap-3">
 <FilterDropdown label="Group" options={groupOptions} value={groupFilter} onChange={setGroupFilter} />
 <FilterDropdown label="Access Type" options={accessOptions} value={accessFilter} onChange={setAccessFilter} />
 <FilterDropdown label="Company" options={companyOptions} value={companyFilter} onChange={setCompanyFilter} />
 </div>
 <div className="relative">
 <IoSearchOutline size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input type="text" placeholder="Search user, email, company, role..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-72 bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0A1628] placeholder-gray-400 outline-none focus:border-[#00D4AA] transition-all" />
 </div>
 </div>
 </div>

 <div className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">
 <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
 <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
 <div className="grid grid-cols-12 gap-4 items-center">
 <div className="col-span-3"><button onClick={() => handleSort('name')} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wider uppercase hover:text-[#009e85] transition-colors">USER <SortIcon column="name" /></button></div>
 <div className="col-span-2"><button onClick={() => handleSort('company')} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wider uppercase hover:text-[#009e85] transition-colors">COMPANY <SortIcon column="company" /></button></div>
 <div className="col-span-1"><span className="text-xs font-bold text-gray-400 tracking-wider uppercase">GROUP</span></div>
 <div className="col-span-1"><span className="text-xs font-bold text-gray-400 tracking-wider uppercase">CATEGORY</span></div>
 <div className="col-span-2"><button onClick={() => handleSort('accessType')} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wider uppercase hover:text-[#009e85] transition-colors">ASSIGNED ROLE <SortIcon column="accessType" /></button></div>
 <div className="col-span-1"><span className="text-xs font-bold text-gray-400 tracking-wider uppercase">STATUS</span></div>
 <div className="col-span-2 text-right"><span className="text-xs font-bold text-gray-400 tracking-wider uppercase">ACTIONS</span></div>
 </div>
 </div>

 {loading && (<div className="p-20 text-center text-gray-400"><div className="animate-spin w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full mx-auto mb-4"/><div className="text-sm font-medium">Loading employees...</div><div className="text-xs text-gray-400/60 mt-1">{EMPLOYEES_ENDPOINT}</div></div>)}
 {!loading && error && (<div className="p-20 text-center"><div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4"><IoAlertCircleOutline size={28} className="text-red-400"/></div><div className="text-gray-700 text-lg font-semibold">Failed to load employees</div><div className="text-gray-400 text-sm mt-1 max-w-md mx-auto">{error}</div><button onClick={handleRetry} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#A855F7] hover:bg-[#9333EA] rounded-xl text-sm font-semibold text-white transition-all"><IoRefreshOutline size={16}/> Retry</button></div>)}
 {!loading && !error && filteredUsers.length === 0 && (<div className="p-20 text-center"><IoPeopleOutline size={48} className="text-gray-400 mx-auto mb-4"/><div className="text-gray-400 text-lg">No users found</div><div className="text-gray-400/60 text-sm mt-1">Try adjusting your search or filters</div></div>)}

 {!loading && !error && filteredUsers.length > 0 && (
 <div className="divide-y divide-gray-100">
 {filteredUsers.map((user) => (
 <div key={user._id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-all duration-150 group">
 <div className="col-span-3 flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center text-sm font-bold text-[#7C3AED] flex-shrink-0">{user.avatar}</div>
 <div className="min-w-0"><span className="text-sm font-semibold text-[#0A1628] block truncate">{user.name}</span><span className="text-[11px] text-gray-400 truncate block">{user.email}</span></div>
 </div>
 <div className="col-span-2"><span className="text-sm text-gray-600 truncate block">{user.company}</span></div>
 <div className="col-span-1"><GroupBadge group={user.group}/></div>
 <div className="col-span-1"><span className={`text-xs font-semibold ${categoryColor(user.category)} flex items-center gap-1.5`}><span className={`w-1.5 h-1.5 rounded-full ${user.category==='Internal'?'bg-emerald-400':'bg-pink-500'}`}/>{user.category}</span></div>
 <div className="col-span-2">{user.accessRoleName ? <span className="px-2.5 py-1 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-lg text-[11px] font-semibold text-[#7C3AED] truncate block max-w-[160px]">{user.accessRoleName}</span> : <span className="text-xs text-gray-400 italic">Not assigned</span>}</div>
 <div className="col-span-1">{user.accessRoleId ? <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>Active</span> : <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"/>Pending</span>}</div>
 <div className="col-span-2 flex items-center justify-end gap-2">
 <button onClick={() => setManageModal({ open: true, user })} className="flex items-center gap-2 px-4 py-2 bg-[#00B494]/15 border border-[#00B494]/30 rounded-xl text-xs font-semibold text-[#00B494] hover:bg-[#00B494]/25 hover:border-[#00B494]/50 transition-all duration-200 group-hover:shadow-[0_0_16px_rgba(0,180,148,0.15)]"><IoSettingsOutline size={14}/> Manage Access</button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="flex items-center justify-between mt-5 px-2">
 <div className="text-sm text-gray-400">Showing <span className="text-[#0A1628] font-medium">{filteredUsers.length}</span> of <span className="text-[#0A1628] font-medium">{users.length}</span> users</div>
 <div className="flex items-center gap-2">
 <button className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-600 font-medium hover:text-[#0A1628] hover:border-gray-400 transition-all disabled:text-gray-400 disabled:opacity-60" disabled>Previous</button>
 <button className="px-4 py-2 bg-[#00D4AA]/10 border border-[#00D4AA]/30 rounded-xl text-sm text-[#009e85] font-medium">1</button>
 <button className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 font-medium hover:text-[#0A1628] hover:border-gray-400 transition-all">Next</button>
 </div>
 </div>
 </div>
 </div>
 );
};

export default UserAccessManagement;