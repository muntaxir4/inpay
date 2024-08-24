"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import Loading from "@/components/Loading";
import { useToast } from "@/components/ui/use-toast";

const banks = [
  {
    id: 0,
    name: "HDFC",
    description: "HDFC is a popular private bank",
    url: "https://www.hdfcbank.com/",
  },
  {
    id: 1,
    name: "SBI",
    description: "SBI has the most customerts in India",
    url: "https://www.onlinesbi.com/",
  },
];

function DepositForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const amount = e.currentTarget.amount.value;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await axios.post(
        API_URL + "/ramp/hdfc/onramp",
        {
          amount,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        const token = response.data.token;
        window.open(
          "/bank/hdfc" + `?token=${token}&amount=${amount}`,
          "_blank"
        );
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: "Error",
          description: error?.response?.data.message,
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  }

  return (
    <form
      className="flex flex-col justify-between gap-4 mb-4"
      onSubmit={handleSubmit}
    >
      <Input
        type="number"
        className="rounded-2xl h-8 text-center bg-card w-3/4 sm:w-2/5 mx-auto"
        placeholder="Enter amount"
        name="amount"
        step={0.01}
        required
      />
      <Button
        type="submit"
        size={"sm"}
        className="rounded-xl mx-auto flex gap-2"
      >
        <p>Proceed to Pay</p>
        {loading && <Loading />}
      </Button>
    </form>
  );
}

export default function DepositBankOptions() {
  const [option, setOption] = useState(0);
  return (
    <div className="rounded-lg border grid grid-cols-[25%_1fr] bg-background/20">
      <div className="border-r text-center border-slate-400/15">
        <div
          className={cn(
            "border-b rounded-tl-lg p-1",
            option == 0 && "bg-muted"
          )}
          onClick={() => setOption(0)}
        >
          HDFC
        </div>
        <div
          className={cn("border-b p-1", option == 1 && "bg-muted")}
          // onClick={() => setOption(1)}
        >
          SBI
        </div>
      </div>
      {banks
        .filter((bank) => bank.id == option)
        .map((bank) => {
          return (
            <div key={bank.id} className="p-2 text-center ">
              <p className="text-sm opacity-50 mb-4">{bank.description}</p>
              <DepositForm />
              <p className="text-sm opacity-50">
                {
                  "Note: This will open a new window. And you won't be able to change the amount later."
                }
              </p>
            </div>
          );
        })}
    </div>
  );
}
