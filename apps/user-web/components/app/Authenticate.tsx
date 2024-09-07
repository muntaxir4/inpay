"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userRefetchState, userState } from "@/store/atoms";
import Loading from "../Loading";
import InitSocket from "./InitSocket";
import { useEffect } from "react";

async function verifyUser() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    //ping websocket server
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
    axios.get(SOCKET_URL + "/api/v1/health");
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
  const isRefetch = useRecoilValue(userRefetchState);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [],
    queryFn: verifyUser,
    staleTime: 3000,
  });
  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    refetch();
    console.log("Refetching user");
  }, [isRefetch]);

  if (isLoading) return <Loading />;
  else if (error) {
    localStorage?.setItem("inpay", "false");
    window.location.href = "/auth/signin";
  } else if (data) {
    if (!data.user) {
      setUser(null);
      localStorage?.setItem("inpay", "false");
      window.location.href = "/auth/signin";
    } else {
      setUser({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        balance: data.user.userAccount.balance,
        lastSeen: data.user.userAccount.lastSeen,
      });
      localStorage?.setItem("inpay", "true");
      return (
        <>
          <InitSocket />
          {children}
        </>
      );
    }
  }
}
