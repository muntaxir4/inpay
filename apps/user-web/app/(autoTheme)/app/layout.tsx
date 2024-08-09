import Sidebar from "@/components/app/Sidebar";
import Authenticate from "@/components/app/Authenticate";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex flex-auto overflow-auto justify-center">
          <Authenticate>
            <div className="grid sm:grid-cols-[190px_1fr] md:grid-cols-[23%_1fr] w-full ">
              <Sidebar />
              <div className="flex flex-col overflow-auto">{children}</div>
            </div>
          </Authenticate>
        </div>
      </div>
    </ThemeProvider>
  );
}
