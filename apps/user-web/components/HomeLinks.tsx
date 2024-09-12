"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function HomeLinks() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("inpay") === "true") {
      setIsLoggedIn(true);
    }
  }, []);
  return (
    <>
      <div className="gap-2 flex justify-center sm:gap-8 mb-4">
        {isLoggedIn ? (
          <Link href={"/app"}>
            <Button className="rounded-2xl">Go to App</Button>
          </Link>
        ) : (
          <>
            <Link href={"/auth/signup"}>
              <Button className="rounded-2xl">Join Now</Button>
            </Link>

            <Link href={"/auth/signin"}>
              <Button variant={"outline"} className="rounded-2xl">
                Log In
              </Button>
            </Link>
          </>
        )}
      </div>
      <div className="flex justify-center -mb-3">
        <Link href={"/merchant"} className="mx-auto">
          <Button variant={"link"} className="rounded-2xl">
            Access Merchant
          </Button>
        </Link>
      </div>
    </>
  );
}
