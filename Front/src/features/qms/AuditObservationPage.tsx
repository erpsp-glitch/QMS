import { useEffect, useState, useCallback } from "react";
import { auditApi, certApi, deptApi, clauseApi } from "../../api/qms.api";
import type { Certification, Department, AuditPlan, AuditSchedule, AuditObservation, ClauseMaster } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiX, FiRefreshCw, FiChevronDown, FiChevronUp,
  FiAlertTriangle, FiCheckCircle, FiBarChart2, FiFileText,
  FiEye, FiSave, FiThumbsUp, FiAlertCircle, FiCalendar, FiUser,
  FiMapPin, FiBookOpen, FiList
} from "react-icons/fi";

const BRAND = "#280882";

const FINDING_TYPES = [
  { value: "POSITIVE_OBSERVATION", label: "Conformance",  color: "bg-green-100 text-green-700",  grad: "from-green-500 to-emerald-600" },
  { value: "NEGATIVE_OBSERVATION", label: "Observation",  color: "bg-orange-100 text-orange-700", grad: "from-orange-500 to-orange-600" },
  { value: "OFI",                  label: "OFI",          color: "bg-blue-100 text-blue-700",     grad: "from-blue-500 to-blue-600" },
  { value: "NC_MINOR",             label: "Minor NC",     color: "bg-yellow-100 text-yellow-700", grad: "from-yellow-500 to-yellow-600" },
  { value: "NC_MAJOR",             label: "Major NC",     color: "bg-red-100 text-red-700",       grad: "from-red-500 to-red-600" },
];
const RISK_LEVELS    = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH"];

const isNcType = (t: string) => ["NC", "NC_MINOR", "NC_MAJOR"].includes(t);
const findingInfo = (type: string) =>
  FINDING_TYPES.find(f => f.value === type) || { label: type, color: "bg-gray-100 text-gray-600", grad: "from-gray-500 to-gray-600" };

interface ObsRow {
  clauseNo: string;
  clauseTitle: string;
  requirement: string;
  auditQuestion: string;
  findingType: string;
  observationDescription: string;
  objectiveEvidence: string;
  riskLevel: string;
  severity: string;
}
const EMPTY_OBS = (): ObsRow => ({
  clauseNo: "", clauseTitle: "", requirement: "", auditQuestion: "",
  findingType: "POSITIVE_OBSERVATION", observationDescription: "",
  objectiveEvidence: "", riskLevel: "LOW", severity: "LOW",
});

