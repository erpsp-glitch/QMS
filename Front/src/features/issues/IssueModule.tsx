// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { issueApi, certApi, deptApi } from '../../api/qms.api';
// import { exportCSV } from '../master-data/chartUtils';
// import type { IssueRegister, Certification, Department, CertRef, DeptRef, InputChg } from '../qms/types';
// import { apiMsg } from '../qms/types';
// import DocumentIssueModule from './DocumentIssueModule';
// import {
//   FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiRefreshCw,
//   FiChevronDown, FiChevronUp, FiDownload, FiPrinter,
//   FiAlertTriangle, FiCheckCircle, FiFileText, FiBarChart2,
//   FiClock, FiAlertCircle, FiEye, FiGrid, FiList, FiFilter
// } from 'react-icons/fi';

// const CATEGORIES = ['PROCESS','PRODUCT','SYSTEM','SAFETY','CUSTOMER','OTHER'];
// const SEVERITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
// const STATUSES = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'];

// const SEV_COLOR: Record<string, string> = {
//   LOW: 'bg-blue-100 text-blue-700', MEDIUM: 'bg-yellow-100 text-yellow-700',
//   HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700',
// };
// const SEV_GRAD: Record<string, string> = {
//   LOW: 'from-blue-500 to-blue-600', MEDIUM: 'from-yellow-500 to-orange-500',
//   HIGH: 'from-orange-500 to-orange-600', CRITICAL: 'from-red-600 to-red-700',
// };
// const ST_COLOR: Record<string, string> = {
//   OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
//   RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-600',
// };

// const EMPTY_FORM = {
//   title: '', description: '', category: 'PROCESS', severity: 'MEDIUM',
//   raisedBy: '', targetDate: '', rootCause: '', correctiveAction: '',
//   status: 'OPEN', certification: null as CertRef | null, department: null as DeptRef | null,
// };

// const TABS = [
//   { id: 'issues',    label: 'Quality Issues',          icon: 'fas fa-exclamation-circle' },
//   { id: 'doc-issue', label: 'Document Issue Register',  icon: 'fas fa-file-contract'      },
//   { id: 'report',    label: 'Reports',                  icon: 'fas fa-file-pdf'           },
// ];

// export default function IssueModule() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const activeTab = searchParams.get('tab') || 'issues';
//   const setTab = (tab: string) => setSearchParams({ tab }, { replace: true });

//   return (
//     <div className="space-y-4">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Issue Register</h1>
//           <p className="text-sm text-gray-500 mt-0.5">Log, track, and resolve quality issues across the organization</p>
//         </div>
//         <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
//           <i className="fas fa-list-alt" style={{ color: '#280882' }} />
//           <span style={{ color: '#280882' }} className="font-medium">Issue Register</span>
//           <span className="text-gray-300">›</span>
//           <span>{TABS.find(t => t.id === activeTab)?.label}</span>
//         </div>
//       </div>
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
//         <nav className="flex min-w-max">
//           {TABS.map(tab => (
//             <button key={tab.id} onClick={() => setTab(tab.id)}
//               className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${activeTab === tab.id ? 'border-b-[#280882] text-[#280882] bg-purple-50/60' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
//               <i className={`${tab.icon} text-xs`} />{tab.label}
//             </button>
//           ))}
//         </nav>
//       </div>
//       <div key={activeTab}>
//         {activeTab === 'issues'    && <QualityIssues />}
//         {activeTab === 'doc-issue' && <DocumentIssueModule />}
//         {activeTab === 'report'    && <IssueReport />}
//       </div>
//     </div>
//   );
// }

// // ── Quality Issues (combined list + new/edit modal) ───────────────────────────
// function QualityIssues() {
//   const [rows, setRows] = useState<IssueRegister[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [certs, setCerts] = useState<Certification[]>([]);
//   const [depts, setDepts] = useState<Department[]>([]);
//   const [search, setSearch] = useState('');
//   const [sevFilter, setSevFilter] = useState('');
//   const [stFilter, setStFilter] = useState('');
//   const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
//   const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
//   const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
//   // Modal
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState<IssueRegister | null>(null);
//   const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
//   const [saving, setSaving] = useState(false);
//   // Delete
//   const [deleteId, setDeleteId] = useState<number | null>(null);
//   // View
//   const [viewItem, setViewItem] = useState<IssueRegister | null>(null);

