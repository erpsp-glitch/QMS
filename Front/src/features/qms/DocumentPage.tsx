import { useEffect, useState } from "react";
import { docApi, deptApi, certApi, employeeApi } from "../../api/qms.api";
import http from "../../api/http";
import type { Document, Certification, Department, Employee, CertRef, DeptRef, InputChg } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiX, FiRefreshCw,
  FiDownload, FiFileText, FiCheckCircle, FiAlertTriangle, FiClock,
  FiArchive, FiFilter
} from "react-icons/fi";

const BRAND = "#280882";
const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600";

const lc = "block text-xs font-medium text-gray-600 mb-1";

const DOC_LEVELS = [
  { val: "LEVEL_1", label: "Level 1 — Quality Manual",         types: ["QM"] },
  { val: "LEVEL_2", label: "Level 2 — QSP (Procedure)",        types: ["QSP"] },
  { val: "LEVEL_3", label: "Level 3 — Work Instruction (WI)",  types: ["WI"] },
  { val: "LEVEL_4", label: "Level 4 — Format/Register/List",   types: ["FM","RF","LF"] },
];
const DOC_TYPE_INFO: Record<string, string> = {
  QM: "Quality Manual", QSP: "Quality System Procedure", WI: "Work Instruction",
  FM: "Format", RF: "Register", LF: "List/Register",
};
const COPY_TYPES   = ["MASTER","CONTROLLED","UNCONTROLLED","REFERENCE"];
const REVIEW_FREQS = ["6M","1Y","2Y","3Y"];
const STATUSES     = ["DRAFT","UNDER_REVIEW","APPROVED","RELEASED","ACTIVE","OBSOLETE","ARCHIVED"];

const EMPTY = {
  title: "", documentName: "", documentNumber: "", documentType: "WI",
  level: "LEVEL_3", revisionNumber: "00", revisionDate: "", effectiveDate: "",
  nextReviewDate: "", reviewFrequency: "1Y",
  owner: "", preparedBy: "", preparedById: "", reviewedBy: "", reviewedById: "",
  approvedBy: "", approvedById: "",
  keywords: "", changeDescription: "", description: "", referenceNumber: "",
  copyType: "CONTROLLED", status: "DRAFT",
  certification: null as CertRef | null, department: null as DeptRef | null,
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT:        "bg-gray-100 text-gray-500",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED:     "bg-blue-100 text-blue-700",
  RELEASED:     "bg-purple-100 text-purple-700",
  ACTIVE:       "bg-green-100 text-green-700",
  OBSOLETE:     "bg-red-100 text-red-500",
  ARCHIVED:     "bg-gray-200 text-gray-500",
};

const levelShort = (l: string) => DOC_LEVELS.find(d => d.val === l)?.label.split(" — ")[1] || l;

