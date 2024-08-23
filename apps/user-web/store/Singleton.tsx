"use client";
import { io, Socket } from "socket.io-client";

class SocketIO {
  private static instance: SocketIO | null;
  private socket: Socket | null;

  private constructor() {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;
    this.socket = io(SOCKET_URL);
    this.socket.on("connect", () => {
      console.log("connected to Socket.io server", this.socket?.id);
    });
  }

  public static getInstance(): SocketIO {
    if (!SocketIO.instance) {
      SocketIO.instance = new SocketIO();
    }
    return SocketIO.instance;
  }

  public getSocket() {
    return this.socket;
  }

  public static disconnect() {
    if (SocketIO.instance) {
      const currentSocket = SocketIO.instance.getSocket();
      console.log("disconnecting from Socket.io server", currentSocket?.id);
      currentSocket?.disconnect();
    }
    SocketIO.instance = null;
  }
}

export default SocketIO;
