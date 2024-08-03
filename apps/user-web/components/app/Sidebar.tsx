import { Home, Send } from "lucide-react";
import { Button } from "../ui/button";

export default function Sidebar() {
  return (
    <div className="flex flex-col border-r py-4 ">
      <Button variant={"ghost"} className="mx-4 my-1 rounded-2xl">
        <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
          <Home />
          <p className="text-lg">Home</p>
        </div>
      </Button>
      <Button variant={"ghost"} className="mx-4 my-1 rounded-2xl">
        <div className="w-full flex justify-start gap-3 md:gap-6 items-center ">
          <Send />
          <p className="text-lg">Transfer</p>
        </div>
      </Button>
    </div>
  );
}
