"use client";

import { Search, Send } from "lucide-react";
import React from "react";
import { useCallback, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "/professional-woman.png",
    lastMessage: "Hey! How are you doing today?",
    timestamp: "2m ago",
    unread: 2,
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "/casual-man.png",
    lastMessage: "Thanks for the help with the project!",
    timestamp: "1h ago",
  },
  {
    id: "3",
    name: "Team Design",
    avatar: "/diverse-team.png",
    lastMessage: "Sarah: The new mockups look great",
    timestamp: "3h ago",
    unread: 5,
  },
  {
    id: "4",
    name: "Emma Wilson",
    avatar: "/creative-woman.png",
    lastMessage: "Can we schedule a call for tomorrow?",
    timestamp: "1d ago",
  },
  {
    id: "5",
    name: "Marketing Team",
    avatar: "/marketing-team-brainstorm.png",
    lastMessage: "John: Campaign results are in!",
    timestamp: "2d ago",
  },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hey! How are you doing today?",
      timestamp: "2:30 PM",
      isOwn: false,
    },
    {
      id: "2",
      content: "I'm doing great, thanks for asking! How about you?",
      timestamp: "2:32 PM",
      isOwn: true,
    },
    {
      id: "3",
      content: "Pretty good! Just working on some new designs.",
      timestamp: "2:33 PM",
      isOwn: false,
    },
  ],
  "2": [
    {
      id: "1",
      content: "Thanks for the help with the project!",
      timestamp: "1:15 PM",
      isOwn: false,
    },
    {
      id: "2",
      content: "You're welcome! Happy to help anytime.",
      timestamp: "1:16 PM",
      isOwn: true,
    },
  ],
};

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedChatData = selectedChat
    ? mockChats.find((chat) => chat.id === selectedChat)
    : null;
  const messages = selectedChat ? mockMessages[selectedChat] || [] : [];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to your backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;

      // Constrain width between 250px and 500px
      const constrainedWidth = Math.max(250, Math.min(500, newWidth));
      setSidebarWidth(constrainedWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
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

  return (
    <div
      ref={containerRef}
      className="flex h-screen max-h-screen bg-background overflow-hidden"
    >
      {/* Chat List Sidebar */}
      <div
        className="border-r border-border flex flex-col bg-background flex-shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <h1 className="text-xl font-semibold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2">
              {mockChats.map((chat, index) => (
                <Card
                  key={`${chat.id}-${index}`}
                  className={cn(
                    "p-3 mb-2 cursor-pointer transition-colors hover:bg-accent",
                    selectedChat === chat.id && "bg-accent"
                  )}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>
                        {chat.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {chat.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unread && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
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

      {/* Message Area */}
      <div className="flex-1 min-w-0 flex flex-col bg-background">
        {selectedChatData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedChatData.avatar}
                    alt={selectedChatData.name}
                  />
                  <AvatarFallback>
                    {selectedChatData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{selectedChatData.name}</h2>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.id}-${index}`}
                      className={cn(
                        "flex",
                        message.isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                          message.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            message.isOwn
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Select a conversation
              </h3>
              <p className="text-muted-foreground">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
