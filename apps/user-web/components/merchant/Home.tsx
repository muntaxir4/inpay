"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WorldMapAnalytics from "./WorldMapAnalytics";
import ShowQR from "./ShowQR";
import CustomizeQR from "./CustomizeQR";
import { useRecoilValue } from "recoil";
import { merchantState } from "@/store/atomsMerch";
import PaymentHistory from "./PaymentHistory";

function MerchantCard() {
  const merchant = useRecoilValue(merchantState);
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
      <CardHeader>
        <CardTitle>Merchant Dashboard</CardTitle>
        <CardDescription>
          Perform P2P money transactions with anybody
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 items-center">
          <div className="grid gap-1">
            <label htmlFor="balance">Available Balance</label>
            <div className="text-2xl font-semibold">
              ${(merchant?.balanceM ?? 0) / 100}
            </div>
          </div>
          <div className="flex justify-end w-full">
            <div className="grid grid-cols-2 gap-4">
              <CustomizeQR />
              <ShowQR />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="p-4 grid gap-3 overflow-auto min-h-full content-start">
      <MerchantCard />
      <WorldMapAnalytics />
      <PaymentHistory />
    </div>
  );
}
