"use client";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function Loading({
  forcedOpposite,
}: {
  forcedOpposite?: boolean;
}) {
  const { theme } = useTheme();
  useEffect(() => {
    async function getLoader() {
      const { bouncy } = await import("ldrs");
      bouncy.register();
    }
    getLoader();
  }, []);
  if (!theme) return null;
  return (
    <div className="flex flex-col justify-center items-center">
      <l-bouncy
        size={30}
        color={
          theme === "dark"
            ? !forcedOpposite
              ? "white"
              : "black"
            : !forcedOpposite
              ? "black"
              : "white"
        }
      ></l-bouncy>
    </div>
  );
}
