import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import DepositBankOptions from "./DepositBankOptions";
import WithdrawCard from "./WithdrawCard";

function DepositCard() {
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow">
      <CardHeader>
        <CardTitle>Deposit</CardTitle>
        <CardDescription>Deposit money into your inPay account</CardDescription>
      </CardHeader>
      <CardContent>
        <DepositBankOptions />
      </CardContent>
    </Card>
  );
}

export default function Deposit() {
  return (
    <div className="p-4 grid gap-4">
      <DepositCard />
      <WithdrawCard />
    </div>
  );
}
