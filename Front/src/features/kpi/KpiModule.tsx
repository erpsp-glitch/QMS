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

const STATUS_STYLE: Record<string, string> = {
  ACHIEVED: "bg-green-100 text-green-800 border border-green-300",
  WARNING:  "bg-yellow-100 text-yellow-800 border border-yellow-300",
  FAILED:   "bg-red-100 text-red-800 border border-red-300",
  NOT_UPDATED: "bg-gray-100 text-gray-500 border border-gray-200",
  BELOW_TARGET: "bg-red-100 text-red-800 border border-red-300",
  PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-300",
};
const STATUS_EMOJI: Record<string, string> = {
  ACHIEVED: "🟢", WARNING: "🟡", FAILED: "🔴", NOT_UPDATED: "⚪",
  BELOW_TARGET: "🔴", PENDING: "🟡",
};

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

import { kpiEntryReviewApi } from '../../api/qms.api';

// ── KPI Review ────────────────────────────────────────────────────────────────
function KpiReview() {
  const [subTab, setSubTab] = useState<'dashboard' | 'performance'>('performance');

  // Filter states
  const [certs, setCerts] = useState<Certification[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [filterCertId, setFilterCertId] = useState<string>('');
  const [filterDeptId, setFilterDeptId] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>(String(new Date().getFullYear()));
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterKpiName, setFilterKpiName] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterReviewer, setFilterReviewer] = useState<string>('');
  const [filterReviewStatus, setFilterReviewStatus] = useState<string>('');

  // Data states
  const [kpiEntries, setKpiEntries] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Popups & Form state
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [editingReview, setEditingReview] = useState<any>(null);

  // Form Fields
  const [formReviewerName, setFormReviewerName] = useState('');
  const [formReviewDate, setFormReviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPerformanceRating, setFormPerformanceRating] = useState('Satisfactory');
  const [formManagementComment, setFormManagementComment] = useState('');
  const [formStrengths, setFormStrengths] = useState('');
  const [formWeaknesses, setFormWeaknesses] = useState('');
  const [formRootCause, setFormRootCause] = useState('');
  const [formRiskLevel, setFormRiskLevel] = useState('Medium');
  const [formImprovementOpportunity, setFormImprovementOpportunity] = useState('');
  const [formCorrectiveAction, setFormCorrectiveAction] = useState('');
  const [formPreventiveAction, setFormPreventiveAction] = useState('');
  const [formResponsiblePerson, setFormResponsiblePerson] = useState('');
  const [formTargetCompletionDate, setFormTargetCompletionDate] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formReviewDecision, setFormReviewDecision] = useState('Approved');
  const [formNextReviewDate, setFormNextReviewDate] = useState('');
  const [formAttachment, setFormAttachment] = useState<File | null>(null);

  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    certApi.getAll().then((d: any) => setCerts(Array.isArray(d) ? d : [])).catch(() => {});
    deptApi.getAll().then((d: any) => setDepts(Array.isArray(d) ? d : [])).catch(() => {});
    loadDashboardStats();
    loadKpiReviewData();
  }, []);

  const loadDashboardStats = () => {
    kpiEntryReviewApi.getDashboardStats()
      .then((res: any) => {
        setDashboardStats(res);
      })
      .catch(() => {});
  };

  const loadKpiReviewData = async () => {
    setLoading(true);
    try {
      // 1. Get all active reviews to check status
      const revs = await kpiEntryReviewApi.getAll();
      setReviews(Array.isArray(revs) ? revs : []);

      // 2. Fetch KPI Entries for the selected certification (default to first cert if not selected)
      if (certs.length > 0 || filterCertId) {
        const certId = filterCertId ? Number(filterCertId) : certs[0]?.id;
        if (certId) {
          const yearNum = filterYear ? Number(filterYear) : new Date().getFullYear();
          const entries = await kpiApi.getEntries(certId, yearNum, filterMonth || undefined);
          setKpiEntries(Array.isArray(entries) ? entries : []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadKpiReviewData();
    loadDashboardStats();
  };

  const getLatestReviewForEntry = (entryId: number) => {
    const entryReviews = reviews.filter(r => r.kpiEntry?.id === entryId);
    if (entryReviews.length === 0) return null;
    return entryReviews.reduce((latest, current) => {
      return new Date(current.createdDate || current.createdAt) > new Date(latest.createdDate || latest.createdAt) ? current : latest;
    }, entryReviews[0]);
  };

  // Filter & match entries
  const filteredEntries = kpiEntries.filter(entry => {
    const master = entry.kpiMaster || {};
    const latestReview = getLatestReviewForEntry(entry.id);

    // Filter rules
    if (filterDeptId && String(master.department?.id) !== filterDeptId) return false;
    if (filterCategory && master.kpiCategory !== filterCategory) return false;
    if (filterKpiName && !master.kpiObjective?.toLowerCase().includes(filterKpiName.toLowerCase()) && !master.kpiCode?.toLowerCase().includes(filterKpiName.toLowerCase())) return false;
    if (filterStatus && entry.status !== filterStatus) return false;
    if (filterReviewer && latestReview?.reviewerId !== filterReviewer) return false;
    
    const revStatus = latestReview?.reviewStatus || 'PENDING_REVIEW';
    if (filterReviewStatus && revStatus !== filterReviewStatus) return false;

    return true;
  });

  const openAddReview = (entry: any) => {
    setSelectedEntry(entry);
    setEditingReview(null);
    // Reset form fields
    setFormReviewerName('');
    setFormReviewDate(new Date().toISOString().split('T')[0]);
    setFormPerformanceRating('Satisfactory');
    setFormManagementComment('');
    setFormStrengths('');
    setFormWeaknesses('');
    setFormRootCause('');
    setFormRiskLevel('Medium');
    setFormImprovementOpportunity('');
    setFormCorrectiveAction('');
    setFormPreventiveAction('');
    setFormResponsiblePerson('');
    setFormTargetCompletionDate('');
    setFormPriority('Medium');
    setFormReviewDecision('Approved');
    setFormNextReviewDate('');
    setFormAttachment(null);
    setShowReviewForm(true);
  };

  const openEditReview = (entry: any, review: any) => {
    setSelectedEntry(entry);
    setEditingReview(review);
    // Populate form fields
    setFormReviewerName(review.reviewerId || '');
    setFormReviewDate(review.reviewDate || new Date().toISOString().split('T')[0]);
    setFormPerformanceRating(review.performanceRating || 'Satisfactory');
    setFormManagementComment(review.managementComment || '');
    setFormStrengths(review.strengths || '');
    setFormWeaknesses(review.weaknesses || '');
    setFormRootCause(review.rootCause || '');
    setFormImprovementOpportunity(review.improvementOpportunity || '');
    setFormCorrectiveAction(review.correctiveAction || '');
    setFormPreventiveAction(review.preventiveAction || '');
    setFormResponsiblePerson(review.responsiblePerson || '');
    setFormTargetCompletionDate(review.targetCompletionDate || '');
    setFormPriority(review.priority || 'Medium');
    setFormReviewDecision(review.reviewDecision || 'Approved');
    setFormNextReviewDate(review.nextReviewDate || '');
    setShowReviewForm(true);
  };

  const viewDetails = (entry: any) => {
    setSelectedEntry(entry);
    setShowDetailsPopup(true);
  };

  const viewHistory = async (entry: any) => {
    setSelectedEntry(entry);
    try {
      const history = await kpiEntryReviewApi.getHistory(entry.id);
      setHistoryList(Array.isArray(history) ? history : []);
      setShowHistoryPopup(true);
    } catch {
      alert("Failed to load review history.");
    }
  };

  const handleSaveDraft = async () => {
    await saveReview('UNDER_REVIEW');
  };

  const handleSubmitReview = async () => {
    await saveReview('APPROVED');
  };

  const handleCompleteReview = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to complete this review? This will lock the KPI entry record.")) return;
    try {
      await kpiEntryReviewApi.complete(reviewId);
      alert("Review completed and finalized.");
      loadKpiReviewData();
    } catch {
      alert("Failed to complete review.");
    }
  };

  const saveReview = async (status: string) => {
    if (!formReviewerName) {
      alert("Reviewer Name is required.");
      return;
    }
    const data = {
      kpiEntry: { id: selectedEntry.id },
      reviewerId: formReviewerName,
      reviewDate: formReviewDate,
      performanceRating: formPerformanceRating,
      managementComment: formManagementComment,
      strengths: formStrengths,
      weaknesses: formWeaknesses,
      rootCause: formRootCause,
      improvementOpportunity: formImprovementOpportunity,
      correctiveAction: formCorrectiveAction,
      preventiveAction: formPreventiveAction,
      responsiblePerson: formResponsiblePerson,
      targetCompletionDate: formTargetCompletionDate || null,
      priority: formPriority,
      reviewDecision: formReviewDecision,
      nextReviewDate: formNextReviewDate || null,
      reviewStatus: status,
      achievementPercentage: selectedEntry.achievementPercent,
      attachmentPath: formAttachment ? formAttachment.name : (editingReview?.attachmentPath || '')
    };

    try {
      if (editingReview) {
        await kpiEntryReviewApi.update(editingReview.id, data);
        alert("KPI Review updated successfully.");
      } else {
        await kpiEntryReviewApi.create(data);
        alert("KPI Review created successfully.");
      }
      setShowReviewForm(false);
      loadKpiReviewData();
    } catch (e: any) {
      alert("Failed to save review: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete this review? (Admin only)")) return;
    try {
      await kpiEntryReviewApi.delete(reviewId);
      alert("Review deleted successfully.");
      loadKpiReviewData();
    } catch {
      alert("Delete failed. Please verify admin privileges.");
    }
  };

  // Review decision badge style
  const decisionBadge = (decision: string) => {
    switch (decision?.toUpperCase()) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'NEEDS_IMPROVEMENT': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'UNDER_MONITORING': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ESCALATED': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Review Status Colors
  const reviewStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_REVIEW': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'UNDER_REVIEW': return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'APPROVED': return 'bg-green-100 text-green-800 border border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border border-red-300';
      case 'ESCALATED': return 'bg-purple-100 text-purple-800 border border-purple-300';
      default: return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  const getTrendDataPoints = (kpiMasterId: number) => {
    return kpiEntries
      .filter(e => e.kpiMaster?.id === kpiMasterId)
      .map(e => ({ month: e.month, value: e.actualValue }));
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex gap-2">
        <button
          onClick={() => setSubTab('performance')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            subTab === 'performance' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <i className="fas fa-tasks mr-2" /> Perform KPI Reviews
        </button>
        <button
          onClick={() => setSubTab('dashboard')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            subTab === 'dashboard' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <i className="fas fa-chart-pie mr-2" /> KPI Review Dashboard
        </button>
      </div>

      {/* Perform Reviews Mode */}
      {subTab === 'performance' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className={labelCls}>Certification</label>
                <select value={filterCertId} onChange={e => setFilterCertId(e.target.value)} className={inputCls}>
                  <option value="">Select Certification</option>
                  {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <select value={filterDeptId} onChange={e => setFilterDeptId(e.target.value)} className={inputCls}>
                  <option value="">Select Department</option>
                  {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Year</label>
                <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className={inputCls}>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Month</label>
                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={inputCls}>
                  <option value="">All Months</option>
                  {MONTHS.map((m, idx) => <option key={m} value={m}>{MONTH_LABELS[idx]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>KPI Category</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={inputCls}>
                  <option value="">All Categories</option>
                  <option value="QUALITY">Quality</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="PRODUCTION">Production</option>
                  <option value="HR">HR</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="SAFETY">Safety</option>
                  <option value="SALES">Sales</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>KPI Name/Code</label>
                <input value={filterKpiName} onChange={e => setFilterKpiName(e.target.value)} placeholder="Search name/code" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
                  <option value="">All Statuses</option>
                  <option value="ACHIEVED">Achieved</option>
                  <option value="WARNING">Warning</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Reviewer</label>
                <input value={filterReviewer} onChange={e => setFilterReviewer(e.target.value)} placeholder="Reviewer Name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Review Status</label>
                <select value={filterReviewStatus} onChange={e => setFilterReviewStatus(e.target.value)} className={inputCls}>
                  <option value="">All Review Statuses</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleSearch} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold shadow-sm transition-all" style={{ background: BRAND }}>
                  {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-search" />} Search
                </button>
              </div>
            </div>
          </div>

          {/* KPI Review Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            {filteredEntries.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <i className="fas fa-folder-open text-4xl mb-3 opacity-20" /><br />
                No matching submitted KPI records found for review.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                    <th className="px-4 py-3 font-semibold">KPI Code</th>
                    <th className="px-4 py-3 font-semibold">KPI Name</th>
                    <th className="px-4 py-3 font-semibold">Dept</th>
                    <th className="px-4 py-3 font-semibold">Frequency</th>
                    <th className="px-4 py-3 font-semibold">Target</th>
                    <th className="px-4 py-3 font-semibold">Actual</th>
                    <th className="px-4 py-3 font-semibold">Achievement%</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Rev Status</th>
                    <th className="px-4 py-3 font-semibold">Decision</th>
                    <th className="px-4 py-3 font-semibold">Reviewer</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEntries.map(entry => {
                    const master = entry.kpiMaster || {};
                    const latestReview = getLatestReviewForEntry(entry.id);
                    const revStatus = latestReview?.reviewStatus || 'PENDING_REVIEW';
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-green-700">{master.kpiCode}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{master.kpiObjective}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{master.department?.name || '—'}</td>
                        <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">{master.frequency}</span></td>
                        <td className="px-4 py-3 font-semibold text-gray-700">{master.targetValue} {master.unit}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{entry.actualValue ?? '—'}</td>
                        <td className="px-4 py-3 font-bold text-green-600">{entry.achievementPercent ? `${entry.achievementPercent}%` : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[entry.status]}`}>
                            {STATUS_EMOJI[entry.status]} {entry.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${reviewStatusColor(revStatus)}`}>
                            {revStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {latestReview?.reviewDecision ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${decisionBadge(latestReview.reviewDecision)}`}>
                              {latestReview.reviewDecision.replace('_', ' ')}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{latestReview?.reviewerId || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => viewDetails(entry)} className="p-1 rounded hover:bg-gray-100 text-gray-600" title="View Details"><i className="fas fa-eye text-xs" /></button>
                            <button onClick={() => viewHistory(entry)} className="p-1 rounded hover:bg-gray-100 text-blue-600" title="View History"><i className="fas fa-history text-xs" /></button>
                            {revStatus !== 'COMPLETED' ? (
                              <>
                                {latestReview ? (
                                  <button onClick={() => openEditReview(entry, latestReview)} className="p-1 rounded hover:bg-gray-100 text-amber-600" title="Edit Review"><i className="fas fa-edit text-xs" /></button>
                                ) : (
                                  <button onClick={() => openAddReview(entry)} className="p-1 rounded hover:bg-gray-100 text-green-600" title="Add Review"><i className="fas fa-plus text-xs" /></button>
                                )}
                                {latestReview && (
                                  <button onClick={() => handleCompleteReview(latestReview.id)} className="p-1 rounded hover:bg-gray-100 text-emerald-600" title="Complete Review"><i className="fas fa-check-circle text-xs" /></button>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400 font-semibold px-2 py-1"><i className="fas fa-lock" /> Locked</span>
                            )}
                            {latestReview && (
                              <button onClick={() => handleDeleteReview(latestReview.id)} className="p-1 rounded hover:bg-red-50 text-red-500" title="Delete Review"><i className="fas fa-trash text-xs" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Dashboard Mode */}
      {subTab === 'dashboard' && dashboardStats && (
        <div className="space-y-6">
          {/* Card Summary Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2"><i className="fas fa-chart-line text-blue-600 text-sm" /></div>
              <p className="text-2xl font-bold text-gray-800">{dashboardStats.totalKpis}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total KPIs</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2"><i className="fas fa-clock text-amber-600 text-sm" /></div>
              <p className="text-2xl font-bold text-gray-800">{dashboardStats.pendingReviews}</p>
              <p className="text-xs text-gray-500 mt-0.5">Pending Reviews</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2"><i className="fas fa-check-circle text-green-600 text-sm" /></div>
              <p className="text-2xl font-bold text-gray-800">{dashboardStats.completedReviews}</p>
              <p className="text-xs text-gray-500 mt-0.5">Completed Reviews</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-2"><i className="fas fa-exclamation-circle text-red-600 text-sm" /></div>
              <p className="text-2xl font-bold text-gray-800">{dashboardStats.overdueActions}</p>
              <p className="text-xs text-gray-500 mt-0.5">Overdue Actions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dept Review Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4"><i className="fas fa-building mr-2 text-green-600" />Department-wise Review Status</h3>
              {Object.keys(dashboardStats.departmentStats || {}).length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-6">No department statistics available.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(dashboardStats.departmentStats).map(([dept, states]: any) => {
                    const completed = states.COMPLETED || states.APPROVED || 0;
                    const pending = states.PENDING_REVIEW || states.UNDER_REVIEW || 0;
                    const total = completed + pending;
                    const pct = total > 0 ? (completed / total) * 100 : 0;
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-600">
                          <span>{dept}</span>
                          <span>{completed} / {total} Completed</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cert Review Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4"><i className="fas fa-certificate mr-2 text-green-600" />Certification-wise Review Status</h3>
              {Object.keys(dashboardStats.certificationStats || {}).length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-6">No certification statistics available.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(dashboardStats.certificationStats).map(([cert, states]: any) => {
                    const completed = states.COMPLETED || states.APPROVED || 0;
                    const total = Object.values(states).reduce((a: any, b: any) => a + b, 0) as number;
                    const pct = total > 0 ? (completed / total) * 100 : 0;
                    return (
                      <div key={cert} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-gray-600">
                          <span>{cert}</span>
                          <span>{completed} / {total} Reviews</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Performance Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4"><i className="fas fa-chart-bar mr-2 text-green-600" />KPI Performance Distribution</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <p className="text-xl font-bold text-green-600">{dashboardStats.performanceDistribution?.ACHIEVED || 0}</p>
                  <p className="text-xs text-green-800 font-semibold mt-0.5">Achieved</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                  <p className="text-xl font-bold text-yellow-600">{dashboardStats.performanceDistribution?.WARNING || 0}</p>
                  <p className="text-xs text-yellow-800 font-semibold mt-0.5">Warning</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <p className="text-xl font-bold text-red-600">{dashboardStats.performanceDistribution?.FAILED || 0}</p>
                  <p className="text-xs text-red-800 font-semibold mt-0.5">Failed</p>
                </div>
              </div>
            </div>

            {/* Action Closure Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4"><i className="fas fa-tools mr-2 text-green-600" />KPI Action Closure Status</h3>
              <div className="flex gap-4 items-center justify-around">
                <div className="text-center">
                  <span className="text-2xl font-bold text-red-600">{dashboardStats.actionClosureStatus?.OPEN || 0}</span>
                  <span className="block text-xs text-gray-500 font-medium">Open</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-600">{dashboardStats.actionClosureStatus?.IN_PROGRESS || 0}</span>
                  <span className="block text-xs text-gray-500 font-medium">In Progress</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-green-600">{dashboardStats.actionClosureStatus?.CLOSED || dashboardStats.actionClosureStatus?.VERIFIED || 0}</span>
                  <span className="block text-xs text-gray-500 font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Review Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4"><i className="fas fa-calendar-alt mr-2 text-green-600" />Upcoming KPI Review Calendar</h3>
            {(!dashboardStats.upcomingCalendar || dashboardStats.upcomingCalendar.length === 0) ? (
              <p className="text-gray-400 text-xs text-center py-6">No upcoming KPI reviews scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase border-b border-gray-100">
                      <th className="px-4 py-2 font-semibold">KPI Code</th>
                      <th className="px-4 py-2 font-semibold">KPI Name</th>
                      <th className="px-4 py-2 font-semibold">Scheduled Date</th>
                      <th className="px-4 py-2 font-semibold">Assigned Reviewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dashboardStats.upcomingCalendar.map((cal: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 font-mono font-bold text-green-700">{cal.kpiCode}</td>
                        <td className="px-4 py-2 font-medium text-gray-800">{cal.kpiName}</td>
                        <td className="px-4 py-2 font-semibold text-gray-600">{cal.nextReviewDate}</td>
                        <td className="px-4 py-2 text-gray-600">{cal.reviewer || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b rounded-t-2xl flex items-center justify-between text-white" style={{ background: BRAND }}>
              <div>
                <h3 className="text-lg font-bold">{editingReview ? "Edit KPI Review" : "Add KPI Review"}</h3>
                <p className="text-xs text-gray-200 mt-0.5">KPI Code: {selectedEntry.kpiMaster?.kpiCode} | {selectedEntry.kpiMaster?.kpiObjective}</p>
              </div>
              <button onClick={() => setShowReviewForm(false)} className="text-white/70 hover:text-white"><i className="fas fa-times text-lg" /></button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Reviewer Name *</label>
                <input value={formReviewerName} onChange={e => setFormReviewerName(e.target.value)} placeholder="Reviewer name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Review Date *</label>
                <input type="date" value={formReviewDate} onChange={e => setFormReviewDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Performance Rating</label>
                <select value={formPerformanceRating} onChange={e => setFormPerformanceRating(e.target.value)} className={inputCls}>
                  <option value="Excellent">Excellent</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Unsatisfactory">Unsatisfactory</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Risk Level</label>
                <select value={formRiskLevel} onChange={e => setFormRiskLevel(e.target.value)} className={inputCls}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Review Decision</label>
                <select value={formReviewDecision} onChange={e => setFormReviewDecision(e.target.value)} className={inputCls}>
                  <option value="Approved">Approved</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Under Monitoring">Under Monitoring</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Next Review Date</label>
                <input type="date" value={formNextReviewDate} onChange={e => setFormNextReviewDate(e.target.value)} className={inputCls} />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelCls}>Management Comments</label>
                <textarea value={formManagementComment} onChange={e => setFormManagementComment(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Enter general comments..." />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelCls}>Strengths</label>
                <textarea value={formStrengths} onChange={e => setFormStrengths(e.target.value)} rows={1} className={`${inputCls} resize-none`} placeholder="Key strengths observed..." />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelCls}>Weaknesses</label>
                <textarea value={formWeaknesses} onChange={e => setFormWeaknesses(e.target.value)} rows={1} className={`${inputCls} resize-none`} placeholder="Area of concern..." />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelCls}>Root Cause</label>
                <textarea value={formRootCause} onChange={e => setFormRootCause(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Why was the target missed / variance observed? (5-Why analysis)..." />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelCls}>Improvement Opportunity</label>
                <textarea value={formImprovementOpportunity} onChange={e => setFormImprovementOpportunity(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Opportunities for improvement..." />
              </div>

              <div className="md:col-span-2 lg:col-span-3 border-t border-gray-100 pt-3">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Action Assignment (CAPA)</h4>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelCls}>Corrective Action Required</label>
                <textarea value={formCorrectiveAction} onChange={e => setFormCorrectiveAction(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Actions to correct the deviation..." />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelCls}>Preventive Action Required</label>
                <textarea value={formPreventiveAction} onChange={e => setFormPreventiveAction(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Actions to prevent recurrence..." />
              </div>
              <div>
                <label className={labelCls}>Responsible Person</label>
                <input value={formResponsiblePerson} onChange={e => setFormResponsiblePerson(e.target.value)} placeholder="Action owner" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Action Target Completion Date</label>
                <input type="date" value={formTargetCompletionDate} onChange={e => setFormTargetCompletionDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select value={formPriority} onChange={e => setFormPriority(e.target.value)} className={inputCls}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-3 border-t border-gray-100 pt-3">
                <label className={labelCls}>Upload Supporting Documents</label>
                <input type="file" onChange={e => setFormAttachment(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                {editingReview?.attachmentPath && (
                  <p className="text-xs text-gray-500 mt-1"><i className="fas fa-paperclip mr-1" /> Current Attachment: {editingReview.attachmentPath}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-2 justify-end">
              <button onClick={() => setShowReviewForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSaveDraft} className="px-4 py-2 border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm font-semibold">Save Draft</button>
              <button onClick={handleSubmitReview} className="px-5 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold">Submit Review</button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Details Popup */}
      {showDetailsPopup && selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between text-white" style={{ background: BRAND }}>
              <h3 className="text-lg font-bold">KPI Details & Trend: {selectedEntry.kpiMaster?.kpiCode}</h3>
              <button onClick={() => setShowDetailsPopup(false)} className="text-white/70 hover:text-white"><i className="fas fa-times text-lg" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Target Value</p>
                  <p className="text-lg font-bold text-gray-800">{selectedEntry.kpiMaster?.targetValue} {selectedEntry.kpiMaster?.unit}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Actual Value</p>
                  <p className="text-lg font-bold text-gray-800">{selectedEntry.actualValue ?? '—'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Achievement %</p>
                  <p className="text-lg font-bold text-green-600">{selectedEntry.achievementPercent ? `${selectedEntry.achievementPercent}%` : '—'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Owner</p>
                  <p className="text-xs font-bold text-gray-800 truncate">{selectedEntry.enteredBy || '—'}</p>
                </div>
              </div>

              {/* Simple Sparkline/Trend graph representation */}
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                <h4 className="text-xs font-bold text-gray-700 mb-3"><i className="fas fa-chart-line mr-2 text-green-600" />Monthly Performance Trend</h4>
                <div className="flex gap-4 items-end h-28 pt-4 justify-between border-b border-gray-300">
                  {getTrendDataPoints(selectedEntry.kpiMaster?.id).map((pt, idx) => {
                    const val = Number(pt.value || 0);
                    const maxVal = Math.max(...getTrendDataPoints(selectedEntry.kpiMaster?.id).map(p => Number(p.value || 0)), 1);
                    const barHeight = (val / maxVal) * 80; // max 80px
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <span className="text-[10px] text-gray-500 mb-1 font-semibold">{val}</span>
                        <div className="w-8 bg-green-500 hover:bg-green-600 rounded-t transition-all" style={{ height: `${barHeight}px` }} />
                        <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold">{pt.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Supporting evidence */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700">Evidence & Supporting Documents</h4>
                {selectedEntry.remarks ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
                    <i className="fas fa-comment-dots mr-2 text-blue-500" />
                    <strong>Monthly entry remarks:</strong> {selectedEntry.remarks}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No entry comments or remarks provided.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Popup */}
      {showHistoryPopup && selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between text-white" style={{ background: BRAND }}>
              <div>
                <h3 className="text-lg font-bold">Review History</h3>
                <p className="text-xs text-gray-200 mt-0.5">{selectedEntry.kpiMaster?.kpiCode} — {selectedEntry.kpiMaster?.kpiObjective}</p>
              </div>
              <button onClick={() => setShowHistoryPopup(false)} className="text-white/70 hover:text-white"><i className="fas fa-times text-lg" /></button>
            </div>
            <div className="p-6">
              {historyList.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-400 italic">No previous reviews recorded for this cycle.</p>
              ) : (
                <div className="space-y-4">
                  {historyList.map((hist) => (
                    <div key={hist.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${reviewStatusColor(hist.reviewStatus)}`}>
                          {hist.reviewStatus?.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${decisionBadge(hist.reviewDecision)}`}>
                          {hist.reviewDecision?.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-green-700">Review: {hist.reviewNo}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Reviewed by: <span className="font-semibold text-gray-700">{hist.reviewerId}</span> on {hist.reviewDate}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                        {hist.managementComment && (
                          <div className="col-span-2">
                            <span className="text-gray-400 font-semibold block">Comments:</span>
                            <span className="text-gray-700">{hist.managementComment}</span>
                          </div>
                        )}
                        {hist.correctiveAction && (
                          <div>
                            <span className="text-rose-500 font-bold block">Corrective Action Assigned:</span>
                            <span className="text-gray-700">{hist.correctiveAction}</span>
                            {hist.responsiblePerson && <span className="block text-[10px] text-gray-500 mt-0.5">Owner: {hist.responsiblePerson} | Due: {hist.targetCompletionDate}</span>}
                          </div>
                        )}
                        {hist.preventiveAction && (
                          <div>
                            <span className="text-blue-500 font-bold block">Preventive Action:</span>
                            <span className="text-gray-700">{hist.preventiveAction}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
