"use client";

import { userState } from "@/store/atoms";
import { useRecoilValue } from "recoil";

function BalanceComponent() {
  const user = useRecoilValue(userState);
  return <>{user?.balance + ".00"}</>;
}

export { BalanceComponent };
