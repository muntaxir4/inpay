"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getFloatAmount } from "@/store/Singleton";
import { useRecoilValue } from "recoil";
import { userState } from "@/store/atoms";

interface BalanceHistory {
  day: string;
  balance: number;
}

const chartConfig = {
  balance: {
    label: "Balance",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function formatDate(dateUTC: string): string {
  const date = new Date(dateUTC);
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function formatBalanceHistoryData(
  balanceHistoryData: number[]
): BalanceHistory[] {
  const dayNumber = 24 * 60 * 60 * 1000;
  let prev = Date.now() - 29 * dayNumber;
  const data = balanceHistoryData.map((entry) => {
    const curr = prev;
    prev = prev + dayNumber;
    return {
      day: new Date(curr).toUTCString(),
      balance: getFloatAmount(entry),
    };
  });
  return data;
}

export default function BalanceHistory({ data }: { data: number[] }) {
  const user = useRecoilValue(userState);
  const chartData = formatBalanceHistoryData(data);
  return (
    <Card className="flex flex-col w-full hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
      <CardHeader>
        <CardTitle>Balance History</CardTitle>
        <CardDescription className="flex justify-between text-sm">
          <p>Showing history for the last 30 days</p>
          <p className="text-end font-medium">
            {formatDate(chartData[0]?.day ?? "")} -{" "}
            {formatDate(chartData[29]?.day ?? "") + " UTC"}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 40,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Area
              dataKey="balance"
              type="natural"
              fill="var(--color-balance)"
              fillOpacity={0.5}
              stroke="var(--color-balance)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
