// // src/components/WorkorderDashboard.jsx
// 'use client';

// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   IoAdd,
//   IoGridOutline,
//   IoTrashOutline,
//   IoPencilOutline,
//   IoEye as IoViewIcon,
//   IoFilterOutline,
//   IoCloseOutline,
//   IoSearchOutline,
//   IoRefreshOutline,
//   IoListOutline,
//   IoCardOutline,
//   IoArrowBackOutline,
//   IoBriefcaseOutline,
//   IoPersonOutline,
//   IoBusinessOutline,
//   IoCubeOutline,
//   IoSettingsOutline,
//   IoShieldCheckmarkOutline,
//   IoDocumentTextOutline,
//   IoTimeOutline,
//   IoIdCardOutline,
//   IoLocationOutline,
//   IoDownloadOutline,
//   IoLockClosedOutline,
//   IoLockOpenOutline,
// } from 'react-icons/io5';
// import { useNavigate } from 'react-router-dom';
// import api from '../apiroute/apiroute';
// import Header from '../screens/header';

// // ---- Static Data ----
// const STATUS_OPTIONS = ['Initiated', 'Document Review', 'In Progress', 'Completed', 'Overdue'];

// // ---- Helpers ----
// const friendlyStatus = (wo) => {
//   if (wo.status === 'completed') return 'Completed';
//   if (wo.status === 'overdue') return 'Overdue';
//   if (wo.status === 'in-progress') return 'In Progress';
//   if (wo.status === 'candidate-details') return 'Document Review';
//   if (wo.candidateDetails && Object.keys(wo.candidateDetails).length > 0) return 'Document Review';
//   return 'Initiated';
// };

// const statusBadgeClass = (status = '') => {
//   const s = status.toLowerCase();
//   if (s.includes('initiated')) return 'bg-blue-50 text-blue-700 border-blue-200';
//   if (s.includes('document')) return 'bg-purple-50 text-purple-700 border-purple-200';
//   if (s.includes('progress')) return 'bg-amber-50 text-amber-700 border-amber-200';
//   if (s.includes('complete')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
//   if (s.includes('overdue') || s.includes('discrepant')) return 'bg-red-50 text-red-700 border-red-200';
//   if (s.includes('pending')) return 'bg-gray-50 text-gray-600 border-gray-200';
//   return 'bg-gray-50 text-gray-600 border-gray-200';
// };

// const formatDate = (d) => {
//   if (!d) return '—';
//   const date = new Date(d);
//   if (isNaN(date)) return '—';
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = date.toLocaleString('en-US', { month: 'short' });
//   const year = date.getFullYear();
//   const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
//   return `${day}-${month}-${year} ${time}`;
// };

// const apiBaseURL = api?.defaults?.baseURL?.replace(/\/api\/?$/, '') || '';
// const fileHref = (rel) => (rel ? `${apiBaseURL}${rel}` : '');

// // Flattens a nested object (e.g. a check's `data.__structured` payload from
// // the Address / Employment / Education forms) into [label, value] pairs,
// // joining nested keys with " › " so arbitrarily-shaped structured data still
// // displays without needing to hardcode every possible field name.
// const flattenEntries = (obj, prefix = '') => {
//   if (!obj || typeof obj !== 'object') return [];
//   return Object.entries(obj).flatMap(([k, v]) => {
//     if (v === null || v === undefined || v === '') return [];
//     const label = prefix ? `${prefix} › ${k}` : k;
//     if (Array.isArray(v)) {
//       if (v.length === 0) return [];
//       return [[label, v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ')]];
//     }
//     if (typeof v === 'object') return flattenEntries(v, label);
//     return [[label, v]];
//   });
// };

// // ====================================================================
// // Small reusable bits (used only inside the View modal now)
// // ====================================================================
// const SectionTitle = ({ icon: Icon, title, color = '#00B494' }) => (
//   <div className="flex items-center gap-2 mb-4">
//     <Icon size={18} style={{ color }} />
//     <h4 className="text-base font-bold text-black">{title}</h4>
//   </div>
// );

// const ViewCell = ({ label, value }) => (
//   <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
//     <div className="text-gray-500 text-xs mb-1">{label}</div>
//     <div className="text-black truncate">{value || '—'}</div>
//   </div>
// );

// const WorkorderDashboard = () => {
//   const navigate = useNavigate();

//   // --- Modal state ---
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);

//   const [viewType, setViewType] = useState('list');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);

//   const [deletingId, setDeletingId] = useState(null);
//   const [viewingWorkorder, setViewingWorkorder] = useState(null);
//   const [lockingId, setLockingId] = useState(null);

//   const [workorders, setWorkorders] = useState([]);
//   const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, overdue: 0 });

//   const [filterCriteria, setFilterCriteria] = useState({ bgvRef: '', candidate: '', client: '', status: 'all' });

//   // --- API Calls ---
//   const fetchWorkorders = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/workorders');
//       if (response.data.success) {
//         setWorkorders(response.data.workorders || []);
//         if (response.data.stats) setStats(response.data.stats);
//       }
//     } catch (error) {
//       console.error('Failed to fetch workorders:', error);
//       alert('Failed to load workorders. Please ensure backend is running on port 5000.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchWorkorders();
//   }, []);

//   // ------------------------------------------------------------------
//   // EDIT — full parity with "New Workorder": navigates to the SAME
//   // multi-step creation page, passing the existing workorder's id so
//   // that page pre-fills every field (workorder info, candidate details,
//   // checks) from the existing record and swaps its "Create" button for
//   // "Update". Nothing is edited inline here anymore — this is the
//   // "complete edit access" the New Workorder flow already provides.
//   // Locked (finalized) workorders never expose this action.
//   // ------------------------------------------------------------------
//   const handleEdit = (wo) => {
//     if (wo.locked) return;
//     navigate(`/workorder-creation?id=${wo._id}&mode=edit`);
//   };

//   // Configure keeps its own destination (e.g. jumps straight to the
//   // checks/configuration step of the same page) — also blocked once locked.
//   const handleConfigure = (wo) => {
//     if (wo.locked) return;
//     navigate(`/workorder-creation?id=${wo._id}`);
//   };

//   // ------------------------------------------------------------------
//   // LOCK / FINALIZE — the padlock icon. Locking a workorder is meant to
//   // be a deliberate, final action: once locked, the Edit and Configure
//   // actions disappear from this row entirely and only View remains.
//   // Clicking the padlock again on an already-locked row offers to
//   // unlock it (for cases where a finalize was done by mistake) rather
//   // than silently doing nothing.
//   // ------------------------------------------------------------------
//   const handleToggleLock = async (wo) => {
//     const confirmMsg = wo.locked
//       ? 'This workorder is finalized. Unlock it to allow editing again?'
//       : 'Finalize this workorder? Once finalized, it can no longer be edited or configured.';
//     if (!window.confirm(confirmMsg)) return;

//     setLockingId(wo._id);
//     try {
//       const res = await api.put(`/workorders/${wo._id}/lock`, { locked: !wo.locked });
//       if (res.data.success) {
//         await fetchWorkorders();
//       } else {
//         alert(res.data.message || 'Failed to update finalize status.');
//       }
//     } catch (error) {
//       console.error('Failed to update lock status:', error);
//       alert(error.response?.data?.message || 'Failed to update finalize status.');
//     } finally {
//       setLockingId(null);
//     }
//   };

//   // --- DELETE ---
//   const handleDeleteClick = (id) => { setDeletingId(id); setIsDeleteModalOpen(true); };
//   const confirmDelete = async () => {
//     try {
//       await api.delete(`/workorders/${deletingId}`);
//       alert('Workorder deleted successfully');
//       await fetchWorkorders();
//     } catch (error) {
//       console.error(error);
//       alert('Failed to delete workorder');
//     } finally {
//       setIsDeleteModalOpen(false);
//       setDeletingId(null);
//     }
//   };

//   // --- VIEW ---
//   const handleView = (wo) => { setViewingWorkorder(wo); setIsViewModalOpen(true); };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilterCriteria((prev) => ({ ...prev, [name]: value }));
//   };
//   const clearFilters = () => {
//     setFilterCriteria({ bgvRef: '', candidate: '', client: '', status: 'all' });
//     setSearchQuery('');
//   };

