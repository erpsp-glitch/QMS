// // import { useEffect, useState } from 'react';
// // import { certApi, deptApi, employeeApi, auditorApi, docApi } from '../../api/qms.api';
// // import type { Certification } from '../qms/types';

// // const BRAND = '#280882';

// // export default function MasterDashboard() {
// //   const [counts, setCounts] = useState({
// //     certifications: 0, departments: 0, employees: 0, auditors: 0, documents: 0,
// //   });
// //   const [certs, setCerts] = useState<Certification[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     Promise.allSettled([
// //       certApi.getAll(),
// //       deptApi.getAll(),
// //       employeeApi.getAll(),
// //       auditorApi.getAll(),
// //       docApi.getAll(),
// //     ]).then(([cRes, dRes, eRes, aRes, docRes]) => {
// //       const c = cRes.status === 'fulfilled' ? (Array.isArray(cRes.value) ? cRes.value as Certification[] : []) : [];
// //       const d = dRes.status === 'fulfilled' ? (Array.isArray(dRes.value) ? dRes.value : []) : [];
// //       const e = eRes.status === 'fulfilled' ? (Array.isArray(eRes.value) ? eRes.value : []) : [];
// //       const a = aRes.status === 'fulfilled' ? (Array.isArray(aRes.value) ? aRes.value : []) : [];
// //       const doc = docRes.status === 'fulfilled' ? (Array.isArray(docRes.value) ? docRes.value : []) : [];
// //       setCounts({ certifications: c.length, departments: d.length, employees: e.length, auditors: a.length, documents: doc.length });
// //       setCerts(c);
// //     }).finally(() => setLoading(false));
// //   }, []);

// //   const cards = [
// //     { label: 'Certifications', value: counts.certifications, icon: 'fas fa-certificate', color: '#7c3aed' },
// //     { label: 'Departments',    value: counts.departments,    icon: 'fas fa-building',    color: '#2563eb' },
// //     { label: 'Employees',      value: counts.employees,      icon: 'fas fa-users',       color: '#059669' },
// //     { label: 'Auditors',       value: counts.auditors,       icon: 'fas fa-user-shield', color: '#d97706' },
// //     { label: 'Documents',      value: counts.documents,      icon: 'fas fa-folder-open', color: '#dc2626' },
// //   ];

// //   if (loading) return (
// //     <div className="py-20 text-center">
// //       <i className="fas fa-spinner fa-spin text-3xl" style={{ color: BRAND }} />
// //     </div>
// //   );

// //   return (
// //     <div className="space-y-6">
// //       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
// //         {cards.map(c => (
// //           <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2">
// //             <div className="flex items-center justify-between">
// //               <span className="text-xs font-medium text-gray-500 uppercase">{c.label}</span>
// //               <i className={`${c.icon} text-lg`} style={{ color: c.color }} />
// //             </div>
// //             <div className="text-3xl font-bold text-gray-800">{c.value}</div>
// //           </div>
// //         ))}
// //       </div>

// //       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
// //         <h2 className="text-base font-semibold text-gray-800 mb-4">Active Certifications</h2>
// //         {certs.length === 0 ? (
// //           <p className="text-gray-400 text-sm">No certifications found. Add one in Certification Master.</p>
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //             {certs.map((c: Certification) => {
// //               const expDays = c.expiryDate
// //                 ? Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / 86400000)
// //                 : null;
// //               const isExpiring = expDays !== null && expDays <= 30;
// //               const isExpired = expDays !== null && expDays < 0;
// //               return (
// //                 <div key={c.id} className="border rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
// //                   <div className="flex items-center justify-between">
// //                     <span className="font-semibold text-gray-800">{c.name}</span>
// //                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
// //                       c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
// //                       c.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
// //                       'bg-gray-100 text-gray-500'
// //                     }`}>{c.status}</span>
// //                   </div>
// //                   <div className="text-xs text-gray-500 font-mono">{c.code}</div>
// //                   {c.certificationBody && <div className="text-xs text-gray-400">{c.certificationBody}</div>}
// //                   {expDays !== null && (
// //                     <div className={`text-xs font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-600' : 'text-green-600'}`}>
// //                       <i className={`fas ${isExpired ? 'fa-times-circle' : isExpiring ? 'fa-exclamation-triangle' : 'fa-check-circle'} mr-1`} />
// //                       {isExpired ? `Expired ${Math.abs(expDays)} days ago` :
// //                        isExpiring ? `Expires in ${expDays} days` :
// //                        `Valid — ${expDays} days left`}
// //                     </div>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }



