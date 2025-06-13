import { useCallback, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

function useSocket(url: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(url, {
      transports: ["websocket"],
      withCredentials: true,
    });
    setSocket(socketRef.current);

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  const sendMessage = useCallback(
    (event: string, data: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit(event, data);
      }
    },
    [isConnected]
  );

  const on = useCallback((event: string, callback: any) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback: any) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  return { socket, isConnected, sendMessage, on, off };
}

export default useSocket;
