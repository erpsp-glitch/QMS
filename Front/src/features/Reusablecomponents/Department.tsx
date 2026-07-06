import { 
  FiCalendar,     // Annual PM Plan
  FiCheckSquare,  // Checklists         // Sub-checklists (daily/weekly, half-yearly)
  FiClock,        // Scheduler & Execution
         // AMC Monitoring
} from "react-icons/fi";

import type { TabItem } from "./TabMenu";

export const Departmentdata: TabItem[] = [
  { 
    id: "Marketing", 
    label: "Marketing", 
    icon: <FiCalendar className="w-4 h-4" />, 
    path: "/QMS/department/Marketing" 
  },
  { 
    id: "Production", 
    label: "Production", 
    icon: <FiCheckSquare className="w-4 h-4" />, 
    path: "/QMS/department/Production",
 
  },
  { 
    id: "Quality", 
    label: "Quality", 
    icon: <FiClock className="w-4 h-4" />, 
    path: "/QMS/department/Quality" 
  }

];
