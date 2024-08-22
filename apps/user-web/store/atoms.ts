"use client";
import { atom, atomFamily, selector } from "recoil";
import { io, Socket } from "socket.io-client";
interface User {
  id: number;
  firstName: string;
  lastName: string;
  balance: number;
  lastSeen: Date;
}
interface ChatMessage {
  message: string;
  type: "SENT" | "RECEIVED";
  createdAt: Date;
}

const userState = atom<null | User>({
  key: "userState",
  default: null,
});

const scoketState = atom<null | Socket>({
  key: "socketState",
  default: selector({
    key: "socketState/default",
    get: ({ get }) => {
      const user = get(userState);
      if (!user) return null;
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;
      const sock = io(SOCKET_URL, {
        query: { userId: user.id },
      });
      sock.on("connect", () => {
        console.log("connected to Socket.io server");
      });
      return sock;
    },
  }),
});

//stores chat messages for each user in a session
const chatState = atomFamily<ChatMessage[], number>({
  key: "chatState",
  default: [],
});

const readMessagesState = atomFamily<number, number>({
  key: "readMessagesState",
  default: 0,
});

const newMessagesRetrievedState = atom({
  key: "newMessagesRetrievedState",
  default: false,
});

export {
  userState,
  scoketState,
  chatState,
  type ChatMessage,
  readMessagesState,
  newMessagesRetrievedState,
};
