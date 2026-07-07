import { useEffect, useState } from "react";
import { kpiApi, certApi, deptApi, employeeApi } from "../../api/qms.api";
import type { KpiMaster, Certification, Department, Employee, CertRef, DeptRef, InputChg } from "./types";
import { apiMsg } from "./types";
import { exportCSV } from "../master-data/chartUtils";
import { FiAlertTriangle, FiTrash2, FiEye, FiX } from "react-icons/fi";


const GREEN = "#16a34a";
const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";
const lc = "block text-xs font-medium text-gray-600 mb-1";

const KPI_TYPES  = ["PERCENTAGE","NUMBER","RATIO","DAYS","COST"];
const FREQS      = ["MONTHLY","QUARTERLY","HALF_YEARLY","ANNUALLY"];
const CATEGORIES = ["QUALITY","DELIVERY","PRODUCTION","HR","PURCHASE","MAINTENANCE","SAFETY","SALES","ENVIRONMENT","CUSTOMER"];
const DIRECTIONS = [
  { val: "HIGHER_IS_BETTER", label: "Higher is Better (▲)" },
  { val: "LOWER_IS_BETTER",  label: "Lower is Better (▼)" },
  { val: "EQUAL",            label: "Equal to Target (=)"  },
];
const DATA_SOURCES = ["MANUAL","SYSTEM","IMPORT"];

const CURRENT_YEAR = new Date().getFullYear();
const FY_OPTIONS   = [`${CURRENT_YEAR-1}-${CURRENT_YEAR}`, `${CURRENT_YEAR}-${CURRENT_YEAR+1}`, `${CURRENT_YEAR+1}-${CURRENT_YEAR+2}`];

const EMPTY: Partial<KpiMaster> = {
  kpiObjective: "", kpiCategory: "QUALITY",
  kpiType: "PERCENTAGE", unit: "%", frequency: "MONTHLY",
  financialYear: `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`,
  targetValue: "", direction: "HIGHER_IS_BETTER",
  warningLimit: "", criticalLimit: "",
  dataSource: "MANUAL", calculationFormula: "",
  responsiblePerson: "", monitoringPerson: "",
  active: true, certification: null as CertRef | null, department: null as DeptRef | null,
};

