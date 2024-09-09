"use client";

import { currencyState, userState } from "@/store/atoms";
import { getCurrencyFloatAmount } from "@/store/Singleton";
import { useRecoilValue } from "recoil";

function BalanceComponent() {
  const user = useRecoilValue(userState);
  const currency = useRecoilValue(currencyState);
  return (
    <>
      {currency.symbol}
      {user?.balance !== undefined
        ? getCurrencyFloatAmount(user?.balance / 100, currency.rate)
        : "0.00"}
    </>
  );
}

function LockedBalance() {
  const currency = useRecoilValue(currencyState);
  return <>{currency.symbol + 0}</>;
}

export { BalanceComponent, LockedBalance };
