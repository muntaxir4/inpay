"use client";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useRecoilValue } from "recoil";
import { userState } from "@/store/atoms";
import Link from "next/link";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const user = useRecoilValue(userState);

  return (
    <nav className="grid grid-cols-3 border-b bg-muted/40 p-2 items-center">
      <h2 className="col-start-2 text-2xl font-bold text-center">
        <Link href={"/"}>inPay</Link>
      </h2>
      <div className="grid grid-cols-3 items-center">
        {user && (
          <h3 className="col-span-2 text-lg text-center">
            {user.firstName + " " + user.lastName}
          </h3>
        )}
        <div className="col-start-3 text-end">
          {theme === "light" ? (
            <Button size={"icon"} onClick={() => setTheme("dark")}>
              <Moon size={"20"} />
            </Button>
          ) : (
            <Button size={"icon"} onClick={() => setTheme("light")}>
              <Sun size={"20"} />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
