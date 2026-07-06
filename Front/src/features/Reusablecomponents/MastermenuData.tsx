import { FiDatabase, FiBox, FiTruck ,FiSliders,FiClipboard} from "react-icons/fi";
import type { TabItem } from "./TabMenu";

export const masterTabs: TabItem[] = [
  { id: "machines", label: "Machinery", icon: <FiDatabase className="w-4 h-4" />, path: "/maintenance/master/machines" },
  { id: "spares", label: "Spares master", icon: <FiBox className="w-4 h-4" />, path: "/maintenance/master/spares" },
  { id: "suppliers", label: "Suppliers", icon: <FiTruck className="w-4 h-4" />, path: "/maintenance/master/suppliers" },
  { id: "utilities", label: "Utilities Master", icon: <FiSliders className="w-4 h-4" />, path: "/maintenance/master/utilities" },
   { id: "manuals", label: "Critical Manuals", icon: <FiClipboard className="w-4 h-4" />, path: "/maintenance/master/manuals" }
];
