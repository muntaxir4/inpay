"use client";

import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import SendTo from "./SendTo";
import MultiAvatar from "../MultiAvatar";

async function fetchRecentUser() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.get(API_URL + "/user/recent/users", {
    withCredentials: true,
  });
  return response.data;
}

export default function RecentUsersContent() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["recentUser"],
    queryFn: fetchRecentUser,
  });
  if (isLoading) {
    return <Loading />;
  } else if (error) {
    return <div>Unable to fetch</div>;
  } else if (data) {
    return (
      <div className="flex gap-3  flex-wrap">
        {data.recentUsers &&
          data.recentUsers.map((user: any) => (
            <SendTo
              key={user.id}
              fullName={user.firstName + " " + user.lastName}
              id={user.id}
            >
              <div className="grid text-center gap-2 justify-items-center">
                <MultiAvatar
                  name={user.firstName + " " + user.lastName}
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
