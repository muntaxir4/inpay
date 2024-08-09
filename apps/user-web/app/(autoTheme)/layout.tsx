import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
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
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