//   const filteredWorkorders = useMemo(() => {
//     return workorders.filter((wo) => {
//       const query = searchQuery.toLowerCase();
//       const matchesSearch = !query ||
//         wo.bgvRef?.toLowerCase().includes(query) ||
//         wo.fullName?.toLowerCase().includes(query) ||
//         wo.client?.toLowerCase().includes(query) ||
//         wo.email?.toLowerCase().includes(query);
//       const matchesRef = !filterCriteria.bgvRef || wo.bgvRef?.toLowerCase().includes(filterCriteria.bgvRef.toLowerCase());
//       const matchesCandidate = !filterCriteria.candidate || wo.fullName?.toLowerCase().includes(filterCriteria.candidate.toLowerCase());
//       const matchesClient = !filterCriteria.client || wo.client?.toLowerCase().includes(filterCriteria.client.toLowerCase());
//       const matchesStatus = filterCriteria.status === 'all' ? true : friendlyStatus(wo).toLowerCase() === filterCriteria.status.toLowerCase();
//       return matchesSearch && matchesRef && matchesCandidate && matchesClient && matchesStatus;
//     });
//   }, [workorders, filterCriteria, searchQuery]);

//   const viewCd = viewingWorkorder?.candidateDetails || {};
//   const viewDocs = viewCd.documents || {};

//   return (
//     <div className="min-h-screen bg-[#f8fefd] text-black font-sans selection:bg-[#00D4AA]/30 selection:text-black">
//       <Header showNavigation={false} />

//       <main className="max-w-7xl mx-auto px-8 py-12">

//         {/* TOP BAR */}
//         <div className="flex items-center justify-between mb-10">
//           <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-black transition-all active:scale-95 shadow-sm">
//             <IoArrowBackOutline size={20} />
//             <span>Back</span>
//           </button>
//         </div>

//         {/* HEADING */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8 animate-fade-in-up">
//           <div className="md:w-1/2">
//             <div className="flex items-center gap-4 mb-3">
//               <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
//                 <IoBriefcaseOutline size={24} className="text-[#00B494]" />
//               </div>
//               <h2 className="text-4xl font-bold text-black tracking-tight">Workorder Management</h2>
//             </div>
//             <p className="text-gray-600 text-base leading-relaxed flex items-center gap-2">
//               <IoGridOutline size={18} className="text-gray-400" />
//               Create and manage BGV workorders, track progress and verification status.
//             </p>
//           </div>

//           <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
//             <div className="relative flex-1 md:w-72 lg:w-80">
//               <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Ref, Candidate, Client..."
//                 className="w-full bg-white border border-gray-200 focus:border-[#00B494] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-black placeholder-gray-400 transition-all shadow-sm" />
//             </div>

//             <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
//               <button onClick={() => setViewType('list')} className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#00D4AA] text-black' : 'text-gray-500 hover:text-black'}`}><IoListOutline size={20} /></button>
//               <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-[#00D4AA] text-black' : 'text-gray-500 hover:text-black'}`}><IoCardOutline size={20} /></button>
//             </div>

//             <button onClick={() => setIsFilterOpen(true)}
//               className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2
//                 ${Object.values(filterCriteria).some((val) => val && val !== 'all') || searchQuery
//                   ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00806E]'
//                   : 'bg-white border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50'}`}>
//               <IoFilterOutline size={18} />
//               <span>Filter</span>
//             </button>

//             <button onClick={() => navigate('/workorder-creation')}
//               className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-black rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.35)] hover:scale-105 active:scale-95 overflow-hidden">
//               <IoAdd size={18} className="relative z-10" />
//               <span className="relative z-10">New Workorder</span>
//             </button>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//           {[
//             { label: 'TOTAL', val: stats.total ?? workorders.length, color: 'text-[#00B494]' },
//             { label: 'ACTIVE', val: stats.active ?? 0, color: 'text-emerald-600' },
//             { label: 'COMPLETED', val: stats.completed ?? 0, color: 'text-blue-600' },
//             { label: 'OVERDUE', val: stats.overdue ?? 0, color: 'text-red-600' },
//           ].map((stat, i) => (
//             <div key={i} className="group relative p-6 rounded-2xl bg-white border border-gray-200 overflow-hidden transition-all hover:border-gray-300 hover:shadow-md shadow-sm">
//               <div className="relative flex flex-col items-start justify-between h-full gap-2">
//                 <div className="text-xs font-bold text-gray-400 tracking-wider uppercase">{stat.label}</div>
//                 <div className={`text-5xl font-bold ${stat.color} tracking-tighter`}>{stat.val}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* TABLE / GRID */}
//         {loading ? (
//           <div className="text-center py-20 text-gray-500">Loading workorders...</div>
//         ) : (
//           <>
//             {/* LIST VIEW */}
//             {viewType === 'list' && (
//               <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left border-collapse">
//                     <thead>
//                       <tr className="border-b border-gray-200 bg-gray-50">
//                         <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Workorder #</th>
//                         <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Candidate</th>
//                         <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Client</th>
//                         <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Package</th>
//                         <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Status</th>
//                         <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Progress</th>
//                         <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Created</th>
//                         <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase text-right">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredWorkorders.length > 0 ? (
//                         filteredWorkorders.map((wo) => {
//                           const done = wo.progressDone ?? 0;
//                           const total = wo.progressTotal ?? (wo.checks?.length || 1);
//                           const pct = total ? Math.round((done / total) * 100) : 0;
//                           return (
//                             <tr key={wo._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
//                               <td className="p-5"><span className="px-3 py-1.5 rounded-lg bg-[#00D4AA]/10 text-[#00806E] text-xs font-mono font-bold whitespace-nowrap">{wo.bgvRef}</span></td>
//                               <td className="p-5">
//                                 <div className="flex items-center gap-4">
//                                   <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-[#00806E]">{wo.fullName?.charAt(0) || '?'}</div>
//                                   <div>
//                                     <div className="font-medium text-black text-sm">{wo.fullName || '—'}</div>
//                                     {wo.email && <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{wo.email}</div>}
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="p-5 text-sm text-gray-600">{wo.client || '—'}</td>
//                               <td className="p-5 text-sm text-gray-600">{wo.packageName || '—'}</td>
//                               <td className="p-5">
//                                 <div className="flex items-center gap-2 flex-wrap">
//                                   <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${statusBadgeClass(friendlyStatus(wo))}`}>{friendlyStatus(wo)}</span>
//                                   {wo.locked && (
//                                     <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border bg-gray-100 text-gray-600 border-gray-300">
//                                       <IoLockClosedOutline size={11} /> Finalized
//                                     </span>
//                                   )}
//                                 </div>
//                               </td>
//                               <td className="p-5">
//                                 <div className="flex items-center gap-2">
//                                   <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden"><div className="h-full bg-[#00D4AA] rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
//                                   <span className="text-xs text-gray-500 whitespace-nowrap">{done}/{total}</span>
//                                 </div>
//                               </td>
//                               <td className="p-5 text-xs text-gray-500 whitespace-nowrap">{formatDate(wo.createdAt)}</td>
//                               <td className="p-5 text-right">
//                                 <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
//                                   <button onClick={() => handleView(wo)} title="View" className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00806E] text-gray-500 transition-all"><IoViewIcon size={18} /></button>
//                                   {!wo.locked && (
//                                     <button onClick={() => handleEdit(wo)} title="Edit" className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition-all"><IoPencilOutline size={18} /></button>
//                                   )}
//                                   {!wo.locked && (
//                                     <button onClick={() => handleConfigure(wo)} title="Configure" className="p-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-gray-500 transition-all"><IoSettingsOutline size={18} /></button>
//                                   )}
//                                   <button
//                                     onClick={() => handleToggleLock(wo)}
//                                     title={wo.locked ? 'Unlock' : 'Finalize (lock from further edits)'}
//                                     disabled={lockingId === wo._id}
//                                     className={`p-2 rounded-lg transition-all disabled:opacity-40 ${wo.locked ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'}`}
//                                   >
//                                     {wo.locked ? <IoLockClosedOutline size={18} /> : <IoLockOpenOutline size={18} />}
//                                   </button>
//                                   <button onClick={() => handleDeleteClick(wo._id)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-500 transition-all"><IoTrashOutline size={18} /></button>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr><td colSpan={8} className="p-16 text-center text-gray-500">No workorders found.</td></tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* GRID VIEW */}
//             {viewType === 'grid' && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
//                 {filteredWorkorders.length > 0 ? (
//                   filteredWorkorders.map((wo) => {
//                     const done = wo.progressDone ?? 0;
//                     const total = wo.progressTotal ?? (wo.checks?.length || 1);
//                     const pct = total ? Math.round((done / total) * 100) : 0;
//                     return (
//                       <div key={wo._id} className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg shadow-sm transition-all duration-300 flex flex-col h-full">
//                         <div className="flex items-start justify-between mb-6">
//                           <div className="flex items-center gap-3">
//                             <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-base font-bold text-[#00806E]">{wo.fullName?.charAt(0) || '?'}</div>
//                             <div>
//                               <h3 className="font-bold text-black text-sm leading-tight">{wo.fullName || '—'}</h3>
//                               <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{wo.bgvRef}</p>
//                             </div>
//                           </div>
//                           <div className="flex flex-col items-end gap-1">
//                             <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase ${statusBadgeClass(friendlyStatus(wo))}`}>{friendlyStatus(wo)}</div>
//                             {wo.locked && (
//                               <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-semibold border bg-gray-100 text-gray-600 border-gray-300">
//                                 <IoLockClosedOutline size={10} /> Finalized
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                         <div className="space-y-3 mb-6 flex-1">
//                           <div className="flex items-center gap-3 text-xs text-gray-600"><IoBusinessOutline size={14} /> {wo.client || '—'}</div>
//                           <div className="flex items-center gap-3 text-xs text-gray-600"><IoCubeOutline size={14} /> {wo.packageName || '—'}</div>
//                           <div className="flex items-center gap-3 text-xs text-gray-600"><IoShieldCheckmarkOutline size={14} /> {wo.checks?.length || 0} check(s)</div>
//                           <div className="flex items-center gap-3 text-xs text-gray-600"><IoTimeOutline size={14} /> {formatDate(wo.createdAt)}</div>
//                         </div>
//                         <div className="mb-4">
//                           <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5"><span>Progress</span><span>{done}/{total}</span></div>
//                           <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden"><div className="h-full bg-[#00D4AA] rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
//                         </div>
//                         <div className="pt-4 border-t border-gray-100 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
//                           <button onClick={() => handleView(wo)} className="text-xs font-medium flex items-center gap-1 text-gray-600 hover:text-[#00806E]">View Details</button>
//                           <div className="flex gap-2">
//                             {!wo.locked && (
//                               <button onClick={() => handleEdit(wo)} title="Edit" className="p-2 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-blue-600"><IoPencilOutline size={15} /></button>
//                             )}
//                             {!wo.locked && (
//                               <button onClick={() => handleConfigure(wo)} title="Configure" className="p-2 rounded-lg bg-gray-100 hover:bg-amber-500 hover:text-white transition-all text-amber-600"><IoSettingsOutline size={15} /></button>
//                             )}
//                             <button
//                               onClick={() => handleToggleLock(wo)}
//                               title={wo.locked ? 'Unlock' : 'Finalize'}
//                               disabled={lockingId === wo._id}
//                               className={`p-2 rounded-lg bg-gray-100 transition-all disabled:opacity-40 ${wo.locked ? 'text-gray-600 hover:bg-gray-300' : 'text-purple-600 hover:bg-purple-600 hover:text-white'}`}
//                             >
//                               {wo.locked ? <IoLockClosedOutline size={15} /> : <IoLockOpenOutline size={15} />}
//                             </button>
//                             <button onClick={() => handleDeleteClick(wo._id)} title="Delete" className="p-2 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white transition-all text-red-600"><IoTrashOutline size={15} /></button>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="col-span-full p-16 text-center text-gray-500">No workorders found.</div>
//                 )}
//               </div>
//             )}
//           </>
//         )}

