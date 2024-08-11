import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Avatar, { genConfig } from "react-nice-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import TransferForm from "./TransferForm";

export default function SendTo({
  children,
  fullName,
  id,
}: {
  children?: React.ReactNode;
  fullName: string;
  id: number;
}) {
  return (
    <>
      <div className="grid sm:hidden">
        <Drawer>
          <DrawerTrigger>{children}</DrawerTrigger>
          <DrawerContent>
            <div className="text-center py-4 pb-8 w-[75%] mx-auto">
              <DrawerHeader>
                <DrawerTitle className="text-3xl text-center">Send</DrawerTitle>
              </DrawerHeader>
              <div className="grid text-center gap-2">
                <Avatar
                  {...genConfig(fullName)}
                  className="h-20 w-20 mx-auto"
                />
                <p>
                  {"Paying, "}
                  <span className="font-medium ">{fullName}</span>
                </p>
                <TransferForm id={id}>
                  <textarea
                    className="border rounded-lg text-sm p-2"
                    placeholder="Send a note. Coming soon...    "
                    disabled
                  />
                  <div>
                    <label
                      htmlFor="amount"
                      className="relative text-sm m-1 -bottom-2 bg-background"
                    >
                      Amount
                    </label>
                    <Input
                      type="number"
                      name="amount"
                      id="amount"
                      placeholder="100"
                    />
                  </div>
                  <Button className="w-full">Confirm</Button>
                </TransferForm>
                <DrawerClose className="w-full">
                  <Button variant={"outline"} className="w-full">
                    Cancel
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="hidden sm:grid">
        <Dialog>
          <DialogTrigger>{children}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl">Send</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-2 justify-center">
                <Avatar {...genConfig(fullName)} className="h-28 w-28" />
                <p className="font-medium text-xl">{fullName}</p>
              </div>
              <div className="m-2">
                <TransferForm id={id}>
                  <textarea
                    className="border rounded-lg text-sm p-2"
                    placeholder="Send a note. Coming soon...    "
                    disabled
                  />
                  <div>
                    <label
                      htmlFor="amount"
                      className="relative text-sm m-1 -bottom-2 bg-background"
                    >
                      Amount
                    </label>
                    <Input
                      type="number"
                      name="amount"
                      id="amount"
                      placeholder="100"
                    />
                  </div>
                  <Button className="w-full">Confirm</Button>
                </TransferForm>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
