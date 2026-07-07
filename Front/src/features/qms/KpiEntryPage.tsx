import { useEffect, useState } from "react";
import { kpiApi, certApi, downloadBlob } from "../../api/qms.api";
import type { Certification, KpiMaster, KpiEntry } from "./types";
import { apiMsg } from "./types";

const BRAND = "#280882";
const GREEN = "#16a34a";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTH_LABELS: Record<string, string> = {
  JAN:"January",FEB:"February",MAR:"March",APR:"April",MAY:"May",JUN:"June",
  JUL:"July",AUG:"August",SEP:"September",OCT:"October",NOV:"November",DEC:"December"
};

function calcStatus(actual: number, target: number, direction: string, warn?: number): "ACHIEVED" | "WARNING" | "FAILED" | "NOT_UPDATED" {
  if (actual === undefined || actual === null) return "NOT_UPDATED";
  if (direction === "LOWER_IS_BETTER") {
    if (actual <= target) return "ACHIEVED";
    if (warn && actual <= warn) return "WARNING";
    return "FAILED";
  } else if (direction === "EQUAL") {
    const diff = Math.abs(actual - target);
    if (diff === 0) return "ACHIEVED";
    if (warn && diff <= warn) return "WARNING";
    return "FAILED";
  } else {
    if (actual >= target) return "ACHIEVED";
    if (warn && actual >= warn) return "WARNING";
    return "FAILED";
  }
}

function calcAchievement(actual: number, target: number, direction: string): number {
  if (!target) return 0;
  if (direction === "LOWER_IS_BETTER") return Math.round((target / actual) * 10000) / 100;
  return Math.round((actual / target) * 10000) / 100;
}

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