// import { useEffect, useState } from 'react';
// import { certApi, deptApi, employeeApi, auditorApi, docApi } from '../../api/qms.api';
// import type { Certification } from '../qms/types';
// import {
//   FiAward, FiBuilding, FiUsers, FiShield, FiFolder, FiTrendingUp,
//   FiClock, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiCalendar,
//   FiBarChart2, FiPieChart, FiActivity, FiStar, FiUserCheck,
//   FiBriefcase, FiBookOpen, FiLayers, FiHash, FiExternalLink,
//   FiPlus, FiRefreshCw, FiChevronRight, FiSearch
// } from 'react-icons/fi';

// const BRAND = '#280882';

// export default function MasterDashboard() {
//   const [counts, setCounts] = useState({
//     certifications: 0, departments: 0, employees: 0, auditors: 0, documents: 0,
//   });
//   const [certs, setCerts] = useState<Certification[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');

//   useEffect(() => {
//     Promise.allSettled([
//       certApi.getAll(),
//       deptApi.getAll(),
//       employeeApi.getAll(),
//       auditorApi.getAll(),
//       docApi.getAll(),
//     ]).then(([cRes, dRes, eRes, aRes, docRes]) => {
//       const c = cRes.status === 'fulfilled' ? (Array.isArray(cRes.value) ? cRes.value as Certification[] : []) : [];
//       const d = dRes.status === 'fulfilled' ? (Array.isArray(dRes.value) ? dRes.value : []) : [];
//       const e = eRes.status === 'fulfilled' ? (Array.isArray(eRes.value) ? eRes.value : []) : [];
//       const a = aRes.status === 'fulfilled' ? (Array.isArray(aRes.value) ? aRes.value : []) : [];
//       const doc = docRes.status === 'fulfilled' ? (Array.isArray(docRes.value) ? docRes.value : []) : [];
//       setCounts({ certifications: c.length, departments: d.length, employees: e.length, auditors: a.length, documents: doc.length });
//       setCerts(c);
//     }).finally(() => setLoading(false));
//   }, []);

//   // Calculate additional stats
//   const activeCerts = certs.filter(c => c.status === 'ACTIVE');
//   const expiredCerts = certs.filter(c => c.status === 'EXPIRED');
//   const expiringCerts = certs.filter(c => {
//     if (!c.expiryDate || c.status !== 'ACTIVE') return false;
//     const expDays = Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / 86400000);
//     return expDays > 0 && expDays <= 30;
//   });

//   // Filter certifications
//   const filteredCerts = certs.filter(c => {
//     const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                         c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                         (c.certificationBody || '').toLowerCase().includes(searchTerm.toLowerCase());
//     const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
//     return matchSearch && matchStatus;
//   });

//   const cards = [
//     { 
//       label: 'Certifications', 
//       value: counts.certifications, 
//       icon: FiAward, 
//       gradient: 'from-purple-500 to-indigo-600',
//       bgGradient: 'from-purple-50 to-indigo-50',
//       borderColor: 'border-purple-200'
//     },
//     { 
//       label: 'Departments',    
//       value: counts.departments,    
//       icon: FiBuilding, 
//       gradient: 'from-blue-500 to-cyan-600',
//       bgGradient: 'from-blue-50 to-cyan-50',
//       borderColor: 'border-blue-200'
//     },
//     { 
//       label: 'Employees',      
//       value: counts.employees,      
//       icon: FiUsers, 
//       gradient: 'from-emerald-500 to-teal-600',
//       bgGradient: 'from-emerald-50 to-teal-50',
//       borderColor: 'border-emerald-200'
//     },
//     { 
//       label: 'Auditors',       
//       value: counts.auditors,       
//       icon: FiShield, 
//       gradient: 'from-amber-500 to-orange-600',
//       bgGradient: 'from-amber-50 to-orange-50',
//       borderColor: 'border-amber-200'
//     },
//     { 
//       label: 'Documents',      
//       value: counts.documents,      
//       icon: FiFolder, 
//       gradient: 'from-rose-500 to-red-600',
//       bgGradient: 'from-rose-50 to-red-50',
//       borderColor: 'border-rose-200'
//     },
//   ];

