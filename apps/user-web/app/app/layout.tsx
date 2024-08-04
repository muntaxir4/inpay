import Sidebar from "@/components/app/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[190px_1fr] md:grid-cols-[23%_1fr] w-full ">
      <Sidebar />
      <div className="flex flex-col overflow-auto">{children}</div>
    </div>
  );
}
