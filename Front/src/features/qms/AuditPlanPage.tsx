
import { Fragment, useEffect, useRef, useState } from "react";
import { auditorApi, auditApi, certApi } from "../../api/qms.api";
import type { AuditPlan, Certification, Auditor, CertRef, InputChg } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiEdit, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
  FiFilter, FiChevronDown, FiChevronUp, FiDownload, FiPrinter, FiEye,
  FiEyeOff, FiCheckCircle, FiClock, FiAlertTriangle, FiBarChart2,
  FiFileText, FiLayers, FiCopy, FiGrid, FiList
} from "react-icons/fi";

const AUDIT_TYPES = ["INTERNAL","EXTERNAL","SURVEILLANCE","RE_AUDIT","RECERTIFICATION"];
const PLAN_STATUSES = ["DRAFT","PLANNED","APPROVED","SCHEDULED","IN_PROGRESS","COMPLETED","CANCELLED"];
const APPROVAL_STATUSES = ["PENDING","APPROVED","REJECTED"];
const STATUS_FLOW = ["DRAFT","PLANNED","APPROVED","SCHEDULED","IN_PROGRESS","NC_OPEN","CAPA","CLOSED"];
const statusLabel = (s: string) => s === "CAPA" ? "CAR" : s.replace(/_/g, " ");

const EMPTY: Partial<AuditPlan> = {
  certification: null as CertRef | null, auditType: "INTERNAL", auditTitle: "",
  leadAuditor: "", auditorTeam: "", scope: "", auditCriteria: "", objective: "",
  plannedStartDate: "", plannedEndDate: "", actualStartDate: "", actualEndDate: "",
  durationDays: "", status: "PLANNED", approvalStatus: "PENDING", approvedBy: "", remarks: "",
};

function calcDuration(start: string, end: string) {
  if (!start || !end) return "";
  const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return d > 0 ? String(d) : "";
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600", PLANNED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700", SCHEDULED: "bg-purple-100 text-purple-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700", NC_OPEN: "bg-orange-100 text-orange-700",
  CAPA: "bg-red-100 text-red-700", COMPLETED: "bg-teal-100 text-teal-700",
  CANCELLED: "bg-gray-100 text-gray-500", CLOSED: "bg-green-100 text-green-800",
};

