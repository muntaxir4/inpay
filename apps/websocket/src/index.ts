import express from "express";
import { Server } from "socket.io";
import { prisma } from "@repo/db";

interface SocketMessage {
  message: string;
  to: string;
  createdAt: Date;
}

interface ChatMessage {
  from: number;
  to: number;
  message: string;
  createdAt: Date;
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
const messageQueue: ChatMessage[] = [];
const messageQueueInterval = setInterval(pushMessagesToDB, 1000 * 60);

async function pushMessagesToDB() {
  let len = messageQueue.length;
  if (!len) return;
  const messages: ChatMessage[] = [];
  while (len--) {
    const msg = messageQueue.shift();
    if (msg) {
      messages.push(msg);
    }
  }
  try {
    await prisma.userMessages.createMany({ data: messages });
  } catch (error) {
    console.log(error);
    messageQueue.push(...messages);
  }
}

function getRoomString(user1: string, user2: string) {
  return user1 < user2 ? user1 + "-" + user2 : user2 + "-" + user1;
}

io.on("connection", (socket) => {
  const params = new URLSearchParams(socket.request.url?.split("?")[1]);
  const queryParams = Object.fromEntries(params.entries());
  if (!queryParams.userId) socket.disconnect();
  const userId = queryParams.userId as string;
  users[userId] = socket.id;
  console.log(userId, "connected", socket.id);
  socket.on("disconnect", async () => {
    delete users[userId];
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        userAccount: {
          update: {
            lastSeen: new Date(),
          },
        },
      },
    });
    console.log("user disconnected");
  });

  socket.on("joinRoom", (roomId: string) => {
    const room = "chat:" + getRoomString(userId, roomId);
    socket.join(room);
    console.log(`${userId} joined room ${room}`);
  });
  socket.on("leaveRoom", () => {});
  socket.on("message", (msgObj: SocketMessage) => {
    console.log(`message: `, msgObj);
    console.log(socket.id);
    // console.log(socket.handshake);
    console.log(socket.rooms);
    // console.log(socket.data);
    // console.log(await io.in(currentRoom).fetchSockets());
    const room = "chat:" + getRoomString(userId, msgObj.to);
    socket.to(room).emit("message", {
      message: msgObj.message,
      from: userId,
      createdAt: msgObj.createdAt,
    });
    messageQueue.push({
      from: parseInt(userId),
      to: parseInt(msgObj.to),
      message: msgObj.message,
      createdAt: msgObj.createdAt,
    });
  });
  socket.on("newMessages", async (lastSeen: number) => {
    try {
      const newMessages = await prisma.userMessages.findMany({
        where: {
          OR: [{ from: parseInt(userId) }, { to: parseInt(userId) }],
          createdAt: { gt: new Date(lastSeen) },
        },
        select: {
          from: true,
          to: true,
          message: true,
          createdAt: true,
        },
      });
      console.log("newMessages", newMessages);
      socket.emit("newMessages", newMessages);
    } catch (error) {
      console.error("Error fetching newMessages", error);
    }
  });
  // socket.on("oldMessages", async () => {
  //   try {
  //     const oldMessages = await prisma.userMessages.findMany({
  //       where: {
  //         OR: [{ from: parseInt(userId) }, { to: parseInt(userId) }],
  //       },
  //       select: {
  //         from: true,
  //         to: true,
  //         message: true,
  //         createdAt: true,
  //       },
  //     });
  //     socket.emit("oldMessages", oldMessages);
  //   } catch (error) {
  //     console.error("Error fetching oldMessages", error);
  //   }
  // });
});
