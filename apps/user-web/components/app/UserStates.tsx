"use client";

import { userState, userAvatarConfig } from "@/store/atoms";
import { useRecoilValue } from "recoil";
import Avatar from "react-nice-avatar";

function BalanceComponent() {
  const user = useRecoilValue(userState);
  return <>{user?.balance + ".00"}</>;
}

function AvatarComponent({
  className,
  fullName,
}: {
  className: string;
  fullName: string;
}) {
  const config = useRecoilValue(userAvatarConfig(fullName));
  return <Avatar {...config} className={className} />;
}

export { BalanceComponent, AvatarComponent };
