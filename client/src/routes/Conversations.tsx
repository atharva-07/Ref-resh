import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { getLastMessages } from "@/store/chat-slice";
import {
  getISOStringFromTimestamp,
  getRelativeTime,
} from "@/utility/utility-functions";

const Conversations = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { chats } = useAppSelector((state) => state.chat);

  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      const constrainedWidth = Math.max(250, Math.min(500, newWidth));
      setSidebarWidth(constrainedWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const lastMessages = useAppSelector(getLastMessages);

  // Memoized and sorted list of chats
  const sortedChats = useMemo(() => {
    // Return an empty array if chats is not defined or is empty
    if (!chats || chats.length === 0) {
      return [];
    }

    // Create a new array to avoid mutating the original Redux state
    return [...chats].sort((a, b) => {
      // Find the last message for chat 'a' and 'b' from the 'lastMessages' map
      const lastMessageA = lastMessages[a.chatId];
      const lastMessageB = lastMessages[b.chatId];

      // If both chats have a last message, compare their timestamps
      if (lastMessageA && lastMessageB) {
        // We use 'updatedAt' for the most accurate sorting (e.g., edited messages)
        const dateA = new Date(
          getISOStringFromTimestamp(
            lastMessageA.updatedAt || lastMessageA.createdAt
          )
        );
        const dateB = new Date(
          getISOStringFromTimestamp(
            lastMessageB.updatedAt || lastMessageB.createdAt
          )
        );
        return dateB.getTime() - dateA.getTime(); // Sort in descending order
      }

      // If only one chat has a last message, it should come first
      if (lastMessageA) {
        return -1; // 'a' comes before 'b'
      }
      if (lastMessageB) {
        return 1; // 'b' comes before 'a'
      }

      // If neither chat has a last message, maintain their original order
      return 0;
    });
  }, [chats, lastMessages]);

  return (
    <div
      ref={containerRef}
      className="flex h-screen max-h-screen bg-background overflow-hidden"
    >
      <div
        className="border-r border-border flex flex-col bg-background flex-shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>
        {/* Chat List */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2">
              {sortedChats.length === 0 && (
                <p>So sooo empty. You gotta start talking to people gang.</p>
              )}
              {sortedChats.length > 0 &&
                sortedChats.map((chat) => {
                  const chatMembers = chat.chatMembers?.filter(
                    (m) => m._id !== user?.userId
                  );
                  const groupChat: boolean = (chatMembers?.length ?? 0) > 1;
                  const recipient = groupChat
                    ? chat.chatName
                    : chatMembers && chatMembers.length > 0
                      ? chatMembers[0].firstName + " " + chatMembers[0].lastName
                      : "Unknown Recipient";
                  const lastMessage = lastMessages[chat.chatId];
                  const chatAvatar = groupChat
                    ? lastMessage?.sender.pfpPath
                    : chatMembers![0].pfpPath;
                  const lastMessageContent = lastMessage?.content;
                  const lastMessageSender =
                    lastMessage?.sender._id === user?.userId
                      ? "You"
                      : lastMessage?.sender.firstName;

                  return (
                    <NavLink
                      to={chat.chatId}
                      className={({ isActive }) =>
                        `${isActive ? "bg-accent" : ""}`
                      }
                    >
                      <Card
                        key={chat.chatId}
                        className={cn(
                          "p-3 mb-2 cursor-pointer transition-colors bg-inherit hover:bg-accent"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={chatAvatar} alt={chat.chatName} />
                            <AvatarFallback>
                              {chat.chatName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-sm truncate">
                                {recipient}
                              </h3>
                              {!lastMessage && (
                                <p>No messages in this chat yet.</p>
                              )}
                              {lastMessage && (
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {getRelativeTime(
                                    getISOStringFromTimestamp(
                                      lastMessage!.createdAt
                                    )
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              {lastMessage && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {lastMessageSender}
                                  {": "}
                                  {lastMessageContent}
                                </p>
                              )}
                              {chat.unreadCount > 0 && (
                                <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                                  {chat.unreadCount <= 4
                                    ? chat.unreadCount
                                    : "4+"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </NavLink>
                  );
                })}
            </div>
          </ScrollArea>
        </div>
      </div>
      {/* Resizable Divider */}
      <div
        className={cn(
          "w-1 bg-border hover:bg-border/80 cursor-col-resize transition-colors flex-shrink-0",
          isDragging && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      />
      <div className="flex-1 min-w-0 flex flex-col bg-background">
        <Outlet />
      </div>
    </div>
  );
};

export default Conversations;
