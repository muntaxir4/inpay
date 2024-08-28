"use client";
import { atom, atomFamily } from "recoil";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  balance: number;
  lastSeen: Date;
}

interface Notification {
  message: string;
  createdAt: Date;
}

export interface NotificationServer {
  amount: number;
  message: string;
}

interface ChatMessage {
  message: string;
  type: "SENT" | "RECEIVED";
  isPayment?: boolean;
  createdAt: Date;
}

const userState = atom<null | User>({
  key: "userState",
  default: null,
});

const userRefetchState = atom({
  key: "userRefetchState",
  default: false,
});

const notificationState = atom<Notification[]>({
  key: "notificationState",
  default: [],
});

//stores the connection state of the socket
const socketConnectionState = atom({
  key: "socketConnectionState",
  default: false,
});

//stores chat messages for each user in a session
const chatState = atomFamily<ChatMessage[], number>({
  key: "chatState",
  default: [],
});

const chatOnlineState = atomFamily<boolean, number>({
  key: "chatOnlineState",
  default: false,
});

const readMessagesState = atomFamily<number, number>({
  key: "readMessagesState",
  default: 0,
});

const oldMessagesRetrievedState = atomFamily<boolean, number>({
  key: "oldMessagesRetrievedState",
  default: false,
});

const newMessagesRetrievedState = atom({
  key: "newMessagesRetrievedState",
  default: false,
});

export {
  userState,
  userRefetchState,
  notificationState,
  socketConnectionState,
  chatState,
  chatOnlineState,
  type ChatMessage,
  readMessagesState,
  oldMessagesRetrievedState,
  newMessagesRetrievedState,
};