export default function KpiEntryPage() {
  const currentDate  = new Date();
  const currentYear  = currentDate.getFullYear();
  const currentMonth = MONTHS[currentDate.getMonth()];

  const [certs, setCerts]       = useState<Certification[]>([]);
  const [certId, setCertId]     = useState<number | null>(null);
  const [year, setYear]         = useState(currentYear);
  const [month, setMonth]       = useState(currentMonth);
  const [masters, setMasters]   = useState<KpiMaster[]>([]);
  const [entries, setEntries]   = useState<KpiEntry[]>([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [actuals, setActuals]   = useState<Record<number, string>>({});
  const [remarks, setRemarks]   = useState<Record<number, string>>({});
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    certApi.getAll().then((d: unknown) => setCerts(Array.isArray(d) ? d as Certification[] : [])).catch(() => {});
  }, []);

  const load = async () => {
    if (!certId) return;
    setLoading(true);
    try {
      const [m, e] = await Promise.all([
        kpiApi.getMastersByCert(certId),
        kpiApi.getEntries(certId, year, month),
      ]);
      const mArr = Array.isArray(m) ? m as KpiMaster[] : [];
      const eArr = Array.isArray(e) ? e as KpiEntry[] : [];
      setMasters(mArr.filter((k: KpiMaster) => k.active !== false));
      setEntries(eArr);
      const a: Record<number, string> = {};
      const r: Record<number, string> = {};
      eArr.forEach((en: KpiEntry) => {
        const mid = en.kpiMaster?.id;
        if (mid) { a[mid] = String(en.actualValue ?? ""); r[mid] = en.remarks ?? ""; }
      });
      setActuals(a);
      setRemarks(r);
    } catch {
      setMasters([]);
      setEntries([]);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [certId, year, month]);

  const entryMap: Record<number, KpiEntry> = {};
  entries.forEach((e: KpiEntry) => { if (e.kpiMaster?.id) entryMap[e.kpiMaster.id] = e; });

  const previewStatus = (master: KpiMaster, actualStr: string) => {
    const actual = parseFloat(actualStr);
    if (isNaN(actual)) return "NOT_UPDATED";
    return calcStatus(actual, Number(master.targetValue ?? 0), master.direction || "HIGHER_IS_BETTER",
      Number(master.warningLimit ?? 0));
  };

  const saveEntry = async (masterId: number) => {
    if (!certId) return;
    setSaving(masterId);
    try {
      await kpiApi.saveEntry({
        kpiMaster: { id: masterId },
        year,
        month,
        actualValue: actuals[masterId] ? Number(actuals[masterId]) : null,
        remarks: remarks[masterId] || "",
      });
      await load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed"));
    } finally { setSaving(null); }
  };

  const saveAll = async () => {
    if (!certId) return;
    setSavingAll(true);
    for (const m of masters) {
      if (actuals[m.id] !== undefined && actuals[m.id] !== "") {
        try {
          await kpiApi.saveEntry({
            kpiMaster: { id: m.id },
            year, month,
            actualValue: Number(actuals[m.id]),
            remarks: remarks[m.id] || "",
          });
        } catch { /* continue */ }
      }
    }
    await load();
    setSavingAll(false);
  };

  const downloadReport = async () => {
    if (!certId) { alert("Select certification first."); return; }
    setDownloading(true);
    try {
      const res = await kpiApi.downloadReport(certId, year, month);
      downloadBlob((res as { data: Blob }).data, `KPI_Report_${month}_${year}.pdf`);
    } catch { alert("Download failed"); } finally { setDownloading(false); }
  };

  const achieved  = masters.filter(m => (entryMap[m.id]?.status === "ACHIEVED")).length;
  const warning   = masters.filter(m => ["WARNING","PENDING"].includes(entryMap[m.id]?.status ?? "")).length;
  const failed    = masters.filter(m => ["FAILED","BELOW_TARGET"].includes(entryMap[m.id]?.status ?? "")).length;
  

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold text-gray-800">Monthly KPI Entry</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={certId || ""} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">— Select Certification —</option>
              {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {MONTHS.map(m => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y}>{y}</option>)}
            </select>
            <button onClick={downloadReport} disabled={!certId || downloading}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              <i className="fas fa-file-pdf text-xs text-red-500" /> Report
            </button>
          </div>
        </div>

        {/* Summary */}
        {certId && masters.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: "Total KPIs", val: masters.length, color: BRAND },
              { label: "🟢 Achieved", val: achieved,  color: "#16a34a" },
              { label: "🟡 Warning",  val: warning,   color: "#d97706" },
              { label: "🔴 Failed",   val: failed,    color: "#dc2626" },
            ].map(c => (
              <div key={c.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold" style={{ color: c.color }}>{c.val}</div>
                <div className="text-xs text-gray-500">{c.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPI Entry Table */}
      {!certId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center text-gray-400">
          <i className="fas fa-chart-bar text-4xl mb-3 opacity-20" /><br />
          Select a certification to enter KPI data.
        </div>
      ) : loading ? (
        <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: GREEN }} /></div>
      ) : masters.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-12 text-center text-gray-400">
          No KPI masters found for this certification. Add KPIs in KPI Objective Master first.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">
              KPI Entry — {MONTH_LABELS[month]} {year}
            </span>
            <button onClick={saveAll} disabled={savingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
              style={{ background: GREEN }}>
              {savingAll ? <><i className="fas fa-spinner fa-spin mr-1" />Saving...</> : <><i className="fas fa-save mr-1" />Save All</>}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {["#","KPI Code","KPI Objective","Dept","Target","Dir","Actual","Achievement%","Status","Remarks","Save"].map(h => (
                  <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {masters.map((m: KpiMaster, i: number) => {
                const entry   = entryMap[m.id];
                const actStr  = actuals[m.id] ?? "";
                const preview = actStr !== "" ? previewStatus(m, actStr) : (entry?.status || "NOT_UPDATED");
                const ach     = actStr && m.targetValue
                  ? calcAchievement(
parseFloat(actStr),
Number(m.targetValue ?? 0),
m.direction || "HIGHER_IS_BETTER"
)
                  : (entry?.achievementPercent || null);
                return (
                  <tr key={m.id} className={`${preview === "ACHIEVED" ? "bg-green-50/20" : preview === "WARNING" ? "bg-yellow-50/20" : preview === "FAILED" ? "bg-red-50/20" : ""} hover:opacity-90`}>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold" style={{ color: GREEN }}>{m.kpiCode}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[160px] truncate">{m.kpiObjective || m.title}</td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{m.department?.name || "—"}</td>
                    <td className="px-3 py-2.5 font-bold text-gray-700">
                      {m.direction === "LOWER_IS_BETTER" ? "≤" : "≥"}{m.targetValue} {m.unit}
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">
                      {m.direction === "HIGHER_IS_BETTER" ? "▲" : m.direction === "LOWER_IS_BETTER" ? "▼" : "="}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={actStr}
                        onChange={e => setActuals(prev => ({ ...prev, [m.id]: e.target.value }))}
                        placeholder={`Enter ${m.unit}`}
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-semibold"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold text-sm">
                      {ach !== null ? `${ach}%` : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[preview]}`}>
                        {STATUS_EMOJI[preview]} {preview.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={remarks[m.id] ?? ""}
                        onChange={e => setRemarks(prev => ({ ...prev, [m.id]: e.target.value }))}
                        placeholder="Remarks..."
                        className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => saveEntry(m.id)} disabled={saving === m.id}
                        className="p-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50"
                        style={{ background: GREEN }}>
                        {saving === m.id ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-save" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Failed KPIs alert */}
          {failed > 0 && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2">
                <i className="fas fa-exclamation-triangle" />
                {failed} KPI{failed > 1 ? "s" : ""} Failed — Corrective Action Required
              </div>
              <div className="space-y-1">
                {masters.filter(m => ["FAILED","BELOW_TARGET"].includes(entryMap[m.id]?.status ?? "")).map(m => (
                  <div key={m.id} className="text-xs text-red-600 flex items-center gap-2">
                    <span className="font-mono font-semibold">{m.kpiCode}</span>
                    <span>{m.kpiObjective || m.title}</span>
                    <span>— Actual: {actuals[m.id] || entryMap[m.id]?.actualValue} | Target: {m.targetValue} {m.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
