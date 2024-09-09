"use client";

import { Bell, BellRing } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationState } from "@/store/atoms";
import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";

function NotificationDropdown() {
  const [notifications, setNotifications] = useRecoilState(notificationState);
  const [open, setOpen] = useState(false);
  const [newNotifs, setNewNotifs] = useState(false);

  useEffect(() => {
    setNewNotifs(false);
  }, [open]);

  useEffect(() => {
    if (notifications.length) {
      setNewNotifs(true);
    }
  }, [notifications]);

  function whenReceived(date: Date) {
    const diff = new Date().getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes) return `${minutes}m ago`;
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s ago`;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="rounded-md hover:bg-accent">
        {newNotifs ? <BellRing className="m-2" /> : <Bell className="m-2" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="sm:w-[350px]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem className="grid gap-1 grid-cols-[3fr_1fr] sm:grid-cols-[4fr_1fr]">
                <p>{notification.message}</p>
                <p className="text-sm text-slate-300/70">
                  {whenReceived(notification.createdAt)}
                </p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              className="flex justify-center"
              onClick={() => setNotifications([])}
            >
              Clear all
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>Nothing new here</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Notification() {
  const pathname = usePathname();
  return <>{pathname.startsWith("/app") ? <NotificationDropdown /> : null}</>;
}
