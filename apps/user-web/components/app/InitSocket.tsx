import {
  newMessagesRetrievedState,
  NotificationServer,
  notificationState,
  socketConnectionState,
  userState,
} from "@/store/atoms";
import { useSocketInstance } from "@/store/customHooks";
import SocketIO, { getFloatAmount } from "@/store/Singleton";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function InitSocket() {
  const socket = useSocketInstance("InitSocket");
  const user = useRecoilValue(userState);
  const setSocketConnected = useSetRecoilState(socketConnectionState);
  const setNewMessagesRetrieved = useSetRecoilState(newMessagesRetrievedState);
  const setNotifications = useSetRecoilState(notificationState);
  setSocketConnected(true);
  useEffect(() => {
    if (socket) {
      // SocketIO.getInstance()?.getSocket()?.emit("setUserId", user?.id);
      socket.emit("setUserId", user?.id);
      socket.on("notify", (msgObj: NotificationServer) => {
        setNotifications((notifications) => [
          {
            message: `$${getFloatAmount(msgObj.amount)} ${msgObj.message}`,
            createdAt: new Date(),
          },
          ...notifications,
        ]);
      });
      return () => {
        SocketIO.disconnect();
        socket.off("notify");
        setSocketConnected(false);
        setNewMessagesRetrieved(false);
      };
    }
  }, [socket]); // adding user causes disconnecting before init

  return <></>;
}
