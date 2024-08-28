"use client";

import { userState } from "@/store/atoms";
import { getFloatAmount } from "@/store/Singleton";
import { useRecoilValue } from "recoil";

function BalanceComponent() {
  const user = useRecoilValue(userState);
  return (
    <>{user?.balance !== undefined ? getFloatAmount(user?.balance) : "0.00"}</>
  );
}

export { BalanceComponent };
