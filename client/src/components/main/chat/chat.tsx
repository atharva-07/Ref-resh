import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/hooks/useChatMessages";
import {
  formatDateForChat,
  transformTimestamps,
} from "@/utility/utility-functions";

import { BasicUserData } from "../post/post";
import Message from "./message";

interface ChatProps {
  chatId: string;
}

export const DateSeparator = ({ date }: { date: string }) => {
  return (
    <div
      style={{
        textAlign: "center",
        margin: "15px 0",
        fontSize: "0.85em",
        color: "#666",
      }}
    >
      <span>{date}</span>
    </div>
  );
};

export const Chat = ({ chatId }: ChatProps) => {
  let lastDate: any = null;
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
  } = useChatMessages(chatId);

  // Use a ref to track if the chat is already open.
  const isChatOpenRef = useRef(false);

  // Logic to handle autoscrolling
  useEffect(() => {
    if (!bottomDivRef.current || loading || loadingMore) return;

    // Scroll to the bottom only on the initial load of the chat.
    if (!isChatOpenRef.current) {
      bottomDivRef.current.scrollIntoView({ behavior: "auto" });
      isChatOpenRef.current = true;
      return;
    }

    // For subsequent messages (new messages from sockets, etc.), scroll smoothly.
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      if (isAtBottom) {
        bottomDivRef.current.scrollIntoView({ behavior: "auto" });
      }
    }
  }, [allMessages, loading, loadingMore]);

  // Reset the `isChatOpenRef` when the `chatId` changes.
  useEffect(() => {
    isChatOpenRef.current = false;
  }, [chatId]);

  const bottomDivRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="relative grow h-5/6 border">
      {!hasNextPage && allMessages.length > 0 && (
        <p className="p-3 text-center text-sm text-gray-500 border-b">
          This is the beginning of your chat with {chatRecipient}.
        </p>
      )}
      {hasNextPage && (
        <div
          ref={ref}
          style={{
            height: "1px",
          }}
        ></div>
      )}
      {loadingMore && <Loader2 className="mx-auto animate-spin" />}
      {!allMessages ||
        (allMessages && allMessages.length <= 0 && (
          <div className="flex m-auto items-center justify-center">
            <div className="mt-20 text-center">
              <p>This is the beginning of your chat with {chatRecipient}.</p>
              <p>No messages in this chat yet.</p>
              <h3 className="mt-10">Say Hi. 👋🏻</h3>
            </div>
          </div>
        ))}
      <ol>
        {allMessages &&
          allMessages.length > 0 &&
          allMessages.map((message: any) => {
            const timestamps = transformTimestamps(
              message.createdAt,
              message.updatedAt
            );
            const date = timestamps.createdAt;
            const formattedDate = formatDateForChat(date);
            const showDateSeparator =
              lastDate === null || lastDate !== formattedDate;

            if (showDateSeparator) {
              lastDate = formattedDate;
            }

            const usersWhoLastSawThisMessage = Object.entries(
              usersLastSeen || {}
            ).reduce<BasicUserData[]>((acc, [userId, seenData]) => {
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
                {showDateSeparator && <DateSeparator date={formattedDate} />}
                <Message
                  _id={message._id}
                  sender={message.sender}
                  content={message.content}
                  own={user?.userId === message.sender._id}
                  isLastMessage={message._id === lastMessageId}
                  chatId={chatId}
                  lastSeenByAvatars={usersWhoLastSawThisMessage}
                  {...timestamps}
                />
              </li>
            );
          })}
      </ol>
      {typingMessage && (
        <div className="absolute bottom-1 left-1 text-muted-foreground text-sm m-2">
          {typingMessage}
        </div>
      )}
      <div ref={bottomDivRef}></div>
    </ScrollArea>
  );
};
