import { Home, Send, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="hidden sm:flex flex-col border-r py-4 bg-muted/40">
      <Link href="/app" className="mx-4 my-1">
        <Button variant={"ghost"} className=" rounded-2xl w-full">
          <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
            <Home />
            <p className="text-lg">Home</p>
          </div>
        </Button>
      </Link>
      <Link href="/app/transfer" className="mx-4 my-1">
        <Button variant={"ghost"} className=" rounded-2xl w-full">
          <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
            <Send />
            <p className="text-lg">Transfer</p>
          </div>
        </Button>
      </Link>
      <Link href="/app/deposit" className="mx-4 my-1">
        <Button variant={"ghost"} className=" rounded-2xl w-full">
          <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
            <Wallet />
            <p className="text-lg">Deposit</p>
          </div>
        </Button>
      </Link>
    </div>
  );
}
