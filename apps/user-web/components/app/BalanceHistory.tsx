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

function formatBalanceHistoryData(
  balanceHistoryData: number[]
): BalanceHistory[] {
  const formatDate = (dateNumber: number): string => {
    const date = new Date(dateNumber);
    return date.toLocaleString("en-IN", { day: "numeric", month: "long" });
  };
  const dayNumber = 24 * 60 * 60 * 1000;
  let prev = Date.now() - 29 * dayNumber;
  const data = balanceHistoryData.map((entry) => {
    const curr = formatDate(prev);
    prev = prev + dayNumber;
    return {
      day: curr,
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
            {chartData[0]?.day} - {chartData[29]?.day}
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
              tickFormatter={(value) => value.slice(0, 2)}
              interval={2}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
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
