// import { useEffect, useState } from "react";
// import type { Department, InputChg } from "./types";
// import { apiMsg } from "./types";
// import { deptApi } from "../../api/qms.api";
// import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiRefreshCw, FiAlertTriangle, FiDownload } from "react-icons/fi";
// import { exportCSV } from "../master-data/chartUtils";

// const BRAND = "#280882";
// const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600";
// const lc = "block text-xs font-medium text-gray-600 mb-1";

// const DEPT_CODES: Record<string, string> = {
//   Production: "PRD", "Quality Assurance": "QA", "Human Resources": "HR",
//   Purchase: "PUR", Maintenance: "MNT", Sales: "SAL", Engineering: "ENG",
//   Finance: "FIN", IT: "IT", Marketing: "MKT",
// };

// const EMPTY: Partial<Department> = {
//   name: "", departmentCode: "", departmentHead: "", email: "", phone: "", location: "", active: true,
// };

// export default function DepartmentPage() {
//   const [rows, setRows]           = useState<Department[]>([]);
//   const [loading, setLoading]     = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing]     = useState<Department | null>(null);
//   const [form, setForm]           = useState<Partial<Department>>({ ...EMPTY });
//   const [saving, setSaving]       = useState(false);
//   const [deleteId, setDeleteId]   = useState<number | null>(null);
//   const [deletingId, setDeletingId] = useState<number | null>(null);
//   const [search, setSearch]       = useState("");

//   const load = () => {
//     setLoading(true);
//     deptApi.getAll()
//       .then((d: unknown) => setRows(Array.isArray(d) ? d as Department[] : []))
//       .catch(() => setRows([]))
//       .finally(() => setLoading(false));
//   };
//   useEffect(() => { load(); }, []);

//   const openAdd  = () => { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); };
//   const openEdit = (r: Department) => {
//     setEditing(r);
//     setForm({ name: r.name, departmentCode: r.departmentCode || "", departmentHead: r.departmentHead || "", email: r.email || "", phone: r.phone || "", location: r.location || "", active: r.active });
//     setShowModal(true);
//   };

//   const f  = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as Partial<Department>));
//   const fb = (val: boolean) => setForm(p => ({ ...p, active: val }));

//   const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const name = e.target.value;
//     setForm(p => ({ ...p, name, departmentCode: DEPT_CODES[name] || p.departmentCode || "" }));
//   };

//   const save = async (addNew = false) => {
//     if (!form.name?.trim()) { alert("Department name is required."); return; }
//     setSaving(true);
//     try {
//       if (editing) await deptApi.update(editing.id, form);
//       else         await deptApi.create(form);
//       if (addNew && !editing) { setEditing(null); setForm({ ...EMPTY }); }
//       else setShowModal(false);
//       load();
//     } catch (e: unknown) {
//       alert(apiMsg(e, "Save failed"));
//     } finally { setSaving(false); }
//   };

//   const del = async (id: number) => {
//     setDeletingId(id);
//     try { await deptApi.delete(id); setDeleteId(null); load(); }
//     catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
//     finally { setDeletingId(null); }
//   };

//   const filtered = rows.filter(r => {
//     if (!search) return true;
//     const t = search.toLowerCase();
//     return r.name?.toLowerCase().includes(t) ||
//       r.departmentCode?.toLowerCase().includes(t) ||
//       r.departmentHead?.toLowerCase().includes(t) ||
//       r.location?.toLowerCase().includes(t);
//   });

//   const stats = { total: rows.length, active: rows.filter(r => r.active).length, inactive: rows.filter(r => !r.active).length };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 space-y-4">
//       {/* Header */}
//       <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
//               Department Master
//             </h1>
//             <p className="text-gray-500 mt-1 text-sm">Manage organization departments</p>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             <button onClick={() => exportCSV(rows.map(r => ({ Code: r.departmentCode, Name: r.name, Head: r.departmentHead, Email: r.email, Phone: r.phone, Location: r.location, Status: r.active ? "Active" : "Inactive" })), "departments.csv")}
//               className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm flex items-center gap-2">
//               <FiDownload /> Export
//             </button>
//             <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm flex items-center gap-2">
//               <FiRefreshCw /> Refresh
//             </button>
//             <button onClick={openAdd}
//               className="px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
//               style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
//               <FiPlus /> New Department
//             </button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-3 gap-3 mb-4">
//           {[
//             { label: "Total", value: stats.total, color: "from-purple-600 to-indigo-600" },
//             { label: "Active", value: stats.active, color: "from-green-500 to-emerald-600" },
//             { label: "Inactive", value: stats.inactive, color: "from-gray-500 to-gray-600" },
//           ].map(k => (
//             <div key={k.label} className={`bg-gradient-to-br ${k.color} text-white p-4 rounded-xl shadow`}>
//               <p className="text-xs opacity-80">{k.label}</p>
//               <p className="text-2xl font-bold">{k.value}</p>
//             </div>
//           ))}
//         </div>