//         {/* ============== DELETE MODAL ============== */}
//         {isDeleteModalOpen && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
//             <div className="relative w-full max-w-md bg-white border border-red-200 rounded-2xl p-8 shadow-2xl animate-fade-in-up text-center">
//               <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><IoTrashOutline size={32} /></div>
//               <h3 className="text-xl font-bold text-black mb-2">Delete Workorder?</h3>
//               <p className="text-gray-500 text-sm mb-8">This action cannot be undone.</p>
//               <div className="flex gap-4">
//                 <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium">Cancel</button>
//                 <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold transition-colors">Delete</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ============== VIEW MODAL — complete data, including every check's provided + verifier data ============== */}
//         {isViewModalOpen && viewingWorkorder && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
//             <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-0 shadow-2xl animate-fade-in-up overflow-hidden max-h-[92vh] flex flex-col">
//               <div className="h-28 bg-gradient-to-r from-[#00D4AA]/15 to-blue-100 relative flex items-end p-8 flex-shrink-0">
//                 <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-[#00D4AA] shadow-xl text-2xl font-bold text-[#00806E] overflow-hidden">
//                   {viewDocs.passportPhoto ? <img src={fileHref(viewDocs.passportPhoto)} alt="photo" className="w-full h-full object-cover" /> : (viewingWorkorder.fullName?.charAt(0) || '?')}
//                 </div>
//               </div>
//               <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
//                 <div className="flex justify-between items-start flex-wrap gap-3">
//                   <div>
//                     <h3 className="text-2xl font-bold text-black">{viewingWorkorder.fullName}</h3>
//                     <p className="text-sm text-[#00806E] font-mono mt-1">{viewingWorkorder.bgvRef}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statusBadgeClass(friendlyStatus(viewingWorkorder))}`}>{friendlyStatus(viewingWorkorder)}</span>
//                     {viewingWorkorder.locked && (
//                       <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border bg-gray-100 text-gray-600 border-gray-300">
//                         <IoLockClosedOutline size={12} /> Finalized
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Workorder */}
//                 <div>
//                   <SectionTitle icon={IoSettingsOutline} title="Workorder" color="#A855F7" />
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <ViewCell label="Client" value={viewingWorkorder.client} />
//                     <ViewCell label="Branch" value={viewingWorkorder.branch} />
//                     <ViewCell label="Package" value={viewingWorkorder.packageName} />
//                     <ViewCell label="Priority" value={viewingWorkorder.priority} />
//                     <ViewCell label="Client Ref / EMP ID" value={viewingWorkorder.clientRef} />
//                     <ViewCell label="Assigned To" value={viewingWorkorder.assignedTo} />
//                     <ViewCell label="Email" value={viewingWorkorder.email} />
//                     <ViewCell label="Phone" value={viewingWorkorder.phone} />
//                     <ViewCell label="Initiation Mode" value={viewingWorkorder.initiationMode} />
//                     <ViewCell label="Target" value={viewingWorkorder.target ? formatDate(viewingWorkorder.target) : ''} />
//                     <ViewCell label="Created" value={formatDate(viewingWorkorder.createdAt)} />
//                     <ViewCell label="Last Updated" value={formatDate(viewingWorkorder.updatedAt)} />
//                   </div>
//                 </div>

//                 {/* Checks — full detail: assignment, provided data, verifier data, notes */}
//                 {Array.isArray(viewingWorkorder.checks) && viewingWorkorder.checks.length > 0 && (
//                   <div>
//                     <SectionTitle icon={IoShieldCheckmarkOutline} title={`Verification Checks (${viewingWorkorder.checks.length})`} color="#A855F7" />
//                     <div className="space-y-3">
//                       {viewingWorkorder.checks.map((c, idx) => {
//                         const providedData = c.providedData || {};
//                         const verifierData = c.verifier || {};
//                         const fields = Array.isArray(c.fields) ? c.fields : [];

//                         // This system stores everything a check's form captured
//                         // under `data`, with a reserved `__structured` key
//                         // holding the dedicated Address / Employment / Education
//                         // form payload (built by CheckFormRouter) alongside any
//                         // plain dynamic "Additional Fields" at the top level.
//                         const rawData = c.data && typeof c.data === 'object' ? c.data : {};
//                         const structuredData = rawData['__structured'] || {};
//                         const dynamicData = { ...rawData };
//                         delete dynamicData['__structured'];

//                         const providedEntries = Object.entries(providedData).filter(([, v]) => v !== '' && v != null);
//                         const verifierEntries = Object.entries(verifierData).filter(
//                           ([k, v]) => k !== 'unableToVerify' && v !== '' && v != null && typeof v !== 'object'
//                         );
//                         const structuredEntries = flattenEntries(structuredData);
//                         const dynamicEntries = (
//                           fields.length
//                             ? fields.map((f) => [f.label || f.name, dynamicData[f.name]])
//                             : Object.entries(dynamicData)
//                         ).filter(([, v]) => v !== '' && v != null);

//                         return (
//                           <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
//                             <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
//                               <div className="flex items-center gap-3 min-w-0">
//                                 <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 flex-shrink-0"><IoDocumentTextOutline size={16} /></div>
//                                 <div className="min-w-0">
//                                   <div className="font-medium text-black text-sm truncate">{c.checkType}{c.count > 1 && <span className="ml-2 text-xs text-gray-500">×{c.count}</span>}</div>
//                                   <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
//                                     <span className="flex items-center gap-1"><IoPersonOutline size={11} /> {c.infoNeeded || 'Candidate'}</span>
//                                     <span className={`px-2 py-0.5 rounded text-[10px] border ${statusBadgeClass(c.status)}`}>{c.status || 'pending'}</span>
//                                     {c.assignedToName && (
//                                       <span className="px-2 py-0.5 rounded text-[10px] border bg-emerald-50 text-emerald-700 border-emerald-200">
//                                         Assigned: {c.assignedToName}
//                                       </span>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                               {c.subType && <span className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200 flex-shrink-0">{c.subType}</span>}
//                             </div>

