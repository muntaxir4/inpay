import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Avatar, { genConfig } from "react-nice-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import TransferForm from "./TransferForm";
import { useDisplayType } from "@/store/customHooks";

export default function SendTo({
  children,
  fullName,
  id,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  fullName: string;
  id: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const displayType = useDisplayType();
  return (
    <>
      {displayType === "mobile" ? (
        <div className="grid sm:hidden">
          <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger>{children}</DrawerTrigger>
            <DrawerContent>
              <div className="text-center py-4 pb-8 w-[75%] mx-auto">
                <DrawerHeader>
                  <DrawerTitle className="text-3xl text-center">
                    Send
                  </DrawerTitle>
                  <DrawerDescription>
                    <p className="text-base">
                      {"Paying, "}
                      <span className="font-medium">{fullName}</span>
                    </p>
                  </DrawerDescription>
                </DrawerHeader>
                <div className="grid text-center gap-2">
                  <Avatar
                    {...genConfig(fullName)}
                    className="h-20 w-20 mx-auto"
                  />
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
                        required
                      />
                    </div>
                    <DrawerClose>
                      <Button type="submit" className="w-full">
                        Confirm
                      </Button>
                    </DrawerClose>
                  </TransferForm>
                  <DrawerClose>
                    <Button variant={"outline"} className="w-full">
                      Cancel
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      ) : (
        <div className="hidden sm:grid">
          <Dialog open={open} onOpenChange={onOpenChange}>
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
                        required
                      />
                    </div>
                    <DialogClose>
                      <Button type="submit" className="w-full">
                        Confirm
                      </Button>
                    </DialogClose>
                  </TransferForm>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
