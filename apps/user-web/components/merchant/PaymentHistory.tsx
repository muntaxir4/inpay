"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
import { useRecoilValue } from "recoil";
import { merchantState } from "@/store/atomsMerch";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loading from "../Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencyState } from "@/store/atoms";
import { getCurrencyFloatAmount } from "@/store/Singleton";

export const description = "An interactive bar chart";

// const chartData = [
//   { date: new Date("2024-04-01").toUTCString(), desktop: 222, mobile: 150 },
//   { date: new Date("2024-04-02").toUTCString(), desktop: 97, mobile: 180 },
//   { date: new Date("2024-06-28").toUTCString(), desktop: 149, mobile: 200 },
//   { date: new Date("2024-06-29").toUTCString(), desktop: 103, mobile: 160 },
//   { date: new Date("2024-06-30").toUTCString(), desktop: 446, mobile: 400 },
// ];

const chartConfig = {
  views: {
    label: "Page Views",
  },
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
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

function formatPaymentData(data: number[], rate: number) {
  const dayMilliSeconds = 24 * 60 * 60 * 1000;
  let prevDateMilliSeconds =
    new Date().getTime() - data.length * dayMilliSeconds;
  const res = data.map((item) => {
    const currDateMilliSeconds = prevDateMilliSeconds + dayMilliSeconds;
    prevDateMilliSeconds = currDateMilliSeconds;
    return {
      date: new Date(currDateMilliSeconds).toUTCString(),
      amount: getCurrencyFloatAmount(item / 100, rate),
    };
  });
  return res;
}

async function fetchPayHistory(range: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.get(
    API_URL + `/merchant/pay-history?range=${range}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}

export default function PaymentHistory() {
  const [timeRange, setTimeRange] = React.useState("30");
  const merchant = useRecoilValue(merchantState);
  const currency = useRecoilValue(currencyState);
  const { data, isLoading, error } = useQuery({
    queryKey: ["payHistory", merchant, timeRange],
    queryFn: () => fetchPayHistory(timeRange),
  });

  if (isLoading) return <Loading />;
  else if (error) return <div>Error fetching Payment History</div>;

  const chartData = formatPaymentData(data.payHistory, currency.rate);
  return (
    <Card className="hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row ">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Showing total payments for the last {timeRange} days
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="30" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full "
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
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
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="amount"
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
            <Bar dataKey={"amount"} fill={`var(--color-amount)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground flex justify-around w-full text-sm">
          <p>
            {formatDate(chartData[0]?.date ?? "")} -
            {" " +
              formatDate(chartData[chartData.length - 1]?.date ?? "") +
              " UTC"}
          </p>
          <p>
            Total Amount:{" "}
            {currency.symbol +
              parseFloat(
                chartData.reduce((acc, curr) => acc + curr.amount, 0).toString()
              ).toFixed(2)}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
