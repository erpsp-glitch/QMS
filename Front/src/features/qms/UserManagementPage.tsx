import { useEffect, useState } from "react";
import { userApi, deptApi } from "../../api/qms.api";
import type { User, Department, DeptRef, InputChg } from "./types";
import { apiMsg } from "./types";
import {
  FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiX, FiRefreshCw,
  FiAlertTriangle, FiUsers, FiShield, FiKey, FiToggleLeft, FiToggleRight
} from "react-icons/fi";

const BRAND = "#280882";
const ic = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600";
const lc = "block text-xs font-medium text-gray-600 mb-1";

const ROLES = ["SUPER_ADMIN","MR","QMS_COORDINATOR","DEPARTMENT_HEAD","AUDITOR","EMPLOYEE","TOP_MANAGEMENT"];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:      "bg-red-100 text-red-700",
  MR:               "bg-purple-100 text-purple-700",
  QMS_COORDINATOR:  "bg-blue-100 text-blue-700",
  DEPARTMENT_HEAD:  "bg-orange-100 text-orange-700",
  AUDITOR:          "bg-teal-100 text-teal-700",
  EMPLOYEE:         "bg-gray-100 text-gray-600",
  TOP_MANAGEMENT:   "bg-yellow-100 text-yellow-700",
};

const EMPTY: Partial<User> & { password: string } = {
  username: "", password: "", fullName: "", email: "",
  role: "EMPLOYEE", employeeCode: "", phone: "",
  active: true, department: null as DeptRef | null,
};

