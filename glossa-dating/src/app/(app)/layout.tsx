import { AppNavbar } from "@/components/layout/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="pt-14 pb-20 min-h-screen">{children}</main>
    </div>
  );
}
