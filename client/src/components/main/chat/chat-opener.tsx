import {
  ArrowLeft,
  Loader2,
  Maximize2,
  MessageCircleIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import ChatForm from "@/components/forms/chat-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useChatMessages } from "@/hooks/useChatMessages";
import { getLastMessages } from "@/store/chat-slice";
import {
  formatDateForChat,
  getISOStringFromTimestamp,
  getRelativeTime,
  transformTimestamps,
} from "@/utility/utility-functions";

import { BasicUserData } from "../post/post";
import { DateSeparator } from "./chat";
import Message from "./message";

type ViewState = "closed" | "chatList" | "chatView";

const ChatOpener = () => {
  const { chats } = useAppSelector((state) => state.chat);
  const lastMessages = useAppSelector(getLastMessages);

  const [viewState, setViewState] = useState<ViewState>("closed");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const selectedChat = selectedChatId
    ? chats.find((chat) => chat.chatId === selectedChatId)
    : null;

  const {
    allMessages,
    lastMessageId,
    usersLastSeen,
    loading,
    loadingMore,
    hasNextPage,
    chatRecipient,
    typingMessage,
    ref,
    user,
  } = useChatMessages(selectedChatId!);

  const initialScrollRef = useRef(true);
  const bottomDivRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialScrollRef.current = true;
  }, [selectedChatId]);

  // Autoscroll logic
  useEffect(() => {
    if (bottomDivRef.current && !loading && !loadingMore) {
      if (initialScrollRef.current) {
        bottomDivRef.current.scrollIntoView({ behavior: "auto" });
        initialScrollRef.current = false;
      } else {
        const scrollArea = scrollAreaRef.current;
        if (scrollArea) {
          const { scrollTop, scrollHeight, clientHeight } = scrollArea;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
          if (isAtBottom) {
            bottomDivRef.current.scrollIntoView({ behavior: "auto" });
          }
        }
      }
    }
  }, [allMessages, loading, loadingMore]);

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

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setViewState("chatView");
  };

  const handleBack = () => {
    setViewState("chatList");
    setSelectedChatId(null);
  };

  const handleClose = () => {
    setViewState("closed");
    setSelectedChatId(null);
  };

  return (
    <>
      <div
        className="bg-background flex items-center border-t p-3 sm:justify-between hover:cursor-pointer hover:bg-accent"
        onClick={() => setViewState("chatList")}
      >
        <div className="flex gap-2">
          <MessageCircleIcon className="h-6 w-6"></MessageCircleIcon>
          <p>Messages</p>
        </div>
      </div>

      {viewState !== "closed" && (
        <Card className="fixed bottom-6 right-6 w-96 h-96 z-50 flex flex-col">
          {viewState === "chatList" && (
            <>
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Messages</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {sortedChats.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      Looks like you have no conversations yet.
                    </p>
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

                      return (
                        <div
                          key={chat.chatId}
                          onClick={() => handleChatSelect(chat.chatId)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={chatAvatar} alt={recipient} />
                            <AvatarFallback>
                              {groupChat
                                ? `${lastMessage?.sender.firstName[0]}${lastMessage?.sender.lastName[0]}`
                                : `${recipient?.split(" ")[0][0]}${recipient?.split(" ")[1][0]}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {recipient}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {lastMessages[chat.chatId]
                                  ? getRelativeTime(
                                      getISOStringFromTimestamp(
                                        lastMessages[chat.chatId]!.createdAt
                                      )
                                    )
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage
                                ? `${lastMessageSenderFirstname}: 
                                  ${lastMessageContent}`
                                : `No messages in this chat yet.`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </>
          )}

          {viewState === "chatView" && selectedChat && (
            <>
              <div className="flex items-center gap-3 p-4 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      selectedChat.chatMembers!.length > 2
                        ? lastMessages[selectedChatId!]?.sender.pfpPath
                        : selectedChat.chatMembers?.find(
                            (member) => member._id != user!.userId
                          )?.pfpPath
                    }
                    alt={selectedChat.chatName}
                  />
                  <AvatarFallback>
                    {selectedChat.chatName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {selectedChat.chatName}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Link to={`conversations/${selectedChatId}`}>
                    <Maximize2 className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {!hasNextPage && allMessages.length > 0 && (
                      <p className="p-3 text-center text-sm border-b text-gray-500">
                        This is the beginning of your chat with {chatRecipient}.
                      </p>
                    )}
                    {hasNextPage && (
                      <div ref={ref} style={{ height: "1px" }}></div>
                    )}
                    {loadingMore && (
                      <Loader2 className="mx-auto animate-spin" />
                    )}
                    {allMessages.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm">
                        No messages in this chat.
                      </p>
                    )}
                    {allMessages.map((message: any) => {
                      const timestamps = transformTimestamps(
                        message.createdAt,
                        message.updatedAt
                      );
                      const formattedDate = formatDateForChat(
                        timestamps.createdAt
                      );
                      let lastDate: any = null; // Reset for each render cycle
                      const showDateSeparator =
                        lastDate === null || lastDate !== formattedDate;
                      if (showDateSeparator) {
                        lastDate = formattedDate;
                      }

                      const usersWhoLastSawThisMessage = Object.entries(
                        usersLastSeen || {}
                      ).reduce<BasicUserData[]>((acc, [_, seenData]) => {
                        if (
                          seenData.messageId === message._id &&
                          seenData.user._id !== user?.userId
                        ) {
                          acc.push(seenData.user);
                        }
                        return acc;
                      }, []);

                      return (
                        <li key={message._id}>
                          {showDateSeparator && (
                            <DateSeparator date={formattedDate} />
                          )}
                          <Message
                            _id={message._id}
                            sender={message.sender}
                            content={message.content}
                            own={user?.userId === message.sender._id}
                            isLastMessage={message._id === lastMessageId}
                            chatId={selectedChatId!}
                            lastSeenByAvatars={usersWhoLastSawThisMessage}
                            {...timestamps}
                          />
                        </li>
                      );
                    })}
                    {typingMessage && (
                      <div className="text-muted-foreground text-sm m-2">
                        {typingMessage}
                      </div>
                    )}
                    <div ref={bottomDivRef}></div>
                  </div>
                </ScrollArea>
              )}
              <ChatForm chatId={selectedChatId!} />
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default ChatOpener;
