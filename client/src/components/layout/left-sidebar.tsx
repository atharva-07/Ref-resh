import {
  Bell,
  Bookmark,
  Command,
  Heart,
  Home,
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
import { getUnreadChatCount } from "@/store/chat-slice";
import { getUnreadNotificationsCount } from "@/store/notifications-slice";

import PostWriterModal from "../modal/post-writer-modal";
import { Button } from "../ui/button";
import NavUser from "./nav-user";

const LeftSidebar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const unreadChatsCount = useAppSelector(getUnreadChatCount);
  const unreadNotificationsCount = useAppSelector(getUnreadNotificationsCount);

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
      data: unreadNotificationsCount,
    },
    {
      title: "Conversations",
      url: "/conversations",
      icon: MessageSquarePlus,
      data: unreadChatsCount,
    },
    {
      title: "Bookmarks",
      url: "/bookmarks",
      icon: Bookmark,
    },
    {
      title: "Requests",
      url: "requests",
      icon: Heart,
    },
    {
      title: "Profile",
      url: `/${user?.username}`,
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
                      {!!item.data &&
                        item.data > 0 &&
                        (item.data > 9 ? (
                          <span className="bg-background text-foreground outline outline-1 font-thin text-xs h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0">
                            {"9+"}
                          </span>
                        ) : (
                          <span className="bg-background text-foreground outline outline-1 font-thin text-xs h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0">
                            {item.data}
                          </span>
                        ))}
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

export default LeftSidebar;
