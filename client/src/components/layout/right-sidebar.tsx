import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import ChatOpener from "../main/chat/chat-opener";
import NewChatButton from "../main/chat/new-chat-button";
import SearchBar from "../main/search-bar";
import Stories from "../main/story/stories";
import StoryWriterModal from "../modal/story-writer-modal";
import { Button } from "../ui/button";
import ModeToggle from "./theme-toggle";

const RightSidebar = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
    >
      <SidebarHeader className="border-sidebar-border border-b">
        <SearchBar />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Stories />
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>
          <StoryWriterModal>
            <Button variant="secondary" className="font-semibold w-full">
              Add a Story
            </Button>
          </StoryWriterModal>
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
