import AuthenticateMerchant from "@/components/merchant/AuthenticateMerchant";
import Sidebar from "@/components/merchant/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticateMerchant>
      <div className="grid sm:grid-cols-[190px_1fr] md:grid-cols-[23%_1fr] w-full ">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <div className="flex flex-col overflow-auto">{children}</div>
      </div>
    </AuthenticateMerchant>
  );
}
