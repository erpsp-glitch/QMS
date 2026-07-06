// import { useEffect, useState } from 'react';
// import { certApi, docApi, employeeApi, deptApi, docIssueApi } from '../../api/qms.api';
// import { exportCSV } from '../master-data/chartUtils';
// import type { DocumentIssue, Certification, Document, Employee, Department } from '../qms/types';
// import { apiMsg } from '../qms/types';

// const BRAND = '#280882';

// const COPY_TYPES = ['Master Copy', 'Controlled Copy', 'Uncontrolled Copy', 'Reference Copy', 'Obsolete Copy'];
// const ISSUE_STATUSES = ['ISSUED', 'RETURNED', 'OVERDUE', 'CANCELLED'];
// const ACK_STATUSES = ['PENDING', 'ACKNOWLEDGED'];

// const COPY_PREFIX: Record<string, string> = {
//   'Master Copy': 'MC',
//   'Controlled Copy': 'CC',
//   'Uncontrolled Copy': 'UC',
//   'Reference Copy': 'RC',
//   'Obsolete Copy': 'OC',
// };

// // Maps between UI display names and backend enum values
// const COPY_TYPE_ENUM: Record<string, string> = {
//   'Master Copy': 'MASTER_COPY',
//   'Controlled Copy': 'CONTROLLED_COPY',
//   'Uncontrolled Copy': 'UNCONTROLLED_COPY',
//   'Reference Copy': 'REFERENCE_COPY',
//   'Obsolete Copy': 'OBSOLETE_COPY',
// };
// const COPY_TYPE_DISPLAY: Record<string, string> = {
//   MASTER_COPY: 'Master Copy',
//   CONTROLLED_COPY: 'Controlled Copy',
//   UNCONTROLLED_COPY: 'Uncontrolled Copy',
//   REFERENCE_COPY: 'Reference Copy',
//   OBSOLETE_COPY: 'Obsolete Copy',
// };

// // Helpers to read backend response which may have nested objects
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const rDocNum  = (r: any) => r.document?.documentNumber || r.documentNumber || '—';
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const rDocName = (r: any) => r.document?.documentName  || r.document?.name || r.documentName || '';
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const rIssuedTo = (r: any) => r.issuedTo || r.issueToEmployee || '—';
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const rDeptName = (r: any) => (typeof r.department === 'object' ? r.department?.name : r.department) || r.employeeDepartment || '—';
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const rCopyType = (r: any) => COPY_TYPE_DISPLAY[r.copyType] || r.copyType || '—';

// const ST_COLOR: Record<string, string> = {
//   ISSUED: 'bg-blue-100 text-blue-700',
//   RETURNED: 'bg-green-100 text-green-700',
//   OVERDUE: 'bg-red-100 text-red-700',
//   CANCELLED: 'bg-gray-100 text-gray-500',
// };
// const ACK_COLOR: Record<string, string> = {
//   PENDING: 'bg-yellow-100 text-yellow-700',
//   ACKNOWLEDGED: 'bg-green-100 text-green-700',
// };

// const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600';
// const roInputCls = 'w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-600 cursor-default';
// const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

// // ──────────────────────────────────────────────────────────────────────────────
// export default function DocumentIssueModule() {
//   const [tab, setTab] = useState<'dashboard' | 'new' | 'view' | 'report'>('dashboard');

//   const TABS = [
//     { id: 'dashboard', label: 'Dashboard',     icon: 'fas fa-chart-pie'      },
//     { id: 'new',       label: 'New Issue',      icon: 'fas fa-plus-circle'    },
//     { id: 'view',      label: 'View Register',  icon: 'fas fa-table'          },
//     { id: 'report',    label: 'Reports',        icon: 'fas fa-file-pdf'       },
//   ] as const;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 space-y-4">
//       {/* Header */}
//       <div className="bg-white rounded-2xl shadow-xl p-5 border border-blue-100">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Document Issue Register</h2>
//             <p className="text-gray-500 text-sm mt-0.5">Issue, track, and acknowledge controlled document copies</p>
//           </div>
//           <button onClick={() => setTab('new')} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:from-blue-800 hover:to-indigo-700 transition-all">
//             <i className="fas fa-plus" /> New Issue
//           </button>
//         </div>
//         <div className="flex gap-2 overflow-x-auto">
//           {TABS.map(t => (
//             <button key={t.id} onClick={() => setTab(t.id)}
//               className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border-2 ${tab === t.id ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
//               <i className={`${t.icon} text-xs`} />{t.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div key={tab}>
//         {tab === 'dashboard' && <DocIssueDashboard onNew={() => setTab('new')} />}
//         {tab === 'new'       && <NewDocIssueForm onSaved={() => setTab('view')} />}
//         {tab === 'view'      && <DocIssueList />}
//         {tab === 'report'    && <DocIssueReport />}
//       </div>
//     </div>
//   );
// }

// // ── Dashboard ─────────────────────────────────────────────────────────────────
// function DocIssueDashboard({ onNew }: { onNew: () => void }) {
//   const [issues, setIssues] = useState<DocumentIssue[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     docIssueApi.getAll()
//       .then((d: unknown) => setIssues(Array.isArray(d) ? d as DocumentIssue[] : []))
//       .catch(() => setIssues([]))
//       .finally(() => setLoading(false));
//   }, []);

//   const stats = {
//     total:        issues.length,
//     issued:       issues.filter(i => i.status === 'ISSUED').length,
//     returned:     issues.filter(i => i.status === 'RETURNED').length,
//     overdue:      issues.filter(i => i.status === 'OVERDUE').length,
//     pendingAck:   issues.filter(i => i.acknowledgementStatus === 'PENDING').length,
//     masterCopies: issues.filter(i => i.copyType === 'Master Copy' || i.copyType === 'MASTER_COPY').length,
//   };

//   const recentIssues = [...issues].sort((a, b) => b.id - a.id).slice(0, 8);

//   const copyTypeDist = COPY_TYPES.map(ct => ({
//     label: ct,
//     count: issues.filter(i => i.copyType === ct).length,
//   }));

//   if (loading) return <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>;

//   return (
//     <div className="space-y-4">
//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//         {[
//           { label: 'Total Issues',  value: stats.total,        grad: 'from-blue-700 to-indigo-600', icon: 'fas fa-file-contract' },
//           { label: 'Issued',        value: stats.issued,       grad: 'from-blue-500 to-blue-600',   icon: 'fas fa-paper-plane' },
//           { label: 'Returned',      value: stats.returned,     grad: 'from-green-500 to-emerald-600',icon: 'fas fa-undo' },
//           { label: 'Overdue',       value: stats.overdue,      grad: 'from-red-500 to-red-600',     icon: 'fas fa-exclamation' },
//           { label: 'Pending Ack.',  value: stats.pendingAck,   grad: 'from-yellow-500 to-orange-500',icon: 'fas fa-hourglass-half' },
//           { label: 'Master Copies', value: stats.masterCopies, grad: 'from-purple-600 to-indigo-600',icon: 'fas fa-star' },
//         ].map(k => (
//           <div key={k.label} className={`bg-gradient-to-br ${k.grad} text-white p-4 rounded-xl shadow-lg`}>
//             <div className="flex items-center gap-2.5">
//               <div className="p-2 bg-white/20 rounded-lg"><i className={`${k.icon} text-sm`} /></div>
//               <div><p className="text-xs opacity-90 leading-tight">{k.label}</p><p className="text-2xl font-bold">{k.value}</p></div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         {/* Copy Type Distribution */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//           <h3 className="text-sm font-semibold text-gray-700 mb-4">Documents by Copy Type</h3>
//           {issues.length === 0 ? (
//             <p className="text-center text-gray-400 text-sm py-6">No issues recorded yet.</p>
//           ) : (
//             <div className="space-y-3">
//               {copyTypeDist.map((d, i) => {
//                 const pct = stats.total > 0 ? (d.count / stats.total) * 100 : 0;
//                 const colors = ['#280882', '#10b981', '#f59e0b', '#3b82f6', '#6b7280'];
//                 return (
//                   <div key={d.label} className="flex items-center gap-3">
//                     <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: colors[i] }} />
//                     <span className="w-36 text-xs text-gray-600 truncate">{d.label}</span>
//                     <div className="flex-1 bg-gray-100 rounded-full h-2">
//                       <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
//                     </div>
//                     <span className="w-7 text-xs text-gray-500 text-right font-semibold">{d.count}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Status Distribution */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//           <h3 className="text-sm font-semibold text-gray-700 mb-4">Issue Status Overview</h3>
//           {issues.length === 0 ? (
//             <p className="text-center text-gray-400 text-sm py-6">No issues recorded yet.</p>
//           ) : (
//             <div className="space-y-3">
//               {[
//                 { label: 'Issued',   count: stats.issued,   color: '#3b82f6' },
//                 { label: 'Returned', count: stats.returned, color: '#10b981' },
//                 { label: 'Overdue',  count: stats.overdue,  color: '#ef4444' },
//                 { label: 'Cancelled', count: issues.filter(i => i.status === 'CANCELLED').length, color: '#6b7280' },
//               ].map(row => {
//                 const pct = stats.total > 0 ? (row.count / stats.total) * 100 : 0;
//                 return (
//                   <div key={row.label} className="flex items-center gap-3">
//                     <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: row.color }} />
//                     <span className="w-20 text-xs text-gray-600">{row.label}</span>
//                     <div className="flex-1 bg-gray-100 rounded-full h-2">
//                       <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: row.color }} />
//                     </div>
//                     <span className="w-7 text-xs text-gray-500 text-right font-semibold">{row.count}</span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Recent Issues */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
//           <h3 className="text-sm font-semibold text-gray-700">Recent Document Issues</h3>
//           <button
//             onClick={onNew}
//             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
//             style={{ background: BRAND }}
//           >
//             <i className="fas fa-plus" /> New Issue
//           </button>
//         </div>
//         {recentIssues.length === 0 ? (
//           <div className="py-10 text-center text-gray-400 text-sm">
//             <i className="fas fa-file-contract text-3xl mb-2 block opacity-20" />
//             No document issues recorded yet.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
//                   {['Issue ID', 'Document', 'Copy Type', 'Copy No.', 'Issued To', 'Issue Date', 'Status', 'Ack.'].map(h => (
//                     <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {recentIssues.map((r: DocumentIssue) => (
//                   <tr key={r.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{r.issueId || `DI-${r.id}`}</td>
//                     <td className="px-4 py-3">
//                       <p className="font-medium text-gray-800 text-xs">{rDocNum(r)}</p>
//                       <p className="text-gray-400 text-[10px]">{rDocName(r)}</p>
//                     </td>
//                     <td className="px-4 py-3 text-xs text-gray-600">{rCopyType(r)}</td>
//                     <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{r.copyNumber || '—'}</td>
//                     <td className="px-4 py-3 text-xs">
//                       <p className="font-medium text-gray-700">{rIssuedTo(r)}</p>
//                       <p className="text-gray-400">{rDeptName(r)}</p>
//                     </td>
//                     <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{r.issueDate || '—'}</td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ST_COLOR[r.status] || 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ACK_COLOR[r.acknowledgementStatus] || 'bg-gray-100 text-gray-500'}`}>{r.acknowledgementStatus || 'PENDING'}</span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── New Document Issue Form ────────────────────────────────────────────────────
// function NewDocIssueForm({ onSaved }: { onSaved: () => void }) {
//   const [certs,  setCerts]  = useState<Certification[]>([]);
//   const [docs,   setDocs]   = useState<Document[]>([]);
//   const [emps,   setEmps]   = useState<Employee[]>([]);
//   const [depts,  setDepts]  = useState<Department[]>([]);
//   const [saving, setSaving] = useState(false);

