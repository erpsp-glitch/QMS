import { useEffect, useState } from "react";
import { auditApi, certApi, deptApi, employeeApi } from "../../api/qms.api";
import type { Certification, AuditPlan, AuditSchedule, Department, Employee } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiTrash2, FiX, FiRefreshCw, FiChevronDown,
  FiChevronUp, FiAlertTriangle, FiCheckCircle, FiCalendar,
  FiClock, FiDownload, FiPrinter, FiBarChart2, FiMapPin,
  FiUser, FiGrid, FiList, FiSave, FiFileText
} from "react-icons/fi";

interface ScheduleRow { department: string; location: string; auditee: string; auditDate: string; startTime: string; endTime: string; }
const EMPTY_ROW: ScheduleRow = { department: "", location: "", auditee: "", auditDate: "", startTime: "09:00", endTime: "11:00" };

export default function AuditSchedulePage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [certFilter, setCertFilter] = useState<number | null>(null);
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [plan, setPlan] = useState<AuditPlan | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [savedSchedules, setSavedSchedules] = useState<AuditSchedule[]>([]);
  const [newRows, setNewRows] = useState<ScheduleRow[]>([]);
  const [loadingSched, setLoadingSched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<number | null>(null);

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
    deptApi.getAll().then((d: unknown) => setDepartments(Array.isArray(d) ? d as Department[] : [])).catch(() => {});
    employeeApi.getAll().then((d: unknown) => setEmployees(Array.isArray(d) ? d as Employee[] : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const p = certFilter ? auditApi.getPlansByCert(certFilter) : auditApi.getPlans();
    p.then((d: unknown) => setPlans(Array.isArray(d) ? d as AuditPlan[] : [])).catch(() => setPlans([]));
    setPlanId(null); setPlan(null); setSavedSchedules([]);
  }, [certFilter]);

  const loadSchedules = (id: number) => {
    setLoadingSched(true);
    auditApi.getSchedulesByPlan(id).then((d: unknown) => setSavedSchedules(Array.isArray(d) ? d as AuditSchedule[] : [])).catch(() => setSavedSchedules([])).finally(() => setLoadingSched(false));
  };

  useEffect(() => {
    if (!planId) { setPlan(null); setSavedSchedules([]); return; }
    const found = plans.find((p: AuditPlan) => p.id === planId);
    setPlan(found || null);
    loadSchedules(planId);
  }, [planId]);

  const getDateRange = (): string[] => {
    if (!plan?.plannedStartDate || !plan?.plannedEndDate) return [];
    const dates: string[] = [];
    const cur = new Date(plan.plannedStartDate);
    const end = new Date(plan.plannedEndDate);
    while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate() + 1); }
    return dates;
  };
  const dateRange = getDateRange();

  const addRow = () => setNewRows([...newRows, { ...EMPTY_ROW, auditDate: dateRange[0] || "" }]);
  const updateRow = (idx: number, key: keyof ScheduleRow, value: string) => setNewRows(newRows.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  const removeRow = (idx: number) => setNewRows(newRows.filter((_, i) => i !== idx));

  const saveSchedule = async () => {
    if (!planId) { alert("Select an audit plan first."); return; }
    const valid = newRows.filter(r => r.department && r.auditDate);
    if (valid.length === 0) { alert("Add at least one row with Department and Audit Date."); return; }
    setSaving(true);
    try {
      for (const row of valid) await auditApi.createSchedule({ ...row, auditPlan: { id: planId } });
      setNewRows([]);
      loadSchedules(planId);
    } catch (e: unknown) { alert(apiMsg(e, "Save failed")); }
    finally { setSaving(false); }
  };

  const deleteRow = async (id: number) => {
    try { await auditApi.deleteSchedule(id); setSavedSchedules(savedSchedules.filter((s: AuditSchedule) => s.id !== id)); setDeleteScheduleId(null); }
    catch { /* ignore */ }
  };

  const sort = (key: string) => setSortConfig(prev => prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  const sortIcon = (key: string) => sortConfig?.key === key ? (sortConfig.dir === "asc" ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />) : null;

  const filtered = savedSchedules.filter(s => !search || [s.department, s.auditee, s.location].some((v: string) => v?.toLowerCase().includes(search.toLowerCase())));
  const displaySchedules = sortConfig ? [...filtered].sort((a, b) => {
    const av = a[sortConfig.key], bv = b[sortConfig.key];
    if (av == null) return 1; if (bv == null) return -1;
    return sortConfig.dir === "asc" ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
  }) : filtered;

  const byDate: Record<string, AuditSchedule[]> = {};
  savedSchedules.forEach((s: AuditSchedule) => { byDate[s.auditDate] = [...(byDate[s.auditDate] || []), s]; });

  const stats = {
    total: savedSchedules.length,
    depts: new Set(savedSchedules.map((s: AuditSchedule) => s.department).filter(Boolean)).size,
    dates: new Set(savedSchedules.map((s: AuditSchedule) => s.auditDate).filter(Boolean)).size,
    completed: savedSchedules.filter((s: AuditSchedule) => s.status === "COMPLETED").length,
  };

  const printSchedule = () => {
    if (!plan) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const r = savedSchedules.map((s: AuditSchedule, i: number) => `<tr><td>${i+1}</td><td>${s.department}</td><td>${s.location||"—"}</td><td>${s.auditee||"—"}</td><td>${s.auditDate}</td><td>${s.startTime||"—"}</td><td>${s.endTime||"—"}</td></tr>`).join("");
    w.document.write(`<html><head><title>Audit Schedule</title><style>body{font-family:Arial;font-size:12px;padding:24px}h2{color:#280882;border-bottom:2px solid #280882;padding-bottom:6px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #ccc;padding:7px 10px}th{background:#f3f3f3;font-size:11px;text-transform:uppercase}</style></head><body><h2>AUDIT SCHEDULE — ${plan.auditRefNo}</h2><p><strong>Standard:</strong> ${plan.certification?.code||"—"} &nbsp;&nbsp; <strong>Lead Auditor:</strong> ${plan.leadAuditor||"—"} &nbsp;&nbsp; <strong>Period:</strong> ${plan.plannedStartDate} to ${plan.plannedEndDate}</p><table><tr><th>#</th><th>Department</th><th>Location</th><th>Auditee</th><th>Date</th><th>Start</th><th>End</th></tr>${r}</table></body></html>`);
    w.document.close(); w.print();
  };

  const exportCSV = () => {
    const h = ["#","Department","Location","Auditee","Audit Date","Start","End"];
    const data = savedSchedules.map((s: AuditSchedule, i: number) => [i+1, s.department, s.location||"", s.auditee||"", s.auditDate, s.startTime||"", s.endTime||""].join(","));
    const blob = new Blob([[h.join(","),...data].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "AuditSchedule.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  const inp = "border border-gray-300 rounded-xl px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-5 border border-teal-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Audit Schedule
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Plan and manage audit sessions by department and date</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setView(v => v === "list" ? "calendar" : "list")} className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-400 text-sm flex items-center gap-2 transition-all">
              {view === "list" ? <><FiGrid /> Calendar</> : <><FiList /> List</>}
            </button>
            {savedSchedules.length > 0 && (
              <>
                <button onClick={exportCSV} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm flex items-center gap-2 transition-all"><FiDownload /> Export</button>
                <button onClick={printSchedule} className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl text-sm flex items-center gap-2 transition-all"><FiPrinter /> Print</button>
              </>
            )}
            {planId && (
              <button onClick={() => loadSchedules(planId)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm flex items-center gap-2 transition-all">
                <FiRefreshCw /> Refresh
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Sessions", value: stats.total, from: "from-teal-500", to: "to-cyan-600", icon: <FiCalendar className="text-xl" /> },
            { label: "Departments", value: stats.depts, from: "from-indigo-500", to: "to-purple-600", icon: <FiUser className="text-xl" /> },
            { label: "Audit Days", value: stats.dates, from: "from-orange-500", to: "to-orange-600", icon: <FiClock className="text-xl" /> },
            { label: "Completed", value: stats.completed, from: "from-green-500", to: "to-emerald-600", icon: <FiCheckCircle className="text-xl" /> },
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
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-200">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            <select value={certFilter ?? ""} onChange={e => { setCertFilter(e.target.value ? Number(e.target.value) : null); setPlanId(null); }} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500">
              <option value="">All Standards</option>
              {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
            <select value={planId ?? ""} onChange={e => setPlanId(e.target.value ? Number(e.target.value) : null)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 min-w-72">
              <option value="">Select Audit Plan...</option>
              {plans.map((p: AuditPlan) => <option key={p.id} value={p.id}>{p.auditRefNo} — {p.auditType} ({p.plannedStartDate}→{p.plannedEndDate || "?"})</option>)}
            </select>
            {savedSchedules.length > 0 && (
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" placeholder="Search department, auditee..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white text-sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {!planId ? (
        <div className="bg-white rounded-2xl shadow-xl border border-teal-100 py-24 text-center">
          <FiCalendar className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Select an audit plan to manage its schedule</p>
          <p className="text-gray-300 text-sm mt-1">Choose a standard and plan from the dropdowns above</p>
        </div>
      ) : (
        <>
          {/* Plan Info Banner */}
          {plan && (
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 px-5 py-4 mb-5 flex flex-wrap gap-5 text-sm">
              <div><p className="text-xs text-gray-400">Ref No.</p><p className="font-mono font-bold text-teal-700">{plan.auditRefNo}</p></div>
              <div><p className="text-xs text-gray-400">Standard</p><p className="font-semibold">{plan.certification?.code || "—"}</p></div>
              <div><p className="text-xs text-gray-400">Lead Auditor</p><p className="font-semibold">{plan.leadAuditor || "—"}</p></div>
              <div><p className="text-xs text-gray-400">Period</p><p className="font-semibold">{plan.plannedStartDate} → {plan.plannedEndDate || "—"}</p></div>
              <div><p className="text-xs text-gray-400">Duration</p><p className="font-semibold">{plan.durationDays || dateRange.length} day{dateRange.length !== 1 ? "s" : ""}</p></div>
              <div><p className="text-xs text-gray-400">Status</p><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">{plan.status}</span></div>
            </div>
          )}

          {/* Saved Schedules */}
          {loadingSched ? (
            <div className="bg-white rounded-2xl shadow-xl py-12 text-center mb-5">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
            </div>
          ) : savedSchedules.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border border-teal-100 mb-5 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FiCalendar /> Scheduled Sessions
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold text-white">{savedSchedules.length}</span>
                </h3>
              </div>

              {view === "calendar" ? (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {dateRange.map(date => (
                    <div key={date} className="rounded-xl border border-teal-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-2 text-xs font-semibold text-white">
                        {new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
                      </div>
                      <div className="p-2 space-y-1 min-h-[64px]">
                        {(byDate[date] || []).length === 0
                          ? <p className="text-[11px] text-gray-300 italic">No sessions</p>
                          : (byDate[date] || []).map((s: AuditSchedule, i: number) => (
                            <div key={i} className="text-xs rounded-lg p-1.5 border-l-2 border-teal-500 bg-teal-50">
                              <p className="font-semibold text-gray-700 truncate">{s.department}</p>
                              <p className="text-gray-500 text-[11px]">{s.auditee || "—"} · {s.startTime || ""}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        {[["","#"],["department","Department"],["location","Location"],["auditee","Auditee"],["auditDate","Date"],["startTime","Start"],["endTime","End"],["","Action"]].map(([k,h]) => (
                          <th key={h} className={`px-4 py-3 text-left whitespace-nowrap ${k ? "cursor-pointer hover:bg-gray-100" : ""}`} onClick={() => k && sort(k)}>
                            <div className="flex items-center gap-1">{h} {k && sortIcon(k)}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displaySchedules.map((s: AuditSchedule, i: number) => (
                        <tr key={s.id || i} className="hover:bg-teal-50/40 transition-colors group">
                          <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{s.department}</td>
                          <td className="px-4 py-3 text-gray-500 flex items-center gap-1"><FiMapPin className="text-xs text-teal-500" />{s.location || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{s.auditee || "—"}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.auditDate}</td>
                          <td className="px-4 py-3 text-gray-500 flex items-center gap-1"><FiClock className="text-xs" />{s.startTime || "—"}</td>
                          <td className="px-4 py-3 text-gray-500">{s.endTime || "—"}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => setDeleteScheduleId(s.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-all"><FiTrash2 /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-teal-100 py-10 text-center mb-5 text-gray-400">
              <FiCalendar className="text-4xl mx-auto mb-2 opacity-30" />
              <p className="text-sm">No schedule entries yet. Add rows below to start scheduling.</p>
            </div>
          )}

          {/* Add Schedule Rows */}
          <div className="bg-white rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Add Schedule Entries</h3>
                <p className="text-teal-100 text-xs mt-0.5">Add department-wise audit sessions</p>
              </div>
              <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition-all">
                <FiPlus /> Add Row
              </button>
            </div>

            {newRows.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <FiCalendar className="text-4xl mx-auto mb-2 opacity-30" />
                <p className="text-sm">Click <strong>Add Row</strong> to schedule a department audit session</p>
                {dateRange.length > 0 && <p className="text-xs text-gray-300 mt-1">Available dates: {dateRange[0]} → {dateRange[dateRange.length - 1]}</p>}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        {["Department *","Location","Auditee","Audit Date *","Start Time","End Time",""].map(h => <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {newRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-teal-50/30">
                          <td className="px-2 py-2.5">
                            <select value={row.department} onChange={e => updateRow(idx, "department", e.target.value)} className={`${inp} w-40`}>
                              <option value="">Select dept...</option>
                              {departments.map((d: Department) => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2.5"><input value={row.location} onChange={e => updateRow(idx, "location", e.target.value)} placeholder="e.g. Plant 1" className={`${inp} w-28`} /></td>
                          <td className="px-2 py-2.5">
                            <select value={row.auditee} onChange={e => updateRow(idx, "auditee", e.target.value)} className={`${inp} w-48`}>
                              <option value="">Select auditee...</option>
                              {employees.filter((e: Employee) => e.status === "ACTIVE" || !e.status).map((e: Employee) => {
                                const fullName = `${e.firstName || ''} ${e.lastName || ''}`.trim();
                                const label = fullName + (e.designation ? ` — ${e.designation}` : e.employeeId ? ` (${e.employeeId})` : "");
                                return <option key={e.id} value={fullName}>{label}</option>;
                              })}
                            </select>
                          </td>
                          <td className="px-2 py-2.5">
                            {dateRange.length > 0 ? (
                              <select value={row.auditDate} onChange={e => updateRow(idx, "auditDate", e.target.value)} className={`${inp} w-36`}>
                                <option value="">Select date...</option>
                                {dateRange.map(d => <option key={d} value={d}>{new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}</option>)}
                              </select>
                            ) : (
                              <input type="date" value={row.auditDate} onChange={e => updateRow(idx, "auditDate", e.target.value)} className={`${inp} w-36`} />
                            )}
                          </td>
                          <td className="px-2 py-2.5"><input type="time" value={row.startTime} onChange={e => updateRow(idx, "startTime", e.target.value)} className={`${inp} w-28`} /></td>
                          <td className="px-2 py-2.5"><input type="time" value={row.endTime} onChange={e => updateRow(idx, "endTime", e.target.value)} className={`${inp} w-28`} /></td>
                          <td className="px-2 py-2.5"><button onClick={() => removeRow(idx)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"><FiX /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                  <button onClick={() => setNewRows([])} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Clear</button>
                  <button onClick={saveSchedule} disabled={saving} className="px-6 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 shadow-lg flex items-center gap-2 transition-all">
                    {saving ? <><FiRefreshCw className="animate-spin" /> Saving...</> : <><FiSave /> Save Schedule</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
      {/* Delete Schedule Confirmation */}
      {deleteScheduleId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Remove Schedule Entry</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to remove this audit schedule entry?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteScheduleId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => deleteRow(deleteScheduleId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
