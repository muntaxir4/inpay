"use client";

import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AvatarComponent } from "../UserStates";

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
    console.log(data);
    return (
      <div className="flex gap-3  flex-wrap">
        {data.recentUsers &&
          data.recentUsers.map((user: any) => (
            <div key={user.id} className="grid text-center gap-2">
              <AvatarComponent
                fullName={user.firstName + " " + user.lastName}
                className="h-20 w-20 hover:scale-110"
              />
              <p className="font-medium">
                {user.firstName + " " + user.lastName}
              </p>
            </div>
          ))}
      </div>
    );
  }
}
