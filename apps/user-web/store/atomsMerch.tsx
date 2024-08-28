import { atom } from "recoil";

interface Merchant {
  id: number;
  firstName: string;
  lastName: string;
  balanceM: number;
  email: string;
}

const merchantState = atom<Merchant | null>({
  key: "merchantState",
  default: {
    id: 1,
    firstName: "Merchant",
    lastName: "1",
    balanceM: 0,
    email: "admin@inpay.com",
  },
});

export { merchantState };
