import { Middleware } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

import { getSocket } from "@/context/socket-singleton";

import {
  chatActions,
  fetchUserConversations,
  SocketMessage,
} from "../chat-slice";
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
          // Set up listeners for incoming socket eve\nts
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
            console.log("New message received from socket:", payload);
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
          // Optimistic update already happened in the reducer
          const { message } = action.payload;
          // const tempId = action.meta.arg.tempId; // Assuming sendMessage action carries tempId in meta if needed for success/fail
          socket.emit("sendMessage", { message });

          // IMPORTANT: The server should acknowledge the message and send back the 'real' message
          // with a proper _id and server timestamps. You'd listen for a server-side 'messageSentConfirmation'
          // or just rely on the 'newMessage' event if the server broadcasts it back to the sender as well.
          // For demonstration, let's simulate success/failure if you don't have server confirmation logic here
          // (In a real app, you'd rely on the server confirming via a separate event or the 'newMessage' broadcast)
          // setTimeout(() => {
          //   const realMessage: Message = {
          //     _id: `real-${Date.now()}`,
          //     chatId: action.payload.chatId,
          //     sender: { _id: 'currentUserId123', username: 'You' },
          //     content: action.payload.content,
          //     createdAt:  new Date().toISOString(),
          //     updatedAt: new Date().toISOString(),
          //     status: 'sent',
          //   };
          //   store.dispatch(messageSentSuccess({ tempId: '...', realMessage }));
          // }, 1000);
          // store.dispatch(
          //   chatActions.messageSent({
          //     chatId,
          //     message,
          //   })
          // );
          // console.log("messageSent action dispatched:", action.payload);
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

        // Add more outgoing socket events here
        // if (action.type === "chat/setTyping") {
        //   const { chatId, message } = action.payload;
        //   const firstName = message.sender.firstName;
        //   socket.emit("setTyping", { chatId, firstName });
        // }
      }

      return next(action); // Pass the action to the next middleware or reducer
    };
  return socketMiddleware;
};

export default createSocketMiddleware;
