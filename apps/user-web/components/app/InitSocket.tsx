import { useSocket } from "@/store/customHooks";
import { useEffect } from "react";

export default function InitSocket() {
  let socket = useSocket("InitSocket");
  console.log("InitSocket ", socket);
  useEffect(() => {
    console.log("InitSocket useEffect ", socket);
    return () => {
      console.log("trying disconneect", socket);
      if (socket) {
        console.log("disconnecting from Socket.io server");
        socket.off("message");
        socket.disconnect();
        socket = null;
      }
    };
  }, [socket]);
  return <></>;
}
