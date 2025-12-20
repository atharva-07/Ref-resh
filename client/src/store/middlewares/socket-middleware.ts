import { Middleware } from "@reduxjs/toolkit";
import axios from "axios";

import { getSocket } from "@/context/socket-singleton";

import { authActions, forceLogout } from "../auth-slice";
import { callActions, Participant, terminateCall } from "../call-slice";
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
            store.dispatch(fetchUserConversations() as any);
            const userId = store.getState().auth.user?.userId;
            if (userId) {
              socket.emit("authenticate", { userId });
            }
          });

          socket.on("tokenExpiring", async () => {
            try {
              await axios.post(
                `${import.meta.env.VITE_OAUTH_SERVER_URI}/refresh-token`,
                {}, // Empty body object because we are using cookies to send the refresh token.
                { withCredentials: true }
              );

              socket.disconnect().connect();
            } catch (err) {
              console.error("Failed to silent refresh:", err);
              store.dispatch(forceLogout() as any);
            }
          });

          socket.on("disconnect", () => {
            console.log("Socket disconnected!");
          });

          socket.on("connect_error", async (error: Error) => {
            console.error("Socket connection error:", error);
            if (error.message === "Authorization error") {
              try {
                await axios.post(
                  `${import.meta.env.VITE_OAUTH_SERVER_URI}/refresh-token`,
                  {}, // Empty body object because we are using cookies to send the refresh token.
                  { withCredentials: true }
                );

                socket.connect();
              } catch (error) {
                console.log(error);
                store.dispatch(forceLogout() as any);
              }
            }
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

          socket.on("newChatCreated", (payload: { chatId: string }) => {
            socket.emit("joinChatRooms", { chatIds: [payload.chatId] });
          });

          socket.on(
            "callIncoming",
            (payload: {
              chatId: string;
              callId: string;
              caller: Participant;
              peerId: string;
            }) => {
              store.dispatch(callActions.incomingCall(payload));
            }
          );

          socket.on(
            "callUserJoined",
            (payload: {
              chatId: string;
              user: Participant;
              peerId: string;
              currentParticipants: string[];
            }) => {
              store.dispatch(callActions.userJoined(payload));
            }
          );

          socket.on(
            "callUserLeft",
            (payload: { chatId: string; userId: string }) => {
              const state = store.getState();

              if (
                state.call.activeCall &&
                state.call.activeCall.chatId === payload.chatId
              ) {
                store.dispatch(callActions.userLeft(payload));
              }
            }
          );

          socket.on(
            "callEnded",
            (payload: { chatId: string; lastUserId: string }) => {
              console.log("Socket Middleware: callEnded.");
              // Dispatch action to reset call status and close WebRTC connections
              if (payload.lastUserId === store.getState().auth.user?.userId) {
                store.dispatch(terminateCall(payload) as any);
              } else {
                store.dispatch(callActions.callEnded(payload));
              }
            }
          );

          socket.on("callExists", () => {
            console.log("Socket Middleware: callExists");
            store.dispatch(callActions.setError("Call is already active."));
          });

          socket.on(
            "callError",
            (payload: { chatId: string; reason: string }) => {
              store.dispatch(callActions.setError(payload.reason));
            }
          );

          socket.on("setActiveUsers", (payload: { userIds: string[] }) => {
            store.dispatch(chatActions.setActiveUsers(payload.userIds));
          });

          listenersInitialized = true;
        }

        if (socket && !socket.connected) {
          socket.connect();
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

        if (chatActions.addNewChat.match(action)) {
          const { chatId, chatMembers, chatName } = action.payload;
          socket.emit("addNewChat", { chatId, chatMembers, chatName });
        }

        if (callActions.callInitiate.match(action)) {
          socket.emit("callInitiate", action.payload);
        }

        if (callActions.callJoin.match(action)) {
          socket.emit("callJoin", action.payload);
        }

        if (callActions.callHangup.match(action)) {
          socket.emit("callHangup", action.payload);
        }
      }

      return next(action);
    };
  return socketMiddleware;
};

export default createSocketMiddleware;
