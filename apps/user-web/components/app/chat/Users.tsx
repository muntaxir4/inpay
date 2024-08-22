"use client";
import clsx from "clsx";
import { ChatUser, MessagesSetters } from "./Chat";
import { useSocket } from "@/store/customHooks";
import { Dispatch, SetStateAction, useEffect } from "react";
import Avatar, { genConfig } from "react-nice-avatar";
import { useRecoilState } from "recoil";
import { chatState, readMessagesState } from "@/store/atoms";
import { Badge } from "@/components/ui/badge";

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
  const socket = useSocket("UserAvatar");
  const [chatMessages, setChatMessages] = useRecoilState(chatState(user.id));
  messagesSetters[user.id] = setChatMessages;
  const [readMessages, setReadMessages] = useRecoilState(
    readMessagesState(user.id)
  );

  const unread = chatMessages.length - readMessages;
  //join current user's chat room
  useEffect(() => {
    socket?.emit("joinRoom", user.id);
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
        <Badge className="absolute rounded-full bg-red-600 right-2 z-50">
          {unread}
        </Badge>
      )}
      <Avatar
        {...genConfig(user.firstName + " " + user.lastName)}
        className="h-10 w-10 mx-auto  sm:h-14 sm:w-14"
      />
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
