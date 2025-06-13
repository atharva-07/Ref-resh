import { useSuspenseQuery } from "@apollo/client";
import { useEffect, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { GET_CHAT_MESSAGES } from "@/gql-calls/queries";
import { useAppSelector } from "@/hooks/useAppSelector";
import { transformTimestamps } from "@/utility/utility-functions";

import Message, { MessageProps } from "./Message";

interface ChatProps {
  chatId: string;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

export const Chat = ({ chatId, on, off }: ChatProps) => {
  const { user } = useAppSelector((state) => state.auth);

  const { data } = useSuspenseQuery(GET_CHAT_MESSAGES, {
    variables: {
      chatId: chatId,
    },
    skip: !chatId,
    fetchPolicy: "network-only", // TODO: See if this is really required.
  });

  const [messages, setMessages] = useState<MessageProps[]>(
    [...data!.fetchChatMessages].reverse() // Reverse the messages to display them in chronological order
  );

  console.log(messages);

  useEffect(() => {
    if (data?.fetchChatMessages) {
      setMessages([...data.fetchChatMessages].reverse());
    }
  }, [data]);

  useEffect(() => {
    // 3. Use the 'on' prop to listen for new messages from the socket
    const handleNewMessage = (newMessage: MessageProps | string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        JSON.parse(newMessage as string),
      ]);
    };

    on("newMessage", handleNewMessage); // Listen for 'newMessage' event from the server

    // Clean up the socket listener when the component unmounts
    return () => {
      off("newMessage", handleNewMessage);
    };
  }, [on, off, messages]);

  return (
    <>
      {messages && messages.length <= 0 && <p>No messages in this chat.</p>}
      {messages && messages.length > 0 && (
        <ScrollArea className="grow h-5/6 rounded-md border">
          <ol>
            {messages.map(
              (
                message: any // FIX??
              ) => {
                const timestamps = transformTimestamps(
                  message.createdAt,
                  message.updatedAt
                );

                return (
                  <li key={message._id}>
                    <Message
                      sender={message.sender}
                      content={message.content}
                      own={user?.userId === message.sender._id}
                      {...timestamps}
                    />
                  </li>
                );
              }
            )}
          </ol>
        </ScrollArea>
      )}
    </>
  );
};
