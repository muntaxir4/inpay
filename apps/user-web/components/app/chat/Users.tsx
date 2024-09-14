"use client";
import clsx from "clsx";
import { ChatUser, MessagesSetters, onlineSetters } from "./Chat";
import { useSocketInstance } from "@/store/customHooks";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRecoilState } from "recoil";
import { chatOnlineState, chatState, readMessagesState } from "@/store/atoms";
import { Badge } from "@/components/ui/badge";
import MultiAvatar from "../MultiAvatar";

function UserAvatar({
  user,
  messagesSetters,
  selectedUserId,
  onClick,
}: {
  user: ChatUser;
  messagesSetters: MessagesSetters;
  selectedUserId: number;
  onClick: () => void;
}) {
  const socket = useSocketInstance("UserAvatar");
  const [chatMessages, setChatMessages] = useRecoilState(chatState(user.id));
  const [online, setOnline] = useRecoilState(chatOnlineState(user.id));
  messagesSetters[user.id] = setChatMessages;
  onlineSetters[user.id] = setOnline;
  const [readMessages, setReadMessages] = useRecoilState(
    readMessagesState(user.id)
  );

  const unread = chatMessages.length - readMessages;
  //join current user's chat room
  useEffect(() => {
    if (socket) {
      socket.emit("joinRoom", user.id);
      socket.emit("checkOnline", user.id);
      const checkOnline = setInterval(
        () => socket.emit("checkOnline", user.id),
        60000
      );
      return () => {
        setOnline(false);
        clearInterval(checkOnline);
      };
    }
  }, [user.id, socket]);

  useEffect(() => {
    if (selectedUserId === user.id) setReadMessages(chatMessages.length);
  }, [chatMessages, selectedUserId]);

  return (
    <div
      key={user.id}
      className={clsx(
        "border p-1 relative",
        selectedUserId === user.id && "bg-muted"
      )}
      onClick={onClick}
    >
      {selectedUserId !== user.id && unread > 0 && (
        <Badge className="absolute rounded-full bg-red-600 right-1 p-0.5 sm:px-2 z-50">
          {unread}
        </Badge>
      )}
      <MultiAvatar
        name={user.firstName + " " + user.lastName}
        className="h-10 w-10 mx-auto  sm:h-14 sm:w-14"
      />
      {online && (
        <div className="absolute left-1 bottom-1 size-2 sm:size-3 rounded-full bg-green-600"></div>
      )}
    </div>
  );
}

export default function Users({
  data,
  selectedUser,
  setSelectedUser,
  messagesSetters,
}: {
  data: any;
  selectedUser: ChatUser;
  setSelectedUser: Dispatch<SetStateAction<ChatUser>>;
  messagesSetters: any;
}) {
  if (!(data.interactions instanceof Array)) return null;

  return (
    <div className="grid border content-start overflow-auto h-full">
      {data.interactions.map((user: ChatUser) => (
        <UserAvatar
          key={user.id}
          user={user}
          messagesSetters={messagesSetters}
          selectedUserId={selectedUser.id}
          onClick={() => {
            setSelectedUser(user);
          }}
        />
      ))}
    </div>
  );
}
