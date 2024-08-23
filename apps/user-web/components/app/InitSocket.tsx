import {
  newMessagesRetrievedState,
  socketConnectionState,
  userState,
} from "@/store/atoms";
import { useSocketInstance } from "@/store/customHooks";
import SocketIO from "@/store/Singleton";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function InitSocket() {
  const socket = useSocketInstance("InitSocket");
  const user = useRecoilValue(userState);
  const setSocketConnected = useSetRecoilState(socketConnectionState);
  const setNewMessagesRetrieved = useSetRecoilState(newMessagesRetrievedState);
  setSocketConnected(true);
  useEffect(() => {
    if (socket) {
      SocketIO.getInstance()?.getSocket()?.emit("setUserId", user?.id);
      return () => {
        SocketIO.disconnect();
        setSocketConnected(false);
        setNewMessagesRetrieved(false);
      };
    }
  }, [socket]); // adding user causes disconnecting before init

  return <></>;
}
