"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import createGlobe from "cobe";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "Transfer page",
      description: "Interact and pay with ease.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 md:col-span-4 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Trusted by thousands",
      description: "Highly scalable and available to everyone.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 md:col-span-4 border-b md:border-none",
    },
  ];
  return (
    <div className="relative z-20 py-10 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl md:text-5xl md:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Packed with numerous features
        </h4>

        <p className="text-sm md:text-base tracking-wider  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          Manage your money effortlessly with InPay. Banking, Paying merchants,
          and interacting in one place.
        </p>
        <p className="text-sm md:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          And, yes all our code is open sourced.
        </p>
      </div>

      <div className="relative ">
        <div className="grid grid-cols-1 md:grid-cols-8 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className=" max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  const { theme } = useTheme();
  if (!theme) return null;
  const images = [
    `ss1${theme === "dark" ? "_dark" : ""}.png`,
    `ss2${theme === "dark" ? "_dark" : ""}.png`,
    `ss3${theme === "dark" ? "_dark" : ""}.png`,
  ];
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full  p-5  mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  ">
          <img
            src={images[imageIndex]}
            alt="pics"
            className=" object-cover object-left-top rounded-sm transition-transform"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      {/* <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" /> */}
    </div>
  );
};

export const SkeletonFour = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);
  if (!isLoaded) return <div>Loading</div>;
  return (
    <div className="h-60 flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10 ">
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72 " />
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.08 },
        { location: [20.5937, 78.9629], size: 0.15 },
        { location: [51.5074, -0.1278], size: 0.08 },
        { location: [35.6895, 139.6917], size: 0.06 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};
