"use client";

import Loading from "@/components/Loading";
import {
  ChatMessage,
  newMessagesRetrievedState,
  userState,
} from "@/store/atoms";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { SetterOrUpdater, useRecoilState, useRecoilValue } from "recoil";
import { useSocketInstance } from "@/store/customHooks";
import Users from "./Users";
import MessengerCard from "./MessengerCard";
export interface ChatUser {
  id: number;
  firstName: string | undefined;
  lastName: string | undefined;
}

export interface MessagesSetters {
  [key: number]: SetterOrUpdater<ChatMessage[]>;
}

export interface OnlineSetters {
  [key: number]: SetterOrUpdater<boolean>;
}

export interface MessageServer {
  from: number;
  to: number;
  message: string;
  isPayment?: boolean;
  createdAt: Date;
}

async function fetchInteractions() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
  const response = await axios.get(`${API_URL}/user/interactions`, {
    withCredentials: true,
  });
  return response.data;
}

export const messagesSetters: MessagesSetters = {};
export const onlineSetters: OnlineSetters = {};

export default function Chat() {
  const user = useRecoilValue(userState);
  const socket = useSocketInstance("Chat");

  const [newMessagesRetrieved, setNewMessagesRetrieved] = useRecoilState(
    newMessagesRetrievedState
  );

  const { data, error, isLoading } = useQuery({
    queryKey: [user, "interactions"],
    queryFn: fetchInteractions,
  });

  const [selectedUser, setSelectedUser] = useState<ChatUser>({
    id: -1,
    firstName: undefined,
    lastName: undefined,
  });
  useEffect(() => {
    if (socket && data && user) {
      if (!newMessagesRetrieved) {
        socket.on("message", (msgObj: MessageServer) => {
          const withUserId = msgObj.isPayment ? msgObj.to : msgObj.from;
          messagesSetters[Number(withUserId)]?.((prev: ChatMessage[]) => [
            ...prev,
            {
              message: msgObj.message,
              type: msgObj.from === user?.id ? "SENT" : "RECEIVED",
              isPayment: msgObj.isPayment,
              createdAt: new Date(msgObj.createdAt),
            },
          ]);
        });
        socket.emit("newMessages", user.lastSeen);
        socket.on("newMessages", (messages: MessageServer[]) => {
          console.log("newMessages");
          const newMessages = {} as any;
          messages.forEach((msgObj) => {
            let roomId = msgObj.from;
            if (msgObj.from === user?.id) roomId = msgObj.to;
            if (!newMessages[roomId]) newMessages[roomId] = [];
            newMessages[roomId].push({
              message: msgObj.message,
              type: msgObj.from === user?.id ? "SENT" : "RECEIVED",
              isPayment: msgObj.isPayment,
              createdAt: new Date(msgObj.createdAt),
            });
          });
          Object.keys(newMessages).forEach((key) => {
            messagesSetters[parseInt(key)]?.((prev) => [
              ...newMessages[parseInt(key)],
              ...prev,
            ]);
          });
          socket.off("newMessages");
          setNewMessagesRetrieved(true);
        });
        socket.on("oldMessages", (messages: MessageServer[], withUserId) => {
          console.log("oldMessages");
          messagesSetters[Number(withUserId)]?.((prev) => {
            const oldMessages: ChatMessage[] = messages.map((msgObj) => {
              return {
                message: msgObj.message,
                type: msgObj.from === user.id ? "SENT" : "RECEIVED",
                isPayment: msgObj.isPayment,
                createdAt: new Date(msgObj.createdAt),
              };
            });
            return [...oldMessages, ...prev];
          });
        });
      }
    }
  }, [socket, data, user]);

  useEffect(() => {
    if (socket && user) {
      socket.on("checkOnline", (withUserId: number, isOnline: boolean) => {
        onlineSetters[withUserId]?.(isOnline);
      });
      return () => {
        socket.off("checkOnline");
      };
    }
  }, [socket, data]);

  if (!user || !socket || isLoading) return <Loading />;
  else if (error || !data.interactions)
    return <div>Error, try after some time.</div>;

  return (
    <div className="p-4 grid gap-3 overflow-hidden h-full">
      <div className="grid grid-rows-[2rem_auto]  h-full overflow-hidden gap-2">
        <p
          className="text-2xl font-semibold leading-none tracking-tight"
          onClick={() =>
            setSelectedUser({
              id: -1,
              firstName: undefined,
              lastName: undefined,
            })
          }
        >
          Chat
        </p>
        <div className="grid grid-cols-[20%_1fr] gap-1 sm:gap-3 h-full overflow-hidden">
          <Users
            data={data}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            messagesSetters={messagesSetters}
          />
          <MessengerCard selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
}
