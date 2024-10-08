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
import Link from "next/link";
import { BalanceComponent, LockedBalance } from "./UserStates";
import RecentTxContent from "./RecentTxContent";

function BalanceCard() {
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
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
              <label htmlFor="balance">Available Balance</label>
              <div className="text-2xl font-semibold">
                <BalanceComponent />
              </div>
            </div>
            <div className="grid gap-1">
              <label htmlFor="available">Locked Balance</label>
              <div className="text-2xl font-semibold">
                <LockedBalance />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/app/transfer">
              <Button className="rounded-2xl w-full">
                <SendIcon className="mr-2 h-4 w-4" />
                Transfer
              </Button>
            </Link>
            <Link href="/app/deposit">
              <Button variant="outline" className="rounded-2xl w-full">
                <WalletIcon className="mr-2 h-4 w-4" />
                Deposit
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTransactions() {
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>View your recent financial activity.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Make it visible properly on mobile */}
        <div className="grid grid-cols-12">
          <div className="col-span-12">
            <RecentTxContent />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="p-4 grid gap-3 overflow-auto">
      <BalanceCard />
      <BalanceOverview />
      <RecentTransactions />
    </div>
  );
}