const APPROVAL_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AuditPlanPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [rows, setRows] = useState<AuditPlan[]>([]);
  const [filtered, setFiltered] = useState<AuditPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [certFilter, setCertFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AuditPlan | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [viewPlan, setViewPlan] = useState<AuditPlan | null>(null);
  const [teamOpen, setTeamOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
    auditorApi.getAll().then((d: unknown) => setAuditors(Array.isArray(d) ? d as Auditor[] : [])).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const p = certFilter ? auditApi.getPlansByCert(certFilter) : auditApi.getPlans();
    p.then((d: unknown) => setRows(Array.isArray(d) ? d as AuditPlan[] : [])).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [certFilter]);

  useEffect(() => {
    let r = [...rows];
    if (statusFilter) r = r.filter(x => x.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => [x.auditRefNo, x.leadAuditor, x.auditTitle, x.auditType].some(v => v?.toLowerCase().includes(q)));
    }
    if (sortConfig) {
      r = [...r].sort((a, b) => {
        const av = a[sortConfig.key], bv = b[sortConfig.key];
        if (av == null) return 1; if (bv == null) return -1;
        return sortConfig.dir === "asc" ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
      });
    }
    setFiltered(r);
  }, [rows, statusFilter, search, sortConfig]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) setTeamOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sort = (key: string) => {
    setSortConfig(prev => prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };
  const sortIcon = (key: string) => sortConfig?.key === key
    ? (sortConfig.dir === "asc" ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />)
    : null;

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY, certification: certFilter ? { id: certFilter } : null as CertRef | null }); setShowModal(true); };
  const openEdit = (r: AuditPlan) => { setEditing(r); setForm({ ...EMPTY, ...r }); setShowModal(true); };

  const clone = async (r: AuditPlan) => {
    const { id: _id, auditRefNo: _ref, ...rest } = r;
    try { await auditApi.createPlan({ ...rest, status: "DRAFT", approvalStatus: "PENDING", actualStartDate: null, actualEndDate: null }); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Clone failed")); }
  };

  const del = async (id: number) => {
    try { await auditApi.deletePlan(id); setDeleteId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
  };

  const sanitizeDates = (obj: typeof EMPTY) => {
    const DATE_FIELDS = ["plannedStartDate","plannedEndDate","actualStartDate","actualEndDate"] as const;
    const r = { ...obj } as Record<string, unknown>;
    DATE_FIELDS.forEach(k => { if (r[k] === "") r[k] = null; });
    return r;
  };

  const save = async () => {
    if (!form.leadAuditor || !form.plannedStartDate) { alert("Lead Auditor and Planned Start Date are required."); return; }
    setSaving(true);
    const payload = sanitizeDates(form);
    try {
      if (editing) await auditApi.updatePlan(editing.id, payload);
      else await auditApi.createPlan(payload);
      setShowModal(false); load();
    } catch (e: unknown) { alert(apiMsg(e, "Save failed")); }
    finally { setSaving(false); }
  };

  const f = (k: string) => (e: InputChg) => {
    const v = e.target.value;
    const updated = { ...form, [k]: v };
    if (k === "plannedStartDate" || k === "plannedEndDate")
      updated.durationDays = calcDuration(updated.plannedStartDate, updated.plannedEndDate);
    setForm(updated);
  };

  const toggleTeam = (name: string) => {
    const cur = form.auditorTeam ? form.auditorTeam.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    const idx = cur.indexOf(name);
    if (idx >= 0) cur.splice(idx, 1); else cur.push(name);
    setForm({ ...form, auditorTeam: cur.join(", ") });
  };

  const teamMembers: string[] = form.auditorTeam ? form.auditorTeam.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  const printPlan = (r: AuditPlan) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Audit Plan</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#222}h2{color:#280882;border-bottom:2px solid #280882;padding-bottom:6px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #ccc;padding:7px 10px}th{background:#f3f3f3;text-align:left;color:#555;font-size:11px;text-transform:uppercase}</style>
</head><body>
<h2>AUDIT PLAN — ${r.auditRefNo||"DRAFT"}</h2>
<table>
<tr><th>Ref No.</th><td>${r.auditRefNo||"—"}</td><th>Type</th><td>${r.auditType||"—"}</td></tr>
<tr><th>Title</th><td colspan="3">${r.auditTitle||"—"}</td></tr>
<tr><th>Standard</th><td>${r.certification?.code||"—"}</td><th>Status</th><td>${r.status||"—"}</td></tr>
<tr><th>Lead Auditor</th><td>${r.leadAuditor||"—"}</td><th>Auditor Team</th><td>${r.auditorTeam||"—"}</td></tr>
<tr><th>Planned Start</th><td>${r.plannedStartDate||"—"}</td><th>Planned End</th><td>${r.plannedEndDate||"—"}</td></tr>
<tr><th>Actual Start</th><td>${r.actualStartDate||"—"}</td><th>Actual End</th><td>${r.actualEndDate||"—"}</td></tr>
<tr><th>Duration (days)</th><td>${r.durationDays||"—"}</td><th>Approval</th><td>${r.approvalStatus||"PENDING"}</td></tr>
<tr><th>Approved By</th><td colspan="3">${r.approvedBy||"—"}</td></tr>
<tr><th>Scope</th><td colspan="3">${r.scope||"—"}</td></tr>
<tr><th>Audit Criteria</th><td colspan="3">${r.auditCriteria||"—"}</td></tr>
<tr><th>Objective</th><td colspan="3">${r.objective||"—"}</td></tr>
<tr><th>Remarks</th><td colspan="3">${r.remarks||"—"}</td></tr>
</table></body></html>`);
    w.document.close(); w.print();
  };

  const exportCSV = () => {
    const h = ["Ref No","Standard","Type","Title","Lead Auditor","Team","Start","End","Days","Status","Approval","Approved By"];
    const data = filtered.map(r => [r.auditRefNo||"",r.certification?.code||"",r.auditType||"",`"${r.auditTitle||""}"`,r.leadAuditor||"",`"${r.auditorTeam||""}"`,r.plannedStartDate||"",r.plannedEndDate||"",r.durationDays||"",r.status||"",r.approvalStatus||"",r.approvedBy||""].join(","));
    const blob = new Blob([[h.join(","),...data].join("\n")],{type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "AuditPlans.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  const stats = {
    total: filtered.length,
    planned: filtered.filter(r => r.status === "PLANNED").length,
    approved: filtered.filter(r => r.approvalStatus === "APPROVED").length,
    inProgress: filtered.filter(r => r.status === "IN_PROGRESS").length,
    completed: filtered.filter(r => ["COMPLETED","CLOSED"].includes(r.status)).length,
    cancelled: filtered.filter(r => r.status === "CANCELLED").length,
  };

  const inp = "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";

  if (loading && rows.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Audit Plans...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-5 border border-purple-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Audit Plan Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Create, track and manage all internal audit plans</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setViewMode(v => v === "table" ? "card" : "table")} className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-400 text-sm flex items-center gap-2 transition-all">
              {viewMode === "table" ? <><FiGrid /> Card View</> : <><FiList /> Table View</>}
            </button>
            <button onClick={() => setShowFilters(f => !f)} className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 text-sm flex items-center gap-2 transition-all">
              <FiFilter /> Filters
            </button>
            <button onClick={exportCSV} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 text-sm flex items-center gap-2 transition-all">
              <FiDownload /> Export
            </button>
            <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 text-sm flex items-center gap-2 transition-all">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={openAdd} className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl hover:from-purple-800 hover:to-indigo-700 text-sm font-semibold flex items-center gap-2 shadow-lg transition-all">
              <FiPlus /> New Audit Plan
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
          {[
            { label: "Total Plans", value: stats.total, from: "from-purple-600", to: "to-indigo-600", icon: <FiFileText className="text-xl" /> },
            { label: "Planned", value: stats.planned, from: "from-blue-500", to: "to-blue-600", icon: <FiClock className="text-xl" /> },
            { label: "Approved", value: stats.approved, from: "from-green-500", to: "to-emerald-600", icon: <FiCheckCircle className="text-xl" /> },
            { label: "In Progress", value: stats.inProgress, from: "from-yellow-500", to: "to-orange-500", icon: <FiBarChart2 className="text-xl" /> },
            { label: "Completed", value: stats.completed, from: "from-teal-500", to: "to-teal-600", icon: <FiLayers className="text-xl" /> },
            { label: "Cancelled", value: stats.cancelled, from: "from-gray-500", to: "to-gray-600", icon: <FiAlertTriangle className="text-xl" /> },
          ].map(k => (
            <div key={k.label} className={`bg-gradient-to-br ${k.from} ${k.to} text-white p-4 rounded-xl shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">{k.icon}</div>
                <div><p className="text-xs opacity-90">{k.label}</p><p className="text-2xl font-bold">{k.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search ref no, auditor, title, type..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white text-sm" />
            </div>
            <select value={certFilter ?? ""} onChange={e => setCertFilter(e.target.value ? Number(e.target.value) : null)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
              <option value="">All Standards</option>
              {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
              <option value="">All Status</option>
              {PLAN_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => { setSearch(""); setStatusFilter(""); setCertFilter(null); }} className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-600 hover:border-red-300 hover:text-red-600 transition-all flex items-center gap-2">
              <FiX /> Clear
            </button>
          </div>
          {showFilters && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-purple-100 text-xs text-gray-500 flex items-center gap-3 flex-wrap">
              <span className="font-medium text-gray-700">Active Filters:</span>
              {certFilter && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Standard: {certs.find(c => c.id === certFilter)?.code}</span>}
              {statusFilter && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Status: {statusFilter}</span>}
              {search && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Search: "{search}"</span>}
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 text-sm text-gray-500">Showing {filtered.length} of {rows.length} audit plans</div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#280882] to-indigo-700 text-white">
                  {[["auditRefNo","Ref No."],["auditType","Type"],["auditTitle","Title"],["leadAuditor","Lead Auditor"],["plannedStartDate","Start Date"],["plannedEndDate","End Date"],["durationDays","Days"],["status","Status"],["approvalStatus","Approval"]].map(([k,h]) => (
                    <th key={k} className="px-4 py-3.5 text-left cursor-pointer hover:bg-white/10 whitespace-nowrap transition-colors" onClick={() => sort(k)}>
                      <div className="flex items-center gap-1">{h} {sortIcon(k)}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-left">Standard</th>
                  <th className="px-4 py-3.5 text-left">Actions</th>
                  <th className="px-4 py-3.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={12} className="py-16 text-center">
                    <FiFileText className="text-5xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No audit plans found</p>
                    <button onClick={openAdd} className="mt-3 px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl text-sm flex items-center gap-2 mx-auto"><FiPlus /> Add First Plan</button>
                  </td></tr>
                ) : filtered.map((r: AuditPlan) => (
                  <Fragment key={r.id}>
                    <tr className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all group">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-purple-700">{r.auditRefNo || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-medium">{r.auditType}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium max-w-[140px] truncate" title={r.auditTitle}>{r.auditTitle || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.leadAuditor || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.plannedStartDate || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.plannedEndDate || "—"}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{r.durationDays || "—"}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[r.status] || "bg-gray-100 text-gray-600"}`}>{statusLabel(r.status)}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${APPROVAL_BADGE[r.approvalStatus] || "bg-gray-100 text-gray-600"}`}>{r.approvalStatus || "PENDING"}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{r.certification?.code || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewPlan(r)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="View"><FiEye /></button>
                          <button onClick={() => openEdit(r)} className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors" title="Edit"><FiEdit /></button>
                          <button onClick={() => clone(r)} className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors" title="Clone"><FiCopy /></button>
                          <button onClick={() => printPlan(r)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Print"><FiPrinter /></button>
                          <button onClick={() => setDeleteId(r.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Delete"><FiTrash2 /></button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => setExpandedRows(prev => { const n = new Set(prev); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })} className="text-gray-400 hover:text-purple-600 transition-colors">
                          {expandedRows.has(r.id) ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(r.id) && (
                      <tr className="bg-purple-50/60">
                        <td colSpan={12} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                            <div>
                              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1"><FiFileText className="text-purple-600" /> Plan Details</p>
                              <dl className="space-y-1.5">
                                {[["Audit Title", r.auditTitle],["Lead Auditor", r.leadAuditor],["Auditor Team", r.auditorTeam],["Audit Coordinator", r.auditCoordinator]].map(([l,v]) => (
                                  <div key={l} className="flex gap-2"><dt className="text-gray-500 w-32 shrink-0">{l}:</dt><dd className="font-medium text-gray-800">{v || "—"}</dd></div>
                                ))}
                              </dl>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1"><FiClock className="text-purple-600" /> Timeline</p>
                              <dl className="space-y-1.5">
                                {[["Planned Start", r.plannedStartDate],["Planned End", r.plannedEndDate],["Actual Start", r.actualStartDate],["Actual End", r.actualEndDate],["Duration", r.durationDays ? r.durationDays + " days" : "—"]].map(([l,v]) => (
                                  <div key={l} className="flex gap-2"><dt className="text-gray-500 w-32 shrink-0">{l}:</dt><dd className="font-medium text-gray-800">{v || "—"}</dd></div>
                                ))}
                              </dl>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1"><FiCheckCircle className="text-purple-600" /> Scope & Objective</p>
                              {r.scope && <p className="text-xs text-gray-600 mb-2"><span className="font-medium">Scope: </span>{r.scope}</p>}
                              {r.auditCriteria && <p className="text-xs text-gray-600 mb-2"><span className="font-medium">Criteria: </span>{r.auditCriteria}</p>}
                              {r.objective && <p className="text-xs text-gray-600"><span className="font-medium">Objective: </span>{r.objective}</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r: AuditPlan) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-[#280882] to-indigo-700 p-4 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono font-bold text-white text-sm">{r.auditRefNo || "DRAFT"}</p>
                    <p className="text-purple-200 text-xs mt-0.5">{r.auditTitle || r.auditType}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[r.status] || "bg-gray-100 text-gray-600"}`}>{statusLabel(r.status)}</span>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                {[["Standard", r.certification?.code || "—"],["Lead Auditor", r.leadAuditor || "—"],["Start Date", r.plannedStartDate || "—"],["End Date", r.plannedEndDate || "—"],["Duration", r.durationDays ? r.durationDays + " days" : "—"]].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium text-gray-800">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Approval</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${APPROVAL_BADGE[r.approvalStatus] || "bg-gray-100 text-gray-600"}`}>{r.approvalStatus || "PENDING"}</span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => setViewPlan(r)} className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 flex items-center justify-center gap-1"><FiEye /> View</button>
                  <button onClick={() => openEdit(r)} className="flex-1 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 flex items-center justify-center gap-1"><FiEdit /> Edit</button>
                  <button onClick={() => printPlan(r)} className="py-1.5 px-2.5 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-gray-100"><FiPrinter /></button>
                  <button onClick={() => setDeleteId(r.id)} className="py-1.5 px-2.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 bg-white rounded-2xl shadow p-16 text-center">
              <FiFileText className="text-5xl text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No plans found</p>
              <button onClick={openAdd} className="mt-3 px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl text-sm flex items-center gap-2 mx-auto"><FiPlus /> Add Plan</button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#280882] to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{editing ? "Edit Audit Plan" : "New Audit Plan"}</h2>
                {editing?.auditRefNo && <p className="text-purple-200 text-xs font-mono mt-0.5">{editing.auditRefNo}</p>}
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"><FiX /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Certification Standard *</label>
                  <select value={form.certification?.id || ""} onChange={e => setForm({ ...form, certification: e.target.value ? { id: Number(e.target.value) } : null })} className={inp}>
                    <option value="">Select standard...</option>
                    {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Audit Type *</label>
                  <select value={form.auditType} onChange={f("auditType")} className={inp}>
                    {AUDIT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Audit Title</label>
                  <input value={form.auditTitle || ""} onChange={f("auditTitle")} placeholder="e.g. Annual ISO 9001 Internal Audit 2026" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Lead Auditor *</label>
                  <select value={form.leadAuditor || ""} onChange={f("leadAuditor")} className={inp}>
                    <option value="">Select lead auditor...</option>
                    {auditors.filter((a: Auditor) => a.status === "ACTIVE").map((a: Auditor) => <option key={a.id} value={a.name}>{a.name}{a.auditorCode ? ` (${a.auditorCode})` : ""}</option>)}
                  </select>
                </div>
                <div ref={teamRef} className="relative">
                  <label className={lbl}>Auditor Team (Multi-select)</label>
                  <div onClick={() => setTeamOpen(!teamOpen)} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer flex flex-wrap gap-1 min-h-[38px] focus:ring-2 focus:ring-purple-500 bg-white">
                    {teamMembers.length === 0 ? <span className="text-gray-400">Click to select team members...</span>
                      : teamMembers.map((m: string) => (
                        <span key={m} onClick={e => { e.stopPropagation(); toggleTeam(m); }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 cursor-pointer hover:bg-red-100 hover:text-red-600">
                          {m} ×
                        </span>
                      ))}
                  </div>
                  {teamOpen && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {auditors.filter((a: Auditor) => a.status === "ACTIVE").map((a: Auditor) => (
                        <label key={a.id} className="flex items-center gap-2 px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm">
                          <input type="checkbox" checked={teamMembers.includes(a.name)} onChange={() => toggleTeam(a.name)} className="rounded accent-purple-700" />
                          <span>{a.name}</span>
                          {a.auditorCode && <span className="text-gray-400 text-xs">({a.auditorCode})</span>}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className={lbl}>Planned Start Date *</label>
                  <input type="date" value={form.plannedStartDate || ""} onChange={f("plannedStartDate")} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Planned End Date</label>
                  <input type="date" value={form.plannedEndDate || ""} onChange={f("plannedEndDate")} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Duration (Days) — Auto Calculated</label>
                  <input readOnly value={form.durationDays || ""} placeholder="Auto-calculated" className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-400 cursor-default" />
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={f("status")} className={inp}>
                    {PLAN_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Actual Start Date</label>
                  <input type="date" value={form.actualStartDate || ""} onChange={f("actualStartDate")} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Actual End Date</label>
                  <input type="date" value={form.actualEndDate || ""} onChange={f("actualEndDate")} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Approval Status</label>
                  <select value={form.approvalStatus || "PENDING"} onChange={f("approvalStatus")} className={inp}>
                    {APPROVAL_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Approved By</label>
                  <input value={form.approvedBy || ""} onChange={f("approvedBy")} placeholder="Name of the approver" className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Scope</label>
                  <textarea value={form.scope || ""} onChange={f("scope")} rows={2} placeholder="Departments, processes, and locations covered..." className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Audit Criteria</label>
                  <textarea value={form.auditCriteria || ""} onChange={f("auditCriteria")} rows={2} placeholder="ISO clause references, SOPs, standards..." className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Audit Objective</label>
                  <textarea value={form.objective || ""} onChange={f("objective")} rows={2} placeholder="Purpose and goals of this audit..." className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Remarks</label>
                  <textarea value={form.remarks || ""} onChange={f("remarks")} rows={2} className={inp} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
              <button onClick={save} disabled={saving} className="px-6 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#280882] to-indigo-600 hover:from-purple-800 hover:to-indigo-700 disabled:opacity-60 shadow-lg transition-all flex items-center gap-2">
                {saving ? <><FiRefreshCw className="animate-spin" /> Saving...</> : editing ? <><FiCheckCircle /> Update Plan</> : <><FiPlus /> Create Plan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#280882] to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Audit Plan Details</h2>
                <p className="text-purple-200 text-xs font-mono mt-0.5">{viewPlan.auditRefNo || "DRAFT"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => printPlan(viewPlan)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs flex items-center gap-1 transition-all"><FiPrinter /> Print</button>
                <button onClick={() => setViewPlan(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"><FiX /></button>
              </div>
            </div>
            {/* Status Flow */}
            <div className="px-5 py-3 bg-gray-50 border-b overflow-x-auto">
              <div className="flex items-center gap-1 min-w-max">
                {STATUS_FLOW.map((s, i) => {
                  const curIdx = STATUS_FLOW.indexOf(viewPlan.status);
                  const isActive = s === viewPlan.status;
                  const isDone = i < curIdx;
                  return (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${isActive ? "text-white shadow-sm bg-gradient-to-r from-[#280882] to-indigo-600" : isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {statusLabel(s)}
                      </div>
                      {i < STATUS_FLOW.length - 1 && <span className="text-gray-300 text-xs">›</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[["Standard", viewPlan.certification?.code || "—"],["Type", viewPlan.auditType],["Lead Auditor", viewPlan.leadAuditor || "—"],["Auditor Team", viewPlan.auditorTeam || "—"],["Planned Start", viewPlan.plannedStartDate || "—"],["Planned End", viewPlan.plannedEndDate || "—"],["Actual Start", viewPlan.actualStartDate || "—"],["Actual End", viewPlan.actualEndDate || "—"],["Duration (Days)", viewPlan.durationDays || "—"],["Approval Status", viewPlan.approvalStatus || "PENDING"],["Approved By", viewPlan.approvedBy || "—"]].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{l}</p>
                    <p className="font-semibold text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
              {viewPlan.auditTitle && <div className="mt-3 bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Title</p><p className="font-semibold text-gray-800">{viewPlan.auditTitle}</p></div>}
              {viewPlan.scope && <div className="mt-3 bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Scope</p><p className="text-gray-700 text-sm">{viewPlan.scope}</p></div>}
              {viewPlan.auditCriteria && <div className="mt-3 bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Criteria</p><p className="text-gray-700 text-sm">{viewPlan.auditCriteria}</p></div>}
              {viewPlan.objective && <div className="mt-3 bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Objective</p><p className="text-gray-700 text-sm">{viewPlan.objective}</p></div>}
              {viewPlan.remarks && <div className="mt-3 bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Remarks</p><p className="text-gray-700 text-sm">{viewPlan.remarks}</p></div>}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setViewPlan(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Close</button>
              <button onClick={() => { setViewPlan(null); openEdit(viewPlan); }} className="px-5 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#280882] to-indigo-600 hover:from-purple-800 hover:to-indigo-700 flex items-center gap-2">
                <FiEdit /> Edit Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Audit Plan</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this audit plan? All associated observations and schedules may be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => del(deleteId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-2">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
