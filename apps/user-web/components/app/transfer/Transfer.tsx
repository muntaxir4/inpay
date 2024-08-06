import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QrCodeIcon, SendIcon } from "lucide-react";
import { BalanceComponent } from "../UserStates";

function SendRecieveCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send and Recieve</CardTitle>
        <CardDescription>
          Perform P2P money transactions with anybody
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-1">
          <label htmlFor="balance">Available Balance</label>
          <div className="text-2xl font-semibold">
            $<BalanceComponent />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-end w-full">
          <div className="grid grid-cols-2 gap-4">
            <Button className="rounded-2xl">
              <SendIcon className="mr-2 h-4 w-4" />
              Send
            </Button>
            <Button variant="outline" className="rounded-2xl">
              <QrCodeIcon className="mr-2 h-4 w-4" />
              Show QR
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function Transfer() {
  return (
    <div className="p-4 grid gap-3 overflow-auto">
      <SendRecieveCard />
    </div>
  );
}