//   const statusCards = [
//     { label: 'Active', value: activeCerts.length, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
//     { label: 'Expiring', value: expiringCerts.length, icon: FiAlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
//     { label: 'Expired', value: expiredCerts.length, icon: FiAlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
//   ];

//   if (loading) return (
//     <div className="min-h-[400px] flex items-center justify-center">
//       <div className="relative">
//         <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse"></div>
//         </div>
//         <p className="text-sm text-gray-500 mt-4 text-center">Loading dashboard...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
//       {/* Animated Background */}
//       <div className="fixed inset-0 pointer-events-none overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/10 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 px-8 py-6">
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
//                 <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-3.5 rounded-2xl shadow-xl">
//                   <FiBarChart2 className="text-white text-2xl" />
//                 </div>
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//                   Master Dashboard
//                 </h1>
//                 <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
//                   <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
//                   Overview of all master data across the organization
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button 
//                 onClick={() => window.location.reload()}
//                 className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-all"
//               >
//                 <FiRefreshCw className="text-sm group-hover:rotate-180 transition-transform duration-500" />
//                 <span className="text-sm font-medium">Refresh</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards - Grid View */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//           {cards.map((card, index) => {
//             const Icon = card.icon;
//             return (
//               <div 
//                 key={index} 
//                 className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border ${card.borderColor} p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fadeIn`}
//                 style={{ animationDelay: `${index * 50}ms` }}
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
//                     <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
//                     <div className="flex items-center gap-1 mt-1">
//                       <FiTrendingUp className="text-emerald-500 text-xs" />
//                       <span className="text-[10px] text-emerald-600 font-medium">+12.5%</span>
//                       <span className="text-[10px] text-slate-400">this month</span>
//                     </div>
//                   </div>
//                   <div className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
//                     <Icon className="text-white text-lg" />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Certification Status Summary */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {statusCards.map((item, index) => {
//             const Icon = item.icon;
//             return (
//               <div 
//                 key={index} 
//                 className={`${item.bg} rounded-2xl p-5 border border-slate-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fadeIn`}
//                 style={{ animationDelay: `${(index + 5) * 50}ms` }}
//               >
//                 <div className="flex items-center gap-4">
//                   <div className={`p-3 bg-white rounded-xl shadow-sm`}>
//                     <Icon className={`text-xl ${item.color}`} />
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
//                     <p className={`text-2xl font-bold ${item.color} mt-1`}>{item.value}</p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Active Certifications Section */}
//         <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
//           <div className="px-6 py-5 border-b border-slate-100">
//             <div className="flex flex-wrap items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//                   <FiAward className="text-purple-600" />
//                   Active Certifications
//                   <span className="ml-2 text-sm font-normal text-slate-400">
//                     ({filteredCerts.length} of {certs.length})
//                   </span>
//                 </h2>
//                 <p className="text-xs text-slate-500 mt-0.5">Monitor certification status and expiry dates</p>
//               </div>
//               <div className="flex items-center gap-3 flex-wrap">
//                 {/* Search */}
//                 <div className="relative">
//                   <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
//                   <input
//                     type="text"
//                     placeholder="Search certifications..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-9 pr-4 py-2 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm w-48 md:w-64"
//                   />
//                 </div>
//                 {/* Filter */}
//                 <select
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.target.value)}
//                   className="px-4 py-2 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
//                 >
//                   <option value="ALL">All Status</option>
//                   <option value="ACTIVE">Active</option>
//                   <option value="EXPIRED">Expired</option>
//                   <option value="SUSPENDED">Suspended</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="p-6">
//             {certs.length === 0 ? (
//               <div className="text-center py-12">
//                 <FiAward className="text-5xl text-slate-200 mx-auto mb-4" />
//                 <p className="text-sm text-slate-400">No certifications found. Add one in Certification Master.</p>
//                 <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
//                   <FiPlus className="text-sm" /> Add Certification
//                 </button>
//               </div>
//             ) : filteredCerts.length === 0 ? (
//               <div className="text-center py-12">
//                 <FiSearch className="text-5xl text-slate-200 mx-auto mb-4" />
//                 <p className="text-sm text-slate-400">No certifications match your search criteria.</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//                 {filteredCerts.map((cert: Certification, index) => {
//                   const expDays = cert.expiryDate
//                     ? Math.ceil((new Date(cert.expiryDate).getTime() - Date.now()) / 86400000)
//                     : null;
//                   const isExpiring = expDays !== null && expDays > 0 && expDays <= 30;
//                   const isExpired = expDays !== null && expDays < 0;
//                   const statusColor = cert.status === 'ACTIVE' 
//                     ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
//                     : cert.status === 'EXPIRED' 
//                     ? 'bg-red-100 text-red-700 border-red-200' 
//                     : 'bg-slate-100 text-slate-600 border-slate-200';
//                   const statusIcon = cert.status === 'ACTIVE' 
//                     ? FiCheckCircle 
//                     : cert.status === 'EXPIRED' 
//                     ? FiAlertCircle 
//                     : FiAlertCircle;