//         {/* Search */}
//         <div className="relative">
//           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input value={search} onChange={e => setSearch(e.target.value)}
//             placeholder="Search by name, code, head or location..."
//             className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 bg-white" />
//         </div>
//       </div>

//       {/* Department list */}
//       <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
//         {loading ? (
//           <div className="py-20 text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-3" />
//             <p className="text-gray-400">Loading departments...</p>
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="py-16 text-center text-gray-400">
//             <FiSearch className="text-5xl mx-auto mb-3 opacity-20" />
//             <p>No departments found.</p>
//             <button onClick={openAdd} className="mt-3 px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: BRAND }}>
//               <FiPlus className="inline mr-1" /> Add First Department
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-white text-xs uppercase" style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
//                   {["#", "Code", "Department Name", "Head", "Email", "Contact", "Location", "Status", "Actions"].map(h => (
//                     <th key={h} className="px-4 py-3.5 text-left whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filtered.map((r: Department, i: number) => (
//                   <tr key={r.id} className="hover:bg-purple-50/40 transition-colors group">
//                     <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
//                     <td className="px-4 py-3">
//                       {r.departmentCode
//                         ? <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-mono text-xs font-semibold">{r.departmentCode}</span>
//                         : <span className="text-gray-300">—</span>}
//                     </td>
//                     <td className="px-4 py-3 font-semibold text-gray-800">{r.name}</td>
//                     <td className="px-4 py-3 text-gray-600 text-xs">{r.departmentHead || "—"}</td>
//                     <td className="px-4 py-3 text-gray-400 text-xs">{r.email || "—"}</td>
//                     <td className="px-4 py-3 text-gray-400 text-xs">{r.phone || "—"}</td>
//                     <td className="px-4 py-3 text-gray-400 text-xs">{r.location || "—"}</td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
//                         {r.active ? "Active" : "Inactive"}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button onClick={() => openEdit(r)} className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200" title="Edit"><FiEdit className="text-xs" /></button>
//                         <button onClick={() => setDeleteId(r.id)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200" title="Delete"><FiTrash2 className="text-xs" /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Add / Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
//             <div className="px-6 py-4 flex items-center justify-between text-white"
//               style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)`, borderRadius: "16px 16px 0 0" }}>
//               <h2 className="text-lg font-bold">{editing ? "Edit Department" : "New Department"}</h2>
//               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="col-span-2">
//                   <label className={lc}>Department Name *</label>
//                   <input value={form.name || ""} onChange={onNameChange} className={ic}
//                     list="dept-presets" placeholder="e.g. Quality Assurance" />
//                   <datalist id="dept-presets">
//                     {Object.keys(DEPT_CODES).map(d => <option key={d} value={d} />)}
//                   </datalist>
//                 </div>
//                 <div>
//                   <label className={lc}>Department Code</label>
//                   <input value={form.departmentCode || ""} onChange={f("departmentCode")} className={ic} placeholder="QA / PRD / HR" />
//                 </div>
//                 <div>
//                   <label className={lc}>Head Name</label>
//                   <input value={form.departmentHead || ""} onChange={f("departmentHead")} className={ic} placeholder="e.g. Ramesh Kumar" />
//                 </div>
//                 <div>
//                   <label className={lc}>Email</label>
//                   <input type="email" value={form.email || ""} onChange={f("email")} className={ic} placeholder="dept@company.com" />
//                 </div>
//                 <div>
//                   <label className={lc}>Contact Number</label>
//                   <input value={form.phone || ""} onChange={f("phone")} className={ic} placeholder="+91 9876543210" />
//                 </div>
//                 <div className="col-span-2">
//                   <label className={lc}>Location</label>
//                   <input value={form.location || ""} onChange={f("location")} className={ic} placeholder="Plant 1, Ground Floor" />
//                 </div>
//                 <div className="col-span-2 flex items-center gap-4">
//                   <label className={lc}>Status:</label>
//                   {[{ val: true, label: "Active" }, { val: false, label: "Inactive" }].map(({ val, label }) => (
//                     <label key={label} className="flex items-center gap-1.5 cursor-pointer">
//                       <input type="radio" name="deptStatus" checked={form.active === val}
//                         onChange={() => fb(val)} style={{ accentColor: BRAND }} />
//                       <span className="text-sm text-gray-700">{label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 px-6 pb-6">
//               <button onClick={() => setShowModal(false)}
//                 className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
//               {!editing && (
//                 <button onClick={() => save(true)} disabled={saving}
//                   className="px-4 py-2 rounded-xl text-sm font-medium border-2 disabled:opacity-60"
//                   style={{ borderColor: BRAND, color: BRAND }}>
//                   {saving ? "Saving..." : "Save & New"}
//                 </button>
//               )}
//               <button onClick={() => save(false)} disabled={saving}
//                 className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 shadow-lg"
//                 style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
//                 {saving ? <><FiRefreshCw className="inline animate-spin mr-1" />Saving...</> : editing ? "Update" : "Save"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirm */}
//       {deleteId && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
//               <div>
//                 <h3 className="font-bold text-gray-800">Delete Department</h3>
//                 <p className="text-sm text-gray-500">This action cannot be undone.</p>
//               </div>
//             </div>
//             <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this department?</p>
//             <div className="flex gap-3">
//               <button onClick={() => setDeleteId(null)} disabled={deletingId === deleteId}
//                 className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
//               <button onClick={() => del(deleteId)} disabled={deletingId === deleteId}
//                 className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
//                 {deletingId === deleteId ? <><FiRefreshCw className="animate-spin" /> Deleting...</> : <><FiTrash2 /> Delete</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import type { Department, InputChg } from "./types";
import { apiMsg } from "./types";
import { deptApi } from "../../api/qms.api";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiRefreshCw, FiAlertTriangle, FiDownload } from "react-icons/fi";
import { exportCSV } from "../master-data/chartUtils";