export default function AuditObservationPage() {
  const [certs, setCerts]     = useState<Certification[]>([]);
  const [depts, setDepts]     = useState<Department[]>([]);
  const [certId, setCertId]   = useState<number | null>(null);
  const [plans, setPlans]     = useState<AuditPlan[]>([]);
  const [planId, setPlanId]   = useState<number | null>(null);
  const [plan, setPlan]       = useState<AuditPlan | null>(null);
  const [schedules, setSchedules]   = useState<AuditSchedule[]>([]);
  const [allObs, setAllObs]         = useState<AuditObservation[]>([]);
  const [loadingObs, setLoadingObs]   = useState(false);
  const [loadingSched, setLoadingSched] = useState(false);
  const [expandedSchedule, setExpandedSchedule] = useState<number | null>(null);

  // Add Observation Modal
  const [addModal, setAddModal]     = useState<{ open: boolean; schedule: AuditSchedule | null }>({ open: false, schedule: null });
  const [department, setDepartment] = useState("");
  const [auditee, setAuditee]       = useState("");
  const [auditDate, setAuditDate]   = useState("");
  const [clauses, setClauses]       = useState<ClauseMaster[]>([]);
  const [loadingClauses, setLoadingClauses] = useState(false);
  const [newObs, setNewObs]         = useState<ObsRow[]>([]);
  const [saving, setSaving]         = useState(false);

  const [creatingNc, setCreatingNc]   = useState<number | null>(null);
  const [viewObs, setViewObs]         = useState<AuditObservation | null>(null);
  const [search, setSearch]           = useState("");
  const [findingFilter, setFindingFilter] = useState("");

  useEffect(() => {
    Promise.allSettled([certApi.getAll(), deptApi.getActive()])
      .then(([cRes, dRes]) => {
        setCerts(cRes.status === "fulfilled" ? (Array.isArray(cRes.value) ? cRes.value : []) : []);
        setDepts(dRes.status === "fulfilled" ? (Array.isArray(dRes.value) ? dRes.value : []) : []);
      });
  }, []);

  useEffect(() => {
    const p = certId ? auditApi.getPlansByCert(certId) : auditApi.getPlans();
    p.then((d: unknown) => setPlans(Array.isArray(d) ? d as AuditPlan[] : [])).catch(() => setPlans([]));
    setPlanId(null); setPlan(null); setSchedules([]); setAllObs([]);
  }, [certId]);

  useEffect(() => {
    if (!planId) { setPlan(null); setSchedules([]); setAllObs([]); return; }
    const found = plans.find((p: AuditPlan) => p.id === planId);
    setPlan(found || null);
    loadSchedules(planId);
    loadObs(planId);
  }, [planId]);

  const loadSchedules = (id: number) => {
    setLoadingSched(true);
    auditApi.getSchedulesByPlan(id)
      .then((d: unknown) => setSchedules(Array.isArray(d) ? d as AuditSchedule[] : []))
      .catch(() => setSchedules([]))
      .finally(() => setLoadingSched(false));
  };

  const loadObs = (id: number) => {
    setLoadingObs(true);
    auditApi.getObsByPlan(id)
      .then((d: unknown) => setAllObs(Array.isArray(d) ? d as AuditObservation[] : []))
      .catch(() => setAllObs([]))
      .finally(() => setLoadingObs(false));
  };

  const getObsForSchedule = (sched: AuditSchedule) =>
    allObs.filter(o =>
      o.department === sched.department &&
      (o.auditDate === sched.auditDate || !o.auditDate)
    );

  const unlinkedObs = allObs.filter(o =>
    !schedules.some(s => s.department === o.department && s.auditDate === o.auditDate)
  );

  // Find dept ID from dept name
  const getDeptId = (deptName: string): number | null => {
    const found = depts.find((d: Department) =>
      d.name?.toLowerCase() === deptName?.toLowerCase()
    );
    return found ? found.id : null;
  };

  const openAddModal = (sched: AuditSchedule | null) => {
    const deptName = sched?.department || "";
    const date     = sched?.auditDate  || "";
    const auitee   = sched?.auditee    || "";
    setDepartment(deptName);
    setAuditee(auitee);
    setAuditDate(date);
    setNewObs([]);
    setClauses([]);
    setAddModal({ open: true, schedule: sched });

    // Auto-load clauses if we have cert+dept
    const certIdForPlan = plan?.certification?.id;
    const deptId = getDeptId(deptName);
    if (certIdForPlan && deptId) {
      setLoadingClauses(true);
      clauseApi.getForObservation(certIdForPlan, deptId)
        .then((data: unknown) => {
          const loaded = Array.isArray(data) ? data as ClauseMaster[] : [];
          setClauses(loaded);
          // Pre-populate observation rows from clauses
          if (loaded.length > 0) {
            setNewObs(loaded.map((c: ClauseMaster): ObsRow => ({
              clauseNo: c.subClauseReference || c.mainClauseNumber || "",
              clauseTitle: c.subClauseTitle || c.mainClauseTitle || "",
              requirement: c.requirement || "",
              auditQuestion: c.auditQuestion || "",
              findingType: "POSITIVE_OBSERVATION",
              observationDescription: "",
              objectiveEvidence: "",
              riskLevel: "LOW",
              severity: "LOW",
            })));
          } else {
            setNewObs([EMPTY_OBS()]);
          }
        })
        .catch(() => { setClauses([]); setNewObs([EMPTY_OBS()]); })
        .finally(() => setLoadingClauses(false));
    } else {
      setNewObs([EMPTY_OBS()]);
    }
  };

  const saveObservations = async () => {
    if (!planId) { alert("Select an audit plan."); return; }
    const valid = newObs.filter(r => r.observationDescription?.trim());
    if (valid.length === 0) { alert("Add at least one observation with a description."); return; }
    setSaving(true);
    try {
      for (const obs of valid) {
        await auditApi.createObs({
          clauseNo: obs.clauseNo,
          findingType: obs.findingType,
          observationDescription: obs.observationDescription,
          objectiveEvidence: obs.objectiveEvidence,
          riskLevel: obs.riskLevel,
          severity: obs.severity,
          department,
          auditee,
          auditDate,
          auditPlan: { id: planId },
          status: "OPEN",
        });
      }
      setNewObs([]);
      setAddModal({ open: false, schedule: null });
      loadObs(planId);
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed"));
    } finally { setSaving(false); }
  };

  const createNcFromObs = async (obs: AuditObservation) => {
    setCreatingNc(obs.id);
    try {
      await auditApi.createNc({
        auditPlan:   { id: planId },
        observationId: obs.id || null,
        ncType:      obs.findingType === "NC_MAJOR" ? "MAJOR" : "MINOR",
        clauseNo:    obs.clauseNo || "",
        ncDescription: obs.observationDescription || "",
        department:  obs.department || "",
        status:      "OPEN",
      });
      alert("NC created successfully. Go to NC / CAR tab to manage it.");
      if (planId) loadObs(planId);
    } catch (e: unknown) {
      alert(apiMsg(e, "NC creation failed"));
    } finally { setCreatingNc(null); }
  };

  const addObsRow = () => setNewObs(prev => [...prev, EMPTY_OBS()]);
  const removeObsRow = (idx: number) => setNewObs(prev => prev.filter((_, i) => i !== idx));
  const updateObs = (idx: number, key: keyof ObsRow, val: string) =>
    setNewObs(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));

  const stats = {
    total:     allObs.length,
    positive:  allObs.filter(r => r.findingType === "POSITIVE_OBSERVATION").length,
    negative:  allObs.filter(r => r.findingType === "NEGATIVE_OBSERVATION").length,
    nc:        allObs.filter(r => isNcType(r.findingType)).length,
    ofi:       allObs.filter(r => r.findingType === "OFI").length,
    schedules: schedules.length,
  };

  const inp = "border border-gray-300 rounded-xl px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full bg-white";

  // Inner table for obs list
  const ObsTable = ({ obs }: { obs: AuditObservation[] }) => {
    const displayed = obs.filter(r => {
      const mf = !findingFilter || r.findingType === findingFilter;
      const ms = !search || [r.observationId, r.clauseNo, r.observationDescription]
        .some(v => v?.toLowerCase().includes(search.toLowerCase()));
      return mf && ms;
    });
    if (displayed.length === 0)
      return <p className="text-xs text-gray-400 py-4 text-center">No observations recorded.</p>;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-500 uppercase">
              {["Obs ID", "Clause", "Finding", "Description", "Risk", "Status", "Action"].map(h => (
                <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map((r: AuditObservation) => {
              const fi = findingInfo(r.findingType);
              return (
                <tr key={r.id} className="hover:bg-purple-50/30">
                  <td className="px-3 py-2 font-mono font-bold text-purple-700 whitespace-nowrap">{r.observationId || `OBS-${r.id}`}</td>
                  <td className="px-3 py-2 text-gray-500 font-mono">{r.clauseNo || "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${fi.color}`}>{fi.label}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-700 max-w-[200px] truncate" title={r.observationDescription}>{r.observationDescription}</td>
                  <td className="px-3 py-2 text-gray-500">{r.riskLevel || "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.status === "NC_RAISED" ? "bg-orange-100 text-orange-700" : r.status === "CLOSED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {r.status || "OPEN"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewObs(r)} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                        <FiEye className="text-xs" />
                      </button>
                      {isNcType(r.findingType) && r.status !== "NC_RAISED" && (
                        <button onClick={() => createNcFromObs(r)} disabled={creatingNc === r.id}
                          className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60 whitespace-nowrap">
                          <FiAlertTriangle className="text-xs" /> {creatingNc === r.id ? "..." : "Raise NC"}
                        </button>
                      )}
                      {r.ncId && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[11px] font-mono">NC#{r.ncId}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-5 border border-purple-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Audit Observations
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Clauses auto-load from Clause Master — select a schedule session to start auditing
            </p>
          </div>
          {planId && (
            <button onClick={() => openAddModal(null)}
              className="px-5 py-2 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <FiPlus /> New Observation
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
          {[
            { label: "Total Obs",    value: stats.total,     from: "from-purple-600", to: "to-indigo-600",  icon: <FiFileText className="text-xl" /> },
            { label: "Schedules",   value: stats.schedules, from: "from-teal-500",   to: "to-cyan-600",    icon: <FiCalendar className="text-xl" /> },
            { label: "Conformance", value: stats.positive,  from: "from-green-500",  to: "to-emerald-600", icon: <FiCheckCircle className="text-xl" /> },
            { label: "Observation", value: stats.negative,  from: "from-orange-500", to: "to-orange-600",  icon: <FiAlertCircle className="text-xl" /> },
            { label: "NC Findings", value: stats.nc,        from: "from-red-500",    to: "to-red-600",     icon: <FiAlertTriangle className="text-xl" /> },
            { label: "OFI",         value: stats.ofi,       from: "from-blue-500",   to: "to-blue-600",    icon: <FiBarChart2 className="text-xl" /> },
          ].map(k => (
            <div key={k.label} className={`bg-gradient-to-br ${k.from} ${k.to} text-white p-4 rounded-xl shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">{k.icon}</div>
                <div><p className="text-xs opacity-90">{k.label}</p><p className="text-2xl font-bold">{k.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center flex-wrap">
            <select value={certId ?? ""} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500">
              <option value="">All Standards</option>
              {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
            <select value={planId ?? ""} onChange={e => setPlanId(e.target.value ? Number(e.target.value) : null)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500 min-w-72">
              <option value="">Select Audit Plan...</option>
              {plans.map((p: AuditPlan) => <option key={p.id} value={p.id}>{p.auditRefNo} — {p.auditType} — {p.status}</option>)}
            </select>
            {planId && (
              <>
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="text" placeholder="Search observations..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white text-sm" />
                </div>
                <select value={findingFilter} onChange={e => setFindingFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
                  <option value="">All Findings</option>
                  {FINDING_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                </select>
                <button onClick={() => { if (planId) { loadSchedules(planId); loadObs(planId); } }}
                  className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-600 hover:border-purple-400 flex items-center gap-2 transition-all">
                  <FiRefreshCw /> Refresh
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {!planId ? (
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 py-24 text-center">
          <FiEye className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">Select an audit plan to manage observations</p>
          <p className="text-gray-300 text-sm mt-1">Clauses will be auto-loaded from Clause Master per department</p>
        </div>
      ) : (
        <>
          {/* Plan Info Banner */}
          {plan && (
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 px-5 py-4 mb-5 flex flex-wrap gap-5 text-sm">
              <div><p className="text-xs text-gray-400">Ref No.</p><p className="font-mono font-bold text-purple-700">{plan.auditRefNo}</p></div>
              <div><p className="text-xs text-gray-400">Standard</p><p className="font-semibold">{plan.certification?.code || "—"}</p></div>
              <div><p className="text-xs text-gray-400">Lead Auditor</p><p className="font-semibold">{plan.leadAuditor || "—"}</p></div>
              <div><p className="text-xs text-gray-400">Period</p><p className="font-semibold">{plan.plannedStartDate} → {plan.plannedEndDate || "—"}</p></div>
              <div><p className="text-xs text-gray-400">Status</p><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">{plan.status}</span></div>
            </div>
          )}

          {/* Schedules */}
          {loadingSched ? (
            <div className="bg-white rounded-2xl shadow-xl py-12 text-center mb-5">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mx-auto" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 py-10 text-center mb-5">
              <FiCalendar className="text-4xl text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No audit schedules found for this plan.</p>
              <p className="text-gray-300 text-xs mt-1">Add schedules in the Audit Schedule tab first.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <FiCalendar className="text-purple-600" /> Audit Sessions ({schedules.length})
                </h2>
                <p className="text-xs text-gray-400">Click "Audit" to open observation entry with auto-loaded clauses</p>
              </div>
              {schedules.map((sched: AuditSchedule) => {
                const schedObs  = getObsForSchedule(sched);
                const isExpanded = expandedSchedule === sched.id;
                const ncCount   = schedObs.filter(o => isNcType(o.findingType)).length;
                return (
                  <div key={sched.id} className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                    <div className="px-5 py-4 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-indigo-50/40 transition-colors"
                      onClick={() => setExpandedSchedule(isExpanded ? null : sched.id)}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2.5 rounded-xl text-white"
                          style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
                          <FiCalendar />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{sched.department || "Unknown Department"}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1"><FiUser className="text-xs" />{sched.auditee || "—"}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><FiCalendar className="text-xs" />{sched.auditDate || "—"}</span>
                            {sched.startTime && <><span>·</span><span>{sched.startTime}–{sched.endTime}</span></>}
                            {sched.location  && <><span>·</span><span className="flex items-center gap-1"><FiMapPin className="text-xs" />{sched.location}</span></>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{schedObs.length} obs</span>
                        {ncCount > 0 && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{ncCount} NC</span>}
                        <button
                          onClick={e => { e.stopPropagation(); openAddModal(sched); }}
                          className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition-all hover:opacity-90"
                          style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
                          <FiBookOpen /> Audit
                        </button>
                        <span className="text-gray-400">{isExpanded ? <FiChevronUp /> : <FiChevronDown />}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-indigo-50/20 px-4 py-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                          <FiEye className="text-purple-600" /> Observations – {sched.department} · {sched.auditDate}
                        </p>
                        <ObsTable obs={schedObs} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Unlinked obs */}
          {unlinkedObs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden mb-5">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                  <FiEye className="text-purple-600" /> Additional Observations
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{unlinkedObs.length}</span>
                </h3>
              </div>
              <div className="px-4 py-3"><ObsTable obs={unlinkedObs} /></div>
            </div>
          )}

          {/* All obs summary */}
          {allObs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                  <FiBarChart2 className="text-purple-600" /> All Observations
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{allObs.length}</span>
                </h3>
              </div>
              <div className="px-4 py-3"><ObsTable obs={allObs} /></div>
            </div>
          )}
        </>
      )}

      {/* ── Add Observation Modal ── */}
      {addModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiBookOpen /> Audit Observation Entry
                </h2>
                <p className="text-purple-200 text-xs mt-0.5">
                  {addModal.schedule
                    ? `${addModal.schedule.department} · ${addModal.schedule.auditDate}`
                    : "Manual observation entry"}
                  {clauses.length > 0 && ` · ${clauses.length} clauses auto-loaded`}
                </p>
              </div>
              <button onClick={() => setAddModal({ open: false, schedule: null })}
                className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"><FiX /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Session Info (read-only if from schedule) */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">Session Information</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Department</label>
                    <input value={department} onChange={e => setDepartment(e.target.value)}
                      placeholder="Department"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500"
                      readOnly={!!addModal.schedule} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Auditee</label>
                    <input value={auditee} onChange={e => setAuditee(e.target.value)}
                      placeholder="Auditee name"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Audit Date</label>
                    <input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lead Auditor</label>
                    <input readOnly value={plan?.leadAuditor || ""}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Clauses loaded banner */}
              {loadingClauses ? (
                <div className="flex items-center gap-3 bg-purple-50 rounded-xl px-4 py-3 text-sm text-purple-700 border border-purple-200">
                  <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                  Loading clauses from Clause Master...
                </div>
              ) : clauses.length > 0 ? (
                <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2.5 text-xs text-green-700 border border-green-200">
                  <FiCheckCircle />
                  <span>{clauses.length} clauses loaded from Clause Master for <strong>{department}</strong> · <strong>{plan?.certification?.code}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2.5 text-xs text-amber-700 border border-amber-200">
                  <FiAlertCircle />
                  <span>No clauses found in Clause Master for this department/standard. Add clauses manually below.</span>
                </div>
              )}

              {/* Findings Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                    <FiList /> Audit Findings
                    <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{newObs.length} rows</span>
                  </p>
                  <button onClick={addObsRow}
                    className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold shadow transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${BRAND}, #4c1d95)` }}>
                    <FiPlus /> Add Row
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200">
                          <th className="px-3 py-2.5 text-left w-8">#</th>
                          <th className="px-3 py-2.5 text-left whitespace-nowrap">Clause Ref</th>
                          <th className="px-3 py-2.5 text-left min-w-[160px]">Clause Title / Requirement</th>
                          <th className="px-3 py-2.5 text-left whitespace-nowrap">Finding Type *</th>
                          <th className="px-3 py-2.5 text-left min-w-[180px]">Observation / Evidence Found *</th>
                          <th className="px-3 py-2.5 text-left min-w-[130px]">Objective Evidence</th>
                          <th className="px-3 py-2.5 text-left whitespace-nowrap">Risk</th>
                          <th className="px-3 py-2.5 text-left whitespace-nowrap">Severity</th>
                          <th className="px-3 py-2.5 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {newObs.map((obs, idx) => {
                          const isNc = isNcType(obs.findingType);
                          return (
                            <tr key={idx} className={`${isNc ? "bg-red-50/30" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                              <td className="px-2 py-2 text-center text-gray-400 font-mono">{idx + 1}</td>
                              <td className="px-2 py-2">
                                <input value={obs.clauseNo}
                                  onChange={e => updateObs(idx, "clauseNo", e.target.value)}
                                  placeholder="7.2" className={`${inp} w-20 font-mono`} />
                              </td>
                              <td className="px-2 py-2">
                                {obs.requirement ? (
                                  <div className="text-xs text-gray-500 max-w-[160px]">
                                    <p className="font-medium text-gray-700 truncate" title={obs.clauseTitle}>{obs.clauseTitle}</p>
                                    <p className="text-gray-400 truncate" title={obs.requirement}>{obs.requirement}</p>
                                  </div>
                                ) : (
                                  <input value={obs.clauseTitle}
                                    onChange={e => updateObs(idx, "clauseTitle", e.target.value)}
                                    placeholder="Clause title" className={`${inp} w-40`} />
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <select value={obs.findingType}
                                  onChange={e => updateObs(idx, "findingType", e.target.value)}
                                  className={`${inp} w-36`}>
                                  {FINDING_TYPES.map(ft => (
                                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                                  ))}
                                </select>
                                {isNc && (
                                  <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                                    <FiAlertTriangle /> Auto-NC will be created
                                  </p>
                                )}
                              </td>
                              <td className="px-2 py-2">
                                <textarea value={obs.observationDescription}
                                  onChange={e => updateObs(idx, "observationDescription", e.target.value)}
                                  rows={2} placeholder="Enter finding / observation details..."
                                  className={`${inp} w-48 resize-none`} />
                              </td>
                              <td className="px-2 py-2">
                                <textarea value={obs.objectiveEvidence}
                                  onChange={e => updateObs(idx, "objectiveEvidence", e.target.value)}
                                  rows={2} placeholder="Documents, records, interviews..."
                                  className={`${inp} w-36 resize-none`} />
                              </td>
                              <td className="px-2 py-2">
                                <select value={obs.riskLevel}
                                  onChange={e => updateObs(idx, "riskLevel", e.target.value)}
                                  className={`${inp} w-24`}>
                                  {RISK_LEVELS.map(r => <option key={r}>{r}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <select value={obs.severity}
                                  onChange={e => updateObs(idx, "severity", e.target.value)}
                                  className={`${inp} w-24`}>
                                  {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <button onClick={() => removeObsRow(idx)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                                  <FiX />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {newObs.length === 0 && (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-gray-400 text-sm">
                              {loadingClauses ? "Loading clauses..." : "Click \"Add Row\" to add observations"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {newObs.some(o => isNcType(o.findingType)) && (
                  <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-xs text-orange-700">
                    <FiAlertTriangle className="mt-0.5 shrink-0" />
                    <span>NC findings will automatically create NC records in the NC / CAR tab.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button onClick={() => setAddModal({ open: false, schedule: null })}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-all">
                Cancel
              </button>
              <button onClick={saveObservations} disabled={saving || newObs.length === 0}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 shadow-lg flex items-center gap-2 transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, #16A34A, #15803d)` }}>
                {saving ? <><FiRefreshCw className="animate-spin" /> Saving...</> : <><FiSave /> Save Observations</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Obs Modal */}
      {viewObs && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewObs(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-base">{viewObs.observationId || `OBS-${viewObs.id}`}</h3>
              <button onClick={() => setViewObs(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><FiX /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Clause",     viewObs.clauseNo || "—"],
                  ["Department", viewObs.department || "—"],
                  ["Auditee",    viewObs.auditee || "—"],
                  ["Audit Date", viewObs.auditDate || "—"],
                  ["Risk Level", viewObs.riskLevel || "—"],
                  ["Severity",   viewObs.severity || "—"],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{l}</p>
                    <p className="font-semibold text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Finding Type</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${findingInfo(viewObs.findingType).color}`}>
                  {findingInfo(viewObs.findingType).label}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Description / Observation</p>
                <p className="text-gray-700">{viewObs.observationDescription}</p>
              </div>
              {viewObs.objectiveEvidence && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Objective Evidence</p>
                  <p className="text-gray-700">{viewObs.objectiveEvidence}</p>
                </div>
              )}
              {viewObs.ncId && (
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">NC Reference</p>
                  <p className="font-mono font-bold text-purple-700">NC#{viewObs.ncId}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setViewObs(null)}
                className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
