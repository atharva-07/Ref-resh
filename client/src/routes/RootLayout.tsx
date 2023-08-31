import LeftSidebar from "@/components/layout/left-sidebar/left-sidebar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="flex flex-row gap-1">
      <LeftSidebar />
      <Outlet />
    </div>
  );
};

export default RootLayout;
