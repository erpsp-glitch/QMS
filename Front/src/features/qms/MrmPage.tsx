import { useEffect, useState } from "react";
import { mrmApi } from "../../api/qms.api";
import CertFilter from "./components/CertFilter";

const BRAND = "#280882";
const MRM_TYPES = ["ANNUAL", "HALF_YEARLY", "QUARTERLY", "EXTRAORDINARY"];
const PLAN_STATUSES = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const MIN_STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const EMPTY_PLAN = {
  mrmType: "ANNUAL", chairman: "", mrRepresentative: "", coordinator: "",
  meetingDate: "", scope: "", status: "PLANNED", remarks: "", certification: null as any,
};

export default function MrmPage() {
  const [certId, setCertId] = useState<number | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [minutes, setMinutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"plans" | "agenda" | "minutes">("plans");

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState<any>(EMPTY_PLAN);
  const [saving, setSaving] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);

  const loadPlans = () => {
    setLoading(true);
    const p = certId ? mrmApi.getPlansByCert(certId) : mrmApi.getPlans();
    p.then((d: any) => setPlans(d)).catch(() => setPlans([])).finally(() => setLoading(false));
  };

  const loadPlanDetails = (planId: number) => {
    mrmApi.getAgenda(planId).then((d: any) => setAgenda(d)).catch(() => setAgenda([]));
    mrmApi.getMinutes(planId).then((d: any) => setMinutes(d)).catch(() => setMinutes([]));
  };

  useEffect(() => { loadPlans(); }, [certId]);

  useEffect(() => {
    if (selectedPlan) loadPlanDetails(selectedPlan.id);
  }, [selectedPlan]);

  const selectPlan = (p: any) => { setSelectedPlan(p); setTab("agenda"); };

  const openAddPlan = () => { setEditingPlan(null); setPlanForm({ ...EMPTY_PLAN, certification: certId ? { id: certId } : null }); setShowPlanModal(true); };
  const openEditPlan = (p: any) => { setEditingPlan(p); setPlanForm({ ...p }); setShowPlanModal(true); };

  const savePlan = async () => {
    setSaving(true);
    try {
      if (editingPlan) await mrmApi.updatePlan(editingPlan.id, planForm);
      else await mrmApi.createPlan(planForm);
      setShowPlanModal(false);
      loadPlans();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id: number) => {
    try { await mrmApi.deletePlan(id); if (selectedPlan?.id === id) setSelectedPlan(null); setDeletePlanId(null); loadPlans(); }
    catch { alert("Delete failed."); }
  };

  const pf = (k: string) => (e: any) => setPlanForm({ ...planForm, [k]: e.target.value });

  const statusBadge = (s: string, colors: Record<string, string>) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] || "bg-gray-100 text-gray-600"}`}>{s}</span>
  );

  const planColors: Record<string, string> = {
    PLANNED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-800">Management Review Meetings</h1>
        <div className="flex items-center gap-2">
          <CertFilter value={certId} onChange={setCertId} />
          <button onClick={openAddPlan} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: BRAND }}>
            <i className="fas fa-plus" /> New MRM Plan
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Plans List */}
        <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">MRM Plans</div>
          {loading ? (
            <div className="py-8 text-center"><i className="fas fa-spinner fa-spin" style={{ color: BRAND }} /></div>
          ) : plans.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">No plans found.</div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[calc(100vh-300px)]">
              {plans.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => selectPlan(p)}
                  className={`px-4 py-3 cursor-pointer hover:bg-purple-50 transition-colors ${selectedPlan?.id === p.id ? "bg-purple-50 border-l-4 border-purple-700" : ""}`}
                >
                  <p className="text-xs font-mono font-semibold" style={{ color: BRAND }}>{p.mrmRefNo}</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">{p.mrmType}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.meetingDate}</p>
                  <div className="flex items-center justify-between mt-1">
                    {statusBadge(p.status, planColors)}
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEditPlan(p); }} className="p-1 text-gray-400 hover:text-purple-600"><i className="fas fa-edit text-xs" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeletePlanId(p.id); }} className="p-1 text-gray-400 hover:text-red-500"><i className="fas fa-trash text-xs" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {!selectedPlan ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <i className="fas fa-mouse-pointer text-3xl mb-2 block" />
                <p>Select a plan to view details</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b flex items-center gap-4">
                <p className="font-semibold text-gray-800">{selectedPlan.mrmRefNo} — {selectedPlan.mrmType}</p>
                <div className="flex gap-2 ml-auto">
                  {["agenda", "minutes"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
                      style={tab === t ? { background: BRAND } : {}}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {tab === "agenda" && <AgendaTab planId={selectedPlan.id} agenda={agenda} reload={() => loadPlanDetails(selectedPlan.id)} />}
              {tab === "minutes" && <MinutesTab planId={selectedPlan.id} minutes={minutes} reload={() => loadPlanDetails(selectedPlan.id)} />}
            </>
          )}
        </div>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: BRAND }}>
              <h2 className="text-lg font-semibold text-white">{editingPlan ? "Edit MRM Plan" : "New MRM Plan"}</h2>
              <button onClick={() => setShowPlanModal(false)} className="text-white/70 hover:text-white"><i className="fas fa-times" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">MRM Type</label>
                <select value={planForm.mrmType} onChange={pf("mrmType")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600">
                  {MRM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Date</label>
                <input type="date" value={planForm.meetingDate || ""} onChange={pf("meetingDate")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Chairman</label>
                <input value={planForm.chairman || ""} onChange={pf("chairman")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">MR Representative</label>
                <input value={planForm.mrRepresentative || ""} onChange={pf("mrRepresentative")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Coordinator</label>
                <input value={planForm.coordinator || ""} onChange={pf("coordinator")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={planForm.status} onChange={pf("status")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600">
                  {PLAN_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Certification ID</label>
                <input type="number" value={planForm.certification?.id || ""} onChange={(e) => setPlanForm({ ...planForm, certification: e.target.value ? { id: Number(e.target.value) } : null })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Scope</label>
                <textarea value={planForm.scope || ""} onChange={pf("scope")} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={savePlan} disabled={saving} className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-1" /> Saving...</> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Plan Confirmation */}
      {deletePlanId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><i className="fas fa-exclamation-triangle text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete MRM Plan</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this MRM plan? This will also delete all linked minutes and agenda items.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePlanId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => deletePlan(deletePlanId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <i className="fas fa-trash text-sm" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgendaTab({ planId, agenda, reload }: { planId: number; agenda: any[]; reload: () => void }) {
  const [form, setForm] = useState({ agendaTopic: "", inputDetails: "", responsibility: "", serialNo: agenda.length + 1 });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.agendaTopic) return;
    setSaving(true);
    try {
      await mrmApi.saveAgenda({ ...form, mrmPlan: { id: planId } });
      setForm({ agendaTopic: "", inputDetails: "", responsibility: "", serialNo: agenda.length + 2 });
      reload();
    } catch { alert("Save failed"); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => { await mrmApi.deleteAgenda(id); reload(); };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <input value={form.agendaTopic} onChange={(e) => setForm({ ...form, agendaTopic: e.target.value })} placeholder="Agenda topic *" className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600" />
        <input value={form.responsibility} onChange={(e) => setForm({ ...form, responsibility: e.target.value })} placeholder="Responsibility" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600" />
        <textarea value={form.inputDetails} onChange={(e) => setForm({ ...form, inputDetails: e.target.value })} placeholder="Details / Input" rows={2} className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600" />
        <button onClick={save} disabled={saving} className="px-3 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60 self-end" style={{ background: BRAND }}>
          {saving ? <i className="fas fa-spinner fa-spin" /> : "Add Agenda"}
        </button>
      </div>
      {agenda.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">No agenda items yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="px-3 py-2 text-left w-8">#</th>
              <th className="px-3 py-2 text-left">Topic</th>
              <th className="px-3 py-2 text-left">Responsibility</th>
              <th className="px-3 py-2 text-left">Details</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agenda.map((a: any) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-400">{a.serialNo}</td>
                <td className="px-3 py-2 font-medium">{a.agendaTopic}</td>
                <td className="px-3 py-2 text-gray-500">{a.responsibility}</td>
                <td className="px-3 py-2 text-gray-500 text-xs">{a.inputDetails}</td>
                <td className="px-3 py-2">
                  <button onClick={() => del(a.id)} className="text-red-400 hover:text-red-600"><i className="fas fa-trash text-xs" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function MinutesTab({ planId, minutes, reload }: { planId: number; minutes: any[]; reload: () => void }) {
  const [form, setForm] = useState({ discussionPoint: "", decision: "", actionRequired: false, assignedTo: "", dueDate: "", priority: "MEDIUM", status: "OPEN" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.discussionPoint) return;
    setSaving(true);
    try {
      await mrmApi.saveMinutes({ ...form, mrmPlan: { id: planId } });
      setForm({ discussionPoint: "", decision: "", actionRequired: false, assignedTo: "", dueDate: "", priority: "MEDIUM", status: "OPEN" });
      reload();
    } catch { alert("Save failed"); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id: number, status: string) => {
    await mrmApi.updateMinutesStatus(id, status);
    reload();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
        <textarea value={form.discussionPoint} onChange={(e) => setForm({ ...form, discussionPoint: e.target.value })} placeholder="Discussion point *" rows={2} className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600" />
        <textarea value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value })} placeholder="Decision / Resolution" rows={2} className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600" />
        <input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Assigned to" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.actionRequired} onChange={(e) => setForm({ ...form, actionRequired: e.target.checked })} className="w-4 h-4" />
          <label className="text-sm text-gray-600">Action Required</label>
        </div>
        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
            {saving ? <i className="fas fa-spinner fa-spin" /> : "Add Minutes"}
          </button>
        </div>
      </div>
      {minutes.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">No minutes recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {minutes.map((m: any) => (
            <div key={m.id} className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">{m.discussionPoint}</p>
              {m.decision && <p className="text-xs text-gray-500 mt-1">Decision: {m.decision}</p>}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {m.actionRequired && <span className="text-orange-500 font-medium">Action Required</span>}
                  {m.assignedTo && <span>Assigned: {m.assignedTo}</span>}
                  {m.dueDate && <span>Due: {m.dueDate}</span>}
                </div>
                <select
                  value={m.status}
                  onChange={(e) => updateStatus(m.id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  {MIN_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
