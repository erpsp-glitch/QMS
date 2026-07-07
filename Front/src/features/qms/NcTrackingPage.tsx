import { useEffect, useState } from "react";
import { auditApi, certApi, downloadBlob } from "../../api/qms.api";
import type { Certification, AuditPlan, AuditObservation, NC, InputChg } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiEdit, FiX, FiAlertCircle, FiRefreshCw, 
  FiChevronDown, FiChevronUp, FiDownload, FiAlertTriangle,
  FiCheckCircle, FiFileText, FiShield, FiClock,
  FiEye, FiGrid, FiList
} from "react-icons/fi";

const NC_STATUSES = ["OPEN","CONTAINMENT_DONE","ROOT_CAUSE_SUBMITTED","ACTION_INITIATED","PENDING_VERIFICATION","VERIFIED","CLOSED"];
const NC_TYPES    = ["MINOR","MAJOR"];
const NC_PRIORITIES = ["CRITICAL","HIGH","MEDIUM","LOW"];
const RCA_METHODS = ["5_WHY","FISHBONE","WHY_WHY","FAULT_TREE"];

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  CONTAINMENT_DONE: "bg-orange-100 text-orange-700",
  ROOT_CAUSE_SUBMITTED: "bg-amber-100 text-amber-700",
  ACTION_INITIATED: "bg-blue-100 text-blue-700",
  PENDING_VERIFICATION: "bg-yellow-100 text-yellow-700",
  VERIFIED: "bg-indigo-100 text-indigo-700",
  CLOSED: "bg-green-100 text-green-700",
};

const STATUS_GRAD: Record<string, string> = {
  OPEN: "from-red-500 to-red-600",
  CONTAINMENT_DONE: "from-orange-500 to-orange-600",
  ROOT_CAUSE_SUBMITTED: "from-amber-500 to-amber-600",
  ACTION_INITIATED: "from-blue-500 to-blue-600",
  PENDING_VERIFICATION: "from-yellow-500 to-yellow-600",
  VERIFIED: "from-indigo-500 to-indigo-600",
  CLOSED: "from-green-500 to-emerald-600",
};

const EMPTY_NC = {
  ncType: "MINOR", clauseNo: "", ncDescription: "", department: "",
  auditorName: "", auditeeName: "", auditDate: "",
  containmentAction: "", immediateCorrection: "",
  rootCauseMethod: "5_WHY", rootCause: "",
  correctiveAction: "", responsiblePerson: "", targetDate: "",
  priority: "MEDIUM", verificationBy: "", verificationDate: "",
  verificationRemarks: "", evidencePath: "", closureDate: "",
  status: "OPEN", auditPlan: null as Pick<AuditPlan, "id"> | null
};

