"use client";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, PanelLeftOpen, Sun } from "lucide-react";
import Link from "next/link";
import { SidebarMobile } from "./app/Sidebar";
import { usePathname } from "next/navigation";
import Notification from "./Notification";
import { SidebarMobileMerchant } from "./merchant/Sidebar";
import { useRecoilValue } from "recoil";
import { userState } from "@/store/atoms";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const user = useRecoilValue(userState);
  const pathname = usePathname();
  return (
    <nav className="grid grid-cols-3 border-b bg-muted/40 p-2 items-center">
      {pathname.startsWith("/app") && user && (
        <SidebarMobile>
          <PanelLeftOpen className="ml-2 sm:hidden" />
        </SidebarMobile>
      )}
      {pathname.startsWith("/merchant") && (
        <SidebarMobileMerchant>
          <PanelLeftOpen className="ml-2 sm:hidden" />
        </SidebarMobileMerchant>
      )}

      <h2 className="col-start-2 text-2xl font-bold text-center">
        <Link href={"/"}>inPay</Link>
      </h2>
      <div className="grid grid-cols-3 items-center">
        <div className="col-span-2 flex justify-end h-full items-center">
          {user && <Notification />}
        </div>
        <div className="col-start-3 text-end">
          {theme === "light" ? (
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => setTheme("dark")}
            >
              <Moon size={"20"} />
            </Button>
          ) : (
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => setTheme("light")}
            >
              <Sun size={"20"} />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
