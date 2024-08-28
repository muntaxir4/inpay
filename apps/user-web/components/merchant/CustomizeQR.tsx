"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { QrCodeIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useRecoilValue } from "recoil";
import { merchantState } from "@/store/atomsMerch";
import qrcode from "qrcode-generator";

function ShowCustomQR({
  page,
  setPage,
}: {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const merchant = useRecoilValue(merchantState);

  useEffect(() => {
    if (!isOpen) setPage(0), setAmount(0);
  }, [isOpen]);

  function generateQRUrl() {
    const qr = qrcode(0, "H");
    qr.addData(JSON.stringify({ email: merchant?.email, amount: amount }));
    qr.make();
    return qr.createDataURL();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button className="rounded-2xl w-full" onClick={() => setIsOpen(true)}>
        <QrCodeIcon className="mr-2 h-4 w-4" />
        Customize QR
      </Button>
      <DialogContent className="w-4/5">
        <DialogHeader>
          <DialogTitle>Customized Merchant QR Code</DialogTitle>
          <DialogDescription>
            You can recieve selected amount.
          </DialogDescription>
        </DialogHeader>
        {page === 0 ? (
          <form>
            <label htmlFor="amount" className="text-sm -mb-2">
              Amount
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                id="amount"
                name="amount"
                placeholder="Enter amount"
                onChange={(e) => setAmount(Number(e.currentTarget.value))}
              />
              <Button onClick={(e) => setPage(1)}>Confirm</Button>
            </div>
          </form>
        ) : (
          <div className="mx-auto">
            <p className="font-semibold text-center">Payable, {amount}</p>
            <img
              src={generateQRUrl()}
              alt="qr"
              className="mx-auto size-32 my-2"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function CustomizeQR() {
  const [page, setPage] = useState(0);
  return <ShowCustomQR page={page} setPage={setPage} />;
}