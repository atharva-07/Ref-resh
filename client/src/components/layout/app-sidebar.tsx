import {
  Bell,
  Bookmark,
  ChevronsUpDown,
  Command,
  Edit3,
  Home,
  LogOut,
  MessageSquarePlus,
  User2,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAppSelector } from "@/hooks/useAppSelector";

import PostWriterModal from "../modal/post-writer-modal";
import { Button } from "../ui/button";
import NavUser from "./nav-user";

const AppSidebar = () => {
  const { user } = useAppSelector((state) => state.auth);

  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Conversations",
      url: "/conversations",
      icon: MessageSquarePlus,
    },
    {
      title: "Bookmarks",
      url: "/bookmarks",
      icon: Bookmark,
    },
    {
      title: "Profile",
      url: `/@${user?.username}`,
      icon: User2,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Welcome to Ref-resh
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton size="lg" asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `inline-block ${isActive && "active"}`
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <PostWriterModal>
                    <Button className="font-semibold w-full">
                      Compose New Post
                    </Button>
                  </PostWriterModal>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser user={user!} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
