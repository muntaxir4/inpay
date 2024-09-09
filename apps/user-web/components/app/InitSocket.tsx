import {
  currencyState,
  newMessagesRetrievedState,
  NotificationServer,
  notificationState,
  socketConnectionState,
  userState,
} from "@/store/atoms";
import { useSocketInstance } from "@/store/customHooks";
import SocketIO, {
  getCurrencyFloatAmount,
  getFloatAmount,
} from "@/store/Singleton";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function InitSocket() {
  const socket = useSocketInstance("InitSocket");
  const user = useRecoilValue(userState);
  const setSocketConnected = useSetRecoilState(socketConnectionState);
  const setNewMessagesRetrieved = useSetRecoilState(newMessagesRetrievedState);
  const setNotifications = useSetRecoilState(notificationState);
  const curerncy = useRecoilValue(currencyState);
  setSocketConnected(true);

  const notificationsReceived = (msgObj: NotificationServer) => {
    setNotifications((notifications) => [
      {
        message: `${curerncy.symbol}${getCurrencyFloatAmount(msgObj.amount / 100, curerncy.rate)} ${msgObj.message}`,
        createdAt: new Date(),
      },
      ...notifications,
    ]);
  };

  useEffect(() => {
    if (socket) {
      // SocketIO.getInstance()?.getSocket()?.emit("setUserId", user?.id);
      socket.emit("setUserId", user?.id);
      return () => {
        SocketIO.disconnect();
        socket.off("notify");
        setSocketConnected(false);
        setNewMessagesRetrieved(false);
      };
    }
  }, [socket]); // adding user causes disconnecting before init

  useEffect(() => {
    if (socket) {
      socket.on("notify", notificationsReceived);
      return () => {
        socket.off("notify");
      };
    }
  }, [curerncy, socket]);

  return <></>;
}
