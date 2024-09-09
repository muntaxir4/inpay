"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WithdrawBankOptions from "./WithdrawBankOptions";

export default function WithdrawCard() {
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
      <CardHeader>
        <CardTitle>Withdraw</CardTitle>
        <CardDescription>
          {
            "Withdraw from inPay to your bank. Currently, there's 0% fee on withdrawls."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WithdrawBankOptions />
      </CardContent>
    </Card>
  );
}
