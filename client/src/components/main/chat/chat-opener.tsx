// "use client";

// import {
//   ArrowLeft,
//   Maximize2,
//   MessageCircle,
//   MessageCircleIcon,
//   Send,
//   X,
// } from "lucide-react";
// import type React from "react";
// import { useState } from "react";
// import { Link } from "react-router-dom";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useAppSelector } from "@/hooks/useAppSelector";
// import { cn } from "@/lib/utils";
// import { getLastMessages } from "@/store/chat-slice";
// import {
//   formatDateForChat,
//   getRelativeTime,
//   transformTimestamps,
// } from "@/utility/utility-functions";

// import { DateSeparator } from "./chat";
// import Message from "./Message";

// type ViewState = "closed" | "chatList" | "chatView";

// const ChatOpener = () => {
//   let lastDate: any = null;

//   const { user } = useAppSelector((state) => state.auth);
//   const { chats } = useAppSelector((state) => state.chat);
//   const lastMessages = useAppSelector(getLastMessages);

//   const [viewState, setViewState] = useState<ViewState>("closed");
//   const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
//   const [newMessage, setNewMessage] = useState("");

//   const selectedChat = selectedChatId
//     ? chats.find((chat) => chat.chatId === selectedChatId)
//     : null;
//   const messages = selectedChatId ? selectedChat?.chatMessages || [] : [];
//   const lastMessage = lastMessages[selectedChatId!];

//   const handleChatSelect = (chatId: string) => {
//     setSelectedChatId(chatId);
//     setViewState("chatView");
//   };

//   const handleBack = () => {
//     setViewState("chatList");
//     setSelectedChatId(null);
//   };

//   const handleMaximize = () => {
//     if (selectedChatId) {
//       // router.push(`/chat/${selectedChatId}`);
//     }
//   };

//   const handleClose = () => {
//     setViewState("closed");
//     setSelectedChatId(null);
//   };

//   const handleSendMessage = () => {
//     if (newMessage.trim()) {
//       // In a real app, you would send the message to your backend
//       console.log("Sending message:", newMessage);
//       setNewMessage("");
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <>
//       {/* Chat Opener Button */}
//       <div
//         className="bg-background flex items-center border-t p-3 sm:justify-between hover:cursor-pointer hover:bg-accent"
//         onClick={() => setViewState("chatList")}
//       >
//         <div className="flex gap-2">
//           <MessageCircleIcon className="h-6 w-6"></MessageCircleIcon>
//           <p>Messages</p>
//         </div>
//         {[].length > 0 && (
//           <div className="flex -space-x-2 overflow-hidden">
//             {[].map((user: any) => (
//               <Avatar key={user._id} className="h-8 w-8 rounded-lg">
//                 <AvatarImage
//                   src={user?.pfpPath}
//                   alt={`${user?.firstName} ${user.lastName}`}
//                 />
//                 <AvatarFallback>
//                   {user.firstName[0] + user.lastName[0]}
//                 </AvatarFallback>
//               </Avatar>
//             ))}
//           </div>
//         )}
//       </div>
//       {/* <Button
//         onClick={() => setViewState("chatList")}
//         className={cn(
//           "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
//           "hover:scale-105 transition-transform duration-200",
//           viewState !== "closed" && "hidden"
//         )}
//         size="icon"
//       >
//         <MessageCircle className="h-6 w-6" />
//       </Button> */}

//       {/* Chat Popup */}
//       {viewState !== "closed" && (
//         <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 flex flex-col">
//           {viewState === "chatList" && (
//             <>
//               {/* Chat List Header */}
//               <div className="flex items-center justify-between p-4 border-b">
//                 <h3 className="font-semibold">Messages</h3>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleClose}
//                   className="h-8 w-8"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>

//               {/* Chat List */}
//               <ScrollArea className="flex-1">
//                 <div className="p-2">
//                   {chats.map((chat) => (
//                     <div
//                       key={chat.chatId}
//                       onClick={() => handleChatSelect(chat.chatId)}
//                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
//                     >
//                       <Avatar className="h-10 w-10">
//                         <AvatarImage
//                           src={
//                             (lastMessage && lastMessage.sender.pfpPath) ||
//                             "/placeholder.svg"
//                           }
//                           alt={chat.chatName}
//                         />
//                         <AvatarFallback>
//                           {chat.chatName
//                             .split(" ")
//                             .map((n) => n[0])
//                             .join("")}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center justify-between">
//                           <p className="font-medium text-sm truncate">
//                             {chat.chatName}
//                           </p>
//                           <span className="text-xs text-muted-foreground">
//                             {/* {getRelativeTime(
//                               lastMessage!.createdAt
//                             )} */}
//                             {getRelativeTime(new Date().toISOString())}{" "}
//                             {/*{SVR6: FIX ON PRIORITY.}*/}
//                           </span>
//                         </div>
//                         <p className="text-sm text-muted-foreground truncate">
//                           {}
//                         </p>
//                       </div>
//                       {/* {chat.unread > 0 && (
//                         <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                           {chat.unread}
//                         </div>
//                       )} */}
//                     </div>
//                   ))}
//                 </div>
//               </ScrollArea>
//             </>
//           )}

