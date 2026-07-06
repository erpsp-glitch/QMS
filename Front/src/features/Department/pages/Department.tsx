import { Outlet } from "react-router-dom";
import TabMenu from "../../Reusablecomponents/TabMenu";
import  { Departmentdata  } from "../../Reusablecomponents/Department";

export default function  Department() {
  return (
    <div className="p-4">
      {/* Reusable Tab Menu */}
      <TabMenu tabs={Departmentdata} />

      {/* Render active tab content */}
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}
