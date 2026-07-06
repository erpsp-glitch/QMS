import { Outlet } from "react-router-dom";
import TabMenu from "../../Reusablecomponents/TabMenu";
import { masterTabs } from "../../Reusablecomponents/MastermenuData";

export default function MasterDataPage() {
  return (
    <div className="p-4">
      {/* Reusable Tab Menu */}
      <TabMenu tabs={masterTabs} />

      {/* Render active tab content */}
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}