//           {viewState === "chatView" && selectedChat && (
//             <>
//               {/* Chat Header */}
//               <div className="flex items-center gap-3 p-4 border-b">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleBack}
//                   className="h-8 w-8"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                 </Button>
//                 <Avatar className="h-8 w-8">
//                   <AvatarImage
//                     src={
//                       selectedChat.chatMembers!.length > 2
//                         ? lastMessage?.sender.pfpPath
//                         : selectedChat.chatMembers?.filter(
//                             (member) => member._id != user!.userId
//                           )[0].pfpPath
//                     }
//                     alt={selectedChat.chatName}
//                   />
//                   <AvatarFallback>
//                     {selectedChat.chatName
//                       .split(" ")
//                       .map((n) => n[0])
//                       .join("")}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium text-sm truncate">
//                     {selectedChat.chatName}
//                   </p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleMaximize}
//                   className="h-8 w-8"
//                 >
//                   <Link to={`conversations/${selectedChatId}`}>
//                     <Maximize2 className="h-4 w-4" />
//                   </Link>
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleClose}
//                   className="h-8 w-8"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>

//               {/* Messages */}
//               <ScrollArea className="flex-1 p-4">
//                 <div className="space-y-4">
//                   {messages.map(
//                     (
//                       message: any // TODO: FIX??
//                     ) => {
//                       const timestamps = transformTimestamps(
//                         message.createdAt,
//                         message.updatedAt
//                       );

//                       const date = timestamps.createdAt;
//                       const formattedDate = formatDateForChat(date);

//                       const showDateSeparator =
//                         lastDate === null || lastDate !== formattedDate;

//                       if (showDateSeparator) {
//                         lastDate = formattedDate;
//                       }

//                       return (
//                         <li key={message._id}>
//                         {showDateSeparator && <DateSeparator date={formattedDate} />}
//                         <Message
//                           _id={message._id}
//                           sender={message.sender}
//                           content={message.content}
//                           own={user?.userId === message.sender._id}
//                           isLastMessage={message._id === lastMessageId}
//                           chatId={chatId}
//                           lastSeenByAvatars={usersWhoLastSawThisMessage}
//                           {...timestamps}
//                         />
//                       </li>
//                       );
//                     }
//                   )}
//                   {/* {messages.map((message) => (
//                     <div
//                       key={message.id}
//                       className={cn(
//                         "flex",
//                         message.sender === "me"
//                           ? "justify-end"
//                           : "justify-start"
//                       )}
//                     >
//                       <div
//                         className={cn(
//                           "max-w-[70%] rounded-lg px-3 py-2 text-sm",
//                           message.sender === "me"
//                             ? "bg-primary text-primary-foreground"
//                             : "bg-muted"
//                         )}
//                       >
//                         <p>{message.text}</p>
//                         <p
//                           className={cn(
//                             "text-xs mt-1",
//                             message.sender === "me"
//                               ? "text-primary-foreground/70"
//                               : "text-muted-foreground"
//                           )}
//                         >
//                           {message.timestamp}
//                         </p>
//                       </div>
//                     </div>
//                   ))} */}
//                 </div>
//               </ScrollArea>

//               {/* Message Input */}
//               <div className="p-4 border-t">
//                 <div className="flex gap-2">
//                   <Input
//                     placeholder="Type a message..."
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     className="flex-1"
//                   />
//                   <Button
//                     onClick={handleSendMessage}
//                     size="icon"
//                     disabled={!newMessage.trim()}
//                   >
//                     <Send className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </Card>
//       )}
//     </>
//   );
// };

// export default ChatOpener;

"use client";

import {
  ArrowLeft,
  Loader2,
  Maximize2,
  MessageCircleIcon,
  Send,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useChatMessages } from "@/hooks/useChatMessages";
import { cn } from "@/lib/utils";
import { getLastMessages } from "@/store/chat-slice";
import {
  formatDateForChat,
  getRelativeTime,
  transformTimestamps,
} from "@/utility/utility-functions";

import { DateSeparator } from "./chat";
import Message from "./message";