//   useEffect(() => {
//     certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
//     deptApi.getAll().then((d: unknown) => setDepts(Array.isArray(d) ? d as Department[] : [])).catch(() => {});
//   }, []);

//   const load = () => {
//     setLoading(true);
//     issueApi.getAll().then((d: unknown) => setRows(Array.isArray(d) ? d as IssueRegister[] : [])).catch(() => setRows([])).finally(() => setLoading(false));
//   };
//   useEffect(() => { load(); }, []);

//   const sort = (key: string) => setSortConfig(prev => prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
//   const sortIcon = (key: string) => sortConfig?.key === key ? (sortConfig.dir === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />) : null;

//   const displayed = (() => {
//     let r = [...rows];
//     if (search) r = r.filter(x => [x.title, x.issueTitle, x.raisedBy, x.category].some((v: string) => v?.toLowerCase().includes(search.toLowerCase())));
//     if (sevFilter) r = r.filter(x => x.severity === sevFilter);
//     if (stFilter) r = r.filter(x => x.status === stFilter);
//     if (sortConfig) r = [...r].sort((a, b) => {
//       const av = a[sortConfig.key], bv = b[sortConfig.key];
//       if (av == null) return 1; if (bv == null) return -1;
//       return sortConfig.dir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
//     });
//     return r;
//   })();

//   const stats = {
//     total: rows.length,
//     open: rows.filter(r => r.status === 'OPEN').length,
//     inProgress: rows.filter(r => r.status === 'IN_PROGRESS').length,
//     resolved: rows.filter(r => r.status === 'RESOLVED').length,
//     closed: rows.filter(r => r.status === 'CLOSED').length,
//     critical: rows.filter(r => r.severity === 'CRITICAL').length,
//   };

//   const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setShowModal(true); };
//   const openEdit = (r: IssueRegister) => { setEditing(r); setForm({ ...EMPTY_FORM, ...r }); setShowModal(true); };

//   const ff = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as typeof EMPTY_FORM));

//   const save = async () => {
//     if (!form.title || !form.raisedBy) { alert('Title and Raised By are required.'); return; }
//     setSaving(true);
//     try {
//       if (editing) await issueApi.update(editing.id, form);
//       else await issueApi.create(form);
//       setShowModal(false); load();
//     } catch (e: unknown) { alert(apiMsg(e, 'Save failed')); }
//     finally { setSaving(false); }
//   };

//   const del = async (id: number) => {
//     try { await issueApi.delete(id); setDeleteId(null); load(); }
//     catch (e: unknown) { alert(apiMsg(e, 'Delete failed')); }
//   };

//   const updateStatus = async (id: number, status: string) => {
//     await issueApi.updateStatus(id, status); load();
//   };

//   const inp = 'w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400';
//   const lbl = 'block text-xs font-medium text-gray-600 mb-1';

//   const downloadCSV = () => {
//     exportCSV('Issues.csv', ['#','Title','Category','Severity','Raised By','Target','Status'],
//       displayed.map(r => [r.id, r.title||'', r.category, r.severity, r.raisedBy, r.targetDate, r.status]));
//   };

//   const printReport = () => {
//     const w = window.open('', '_blank');
//     if (!w) return;
//     const rows2 = displayed.map(r => `<tr><td>#${r.id}</td><td>${r.title||''}</td><td>${r.category||''}</td><td>${r.severity||''}</td><td>${r.raisedBy||''}</td><td>${r.targetDate||''}</td><td>${r.status||''}</td></tr>`).join('');
//     w.document.write(`<html><head><title>Issue Register</title><style>body{font-family:Arial;font-size:11px;padding:20px}h1{color:#280882}table{width:100%;border-collapse:collapse}th{background:#280882;color:#fff;padding:6px 8px}td{border:1px solid #ddd;padding:5px 8px}tr:nth-child(even){background:#f9f7ff}</style></head><body><h1>Issue Register Report</h1><p>Total: ${displayed.length} | Generated: ${new Date().toLocaleDateString('en-IN')}</p><table><tr>${['#','Title','Category','Severity','Raised By','Target','Status'].map(h => `<th>${h}</th>`).join('')}</tr>${rows2}</table></body></html>`);
//     w.document.close(); w.print();
//   };

