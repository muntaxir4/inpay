"use client";

import { useToast, toast as typeToast } from "@/components/ui/use-toast";
import { userRefetchState } from "@/store/atoms";
import axios, { AxiosError } from "axios";
import { useSetRecoilState } from "recoil";

export default function TransferForm({
  children,
  id,
}: {
  children: React.ReactNode;
  id: number;
}) {
  const { toast } = useToast();
  const setIsRefetch = useSetRecoilState(userRefetchState);
  async function handleTransfer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        API_URL + "/user/send",
        {
          amount: form.amount.value,
          to: id,
        },
        { withCredentials: true }
      );
      toast({
        title: `Sent successfully $${form.amount.value}`,
        duration: 3000,
      });
      setIsRefetch((prev) => !prev);
    } catch (error) {
      if (error instanceof AxiosError)
        toast({
          title: "Error",
          description: error.response?.data.message,
          variant: "destructive",
          duration: 3000,
        });
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleTransfer}>
      {children}
    </form>
  );
}
