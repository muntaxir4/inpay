"use client";
import { useEffect } from "react";

export default function Loading() {
  useEffect(() => {
    async function getLoader() {
      const { bouncy } = await import("ldrs");
      bouncy.register();
    }
    getLoader();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center">
      <l-bouncy size={30} color="black"></l-bouncy>
    </div>
  );
}
