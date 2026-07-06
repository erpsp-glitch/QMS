import { 
  FiCalendar,     // Annual PM Plan
  FiCheckSquare,  // Checklists         // Sub-checklists (daily/weekly, half-yearly)
  FiClock,        // Scheduler & Execution
            // AMC Monitoring
} from "react-icons/fi";

import type { TabItem } from "./TabMenu";

export const Doc_StampTabs: TabItem[] = [
  { 
    id: "Doc & Issue Control", 
    label: "Doc & Issue Control", 
    icon: <FiCalendar className="w-4 h-4" />, 
    path: "/QMS/doc-stamp/Doc_&_Issue_Control" 
  },
  { 
    id: "Stamp_issue_Control", 
    label: "Stamp & Issue Control", 
    icon: <FiCheckSquare className="w-4 h-4" />, 
    path: "/QMS/doc-stamp/Stamp_issue_Control",
 
  },
  { 
    id: "Obsolete Copy", 
    label: "Obsolete Copy", 
    icon: <FiClock className="w-4 h-4" />, 
    path: "/QMS/doc-stamp/Obsolete_Copy" 
  }
];
