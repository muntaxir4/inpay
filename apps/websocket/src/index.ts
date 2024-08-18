import express from "express";
import { Server } from "socket.io";

interface SocketMessage {
  message: string;
  to: string;
}

const app = express();
const httpServer = app
  .listen(8080, () => {
    console.log("Socket.io Server started on 8080");
  })
  .on("error", (err) => {
    console.log(err);
  });

const io = new Server(httpServer, {
  cors: {
    origin: "http://192.168.0.168:5173",
  },
});
const users: { [key: string]: string } = {};

function getRoomString(user1: string, user2: string) {
  return user1 < user2 ? user1 + "-" + user2 : user2 + "-" + user1;
}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const params = new URLSearchParams(socket.request.url?.split("?")[1]);
  const queryParams = Object.fromEntries(params.entries());
  if (!queryParams.userId) socket.disconnect();
  const userId = queryParams.userId as string;
  users[userId] = socket.id;
  socket.on("disconnect", () => {
    delete users[userId];
    console.log("user disconnected");
  });

  socket.on("joinRoom", (roomId: string) => {
    const room = "chat:" + getRoomString(userId, roomId);
    socket.join(room);
    console.log(`${userId} joined room ${room}`);
  });
  socket.on("leaveRoom", () => {});
  socket.on("message", (msg: SocketMessage) => {
    console.log(`message: `, msg);
    console.log(socket.id);
    // console.log(socket.handshake);
    console.log(socket.rooms);
    // console.log(socket.data);
    // console.log(await io.in(currentRoom).fetchSockets());
    const room = "chat:" + getRoomString(userId, msg.to);
    socket.to(room).emit("message", { message: msg.message, from: userId });
  });
});
