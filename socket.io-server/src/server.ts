import * as dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);
  socket.on("newMessage", (message) => {
    console.log("New message received:", message);
    socket.emit("newMessage", message);
  });
});

httpServer.listen({ port: process.env.DEV_PORT || 7000 }, () => {
  console.log(`Server is up and running on port ${process.env.DEV_PORT}`);
});
