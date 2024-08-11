"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "@/store/atoms";
import Loading from "../Loading";

async function verifyUser() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
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
    queryKey: [],
    queryFn: verifyUser,
    staleTime: 3000,
  });
  const setUser = useSetRecoilState(userState);
  if (isLoading) return <Loading />;
  else if (error) {
    window.location.href = "/auth/signin";
  } else if (data) {
    setUser({
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      balance: data.user.userAccount.balance,
    });
    return <>{children}</>;
  }
}
