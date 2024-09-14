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
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

import { ArrowRight } from "lucide-react";
import SendTo from "./SendTo";
import MultiAvatar from "../MultiAvatar";

//delaying search while typing continuously
function useDebounce(value: string, delay: number = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value]);

  return debouncedValue;
}

async function fetchUsers(filter: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.get(API_URL + "/user/bulk?filter=" + filter, {
    withCredentials: true,
  });
  return response.data;
}

function UserItem({ user }: { user: any }) {
  const [open, setOpen] = useState(false);

  return (
    <CommandItem
      value={user.firstName + " " + user.lastName}
      key={user.id}
      className="p-0"
    >
      <div
        className=" hover:bg-muted grid grid-cols-5 w-full p-2 items-center"
        onClick={() => setOpen(true)}
      >
        <MultiAvatar
          name={user.firstName + " " + user.lastName}
          className="h-8 w-8"
        />
        <p className="col-span-3 font-medium">
          {user.firstName} {user.lastName}
        </p>
        <ArrowRight className="ml-3 hover:scale-110" />
      </div>
      <SendTo
        fullName={user.firstName + " " + user.lastName}
        id={user.id}
        open={open}
        onOpenChange={setOpen}
      ></SendTo>
    </CommandItem>
  );
}

export default function SearchUsers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filter, setFilter] = useState("");
  const debouncedFilter = useDebounce(filter);
  const { data, error, isLoading } = useQuery({
    queryKey: ["users", debouncedFilter],
    queryFn: () => fetchUsers(debouncedFilter),
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
        <Command>
          <CommandInput
            placeholder="Type a name..."
            value={filter}
            onValueChange={setFilter}
          />
          <CommandList>
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
            {data && !data.users.length && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
