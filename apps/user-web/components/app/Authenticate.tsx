"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSetRecoilState } from "recoil";
import { userState } from "@/store/atoms";

async function verifyUser() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
  try {
    const response = await axios.get(API_URL + "/user", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error("User not authenticated");
  }
}

export default function Authenticate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, error, isLoading } = useQuery({
    queryKey: [1],
    queryFn: verifyUser,
    retry: 1,
  });
  const setUser = useSetRecoilState(userState);
  if (isLoading) return <div>Loading...</div>;
  else if (error) {
    window.location.href = "/auth/signin";
  } else if (data) {
    setUser({
      firstName: data.balance.firstName,
      lastName: data.balance.lastName,
      balance: data.balance.userAccount.balance,
    });
    return <>{children}</>;
  }
}
