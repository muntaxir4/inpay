"use client";
import { userState } from "@/store/atoms";
import Avatar, { genConfig } from "react-nice-avatar";
import { useRecoilValue } from "recoil";
import { Badge } from "../ui/badge";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoggedinUserCard() {
  const user = useRecoilValue(userState);
  const router = useRouter();
  const fullName = user?.firstName + " " + user?.lastName;
  async function handleLogout() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      await axios.post(
        API_URL + "/auth/signout",
        {},
        { withCredentials: true }
      );
      localStorage?.setItem("inpay", "false");
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className=" border border-foreground rounded-3xl p-2 flex justify-between items-center gap-2">
      <Avatar className="w-12 h-12" {...genConfig(fullName)} />
      <h3>{fullName}</h3>
      <Badge
        variant="secondary"
        onClick={handleLogout}
        className="cursor-pointer bg-secondary-foreground/10"
      >
        Logout
      </Badge>
    </div>
  );
}
