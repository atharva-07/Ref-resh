import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";
import { getActiveUsers, getLastMessages } from "@/store/chat-slice";
import {
  getISOStringFromTimestamp,
  getRelativeTime,
} from "@/utility/utility-functions";

const Conversations = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { chats } = useAppSelector((state) => state.chat);

  const activeUsers = useAppSelector(getActiveUsers);

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
    if (!chats || chats.length === 0) {
      return [];
    }

    return [...chats].sort((a, b) => {
      const lastMessageA = lastMessages[a.chatId];
      const lastMessageB = lastMessages[b.chatId];

      if (lastMessageA && lastMessageB) {
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
        return dateB.getTime() - dateA.getTime();
      }

      if (lastMessageA) {
        return -1;
      }
      if (lastMessageB) {
        return 1;
      }

      return 0;
    });
  }, [chats, lastMessages]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] bg-background overflow-hidden"
    >
      <div
        className="border-r border-border flex flex-col bg-background flex-shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

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
                  const recipient = chat.chatName;
                  const lastMessage = lastMessages[chat.chatId];
                  const chatAvatar = groupChat
                    ? lastMessage?.sender.pfpPath
                    : chatMembers && chatMembers[0].pfpPath;
                  const lastMessageContent = lastMessage?.content;
                  const lastMessageSenderFirstname =
                    lastMessage?.sender._id === user?.userId
                      ? "You"
                      : lastMessage?.sender.firstName;

                  const isAnyoneActiveInChat = chatMembers?.some((member) =>
                    activeUsers.includes(member._id)
                  );

                  return (
                    <NavLink
                      key={chat.chatId}
                      to={chat.chatId}
                      className={({ isActive }) =>
                        `${isActive ? "bg-accent" : ""}`
                      }
                    >
                      <Card
                        key={chat.chatId}
                        className={cn(
                          "p-3 mb-2 cursor-pointer bg-inherit hover:bg-accent"
                        )}
                      >
                        <div className="flex items-start gap-3 relative">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={chatAvatar} alt={recipient} />
                            <AvatarFallback>
                              {groupChat
                                ? `${lastMessage?.sender.firstName[0]}${lastMessage?.sender.lastName[0]}`
                                : `${recipient?.split(" ")[0][0]}${recipient?.split(" ")[1][0]}`}
                            </AvatarFallback>
                          </Avatar>
                          {isAnyoneActiveInChat && (
                            <div className="h-2 w-2 absolute top-9 left-10 rounded-full bg-green-500"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-sm truncate">
                                {recipient}
                              </h3>
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
                              <p className="text-sm text-muted-foreground truncate">
                                {lastMessage
                                  ? `${lastMessageSenderFirstname}: 
                                  ${lastMessageContent}`
                                  : `No messages in this chat yet.`}
                              </p>
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

      <div
        className={cn(
          "w-1 bg-border hover:bg-border/80 cursor-col-resize flex-shrink-0",
          isDragging && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      />
      <div className="flex-1 min-w-0 max-w-4xl flex flex-col bg-background">
        <Outlet />
      </div>
    </div>
  );
};

export default Conversations;
