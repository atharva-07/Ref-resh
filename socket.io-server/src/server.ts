import * as dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";

import { ClientSocket, SocketMessage, User } from "./types";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer);

const activeUsers = new Map<string, string>();

const activeCalls = new Map<
  string,
  {
    callerId: string;
    participants: Set<User>;
  }
>();

const MAX_CALL_PARTICIPANTS = 4;

io.on("connection", (socket: ClientSocket) => {
  console.log("A user connected: ", socket.id);
  let currentUserId: string | null = null;

  socket.on("authenticate", (payload: { userId: string }) => {
    const { userId } = payload;
    currentUserId = userId;
    activeUsers.set(userId, socket.id);
    const userIds = Array.from(activeUsers.keys());
    io.emit("setActiveUsers", { userIds });
  });

  socket.on("sendMessage", (payload: { message: SocketMessage }) => {
    const { message } = payload;
    console.log("Message received:", message);
    io.to(message.chat._id).emit("newMessage", { message });
  });

  socket.on("joinChatRooms", (payload: { chatIds: string[] }) => {
    const { chatIds } = payload;
    chatIds.forEach((chatId: string) => {
      socket.join(chatId);
      // console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
    });
  });

  socket.on("startTyping", (payload: { chatId: string; username: string }) => {
    const { chatId, username } = payload;
    console.log(`User ${username} is typing in chat ${chatId}`);
    io.to(chatId).emit("setTyping", { username, chatId });
  });

  socket.on("stopTyping", (payload: { chatId: string; username: string }) => {
    const { chatId, username } = payload;
    console.log(`User ${username} is typing in chat ${chatId}`);
    io.to(chatId).emit("clearTyping", { username, chatId });
  });

  socket.on(
    "setSeen",
    (payload: {
      chatId: string;
      messageId: string;
      userId: string;
      timestamp: string;
    }) => {
      const { messageId, chatId, userId, timestamp } = payload;
      console.log(
        `Message ${messageId} in chat ${chatId} seen by user ${userId} at ${timestamp}`
      );
      console.log(payload);
      io.to(chatId).emit("messageSeen", payload);
    }
  );

  socket.on(
    "addNewChat",
    (payload: { chatId: string; chatMembers: User[]; chatName: string }) => {
      const { chatId, chatMembers, chatName } = payload;
      chatMembers.forEach((member) => {
        const memberSocketId = activeUsers.get(member._id);
        if (memberSocketId) {
          io.to(memberSocketId).emit("newChatCreated", {
            chatId,
          });
        }
      });
    }
  );

  socket.on(
    "callInitiate",
    (payload: {
      chatId: string;
      callId: string;
      caller: User;
      peerId: string;
    }) => {
      console.log("Initiating call with payload: ", payload);
      const { chatId, callId, caller, peerId } = payload;

      if (activeCalls.has(chatId)) {
        // Call already active: send an event back or handle as join attempt
        console.log("Call already active in this chat.");
        socket.emit("callExists");
        return;
      }

      // Create new call session
      activeCalls.set(chatId, {
        callerId: caller._id,
        participants: new Set([caller]), // Add the caller
      });

      // Notify all other members in the chat room (excluding caller)
      socket.to(chatId).emit("callIncoming", {
        chatId,
        callId,
        caller,
        peerId, // Caller's PeerJS ID
      });
      console.log(`Call initiated in chat ${chatId} by ${caller._id}`);
    }
  );

  // 2. Client joins an active call
  socket.on(
    "callJoin",
    (payload: { chatId: string; user: User; peerId: string }) => {
      console.log("Joining call with payload: ", payload);

      const { chatId, user, peerId } = payload;
      const callSession = activeCalls.get(chatId);

      if (!callSession) {
        console.log("Call does not exist in activeCalls.");
        socket.emit("callError", {
          chatId,
          reason: "Call ended or does not exist.",
        });
        return;
      }

      if (callSession.participants.size >= MAX_CALL_PARTICIPANTS) {
        console.log("Call already has 4 participants.");
        socket.emit("callError", {
          chatId,
          reason: "Call is full (max 4 participants).",
        });
        return;
      }

      // Notify ALL other current participants (including the caller) that a new user is joining
      // This is crucial for WebRTC mesh networking
      const joinedUserIds = Array.from(callSession.participants).map(
        (user) => user._id
      );
      socket.to(chatId).emit("callUserJoined", {
        chatId,
        user,
        peerId,
        currentParticipants: joinedUserIds, // Send list of users already in call
      });

      // Add the new user to the session
      callSession.participants.add(user);

      // Update the map (optional, since Maps are mutable)
      activeCalls.set(chatId, callSession);
      console.log(
        `User ${user._id} joined call in chat ${chatId}. Total: ${callSession.participants.size}`
      );
    }
  );

  // 3. Client hangs up/leaves
  socket.on("callHangup", (payload: { chatId: string; userId: string }) => {
    console.log("Leaving call with payload: ", payload);

    const { chatId, userId } = payload;
    const callSession = activeCalls.get(chatId);

    if (callSession) {
      for (const participant of callSession.participants) {
        if (participant._id === userId) {
          callSession.participants.delete(participant);
          break;
        }
      }

      socket.to(chatId).emit("callUserLeft", { chatId, userId });
      console.log(
        `User ${userId} left call in chat ${chatId}. Remaining: ${callSession.participants.size}`
      );

      // End the call session if everyone has left
      if (callSession.participants.size === 1) {
        const lastUserId = Array.from(callSession.participants).at(0)?._id;
        activeCalls.delete(chatId);
        io.to(chatId).emit("callEnded", { chatId, lastUserId });
        console.log(`Call ended in chat ${chatId}.`);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);
    // Disconnect the user from the call
    if (currentUserId && activeUsers.get(currentUserId) === socket.id) {
      // Remove the user from the map
      activeUsers.delete(currentUserId);

      // 4. Broadcast the updated list again
      const userIds = Array.from(activeUsers.keys());
      io.emit("setActiveUsers", { userIds });
    }
  });
});

httpServer.listen({ port: process.env.DEV_PORT || 7000 }, () => {
  console.log(`Server is up and running on port ${process.env.DEV_PORT}`);
});
