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
app.use(express.json());
app.post("/api/v1/transferDone", async (req, res) => {
  const { from, to, amount } = req.body;
  try {
    const message = await prisma.userMessages.create({
      data: {
        from: Number(from),
        to: Number(to),
        message: `$${amount}`,
        isPayment: true,
        createdAt: new Date(),
      },
      select: {
        from: true,
        to: true,
        message: true,
        isPayment: true,
        createdAt: true,
      },
    });
    res.status(200).end();
    const room = "chat:" + getRoomString(from.toString(), to.toString());
    io.to(room).emit("message", message);
  } catch (error) {
    console.error("Error sending payment message", error);
    res.status(500).end();
  }
});

const httpServer = app
  .listen(8080, () => {
    console.log("Socket.io Server started on 8080");
  })
  .on("error", (err) => {
    console.error(err);
  });

const io = new Server(httpServer, {
  cors: {
    origin: process.env.WEB_URL,
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
  let userId: string;
  console.log("connected", socket.id);
  // console.log(
  //   "All connected clients:",
  //   Array.from(io.sockets.sockets.values()).map((s) => s.id)
  // );
  function addSocketListeners() {
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
      console.log("user disconnected", socket.id);
    });

    socket.on("joinRoom", (roomId: string) => {
      const room = "chat:" + getRoomString(userId, roomId);
      socket.join(room);
      console.log(`${userId} joined room ${room}`);
    });

    socket.on("checkOnline", (withUserId: number) => {
      if (users[withUserId]) socket.emit("checkOnline", withUserId, true);
      else socket.emit("checkOnline", withUserId, false);
    });

    socket.on("message", (msgObj: SocketMessage) => {
      // console.log(`message: `, msgObj);
      console.log(socket.id);
      // console.log(socket.handshake);
      // console.log(socket.rooms);
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
            isPayment: true,
            createdAt: true,
          },
        });
        socket.emit("newMessages", newMessages);
      } catch (error) {
        console.error("Error fetching newMessages", error);
      }
    });

    socket.on("oldMessages", async (withUserId: number, lastSeen: Date) => {
      try {
        const oldMessages = await prisma.userMessages.findMany({
          where: {
            OR: [
              { from: Number(userId), to: Number(withUserId) },
              { from: Number(withUserId), to: Number(userId) },
            ],
            createdAt: { lte: new Date(lastSeen) },
          },
          select: {
            from: true,
            to: true,
            message: true,
            isPayment: true,
            createdAt: true,
          },
        });
        socket.emit("oldMessages", oldMessages, withUserId);
      } catch (error) {
        console.error("Error fetching oldMessages", error);
      }
    });
  }

  socket.once("setUserId", (userIdRecieved: number) => {
    userId = userIdRecieved.toString();
    users[userId] = socket.id;
    console.log(userId, "connected after setUserId", socket.id);
    addSocketListeners();
    socket.off("setUserId", () => {});
  });
});
