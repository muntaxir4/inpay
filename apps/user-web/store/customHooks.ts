"use client";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { io, Socket } from "socket.io-client";
import { userState } from "./atoms";

interface SocketMessage {
  from: number;
  message: string;
}

const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useRecoilValue(userState);
  useEffect(() => {
    if (user) {
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;
      const sock = io(SOCKET_URL, {
        query: { userId: user.id },
      });

      sock.on("connect", () => {
        console.log("connected to Socket.io server");
      });
      setSocket(sock);
      return () => {
        sock.off("message");
        sock.disconnect();
      };
    }
  }, [user]);

  return socket;
};

export { useSocket };
