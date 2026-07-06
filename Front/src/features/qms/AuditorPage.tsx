import { useEffect, useState } from "react";
import { auditorApi, deptApi } from "../../api/qms.api";
import type { Auditor, Department, InputChg } from "./types";
import { apiMsg } from "./types";
import { exportCSV } from "../master-data/chartUtils";
import {
  FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiX, FiRefreshCw,
  FiDownload, FiAlertTriangle, FiUser, FiShield, FiMail, FiPhone
} from "react-icons/fi";

const BRAND = "#280882";
const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600";
const lc = "block text-xs font-medium text-gray-600 mb-1";

const CERT_OPTIONS = [
  "ISO 9001:2015 LA","AS9100D LA","ISO 14001 LA","ISO 45001 LA","ISO 27001 LA",
  "IATF 16949 LA","ISO 22163 LA","ISO 9001:2015 IA","AS9100D IA",
];
const EXPERTISE_OPTIONS = [
  "Quality Management","Production","Aerospace","Automotive","HR","Purchase",
  "Maintenance","Information Security","Engineering","Finance",
];
const COMPETENCY_LEVELS = ["BEGINNER","INTERMEDIATE","EXPERIENCED","EXPERT","LEAD"];

const EMPTY: Partial<Auditor> = {
  name: "", auditorCode: "", type: "INTERNAL", department: "",
  organization: "", organizationType: "INTERNAL", branch: "",
  qualification: "", competencyLevel: "INTERMEDIATE",
  leadAuditorCertNo: "", certIssueDate: null, certExpiryDate: null,
  assignedStandards: "", auditScope: "",
  experienceYears: null, auditHours: null,
  areaOfExpertise: "", certifications: [],
  email: "", phone: "", resumePath: "", status: "ACTIVE", remarks: "",
};

