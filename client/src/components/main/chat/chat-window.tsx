import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { chatActions } from "@/store/chat-slice";
import { socketActions } from "@/store/middlewares/socket-middleware";

import ChatForm from "../../forms/chat-form";
import { TimeStamps } from "../post/post";
import { Chat } from "./chat";
import ChatHeader from "./chat-header";

interface ChatWindowProps extends TimeStamps {
  members: string[];
}

const ChatWindow = () => {
  const { chatId } = useParams();

  // const { isConnected, emitEvent, on, off } = useSocket(
  //   `${import.meta.env.VITE_SOCKET_SERVER_URI}`
  // );

  // if (!isConnected) {
  //   return <div>Connecting to chat...</div>;
  // }

  return (
    <>
      {!chatId && <p>Select a converastion to view its messages.</p>}
      <ChatHeader chatId={chatId as string} />
      <ErrorBoundary fallback={<h2>Error loading messages.</h2>}>
        {/* TODO: Check if Suspense can be used here. Right now it causes an issue. The fallback loader takes over and the entire chat window is not displayed. */}
        {/* <Suspense fallback={<Loader2 className="animate-spin" />}> */}
        <Chat chatId={chatId as string} />
        {/* </Suspense> */}
      </ErrorBoundary>
      <ChatForm />
    </>
  );
};

export default ChatWindow;