type ViewState = "closed" | "chatList" | "chatView";

const ChatOpener = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { chats } = useAppSelector((state) => state.chat);
  const lastMessages = useAppSelector(getLastMessages);

  const [viewState, setViewState] = useState<ViewState>("closed");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const selectedChat = selectedChatId
    ? chats.find((chat) => chat.chatId === selectedChatId)
    : null;

  // Conditionally call the hook only when a chat is selected
  const chatMessagesData = useChatMessages(selectedChatId!);

  // Use a ref to track initial scroll behavior
  const initialScrollRef = useRef(true);
  const bottomDivRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset initial scroll ref when the chat changes
    initialScrollRef.current = true;
  }, [selectedChatId]);

  // Autoscroll logic
  useEffect(() => {
    if (
      chatMessagesData &&
      bottomDivRef.current &&
      !chatMessagesData.loading &&
      !chatMessagesData.loadingMore
    ) {
      if (initialScrollRef.current) {
        bottomDivRef.current.scrollIntoView({ behavior: "auto" });
        initialScrollRef.current = false;
      } else {
        const scrollArea = scrollAreaRef.current;
        if (scrollArea) {
          const { scrollTop, scrollHeight, clientHeight } = scrollArea;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
          if (isAtBottom) {
            bottomDivRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    }
  }, [chatMessagesData, chatMessagesData?.allMessages]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setViewState("chatView");
  };

  const handleBack = () => {
    setViewState("chatList");
    setSelectedChatId(null);
  };

  const handleMaximize = () => {
    if (selectedChatId) {
      // Logic to navigate to the full chat view, e.g., router.push(`/conversations/${selectedChatId}`);
    }
  };

  const handleClose = () => {
    setViewState("closed");
    setSelectedChatId(null);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, you would use a mutation to send the message
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Opener Button */}
      <div
        className="bg-background flex items-center border-t p-3 sm:justify-between hover:cursor-pointer hover:bg-accent"
        onClick={() => setViewState("chatList")}
      >
        <div className="flex gap-2">
          <MessageCircleIcon className="h-6 w-6"></MessageCircleIcon>
          <p>Messages</p>
        </div>
        {/* ... (unread avatars remain the same) */}
      </div>

      {/* Chat Popup */}
      {viewState !== "closed" && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 flex flex-col">
          {viewState === "chatList" && (
            <>
              {/* Chat List Header */}
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

              {/* Chat List */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.chatId}
                      onClick={() => handleChatSelect(chat.chatId)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            (lastMessages[chat.chatId] &&
                              lastMessages[chat.chatId]!.sender.pfpPath) ||
                            "/placeholder.svg"
                          }
                          alt={chat.chatName}
                        />
                        <AvatarFallback>
                          {chat.chatName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {chat.chatName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {lastMessages[chat.chatId]
                              ? getRelativeTime(
                                  lastMessages[chat.chatId]!.createdAt
                                )
                              : ""}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessages[chat.chatId]
                            ? lastMessages[chat.chatId]!.content
                            : "No messages yet."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {viewState === "chatView" && chatMessagesData && selectedChat && (
            <>
              {/* Chat Header */}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMaximize}
                  className="h-8 w-8"
                >
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

              {/* Messages */}
              {chatMessagesData.loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessagesData.hasNextPage && (
                      <div
                        ref={chatMessagesData.ref}
                        style={{ height: "1px" }}
                      ></div>
                    )}
                    {chatMessagesData.loadingMore && (
                      <Loader2 className="mx-auto animate-spin" />
                    )}
                    {chatMessagesData.allMessages.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm">
                        No messages in this chat.
                      </p>
                    )}
                    {chatMessagesData.allMessages.map((message: any) => {
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
                            isLastMessage={
                              message._id === chatMessagesData.lastMessageId
                            }
                            chatId={selectedChatId!}
                            lastSeenByAvatars={Object.entries(
                              chatMessagesData.usersLastSeen || {}
                            ).reduce<string[]>((acc, [userId, seenData]) => {
                              if (
                                seenData.messageId === message._id &&
                                seenData.user._id !== user?.userId
                              ) {
                                acc.push(seenData.user.pfpPath);
                              }
                              return acc;
                            }, [])}
                            {...timestamps}
                          />
                        </li>
                      );
                    })}
                    {chatMessagesData.typingMessage && (
                      <div className="text-muted-foreground text-sm m-2">
                        {chatMessagesData.typingMessage}
                      </div>
                    )}
                    <div ref={bottomDivRef}></div>
                  </div>
                </ScrollArea>
              )}

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default ChatOpener;