//   // Selected entities (for auto-fill)
//   const [selCert, setSelCert] = useState<Certification | null>(null);
//   const [selDoc,  setSelDoc]  = useState<Document | null>(null);
//   const [selEmp,  setSelEmp]  = useState<Employee | null>(null);

//   // Form state
//   const [form, setForm] = useState({
//     certificationName: '', certificationNumber: '',
//     documentNumber: '', documentName: '', referenceNumber: '',
//     revisionNumber: '', revisionDate: '', department: '',
//     copyType: 'Controlled Copy', copyNumber: '',
//     issueToEmployee: '', employeeCode: '', employeeDepartment: '', designation: '',
//     issueDate: new Date().toISOString().split('T')[0],
//     returnDate: '', acknowledgementStatus: 'PENDING',
//     status: 'ISSUED', remarks: '',
//     certificationId: null as number | null, documentId: null as number | null,
//     employeeId: null as number | null, departmentId: null as number | null,
//   });

//   useEffect(() => {
//     certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
//     employeeApi.getAll().then((d: unknown) => setEmps(Array.isArray(d) ? d as Employee[] : [])).catch(() => {});
//     deptApi.getAll().then((d: unknown) => setDepts(Array.isArray(d) ? d as Department[] : [])).catch(() => {});
//   }, []);

//   // When certification selected → load documents for that cert
//   const onCertChange = async (certId: string) => {
//     if (!certId) {
//       setSelCert(null); setDocs([]);
//       setForm(p => ({ ...p, certificationId: null, certificationName: '', certificationNumber: '', documentNumber: '', documentName: '', referenceNumber: '', revisionNumber: '', revisionDate: '', department: '', documentId: null, departmentId: null }));
//       return;
//     }
//     const cert = certs.find(c => String(c.id) === certId);
//     setSelCert(cert);
//     setForm(p => ({
//       ...p,
//       certificationId: cert?.id ?? null,
//       certificationName: cert?.name || '',
//       certificationNumber: cert?.code || '',
//     }));
//     try {
//       const d = await docApi.getByCert(Number(certId));
//       setDocs(Array.isArray(d) ? d as Document[] : []);
//     } catch { setDocs([]); }
//     setSelDoc(null);
//     setForm(p => ({ ...p, documentNumber: '', documentName: '', referenceNumber: '', revisionNumber: '', revisionDate: '', department: '', documentId: null }));
//   };

//   // When document selected → auto-fill all doc fields
//   const onDocChange = (docId: string) => {
//     if (!docId) {
//       setSelDoc(null);
//       setForm(p => ({ ...p, documentNumber: '', documentName: '', referenceNumber: '', revisionNumber: '', revisionDate: '', department: '', documentId: null, departmentId: null }));
//       return;
//     }
//     const doc = docs.find(d => String(d.id) === docId);
//     setSelDoc(doc);
//     const deptId = doc?.department?.id ?? null;
//     const deptName = depts.find(d => d.id === deptId)?.name || doc?.department?.name || doc?.departmentName || '';
//     setForm(p => ({
//       ...p,
//       documentId: doc?.id ?? null,
//       documentNumber: doc?.documentNumber || doc?.docNumber || '',
//       documentName: doc?.documentName || doc?.name || '',
//       referenceNumber: doc?.referenceNumber || doc?.refNumber || '',
//       revisionNumber: doc?.revisionNumber || doc?.revision || '',
//       revisionDate: doc?.revisionDate || '',
//       department: deptName,
//       departmentId: deptId,
//     }));
//     // Re-generate copy number based on new doc
//     generateCopyNumber(form.copyType, deptName);
//   };

//   // When employee selected → auto-fill emp fields
//   const onEmpChange = (empId: string) => {
//     if (!empId) {
//       setSelEmp(null);
//       setForm(p => ({ ...p, employeeId: null, issueToEmployee: '', employeeCode: '', employeeDepartment: '', designation: '' }));
//       return;
//     }
//     const emp = emps.find(e => String(e.id) === empId);
//     setSelEmp(emp);
//     const empDeptName = depts.find(d => d.id === emp?.department?.id)?.name || emp?.department?.name || emp?.departmentName || '';
//     const empFullName = `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim();
//     setForm(p => ({
//       ...p,
//       employeeId: emp?.id ?? null,
//       issueToEmployee: empFullName || emp?.name || emp?.fullName || '',
//       employeeCode: emp?.employeeId || emp?.employeeCode || emp?.code || '',
//       employeeDepartment: empDeptName,
//       designation: emp?.designation || '',
//     }));
//   };

//   // Copy number generation
//   const generateCopyNumber = (copyType: string, deptName: string) => {
//     const prefix = COPY_PREFIX[copyType] || 'CP';
//     const deptCode = (deptName || 'XX').replace(/\s+/g, '').substring(0, 3).toUpperCase();
//     const year = new Date().getFullYear().toString().slice(-2);
//     const seq = String(Math.floor(Math.random() * 900) + 100);
//     const num = `${prefix}-${deptCode}-${year}${seq}`;
//     setForm(p => ({ ...p, copyNumber: num }));
//   };

//   const onCopyTypeChange = (v: string) => {
//     setForm(p => ({ ...p, copyType: v }));
//     generateCopyNumber(v, form.department);
//   };

//   const submit = async () => {
//     if (!form.documentNumber) { alert('Please select a Document.'); return; }
//     if (!form.issueToEmployee) { alert('Please select an Employee.'); return; }
//     if (!form.issueDate) { alert('Issue Date is required.'); return; }
//     setSaving(true);
//     try {
//       await docIssueApi.create({
//         ...form,
//         certification: form.certificationId ? { id: form.certificationId } : null,
//         document: form.documentId ? { id: form.documentId } : null,
//         department: form.departmentId ? { id: form.departmentId } : null,
//         // backend field names differ from form display names:
//         issuedTo: form.issueToEmployee,
//         employeeIdRef: form.employeeId,
//         copyType: COPY_TYPE_ENUM[form.copyType] || form.copyType,
//         expectedReturnDate: form.returnDate || null,
//         employee: undefined,  // no ManyToOne Employee on IssueRegister
//       });
//       alert('Document issued successfully.');
//       onSaved();
//     } catch (e: unknown) {
//       alert(apiMsg(e, 'Save failed'));
//     } finally { setSaving(false); }
//   };

//   const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

//   return (
//     <div className="bg-white rounded-2xl shadow-xl border border-blue-100">
//       <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-4 rounded-t-2xl">
//         <h2 className="text-base font-bold text-white">New Document Issue</h2>
//         <p className="text-xs text-white/70 mt-0.5">Select Certification → Document → Employee → Generate Copy → Issue</p>
//       </div>

//       <div className="p-6 space-y-6">
//         {/* Section 1: Document Selection */}
//         <div>
//           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
//             <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>1</span>
//             Select Document
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div>
//               <label className={labelCls}>Certification Standard *</label>
//               <select
//                 value={selCert?.id || ''}
//                 onChange={e => onCertChange(e.target.value)}
//                 className={inputCls}
//               >
//                 <option value="">— Select Certification —</option>
//                 {certs.map((c: Certification) => (
//                   <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className={labelCls}>Certification Name</label>
//               <input readOnly value={form.certificationName} className={roInputCls} placeholder="Auto filled" />
//             </div>
//             <div>
//               <label className={labelCls}>Certificate Number</label>
//               <input readOnly value={form.certificationNumber} className={roInputCls} placeholder="Auto filled" />
//             </div>
//             <div>
//               <label className={labelCls}>Document Number *</label>
//               <select
//                 value={selDoc?.id || ''}
//                 onChange={e => onDocChange(e.target.value)}
//                 className={inputCls}
//                 disabled={!selCert}
//               >
//                 <option value="">— Select Document —</option>
//                 {docs.filter((d: Document) => d.status === 'APPROVED' || !d.status).map((d: Document) => (
//                   <option key={d.id} value={d.id}>{d.documentNumber || d.docNumber} — {d.documentName || d.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className={labelCls}>Document Name</label>
//               <input readOnly value={form.documentName} className={roInputCls} placeholder="Auto filled" />
//             </div>
//             <div>
//               <label className={labelCls}>Reference Number</label>
//               <input readOnly value={form.referenceNumber} className={roInputCls} placeholder="Auto filled" />
//             </div>
//             <div>
//               <label className={labelCls}>Revision Number</label>
//               <input readOnly value={form.revisionNumber} className={roInputCls} placeholder="Auto filled" />
//             </div>
//             <div>
//               <label className={labelCls}>Revision Date</label>
//               <input readOnly value={form.revisionDate} className={roInputCls} placeholder="Auto filled" />
//             </div>
//             <div>
//               <label className={labelCls}>Department</label>
//               <input readOnly value={form.department} className={roInputCls} placeholder="Auto filled" />
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-gray-100" />

//         {/* Section 2: Copy Type */}
//         <div>
//           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
//             <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>2</span>
//             Copy Type
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className={labelCls}>Copy Type *</label>
//               <select value={form.copyType} onChange={e => onCopyTypeChange(e.target.value)} className={inputCls}>
//                 {COPY_TYPES.map(ct => <option key={ct}>{ct}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className={labelCls}>Copy Number (Auto Generated)</label>
//               <div className="flex gap-2">
//                 <input readOnly value={form.copyNumber} className={`${roInputCls} flex-1`} placeholder="Select doc + copy type first" />
//                 <button
//                   type="button"
//                   onClick={() => generateCopyNumber(form.copyType, form.department)}
//                   className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs hover:bg-gray-50"
//                   title="Regenerate copy number"
//                 >
//                   <i className="fas fa-sync-alt" />
//                 </button>
//               </div>
//             </div>
//             <div className="flex items-end">
//               <div className="w-full p-3 rounded-lg text-xs bg-purple-50 border border-purple-100">
//                 <p className="font-semibold text-purple-700 mb-1">Copy Type Rules</p>
//                 {[
//                   ['Master Copy', 'Original approved — full control'],
//                   ['Controlled Copy', 'Auto revision update tracking'],
//                   ['Uncontrolled Copy', 'No revision update'],
//                   ['Reference Copy', 'Read only, no update'],
//                   ['Obsolete Copy', 'Archive only'],
//                 ].map(([t, d]) => (
//                   <div key={t} className={`flex gap-1 mt-0.5 ${form.copyType === t ? 'text-purple-800 font-semibold' : 'text-gray-500'}`}>
//                     <span>{form.copyType === t ? '▶' : '·'}</span>
//                     <span>{t}: {d}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-gray-100" />

//         {/* Section 3: Employee */}
//         <div>
//           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
//             <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>3</span>
//             Issue To Employee
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div>
//               <label className={labelCls}>Employee *</label>
//               <select
//                 value={selEmp?.id || ''}
//                 onChange={e => onEmpChange(e.target.value)}
//                 className={inputCls}
//               >
//                 <option value="">— Select Employee —</option>
//                 {emps.map((e: Employee) => {
//                   const n = `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || e.fullName || '—';
//                   return <option key={e.id} value={e.id}>{n}{e.employeeId ? ` (${e.employeeId})` : ''}</option>;
//                 })}
//               </select>
//             </div>
//             <div>
//               <label className={labelCls}>Employee Code</label>
//               <input readOnly value={form.employeeCode} className={roInputCls} placeholder="Auto filled" />
//             </div>
//             <div>
//               <label className={labelCls}>Employee Department</label>
//               <input readOnly value={form.employeeDepartment} className={roInputCls} placeholder="Auto filled" />
//             </div>
//             <div>
//               <label className={labelCls}>Designation</label>
//               <input readOnly value={form.designation} className={roInputCls} placeholder="Auto filled" />
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-gray-100" />

