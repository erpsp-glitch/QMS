import { useEffect, useState } from "react";
import { dashboardApi, auditApi, activityApi } from "../../api/qms.api";
import type { NC, ActivityLog } from "./types";

const BRAND = "#280882";
const ACCENT = "#f59e0b";

interface Stats {
  totalDocuments: number;
  totalKpis: number;
  openNc: number;
  totalAudits: number;
  pendingActions: number;
  upcomingMrm: number;
  totalCertifications: number;
  activeUsers: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bg: string;
  
}

function StatCard({ label, value, icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-gray-100">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <i className={`${icon} text-xl`} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

const ACTION_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  CREATED:  { icon: "fas fa-plus-circle",      color: "#10b981", bg: "#d1fae5" },
  UPDATED:  { icon: "fas fa-edit",             color: "#3b82f6", bg: "#dbeafe" },
  DELETED:  { icon: "fas fa-trash",            color: "#ef4444", bg: "#fee2e2" },
  APPROVED: { icon: "fas fa-check-circle",     color: "#10b981", bg: "#d1fae5" },
  CLOSED:   { icon: "fas fa-lock",             color: "#6b7280", bg: "#f3f4f6" },
  UPLOADED: { icon: "fas fa-upload",           color: "#8b5cf6", bg: "#ede9fe" },
  LOGIN:    { icon: "fas fa-sign-in-alt",      color: "#f59e0b", bg: "#fef3c7" },
  LOGOUT:   { icon: "fas fa-sign-out-alt",     color: "#f59e0b", bg: "#fef3c7" },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [openNcs, setOpenNcs] = useState<NC[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      auditApi.getOpenNcs(),
      activityApi.getRecent(20),
    ])
      .then((result) => {
        const [s, ncs, acts] = result as [Stats, NC[], ActivityLog[]];
        setStats(s);
        setOpenNcs(ncs);
        setActivity(acts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl" style={{ color: BRAND }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">QMS Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">DaSsk QMS Services — Overview</p>
        </div>
        <span className="text-xs text-gray-400">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Certifications" value={stats?.totalCertifications ?? 0} icon="fas fa-certificate" color={BRAND} bg="#ede9fe" />
        <StatCard label="Total Documents" value={stats?.totalDocuments ?? 0} icon="fas fa-file-alt" color="#0ea5e9" bg="#e0f2fe" />
        <StatCard label="Open NCs" value={stats?.openNc ?? 0} icon="fas fa-exclamation-triangle" color="#ef4444" bg="#fee2e2" />
        <StatCard label="KPI Masters" value={stats?.totalKpis ?? 0} icon="fas fa-chart-line" color="#10b981" bg="#d1fae5" />
        <StatCard label="Total Audits" value={stats?.totalAudits ?? 0} icon="fas fa-calendar-check" color="#8b5cf6" bg="#ede9fe" />
        <StatCard label="Upcoming MRMs" value={stats?.upcomingMrm ?? 0} icon="fas fa-users" color="#f97316" bg="#ffedd5" />
        <StatCard label="Pending Actions" value={stats?.pendingActions ?? 0} icon="fas fa-tasks" color={ACCENT} bg="#fef3c7" />
        <StatCard label="Active Users" value={stats?.activeUsers ?? 0} icon="fas fa-user-check" color="#6b7280" bg="#f3f4f6" />
      </div>

      {/* Open NCs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-red-500" />
            Open Non-Conformances
          </h2>
          <a href="/audit/nc" className="text-sm font-medium" style={{ color: BRAND }}>View All →</a>
        </div>
        {openNcs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            <i className="fas fa-check-circle text-3xl text-green-400 mb-2 block" />
            No open NCs — great work!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left">NC Number</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Responsible</th>
                  <th className="px-4 py-3 text-left">Target Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {openNcs.map((nc: NC) => (
                  <tr key={nc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: BRAND }}>{nc.ncNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${nc.ncType === "MAJOR" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {nc.ncType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{nc.ncDescription}</td>
                    <td className="px-4 py-3 text-gray-600">{nc.responsiblePerson || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{nc.targetDate || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{nc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <i className="fas fa-history" style={{ color: BRAND }} />
            Recent Activity
          </h2>
          <span className="text-xs text-gray-400">{activity.length} recent actions</span>
        </div>
        {activity.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            <i className="fas fa-history text-3xl mb-2 block opacity-30" />
            No activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {activity.map((item: ActivityLog, idx: number) => {
              const action = ((item as any).action || (item as any).activityType || (item as any).type || "CREATED").toUpperCase();
              const style = ACTION_ICON[action] || { icon: "fas fa-circle", color: BRAND, bg: "#ede9fe" };
              return (
                <div key={item.id ?? idx} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: style.bg }}>
                    <i className={`${style.icon} text-xs`} style={{ color: style.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      {item.description || `${action} — ${item.entityType  || ""}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      {(item.performedBy || item.username ) && (
                        <>
                          <i className="fas fa-user text-[10px]" />
                          <span>{item.performedBy || item.username }</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{timeAgo(item.createdAt || (item as any).performedAt || (item as any).timestamp)}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: style.bg, color: style.color }}>
                    {action}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Add Document", icon: "fas fa-plus-circle", link: "/documents", color: BRAND },
          { label: "KPI Entry", icon: "fas fa-edit", link: "/kpi/entries", color: "#10b981" },
          { label: "New Audit Plan", icon: "fas fa-calendar-plus", link: "/audit/plans", color: "#8b5cf6" },
          { label: "MRM Plans", icon: "fas fa-users", link: "/mrm", color: ACCENT },
        ].map((q) => (
          <a
            key={q.label}
            href={q.link}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <i className={`${q.icon} text-xl`} style={{ color: q.color }} />
            <span className="text-sm font-medium text-gray-700">{q.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
