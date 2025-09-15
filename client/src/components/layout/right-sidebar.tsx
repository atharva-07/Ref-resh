import { Plus } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import SearchForm from "../forms/search-form";
import ChatOpener from "../main/chat/chat-opener";
import NewChatButton from "../main/chat/new-chat-button";
import Stories from "../main/story/stories";
import ModeToggle from "./theme-toggle";

const RightSidebar = () => {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
    >
      <SidebarHeader className="border-sidebar-border border-b">
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Stories />
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>
          <ModeToggle />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <NewChatButton />
        <ChatOpener />
      </SidebarFooter>
    </Sidebar>
  );
};

export default RightSidebar;
