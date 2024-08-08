"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Loading from "@/components/Loading";

import Avatar, { genConfig } from "react-nice-avatar";
import { ArrowBigLeft, ArrowRight } from "lucide-react";
import SendTo from "./SendTo";

async function fetchUsers(filter: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.get(API_URL + "/user/bulk?" + filter, {
    withCredentials: true,
  });
  return response.data;
}

function UserItem({ user }: { user: any }) {
  return (
    <SendTo fullName={user.firstName + " " + user.lastName} id={user.id}>
      <CommandItem
        key={user.id}
        className="hover:bg-muted grid grid-cols-5 p-2 w-full"
      >
        <Avatar
          {...genConfig(user.firstName + " " + user.lastName)}
          className="h-8 w-8"
        />
        <p className="col-span-3 font-medium">
          {user.firstName} {user.lastName}
        </p>
        <ArrowRight className="ml-3 hover:scale-110" />
      </CommandItem>
    </SendTo>
  );
}

export default function SearchUsers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filter, setFilter] = useState("");
  const { data, error, isLoading } = useQuery({
    queryKey: ["users", filter],
    queryFn: () => fetchUsers(filter),
  });
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search Users</DialogTitle>
          <DialogDescription>
            You can search for users by typing their name.
          </DialogDescription>
        </DialogHeader>
        <Command value={filter} onValueChange={() => setFilter(filter)}>
          <CommandInput placeholder="Type a name..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {isLoading && (
              <CommandEmpty>
                <Loading />
              </CommandEmpty>
            )}
            {error && <CommandEmpty>Error fetching data.</CommandEmpty>}
            {data &&
              data.users.map((user: any) => {
                return <UserItem user={user} key={user.id} />;
              })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
