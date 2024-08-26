"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Badge } from "@/components/ui/badge";
import { useRecoilValue } from "recoil";
import { userState } from "@/store/atoms";
import { getFloatAmount } from "@/store/Singleton";
import Loading from "@/components/Loading";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, use, useEffect, useState } from "react";

interface QueryParams {
  page: number;
  DEPOSIT: boolean;
  WITHDRAW: boolean;
  TRANSFER: boolean;
}

interface Transaction {
  id: string;
  date: string;
  from: string;
  to: string | null;
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
  amount: number;
  status: string;
}

async function getPagesCount(queryString: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
  try {
    const response = await axios.get(
      API_URL + "/user/transactions/pages" + `?${queryString}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch page count");
  }
}

async function getTransactions(page: number, queryString: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
  try {
    const response = await axios.get(
      API_URL + "/user/transactions" + `?${queryString}&page=${page}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch recent transactions");
  }
}

function ShowStatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS")
    return <Badge className="bg-green-200 text-black">Success</Badge>;
  else if (status === "PENDING")
    return <Badge variant="outline">Pending</Badge>;
  else return <Badge variant="destructive">Failed</Badge>;
}

function Transactions({
  className,
  page,
  queryString,
}: {
  className?: string;
  page: number;
  queryString: string;
}) {
  const user = useRecoilValue(userState);
  const { data, isLoading, isError } = useQuery({
    queryKey: [user, "allTx", page, queryString],
    queryFn: () => getTransactions(page, queryString),
  });

  if (isLoading) {
    return <Loading />;
  } else if (isError) {
    return <div>Error fetching recent transactions</div>;
  }

  function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead>TxID</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.transactions?.map((tx: Transaction, index: number) => {
          return (
            <TableRow key={index} className="hover:bg-muted">
              <Tooltip>
                <TooltipTrigger>
                  <TableCell>{tx.id.substring(0, 8)}</TableCell>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tx.id}</p>
                </TooltipContent>
              </Tooltip>

              <TableCell>{tx.from}</TableCell>
              <TableCell>{tx.to}</TableCell>
              <TableCell>{tx.type}</TableCell>
              <TableCell>{getFloatAmount(tx.amount)}</TableCell>
              <TableCell>
                <ShowStatusBadge status={tx.status} />
              </TableCell>
              <TableCell>{formatDate(new Date(tx.date))}</TableCell>
            </TableRow>
          );
        })}
        {data.transactions?.length === 0 && <div>No transactions</div>}
      </TableBody>
    </Table>
  );
}

function PaginationDiv({
  currPage,
  queryString,
}: {
  currPage: number;
  queryString: string;
}) {
  const user = useRecoilValue(userState);
  const { data, isLoading, isError } = useQuery({
    queryKey: [user, "allTx", queryString],
    queryFn: () => getPagesCount(queryString),
  });

  if (isLoading) {
    return <Loading />;
  } else if (isError) {
    return <div>Error fetching page count</div>;
  }
  return (
    <Pagination>
      <PaginationContent>
        {currPage - 1 > 0 && (
          <PaginationItem>
            <PaginationPrevious href={`?${queryString}&page=${currPage - 1}`} />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationLink href={`?${queryString}&page=${currPage}`}>
            {currPage}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        {currPage + 1 <= data.pages && (
          <PaginationItem>
            <PaginationNext href={`?${queryString}&page=${currPage + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

function Filters({
  filters,
  setFilters,
}: {
  filters: QueryParams;
  setFilters: Dispatch<SetStateAction<QueryParams>>;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 my-1 text-sm">
      <label>Filters:</label>
      <div className="flex gap-3">
        <div className="flex gap-1">
          <input
            type="checkbox"
            name="DEPOSIT"
            checked={filters.DEPOSIT}
            onClick={() =>
              setFilters((prev) => ({ ...prev, DEPOSIT: !prev.DEPOSIT }))
            }
          />
          <label>Deposit</label>
        </div>
        <div className="flex gap-1">
          <input
            type="checkbox"
            name="WITHDRAW"
            checked={filters.WITHDRAW}
            onClick={() =>
              setFilters((prev) => ({ ...prev, WITHDRAW: !prev.WITHDRAW }))
            }
          />
          <label>Withdraw</label>
        </div>
        <div className="flex gap-1">
          <input
            type="checkbox"
            name="TRANSFER"
            checked={filters.TRANSFER}
            onClick={() =>
              setFilters((prev) => ({ ...prev, TRANSFER: !prev.TRANSFER }))
            }
          />
          <label>Transfer</label>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsCard() {
  const params = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<QueryParams>({
    page: 1,
    DEPOSIT: true,
    WITHDRAW: true,
    TRANSFER: true,
  });
  const [queryString, setQueryString] = useState<string>("");

  useEffect(() => {
    const tmpObj = { ...filters };
    const tmpParams = new URLSearchParams();
    if (params.has("type"))
      tmpObj["DEPOSIT"] = tmpObj["WITHDRAW"] = tmpObj["TRANSFER"] = false;
    for (const [key, value] of params) {
      if (key === "page") tmpObj.page = parseInt(value);
      else if (key === "type") {
        tmpParams.append("type", value);
        if (value === "DEPOSIT") tmpObj["DEPOSIT"] = true;
        else if (value === "WITHDRAW") tmpObj["WITHDRAW"] = true;
        else if (value === "TRANSFER") tmpObj["TRANSFER"] = true;
      }
    }
    setFilters(tmpObj);
    setQueryString(tmpParams.toString());
  }, [params]);

  useEffect(() => {
    function updateParams() {
      const updatedParams = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (key === "page") updatedParams.append("page", value);
        else if (value) updatedParams.append("type", key);
      }
      router.push(`?${updatedParams.toString()}`);
    }
    updateParams();
  }, [filters]);

  return (
    <div className="p-4 grid gap-3 overflow-auto">
      <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            View all of your financial activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Filters filters={filters} setFilters={setFilters} />
          {/* Make it visible properly on mobile */}
          <div className="grid  grid-cols-12">
            <div className="col-span-12">
              <Transactions page={filters.page} queryString={queryString} />
            </div>
          </div>
          <PaginationDiv currPage={filters.page} queryString={queryString} />
        </CardContent>
      </Card>
    </div>
  );
}
