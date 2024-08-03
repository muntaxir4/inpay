"use client";
import { SendIcon, WalletIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "../ui/card";
import BalanceOverview from "./BalanceOverview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

function BalanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to inPay</CardTitle>
        <CardDescription>
          Manage your finances with ease using our secure and user-friendly
          payment application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label htmlFor="balance">Current Balance</label>
              <div className="text-2xl font-semibold">$5,432.00</div>
            </div>
            <div className="grid gap-1">
              <label htmlFor="available">Locked Balance</label>
              <div className="text-2xl font-semibold">$0.00</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button className="rounded-2xl">
              <SendIcon className="mr-2 h-4 w-4" />
              Transfer
            </Button>
            <Button variant="outline" className="rounded-2xl">
              <WalletIcon className="mr-2 h-4 w-4" />
              Deposit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>View your recent financial activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>2023-04-15</TableCell>
              <TableCell>Rent Payment</TableCell>
              <TableCell>-$1,200.00</TableCell>
              <TableCell>
                <Badge variant="outline">Completed</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2023-04-10</TableCell>
              <TableCell>Grocery Shopping</TableCell>
              <TableCell>-$125.37</TableCell>
              <TableCell>
                <Badge variant="outline">Completed</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2023-04-05</TableCell>
              <TableCell>Payroll Deposit</TableCell>
              <TableCell>+$3,500.00</TableCell>
              <TableCell>
                <Badge variant="outline">Completed</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2023-03-30</TableCell>
              <TableCell>Utility Bill</TableCell>
              <TableCell>-$75.00</TableCell>
              <TableCell>
                <Badge variant="outline">Completed</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="px-4 my-4 grid gap-3 overflow-auto">
      <BalanceCard />
      <BalanceOverview />
      <RecentTransactions />
    </div>
  );
}