//   if (loading && rows.length === 0) return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
//       <div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500 mx-auto mb-4"></div><p className="text-gray-600">Loading Issues...</p></div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-4">
//       {/* Header */}
//       <div className="bg-white rounded-2xl shadow-xl p-6 mb-5 border border-rose-100">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">Quality Issue Register</h1>
//             <p className="text-gray-500 mt-1 text-sm">Log, track, and resolve quality issues across the organization</p>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             <button onClick={() => setViewMode(v => v === 'table' ? 'card' : 'table')} className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-rose-400 text-sm flex items-center gap-2 transition-all">
//               {viewMode === 'table' ? <><FiGrid /> Card View</> : <><FiList /> Table View</>}
//             </button>
//             <button onClick={downloadCSV} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm flex items-center gap-2 transition-all"><FiDownload /> Export</button>
//             <button onClick={printReport} className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl text-sm flex items-center gap-2 transition-all"><FiPrinter /> Print</button>
//             <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm flex items-center gap-2 transition-all"><FiRefreshCw /> Refresh</button>
//             <button onClick={openAdd} className="px-5 py-2 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:from-rose-700 hover:to-orange-600 transition-all"><FiPlus /> New Issue</button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
//           {[
//             { label: 'Total Issues',  value: stats.total,      from: 'from-gray-600',   to: 'to-gray-700',   icon: <FiFileText className="text-xl" /> },
//             { label: 'Open',          value: stats.open,       from: 'from-red-500',    to: 'to-red-600',    icon: <FiAlertTriangle className="text-xl" /> },
//             { label: 'In Progress',   value: stats.inProgress, from: 'from-yellow-500', to: 'to-orange-500', icon: <FiClock className="text-xl" /> },
//             { label: 'Resolved',      value: stats.resolved,   from: 'from-green-500',  to: 'to-emerald-600',icon: <FiCheckCircle className="text-xl" /> },
//             { label: 'Closed',        value: stats.closed,     from: 'from-gray-500',   to: 'to-gray-600',   icon: <FiAlertCircle className="text-xl" /> },
//             { label: 'Critical',      value: stats.critical,   from: 'from-red-700',    to: 'to-red-800',    icon: <FiAlertCircle className="text-xl" /> },
//           ].map(k => (
//             <div key={k.label} className={`bg-gradient-to-br ${k.from} ${k.to} text-white p-4 rounded-xl shadow-lg`}>
//               <div className="flex items-center gap-3"><div className="p-2 bg-white/20 rounded-lg">{k.icon}</div><div><p className="text-xs opacity-90">{k.label}</p><p className="text-2xl font-bold">{k.value}</p></div></div>
//             </div>
//           ))}
//         </div>

//         {/* Search */}
//         <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-4 rounded-xl border border-rose-200">
//           <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
//             <div className="relative flex-1 w-full">
//               <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input type="text" placeholder="Search title, raised by, category..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-400 bg-white text-sm" />
//             </div>
//             <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-rose-400">
//               <option value="">All Severities</option>{SEVERITIES.map(s => <option key={s}>{s}</option>)}
//             </select>
//             <select value={stFilter} onChange={e => setStFilter(e.target.value)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-rose-400">
//               <option value="">All Status</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
//             </select>
//             <button onClick={() => { setSearch(''); setSevFilter(''); setStFilter(''); }} className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-600 hover:border-red-300 hover:text-red-600 flex items-center gap-1 transition-all"><FiX /> Clear</button>
//           </div>
//         </div>
//       </div>

