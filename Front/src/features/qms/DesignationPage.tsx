import { useEffect, useState } from "react";
import { designationApi, deptApi } from "../../api/qms.api";
import { exportCSV } from "../master-data/chartUtils";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import type { Designation, Department, InputChg } from "./types";
import { apiMsg } from "./types";

const BRAND = "#280882";
const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600";
const lc = "block text-xs font-medium text-gray-600 mb-1";

const DEFAULT_DESIGNATIONS: Record<string, string[]> = {
  Production:         ["Production Manager","Production Engineer","Supervisor","Operator","Technician"],
  "Quality Assurance":["QA Manager","QA Engineer","QA Inspector","QA Technician","Document Controller"],
  "Human Resources":  ["HR Manager","HR Executive","Training Coordinator","Recruitment Specialist"],
  Purchase:           ["Purchase Manager","Buyer","Vendor Coordinator","Supply Chain Executive"],
  Maintenance:        ["Maintenance Manager","Maintenance Engineer","Electrician","Technician"],
  Sales:              ["Sales Manager","Business Development","Customer Support"],
  Engineering:        ["Engineering Manager","Design Engineer","NPD Engineer"],
};

const EMPTY: Partial<Designation> = { name: "", description: "", department: null, active: true };

export default function DesignationPage() {
  const [rows, setRows]     = useState<Designation[]>([]);
  const [depts, setDepts]   = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Designation | null>(null);
  const [form, setForm]     = useState<Partial<Designation>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    Promise.allSettled([designationApi.getAll(), deptApi.getAll()])
      .then(([dRes, dpRes]) => {
        setRows(dRes.status === "fulfilled" ? (Array.isArray(dRes.value) ? dRes.value as Designation[] : []) : []);
        setDepts(dpRes.status === "fulfilled" ? (Array.isArray(dpRes.value) ? dpRes.value as Department[] : []) : []);
      }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); };
  const openEdit = (r: Designation) => { setEditing(r); setForm({ ...r, department: r.department ? { id: r.department.id } : null }); setShowModal(true); };

  const bulkCreate = async () => {
    if (!depts.length) { alert("Add departments first."); return; }
    try {
      for (const dept of depts) {
        const names = DEFAULT_DESIGNATIONS[dept.name] || [];
        for (const name of names) {
          try { await designationApi.create({ name, department: { id: dept.id }, active: true }); }
          catch { /* skip dups */ }
        }
      }
      load();
      alert("Default designations created!");
    } catch { alert("Bulk create failed."); }
  };

  const f = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as Partial<Designation>));

  const save = async (addNew = false) => {
    if (!form.name?.trim()) { alert("Designation name is required."); return; }
    setSaving(true);
    try {
      if (editing) await designationApi.update(editing.id, form);
      else         await designationApi.create(form);
      if (addNew) { setEditing(null); setForm({ ...EMPTY }); }
      else setShowModal(false);
      load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed"));
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    try { await designationApi.delete(id); setDeleteId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
  };

  const filtered = rows.filter(r => {
    const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase());
    const matchDept   = !deptFilter || String(r.department?.id) === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Designation Master</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 w-44" />
            <i className="fas fa-search absolute left-2.5 top-2.5 text-gray-400 text-xs" />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="">All Departments</option>
            {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button onClick={bulkCreate}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <i className="fas fa-magic text-xs" /> Load Defaults
          </button>
          <button onClick={() => exportCSV(rows.map(r => ({ Name: r.name, Department: r.department?.name, Active: r.active })), "designations.csv")}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <i className="fas fa-download text-xs" /> Export
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: BRAND }}>
            <i className="fas fa-plus" /> New Designation
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: BRAND }} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No designations found. Click "Load Defaults" to import standard designations.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                {["#","Designation","Department","Description","Status",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r: Designation, i: number) => (
                <tr key={r.id} className="hover:bg-purple-50/30">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.department?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{r.description || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.active ? "Active" : "Inactive"}
                    </span>
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

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Designation</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this designation?</p>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4" style={{ background: BRAND, borderRadius: "16px 16px 0 0" }}>
              <h2 className="text-lg font-semibold text-white">{editing ? "Edit Designation" : "New Designation"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white text-xl"><i className="fas fa-times" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={lc}>Designation Name *</label>
                <input value={form.name} onChange={f("name")} className={ic} />
              </div>
              <div>
                <label className={lc}>Department</label>
                <select value={form.department?.id || ""} onChange={e => setForm(p => ({ ...p, department: e.target.value ? { id: Number(e.target.value) } : null }))} className={ic}>
                  <option value="">— No specific department —</option>
                  {depts.map((d: Department) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className={lc}>Description</label>
                <textarea value={form.description} onChange={f("description")} rows={2} className={ic} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-gray-600">Status:</label>
                {["true","false"].map(v => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="desigStatus" value={v}
                      checked={String(form.active) === v}
                      onChange={e => setForm(p => ({ ...p, active: e.target.value === "true" }))}
                      style={{ accentColor: BRAND }} />
                    <span className="text-sm text-gray-700">{v === "true" ? "Active" : "Inactive"}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => save(true)} disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-60"
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
