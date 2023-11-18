import LeftSidebar from "@/components/layout/left-sidebar/left-sidebar";
import { Outlet } from "react-router-dom";

const isAuthenticated: boolean = true;

const RootLayout = () => {
  return (
    <>
      <div className="max-w-[1240px] min-h-screen mx-auto flex flex-row">
        <LeftSidebar />
        <div className="max-w-[952px] min-h-screen mx-auto flex flex-row gap-7 ml-[288px]">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default RootLayout;