//                             {/* SLA / dates */}
//                             {(c.slaDeadline || c.assignedAt || c.completedAt) && (
//                               <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
//                                 {c.assignedAt && <div className="p-2 bg-white rounded-lg border border-gray-200"><div className="text-gray-400">Assigned</div><div className="text-black">{formatDate(c.assignedAt)}</div></div>}
//                                 {c.slaDeadline && <div className="p-2 bg-white rounded-lg border border-gray-200"><div className="text-gray-400">SLA Deadline</div><div className="text-black">{formatDate(c.slaDeadline)}</div></div>}
//                                 {c.completedAt && <div className="p-2 bg-white rounded-lg border border-gray-200"><div className="text-gray-400">Completed</div><div className="text-black">{formatDate(c.completedAt)}</div></div>}
//                               </div>
//                             )}

//                             {/* Provided (candidate-declared) data */}
//                             {providedEntries.length > 0 && (
//                               <div className="mt-3">
//                                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Provided</div>
//                                 <div className="grid grid-cols-2 gap-3">
//                                   {providedEntries.map(([label, val], i) => (
//                                     <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
//                                       <div className="text-gray-400 text-[10px] mb-0.5 uppercase tracking-wide">{label}</div>
//                                       <div className="text-black text-sm break-words">{String(val)}</div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}

//                             {/* Verifier-entered data */}
//                             {verifierEntries.length > 0 && (
//                               <div className="mt-3">
//                                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Verified by Verifier</div>
//                                 <div className="grid grid-cols-2 gap-3">
//                                   {verifierEntries.map(([label, val], i) => (
//                                     <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
//                                       <div className="text-gray-400 text-[10px] mb-0.5 uppercase tracking-wide">{label}</div>
//                                       <div className="text-black text-sm break-words">{typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}</div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}

//                             {/* Structured form data (Address / Employment / Education / etc.
//                                 captured via CheckFormRouter, stored at data.__structured) */}
//                             {structuredEntries.length > 0 && (
//                               <div className="mt-3">
//                                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Check Form Data</div>
//                                 <div className="grid grid-cols-2 gap-3">
//                                   {structuredEntries.map(([label, val], i) => (
//                                     <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
//                                       <div className="text-gray-400 text-[10px] mb-0.5 uppercase tracking-wide">{label}</div>
//                                       <div className="text-black text-sm break-words">{typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}</div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}

//                             {/* Plain dynamic fields (checktype-master-defined "Additional Fields") */}
//                             {dynamicEntries.length > 0 && (
//                               <div className="mt-3">
//                                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Additional Fields</div>
//                                 <div className="grid grid-cols-2 gap-3">
//                                   {dynamicEntries.map(([label, val], i) => (
//                                     <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
//                                       <div className="text-gray-400 text-[10px] mb-0.5 uppercase tracking-wide">{label}</div>
//                                       <div className="text-black text-sm break-words">{String(val)}</div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             )}

//                             {providedEntries.length === 0 && verifierEntries.length === 0 && structuredEntries.length === 0 && dynamicEntries.length === 0 && (
//                               <div className="mt-2 text-xs text-gray-400 italic">No data filled for this check yet.</div>
//                             )}

//                             {c.notes && (
//                               <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
//                                 <div className="text-gray-400 text-[10px] mb-0.5 uppercase tracking-wide">Notes</div>
//                                 <div className="text-black text-sm">{c.notes}</div>
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}

//                 {/* Candidate details */}
//                 {Object.keys(viewCd).length > 0 && (
//                   <>
//                     <div>
//                       <SectionTitle icon={IoPersonOutline} title="Candidate Details" color="#3B82F6" />
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <ViewCell label="Father's Name" value={viewCd.fatherName} />
//                         <ViewCell label="Mother's Name" value={viewCd.motherName} />
//                         <ViewCell label="Date of Birth" value={viewCd.dob} />
//                         <ViewCell label="Gender" value={viewCd.gender} />
//                         <ViewCell label="Mobile" value={viewCd.mobile} />
//                         <ViewCell label="Alternate Mobile" value={viewCd.altMobile} />
//                         <ViewCell label="Marital Status" value={viewCd.maritalStatus} />
//                         <ViewCell label="Nationality" value={viewCd.nationality} />
//                         <ViewCell label="Blood Group" value={viewCd.bloodGroup} />
//                         <ViewCell label="Fresher?" value={viewCd.isFresher} />
//                         <ViewCell label="Physically Challenged" value={viewCd.physicallyChallenged ? 'Yes' : 'No'} />
//                         <ViewCell label="Chronic Condition" value={viewCd.chronicCondition ? 'Yes' : 'No'} />
//                       </div>
//                     </div>
//                     <div>
//                       <SectionTitle icon={IoLocationOutline} title="Address" color="#F59E0B" />
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div className="col-span-2"><ViewCell label="Current Address" value={viewCd.currentAddress} /></div>
//                         <ViewCell label="Current City" value={viewCd.currentCity} />
//                         <ViewCell label="PIN Code" value={viewCd.pinCode} />
//                         <div className="col-span-2"><ViewCell label="Permanent Address" value={viewCd.permanentAddress} /></div>
//                       </div>
//                     </div>
//                     <div>
//                       <SectionTitle icon={IoIdCardOutline} title="Identity Documents" color="#00B494" />
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <ViewCell label="Aadhaar Number" value={viewCd.aadhaarNumber} />
//                         <ViewCell label="Name on Aadhaar" value={viewCd.nameOnAadhaar} />
//                         <ViewCell label="PAN Number" value={viewCd.panNumber} />
//                         <ViewCell label="Name on PAN" value={viewCd.nameOnPan} />
//                         <ViewCell label="Passport Number" value={viewCd.passportNumber} />
//                         <ViewCell label="Passport Issue" value={viewCd.passportIssueDate} />
//                         <ViewCell label="Passport Expiry" value={viewCd.passportExpiryDate} />
//                         <ViewCell label="DL Number" value={viewCd.dlNumber} />
//                         <ViewCell label="DL Expiry" value={viewCd.dlExpiryDate} />
//                       </div>
//                       {Object.keys(viewDocs).length > 0 && (
//                         <div className="mt-4 grid grid-cols-2 gap-3">
//                           {[
//                             ['Passport Photo', viewDocs.passportPhoto],
//                             ['Aadhaar File', viewDocs.aadhaarFile],
//                             ['PAN File', viewDocs.panFile],
//                             ['Passport File', viewDocs.passportFile],
//                             ['DL File', viewDocs.dlFile],
//                           ].filter(([, url]) => url).map(([label, url], i) => (
//                             <a key={i} href={fileHref(url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#00D4AA]/50 transition-all">
//                               <div className="w-9 h-9 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center text-[#00806E] flex-shrink-0"><IoDownloadOutline size={16} /></div>
//                               <div className="min-w-0">
//                                 <div className="text-sm text-black truncate">{label}</div>
//                                 <div className="text-[10px] text-[#00806E]">View / Download</div>
//                               </div>
//                             </a>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </>
//                 )}

//                 <div className="flex gap-3 mt-4">
//                   {!viewingWorkorder.locked && (
//                     <button onClick={() => { setIsViewModalOpen(false); handleEdit(viewingWorkorder); }} className="flex-1 py-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"><IoPencilOutline size={16} /> Edit</button>
//                   )}
//                   <button onClick={() => setIsViewModalOpen(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-black font-medium transition-colors">Close</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ============== FILTER MODAL ============== */}
//         {isFilterOpen && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
//             <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl animate-fade-in-up p-8">
//               <div className="flex justify-between items-center mb-8">
//                 <h3 className="text-lg font-bold text-black flex items-center gap-2"><IoFilterOutline className="text-[#00B494]" />Advanced Filter</h3>
//                 <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-black"><IoCloseOutline size={24} /></button>
//               </div>
//               <div className="space-y-5">
//                 <div>
//                   <label className="block text-xs font-medium text-gray-500 mb-2">Workorder #</label>
//                   <input type="text" name="bgvRef" value={filterCriteria.bgvRef} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none text-black focus:border-[#00B494]" placeholder="e.g. BGV-2026-00001" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-500 mb-2">Candidate</label>
//                   <input type="text" name="candidate" value={filterCriteria.candidate} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none text-black focus:border-[#00B494]" placeholder="e.g. John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-500 mb-2">Client</label>
//                   <input type="text" name="client" value={filterCriteria.client} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none text-black focus:border-[#00B494]" placeholder="e.g. TEST" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
//                   <select name="status" value={filterCriteria.status} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none text-black focus:border-[#00B494]">
//                     <option value="all">All Status</option>
//                     {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="flex gap-3 mt-8">
//                 <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"><IoRefreshOutline size={16} className="inline mr-1" />Clear</button>
//                 <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-black font-bold text-sm">Apply</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>

