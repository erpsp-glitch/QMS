import { useEffect, useState } from "react";
import { certApi } from "../../api/qms.api";
import { exportCSV, formatDate, daysUntil } from "../master-data/chartUtils";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import type { Certification, InputChg } from "./types";
import { apiMsg } from "./types";

const BRAND = "#280882";

const CERT_PRESETS = [
  { name: "ISO 9001:2015",   code: "ISO9001",  stdName: "ISO 9001",    stdVersion: "2015",  stdType: "Quality Management",      clauses: "Clause 4 - Context,Clause 5 - Leadership,Clause 6 - Planning,Clause 7 - Support,Clause 8 - Operation,Clause 9 - Performance Evaluation,Clause 10 - Improvement" },
  { name: "AS9100D",         code: "AS9100",   stdName: "AS9100",      stdVersion: "Rev D", stdType: "Aerospace Quality",        clauses: "Clause 4 - Context,Clause 5 - Leadership,Clause 6 - Planning,Clause 7 - Support,Clause 8 - Operation,Clause 9 - Performance Evaluation,Clause 10 - Improvement" },
  { name: "ISO 14001:2015",  code: "ISO14001", stdName: "ISO 14001",   stdVersion: "2015",  stdType: "Environmental Management", clauses: "Clause 4 - Context,Clause 5 - Leadership,Clause 6 - Planning,Clause 7 - Support,Clause 8 - Operation,Clause 9 - Performance Evaluation,Clause 10 - Improvement" },
  { name: "ISO 45001:2018",  code: "ISO45001", stdName: "ISO 45001",   stdVersion: "2018",  stdType: "Safety Management",        clauses: "Clause 4 - Context,Clause 5 - Leadership,Clause 6 - Planning,Clause 7 - Support,Clause 8 - Operation,Clause 9 - Performance Evaluation,Clause 10 - Improvement" },
  { name: "ISO 27001:2022",  code: "ISO27001", stdName: "ISO 27001",   stdVersion: "2022",  stdType: "Information Security",     clauses: "Clause 4 - Context,Clause 5 - Leadership,Clause 6 - Planning,Clause 7 - Support,Clause 8 - Operation,Clause 9 - Performance Evaluation,Clause 10 - Improvement" },
  { name: "IATF 16949:2016", code: "IATF16949",stdName: "IATF 16949", stdVersion: "2016",  stdType: "Automotive Quality",       clauses: "Clause 4 - Context,Clause 5 - Leadership,Clause 6 - Planning,Clause 7 - Support,Clause 8 - Operation,Clause 9 - Performance Evaluation,Clause 10 - Improvement" },
  { name: "ISO 22163:2023",  code: "ISO22163", stdName: "ISO 22163",   stdVersion: "2023",  stdType: "Railway Quality",          clauses: "Clause 4 - Context,Clause 5 - Leadership,Clause 6 - Planning,Clause 7 - Support,Clause 8 - Operation,Clause 9 - Performance Evaluation,Clause 10 - Improvement" },
];

const BODIES   = ["BSI", "TUV", "DNV", "LRQA", "SGS", "Bureau Veritas", "Intertek", "NQA", "Perry Johnson", "Other"];
const STD_TYPES = ["Quality Management", "Environmental Management", "Safety Management", "Information Security", "Aerospace Quality", "Automotive Quality", "Railway Quality"];
const SECTORS  = ["Aerospace", "Automotive", "Medical", "General", "Railway", "Oil & Gas", "Food Safety", "IT Services"];
const ALL_CLAUSES = [
  "Clause 4 - Context",
  "Clause 5 - Leadership",
  "Clause 6 - Planning",
  "Clause 7 - Support",
  "Clause 8 - Operation",
  "Clause 9 - Performance Evaluation",
  "Clause 10 - Improvement",
];

