import * as dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer);

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

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);
  socket.on("sendMessage", (payload: { message: SocketMessage }) => {
    const { message } = payload;
    console.log("Message received:", message);
    io.to(message.chat._id).emit("newMessage", { message });
  });

  socket.on("joinChatRooms", (payload: { chatIds: string[] }) => {
    const { chatIds } = payload;
    chatIds.forEach((chatId: string) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
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
      io.to(chatId).emit("messageSeen", payload);
    }
  );

  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);
  });
});

httpServer.listen({ port: process.env.DEV_PORT || 7000 }, () => {
  console.log(`Server is up and running on port ${process.env.DEV_PORT}`);
});
