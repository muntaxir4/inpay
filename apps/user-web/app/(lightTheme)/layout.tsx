export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-auto overflow-auto justify-center">
        {children}
      </div>
    </div>
  );
}
