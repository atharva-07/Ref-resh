import { ReactNode, useEffect, useState } from "react";

import { SocketContext } from "./socket-context";
import { ClientSocket, initializeSocket } from "./socket-singleton";

const socketUrl =
  import.meta.env.VITE_SOCKET_SERVER_URI || "http://localhost:7000";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<ClientSocket | null>(null);

  useEffect(() => {
    const currentSocket = initializeSocket(socketUrl);
    setSocket(currentSocket);
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
