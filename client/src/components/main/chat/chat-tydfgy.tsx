import { useEffect, useState } from "react";

import useSocket from "../../../hooks/useSocket";

function Chat() {
  const { socket, isConnected, sendMessage, on, off } = useSocket(
    "http://localhost:3001"
  );
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const handleReceiveMessage = (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    on("message", handleReceiveMessage);

    return () => {
      off("message", handleReceiveMessage);
    };
  }, [on, off]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      sendMessage("message", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div>
      <p>{isConnected ? "Connected" : "Disconnected"}</p>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}

export default Chat;
