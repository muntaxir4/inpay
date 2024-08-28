"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSetRecoilState } from "recoil";
import Loading from "../Loading";
import { merchantState } from "@/store/atomsMerch";

async function verifyMerchant() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.get(API_URL + "/merchant", {
      withCredentials: true,
    });
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
  const { data, error, isLoading } = useQuery({
    queryKey: [],
    queryFn: verifyMerchant,
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
      return <>{children}</>;
    }
  }
}
