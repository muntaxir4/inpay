"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loading from "../Loading";
import { useRecoilValue } from "recoil";
import { userState } from "@/store/atoms";
import BalancePieChart from "./BalancePieChart";
import BalanceHistory from "./BalanceHistory";

export interface BalanceHistoryData {
  message: string;
  balanceHistory: number[];
  transactionTypes: {
    DEPOSIT: number;
    WITHDRAW: number;
    RECEIVED: number;
    SENT: number;
    SPENT: number;
  };
}

async function fetchBalanceHistory() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  const response = await axios.get(API_URL + "/user/balance-history", {
    withCredentials: true,
  });
  return response.data;
}

export default function BalanceOverview() {
  const user = useRecoilValue(userState);
  const { data, error, isLoading } = useQuery({
    queryKey: ["balance-History", user],
    queryFn: fetchBalanceHistory,
  });

  if (isLoading) return <Loading />;
  else if (error) return <div>Error fetching Balance History</div>;
  else if (!data || !data.balanceHistory || !data.transactionTypes)
    return <div>Error fetching Balance History</div>;

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-3">
      <BalanceHistory data={data.balanceHistory} />
      <BalancePieChart data={data.transactionTypes} />
    </div>
  );
}
