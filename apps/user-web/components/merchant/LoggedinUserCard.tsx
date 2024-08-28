"use client";
import { useRecoilValue } from "recoil";
import { Badge } from "../ui/badge";
import axios from "axios";
import { useRouter } from "next/navigation";
import { merchantState } from "@/store/atomsMerch";

export default function LoggedinUserCard() {
  const merchant = useRecoilValue(merchantState);
  const router = useRouter();
  const fullName = merchant?.firstName + " " + merchant?.lastName;
  async function handleLogout() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      await axios.post(
        API_URL + "/auth/signout",
        {},
        { withCredentials: true }
      );
      localStorage?.setItem("inpayMerch", "false");
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className=" border border-foreground rounded-3xl p-2 flex justify-between items-center gap-2">
      <h3 className="ml-2">{fullName}</h3>
      <Badge variant="secondary" onClick={handleLogout}>
        Logout
      </Badge>
    </div>
  );
}
