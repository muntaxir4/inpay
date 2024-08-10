"use client";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function Loading() {
  const { theme } = useTheme();
  useEffect(() => {
    async function getLoader() {
      const { bouncy } = await import("ldrs");
      bouncy.register();
    }
    getLoader();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center">
      <l-bouncy
        size={30}
        color={theme == "light" ? "white" : "black"}
      ></l-bouncy>
    </div>
  );
}