const BRAND = "#280882";
const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600";
const lc = "block text-xs font-medium text-gray-600 mb-1";

const DEPT_CODES: Record<string, string> = {
  Production: "PRD", "Quality Assurance": "QA", "Human Resources": "HR",
  Purchase: "PUR", Maintenance: "MNT", Sales: "SAL", Engineering: "ENG",
  Finance: "FIN", IT: "IT", Marketing: "MKT",
};

const EMPTY: Partial<Department> = {
  name: "",
  departmentCode: "",
  departmentHead: "",
  email: "",
  phone: "",
  location: "",
  processName: "",
  processOwner: "",
  description: "",
  remarks: "",
  active: true,
};

export default function DepartmentPage() {
  const [rows, setRows] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<Partial<Department>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    deptApi.getAll()
      .then((d: unknown) => setRows(Array.isArray(d) ? d as Department[] : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); };
  const openEdit = (r: Department) => {
    setEditing(r);
    setForm({
      name: r.name,
      departmentCode: r.departmentCode || "",
      departmentHead: r.departmentHead || "",
      email: r.email || "",
      phone: r.phone || "",
      location: r.location || "",
      processName: r.processName || "",
      processOwner: r.processOwner || "",
      description: r.description || "",
      remarks: r.remarks || "",
      active: r.active
    });
    setShowModal(true);
  };

  const f = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as Partial<Department>));
  const fb = (val: boolean) => setForm(p => ({ ...p, active: val }));

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm(p => ({ ...p, name, departmentCode: DEPT_CODES[name] || p.departmentCode || "" }));
  };

  const save = async (addNew = false) => {
    if (!form.name?.trim()) { 
      alert("Department name is required."); 
      return; 
    }
    setSaving(true);
    try {
      if (editing) {
        await deptApi.update(editing.id, form);
      } else {
        await deptApi.create(form);
      }
      if (addNew && !editing) { 
        setEditing(null); 
        setForm({ ...EMPTY }); 
      } else {
        setShowModal(false);
      }
      load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed"));
    } finally { 
      setSaving(false); 
    }
  };

  const del = async (id: number) => {
    setDeletingId(id);
    try { 
      await deptApi.delete(id); 
      setDeleteId(null); 
      load(); 
    } catch (e: unknown) { 
      alert(apiMsg(e, "Delete failed")); 
    } finally { 
      setDeletingId(null); 
    }
  };

  const filtered = rows.filter(r => {
    if (!search) return true;
    const t = search.toLowerCase();
    return r.name?.toLowerCase().includes(t) ||
      r.departmentCode?.toLowerCase().includes(t) ||
      r.departmentHead?.toLowerCase().includes(t) ||
      r.location?.toLowerCase().includes(t);
  });

  const stats = { 
    total: rows.length, 
    active: rows.filter(r => r.active).length, 
    inactive: rows.filter(r => !r.active).length 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Department Master
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage organization departments</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportCSV(rows.map(r => ({ 
              "Department ID": r.departmentId || "",
              Code: r.departmentCode, 
              Name: r.name, 
              Head: r.departmentHead, 
              Email: r.email, 
              Phone: r.phone, 
              Location: r.location, 
              Status: r.active ? "Active" : "Inactive" 
            })), "departments.csv")}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm flex items-center gap-2">
              <FiDownload /> Export
            </button>
            <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={openAdd}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <FiPlus /> New Department
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Total", value: stats.total, color: "from-purple-600 to-indigo-600" },
            { label: "Active", value: stats.active, color: "from-green-500 to-emerald-600" },
            { label: "Inactive", value: stats.inactive, color: "from-gray-500 to-gray-600" },
          ].map(k => (
            <div key={k.label} className={`bg-gradient-to-br ${k.color} text-white p-4 rounded-xl shadow`}>
              <p className="text-xs opacity-80">{k.label}</p>
              <p className="text-2xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, code, head or location..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 bg-white" />
        </div>
      </div>

      {/* Department list */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-3" />
            <p className="text-gray-400">Loading departments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FiSearch className="text-5xl mx-auto mb-3 opacity-20" />
            <p>No departments found.</p>
            <button onClick={openAdd} className="mt-3 px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: BRAND }}>
              <FiPlus className="inline mr-1" /> Add First Department
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white text-xs uppercase" style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                  {["#", "Dept ID", "Code", "Department Name", "Head", "Email", "Contact", "Location", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r: Department, i: number) => (
                  <tr key={r.id} className="hover:bg-purple-50/40 transition-colors group">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      {r.departmentId ? (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-mono text-xs font-semibold">
                          {r.departmentId}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.departmentCode ? (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-mono text-xs font-semibold">
                          {r.departmentCode}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{r.departmentHead || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.location || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                        {r.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200" title="Edit">
                          <FiEdit className="text-xs" />
                        </button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200" title="Delete">
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)`, borderRadius: "16px 16px 0 0" }}>
              <h2 className="text-lg font-bold">{editing ? "Edit Department" : "New Department"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lc}>Department Name *</label>
                  <input value={form.name || ""} onChange={onNameChange} className={ic}
                    list="dept-presets" placeholder="e.g. Quality Assurance" />
                  <datalist id="dept-presets">
                    {Object.keys(DEPT_CODES).map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div>
                  <label className={lc}>Department Code</label>
                  <input value={form.departmentCode || ""} onChange={f("departmentCode")} className={ic} placeholder="QA / PRD / HR" />
                </div>
                <div>
                  <label className={lc}>Head Name</label>
                  <input value={form.departmentHead || ""} onChange={f("departmentHead")} className={ic} placeholder="e.g. Ramesh Kumar" />
                </div>
                <div>
                  <label className={lc}>Email</label>
                  <input type="email" value={form.email || ""} onChange={f("email")} className={ic} placeholder="dept@company.com" />
                </div>
                <div>
                  <label className={lc}>Contact Number</label>
                  <input value={form.phone || ""} onChange={f("phone")} className={ic} placeholder="+91 9876543210" />
                </div>
                <div className="col-span-2">
                  <label className={lc}>Location</label>
                  <input value={form.location || ""} onChange={f("location")} className={ic} placeholder="Plant 1, Ground Floor" />
                </div>
              </div>

              {/* Process Information */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Process Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={lc}>Process Name *</label>
                    <input value={form.processName || ""} onChange={f("processName")} className={ic} placeholder="e.g. Quality Assurance Process" />
                  </div>
                  <div className="col-span-2">
                    <label className={lc}>Process Owner</label>
                    <input value={form.processOwner || ""} onChange={f("processOwner")} className={ic} placeholder="e.g. Quality Manager" />
                  </div>
                  <div className="col-span-2">
                    <label className={lc}>Description</label>
                    <textarea value={form.description || ""} onChange={f("description")} className={`${ic} resize-none`} rows={2} placeholder="Brief department/process description" />
                  </div>
                  <div className="col-span-2">
                    <label className={lc}>Remarks</label>
                    <textarea value={form.remarks || ""} onChange={f("remarks")} className={`${ic} resize-none`} rows={1} placeholder="Additional notes" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center gap-4">
                  <label className={lc}>Status:</label>
                  {[{ val: true, label: "Active" }, { val: false, label: "Inactive" }].map(({ val, label }) => (
                    <label key={label} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="deptStatus" checked={form.active === val}
                        onChange={() => fb(val)} style={{ accentColor: BRAND }} />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              {!editing && (
                <button onClick={() => save(true)} disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium border-2 disabled:opacity-60"
                  style={{ borderColor: BRAND, color: BRAND }}>
                  {saving ? "Saving..." : "Save & New"}
                </button>
              )}
              <button onClick={() => save(false)} disabled={saving}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                {saving ? <><FiRefreshCw className="inline animate-spin mr-1" />Saving...</> : editing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Department</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this department?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={deletingId === deleteId}
                className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">
                Cancel
              </button>
              <button onClick={() => del(deleteId)} disabled={deletingId === deleteId}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {deletingId === deleteId ? <><FiRefreshCw className="animate-spin" /> Deleting...</> : <><FiTrash2 /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}