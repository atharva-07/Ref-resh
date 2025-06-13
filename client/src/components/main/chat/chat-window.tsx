import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";

import useSocket from "@/hooks/useSocket";

import ChatForm from "../../forms/ChatForm";
import { TimeStamps } from "../post/post";
import { Chat } from "./chat";

interface ChatWindowProps extends TimeStamps {
  members: string[];
}

const ChatWindow = () => {
  const { chatId } = useParams();
  const recipient = "Clown"; // TODO: FIXME: What if it's a group chat?

  const { socket, isConnected, sendMessage, on, off } = useSocket(
    `${import.meta.env.VITE_SOCKET_SERVER_URI}`
  );

  if (!isConnected) {
    return <div>Connecting to chat...</div>;
  }

  return (
    <>
      {!chatId && <p>Select a converastion to view its mesasges.</p>}
      <div className="flex flex-col h-screen border justify-between">
        <div>{recipient}</div>
        <ErrorBoundary fallback={<p>Error loading messages.</p>}>
          <Suspense fallback={<p>Loading messages...</p>}>
            <Chat chatId={chatId as string} on={on} off={off} />
          </Suspense>
        </ErrorBoundary>
        <ChatForm onSendMessage={sendMessage} />
      </div>
    </>
  );
};

export default ChatWindow;
