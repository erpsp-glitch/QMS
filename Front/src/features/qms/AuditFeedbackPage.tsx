import { useEffect, useState } from "react";
import { auditApi, certApi } from "../../api/qms.api";
import type { Certification, AuditPlan, AuditFeedback, InputChg } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiTrash2, FiX, FiRefreshCw, FiChevronDown,
  FiChevronUp, FiAlertTriangle, FiCheckCircle, FiStar, FiUser,
  FiEye, FiBarChart2, FiFileText, FiGrid, FiList
} from "react-icons/fi";

const QUESTIONS = [
  { key: "auditorKnowledge", label: "Knowledge of the Auditors" },
  { key: "technicalCompetency", label: "Technical competency of the Auditors" },
  { key: "auditCoverage", label: "Coverage of all requirements in your Process" },
  { key: "auditorQualities", label: "Qualities of the Auditor" },
  { key: "employeeInteraction", label: "Interaction with all levels of employees" },
  { key: "clarityInCommunication", label: "Clarity in Communication" },
  { key: "timeManagement", label: "Time Management" },
  { key: "consistencyApproach", label: "Consistency in the approach" },
  { key: "queryResponse", label: "Response to queries by the auditees" },
  { key: "observationComments", label: "Comments about the audit observations" },
];

const RATINGS = [
  { value: 4, label: "Excellent", color: "border-green-400 bg-green-100 text-green-700" },
  { value: 3, label: "Good", color: "border-blue-400 bg-blue-100 text-blue-700" },
  { value: 2, label: "Average", color: "border-yellow-400 bg-yellow-100 text-yellow-700" },
  { value: 1, label: "Poor", color: "border-red-400 bg-red-100 text-red-700" },
];

const EMPTY_FORM = {
  auditorName: "", auditeeName: "", process: "", auditDate: "",
  auditorKnowledge: 0, technicalCompetency: 0, auditCoverage: 0,
  auditorQualities: 0, employeeInteraction: 0, clarityInCommunication: 0,
  timeManagement: 0, consistencyApproach: 0, queryResponse: 0, observationComments: 0,
  incidentExplanation: "", valueAdditions: "", suggestions: "",
};

const avgScore = (fb: AuditFeedback) => QUESTIONS.reduce((sum, q) => sum + ((fb[q.key as keyof AuditFeedback] as number) || 0), 0) / QUESTIONS.length;
const avgLabel = (avg: number) => avg >= 3.5 ? "Excellent" : avg >= 2.5 ? "Good" : avg >= 1.5 ? "Average" : "Poor";
const avgColor = (avg: number) => avg >= 3.5 ? "from-green-500 to-emerald-600" : avg >= 2.5 ? "from-blue-500 to-blue-600" : avg >= 1.5 ? "from-yellow-500 to-orange-500" : "from-red-500 to-red-600";