//       <div className="mb-3 text-sm text-gray-500">Showing {displayed.length} of {rows.length} issues</div>

//       {/* Table View */}
//       {viewMode === 'table' && (
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-rose-100">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gradient-to-r from-rose-600 to-orange-500 text-white">
//                   {[['id','#'],['title','Title'],['category','Category'],['severity','Severity'],['raisedBy','Raised By'],['targetDate','Target Date'],['status','Status']].map(([k,h]) => (
//                     <th key={k} className="px-4 py-3.5 text-left cursor-pointer hover:bg-white/10 whitespace-nowrap" onClick={() => sort(k)}>
//                       <div className="flex items-center gap-1">{h} {sortIcon(k)}</div>
//                     </th>
//                   ))}
//                   <th className="px-4 py-3.5 text-left">Actions</th>
//                   <th className="px-4 py-3.5 w-8"></th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {displayed.length === 0 ? (
//                   <tr><td colSpan={9} className="py-16 text-center">
//                     <FiFileText className="text-5xl text-gray-200 mx-auto mb-3" />
//                     <p className="text-gray-400 font-medium">No issues found</p>
//                     <button onClick={openAdd} className="mt-3 px-5 py-2 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-xl text-sm flex items-center gap-2 mx-auto"><FiPlus /> Register First Issue</button>
//                   </td></tr>
//                 ) : displayed.map((r: IssueRegister) => (
//                   <>
//                     <tr key={r.id} className="hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 transition-all group">
//                       <td className="px-4 py-3 text-xs font-mono text-gray-400">#{r.id}</td>
//                       <td className="px-4 py-3 font-semibold text-gray-800 max-w-[180px] truncate" title={r.title}>{r.title || r.issueTitle || '—'}</td>
//                       <td className="px-4 py-3 text-gray-500 text-xs">{r.category || '—'}</td>
//                       <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEV_COLOR[r.severity] || ''}`}>{r.severity}</span></td>
//                       <td className="px-4 py-3 text-gray-600">{r.raisedBy || '—'}</td>
//                       <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.targetDate || '—'}</td>
//                       <td className="px-4 py-3">
//                         <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className={`text-xs rounded-full px-2 py-0.5 border-0 font-semibold cursor-pointer ${ST_COLOR[r.status] || ''}`}>
//                           {STATUSES.map(s => <option key={s}>{s}</option>)}
//                         </select>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <button onClick={() => setViewItem(r)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="View"><FiEye /></button>
//                           <button onClick={() => openEdit(r)} className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200" title="Edit"><FiEdit /></button>
//                           <button onClick={() => setDeleteId(r.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Delete"><FiTrash2 /></button>
//                         </div>
//                       </td>
//                       <td className="px-3 py-3">
//                         <button onClick={() => setExpandedRows(prev => { const n = new Set(prev); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })} className="text-gray-400 hover:text-rose-600 transition-colors">
//                           {expandedRows.has(r.id) ? <FiChevronUp /> : <FiChevronDown />}
//                         </button>
//                       </td>
//                     </tr>
//                     {expandedRows.has(r.id) && (
//                       <tr key={`exp-${r.id}`} className="bg-rose-50/30">
//                         <td colSpan={9} className="px-6 py-4 text-sm">
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div><p className="font-semibold text-gray-700 mb-1 text-xs uppercase">Description</p><p className="text-gray-600 text-xs">{r.description || '—'}</p></div>
//                             <div><p className="font-semibold text-gray-700 mb-1 text-xs uppercase">Root Cause</p><p className="text-gray-600 text-xs">{r.rootCause || '—'}</p></div>
//                             <div><p className="font-semibold text-gray-700 mb-1 text-xs uppercase">Corrective Action</p><p className="text-gray-600 text-xs">{r.correctiveAction || '—'}</p></div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Card View */}
//       {viewMode === 'card' && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {displayed.map((r: IssueRegister) => (
//             <div key={r.id} className="bg-white rounded-2xl shadow-lg border border-rose-100 hover:shadow-xl transition-all overflow-hidden">
//               <div className={`bg-gradient-to-r ${SEV_GRAD[r.severity] || 'from-gray-500 to-gray-600'} p-4`}>
//                 <div className="flex justify-between items-start">
//                   <div><p className="font-bold text-white text-sm">{r.title || r.issueTitle || '—'}</p><p className="text-white/70 text-xs mt-0.5">#{r.id} · {r.category}</p></div>
//                   <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ST_COLOR[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
//                 </div>
//               </div>
//               <div className="p-4 space-y-2 text-sm">
//                 {[['Raised By', r.raisedBy || '—'],['Target Date', r.targetDate || '—'],['Severity', r.severity]].map(([l,v]) => (
//                   <div key={l} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-gray-800">{v}</span></div>
//                 ))}
//                 <div className="flex gap-2 pt-2 border-t border-gray-100">
//                   <button onClick={() => setViewItem(r)} className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 flex items-center justify-center gap-1"><FiEye /> View</button>
//                   <button onClick={() => openEdit(r)} className="flex-1 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium hover:bg-rose-100 flex items-center justify-center gap-1"><FiEdit /> Edit</button>
//                   <button onClick={() => setDeleteId(r.id)} className="py-1.5 px-3 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"><FiTrash2 /></button>
//                 </div>
//               </div>
//             </div>
//           ))}
//           {displayed.length === 0 && (
//             <div className="col-span-3 bg-white rounded-2xl shadow p-16 text-center">
//               <FiFileText className="text-5xl text-gray-200 mx-auto mb-3" />
//               <p className="text-gray-400">No issues found</p>
//               <button onClick={openAdd} className="mt-3 px-5 py-2 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-xl text-sm flex items-center gap-2 mx-auto"><FiPlus /> Register Issue</button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-4 flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-bold text-white">{editing ? `Edit Issue #${editing.id}` : 'New Quality Issue'}</h2>
//                 <p className="text-rose-100 text-xs mt-0.5">Register a quality issue for tracking and resolution</p>
//               </div>
//               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"><FiX /></button>
//             </div>
//             <div className="p-6 overflow-y-auto max-h-[72vh]">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="col-span-2"><label className={lbl}>Issue Title *</label><input value={form.title || ''} onChange={ff('title')} placeholder="Brief, descriptive title" className={inp} /></div>
//                 <div><label className={lbl}>Category</label><select value={form.category || 'PROCESS'} onChange={ff('category')} className={inp}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
//                 <div><label className={lbl}>Severity</label><select value={form.severity || 'MEDIUM'} onChange={ff('severity')} className={inp}>{SEVERITIES.map(s => <option key={s}>{s}</option>)}</select></div>
//                 <div><label className={lbl}>Raised By *</label><input value={form.raisedBy || ''} onChange={ff('raisedBy')} placeholder="Name of person raising issue" className={inp} /></div>
//                 <div><label className={lbl}>Target Closure Date</label><input type="date" value={form.targetDate || ''} onChange={ff('targetDate')} className={inp} /></div>
//                 <div><label className={lbl}>Certification</label><select value={form.certification?.id || ''} onChange={e => setForm(p => ({ ...p, certification: e.target.value ? { id: Number(e.target.value) } : null } as typeof EMPTY_FORM))} className={inp}><option value="">— All Certifications —</option>{certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></div>
//                 <div><label className={lbl}>Department</label><select value={form.department?.id || ''} onChange={e => setForm(p => ({ ...p, department: e.target.value ? { id: Number(e.target.value) } : null } as typeof EMPTY_FORM))} className={inp}><option value="">— All Departments —</option>{depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
//                 {editing && <div><label className={lbl}>Status</label><select value={form.status || 'OPEN'} onChange={ff('status')} className={inp}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>}
//                 <div className="col-span-2"><label className={lbl}>Description</label><textarea value={form.description || ''} onChange={ff('description')} rows={3} placeholder="Detailed description of the issue..." className={inp + ' resize-none'} /></div>
//                 <div className="col-span-2"><label className={lbl}>Root Cause</label><textarea value={form.rootCause || ''} onChange={ff('rootCause')} rows={2} placeholder="Known or suspected root cause..." className={inp + ' resize-none'} /></div>
//                 <div className="col-span-2"><label className={lbl}>Corrective / Preventive Action</label><textarea value={form.correctiveAction || ''} onChange={ff('correctiveAction')} rows={2} placeholder="Proposed corrective action..." className={inp + ' resize-none'} /></div>
//               </div>
//             </div>
//             <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
//               <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
//               <button onClick={save} disabled={saving} className="px-6 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 disabled:opacity-60 shadow-lg flex items-center gap-2 transition-all">
//                 {saving ? <><FiRefreshCw className="animate-spin" /> Saving...</> : editing ? <><FiCheckCircle /> Save Changes</> : <><FiPlus /> Register Issue</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Modal */}
//       {viewItem && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewItem(null)}>
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
//             <div className={`bg-gradient-to-r ${SEV_GRAD[viewItem.severity] || 'from-gray-500 to-gray-600'} px-6 py-4 flex items-center justify-between`}>
//               <div><h2 className="text-base font-bold text-white">{viewItem.title || viewItem.issueTitle || '—'}</h2><p className="text-white/70 text-xs mt-0.5">Issue #{viewItem.id} · {viewItem.category}</p></div>
//               <button onClick={() => setViewItem(null)} className="p-2 hover:bg-white/20 rounded-xl text-white"><FiX /></button>
//             </div>
//             <div className="p-5 overflow-y-auto max-h-[70vh] space-y-3 text-sm">
//               <div className="grid grid-cols-2 gap-3">
//                 {[['Severity', viewItem.severity],['Status', viewItem.status],['Raised By', viewItem.raisedBy || '—'],['Target Date', viewItem.targetDate || '—'],['Department', viewItem.department?.name || '—'],['Certification', viewItem.certification?.code || '—']].map(([l,v]) => (
//                   <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">{l}</p><p className="font-semibold text-gray-800 text-xs">{v}</p></div>
//                 ))}
//               </div>
//               {viewItem.description && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Description</p><p className="text-gray-700 text-xs">{viewItem.description}</p></div>}
//               {viewItem.rootCause && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Root Cause</p><p className="text-gray-700 text-xs">{viewItem.rootCause}</p></div>}
//               {viewItem.correctiveAction && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Corrective Action</p><p className="text-gray-700 text-xs">{viewItem.correctiveAction}</p></div>}
//             </div>
//             <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
//               <button onClick={() => setViewItem(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Close</button>
//               <button onClick={() => { setViewItem(null); openEdit(viewItem); }} className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white text-sm font-semibold hover:from-rose-700 hover:to-orange-600 flex items-center gap-2"><FiEdit /> Edit</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirm */}
//       {deleteId && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
//             <div className="flex items-center gap-3 mb-4"><div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div><div><h3 className="font-bold text-gray-800">Delete Issue</h3><p className="text-sm text-gray-500">This cannot be undone.</p></div></div>
//             <div className="flex gap-3">
//               <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
//               <button onClick={() => del(deleteId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-2"><FiTrash2 /> Delete</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Report ─────────────────────────────────────────────────────────────────────
// function IssueReport() {
//   const [loading, setLoading] = useState(false);

