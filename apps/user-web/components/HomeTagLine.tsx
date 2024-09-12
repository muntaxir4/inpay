"use client";
import { useEffect, useRef, useState } from "react";
import { FlipWords } from "./ac/flipwords";

export default function HomeTagLine() {
  const words = ["banking", "transfering", "spending", "conversations"];
  const [isVisible, setIsVisible] = useState(true);
  const pRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]: any) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // Use the viewport as the root
        threshold: [0, 0.1], // Trigger when even a small portion is visible
      }
    );

    if (pRef.current) {
      observer.observe(pRef.current);
    }

    return () => {
      if (pRef.current) {
        observer.unobserve(pRef.current);
      }
    };
  }, []);

  return (
    <div className="my-16 flex justify-center items-center px-4">
      <div className="sm:text-2xl mx-auto font-normal text-neutral-600 dark:text-neutral-400 text-center grid tracking-wider">
        <h1 className="text-5xl font-bold italic">inPay</h1>
        <br />
        <p>Your all-in-one financial hub.</p>
        <p
          ref={pRef}
          style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s" }}
        >
          This brings
          <FlipWords words={words} duration={1000} />
          in a single app
        </p>
      </div>
    </div>
  );
}
