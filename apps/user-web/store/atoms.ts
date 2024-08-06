import { atom } from "recoil";

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
