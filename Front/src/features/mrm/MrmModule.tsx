import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mrmApi, certApi, kpiApi, auditApi, kpiReviewApi, auditReviewApi, prpApi, prsApi, actionTrackerApi, deptApi } from '../../api/qms.api';
import { exportCSV } from '../master-data/chartUtils';
import { FiAlertTriangle, FiTrash2, FiCheck, FiX as FiXIcon } from 'react-icons/fi';
import type { MrmPlan, MrmMinutes as MrmMinutesType, MrmAgenda, KpiMaster, Certification, AuditPlan, NC, CertRef, KpiReview, KpiReviewItem, InternalAuditReview, ProcessReviewPlan as PRP, ProcessReviewSheet as PRS, ReviewChecklistItem, ActionTracker as AT, Department } from '../qms/types';
import { apiMsg } from '../qms/types';

const BRAND = '#280882';
const MRM_TYPES = ['ANNUAL', 'HALF_YEARLY', 'QUARTERLY', 'SPECIAL_REVIEW', 'MANAGEMENT_REVIEW'];
const PLAN_STATUSES = ['PLANNED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const MIN_STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'CLOSED'];

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const TABS = [
  { id: 'dashboard',     label: 'Dashboard',          icon: 'fas fa-chart-pie'       },
  { id: 'plans',         label: 'MRM Plan',            icon: 'fas fa-calendar'        },
  { id: 'process-plan',  label: 'Process Review Plan', icon: 'fas fa-list-check'      },
  { id: 'process-sheet', label: 'Process Review Sheet',icon: 'fas fa-clipboard-list'  },
  { id: 'minutes',       label: 'Minutes of Meeting',  icon: 'fas fa-file-signature'  },
  { id: 'action-tracker',label: 'Action Tracker',      icon: 'fas fa-tasks'           },
  { id: 'kpi-review',    label: 'KPI Review',          icon: 'fas fa-chart-line'      },
  { id: 'audit-review',  label: 'Audit Review',        icon: 'fas fa-clipboard-check' },
  { id: 'reports',       label: 'Reports',             icon: 'fas fa-file-pdf'        },
];

const EMPTY_PLAN = {
  mrmType: 'ANNUAL', chairman: '', mrRepresentative: '', coordinator: '',
  meetingDate: '', meetingTime: '', meetingLocation: '', financialYear: '',
  scope: '', status: 'PLANNED', remarks: '', certification: null as CertRef | null,
  attendees: [] as string[], invitees: [] as string[],
};

export default function MrmModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const certIdStr = searchParams.get('certId') || '';
  const certId = certIdStr ? Number(certIdStr) : null;
  const [certs, setCerts] = useState<Certification[]>([]);

  const setTab = (tab: string) => setSearchParams({ tab, ...(certIdStr ? { certId: certIdStr } : {}) }, { replace: true });
  const onCertChange = (val: string) => setSearchParams({ tab: activeTab, ...(val ? { certId: val } : {}) }, { replace: true });

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#280882] to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Management Review Meeting</h1>
            <p className="text-sm text-purple-200 mt-0.5">Plan, conduct, document, and track Management Review Meetings</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={certIdStr}
              onChange={e => onCertChange(e.target.value)}
              className="border border-white/30 rounded-lg px-3 py-1.5 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="" className="text-gray-800 bg-white">All Certifications</option>
              {certs.map((c: Certification) => (
                <option key={c.id} value={c.id} className="text-gray-800 bg-white">{c.code} — {c.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-xs text-purple-200 bg-white/10 px-3 py-1.5 rounded-lg">
              <i className="fas fa-users" />
              <span className="font-medium">MRM</span>
              <span className="opacity-50">›</span>
              <span>{TABS.find(t => t.id === activeTab)?.label}</span>
            </div>
          </div>
        </div>
        <nav className="flex min-w-max overflow-x-auto bg-white">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'border-b-[#280882] text-[#280882] bg-purple-50/60'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <i className={`${tab.icon} text-xs`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div key={`${activeTab}-${certIdStr}`}>
        {activeTab === 'dashboard'     && <MrmDashboard onNavigate={setTab} certId={certId} />}
        {activeTab === 'plans'         && <MrmPlans certId={certId} />}
        {activeTab === 'process-plan'  && <ProcessReviewPlan certId={certId} />}
        {activeTab === 'process-sheet' && <ProcessReviewSheet certId={certId} />}
        {activeTab === 'minutes'       && <MrmMinutes certId={certId} />}
        {activeTab === 'action-tracker'&& <ActionTracker />}
        {activeTab === 'kpi-review'    && <MrmKpiReview certId={certId} />}
        {activeTab === 'audit-review'  && <MrmAuditReview certId={certId} />}
        {activeTab === 'reports'       && <MrmReports />}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function MrmDashboard({ onNavigate, certId }: { onNavigate: (tab: string) => void; certId: number | null }) {
  const [plans,   setPlans]   = useState<MrmPlan[]>([]);
  const [minutes, setMinutes] = useState<MrmMinutesType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const planLoader = certId ? mrmApi.getPlansByCert(certId) : mrmApi.getPlans();
    Promise.allSettled([planLoader, mrmApi.getPendingActions()])
      .then(([pRes, mRes]) => {
        setPlans(pRes.status === 'fulfilled' ? (Array.isArray(pRes.value) ? pRes.value : []) : []);
        setMinutes(mRes.status === 'fulfilled' ? (Array.isArray(mRes.value) ? mRes.value : []) : []);
      }).finally(() => setLoading(false));
  }, [certId]);

  const stats = {
    total:      plans.length,
    planned:    plans.filter(p => p.status === 'PLANNED').length,
    inProgress: plans.filter(p => p.status === 'IN_PROGRESS').length,
    completed:  plans.filter(p => p.status === 'COMPLETED').length,
    openActions:minutes.filter(m => m.actionRequired && m.status === 'OPEN').length,
  };

  const upcoming = [...plans]
    .filter(p => p.status === 'PLANNED' && p.meetingDate)
    .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime())
    .slice(0, 5);

  if (loading) return <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total MRMs',   value: stats.total,       icon: 'fas fa-users',       grad: 'from-[#280882] to-indigo-700' },
          { label: 'Planned',      value: stats.planned,     icon: 'fas fa-calendar',    grad: 'from-blue-500 to-blue-600' },
          { label: 'In Progress',  value: stats.inProgress,  icon: 'fas fa-spinner',     grad: 'from-yellow-500 to-orange-500' },
          { label: 'Completed',    value: stats.completed,   icon: 'fas fa-check-circle',grad: 'from-green-500 to-emerald-600' },
          { label: 'Open Actions', value: stats.openActions, icon: 'fas fa-tasks',       grad: 'from-red-500 to-red-600' },
        ].map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.grad} text-white p-4 rounded-xl shadow-lg`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><i className={`${k.icon} text-sm`} /></div>
              <div><p className="text-xs opacity-90">{k.label}</p><p className="text-2xl font-bold">{k.value}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">MRMs by Type</h3>
          {plans.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No MRM plans yet.</p>
          ) : (
            <div className="space-y-2.5">
              {MRM_TYPES.map((type, i) => {
                const count = plans.filter(p => p.mrmType === type).length;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const colors = [BRAND, '#10b981', '#f59e0b', '#ef4444'];
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[i] }} />
                    <span className="w-28 text-xs font-medium text-gray-600">{type}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                    </div>
                    <span className="w-6 text-xs text-gray-500 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Upcoming MRMs</h3>
            <button onClick={() => onNavigate('plans')} className="text-xs font-medium" style={{ color: BRAND }}>+ New Plan</button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No upcoming MRMs.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((p: MrmPlan) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND}15` }}>
                    <i className="fas fa-calendar text-xs" style={{ color: BRAND }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{p.mrmRefNo} — {p.mrmType}</p>
                    <p className="text-xs text-gray-500">{p.meetingDate} · Chair: {p.chairman || '—'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">PLANNED</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agenda quick list */}
      {minutes.filter(m => m.actionRequired && m.status === 'OPEN').length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Open Action Items</h3>
            <button onClick={() => onNavigate('action-tracker')} className="text-xs font-medium" style={{ color: BRAND }}>View All →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {minutes.filter(m => m.actionRequired && m.status === 'OPEN').slice(0, 5).map((m: MrmMinutesType) => (
              <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{m.discussionDetails}</p>
                  <p className="text-[10px] text-gray-400">Responsible: {m.responsiblePerson || '—'} · Target: {m.targetDate || '—'}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">OPEN</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AttendeePanel helper ──────────────────────────────────────────────────────
function AttendeePanel({ title, subtitle, list, onAdd, onRemove, quickAdd }:
  { title: string; subtitle: string; list: string[]; onAdd: (n: string) => void; onRemove: (n: string) => void; quickAdd: string[] }) {
  const [input, setInput] = useState('');
  const remaining = quickAdd.filter(n => n && !list.includes(n));
  return (
    <div className="bg-green-50/40 rounded-xl p-4 border border-green-100">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">{title}</p>
      <p className="text-[10px] text-gray-400 mb-3">{subtitle}</p>
      {/* Quick-add chips from key people */}
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {remaining.map(n => (
            <button key={n} onClick={() => onAdd(n)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-green-300 text-green-700 rounded-full text-[11px] hover:bg-green-100 transition-colors">
              <i className="fas fa-plus text-[9px]" /> {n}
            </button>
          ))}
        </div>
      )}
      {/* Manual input */}
      <div className="flex gap-2 mb-3">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { onAdd(input); setInput(''); } }}
          placeholder={`Type name and press Enter to add...`}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500" />
        <button onClick={() => { onAdd(input); setInput(''); }}
          className="px-3 py-1.5 rounded-lg text-white text-xs font-medium" style={{ background: BRAND }}>
          Add
        </button>
      </div>
      {/* List */}
      {list.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No {title.toLowerCase()} added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {list.map(n => (
            <span key={n} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-purple-200 text-purple-800 rounded-full text-xs font-medium">
              {n}
              <button onClick={() => onRemove(n)} className="hover:text-red-500 transition-colors"><i className="fas fa-times text-[9px]" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MRM Plans ─────────────────────────────────────────────────────────────────
function MrmPlans({ certId }: { certId: number | null }) {
  const [plans,     setPlans]     = useState<MrmPlan[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [certs,     setCerts]     = useState<Certification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<MrmPlan | null>(null);
  const [form,      setForm]      = useState<typeof EMPTY_PLAN>(EMPTY_PLAN);
  const [saving,    setSaving]    = useState(false);
  const [viewPlan,  setViewPlan]  = useState<MrmPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    const loader = certId ? mrmApi.getPlansByCert(certId) : mrmApi.getPlans();
    loader.then((d: unknown) => setPlans(Array.isArray(d) ? d as MrmPlan[] : [])).catch(() => setPlans([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
  }, [certId]);

  const openAdd  = () => { setEditing(null); setForm({ ...EMPTY_PLAN }); setShowModal(true); };
  const openEdit = (p: MrmPlan) => {
    setEditing(p);
    setForm({ ...EMPTY_PLAN, ...p, attendees: Array.isArray(p.attendees) ? [...p.attendees] : [], invitees: Array.isArray(p.invitees) ? [...p.invitees] : [] } as typeof EMPTY_PLAN);
    setShowModal(true);
  };

  const addAttendee = (name: string, list: 'attendees' | 'invitees') => {
    const n = name.trim();
    if (!n) return;
    setForm(p => ({ ...p, [list]: [...(p[list] || []).filter((x: string) => x !== n), n] } as typeof EMPTY_PLAN));
  };
  const removeAttendee = (name: string, list: 'attendees' | 'invitees') => {
    setForm(p => ({ ...p, [list]: (p[list] || []).filter((x: string) => x !== name) } as typeof EMPTY_PLAN));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await mrmApi.updatePlan(editing.id, form);
      else await mrmApi.createPlan(form);
      setShowModal(false); load();
    } catch (e: unknown) { alert(apiMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    try { await mrmApi.deletePlan(id); setDeletePlanId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, 'Delete failed')); }
  };

  const submitForApproval = async (id: number) => {
    try { await mrmApi.submitPlan(id); load(); }
    catch (e: unknown) { alert(apiMsg(e, 'Submit failed')); }
  };
  const approvePlan = async (id: number) => {
    const by = prompt('Approved by (name):'); if (!by) return;
    try { await mrmApi.approvePlan(id, by); load(); if (viewPlan) setViewPlan(plans.find(p => p.id === id) || null); }
    catch (e: unknown) { alert(apiMsg(e, 'Approve failed')); }
  };
  const rejectPlan = async (id: number) => {
    const by = prompt('Rejected by (name):'); if (!by) return;
    try { await mrmApi.rejectPlan(id, by); load(); }
    catch (e: unknown) { alert(apiMsg(e, 'Reject failed')); }
  };

  const printPlan = (p: MrmPlan) => {
    const w = window.open('', '_blank');
    if (!w) return;
    const attendeeList = Array.isArray(p.attendees) && p.attendees.length > 0
      ? p.attendees.join(', ') : '—';
    const inviteeList = Array.isArray(p.invitees) && p.invitees.length > 0
      ? p.invitees.join(', ') : '—';
    w.document.write(`
      <html><head><title>MRM Plan</title>
      <style>body{font-family:Arial,sans-serif;font-size:11px;padding:24px}h2{color:#280882;border-bottom:2px solid #280882;padding-bottom:6px}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #ccc;padding:7px 10px}th{background:#f5f3ff;color:#280882;font-size:10px;text-transform:uppercase;width:25%}</style>
      </head><body>
      <h2>MANAGEMENT REVIEW MEETING — ${p.mrmRefNo || 'DRAFT'}</h2>
      <table>
        <tr><th>MRM Ref No.</th><td>${p.mrmRefNo||'—'}</td><th>Type</th><td>${p.mrmType||'—'}</td></tr>
        <tr><th>Meeting Date</th><td>${p.meetingDate||'—'}</td><th>Time</th><td>${p.meetingTime||'—'}</td></tr>
        <tr><th>Location</th><td>${p.meetingLocation||'—'}</td><th>Financial Year</th><td>${p.financialYear||'—'}</td></tr>
        <tr><th>Status</th><td>${p.status||'—'}</td><th>Certification</th><td>${p.certification?.code||'—'}</td></tr>
        <tr><th>Chairman</th><td>${p.chairman||'—'}</td><th>MR Representative</th><td>${p.mrRepresentative||'—'}</td></tr>
        <tr><th>Coordinator</th><td colspan="3">${p.coordinator||'—'}</td></tr>
        <tr><th>Attendees</th><td colspan="3">${attendeeList}</td></tr>
        <tr><th>Invitees</th><td colspan="3">${inviteeList}</td></tr>
        <tr><th>Scope</th><td colspan="3">${p.scope||'—'}</td></tr>
        <tr><th>Remarks</th><td colspan="3">${p.remarks||'—'}</td></tr>
      </table>
      <div style="margin-top:30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
        <div style="border-top:1px solid #999;padding-top:6px;text-align:center;font-size:10px;color:#666">Chairman</div>
        <div style="border-top:1px solid #999;padding-top:6px;text-align:center;font-size:10px;color:#666">Management Representative</div>
        <div style="border-top:1px solid #999;padding-top:6px;text-align:center;font-size:10px;color:#666">Coordinator</div>
      </div>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  const pf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value } as typeof EMPTY_PLAN));

  const ST_BADGE: Record<string, string> = {
    PLANNED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#280882] to-indigo-700 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">{plans.length} MRM Plans</span>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-all">
            <i className="fas fa-plus" /> New MRM Plan
          </button>
        </div>
        {loading ? (
          <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>
        ) : plans.length === 0 ? (
          <div className="py-12 text-center text-gray-400"><i className="fas fa-users text-3xl mb-2 block opacity-30" />No MRM plans yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {['Ref No.', 'Type', 'Meeting Date', 'Chairman', 'MR Rep.', 'Coordinator', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.map((p: MrmPlan) => (
                <tr key={p.id} className="hover:bg-purple-50/30 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{p.mrmRefNo}</td>
                  <td className="px-4 py-3 text-sm">{p.mrmType}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.meetingDate || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.chairman || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.mrRepresentative || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.coordinator || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ST_BADGE[p.status] || ''}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewPlan(p)} className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600" title="View"><i className="fas fa-eye text-xs" /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700" title="Edit"><i className="fas fa-edit text-xs" /></button>
                      {p.approvalStatus !== 'PENDING' && p.approvalStatus !== 'APPROVED' && (
                        <button onClick={() => submitForApproval(p.id)} className="p-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700" title="Submit for Approval"><i className="fas fa-paper-plane text-xs" /></button>
                      )}
                      {p.approvalStatus === 'PENDING' && (
                        <>
                          <button onClick={() => approvePlan(p.id)} className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700" title="Approve"><FiCheck className="text-xs" /></button>
                          <button onClick={() => rejectPlan(p.id)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600" title="Reject"><FiXIcon className="text-xs" /></button>
                        </>
                      )}
                      <button onClick={() => printPlan(p)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600" title="Print"><i className="fas fa-print text-xs" /></button>
                      <button onClick={() => setDeletePlanId(p.id)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600" title="Delete"><i className="fas fa-trash text-xs" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete MRM Plan Confirmation */}
      {deletePlanId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete MRM Plan</h3>
                <p className="text-sm text-gray-500">This will also delete all linked MOM and agenda items.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this MRM plan? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePlanId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={() => del(deletePlanId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#280882] to-indigo-700 flex items-center justify-between px-6 py-4 rounded-t-2xl">
              <h2 className="text-base font-bold text-white">{editing ? 'Edit MRM Plan' : 'New MRM Plan'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"><i className="fas fa-times" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Meeting Details */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Meeting Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>MRM Type</label>
                    <select value={form.mrmType} onChange={pf('mrmType')} className={inputCls}>
                      {MRM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Certification</label>
                    <select value={form.certification?.id || ''} onChange={e => setForm(p => ({ ...p, certification: e.target.value ? { id: Number(e.target.value) } : null } as typeof EMPTY_PLAN))} className={inputCls}>
                      <option value="">— Select —</option>
                      {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Meeting Date *</label>
                    <input type="date" value={form.meetingDate || ''} onChange={pf('meetingDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Meeting Time</label>
                    <input type="time" value={form.meetingTime || ''} onChange={pf('meetingTime')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Location / Venue</label>
                    <input value={form.meetingLocation || ''} onChange={pf('meetingLocation')} placeholder="e.g. Conference Room A" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Financial Year</label>
                    <input value={form.financialYear || ''} onChange={pf('financialYear')} placeholder="e.g. 2025-2026" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={form.status} onChange={pf('status')} className={inputCls}>
                      {PLAN_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Key People */}
              <div className="bg-purple-50/40 rounded-xl p-4 border border-purple-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Key People</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Chairman</label>
                    <input value={form.chairman || ''} onChange={pf('chairman')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>MR Representative</label>
                    <input value={form.mrRepresentative || ''} onChange={pf('mrRepresentative')} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Coordinator</label>
                    <input value={form.coordinator || ''} onChange={pf('coordinator')} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Attendees */}
              <AttendeePanel
                title="Attendees" subtitle="People present at the meeting"
                list={form.attendees || []}
                onAdd={name => addAttendee(name, 'attendees')}
                onRemove={name => removeAttendee(name, 'attendees')}
                quickAdd={[form.chairman, form.mrRepresentative, form.coordinator].filter(Boolean)}
              />

              {/* Invitees */}
              <AttendeePanel
                title="Invitees" subtitle="People invited (may or may not attend)"
                list={form.invitees || []}
                onAdd={name => addAttendee(name, 'invitees')}
                onRemove={name => removeAttendee(name, 'invitees')}
                quickAdd={[]}
              />

              {/* Scope & Remarks */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className={labelCls}>Scope</label>
                  <textarea value={form.scope || ''} onChange={pf('scope')} rows={2} className={`${inputCls} resize-none`} placeholder="Scope of this MRM..." />
                </div>
                <div>
                  <label className={labelCls}>Remarks</label>
                  <textarea value={form.remarks || ''} onChange={pf('remarks')} rows={1} className={`${inputCls} resize-none`} />
                </div>
              </div>

              {/* Approval Info (edit mode only) */}
              {editing && (
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Approval Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Approval Status</label>
                      <input value={(form as Record<string,unknown>).approvalStatus as string || '—'} readOnly className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
                    </div>
                    <div>
                      <label className={labelCls}>Approved By</label>
                      <input value={(form as Record<string,unknown>).approvedBy as string || ''} readOnly className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#280882] to-indigo-700 flex items-center justify-between px-6 py-4 rounded-t-2xl">
              <h2 className="text-base font-bold text-white">{viewPlan.mrmRefNo} — {viewPlan.mrmType}</h2>
              <div className="flex gap-2">
                <button onClick={() => printPlan(viewPlan)} className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20"><i className="fas fa-print mr-1" />Print</button>
                <button onClick={() => setViewPlan(null)} className="text-white/70 hover:text-white ml-1"><i className="fas fa-times" /></button>
              </div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Meeting Date', viewPlan.meetingDate||'—'], ['Time', viewPlan.meetingTime||'—'],
                  ['Location', viewPlan.meetingLocation||'—'], ['Fin. Year', viewPlan.financialYear||'—'],
                  ['Status', viewPlan.status], ['Certification', viewPlan.certification?.code||'—'],
                  ['Chairman', viewPlan.chairman||'—'], ['MR Representative', viewPlan.mrRepresentative||'—'],
                  ['Coordinator', viewPlan.coordinator||'—'],
                ].map(([l,v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                    <p className="font-medium text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
              {viewPlan.scope && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Scope</p><p className="text-gray-700">{viewPlan.scope}</p></div>}
              {Array.isArray(viewPlan.attendees) && viewPlan.attendees.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Attendees ({viewPlan.attendees.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewPlan.attendees.map((a: string) => <span key={a} className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{a}</span>)}
                  </div>
                </div>
              )}
              {Array.isArray(viewPlan.invitees) && viewPlan.invitees.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Invitees ({viewPlan.invitees.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewPlan.invitees.map((a: string) => <span key={a} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{a}</span>)}
                  </div>
                </div>
              )}
            </div>
            {viewPlan.approvalStatus && (
              <div className={`mx-5 mb-3 px-4 py-3 rounded-xl text-sm flex items-center justify-between ${viewPlan.approvalStatus === 'APPROVED' ? 'bg-green-50 border border-green-200' : viewPlan.approvalStatus === 'REJECTED' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div>
                  <span className="font-semibold">Approval: {viewPlan.approvalStatus}</span>
                  {viewPlan.approvedBy && <span className="text-xs ml-2 text-gray-500">by {viewPlan.approvedBy} on {viewPlan.approvalDate}</span>}
                </div>
                {viewPlan.approvalStatus === 'PENDING' && (
                  <div className="flex gap-2">
                    <button onClick={() => approvePlan(viewPlan.id)} className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700">Approve</button>
                    <button onClick={() => rejectPlan(viewPlan.id)} className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700">Reject</button>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setViewPlan(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Close</button>
              {!viewPlan.approvalStatus && (
                <button onClick={() => submitForApproval(viewPlan.id)} className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600">Submit for Approval</button>
              )}
              <button onClick={() => { setViewPlan(null); openEdit(viewPlan); }} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: BRAND }}>Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Process Review Plan ───────────────────────────────────────────────────────
const EMPTY_PRP = {
  mrmPlan: null as { id: number; mrmRefNo?: string } | null,
  certification: null as { id: number } | null,
  department: null as { id: number } | null,
  processName: '',
  departmentHead: '',
  reviewer: '',
  plannedReviewDate: '',
  reviewDate: '',
  reviewScope: '',
  reviewObjective: '',
  reviewCriteria: '',
  remarks: '',
  status: 'PLANNED',
};

function ProcessReviewPlan({ certId }: { certId: number | null }) {
  const [rows, setRows]           = useState<PRP[]>([]);
  const [loading, setLoading]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<PRP | null>(null);
  const [form, setForm]           = useState<typeof EMPTY_PRP>({ ...EMPTY_PRP });
  const [saving, setSaving]       = useState(false);
  const [mrmPlans, setMrmPlans]   = useState<MrmPlan[]>([]);
  const [certs, setCerts]         = useState<Certification[]>([]);
  const [depts, setDepts]         = useState<Department[]>([]);

  const load = () => {
    setLoading(true);
    prpApi.getAll()
      .then((d: unknown) => setRows(Array.isArray(d) ? d as PRP[] : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const planLoader = certId ? mrmApi.getPlansByCert(certId) : mrmApi.getPlans();
    planLoader.then((d: unknown) => setMrmPlans(Array.isArray(d) ? d as MrmPlan[] : [])).catch(() => {});
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
    deptApi.getActive().then((d: unknown) => setDepts(Array.isArray(d) ? d as Department[] : [])).catch(() => {});
  }, [certId]);

  const pf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value } as typeof EMPTY_PRP));

  const onDeptChange = (deptId: string) => {
    const dept = depts.find(d => d.id === Number(deptId));
    setForm(p => ({
      ...p,
      department: deptId ? { id: Number(deptId) } : null,
      processName: dept?.processName || p.processName,
      departmentHead: dept?.departmentHead || p.departmentHead,
    } as typeof EMPTY_PRP));
  };

  const openAdd  = () => { setEditing(null); setForm({ ...EMPTY_PRP, certification: certId ? { id: certId } : null }); setShowModal(true); };
  const openEdit = (r: PRP) => {
    setEditing(r);
    setForm({
      mrmPlan: r.mrmPlan ? { id: r.mrmPlan.id } : null,
      certification: r.certification ? { id: r.certification.id } : null,
      department: r.department ? { id: r.department.id } : null,
      processName: r.processName || '',
      departmentHead: r.departmentHead || '',
      reviewer: r.reviewer || '',
      plannedReviewDate: r.plannedReviewDate || '',
      reviewDate: r.reviewDate || '',
      reviewScope: r.reviewScope || '',
      reviewObjective: r.reviewObjective || '',
      reviewCriteria: r.reviewCriteria || '',
      remarks: r.remarks || '',
      status: r.status || 'PLANNED',
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.mrmPlan) { alert('Select an MRM Plan'); return; }
    setSaving(true);
    try {
      if (editing) await prpApi.update(editing.id, form);
      else await prpApi.create(form);
      setShowModal(false); load();
    } catch (e: unknown) { alert(apiMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!window.confirm('Delete this Process Review Plan?')) return;
    try { await prpApi.delete(id); load(); }
    catch (e: unknown) { alert(apiMsg(e, 'Delete failed')); }
  };

  const ST_BADGE: Record<string, string> = {
    PLANNED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#280882] to-indigo-700 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">{rows.length} Process Review Plans</span>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold">
            <i className="fas fa-plus" /> New PRP
          </button>
        </div>
        {loading ? (
          <div className="py-12 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-gray-400"><i className="fas fa-list-check text-3xl mb-2 block opacity-30" />No Process Review Plans yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  {['PRP Ref No.', 'MRM Plan', 'Department', 'Process', 'Dept Head', 'Reviewer', 'Planned Date', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r: PRP) => (
                  <tr key={r.id} className="hover:bg-purple-50/30 group">
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{r.prpRefNo}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.mrmPlan?.mrmRefNo || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">{r.processName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.departmentHead || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.reviewer || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.plannedReviewDate || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ST_BADGE[r.status || ''] || ''}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700" title="Edit"><i className="fas fa-edit text-xs" /></button>
                        <button onClick={() => del(r.id)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600" title="Delete"><i className="fas fa-trash text-xs" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#280882] to-indigo-700 flex items-center justify-between px-6 py-4 rounded-t-2xl">
              <h2 className="text-base font-bold text-white">{editing ? 'Edit Process Review Plan' : 'New Process Review Plan'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl text-white"><i className="fas fa-times" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>MRM Plan *</label>
                  <select value={form.mrmPlan?.id || ''} onChange={e => setForm(p => ({ ...p, mrmPlan: e.target.value ? { id: Number(e.target.value) } : null } as typeof EMPTY_PRP))} className={inputCls}>
                    <option value="">— Select MRM Plan —</option>
                    {mrmPlans.map((p: MrmPlan) => <option key={p.id} value={p.id}>{p.mrmRefNo} · {p.mrmType} · {p.meetingDate || '—'}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Certification</label>
                  <select value={form.certification?.id || ''} onChange={e => setForm(p => ({ ...p, certification: e.target.value ? { id: Number(e.target.value) } : null } as typeof EMPTY_PRP))} className={inputCls}>
                    <option value="">— Select —</option>
                    {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Department</label>
                  <select value={form.department?.id || ''} onChange={e => onDeptChange(e.target.value)} className={inputCls}>
                    <option value="">— Select Dept —</option>
                    {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Process Name</label>
                  <input value={form.processName} onChange={pf('processName')} className={inputCls} placeholder="Auto-filled from department" />
                </div>
                <div>
                  <label className={labelCls}>Department Head</label>
                  <input value={form.departmentHead} onChange={pf('departmentHead')} className={inputCls} placeholder="Auto-filled from department" />
                </div>
                <div>
                  <label className={labelCls}>Reviewer</label>
                  <input value={form.reviewer} onChange={pf('reviewer')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Planned Review Date</label>
                  <input type="date" value={form.plannedReviewDate} onChange={pf('plannedReviewDate')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Actual Review Date</label>
                  <input type="date" value={form.reviewDate} onChange={pf('reviewDate')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={pf('status')} className={inputCls}>
                    {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Review Scope</label>
                  <textarea value={form.reviewScope} onChange={pf('reviewScope')} rows={2} className={`${inputCls} resize-none`} placeholder="Scope of process review..." />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Review Objective</label>
                  <textarea value={form.reviewObjective} onChange={pf('reviewObjective')} rows={2} className={`${inputCls} resize-none`} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Review Criteria</label>
                  <textarea value={form.reviewCriteria} onChange={pf('reviewCriteria')} rows={1} className={`${inputCls} resize-none`} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Remarks</label>
                  <textarea value={form.remarks} onChange={pf('remarks')} rows={1} className={`${inputCls} resize-none`} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Process Review Sheet ──────────────────────────────────────────────────────
const DEFAULT_CHECKLIST: ReviewChecklistItem[] = [
  { serialNo: 1, reviewPoint: 'Process documentation', description: 'Is the process documented and current revision maintained?', status: 'OK', remarks: '' },
  { serialNo: 2, reviewPoint: 'KPI / Objectives', description: 'Are process objectives/KPIs defined and measured?', status: 'OK', remarks: '' },
  { serialNo: 3, reviewPoint: 'Resources', description: 'Are resources adequate (manpower, equipment, tools)?', status: 'OK', remarks: '' },
  { serialNo: 4, reviewPoint: 'Competency & Training', description: 'Are competency and training requirements met?', status: 'OK', remarks: '' },
  { serialNo: 5, reviewPoint: 'Customer Requirements', description: 'Are customer requirements clearly understood?', status: 'OK', remarks: '' },
  { serialNo: 6, reviewPoint: 'NC / CAR History', description: 'Has NC and CAR history been reviewed?', status: 'OK', remarks: '' },
  { serialNo: 7, reviewPoint: 'Risks & Opportunities', description: 'Have risks and opportunities been identified and mitigated?', status: 'OK', remarks: '' },
  { serialNo: 8, reviewPoint: 'Performance Metrics', description: 'Are process performance metrics achieving targets?', status: 'OK', remarks: '' },
  { serialNo: 9, reviewPoint: 'Audit Findings', description: 'Have audit findings from last review been closed?', status: 'OK', remarks: '' },
  { serialNo: 10, reviewPoint: 'Improvement Opportunities', description: 'Have improvement opportunities been identified?', status: 'OK', remarks: '' },
  { serialNo: 11, reviewPoint: 'Legal Compliance', description: 'Are legal and regulatory requirements complied with?', status: 'OK', remarks: '' },
];

function ProcessReviewSheet({ certId }: { certId: number | null }) {
  const [rows, setRows]           = useState<PRS[]>([]);
  const [prpList, setPrpList]     = useState<PRP[]>([]);
  const [loading, setLoading]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<PRS | null>(null);
  const [saving, setSaving]       = useState(false);
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>(DEFAULT_CHECKLIST.map(c => ({ ...c })));
  const [form, setForm]           = useState({
    processReviewPlan: null as { id: number } | null,
    processName: '', processOwner: '', processReviewedBy: '',
    lastReviewDate: '', currentReviewDate: new Date().toISOString().split('T')[0],
    processEffectiveness: 'EFFECTIVE', kpiAchievement: '', auditFindingsImpact: '',
    customerFeedbackImpact: '', risksIdentified: '', opportunitiesForImprovement: '',
    overallComments: '', recommendation: '', actionRequired: false,
    actionResponsiblePerson: '', actionTargetDate: '', status: 'DRAFT', reviewedBy: '',
  });

  const load = () => {
    setLoading(true);
    prsApi.getAll()
      .then((d: unknown) => setRows(Array.isArray(d) ? d as PRS[] : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    prpApi.getAll()
      .then((d: unknown) => setPrpList(Array.isArray(d) ? d as PRP[] : []))
      .catch(() => {});
  }, [certId]);

  const pf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const onPrpSelect = (prpId: string) => {
    const prp = prpList.find(p => p.id === Number(prpId));
    setForm(p => ({
      ...p,
      processReviewPlan: prpId ? { id: Number(prpId) } : null,
      processName: prp?.processName || p.processName,
      processOwner: prp?.departmentHead || p.processOwner,
      processReviewedBy: prp?.reviewer || p.processReviewedBy,
      lastReviewDate: prp?.reviewDate || p.lastReviewDate,
    }));
  };

  const updateChecklist = (idx: number, key: 'status' | 'remarks', val: string) => {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, [key]: val } : c));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ processReviewPlan: null, processName: '', processOwner: '', processReviewedBy: '', lastReviewDate: '', currentReviewDate: new Date().toISOString().split('T')[0], processEffectiveness: 'EFFECTIVE', kpiAchievement: '', auditFindingsImpact: '', customerFeedbackImpact: '', risksIdentified: '', opportunitiesForImprovement: '', overallComments: '', recommendation: '', actionRequired: false, actionResponsiblePerson: '', actionTargetDate: '', status: 'DRAFT', reviewedBy: '' });
    setChecklist(DEFAULT_CHECKLIST.map(c => ({ ...c })));
    setShowModal(true);
  };

  const openEdit = (r: PRS) => {
    setEditing(r);
    setForm({
      processReviewPlan: r.processReviewPlan ? { id: r.processReviewPlan.id } : null,
      processName: r.processName || '', processOwner: r.processOwner || '',
      processReviewedBy: r.processReviewedBy || '', lastReviewDate: r.lastReviewDate || '',
      currentReviewDate: r.currentReviewDate || '', processEffectiveness: r.processEffectiveness || 'EFFECTIVE',
      kpiAchievement: r.kpiAchievement || '', auditFindingsImpact: r.auditFindingsImpact || '',
      customerFeedbackImpact: r.customerFeedbackImpact || '', risksIdentified: r.risksIdentified || '',
      opportunitiesForImprovement: r.opportunitiesForImprovement || '', overallComments: r.overallComments || '',
      recommendation: r.recommendation || '', actionRequired: r.actionRequired || false,
      actionResponsiblePerson: r.actionResponsiblePerson || '', actionTargetDate: r.actionTargetDate || '',
      status: r.status || 'DRAFT', reviewedBy: r.reviewedBy || '',
    });
    setChecklist(r.reviewChecklist && r.reviewChecklist.length > 0 ? r.reviewChecklist : DEFAULT_CHECKLIST.map(c => ({ ...c })));
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, reviewChecklist: checklist };
      if (editing) await prsApi.update(editing.id, payload);
      else await prsApi.create(payload);
      setShowModal(false); load();
    } catch (e: unknown) { alert(apiMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!window.confirm('Delete this Process Review Sheet?')) return;
    try { await prsApi.delete(id); load(); }
    catch (e: unknown) { alert(apiMsg(e, 'Delete failed')); }
  };

  const okCount  = checklist.filter(c => c.status === 'OK').length;
  const nokCount = checklist.filter(c => c.status === 'NOT_OK').length;
  const naCount  = checklist.filter(c => c.status === 'NA').length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#280882] to-indigo-700 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">{rows.length} Process Review Sheets</span>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold">
            <i className="fas fa-plus" /> New PRS
          </button>
        </div>
        {loading ? (
          <div className="py-12 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-gray-400"><i className="fas fa-clipboard-list text-3xl mb-2 block opacity-30" />No Process Review Sheets yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  {['PRS Ref No.', 'Process', 'Process Owner', 'Review Date', 'Effectiveness', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r: PRS) => (
                  <tr key={r.id} className="hover:bg-purple-50/30 group">
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{r.prsRefNo}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">{r.processName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.processOwner || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.currentReviewDate || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.processEffectiveness === 'EFFECTIVE' ? 'bg-green-100 text-green-700' : r.processEffectiveness === 'PARTIALLY_EFFECTIVE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {(r.processEffectiveness || '—').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : r.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700" title="Edit"><i className="fas fa-edit text-xs" /></button>
                        <button onClick={() => del(r.id)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600" title="Delete"><i className="fas fa-trash text-xs" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-[#280882] to-indigo-700 flex items-center justify-between px-6 py-4 rounded-t-2xl flex-shrink-0">
              <h2 className="text-base font-bold text-white">{editing ? 'Edit Process Review Sheet' : 'New Process Review Sheet'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl text-white"><i className="fas fa-times" /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Process Review Plan</label>
                  <select value={form.processReviewPlan?.id || ''} onChange={e => onPrpSelect(e.target.value)} className={inputCls}>
                    <option value="">— Select PRP (auto-fill fields) —</option>
                    {prpList.map((p: PRP) => <option key={p.id} value={p.id}>{p.prpRefNo} — {p.processName}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Process Name</label>
                  <input value={form.processName} onChange={pf('processName')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Process Owner</label>
                  <input value={form.processOwner} onChange={pf('processOwner')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Reviewed By</label>
                  <input value={form.processReviewedBy} onChange={pf('processReviewedBy')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Last Review Date</label>
                  <input type="date" value={form.lastReviewDate} onChange={pf('lastReviewDate')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Current Review Date</label>
                  <input type="date" value={form.currentReviewDate} onChange={pf('currentReviewDate')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={pf('status')} className={inputCls}>
                    {['DRAFT', 'REVIEWED', 'APPROVED', 'CLOSED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Review Checklist</p>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {[{label:`OK: ${okCount}`,color:'bg-green-100 text-green-700'},{label:`NOK: ${nokCount}`,color:'bg-red-100 text-red-700'},{label:`N/A: ${naCount}`,color:'bg-gray-100 text-gray-600'}].map(b => (
                    <span key={b.label} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.color}`}>{b.label}</span>
                  ))}
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase">
                        <th className="px-3 py-2 text-left w-6">#</th>
                        <th className="px-3 py-2 text-left">Review Point</th>
                        <th className="px-3 py-2 text-center w-32">Status</th>
                        <th className="px-3 py-2 text-left w-48">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {checklist.map((c, i) => (
                        <tr key={i} className={c.status === 'NOT_OK' ? 'bg-red-50/30' : 'hover:bg-gray-50'}>
                          <td className="px-3 py-2 text-gray-400">{c.serialNo}</td>
                          <td className="px-3 py-2 text-gray-700">{c.description || c.reviewPoint}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex gap-1 justify-center">
                              {['OK', 'NOT_OK', 'NA'].map(s => (
                                <button key={s} onClick={() => updateChecklist(i, 'status', s)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${c.status === s ? s === 'OK' ? 'bg-green-500 text-white border-green-500' : s === 'NOT_OK' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-500 text-white border-gray-500' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}>
                                  {s === 'NOT_OK' ? 'NOK' : s}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <input value={c.remarks || ''} onChange={e => updateChecklist(i, 'remarks', e.target.value)} placeholder="Remarks..." className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Process Performance</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Process Effectiveness</label>
                    <select value={form.processEffectiveness} onChange={pf('processEffectiveness')} className={inputCls}>
                      {['EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>KPI Achievement</label>
                    <input value={form.kpiAchievement} onChange={pf('kpiAchievement')} className={inputCls} placeholder="e.g. 85% achieved" />
                  </div>
                  <div>
                    <label className={labelCls}>Audit Findings Impact</label>
                    <input value={form.auditFindingsImpact} onChange={pf('auditFindingsImpact')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Customer Feedback Impact</label>
                    <input value={form.customerFeedbackImpact} onChange={pf('customerFeedbackImpact')} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Risks Identified</label>
                    <textarea value={form.risksIdentified} onChange={pf('risksIdentified')} rows={1} className={`${inputCls} resize-none`} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Opportunities for Improvement</label>
                    <textarea value={form.opportunitiesForImprovement} onChange={pf('opportunitiesForImprovement')} rows={1} className={`${inputCls} resize-none`} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Overall Comments</label>
                    <textarea value={form.overallComments} onChange={pf('overallComments')} rows={2} className={`${inputCls} resize-none`} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Recommendation</label>
                    <textarea value={form.recommendation} onChange={pf('recommendation')} rows={1} className={`${inputCls} resize-none`} />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <input type="checkbox" checked={form.actionRequired} onChange={e => setForm(p => ({ ...p, actionRequired: e.target.checked }))} className="w-4 h-4" id="prsActionReq" />
                  <label htmlFor="prsActionReq" className="text-sm font-semibold text-orange-700">Action Required</label>
                </div>
                {form.actionRequired && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Responsible Person</label>
                      <input value={form.actionResponsiblePerson} onChange={pf('actionResponsiblePerson')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Target Date</label>
                      <input type="date" value={form.actionTargetDate} onChange={pf('actionTargetDate')} className={inputCls} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : 'Save PRS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Minutes of Meeting ────────────────────────────────────────────────────────
function MrmMinutes({ certId }: { certId: number | null }) {
  const [plans,        setPlans]        = useState<MrmPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MrmPlan | null>(null);
  const [agenda,       setAgenda]       = useState<MrmAgenda[]>([]);
  const [minutes,      setMinutes]      = useState<MrmMinutesType[]>([]);
  const [detailTab,    setDetailTab]    = useState<'agenda' | 'minutes'>('agenda');
  const [agendaForm,   setAgendaForm]   = useState({ agendaTopic: '', inputDetails: '', responsibility: '' });
  const [minuteForm,   setMinuteForm]   = useState({ agendaTopic: '', inputDetails: '', discussionDetails: '', decisionTaken: '', actionRequired: false, responsiblePerson: '', targetDate: '', priority: 'MEDIUM', status: 'OPEN', remarks: '' });
  const [editMinute,   setEditMinute]   = useState<MrmMinutesType | null>(null);
  const [editForm,     setEditForm]     = useState({ agendaTopic: '', inputDetails: '', discussionDetails: '', decisionTaken: '', actionRequired: false, responsiblePerson: '', targetDate: '', priority: 'MEDIUM', status: 'OPEN', remarks: '', closureDate: '', closureRemarks: '' });
  const [saving,       setSaving]       = useState(false);
  const [delMinId,     setDelMinId]     = useState<number | null>(null);
  const [showConclusion, setShowConclusion] = useState(false);
  const [momForm, setMomForm]          = useState({ meetingConclusion: '', overallEffectiveness: 'EFFECTIVE', preparedBy: '', momReviewedBy: '', momApprovedBy: '', momApprovalDate: '', momStatus: 'DRAFT' });
  const [savingMom, setSavingMom]      = useState(false);

  useEffect(() => {
    const loader = certId ? mrmApi.getPlansByCert(certId) : mrmApi.getPlans();
    loader.then((d: unknown) => setPlans(Array.isArray(d) ? d as MrmPlan[] : [])).catch(() => {});
  }, [certId]);

  const loadDetails = (planId: number) => {
    mrmApi.getAgenda(planId).then((d: unknown) => setAgenda(Array.isArray(d) ? d as MrmAgenda[] : [])).catch(() => setAgenda([]));
    mrmApi.getMinutes(planId).then((d: unknown) => setMinutes(Array.isArray(d) ? d as MrmMinutesType[] : [])).catch(() => setMinutes([]));
  };

  const selectPlan = (p: MrmPlan) => {
    setSelectedPlan(p);
    loadDetails(p.id);
    setMomForm({
      meetingConclusion: p.meetingConclusion || '',
      overallEffectiveness: p.overallEffectiveness || 'EFFECTIVE',
      preparedBy: p.preparedBy || '',
      momReviewedBy: p.momReviewedBy || '',
      momApprovedBy: p.momApprovedBy || '',
      momApprovalDate: p.momApprovalDate || '',
      momStatus: p.momStatus || 'DRAFT',
    });
  };

  const addAgenda = async () => {
    if (!agendaForm.agendaTopic || !selectedPlan) return;
    setSaving(true);
    try {
      await mrmApi.saveAgenda({ ...agendaForm, serialNo: agenda.length + 1, mrmPlan: { id: selectedPlan.id } });
      setAgendaForm({ agendaTopic: '', inputDetails: '', responsibility: '' });
      loadDetails(selectedPlan.id);
    } catch { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const saveMom = async () => {
    if (!selectedPlan) return;
    setSavingMom(true);
    try {
      await mrmApi.updateMom(selectedPlan.id, momForm);
      alert('MOM conclusion saved.');
    } catch (e: unknown) { alert(apiMsg(e, 'Save failed')); }
    finally { setSavingMom(false); }
  };

  const addMinute = async () => {
    if (!minuteForm.discussionDetails || !selectedPlan) return;
    setSaving(true);
    try {
      await mrmApi.saveMinutes({ ...minuteForm, mrmPlan: { id: selectedPlan.id } });
      setMinuteForm({ agendaTopic: '', inputDetails: '', discussionDetails: '', decisionTaken: '', actionRequired: false, responsiblePerson: '', targetDate: '', priority: 'MEDIUM', status: 'OPEN', remarks: '' });
      loadDetails(selectedPlan.id);
    } catch { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const openEditMinute = (m: MrmMinutesType) => {
    setEditMinute(m);
    setEditForm({
      agendaTopic:       m.agendaTopic       || '',
      inputDetails:      m.inputDetails      || '',
      discussionDetails: m.discussionDetails || '',
      decisionTaken:     m.decisionTaken     || '',
      actionRequired:    m.actionRequired    || false,
      responsiblePerson: m.responsiblePerson || '',
      targetDate:        m.targetDate        || '',
      priority:          m.priority          || 'MEDIUM',
      status:            m.status            || 'OPEN',
      remarks:           m.remarks           || '',
      closureDate:       m.closureDate       || '',
      closureRemarks:    m.closureRemarks    || '',
    });
  };

  const saveEdit = async () => {
    if (!editMinute || !selectedPlan) return;
    setSaving(true);
    try {
      await mrmApi.updateMinutes(editMinute.id, editForm);
      setEditMinute(null);
      loadDetails(selectedPlan.id);
    } catch { alert('Update failed'); }
    finally { setSaving(false); }
  };

  const deleteMinute = async (id: number) => {
    try {
      await mrmApi.deleteMinutes(id);
      setDelMinId(null);
      loadDetails(selectedPlan!.id);
    } catch { alert('Delete failed'); }
  };

  const updateMinStatus = (id: number, status: string) => {
    mrmApi.updateMinutesStatus(id, status).then(() => loadDetails(selectedPlan!.id)).catch(() => {});
  };

  const delAgenda = (id: number) => {
    mrmApi.deleteAgenda(id).then(() => loadDetails(selectedPlan!.id)).catch(() => {});
  };

  const printMOM = () => {
    if (!selectedPlan) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Minutes of Meeting</title>
      <style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px;color:#222}h1{color:#280882;font-size:15px}h2{color:#555;font-size:11px;margin:12px 0 6px}table{width:100%;border-collapse:collapse;margin-bottom:10px}th{background:#280882;color:white;padding:6px 8px;font-size:9px;text-align:left}td{border:1px solid #ddd;padding:5px 8px}</style>
      </head><body>
      <h1>Minutes of Meeting — ${selectedPlan.mrmRefNo}</h1>
      <table>
        <tr><th>Meeting Date</th><td>${selectedPlan.meetingDate||'—'}</td><th>Time</th><td>${selectedPlan.meetingTime||'—'}</td></tr>
        <tr><th>Location</th><td>${selectedPlan.meetingLocation||'—'}</td><th>Type</th><td>${selectedPlan.mrmType}</td></tr>
        <tr><th>Chairman</th><td>${selectedPlan.chairman||'—'}</td><th>MR Representative</th><td>${selectedPlan.mrRepresentative||'—'}</td></tr>
        <tr><th>Coordinator</th><td colspan="3">${selectedPlan.coordinator||'—'}</td></tr>
        ${Array.isArray(selectedPlan.attendees) && selectedPlan.attendees.length > 0 ? `<tr><th>Attendees</th><td colspan="3">${selectedPlan.attendees.join(', ')}</td></tr>` : ''}
      </table>
      <h2>Agenda</h2>
      <table>
        <thead><tr><th>#</th><th>Topic</th><th>Responsibility</th><th>Details</th></tr></thead>
        <tbody>${agenda.map(a=>`<tr><td>${a.serialNo}</td><td>${a.agendaTopic}</td><td>${a.responsibility||'—'}</td><td>${a.inputDetails||'—'}</td></tr>`).join('')}</tbody>
      </table>
      <h2>Minutes & Decisions</h2>
      <table>
        <thead><tr><th>Discussion</th><th>Decision Taken</th><th>Action Req.</th><th>Responsible</th><th>Target Date</th><th>Status</th></tr></thead>
        <tbody>${minutes.map(m=>`<tr><td>${m.discussionDetails||'—'}</td><td>${m.decisionTaken||'—'}</td><td>${m.actionRequired?'YES':'NO'}</td><td>${m.responsiblePerson||'—'}</td><td>${m.targetDate||'—'}</td><td>${m.status}</td></tr>`).join('')}</tbody>
      </table>
      <div style="margin-top:30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
        <div style="border-top:1px solid #999;padding-top:6px;text-align:center;font-size:10px;color:#666">Chairman</div>
        <div style="border-top:1px solid #999;padding-top:6px;text-align:center;font-size:10px;color:#666">Management Representative</div>
        <div style="border-top:1px solid #999;padding-top:6px;text-align:center;font-size:10px;color:#666">Coordinator</div>
      </div>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  return (
    <div className="flex gap-4">
      {/* Plan list */}
      <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">Select MRM Plan</div>
        {plans.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No plans found.</div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[calc(100vh-300px)]">
            {plans.map((p: MrmPlan) => (
              <div key={p.id} onClick={() => selectPlan(p)}
                className={`px-4 py-3 cursor-pointer hover:bg-purple-50 transition-colors border-l-4 ${selectedPlan?.id === p.id ? 'bg-purple-50' : 'border-transparent'}`}
                style={selectedPlan?.id === p.id ? { borderLeftColor: BRAND } : {}}>
                <p className="text-xs font-mono font-bold" style={{ color: BRAND }}>{p.mrmRefNo}</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{p.mrmType}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.meetingDate || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {!selectedPlan ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center"><i className="fas fa-mouse-pointer text-3xl mb-2 block opacity-40" /><p className="text-sm">Select a plan to view agenda & minutes</p></div>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{selectedPlan.mrmRefNo} — {selectedPlan.mrmType}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedPlan.meetingDate || '—'}
                    {selectedPlan.meetingTime && ` · ${selectedPlan.meetingTime}`}
                    {selectedPlan.meetingLocation && ` · ${selectedPlan.meetingLocation}`}
                  </p>
                  {Array.isArray(selectedPlan.attendees) && selectedPlan.attendees.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[10px] text-gray-400 self-center">Attendees:</span>
                      {selectedPlan.attendees.map((a: string) => (
                        <span key={a} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={printMOM} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs hover:bg-red-50"><i className="fas fa-print" /> Print MOM</button>
                  {(['agenda', 'minutes'] as const).map(t => (
                    <button key={t} onClick={() => setDetailTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${detailTab === t ? 'text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                      style={detailTab === t ? { background: BRAND } : {}}>
                      {t === 'agenda' ? 'Agenda' : 'Minutes'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {detailTab === 'agenda' && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3">
                  <input value={agendaForm.agendaTopic} onChange={e => setAgendaForm(p => ({ ...p, agendaTopic: e.target.value }))} placeholder="Agenda topic *" className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <input value={agendaForm.responsibility} onChange={e => setAgendaForm(p => ({ ...p, responsibility: e.target.value }))} placeholder="Responsibility" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  <textarea value={agendaForm.inputDetails} onChange={e => setAgendaForm(p => ({ ...p, inputDetails: e.target.value }))} placeholder="Details / Input" rows={2} className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                  <button onClick={addAgenda} disabled={saving} className="self-end px-3 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
                    {saving ? <i className="fas fa-spinner fa-spin" /> : 'Add Agenda'}
                  </button>
                </div>
                {agenda.length === 0 ? <p className="text-center text-gray-400 text-sm py-4">No agenda items yet.</p> : (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase"><th className="px-3 py-2 text-left w-8">#</th><th className="px-3 py-2 text-left">Topic</th><th className="px-3 py-2 text-left">Responsibility</th><th className="px-3 py-2 text-left">Details</th><th className="px-3 py-2" /></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {agenda.map((a: MrmAgenda) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-400">{a.serialNo}</td>
                          <td className="px-3 py-2 font-medium">{a.agendaTopic}</td>
                          <td className="px-3 py-2 text-gray-500">{a.responsibility}</td>
                          <td className="px-3 py-2 text-gray-500 text-xs">{a.inputDetails}</td>
                          <td className="px-3 py-2"><button onClick={() => delAgenda(a.id)} className="text-red-400 hover:text-red-600"><i className="fas fa-trash text-xs" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {detailTab === 'minutes' && (
              <div className="p-4 space-y-4">
                {/* MOM Conclusion toggle */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-medium">Add discussion minutes for this MRM</p>
                  <button onClick={() => setShowConclusion(v => !v)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all" style={showConclusion ? { background: BRAND, color: '#fff', borderColor: BRAND } : { borderColor: '#ccc', color: '#555' }}>
                    {showConclusion ? 'Hide MOM Conclusion' : 'MOM Conclusion & Approval'}
                  </button>
                </div>

                {showConclusion && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Meeting Conclusion & MOM Approval</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Meeting Conclusion</label>
                        <textarea value={momForm.meetingConclusion} onChange={e => setMomForm(p => ({ ...p, meetingConclusion: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Summary of decisions and outcomes..." />
                      </div>
                      <div>
                        <label className={labelCls}>Overall Effectiveness</label>
                        <select value={momForm.overallEffectiveness} onChange={e => setMomForm(p => ({ ...p, overallEffectiveness: e.target.value }))} className={inputCls}>
                          {['EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'NEEDS_IMPROVEMENT'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>MOM Status</label>
                        <select value={momForm.momStatus} onChange={e => setMomForm(p => ({ ...p, momStatus: e.target.value }))} className={inputCls}>
                          {['DRAFT', 'REVIEWED', 'APPROVED', 'CLOSED'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Prepared By</label>
                        <input value={momForm.preparedBy} onChange={e => setMomForm(p => ({ ...p, preparedBy: e.target.value }))} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Reviewed By</label>
                        <input value={momForm.momReviewedBy} onChange={e => setMomForm(p => ({ ...p, momReviewedBy: e.target.value }))} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Approved By</label>
                        <input value={momForm.momApprovedBy} onChange={e => setMomForm(p => ({ ...p, momApprovedBy: e.target.value }))} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Approval Date</label>
                        <input type="date" value={momForm.momApprovalDate} onChange={e => setMomForm(p => ({ ...p, momApprovalDate: e.target.value }))} className={inputCls} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={saveMom} disabled={savingMom} className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60" style={{ background: BRAND }}>
                        {savingMom ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : 'Save MOM Conclusion'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                  <input value={minuteForm.agendaTopic} onChange={e => setMinuteForm(p => ({ ...p, agendaTopic: e.target.value }))} placeholder="Agenda topic" className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  <textarea value={minuteForm.inputDetails} onChange={e => setMinuteForm(p => ({ ...p, inputDetails: e.target.value }))} placeholder="Input details" rows={1} className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                  <textarea value={minuteForm.discussionDetails} onChange={e => setMinuteForm(p => ({ ...p, discussionDetails: e.target.value }))} placeholder="Discussion details *" rows={2} className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                  <textarea value={minuteForm.decisionTaken} onChange={e => setMinuteForm(p => ({ ...p, decisionTaken: e.target.value }))} placeholder="Decision taken / Resolution" rows={2} className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                  <input value={minuteForm.responsiblePerson} onChange={e => setMinuteForm(p => ({ ...p, responsiblePerson: e.target.value }))} placeholder="Responsible person" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  <input type="date" value={minuteForm.targetDate} onChange={e => setMinuteForm(p => ({ ...p, targetDate: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  <input value={minuteForm.remarks} onChange={e => setMinuteForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Remarks" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={minuteForm.actionRequired} onChange={e => setMinuteForm(p => ({ ...p, actionRequired: e.target.checked }))} className="w-4 h-4" />
                      <label className="text-sm text-gray-600 font-medium">Action Required</label>
                    </div>
                    <select value={minuteForm.priority} onChange={e => setMinuteForm(p => ({ ...p, priority: e.target.value }))} className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none">
                      {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={addMinute} disabled={saving} className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
                      {saving ? <i className="fas fa-spinner fa-spin" /> : 'Add Minutes'}
                    </button>
                  </div>
                </div>
                {minutes.length === 0 ? <p className="text-center text-gray-400 text-sm py-4">No minutes recorded yet.</p> : (
                  <div className="space-y-2">
                    {minutes.map((m: MrmMinutesType) => (
                      <div key={m.id} className={`border rounded-lg p-3 ${m.actionRequired ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'}`}>
                        <p className="text-sm font-medium text-gray-800">{m.discussionDetails}</p>
                        {m.decisionTaken && <p className="text-xs text-gray-500 mt-1">Decision: {m.decisionTaken}</p>}
                        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                            {m.actionRequired && <span className="text-orange-600 font-semibold"><i className="fas fa-exclamation-circle mr-1" />Action Required</span>}
                            {m.responsiblePerson && <span>Responsible: <b>{m.responsiblePerson}</b></span>}
                            {m.targetDate && <span>Target: {m.targetDate}</span>}
                            {m.priority && <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${m.priority === 'HIGH' ? 'bg-red-100 text-red-700' : m.priority === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.priority}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <select value={m.status} onChange={e => updateMinStatus(m.id, e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none">
                              {MIN_STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <button onClick={() => openEditMinute(m)} className="p-1.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-600" title="Edit"><i className="fas fa-edit text-xs" /></button>
                            <button onClick={() => setDelMinId(m.id)} className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600" title="Delete"><i className="fas fa-trash text-xs" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit minute modal */}
      {editMinute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#280882] to-indigo-700 flex items-center justify-between px-6 py-4 rounded-t-2xl">
              <h2 className="text-base font-bold text-white">Edit Minutes</h2>
              <button onClick={() => setEditMinute(null)} className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"><i className="fas fa-times" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Agenda Topic</label>
                  <input value={editForm.agendaTopic} onChange={e => setEditForm(p => ({ ...p, agendaTopic: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Input Details</label>
                  <input value={editForm.inputDetails} onChange={e => setEditForm(p => ({ ...p, inputDetails: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Discussion Details *</label>
                <textarea value={editForm.discussionDetails} onChange={e => setEditForm(p => ({ ...p, discussionDetails: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Decision Taken</label>
                <textarea value={editForm.decisionTaken} onChange={e => setEditForm(p => ({ ...p, decisionTaken: e.target.value }))} rows={2} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Responsible Person</label>
                  <input value={editForm.responsiblePerson} onChange={e => setEditForm(p => ({ ...p, responsiblePerson: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Target Date</label>
                  <input type="date" value={editForm.targetDate} onChange={e => setEditForm(p => ({ ...p, targetDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Priority</label>
                  <select value={editForm.priority} onChange={e => setEditForm(p => ({ ...p, priority: e.target.value }))} className={inputCls}>
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                    {MIN_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Remarks</label>
                  <input value={editForm.remarks} onChange={e => setEditForm(p => ({ ...p, remarks: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Closure Date</label>
                  <input type="date" value={editForm.closureDate} onChange={e => setEditForm(p => ({ ...p, closureDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Closure Remarks</label>
                  <input value={editForm.closureRemarks} onChange={e => setEditForm(p => ({ ...p, closureRemarks: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editForm.actionRequired} onChange={e => setEditForm(p => ({ ...p, actionRequired: e.target.checked }))} className="w-4 h-4" />
                <label className="text-sm text-gray-600 font-medium">Action Required</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setEditMinute(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete minute confirmation */}
      {delMinId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-xl" /></div>
              <div><h3 className="font-bold text-gray-800">Delete Minutes</h3><p className="text-sm text-gray-500">This action cannot be undone.</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDelMinId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={() => deleteMinute(delMinId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Action Tracker ────────────────────────────────────────────────────────────
function ActionTracker() {
  const [rows, setRows]       = useState<AT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');
  const [modFilter, setModFilter] = useState('');
  const [viewItem, setViewItem]   = useState<AT | null>(null);
  const [progForm, setProgForm]   = useState({ progressUpdate: '', completionPercent: 0, updatedBy: '' });
  const [savingProg, setSavingProg] = useState(false);

  const load = () => {
    setLoading(true);
    actionTrackerApi.getAll()
      .then((d: unknown) => setRows(Array.isArray(d) ? d as AT[] : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await actionTrackerApi.updateStatus(id, status);
      setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch { alert('Status update failed'); }
  };

  const saveProgress = async () => {
    if (!viewItem) return;
    setSavingProg(true);
    try {
      await actionTrackerApi.updateProgress(viewItem.id, progForm);
      setRows(prev => prev.map(r => r.id === viewItem.id ? { ...r, ...progForm } : r));
      setViewItem(prev => prev ? { ...prev, ...progForm } : null);
    } catch { alert('Progress update failed'); }
    finally { setSavingProg(false); }
  };

  const openView = (r: AT) => {
    setViewItem(r);
    setProgForm({ progressUpdate: r.progressUpdate || '', completionPercent: r.completionPercent || 0, updatedBy: r.updatedBy || '' });
  };

  const today = new Date();
  const displayed = rows.filter(r => {
    if (filter && r.status !== filter) return false;
    if (modFilter && r.sourceModule !== modFilter) return false;
    return true;
  });
  const overdue = rows.filter(r => r.targetCompletionDate && new Date(r.targetCompletionDate) < today && r.status !== 'CLOSED' && r.status !== 'VERIFIED').length;

  const ST_COLOR: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    PENDING_VERIFICATION: 'bg-blue-100 text-blue-700', VERIFIED: 'bg-indigo-100 text-indigo-700',
    CLOSED: 'bg-green-100 text-green-700', OVERDUE: 'bg-red-200 text-red-800',
  };
  const PRI_COLOR: Record<string, string> = {
    CRITICAL: 'bg-red-200 text-red-800', HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700',
  };

  if (loading) return <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total',        value: rows.length,                                                                      color: BRAND     },
          { label: 'Open',         value: rows.filter(r => r.status === 'OPEN').length,                                     color: '#ef4444' },
          { label: 'In Progress',  value: rows.filter(r => r.status === 'IN_PROGRESS').length,                              color: '#f59e0b' },
          { label: 'Closed',       value: rows.filter(r => r.status === 'CLOSED' || r.status === 'VERIFIED').length,        color: '#10b981' },
          { label: 'Overdue',      value: overdue,                                                                          color: '#dc2626' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3.5 flex items-center gap-3 flex-wrap">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          {['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'CLOSED', 'OVERDUE'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={modFilter} onChange={e => setModFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Modules</option>
          {['MOM', 'KPI_REVIEW', 'AUDIT_REVIEW', 'PROCESS_REVIEW', 'CAR', 'NC', 'MANUAL'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <span className="text-xs text-gray-400 flex-1">{displayed.length} action(s)</span>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs hover:bg-gray-50">
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {displayed.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <i className="fas fa-tasks text-3xl mb-2 block opacity-20" />
            No action items found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {['Action No.', 'Source', 'Description', 'Responsible', 'Target Date', 'Priority', 'Progress', 'Status', 'Update'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map((r: AT) => {
                const isOverdue = r.targetCompletionDate && new Date(r.targetCompletionDate) < today && r.status !== 'CLOSED' && r.status !== 'VERIFIED';
                return (
                  <tr key={r.id} className={`hover:bg-gray-50 group ${isOverdue ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{r.actionNo}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-medium">{(r.sourceModule || '—').replace(/_/g, ' ')}</span>
                      {r.sourceReferenceNo && <p className="text-[10px] text-gray-400 mt-0.5">{r.sourceReferenceNo}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-800 max-w-[180px] truncate cursor-pointer hover:text-purple-700" onClick={() => openView(r)} title="Click to view details">{r.actionDescription}</td>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{r.responsiblePerson || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {r.targetCompletionDate || '—'}
                      {isOverdue && <span className="block text-red-600 text-[10px] font-semibold">OVERDUE</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRI_COLOR[r.priority || ''] || ''}`}>{r.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.completionPercent != null && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                            <div className="h-1.5 rounded-full bg-purple-600" style={{ width: `${r.completionPercent}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{r.completionPercent}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ST_COLOR[r.status || ''] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={r.status || ''} onChange={e => updateStatus(r.id, e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none">
                        {['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'CLOSED'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* View / Progress Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#280882] to-indigo-700 flex items-center justify-between px-6 py-4 rounded-t-2xl">
              <div>
                <h2 className="text-base font-bold text-white">{viewItem.actionNo}</h2>
                <p className="text-purple-200 text-xs mt-0.5">{(viewItem.sourceModule || '').replace(/_/g, ' ')} — {viewItem.sourceReferenceNo}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-white/20 rounded-xl text-white"><i className="fas fa-times" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Action Description</p>
                <p className="font-medium text-gray-800">{viewItem.actionDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['Responsible', viewItem.responsiblePerson || '—'],['Department', viewItem.department || '—'],['Target Date', viewItem.targetCompletionDate || '—'],['Priority', viewItem.priority || '—'],['Status', viewItem.status || '—'],['Completion', `${viewItem.completionPercent || 0}%`]].map(([l,v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                    <p className="font-semibold text-gray-800 text-xs">{v}</p>
                  </div>
                ))}
              </div>
              {viewItem.remarks && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Remarks</p><p className="text-gray-700 text-xs">{viewItem.remarks}</p></div>}

              {/* Progress Update */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Update Progress</p>
                <div className="space-y-2">
                  <div>
                    <label className={labelCls}>Progress Update</label>
                    <textarea value={progForm.progressUpdate} onChange={e => setProgForm(p => ({ ...p, progressUpdate: e.target.value }))} rows={2} className={`${inputCls} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Completion % (0–100)</label>
                      <input type="number" min={0} max={100} value={progForm.completionPercent} onChange={e => setProgForm(p => ({ ...p, completionPercent: Number(e.target.value) }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Updated By</label>
                      <input value={progForm.updatedBy} onChange={e => setProgForm(p => ({ ...p, updatedBy: e.target.value }))} className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setViewItem(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Close</button>
              <button onClick={saveProgress} disabled={savingProg} className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
                {savingProg ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : 'Save Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── KPI Review (inside MRM) ───────────────────────────────────────────────────
function MrmKpiReview({ certId }: { certId: number | null }) {
  const [masters, setMasters] = useState<KpiMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loader = certId ? kpiApi.getMastersByCert(certId) : kpiApi.getMasters();
    loader
      .then((d: unknown) => setMasters(Array.isArray(d) ? d as KpiMaster[] : []))
      .catch(() => setMasters([]))
      .finally(() => setLoading(false));
  }, [certId]);

  const COLORS = [BRAND, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];
  const freqGroups: Record<string, number> = {};
  masters.forEach(m => { freqGroups[m.frequency] = (freqGroups[m.frequency] || 0) + 1; });

  const printKpiReview = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>KPI Review for MRM</title>
      <style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h1{color:#280882}table{width:100%;border-collapse:collapse}th{background:#280882;color:white;padding:6px;text-align:left;font-size:9px}td{border:1px solid #ddd;padding:5px 8px}tr:nth-child(even){background:#f5f3ff}</style>
      </head><body>
      <h1>KPI Review — Management Review Meeting</h1>
      <p>Generated: ${new Date().toLocaleDateString('en-IN')} | Total KPIs: ${masters.length}</p>
      <table>
        <thead><tr><th>KPI Code</th><th>KPI Name</th><th>Type</th><th>Frequency</th><th>Target</th><th>Unit</th><th>Description</th></tr></thead>
        <tbody>${masters.map(m=>`<tr><td><b>${m.kpiCode}</b></td><td>${m.kpiObjective||m.title||'—'}</td><td>${m.kpiType}</td><td>${m.frequency}</td><td><b>${m.targetValue??'—'}</b></td><td>${m.unit}</td><td>${m.objective||'—'}</td></tr>`).join('')}</tbody>
      </table>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  if (loading) return <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">KPI Review — Auto Fetched from KPI Module</h3>
          <p className="text-xs text-gray-500 mt-0.5">Review KPI objectives and targets for the Management Review Meeting</p>
        </div>
        {masters.length > 0 && (
          <button onClick={printKpiReview} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-300 text-red-700 text-xs hover:bg-red-50">
            <i className="fas fa-file-pdf" /> Print KPI Review
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total KPIs',   value: masters.length,                    color: BRAND     },
          { label: 'Monthly',      value: freqGroups['MONTHLY']   || 0,      color: '#3b82f6' },
          { label: 'Quarterly',    value: freqGroups['QUARTERLY'] || 0,      color: '#f59e0b' },
          { label: 'Annual',       value: freqGroups['ANNUALLY']  || 0,      color: '#10b981' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {masters.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-12 text-center text-gray-400">
          <i className="fas fa-chart-line text-3xl mb-2 block opacity-20" />
          No KPI masters defined. Go to KPI Management to add KPI objectives.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {['KPI Code', 'KPI Name', 'Type', 'Frequency', 'Target', 'Unit', 'Review Decision'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {masters.map((m: KpiMaster, i) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{m.kpiCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.kpiObjective || m.title || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.kpiType}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">{m.frequency}</span></td>
                  <td className="px-4 py-3 font-bold" style={{ color: COLORS[i % COLORS.length] }}>{m.targetValue ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.unit}</td>
                  <td className="px-4 py-3">
                    <select className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none">
                      <option value="">Select Decision</option>
                      <option>Maintain Current Target</option>
                      <option>Increase Target</option>
                      <option>Reduce Target</option>
                      <option>Additional Resources</option>
                      <option>Training Required</option>
                      <option>CAR Required</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// ── Audit Review (inside MRM) ─────────────────────────────────────────────────
function MrmAuditReview({ certId }: { certId: number | null }) {
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [ncs,   setNcs]   = useState<NC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const planLoader = certId ? auditApi.getPlansByCert(certId) : auditApi.getPlans();
    const ncLoader   = certId ? auditApi.getNcsByCert(certId)   : auditApi.getAllNcs();
    Promise.allSettled([planLoader, ncLoader])
      .then(([pRes, nRes]) => {
        setPlans(pRes.status === 'fulfilled' ? (Array.isArray(pRes.value) ? pRes.value : []) : []);
        setNcs(nRes.status === 'fulfilled'   ? (Array.isArray(nRes.value) ? nRes.value : []) : []);
      }).finally(() => setLoading(false));
  }, [certId]);

  const printAuditReview = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Audit Review for MRM</title>
      <style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h1{color:#280882}h2{color:#444;font-size:11px;margin-top:12px}table{width:100%;border-collapse:collapse;margin-bottom:10px}th{background:#280882;color:white;padding:6px 8px;font-size:9px;text-align:left}td{border:1px solid #ddd;padding:5px 8px}tr:nth-child(even){background:#f5f3ff}.major{color:#991b1b;font-weight:600}.open{color:#991b1b;font-weight:600}.closed{color:#065f46}</style>
      </head><body>
      <h1>Internal Audit Review — Management Review Meeting</h1>
      <p>Generated: ${new Date().toLocaleDateString('en-IN')}</p>
      <h2>Audit Plans Summary</h2>
      <table>
        <thead><tr><th>Ref No.</th><th>Type</th><th>Lead Auditor</th><th>Start Date</th><th>End Date</th><th>Status</th></tr></thead>
        <tbody>${plans.slice(0, 20).map(p=>`<tr><td><b>${p.auditRefNo||'—'}</b></td><td>${p.auditType}</td><td>${p.leadAuditor||'—'}</td><td>${p.plannedStartDate||'—'}</td><td>${p.plannedEndDate||'—'}</td><td>${p.status}</td></tr>`).join('')}</tbody>
      </table>
      <h2>NC / CAR Status</h2>
      <table>
        <thead><tr><th>NC Number</th><th>Type</th><th>Clause</th><th>Description</th><th>Responsible</th><th>Target Date</th><th>Status</th></tr></thead>
        <tbody>${ncs.map(n=>`<tr><td><b>${n.ncNumber}</b></td><td class="${n.ncType==='MAJOR'?'major':''}">${n.ncType}</td><td>${n.clauseNo||'—'}</td><td>${(n.ncDescription||'').substring(0,50)}...</td><td>${n.responsiblePerson||'—'}</td><td>${n.targetDate||'—'}</td><td class="${n.status==='OPEN'?'open':'closed'}">${n.status}</td></tr>`).join('')}</tbody>
      </table>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  if (loading) return <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>;

  const planStats = { total: plans.length, completed: plans.filter(p => p.status === 'COMPLETED').length, inProgress: plans.filter(p => p.status === 'IN_PROGRESS').length };
  const ncStats   = { total: ncs.length, open: ncs.filter(n => n.status === 'OPEN').length, major: ncs.filter(n => n.ncType === 'MAJOR').length, closed: ncs.filter(n => n.status === 'CLOSED').length };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Internal Audit Review — Auto Fetched from Audit Module</h3>
          <p className="text-xs text-gray-500 mt-0.5">Review audit status and non-conformances for the Management Review Meeting</p>
        </div>
        <button onClick={printAuditReview} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-300 text-red-700 text-xs hover:bg-red-50">
          <i className="fas fa-file-pdf" /> Print Audit Review
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Audits',   value: planStats.total,     color: BRAND     },
          { label: 'Completed',      value: planStats.completed, color: '#10b981' },
          { label: 'Open NCs',       value: ncStats.open,        color: '#ef4444' },
          { label: 'Major NCs',      value: ncStats.major,       color: '#dc2626' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Audit Plans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-3.5 border-b"><h3 className="text-sm font-semibold text-gray-700">Recent Audit Plans</h3></div>
          {plans.length === 0 ? <div className="py-8 text-center text-gray-400 text-sm">No audit plans found.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500 uppercase"><th className="px-4 py-2.5 text-left">Ref No.</th><th className="px-4 py-2.5 text-left">Type</th><th className="px-4 py-2.5 text-left">Auditor</th><th className="px-4 py-2.5 text-left">Date</th><th className="px-4 py-2.5 text-left">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.slice(0, 8).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono font-bold" style={{ color: BRAND }}>{p.auditRefNo||'—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{p.auditType}</td>
                      <td className="px-4 py-2.5 text-gray-700">{p.leadAuditor||'—'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{p.plannedStartDate||'—'}</td>
                      <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.status==='COMPLETED'?'bg-green-100 text-green-700':p.status==='IN_PROGRESS'?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-700'}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Open NCs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-3.5 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Open Non-Conformances</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{ncStats.open} Open</span>
          </div>
          {ncs.filter(n => n.status !== 'CLOSED').length === 0 ? <div className="py-8 text-center text-gray-400 text-sm"><i className="fas fa-check-circle text-green-400 text-2xl mb-1 block" />No open NCs — excellent!</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 text-gray-500 uppercase"><th className="px-4 py-2.5 text-left">NC No.</th><th className="px-4 py-2.5 text-left">Type</th><th className="px-4 py-2.5 text-left">Clause</th><th className="px-4 py-2.5 text-left">Status</th><th className="px-4 py-2.5 text-left">Target Date</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {ncs.filter(n => n.status !== 'CLOSED').slice(0, 8).map(n => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono font-bold" style={{ color: BRAND }}>{n.ncNumber}</td>
                      <td className="px-4 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${n.ncType==='MAJOR'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{n.ncType}</span></td>
                      <td className="px-4 py-2.5 text-gray-500">{n.clauseNo||'—'}</td>
                      <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 text-orange-700 font-medium">{n.status}</span></td>
                      <td className="px-4 py-2.5 text-gray-500">{n.targetDate||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
function MrmReports() {
  const [loading, setLoading] = useState(false);

  const downloadPlanCSV = async () => {
    setLoading(true);
    try {
      const plans = (await mrmApi.getPlans() as unknown) as MrmPlan[];
      exportCSV('MRM_Plans_Report.csv',
        ['Ref No.', 'Type', 'Meeting Date', 'Chairman', 'MR Rep.', 'Coordinator', 'Status', 'Scope'],
        plans.map(p => [p.mrmRefNo, p.mrmType, p.meetingDate, p.chairman, p.mrRepresentative, p.coordinator, p.status, p.scope])
      );
    } catch { alert('Failed to generate report.'); }
    finally { setLoading(false); }
  };

  const downloadPlanPDF = async () => {
    setLoading(true);
    try {
      const plans = (await mrmApi.getPlans() as unknown) as MrmPlan[];
      const w = window.open('', '_blank');
      if (!w) return;
      const stats = {
        total: plans.length, planned: plans.filter(p => p.status === 'PLANNED').length,
        completed: plans.filter(p => p.status === 'COMPLETED').length,
      };
      w.document.write(`
        <html><head><title>MRM Report</title>
        <style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px;color:#222}h1{color:#280882;font-size:16px}.cards{display:flex;gap:20px;margin-bottom:14px}.card{background:#f5f3ff;border:1px solid #e0d9ff;border-radius:8px;padding:10px 14px}.card-val{font-size:20px;font-weight:bold;color:#280882}.card-lbl{font-size:9px;color:#666}table{width:100%;border-collapse:collapse}th{background:#280882;color:white;padding:7px 10px;text-align:left;font-size:9px}td{border:1px solid #ddd;padding:6px 8px}tr:nth-child(even){background:#f5f3ff}</style>
        </head><body>
        <h1>Management Review Meeting Report</h1>
        <p style="color:#888;font-size:10px">Generated: ${new Date().toLocaleDateString('en-IN')}</p>
        <div class="cards">
          <div class="card"><div class="card-val">${stats.total}</div><div class="card-lbl">Total MRMs</div></div>
          <div class="card"><div class="card-val" style="color:#3b82f6">${stats.planned}</div><div class="card-lbl">Planned</div></div>
          <div class="card"><div class="card-val" style="color:#10b981">${stats.completed}</div><div class="card-lbl">Completed</div></div>
        </div>
        <table>
          <thead><tr><th>Ref No.</th><th>Type</th><th>Date</th><th>Chairman</th><th>MR Rep.</th><th>Coordinator</th><th>Status</th><th>Scope</th></tr></thead>
          <tbody>${plans.map(p=>`<tr><td><b>${p.mrmRefNo}</b></td><td>${p.mrmType}</td><td>${p.meetingDate||'—'}</td><td>${p.chairman||'—'}</td><td>${p.mrRepresentative||'—'}</td><td>${p.coordinator||'—'}</td><td>${p.status}</td><td>${p.scope||'—'}</td></tr>`).join('')}</tbody>
        </table>
        </body></html>
      `);
      w.document.close(); w.print();
    } catch { alert('Failed to generate PDF.'); }
    finally { setLoading(false); }
  };

  const downloadActionCSV = async () => {
    setLoading(true);
    try {
      const actions: any[] = (await mrmApi.getPendingActions() as any[]).filter((m: any) => m.actionRequired);
      exportCSV('MRM_Action_Tracker.csv',
        ['Discussion Details', 'Decision Taken', 'Responsible Person', 'Target Date', 'Status'],
        actions.map(a => [a.discussionDetails || '', a.decisionTaken || '', a.responsiblePerson || '', a.targetDate || '', a.status])
      );
    } catch { alert('Failed to generate report.'); }
    finally { setLoading(false); }
  };

  const reportCards = [
    { title: 'MRM Plans Report',         desc: 'All MRM plans with chairman, MR, scope, and status',  csvFn: downloadPlanCSV,   pdfFn: downloadPlanPDF,   icon: 'fas fa-calendar', color: BRAND },
    { title: 'Action Tracker Report',    desc: 'All pending action items from MRM with due dates',    csvFn: downloadActionCSV, pdfFn: undefined,          icon: 'fas fa-tasks',    color: '#ef4444' },
    { title: 'Agenda & MOM Report',      desc: 'Minutes of Meeting with agenda and decisions',       csvFn: downloadPlanCSV,   pdfFn: downloadPlanPDF,   icon: 'fas fa-file-alt', color: '#10b981' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportCards.map(r => (
          <div key={r.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${r.color}18` }}>
              <i className={r.icon} style={{ color: r.color }} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">{r.title}</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">{r.desc}</p>
            <div className="flex gap-2">
              <button onClick={r.csvFn} disabled={loading} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-green-300 text-green-700 text-xs font-medium hover:bg-green-50 disabled:opacity-50">
                <i className="fas fa-file-excel" /> Excel
              </button>
              {r.pdfFn && (
                <button onClick={r.pdfFn} disabled={loading} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-red-300 text-red-700 text-xs font-medium hover:bg-red-50 disabled:opacity-50">
                  <i className="fas fa-file-pdf" /> PDF
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MRM Agenda Topics Reference */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Standard MRM Agenda Topics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'Previous MRM Action Status','Customer Complaints','Customer Satisfaction',
            'KPI Achievement','Process Performance','Internal Audit Result',
            'External Audit Result','NC & Corrective Action','Supplier Performance',
            'Risk & Opportunity','Resource Requirement','Improvement Opportunity',
            'Project Review','On Time Delivery','Safety Issues','Business Planning',
          ].map((topic, i) => (
            <div key={topic} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: BRAND }}>
                {i + 1}
              </div>
              <span className="text-xs text-gray-700">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl px-6 py-4 shadow-xl flex items-center gap-3">
            <i className="fas fa-spinner fa-spin text-lg" style={{ color: BRAND }} />
            <span className="text-sm font-medium text-gray-700">Generating report...</span>
          </div>
        </div>
      )}
    </div>
  );
}