const EMPTY_FORM: Partial<Certification> = {
  code: "", name: "", standardName: "", standardVersion: "", standardType: "", industrySector: "",
  certificationBody: "", certificateNumber: "", scope: "",
  applicableClauses: "", reminderSettings: "30",
  issueDate: "", expiryDate: "", surveillanceDate: "", renewalDate: "",
  status: "ACTIVE",
};

const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600";
const lc = "block text-xs font-medium text-gray-600 mb-1";

export default function CertificationPage() {
  const [rows, setRows]         = useState<Certification[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Certification | null>(null);
  const [form, setForm]         = useState<Partial<Certification>>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    certApi.getAll().then((d: unknown) => setRows(Array.isArray(d) ? d as Certification[] : [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setSelectedClauses([]);
    setShowModal(true);
  };
  const openEdit = (r: Certification) => {
    setEditing(r);
    setForm({ ...r });
    const clauses = r.applicableClauses
      ? r.applicableClauses.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
    setSelectedClauses(clauses);
    setShowModal(true);
  };

  const onPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = CERT_PRESETS.find(p => p.name === e.target.value);
    if (!preset) return;
    const clauses = preset.clauses.split(",").map(s => s.trim());
    setSelectedClauses(clauses);
    setForm(p => ({
      ...p,
      name: preset.name,
      code: preset.code,
      standardName: preset.stdName,
      standardVersion: preset.stdVersion,
      standardType: preset.stdType,
      applicableClauses: preset.clauses,
    }));
  };

  const toggleClause = (c: string) => {
    setSelectedClauses(prev => {
      const next = prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c];
      setForm(p => ({ ...p, applicableClauses: next.join(",") }));
      return next;
    });
  };

  const f = (k: string) => (e: InputChg) =>
    setForm(p => ({ ...p, [k]: e.target.value } as Partial<Certification>));

  const save = async (addNew = false) => {
    if (!form.code?.trim() || !form.name?.trim()) {
      alert("Certification Code and Name are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) await certApi.update(editing.id, form);
      else await certApi.create(form);
      if (addNew) { setEditing(null); setForm({ ...EMPTY_FORM }); setSelectedClauses([]); }
      else setShowModal(false);
      load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed"));
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    try { await certApi.delete(id); setDeleteId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
  };

  const filtered = rows.filter(r =>
    !search ||
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.code?.toLowerCase().includes(search.toLowerCase()) ||
    r.certificationBody?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) =>
    s === "ACTIVE"   ? "bg-green-100 text-green-700" :
    s === "EXPIRED"  ? "bg-red-100 text-red-700"     :
    s === "SUSPENDED"? "bg-yellow-100 text-yellow-700" :
    "bg-gray-100 text-gray-500";

  const expiryTag = (expDate: string) => {
    const d = daysUntil(expDate);
    if (!isFinite(d)) return null;
    if (d < 0) return <span className="ml-1 text-xs font-semibold text-red-600">(Expired)</span>;
    if (d <= 30) return <span className="ml-1 text-xs font-semibold text-orange-500">({d}d left ⚠)</span>;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Certification Master</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search certifications..." className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 w-56" />
            <i className="fas fa-search absolute left-2.5 top-2.5 text-gray-400 text-xs" />
          </div>
          <button onClick={() => exportCSV(rows, "certifications.csv")}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <i className="fas fa-download text-xs" /> Export
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: BRAND }}>
            <i className="fas fa-plus" /> New Certification
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No certifications found. Click "New Certification" to add one.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {["#","Cert Code","Name","Standard","Body","Cert No.","Issue","Expiry","Status",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r: Certification, i: number) => (
                <tr key={r.id} className="hover:bg-purple-50/30">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold font-mono text-[13px]" style={{ color: BRAND }}>{r.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.standardName || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{r.certificationBody || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.certificateNumber || "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(r.issueDate)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(r.expiryDate)}{expiryTag(r.expiryDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-purple-100 text-purple-600" title="Edit">
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

      {/* Create/Edit Modal */}
      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Certification</h3>
                <p className="text-sm text-gray-500">This will also delete all linked audits, KPIs, and NC records.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this certification? This action cannot be undone.</p>
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
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: BRAND, borderRadius: "16px 16px 0 0" }}>
              <h2 className="text-lg font-semibold text-white">{editing ? "Edit Certification" : "Add New Certification"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white text-xl">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Section 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50/40 rounded-xl border border-purple-100">
                <div className="md:col-span-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Basic Information</h3>
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Certification Name * (select preset to auto-fill)</label>
                  <select value={form.name} onChange={onPresetChange} className={ic}>
                    <option value="">— Select Certification —</option>
                    {CERT_PRESETS.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Certification Code *</label>
                  <input value={form.code} onChange={f("code")} placeholder="e.g. ISO9001, AS9100" className={ic} />
                </div>
                <div>
                  <label className={lc}>Standard Name</label>
                  <input value={form.standardName} onChange={f("standardName")} placeholder="e.g. ISO 9001" className={ic} />
                </div>
                <div>
                  <label className={lc}>Standard Version</label>
                  <input value={form.standardVersion} onChange={f("standardVersion")} placeholder="2015 / Rev D / 2018" className={ic} />
                </div>
                <div>
                  <label className={lc}>Standard Type</label>
                  <select value={form.standardType} onChange={f("standardType")} className={ic}>
                    <option value="">Select type</option>
                    {STD_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Industry Sector</label>
                  <select value={form.industrySector} onChange={f("industrySector")} className={ic}>
                    <option value="">Select sector</option>
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Section 2: Certificate Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                <div className="md:col-span-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Certificate Details</h3>
                </div>
                <div>
                  <label className={lc}>Certificate Number *</label>
                  <input value={form.certificateNumber} onChange={f("certificateNumber")} className={ic} />
                </div>
                <div>
                  <label className={lc}>Certification Body</label>
                  <select value={form.certificationBody} onChange={f("certificationBody")} className={ic}>
                    <option value="">Select body</option>
                    {BODIES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={lc}>Scope Description</label>
                  <textarea value={form.scope} onChange={f("scope")} rows={2} className={ic} placeholder="Scope of certification..." />
                </div>
              </div>

              {/* Section 3: Validity Dates */}
              <div className="p-4 bg-green-50/30 rounded-xl border border-green-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Validity Dates</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={lc}>Issue Date *</label>
                    <input type="date" value={form.issueDate || ""} onChange={f("issueDate")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Expiry Date *</label>
                    <input type="date" value={form.expiryDate || ""} onChange={f("expiryDate")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Surveillance Date</label>
                    <input type="date" value={form.surveillanceDate || ""} onChange={f("surveillanceDate")} className={ic} />
                  </div>
                  <div>
                    <label className={lc}>Renewal Date</label>
                    <input type="date" value={form.renewalDate || ""} onChange={f("renewalDate")} className={ic} />
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3">
                  <div>
                    <label className={lc}>Expiry Reminder</label>
                    <select value={form.reminderSettings} onChange={f("reminderSettings")} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      {["30","60","90"].map(d => <option key={d} value={d}>{d} Days Before Expiry</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lc}>Status</label>
                    <select value={form.status} onChange={f("status")} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      {["ACTIVE","EXPIRED","SUSPENDED","INACTIVE"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Applicable Clauses */}
              <div className="p-4 bg-yellow-50/30 rounded-xl border border-yellow-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Applicable Clauses</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_CLAUSES.map(cl => (
                    <label key={cl} className="flex items-center gap-2 cursor-pointer hover:bg-white rounded px-1 py-0.5">
                      <input type="checkbox" checked={selectedClauses.includes(cl)} onChange={() => toggleClause(cl)}
                        style={{ accentColor: BRAND }} className="rounded" />
                      <span className="text-sm text-gray-700">{cl}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => save(true)} disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-60 hover:bg-purple-50"
                style={{ borderColor: BRAND, color: BRAND }}>Save & New</button>
              <button onClick={() => save(false)} disabled={saving}
                className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: BRAND }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-2" />Saving...</> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
