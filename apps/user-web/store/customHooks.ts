"use client";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import SocketIO from "./Singleton";
import { useRecoilValue } from "recoil";
import { socketConnectionState } from "./atoms";

interface SocketMessage {
  from: number;
  message: string;
  createdAt: Date;
}

const useDisplayType = () => {
  const [displayType, setDisplayType] = useState<"mobile" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const updateDisplayType = () => {
      if (window.innerWidth < 640) {
        setDisplayType("mobile");
      } else {
        setDisplayType("desktop");
      }
    };

    // Initial check
    updateDisplayType();

    // Add event listener
    window.addEventListener("resize", updateDisplayType);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", updateDisplayType);
  }, []);

  return displayType;
};

const useSocketInstance = (caller?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketConnected = useRecoilValue(socketConnectionState);
  useEffect(() => {
    if (socketConnected) {
      const socketInstance = SocketIO.getInstance();
      setSocket(socketInstance.getSocket());
    } else setSocket(null);
  }, [socketConnected]);
  return socket;
};

export { useDisplayType, useSocketInstance };
