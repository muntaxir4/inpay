import HDFC from "@/components/app/bank/HDFC";
import Loading from "@/components/Loading";
import { Suspense } from "react";

export default function HDFCPage() {
  return (
    <Suspense fallback={<Loading />}>
      <HDFC />
    </Suspense>
  );
}
