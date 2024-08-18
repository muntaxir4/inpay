"use client";
import Chat from "@/components/app/chat/Chat";
import {
  atom,
  atomFamily,
  selector,
  selectorFamily,
  useRecoilCallback,
  useSetRecoilState,
} from "recoil";
interface User {
  id: number;
  firstName: string;
  lastName: string;
  balance: number;
}

const userState = atom<null | User>({
  key: "userState",
  default: null,
});

// const socketState = atom<Socket | null>({
//   key: "socketState",
//   default: selector({
//     key: "socketState/default",
//     get: ({ get }) => {
//       const user = get(userState);
//       // const prevSocket = get(socketState);
//       if (user) {
//         const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;
//         // prevSocket?.disconnect();
//         const socket= io(SOCKET_URL, {
//           query: {
//             userId: user.id,
//           },
//         });
//         socket.on("connect", () => {
//           console.log("connected");
//         })
//         return socket;
//       }
//       return null;
//     },
//   }),
// });

interface ChatMessage {
  message: string;
  type: "SENT" | "RECEIVED";
}

const chatState = atomFamily<ChatMessage[], number>({
  key: "chatState",
  default: [],
});

export { userState, chatState, type ChatMessage };
