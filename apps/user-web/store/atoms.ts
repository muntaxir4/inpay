"use client";
import { atom, selectorFamily } from "recoil";
import { genConfig } from "react-nice-avatar";

interface User {
  firstName: string;
  lastName: string;
  balance: number;
}

const userState = atom<null | User>({
  key: "userState",
  default: null,
});

export { userState };
