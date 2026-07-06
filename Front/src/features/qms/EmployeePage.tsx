import { useEffect, useState } from "react";
import { employeeApi, deptApi } from "../../api/qms.api";
import { exportCSV } from "../master-data/chartUtils";
import type { Employee, Department, DeptRef, InputChg } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiX, FiRefreshCw,
  FiDownload, FiAlertTriangle, FiUsers
} from "react-icons/fi";

const BRAND = "#280882";
const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600";
const lc = "block text-xs font-medium text-gray-600 mb-1";

const ROLES = ["SUPER_ADMIN","MR","QMS_COORDINATOR","DEPARTMENT_HEAD","AUDITOR","USER","VIEWER","TOP_MANAGEMENT"];
const STATUSES = ["ACTIVE","INACTIVE","RESIGNED"];

const DESIG_BY_DEPT: Record<string, string[]> = {
  Production:            ["Production Manager","Production Engineer","Supervisor","Operator","Technician"],
  "Quality Assurance":   ["QA Manager","QA Engineer","QA Inspector","QA Technician","Document Controller"],
  "Human Resources":     ["HR Manager","HR Executive","Training Coordinator","Recruitment Specialist"],
  Purchase:              ["Purchase Manager","Buyer","Vendor Coordinator","Supply Chain Executive"],
  Maintenance:           ["Maintenance Manager","Maintenance Engineer","Electrician","Technician"],
  Sales:                 ["Sales Manager","Business Development Manager","Customer Support Executive"],
  Engineering:           ["Engineering Manager","Design Engineer","NPD Engineer","Test Engineer"],
  Finance:               ["Finance Manager","Accounts Executive","Cost Accountant","Auditor"],
  "Information Technology": ["IT Manager","Software Engineer","Systems Administrator","Network Engineer"],
  "Management Representative": ["MR","Deputy MR","QMS Coordinator"],
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:       "bg-red-100 text-red-700",
  MR:                "bg-purple-100 text-purple-700",
  QMS_COORDINATOR:   "bg-blue-100 text-blue-700",
  DEPARTMENT_HEAD:   "bg-orange-100 text-orange-700",
  AUDITOR:           "bg-teal-100 text-teal-700",
  USER:              "bg-gray-100 text-gray-600",
  VIEWER:            "bg-gray-50 text-gray-400",
  TOP_MANAGEMENT:    "bg-yellow-100 text-yellow-700",
};

// Update the EMPTY object - set employeeId to undefined or null
const EMPTY: Partial<Employee> = {
  employeeId: undefined, // Changed from "" to undefined
  firstName: "", lastName: "",
  department: null as DeptRef | null, designation: "",
  reportingToId: null, reportingToName: "",
  email: "", personalEmail: "",
  phone: "", alternativeNumber: "",
  joiningDate: null, dateOfBirth: null,
  highestQualification: "", professionalCertifications: "", skills: "",
  yearsOfExperience: null, role: "USER", status: "ACTIVE", remarks: "",
};


export default function EmployeePage() {
  const [rows, setRows]           = useState<Employee[]>([]);
  const [depts, setDepts]         = useState<Department[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Employee | null>(null);
  const [viewItem, setViewItem]   = useState<Employee | null>(null);
  const [form, setForm]           = useState<typeof EMPTY>({ ...EMPTY });
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [customDesig, setCustomDesig] = useState(false);
  const [newDesigInput, setNewDesigInput] = useState("");
  const [deptDesignations, setDeptDesignations] = useState<Record<string, string[]>>({ ...DESIG_BY_DEPT });

  const load = () => {
    setLoading(true);
    Promise.allSettled([employeeApi.getAll(), deptApi.getAll()])
      .then(([eRes, dRes]) => {
        setRows(eRes.status === "fulfilled" ? (Array.isArray(eRes.value) ? eRes.value : []) : []);
        setDepts(dRes.status === "fulfilled" ? (Array.isArray(dRes.value) ? dRes.value : []) : []);
      }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

 // Update the openAdd function
const openAdd = () => {
  setEditing(null); 
  setForm({ 
    ...EMPTY,
    employeeId: undefined // Ensure employeeId is undefined for new employees
  }); 
  setCustomDesig(false); 
  setNewDesigInput(""); 
  setShowModal(true);
};

// Update the openEdit function to preserve existing employeeId
const openEdit = (r: Employee) => {
  setEditing(r);
  setForm({
    ...r,
    department: r.department ? { id: r.department.id } : null,
    joiningDate: r.joiningDate || null,
    dateOfBirth: r.dateOfBirth || null,
    yearsOfExperience: r.yearsOfExperience ?? null,
    employeeId: r.employeeId || undefined, // Keep existing employeeId
  });
  setCustomDesig(false); 
  setNewDesigInput("");
  setShowModal(true);
};


  const f  = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as typeof EMPTY));
  const fd = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value || null } as typeof EMPTY));
  const fn = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value ? Number(e.target.value) : null } as typeof EMPTY));

  const currentDeptId   = form.department?.id;
  const currentDept     = depts.find((d: Department) => d.id === currentDeptId);
  const availableDesig  = currentDept ? (deptDesignations[currentDept.name] || []) : [];

  const onDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    setForm(p => ({ ...p, department: id ? { id } : null, designation: "" } as typeof EMPTY));
    setCustomDesig(false);
  };

  const onReportingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    const emp = rows.find(r => r.id === id);
    setForm(p => ({
      ...p, reportingToId: id,
      reportingToName: emp ? `${emp.firstName} ${emp.lastName}` : "",
    } as typeof EMPTY));
  };

  const addNewDesignation = () => {
    const name = newDesigInput.trim();
    if (!name) return;
    const deptName = currentDept?.name;
    if (deptName) {
      setDeptDesignations(prev => ({
        ...prev,
        [deptName]: [...(prev[deptName] || []), name],
      }));
    }
    setForm(p => ({ ...p, designation: name } as typeof EMPTY));
    setNewDesigInput("");
    setCustomDesig(false);
  };

 // Update the save function
