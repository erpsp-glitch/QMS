import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/qms.api";
import { useAuthStore } from "../../store/authStore";

const BRAND = "#280882";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(form.username, form.password);
      const d = res.data.data;
      login(d.token, { id: d.username, username: d.username, role: d.role, fullName: d.fullName });
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #4a1fa8 50%, #6b35d4 100%)` }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10 bg-white" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: `linear-gradient(135deg, ${BRAND}, #4a1fa8)` }}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <i className="fas fa-shield-alt text-3xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">DaSsk QMS</h1>
            <p className="text-white/70 text-sm mt-1">Quality Management System</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <i className="fas fa-exclamation-circle" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-user" />
                  </span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition"
                    style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-lock" />
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm transition"
                    style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${BRAND}, #4a1fa8)` }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin" /> Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-sign-in-alt" /> Sign In
                  </span>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-500">
              DaSsk QMS Services · Bengaluru · GST: 29LVVPK4154Q1Z6
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
