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
};

export default Layout;
