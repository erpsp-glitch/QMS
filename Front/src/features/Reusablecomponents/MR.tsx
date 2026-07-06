import { 
  FiCalendar,     // Annual PM Plan
  FiCheckSquare,  // Checklists         // Sub-checklists (daily/weekly, half-yearly)
  FiClock,        // Scheduler & Execution
  FiTool          // AMC Monitoring
} from "react-icons/fi";

import type { TabItem } from "./TabMenu";

export const mTabs: TabItem[] = [
  { 
    id: "KPI", 
    label: "KPI", 
    icon: <FiCalendar className="w-4 h-4" />, 
    path: "/QMS/mr/KPI" 
  },
  { 
    id: "Auditor", 
    label: "Auditor", 
    icon: <FiCheckSquare className="w-4 h-4" />, 
    path: "/QMS/mr/Auditor",
 
  },
  { 
    id: "Audit Plane", 
    label: "Audit Plane", 
    icon: <FiClock className="w-4 h-4" />, 
    path: "/QMS/mr/Audit_Plane" 
  },
  { 
    id: "AuditReports", 
    label: "Audit Reports", 
    icon: <FiTool className="w-4 h-4" />, 
    path: "/QMS/mr/Audit_Report" 
  }, { 
    id: "MRM", 
    label: "MRM", 
    icon: <FiTool className="w-4 h-4" />, 
    path: "/QMS/mr/MRM" 
  }

];
