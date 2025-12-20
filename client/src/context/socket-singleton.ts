import { io } from "socket.io-client";

import { Participant } from "@/store/call-slice";
import { SocketMessage } from "@/store/chat-slice";

interface SocketEvents {
  authenticate: (payload: { userId: string }) => void;
  setActiveUsers: (payload: { userIds: string[] }) => void;
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
  addNewChat: (payload: {
    chatId: string;
    chatMembers: Participant[];
    chatName: string;
  }) => void;
  newChatCreated: (payload: { chatId: string }) => void;
  callIncoming: (payload: {
    chatId: string;
    callId: string;
    caller: Participant;
    peerId: string;
  }) => void;
  callUserJoined: (payload: {
    chatId: string;
    user: Participant;
    peerId: string;
    currentParticipants: string[];
  }) => void;
  callUserLeft: (payload: { chatId: string; userId: string }) => void;
  callEnded: (payload: { chatId: string; lastUserId: string }) => void;
  callInitiate: (payload: {
    chatId: string;
    callId: string;
    caller: Participant;
    peerId: string;
  }) => void;
  callJoin: (payload: {
    chatId: string;
    user: Participant;
    peerId: string;
  }) => void;
  callHangup: (payload: { chatId: string; userId: string }) => void;
  callExists: () => void;
  callError: (payload: { chatId: string; reason: string }) => void;
  tokenExpiring: () => void;
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
    // socket.connect();
  }
  return socket;
};

export const getSocket = (): ClientSocket | null => {
  return socket;
};
