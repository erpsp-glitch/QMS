import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { kpiApi, certApi, deptApi } from '../../api/qms.api';
import { exportCSV } from '../master-data/chartUtils';
import KpiMasterPage from '../qms/KpiMasterPage';
import KpiEntryPage from '../qms/KpiEntryPage';
import type { KpiMaster, KpiEntry, Certification, Department } from '../qms/types';

interface CapaAction {
  id: number;
  kpiMasterId: string;
  kpiName: string;
  kpiCode: string;
  kpiLabel?: string;
  rootCause: string;
  actionPlan: string;
  responsiblePerson: string;
  targetDate: string;
  priority: string;
  status: string;
  remarks: string;
  createdAt?: string;
}

type FailedKpi = KpiMaster & { actualValue?: number | null; entryId?: number };

const BRAND = '#280882';
const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',          icon: 'fas fa-chart-pie'        },
  { id: 'objective',  label: 'KPI Objective Master',icon: 'fas fa-bullseye'         },
  { id: 'monthly',    label: 'Monthly Entry',       icon: 'fas fa-calendar-alt'     },
  { id: 'review',     label: 'KPI Review',          icon: 'fas fa-search-dollar'    },
  { id: 'capa',       label: 'Corrective Action',   icon: 'fas fa-tools'            },
  { id: 'analytics',  label: 'Analytics',           icon: 'fas fa-chart-bar'        },
  { id: 'reports',    label: 'Reports',             icon: 'fas fa-file-pdf'         },
];