//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.02); }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.25); }
//         @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
//       `}</style>
//     </div>
//   );
// };

// export default WorkorderDashboard;




// status
// src/components/WorkorderDashboard.jsx
// client dahsboard
// src/components/WorkorderDashboard.jsx
// client dahsboard
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
  IoBriefcaseOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoCubeOutline,
  IoSettingsOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoTimeOutline,
  IoIdCardOutline,
  IoLocationOutline,
  IoDownloadOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoStopCircleOutline,
  IoPauseCircleOutline,
  IoChevronForward,
  IoChevronDown,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../apiroute/apiroute';
import Header from '../screens/header';

// ---- Static Data ----
const STATUS_OPTIONS = ['Initiated', 'Candidate Details Done', 'DE Pending', 'In Progress', 'On Hold', 'Stopped', 'Completed', 'Overdue'];

const CHECK_STATUS_LABELS = {
  'assignment-pending': 'Assignment Pending',
  'verification-pending': 'Verification Pending',
  qc: 'QC',
  report: 'Completed',
  hold: 'On Hold',
  stopped: 'Stopped',
};
const CHECK_STATUS_STYLES = {
  'assignment-pending': 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]',
  'verification-pending': 'bg-[#DBEAFE] text-[#2563EB] border-[#3B82F6]',
  qc: 'bg-[#EDE9FE] text-[#7C3AED] border-[#A78BFA]',
  report: 'bg-[#D1FAE5] text-[#10B981] border-[#34D399]',
  hold: 'bg-amber-50 text-amber-600 border-amber-300',
  stopped: 'bg-red-100 text-red-700 border-red-300',
};

// ---- Helpers ----
// A stopped workorder (permanent) or on-hold workorder (reversible) always
// takes priority in the displayed status over the normal pipeline stages.
const getProgressStatus = (wo) => {
  if (wo.stopped) return 'Stopped';
  if (wo.status === 'on-hold') return 'On Hold';

  const status = wo.status || 'draft';
  const hasCandidateDetails = wo.candidateDetails && Object.keys(wo.candidateDetails).length > 0;
  const checks = wo.checks || [];
  const completedChecks = checks.filter(c => ['verification-pending', 'qc', 'report'].includes(c.status || '')).length;
  const totalChecks = checks.length;

  if (status === 'completed') return 'Completed';
  if (status === 'overdue') return 'Overdue';
  if (status === 'submitted' || status === 'in-progress') return 'In Progress';

  // Candidate details phase
  if (status === 'candidate-details' || hasCandidateDetails) {
    if (completedChecks === 0) {
      return 'Candidate Details Done - DE Pending';
    }
    return 'Candidate Details Done';
  }

  // Basic draft
  return 'Initiated';
};

const statusBadgeClass = (status = '') => {
  const s = status.toLowerCase();
  if (s.includes('stopped')) return 'bg-red-100 text-red-700 border-red-300';
  if (s.includes('on hold')) return 'bg-amber-100 text-amber-800 border-amber-300';
  if (s.includes('initiated')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s.includes('candidate details')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (s.includes('de pending')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (s.includes('progress')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (s.includes('complete')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s.includes('overdue') || s.includes('discrepant')) return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date)) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day}-${month}-${year} ${time}`;
};

const apiBaseURL = api?.defaults?.baseURL?.replace(/\/api\/?$/, '') || '';
const fileHref = (rel) => (rel ? `${apiBaseURL}${rel}` : '');

const flattenEntries = (obj, prefix = '') => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).flatMap(([k, v]) => {
    if (v === null || v === undefined || v === '') return [];
    const label = prefix ? `${prefix} › ${k}` : k;
    if (Array.isArray(v)) {
      if (v.length === 0) return [];
      return [[label, v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ')]];
    }
    if (typeof v === 'object') return flattenEntries(v, label);
    return [[label, v]];
  });
};

// --------------------------------------------------------------------
// PAYMENT-LIABILITY POLICY (client-side mirror, informational only)
//   Stop Check / Stop Workorder can be raised AT ANY TIME — there is NO
//   time restriction blocking the action. This constant only determines
//   which professional message is shown in the confirmation pop-up
//   regarding Verifitech's payment policy. The backend computes and
//   stamps the authoritative value on the record; this is purely a
//   preview so the person knows before they confirm.
// --------------------------------------------------------------------
const PAYMENT_GRACE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const isPaymentDuePreview = (createdAt) => {
  if (!createdAt) return true;
  return Date.now() - new Date(createdAt).getTime() > PAYMENT_GRACE_WINDOW_MS;
};
const paymentPolicyMessage = (paymentDue) =>
  paymentDue
    ? "As this request falls outside Verifitech's 24-hour payment-review window from workorder creation, payment is due for the verification work already initiated on this record."
    : "As this request falls within Verifitech's 24-hour payment-review window from workorder creation, no payment is due for this stop.";

// Replace this with however your app resolves the logged-in user's identity
// (context, redux, localStorage, etc.) — used to stamp `stoppedBy` so the
// audit trail and StoppedManagement.jsx screen show who performed the
// action, and so the backend knows whether to email a client's Customer
// Supporter (only fires when origin === 'client').
const getActorIdentity = () => {
  try {
    const raw = localStorage.getItem('employee') || localStorage.getItem('user') || '{}';
    const parsed = JSON.parse(raw) || {};
    return {
      origin: parsed.role === 'client' || parsed.origin === 'client' ? 'client' : 'employee',
      name: parsed.name || parsed.fullName || parsed.displayName || 'User',
      email: parsed.email || '',
      userId: parsed._id || parsed.id || '',
    };
  } catch {
    return { origin: 'employee', name: 'User', email: '', userId: '' };
  }
};

// Reusable components
const SectionTitle = ({ icon: Icon, title, color = '#00B494' }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={18} style={{ color }} />
    <h4 className="text-base font-bold text-black">{title}</h4>
  </div>
);

const ViewCell = ({ label, value }) => (
  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
    <div className="text-gray-500 text-xs mb-1">{label}</div>
    <div className="text-black truncate">{value || '—'}</div>
  </div>
);

const CheckStatusBadge = ({ status }) => {
  const s = status || 'assignment-pending';
  const cls = CHECK_STATUS_STYLES[s] || 'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${cls}`}>
      {CHECK_STATUS_LABELS[s] || s}
    </span>
  );
};

