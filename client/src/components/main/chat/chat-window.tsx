import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";

import ChatForm from "../../forms/chat-form";
import { Chat } from "./chat";
import ChatHeader from "./chat-header";

const ChatWindow = () => {
  const { chatId } = useParams();

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
      <ChatForm chatId={chatId as string} />
    </>
  );
};

export default ChatWindow;
