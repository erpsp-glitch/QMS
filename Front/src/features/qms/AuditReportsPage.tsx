import { useEffect, useState } from "react";
import { auditApi, certApi } from "../../api/qms.api";
import type { Certification, AuditPlan, AuditSchedule, AuditObservation, NC, AuditFeedback } from "./types";

const BRAND = "#280882";

const QUESTIONS = [
  { key: "auditorKnowledge",       label: "Auditor Knowledge" },
  { key: "technicalCompetency",    label: "Technical Competency" },
  { key: "auditCoverage",          label: "Audit Coverage" },
  { key: "auditorQualities",       label: "Auditor Qualities" },
  { key: "employeeInteraction",    label: "Employee Interaction" },
  { key: "clarityInCommunication", label: "Communication Clarity" },
  { key: "timeManagement",         label: "Time Management" },
  { key: "consistencyApproach",    label: "Consistency" },
  { key: "queryResponse",          label: "Query Response" },
  { key: "observationComments",    label: "Observation Comments" },
];



export default function AuditReportsPage() {
  const [certs, setCerts]     = useState<Certification[]>([]);
  const [certId, setCertId]   = useState<number | null>(null);
  const [plans, setPlans]     = useState<AuditPlan[]>([]);
  const [planId, setPlanId]   = useState<number | null>(null);
  const [plan, setPlan]       = useState<AuditPlan | null>(null);
  const [schedules, setSchedules] = useState<AuditSchedule[]>([]);
  const [observations, setObservations] = useState<AuditObservation[]>([]);
  const [ncs, setNcs]         = useState<NC[]>([]);
  const [feedbacks, setFeedbacks] = useState<AuditFeedback[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const p = certId ? auditApi.getPlansByCert(certId) : auditApi.getPlans();
    p.then((d: unknown) => setPlans(Array.isArray(d) ? d as AuditPlan[] : [])).catch(() => setPlans([]));
    setPlanId(null); setPlan(null);
  }, [certId]);

  useEffect(() => {
    if (!planId) { setPlan(null); setSchedules([]); setObservations([]); setNcs([]); setFeedbacks([]); return; }
    const found = plans.find(p => p.id === planId) || null;
    setPlan(found);
    setLoading(true);
    Promise.allSettled([
      auditApi.getSchedulesByPlan(planId),
      auditApi.getObsByPlan(planId),
      auditApi.getFeedbackByPlan(planId),
      certId ? auditApi.getNcsByCert(certId) : auditApi.getAllNcs(),
    ]).then(([sc, ob, fb, nc]) => {
      setSchedules(sc.status === "fulfilled" ? (Array.isArray(sc.value) ? sc.value as AuditSchedule[] : []) : []);
      setObservations(ob.status === "fulfilled" ? (Array.isArray(ob.value) ? ob.value as AuditObservation[] : []) : []);
      setFeedbacks(fb.status === "fulfilled" ? (Array.isArray(fb.value) ? fb.value as AuditFeedback[] : []) : []);
      const allNcs = nc.status === "fulfilled" ? (Array.isArray(nc.value) ? nc.value as NC[] : []) : [];
      setNcs(allNcs.filter((n: NC) => n.auditPlan?.id === planId || (n as NC & { auditPlanId?: number }).auditPlanId === planId));
    }).finally(() => setLoading(false));
  }, [planId]);

  const printReport = () => {
    if (!plan) { alert("Select an audit plan first."); return; }
    const w = window.open("", "_blank");
    if (!w) return;

    const avgFeedback = feedbacks.length > 0
      ? (feedbacks.reduce((sum, fb) => {
          const avg = QUESTIONS.reduce((s, q) => s + ((fb[q.key as keyof AuditFeedback] as number) || 0), 0) / QUESTIONS.length;
          return sum + avg;
        }, 0) / feedbacks.length).toFixed(2)
      : "—";

    w.document.write(`<!DOCTYPE html><html><head><title>Audit Report — ${plan.auditRefNo}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;margin:24px;color:#222}
  h1{color:#280882;font-size:16px;border-bottom:2px solid #280882;padding-bottom:6px}
  h2{color:#280882;font-size:13px;margin-top:20px;border-bottom:1px solid #e0d7ff;padding-bottom:4px}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11px}
  th{background:#280882;color:white;padding:5px 8px;text-align:left;font-size:10px;text-transform:uppercase}
  td{border:1px solid #ddd;padding:5px 8px}
  tr:nth-child(even){background:#f9f7ff}
  .badge{display:inline-block;padding:1px 7px;border-radius:99px;font-size:10px;font-weight:600}
  .badge-open{background:#fee2e2;color:#b91c1c}
  .badge-closed{background:#d1fae5;color:#065f46}
  .badge-ofi{background:#dbeafe;color:#1e40af}
  .badge-pos{background:#d1fae5;color:#065f46}
  .badge-neg{background:#ffedd5;color:#c2410c}
  .badge-nc{background:#fee2e2;color:#b91c1c}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
  .meta-item label{font-size:9px;text-transform:uppercase;color:#888;letter-spacing:.05em;display:block;margin-bottom:2px}
  .meta-item span{font-weight:600;color:#222}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0}
  .summary-card{border:1px solid #e5e7eb;border-radius:8px;padding:8px;text-align:center}
  .summary-card .num{font-size:18px;font-weight:700;color:#280882}
  .summary-card .lbl{font-size:9px;color:#6b7280}
  @media print{body{margin:16px}}
</style></head><body>

<h1>INTERNAL AUDIT REPORT — ${plan.auditRefNo || "DRAFT"}</h1>

<div class="meta">
  <div class="meta-item"><label>Audit Ref No.</label><span>${plan.auditRefNo || "—"}</span></div>
  <div class="meta-item"><label>Certification Standard</label><span>${plan.certification?.code || "—"} — ${plan.certification?.name || ""}</span></div>
  <div class="meta-item"><label>Audit Type</label><span>${plan.auditType || "—"}</span></div>
  <div class="meta-item"><label>Status</label><span>${plan.status || "—"}</span></div>
  <div class="meta-item"><label>Lead Auditor</label><span>${plan.leadAuditor || "—"}</span></div>
  <div class="meta-item"><label>Auditor Team</label><span>${plan.auditorTeam || "—"}</span></div>
  <div class="meta-item"><label>Planned Start Date</label><span>${plan.plannedStartDate || "—"}</span></div>
  <div class="meta-item"><label>Planned End Date</label><span>${plan.plannedEndDate || "—"}</span></div>
  <div class="meta-item"><label>Duration (Days)</label><span>${plan.durationDays || "—"}</span></div>
  <div class="meta-item"><label>Approval Status</label><span>${plan.approvalStatus || "PENDING"}</span></div>
  <div class="meta-item"><label>Approved By</label><span>${plan.approvedBy || "—"}</span></div>
  <div class="meta-item"><label>Report Generated</label><span>${new Date().toLocaleDateString("en-IN")}</span></div>
</div>

${plan.scope ? `<p><strong>Scope:</strong> ${plan.scope}</p>` : ""}
${plan.auditCriteria ? `<p><strong>Audit Criteria:</strong> ${plan.auditCriteria}</p>` : ""}
${plan.objective ? `<p><strong>Objective:</strong> ${plan.objective}</p>` : ""}

<div class="summary">
  <div class="summary-card"><div class="num">${schedules.length}</div><div class="lbl">Schedules</div></div>
  <div class="summary-card"><div class="num">${observations.length}</div><div class="lbl">Observations</div></div>
  <div class="summary-card"><div class="num">${ncs.filter(n => n.status !== "CLOSED").length}</div><div class="lbl">Open NCs</div></div>
  <div class="summary-card"><div class="num">${avgFeedback}</div><div class="lbl">Avg Feedback</div></div>
</div>

${schedules.length > 0 ? `
<h2>Audit Schedule</h2>
<table>
  <tr><th>Dept / Function</th><th>Location</th><th>Auditee</th><th>Audit Date</th><th>Time</th></tr>
  ${schedules.map(s => `<tr><td>${s.department || "—"}</td><td>${s.location || "—"}</td><td>${s.auditee || "—"}</td><td>${s.auditDate || "—"}</td><td>${s.scheduledTime || "—"}</td></tr>`).join("")}
</table>` : ""}

${observations.length > 0 ? `
<h2>Audit Observations (${observations.length})</h2>
<table>
  <tr><th>Obs ID</th><th>Dept</th><th>Clause</th><th>Finding</th><th>Description</th><th>Risk</th></tr>
  ${observations.map(o => {
    const fClass = o.findingType?.includes("NC") ? "badge-nc" : o.findingType === "OFI" ? "badge-ofi" : o.findingType === "POSITIVE_OBSERVATION" ? "badge-pos" : "badge-neg";
    const fLabel = o.findingType?.replace(/_/g," ") || "—";
    return `<tr><td>${o.observationId || "OBS-"+o.id}</td><td>${o.department||"—"}</td><td>${o.clauseNo||"—"}</td><td><span class="badge ${fClass}">${fLabel}</span></td><td>${o.observationDescription||""}</td><td>${o.riskLevel||"—"}</td></tr>`;
  }).join("")}
</table>` : ""}

${ncs.length > 0 ? `
<h2>Non-Conformances (${ncs.length})</h2>
<table>
  <tr><th>NC No.</th><th>Dept</th><th>Type</th><th>Description</th><th>Responsible</th><th>Target Date</th><th>Status</th></tr>
  ${ncs.map(n => {
    const sc = n.status === "CLOSED" ? "badge-closed" : "badge-open";
    return `<tr><td>${n.ncNumber||"—"}</td><td>${n.department||"—"}</td><td>${n.ncType||"—"}</td><td>${n.ncDescription||""}</td><td>${n.responsiblePerson||"—"}</td><td>${n.targetDate||"—"}</td><td><span class="badge ${sc}">${n.status}</span></td></tr>`;
  }).join("")}
</table>` : ""}

${feedbacks.length > 0 ? `
<h2>Feedback Summary (${feedbacks.length} submission${feedbacks.length > 1 ? "s" : ""})</h2>
<table>
  <tr><th>Auditor</th><th>Auditee</th><th>Process</th><th>Avg Score</th><th>Suggestions</th></tr>
  ${feedbacks.map(fb => {
    const avg = (QUESTIONS.reduce((s, q) => s + ((fb[q.key as keyof AuditFeedback] as number)||0), 0) / QUESTIONS.length).toFixed(1);
    return `<tr><td>${fb.auditorName||"—"}</td><td>${fb.auditeeName||"—"}</td><td>${fb.process||"—"}</td><td><strong>${avg}/4</strong></td><td>${fb.suggestions||"—"}</td></tr>`;
  }).join("")}
</table>` : ""}

</body></html>`);
    w.document.close();
    w.print();
  };

  const exportCSV = () => {
    if (!plan) { alert("Select an audit plan first."); return; }
    const lines: string[] = [];
    lines.push("AUDIT REPORT," + (plan.auditRefNo || ""));
    lines.push("Standard," + (plan.certification?.code || ""));
    lines.push("Lead Auditor," + (plan.leadAuditor || ""));
    lines.push("Start Date," + (plan.plannedStartDate || ""));
    lines.push("Status," + (plan.status || ""));
    lines.push("");
    lines.push("OBSERVATIONS");
    lines.push(["Obs ID","Dept","Clause","Finding","Description","Risk"].join(","));
    observations.forEach(o => lines.push([o.observationId||"","\""+o.department+"\"","\""+o.clauseNo+"\"","\""+o.findingType+"\"","\""+o.observationDescription+"\"",o.riskLevel||""].join(",")));
    lines.push("");
    lines.push("NON-CONFORMANCES");
    lines.push(["NC No","Dept","Type","Description","Responsible","Target Date","Status"].join(","));
    ncs.forEach(n => lines.push([n.ncNumber||"","\""+n.department+"\"",n.ncType||"","\""+n.ncDescription+"\"","\""+n.responsiblePerson+"\"",n.targetDate||"",n.status||""].join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `AuditReport_${plan.auditRefNo || "report"}.csv`; a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3.5 flex flex-wrap gap-3 items-center">
        <select value={certId ?? ""} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Standards</option>
          {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
        </select>
        <select value={planId ?? ""} onChange={e => setPlanId(e.target.value ? Number(e.target.value) : null)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-72">
          <option value="">Select Audit Plan (Ref No.)...</option>
          {plans.map((p: AuditPlan) => <option key={p.id} value={p.id}>{p.auditRefNo} — {p.auditType} — {p.status}</option>)}
        </select>
        {planId && !loading && (
          <div className="ml-auto flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 text-green-700 text-sm font-medium hover:bg-green-50">
              <i className="fas fa-file-excel" /> Export CSV
            </button>
            <button onClick={printReport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: BRAND }}>
              <i className="fas fa-print" /> Print / PDF
            </button>
          </div>
        )}
      </div>

      {!planId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-24 text-center text-gray-400">
          <i className="fas fa-file-alt text-5xl mb-4 block opacity-30" />
          <p className="text-sm font-medium">Select an Audit Plan to generate the report</p>
          <p className="text-xs mt-1 text-gray-300">Report includes Plan, Schedule, Observations, NCs, and Feedback</p>
        </div>
      ) : loading ? (
        <div className="py-20 text-center"><i className="fas fa-spinner fa-spin text-3xl" style={{ color: BRAND }} /></div>
      ) : (
        <div className="space-y-4">
          {/* Plan Header */}
          {plan && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-lg font-bold" style={{ color: BRAND }}>{plan.auditRefNo}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{plan.auditTitle || plan.auditType}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{plan.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[["Standard", plan.certification?.code || "—"],["Lead Auditor", plan.leadAuditor || "—"],["Start Date", plan.plannedStartDate || "—"],["End Date", plan.plannedEndDate || "—"],["Duration", plan.durationDays ? plan.durationDays + " days" : "—"],["Approval", plan.approvalStatus || "PENDING"],["Approved By", plan.approvedBy || "—"],["Auditor Team", plan.auditorTeam || "—"]].map(([l, v]) => (
                  <div key={l}><p className="text-xs text-gray-400">{l}</p><p className="font-medium text-gray-800">{v}</p></div>
                ))}
              </div>
              {plan.scope && <p className="text-xs text-gray-500 mt-3"><span className="font-semibold">Scope:</span> {plan.scope}</p>}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Schedules",     value: schedules.length,                                         color: "#3b82f6",  icon: "fas fa-calendar-alt" },
              { label: "Observations",  value: observations.length,                                      color: BRAND,      icon: "fas fa-eye" },
              { label: "NCs Raised",    value: ncs.length,                                               color: "#ef4444",  icon: "fas fa-exclamation-triangle" },
              { label: "Open NCs",      value: ncs.filter(n => n.status !== "CLOSED").length,            color: "#f97316",  icon: "fas fa-door-open" },
              { label: "Closed NCs",    value: ncs.filter(n => n.status === "CLOSED").length,            color: "#10b981",  icon: "fas fa-lock" },
              { label: "O+ (Positive)", value: observations.filter(o => o.findingType === "POSITIVE_OBSERVATION").length, color: "#10b981", icon: "fas fa-thumbs-up" },
              { label: "NC Findings",   value: observations.filter(o => ["NC","NC_MINOR","NC_MAJOR"].includes(o.findingType ?? "")).length, color: "#ef4444", icon: "fas fa-ban" },
              { label: "Feedback Avg",  value: feedbacks.length > 0 ? (feedbacks.reduce((sum, fb) => sum + QUESTIONS.reduce((s,q) => s+((fb[q.key as keyof AuditFeedback] as number)||0), 0) / QUESTIONS.length, 0) / feedbacks.length).toFixed(1) + "/4" : "—", color: "#8b5cf6", icon: "fas fa-star" },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: `${k.color}18` }}>
                  <i className={`${k.icon} text-xs`} style={{ color: k.color }} />
                </div>
                <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Schedules */}
          {schedules.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Audit Schedule ({schedules.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">{["Dept","Location","Auditee","Date","Time"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {schedules.map((s: AuditSchedule) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{s.department || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{s.location || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{s.auditee || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{s.auditDate || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{s.scheduledTime || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NC Summary */}
          {ncs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Non-Conformances ({ncs.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">{["NC No.","Dept","Type","Description","Responsible","Target Date","Status"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {ncs.map((n: NC) => (
                      <tr key={n.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{n.ncNumber || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{n.department || "—"}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.ncType === "MAJOR" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{n.ncType}</span></td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{n.ncDescription || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{n.responsiblePerson || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{n.targetDate || "—"}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${n.status === "CLOSED" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{n.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedbacks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Feedback Summary ({feedbacks.length})</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {feedbacks.map((fb: AuditFeedback) => {
                  const avg = (QUESTIONS.reduce((s, q) => s + ((fb[q.key as keyof AuditFeedback] as number)||0), 0) / QUESTIONS.length).toFixed(2);
                  return (
                    <div key={fb.id} className="px-5 py-3 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{fb.auditorName} <span className="text-gray-400 font-normal">→ {fb.auditeeName}</span></p>
                        <p className="text-xs text-gray-400">{fb.process} · {fb.auditDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: Number(avg) >= 3 ? "#10b981" : Number(avg) >= 2 ? "#f59e0b" : "#ef4444" }}>{avg}</p>
                        <p className="text-[10px] text-gray-400">/ 4.00</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