const WorkorderDashboard = () => {
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [viewType, setViewType] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);
  const [viewingWorkorder, setViewingWorkorder] = useState(null);
  const [lockingId, setLockingId] = useState(null);

  const [workorders, setWorkorders] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, overdue: 0 });

  const [filterCriteria, setFilterCriteria] = useState({ bgvRef: '', candidate: '', client: '', status: 'all' });

  // ---- Expandable rows (list view) to reveal per-check Stop Check action ----
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ---- Stop Workorder modal state (permanent, no time restriction, payment notice) ----
  const [stopWorkorderModal, setStopWorkorderModal] = useState(null); // { wo }
  const [stopWorkorderReason, setStopWorkorderReason] = useState('');
  const [isStoppingWorkorder, setIsStoppingWorkorder] = useState(false);

  // ---- Stop Check modal state (permanent, no time restriction, payment notice) ----
  const [stopCheckModal, setStopCheckModal] = useState(null); // { wo, check }
  const [stopCheckReason, setStopCheckReason] = useState('');
  const [isStoppingCheck, setIsStoppingCheck] = useState(false);

  const [notification, setNotification] = useState(null);
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3200);
  };

  const fetchWorkorders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workorders');
      if (response.data.success) {
        setWorkorders(response.data.workorders || []);
        if (response.data.stats) setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch workorders:', error);
      alert('Failed to load workorders. Please ensure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkorders();
  }, []);

  const handleEdit = (wo) => {
    if (wo.locked) return;
    navigate(`/workorder-creation?id=${wo._id}&mode=edit`);
  };

  const handleConfigure = (wo) => {
    if (wo.locked) return;
    navigate(`/workorder-creation?id=${wo._id}`);
  };

  const handleToggleLock = async (wo) => {
    const confirmMsg = wo.locked
      ? 'This workorder is finalized. Unlock it to allow editing again?'
      : 'Finalize this workorder? Once finalized, it can no longer be edited or configured.';
    if (!window.confirm(confirmMsg)) return;

    setLockingId(wo._id);
    try {
      const res = await api.put(`/workorders/${wo._id}/lock`, { locked: !wo.locked });
      if (res.data.success) {
        await fetchWorkorders();
      } else {
        alert(res.data.message || 'Failed to update finalize status.');
      }
    } catch (error) {
      console.error('Failed to update lock status:', error);
      alert(error.response?.data?.message || 'Failed to update finalize status.');
    } finally {
      setLockingId(null);
    }
  };

  const handleDeleteClick = (id) => { setDeletingId(id); setIsDeleteModalOpen(true); };
  const confirmDelete = async () => {
    try {
      await api.delete(`/workorders/${deletingId}`);
      alert('Workorder deleted successfully');
      await fetchWorkorders();
    } catch (error) {
      console.error(error);
      alert('Failed to delete workorder');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const handleView = (wo) => { setViewingWorkorder(wo); setIsViewModalOpen(true); };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria((prev) => ({ ...prev, [name]: value }));
  };
  const clearFilters = () => {
    setFilterCriteria({ bgvRef: '', candidate: '', client: '', status: 'all' });
    setSearchQuery('');
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ------------------------------------------------------------------
  // STOP WORKORDER — PERMANENT, may be raised AT ANY TIME (no time
  // restriction blocks the action). Payment-liability notice shown.
  // Halts every check on the workorder at once; status flips to
  // "stopped" and reflects immediately in this dashboard, and the
  // record also appears in the separate Stopped Management screen.
  // ------------------------------------------------------------------
  const openStopWorkorder = (wo) => {
    setStopWorkorderModal({ wo });
    setStopWorkorderReason('');
  };
  const closeStopWorkorder = () => {
    if (isStoppingWorkorder) return;
    setStopWorkorderModal(null);
    setStopWorkorderReason('');
  };
  const confirmStopWorkorder = async () => {
    if (!stopWorkorderModal) return;
    if (!stopWorkorderReason.trim()) {
      showNotification('error', 'Please provide a reason for stopping this workorder.');
      return;
    }
    setIsStoppingWorkorder(true);
    try {
      const res = await api.put(`/workorders/${stopWorkorderModal.wo._id}/stop`, {
        reason: stopWorkorderReason.trim(),
        stoppedBy: getActorIdentity(),
      });
      if (res.data.success) {
        showNotification('success', 'Workorder stopped — every check halted.');
        setStopWorkorderModal(null);
        setStopWorkorderReason('');
        await fetchWorkorders();
      } else {
        showNotification('error', res.data.message || 'Failed to stop workorder.');
      }
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to stop workorder.');
    } finally {
      setIsStoppingWorkorder(false);
    }
  };

  // ------------------------------------------------------------------
  // STOP CHECK — PERMANENT, may be raised AT ANY TIME (no time
  // restriction blocks the action). Payment-liability notice shown.
  // Only halts the single check; its status flips to "stopped" inline
  // in the expanded row here, and it also appears in the separate
  // Stopped Management screen.
  // ------------------------------------------------------------------
  const openStopCheck = (wo, check) => {
    setStopCheckModal({ wo, check });
    setStopCheckReason('');
  };
  const closeStopCheck = () => {
    if (isStoppingCheck) return;
    setStopCheckModal(null);
    setStopCheckReason('');
  };
  const confirmStopCheck = async () => {
    if (!stopCheckModal) return;
    if (!stopCheckReason.trim()) {
      showNotification('error', 'Please provide a reason for stopping this check.');
      return;
    }
    setIsStoppingCheck(true);
    try {
      const res = await api.put(`/workorders/${stopCheckModal.wo._id}/checks/${stopCheckModal.check.slNo}/stop`, {
        reason: stopCheckReason.trim(),
        stoppedBy: getActorIdentity(),
      });
      if (res.data.success) {
        showNotification('success', 'Check stopped.');
        setStopCheckModal(null);
        setStopCheckReason('');
        await fetchWorkorders();
      } else {
        showNotification('error', res.data.message || 'Failed to stop check.');
      }
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to stop check.');
    } finally {
      setIsStoppingCheck(false);
    }
  };

  const filteredWorkorders = useMemo(() => {
    return workorders.filter((wo) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        wo.bgvRef?.toLowerCase().includes(query) ||
        wo.fullName?.toLowerCase().includes(query) ||
        wo.client?.toLowerCase().includes(query) ||
        wo.email?.toLowerCase().includes(query);
      const matchesRef = !filterCriteria.bgvRef || wo.bgvRef?.toLowerCase().includes(filterCriteria.bgvRef.toLowerCase());
      const matchesCandidate = !filterCriteria.candidate || wo.fullName?.toLowerCase().includes(filterCriteria.candidate.toLowerCase());
      const matchesClient = !filterCriteria.client || wo.client?.toLowerCase().includes(filterCriteria.client.toLowerCase());
      const matchesStatus = filterCriteria.status === 'all' ? true : getProgressStatus(wo).toLowerCase().includes(filterCriteria.status.toLowerCase());
      return matchesSearch && matchesRef && matchesCandidate && matchesClient && matchesStatus;
    });
  }, [workorders, filterCriteria, searchQuery]);

  const viewCd = viewingWorkorder?.candidateDetails || {};
  const viewDocs = viewCd.documents || {};

  return (
    <div className="min-h-screen bg-[#f8fefd] text-black font-sans selection:bg-[#00D4AA]/30 selection:text-black">
      <Header showNavigation={false} />

      {notification && (
        <div
          className={`fixed top-20 right-6 z-[130] px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-xl ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {notification.type === 'success' ? <IoShieldCheckmarkOutline size={22} /> : <IoCloseOutline size={22} />}
          <span>{notification.message}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-black transition-all active:scale-95 shadow-sm">
            <IoArrowBackOutline size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8 animate-fade-in-up">
          <div className="md:w-1/2">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/20">
                <IoBriefcaseOutline size={24} className="text-[#00B494]" />
              </div>
              <h2 className="text-4xl font-bold text-black tracking-tight">Workorder Management</h2>
            </div>
            <p className="text-gray-600 text-base leading-relaxed flex items-center gap-2">
              <IoGridOutline size={18} className="text-gray-400" />
              Create and manage BGV workorders, track progress and verification status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 lg:w-80">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Ref, Candidate, Client..."
                className="w-full bg-white border border-gray-200 focus:border-[#00B494] rounded-xl pl-12 pr-5 py-3 outline-none text-sm text-black placeholder-gray-400 transition-all shadow-sm" />
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
              <button onClick={() => setViewType('list')} className={`p-2.5 rounded-lg transition-all ${viewType === 'list' ? 'bg-[#00D4AA] text-black' : 'text-gray-500 hover:text-black'}`}><IoListOutline size={20} /></button>
              <button onClick={() => setViewType('grid')} className={`p-2.5 rounded-lg transition-all ${viewType === 'grid' ? 'bg-[#00D4AA] text-black' : 'text-gray-500 hover:text-black'}`}><IoCardOutline size={20} /></button>
            </div>

            <button onClick={() => setIsFilterOpen(true)}
              className={`relative px-5 py-3 rounded-xl font-medium text-sm transition-all border flex items-center gap-2
                ${Object.values(filterCriteria).some((val) => val && val !== 'all') || searchQuery
                  ? 'bg-[#00D4AA]/10 border-[#00D4AA]/30 text-[#00806E]'
                  : 'bg-white border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50'}`}>
              <IoFilterOutline size={18} />
              <span>Filter</span>
            </button>

            <button
              onClick={() => navigate('/client-stopped-management')}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-red-200 hover:border-red-400 rounded-xl text-sm font-semibold text-red-600 hover:text-red-700 transition-all shadow-sm"
            >
              <IoStopCircleOutline size={18} />
              Stopped Management
            </button>

            <button onClick={() => navigate('/workorder-creation')}
              className="group flex items-center gap-2 px-6 py-3 bg-[#00D4AA] text-black rounded-xl font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(0,212,170,0.35)] hover:scale-105 active:scale-95 overflow-hidden">
              <IoAdd size={18} className="relative z-10" />
              <span className="relative z-10">New Workorder</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            { label: 'TOTAL', val: stats.total ?? workorders.length, color: 'text-[#00B494]' },
            { label: 'ACTIVE', val: stats.active ?? 0, color: 'text-emerald-600' },
            { label: 'COMPLETED', val: stats.completed ?? 0, color: 'text-blue-600' },
            { label: 'OVERDUE', val: stats.overdue ?? 0, color: 'text-red-600' },
            { label: 'STOPPED', val: stats.stopped ?? 0, color: 'text-red-700' },
          ].map((stat, i) => (
            <div key={i} className="group relative p-6 rounded-2xl bg-white border border-gray-200 overflow-hidden transition-all hover:border-gray-300 hover:shadow-md shadow-sm">
              <div className="relative flex flex-col items-start justify-between h-full gap-2">
                <div className="text-xs font-bold text-gray-400 tracking-wider uppercase">{stat.label}</div>
                <div className={`text-5xl font-bold ${stat.color} tracking-tighter`}>{stat.val}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading workorders...</div>
        ) : (
          <>
            {viewType === 'list' && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="p-5 w-10"></th>
                        <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Workorder #</th>
                        <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Candidate</th>
                        <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Client</th>
                        <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Package</th>
                        <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Status</th>
                        <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Progress</th>
                        <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase">Created</th>
                        <th className="p-5 text-xs font-bold text-gray-400 tracking-wider uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkorders.length > 0 ? (
                        filteredWorkorders.map((wo) => {
                          const done = wo.progressDone ?? 0;
                          const total = wo.progressTotal ?? (wo.checks?.length || 1);
                          const pct = total ? Math.round((done / total) * 100) : 0;
                          const displayStatus = getProgressStatus(wo);
                          const isExpanded = expandedRows.has(wo._id);
                          const checks = wo.checks || [];
                          return (
                            <React.Fragment key={wo._id}>
                              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                                <td className="p-5 text-gray-400 cursor-pointer" onClick={() => toggleRow(wo._id)}>
                                  {checks.length > 0 && (isExpanded ? <IoChevronDown size={16} /> : <IoChevronForward size={16} />)}
                                </td>
                                <td className="p-5"><span className="px-3 py-1.5 rounded-lg bg-[#00D4AA]/10 text-[#00806E] text-xs font-mono font-bold whitespace-nowrap">{wo.bgvRef}</span></td>
                                <td className="p-5">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-[#00806E]">{wo.fullName?.charAt(0) || '?'}</div>
                                    <div>
                                      <div className="font-medium text-black text-sm">{wo.fullName || '—'}</div>
                                      {wo.email && <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{wo.email}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-5 text-sm text-gray-600">{wo.client || '—'}</td>
                                <td className="p-5 text-sm text-gray-600">{wo.packageName || '—'}</td>
                                <td className="p-5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 ${statusBadgeClass(displayStatus)}`}>
                                      {displayStatus === 'Stopped' && <IoStopCircleOutline size={12} />}
                                      {displayStatus === 'On Hold' && <IoPauseCircleOutline size={12} />}
                                      {displayStatus}
                                    </span>
                                    {wo.locked && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border bg-gray-100 text-gray-600 border-gray-300">
                                        <IoLockClosedOutline size={11} /> Finalized
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden"><div className="h-full bg-[#00D4AA] rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{done}/{total}</span>
                                  </div>
                                </td>
                                <td className="p-5 text-xs text-gray-500 whitespace-nowrap">{formatDate(wo.createdAt)}</td>
                                <td className="p-5 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleView(wo)} title="View" className="p-2 rounded-lg hover:bg-[#00D4AA]/10 hover:text-[#00806E] text-gray-500 transition-all"><IoViewIcon size={18} /></button>
                                    {!wo.locked && !wo.stopped && (
                                      <button onClick={() => handleEdit(wo)} title="Edit" className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition-all"><IoPencilOutline size={18} /></button>
                                    )}
                                    {!wo.locked && !wo.stopped && (
                                      <button onClick={() => handleConfigure(wo)} title="Configure" className="p-2 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-gray-500 transition-all"><IoSettingsOutline size={18} /></button>
                                    )}
                                    <button
                                      onClick={() => handleToggleLock(wo)}
                                      title={wo.locked ? 'Unlock' : 'Finalize (lock from further edits)'}
                                      disabled={lockingId === wo._id}
                                      className={`p-2 rounded-lg transition-all disabled:opacity-40 ${wo.locked ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'}`}
                                    >
                                      {wo.locked ? <IoLockClosedOutline size={18} /> : <IoLockOpenOutline size={18} />}
                                    </button>
                                    <button
                                      onClick={() => openStopWorkorder(wo)}
                                      title={wo.stopped ? 'Already stopped' : 'Stop Workorder (permanent)'}
                                      disabled={wo.stopped}
                                      className="p-2 rounded-lg hover:bg-red-100 hover:text-red-700 text-red-500 transition-all disabled:opacity-30"
                                    >
                                      <IoStopCircleOutline size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(wo._id)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-500 transition-all"><IoTrashOutline size={18} /></button>
                                  </div>
                                </td>
                              </tr>

                              {isExpanded && checks.length > 0 && (
                                <tr>
                                  <td colSpan={9} className="bg-gray-50/70 px-6 py-5">
                                    <div className="space-y-3">
                                      {checks.map((c) => (
                                        <div
                                          key={c.slNo}
                                          className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                              <IoDocumentTextOutline size={15} className="text-[#00806E]" />
                                              {c.checkType}
                                            </div>
                                            {c.subType && <div className="text-xs text-gray-500 italic ml-6">{c.subType}</div>}
                                            {c.stopped && c.stopReason && (
                                              <div className="text-[11px] text-red-600 ml-6 mt-1">Stop reason: {c.stopReason}</div>
                                            )}
                                          </div>
                                          <div className="w-40 flex-shrink-0">
                                            <CheckStatusBadge status={c.status} />
                                          </div>
                                          <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                              onClick={() => openStopCheck(wo, c)}
                                              disabled={c.stopped}
                                              title={c.stopped ? 'Already stopped' : 'Stop Check (permanent)'}
                                              className="p-2 hover:bg-red-100 rounded-xl text-red-600 hover:text-red-700 transition-all disabled:opacity-40"
                                            >
                                              <IoStopCircleOutline size={18} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <tr><td colSpan={9} className="p-16 text-center text-gray-500">No workorders found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                {filteredWorkorders.length > 0 ? (
                  filteredWorkorders.map((wo) => {
                    const done = wo.progressDone ?? 0;
                    const total = wo.progressTotal ?? (wo.checks?.length || 1);
                    const pct = total ? Math.round((done / total) * 100) : 0;
                    const displayStatus = getProgressStatus(wo);
                    return (
                      <div key={wo._id} className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg shadow-sm transition-all duration-300 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-base font-bold text-[#00806E]">{wo.fullName?.charAt(0) || '?'}</div>
                            <div>
                              <h3 className="font-bold text-black text-sm leading-tight">{wo.fullName || '—'}</h3>
                              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{wo.bgvRef}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase flex items-center gap-1 ${statusBadgeClass(displayStatus)}`}>
                              {displayStatus === 'Stopped' && <IoStopCircleOutline size={11} />}
                              {displayStatus === 'On Hold' && <IoPauseCircleOutline size={11} />}
                              {displayStatus}
                            </div>
                            {wo.locked && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-semibold border bg-gray-100 text-gray-600 border-gray-300">
                                <IoLockClosedOutline size={10} /> Finalized
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3 mb-6 flex-1">
                          <div className="flex items-center gap-3 text-xs text-gray-600"><IoBusinessOutline size={14} /> {wo.client || '—'}</div>
                          <div className="flex items-center gap-3 text-xs text-gray-600"><IoCubeOutline size={14} /> {wo.packageName || '—'}</div>
                          <div className="flex items-center gap-3 text-xs text-gray-600"><IoShieldCheckmarkOutline size={14} /> {wo.checks?.length || 0} check(s)</div>
                          <div className="flex items-center gap-3 text-xs text-gray-600"><IoTimeOutline size={14} /> {formatDate(wo.createdAt)}</div>
                        </div>
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5"><span>Progress</span><span>{done}/{total}</span></div>
                          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden"><div className="h-full bg-[#00D4AA] rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleView(wo)} className="text-xs font-medium flex items-center gap-1 text-gray-600 hover:text-[#00806E]">View Details</button>
                          <div className="flex gap-2">
                            {!wo.locked && !wo.stopped && (
                              <button onClick={() => handleEdit(wo)} title="Edit" className="p-2 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-blue-600"><IoPencilOutline size={15} /></button>
                            )}
                            {!wo.locked && !wo.stopped && (
                              <button onClick={() => handleConfigure(wo)} title="Configure" className="p-2 rounded-lg bg-gray-100 hover:bg-amber-500 hover:text-white transition-all text-amber-600"><IoSettingsOutline size={15} /></button>
                            )}
                            <button
                              onClick={() => handleToggleLock(wo)}
                              title={wo.locked ? 'Unlock' : 'Finalize'}
                              disabled={lockingId === wo._id}
                              className={`p-2 rounded-lg bg-gray-100 transition-all disabled:opacity-40 ${wo.locked ? 'text-gray-600 hover:bg-gray-300' : 'text-purple-600 hover:bg-purple-600 hover:text-white'}`}
                            >
                              {wo.locked ? <IoLockClosedOutline size={15} /> : <IoLockOpenOutline size={15} />}
                            </button>
                            <button
                              onClick={() => openStopWorkorder(wo)}
                              title={wo.stopped ? 'Already stopped' : 'Stop Workorder (permanent)'}
                              disabled={wo.stopped}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white transition-all text-red-600 disabled:opacity-30"
                            >
                              <IoStopCircleOutline size={15} />
                            </button>
                            <button onClick={() => handleDeleteClick(wo._id)} title="Delete" className="p-2 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white transition-all text-red-600"><IoTrashOutline size={15} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full p-16 text-center text-gray-500">No workorders found.</div>
                )}
              </div>
            )}
          </>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white border border-red-200 rounded-2xl p-8 shadow-2xl animate-fade-in-up text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><IoTrashOutline size={32} /></div>
              <h3 className="text-xl font-bold text-black mb-2">Delete Workorder?</h3>
              <p className="text-gray-500 text-sm mb-8">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && viewingWorkorder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)} />
            <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-0 shadow-2xl animate-fade-in-up overflow-hidden max-h-[92vh] flex flex-col">
              <div className="h-28 bg-gradient-to-r from-[#00D4AA]/15 to-blue-100 relative flex items-end p-8 flex-shrink-0">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-[#00D4AA] shadow-xl text-2xl font-bold text-[#00806E] overflow-hidden">
                  {viewDocs.passportPhoto ? <img src={fileHref(viewDocs.passportPhoto)} alt="photo" className="w-full h-full object-cover" /> : (viewingWorkorder.fullName?.charAt(0) || '?')}
                </div>
              </div>
              <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-black">{viewingWorkorder.fullName}</h3>
                    <p className="text-sm text-[#00806E] font-mono mt-1">{viewingWorkorder.bgvRef}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 ${statusBadgeClass(getProgressStatus(viewingWorkorder))}`}>
                      {getProgressStatus(viewingWorkorder) === 'Stopped' && <IoStopCircleOutline size={13} />}
                      {getProgressStatus(viewingWorkorder) === 'On Hold' && <IoPauseCircleOutline size={13} />}
                      {getProgressStatus(viewingWorkorder)}
                    </span>
                    {viewingWorkorder.locked && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border bg-gray-100 text-gray-600 border-gray-300">
                        <IoLockClosedOutline size={12} /> Finalized
                      </span>
                    )}
                  </div>
                </div>

                {viewingWorkorder.stopped && (
                  <div className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                    Stopped on {formatDate(viewingWorkorder.stoppedAt)}
                    {viewingWorkorder.stopReason ? ` — ${viewingWorkorder.stopReason}` : ''}
                    {viewingWorkorder.stoppedBy?.name ? ` (by ${viewingWorkorder.stoppedBy.name}, ${viewingWorkorder.stoppedBy.origin})` : ''}
                    {typeof viewingWorkorder.paymentDue === 'boolean' && (
                      <span className="block mt-1 font-semibold">
                        {viewingWorkorder.paymentDue ? 'Payment is due for this stop.' : 'No payment is due for this stop.'}
                      </span>
                    )}
                  </div>
                )}
                {!viewingWorkorder.stopped && viewingWorkorder.status === 'on-hold' && (
                  <div className="px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm">
                    On hold since {formatDate(viewingWorkorder.caseHoldRaisedAt)}
                    {viewingWorkorder.caseHoldReason ? ` — ${viewingWorkorder.caseHoldReason}` : ''}
                  </div>
                )}

                {Array.isArray(viewingWorkorder.checks) && viewingWorkorder.checks.length > 0 && (
                  <div>
                    <SectionTitle icon={IoShieldCheckmarkOutline} title="Verification Checks" />
                    <div className="space-y-2">
                      {viewingWorkorder.checks.map((c) => (
                        <div key={c.slNo} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                          <div>
                            <div className="text-sm font-medium text-black">{c.checkType}{c.subType ? ` — ${c.subType}` : ''}</div>
                            {c.stopped && c.stopReason && <div className="text-xs text-red-600 mt-0.5">Stopped: {c.stopReason}</div>}
                          </div>
                          <CheckStatusBadge status={c.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  {!viewingWorkorder.locked && !viewingWorkorder.stopped && (
                    <button onClick={() => { setIsViewModalOpen(false); handleEdit(viewingWorkorder); }} className="flex-1 py-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"><IoPencilOutline size={16} /> Edit</button>
                  )}
                  {!viewingWorkorder.stopped && (
                    <button
                      onClick={() => { setIsViewModalOpen(false); openStopWorkorder(viewingWorkorder); }}
                      className="flex-1 py-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <IoStopCircleOutline size={16} /> Stop Workorder
                    </button>
                  )}
                  <button onClick={() => setIsViewModalOpen(false)} className="flex-1 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-black font-medium transition-colors">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
            <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl animate-fade-in-up p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-black flex items-center gap-2"><IoFilterOutline className="text-[#00B494]" />Advanced Filter</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-black"><IoCloseOutline size={24} /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Workorder #</label>
                  <input type="text" name="bgvRef" value={filterCriteria.bgvRef} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none text-black focus:border-[#00B494]" placeholder="e.g. BGV-2026-00001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Candidate</label>
                  <input type="text" name="candidate" value={filterCriteria.candidate} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none text-black focus:border-[#00B494]" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Client</label>
                  <input type="text" name="client" value={filterCriteria.client} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none text-black focus:border-[#00B494]" placeholder="e.g. TEST" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
                  <select name="status" value={filterCriteria.status} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none text-black focus:border-[#00B494]">
                    <option value="all">All Status</option>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"><IoRefreshOutline size={16} className="inline mr-1" />Clear</button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-[#00D4AA] text-black font-bold text-sm">Apply</button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STOP WORKORDER MODAL — no time restriction, payment notice ================= */}
        {stopWorkorderModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeStopWorkorder}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <IoStopCircleOutline size={20} /> Stop Workorder
                </h3>
                <button onClick={closeStopWorkorder} className="text-gray-400 hover:text-gray-700"><IoCloseOutline size={22} /></button>
              </div>
              <p className="text-xs text-gray-500 font-mono mb-3">
                {stopWorkorderModal.wo.bgvRef} — {stopWorkorderModal.wo.fullName}
              </p>
              <textarea
                value={stopWorkorderReason}
                onChange={(e) => setStopWorkorderReason(e.target.value)}
                rows={4}
                placeholder="Reason for stopping this workorder..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none mb-4 focus:border-red-400"
              />
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
                <IoCardOutline size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">
                  <b>Payment Notice:</b> {paymentPolicyMessage(isPaymentDuePreview(stopWorkorderModal.wo.createdAt))}
                </p>
              </div>
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                This halts every check on the workorder at once and <b>cannot be undone</b>. If this was raised
                by a client, their Customer Supporter is emailed automatically.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={closeStopWorkorder} disabled={isStoppingWorkorder} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button onClick={confirmStopWorkorder} disabled={isStoppingWorkorder || !stopWorkorderReason.trim()} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50">
                  {isStoppingWorkorder ? 'Stopping...' : 'Stop Workorder'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STOP CHECK MODAL — no time restriction, payment notice ================= */}
        {stopCheckModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeStopCheck}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <IoStopCircleOutline size={20} /> Stop Check
                </h3>
                <button onClick={closeStopCheck} className="text-gray-400 hover:text-gray-700"><IoCloseOutline size={22} /></button>
              </div>
              <p className="text-xs text-gray-500 font-mono mb-3">
                {stopCheckModal.wo.bgvRef} — {stopCheckModal.check.checkType}{stopCheckModal.check.subType ? ` (${stopCheckModal.check.subType})` : ''}
              </p>
              <textarea
                value={stopCheckReason}
                onChange={(e) => setStopCheckReason(e.target.value)}
                rows={4}
                placeholder="Reason for stopping this check..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none mb-4 focus:border-red-400"
              />
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
                <IoCardOutline size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">
                  <b>Payment Notice:</b> {paymentPolicyMessage(isPaymentDuePreview(stopCheckModal.wo.createdAt))}
                </p>
              </div>
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                This action is permanent and <b>cannot be undone</b>. If this was raised by a client, their
                Customer Supporter is emailed automatically.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={closeStopCheck} disabled={isStoppingCheck} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button onClick={confirmStopCheck} disabled={isStoppingCheck || !stopCheckReason.trim()} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50">
                  {isStoppingCheck ? 'Stopping...' : 'Stop Check'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.25); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default WorkorderDashboard;