//         {/* Section 4: Issue Details */}
//         <div>
//           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
//             <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>4</span>
//             Issue Details
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div>
//               <label className={labelCls}>Issue Date *</label>
//               <input type="date" value={form.issueDate} onChange={f('issueDate')} className={inputCls} />
//             </div>
//             <div>
//               <label className={labelCls}>Expected Return Date</label>
//               <input type="date" value={form.returnDate} onChange={f('returnDate')} className={inputCls} />
//             </div>
//             <div>
//               <label className={labelCls}>Status</label>
//               <select value={form.status} onChange={f('status')} className={inputCls}>
//                 {ISSUE_STATUSES.map(s => <option key={s}>{s}</option>)}
//               </select>
//             </div>
//             <div className="md:col-span-2 lg:col-span-3">
//               <label className={labelCls}>Remarks</label>
//               <textarea value={form.remarks} onChange={f('remarks')} rows={2} placeholder="Any additional remarks..." className={`${inputCls} resize-none`} />
//             </div>
//           </div>
//         </div>

//         {/* Issue ID (auto) info bar */}
//         <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs">
//           <i className="fas fa-info-circle text-blue-500" />
//           <span className="text-blue-700">Issue ID, Copy Number, and Acknowledgement Status are automatically assigned by the system on submission.</span>
//         </div>
//       </div>

//       <div className="flex items-center justify-end gap-3 px-6 pb-6">
//         <button
//           onClick={() => {
//             setSelCert(null); setSelDoc(null); setSelEmp(null); setDocs([]);
//             setForm({
//               certificationName: '', certificationNumber: '', documentNumber: '', documentName: '',
//               referenceNumber: '', revisionNumber: '', revisionDate: '', department: '',
//               copyType: 'Controlled Copy', copyNumber: '', issueToEmployee: '', employeeCode: '',
//               employeeDepartment: '', designation: '', issueDate: new Date().toISOString().split('T')[0],
//               returnDate: '', acknowledgementStatus: 'PENDING', status: 'ISSUED', remarks: '',
//               certificationId: null, documentId: null, employeeId: null, departmentId: null,
//             });
//           }}
//           className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
//         >
//           Reset
//         </button>
//         <button
//           onClick={submit}
//           disabled={saving}
//           className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-60"
//           style={{ background: BRAND }}
//         >
//           {saving
//             ? <><i className="fas fa-spinner fa-spin" /> Issuing...</>
//             : <><i className="fas fa-paper-plane" /> Issue Document</>}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Issue List (View Register) ─────────────────────────────────────────────────
// function DocIssueList() {
//   const [rows,    setRows]    = useState<DocumentIssue[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search,  setSearch]  = useState('');
//   const [stFilter, setStFilter] = useState('');
//   const [ctFilter, setCtFilter] = useState('');
//   const [ackFilter, setAckFilter] = useState('');
//   const [editing, setEditing] = useState<DocumentIssue | null>(null);
//   const [editForm, setEditForm] = useState<Partial<DocumentIssue>>({});
//   const [saving, setSaving]   = useState(false);
//   const [deleteIssueId, setDeleteIssueId] = useState<number | null>(null);
//   const [confirmAckId, setConfirmAckId] = useState<number | null>(null);

//   const load = () => {
//     setLoading(true);
//     docIssueApi.getAll()
//       .then((d: unknown) => setRows(Array.isArray(d) ? d as DocumentIssue[] : []))
//       .catch(() => setRows([]))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => { load(); }, []);

//   const displayed = rows.filter(r => {
//     const q = search.toLowerCase();
//     const matchQ = !search || [rDocNum(r), rDocName(r), rIssuedTo(r), r.issueId, r.copyNumber]
//       .some(v => (v || '').toLowerCase().includes(q));
//     const ctDisplay = rCopyType(r); // normalize enum to display name for filter
//     return matchQ
//       && (!stFilter || r.status === stFilter)
//       && (!ctFilter || ctDisplay === ctFilter)
//       && (!ackFilter || (r.acknowledgementStatus || 'PENDING') === ackFilter);
//   });

//   const acknowledge = async (id: number) => {
//     try { await docIssueApi.acknowledge(id); setConfirmAckId(null); load(); }
//     catch { alert('Failed to acknowledge.'); }
//   };

//   const markReturn = async (id: number) => {
//     const returnDate = prompt('Enter return date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
//     if (!returnDate) return;
//     try { await docIssueApi.markReturn(id, returnDate); load(); }
//     catch { alert('Failed to record return.'); }
//   };

//   const del = async (id: number) => {
//     try { await docIssueApi.delete(id); setDeleteIssueId(null); load(); }
//     catch { alert('Delete failed.'); }
//   };

//   const openEdit = (r: DocumentIssue) => { setEditing(r); setEditForm({ ...r }); };

//   const saveEdit = async () => {
//     if (!editing) return;
//     setSaving(true);
//     try {
//       await docIssueApi.update(editing.id, editForm);
//       setEditing(null);
//       load();
//     } catch (e: unknown) { alert(apiMsg(e, 'Save failed')); }
//     finally { setSaving(false); }
//   };

//   const printRow = (r: DocumentIssue) => {
//     const w = window.open('', '_blank');
//     if (!w) return;
//     w.document.write(`
//       <html><head><title>Document Issue Certificate</title>
//       <style>
//         body{font-family:Arial,sans-serif;font-size:11px;margin:0;padding:24px;color:#222}
//         .header{background:#280882;color:white;padding:16px 20px;margin-bottom:20px;border-radius:8px}
//         h2{margin:0;font-size:18px}
//         .sub{opacity:0.8;font-size:11px;margin-top:4px}
//         table{width:100%;border-collapse:collapse;margin-bottom:16px}
//         td,th{border:1px solid #ddd;padding:7px 10px;text-align:left}
//         th{background:#f5f3ff;color:#280882;font-weight:600;font-size:10px;text-transform:uppercase;width:35%}
//         .badge{padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600;display:inline-block}
//         .section-title{color:#280882;font-weight:700;font-size:12px;margin:14px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
//         .footer{margin-top:30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
//         .sig-box{border-top:1px solid #999;padding-top:6px;font-size:10px;color:#666;text-align:center}
//         @media print{body{padding:16px}}
//       </style></head><body>
//       <div class="header">
//         <h2>DOCUMENT ISSUE CERTIFICATE</h2>
//         <div class="sub">Document Control System — ${r.issueId || `DI-${r.id}`}</div>
//       </div>
//       <p class="section-title">Document Information</p>
//       <table>
//         <tr><th>Certification</th><td>${(r.certification?.name || r.certificationName || '—')} (${(r.certification?.code || r.certificationNumber || '—')})</td></tr>
//         <tr><th>Document Number</th><td>${rDocNum(r)}</td></tr>
//         <tr><th>Document Name</th><td>${rDocName(r)}</td></tr>
//         <tr><th>Reference Number</th><td>${(r.document?.referenceNumber || r.referenceNumber || '—')}</td></tr>
//         <tr><th>Revision Number</th><td>${r.revisionNumber || '—'}</td></tr>
//         <tr><th>Revision Date</th><td>${(r.document?.revisionDate || r.revisionDate || '—')}</td></tr>
//         <tr><th>Department</th><td>${rDeptName(r)}</td></tr>
//       </table>
//       <p class="section-title">Issue Information</p>
//       <table>
//         <tr><th>Copy Type</th><td>${rCopyType(r)}</td><th>Copy Number</th><td>${r.copyNumber || '—'}</td></tr>
//         <tr><th>Issue Date</th><td>${r.issueDate || '—'}</td><th>Return Date</th><td>${r.returnDate || '—'}</td></tr>
//         <tr><th>Status</th><td>${r.status || '—'}</td><th>Acknowledgement</th><td>${r.acknowledgementStatus || 'PENDING'}</td></tr>
//       </table>
//       <p class="section-title">Employee Information</p>
//       <table>
//         <tr><th>Employee Name</th><td>${rIssuedTo(r)}</td></tr>
//         <tr><th>Employee Code</th><td>${r.employeeCode || '—'}</td></tr>
//         <tr><th>Department</th><td>${rDeptName(r)}</td></tr>
//         <tr><th>Designation</th><td>${r.designation || '—'}</td></tr>
//       </table>
//       ${r.remarks ? `<p class="section-title">Remarks</p><table><tr><th>Remarks</th><td>${r.remarks}</td></tr></table>` : ''}
//       <div class="footer">
//         <div class="sig-box">Issued By (Document Controller)</div>
//         <div class="sig-box">Employee Acknowledgement</div>
//         <div class="sig-box">MR / HOD</div>
//       </div>
//       <p style="font-size:10px;color:#999;margin-top:20px;text-align:center">Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
//       </body></html>
//     `);
//     w.document.close(); w.print();
//   };

//   const ef = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setEditForm(p => ({ ...p, [k]: e.target.value }));

