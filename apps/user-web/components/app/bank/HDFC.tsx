"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { Dispatch, SetStateAction, useState } from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";
import { getFloatAmount } from "@/store/Singleton";
import { useQuery } from "@tanstack/react-query";

function EmailForm({
  setEmail,
  setBalance,
}: {
  setEmail: Dispatch<SetStateAction<string>>;
  setBalance: Dispatch<SetStateAction<number>>;
}) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  async function verifyEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const HDFC_API_URL = process.env.NEXT_PUBLIC_HDFC_API_URL;
    try {
      const response = await axios.post(HDFC_API_URL + "/verify/email", {
        email,
      });
      if (response.status === 200) {
        toast({
          title: "OTP sent",
        });
        setEmail(email);
        setBalance(response.data.balance);
      }
    } catch (error) {
      if (error instanceof AxiosError)
        toast({
          title: "Error",
          description: error?.response?.data.message,
          variant: "destructive",
        });
    }
  }

  return (
    <>
      <p className="text-muted-foreground text-sm">Enter your e-mail</p>
      <form
        className="flex flex-col w-full max-w-sm items-center gap-3 sm:flex-row "
        onSubmit={verifyEmail}
      >
        <Input type="email" placeholder="Email" name="email" />
        {submitted ? (
          <Button>
            <Loading forcedOpposite />
          </Button>
        ) : (
          <Button type="submit" onClick={() => setSubmitted(true)}>
            Get OTP
          </Button>
        )}
      </form>
    </>
  );
}

function OTPForm({
  email,
  token,
  setTransactionComplete,
}: {
  email: string;
  token: string;
  setTransactionComplete: Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  async function verifyOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const HDFC_API_URL = process.env.NEXT_PUBLIC_HDFC_API_URL;
    try {
      const response = await axios.post(HDFC_API_URL + "/verify/otp", {
        email,
        otp: e.currentTarget.otp.value,
        token,
      });
      if (response.status === 200) {
        setTransactionComplete(true);
        toast({
          title: "Withdrawal Processing",
        });
      }
    } catch (error) {
      if (error instanceof AxiosError)
        toast({
          title: "Error",
          description: error?.response?.data.message,
          variant: "destructive",
        });
    }
  }

  return (
    <>
      <p className="text-muted-foreground text-sm">Enter OTP</p>
      <form
        className="flex flex-col w-full max-w-sm items-center gap-3 "
        onSubmit={verifyOTP}
      >
        <InputOTP maxLength={6} name="otp">
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
        <Button type="submit">Submit</Button>
      </form>
    </>
  );
}

function WithdrawalComplete() {
  return (
    <>
      <p>
        Your email and OTP verification was successful. You will be credited the
        required amount.
      </p>
      <p>You can close this window now.</p>
    </>
  );
}

export default function HDFC() {
  //state for email verification
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState(0);
  //state for transaction completion
  const [transactionComplete, setTransactionComplete] = useState(false);
  const params = useSearchParams()
    .toString()
    .split("&")
    .reduce((acc: Record<string, string>, curr) => {
      const [key, value] = curr.split("=") as [string, string];
      return { ...acc, [key]: value };
    }, {});

  async function verifyToken() {
    const HDFC_API_URL = process.env.NEXT_PUBLIC_HDFC_API_URL;
    await axios.post(HDFC_API_URL + "/verify/bank-token", {
      token: params.token,
    });
    return true;
  }
  const { data, isLoading, error } = useQuery({
    queryKey: [],
    queryFn: verifyToken,
  });
  return (
    <div className="m-8 rounded-2xl border w-full p-4 grid grid-rows-3 bg-card">
      <div className="flex flex-col justify-center items-center gap-3">
        <h1 className="text-4xl font-bold">HDFC Bank</h1>
        <p className="text-sm text-muted-foreground">
          This is the withdrawal portal. You will need to verify OTP on your
          e-mail connected to HDFC.
        </p>
        <h4>
          You are withdrawing ${params.amount} to InPay. Do not refresh this
          page.
        </h4>
        {email !== "" && (
          <p className="text-2xl">Balance: ${getFloatAmount(balance)}</p>
        )}
      </div>
      <div className="flex flex-col justify-center items-center gap-3 row-span-2">
        {isLoading && <Loading />}
        {error && (
          <p className="text-red-400">Error, This token has expired or fake.</p>
        )}
        {data && !transactionComplete ? (
          email !== "" ? (
            <OTPForm
              token={params.token ?? ""}
              email={email}
              setTransactionComplete={setTransactionComplete}
            />
          ) : (
            <EmailForm setEmail={setEmail} setBalance={setBalance} />
          )
        ) : (
          <WithdrawalComplete />
        )}
      </div>
    </div>
  );
}