export default function NcTrackingPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [certId, setCertId] = useState<number | null>(null);
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  // New NC Modal
  const [showNewNc, setShowNewNc] = useState(false);
  const [newNcForm, setNewNcForm] = useState<typeof EMPTY_NC>({ ...EMPTY_NC });
  const [savingNew, setSavingNew] = useState(false);
  const [rows, setRows] = useState<NC[]>([]);
  const [filtered, setFiltered] = useState<NC[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<NC | null>(null);
  const [form, setForm] = useState<Partial<NC>>({});
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewNc, setViewNc] = useState<NC | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [closeNcId, setCloseNcId] = useState<number | null>(null);
  const [observations, setObservations] = useState<AuditObservation[]>([]);
  const [loadingObs, setLoadingObs] = useState(false);
  const [selectedObsId, setSelectedObsId] = useState<number | "">("");

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
    auditApi.getPlans().then((d: unknown) => setPlans(Array.isArray(d) ? d as AuditPlan[] : [])).catch(() => {});
  }, []);

  const saveNewNc = async () => {
    if (!newNcForm.auditPlan) { alert("Select an Audit Plan."); return; }
    if (!newNcForm.ncDescription) { alert("NC Description is required."); return; }
    setSavingNew(true);
    try {
      await auditApi.createNc({ ...newNcForm });
      setShowNewNc(false);
      setNewNcForm({ ...EMPTY_NC });
      setObservations([]);
      setSelectedObsId("");
      load();
    } catch (e: unknown) { alert(apiMsg(e, "Save failed")); }
    finally { setSavingNew(false); }
  };

  const ffn = (k: string) => (e: InputChg) => setNewNcForm(p => ({ ...p, [k]: e.target.value } as typeof EMPTY_NC));

  const handlePlanSelect = async (planId: number | null) => {
    setNewNcForm(p => ({ ...p, auditPlan: planId ? { id: planId } : null } as typeof EMPTY_NC));
    setSelectedObsId("");
    setObservations([]);
    if (!planId) return;
    setLoadingObs(true);
    try {
      const obs = await auditApi.getObservationsForNcCreation(planId) as AuditObservation[];
      setObservations(Array.isArray(obs) ? obs : []);
    } catch { setObservations([]); }
    finally { setLoadingObs(false); }
  };

  const applyObservation = (obsId: number) => {
    setSelectedObsId(obsId);
    const obs = observations.find(o => o.id === obsId);
    if (!obs) return;
    const plan = plans.find(p => p.id === newNcForm.auditPlan?.id);
    const ncType = obs.findingType?.toUpperCase().includes("MAJOR") ? "MAJOR" : "MINOR";
    const sev = (obs.severity || obs.riskLevel || "").toUpperCase();
    const priority = sev === "CRITICAL" ? "CRITICAL" : sev === "HIGH" ? "HIGH" : sev === "LOW" ? "LOW" : "MEDIUM";
    setNewNcForm(p => ({
      ...p,
      clauseNo: obs.clauseNo || p.clauseNo,
      ncDescription: obs.observationDescription || p.ncDescription,
      department: obs.department || p.department,
      auditorName: (plan as AuditPlan | undefined)?.leadAuditor || p.auditorName,
      auditeeName: obs.auditee || p.auditeeName,
      auditDate: obs.auditDate || p.auditDate,
      ncType,
      priority,
    }));
  };

  const load = () => {
    setLoading(true);
    const p = certId ? auditApi.getNcsByCert(certId) : auditApi.getAllNcs();
    p.then((d: unknown) => setRows(Array.isArray(d) ? d as NC[] : [])).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [certId]);

  useEffect(() => {
    let r = [...rows];
    if (statusFilter) r = r.filter(x => x.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => [x.ncNumber, x.ncDescription, x.responsiblePerson, x.clauseNo, x.department].some(v => v?.toLowerCase().includes(q)));
    }
    if (sortConfig) {
      r = [...r].sort((a, b) => {
        const av = a[sortConfig.key as keyof NC], bv = b[sortConfig.key as keyof NC];
        if (av == null) return 1; if (bv == null) return -1;
        return sortConfig.dir === "asc" ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
      });
    }
    setFiltered(r);
  }, [rows, statusFilter, search, sortConfig]);

  const sort = (key: string) => setSortConfig(prev => prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  const sortIcon = (key: string) => sortConfig?.key === key ? (sortConfig.dir === "asc" ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />) : null;

  const openEdit = (r: NC) => { setSelected(r); setForm({ ...r }); };
  const ff = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as Partial<NC>));

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try { await auditApi.updateNc(selected.id, form); setSelected(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Save failed")); }
    finally { setSaving(false); }
  };

  const close = async (id: number) => {
    try { await auditApi.closeNc(id); setCloseNcId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Close failed")); }
  };

  const downloadReport = async () => {
    if (!certId) { alert("Select a certification first."); return; }
    setDownloading(true);
    try { const res = await auditApi.downloadNcReport(certId); downloadBlob(res.data, "NC_Report.pdf"); }
    catch { alert("Download failed"); }
    finally { setDownloading(false); }
  };

  const stats = {
    total: filtered.length,
    open: filtered.filter(r => r.status === "OPEN").length,
    inProgress: filtered.filter(r => ["ACTION_INITIATED","PENDING_VERIFICATION"].includes(r.status ?? "")).length,
    verified: filtered.filter(r => r.status === "VERIFIED").length,
    closed: filtered.filter(r => r.status === "CLOSED").length,
    major: filtered.filter(r => r.ncType === "MAJOR").length,
  };

  const inp = "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";

  if (loading && rows.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading NC / CAR Data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-5 border border-red-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              NC / CAR Tracking
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Track non-conformances and corrective action requests</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setViewMode(v => v === "table" ? "card" : "table")} className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-red-400 text-sm flex items-center gap-2 transition-all">
              {viewMode === "table" ? <><FiGrid /> Card View</> : <><FiList /> Table View</>}
            </button>
            {certId && (
              <button onClick={downloadReport} disabled={downloading} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 text-sm flex items-center gap-2 transition-all">
                {downloading ? <FiRefreshCw className="animate-spin" /> : <FiDownload />} NC Report
              </button>
            )}
            <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 text-sm flex items-center gap-2 transition-all">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={() => setShowNewNc(true)} className="px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 text-sm font-semibold flex items-center gap-2 shadow-lg transition-all">
              <FiPlus /> New NC
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
          {[
            { label: "Total NCs", value: stats.total, from: "from-gray-600", to: "to-gray-700", icon: <FiFileText className="text-xl" /> },
            { label: "Open", value: stats.open, from: "from-red-500", to: "to-red-600", icon: <FiAlertTriangle className="text-xl" /> },
            { label: "In Progress", value: stats.inProgress, from: "from-orange-500", to: "to-orange-600", icon: <FiClock className="text-xl" /> },
            { label: "Verified", value: stats.verified, from: "from-blue-500", to: "to-blue-600", icon: <FiShield className="text-xl" /> },
            { label: "Closed", value: stats.closed, from: "from-green-500", to: "to-emerald-600", icon: <FiCheckCircle className="text-xl" /> },
            { label: "Major NC", value: stats.major, from: "from-red-700", to: "to-red-800", icon: <FiAlertCircle className="text-xl" /> },
          ].map(k => (
            <div key={k.label} className={`bg-gradient-to-br ${k.from} ${k.to} text-white p-4 rounded-xl shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">{k.icon}</div>
                <div><p className="text-xs opacity-90">{k.label}</p><p className="text-2xl font-bold">{k.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search NC number, description, responsible person..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 bg-white text-sm" />
            </div>
            <select value={certId ?? ""} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-red-400">
              <option value="">All Standards</option>
              {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-red-400">
              <option value="">All Status</option>
              {NC_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => { setSearch(""); setStatusFilter(""); }} className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-600 hover:border-red-300 hover:text-red-600 transition-all flex items-center gap-2">
              <FiX /> Clear
            </button>
          </div>
        </div>
      </div>

      <div className="mb-3 text-sm text-gray-500">Showing {filtered.length} of {rows.length} non-conformances</div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                  {[["ncNumber","NC Number"],["ncType","Type"],["clauseNo","Clause"],["ncDescription","Description"],["department","Department"],["responsiblePerson","Responsible"],["targetDate","Target Date"],["status","Status"]].map(([k,h]) => (
                    <th key={k} className="px-4 py-3.5 text-left cursor-pointer hover:bg-white/10 whitespace-nowrap transition-colors" onClick={() => sort(k)}>
                      <div className="flex items-center gap-1">{h} {sortIcon(k)}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-left">Actions</th>
                  <th className="px-4 py-3.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="py-16 text-center">
                    <FiCheckCircle className="text-5xl text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No non-conformances found</p>
                    <p className="text-gray-300 text-sm">NCs are created automatically when observations are raised</p>
                  </td></tr>
                ) : filtered.map((r: NC) => (
                  <>
                    <tr key={r.id} className="hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all group">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-red-700">{r.ncNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.ncType === "MAJOR" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{r.ncType}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.clauseNo || "—"}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate" title={r.ncDescription}>{r.ncDescription}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.department || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.responsiblePerson || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.targetDate || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[r.status ?? ""] || "bg-gray-100 text-gray-600"}`}>{(r.status || "").replace(/_/g, " ")}</span>
                          {r.priority && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.priority === "CRITICAL" ? "bg-red-200 text-red-800" : r.priority === "HIGH" ? "bg-red-50 text-red-600" : r.priority === "LOW" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{r.priority}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewNc(r)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors" title="View"><FiEye /></button>
                          <button onClick={() => openEdit(r)} className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors" title="CAR"><FiEdit /></button>
                          {r.status !== "CLOSED" && (
                            <button onClick={() => setCloseNcId(r.id)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors" title="Close NC"><FiCheckCircle /></button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => setExpandedRows(prev => { const n = new Set(prev); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })} className="text-gray-400 hover:text-red-600 transition-colors">
                          {expandedRows.has(r.id) ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(r.id) && (
                      <tr key={`exp-${r.id}`} className="bg-red-50/60">
                        <td colSpan={10} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-sm">
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Containment Action</p>
                              <p className="text-gray-600 text-xs">{r.containmentAction || r.immediateCorrection || <span className="text-gray-300">Not entered</span>}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Root Cause {r.rootCauseMethod ? <span className="text-xs text-amber-600 font-normal">({r.rootCauseMethod.replace(/_/g," ")})</span> : null}</p>
                              <p className="text-gray-600 text-xs">{r.rootCause || <span className="text-gray-300">Not entered</span>}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Corrective Action</p>
                              <p className="text-gray-600 text-xs">{r.correctiveAction || <span className="text-gray-300">Not entered</span>}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Auditor / Auditee</p>
                              <p className="text-gray-600 text-xs">{r.auditorName || "—"} / {r.auditeeName || "—"}</p>
                              {r.priority && <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${r.priority === "CRITICAL" ? "bg-red-200 text-red-800" : r.priority === "HIGH" ? "bg-red-100 text-red-700" : r.priority === "LOW" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{r.priority}</span>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r: NC) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-lg border border-red-100 hover:shadow-xl transition-all">
              <div className={`bg-gradient-to-r ${STATUS_GRAD[r.status ?? ""] || "from-gray-500 to-gray-600"} p-4 rounded-t-2xl`}>
                <div className="flex justify-between items-start">
                  <p className="font-mono font-bold text-white text-sm">{r.ncNumber}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white`}>{r.ncType}</span>
                </div>
                <p className="text-white/80 text-xs mt-1 line-clamp-2">{r.ncDescription}</p>
              </div>
              <div className="p-4 space-y-2">
                {[["Clause", r.clauseNo || "—"],["Department", r.department || "—"],["Responsible", r.responsiblePerson || "—"],["Target Date", r.targetDate || "—"]].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-sm"><span className="text-gray-500">{l}</span><span className="font-medium text-gray-800">{v}</span></div>
                ))}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => setViewNc(r)} className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 flex items-center justify-center gap-1"><FiEye /> View</button>
                  <button onClick={() => openEdit(r)} className="flex-1 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 flex items-center justify-center gap-1"><FiEdit /> CAR</button>
                  {r.status !== "CLOSED" && (
                    <button onClick={() => setCloseNcId(r.id)} className="py-1.5 px-3 bg-green-50 text-green-600 rounded-lg text-xs hover:bg-green-100"><FiCheckCircle /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 bg-white rounded-2xl shadow p-16 text-center">
              <FiCheckCircle className="text-5xl text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No non-conformances found</p>
            </div>
          )}
        </div>
      )}

      {/* View NC Modal */}
      {viewNc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{viewNc.ncNumber}</h2>
                <p className="text-red-200 text-xs mt-0.5">{viewNc.ncType} Non-Conformance</p>
              </div>
              <button onClick={() => setViewNc(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"><FiX /></button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-3 text-sm">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-1">NC Description</p>
                <p className="text-gray-700">{viewNc.ncDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Clause", viewNc.clauseNo || "—"],
                  ["Department", viewNc.department || "—"],
                  ["Type", viewNc.ncType || "—"],
                  ["Priority", viewNc.priority || "—"],
                  ["Status", (viewNc.status || "").replace(/_/g, " ")],
                  ["Audit Date", viewNc.auditDate || "—"],
                  ["Auditor", viewNc.auditorName || "—"],
                  ["Auditee", viewNc.auditeeName || "—"],
                  ["Responsible", viewNc.responsiblePerson || "—"],
                  ["Target Date", viewNc.targetDate || "—"],
                  ["Verify By", viewNc.verificationBy || "—"],
                  ["Verify Date", viewNc.verificationDate || "—"],
                  ["Closure Date", viewNc.closureDate || "—"],
                  ["RCA Method", (viewNc.rootCauseMethod || "—").replace(/_/g, " ")],
                ].map(([l,v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{l}</p>
                    <p className="font-semibold text-gray-800 text-xs">{v}</p>
                  </div>
                ))}
              </div>
              {viewNc.containmentAction && <div className="bg-orange-50 rounded-xl p-3"><p className="text-xs text-orange-500 font-medium mb-1">Containment Action</p><p className="text-gray-700 text-xs">{viewNc.containmentAction}</p></div>}
              {viewNc.immediateCorrection && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Immediate Correction</p><p className="text-gray-700 text-xs">{viewNc.immediateCorrection}</p></div>}
              {viewNc.rootCause && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Root Cause</p><p className="text-gray-700 text-xs">{viewNc.rootCause}</p></div>}
              {viewNc.correctiveAction && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Corrective Action</p><p className="text-gray-700 text-xs">{viewNc.correctiveAction}</p></div>}
              {viewNc.verificationRemarks && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Verification Remarks</p><p className="text-gray-700 text-xs">{viewNc.verificationRemarks}</p></div>}
              {viewNc.evidencePath && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-500 font-medium mb-1">Evidence</p>
                  <p className="text-gray-700 text-xs break-all">{viewNc.evidencePath}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setViewNc(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Close</button>
              <button onClick={() => { setViewNc(null); openEdit(viewNc); }} className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 flex items-center gap-2">
                <FiEdit /> Enter CAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAR Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">CAR — {selected.ncNumber}</h2>
                <p className="text-orange-100 text-xs mt-0.5">Corrective Action & Preventive Action</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"><FiX /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[72vh] space-y-4">
              <div className="bg-orange-50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-gray-700">{selected.ncDescription}</p>
                <p className="text-gray-500 mt-1 text-xs">Clause: {selected.clauseNo} · Type: {selected.ncType} · Dept: {selected.department || "—"}</p>
              </div>
              {/* Containment */}
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Containment</p>
              <div>
                <label className={lbl}>Containment Action</label>
                <textarea value={form.containmentAction || ""} onChange={ff("containmentAction")} rows={2} className={inp} placeholder="Immediate action taken to contain the issue..." />
              </div>
              <div>
                <label className={lbl}>Immediate Correction</label>
                <textarea value={form.immediateCorrection || ""} onChange={ff("immediateCorrection")} rows={2} className={inp} />
              </div>
              {/* Root Cause */}
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Root Cause Analysis</p>
              <div>
                <label className={lbl}>RCA Method</label>
                <select value={form.rootCauseMethod || "5_WHY"} onChange={ff("rootCauseMethod")} className={inp}>
                  {RCA_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Root Cause</label>
                <textarea value={form.rootCause || ""} onChange={ff("rootCause")} rows={3} className={inp} />
              </div>
              {/* Corrective Action */}
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Corrective Action</p>
              <div>
                <label className={lbl}>Corrective Action</label>
                <textarea value={form.correctiveAction || ""} onChange={ff("correctiveAction")} rows={3} className={inp} />
              </div>
              {/* Verification & Closure */}
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Verification &amp; Closure</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Responsible Person</label><input value={form.responsiblePerson || ""} onChange={ff("responsiblePerson")} className={inp} /></div>
                <div><label className={lbl}>Target Date</label><input type="date" value={form.targetDate || ""} onChange={ff("targetDate")} className={inp} /></div>
                <div><label className={lbl}>Verification By</label><input value={form.verificationBy || ""} onChange={ff("verificationBy")} className={inp} /></div>
                <div><label className={lbl}>Verification Date</label><input type="date" value={form.verificationDate || ""} onChange={ff("verificationDate")} className={inp} /></div>
                <div><label className={lbl}>Closure Date</label><input type="date" value={form.closureDate || ""} onChange={ff("closureDate")} className={inp} /></div>
                <div>
                  <label className={lbl}>Priority</label>
                  <select value={form.priority || "MEDIUM"} onChange={ff("priority")} className={inp}>
                    {NC_PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={ff("status")} className={inp}>
                    {NC_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Verification Remarks</label>
                  <textarea value={form.verificationRemarks || ""} onChange={ff("verificationRemarks")} rows={2} className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Evidence Path / Reference</label>
                  <input value={form.evidencePath || ""} onChange={ff("evidencePath")} placeholder="File path or reference to evidence document" className={inp} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setSelected(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} disabled={saving} className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-red-700 disabled:opacity-60 flex items-center gap-2">
                {saving ? <><FiRefreshCw className="animate-spin" /> Saving...</> : <><FiCheckCircle /> Save CAR</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New NC Modal */}
      {showNewNc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">New Non-Conformance</h2>
                <p className="text-red-100 text-xs mt-0.5">Register a new NC against an audit plan</p>
              </div>
              <button onClick={() => { setShowNewNc(false); setObservations([]); setSelectedObsId(""); }} className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"><FiX /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[72vh] space-y-4">
              <div>
                <label className={lbl}>Audit Plan *</label>
                <select value={newNcForm.auditPlan?.id || ""} onChange={e => handlePlanSelect(e.target.value ? Number(e.target.value) : null)} className={inp}>
                  <option value="">Select Audit Plan...</option>
                  {plans.map((p: AuditPlan) => <option key={p.id} value={p.id}>{p.planRefNo || (p as unknown as Record<string,string>).auditRefNo} — {p.auditType} ({p.status})</option>)}
                </select>
              </div>
              {newNcForm.auditPlan && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
                  <p className="font-semibold">Selected Plan: {plans.find(p => p.id === newNcForm.auditPlan?.id)?.planRefNo || (plans.find(p => p.id === newNcForm.auditPlan?.id) as unknown as Record<string,string>)?.auditRefNo}</p>
                  <p>Lead Auditor: {plans.find(p => p.id === newNcForm.auditPlan?.id)?.leadAuditor || "—"}</p>
                </div>
              )}
              {newNcForm.auditPlan && loadingObs && (
                <p className="text-xs text-orange-500 flex items-center gap-1"><FiRefreshCw className="animate-spin" /> Loading observations from audit plan...</p>
              )}
              {newNcForm.auditPlan && !loadingObs && observations.length > 0 && (
                <div>
                  <label className={lbl}>Auto-fill from Observation</label>
                  <select value={selectedObsId} onChange={e => e.target.value ? applyObservation(Number(e.target.value)) : setSelectedObsId("")} className={inp}>
                    <option value="">— Select observation to auto-fill fields —</option>
                    {observations.map(o => (
                      <option key={o.id} value={o.id}>
                        [{o.findingType}] {o.clauseNo} — {(o.observationDescription || "").slice(0, 55)}{(o.observationDescription || "").length > 55 ? "..." : ""}
                      </option>
                    ))}
                  </select>
                  {selectedObsId && (
                    <p className="text-xs text-green-600 mt-1">Fields auto-filled from observation — review and edit as needed.</p>
                  )}
                </div>
              )}
              {newNcForm.auditPlan && !loadingObs && observations.length === 0 && (
                <p className="text-xs text-gray-400">No NC observations found for this plan — fill in fields manually.</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>NC Type *</label>
                  <select value={newNcForm.ncType} onChange={ffn("ncType")} className={inp}>
                    {NC_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Priority</label>
                  <select value={newNcForm.priority} onChange={ffn("priority")} className={inp}>
                    {NC_PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Clause No.</label>
                  <input value={newNcForm.clauseNo} onChange={ffn("clauseNo")} placeholder="e.g. 8.4.1" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Audit Date</label>
                  <input type="date" value={newNcForm.auditDate || ""} onChange={ffn("auditDate")} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Auditor Name</label>
                  <input value={newNcForm.auditorName || ""} onChange={ffn("auditorName")} placeholder="Lead auditor" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Auditee Name</label>
                  <input value={newNcForm.auditeeName || ""} onChange={ffn("auditeeName")} placeholder="Auditee" className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Department</label>
                  <input value={newNcForm.department} onChange={ffn("department")} placeholder="Affected department" className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>NC Description *</label>
                  <textarea value={newNcForm.ncDescription} onChange={ffn("ncDescription")} rows={3} placeholder="Describe the non-conformance..." className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Containment Action</label>
                  <textarea value={newNcForm.containmentAction || ""} onChange={ffn("containmentAction")} rows={2} placeholder="Immediate action to contain the issue..." className={inp} />
                </div>
                <div>
                  <label className={lbl}>Responsible Person</label>
                  <input value={newNcForm.responsiblePerson || ""} onChange={ffn("responsiblePerson")} placeholder="Name" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Target Date</label>
                  <input type="date" value={newNcForm.targetDate || ""} onChange={ffn("targetDate")} className={inp} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => { setShowNewNc(false); setObservations([]); setSelectedObsId(""); }} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={saveNewNc} disabled={savingNew} className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-semibold disabled:opacity-60 shadow-lg flex items-center gap-2 hover:from-red-700 hover:to-orange-700 transition-all">
                {savingNew ? <><FiRefreshCw className="animate-spin" /> Creating...</> : <><FiPlus /> Create NC</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close NC Confirmation */}
      {closeNcId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full"><FiCheckCircle className="text-green-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Close NC</h3>
                <p className="text-sm text-gray-500">This action marks the NC as CLOSED.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to close this non-conformance? This confirms all corrective actions have been verified.</p>
            <div className="flex gap-3">
              <button onClick={() => setCloseNcId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => close(closeNcId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <FiCheckCircle /> Close NC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