export default function KpiModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setTab = (tab: string) => setSearchParams({ tab }, { replace: true });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">KPI Management</h1>
            <p className="text-sm text-green-100 mt-0.5">Define, track, review, and analyse Key Performance Indicators</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-100 bg-white/10 px-3 py-1.5 rounded-lg">
            <i className="fas fa-chart-bar" />
            <span className="font-medium">KPI</span>
            <span className="opacity-50">›</span>
            <span>{TABS.find(t => t.id === activeTab)?.label}</span>
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
                    ? 'border-b-green-600 text-green-700 bg-green-50/60'
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
        {activeTab === 'dashboard' && <KpiDashboard onNavigate={setTab} />}
        {activeTab === 'objective' && <KpiMasterPage />}
        {activeTab === 'monthly'   && <KpiEntryPage />}
        {activeTab === 'review'    && <KpiReview />}
        {activeTab === 'capa'      && <KpiCapa />}
        {activeTab === 'analytics' && <KpiAnalytics />}
        {activeTab === 'reports'   && <KpiReports />}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function KpiDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [masters, setMasters] = useState<KpiMaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kpiApi.getMasters()
      .then((d: unknown) => setMasters(Array.isArray(d) ? d as KpiMaster[] : []))
      .catch(() => setMasters([]))
      .finally(() => setLoading(false));
  }, []);

  const freqGroups: Record<string, number> = {};
  masters.forEach((m: KpiMaster) => { freqGroups[m.frequency ?? ''] = (freqGroups[m.frequency ?? ''] || 0) + 1; });

  const typeGroups: Record<string, number> = {};
  masters.forEach((m: KpiMaster) => { typeGroups[m.kpiType ?? ''] = (typeGroups[m.kpiType ?? ''] || 0) + 1; });

  const deptGroups: Record<string, number> = {};
  masters.forEach((m: KpiMaster) => {
    const d = m.department?.name || m.departmentName || 'Unassigned';
    deptGroups[d] = (deptGroups[d] || 0) + 1;
  });

  if (loading) return <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total KPI Masters', value: masters.length, icon: 'fas fa-layer-group', color: BRAND },
          { label: 'Monthly KPIs',   value: freqGroups['MONTHLY']   || 0, icon: 'fas fa-calendar-alt',   color: '#10b981' },
          { label: 'Quarterly KPIs', value: freqGroups['QUARTERLY'] || 0, icon: 'fas fa-calendar-check', color: '#f59e0b' },
          { label: 'Annual KPIs',    value: freqGroups['ANNUALLY']  || 0, icon: 'fas fa-calendar',        color: '#8b5cf6' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Frequency */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">KPIs by Frequency</h3>
          {Object.keys(freqGroups).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No KPI masters defined yet.</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(freqGroups).map(([freq, count]) => {
                const pct = masters.length > 0 ? (count / masters.length) * 100 : 0;
                return (
                  <div key={freq} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium text-gray-600 truncate">{freq}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: BRAND }} />
                    </div>
                    <span className="w-6 text-xs text-gray-500 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">KPIs by Type</h3>
          {Object.keys(typeGroups).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No KPI masters defined yet.</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(typeGroups).map(([type, count], i) => {
                const pct = masters.length > 0 ? (count / masters.length) * 100 : 0;
                const colors = [BRAND, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }} />
                    <span className="w-24 text-xs font-medium text-gray-600 truncate">{type}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                    <span className="w-6 text-xs text-gray-500 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By Department */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">KPIs by Department</h3>
          {Object.keys(deptGroups).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No KPI masters defined yet.</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(deptGroups).slice(0, 6).map(([dept, count], i) => {
                const pct = masters.length > 0 ? (count / masters.length) * 100 : 0;
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', BRAND];
                return (
                  <div key={dept} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium text-gray-600 truncate">{dept}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                    <span className="w-6 text-xs text-gray-500 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* KPI Masters Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">KPI Master List</h3>
          <button onClick={() => onNavigate('objective')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium" style={{ background: BRAND }}>
            <i className="fas fa-plus" /> Add KPI
          </button>
        </div>
        {masters.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            <i className="fas fa-layer-group text-3xl mb-2 block opacity-20" />
            No KPI masters defined yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  {['KPI Code', 'KPI Name', 'Type', 'Frequency', 'Target', 'Unit', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {masters.map((m: KpiMaster) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{m.kpiCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.kpiObjective || m.title}</td>
                    <td className="px-4 py-3 text-gray-500">{m.kpiType}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{m.frequency}</span></td>
                    <td className="px-4 py-3 font-bold text-sm" style={{ color: BRAND }}>{m.targetValue} <span className="text-gray-400 text-xs font-normal">{m.unit}</span></td>
                    <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── KPI Review ────────────────────────────────────────────────────────────────
function KpiReview() {
  const [masters, setMasters] = useState<KpiMaster[]>([]);
  const [certs,   setCerts]   = useState<Certification[]>([]);
  const [certId,  setCertId]  = useState<number | null>(null);
  const [year,    setYear]    = useState(new Date().getFullYear());
  const [month,   setMonth]   = useState(['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][new Date().getMonth()]);
  const [entries, setEntries] = useState<KpiEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
    kpiApi.getMasters().then((d: unknown) => setMasters(Array.isArray(d) ? d as KpiMaster[] : [])).catch(() => {});
  }, []);

  const loadEntries = async () => {
    if (!certId) { alert('Select a certification first.'); return; }
    setLoading(true);
    try {
      const d = await kpiApi.getEntries(certId, year, month);
      setEntries(Array.isArray(d) ? d as KpiEntry[] : []);
    } catch { setEntries([]); }
    finally { setLoading(false); }
  };

  const getStatus = (entry: KpiEntry | null | undefined, master: KpiMaster | null | undefined): string => {
    if (!entry || entry.actualValue === undefined || entry.actualValue === null) return 'NOT_ENTERED';
    const actual = Number(entry.actualValue);
    const target = Number(master?.targetValue || 0);
    if (!target) return 'NOT_ENTERED';
    if (actual >= target) return 'ACHIEVED';
    if (actual >= target * 0.8) return 'WARNING';
    return 'FAILED';
  };

  const statusBadge = (status: string) => ({
    ACHIEVED:   'bg-green-100 text-green-700',
    WARNING:    'bg-yellow-100 text-yellow-700',
    FAILED:     'bg-red-100 text-red-700',
    NOT_ENTERED:'bg-gray-100 text-gray-500',
  }[status] || 'bg-gray-100 text-gray-500');

  const printReview = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const certName = certs.find(c => c.id === certId)?.name || '';
    w.document.write(`
      <html><head><title>KPI Review Report</title>
      <style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px;color:#222}h1{color:#280882;font-size:16px}h2{color:#555;font-size:12px;margin-top:0}table{width:100%;border-collapse:collapse}th{background:#280882;color:white;padding:7px;text-align:left;font-size:10px}td{border:1px solid #ddd;padding:6px 8px}tr:nth-child(even){background:#f5f3ff}.achieved{color:#065f46;font-weight:600}.warning{color:#92400e;font-weight:600}.failed{color:#991b1b;font-weight:600}</style>
      </head><body>
      <h1>KPI Review Report</h1>
      <h2>${certName} | ${MONTH_LABELS[Number(month)-1]} ${year}</h2>
      <table>
        <thead><tr><th>KPI Code</th><th>KPI Name</th><th>Type</th><th>Target</th><th>Actual</th><th>Achievement %</th><th>Variance</th><th>Status</th></tr></thead>
        <tbody>
          ${masters.map(m => {
            const entry = entries.find(e => e.kpiMaster?.id === m.id || e.kpiCode === m.kpiCode);
            const actual = entry?.actualValue ?? '—';
            const target = m.targetValue;
            const achPct = entry?.actualValue != null && target ? ((Number(entry.actualValue) / Number(target)) * 100).toFixed(1) : '—';
            const variance = entry?.actualValue != null && target != null ? (Number(entry.actualValue) - Number(target)).toFixed(2) : '—';
            const status = getStatus(entry, m);
            return `<tr>
              <td>${m.kpiCode}</td><td>${m.kpiObjective || m.title}</td><td>${m.kpiType}</td>
              <td>${target} ${m.unit}</td>
              <td>${actual}</td>
              <td class="${status.toLowerCase()}">${achPct}${achPct !== '—' ? '%' : ''}</td>
              <td>${variance}</td>
              <td class="${status.toLowerCase()}">${status}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <p style="font-size:9px;color:#999;margin-top:16px">Generated: ${new Date().toLocaleDateString('en-IN')}</p>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3.5 flex flex-wrap gap-3 items-center">
        <select value={certId ?? ''} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Select Certification</option>
          {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {MONTHS.map((m, i) => <option key={m} value={m}>{MONTH_LABELS[i]}</option>)}
        </select>

        <select value={year} onChange={e => setYear(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
        </select>
        <button onClick={loadEntries} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60" style={{ background: BRAND }}>
          {loading ? <><i className="fas fa-spinner fa-spin" />Loading...</> : <><i className="fas fa-search" />Load KPI Review</>}
        </button>
        {entries.length > 0 && (
          <button onClick={printReview} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 text-red-700 text-sm hover:bg-red-50">
            <i className="fas fa-file-pdf" /> PDF
          </button>
        )}
      </div>

      {/* Summary cards */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Achieved',    count: masters.filter(m => getStatus(entries.find(e => e.kpiMaster?.id === m.id), m) === 'ACHIEVED').length,    color: '#10b981', icon: 'fas fa-check-circle'       },
            { label: 'Warning',     count: masters.filter(m => getStatus(entries.find(e => e.kpiMaster?.id === m.id), m) === 'WARNING').length,     color: '#f59e0b', icon: 'fas fa-exclamation-circle' },
            { label: 'Failed',      count: masters.filter(m => getStatus(entries.find(e => e.kpiMaster?.id === m.id), m) === 'FAILED').length,      color: '#ef4444', icon: 'fas fa-times-circle'       },
            { label: 'Not Entered', count: masters.filter(m => getStatus(entries.find(e => e.kpiMaster?.id === m.id), m) === 'NOT_ENTERED').length, color: '#6b7280', icon: 'fas fa-minus-circle'       },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1.5" style={{ background: `${k.color}18` }}>
                <i className={`${k.icon} text-sm`} style={{ color: k.color }} />
              </div>
              <p className="text-xl font-bold" style={{ color: k.color }}>{k.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* KPI Review Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {masters.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <i className="fas fa-layer-group text-3xl mb-2 block opacity-20" />
            No KPI masters defined.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {['KPI Code', 'KPI Name', 'Frequency', 'Target', 'Actual', 'Achievement %', 'Variance', 'Status', 'Trend'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {masters.map((m: KpiMaster) => {
                const entry = entries.find(e => e.kpiMaster?.id === m.id || e.kpiCode === m.kpiCode);
                const actual = entry?.actualValue ?? null;
                const target = m.targetValue != null ? Number(m.targetValue) : null;
                const achPct = actual != null && target ? ((Number(actual) / target) * 100).toFixed(1) : null;
                const variance = actual != null && target != null ? (Number(actual) - target) : null;
                const status = getStatus(entry, m);
                const trend =
actual!=null && target!=null
? Number(actual)>=Number(target)
?'↑'
:'↓'
:'—';
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{m.kpiCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.kpiObjective || m.title}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">{m.frequency}</span></td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{target} <span className="text-gray-400 text-xs font-normal">{m.unit}</span></td>
                    <td className="px-4 py-3 font-semibold">{actual ?? <span className="text-gray-300 text-xs">—</span>}</td>
                    <td className="px-4 py-3">
                      {achPct ? (
                        <span className={`font-bold ${Number(achPct) >= 100 ? 'text-green-600' : Number(achPct) >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {achPct}%
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {variance != null ? (
                        <span className={variance >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {variance >= 0 ? '+' : ''}{variance.toFixed(2)}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(status)}`}>{status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-lg font-bold" style={{ color: trend === '↑' ? '#10b981' : trend === '↓' ? '#ef4444' : '#9ca3af' }}>
                      {trend}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── KPI CAPA (Corrective Action) ──────────────────────────────────────────────
const CAPA_STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED'];
const CAPA_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const MONTHS_LIST = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function calcFailStatus(entry: KpiEntry | null | undefined, master: KpiMaster | null | undefined): boolean {
  if (!entry || entry.actualValue == null) return false;
  const actual = Number(entry.actualValue);
  const target = Number(master?.targetValue ?? 0);
  if (!master) {
   return false;
}

if (master.direction === "LOWER_IS_BETTER") {
   return actual > target;
}

return actual < target;
}

function KpiCapa() {
  const curMonth = MONTHS_LIST[new Date().getMonth()];
  const curYear  = new Date().getFullYear();

  const [certs,   setCerts]   = useState<Certification[]>([]);
  const [certId,  setCertId]  = useState<number | null>(null);
  const [year,    setYear]    = useState(curYear);
  const [month,   setMonth]   = useState(curMonth);
  const [masters, setMasters] = useState<KpiMaster[]>([]);
  const [entries, setEntries] = useState<KpiEntry[]>([]);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [failedKpis, setFailedKpis] = useState<FailedKpi[]>([]);

  const [actions, setActions] = useState<CapaAction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteCapaId, setDeleteCapaId] = useState<number | null>(null);
  const [form, setForm] = useState({
    kpiMasterId: '', kpiName: '', kpiCode: '',
    rootCause: '', actionPlan: '',
    responsiblePerson: '', targetDate: '', priority: 'MEDIUM', status: 'OPEN', remarks: '',
  });

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
    kpiApi.getMasters().then((d: unknown) => setMasters(Array.isArray(d) ? d as KpiMaster[] : [])).catch(() => {});
    const saved = localStorage.getItem('kpi_capa_actions');
    if (saved) try { setActions(JSON.parse(saved)); } catch { /* noop */ }
  }, []);

  const loadFailedKpis = async () => {
    if (!certId) { alert('Select a Certification Standard first.'); return; }
    setLoadingFailed(true);
    try {
      const e = await kpiApi.getEntries(certId, year, month);
      const eArr: KpiEntry[] = Array.isArray(e) ? e as KpiEntry[] : [];
      setEntries(eArr);
      const mastersByCert = masters.filter(m =>
        m.certification?.id === certId
      );
      const failed = mastersByCert.filter(m => {
        const entry = eArr.find((en: KpiEntry) => en.kpiMaster?.id === m.id);
        return calcFailStatus(entry, m);
      }).map(m => {
        const entry = eArr.find((en: KpiEntry) => en.kpiMaster?.id === m.id);
        return { ...m, actualValue: entry?.actualValue, entryId: entry?.id };
      });
      setFailedKpis(failed as FailedKpi[]);
    } catch { setFailedKpis([]); }
    finally { setLoadingFailed(false); }
  };

  const autoFillFromFailed = (kpi: FailedKpi) => {
    setForm({
      kpiMasterId: String(kpi.id),
      kpiName:     kpi.kpiObjective || kpi.title || '',
      kpiCode:     kpi.kpiCode || '',
      responsiblePerson: kpi.responsiblePerson || kpi.department?.name || '',
      rootCause:   '',
      actionPlan:  '',
      targetDate:  '',
      priority:    'MEDIUM',
      status:      'OPEN',
      remarks:     `KPI failed for ${month} ${year}. Actual: ${kpi.actualValue ?? 'N/A'}, Target: ${kpi.targetValue}`,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveActions = (updated: CapaAction[]) => {
    setActions(updated);
    localStorage.setItem('kpi_capa_actions', JSON.stringify(updated));
  };

  const addAction = () => {
    if (!form.kpiMasterId || !form.actionPlan) { alert('Select KPI and enter Action Plan.'); return; }
    const master = masters.find(m => String(m.id) === form.kpiMasterId);
    const kpiLabel = form.kpiName || (master ? (master.kpiObjective || master.title || '') : '');
    const newAction = {
      ...form,
      id: Date.now(),
      kpiLabel,
      kpiCode: form.kpiCode || master?.kpiCode || '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveActions([newAction, ...actions]);
    setForm({ kpiMasterId: '', kpiName: '', kpiCode: '', rootCause: '', actionPlan: '', responsiblePerson: '', targetDate: '', priority: 'MEDIUM', status: 'OPEN', remarks: '' });
    setShowForm(false);
  };

  const updateStatus = (id: number, status: string) => {
    saveActions(actions.map(a => a.id === id ? { ...a, status } : a));
  };

  const del = (id: number) => {
    saveActions(actions.filter(a => a.id !== id));
    setDeleteCapaId(null);
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const PRIORITY_COLOR: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-blue-100 text-blue-700',
  };
  const STATUS_COLOR: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-blue-100 text-blue-700', VERIFIED: 'bg-purple-100 text-purple-700', CLOSED: 'bg-green-100 text-green-700',
  };

  const printCapa = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>KPI CAR Report</title>
      <style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px}h1{color:#280882}table{width:100%;border-collapse:collapse}th{background:#280882;color:white;padding:7px;text-align:left;font-size:10px}td{border:1px solid #ddd;padding:6px 8px}tr:nth-child(even){background:#f5f3ff}</style>
      </head><body>
      <h1>KPI Corrective Action Report</h1>
      <p>Generated: ${new Date().toLocaleDateString('en-IN')} | Total Actions: ${actions.length}</p>
      <table>
        <thead><tr><th>KPI Code</th><th>KPI Name</th><th>Root Cause</th><th>Action Plan</th><th>Responsible</th><th>Target Date</th><th>Priority</th><th>Status</th></tr></thead>
        <tbody>${actions.map(a => `<tr><td>${a.kpiCode||''}</td><td>${a.kpiLabel || '—'}</td><td>${a.rootCause||'—'}</td><td>${a.actionPlan}</td><td>${a.responsiblePerson||'—'}</td><td>${a.targetDate||'—'}</td><td>${a.priority}</td><td>${a.status}</td></tr>`).join('')}</tbody>
      </table>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-4">
      {/* Failed KPI Detection Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <i className="fas fa-exclamation-triangle text-red-500" />
          <h3 className="text-sm font-semibold text-gray-700">Detect Failed KPIs – Auto-load for CAR</h3>
        </div>
        <div className="flex flex-wrap gap-3 mb-3">
          <select value={certId ?? ''} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)}
            className={`${inputCls} max-w-xs`}>
            <option value=''>Select Certification</option>
            {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(e.target.value)} className={`${inputCls} max-w-[130px]`}>
            {MONTHS_LIST.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className={`${inputCls} max-w-[100px]`}>
            {[curYear-1, curYear, curYear+1].map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={loadFailedKpis} disabled={loadingFailed}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60"
            style={{ background: '#dc2626' }}>
            {loadingFailed ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-search" />}
            {loadingFailed ? 'Loading...' : 'Find Failed KPIs'}
          </button>
        </div>
        {failedKpis.length > 0 ? (
          <div className="border border-red-200 rounded-xl overflow-hidden">
            <div className="bg-red-50 px-4 py-2 flex items-center gap-2">
              <i className="fas fa-times-circle text-red-500 text-sm" />
              <span className="text-sm font-semibold text-red-700">{failedKpis.length} KPI(s) below target for {month} {year}</span>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="bg-red-100 text-red-700 uppercase">
                {['KPI Code','KPI Name','Target','Actual','Responsible','Action'].map(h => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-red-50">
                {failedKpis.map((kpi: FailedKpi) => (
                  <tr key={kpi.id} className="bg-white hover:bg-red-50/30">
                    <td className="px-3 py-2 font-mono font-bold" style={{ color: BRAND }}>{kpi.kpiCode}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{kpi.kpiObjective || kpi.title}</td>
                    <td className="px-3 py-2 font-semibold text-green-700">{kpi.targetValue} {kpi.unit}</td>
                    <td className="px-3 py-2 font-semibold text-red-600">{kpi.actualValue ?? 'N/A'} {kpi.unit}</td>
                    <td className="px-3 py-2 text-gray-500">{kpi.responsiblePerson || kpi.department?.name || '—'}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => autoFillFromFailed(kpi)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-xs font-semibold"
                        style={{ background: BRAND }}>
                        <i className="fas fa-plus" /> Create CAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : entries.length > 0 ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-green-700">
            <i className="fas fa-check-circle" /> All KPIs achieved target for {month} {year}. No CARs needed.
          </div>
        ) : null}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">{actions.length} Corrective Action(s)</span>
          <span className="text-xs text-red-600 font-semibold">{actions.filter(a => a.status === 'OPEN').length} Open</span>
        </div>
        <div className="flex gap-2">
          {actions.length > 0 && (
            <button onClick={printCapa} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-300 text-red-700 text-sm hover:bg-red-50">
              <i className="fas fa-file-pdf" /> PDF
            </button>
          )}
          <button onClick={() => { setForm({ kpiMasterId: '', kpiName: '', kpiCode: '', rootCause: '', actionPlan: '', responsiblePerson: '', targetDate: '', priority: 'MEDIUM', status: 'OPEN', remarks: '' }); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: BRAND }}>
            <i className="fas fa-plus" /> New CAR
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-3 border-b rounded-t-xl flex items-center justify-between" style={{ background: BRAND }}>
            <h3 className="text-sm font-semibold text-white">KPI Corrective Action Request</h3>
            <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white">
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>KPI *</label>
              {form.kpiName ? (
                <div className="border border-purple-300 bg-purple-50 rounded-lg px-3 py-2 text-sm">
                  <p className="font-mono font-bold text-purple-700">{form.kpiCode}</p>
                  <p className="text-gray-700">{form.kpiName}</p>
                  <button onClick={() => setForm(p => ({ ...p, kpiMasterId: '', kpiName: '', kpiCode: '' }))}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1">Clear auto-fill</button>
                </div>
              ) : (
                <select value={form.kpiMasterId} onChange={e => {
                  const m = masters.find(x => String(x.id) === e.target.value);
                  setForm(p => ({ ...p, kpiMasterId: e.target.value, kpiName: m?.kpiObjective || m?.title || '', kpiCode: m?.kpiCode || '' }));
                }} className={inputCls}>
                  <option value="">Select KPI</option>
                  {masters.map(m => <option key={m.id} value={m.id}>{m.kpiCode} — {m.kpiObjective || m.title || 'Unnamed'}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className={labelCls}>Responsible Person *</label>
              <input value={form.responsiblePerson} onChange={f('responsiblePerson')} className={inputCls} placeholder="Enter name" />
            </div>
            <div>
              <label className={labelCls}>Target Date *</label>
              <input type="date" value={form.targetDate} onChange={f('targetDate')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select value={form.priority} onChange={f('priority')} className={inputCls}>
                {CAPA_PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={f('status')} className={inputCls}>
                {CAPA_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelCls}>Root Cause Analysis *</label>
              <textarea value={form.rootCause} onChange={f('rootCause')} rows={2} className={`${inputCls} resize-none`}
                placeholder="Why did this KPI fail? 5-Why / Fishbone analysis..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelCls}>Action Plan *</label>
              <textarea value={form.actionPlan} onChange={f('actionPlan')} rows={2} className={`${inputCls} resize-none`}
                placeholder="Steps to improve this KPI and prevent recurrence..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelCls}>Remarks</label>
              <textarea value={form.remarks} onChange={f('remarks')} rows={1} className={`${inputCls} resize-none`} />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-5 pb-5">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={addAction} className="px-5 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#16a34a' }}>
              <i className="fas fa-save mr-1" /> Save CAR
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {actions.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <i className="fas fa-tools text-3xl mb-2 block opacity-20" />
            No corrective actions recorded yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {['KPI Code', 'KPI Name', 'Root Cause', 'Action Plan', 'Responsible', 'Target Date', 'Priority', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {actions.map((a: CapaAction) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: BRAND }}>{a.kpiCode || '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[140px] truncate">{a.kpiLabel || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate text-xs">{a.rootCause || '—'}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate text-xs">{a.actionPlan}</td>
                  <td className="px-4 py-3 text-gray-600">{a.responsiblePerson || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{a.targetDate || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLOR[a.priority] || ''}`}>{a.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)} className={`text-xs rounded-full px-2 py-0.5 border-0 font-medium cursor-pointer ${STATUS_COLOR[a.status] || ''}`}>
                      {CAPA_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteCapaId(a.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><i className="fas fa-trash text-xs" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      {/* Delete CAR Confirmation */}
      {deleteCapaId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><i className="fas fa-exclamation-triangle text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Corrective Action</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this CAR record?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteCapaId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => del(deleteCapaId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <i className="fas fa-trash text-sm" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}

// ── KPI Analytics ─────────────────────────────────────────────────────────────
function KpiAnalytics() {
  const [masters, setMasters] = useState<KpiMaster[]>([]);
  const [certs,   setCerts]   = useState<Certification[]>([]);
  const [depts,   setDepts]   = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      kpiApi.getMasters(),
      certApi.getAll(),
      deptApi.getAll(),
    ]).then(([mRes, cRes, dRes]) => {
      setMasters(mRes.status === 'fulfilled' ? (Array.isArray(mRes.value) ? mRes.value : []) : []);
      setCerts(cRes.status === 'fulfilled'   ? (Array.isArray(cRes.value) ? cRes.value : []) : []);
      setDepts(dRes.status === 'fulfilled'   ? (Array.isArray(dRes.value) ? dRes.value : []) : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>;

  // Dept-wise KPI count
  const deptKpiCount = depts.map(d => ({
    name: d.name,
    count: masters.filter(m => m.department?.id === d.id).length,
  })).filter(d => d.count > 0);

  // Cert-wise KPI count
  const certKpiCount = certs.map(c => ({
    name: c.code || c.name,
    count: masters.filter(m => m.certification?.id === c.id).length,
  })).filter(c => c.count > 0);

  // Type distribution
  const typeDist = ['PERCENTAGE', 'NUMBER', 'RATIO', 'DAYS', 'COST'].map(t => ({
    label: t,
    count: masters.filter(m => m.kpiType === t).length,
  }));

  const maxDept = Math.max(...deptKpiCount.map(d => d.count), 1);
  const maxCert = Math.max(...certKpiCount.map(c => c.count), 1);
  const COLORS = [BRAND, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department-wise KPI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">KPI Count by Department</h3>
          {deptKpiCount.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">No department-linked KPIs.</p>
          ) : (
            <div className="space-y-3">
              {deptKpiCount.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-gray-600 truncate">{d.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                    <div className="h-4 rounded-full flex items-center justify-end pr-2" style={{ width: `${(d.count / maxDept) * 100}%`, background: COLORS[i % COLORS.length] }}>
                      <span className="text-white text-[10px] font-bold">{d.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certification-wise KPI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">KPI Count by Certification</h3>
          {certKpiCount.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">No certification-linked KPIs.</p>
          ) : (
            <div className="space-y-3">
              {certKpiCount.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-gray-600 truncate">{c.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                    <div className="h-4 rounded-full flex items-center justify-end pr-2" style={{ width: `${(c.count / maxCert) * 100}%`, background: COLORS[i % COLORS.length] }}>
                      <span className="text-white text-[10px] font-bold">{c.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPI Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">KPI Type Distribution</h3>
          <div className="space-y-2.5">
            {typeDist.map((t, i) => {
              const pct = masters.length > 0 ? (t.count / masters.length) * 100 : 0;
              return (
                <div key={t.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="w-24 text-xs text-gray-600">{t.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="w-6 text-xs text-gray-500 text-right">{t.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* KPI Score Guide */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">KPI Achievement Score Guide</h3>
          <div className="space-y-2">
            {[
              { range: '≥ 100%', score: '5', color: '#10b981', label: 'Excellent' },
              { range: '90–99%', score: '4', color: '#3b82f6', label: 'Good'      },
              { range: '75–89%', score: '3', color: '#f59e0b', label: 'Average'   },
              { range: '50–74%', score: '2', color: '#f97316', label: 'Below Par' },
              { range: '< 50%',  score: '1', color: '#ef4444', label: 'Failed'    },
            ].map(row => (
              <div key={row.range} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: row.color }}>{row.score}</div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{row.label}</p>
                  <p className="text-[11px] text-gray-500">Achievement: {row.range}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Complete KPI Master Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {['KPI Code', 'KPI Name', 'Type', 'Frequency', 'Target', 'Unit', 'Certification', 'Department'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {masters.map((m: KpiMaster) => {
                const cert =
certs.find(c=>c.id===m.certification?.id);
                const dept =
depts.find(d=>d.id===m.department?.id);
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs font-bold" style={{ color: BRAND }}>{m.kpiCode}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{m.kpiObjective || m.title}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{m.kpiType}</td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">{m.frequency}</span></td>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: BRAND }}>{m.targetValue ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{m.unit}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">{cert?.code || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">{dept?.name || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── KPI Reports ───────────────────────────────────────────────────────────────
function KpiReports() {
  const [loading, setLoading] = useState(false);

  const downloadMasterCSV = async () => {
    setLoading(true);
    try {
      const masters = (await kpiApi.getMasters() as unknown) as KpiMaster[];
     exportCSV(
  "KPI_Master_Report.csv",

  [
    "KPI Code",
    "KPI Name",
    "Type",
    "Frequency",
    "Target",
    "Unit",
    "Description"
  ],

  masters.map(m => [
    m.kpiCode,
    m.kpiObjective || m.title,
    m.kpiType,
    m.frequency,
    m.targetValue,
    m.unit,
    m.objective || ""
  ])
);
    } catch { alert('Failed to generate report.'); }
    finally { setLoading(false); }
  };

  const downloadMasterPDF = async () => {
    setLoading(true);
    try {
      const masters = (await kpiApi.getMasters() as unknown) as KpiMaster[];
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`
        <html><head><title>KPI Master Report</title>
        <style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px;color:#222}h1{color:#280882;font-size:16px}table{width:100%;border-collapse:collapse}th{background:#280882;color:white;padding:7px;text-align:left;font-size:9px;text-transform:uppercase}td{border:1px solid #ddd;padding:6px 8px}tr:nth-child(even){background:#f5f3ff}</style>
        </head><body>
        <h1>KPI Objective Master Report</h1>
        <p style="color:#888;font-size:10px">Generated: ${new Date().toLocaleDateString('en-IN')} | Total KPIs: ${masters.length}</p>
        <table>
          <thead><tr><th>KPI Code</th><th>KPI Name</th><th>Type</th><th>Frequency</th><th>Target</th><th>Unit</th><th>Formula / Description</th></tr></thead>
          <tbody>${masters.map(m => `<tr><td><b>${m.kpiCode}</b></td><td>${m.kpiObjective || m.title}</td><td>${m.kpiType}</td><td>${m.frequency}</td><td><b>${m.targetValue ?? '—'}</b></td><td>${m.unit}</td><td>${m.objective||'—'}</td></tr>`).join('')}</tbody>
        </table>
        </body></html>
      `);
      w.document.close(); w.print();
    } catch { alert('Failed to generate PDF.'); }
    finally { setLoading(false); }
  };

  const downloadCAPAReport = () => {
    const saved = localStorage.getItem('kpi_capa_actions');
    const actions: CapaAction[] = saved ? JSON.parse(saved) : [];
    if (actions.length === 0) { alert('No CAR records found.'); return; }
    exportCSV(
      "KPI_CAPA_Report.csv",
      [
        "KPI Code",
        "KPI Name",
        "Root Cause",
        "Action Plan",
        "Responsible Person",
        "Target Date",
        "Priority",
        "Status",
        "Remarks",
        "Created At"
      ],
      actions.map(a => [
        a.kpiCode,
        a.kpiName,
        a.rootCause,
        a.actionPlan,
        a.responsiblePerson,
        a.targetDate,
        a.priority,
        a.status,
        a.remarks,
        a.createdAt || ""
      ])
    );
  };

  const reportTypes = [
    {
      title: 'KPI Objective Master Report',
      desc: 'All KPI definitions, targets, frequency, and formula',
      icon: 'fas fa-bullseye',
      color: BRAND,
      csvFn: downloadMasterCSV,
      pdfFn: downloadMasterPDF,
    },
    {
      title: 'KPI Corrective Action (CAR) Report',
      desc: 'All corrective actions linked to failed KPIs',
      icon: 'fas fa-tools',
      color: '#ef4444',
      csvFn: downloadCAPAReport,
      pdfFn: undefined,
    },
    {
      title: 'KPI Monthly Summary Report',
      desc: 'Download from Monthly Entry tab using Certification filter',
      icon: 'fas fa-calendar-alt',
      color: '#10b981',
      csvFn: downloadMasterCSV,
      pdfFn: downloadMasterPDF,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map(r => (
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

      {/* KPI Target Reference */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Standard KPI Targets Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase">
                {['Department', 'KPI', 'Target', 'Unit', 'Frequency'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['QA',          'Rejection Rate',            '< 2',   '%',  'Monthly'],
                ['QA',          'Customer Complaint',        '0',     'Nos','Monthly'],
                ['QA',          'Calibration On Time',       '100',   '%',  'Monthly'],
                ['Production',  'Production Efficiency',     '> 90',  '%',  'Monthly'],
                ['Production',  'Machine Utilization',       '> 85',  '%',  'Monthly'],
                ['Production',  'Rework Rate',               '< 3',   '%',  'Monthly'],
                ['HR',          'Training Completion',       '100',   '%',  'Quarterly'],
                ['HR',          'Attendance',                '> 95',  '%',  'Monthly'],
                ['Purchase',    'Supplier OTD',              '> 95',  '%',  'Monthly'],
                ['Purchase',    'Supplier Rejection',        '< 2',   '%',  'Monthly'],
                ['Maintenance', 'Breakdown Time',            '< 2 Hrs','Hrs','Monthly'],
                ['Maintenance', 'Preventive Maintenance',    '100',   '%',  'Monthly'],
              ].map(([dept, kpi, target, unit, freq]) => (
                <tr key={`${dept}-${kpi}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-semibold text-gray-700">{dept}</td>
                  <td className="px-4 py-2.5 text-gray-600">{kpi}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: BRAND }}>{target}</td>
                  <td className="px-4 py-2.5 text-gray-500">{unit}</td>
                  <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{freq}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
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