//   return (
//     <div className="space-y-4">
//       {/* Toolbar */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3.5 flex flex-wrap gap-3 items-center">
//         <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-48">
//           <i className="fas fa-search text-gray-400 text-xs" />
//           <input className="border-0 outline-none flex-1 text-sm" placeholder="Search doc number, name, employee, copy no..." value={search} onChange={e => setSearch(e.target.value)} />
//         </div>
//         <select value={ctFilter} onChange={e => setCtFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
//           <option value="">All Copy Types</option>
//           {COPY_TYPES.map(c => <option key={c}>{c}</option>)}
//         </select>
//         <select value={stFilter} onChange={e => setStFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
//           <option value="">All Status</option>
//           {ISSUE_STATUSES.map(s => <option key={s}>{s}</option>)}
//         </select>
//         <select value={ackFilter} onChange={e => setAckFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
//           <option value="">All Ack Status</option>
//           {ACK_STATUSES.map(s => <option key={s}>{s}</option>)}
//         </select>
//         <button onClick={load} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"><i className="fas fa-sync-alt text-sm" /></button>
//         <span className="text-xs text-gray-400">{displayed.length} record(s)</span>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
//         {loading ? (
//           <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>
//         ) : displayed.length === 0 ? (
//           <div className="py-14 text-center text-gray-400">
//             <i className="fas fa-file-contract text-4xl mb-3 block opacity-20" />
//             No document issues found.
//           </div>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white text-xs uppercase">
//                 {['Issue ID', 'Document', 'Revision', 'Copy Type', 'Copy No.', 'Issued To', 'Dept', 'Issue Date', 'Return Date', 'Status', 'Ack.', 'Actions'].map(h => (
//                   <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {displayed.map((r: DocumentIssue) => (
//                 <tr key={r.id} className="hover:bg-blue-50/40 transition-colors group">
//                   <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{r.issueId || `DI-${r.id}`}</td>
//                   <td className="px-4 py-3">
//                     <p className="font-medium text-gray-800 text-xs">{rDocNum(r)}</p>
//                     <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{rDocName(r)}</p>
//                   </td>
//                   <td className="px-4 py-3 text-xs text-gray-500">{r.revisionNumber || '—'}</td>
//                   <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{rCopyType(r)}</td>
//                   <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{r.copyNumber || '—'}</td>
//                   <td className="px-4 py-3 text-xs font-medium text-gray-700">{rIssuedTo(r)}</td>
//                   <td className="px-4 py-3 text-xs text-gray-500">{rDeptName(r)}</td>
//                   <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{r.issueDate || '—'}</td>
//                   <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{r.returnDate || '—'}</td>
//                   <td className="px-4 py-3">
//                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ST_COLOR[r.status] || 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
//                   </td>
//                   <td className="px-4 py-3">
//                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ACK_COLOR[r.acknowledgementStatus || 'PENDING'] || 'bg-gray-100 text-gray-500'}`}>{r.acknowledgementStatus || 'PENDING'}</span>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex gap-1">
//                       <button onClick={() => printRow(r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-500" title="Print Certificate"><i className="fas fa-print text-xs" /></button>
//                       {(r.acknowledgementStatus || 'PENDING') === 'PENDING' && (
//                         <button onClick={() => setConfirmAckId(r.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Mark Acknowledged"><i className="fas fa-check text-xs" /></button>
//                       )}
//                       {r.status === 'ISSUED' && (
//                         <button onClick={() => markReturn(r.id)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600" title="Mark Returned"><i className="fas fa-undo text-xs" /></button>
//                       )}
//                       <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-purple-50 text-purple-600" title="Edit"><i className="fas fa-edit text-xs" /></button>
//                       <button onClick={() => setDeleteIssueId(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete"><i className="fas fa-trash text-xs" /></button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Acknowledge Confirmation */}
//       {confirmAckId !== null && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-3 bg-green-100 rounded-full"><i className="fas fa-check-circle text-green-600 text-2xl" /></div>
//               <div>
//                 <h3 className="font-bold text-gray-800">Mark as Acknowledged</h3>
//                 <p className="text-sm text-gray-500">This will record the employee's acknowledgement.</p>
//               </div>
//             </div>
//             <p className="text-gray-600 text-sm mb-5">Are you sure you want to mark this document as acknowledged by the employee?</p>
//             <div className="flex gap-3">
//               <button onClick={() => setConfirmAckId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
//               <button onClick={() => acknowledge(confirmAckId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
//                 <i className="fas fa-check text-sm" /> Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Issue Confirmation */}
//       {deleteIssueId !== null && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-3 bg-red-100 rounded-full"><i className="fas fa-exclamation-triangle text-red-600 text-2xl" /></div>
//               <div>
//                 <h3 className="font-bold text-gray-800">Delete Issue Record</h3>
//                 <p className="text-sm text-gray-500">This action cannot be undone.</p>
//               </div>
//             </div>
//             <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this document issue record?</p>
//             <div className="flex gap-3">
//               <button onClick={() => setDeleteIssueId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
//               <button onClick={() => del(deleteIssueId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
//                 <i className="fas fa-trash text-sm" /> Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {editing && (
//         <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: BRAND }}>
//               <h2 className="text-base font-semibold text-white">Edit Issue — {editing.issueId || `DI-${editing.id}`}</h2>
//               <button onClick={() => setEditing(null)} className="text-white/70 hover:text-white"><i className="fas fa-times" /></button>
//             </div>
//             <div className="p-5 grid grid-cols-2 gap-4">
//               <div>
//                 <label className={labelCls}>Status</label>
//                 <select value={editForm.status || 'ISSUED'} onChange={ef('status')} className={inputCls}>
//                   {ISSUE_STATUSES.map(s => <option key={s}>{s}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className={labelCls}>Acknowledgement Status</label>
//                 <select value={editForm.acknowledgementStatus || 'PENDING'} onChange={ef('acknowledgementStatus')} className={inputCls}>
//                   {ACK_STATUSES.map(s => <option key={s}>{s}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className={labelCls}>Issue Date</label>
//                 <input type="date" value={editForm.issueDate || ''} onChange={ef('issueDate')} className={inputCls} />
//               </div>
//               <div>
//                 <label className={labelCls}>Return Date</label>
//                 <input type="date" value={editForm.returnDate || ''} onChange={ef('returnDate')} className={inputCls} />
//               </div>
//               <div className="col-span-2">
//                 <label className={labelCls}>Remarks</label>
//                 <textarea value={editForm.remarks || ''} onChange={ef('remarks')} rows={2} className={`${inputCls} resize-none`} />
//               </div>
//             </div>
//             <div className="flex justify-end gap-3 px-5 pb-5">
//               <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
//               <button onClick={saveEdit} disabled={saving} className="px-5 py-2 rounded-lg text-white text-sm font-medium" style={{ background: BRAND }}>
//                 {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : 'Save'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Reports ───────────────────────────────────────────────────────────────────
// function DocIssueReport() {
//   const [loading, setLoading] = useState(false);

//   const downloadCSV = async () => {
//     setLoading(true);
//     try {
//       const data = (await docIssueApi.getAll() as unknown as DocumentIssue[]);
//       exportCSV('Document_Issue_Register.csv',
//         ['Issue ID', 'Cert Name', 'Cert No.', 'Doc Number', 'Doc Name', 'Ref No.', 'Rev No.', 'Revision Date', 'Department', 'Copy Type', 'Copy No.', 'Issued To', 'Emp Code', 'Emp Dept', 'Designation', 'Issue Date', 'Return Date', 'Ack Status', 'Status', 'Remarks'],
//         data.map(r => [
//           r.issueId || `DI-${r.id}`,
//           r.certification?.name || r.certificationName,
//           r.certification?.code || r.certificationNumber,
//           rDocNum(r), rDocName(r),
//           r.document?.referenceNumber || r.referenceNumber,
//           r.revisionNumber,
//           r.document?.revisionDate || r.revisionDate,
//           rDeptName(r), rCopyType(r), r.copyNumber, rIssuedTo(r),
//           r.employeeCode, r.employeeDepartment, r.designation,
//           r.issueDate, r.returnDate,
//           r.acknowledgementStatus || 'PENDING', r.status, r.remarks,
//         ])
//       );
//     } catch { alert('Failed to generate report.'); }
//     finally { setLoading(false); }
//   };

//   const downloadPDF = async () => {
//     setLoading(true);
//     try {
//       const data = (await docIssueApi.getAll() as unknown as DocumentIssue[]);
//       const w = window.open('', '_blank');
//       if (!w) return;
//       const stats = {
//         total: data.length,
//         issued: data.filter(r => r.status === 'ISSUED').length,
//         returned: data.filter(r => r.status === 'RETURNED').length,
//         overdue: data.filter(r => r.status === 'OVERDUE').length,
//         pendingAck: data.filter(r => !r.acknowledgementStatus || r.acknowledgementStatus === 'PENDING').length,
//       };
//       w.document.write(`
//         <html><head><title>Document Issue Register</title>
//         <style>
//           body{font-family:Arial,sans-serif;font-size:10px;margin:0;padding:20px;color:#222}
//           h1{color:#280882;font-size:16px;margin-bottom:4px}
//           .meta{color:#888;font-size:10px;margin-bottom:16px}
//           .cards{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
//           .card{background:#f5f3ff;border:1px solid #e0d9ff;border-radius:8px;padding:10px;text-align:center}
//           .card-val{font-size:20px;font-weight:bold;color:#280882}
//           .card-lbl{font-size:9px;color:#666;margin-top:2px}
//           table{width:100%;border-collapse:collapse;font-size:9px}
//           thead tr{background:#280882;color:white}
//           th{padding:6px 8px;text-align:left;font-weight:600}
//           td{border:1px solid #e5e7eb;padding:5px 8px}
//           tr:nth-child(even) td{background:#f9f7ff}
//           .badge{padding:2px 6px;border-radius:10px;font-weight:600;font-size:8px}
//           .issued{background:#dbeafe;color:#1d4ed8}
//           .returned{background:#d1fae5;color:#065f46}
//           .overdue{background:#fee2e2;color:#991b1b}
//           .cancelled{background:#f3f4f6;color:#374151}
//           .pending{background:#fef3c7;color:#92400e}
//           .acked{background:#d1fae5;color:#065f46}
//           @media print{body{padding:8px}}
//         </style></head><body>
//         <h1>Document Issue Register</h1>
//         <div class="meta">Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} | Total Records: ${data.length}</div>
//         <div class="cards">
//           <div class="card"><div class="card-val">${stats.total}</div><div class="card-lbl">Total Issues</div></div>
//           <div class="card"><div class="card-val" style="color:#3b82f6">${stats.issued}</div><div class="card-lbl">Issued</div></div>
//           <div class="card"><div class="card-val" style="color:#10b981">${stats.returned}</div><div class="card-lbl">Returned</div></div>
//           <div class="card"><div class="card-val" style="color:#ef4444">${stats.overdue}</div><div class="card-lbl">Overdue</div></div>
//           <div class="card"><div class="card-val" style="color:#f59e0b">${stats.pendingAck}</div><div class="card-lbl">Pending Ack.</div></div>
//         </div>
//         <table>
//           <thead><tr>
//             <th>Issue ID</th><th>Document No.</th><th>Doc Name</th><th>Rev</th>
//             <th>Copy Type</th><th>Copy No.</th><th>Issued To</th><th>Dept</th>
//             <th>Issue Date</th><th>Return Date</th><th>Status</th><th>Ack.</th>
//           </tr></thead>
//           <tbody>
//             ${data.map(r => {
//               const stMap: Record<string, string> = { ISSUED: 'issued', RETURNED: 'returned', OVERDUE: 'overdue', CANCELLED: 'cancelled' };
//               const stClass = stMap[r.status] || '';
//               const ackClass = (r.acknowledgementStatus || 'PENDING') === 'PENDING' ? 'pending' : 'acked';
//               return `<tr>
//                 <td><b>${r.issueId || `DI-${r.id}`}</b></td>
//                 <td>${rDocNum(r)}</td>
//                 <td>${rDocName(r)}</td>
//                 <td>${r.revisionNumber || '—'}</td>
//                 <td>${rCopyType(r)}</td>
//                 <td><b>${r.copyNumber || '—'}</b></td>
//                 <td>${rIssuedTo(r)}</td>
//                 <td>${rDeptName(r)}</td>
//                 <td>${r.issueDate || '—'}</td>
//                 <td>${r.returnDate || '—'}</td>
//                 <td><span class="badge ${stClass}">${r.status}</span></td>
//                 <td><span class="badge ${ackClass}">${r.acknowledgementStatus || 'PENDING'}</span></td>
//               </tr>`;
//             }).join('')}
//           </tbody>
//         </table>
//         </body></html>
//       `);
//       w.document.close(); w.print();
//     } catch { alert('Failed to generate PDF.'); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Report cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {[
//           {
//             title: 'Document Issue Register',
//             desc: 'Full register with all issues, status, copy details',
//             icon: 'fas fa-file-alt',
//             color: '#280882',
//           },
//           {
//             title: 'Controlled Copy Report',
//             desc: 'All controlled copies, who holds them, pending returns',
//             icon: 'fas fa-copy',
//             color: '#3b82f6',
//           },
//           {
//             title: 'Acknowledgement Report',
//             desc: 'Pending vs acknowledged documents by employee',
//             icon: 'fas fa-check-double',
//             color: '#10b981',
//           },
//         ].map(r => (
//           <div key={r.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//             <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${r.color}18` }}>
//               <i className={`${r.icon}`} style={{ color: r.color }} />
//             </div>
//             <h3 className="text-sm font-semibold text-gray-800">{r.title}</h3>
//             <p className="text-xs text-gray-500 mt-1 mb-4">{r.desc}</p>
//             <div className="flex gap-2">
//               <button
//                 onClick={downloadCSV}
//                 disabled={loading}
//                 className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-green-300 text-green-700 text-xs font-medium hover:bg-green-50 disabled:opacity-50"
//               >
//                 <i className="fas fa-file-excel" /> Excel
//               </button>
//               <button
//                 onClick={downloadPDF}
//                 disabled={loading}
//                 className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-red-300 text-red-700 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
//               >
//                 <i className="fas fa-file-pdf" /> PDF
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Legend */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//         <h3 className="text-sm font-semibold text-gray-700 mb-3">Copy Type Control Reference</h3>
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
//                 {['Copy Type', 'Purpose', 'Revision Control', 'Who Holds'].map(h => (
//                   <th key={h} className="px-4 py-3 text-left">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 text-xs">
//               {[
//                 ['Master Copy', 'Original Approved Copy', 'Full Control — System Maintains', 'Document Controller / MR'],
//                 ['Controlled Copy', 'Official Department Use', 'Auto Revision Update', 'Department HOD / Assigned Employee'],
//                 ['Uncontrolled Copy', 'Temporary / Training Use', 'No Revision Update', 'Temporary Holder'],
//                 ['Reference Copy', 'Read-Only Reference', 'No Update', 'Reference Library'],
//                 ['Obsolete Copy', 'Superseded Revision', 'Archive Only', 'Document Controller (Archive)'],
//               ].map(([type, purpose, control, holder]) => (
//                 <tr key={type} className="hover:bg-gray-50">
//                   <td className="px-4 py-2.5 font-semibold text-gray-700">{type}</td>
//                   <td className="px-4 py-2.5 text-gray-600">{purpose}</td>
//                   <td className="px-4 py-2.5 text-gray-500">{control}</td>
//                   <td className="px-4 py-2.5 text-gray-500">{holder}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {loading && (
//         <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl px-6 py-4 shadow-xl flex items-center gap-3">
//             <i className="fas fa-spinner fa-spin text-lg" style={{ color: BRAND }} />
//             <span className="text-sm font-medium text-gray-700">Generating report...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from 'react';
import { certApi, docApi, employeeApi, deptApi, docIssueApi } from '../../api/qms.api';
import { exportCSV } from '../master-data/chartUtils';
import type { DocumentIssue, Certification, Document, Employee, Department } from '../qms/types';
import { apiMsg } from '../qms/types';
import {
  FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiRefreshCw,
  FiChevronDown, FiChevronUp, FiDownload, FiPrinter,
  FiAlertTriangle, FiCheckCircle, FiFileText, FiBarChart2,
  FiClock, FiAlertCircle, FiEye, FiGrid, FiList, FiFilter,
  FiHome, FiBookOpen, FiPieChart, FiTrendingUp, FiAward,
  FiSettings, FiUser, FiCalendar, FiTag, FiClipboard,
  FiLayers, FiStar, FiBell, FiHeart, FiCopy, FiSend,
  FiCheck, FiArrowRight, FiArrowLeft, FiRefreshCcw,
  FiExternalLink, FiPackage, FiUsers, FiBriefcase,
  FiArchive
} from 'react-icons/fi';

