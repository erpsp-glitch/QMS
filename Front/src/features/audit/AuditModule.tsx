import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auditApi } from '../../api/qms.api';
import type { AuditPlan, NC } from '../qms/types';
import AuditPlanPage from '../qms/AuditPlanPage';
import AuditSchedulePage from '../qms/AuditSchedulePage';
import AuditObservationPage from '../qms/AuditObservationPage';
import NcTrackingPage from '../qms/NcTrackingPage';
import AuditFeedbackPage from '../qms/AuditFeedbackPage';
import AuditReportsPage from '../qms/AuditReportsPage';
import AuditAnalyticsPage from '../qms/AuditAnalyticsPage';
import ClauseMasterPage from '../qms/ClauseMasterPage';

const BRAND = '#280882';

const TABS = [
  { id: 'dashboard',    label: 'Dashboard',          icon: 'fas fa-chart-pie'            },
  { id: 'clauses',      label: 'Clause Master',       icon: 'fas fa-book-open'            },
  { id: 'plans',        label: 'Audit Plan',          icon: 'fas fa-calendar-check'       },
  { id: 'schedule',     label: 'Audit Schedule',      icon: 'fas fa-calendar-alt'         },
  { id: 'observations', label: 'Audit Observation',   icon: 'fas fa-eye'                  },
  { id: 'nc',           label: 'NC / CAR',            icon: 'fas fa-exclamation-triangle' },
  { id: 'feedback',     label: 'Audit Feedback',      icon: 'fas fa-star'                 },
  { id: 'reports',      label: 'Reports',             icon: 'fas fa-file-alt'             },
  { id: 'analytics',    label: 'Analytics',           icon: 'fas fa-chart-bar'            },
];

export default function AuditModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setTab = (tab: string) => setSearchParams({ tab }, { replace: true });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Internal Audit</h1>
          <p className="text-sm text-gray-500 mt-0.5">Plan, execute, and track internal audits, observations, and non-conformances</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <i className="fas fa-clipboard-check" style={{ color: BRAND }} />
          <span style={{ color: BRAND }} className="font-medium">Internal Audit</span>
          <span className="text-gray-300">›</span>
          <span>{TABS.find(t => t.id === activeTab)?.label}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <nav className="flex min-w-max">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
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

      <div key={activeTab}>
        {activeTab === 'dashboard'    && <AuditDashboard />}
        {activeTab === 'clauses'      && <ClauseMasterPage />}
        {activeTab === 'plans'        && <AuditPlanPage />}
        {activeTab === 'schedule'     && <AuditSchedulePage />}
        {activeTab === 'observations' && <AuditObservationPage />}
        {activeTab === 'nc'           && <NcTrackingPage />}
        {activeTab === 'feedback'     && <AuditFeedbackPage />}
        {activeTab === 'reports'      && <AuditReportsPage />}
        {activeTab === 'analytics'    && <AuditAnalyticsPage />}
      </div>
    </div>
  );
}

// ── Audit Dashboard ─────────────────────────────────────────────────────────────
function AuditDashboard() {
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [ncs, setNcs] = useState<NC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      auditApi.getPlans(),
      auditApi.getAllNcs(),
    ]).then(([pRes, nRes]) => {
      setPlans(pRes.status === 'fulfilled' ? (Array.isArray(pRes.value) ? pRes.value : []) : []);
      setNcs(nRes.status === 'fulfilled' ? (Array.isArray(nRes.value) ? nRes.value : []) : []);
    }).finally(() => setLoading(false));
  }, []);

  const planStats = {
    total: plans.length,
    planned: plans.filter(p => p.status === 'PLANNED').length,
    inProgress: plans.filter(p => p.status === 'IN_PROGRESS').length,
    completed: plans.filter(p => p.status === 'COMPLETED').length,
  };

  const ncStats = {
    total: ncs.length,
    open: ncs.filter(n => n.status === 'OPEN').length,
    actionInitiated: ncs.filter(n => n.status === 'ACTION_INITIATED').length,
    closed: ncs.filter(n => n.status === 'CLOSED').length,
  };

  const upcoming = plans
    .filter(p => p.status === 'PLANNED' && p.plannedStartDate)
    .sort((a, b) => new Date(a.plannedStartDate).getTime() - new Date(b.plannedStartDate).getTime())
    .slice(0, 5);

  if (loading) return <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Audits', value: planStats.total, icon: 'fas fa-clipboard-list', color: BRAND },
          { label: 'Completed', value: planStats.completed, icon: 'fas fa-check-circle', color: '#10b981' },
          { label: 'Open NCs', value: ncStats.open, icon: 'fas fa-exclamation-triangle', color: '#ef4444' },
          { label: 'Closed NCs', value: ncStats.closed, icon: 'fas fa-lock', color: '#6b7280' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: `${k.color}15` }}>
              <i className={`${k.icon} text-sm`} style={{ color: k.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Audit Plan Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Audit Plan Status</h3>
          {plans.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No audit plans yet.</p>
          ) : (
            <div className="space-y-2.5">
              {[
                { label: 'Planned', count: planStats.planned, color: '#3b82f6' },
                { label: 'In Progress', count: planStats.inProgress, color: '#f59e0b' },
                { label: 'Completed', count: planStats.completed, color: '#10b981' },
                { label: 'Cancelled', count: plans.filter(p => p.status === 'CANCELLED').length, color: '#6b7280' },
              ].map(row => {
                const pct = planStats.total > 0 ? (row.count / planStats.total) * 100 : 0;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium text-gray-600">{row.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: row.color }} />
                    </div>
                    <span className="w-6 text-xs text-gray-500 text-right">{row.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* NC Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">NC / CAR Status</h3>
          {ncs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No non-conformances yet.</p>
          ) : (
            <div className="space-y-2.5">
              {[
                { label: 'Open', count: ncStats.open, color: '#ef4444' },
                { label: 'Action Init.', count: ncStats.actionInitiated, color: '#f59e0b' },
                { label: 'Verified', count: ncs.filter(n => n.status === 'VERIFIED').length, color: '#3b82f6' },
                { label: 'Closed', count: ncStats.closed, color: '#10b981' },
              ].map(row => {
                const pct = ncStats.total > 0 ? (row.count / ncStats.total) * 100 : 0;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium text-gray-600">{row.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: row.color }} />
                    </div>
                    <span className="w-6 text-xs text-gray-500 text-right">{row.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Audits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Upcoming Audits</h3>
        </div>
        {upcoming.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No upcoming audits scheduled.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {['Ref No.', 'Type', 'Lead Auditor', 'Start Date', 'End Date', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {upcoming.map((p: AuditPlan) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: BRAND }}>{p.auditRefNo}</td>
                  <td className="px-4 py-3 text-gray-500">{p.auditType}</td>
                  <td className="px-4 py-3">{p.leadAuditor}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.plannedStartDate}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.plannedEndDate || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

