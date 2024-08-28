"use client";
import { useEffect, useRef, useState } from "react";
import WorldMap from "react-svg-worldmap";

export default function WorldMapAnalytics() {
  const [width, setWidth] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (divRef.current) {
        setWidth(divRef.current.clientWidth);
      }
    };

    // Set initial width
    updateWidth();

    // Update width on window resize
    window.addEventListener("resize", updateWidth);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);
  const data = [
    { country: "cn", value: 1389618778 }, // china
    { country: "in", value: 1311559204 }, // india
    { country: "us", value: 331883986 }, // united states
    { country: "id", value: 264935824 }, // indonesia
    { country: "pk", value: 210797836 }, // pakistan
    { country: "br", value: 210301591 }, // brazil
    { country: "ng", value: 208679114 }, // nigeria
    { country: "bd", value: 161062905 }, // bangladesh
    { country: "ru", value: 141944641 }, // russia
    { country: "mx", value: 127318112 }, // mexico
  ];

  return (
    <div className="h-44 sm:h-64 overflow-auto rounded-md bg-slate-300 flex justify-center items-center">
      <div ref={divRef} className="w-full flex justify-center items-center">
        <WorldMap
          color="#215bae"
          title="Top 10 Populous Countries"
          value-suffix="people"
          data={data}
          size={width ?? "responsive"}
          richInteraction
        />
      </div>
    </div>
  );
}
