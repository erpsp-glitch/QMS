import { Outlet } from "react-router-dom";
import TabMenu from "../../Reusablecomponents/TabMenu";
import { mTabs } from "../../Reusablecomponents/MR";

export default function MasterDataPage() {
  return (
    <div className="p-4">
      {/* Reusable Tab Menu */}
      <TabMenu tabs={mTabs} />

      {/* Render active tab content */}
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}
