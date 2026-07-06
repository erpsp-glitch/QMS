import { Outlet } from "react-router-dom";
import TabMenu from "../../Reusablecomponents/TabMenu";
import { Doc_StampTabs } from "../../Reusablecomponents/Doc_Stamp_Control";

export default function Doc_Stamp() {
  return (
    <div className="p-4">
      {/* Reusable Tab Menu */}
      <TabMenu tabs={Doc_StampTabs} />

      {/* Render active tab content */}
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}
