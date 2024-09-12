"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCodeIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currencyState, userRefetchState } from "@/store/atoms";
import {
  currencies,
  Currency,
  getCurrencyFloatAmount,
} from "@/store/Singleton";
import SlideConfirm from "../SlideConfirm";

function SelectedPay({
  data,
  setIsOpen,
}: {
  data: { email: string; amount: number; currency?: Currency };
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  const setIsRefetch = useSetRecoilState(userRefetchState);
  const qrCurrency = data.currency;
  const currency = useRecoilValue(currencyState);
  const qrMyCurrencyAmount = getCurrencyFloatAmount(
    data.amount / (qrCurrency ? (currencies[qrCurrency]?.rate ?? 1) : 1),
    currency.rate
  );
  useEffect(() => {
    if (
      data.email === "" ||
      !data.email ||
      data.amount === undefined ||
      data.currency === undefined ||
      Object.keys(currencies).indexOf(data.currency) === -1
    ) {
      setIsOpen(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        API_URL + "/user/spend",
        {
          toEmail: data.email,
          amount: data.amount ?? 0,
          currency: qrCurrency,
        },
        { withCredentials: true }
      );
      toast({
        title: "Payment successful",
        duration: 2000,
      });
      setIsRefetch((prev) => !prev);
    } catch (error) {
      if (error instanceof AxiosError)
        toast({
          title: "Payment failed",
          description: error.response?.data?.message,
          variant: "destructive",
          duration: 2000,
        });
    }
    setIsOpen(false);
  }

  return (
    <div className="mx-auto text-center text-sm grid gap-2">
      <p>You are paying to: </p>
      <p> {data.email}</p>
      <p className="text-base font-medium">
        Amount:{currency.symbol} {qrMyCurrencyAmount}
      </p>
      {/* <Button onClick={() => handleSubmit()} className="tracking-wider text-xl">
        Pay
      </Button> */}
      <form onClick={handleSubmit}>
        <SlideConfirm setOpen={setIsOpen} />
      </form>
    </div>
  );
}

function EnterAmountAndPay({
  data,
  setIsOpen,
}: {
  data: { email: string; amount: number };
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  const { id: currencyId } = useRecoilValue(currencyState);
  const currency = Object.entries(currencies).find(
    ([curr, value]) => value.id === currencyId
  )?.[0];
  const setIsRefetch = useSetRecoilState(userRefetchState);
  useEffect(() => {
    if (data.email === "" || !data.email || data.amount === undefined) {
      setIsOpen(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = e.currentTarget.amount.value;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        API_URL + "/user/spend",
        {
          toEmail: data.email,
          amount,
          currency,
        },
        { withCredentials: true }
      );
      toast({
        title: "Payment successful",
        duration: 2000,
      });
      setIsRefetch((prev) => !prev);
    } catch (error) {
      if (error instanceof AxiosError)
        toast({
          title: "Payment failed",
          description: error.response?.data?.message,
          variant: "destructive",
          duration: 2000,
        });
    }
    setIsOpen(false);
  }

  return (
    <div className="mx-auto">
      <p className="my-3 text-sm">You are paying to {data.email}</p>
      <form className="grid gap-2" onSubmit={handleSubmit}>
        <Input
          name="amount"
          placeholder="Enter amount"
          type="number"
          step={0.01}
        />
        {/* <Button type="submit" className="tracking-wider text-xl">
          Pay
        </Button> */}
        <SlideConfirm setOpen={setIsOpen} />
      </form>
    </div>
  );
}

function ScanCanvas({
  setData,
}: {
  setData: Dispatch<
    SetStateAction<{
      email: string;
      amount: number;
    } | null>
  >;
}) {
  const vidRef = useRef(null);

  useEffect(() => {
    const qr = startScan();
    return () => {
      qr?.stop();
    };
  }, []);

  function startScan() {
    if (!vidRef.current) return;
    const qrScanner = new QrScanner(
      vidRef.current,
      (result: any) => {
        setData(JSON.parse(result.data));
        qrScanner.stop();
      },
      {
        highlightScanRegion: true,
      }
    );
    qrScanner.start();
    return qrScanner;
  }
  return (
    <div className="mx-auto">
      <video ref={vidRef} />
    </div>
  );
}

export default function ScanQR() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{
    email: string;
    amount: number;
    currency?: Currency;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setData(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        className="rounded-2xl"
        onClick={() => setIsOpen(true)}
      >
        <QrCodeIcon className="mr-2 h-4 w-4" />
        Scan QR
      </Button>
      <DialogContent className="w-4/5 sm:w-3/5">
        <DialogHeader>
          <DialogTitle>Pay to a merchant</DialogTitle>
          <DialogDescription>
            You will need to scan the QR code of the merchant to pay
          </DialogDescription>
          {data === null ? (
            <ScanCanvas setData={setData} />
          ) : data.amount ? (
            <SelectedPay data={data} setIsOpen={setIsOpen} />
          ) : (
            <EnterAmountAndPay data={data} setIsOpen={setIsOpen} />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