//                   const StatusIcon = statusIcon;

//                   return (
//                     <div 
//                       key={cert.id} 
//                       className="group bg-white rounded-2xl border-2 border-slate-100 p-5 hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1 animate-fadeIn"
//                       style={{ animationDelay: `${(index + 8) * 50}ms` }}
//                     >
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 mb-1">
//                             <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 rounded-lg">
//                               <FiAward className="text-white text-xs" />
//                             </div>
//                             <h3 className="font-semibold text-slate-800 truncate text-sm">{cert.name}</h3>
//                           </div>
//                           <p className="text-xs font-mono text-slate-400">{cert.code}</p>
//                         </div>
//                         <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusColor} flex-shrink-0`}>
//                           <StatusIcon className="text-[10px]" />
//                           {cert.status}
//                         </div>
//                       </div>

//                       {cert.certificationBody && (
//                         <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
//                           <FiBriefcase className="text-slate-400 text-[10px]" />
//                           <span>{cert.certificationBody}</span>
//                         </div>
//                       )}

//                       <div className="flex items-center gap-4 text-xs">
//                         {cert.issueDate && (
//                           <div className="flex items-center gap-1 text-slate-500">
//                             <FiCalendar className="text-[10px]" />
//                             <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
//                           </div>
//                         )}
//                       </div>

//                       {expDays !== null && (
//                         <div className="mt-3 pt-3 border-t border-slate-100">
//                           <div className={`flex items-center gap-2 text-xs font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-emerald-600'}`}>
//                             {isExpired ? (
//                               <FiAlertCircle className="text-sm" />
//                             ) : isExpiring ? (
//                               <FiAlertTriangle className="text-sm" />
//                             ) : (
//                               <FiCheckCircle className="text-sm" />
//                             )}
//                             <span>
//                               {isExpired ? `Expired ${Math.abs(expDays)} days ago` :
//                                isExpiring ? `⚠️ Expires in ${expDays} days` :
//                                `✅ Valid — ${expDays} days left`}
//                             </span>
//                           </div>
//                           {isExpiring && !isExpired && (
//                             <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
//                               <div 
//                                 className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000"
//                                 style={{ width: `${Math.min(100, (30 - expDays) / 30 * 100)}%` }}
//                               ></div>
//                             </div>
//                           )}
//                           {!isExpired && !isExpiring && expDays > 0 && (
//                             <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
//                               <div 
//                                 className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
//                                 style={{ width: `${Math.min(100, (365 - expDays) / 365 * 100)}%` }}
//                               ></div>
//                             </div>
//                           )}
//                         </div>
//                       )}

//                       <div className="mt-3 flex items-center justify-between">
//                         <div className="flex items-center gap-2 text-[10px] text-slate-400">
//                           <FiClock className="text-[10px]" />
//                           <span>Last updated: {new Date().toLocaleDateString()}</span>
//                         </div>
//                         <button className="text-purple-600 hover:text-purple-700 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                           View Details <FiChevronRight className="text-[10px]" />
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer Stats */}
//         <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 px-6 py-4">
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex items-center gap-6 text-sm">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
//                 <span className="text-slate-600">Active</span>
//                 <span className="font-semibold text-slate-800">{activeCerts.length}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-amber-500"></div>
//                 <span className="text-slate-600">Expiring Soon</span>
//                 <span className="font-semibold text-slate-800">{expiringCerts.length}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                 <span className="text-slate-600">Expired</span>
//                 <span className="font-semibold text-slate-800">{expiredCerts.length}</span>
//               </div>
//             </div>
//             <div className="text-xs text-slate-400">
//               <FiActivity className="inline mr-1" />
//               System Status: <span className="text-emerald-600 font-medium">All Systems Operational</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CSS Animations */}
//       <style>{`
//         @keyframes fadeIn {
//           from { 
//             opacity: 0; 
//             transform: translateY(10px); 
//           }
//           to { 
//             opacity: 1; 
//             transform: translateY(0); 
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out forwards;
//           opacity: 0;
//         }
//       `}</style>
//     </div>
//   );
// }