const BRAND = '#280882';

const COPY_TYPES = ['Master Copy', 'Controlled Copy', 'Uncontrolled Copy', 'Reference Copy', 'Obsolete Copy'];
const ISSUE_STATUSES = ['ISSUED', 'RETURNED', 'OVERDUE', 'CANCELLED'];
const ACK_STATUSES = ['PENDING', 'ACKNOWLEDGED'];

const COPY_PREFIX: Record<string, string> = {
  'Master Copy': 'MC',
  'Controlled Copy': 'CC',
  'Uncontrolled Copy': 'UC',
  'Reference Copy': 'RC',
  'Obsolete Copy': 'OC',
};

const COPY_TYPE_ENUM: Record<string, string> = {
  'Master Copy': 'MASTER_COPY',
  'Controlled Copy': 'CONTROLLED_COPY',
  'Uncontrolled Copy': 'UNCONTROLLED_COPY',
  'Reference Copy': 'REFERENCE_COPY',
  'Obsolete Copy': 'OBSOLETE_COPY',
};
const COPY_TYPE_DISPLAY: Record<string, string> = {
  MASTER_COPY: 'Master Copy',
  CONTROLLED_COPY: 'Controlled Copy',
  UNCONTROLLED_COPY: 'Uncontrolled Copy',
  REFERENCE_COPY: 'Reference Copy',
  OBSOLETE_COPY: 'Obsolete Copy',
};

const rDocNum  = (r: any) => r.document?.documentNumber || r.documentNumber || '—';
const rDocName = (r: any) => r.document?.documentName  || r.document?.name || r.documentName || '';
const rIssuedTo = (r: any) => r.issuedTo || r.issueToEmployee || '—';
const rDeptName = (r: any) => (typeof r.department === 'object' ? r.department?.name : r.department) || r.employeeDepartment || '—';
const rCopyType = (r: any) => COPY_TYPE_DISPLAY[r.copyType] || r.copyType || '—';

