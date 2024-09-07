"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import WorldMap from "react-svg-worldmap";
import Loading from "../Loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

function AnalyticsTable({ data }: { data: any }) {
  if (!data) return null;
  return (
    <table className="w-full rounded-lg border">
      <thead>
        <tr>
          <th>Country</th>
          <th>Transactions</th>
        </tr>
      </thead>
      <tbody className="rounded-md border">
        {data.map((item: any, index: number) => (
          <tr key={index} className="hover:bg-foreground/25">
            <td className="px-3 border border-foreground">
              {item.country.toUpperCase()}
            </td>
            <td className="px-3 border text-end border-foreground">
              {item.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function WorldMapAnalytics() {
  const [width, setWidth] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });
  const [mapData, setMapData] = useState<{
    country: string;
    value: number;
  } | null>(null);

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
  }, [divRef.current]);

  useEffect(() => {
    if (data && data.analytics)
      setMapData(
        data.analytics.map((item: any) => {
          return {
            country: item.countryCode,
            value: item._count.countryCode,
          };
        })
      );
  }, [data]);

  // const data = [
  //   { country: "cn", value: 1389618778 }, // china
  //   { country: "IN", value: 1311559204 }, // india
  // ];

  async function fetchAnalytics() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await axios.get(API_URL + "/merchant/analytics", {
      withCredentials: true,
    });
    return response.data;
  }

  if (isLoading) return <Loading />;
  else if (error) return <div>Error fetching analytics</div>;
  else if (data.analytics) {
    return (
      <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Showing countries with transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md overflow-auto border h-fit">
            <div className="h-44 sm:h-64 overflow-auto  bg-slate-300 flex justify-center items-center">
              <div
                ref={divRef}
                className="w-full flex justify-center items-center"
              >
                <WorldMap
                  color="#215bae"
                  title="Top 10 Populous Countries"
                  value-suffix="people"
                  data={Array.isArray(mapData) ? mapData : []}
                  size={width || "responsive"}
                  richInteraction
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <AnalyticsTable data={mapData} />
        </CardFooter>
      </Card>
    );
  }
}
