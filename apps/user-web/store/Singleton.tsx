"use client";
import { io, Socket } from "socket.io-client";

export type Currency = "INR" | "USD" | "AED";

class SocketIO {
  private static instance: SocketIO | null;
  private socket: Socket | null;

  private constructor() {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;
    this.socket = io(SOCKET_URL, { withCredentials: true });
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

export function getFloatAmount(amount: number) {
  return Math.floor(amount / 100) + (amount % 100) / 100;
}

export const currencies = {
  INR: { id: 0, rate: 1, symbol: "₹" },
  USD: { id: 1, rate: 0.011906216, symbol: "$" },
  AED: { id: 2, rate: 0.04372558, symbol: "AED" },
};

export function getCurrencyFloatAmount(amount: number, rate: number = 1) {
  const currencyAmount = amount * rate;
  const actualAmount = parseFloat(currencyAmount.toFixed(2));
  return actualAmount;
}

export default SocketIO;