export default function DocumentPage() {
  const [rows,      setRows]      = useState<Document[]>([]);
  const [certs,     setCerts]     = useState<Certification[]>([]);
  const [depts,     setDepts]     = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [certId,    setCertId]    = useState<number | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<Document | null>(null);
  const [viewing,   setViewing]   = useState<Document | null>(null);
  const [form,      setForm]      = useState<typeof EMPTY>({ ...EMPTY });
  const [file,      setFile]      = useState<File | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState("");
  const [levelFilter,  setLevelFilter]  = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [delConfirm,   setDelConfirm]   = useState<Document | null>(null);
  const [approveId,    setApproveId]    = useState<number | null>(null);
  const [companyCode,  setCompanyCode]  = useState("QMS");
  const [downloading,  setDownloading]  = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    const p = certId ? docApi.getByCert(certId) : docApi.getAll();
    p.then((d: unknown) => setRows(Array.isArray(d) ? d as Document[] : [])).catch(() => setRows([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.allSettled([certApi.getAll(), deptApi.getAll(), employeeApi.getAll()])
      .then(([cR, dR, eR]) => {
        setCerts(cR.status === "fulfilled" ? (Array.isArray(cR.value) ? cR.value : []) : []);
        setDepts(dR.status === "fulfilled" ? (Array.isArray(dR.value) ? dR.value : []) : []);
        setEmployees(eR.status === "fulfilled" ? (Array.isArray(eR.value) ? eR.value : []) : []);
      });
  }, []);

  useEffect(() => { load(); }, [certId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, certification: certId ? { id: certId } : null });
    setFile(null);
    setShowModal(true);
  };

  const openEdit = (r: Document) => {
    setEditing(r);
    setForm({
  ...r,

  title: r.title ?? "",
  documentName: r.documentName ?? "",
  documentNumber: r.documentNumber ?? "",
  documentType: r.documentType ?? "WI",
  level: r.level ?? r.documentLevel ?? "LEVEL_3",
  revisionNumber: r.revisionNumber ?? "",
  revisionDate: r.revisionDate ?? "",
  effectiveDate: r.effectiveDate ?? "",
  nextReviewDate: r.nextReviewDate ?? "",
  reviewFrequency: r.reviewFrequency ?? "",
  owner: r.owner ?? "",
  preparedBy: r.preparedBy ?? "",
  preparedById: r.preparedById ?? "",
  reviewedBy: r.reviewedBy ?? "",
  reviewedById: r.reviewedById ?? "",
  approvedBy: r.approvedBy ?? "",
  approvedById: r.approvedById ?? "",
  keywords: r.keywords ?? "",
  changeDescription: r.changeDescription ?? "",
  description: r.description ?? "",
  referenceNumber: r.referenceNumber ?? "",
  copyType: r.copyType ?? "",
  status: r.status ?? "DRAFT",
  certification: r.certification ?? null,
  department: r.department ?? null,
});
    setFile(null);
    setShowModal(true);
  };

  const f = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as typeof EMPTY));

  const onLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lvl = e.target.value;
    const firstType = DOC_LEVELS.find(d => d.val === lvl)?.types[0] || "WI";
    setForm(p => ({ ...p, level: lvl, documentType: firstType } as typeof EMPTY));
    autoGenNumber(lvl, firstType, form.department?.id);
  };

  const onDocTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dt = e.target.value;
    setForm(p => ({ ...p, documentType: dt } as typeof EMPTY));
    autoGenNumber(form.level, dt, form.department?.id);
  };

  const onDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value ? Number(e.target.value) : null;
    const dept = depts.find((d: Department) => d.id === deptId);
    setForm(p => ({ ...p, department: deptId ? { id: deptId } : null } as typeof EMPTY));
    if (dept) autoGenNumber(form.level, form.documentType, deptId, dept.departmentCode);
  };

  const autoGenNumber = async (_level: string, docType: string, deptId?: number | null, deptCode?: string) => {
    const dept = deptCode || (deptId ? depts.find((d: Department) => d.id === deptId)?.departmentCode : "");
    if (!dept || !docType) return;
    try {
      const res = await http.get("/documents/generate-number", { params: { companyCode, deptCode: dept, docType } }) as { data: { data?: { documentNumber?: string }; documentNumber?: string } };
      const num = res?.data?.data?.documentNumber || res?.data?.documentNumber || "";
      if (num) setForm(p => ({ ...p, documentNumber: num } as typeof EMPTY));
    } catch { /* ignore */ }
  };

  const onCertChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    setForm(p => ({ ...p, certification: id ? { id } : null } as typeof EMPTY));
  };

  const empNames = employees.filter((e: Employee) => e.status === "ACTIVE")
    .map((e: Employee) => `${e.firstName || ""} ${e.lastName || ""}`.trim()).filter(Boolean).sort();

  const availDocTypes = DOC_LEVELS.find(l => l.val === form.level)?.types || ["WI"];

  const save = async () => {
    const name = form.documentName || form.title;
    if (!name?.trim() || !form.documentNumber?.trim()) {
      alert("Document Name and Document Number are required."); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, title: name, documentName: name };
      const fd = new FormData();
      fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (file) fd.append("file", file);
      if (editing) await docApi.update(editing.id, fd);
      else         await docApi.create(fd);
      setShowModal(false);
      load();
    } catch (e: unknown) { alert(apiMsg(e, "Save failed")); }
    finally { setSaving(false); }
  };

  const approve = async (id: number) => {
    try { await docApi.approve(id); setApproveId(null); load(); }
    catch { alert("Approve failed."); }
  };

  const confirmDel = async () => {
    if (!delConfirm) return;
    try { await docApi.delete(delConfirm.id); setDelConfirm(null); load(); }
    catch { alert("Delete failed."); }
  };

  const downloadFile = async (r: Document) => {
    if (!r.filePath) { alert("No file attached to this document."); return; }
    setDownloading(r.id);
    try {
      const res = await http.get(`/documents/${r.id}/download`, { responseType: "blob" }) as { data: Blob };
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      const ext = r.filePath.split(".").pop() || "pdf";
      a.download = `${r.documentNumber}_Rev${r.revisionNumber}.${ext}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { alert("Download failed."); }
    finally { setDownloading(null); }
  };

  const downloadMasterList = async () => {
    if (!certId) { alert("Select a certification first."); return; }
    try {
      const res = await docApi.downloadMasterList(certId) as { data: Blob };
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = "Document_Master_List.pdf";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { alert("Download failed."); }
  };

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !search ||
      (r.documentNumber || "").toLowerCase().includes(q) ||
      ((r.documentName || r.title) || "").toLowerCase().includes(q) ||
      (r.keywords || "").toLowerCase().includes(q);
    return matchQ
      && (!levelFilter  || (r.level || r.documentLevel) === levelFilter)
      && (!statusFilter || r.status === statusFilter);
  });

  const today = new Date().toISOString().split("T")[0];
  const stats = {
    total:       rows.length,
    approved:    rows.filter(r => ["APPROVED","RELEASED","ACTIVE"].includes(r.status ?? "")).length,
    draft:       rows.filter(r => r.status === "DRAFT").length,
    underReview: rows.filter(r => r.status === "UNDER_REVIEW").length,
    obsolete:    rows.filter(r => r.status === "OBSOLETE").length,
    overdue:     rows.filter(r => r.nextReviewDate && r.nextReviewDate < today && !["OBSOLETE","ARCHIVED"].includes(r.status ?? "")).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 space-y-5">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Document Master
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage controlled documents, revisions and approval status</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadMasterList} disabled={!certId}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              <FiDownload className="text-red-500" /> Master List
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <FiPlus /> New Document
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {[
            { label: "Total",       value: stats.total,       grad: "from-purple-600 to-indigo-600",  icon: <FiFileText /> },
            { label: "Approved",    value: stats.approved,    grad: "from-green-500 to-emerald-600",  icon: <FiCheckCircle /> },
            { label: "Draft",       value: stats.draft,       grad: "from-gray-500 to-gray-600",      icon: <FiFileText /> },
            { label: "Under Review",value: stats.underReview, grad: "from-yellow-500 to-orange-500",  icon: <FiClock /> },
            { label: "Obsolete",    value: stats.obsolete,    grad: "from-red-500 to-rose-600",       icon: <FiArchive /> },
            { label: "Overdue",     value: stats.overdue,     grad: "from-red-600 to-red-700",        icon: <FiAlertTriangle /> },
          ].map(k => (
            <div key={k.label} className={`bg-gradient-to-br ${k.grad} text-white p-4 rounded-xl shadow-lg`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-lg text-sm">{k.icon}</div>
                <div><p className="text-xs opacity-90 leading-tight">{k.label}</p><p className="text-2xl font-bold">{k.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <select value={certId ?? ""} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
            <option value="">All Certifications</option>
            {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
            <option value="">All Levels</option>
            {DOC_LEVELS.map(l => <option key={l.val} value={l.val}>{l.label.split(" — ")[0]}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by number, name, keywords..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-sm" />
          </div>
          <input value={companyCode} onChange={e => setCompanyCode(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none w-24 bg-white"
            placeholder="Co.Code" title="Company Code for doc numbering" />
          <button onClick={load}
            className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-600 hover:border-purple-400 flex items-center gap-2 transition-all">
            <FiRefreshCw /> Refresh
          </button>
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <FiFilter /> {filtered.length} / {rows.length} shown
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto" style={{ borderColor: BRAND }} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FiFileText className="text-5xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No documents found.</p>
            <p className="text-gray-300 text-xs mt-1">Adjust filters or create a new document.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs uppercase">
                  {["#","Doc Number","Document Name","Type","Level","Rev","Dept","Owner","Next Review","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r: Document, i: number) => {
                  const isOverdue = r.nextReviewDate && r.nextReviewDate < today && !["OBSOLETE","ARCHIVED"].includes(r.status ?? "");
                  return (
                    <tr key={r.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{r.documentNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 max-w-[180px] truncate" title={r.documentName || r.title}>{r.documentName || r.title}</p>
                        {r.keywords && <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{r.keywords}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                          {r.documentType || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{levelShort(r.level || r.documentLevel || "")}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs font-bold text-gray-700">Rev {r.revisionNumber}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.department?.code || r.department?.name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{r.owner || "—"}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {r.nextReviewDate
                          ? <span className={isOverdue ? "text-red-600 font-semibold flex items-center gap-1" : "text-gray-400"}>
                              {isOverdue && <FiAlertTriangle className="text-xs" />}
                              {r.nextReviewDate}
                            </span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[r.status ?? ""] || "bg-gray-100 text-gray-500"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setViewing(r)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600" title="View">
                            <FiEye className="text-xs" />
                          </button>
                          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600" title="Edit">
                            <FiEdit className="text-xs" />
                          </button>
                          {(r.status === "UNDER_REVIEW" || r.status === "DRAFT") && (
                            <button onClick={() => setApproveId(r.id)} className="p-1.5 rounded-lg hover:bg-green-100 text-green-600" title="Approve">
                              <FiCheckCircle className="text-xs" />
                            </button>
                          )}
                          {r.filePath && (
                            <button onClick={() => downloadFile(r)} disabled={downloading === r.id}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40" title="Download file">
                              {downloading === r.id
                                ? <FiRefreshCw className="text-xs animate-spin" />
                                : <FiDownload className="text-xs" />}
                            </button>
                          )}
                          <button onClick={() => setDelConfirm(r)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500" title="Delete">
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

      {/* ── View Modal ───────────────────────────────────────────────── */}
      {viewing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <div>
                <h2 className="text-lg font-bold">{viewing.documentNumber}</h2>
                <p className="text-xs text-white/70 mt-0.5">{viewing.documentName || viewing.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {viewing.filePath && (
                  <button onClick={() => downloadFile(viewing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
                    <FiDownload className="text-xs" /> Download
                  </button>
                )}
                <button onClick={() => setViewing(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><FiX /></button>
              </div>
            </div>
            <div className="p-6 space-y-4 text-sm">
              {/* Status Badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[viewing.status ?? ""] || "bg-gray-100 text-gray-500"}`}>{viewing.status}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{viewing.documentType || "—"}</span>
                <span className="text-xs text-gray-500">{levelShort(viewing.level || viewing.documentLevel || "")}</span>
              </div>

              {/* Core Info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Document Number",  viewing.documentNumber],
                  ["Reference Number", viewing.referenceNumber || "—"],
                  ["Revision No.",     `Rev ${viewing.revisionNumber}`],
                  ["Copy Type",        viewing.copyType || "—"],
                  ["Review Frequency", viewing.reviewFrequency || "—"],
                  ["Owner",            viewing.owner || "—"],
                  ["Revision Date",    viewing.revisionDate || "—"],
                  ["Effective Date",   viewing.effectiveDate || "—"],
                  ["Next Review",      viewing.nextReviewDate || "—"],
                  ["Department",       viewing.department?.name || "—"],
                  ["Certification",    viewing.certification?.code || viewing.certification?.name || "—"],
                  ["File",             viewing.filePath ? "Attached" : "None"],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                    <p className="font-semibold text-gray-800">{v}</p>
                  </div>
                ))}
              </div>

              {/* Approval Matrix */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Approval Matrix</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[["Prepared By", viewing.preparedBy], ["Reviewed By", viewing.reviewedBy], ["Approved By", viewing.approvedBy]].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-xs text-gray-400 mb-1">{l}</p>
                      <p className="font-semibold text-gray-800 text-sm">{v || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {viewing.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-gray-700">{viewing.description}</p>
                </div>
              )}
              {viewing.changeDescription && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                  <p className="text-xs text-gray-400 mb-1">Change Description (Rev {viewing.revisionNumber})</p>
                  <p className="text-gray-700">{viewing.changeDescription}</p>
                </div>
              )}
              {viewing.changeLog && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-gray-400 mb-1">Change Log</p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{viewing.changeLog}</pre>
                </div>
              )}
              {viewing.keywords && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewing.keywords.split(",").map((k: string) => (
                      <span key={k} className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{k.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span>Created: {viewing.createdAt?.split("T")[0] || "—"}</span>
                <span>Updated: {viewing.updatedAt?.split("T")[0] || "—"}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6">
              <button onClick={() => { setViewing(null); openEdit(viewing); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-purple-200 text-purple-700 text-sm hover:bg-purple-50">
                <FiEdit /> Edit
              </button>
              <button onClick={() => setViewing(null)}
                className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <h2 className="text-lg font-bold">{editing ? "Edit Document" : "New Document"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><FiX /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Section 1: Certification & Department */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>1</span>
                  Certification & Department
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={lc}>Certification *</label>
                    <select value={form.certification?.id || ""} onChange={onCertChange} className={ic}>
                      <option value="">— Select —</option>
                      {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Department *</label>
                    <select value={form.department?.id || ""} onChange={onDeptChange} className={ic}>
                      <option value="">— Select —</option>
                      {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name} ({d.departmentCode || "—"})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Co. Code (for numbering)</label>
                    <input value={companyCode} onChange={e => setCompanyCode(e.target.value)} className={ic} placeholder="QMS" />
                  </div>
                </div>
              </div>

              {/* Section 2: Document Identification */}
              <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>2</span>
                  Document Identification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Document Level *</label>
                    <select value={form.level} onChange={onLevelChange} className={ic}>
                      {DOC_LEVELS.map(l => <option key={l.val} value={l.val}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Document Type *</label>
                    <select value={form.documentType} onChange={onDocTypeChange} className={ic}>
                      {availDocTypes.map(t => <option key={t} value={t}>{t} — {DOC_TYPE_INFO[t]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Document Number (Auto-generated)</label>
                    <input value={form.documentNumber} onChange={f("documentNumber")} className={ic} placeholder="Select dept + type to auto-fill" />
                  </div>
                  <div>
                    <label className={lc}>Reference Number</label>
                    <input value={form.referenceNumber} onChange={f("referenceNumber")} className={ic} placeholder="e.g. REF-2025-001" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc}>Document Name *</label>
                    <input value={form.documentName || form.title}
                      onChange={e => setForm(p => ({ ...p, documentName: e.target.value, title: e.target.value } as typeof EMPTY))}
                      className={ic} placeholder="e.g. Internal Audit Procedure" />
                  </div>
                  <div>
                    <label className={lc}>Owner / Process Owner</label>
                    <select value={form.owner || ""} onChange={f("owner")} className={ic}>
                      <option value="">— Select —</option>
                      {empNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Keywords (comma separated)</label>
                    <input value={form.keywords} onChange={f("keywords")} className={ic} placeholder="audit, inspection, QA..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lc}>Description</label>
                    <textarea value={form.description} onChange={f("description")} rows={2} className={ic} placeholder="Brief purpose / scope of this document..." />
                  </div>
                </div>
              </div>

              {/* Section 3: Revision Details */}
              <div className="p-4 bg-yellow-50/30 rounded-xl border border-yellow-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>3</span>
                  Revision Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={lc}>Revision Number</label>
                    <input value={form.revisionNumber} onChange={f("revisionNumber")} className={ic} placeholder="00" />
                  </div>
                  <div>
                    <label className={lc}>Revision Date</label>
                    <input type="date" value={form.revisionDate} onChange={f("revisionDate")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Effective Date *</label>
                    <input type="date" value={form.effectiveDate} onChange={f("effectiveDate")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Next Review Date *</label>
                    <input type="date" value={form.nextReviewDate} onChange={f("nextReviewDate")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Review Frequency</label>
                    <select value={form.reviewFrequency} onChange={f("reviewFrequency")} className={ic}>
                      {REVIEW_FREQS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Copy Type</label>
                    <select value={form.copyType} onChange={f("copyType")} className={ic}>
                      {COPY_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className={lc}>Change Description (this revision)</label>
                    <textarea value={form.changeDescription} onChange={f("changeDescription")} rows={2} className={ic} placeholder="Describe what changed in this revision..." />
                  </div>
                </div>
              </div>

              {/* Section 4: Approval Matrix */}
              <div className="p-4 bg-green-50/30 rounded-xl border border-green-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>4</span>
                  Approval Matrix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Prepared By *", key: "preparedBy" },
                    { label: "Reviewed By *", key: "reviewedBy" },
                    { label: "Approved By *", key: "approvedBy" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className={lc}>{label}</label>
                      <select value={String(form[key as keyof typeof form] ?? "")} onChange={f(key)} className={ic}>
                        <option value="">— Select Employee —</option>
                        {empNames.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Status & File */}
              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: BRAND }}>5</span>
                  Status & File Attachment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Status</label>
                    <select value={form.status} onChange={f("status")} className={ic}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Upload File (PDF/DOC, max 20MB)</label>
                    <input type="file" accept=".pdf,.doc,.docx"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      className={ic} />
                    {editing?.filePath && !file && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <FiCheckCircle /> Current file attached. Upload new to replace.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center gap-2 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
                {saving ? <><FiRefreshCw className="animate-spin" /> Saving...</> : "Save Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Confirmation ─────────────────────────────────────── */}
      {approveId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-2xl text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Approve Document?</h3>
            <p className="text-sm text-gray-500 mb-5">This will change the document status to Approved.</p>
            <div className="flex gap-3">
              <button onClick={() => setApproveId(null)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => approve(approveId)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold">Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ───────────────────────────────────────── */}
      {delConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-2xl text-red-500" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Delete Document?</h3>
            <p className="text-sm text-gray-500 mb-1">{delConfirm.documentNumber}</p>
            <p className="text-xs text-gray-400 mb-5">{delConfirm.documentName || delConfirm.title}</p>
            <div className="flex gap-3">
              <button onClick={() => setDelConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDel}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
