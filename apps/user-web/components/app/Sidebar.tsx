"use client";
import { Home, MessageSquare, Send, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LoggedinUserCard from "./LoggedinUserCard";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="h-full flex flex-col sm:border-r py-4 sm:bg-muted/40">
      <Link href="/app" className="mx-4 my-1">
        <Button
          variant={"ghost"}
          className={cn(
            " rounded-2xl w-full ",
            pathname.endsWith("/app") && "bg-muted-foreground/15"
          )}
        >
          <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
            <Home />
            <p className="text-lg">Home</p>
          </div>
        </Button>
      </Link>
      <Link href="/app/transfer" className="mx-4 my-1">
        <Button
          variant={"ghost"}
          className={cn(
            " rounded-2xl w-full",
            pathname.endsWith("/transfer") && "bg-muted-foreground/15"
          )}
        >
          <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
            <Send />
            <p className="text-lg">Transfer</p>
          </div>
        </Button>
      </Link>
      <Link href="/app/deposit" className="mx-4 my-1">
        <Button
          variant={"ghost"}
          className={cn(
            " rounded-2xl w-full",
            pathname.endsWith("/deposit") && "bg-muted-foreground/15"
          )}
        >
          <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
            <Wallet />
            <p className="text-lg">Deposit</p>
          </div>
        </Button>
      </Link>
      <Link href="/app/chat" className="mx-4 my-1">
        <Button
          variant={"ghost"}
          className={cn(
            " rounded-2xl w-full",
            pathname.endsWith("/chat") && "bg-muted-foreground/15"
          )}
        >
          <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
            <MessageSquare />
            <p className="text-lg">Chat</p>
          </div>
        </Button>
      </Link>
      <div className="mx-4 my-1 p-2 h-full flex flex-col justify-between">
        <div></div>
        <LoggedinUserCard />
      </div>
    </div>
  );
}

export function SidebarMobile({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent
        side={"left"}
        className="bg-card p-0"
        onClick={() => setOpen(false)}
      >
        <div className="h-full pt-16">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
