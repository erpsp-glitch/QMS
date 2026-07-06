import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import AppSidebar from "../Menubar/AppSidebar";
import TopNavbar from "../Menubar/TopNavBar";

import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/qms/DashboardPage";
import MasterDataModule from "../features/master-data/MasterDataModule";
import IssueModule from "../features/issues/IssueModule";
import KpiModule from "../features/kpi/KpiModule";
import AuditModule from "../features/audit/AuditModule";
import MrmModule from "../features/mrm/MrmModule";
import UserManagementPage from "../features/qms/UserManagementPage";

const BRAND = "#280882";
const ACCENT = "#f59e0b";

function AppLayout() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopNavbar
        userName={user?.fullName || user?.username || "User"}
        userEmail={user?.username || ""}
        userRole={user?.role?.replace(/_/g, " ") || ""}
        onLogout={handleLogout}
        backgroundColor="#ffffff"
        textColor="#1e293b"
        primaryColor={BRAND}
        accentColor={ACCENT}
      />
      <div className="flex flex-1 overflow-hidden pt-[70px]">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/master" element={<MasterDataModule />} />
            <Route path="/issues" element={<IssueModule />} />
            <Route path="/kpi" element={<KpiModule />} />
            <Route path="/audit" element={<AuditModule />} />
            <Route path="/mrm" element={<MrmModule />} />
            <Route path="/users" element={<UserManagementPage />} />
            {/* Legacy redirects */}
            <Route path="/master-data" element={<Navigate to="/master" replace />} />
            <Route path="/certifications" element={<Navigate to="/master?tab=certification" replace />} />
            <Route path="/departments" element={<Navigate to="/master?tab=department" replace />} />
            <Route path="/documents" element={<Navigate to="/master?tab=document" replace />} />
            <Route path="/issue-register" element={<Navigate to="/issues?tab=view" replace />} />
            <Route path="/kpi/masters" element={<Navigate to="/kpi?tab=master" replace />} />
            <Route path="/kpi/entries" element={<Navigate to="/kpi?tab=entries" replace />} />
            <Route path="/audit/plans" element={<Navigate to="/audit?tab=plans" replace />} />
            <Route path="/audit/observations" element={<Navigate to="/audit?tab=observations" replace />} />
            <Route path="/audit/nc" element={<Navigate to="/audit?tab=nc" replace />} />
            <Route path="/audit/feedback" element={<Navigate to="/audit?tab=feedback" replace />} />
            <Route path="/audit/reports" element={<Navigate to="/audit?tab=reports" replace />} />
            <Route path="/audit/analytics" element={<Navigate to="/audit?tab=analytics" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