export default function UserManagementPage() {
  const [rows, setRows]         = useState<User[]>([]);
  const [depts, setDepts]       = useState<Department[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<User | null>(null);
  const [viewItem, setViewItem] = useState<User | null>(null);
  const [form, setForm]         = useState<Partial<User> & { password: string }>({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [resetId, setResetId]   = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch]     = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    Promise.allSettled([userApi.getAll(), deptApi.getAll()])
      .then(([uRes, dRes]) => {
        setRows(uRes.status === "fulfilled" ? (Array.isArray(uRes.value) ? uRes.value as User[] : []) : []);
        setDepts(dRes.status === "fulfilled" ? (Array.isArray(dRes.value) ? dRes.value as Department[] : []) : []);
      }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); };
  const openEdit = (r: User) => { setEditing(r); setForm({ ...r, password: "" }); setShowModal(true); };

  const f = (k: string) => (e: InputChg) => setForm(p => ({ ...p, [k]: e.target.value } as typeof EMPTY));

  const save = async () => {
    if (!form.username || !form.fullName || !form.email) { alert("Username, Full Name and Email are required."); return; }
    if (!editing && !form.password) { alert("Password is required for new users."); return; }
    setSaving(true);
    try {
      if (editing) await userApi.update(editing.id, form);
      else         await userApi.create(form);
      setShowModal(false);
      load();
    } catch (e: unknown) {
      alert(apiMsg(e, "Save failed"));
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    try { await userApi.delete(id); setDeleteId(null); load(); }
    catch (e: unknown) { alert(apiMsg(e, "Delete failed")); }
  };

  const toggle = async (r: User) => {
    await userApi.toggleActive(r.id);
    load();
  };

  const doReset = async () => {
    if (!resetId || !newPassword) return;
    try {
      await userApi.resetPassword(resetId, newPassword);
      setResetId(null); setNewPassword("");
      alert("Password reset successfully.");
    } catch (e: unknown) { alert(apiMsg(e, "Reset failed")); }
  };

  const filtered = rows.filter(r => {
    const matchSearch = !search ||
      r.username?.toLowerCase().includes(search.toLowerCase()) ||
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeCode?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || r.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total:  rows.length,
    active: rows.filter(r => r.active).length,
    admins: rows.filter(r => ["SUPER_ADMIN","MR","TOP_MANAGEMENT"].includes(r.role)).length,
    inactive: rows.filter(r => !r.active).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage system users, roles and access permissions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={load} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={openAdd}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <FiPlus /> New User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Users",   value: stats.total,    color: "from-purple-600 to-indigo-600", icon: <FiUsers /> },
            { label: "Active",        value: stats.active,   color: "from-green-500 to-emerald-600", icon: <FiShield /> },
            { label: "Inactive",      value: stats.inactive, color: "from-gray-500 to-gray-600",     icon: <FiToggleLeft /> },
            { label: "Administrators",value: stats.admins,   color: "from-red-500 to-rose-600",      icon: <FiKey /> },
          ].map(k => (
            <div key={k.label} className={`bg-gradient-to-br ${k.color} text-white p-4 rounded-xl shadow`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg text-lg">{k.icon}</div>
                <div><p className="text-xs opacity-80">{k.label}</p><p className="text-2xl font-bold">{k.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search username, name, email, employee code..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500">
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-3" />
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FiUsers className="text-5xl mx-auto mb-3 opacity-20" />
            <p>No users found.</p>
            <button onClick={openAdd} className="mt-3 px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: BRAND }}>
              <FiPlus className="inline mr-1" /> Add First User
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white text-xs uppercase" style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                  {["#","Username","Full Name","Email","Role","Emp Code","Department","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r: User, i: number) => (
                  <tr key={r.id} className="hover:bg-purple-50/40 transition-colors group">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-purple-700">{r.username}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.fullName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[r.role] || "bg-gray-100 text-gray-600"}`}>
                        {r.role?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{r.employeeCode || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.department?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                        {r.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewItem(r)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="View"><FiEye className="text-xs" /></button>
                        <button onClick={() => openEdit(r)} className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200" title="Edit"><FiEdit className="text-xs" /></button>
                        <button onClick={() => { setResetId(r.id); setNewPassword(""); }} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100" title="Reset Password"><FiKey className="text-xs" /></button>
                        <button onClick={() => toggle(r)} className={`p-1.5 rounded-lg ${r.active ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`} title={r.active ? "Deactivate" : "Activate"}>
                          {r.active ? <FiToggleRight className="text-xs" /> : <FiToggleLeft className="text-xs" />}
                        </button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200" title="Delete"><FiTrash2 className="text-xs" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <div>
                <h2 className="text-lg font-bold">User Details</h2>
                <p className="text-purple-200 text-xs font-mono mt-0.5">@{viewItem.username}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                  {viewItem.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{viewItem.fullName}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[viewItem.role] || "bg-gray-100"}`}>
                    {viewItem.role?.replace(/_/g, " ")}
                  </span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${viewItem.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {viewItem.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Username", viewItem.username || "—"],
                  ["Email", viewItem.email || "—"],
                  ["Phone", viewItem.phone || "—"],
                  ["Employee Code", viewItem.employeeCode || "—"],
                  ["Department", viewItem.department?.name || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="font-semibold text-gray-800 break-words text-xs">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setViewItem(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Close</button>
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold shadow-lg flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                <FiEdit /> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[94vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
              <div>
                <h2 className="text-lg font-bold">{editing ? "Edit User" : "New User"}</h2>
                {editing?.username && <p className="text-purple-200 text-xs font-mono mt-0.5">@{editing.username}</p>}
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl"><FiX /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Username *</label>
                  <input value={form.username} onChange={f("username")} disabled={!!editing}
                    className={`${ic} disabled:bg-gray-50`} placeholder="john.doe" />
                </div>
                <div>
                  <label className={lc}>{editing ? "Password (leave blank to keep)" : "Password *"}</label>
                  <input type="password" value={form.password || ""} onChange={f("password")} className={ic} />
                </div>
                <div>
                  <label className={lc}>Full Name *</label>
                  <input value={form.fullName} onChange={f("fullName")} className={ic} placeholder="John Doe" />
                </div>
                <div>
                  <label className={lc}>Email *</label>
                  <input type="email" value={form.email} onChange={f("email")} className={ic} placeholder="john@company.com" />
                </div>
                <div>
                  <label className={lc}>Phone</label>
                  <input value={form.phone || ""} onChange={f("phone")} className={ic} placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className={lc}>Employee Code</label>
                  <input value={form.employeeCode || ""} onChange={f("employeeCode")} className={ic} placeholder="EMP001" />
                </div>
                <div>
                  <label className={lc}>Role</label>
                  <select value={form.role} onChange={f("role")} className={ic}>
                    {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Department</label>
                  <select value={form.department?.id || ""} onChange={e => setForm(p => ({ ...p, department: e.target.value ? { id: Number(e.target.value) } : null } as typeof EMPTY))} className={ic}>
                    <option value="">— Select Department —</option>
                    {depts.filter((d: Department) => d.active).map((d: Department) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {editing && (
                  <div className="col-span-2">
                    <label className={lc}>Status</label>
                    <div className="flex gap-4 pt-1">
                      {[true, false].map(v => (
                        <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="userActive" value={String(v)} checked={form.active === v}
                            onChange={() => setForm(p => ({ ...p, active: v } as typeof EMPTY))} style={{ accentColor: BRAND }} />
                          <span className="text-sm text-gray-700">{v ? "Active" : "Inactive"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={save} disabled={saving}
                className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>
                {saving ? <><FiRefreshCw className="inline animate-spin mr-1" />Saving...</> : editing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-80 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full"><FiKey className="text-blue-600 text-xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Reset Password</h3>
                <p className="text-sm text-gray-500">Enter the new password for this user.</p>
              </div>
            </div>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              className={`${ic} mb-4`} />
            <div className="flex gap-3">
              <button onClick={() => setResetId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={doReset} className="flex-1 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #4f46e5)` }}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full"><FiAlertTriangle className="text-red-600 text-2xl" /></div>
              <div>
                <h3 className="font-bold text-gray-800">Delete User</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this user? They will lose all access to the system.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm text-gray-600">Cancel</button>
              <button onClick={() => del(deleteId)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