const save = async (addNew = false) => {
  if (!form.firstName?.trim() || !form.lastName?.trim()) { 
    alert("First Name and Last Name are required."); 
    return; 
  }
  setSaving(true);
  try {
    // Create a copy of form data
    const payload = { ...form };
    
    // For new employees, remove employeeId so backend generates it
    if (!editing) {
      delete payload.employeeId;
    }
    
    // For editing, if employeeId is empty or undefined, keep existing
    if (editing && (!payload.employeeId || payload.employeeId === "")) {
      delete payload.employeeId;
    }
    
    let response;
    if (editing) {
      response = await employeeApi.update(editing.id, payload);
    } else {
      response = await employeeApi.create(payload);
    }
    
    // If we're adding a new employee and want to continue adding more
    if (addNew) { 
      setEditing(null); 
      // Reset form with empty employeeId (will be generated by backend)
      setForm({ 
        ...EMPTY, 
        employeeId: undefined // Ensure it's undefined for new employee
      }); 
      setCustomDesig(false); 
      setNewDesigInput(""); 
      // Show a success message
      alert("Employee created successfully! You can continue adding more.");
    } else {
      setShowModal(false);
    }
    load(); // Reload to show updated data
  } catch (e: unknown) {
    alert(apiMsg(e, "Save failed"));
  } finally { 
    setSaving(false); 
  }
};



  const del = async (id: number) => {
    try { await employeeApi.delete(id); setDeleteId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
  };

  const filtered = rows.filter(r => {
    const name = `${r.firstName} ${r.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) ||
      r.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || String(r.department?.id) === deptFilter;
    const matchRole = !roleFilter || r.role === roleFilter;
    return matchSearch && matchDept && matchRole;
  });

  const stats = {
    total:    rows.length,
    active:   rows.filter(r => r.status === "ACTIVE").length,
    inactive: rows.filter(r => r.status === "INACTIVE").length,
    resigned: rows.filter(r => r.status === "RESIGNED").length,
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Employee Master
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage employees, designations, departments and roles</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportCSV(rows.map(r => ({
              "Emp ID": r.employeeId, "First Name": r.firstName, "Last Name": r.lastName,
              Department: r.department?.name, Designation: r.designation,
              Role: r.role, Email: r.email, Phone: r.phone, Status: r.status,
            })), "employees.csv")}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm flex items-center gap-2">
              <FiDownload /> Export
            </button>
            <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={openAdd}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <FiPlus /> New Employee
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Employees", value: stats.total,    color: "from-purple-600 to-indigo-600" },
            { label: "Active",          value: stats.active,   color: "from-green-500 to-emerald-600" },
            { label: "Inactive",        value: stats.inactive, color: "from-yellow-500 to-orange-500" },
            { label: "Resigned",        value: stats.resigned, color: "from-red-500 to-rose-600" },
          ].map(k => (
            <div key={k.label} className={`bg-gradient-to-br ${k.color} text-white p-4 rounded-xl shadow`}>
              <p className="text-xs opacity-80">{k.label}</p>
              <p className="text-2xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, ID, email..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500">
            <option value="">All Departments</option>
            {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500">
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-3" />
            <p className="text-gray-400">Loading employees...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FiUsers className="text-5xl mx-auto mb-3 opacity-20" />
            <p>No employees found.</p>
            <button onClick={openAdd} className="mt-3 px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: BRAND }}>
              <FiPlus className="inline mr-1" /> Add First Employee
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white text-xs uppercase" style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                  {["#","Emp ID","Name","Department","Designation","Role","Email","Mobile","Joining","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r: Employee, i: number) => (
                  <tr key={r.id} className="hover:bg-purple-50/40 transition-colors group">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-purple-700">{r.employeeId || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.firstName} {r.lastName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.department?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[130px] truncate">{r.designation || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[r.role] || "bg-gray-100 text-gray-600"}`}>
                        {r.role?.replace(/_/g," ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(r.joiningDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${r.status === "ACTIVE" ? "bg-green-100 text-green-700"
                          : r.status === "RESIGNED" ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewItem(r)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="View"><FiEye className="text-xs" /></button>
                        <button onClick={() => openEdit(r)} className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200" title="Edit"><FiEdit className="text-xs" /></button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200" title="Delete"><FiTrash2 className="text-xs" /></button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <div>
                <h2 className="text-lg font-bold">{editing ? "Edit Employee" : "New Employee"}</h2>
                {editing?.employeeId && <p className="text-purple-200 text-xs font-mono mt-0.5">{editing.employeeId}</p>}
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Personal Info */}
              <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* In the modal, update the Employee Code field */}
<div>
  <label className={lc}>Employee Code (Auto-generated)</label>
  <input 
    value={form.employeeId || ""} 
    onChange={f("employeeId")} 
    className={`${ic} ${!editing ? 'bg-gray-50' : ''}`}
    placeholder={!editing ? "Will be auto-generated" : "EMP001"}
    disabled={!editing} // Disable editing for new employees
    readOnly={!editing} // Make it read-only for new employees
  />
  {!editing && (
    <p className="text-xs text-purple-600 mt-1">
      ✨ ID will be auto-generated when saved
    </p>
  )}
</div>
                  <div>
                    <label className={lc}>Status</label>
                    <select value={form.status} onChange={f("status")} className={ic}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>First Name *</label>
                    <input value={form.firstName} onChange={f("firstName")} className={ic} placeholder="First name" />
                  </div>
                  <div>
                    <label className={lc}>Last Name *</label>
                    <input value={form.lastName} onChange={f("lastName")} className={ic} placeholder="Last name" />
                  </div>
                  <div>
                    <label className={lc}>Official Email</label>
                    <input type="email" value={form.email || ""} onChange={f("email")} className={ic} placeholder="emp@company.com" />
                  </div>
                  <div>
                    <label className={lc}>Personal Email</label>
                    <input type="email" value={form.personalEmail || ""} onChange={f("personalEmail")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Mobile Number</label>
                    <input value={form.phone || ""} onChange={f("phone")} className={ic} placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className={lc}>Alternative Number</label>
                    <input value={form.alternativeNumber || ""} onChange={f("alternativeNumber")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Date of Birth</label>
                    <input type="date" value={form.dateOfBirth || ""} onChange={fd("dateOfBirth")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Date of Joining</label>
                    <input type="date" value={form.joiningDate || ""} onChange={fd("joiningDate")} className={ic} />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Department</label>
                    <select value={form.department?.id || ""} onChange={onDeptChange} className={ic}>
                      <option value="">— Select Department —</option>
                      {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Designation</label>
                    {customDesig ? (
                      <div className="flex gap-2">
                        <input value={newDesigInput} onChange={e => setNewDesigInput(e.target.value)}
                          className={ic} placeholder="Type new designation..." />
                        <button onClick={addNewDesignation}
                          className="px-3 py-2 rounded-lg text-white text-xs font-semibold shrink-0"
                          style={{ background: BRAND }}>Add</button>
                        <button onClick={() => setCustomDesig(false)}
                          className="px-2 py-2 rounded-lg border border-gray-300 text-gray-500 text-xs shrink-0">✕</button>
                      </div>
                    ) : availableDesig.length > 0 ? (
                      <div className="flex gap-2">
                        <select value={form.designation || ""} onChange={f("designation")} className={ic}>
                          <option value="">— Select Designation —</option>
                          {availableDesig.map(d => <option key={d}>{d}</option>)}
                        </select>
                        <button onClick={() => setCustomDesig(true)} title="Add new designation"
                          className="px-3 py-2 rounded-lg border border-purple-300 text-purple-600 text-xs shrink-0 hover:bg-purple-50">
                          <FiPlus />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={form.designation || ""} onChange={f("designation")} className={ic} placeholder="Enter designation" />
                        {currentDept && (
                          <button onClick={() => setCustomDesig(true)} title="Save as preset"
                            className="px-3 py-2 rounded-lg border border-purple-300 text-purple-600 text-xs shrink-0 hover:bg-purple-50">
                            <FiPlus />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={lc}>Reporting To</label>
                    <select value={form.reportingToId || ""} onChange={onReportingChange} className={ic}>
                      <option value="">— Select Manager —</option>
                      {rows.filter(r => r.id !== editing?.id).map((r: Employee) => (
                        <option key={r.id} value={r.id}>
                          {r.firstName} {r.lastName} — {r.designation || r.department?.name || ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>System Role</label>
                    <select value={form.role} onChange={f("role")} className={ic}>
                      {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="p-4 bg-green-50/30 rounded-xl border border-green-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Qualifications & Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Highest Qualification</label>
                    <input value={form.highestQualification || ""} onChange={f("highestQualification")} className={ic} placeholder="B.E. Mechanical, MBA..." />
                  </div>
                  <div>
                    <label className={lc}>Years of Experience</label>
                    <input type="number" value={form.yearsOfExperience ?? ""} onChange={fn("yearsOfExperience")} className={ic} min="0" />
                  </div>
                  <div>
                    <label className={lc}>Professional Certifications</label>
                    <input value={form.professionalCertifications || ""} onChange={f("professionalCertifications")} className={ic}
                      placeholder="Lead Auditor, Six Sigma GB..." />
                  </div>
                  <div>
                    <label className={lc}>Skills</label>
                    <input value={form.skills || ""} onChange={f("skills")} className={ic} placeholder="QA, Audit, ISO 9001..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc}>Remarks</label>
                    <textarea value={form.remarks || ""} onChange={f("remarks")} rows={2} className={ic} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={() => save(true)} disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-medium border-2 disabled:opacity-60"
                style={{ borderColor: BRAND, color: BRAND }}>Save & New</button>
              <button onClick={() => save(false)} disabled={saving}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                {saving ? <><FiRefreshCw className="inline animate-spin mr-1" />Saving...</> : editing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <div>
                <h2 className="text-lg font-bold">Employee Details</h2>
                <p className="text-purple-200 text-xs font-mono mt-0.5">{viewItem.employeeId || "—"}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                  {viewItem.firstName?.charAt(0)?.toUpperCase()}{viewItem.lastName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{viewItem.firstName} {viewItem.lastName}</p>
                  <p className="text-sm text-gray-500">{viewItem.designation || "—"}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[viewItem.role] || "bg-gray-100 text-gray-600"}`}>
                      {viewItem.role?.replace(/_/g," ")}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${viewItem.status === "ACTIVE" ? "bg-green-100 text-green-700"
                        : viewItem.status === "RESIGNED" ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-500"}`}>
                      {viewItem.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Employee ID", viewItem.employeeId || "—"],
                  ["Department", viewItem.department?.name || "—"],
                  ["Designation", viewItem.designation || "—"],
                  ["Reporting To", viewItem.reportingToName || "—"],
                  ["Official Email", viewItem.email || "—"],
                  ["Personal Email", viewItem.personalEmail || "—"],
                  ["Mobile", viewItem.phone || "—"],
                  ["Alt. Number", viewItem.alternativeNumber || "—"],
                  ["Date of Birth", fmtDate(viewItem.dateOfBirth)],
                  ["Joining Date", fmtDate(viewItem.joiningDate)],
                  ["Qualification", viewItem.highestQualification || "—"],
                  ["Experience", viewItem.yearsOfExperience != null ? `${viewItem.yearsOfExperience} years` : "—"],
                  ["Created", viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString() : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="font-semibold text-gray-800 break-words">{value}</p>
                  </div>
                ))}
              </div>
              {viewItem.professionalCertifications && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Professional Certifications</p>
                  <p className="text-gray-700 text-sm">{viewItem.professionalCertifications}</p>
                </div>
              )}
              {viewItem.skills && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.skills.split(",").filter(Boolean).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {viewItem.remarks && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Remarks</p>
                  <p className="text-gray-700 text-sm">{viewItem.remarks}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setViewItem(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Close</button>
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold shadow-lg flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                <FiEdit /> Edit
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
                <h3 className="font-bold text-gray-800">Delete Employee</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this employee record?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={() => del(deleteId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
