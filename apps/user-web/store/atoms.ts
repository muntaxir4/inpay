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

const userAvatarConfig = selectorFamily({
  key: "userAvatarConfig",
  get: (fullName: string) => () => {
    return genConfig(fullName);
  },
});
export { userState, userAvatarConfig };
