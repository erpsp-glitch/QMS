//import { Routes, Route, Navigate } from "react-router-dom";
//import { useAuthStore } from "../store/authStore";
//import ProtectedRoute from "./ProtectedRoute";

// Pages
//import Dashboard from "../features/master-data/pages/Dashboard";
//import MachineList from "../features/master-data/pages/MachineList";
//import PMPlan from "../features/preventive-maintenance/pages/PMPlan";

export default function AppRoutes() {
  //const user = useAuthStore((state) => state.user);

  return (
    
  {/*


    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "engineer"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines"
        element={
          <ProtectedRoute allowedRoles={["admin", "maintenance"]}>
            <MachineList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pm-plan"
        element={
          <ProtectedRoute allowedRoles={["maintenance", "engineer"]}>
            <PMPlan />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
 
    
    
    */}
  
  );
}
