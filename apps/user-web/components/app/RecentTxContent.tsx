"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRecoilValue } from "recoil";
import { userState } from "@/store/atoms";

interface RecentTransaction {
  id: string;
  date: Date;
  firstName: string;
  lastName: string;
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  amount: number;
  status: string;
}

async function getRecentTransactions() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
  try {
    const response = await axios.get(API_URL + "/user/recent/transactions", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch recent transactions");
  }
}

function ShowStatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS") return <Badge>Success</Badge>;
  else if (status === "PENDING")
    return <Badge variant="outline">Pending</Badge>;
  else return <Badge variant="destructive">Failed</Badge>;
}

export default function RecentTxContent({ className }: { className?: string }) {
  const user = useRecoilValue(userState);
  const { data, isLoading, isError } = useQuery({
    queryKey: [user],
    queryFn: getRecentTransactions,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  } else if (isError) {
    return <div>Error fetching recent transactions</div>;
  }
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead>From</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.transactions.map((tx: RecentTransaction, index: number) => {
          return (
            <TableRow key={index}>
              <TableCell>{tx.firstName + " " + tx.lastName}</TableCell>
              <TableCell>{tx.type}</TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell>
                <ShowStatusBadge status={tx.status} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