export default function AuditorPage() {
  const [rows, setRows]         = useState<Auditor[]>([]);
  const [depts, setDepts]       = useState<Department[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Auditor | null>(null);
  const [viewItem, setViewItem] = useState<Auditor | null>(null);
  const [form, setForm]         = useState<Partial<Auditor>>({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);

  const load = () => {
    setLoading(true);
    Promise.allSettled([auditorApi.getAll(), deptApi.getAll()])
      .then(([aRes, dRes]) => {
        setRows(aRes.status === "fulfilled" ? (Array.isArray(aRes.value) ? aRes.value as Auditor[] : []) : []);
        setDepts(dRes.status === "fulfilled" ? (Array.isArray(dRes.value) ? dRes.value as Department[] : []) : []);
      }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null); setForm({ ...EMPTY }); setSelectedCerts([]); setSelectedExpertise([]); setShowModal(true);
  };
  const openEdit = (r: Auditor) => {
    setEditing(r);
    setForm({ ...EMPTY, ...r, certIssueDate: r.certIssueDate || null, certExpiryDate: r.certExpiryDate || null });
    setSelectedCerts(Array.isArray(r.certifications) ? r.certifications : []);
    setSelectedExpertise(r.areaOfExpertise ? r.areaOfExpertise.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
    setShowModal(true);
  };

  const toggleCert = (c: string) => {
    setSelectedCerts(prev => {
      const next = prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c];
      setForm(p => ({ ...p, certifications: next }));
      return next;
    });
  };

  const toggleExpertise = (e: string) => {
    setSelectedExpertise(prev => {
      const next = prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e];
      setForm(p => ({ ...p, areaOfExpertise: next.join(",") }));
      return next;
    });
  };

  const f  = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value || (["certIssueDate","certExpiryDate"].includes(k) ? null : e.target.value) } as Partial<Auditor>));
  const fn = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value ? Number(e.target.value) : null } as Partial<Auditor>));
  const fd = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value || null } as Partial<Auditor>));

  const save = async (addNew = false) => {
    if (!form.name?.trim()) { alert("Auditor Name is required."); return; }
    setSaving(true);
    const payload = {
      ...form,
      certifications: selectedCerts,
      certIssueDate: form.certIssueDate || null,
      certExpiryDate: form.certExpiryDate || null,
    };
    try {
      if (editing) await auditorApi.update(editing.id, payload);
      else         await auditorApi.create(payload);
      if (addNew) { setEditing(null); setForm({ ...EMPTY }); setSelectedCerts([]); setSelectedExpertise([]); }
      else setShowModal(false);
      load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed"));
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    try { await auditorApi.delete(id); setDeleteId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
  };

  const filtered = rows.filter(r => {
    const matchSearch = !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.auditorCode?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    total: rows.length,
    internal: rows.filter(r => r.type === "INTERNAL").length,
    external: rows.filter(r => r.type === "EXTERNAL").length,
    active: rows.filter(r => r.status === "ACTIVE").length,
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Auditor Master
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage internal and external auditors, qualifications and certifications</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportCSV(rows.map(r => ({
              "Auditor ID": r.auditorCode, Name: r.name, Type: r.type,
              Qualification: r.qualification, Email: r.email, Phone: r.phone,
              "Cert Expiry": r.certExpiryDate, Status: r.status,
            })), "auditors.csv")}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm flex items-center gap-2">
              <FiDownload /> Export
            </button>
            <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={openAdd}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <FiPlus /> New Auditor
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Auditors", value: stats.total, color: "from-purple-600 to-indigo-600" },
            { label: "Internal", value: stats.internal, color: "from-blue-500 to-blue-600" },
            { label: "External", value: stats.external, color: "from-orange-500 to-orange-600" },
            { label: "Active", value: stats.active, color: "from-green-500 to-emerald-600" },
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
              placeholder="Search name, code, email..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500">
            <option value="">All Types</option>
            <option value="INTERNAL">Internal</option>
            <option value="EXTERNAL">External</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-3" />
            <p className="text-gray-400">Loading auditors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FiUser className="text-5xl mx-auto mb-3 opacity-20" />
            <p>No auditors found.</p>
            <button onClick={openAdd} className="mt-3 px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: BRAND }}>
              <FiPlus className="inline mr-1" /> Add First Auditor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white text-xs uppercase" style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                  {["Auditor ID","Name","Type","Department","Qualification","Competency","Exp.Yrs","Email","Phone","Cert Expiry","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r: Auditor) => (
                  <tr key={r.id} className="hover:bg-purple-50/40 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-purple-700">{r.auditorCode || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.type === "INTERNAL" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {r.type === "INTERNAL" ? "Internal" : "External"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.department || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate">{r.qualification || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.competencyLevel || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-center">{r.experienceYears ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(r.certExpiryDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <div>
                <h2 className="text-lg font-bold">{editing ? "Edit Auditor" : "New Auditor"}</h2>
                {editing?.auditorCode && <p className="text-purple-200 text-xs font-mono mt-0.5">{editing.auditorCode}</p>}
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Basic Info */}
              <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Auditor Type *</label>
                    <div className="flex gap-4 pt-1">
                      {["INTERNAL","EXTERNAL"].map(t => (
                        <label key={t} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="auditType" value={t} checked={form.type === t}
                            onChange={f("type")} style={{ accentColor: BRAND }} />
                          <span className="text-sm text-gray-700">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={lc}>Status</label>
                    <select value={form.status} onChange={f("status")} className={ic}>
                      <option>ACTIVE</option><option>INACTIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Auditor Name *</label>
                    <input value={form.name} onChange={f("name")} className={ic} placeholder="Full Name" />
                  </div>
                  <div>
                    <label className={lc}>Department</label>
                    <select value={form.department || ""} onChange={f("department")} className={ic}>
                      <option value="">— Select Department —</option>
                      {depts.filter((d: Department) => d.active).map((d: Department) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Qualification</label>
                    <input value={form.qualification} onChange={f("qualification")} className={ic} placeholder="B.E. Mechanical, MBA, IRCA LA" />
                  </div>
                  <div>
                    <label className={lc}>Competency Level</label>
                    <select value={form.competencyLevel || "INTERMEDIATE"} onChange={f("competencyLevel")} className={ic}>
                      {COMPETENCY_LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Experience (Years)</label>
                    <input type="number" value={form.experienceYears ?? ""} onChange={fn("experienceYears")} min="0" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Audit Hours</label>
                    <input type="number" value={form.auditHours ?? ""} onChange={fn("auditHours")} min="0" className={ic} />
                  </div>
                  {form.type === "EXTERNAL" && (
                    <>
                      <div>
                        <label className={lc}>Organization</label>
                        <input value={form.organization} onChange={f("organization")} className={ic} placeholder="Company name" />
                      </div>
                      <div>
                        <label className={lc}>Branch / Location</label>
                        <input value={form.branch || ""} onChange={f("branch")} className={ic} placeholder="Branch or city" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Certification Details */}
              <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Certification Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Lead Auditor Certificate No.</label>
                    <input value={form.leadAuditorCertNo} onChange={f("leadAuditorCertNo")} className={ic} placeholder="IRCA-LA-2025-001" />
                  </div>
                  <div>
                    <label className={lc}>Assigned Standards</label>
                    <input value={form.assignedStandards || ""} onChange={f("assignedStandards")} className={ic} placeholder="ISO 9001, AS9100D, ..." />
                  </div>
                  <div>
                    <label className={lc}>Certificate Issue Date</label>
                    <input type="date" value={form.certIssueDate || ""} onChange={fd("certIssueDate")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Certificate Validity / Expiry Date</label>
                    <input type="date" value={form.certExpiryDate || ""} onChange={fd("certExpiryDate")} className={ic} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc}>Audit Scope</label>
                    <textarea value={form.auditScope || ""} onChange={f("auditScope")} rows={2} className={ic} placeholder="Areas and processes covered in audits..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc}>Certifications (select all applicable)</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {CERT_OPTIONS.map(c => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-1 py-0.5">
                          <input type="checkbox" checked={selectedCerts.includes(c)} onChange={() => toggleCert(c)}
                            style={{ accentColor: BRAND }} />
                          <span className="text-xs text-gray-700">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Area of Expertise */}
              <div className="p-4 bg-green-50/30 rounded-xl border border-green-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Area of Expertise</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {EXPERTISE_OPTIONS.map(e => (
                    <label key={e} className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-1 py-0.5">
                      <input type="checkbox" checked={selectedExpertise.includes(e)} onChange={() => toggleExpertise(e)}
                        style={{ accentColor: BRAND }} />
                      <span className="text-sm text-gray-700">{e}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Email</label>
                    <input type="email" value={form.email} onChange={f("email")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Phone / Mobile</label>
                    <input value={form.phone} onChange={f("phone")} className={ic} placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className={lc}>Resume / CV Path</label>
                    <input value={form.resumePath || ""} onChange={f("resumePath")} className={ic} placeholder="File path or URL to resume" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc}>Remarks</label>
                    <textarea value={form.remarks} onChange={f("remarks")} rows={2} className={ic} />
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
                <h2 className="text-lg font-bold">Auditor Details</h2>
                <p className="text-purple-200 text-xs font-mono mt-0.5">{viewItem.auditorCode || "—"}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: viewItem.type === "INTERNAL" ? "#3b82f6" : "#f97316" }}>
                  {viewItem.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{viewItem.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${viewItem.type === "INTERNAL" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                    {viewItem.type}
                  </span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${viewItem.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {viewItem.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Auditor ID", viewItem.auditorCode || "—"],
                  ["Department", viewItem.department || "—"],
                  ["Qualification", viewItem.qualification || "—"],
                  ["Competency Level", viewItem.competencyLevel || "—"],
                  ["Experience", viewItem.experienceYears != null ? `${viewItem.experienceYears} years` : "—"],
                  ["Audit Hours", viewItem.auditHours != null ? `${viewItem.auditHours} hrs` : "—"],
                  ["Email", viewItem.email || "—"],
                  ["Phone", viewItem.phone || "—"],
                  ["Certificate No.", viewItem.leadAuditorCertNo || "—"],
                  ["Cert Issue Date", formatDate(viewItem.certIssueDate)],
                  ["Cert Validity", formatDate(viewItem.certExpiryDate)],
                  ["Assigned Standards", viewItem.assignedStandards || "—"],
                  ["Created Date", viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString() : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="font-semibold text-gray-800 break-words">{value}</p>
                  </div>
                ))}
              </div>
              {viewItem.certifications?.length > 0 && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.certifications.map((c: string) => (
                      <span key={c} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {viewItem.areaOfExpertise && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Area of Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.areaOfExpertise.split(",").filter(Boolean).map((e: string) => (
                      <span key={e} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{e.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {viewItem.auditScope && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Audit Scope</p>
                  <p className="text-gray-700 text-sm">{viewItem.auditScope}</p>
                </div>
              )}
              {viewItem.resumePath && (
                <div className="mt-3 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">Resume / CV</p>
                  <p className="text-gray-700 text-sm break-all">{viewItem.resumePath}</p>
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
                <h3 className="font-bold text-gray-800">Delete Auditor</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this auditor record?</p>
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
