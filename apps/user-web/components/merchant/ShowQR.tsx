"use client";
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
import { useState } from "react";
import qrcode from "qrcode-generator";
import { useRecoilValue } from "recoil";
import { merchantState } from "@/store/atomsMerch";

export default function ShowQR() {
  const [isOpen, setIsOpen] = useState(false);
  const merchant = useRecoilValue(merchantState);
  const qr = qrcode(0, "H");
  qr.addData(JSON.stringify({ email: merchant?.email, amount: 0 }));
  qr.make();
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        className="rounded-2xl w-full"
        onClick={() => setIsOpen(true)}
      >
        <QrCodeIcon className="mr-2 h-4 w-4" />
        Show QR
      </Button>
      <DialogContent className="w-4/5">
        <DialogHeader>
          <DialogTitle>Your Merchant QR Code</DialogTitle>
          <DialogDescription>You can recieve money now.</DialogDescription>
          <img
            src={qr.createDataURL()}
            alt="qr"
            className="mx-auto size-32 my-2"
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
