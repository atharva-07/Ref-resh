import { io, Socket } from "socket.io-client";

import { SocketMessage } from "@/store/chat-slice";

interface SocketEvents {
  newMessage: (payload: { message: SocketMessage }) => void;
  sendMessage: (payload: { message: SocketMessage }) => void;
  startTyping: (payload: { chatId: string; username: string }) => void;
  setTyping: (payload: { username: string; chatId: string }) => void;
  stopTyping: (payload: { chatId: string; username: string }) => void;
  clearTyping: (payload: { username: string; chatId: string }) => void;
  setSeen: (payload: {
    chatId: string;
    userId: string;
    messageId: string;
    timestamp: string;
  }) => void;
  messageSeen: (payload: {
    chatId: string;
    userId: string;
    messageId: string;
    timestamp: string;
  }) => void;
  joinChatRooms: (payload: { chatIds: string[] }) => void;
}

export type ClientSocket = import("socket.io-client").Socket<
  SocketEvents,
  SocketEvents
>;

let socket: ClientSocket | null = null;

export const initializeSocket = (socketUrl: string): ClientSocket => {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true,
    });
    socket.connect();
  }
  return socket;
};

export const getSocket = (): ClientSocket | null => {
  return socket;
};
