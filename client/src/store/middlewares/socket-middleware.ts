import { Middleware } from "@reduxjs/toolkit";

import { getSocket } from "@/context/socket-singleton";

import { chatActions, fetchUserConversations } from "../chat-slice";
import { RootState } from "../store";

export const socketActions = {
  connect: "socket/connect",
  disconnect: "socket/disconnect",
};

let listenersInitialized: boolean = false;

const createSocketMiddleware = (): Middleware<object, RootState> => {
  const socketMiddleware: Middleware<object, RootState> =
    (store) => (next) => (action: any) => {
      const socket = getSocket();
      if (action.type === socketActions.connect) {
        if (socket && !listenersInitialized) {
          // Set up listeners for incoming socket events
          socket.on("connect", () => {
            console.log("Socket connected!");
            // Optionally dispatch a status update action
            // store.dispatch({ type: 'socket/statusConnected' });
            store.dispatch(fetchUserConversations() as any);
          });

          socket.on("disconnect", () => {
            console.log("Socket disconnected!");
            // Optionally dispatch a status update action
            // store.dispatch({ type: 'socket/statusDisconnected' });
          });

          socket.on("connect_error", (error: Error) => {
            console.error("Socket connection error:", error);
            // Optionally dispatch an error action
            // store.dispatch({ type: 'socket/connectionError', payload: error.message });
          });

          // Listen for new messages from the server
          socket.on("newMessage", (payload) => {
            const { message } = payload;
            store.dispatch(
              chatActions.messageReceived({
                message,
                currentUserId: store.getState().auth.user!.userId,
              })
            );
          });

          socket.on("messageSeen", (payload) => {
            store.dispatch(chatActions.setLastSeen(payload));
          });

          listenersInitialized = true;
        }
      } else if (action.type === socketActions.disconnect) {
        if (socket) {
          socket.disconnect();
        }
      }

      // Handle outgoing messages (actions that trigger socket emissions)
      if (socket && socket.connected) {
        if (chatActions.messageSent.match(action)) {
          const { message } = action.payload;
          socket.emit("sendMessage", { message });
        }

        if (chatActions.joinChatRooms.match(action)) {
          const chats = action.payload;
          const chatIds = chats.map((chat: any) => chat._id);
          chatIds.push(store.getState().auth.user?.userId as string); // Ensure the current user joins their own chat rooms
          socket.emit("joinChatRooms", { chatIds });
        }

        if (chatActions.setSeen.match(action)) {
          socket.emit("setSeen", action.payload);
        }
      }

      return next(action);
    };
  return socketMiddleware;
};

export default createSocketMiddleware;
