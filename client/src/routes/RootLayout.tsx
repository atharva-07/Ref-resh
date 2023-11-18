import LeftSidebar from "@/components/layout/left-sidebar/left-sidebar";
import { Outlet } from "react-router-dom";

const isAuthenticated: boolean = true;

const RootLayout = () => {
  return (
    <>
      <div className="max-w-[1240px] min-h-screen mx-auto flex flex-row gap-7">
        <LeftSidebar />
        <Outlet />
      </div>
    </>
  );
};

export default RootLayout;
