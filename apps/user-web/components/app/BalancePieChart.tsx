"use client";

import { Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BalanceHistoryData } from "./BalanceOverview";

export const description = "A pie chart with a label list";

const chartConfig = {
  amount: {
    label: "Amount",
  },
  DEPOSIT: {
    label: "DEPOSIT",
    color: "hsl(var(--chart-1))",
  },
  WITHDRAW: {
    label: "WITHDRAW",
    color: "hsl(var(--chart-2))",
  },
  RECEIVED: {
    label: "RECEIVED",
    color: "hsl(var(--chart-3))",
  },
  SENT: {
    label: "SENT",
    color: "hsl(var(--chart-4))",
  },
  SPENT: {
    label: "SPENT",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function formatBalanceHistoryData(
  data: BalanceHistoryData["transactionTypes"]
) {
  const res = Object.entries(data).map(([key, value]) => ({
    txType: key,
    amount: value,
    fill: `var(--color-${key})`,
  }));
  return res;
}

export default function BalancePieChart({
  data,
}: {
  data: BalanceHistoryData["transactionTypes"];
}) {
  const chartData = formatBalanceHistoryData(data);
  return (
    <Card className="flex flex-col w-full hover:shadow-lg hover:shadow-primary/30 transition-shadow animate-slide-up">
      <CardHeader className="items-center pb-0">
        <CardTitle>Transactions Summary</CardTitle>
        <CardDescription>For last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 grid content-center">
        <div className="h-full">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="txType" hideLabel />}
              />
              <Pie data={chartData} dataKey="amount" />
              <ChartLegend
                content={<ChartLegendContent nameKey="txType" />}
                className="-translate-y-3 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center text-base"
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
