import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  path: string; // each tab has its own route
}

interface TabMenuProps {
  tabs: TabItem[];
}

export default function TabMenu({ tabs }: TabMenuProps) {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              `py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