import { useEffect, useState } from 'react';
import { certApi, deptApi, employeeApi, auditorApi, docApi } from '../../api/qms.api';
import type { Certification } from '../qms/types';
import {
  FiAward, FiHome, FiUsers, FiShield, FiFolder, FiTrendingUp,
  FiClock, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiCalendar,
  FiBarChart2, FiActivity, FiStar, FiUserCheck,
  FiBriefcase, FiBookOpen, FiLayers, FiHash, FiExternalLink,
  FiPlus, FiRefreshCw, FiChevronRight, FiSearch, FiDatabase,
  FiFileText, FiUser, FiSettings, FiBox
} from 'react-icons/fi';

const BRAND = '#280882';

export default function MasterDashboard() {
  const [counts, setCounts] = useState({
    certifications: 0, departments: 0, employees: 0, auditors: 0, documents: 0,
  });
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    Promise.allSettled([
      certApi.getAll(),
      deptApi.getAll(),
      employeeApi.getAll(),
      auditorApi.getAll(),
      docApi.getAll(),
    ]).then(([cRes, dRes, eRes, aRes, docRes]) => {
      const c = cRes.status === 'fulfilled' ? (Array.isArray(cRes.value) ? cRes.value as Certification[] : []) : [];
      const d = dRes.status === 'fulfilled' ? (Array.isArray(dRes.value) ? dRes.value : []) : [];
      const e = eRes.status === 'fulfilled' ? (Array.isArray(eRes.value) ? eRes.value : []) : [];
      const a = aRes.status === 'fulfilled' ? (Array.isArray(aRes.value) ? aRes.value : []) : [];
      const doc = docRes.status === 'fulfilled' ? (Array.isArray(docRes.value) ? docRes.value : []) : [];
      setCounts({ certifications: c.length, departments: d.length, employees: e.length, auditors: a.length, documents: doc.length });
      setCerts(c);
    }).finally(() => setLoading(false));
  }, []);

  // Calculate additional stats
  const activeCerts = certs.filter(c => c.status === 'ACTIVE');
  const expiredCerts = certs.filter(c => c.status === 'EXPIRED');
  const expiringCerts = certs.filter(c => {
    if (!c.expiryDate || c.status !== 'ACTIVE') return false;
    const expDays = Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / 86400000);
    return expDays > 0 && expDays <= 30;
  });

  // Filter certifications
  const filteredCerts = certs.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.certificationBody || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const cards = [
    { 
      label: 'Certifications', 
      value: counts.certifications, 
      icon: FiAward, 
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200'
    },
    { 
      label: 'Departments',    
      value: counts.departments,    
      icon: FiHome, 
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    { 
      label: 'Employees',      
      value: counts.employees,      
      icon: FiUsers, 
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200'
    },
    { 
      label: 'Auditors',       
      value: counts.auditors,       
      icon: FiShield, 
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200'
    },
    { 
      label: 'Documents',      
      value: counts.documents,      
      icon: FiFolder, 
      gradient: 'from-rose-500 to-red-600',
      bgGradient: 'from-rose-50 to-red-50',
      borderColor: 'border-rose-200'
    },
  ];

  const statusCards = [
    { label: 'Active', value: activeCerts.length, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Expiring', value: expiringCerts.length, icon: FiAlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Expired', value: expiredCerts.length, icon: FiAlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-3.5 rounded-2xl shadow-xl">
                  <FiBarChart2 className="text-white text-2xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Master Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Overview of all master data across the organization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-all"
              >
                <FiRefreshCw className="text-sm group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Grid View */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div 
                key={index} 
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border ${card.borderColor} p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fadeIn`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <FiTrendingUp className="text-emerald-500 text-xs" />
                      <span className="text-[10px] text-emerald-600 font-medium">+12.5%</span>
                      <span className="text-[10px] text-slate-400">this month</span>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white text-lg" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certification Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusCards.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className={`${item.bg} rounded-2xl p-5 border border-slate-200/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fadeIn`}
                style={{ animationDelay: `${(index + 5) * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-white rounded-xl shadow-sm`}>
                    <Icon className={`text-xl ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color} mt-1`}>{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Certifications Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiAward className="text-purple-600" />
                  Active Certifications
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    ({filteredCerts.length} of {certs.length})
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Monitor certification status and expiry dates</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search certifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm w-48 md:w-64"
                  />
                </div>
                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {certs.length === 0 ? (
              <div className="text-center py-12">
                <FiAward className="text-5xl text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400">No certifications found. Add one in Certification Master.</p>
                <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  <FiPlus className="text-sm" /> Add Certification
                </button>
              </div>
            ) : filteredCerts.length === 0 ? (
              <div className="text-center py-12">
                <FiSearch className="text-5xl text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400">No certifications match your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCerts.map((cert: Certification, index) => {
                  const expDays = cert.expiryDate
                    ? Math.ceil((new Date(cert.expiryDate).getTime() - Date.now()) / 86400000)
                    : null;
                  const isExpiring = expDays !== null && expDays > 0 && expDays <= 30;
                  const isExpired = expDays !== null && expDays < 0;
                  const statusColor = cert.status === 'ACTIVE' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : cert.status === 'EXPIRED' 
                    ? 'bg-red-100 text-red-700 border-red-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200';
                  const statusIcon = cert.status === 'ACTIVE' 
                    ? FiCheckCircle 
                    : cert.status === 'EXPIRED' 
                    ? FiAlertCircle 
                    : FiAlertCircle;

                  const StatusIcon = statusIcon;

                  return (
                    <div 
                      key={cert.id} 
                      className="group bg-white rounded-2xl border-2 border-slate-100 p-5 hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1 animate-fadeIn"
                      style={{ animationDelay: `${(index + 8) * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 rounded-lg">
                              <FiAward className="text-white text-xs" />
                            </div>
                            <h3 className="font-semibold text-slate-800 truncate text-sm">{cert.name}</h3>
                          </div>
                          <p className="text-xs font-mono text-slate-400">{cert.code}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusColor} flex-shrink-0`}>
                          <StatusIcon className="text-[10px]" />
                          {cert.status}
                        </div>
                      </div>

                      {cert.certificationBody && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                          <FiBriefcase className="text-slate-400 text-[10px]" />
                          <span>{cert.certificationBody}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs">
                        {cert.issueDate && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <FiCalendar className="text-[10px]" />
                            <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {expDays !== null && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className={`flex items-center gap-2 text-xs font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {isExpired ? (
                              <FiAlertCircle className="text-sm" />
                            ) : isExpiring ? (
                              <FiAlertTriangle className="text-sm" />
                            ) : (
                              <FiCheckCircle className="text-sm" />
                            )}
                            <span>
                              {isExpired ? `Expired ${Math.abs(expDays)} days ago` :
                               isExpiring ? `⚠️ Expires in ${expDays} days` :
                               `✅ Valid — ${expDays} days left`}
                            </span>
                          </div>
                          {isExpiring && !isExpired && (
                            <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, (30 - expDays) / 30 * 100)}%` }}
                              ></div>
                            </div>
                          )}
                          {!isExpired && !isExpiring && expDays > 0 && (
                            <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, (365 - expDays) / 365 * 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <FiClock className="text-[10px]" />
                          <span>Last updated: {new Date().toLocaleDateString()}</span>
                        </div>
                        <button className="text-purple-600 hover:text-purple-700 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <FiChevronRight className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">Active</span>
                <span className="font-semibold text-slate-800">{activeCerts.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-slate-600">Expiring Soon</span>
                <span className="font-semibold text-slate-800">{expiringCerts.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-slate-600">Expired</span>
                <span className="font-semibold text-slate-800">{expiredCerts.length}</span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              <FiActivity className="inline mr-1" />
              System Status: <span className="text-emerald-600 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}