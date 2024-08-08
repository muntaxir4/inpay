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
import RecentInteractionsContent from "./RecentInteractionsContent";
import RecentUsersContent from "./RecentUsersContent";
import SendTo from "./SendTo";
import SearchUsers from "./SearchUsers";

function SendRecieveCard() {
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow">
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
            <SearchUsers>
              <Button className="rounded-2xl w-full">
                <SendIcon className="mr-2 h-4 w-4" />
                Send
              </Button>
            </SearchUsers>
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

function RecentInteractionsCard() {
  return (
    <Card className="border-none shadow-none bg-background">
      <CardHeader>
        <CardTitle>Recent Interactions</CardTitle>
        <CardDescription>
          People you have interacted with recently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecentInteractionsContent />
      </CardContent>
    </Card>
  );
}

function RecentUsersCard() {
  return (
    <Card className="border-none shadow-none bg-background">
      <CardHeader>
        <CardTitle>InPay Users</CardTitle>
        <CardDescription>
          Pay easily to recently onboarded users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecentUsersContent />
      </CardContent>
    </Card>
  );
}

export default function Transfer() {
  return (
    <div className="p-4 grid gap-3 overflow-auto">
      <SendRecieveCard />
      <RecentInteractionsCard />
      <RecentUsersCard />
    </div>
  );
}