export default function AuditFeedbackPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [certId, setCertId] = useState<number | null>(null);
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [feedbacks, setFeedbacks] = useState<AuditFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<AuditFeedback> & typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [viewItem, setViewItem] = useState<AuditFeedback | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const p = certId ? auditApi.getPlansByCert(certId) : auditApi.getPlans();
    p.then((d: unknown) => setPlans(Array.isArray(d) ? d as AuditPlan[] : [])).catch(() => setPlans([]));
    setPlanId(null); setFeedbacks([]);
  }, [certId]);

  useEffect(() => {
    if (!planId) { setFeedbacks([]); return; }
    loadFeedback(planId);
  }, [planId]);

  const loadFeedback = (id: number) => {
    setLoading(true);
    auditApi.getFeedbackByPlan(id).then((d: unknown) => setFeedbacks(Array.isArray(d) ? d as AuditFeedback[] : [])).catch(() => setFeedbacks([])).finally(() => setLoading(false));
  };

  const openForm = () => {
    if (!planId) { alert("Select an audit plan first."); return; }
    const plan = plans.find(p => p.id === planId);
    setForm({ ...EMPTY_FORM, auditDate: plan?.plannedStartDate || "" });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.auditorName || !form.auditeeName) { alert("Auditor Name and Auditee Name are required."); return; }
    const allRated = QUESTIONS.every(q => (form[q.key] || 0) > 0);
    if (!allRated) { alert("Please rate all 10 attributes."); return; }
    const hasLow = QUESTIONS.some(q => (form[q.key] || 0) <= 2);
    if (hasLow && !form.incidentExplanation.trim()) { alert("An Average or Poor rating requires an Incident Explanation."); return; }
    setSaving(true);
    try {
      await auditApi.createFeedback({ ...form, auditPlan: { id: planId }, status: "SUBMITTED" });
      setShowForm(false);
      loadFeedback(planId!);
    } catch (e: unknown) { alert(apiMsg(e, "Save failed")); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    try { await auditApi.deleteFeedback(id); setDeleteId(null); loadFeedback(planId!); }
    catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
  };

  const setRating = (key: string, val: number) => setForm(p => ({ ...p, [key]: val } as typeof form));
  const ff = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as typeof form));
  const hasLowRating = QUESTIONS.some(q => (form[q.key] || 0) > 0 && (form[q.key] || 0) <= 2);

  const filtered = feedbacks.filter(fb => !search || [fb.auditorName, fb.auditeeName, fb.process].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  const totalFb = feedbacks.length;
  const overallAvg = totalFb > 0 ? (feedbacks.reduce((sum, fb) => sum + avgScore(fb), 0) / totalFb) : 0;
  const lowCount = feedbacks.filter(fb => avgScore(fb) < 2).length;
  const excellentCount = feedbacks.filter(fb => avgScore(fb) >= 3.5).length;

  const inp = "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-5 border border-amber-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Audit Feedback
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Collect and analyse feedback on internal audit quality</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setViewMode(v => v === "table" ? "card" : "table")} className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-400 text-sm flex items-center gap-2 transition-all">
              {viewMode === "table" ? <><FiGrid /> Card View</> : <><FiList /> Table View</>}
            </button>
            {planId && (
              <button onClick={() => loadFeedback(planId)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm flex items-center gap-2 transition-all">
                <FiRefreshCw /> Refresh
              </button>
            )}
            <button onClick={openForm} className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all">
              <FiPlus /> Add Feedback
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Feedback", value: totalFb, from: "from-amber-500", to: "to-orange-500", icon: <FiFileText className="text-xl" /> },
            { label: "Avg Score", value: overallAvg > 0 ? overallAvg.toFixed(2) + " / 4" : "—", from: "from-blue-500", to: "to-indigo-600", icon: <FiBarChart2 className="text-xl" /> },
            { label: "Excellent Ratings", value: excellentCount, from: "from-green-500", to: "to-emerald-600", icon: <FiStar className="text-xl" /> },
            { label: "Low Ratings", value: lowCount, from: "from-red-500", to: "to-red-600", icon: <FiAlertTriangle className="text-xl" /> },
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
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            <select value={certId ?? ""} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-400">
              <option value="">All Standards</option>
              {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </select>
            <select value={planId ?? ""} onChange={e => setPlanId(e.target.value ? Number(e.target.value) : null)} className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-400 min-w-64">
              <option value="">Select Audit Plan...</option>
              {plans.map((p: AuditPlan) => <option key={p.id} value={p.id}>{p.auditRefNo} — {p.auditType}</option>)}
            </select>
            {planId && (
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" placeholder="Search auditor, auditee, process..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 bg-white text-sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {!planId ? (
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 py-24 text-center">
          <FiStar className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Select an audit plan to view or add feedback</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 py-20 text-center">
          <FiStar className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No feedback submitted yet</p>
          <button onClick={openForm} className="mt-3 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 mx-auto hover:from-amber-600 hover:to-orange-600">
            <FiPlus /> Submit First Feedback
          </button>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((fb: AuditFeedback) => {
            const avg = avgScore(fb);
            const lowRatings = QUESTIONS.filter(q => ((fb[q.key as keyof AuditFeedback] as number) || 0) > 0 && ((fb[q.key as keyof AuditFeedback] as number) || 0) <= 2).length;
            return (
              <div key={fb.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl transition-all overflow-hidden">
                <div className={`bg-gradient-to-r ${avgColor(avg)} p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">{fb.auditorName || "—"}</p>
                      <p className="text-white/80 text-xs mt-0.5">Auditee: {fb.auditeeName || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{avg.toFixed(1)}</p>
                      <p className="text-white/80 text-xs">{avgLabel(avg)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Process</span><span className="font-medium">{fb.process || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{fb.auditDate || "—"}</span></div>
                  {lowRatings > 0 && (
                    <div className="flex justify-between"><span className="text-gray-500">Low Ratings</span><span className="font-medium text-red-600">{lowRatings} attribute{lowRatings > 1 ? "s" : ""}</span></div>
                  )}
                  {/* Mini rating bar */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex gap-0.5">
                      {QUESTIONS.map(q => {
                        const v = fb[q.key] || 0;
                        const h = v === 4 ? "bg-green-500" : v === 3 ? "bg-blue-500" : v === 2 ? "bg-yellow-500" : v === 1 ? "bg-red-500" : "bg-gray-200";
                        return <div key={q.key} className={`flex-1 h-2 rounded-sm ${h}`} title={`${q.label}: ${v}`} />;
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Rating distribution (hover for detail)</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setViewItem(fb)} className="flex-1 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-100 flex items-center justify-center gap-1"><FiEye /> View</button>
                    <button onClick={() => setDeleteId(fb.id)} className="py-1.5 px-3 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  {["Auditor","Auditee","Process","Date","Avg Score","Low Ratings","Status","Actions",""].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((fb: AuditFeedback) => {
                  const avg = avgScore(fb);
                  const lowRatings = QUESTIONS.filter(q => ((fb[q.key as keyof AuditFeedback] as number) || 0) > 0 && ((fb[q.key as keyof AuditFeedback] as number) || 0) <= 2).length;
                  return (
                    <>
                      <tr key={fb.id} className="hover:bg-amber-50/40 transition-colors group">
                        <td className="px-4 py-3 font-semibold text-gray-800">{fb.auditorName || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{fb.auditeeName || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{fb.process || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fb.auditDate || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${avgColor(avg)} text-white`}>{avg.toFixed(1)} / 4</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lowRatings > 0 ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-semibold">{lowRatings}</span> : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{fb.status || "SUBMITTED"}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewItem(fb)} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"><FiEye /></button>
                            <button onClick={() => setDeleteId(fb.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><FiTrash2 /></button>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button onClick={() => setExpandedRows(prev => { const n = new Set(prev); n.has(fb.id) ? n.delete(fb.id) : n.add(fb.id); return n; })} className="text-gray-400 hover:text-amber-600 transition-colors">
                            {expandedRows.has(fb.id) ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </td>
                      </tr>
                      {expandedRows.has(fb.id) && (
                        <tr key={`exp-${fb.id}`} className="bg-amber-50/30">
                          <td colSpan={9} className="px-6 py-4 text-sm">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {QUESTIONS.slice(0,5).map(q => {
                                const v = fb[q.key] || 0;
                                const r = RATINGS.find(r => r.value === v);
                                return <div key={q.key}><p className="text-xs text-gray-400 mb-1">{q.label}</p><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r ? r.color : "bg-gray-100 text-gray-500"}`}>{v > 0 ? `${v} — ${r?.label}` : "—"}</span></div>;
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Feedback Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Internal Audit Feedback</h2>
                <p className="text-amber-100 text-xs mt-0.5">Rate individual auditors — give separate feedback for each</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"><FiX /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[76vh] space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Name of The Auditor *</label><input value={form.auditorName} onChange={ff("auditorName")} placeholder="Auditor name" className={inp} /></div>
                <div><label className={lbl}>Process / Department</label><input value={form.process} onChange={ff("process")} placeholder="Process / Department" className={inp} /></div>
                <div><label className={lbl}>Name of The Auditee *</label><input value={form.auditeeName} onChange={ff("auditeeName")} placeholder="Auditee name" className={inp} /></div>
                <div><label className={lbl}>Date of Audit</label><input type="date" value={form.auditDate} onChange={ff("auditDate")} className={inp} /></div>
              </div>

              {/* Rating Table */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Please rate our Internal Audit</p>
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-amber-500 to-orange-500">
                        <th className="px-3 py-2.5 text-left text-white text-xs w-8">#</th>
                        <th className="px-3 py-2.5 text-left text-white text-xs">Attribute</th>
                        {RATINGS.map(r => (
                          <th key={r.value} className="px-2 py-2.5 text-center text-white text-xs whitespace-nowrap">
                            {r.label}<br /><span className="font-normal opacity-80">({r.value})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {QUESTIONS.map((q, idx) => {
                        const current = form[q.key] || 0;
                        const isLow = current > 0 && current <= 2;
                        return (
                          <tr key={q.key} className={isLow ? "bg-red-50/60" : idx % 2 === 0 ? "bg-gray-50/40" : ""}>
                            <td className="px-3 py-2.5 text-gray-400 text-xs">{idx + 1}.</td>
                            <td className="px-3 py-2.5 text-gray-700 text-xs leading-snug">{q.label}</td>
                            {RATINGS.map(r => (
                              <td key={r.value} className="px-2 py-2.5 text-center">
                                <button type="button" onClick={() => setRating(q.key, r.value)}
                                  className={`w-8 h-8 rounded-full border-2 text-xs font-bold transition-all ${current === r.value ? `${r.color} scale-110` : "border-gray-200 text-gray-300 hover:border-gray-400 hover:text-gray-500"}`}>
                                  {r.value}
                                </button>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {hasLowRating && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
                    <FiAlertTriangle /> In case of Average or Poor rating — specify the incident that led to this decision *
                  </p>
                  <textarea value={form.incidentExplanation} onChange={ff("incidentExplanation")} rows={3}
                    placeholder="Describe the specific incident or observation..." className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
                </div>
              )}

              <div><label className={lbl}>Value Additions obtained during the audit</label><textarea value={form.valueAdditions} onChange={ff("valueAdditions")} rows={2} className={inp} /></div>
              <div><label className={lbl}>Suggestions for improvement</label><textarea value={form.suggestions} onChange={ff("suggestions")} rows={2} className={inp} /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={save} disabled={saving} className="px-6 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 shadow-lg flex items-center gap-2 transition-all">
                {saving ? <><FiRefreshCw className="animate-spin" /> Submitting...</> : <><FiCheckCircle /> Submit Feedback</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${avgColor(avgScore(viewItem))} px-6 py-4 flex items-center justify-between`}>
              <div>
                <h2 className="text-lg font-bold text-white">{viewItem.auditorName}</h2>
                <p className="text-white/80 text-xs mt-0.5">Auditee: {viewItem.auditeeName} · {viewItem.process}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{avgScore(viewItem).toFixed(1)}</p>
                <p className="text-white/80 text-xs">{avgLabel(avgScore(viewItem))} / 4</p>
              </div>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["Auditor", viewItem.auditorName],["Auditee", viewItem.auditeeName],["Process", viewItem.process],["Date", viewItem.auditDate]].map(([l,v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400">{l}</p><p className="font-semibold text-gray-800">{v || "—"}</p></div>
                ))}
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50"><th className="px-3 py-2 text-left text-gray-500">#</th><th className="px-3 py-2 text-left text-gray-500">Attribute</th><th className="px-3 py-2 text-center text-gray-500">Score</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {QUESTIONS.map((q, i) => {
                      const score = viewItem[q.key] || 0;
                      const r = RATINGS.find(r => r.value === score);
                      return (
                        <tr key={q.key} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-400">{i + 1}.</td>
                          <td className="px-3 py-2 text-gray-700">{q.label}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r ? r.color : "bg-gray-100 text-gray-500"}`}>
                              {score > 0 ? `${score} — ${r?.label}` : "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-amber-50 font-semibold">
                      <td className="px-3 py-2 text-amber-700" colSpan={2}>Average Score</td>
                      <td className="px-3 py-2 text-center text-amber-700">{avgScore(viewItem).toFixed(2)} / 4</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {viewItem.incidentExplanation && <div className="bg-orange-50 border border-orange-200 rounded-xl p-3"><p className="text-xs font-semibold text-orange-700 mb-1">Incident Explanation</p><p className="text-xs text-gray-700">{viewItem.incidentExplanation}</p></div>}
              {viewItem.valueAdditions && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-semibold text-gray-600 mb-1">Value Additions</p><p className="text-xs text-gray-700">{viewItem.valueAdditions}</p></div>}
              {viewItem.suggestions && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-semibold text-gray-600 mb-1">Suggestions</p><p className="text-xs text-gray-700">{viewItem.suggestions}</p></div>}
            </div>
            <div className="flex justify-end px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setViewItem(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Feedback</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this audit feedback record?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
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
