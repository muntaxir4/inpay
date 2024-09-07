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

export const description = "An interactive bar chart";

const chartData = [
  { date: new Date("2024-04-01").toUTCString(), desktop: 222, mobile: 150 },
  { date: new Date("2024-04-02").toUTCString(), desktop: 97, mobile: 180 },
  { date: new Date("2024-04-03").toUTCString(), desktop: 167, mobile: 120 },
  { date: new Date("2024-04-04").toUTCString(), desktop: 242, mobile: 260 },
  { date: new Date("2024-04-05").toUTCString(), desktop: 373, mobile: 290 },
  { date: new Date("2024-04-06").toUTCString(), desktop: 301, mobile: 340 },
  { date: new Date("2024-04-07").toUTCString(), desktop: 245, mobile: 180 },
  { date: new Date("2024-04-08").toUTCString(), desktop: 409, mobile: 320 },
  { date: new Date("2024-04-09").toUTCString(), desktop: 59, mobile: 110 },
  { date: new Date("2024-04-10").toUTCString(), desktop: 261, mobile: 190 },
  { date: new Date("2024-04-11").toUTCString(), desktop: 327, mobile: 350 },
  { date: new Date("2024-04-12").toUTCString(), desktop: 292, mobile: 210 },
  { date: new Date("2024-04-13").toUTCString(), desktop: 342, mobile: 380 },
  { date: new Date("2024-04-14").toUTCString(), desktop: 137, mobile: 220 },
  { date: new Date("2024-04-15").toUTCString(), desktop: 120, mobile: 170 },
  { date: new Date("2024-04-16").toUTCString(), desktop: 138, mobile: 190 },
  { date: new Date("2024-04-17").toUTCString(), desktop: 446, mobile: 360 },
  { date: new Date("2024-04-18").toUTCString(), desktop: 364, mobile: 410 },
  { date: new Date("2024-04-19").toUTCString(), desktop: 243, mobile: 180 },
  { date: new Date("2024-04-20").toUTCString(), desktop: 89, mobile: 150 },
  { date: new Date("2024-04-21").toUTCString(), desktop: 137, mobile: 200 },
  { date: new Date("2024-04-22").toUTCString(), desktop: 224, mobile: 170 },
  { date: new Date("2024-04-23").toUTCString(), desktop: 138, mobile: 230 },
  { date: new Date("2024-04-24").toUTCString(), desktop: 387, mobile: 290 },
  { date: new Date("2024-04-25").toUTCString(), desktop: 215, mobile: 250 },
  { date: new Date("2024-04-26").toUTCString(), desktop: 75, mobile: 130 },
  { date: new Date("2024-04-27").toUTCString(), desktop: 383, mobile: 420 },
  { date: new Date("2024-04-28").toUTCString(), desktop: 122, mobile: 180 },
  { date: new Date("2024-04-29").toUTCString(), desktop: 315, mobile: 240 },
  { date: new Date("2024-04-30").toUTCString(), desktop: 454, mobile: 380 },
  { date: new Date("2024-05-01").toUTCString(), desktop: 165, mobile: 220 },
  { date: new Date("2024-05-02").toUTCString(), desktop: 293, mobile: 310 },
  { date: new Date("2024-05-03").toUTCString(), desktop: 247, mobile: 190 },
  { date: new Date("2024-05-04").toUTCString(), desktop: 385, mobile: 420 },
  { date: new Date("2024-05-05").toUTCString(), desktop: 481, mobile: 390 },
  { date: new Date("2024-05-06").toUTCString(), desktop: 498, mobile: 520 },
  { date: new Date("2024-05-07").toUTCString(), desktop: 388, mobile: 300 },
  { date: new Date("2024-05-08").toUTCString(), desktop: 149, mobile: 210 },
  { date: new Date("2024-05-09").toUTCString(), desktop: 227, mobile: 180 },
  { date: new Date("2024-05-10").toUTCString(), desktop: 293, mobile: 330 },
  { date: new Date("2024-05-11").toUTCString(), desktop: 335, mobile: 270 },
  { date: new Date("2024-05-12").toUTCString(), desktop: 197, mobile: 240 },
  { date: new Date("2024-05-13").toUTCString(), desktop: 197, mobile: 160 },
  { date: new Date("2024-05-14").toUTCString(), desktop: 448, mobile: 490 },
  { date: new Date("2024-05-15").toUTCString(), desktop: 473, mobile: 380 },
  { date: new Date("2024-05-16").toUTCString(), desktop: 338, mobile: 400 },
  { date: new Date("2024-05-17").toUTCString(), desktop: 499, mobile: 420 },
  { date: new Date("2024-05-18").toUTCString(), desktop: 315, mobile: 350 },
  { date: new Date("2024-05-19").toUTCString(), desktop: 235, mobile: 180 },
  { date: new Date("2024-05-20").toUTCString(), desktop: 177, mobile: 230 },
  { date: new Date("2024-05-21").toUTCString(), desktop: 82, mobile: 140 },
  { date: new Date("2024-05-22").toUTCString(), desktop: 81, mobile: 120 },
  { date: new Date("2024-05-23").toUTCString(), desktop: 252, mobile: 290 },
  { date: new Date("2024-05-24").toUTCString(), desktop: 294, mobile: 220 },
  { date: new Date("2024-05-25").toUTCString(), desktop: 201, mobile: 250 },
  { date: new Date("2024-05-26").toUTCString(), desktop: 213, mobile: 170 },
  { date: new Date("2024-05-27").toUTCString(), desktop: 420, mobile: 460 },
  { date: new Date("2024-05-28").toUTCString(), desktop: 233, mobile: 190 },
  { date: new Date("2024-05-29").toUTCString(), desktop: 78, mobile: 130 },
  { date: new Date("2024-05-30").toUTCString(), desktop: 340, mobile: 280 },
  { date: new Date("2024-05-31").toUTCString(), desktop: 178, mobile: 230 },
  { date: new Date("2024-06-01").toUTCString(), desktop: 178, mobile: 200 },
  { date: new Date("2024-06-02").toUTCString(), desktop: 470, mobile: 410 },
  { date: new Date("2024-06-03").toUTCString(), desktop: 103, mobile: 160 },
  { date: new Date("2024-06-04").toUTCString(), desktop: 439, mobile: 380 },
  { date: new Date("2024-06-05").toUTCString(), desktop: 88, mobile: 140 },
  { date: new Date("2024-06-06").toUTCString(), desktop: 294, mobile: 250 },
  { date: new Date("2024-06-07").toUTCString(), desktop: 323, mobile: 370 },
  { date: new Date("2024-06-08").toUTCString(), desktop: 385, mobile: 320 },
  { date: new Date("2024-06-09").toUTCString(), desktop: 438, mobile: 480 },
  { date: new Date("2024-06-10").toUTCString(), desktop: 155, mobile: 200 },
  { date: new Date("2024-06-11").toUTCString(), desktop: 92, mobile: 150 },
  { date: new Date("2024-06-12").toUTCString(), desktop: 492, mobile: 420 },
  { date: new Date("2024-06-13").toUTCString(), desktop: 81, mobile: 130 },
  { date: new Date("2024-06-14").toUTCString(), desktop: 426, mobile: 380 },
  { date: new Date("2024-06-15").toUTCString(), desktop: 307, mobile: 350 },
  { date: new Date("2024-06-16").toUTCString(), desktop: 371, mobile: 310 },
  { date: new Date("2024-06-17").toUTCString(), desktop: 475, mobile: 520 },
  { date: new Date("2024-06-18").toUTCString(), desktop: 107, mobile: 170 },
  { date: new Date("2024-06-19").toUTCString(), desktop: 341, mobile: 290 },
  { date: new Date("2024-06-20").toUTCString(), desktop: 408, mobile: 450 },
  { date: new Date("2024-06-21").toUTCString(), desktop: 169, mobile: 210 },
  { date: new Date("2024-06-22").toUTCString(), desktop: 317, mobile: 270 },
  { date: new Date("2024-06-23").toUTCString(), desktop: 480, mobile: 530 },
  { date: new Date("2024-06-24").toUTCString(), desktop: 132, mobile: 180 },
  { date: new Date("2024-06-25").toUTCString(), desktop: 141, mobile: 190 },
  { date: new Date("2024-06-26").toUTCString(), desktop: 434, mobile: 380 },
  { date: new Date("2024-06-27").toUTCString(), desktop: 448, mobile: 490 },
  { date: new Date("2024-06-28").toUTCString(), desktop: 149, mobile: 200 },
  { date: new Date("2024-06-29").toUTCString(), desktop: 103, mobile: 160 },
  { date: new Date("2024-06-30").toUTCString(), desktop: 446, mobile: 400 },
];

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
    year: "numeric",
  });
}

function formatPaymentData(data: number[]) {
  const dayMilliSeconds = 24 * 60 * 60 * 1000;
  let prevDateMilliSeconds =
    new Date().getTime() - data.length * dayMilliSeconds;
  const res = data.map((item) => {
    const currDateMilliSeconds = prevDateMilliSeconds + dayMilliSeconds;
    prevDateMilliSeconds = currDateMilliSeconds;
    return {
      date: new Date(currDateMilliSeconds).toUTCString(),
      amount: item / 100,
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
  const { data, isLoading, error } = useQuery({
    queryKey: ["payHistory", merchant, timeRange],
    queryFn: () => fetchPayHistory(timeRange),
  });

  if (isLoading) return <Loading />;
  else if (error) return <div>Error fetching Payment History</div>;

  const chartData = formatPaymentData(data.payHistory);
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
            {" " + formatDate(chartData[chartData.length - 1]?.date ?? "")}
          </p>
          <p>
            Total Amount:{" "}
            {chartData.reduce((acc, curr) => acc + curr.amount, 0)}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