//   const downloadCSV = async () => {
//     setLoading(true);
//     try {
//       const issues = (await issueApi.getAll() as unknown as IssueRegister[]);
//       exportCSV('Issue_Register_Report.csv', ['ID','Title','Category','Severity','Raised By','Target Date','Status','Root Cause','Corrective Action'],
//         issues.map(i => [i.id, i.title||'', i.category, i.severity, i.raisedBy, i.targetDate, i.status, i.rootCause, i.correctiveAction]));
//     } catch { alert('Failed to generate report.'); }
//     finally { setLoading(false); }
//   };

//   const downloadPDF = async () => {
//     setLoading(true);
//     try {
//       const issues = (await issueApi.getAll() as unknown as IssueRegister[]);
//       const w = window.open('', '_blank');
//       if (!w) return;
//       w.document.write(`<html><head><title>Issue Register Report</title><style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px}h1{color:#280882}table{width:100%;border-collapse:collapse}th{background:#280882;color:white;padding:7px 10px;text-align:left}td{border:1px solid #ddd;padding:6px 10px}tr:nth-child(even){background:#f5f3ff}</style></head><body><h1>Issue Register Report</h1><p>Generated: ${new Date().toLocaleDateString('en-IN')} | Total: ${issues.length}</p><table><tr>${['#','Title','Category','Severity','Raised By','Target Date','Status'].map(h=>`<th>${h}</th>`).join('')}</tr>${issues.map(i=>`<tr><td>#${i.id}</td><td>${i.title||i.issueTitle||''}</td><td>${i.category||''}</td><td>${i.severity||''}</td><td>${i.raisedBy||''}</td><td>${i.targetDate||''}</td><td>${i.status||''}</td></tr>`).join('')}</table></body></html>`);
//       w.document.close(); w.print();
//     } catch { alert('Failed to generate PDF.'); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 border border-rose-100 max-w-xl mx-auto text-center">
//         <div className="p-4 bg-rose-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//           <FiFileText className="text-rose-600 text-3xl" />
//         </div>
//         <h2 className="text-xl font-bold text-gray-800 mb-1">Issue Register Reports</h2>
//         <p className="text-sm text-gray-500 mb-6">Export all issue register data for analysis and audit purposes</p>
//         <div className="flex items-center justify-center gap-4 flex-wrap">
//           <button onClick={downloadCSV} disabled={loading} className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-green-400 text-green-700 font-medium hover:bg-green-50 disabled:opacity-50 transition-all">
//             <FiDownload className="text-lg" /><div className="text-left"><p className="font-semibold">Download Excel</p><p className="text-xs opacity-70">CSV format</p></div>
//           </button>
//           <button onClick={downloadPDF} disabled={loading} className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-red-400 text-red-700 font-medium hover:bg-red-50 disabled:opacity-50 transition-all">
//             <FiPrinter className="text-lg" /><div className="text-left"><p className="font-semibold">Print PDF</p><p className="text-xs opacity-70">Print-ready report</p></div>
//           </button>
//         </div>
//         {loading && <p className="text-sm text-gray-400 mt-4 flex items-center justify-center gap-2"><FiRefreshCw className="animate-spin" /> Generating...</p>}
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { issueApi, certApi, deptApi } from '../../api/qms.api';
import { exportCSV } from '../master-data/chartUtils';
import type { IssueRegister, Certification, Department, CertRef, DeptRef, InputChg } from '../qms/types';
import { apiMsg } from '../qms/types';
import DocumentIssueModule from './DocumentIssueModule';
import {
  FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiRefreshCw,
  FiChevronDown, FiChevronUp, FiDownload, FiPrinter,
  FiAlertTriangle, FiCheckCircle, FiFileText, FiBarChart2,
  FiClock, FiAlertCircle, FiEye, FiGrid, FiList, FiFilter
} from 'react-icons/fi';

