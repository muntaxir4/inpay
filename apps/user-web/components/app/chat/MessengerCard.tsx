"use client";

import { ChatUser } from "./Chat";
import { ChatMessage, chatState } from "@/store/atoms";
import clsx from "clsx";
import { useRecoilState } from "recoil";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/store/customHooks";

function Message({ msgObj }: { msgObj: ChatMessage }) {
  function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return (
    <div
      className={clsx(
        "max-w-[80%] break-words  rounded-lg bg-card m-2 shadow",
        msgObj.type === "RECEIVED" ? "self-start" : "self-end"
      )}
    >
      <p className="mt-1 mx-3">{msgObj.message}</p>
      <p className="text-xs text-end mr-2 text-muted-foreground">
        {formatTime(msgObj.createdAt)}
      </p>
    </div>
  );
}

function Messenger({ selectedUser }: { selectedUser: ChatUser }) {
  const socket = useSocket("Messenger");
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
    const createdAt = new Date();
    socket?.emit("message", {
      message,
      to: selectedUser.id,
      createdAt,
    });
    setChatMessages((prev) => [...prev, { message, type: "SENT", createdAt }]);

    e.currentTarget.msg.value = "";
  }
  return (
    <div className="grid  grid-rows-[1fr_8fr_1fr] h-full overflow-hidden items-center sm:px-1">
      <h2 className="-mt-2 text-center text-2xl tracking-wide">
        {selectedUser.firstName + " " + selectedUser.lastName}
      </h2>

      <div
        ref={ref}
        className="-mt-3 border flex flex-col h-full overflow-auto"
      >
        {chatMessages.map((msgObj, i) => (
          <Message key={i} msgObj={msgObj} />
        ))}
      </div>

      <form className="flex gap-2" onSubmit={handleSend}>
        <Input type="text" name="msg" placeholder="Minimum 5 letters" />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}

export default function MessengerCard({
  selectedUser,
}: {
  selectedUser: ChatUser;
}) {
  return (
    <div className="h-full overflow-hidden">
      {selectedUser.id === -1 ? (
        <div className="text-center">Select a user to chat</div>
      ) : (
        <Messenger selectedUser={selectedUser} />
      )}
    </div>
  );
}
