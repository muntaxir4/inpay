"use client";

import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import Avatar, { genConfig } from "react-nice-avatar";
import SendTo from "./SendTo";

async function fetchRecentInter() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.get(API_URL + "/user/recent/interacted", {
    withCredentials: true,
  });
  return response.data;
}

export default function RecentInteractionsContent() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["recentInter"],
    queryFn: fetchRecentInter,
  });
  if (isLoading) {
    return <Loading />;
  } else if (error) {
    return <div>Unable to fetch</div>;
  } else if (data) {
    return (
      <div className="flex gap-3  flex-wrap">
        {data.recentInteractions &&
          data.recentInteractions.map((user: any) => (
            <SendTo
              key={user.id}
              fullName={user.firstName + " " + user.lastName}
              id={user.id}
            >
              <div key={user.id} className="grid text-center gap-2">
                <Avatar
                  {...genConfig(user.firstName + " " + user.lastName)}
                  className="h-20 w-20 hover:scale-110 transition-transform"
                />
                <p className="font-medium">
                  {user.firstName + " " + user.lastName}
                </p>
              </div>
            </SendTo>
          ))}
      </div>
    );
  }
}
