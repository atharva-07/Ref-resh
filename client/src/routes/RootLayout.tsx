import { Outlet } from "react-router-dom";

import LeftSidebar from "@/components/layout/left-sidebar/left-sidebar";
import { useAppSelector } from "@/hooks/useAppSelector";

const RootLayout = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="max-w-[1240px] min-h-screen mx-auto flex flex-row">
      {isAuthenticated && <LeftSidebar />}
      <div className="max-w-[952px] min-h-screen mx-auto flex flex-row gap-7 ml-[288px]">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
