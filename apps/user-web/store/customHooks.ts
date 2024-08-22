"use client";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { io, Socket } from "socket.io-client";
import { userState } from "./atoms";

interface SocketMessage {
  from: number;
  message: string;
  createdAt: Date;
}

let socket: Socket | null = null;

//@bug This hook is creating a new socket connection every time when called
const useSocket = (caller: string) => {
  const [tsocket, setTsocket] = useState<Socket | null>(socket);
  const user = useRecoilValue(userState);
  useEffect(() => {
    console.log("useSocket", user, tsocket, caller);
    if (user && !tsocket) {
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;
      const sock = io(SOCKET_URL, {
        query: { userId: user.id },
      });

      sock.on("connect", () => {
        console.log("connected to Socket.io server");
      });
      socket = sock;
      setTsocket(sock);
      // return () => {
      //   console.log("disconnecting from Socket.io server", user);
      //   sock.off("message");
      //   sock.disconnect();
      //   socket = null;
      //   setTsocket(null);
      // };
    }
  }, [user]);
  return tsocket;
};

// const useSocket = (caller?: string) => {
//   const user = useRecoilValue(userState);
//   const socketRef = useRef<Socket | null>(socket);

//   useEffect(() => {
//     // console.log("useSocket", user, socketRef.current, caller);
//     if (user && !socket) {
//       const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;
//       const sock = io(SOCKET_URL, {
//         query: { userId: user.id },
//       });

//       sock.on("connect", () => {
//         console.log("connected to Socket.io server");
//       });

//       socket = sock;
//     }

//     socketRef.current = socket;

//     // return () => {
//     //   console.log("disconnecting from Socket.io server", user);
//     //   if (socketRef.current) {
//     //     socketRef.current.off("message");
//     //     socketRef.current.disconnect();
//     //     socketRef.current = null;
//     //     socket = null;
//     //   }
//     // };
//   }, [user]);

//   return socketRef.current;
// };

export { useSocket };
