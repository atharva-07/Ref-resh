import { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { socketActions } from "@/store/middlewares/socket-middleware";

import { Toaster } from "../ui/toaster";
import Header from "./header";
import LeftSidebar from "./left-sidebar";
import OutletContainer from "./outlet-container";
import RightSidebar from "./right-sidebar";

const headerTitleMap: Map<string, string> = new Map([
  ["/", "Home"],
  ["/notifications", "Notifications"],
  ["/conversations", "Conversations"],
  ["/bookmarks", "Bookmarks"],
]);

const Layout = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation().pathname;

  // const dispatch = useAppDispatch();

  // useEffect(() => {
  //   dispatch({ type: socketActions.connect });

  //   // return () => {
  //   //   dispatch({ type: socketActions.disconnect });
  //   // };
  // }, [dispatch]);

  return (
    <>
      {!isAuthenticated && <Outlet />}
      {isAuthenticated && (
        <SidebarProvider>
          <LeftSidebar />
          <SidebarInset>
            <Header
              headerTitle={
                headerTitleMap.get(
                  new String(location).includes(location) ? location : location
                ) as string
              }
            />
            <OutletContainer>
              <Outlet />
            </OutletContainer>
          </SidebarInset>
          <RightSidebar />
        </SidebarProvider>
      )}
      {isAuthenticated && <Toaster />}
    </>
  );
  // <div className="max-w-[1240px] min-h-screen mx-auto flex flex-row">
  //   <SidebarProvider>
  //     {isAuthenticated && <AppSidebar />}
  //     <main>
  //       <div className="w-[952px] max-w-[952px] min-h-screen mx-auto flex flex-row gap-7">
  //         {/* Fucking fix the fucking css in the above line later. ml-[288px] commented out for now */}
  //         <SidebarTrigger />
  //         <Outlet />
  //       </div>
  //     </main>
  //   </SidebarProvider>
  // </div>
};

export default Layout;
