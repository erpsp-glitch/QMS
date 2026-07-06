import { useEffect, useState } from "react";
import { auditApi, certApi } from "../../api/qms.api";
import type { Certification, AuditPlan, NC, AuditFeedback } from "./types";

const BRAND = "#280882";

function Bar({ pct, color = BRAND }: { pct: number; color?: string }) {
  return (
    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
      <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

function KpiCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
      <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
        <i className={`${icon} text-sm`} style={{ color }} />
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AuditAnalyticsPage() {
  const [certs, setCerts]   = useState<Certification[]>([]);
  const [certId, setCertId] = useState<number | null>(null);
  const [plans, setPlans]   = useState<AuditPlan[]>([]);
  const [ncs, setNcs]       = useState<NC[]>([]);
  const [feedbacks, setFeedbacks] = useState<AuditFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const pPlans = certId ? auditApi.getPlansByCert(certId) : auditApi.getPlans();
    const pNcs   = certId ? auditApi.getNcsByCert(certId)   : auditApi.getAllNcs();
    const pFb    = auditApi.getAllFeedback();
    Promise.allSettled([pPlans, pNcs, pFb]).then(([pr, nr, fr]) => {
      setPlans(pr.status === "fulfilled" ? (Array.isArray(pr.value) ? pr.value as AuditPlan[] : []) : []);
      setNcs(nr.status === "fulfilled"   ? (Array.isArray(nr.value) ? nr.value as NC[] : []) : []);
      setFeedbacks(fr.status === "fulfilled" ? (Array.isArray(fr.value) ? fr.value as AuditFeedback[] : []) : []);
    }).finally(() => setLoading(false));
  }, [certId]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const planStats = {
    total: plans.length,
    completed: plans.filter(p => ["COMPLETED", "CLOSED"].includes(p.status)).length,
    inProgress: plans.filter(p => p.status === "IN_PROGRESS").length,
    planned: plans.filter(p => p.status === "PLANNED").length,
    cancelled: plans.filter(p => p.status === "CANCELLED").length,
  };

  const ncStats = {
    total: ncs.length,
    open: ncs.filter(n => n.status === "OPEN").length,
    inProgress: ncs.filter(n => n.status === "ACTION_INITIATED").length,
    closed: ncs.filter(n => n.status === "CLOSED").length,
    major: ncs.filter(n => n.ncType === "MAJOR").length,
    minor: ncs.filter(n => n.ncType === "MINOR").length,
    overdue: ncs.filter(n => n.status !== "CLOSED" && n.targetDate && new Date(n.targetDate) < new Date()).length,
  };

  // Dept-wise NC
  const deptNc: Record<string, number> = {};
  ncs.forEach(n => { const d = n.department || "Unknown"; deptNc[d] = (deptNc[d] || 0) + 1; });
  const deptNcSorted = Object.entries(deptNc).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Auditor-wise plans
  const auditorPlans: Record<string, number> = {};
  plans.forEach(p => { const a = p.leadAuditor || "Unknown"; auditorPlans[a] = (auditorPlans[a] || 0) + 1; });
  const auditorSorted = Object.entries(auditorPlans).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Monthly trend (last 6 months)
  const monthlyMap: Record<string, { plans: number; ncs: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyMap[key] = { plans: 0, ncs: 0 };
  }
  plans.forEach(p => {
    const d = new Date(p.plannedStartDate || p.createdAt || "");
    if (isNaN(d.getTime())) return;
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (monthlyMap[key]) monthlyMap[key].plans += 1;
  });
  ncs.forEach(n => {
    const d = new Date(n.createdAt || n.targetDate || "");
    if (isNaN(d.getTime())) return;
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (monthlyMap[key]) monthlyMap[key].ncs += 1;
  });
  const monthlyData = Object.entries(monthlyMap);
  const maxMonthly = Math.max(...monthlyData.map(([, v]) => Math.max(v.plans, v.ncs)), 1);

  // Auditor feedback scores
  const auditorScores: Record<string, { total: number; count: number }> = {};
  const QUESTIONS = ["auditorKnowledge","technicalCompetency","auditCoverage","auditorQualities","employeeInteraction","clarityInCommunication","timeManagement","consistencyApproach","queryResponse","observationComments"];
  feedbacks.forEach(fb => {
    const name = fb.auditorName || "Unknown";
    const avg = QUESTIONS.reduce((s, k) => s + (fb[k] || 0), 0) / QUESTIONS.length;
    if (!auditorScores[name]) auditorScores[name] = { total: 0, count: 0 };
    auditorScores[name].total += avg;
    auditorScores[name].count += 1;
  });
  const auditorScoreSorted = Object.entries(auditorScores)
    .map(([name, { total, count }]) => ({ name, avg: total / count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6);

  const closureRate = planStats.total > 0 ? Math.round((planStats.completed / planStats.total) * 100) : 0;
  const ncClosureRate = ncStats.total > 0 ? Math.round((ncStats.closed / ncStats.total) * 100) : 0;

  if (loading) return <div className="py-20 text-center"><i className="fas fa-spinner fa-spin text-3xl" style={{ color: BRAND }} /></div>;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3 flex items-center gap-3">
        <i className="fas fa-filter text-gray-400" />
        <select value={certId ?? ""} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Standards</option>
          {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
        </select>
        <span className="text-xs text-gray-400 ml-2">Showing analytics {certId ? "for selected standard" : "across all standards"}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Audits"    value={planStats.total}     color={BRAND}     icon="fas fa-clipboard-list" />
        <KpiCard label="Completed"       value={planStats.completed} color="#10b981"   icon="fas fa-check-circle" />
        <KpiCard label="Open NCs"        value={ncStats.open}        color="#ef4444"   icon="fas fa-exclamation-triangle" />
        <KpiCard label="Overdue NCs"     value={ncStats.overdue}     color="#dc2626"   icon="fas fa-clock" />
        <KpiCard label="Total NCs"       value={ncStats.total}       color="#8b5cf6"   icon="fas fa-list" />
        <KpiCard label="Closed NCs"      value={ncStats.closed}      color="#6b7280"   icon="fas fa-lock" />
        <KpiCard label="Closure Rate"    value={`${closureRate}%`}   color="#f59e0b"   icon="fas fa-percent" />
        <KpiCard label="NC Closure Rate" value={`${ncClosureRate}%`} color="#3b82f6"   icon="fas fa-shield-alt" />
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Trend — Audits vs NCs (last 6 months)</h3>
        <div className="space-y-3">
          {monthlyData.map(([month, v]) => (
            <div key={month} className="grid grid-cols-[80px_1fr] gap-3 items-center">
              <span className="text-xs text-gray-500 font-medium">{month}</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-10 text-gray-400">Plans</span>
                  <Bar pct={(v.plans / maxMonthly) * 100} color={BRAND} />
                  <span className="text-xs text-gray-600 w-4 text-right">{v.plans}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-10 text-gray-400">NCs</span>
                  <Bar pct={(v.ncs / maxMonthly) * 100} color="#ef4444" />
                  <span className="text-xs text-gray-600 w-4 text-right">{v.ncs}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Audit Plan Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Audit Plan Status Breakdown</h3>
          {plans.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No audit data.</p> : (
            <div className="space-y-3">
              {[
                { label: "Completed / Closed", count: planStats.completed, color: "#10b981" },
                { label: "In Progress",         count: planStats.inProgress, color: "#f59e0b" },
                { label: "Planned",             count: planStats.planned,    color: "#3b82f6" },
                { label: "Cancelled",           count: planStats.cancelled,  color: "#6b7280" },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-36 text-xs font-medium text-gray-600">{row.label}</span>
                  <Bar pct={planStats.total > 0 ? (row.count / planStats.total) * 100 : 0} color={row.color} />
                  <span className="text-xs text-gray-500 w-5 text-right">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NC Type Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">NC Status Breakdown</h3>
          {ncs.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No NC data.</p> : (
            <div className="space-y-3">
              {[
                { label: "Open",            count: ncStats.open,       color: "#ef4444" },
                { label: "Action Initiated", count: ncStats.inProgress, color: "#f97316" },
                { label: "Closed",          count: ncStats.closed,     color: "#10b981" },
                { label: "Major NC",        count: ncStats.major,      color: "#dc2626" },
                { label: "Minor NC",        count: ncStats.minor,      color: "#f59e0b" },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-36 text-xs font-medium text-gray-600">{row.label}</span>
                  <Bar pct={ncStats.total > 0 ? (row.count / ncStats.total) * 100 : 0} color={row.color} />
                  <span className="text-xs text-gray-500 w-5 text-right">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department-wise NCs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Department-wise NCs (Top 8)</h3>
          {deptNcSorted.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No NC data.</p> : (
            <div className="space-y-3">
              {deptNcSorted.map(([dept, count]) => (
                <div key={dept} className="flex items-center gap-3">
                  <span className="w-32 text-xs font-medium text-gray-600 truncate" title={dept}>{dept}</span>
                  <Bar pct={(count / deptNcSorted[0][1]) * 100} color="#8b5cf6" />
                  <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auditor Performance (from plans) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Auditor Workload — Audit Plans</h3>
          {auditorSorted.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No audit data.</p> : (
            <div className="space-y-3">
              {auditorSorted.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-32 text-xs font-medium text-gray-600 truncate" title={name}>{name}</span>
                  <Bar pct={(count / auditorSorted[0][1]) * 100} color={BRAND} />
                  <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auditor Feedback Scores */}
      {auditorScoreSorted.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Auditor Feedback Scores (out of 4)</h3>
          <div className="space-y-3">
            {auditorScoreSorted.map(({ name, avg }) => {
              const color = avg >= 3.5 ? "#10b981" : avg >= 2.5 ? "#3b82f6" : avg >= 1.5 ? "#f59e0b" : "#ef4444";
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-36 text-xs font-medium text-gray-600 truncate" title={name}>{name}</span>
                  <Bar pct={(avg / 4) * 100} color={color} />
                  <span className="text-xs font-bold w-10 text-right" style={{ color }}>{avg.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            {[["#10b981","≥ 3.5 Excellent"],["#3b82f6","≥ 2.5 Good"],["#f59e0b","≥ 1.5 Average"],["#ef4444","< 1.5 Poor"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} /><span>{l}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
