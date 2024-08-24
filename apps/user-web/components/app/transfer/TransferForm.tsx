"use client";

import { useToast, toast as typeToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";

async function handleTransfer(
  event: React.FormEvent<HTMLFormElement>,
  toast: typeof typeToast,
  id: number
) {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await axios.post(
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

export default function TransferForm({
  children,
  id,
}: {
  children: React.ReactNode;
  id: number;
}) {
  const { toast } = useToast();

  return (
    <form className="grid gap-3" onSubmit={(e) => handleTransfer(e, toast, id)}>
      {children}
    </form>
  );
}
