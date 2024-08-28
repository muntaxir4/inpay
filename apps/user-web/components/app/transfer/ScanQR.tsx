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
import { useSetRecoilState } from "recoil";
import { userRefetchState } from "@/store/atoms";

function SelectedPay({
  data,
  setIsOpen,
}: {
  data: { email: string; amount: number };
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  const setIsRefetch = useSetRecoilState(userRefetchState);
  useEffect(() => {
    if (data.email === "" || !data.email || data.amount === undefined) {
      setIsOpen(false);
    }
  }, []);

  async function handlePay() {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        API_URL + "/user/spend",
        {
          toEmail: data.email,
          amount: data.amount ?? 0,
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
      <p className="text-lg font-medium">Amount: {data.amount}</p>
      <Button onClick={() => handlePay()}>Pay</Button>
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
        <Input name="amount" placeholder="Enter amount" type="number" />
        <Button type="submit">Pay</Button>
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
  const [data, setData] = useState<{ email: string; amount: number } | null>(
    null
  );

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
