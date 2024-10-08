"use client";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import Loading from "@/components/Loading";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currencyState, userRefetchState } from "@/store/atoms";
import { currencies } from "@/store/Singleton";
import { Badge } from "@/components/ui/badge";

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

function VerifyDialog({
  amount,
  open,
  setOpen,
}: {
  amount: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  // page 0: Ask to receive OTP
  // page 1: Ask to verify OTP
  const [page, setPage] = useState(0);
  const { toast } = useToast();
  const { id: currencyId } = useRecoilValue(currencyState);
  const currency = Object.entries(currencies).find(
    ([curr, value]) => value.id === currencyId
  )?.[0];
  const setIsRefetch = useSetRecoilState(userRefetchState);

  useEffect(() => {
    setPage(0);
  }, [open]);

  async function getOTP() {
    try {
      setPage(3);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(
        API_URL + "/ramp/hdfc/offramp/get-otp?amount=" + amount,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setPage(1);
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not get OTP",
        variant: "destructive",
      });
      setPage(0);
    }
  }

  async function verifyOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const otp = e.currentTarget.otp.value;
    try {
      const response = await axios.post(
        API_URL + "/ramp/hdfc/offramp/verify-otp",
        {
          amount,
          otp,
          currency,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast({
          title: "Withdrawal Processing",
        });
        setIsRefetch((prev) => !prev);
        setOpen(false);
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
  }

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw</DialogTitle>
          <DialogDescription>
            Confirm if you want to withdraw the amount.
          </DialogDescription>
        </DialogHeader>
        <div className="grid text-center gap-3 mx-auto">
          {page === 0 && <Button onClick={getOTP}>Receive OTP</Button>}
          {page === 3 && (
            <Button>
              <Loading forcedOpposite={true} />
            </Button>
          )}
          {page === 1 && (
            <>
              <p className="text-muted-foreground text-sm">Enter OTP</p>
              <form
                className="flex flex-col w-full max-w-sm items-center gap-3 "
                onSubmit={verifyOTP}
              >
                <InputOTP
                  maxLength={6}
                  name="otp"
                  className="bg-accent-foreground bg-opacity-100"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button>Submit</Button>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </>
  );
}

function DepositForm() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);

  return (
    <>
      <form
        className="flex flex-col justify-between gap-4 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (e.currentTarget.amount.value <= 0) return;
          setAmount(Number(e.currentTarget.amount.value));
          e.currentTarget.reset();
          setOpen(true);
        }}
      >
        <Input
          type="number"
          name="amount"
          className="rounded-2xl h-8 text-center bg-card w-3/4 sm:w-2/5 mx-auto"
          placeholder="Enter amount"
          step={0.01}
          required
        />
        <Button size={"sm"} className="rounded-xl mx-auto">
          Proceed to Verify
        </Button>
      </form>
      <Dialog open={open} onOpenChange={setOpen}>
        <VerifyDialog amount={amount} open={open} setOpen={setOpen} />
      </Dialog>
    </>
  );
}

export default function WithdrawBankOptions() {
  const [option, setOption] = useState(0);
  return (
    <div className="rounded-lg border grid grid-cols-[25%_1fr] bg-background/20 dark:bg-background/50">
      <div className="border-r text-center border-slate-400/15">
        <div
          className={cn(
            "border-b rounded-tl-lg p-1",
            option == 0 &&
              "bg-accent-foreground text-background font-semibold tracking-wide"
          )}
          onClick={() => setOption(0)}
        >
          HDFC
        </div>
        <div
          className={cn(
            "border-b p-1",
            option == 1 &&
              "bg-accent-foreground text-background font-semibold tracking-wide"
          )}
          // onClick={() => setOption(1)}
        >
          SBI <Badge variant={"outline"}>soon</Badge>
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
                {"Note: You will need to verify OTP on the next step."}
              </p>
            </div>
          );
        })}
    </div>
  );
}
