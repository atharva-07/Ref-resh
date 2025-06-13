import { Outlet } from "react-router-dom";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAppSelector } from "@/hooks/useAppSelector";

import AppSidebar from "./app-sidebar";
import UtilityButtons from "./utlity-buttons"; // Will be added as a fixed section on the bottom right of the screen

const Layout = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="max-w-[1240px] min-h-screen mx-auto flex flex-row">
      <SidebarProvider>
        {isAuthenticated && <AppSidebar />}
        <main>
          <div className="w-[952px] max-w-[952px] min-h-screen mx-auto flex flex-row gap-7">
            {/* Fucking fix the fucking css in the above line later. ml-[288px] commented out for now */}
            <SidebarTrigger />
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
