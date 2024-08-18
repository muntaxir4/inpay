"use client";

import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, chatState, userState } from "@/store/atoms";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  SetterOrUpdater,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { Socket } from "socket.io-client";
import Avatar, { genConfig } from "react-nice-avatar";
import { useSocket } from "@/store/customHooks";
import clsx from "clsx";

interface ChatUser {
  id: number;
  firstName: string | undefined;
  lastName: string | undefined;
}

interface MessagesSetters {
  [key: number]: SetterOrUpdater<ChatMessage[]>;
}

function Message({ msg }: { msg: ChatMessage }) {
  return (
    <p
      className={clsx(
        "max-w-[80%] break-words p-2 px-3 rounded-lg bg-card m-2 shadow",
        msg.type === "RECEIVED" ? "self-start" : "self-end"
      )}
    >
      {msg.message}
    </p>
  );
}

function Messenger({
  socket,
  selectedUser,
}: {
  socket: Socket;
  selectedUser: ChatUser;
}) {
  const [chatMessages, setChatMessages] = useRecoilState(
    chatState(selectedUser.id)
  );

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [chatMessages]);

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = e.currentTarget.msg.value;
    if (message.length < 5) return;
    socket.emit("message", {
      message,
      to: selectedUser.id,
    });
    setChatMessages((prev) => [...prev, { message, type: "SENT" }]);

    e.currentTarget.msg.value = "";
  }
  return (
    <div className="grid  grid-rows-[1fr_8fr_1fr] h-full overflow-hidden items-center px-1">
      <h2 className="text-center text-2xl font-medium">
        {selectedUser.firstName + " " + selectedUser.lastName}
      </h2>

      <div ref={ref} className="border flex flex-col h-full overflow-auto">
        {chatMessages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
      </div>

      <form className="flex gap-2" onSubmit={handleSend}>
        <Input type="text" name="msg" placeholder="Minimum 5 letters" />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}

async function fetchInteractions() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
  const response = await axios.get(`${API_URL}/user/interactions`, {
    withCredentials: true,
  });
  return response.data;
}

function UserAvatar({
  user,
  messagesSetters,
}: {
  user: ChatUser;
  messagesSetters: MessagesSetters;
}) {
  messagesSetters[user.id] = useSetRecoilState(chatState(user.id));
  return (
    <Avatar
      {...genConfig(user.firstName + " " + user.lastName)}
      className="h-10 w-10 mx-auto  sm:h-14 sm:w-14"
    />
  );
}

export default function Chat() {
  const user = useRecoilValue(userState);
  const socket = useSocket();

  const messagesSetters: MessagesSetters = {};

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
    if (socket) {
      socket.on("message", (msgObj: { message: string; from: number }) => {
        //@ts-ignore
        messagesSetters[msgObj.from]((prev) => [
          ...prev,
          { message: msgObj.message, type: "RECEIVED" },
        ]);
      });
      return () => {
        socket.off("message");
      };
    }
  }, [socket, data]);

  if (!user || !socket || isLoading) return <Loading />;
  else if (error || !data.interactions)
    return <div>Error, try after some time.</div>;

  function joinRoom(roomId: number) {
    socket?.emit("joinRoom", roomId);
  }

  return (
    <div className="p-4 grid gap-3 overflow-hidden h-full">
      <div className="grid grid-rows-[2rem_auto]  h-full overflow-hidden gap-2">
        <p className="text-2xl font-semibold leading-none tracking-tight">
          Chat
        </p>
        <div className="grid grid-cols-[20%_1fr] gap-1 sm:gap-3 h-full overflow-hidden">
          <div className="grid border content-start overflow-auto h-full">
            {data.interactions.map((user: ChatUser) => (
              <div
                key={user.id}
                className={clsx(
                  "border p-1",
                  selectedUser.id === user.id && "bg-muted"
                )}
                onClick={() => {
                  joinRoom(user.id);
                  setSelectedUser(user);
                }}
              >
                <UserAvatar user={user} messagesSetters={messagesSetters} />
              </div>
            ))}
          </div>
          <div className="h-full overflow-hidden">
            {selectedUser.id === -1 ? (
              <div className="text-center">Select a user to chat</div>
            ) : (
              <Messenger socket={socket} selectedUser={selectedUser} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