const CATEGORIES = ['PROCESS','PRODUCT','SYSTEM','SAFETY','CUSTOMER','OTHER'];
const SEVERITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const STATUSES = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'];

const SEV_COLOR: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700', MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700',
};
const SEV_GRAD: Record<string, string> = {
  LOW: 'from-blue-500 to-blue-600', MEDIUM: 'from-yellow-500 to-orange-500',
  HIGH: 'from-orange-500 to-orange-600', CRITICAL: 'from-red-600 to-red-700',
};
const ST_COLOR: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = {
  title: '', description: '', category: 'PROCESS', severity: 'MEDIUM',
  raisedBy: '', targetDate: '', rootCause: '', correctiveAction: '',
  status: 'OPEN', certification: null as CertRef | null, department: null as DeptRef | null,
};

const TABS = [
  { id: 'doc-issue', label: 'Document Issue Register',  icon: 'fas fa-file-contract'      },
  { id: 'report',    label: 'Reports',                  icon: 'fas fa-file-pdf'           },
];

export default function IssueModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'doc-issue';
  const setTab = (tab: string) => setSearchParams({ tab }, { replace: true });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Issue Register</h1>
          <p className="text-sm text-gray-500 mt-0.5">Log, track, and resolve quality issues across the organization</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <i className="fas fa-list-alt" style={{ color: '#280882' }} />
          <span style={{ color: '#280882' }} className="font-medium">Issue Register</span>
          <span className="text-gray-300">›</span>
          <span>{TABS.find(t => t.id === activeTab)?.label}</span>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <nav className="flex min-w-max">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${activeTab === tab.id ? 'border-b-[#280882] text-[#280882] bg-purple-50/60' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <i className={`${tab.icon} text-xs`} />{tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div key={activeTab}>
        {activeTab === 'doc-issue' && <DocumentIssueModule />}
        {activeTab === 'report'    && <IssueReport />}
      </div>
    </div>
  );
}

