"use client";
import { FeaturesSectionDemo } from "./ac/features-section";
import { FlipWords } from "./ac/flipwords";

import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function HomePage() {
  const words = ["banking", "investing", "spending", "chatting"];
  return (
    <div>
      <div className=" my-16 flex justify-center items-center px-4">
        <div className="sm:text-2xl mx-auto font-normal text-neutral-600 dark:text-neutral-400 text-center grid tracking-wider">
          <h1 className="text-5xl font-bold italic">inPay</h1>
          <br />
          <p>Your all-in-one financial hub.</p>
          <p>
            This brings
            <FlipWords words={words} duration={1000} />
            in a single app
          </p>
        </div>
      </div>
      <div className="gap-2 flex justify-center sm:gap-8 mb-4">
        {localStorage?.getItem("inpay") === "true" ? (
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
      <FeaturesSectionDemo />
      <div className="flex gap-3 justify-end pb-5 mx-8 text-muted-foreground">
        <a href="https://github.com/muntaxir4/inpay" target="_blank">
          Source Code
        </a>
        <a href="https://mallik.tech" target="_blank">
          <p>Muntasir Mallik</p>
        </a>
      </div>
    </div>
  );
}
