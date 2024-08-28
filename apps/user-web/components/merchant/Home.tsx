import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QrCodeIcon } from "lucide-react";
import WorldMapAnalytics from "./WorldMapAnalytics";
import ShowQR from "./ShowQR";
import CustomizeQR from "./CustomizeQR";

function MerchantCard() {
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
      <CardHeader>
        <CardTitle>Merchant Dashboard</CardTitle>
        <CardDescription>
          Perform P2P money transactions with anybody
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-1">
          <label htmlFor="balance">Available Balance</label>
          <div className="text-2xl font-semibold">$100.00</div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-end w-full">
          <div className="grid grid-cols-2 gap-4">
            <CustomizeQR />
            <ShowQR />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="p-4 grid gap-3 overflow-auto min-h-full">
      <MerchantCard />
      <WorldMapAnalytics />
    </div>
  );
}
