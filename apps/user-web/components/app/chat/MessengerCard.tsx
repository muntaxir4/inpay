"use client";

import { ChatUser } from "./Chat";
import {
  ChatMessage,
  chatOnlineState,
  chatState,
  oldMessagesRetrievedState,
  userState,
} from "@/store/atoms";
import clsx from "clsx";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSocketInstance } from "@/store/customHooks";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw } from "lucide-react";

function Message({
  msgObj,
  prevMsgDate,
}: {
  msgObj: ChatMessage;
  prevMsgDate: Date | undefined;
}) {
  function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  function isNewDay(currentDate: Date, previousDate?: Date): boolean {
    if (!previousDate) return true;
    return currentDate.getDate() !== previousDate.getDate();
  }
  return (
    <>
      {isNewDay(new Date(msgObj.createdAt), prevMsgDate) && (
        <Badge variant={"secondary"} className="mx-auto">
          {formatDate(msgObj.createdAt)}
        </Badge>
      )}
      <div
        className={clsx(
          "max-w-[80%] break-words  rounded-lg bg-card m-2 shadow",
          msgObj.type === "RECEIVED" ? "self-start" : "self-end"
        )}
      >
        {msgObj.isPayment ? (
          <p className="text-2xl font-medium text-center p-4">
            {msgObj.message}
          </p>
        ) : (
          <p className="mt-1 mx-3">{msgObj.message}</p>
        )}
        <p className="text-xs text-end mr-2 text-muted-foreground">
          {formatTime(msgObj.createdAt)}
        </p>
      </div>
    </>
  );
}

function Messenger({ selectedUser }: { selectedUser: ChatUser }) {
  const socket = useSocketInstance("Messenger");
  const [chatMessages, setChatMessages] = useRecoilState(
    chatState(selectedUser.id)
  );
  const user = useRecoilValue(userState);
  const [loadOld, setLoadOld] = useRecoilState(
    oldMessagesRetrievedState(selectedUser.id)
  );
  const isOnline = useRecoilValue(chatOnlineState(selectedUser.id));

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [chatMessages]);

  function handleLoadOld() {
    setLoadOld(true);
    socket?.emit("oldMessages", selectedUser.id, user?.lastSeen);
  }

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
    <div className="grid  grid-rows-[1fr_8fr_1fr] h-full overflow-hidden items-center px-1 gap-1">
      <div className="flex justify-center items-center gap-2">
        <h2 className=" text-center text-2xl tracking-wider italic">
          {selectedUser.firstName + " " + selectedUser.lastName}
        </h2>
        <Badge
          variant={"outline"}
          className="flex py-0.5 px-2 text-center w-fit items-center gap-1 h-fit"
        >
          {isOnline ? (
            <>
              <div className=" size-2 rounded-full bg-green-600"></div>
              <p>{"online"}</p>
            </>
          ) : (
            <>
              <div className="size-2 rounded-full bg-red-600"></div>
              <p>{"offline"}</p>
            </>
          )}
        </Badge>
      </div>

      <div ref={ref} className="border flex flex-col h-full overflow-auto py-1">
        <Button
          size={"sm"}
          variant={"secondary"}
          className={clsx(
            "mx-auto my-3 text-sm flex gap-1 py-0.5 px-1",
            loadOld && "hidden"
          )}
          onClick={handleLoadOld}
        >
          <RefreshCcw size={"18px"} /> <p>Old Messages</p>
        </Button>
        {chatMessages.map((msgObj, i) => (
          <Message
            key={i}
            prevMsgDate={chatMessages[i - 1]?.createdAt}
            msgObj={msgObj}
          />
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
        <div className="h-full content-center text-center italic text-lg font-medium tracking-wider">
          Select a user to chat
        </div>
      ) : (
        <Messenger selectedUser={selectedUser} />
      )}
    </div>
  );
}
