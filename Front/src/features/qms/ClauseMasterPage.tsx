import { useEffect, useState, useMemo } from "react";
import { clauseApi, certApi, deptApi } from "../../api/qms.api";
import type { ClauseMaster, Certification, Department, CertRef, DeptRef, InputChg } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiX, FiRefreshCw,
 FiAlertTriangle, FiDownload, 
  FiBookOpen, FiList, FiSave
} from "react-icons/fi";

const BRAND = "#280882";
const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white";
const lc = "block text-xs font-semibold text-gray-600 mb-1";
const tc = "block text-xs font-semibold text-gray-600 mb-1";
const ta = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none";

const MAIN_CLAUSE_TITLES: Record<string, string> = {
  "4": "Context of Organization",
  
  "5": "Leadership",
  "6": "Planning",
  "7": "Support",
  "8": "Operation",
  "9": "Performance Evaluation",
  "10": "Improvement",
};

const EMPTY: Partial<ClauseMaster> = {
  certification: null as CertRef | null, department: null as DeptRef | null,
  mainClauseNumber: "", mainClauseTitle: "",
  subClauseReference: "", subClauseTitle: "",
  requirement: "", auditQuestion: "",
  status: "ACTIVE",
};

export default function ClauseMasterPage() {
  const [rows, setRows]         = useState<ClauseMaster[]>([]);
  const [certs, setCerts]       = useState<Certification[]>([]);
  const [depts, setDepts]       = useState<Department[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<ClauseMaster | null>(null);
  const [viewItem, setViewItem] = useState<ClauseMaster | null>(null);
  const [form, setForm]         = useState<Partial<ClauseMaster>>({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filters
  const [search, setSearch]       = useState("");
  const [filterCert, setFilterCert] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const load = () => {
    setLoading(true);
    Promise.allSettled([clauseApi.getAll(), certApi.getAll(), deptApi.getActive()])
      .then(([cRes, certRes, deptRes]) => {
        setRows(cRes.status === "fulfilled" ? (Array.isArray(cRes.value) ? cRes.value as ClauseMaster[] : []) : []);
        setCerts(certRes.status === "fulfilled" ? (Array.isArray(certRes.value) ? certRes.value as Certification[] : []) : []);
        setDepts(deptRes.status === "fulfilled" ? (Array.isArray(deptRes.value) ? deptRes.value as Department[] : []) : []);
      }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); };
  const openEdit = (r: ClauseMaster) => {
    setEditing(r);
    setForm({
      ...EMPTY, ...r,
      certification: r.certification ? { id: r.certification.id } : null,
      department: r.department ? { id: r.department.id } : null,
    });
    setShowModal(true);
  };

  const f = (k: string) => (e: InputChg) => {
    const val = e.target.value;
    setForm(p => {
      const next = { ...p, [k]: val } as Partial<ClauseMaster>;
      if (k === "mainClauseNumber") {
        next.mainClauseTitle = MAIN_CLAUSE_TITLES[val] || p.mainClauseTitle;
      }
      return next;
    });
  };

  const validate = () => {
    if (!form.certification?.id) { alert("Certification Standard is required."); return false; }
    if (!form.department?.id)    { alert("Department is required."); return false; }
    if (!form.mainClauseNumber?.trim()) { alert("Main Clause Number is required."); return false; }
    if (!form.mainClauseTitle?.trim())  { alert("Main Clause Title is required."); return false; }
    if (!form.subClauseReference?.trim()) { alert("Sub-Clause Reference is required."); return false; }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) await clauseApi.update(editing.id, payload);
      else         await clauseApi.create(payload);
      setShowModal(false);
      load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed. Please try again."));
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await clauseApi.delete(deleteId);
      setDeleteId(null);
      load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Delete failed."));
    }
  };

  const exportCSV = () => {
    const headers = ["Clause ID","Certification","Department","Main Clause No","Main Clause Title","Sub-Clause Ref","Sub-Clause Title","Requirement","Audit Question","Status"];
    const csvRows = filtered.map(r => [
      r.clauseId, r.certification?.code, r.department?.name,
      r.mainClauseNumber, r.mainClauseTitle, r.subClauseReference,
      r.subClauseTitle, `"${(r.requirement||"").replace(/"/g,'""')}"`,
      `"${(r.auditQuestion||"").replace(/"/g,'""')}"`, r.status
    ].join(","));
    const blob = new Blob([headers.join(",") + "\n" + csvRows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "ClauseMaster.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => rows.filter(r => {
    const ms = !search || [r.clauseId, r.mainClauseNumber, r.mainClauseTitle, r.subClauseReference, r.subClauseTitle]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const mc = !filterCert   || String(r.certification?.id) === filterCert;
    const md = !filterDept   || String(r.department?.id)    === filterDept;
    const mst = !filterStatus || r.status === filterStatus;
    return ms && mc && md && mst;
  }), [rows, search, filterCert, filterDept, filterStatus]);

  const stats = useMemo(() => ({
    total:    rows.length,
    active:   rows.filter(r => r.status === "ACTIVE").length,
    inactive: rows.filter(r => r.status === "INACTIVE").length,
    certs:    new Set(rows.map(r => r.certification?.id)).size,
    depts:    new Set(rows.map(r => r.department?.id)).size,
  }), [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 mb-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <FiBookOpen className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND }}>Clause Master</h1>
              <p className="text-sm text-gray-500">Manage certification standard clauses &amp; sub-clauses</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
              <FiDownload /> Export CSV
            </button>
            <button onClick={load}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2 text-white rounded-xl text-sm font-semibold shadow-lg transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <FiPlus /> Add Clause
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          {[
            { label: "Total Clauses",  value: stats.total,    color: "from-purple-600 to-indigo-600" },
            { label: "Active",         value: stats.active,   color: "from-green-500 to-emerald-600" },
            { label: "Inactive",       value: stats.inactive, color: "from-gray-400 to-gray-500" },
            { label: "Standards",      value: stats.certs,    color: "from-blue-500 to-blue-600" },
            { label: "Departments",    value: stats.depts,    color: "from-orange-500 to-orange-600" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white p-4 rounded-xl shadow-lg`}>
              <p className="text-xs opacity-90 mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-52">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type="text" placeholder="Search by clause number, title..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 bg-white" />
            </div>
            <select value={filterCert} onChange={e => setFilterCert(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
              <option value="">All Standards</option>
              {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
              <option value="">All Departments</option>
              {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            {(search || filterCert || filterDept || filterStatus) && (
              <button onClick={() => { setSearch(""); setFilterCert(""); setFilterDept(""); setFilterStatus(""); }}
                className="px-3 py-2.5 text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                <FiX /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiList /> Clause List
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono">
              {filtered.length} of {rows.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-700 animate-spin" />
            <span className="ml-3 text-gray-400">Loading clauses...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <FiBookOpen className="text-6xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium text-lg">No clauses found</p>
            <p className="text-gray-300 text-sm mt-1">Click "Add Clause" to create the first clause</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: BRAND }} className="text-white text-xs uppercase">
                  {["Clause ID","Standard","Department","Main Clause","Sub-Clause","Requirement","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r: ClauseMaster, idx: number) => (
                  <tr key={r.id} className={`hover:bg-purple-50/40 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="px-4 py-3 font-mono font-bold text-purple-700 whitespace-nowrap">{r.clauseId || `CLA-${r.id}`}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{r.certification?.code || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.department?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-xs">{r.mainClauseNumber} – {r.mainClauseTitle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-700 font-semibold">{r.subClauseReference}</p>
                      <p className="text-xs text-gray-400">{r.subClauseTitle}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-xs text-gray-600 truncate" title={r.requirement}>{r.requirement || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => setViewItem(r)} title="View"
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                          <FiEye className="text-xs" />
                        </button>
                        <button onClick={() => openEdit(r)} title="Edit"
                          className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors">
                          <FiEdit className="text-xs" />
                        </button>
                        <button onClick={() => setDeleteId(r.id)} title="Delete"
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <div className="flex items-center gap-3">
                <FiBookOpen className="text-white text-xl" />
                <div>
                  <h2 className="text-lg font-bold text-white">{editing ? "Edit Clause" : "Add Clause"}</h2>
                  <p className="text-purple-200 text-xs">{editing ? `Editing ${editing.clauseId}` : "Fill all required fields"}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-colors">
                <FiX />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Clause ID (read-only when editing) */}
              {editing && (
                <div>
                  <label className={lc}>Clause ID</label>
                  <input value={editing.clauseId || "Auto-generated"} readOnly
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 font-mono" />
                </div>
              )}

              {/* Section 1 */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="text-sm font-bold mb-3" style={{ color: BRAND }}>Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Certification Standard *</label>
                    <select value={form.certification?.id || ""}
                      onChange={e => setForm(p => ({ ...p, certification: e.target.value ? { id: Number(e.target.value) } : null } as Partial<ClauseMaster>))}
                      className={ic}>
                      <option value="">Select Certification</option>
                      {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Department *</label>
                    <select value={form.department?.id || ""}
                      onChange={e => setForm(p => ({ ...p, department: e.target.value ? { id: Number(e.target.value) } : null } as Partial<ClauseMaster>))}
                      className={ic}>
                      <option value="">Select Department</option>
                      {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Main Clause Number *</label>
                    <input type="text" value={form.mainClauseNumber} onChange={f("mainClauseNumber")}
                      placeholder="e.g., 7" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Main Clause Title *</label>
                    <input type="text" value={form.mainClauseTitle} onChange={f("mainClauseTitle")}
                      placeholder="e.g., Support" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Sub-Clause Reference *</label>
                    <input type="text" value={form.subClauseReference} onChange={f("subClauseReference")}
                      placeholder="e.g., 7.2" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Sub-Clause Title</label>
                    <input type="text" value={form.subClauseTitle} onChange={f("subClauseTitle")}
                      placeholder="e.g., Competence" className={ic} />
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-bold mb-3 text-blue-800">Audit Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className={tc}>Requirement / Check Point</label>
                    <textarea rows={3} value={form.requirement} onChange={f("requirement")}
                      placeholder="Describe the requirement or checkpoint to be verified..."
                      className={ta} />
                  </div>
                  <div>
                    <label className={tc}>Audit Question / Guideline</label>
                    <textarea rows={3} value={form.auditQuestion} onChange={f("auditQuestion")}
                      placeholder="Enter the audit question or guideline for the auditor..."
                      className={ta} />
                  </div>
                </div>
              </div>

              {/* Status + Created By */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={lc}>Status *</label>
                  <select value={form.status} onChange={f("status")} className={ic}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className={lc}>{editing ? "Updated By" : "Created By"}</label>
                  <input type="text" value={editing ? form.updatedBy : form.createdBy}
                    onChange={f(editing ? "updatedBy" : "createdBy")}
                    placeholder="Your name" className={ic} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: editing ? "#2563EB" : "#16A34A" }}>
                  <FiSave /> {saving ? "Saving..." : (editing ? "Update" : "Save")}
                </button>
                <button onClick={() => setForm({ ...EMPTY })}
                  className="px-5 py-2.5 bg-amber-50 border border-amber-300 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-all">
                  Clear
                </button>
                <button onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-red-50 border border-red-300 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <div>
                <p className="text-white font-bold text-lg">{viewItem.clauseId}</p>
                <p className="text-purple-200 text-xs">{viewItem.certification?.code} · {viewItem.department?.name}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20">
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Clause ID",       viewItem.clauseId],
                  ["Standard",        viewItem.certification?.name],
                  ["Department",      viewItem.department?.name],
                  ["Main Clause",     `${viewItem.mainClauseNumber} – ${viewItem.mainClauseTitle}`],
                  ["Sub-Clause Ref",  viewItem.subClauseReference],
                  ["Sub-Clause Title",viewItem.subClauseTitle],
                  ["Status",          viewItem.status],
                  ["Created By",      viewItem.createdBy || "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">{k}</p>
                    <p className="text-sm text-gray-800 font-medium">{v || "—"}</p>
                  </div>
                ))}
              </div>
              {viewItem.requirement && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-2 uppercase">Requirement / Check Point</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewItem.requirement}</p>
                </div>
              )}
              {viewItem.auditQuestion && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-purple-700 mb-2 uppercase">Audit Question / Guideline</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewItem.auditQuestion}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => { openEdit(viewItem); setViewItem(null); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                  <FiEdit /> Edit
                </button>
                <button onClick={() => setViewItem(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <FiAlertTriangle className="text-5xl text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Clause?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={confirmDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm">
                Delete
              </button>
              <button onClick={() => setDeleteId(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
