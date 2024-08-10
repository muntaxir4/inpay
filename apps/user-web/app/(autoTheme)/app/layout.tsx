import Sidebar from "@/components/app/Sidebar";
import Authenticate from "@/components/app/Authenticate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticate>
      <div className="grid sm:grid-cols-[190px_1fr] md:grid-cols-[23%_1fr] w-full ">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <div className="flex flex-col overflow-auto">{children}</div>
      </div>
    </Authenticate>
  );
}
