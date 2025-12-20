export interface User {
  _id: string;
  pfpPath: string;
  firstName: string;
  lastName: string;
  userName: string;
}

export interface SocketMessage {
  _id: string;
  content: string;
  chat: {
    _id: string;
    chatName: string;
  };
  sender: User;
  createdAt: string;
  updatedAt: string;
}

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
    chatMembers: User[];
    chatName: string;
  }) => void;
  newChatCreated: (payload: { chatId: string }) => void;
  callIncoming: (payload: {
    chatId: string;
    callId: string;
    caller: User;
    peerId: string;
  }) => void;
  callUserJoined: (payload: {
    chatId: string;
    user: User;
    peerId: string;
    currentParticipants: string[];
  }) => void;
  callUserLeft: (payload: { chatId: string; userId: string }) => void;
  callEnded: (payload: { chatId: string; lastUserId: string }) => void;
  callInitiate: (payload: {
    chatId: string;
    callId: string;
    caller: User;
    peerId: string;
  }) => void;
  callJoin: (payload: { chatId: string; user: User; peerId: string }) => void;
  callHangup: (payload: { chatId: string; userId: string }) => void;
  callExists: () => void;
  callError: (payload: { chatId: string; reason: string }) => void;
  tokenExpiring: () => void;
}

export type ClientSocket = import("socket.io").Socket<
  SocketEvents,
  SocketEvents
>;