const ST_COLOR: Record<string, { bg: string, text: string, border: string }> = {
  ISSUED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  RETURNED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  OVERDUE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

const ACK_COLOR: Record<string, { bg: string, text: string, border: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ACKNOWLEDGED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const COPY_TYPE_COLORS: Record<string, string> = {
  'Master Copy': 'from-purple-600 to-indigo-600',
  'Controlled Copy': 'from-blue-600 to-cyan-600',
  'Uncontrolled Copy': 'from-amber-500 to-orange-500',
  'Reference Copy': 'from-emerald-500 to-teal-500',
  'Obsolete Copy': 'from-gray-500 to-slate-500',
};

const COPY_TYPE_ICONS: Record<string, any> = {
  'Master Copy': FiStar,
  'Controlled Copy': FiCopy,
  'Uncontrolled Copy': FiPackage,
  'Reference Copy': FiBookOpen,
  'Obsolete Copy': FiArchive,
};

const inputCls = 'w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm';
const roInputCls = 'w-full border-2 border-gray-100 bg-gray-50/70 rounded-xl px-4 py-3 text-sm text-gray-600 cursor-default backdrop-blur-sm';
const labelCls = 'block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide';

// ──────────────────────────────────────────────────────────────────────────────
export default function DocumentIssueModule() {
  const [tab, setTab] = useState<'dashboard' | 'new' | 'view' | 'report'>('dashboard');

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: FiPieChart, color: 'from-blue-600 to-indigo-600' },
    { id: 'new', label: 'New Issue', icon: FiPlus, color: 'from-emerald-600 to-teal-600' },
    { id: 'view', label: 'View Register', icon: FiGrid, color: 'from-purple-600 to-pink-600' },
    { id: 'report', label: 'Reports', icon: FiBarChart2, color: 'from-rose-600 to-orange-600' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl shadow-xl">
                  <FiClipboard className="text-white text-3xl" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Document Issue Register
                </h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Issue, track, and acknowledge controlled document copies
                </p>
              </div>
            </div>
            <button 
              onClick={() => setTab('new')} 
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
            >
              <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
              <span>New Issue</span>
            </button>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`
                    group flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? `bg-gradient-to-r ${t.color} text-white shadow-lg shadow-purple-500/20` 
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/80'
                    }
                  `}
                >
                  <Icon className={`text-base ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {t.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/50 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fadeIn">
          {tab === 'dashboard' && <DocIssueDashboard onNew={() => setTab('new')} />}
          {tab === 'new' && <NewDocIssueForm onSaved={() => setTab('view')} />}
          {tab === 'view' && <DocIssueList />}
          {tab === 'report' && <DocIssueReport />}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DocIssueDashboard({ onNew }: { onNew: () => void }) {
  const [issues, setIssues] = useState<DocumentIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    docIssueApi.getAll()
      .then((d: unknown) => setIssues(Array.isArray(d) ? d as DocumentIssue[] : []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: issues.length,
    issued: issues.filter(i => i.status === 'ISSUED').length,
    returned: issues.filter(i => i.status === 'RETURNED').length,
    overdue: issues.filter(i => i.status === 'OVERDUE').length,
    pendingAck: issues.filter(i => i.acknowledgementStatus === 'PENDING').length,
    masterCopies: issues.filter(i => i.copyType === 'Master Copy' || i.copyType === 'MASTER_COPY').length,
  };

  const recentIssues = [...issues].sort((a, b) => b.id - a.id).slice(0, 8);

  const copyTypeDist = COPY_TYPES.map(ct => ({
    label: ct,
    count: issues.filter(i => i.copyType === ct).length,
    color: COPY_TYPE_COLORS[ct] || 'from-gray-500 to-gray-600',
    icon: COPY_TYPE_ICONS[ct] || FiFileText,
  }));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards with Enhanced Design */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Issues', value: stats.total, icon: FiFileText, color: 'from-slate-600 to-slate-700', gradient: 'from-slate-500 to-slate-600' },
          { label: 'Issued', value: stats.issued, icon: FiSend, color: 'from-blue-600 to-blue-700', gradient: 'from-blue-500 to-cyan-600' },
          { label: 'Returned', value: stats.returned, icon: FiCheckCircle, color: 'from-emerald-600 to-emerald-700', gradient: 'from-emerald-500 to-teal-600' },
          { label: 'Overdue', value: stats.overdue, icon: FiAlertTriangle, color: 'from-red-600 to-red-700', gradient: 'from-red-500 to-rose-600' },
          { label: 'Pending Ack.', value: stats.pendingAck, icon: FiClock, color: 'from-amber-600 to-amber-700', gradient: 'from-amber-500 to-orange-600' },
          { label: 'Master Copies', value: stats.masterCopies, icon: FiStar, color: 'from-purple-600 to-indigo-700', gradient: 'from-purple-500 to-indigo-600' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="group bg-white rounded-2xl shadow-xl border border-slate-100 p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white text-lg" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Copy Type Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FiLayers className="text-purple-600" />
              Copy Type Distribution
            </h3>
            <span className="text-xs text-slate-400">{stats.total} total</span>
          </div>
          {issues.length === 0 ? (
            <div className="text-center py-8">
              <FiFileText className="text-4xl text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No issues recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {copyTypeDist.map((item, i) => {
                const pct = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                const Icon = item.icon;
                return (
                  <div key={i} className="animate-slideIn" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className={`bg-gradient-to-r ${item.color} p-1.5 rounded-lg`}>
                        <Icon className="text-white text-xs" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 flex-1">{item.label}</span>
                      <span className="text-sm font-bold text-slate-800">{item.count}</span>
                      <span className="text-xs text-slate-400 w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FiPieChart className="text-purple-600" />
              Status Overview
            </h3>
            <button 
              onClick={onNew}
              className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <FiPlus className="text-xs" /> New Issue
            </button>
          </div>
          {issues.length === 0 ? (
            <div className="text-center py-8">
              <FiBarChart2 className="text-4xl text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Issued', count: stats.issued, color: 'from-blue-500 to-cyan-500', icon: FiSend },
                { label: 'Returned', count: stats.returned, color: 'from-emerald-500 to-teal-500', icon: FiCheckCircle },
                { label: 'Overdue', count: stats.overdue, color: 'from-red-500 to-rose-500', icon: FiAlertCircle },
                { label: 'Cancelled', count: issues.filter(i => i.status === 'CANCELLED').length, color: 'from-slate-500 to-gray-500', icon: FiX },
              ].map((item, idx) => {
                const Icon = item.icon;
                const pct = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                return (
                  <div key={idx} className="bg-slate-50/50 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`bg-gradient-to-r ${item.color} p-1.5 rounded-lg`}>
                        <Icon className="text-white text-xs" />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{item.label}</span>
                      <span className="ml-auto text-lg font-bold text-slate-800">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{pct.toFixed(1)}% of total</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FiClock className="text-purple-600" />
            Recent Document Issues
          </h3>
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all"
          >
            <FiPlus className="text-xs" /> New Issue
          </button>
        </div>
        {recentIssues.length === 0 ? (
          <div className="py-12 text-center">
            <FiFileText className="text-5xl text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No document issues recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                  {['Issue ID', 'Document', 'Copy Type', 'Copy No.', 'Issued To', 'Issue Date', 'Status', 'Ack.'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentIssues.map((r: DocumentIssue) => {
                  const st = ST_COLOR[r.status] || ST_COLOR.ISSUED;
                  const ack = ACK_COLOR[r.acknowledgementStatus || 'PENDING'] || ACK_COLOR.PENDING;
                  return (
                    <tr key={r.id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-purple-700">{r.issueId || `DI-${r.id}`}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 text-xs">{rDocNum(r)}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{rDocName(r)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-medium">
                          <FiCopy className="text-[8px]" />
                          {rCopyType(r)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{r.copyNumber || '—'}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-slate-700">{rIssuedTo(r)}</p>
                        <p className="text-[10px] text-slate-400">{rDeptName(r)}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{r.issueDate || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${ack.bg} ${ack.text} border ${ack.border}`}>
                          {r.acknowledgementStatus || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── New Document Issue Form ────────────────────────────────────────────────────
function NewDocIssueForm({ onSaved }: { onSaved: () => void }) {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [emps, setEmps] = useState<Employee[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [selCert, setSelCert] = useState<Certification | null>(null);
  const [selDoc, setSelDoc] = useState<Document | null>(null);
  const [selEmp, setSelEmp] = useState<Employee | null>(null);

  const [form, setForm] = useState({
    certificationName: '', certificationNumber: '',
    documentNumber: '', documentName: '', referenceNumber: '',
    revisionNumber: '', revisionDate: '', department: '',
    copyType: 'Controlled Copy', copyNumber: '',
    issueToEmployee: '', employeeCode: '', employeeDepartment: '', designation: '',
    issueDate: new Date().toISOString().split('T')[0],
    returnDate: '', acknowledgementStatus: 'PENDING',
    status: 'ISSUED', remarks: '',
    certificationId: null as number | null, documentId: null as number | null,
    employeeId: null as number | null, departmentId: null as number | null,
  });

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
    employeeApi.getAll().then((d: unknown) => setEmps(Array.isArray(d) ? d as Employee[] : [])).catch(() => {});
    deptApi.getAll().then((d: unknown) => setDepts(Array.isArray(d) ? d as Department[] : [])).catch(() => {});
  }, []);

  const onCertChange = async (certId: string) => {
    if (!certId) {
      setSelCert(null); setDocs([]);
      setForm(p => ({ ...p, certificationId: null, certificationName: '', certificationNumber: '', documentNumber: '', documentName: '', referenceNumber: '', revisionNumber: '', revisionDate: '', department: '', documentId: null, departmentId: null }));
      return;
    }
    const cert = certs.find(c => String(c.id) === certId);
    setSelCert(cert);
    setForm(p => ({
      ...p,
      certificationId: cert?.id ?? null,
      certificationName: cert?.name || '',
      certificationNumber: cert?.code || '',
    }));
    try {
      const d = await docApi.getByCert(Number(certId));
      setDocs(Array.isArray(d) ? d as Document[] : []);
    } catch { setDocs([]); }
    setSelDoc(null);
    setForm(p => ({ ...p, documentNumber: '', documentName: '', referenceNumber: '', revisionNumber: '', revisionDate: '', department: '', documentId: null }));
    setCurrentStep(1);
  };

  const onDocChange = (docId: string) => {
    if (!docId) {
      setSelDoc(null);
      setForm(p => ({ ...p, documentNumber: '', documentName: '', referenceNumber: '', revisionNumber: '', revisionDate: '', department: '', documentId: null, departmentId: null }));
      return;
    }
    const doc = docs.find(d => String(d.id) === docId);
    setSelDoc(doc);
    const deptId = doc?.department?.id ?? null;
    const deptName = depts.find(d => d.id === deptId)?.name || doc?.department?.name || doc?.departmentName || '';
    setForm(p => ({
      ...p,
      documentId: doc?.id ?? null,
      documentNumber: doc?.documentNumber || doc?.docNumber || '',
      documentName: doc?.documentName || doc?.name || '',
      referenceNumber: doc?.referenceNumber || doc?.refNumber || '',
      revisionNumber: doc?.revisionNumber || doc?.revision || '',
      revisionDate: doc?.revisionDate || '',
      department: deptName,
      departmentId: deptId,
    }));
    generateCopyNumber(form.copyType, deptName);
    setCurrentStep(2);
  };

  const onEmpChange = (empId: string) => {
    if (!empId) {
      setSelEmp(null);
      setForm(p => ({ ...p, employeeId: null, issueToEmployee: '', employeeCode: '', employeeDepartment: '', designation: '' }));
      return;
    }
    const emp = emps.find(e => String(e.id) === empId);
    setSelEmp(emp);
    const empDeptName = depts.find(d => d.id === emp?.department?.id)?.name || emp?.department?.name || emp?.departmentName || '';
    const empFullName = `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim();
    setForm(p => ({
      ...p,
      employeeId: emp?.id ?? null,
      issueToEmployee: empFullName || emp?.name || emp?.fullName || '',
      employeeCode: emp?.employeeId || emp?.employeeCode || emp?.code || '',
      employeeDepartment: empDeptName,
      designation: emp?.designation || '',
    }));
    setCurrentStep(3);
  };

  const generateCopyNumber = (copyType: string, deptName: string) => {
    const prefix = COPY_PREFIX[copyType] || 'CP';
    const deptCode = (deptName || 'XX').replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = String(Math.floor(Math.random() * 900) + 100);
    const num = `${prefix}-${deptCode}-${year}${seq}`;
    setForm(p => ({ ...p, copyNumber: num }));
  };

  const onCopyTypeChange = (v: string) => {
    setForm(p => ({ ...p, copyType: v }));
    generateCopyNumber(v, form.department);
  };

  const submit = async () => {
    if (!form.documentNumber) { alert('Please select a Document.'); return; }
    if (!form.issueToEmployee) { alert('Please select an Employee.'); return; }
    if (!form.issueDate) { alert('Issue Date is required.'); return; }
    setSaving(true);
    try {
      await docIssueApi.create({
        ...form,
        certification: form.certificationId ? { id: form.certificationId } : null,
        document: form.documentId ? { id: form.documentId } : null,
        department: form.departmentId ? { id: form.departmentId } : null,
        issuedTo: form.issueToEmployee,
        employeeIdRef: form.employeeId,
        copyType: COPY_TYPE_ENUM[form.copyType] || form.copyType,
        expectedReturnDate: form.returnDate || null,
        employee: undefined,
      });
      alert('✅ Document issued successfully!');
      onSaved();
    } catch (e: unknown) {
      alert(apiMsg(e, 'Save failed'));
    } finally { setSaving(false); }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const steps = [
    { label: 'Select Certification', icon: FiAward, color: 'from-purple-500 to-indigo-500' },
    { label: 'Select Document', icon: FiFileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'Copy Type', icon: FiCopy, color: 'from-amber-500 to-orange-500' },
    { label: 'Select Employee', icon: FiUser, color: 'from-emerald-500 to-teal-500' },
    { label: 'Issue Details', icon: FiSend, color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
      {/* Progress Steps */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={idx} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                    ${isActive ? 'bg-white text-purple-600 scale-110 shadow-lg' : 
                      isCompleted ? 'bg-emerald-400 text-white' : 'bg-white/20 text-white/60'}
                  `}>
                    {isCompleted ? <FiCheck className="text-lg" /> : <Icon className="text-lg" />}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                      Step {idx + 1}
                    </p>
                    <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-400' : 'bg-white/20'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Certification */}
        {currentStep === 0 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Select Certification Standard</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>Certification Standard *</label>
                <select
                  value={selCert?.id || ''}
                  onChange={e => onCertChange(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select Certification —</option>
                  {certs.map((c: Certification) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Certificate Number</label>
                <input readOnly value={form.certificationNumber} className={roInputCls} placeholder="Auto filled" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Document */}
        {currentStep === 1 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Select Document</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Document Number *</label>
                <select
                  value={selDoc?.id || ''}
                  onChange={e => onDocChange(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select Document —</option>
                  {docs.filter((d: Document) => d.status === 'APPROVED' || !d.status).map((d: Document) => (
                    <option key={d.id} value={d.id}>{d.documentNumber || d.docNumber} — {d.documentName || d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Document Name</label>
                <input readOnly value={form.documentName} className={roInputCls} placeholder="Auto filled" />
              </div>
              <div>
                <label className={labelCls}>Reference Number</label>
                <input readOnly value={form.referenceNumber} className={roInputCls} placeholder="Auto filled" />
              </div>
              <div>
                <label className={labelCls}>Revision</label>
                <input readOnly value={form.revisionNumber} className={roInputCls} placeholder="Auto filled" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Copy Type */}
        {currentStep === 2 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Copy Type & Number</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Copy Type *</label>
                <select value={form.copyType} onChange={e => onCopyTypeChange(e.target.value)} className={inputCls}>
                  {COPY_TYPES.map(ct => <option key={ct}>{ct}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Copy Number</label>
                <div className="flex gap-2">
                  <input readOnly value={form.copyNumber} className={`${roInputCls} flex-1 font-mono`} placeholder="Auto generated" />
                  <button
                    type="button"
                    onClick={() => generateCopyNumber(form.copyType, form.department)}
                    className="px-3 py-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Regenerate"
                  >
                    <FiRefreshCw className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              {COPY_TYPES.map(ct => {
                const Icon = COPY_TYPE_ICONS[ct] || FiFileText;
                const isSelected = form.copyType === ct;
                return (
                  <button
                    key={ct}
                    onClick={() => onCopyTypeChange(ct)}
                    className={`p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}
                  >
                    <Icon className={`text-lg mx-auto mb-1 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                    <p className={`text-[10px] font-medium text-center ${isSelected ? 'text-purple-700' : 'text-slate-600'}`}>{ct}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Employee */}
        {currentStep === 3 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Select Employee</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Employee *</label>
                <select
                  value={selEmp?.id || ''}
                  onChange={e => onEmpChange(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select Employee —</option>
                  {emps.map((e: Employee) => {
                    const n = `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || e.fullName || '—';
                    return <option key={e.id} value={e.id}>{n}{e.employeeId ? ` (${e.employeeId})` : ''}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className={labelCls}>Employee Code</label>
                <input readOnly value={form.employeeCode} className={roInputCls} placeholder="Auto filled" />
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <input readOnly value={form.employeeDepartment} className={roInputCls} placeholder="Auto filled" />
              </div>
              <div>
                <label className={labelCls}>Designation</label>
                <input readOnly value={form.designation} className={roInputCls} placeholder="Auto filled" />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Issue Details */}
        {currentStep === 4 && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Issue Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Issue Date *</label>
                <input type="date" value={form.issueDate} onChange={f('issueDate')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Expected Return Date</label>
                <input type="date" value={form.returnDate} onChange={f('returnDate')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={f('status')} className={inputCls}>
                  {ISSUE_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className={labelCls}>Remarks</label>
                <textarea value={form.remarks} onChange={f('remarks')} rows={3} placeholder="Any additional remarks..." className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiArrowLeft className="text-sm" /> Previous
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelCert(null); setSelDoc(null); setSelEmp(null); setDocs([]);
                setForm({
                  certificationName: '', certificationNumber: '', documentNumber: '', documentName: '',
                  referenceNumber: '', revisionNumber: '', revisionDate: '', department: '',
                  copyType: 'Controlled Copy', copyNumber: '', issueToEmployee: '', employeeCode: '',
                  employeeDepartment: '', designation: '', issueDate: new Date().toISOString().split('T')[0],
                  returnDate: '', acknowledgementStatus: 'PENDING', status: 'ISSUED', remarks: '',
                  certificationId: null, documentId: null, employeeId: null, departmentId: null,
                });
                setCurrentStep(0);
              }}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
            >
              Reset All
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Next <FiArrowRight className="text-sm" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? (
                  <><FiRefreshCw className="animate-spin text-sm" /> Issuing...</>
                ) : (
                  <><FiSend className="text-sm" /> Issue Document</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Issue List (View Register) ─────────────────────────────────────────────────
function DocIssueList() {
  const [rows, setRows] = useState<DocumentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stFilter, setStFilter] = useState('');
  const [ctFilter, setCtFilter] = useState('');
  const [ackFilter, setAckFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editing, setEditing] = useState<DocumentIssue | null>(null);
  const [editForm, setEditForm] = useState<Partial<DocumentIssue>>({});
  const [saving, setSaving] = useState(false);
  const [deleteIssueId, setDeleteIssueId] = useState<number | null>(null);
  const [confirmAckId, setConfirmAckId] = useState<number | null>(null);
  const [viewingIssue, setViewingIssue] = useState<DocumentIssue | null>(null);

  const load = () => {
    setLoading(true);
    docIssueApi.getAll()
      .then((d: unknown) => setRows(Array.isArray(d) ? d as DocumentIssue[] : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const displayed = rows.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !search || [rDocNum(r), rDocName(r), rIssuedTo(r), r.issueId, r.copyNumber]
      .some(v => (v || '').toLowerCase().includes(q));
    const ctDisplay = rCopyType(r);
    return matchQ
      && (!stFilter || r.status === stFilter)
      && (!ctFilter || ctDisplay === ctFilter)
      && (!ackFilter || (r.acknowledgementStatus || 'PENDING') === ackFilter);
  });

  const acknowledge = async (id: number) => {
    try { await docIssueApi.acknowledge(id); setConfirmAckId(null); load(); }
    catch { alert('Failed to acknowledge.'); }
  };

  const markReturn = async (id: number) => {
    const returnDate = prompt('Enter return date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!returnDate) return;
    try { await docIssueApi.markReturn(id, returnDate); load(); }
    catch { alert('Failed to record return.'); }
  };

  const del = async (id: number) => {
    try { await docIssueApi.delete(id); setDeleteIssueId(null); load(); }
    catch { alert('Delete failed.'); }
  };

  const openEdit = (r: DocumentIssue) => { setEditing(r); setEditForm({ ...r }); };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await docIssueApi.update(editing.id, editForm);
      setEditing(null);
      load();
    } catch (e: unknown) { alert(apiMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const printRow = (r: DocumentIssue) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Document Issue Certificate</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;margin:0;padding:24px;background:#f8fafc}
        .container{max-width:800px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}
        .header{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;padding:20px 24px;border-radius:12px;margin-bottom:24px}
        h2{margin:0;font-size:18px}
        .sub{opacity:0.8;font-size:11px;margin-top:4px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
        .field{background:#f8fafc;padding:10px 14px;border-radius:8px}
        .field-label{font-size:9px;color:#64748b;text-transform:uppercase;font-weight:600}
        .field-value{font-size:12px;font-weight:600;color:#0f172a;margin-top:2px}
        .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:9px;font-weight:600}
        .footer{margin-top:24px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;border-top:1px solid #e2e8f0;padding-top:16px}
        .sig-box{text-align:center;font-size:9px;color:#64748b}
        .sig-box .line{border-top:1px solid #94a3b8;padding-top:6px;margin-top:6px}
        @media print{body{padding:16px}.container{box-shadow:none}}
      </style></head><body>
      <div class="container">
        <div class="header">
          <h2>📄 Document Issue Certificate</h2>
          <div class="sub">${r.issueId || `DI-${r.id}`} · ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</div>
        </div>
        <div class="grid">
          <div class="field"><div class="field-label">Document Number</div><div class="field-value">${rDocNum(r)}</div></div>
          <div class="field"><div class="field-label">Document Name</div><div class="field-value">${rDocName(r)}</div></div>
          <div class="field"><div class="field-label">Revision</div><div class="field-value">${r.revisionNumber || '—'}</div></div>
          <div class="field"><div class="field-label">Copy Type</div><div class="field-value">${rCopyType(r)}</div></div>
          <div class="field"><div class="field-label">Copy Number</div><div class="field-value">${r.copyNumber || '—'}</div></div>
          <div class="field"><div class="field-label">Status</div><div class="field-value"><span class="badge" style="background:${r.status==='ISSUED'?'#dbeafe':r.status==='RETURNED'?'#d1fae5':r.status==='OVERDUE'?'#fee2e2':'#f3f4f6'};color:${r.status==='ISSUED'?'#1d4ed8':r.status==='RETURNED'?'#065f46':r.status==='OVERDUE'?'#991b1b':'#374151'}">${r.status}</span></div></div>
          <div class="field"><div class="field-label">Issued To</div><div class="field-value">${rIssuedTo(r)}</div></div>
          <div class="field"><div class="field-label">Department</div><div class="field-value">${rDeptName(r)}</div></div>
          <div class="field"><div class="field-label">Issue Date</div><div class="field-value">${r.issueDate || '—'}</div></div>
          <div class="field"><div class="field-label">Return Date</div><div class="field-value">${r.returnDate || '—'}</div></div>
          <div class="field"><div class="field-label">Acknowledgement</div><div class="field-value"><span class="badge" style="background:${r.acknowledgementStatus==='ACKNOWLEDGED'?'#d1fae5':'#fef3c7'};color:${r.acknowledgementStatus==='ACKNOWLEDGED'?'#065f46':'#92400e'}">${r.acknowledgementStatus || 'PENDING'}</span></div></div>
          ${r.remarks ? `<div class="field" style="grid-column:span 2"><div class="field-label">Remarks</div><div class="field-value">${r.remarks}</div></div>` : ''}
        </div>
        <div class="footer">
          <div class="sig-box"><div class="line">Issued By (Document Controller)</div></div>
          <div class="sig-box"><div class="line">Employee Acknowledgement</div></div>
          <div class="sig-box"><div class="line">MR / HOD</div></div>
        </div>
        <p style="font-size:9px;color:#94a3b8;text-align:center;margin-top:16px">Generated by Document Issue System</p>
      </div>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  const ef = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setEditForm(p => ({ ...p, [k]: e.target.value }));

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Toolbar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white/50"
              placeholder="Search documents, employees, copy numbers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={ctFilter} onChange={e => setCtFilter(e.target.value)} className="px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white/50 focus:ring-2 focus:ring-purple-500">
            <option value="">All Copy Types</option>
            {COPY_TYPES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={stFilter} onChange={e => setStFilter(e.target.value)} className="px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white/50 focus:ring-2 focus:ring-purple-500">
            <option value="">All Status</option>
            {ISSUE_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={ackFilter} onChange={e => setAckFilter(e.target.value)} className="px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white/50 focus:ring-2 focus:ring-purple-500">
            <option value="">All Ack Status</option>
            {ACK_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-md text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FiGrid className="text-sm" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FiList className="text-sm" />
            </button>
          </div>
          <button onClick={load} className="p-2.5 border-2 border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
            <FiRefreshCw className="text-sm" />
          </button>
          <span className="text-xs font-medium text-slate-500">{displayed.length} record(s)</span>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 overflow-hidden">
          {displayed.length === 0 ? (
            <div className="py-16 text-center">
              <FiFileText className="text-5xl text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No document issues found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    {['Issue ID', 'Document', 'Copy', 'Copy No.', 'Issued To', 'Issue Date', 'Status', 'Ack.', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayed.map((r: DocumentIssue) => {
                    const st = ST_COLOR[r.status] || ST_COLOR.ISSUED;
                    const ack = ACK_COLOR[r.acknowledgementStatus || 'PENDING'] || ACK_COLOR.PENDING;
                    return (
                      <tr key={r.id} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-purple-700">{r.issueId || `DI-${r.id}`}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 text-xs">{rDocNum(r)}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{rDocName(r)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-medium">
                            <FiCopy className="text-[8px]" />
                            {rCopyType(r)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{r.copyNumber || '—'}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-slate-700">{rIssuedTo(r)}</p>
                          <p className="text-[10px] text-slate-400">{rDeptName(r)}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{r.issueDate || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${ack.bg} ${ack.text} border ${ack.border}`}>
                            {r.acknowledgementStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setViewingIssue(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="View">
                              <FiEye className="text-xs" />
                            </button>
                            <button onClick={() => printRow(r)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors" title="Print">
                              <FiPrinter className="text-xs" />
                            </button>
                            {(r.acknowledgementStatus || 'PENDING') === 'PENDING' && (
                              <button onClick={() => setConfirmAckId(r.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors" title="Acknowledge">
                                <FiCheck className="text-xs" />
                              </button>
                            )}
                            {r.status === 'ISSUED' && (
                              <button onClick={() => markReturn(r.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors" title="Mark Returned">
                                <FiRefreshCcw className="text-xs" />
                              </button>
                            )}
                            <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors" title="Edit">
                              <FiEdit className="text-xs" />
                            </button>
                            <button onClick={() => setDeleteIssueId(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="Delete">
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((r: DocumentIssue) => {
            const st = ST_COLOR[r.status] || ST_COLOR.ISSUED;
            const ack = ACK_COLOR[r.acknowledgementStatus || 'PENDING'] || ACK_COLOR.PENDING;
            const Icon = COPY_TYPE_ICONS[rCopyType(r)] || FiFileText;
            return (
              <div key={r.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 p-5 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-purple-700">{r.issueId || `DI-${r.id}`}</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{rDocNum(r)}</p>
                    <p className="text-[10px] text-slate-400 truncate">{rDocName(r)}</p>
                  </div>
                  <div className={`bg-gradient-to-r ${COPY_TYPE_COLORS[rCopyType(r)] || 'from-slate-500 to-slate-600'} p-2 rounded-xl`}>
                    <Icon className="text-white text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Copy Type:</span>
                    <span className="font-medium text-slate-700">{rCopyType(r)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Copy No.:</span>
                    <span className="font-mono font-bold text-slate-700">{r.copyNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issued To:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[100px]">{rIssuedTo(r)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dept:</span>
                    <span className="text-slate-600">{rDeptName(r)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issue Date:</span>
                    <span className="text-slate-600">{r.issueDate || '—'}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>
                    {r.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ack.bg} ${ack.text} border ${ack.border}`}>
                    {r.acknowledgementStatus || 'PENDING'}
                  </span>
                </div>
                <div className="flex gap-1 mt-3">
                  <button onClick={() => setViewingIssue(r)} className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">View</button>
                  <button onClick={() => openEdit(r)} className="flex-1 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium hover:bg-purple-100 transition-colors">Edit</button>
                  <button onClick={() => setDeleteIssueId(r.id)} className="py-1.5 px-3 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors">
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      {viewingIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingIssue(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 rounded-t-3xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiFileText className="text-xl" /> Document Issue Details
                  </h2>
                  <p className="text-purple-100 text-xs mt-1">{viewingIssue.issueId || `DI-${viewingIssue.id}`}</p>
                </div>
                <button onClick={() => setViewingIssue(null)} className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Document</p>
                  <p className="font-bold text-slate-800 text-sm mt-1">{rDocNum(viewingIssue)}</p>
                  <p className="text-xs text-slate-500">{rDocName(viewingIssue)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Copy Type</p>
                  <p className="font-bold text-slate-800 text-sm mt-1">{rCopyType(viewingIssue)}</p>
                  <p className="text-xs text-slate-500">Copy #{viewingIssue.copyNumber || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Issued To</p>
                  <p className="font-bold text-slate-800 text-sm mt-1">{rIssuedTo(viewingIssue)}</p>
                  <p className="text-xs text-slate-500">{rDeptName(viewingIssue)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ST_COLOR[viewingIssue.status]?.bg || 'bg-slate-100'} ${ST_COLOR[viewingIssue.status]?.text || 'text-slate-600'} border ${ST_COLOR[viewingIssue.status]?.border || 'border-slate-200'}`}>
                      {viewingIssue.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ACK_COLOR[viewingIssue.acknowledgementStatus || 'PENDING']?.bg || 'bg-amber-50'} ${ACK_COLOR[viewingIssue.acknowledgementStatus || 'PENDING']?.text || 'text-amber-700'} border ${ACK_COLOR[viewingIssue.acknowledgementStatus || 'PENDING']?.border || 'border-amber-200'}`}>
                      {viewingIssue.acknowledgementStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Issue Date</p>
                  <p className="font-medium text-slate-800 text-sm mt-1">{viewingIssue.issueDate || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Return Date</p>
                  <p className="font-medium text-slate-800 text-sm mt-1">{viewingIssue.returnDate || '—'}</p>
                </div>
              </div>
              {viewingIssue.remarks && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Remarks</p>
                  <p className="text-sm text-slate-700 mt-1">{viewingIssue.remarks}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 rounded-b-3xl bg-slate-50/50">
              <button onClick={() => setViewingIssue(null)} className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all">Close</button>
              <button onClick={() => { setViewingIssue(null); printRow(viewingIssue); }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                <FiPrinter className="text-sm" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Confirmation */}
      {confirmAckId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-100 p-3 rounded-2xl">
                <FiCheckCircle className="text-emerald-600 text-3xl" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Confirm Acknowledgement</h3>
                <p className="text-sm text-slate-500">Mark this document as acknowledged by the employee</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-6">This action will update the acknowledgement status to "ACKNOWLEDGED" and record the timestamp.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAckId(null)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={() => acknowledge(confirmAckId)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <FiCheck className="text-sm" /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteIssueId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-2xl">
                <FiAlertTriangle className="text-red-600 text-3xl" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Delete Issue Record</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-6">Are you sure you want to permanently delete this document issue record?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteIssueId(null)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={() => del(deleteIssueId)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <FiTrash2 className="text-sm" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-3xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Edit Issue</h2>
                  <p className="text-purple-100 text-xs">{editing.issueId || `DI-${editing.id}`}</p>
                </div>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Status</label>
                <select value={editForm.status || 'ISSUED'} onChange={ef('status')} className={inputCls}>
                  {ISSUE_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Acknowledgement Status</label>
                <select value={editForm.acknowledgementStatus || 'PENDING'} onChange={ef('acknowledgementStatus')} className={inputCls}>
                  {ACK_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Issue Date</label>
                  <input type="date" value={editForm.issueDate || ''} onChange={ef('issueDate')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Return Date</label>
                  <input type="date" value={editForm.returnDate || ''} onChange={ef('returnDate')} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Remarks</label>
                <textarea value={editForm.remarks || ''} onChange={ef('remarks')} rows={3} className={`${inputCls} resize-none`} placeholder="Additional remarks..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 rounded-b-3xl bg-slate-50/50">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                {saving ? <><FiRefreshCw className="animate-spin text-sm" /> Saving...</> : <><FiEdit className="text-sm" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
function DocIssueReport() {
  const [loading, setLoading] = useState(false);

  const downloadCSV = async () => {
    setLoading(true);
    try {
      const data = (await docIssueApi.getAll() as unknown as DocumentIssue[]);
      exportCSV('Document_Issue_Register.csv',
        ['Issue ID', 'Cert Name', 'Cert No.', 'Doc Number', 'Doc Name', 'Ref No.', 'Rev No.', 'Revision Date', 'Department', 'Copy Type', 'Copy No.', 'Issued To', 'Emp Code', 'Emp Dept', 'Designation', 'Issue Date', 'Return Date', 'Ack Status', 'Status', 'Remarks'],
        data.map(r => [
          r.issueId || `DI-${r.id}`,
          r.certification?.name || r.certificationName,
          r.certification?.code || r.certificationNumber,
          rDocNum(r), rDocName(r),
          r.document?.referenceNumber || r.referenceNumber,
          r.revisionNumber,
          r.document?.revisionDate || r.revisionDate,
          rDeptName(r), rCopyType(r), r.copyNumber, rIssuedTo(r),
          r.employeeCode, r.employeeDepartment, r.designation,
          r.issueDate, r.returnDate,
          r.acknowledgementStatus || 'PENDING', r.status, r.remarks,
        ])
      );
    } catch { alert('Failed to generate report.'); }
    finally { setLoading(false); }
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const data = (await docIssueApi.getAll() as unknown as DocumentIssue[]);
      const w = window.open('', '_blank');
      if (!w) return;
      const stats = {
        total: data.length,
        issued: data.filter(r => r.status === 'ISSUED').length,
        returned: data.filter(r => r.status === 'RETURNED').length,
        overdue: data.filter(r => r.status === 'OVERDUE').length,
        pendingAck: data.filter(r => !r.acknowledgementStatus || r.acknowledgementStatus === 'PENDING').length,
      };
      w.document.write(`
        <html><head><title>Document Issue Register</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;padding:24px;background:#f8fafc}
          .container{max-width:1200px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}
          h1{color:#1e293b;font-size:20px;margin-bottom:4px;display:flex;align-items:center;gap:8px}
          .subtitle{color:#64748b;font-size:11px;margin-bottom:20px}
          .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px}
          .stat-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center}
          .stat-value{font-size:22px;font-weight:700;color:#0f172a}
          .stat-label{font-size:9px;color:#64748b;margin-top:2px;text-transform:uppercase;font-weight:600}
          table{width:100%;border-collapse:collapse;font-size:9px}
          thead{background:linear-gradient(135deg,#7c3aed,#4f46e5)}
          th{color:white;padding:10px 12px;text-align:left;font-weight:600;text-transform:uppercase;font-size:8px;letter-spacing:0.5px}
          td{padding:8px 12px;border-bottom:1px solid #e2e8f0}
          tr:nth-child(even){background:#f8fafc}
          .badge{padding:2px 10px;border-radius:12px;font-weight:600;font-size:8px;display:inline-block}
          .badge-issued{background:#dbeafe;color:#1d4ed8}
          .badge-returned{background:#d1fae5;color:#065f46}
          .badge-overdue{background:#fee2e2;color:#991b1b}
          .badge-cancelled{background:#f3f4f6;color:#374151}
          .badge-pending{background:#fef3c7;color:#92400e}
          .badge-acknowledged{background:#d1fae5;color:#065f46}
          .footer{margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8}
        </style></head><body>
        <div class="container">
          <h1>📄 Document Issue Register</h1>
          <div class="subtitle">Generated: ${new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })} • Total Records: ${data.length}</div>
          <div class="stats">
            <div class="stat-card"><div class="stat-value">${stats.total}</div><div class="stat-label">Total</div></div>
            <div class="stat-card"><div class="stat-value" style="color:#3b82f6">${stats.issued}</div><div class="stat-label">Issued</div></div>
            <div class="stat-card"><div class="stat-value" style="color:#10b981">${stats.returned}</div><div class="stat-label">Returned</div></div>
            <div class="stat-card"><div class="stat-value" style="color:#ef4444">${stats.overdue}</div><div class="stat-label">Overdue</div></div>
            <div class="stat-card"><div class="stat-value" style="color:#f59e0b">${stats.pendingAck}</div><div class="stat-label">Pending Ack.</div></div>
          </div>
          <table>
            <thead><tr>
              <th>Issue ID</th><th>Doc No.</th><th>Doc Name</th><th>Copy Type</th><th>Copy No.</th>
              <th>Issued To</th><th>Dept</th><th>Issue Date</th><th>Return Date</th><th>Status</th><th>Ack.</th>
            </tr></thead>
            <tbody>
              ${data.map(r => {
                const statusMap: Record<string, string> = { ISSUED: 'badge-issued', RETURNED: 'badge-returned', OVERDUE: 'badge-overdue', CANCELLED: 'badge-cancelled' };
                const ackClass = (r.acknowledgementStatus || 'PENDING') === 'PENDING' ? 'badge-pending' : 'badge-acknowledged';
                return `<tr>
                  <td><strong>${r.issueId || `DI-${r.id}`}</strong></td>
                  <td>${rDocNum(r)}</td>
                  <td>${rDocName(r)}</td>
                  <td>${rCopyType(r)}</td>
                  <td><strong>${r.copyNumber || '—'}</strong></td>
                  <td>${rIssuedTo(r)}</td>
                  <td>${rDeptName(r)}</td>
                  <td>${r.issueDate || '—'}</td>
                  <td>${r.returnDate || '—'}</td>
                  <td><span class="badge ${statusMap[r.status] || 'badge-issued'}">${r.status}</span></td>
                  <td><span class="badge ${ackClass}">${r.acknowledgementStatus || 'PENDING'}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          <div class="footer">
            <span>Generated by Document Issue System</span>
            <span>Confidential • For Internal Use Only</span>
          </div>
        </div>
        </body></html>
      `);
      w.document.close(); 
      setTimeout(() => w.print(), 500);
    } catch { alert('Failed to generate PDF.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Document Issue Register',
            desc: 'Complete register with all issues, status, and copy details',
            icon: FiFileText,
            color: 'from-purple-600 to-indigo-600',
            gradient: 'from-purple-500/20 to-indigo-500/20'
          },
          {
            title: 'Controlled Copy Report',
            desc: 'All controlled copies, holders, and pending returns',
            icon: FiCopy,
            color: 'from-blue-600 to-cyan-600',
            gradient: 'from-blue-500/20 to-cyan-500/20'
          },
          {
            title: 'Acknowledgement Report',
            desc: 'Pending vs acknowledged documents by employee',
            icon: FiCheckCircle,
            color: 'from-emerald-600 to-teal-600',
            gradient: 'from-emerald-500/20 to-teal-500/20'
          },
        ].map((report, idx) => {
          const Icon = report.icon;
          return (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className={`bg-gradient-to-br ${report.gradient} p-3 rounded-xl w-fit mb-4`}>
                <Icon className={`text-2xl`} style={{ color: report.color.split(' ')[0].replace('from-', '') }} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">{report.title}</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">{report.desc}</p>
              <div className="flex gap-2">
                <button
                  onClick={downloadCSV}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-50 transition-all disabled:opacity-50"
                >
                  <FiDownload className="text-sm" /> CSV
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-rose-200 text-rose-700 text-xs font-medium hover:bg-rose-50 transition-all disabled:opacity-50"
                >
                  <FiPrinter className="text-sm" /> PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy Type Reference */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FiBookOpen className="text-purple-600" />
            Copy Type Control Reference
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                {['Copy Type', 'Purpose', 'Revision Control', 'Who Holds'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Master Copy', 'Original Approved Copy', 'Full Control — System Maintains', 'Document Controller / MR'],
                ['Controlled Copy', 'Official Department Use', 'Auto Revision Update', 'Department HOD / Assigned Employee'],
                ['Uncontrolled Copy', 'Temporary / Training Use', 'No Revision Update', 'Temporary Holder'],
                ['Reference Copy', 'Read-Only Reference', 'No Update', 'Reference Library'],
                ['Obsolete Copy', 'Superseded Revision', 'Archive Only', 'Document Controller (Archive)'],
              ].map(([type, purpose, control, holder], idx) => {
                const Icon = COPY_TYPE_ICONS[type] || FiFileText;
                return (
                  <tr key={type} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`bg-gradient-to-r ${COPY_TYPE_COLORS[type] || 'from-slate-500 to-slate-600'} p-1.5 rounded-lg`}>
                          <Icon className="text-white text-xs" />
                        </div>
                        <span className="font-semibold text-slate-700">{type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{purpose}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{control}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{holder}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-700">Generating report...</span>
          </div>
        </div>
      )}
    </div>
  );
}