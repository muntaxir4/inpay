"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCodeIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";

function SelectedPay({
  data,
  setIsOpen,
}: {
  data: { email: string; amount: number };
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (data.email === "" || !data.email || data.amount === undefined) {
      setIsOpen(false);
    }
  }, []);

  async function handlePay() {
    try {
      await axios;
      toast({
        title: "Payment successful",
        duration: 2000,
      });
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
    <div>
      <p>You are paying to: </p>
      <p> {data.email}</p>
      <p>Amount: {data.amount}</p>
      <Button onClick={() => setIsOpen(false)}>Pay</Button>
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

  useEffect(() => {
    if (data.email === "" || !data.email || data.amount === undefined) {
      setIsOpen(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = e.currentTarget.amount.value;
    try {
      await axios;
      toast({
        title: "Payment successful",
        duration: 2000,
      });
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
      <p>You are paying to {data.email}</p>
      <form className="w-3/5">
        <Input name="amount" placeholder="Enter amount" type="number" />
        <Button type="submit">Pay</Button>
      </form>
    </div>
  );
}

export default function ScanQR() {
  const [isOpen, setIsOpen] = useState(false);
  const vidRef = useRef(null);
  const [data, setData] = useState<{ email: string; amount: number } | null>(
    null
  );

  async function startScan() {
    if (!vidRef.current) return;
    const qrScanner = new QrScanner(
      vidRef.current,
      (result: any) => {
        console.log(result);
        setData(JSON.parse(result)?.data);
        qrScanner.stop();
      },
      {
        returnDetailedScanResult: true,
      }
    );
    qrScanner.start();
  }

  useEffect(() => {
    setTimeout(startScan, 3000);
  }, [vidRef.current]);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay to a merchant</DialogTitle>
          <DialogDescription>
            You will need to scan the QR code of the merchant to pay
          </DialogDescription>
          {data === null ? (
            <div className="mx-auto">
              <video ref={vidRef} />
            </div>
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