// ── Report ─────────────────────────────────────────────────────────────────────
function IssueReport() {
  const [loading, setLoading] = useState(false);

  const downloadCSV = async () => {
    setLoading(true);
    try {
      const issues = (await issueApi.getAll() as unknown as IssueRegister[]);
      exportCSV('Issue_Register_Report.csv', ['ID','Title','Category','Severity','Raised By','Target Date','Status','Root Cause','Corrective Action'],
        issues.map(i => [i.id, i.title||'', i.category, i.severity, i.raisedBy, i.targetDate, i.status, i.rootCause, i.correctiveAction]));
    } catch { alert('Failed to generate report.'); }
    finally { setLoading(false); }
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const issues = (await issueApi.getAll() as unknown as IssueRegister[]);
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`<html><head><title>Issue Register Report</title><style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px}h1{color:#280882}table{width:100%;border-collapse:collapse}th{background:#280882;color:white;padding:7px 10px;text-align:left}td{border:1px solid #ddd;padding:6px 10px}tr:nth-child(even){background:#f5f3ff}</style></head><body><h1>Issue Register Report</h1><p>Generated: ${new Date().toLocaleDateString('en-IN')} | Total: ${issues.length}</p><table><tr>${['#','Title','Category','Severity','Raised By','Target Date','Status'].map(h=>`<th>${h}</th>`).join('')}</tr>${issues.map(i=>`<tr><td>#${i.id}</td><td>${i.title||i.issueTitle||''}</td><td>${i.category||''}</td><td>${i.severity||''}</td><td>${i.raisedBy||''}</td><td>${i.targetDate||''}</td><td>${i.status||''}</td></tr>`).join('')}</table></body></html>`);
      w.document.close(); w.print();
    } catch { alert('Failed to generate PDF.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-rose-100 max-w-xl mx-auto text-center">
        <div className="p-4 bg-rose-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FiFileText className="text-rose-600 text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Issue Register Reports</h2>
        <p className="text-sm text-gray-500 mb-6">Export all issue register data for analysis and audit purposes</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={downloadCSV} disabled={loading} className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-green-400 text-green-700 font-medium hover:bg-green-50 disabled:opacity-50 transition-all">
            <FiDownload className="text-lg" /><div className="text-left"><p className="font-semibold">Download Excel</p><p className="text-xs opacity-70">CSV format</p></div>
          </button>
          <button onClick={downloadPDF} disabled={loading} className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-red-400 text-red-700 font-medium hover:bg-red-50 disabled:opacity-50 transition-all">
            <FiPrinter className="text-lg" /><div className="text-left"><p className="font-semibold">Print PDF</p><p className="text-xs opacity-70">Print-ready report</p></div>
          </button>
        </div>
        {loading && <p className="text-sm text-gray-400 mt-4 flex items-center justify-center gap-2"><FiRefreshCw className="animate-spin" /> Generating...</p>}
      </div>
    </div>
  );
}