"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSetRecoilState } from "recoil";
import Loading from "../Loading";
import { merchantState } from "@/store/atomsMerch";
import { useToast, toast as typeToast } from "../ui/use-toast";

async function verifyMerchant(toast: typeof typeToast) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    let toastObj: any = null;
    const timeoutId = setTimeout(() => {
      toastObj = toast({
        title: "The server was asleep. Waking up...",
        duration: 10000,
      });
    }, 2000);
    const response = await axios.get(API_URL + "/merchant", {
      withCredentials: true,
    });
    if (toastObj) toastObj.dismiss();
    clearTimeout(timeoutId);
    return response.data;
  } catch (error) {
    throw new Error("User not authenticated");
  }
}

export default function AuthenticateMerchant({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { data, error, isLoading } = useQuery({
    queryKey: [],
    queryFn: async () => await verifyMerchant(toast),
    staleTime: 3000,
  });
  const setMerchant = useSetRecoilState(merchantState);
  if (isLoading) return <Loading />;
  else if (error) {
    localStorage?.setItem("inpayMerch", "false");
    window.location.href = "/auth/access/merchant";
  } else if (data) {
    if (!data.merchant) {
      setMerchant(null);
      localStorage?.setItem("inpayMerch", "false");
      window.location.href = "/auth/access/merchant";
    } else {
      setMerchant({
        id: data.merchant.id,
        firstName: data.merchant.firstName,
        lastName: data.merchant.lastName,
        balanceM: data.merchant.userAccount.balanceM,
        email: data.merchant.email,
      });
      localStorage?.setItem("inpayMerch", "true");
      localStorage?.setItem("inpay", "false");
      return <>{children}</>;
    }
  }
}