export default function KpiMasterPage() {
  const [rows, setRows]         = useState<KpiMaster[]>([]);
  const [certs, setCerts]       = useState<Certification[]>([]);
  const [depts, setDepts]       = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [certId, setCertId]     = useState<number | null>(null);
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<KpiMaster | null>(null);
  const [form, setForm]         = useState<Partial<KpiMaster>>({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewItem, setViewItem] = useState<KpiMaster | null>(null);

  const load = () => {
    setLoading(true);
    const p = certId ? kpiApi.getMastersByCert(certId) : kpiApi.getMasters();
    p.then((d: unknown) => setRows(Array.isArray(d) ? d as KpiMaster[] : [])).catch(() => setRows([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.allSettled([certApi.getAll(), deptApi.getAll(), employeeApi.getAll()])
      .then(([cRes, dRes, eRes]) => {
        setCerts(cRes.status === "fulfilled" ? (Array.isArray(cRes.value) ? cRes.value as Certification[] : []) : []);
        setDepts(dRes.status === "fulfilled" ? (Array.isArray(dRes.value) ? dRes.value as Department[] : []) : []);
        setEmployees(eRes.status === "fulfilled" ? (Array.isArray(eRes.value) ? eRes.value as Employee[] : []) : []);
      });
  }, []);
  useEffect(() => { load(); }, [certId]);

  const openAdd  = () => { setEditing(null); setForm({ ...EMPTY, certification: certId ? { id: certId } : null }); setShowModal(true); };
  const openEdit = (r: KpiMaster) => {
    setEditing(r);
    setForm({ ...r, kpiObjective: r.kpiObjective || r.kpiCode, kpiType: r.kpiType });
    setShowModal(true);
  };

  const f  = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as Partial<KpiMaster>));
  const fn = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value ? Number(e.target.value) : "" } as Partial<KpiMaster>));

  const save = async (addNew = false) => {
    if (!form.kpiObjective?.trim()) { alert("KPI Objective is required."); return; }
    if (!form.certification?.id)    { alert("Certification is required."); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.kpiObjective,
        kpiObjective: form.kpiObjective,
        kpiType: form.kpiType,
        type: form.kpiType,
        targetValue:  form.targetValue  ? Number(form.targetValue)  : null,
        warningLimit: form.warningLimit ? Number(form.warningLimit) : null,
        criticalLimit:form.criticalLimit? Number(form.criticalLimit): null,
      };
      if (editing) await kpiApi.updateMaster(editing.id, payload);
      else          await kpiApi.createMaster(payload);
      if (addNew) { setEditing(null); setForm({ ...EMPTY, certification: certId ? { id: certId } : null }); }
      else setShowModal(false);
      load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed"));
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    try { await kpiApi.deleteMaster(id); setDeleteId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
  };

  const empNames = employees.filter((e: Employee) => e.status === "ACTIVE")
    .map((e: Employee) => `${e.firstName} ${e.lastName}`).sort();

  const filtered = rows.filter(r => {
    const obj = r.kpiObjective || r.title || "";
    const matchSearch = !search || obj.toLowerCase().includes(search.toLowerCase()) || r.kpiCode?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !catFilter || r.kpiCategory === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">KPI Objective Master</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={certId || ""} onChange={e => setCertId(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="">All Certifications</option>
            {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search KPIs..."
              className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none w-44" />
            <i className="fas fa-search absolute left-2.5 top-2.5 text-gray-400 text-xs" />
          </div>
          <button onClick={() => exportCSV(
  "kpi_masters.csv",
  [
    "Code",
    "Objective",
    "Category",
    "Department",
    "Target",
    "Unit",
    "Direction",
    "Warning",
    "Critical"
  ],
  rows.map(r => [
    r.kpiCode,
    r.kpiObjective || r.title,
    r.kpiCategory,
    r.department?.name,
    r.targetValue,
    r.unit,
    r.direction,
    r.warningLimit,
    r.criticalLimit
  ])
)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <i className="fas fa-download text-xs" /> Export
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: GREEN }}>
            <i className="fas fa-plus" /> New KPI
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: GREEN }} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No KPI masters found. Add KPIs to track performance.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {["#","Code","Objective","Category","Dept","Target","Unit","Direction","Limits","Freq",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r: KpiMaster, i: number) => (
                <tr key={r.id} className="hover:bg-green-50/20">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: GREEN }}>{r.kpiCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{r.kpiObjective || r.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{r.kpiCategory || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.department?.name || "—"}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{r.targetValue ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{r.unit || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {r.direction === "HIGHER_IS_BETTER" ? "▲" : r.direction === "LOWER_IS_BETTER" ? "▼" : "="}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {r.warningLimit  && <span className="text-yellow-600 mr-1">🟡{r.warningLimit}</span>}
                    {r.criticalLimit && <span className="text-red-600">🔴{r.criticalLimit}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{r.frequency}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewItem(r)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600" title="View">
                        <FiEye className="text-xs" />
                      </button>
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-green-100 text-green-700" title="Edit">
                        <i className="fas fa-edit text-xs" />
                      </button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded hover:bg-red-100 text-red-500" title="Delete">
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View KPI Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}>
              <div>
                <h2 className="text-lg font-bold">KPI Details</h2>
                <p className="text-green-200 text-xs font-mono mt-0.5">{viewItem.kpiCode}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-3 text-sm">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">{viewItem.kpiObjective || viewItem.title}</p>
                {viewItem.objective && <p className="text-gray-500 text-xs mt-1">{viewItem.objective}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Code", viewItem.kpiCode || "—"],
                  ["Category", viewItem.kpiCategory || "—"],
                  ["Department", viewItem.department?.name || "—"],
                  ["Financial Year", viewItem.financialYear || "—"],
                  ["KPI Type", viewItem.kpiType || "—"],
                  ["Unit", viewItem.unit || "—"],
                  ["Frequency", viewItem.frequency || "—"],
                  ["Data Source", viewItem.dataSource || "—"],
                  ["Target Value", viewItem.targetValue != null ? String(viewItem.targetValue) : "—"],
                  ["Direction", (viewItem.direction || "—").replace(/_/g, " ")],
                  ["Warning Limit", viewItem.warningLimit != null ? String(viewItem.warningLimit) : "—"],
                  ["Critical Limit", viewItem.criticalLimit != null ? String(viewItem.criticalLimit) : "—"],
                  ["Responsible", viewItem.responsiblePerson || "—"],
                  ["Monitoring", viewItem.monitoringPerson || "—"],
                  ["Status", viewItem.active !== false ? "Active" : "Inactive"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="font-semibold text-gray-800 text-xs">{value}</p>
                  </div>
                ))}
              </div>
              {viewItem.calculationFormula && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Calculation Formula</p>
                  <p className="text-gray-700 text-xs font-mono">{viewItem.calculationFormula}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setViewItem(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Close</button>
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: GREEN }}>
                <i className="fas fa-edit mr-1" /> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete KPI Master</h3>
                <p className="text-sm text-gray-500">This will also remove all KPI entries for this KPI.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this KPI master? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={() => del(deleteId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4"
              style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)`, borderRadius: "16px 16px 0 0" }}>
              <h2 className="text-lg font-semibold text-white">{editing ? "Edit KPI" : "New KPI Objective"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white text-xl"><i className="fas fa-times" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Certification & Dept */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50/30 rounded-xl border border-green-100">
                <h3 className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Certification & Department</h3>
                <div>
                  <label className={lc}>Certification *</label>
                  <select value={form.certification?.id || ""} onChange={e => setForm(p => ({ ...p, certification: e.target.value ? { id: Number(e.target.value) } : null } as Partial<KpiMaster>))} className={ic}>
                    <option value="">— Select —</option>
                    {certs.map((c: Certification) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Department</label>
                  <select value={form.department?.id || ""} onChange={e => setForm(p => ({ ...p, department: e.target.value ? { id: Number(e.target.value) } : null } as Partial<KpiMaster>))} className={ic}>
                    <option value="">— Select —</option>
                    {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Financial Year *</label>
                  <select value={form.financialYear} onChange={f("financialYear")} className={ic}>
                    {FY_OPTIONS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>KPI Category *</label>
                  <select value={form.kpiCategory} onChange={f("kpiCategory")} className={ic}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* KPI Definition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50/30 rounded-xl border border-purple-100">
                <h3 className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-widest">KPI Definition</h3>
                <div className="md:col-span-2">
                  <label className={lc}>KPI Objective *</label>
                  <input value={form.kpiObjective} onChange={f("kpiObjective")} className={ic} placeholder="e.g. Rejection Rate, Training Completion..." />
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Description</label>
                  <textarea value={form.objective} onChange={f("objective")} rows={2} className={ic} placeholder="Detailed description..." />
                </div>
                <div>
                  <label className={lc}>KPI Type *</label>
                  <select value={form.kpiType} onChange={f("kpiType")} className={ic}>
                    {KPI_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Unit (UOM) *</label>
                  <input value={form.unit} onChange={f("unit")} className={ic} placeholder="%, PPM, Nos, Days, Rs" />
                </div>
                <div>
                  <label className={lc}>Frequency *</label>
                  <select value={form.frequency} onChange={f("frequency")} className={ic}>
                    {FREQS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Data Source</label>
                  <select value={form.dataSource} onChange={f("dataSource")} className={ic}>
                    {DATA_SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Calculation Formula</label>
                  <input value={form.calculationFormula} onChange={f("calculationFormula")} className={ic} placeholder="(Total Rejected / Total Inspected) × 100" />
                </div>
              </div>

              {/* Target & Limits */}
              <div className="p-4 bg-yellow-50/30 rounded-xl border border-yellow-100 space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target & Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Target Value *</label>
                    <input type="number" value={form.targetValue} onChange={fn("targetValue")} className={ic} placeholder="2.0" />
                  </div>
                  <div>
                    <label className={lc}>Direction *</label>
                    <select value={form.direction} onChange={f("direction")} className={ic}>
                      {DIRECTIONS.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Warning Limit 🟡 (Yellow)</label>
                    <input type="number" value={form.warningLimit} onChange={fn("warningLimit")} className={ic} placeholder="2.5" />
                  </div>
                  <div>
                    <label className={lc}>Critical Limit 🔴 (Red)</label>
                    <input type="number" value={form.criticalLimit} onChange={fn("criticalLimit")} className={ic} placeholder="3.0" />
                  </div>
                </div>
                {form.targetValue !== "" && (
                  <div className="bg-white border border-green-200 rounded-lg p-3 text-xs space-y-1">
                    <div className="font-semibold text-gray-700 mb-1">Status Logic:</div>
                    {form.direction === "LOWER_IS_BETTER" ? (
                      <>
                        <div className="text-green-700">🟢 Actual ≤ {form.targetValue} {form.unit} → Achieved</div>
                        {form.warningLimit && <div className="text-yellow-700">🟡 Actual {form.targetValue}–{form.warningLimit} {form.unit} → Warning</div>}
                        {form.criticalLimit && <div className="text-red-700">🔴 Actual ≥ {form.criticalLimit} {form.unit} → Failed</div>}
                      </>
                    ) : (
                      <>
                        <div className="text-green-700">🟢 Actual ≥ {form.targetValue} {form.unit} → Achieved</div>
                        {form.warningLimit && <div className="text-yellow-700">🟡 Actual {form.warningLimit}–{form.targetValue} {form.unit} → Warning</div>}
                        {form.criticalLimit && <div className="text-red-700">🔴 Actual ≤ {form.criticalLimit} {form.unit} → Failed</div>}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Responsibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                <h3 className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Responsibility</h3>
                <div>
                  <label className={lc}>Responsible Person *</label>
                  <select value={form.responsiblePerson || ""} onChange={f("responsiblePerson")} className={ic}>
                    <option value="">— Select —</option>
                    {empNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Monitoring Person</label>
                  <select value={form.monitoringPerson || ""} onChange={f("monitoringPerson")} className={ic}>
                    <option value="">— Select —</option>
                    {empNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Status</label>
                  <div className="flex gap-4 pt-1">
                    {[true, false].map(v => (
                      <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="kpiStatus" value={String(v)} checked={form.active === v}
                          onChange={() => setForm(p => ({ ...p, active: v } as Partial<KpiMaster>))} style={{ accentColor: GREEN }} />
                        <span className="text-sm text-gray-700">{v ? "Active" : "Inactive"}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => save(true)} disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-60"
                style={{ borderColor: GREEN, color: GREEN }}>Save & New</button>
              <button onClick={() => save(false)} disabled={saving}
                className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: GREEN }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-2" />Saving...</> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
