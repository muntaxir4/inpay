"use client";
import { FeaturesSectionDemo } from "./ac/features-section";
import { FlipWords } from "./ac/flipwords";

import React from "react";

export default function FlipWordsDemo() {
  const words = ["banking", "investing", "spending", "chatting"];

  return (
    <div>
      <div className="h-3/5 flex justify-center items-center px-4">
        <div className="sm:text-2xl mx-auto font-normal text-neutral-600 dark:text-neutral-400 text-center grid tracking-wider">
          <h1 className="text-5xl font-bold italic">inPay</h1>
          <br />
          <p>Your all-in-one financial hub.</p>
          <p>
            This brings
            <FlipWords words={words} duration={1000} />
            in one place
          </p>
        </div>
      </div>
      <FeaturesSectionDemo />
    </div>
  );
}
