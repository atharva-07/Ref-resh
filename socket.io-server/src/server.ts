import "socket.io";

import cookie from "cookie";
import * as dotenv from "dotenv";
import express from "express";
import { readFileSync } from "fs";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "path";
import { Server } from "socket.io";

import { SocketMessage, User } from "./types";
import logger from "./utils/winston";

declare module "socket.io" {
  interface Socket {
    user?: JwtPayload | string;
  }
}

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

const publicKey: string = readFileSync(
  path.join(path.resolve(), "public.key"),
  "utf-8",
);

const MAX_CALL_PARTICIPANTS = 4;
const WARNING_BUFFER = 60 * 1000;

io.use((socket, next) => {
  const req = socket.request;
  if (!req.headers.cookie) {
    logger.error(
      `No cookies found in request headers for socket ID: ${socket.id}.`,
    );
    return next(new Error("Authorization error"));
  }

  const cookies = cookie.parse(req.headers.cookie);
  const accessToken = cookies.accessToken as string;

  jwt.verify(accessToken, publicKey, (err, decoded) => {
    if (err) {
      logger.error(
        `JWT verification error for socket ID: ${socket.id}. Error: ${err.message}`,
      );
      return next(new Error("Authorization error"));
    }

    socket.user = decoded;

    if (
      decoded &&
      typeof decoded === "object" &&
      "exp" in decoded &&
      typeof decoded.exp === "number"
    ) {
      const expiresIn = decoded.exp * 1000 - Date.now();

      if (expiresIn > 0) {
        const timer = setTimeout(() => {
          socket.disconnect(true);
        }, expiresIn);

        socket.on("disconnect", () => clearTimeout(timer));
      }
    }

    next();
  });
});

io.on("connection", (socket) => {
  const user = socket.user;

  if (!user || typeof user !== "object" || !("exp" in user) || !user.exp)
    return;

  const now = Date.now();
  const timeUntilExpiry = user.exp * 1000 - now;
  const timeUntilWarning = timeUntilExpiry - WARNING_BUFFER;

  if (timeUntilWarning > 0) {
    const warningTimer = setTimeout(() => {
      socket.emit("tokenExpiring");
    }, timeUntilWarning);

    socket.on("disconnect", () => clearTimeout(warningTimer));
  }

  if (timeUntilExpiry > 0) {
    const disconnectTimer = setTimeout(() => {
      socket.disconnect(true);
    }, timeUntilExpiry);

    socket.on("disconnect", () => clearTimeout(disconnectTimer));
  }

  logger.info(`A user connected: ${socket.id}`);
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
    logger.debug(`Message received: ${JSON.stringify(message)}`);
    io.to(message.chat._id).emit("newMessage", { message });
  });

  socket.on("joinChatRooms", (payload: { chatIds: string[] }) => {
    const { chatIds } = payload;
    chatIds.forEach((chatId: string) => {
      socket.join(chatId);
      logger.debug(`Socket (${socket.id}) joined chat (${chatId}).`);
    });
  });

  socket.on("startTyping", (payload: { chatId: string; username: string }) => {
    const { chatId, username } = payload;
    logger.debug(`User (${username}) is typing in chat (${chatId}).`);
    io.to(chatId).emit("setTyping", { username, chatId });
  });

  socket.on("stopTyping", (payload: { chatId: string; username: string }) => {
    const { chatId, username } = payload;
    logger.debug(`User (${username}) stopped typing in chat (${chatId}).`);
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
      logger.debug(
        `Message (${messageId}) in chat (${chatId}) seen by user (${userId}) at ${new Date(Number(timestamp))}.`,
      );
      io.to(chatId).emit("messageSeen", payload);
    },
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
    },
  );

  socket.on(
    "callInitiate",
    (payload: {
      chatId: string;
      callId: string;
      caller: User;
      peerId: string;
    }) => {
      logger.debug(`Initiating call with payload: ${JSON.stringify(payload)}`);
      const { chatId, callId, caller, peerId } = payload;

      if (activeCalls.has(chatId)) {
        // Call already active: send an event back or handle as join attempt
        logger.debug(`Call already active in chat (${chatId}).`);
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
      logger.info(`Call initiated in chat (${chatId}) by (${caller._id}).`);
    },
  );

  socket.on(
    "callJoin",
    (payload: { chatId: string; user: User; peerId: string }) => {
      logger.debug(`Joining call with payload: ${JSON.stringify(payload)}`);

      const { chatId, user, peerId } = payload;
      const callSession = activeCalls.get(chatId);

      if (!callSession) {
        logger.info(`Call in chat (${chatId}) does not exist in activeCalls.`);
        socket.emit("callError", {
          chatId,
          reason: "Call ended or does not exist.",
        });
        return;
      }

      if (callSession.participants.size >= MAX_CALL_PARTICIPANTS) {
        logger.info(`Call in chat (${chatId}) is full (max 4 participants).`);
        socket.emit("callError", {
          chatId,
          reason: "Call is full (max 4 participants).",
        });
        return;
      }

      // Notify ALL other current participants (including the caller) that a new user is joining
      // This is crucial for WebRTC mesh networking
      const joinedUserIds = Array.from(callSession.participants).map(
        (user) => user._id,
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
      logger.info(
        `User (${user._id}) joined call in chat (${chatId}). Total participants: ${callSession.participants.size}`,
      );
    },
  );

  socket.on("callHangup", (payload: { chatId: string; userId: string }) => {
    logger.debug(
      `User hanging up call with payload: ${JSON.stringify(payload)}`,
    );

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
      logger.info(
        `User (${userId}) left the call in chat (${chatId}). Remaining participants: ${callSession.participants.size}`,
      );

      // End the call session if everyone has left
      if (callSession.participants.size === 1) {
        const lastUserId = Array.from(callSession.participants).at(0)?._id;
        activeCalls.delete(chatId);
        io.to(chatId).emit("callEnded", { chatId, lastUserId });
        logger.info(`Call ended in chat (${chatId}).`);
      }
    }
  });

  socket.on("disconnect", () => {
    logger.info(`A user disconnected: ${socket.id}`);
    // Disconnect the user from the call
    if (currentUserId && activeUsers.get(currentUserId) === socket.id) {
      // Remove the user from the map
      activeUsers.delete(currentUserId);

      const userIds = Array.from(activeUsers.keys());
      io.emit("setActiveUsers", { userIds });
    }
  });
});

httpServer.listen({ port: process.env.DEV_PORT || 7000 }, () => {
  logger.info(`Server is up and running on port ${process.env.DEV_PORT}.`);
});
