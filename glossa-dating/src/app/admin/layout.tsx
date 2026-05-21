import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    redirect("/discover");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-6">
        <h1 className="text-lg font-black text-gray-900">sinc&apos;d Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="text-gray-600 hover:text-emerald-600 font-medium">Dashboard</Link>
          <Link href="/admin/verifications" className="text-gray-600 hover:text-emerald-600 font-medium">Verifications</Link>
          <Link href="/admin/reports" className="text-gray-600 hover:text-emerald-600 font-medium">Reports</Link>
        </nav>
        <Link href="/discover" className="ml-auto text-sm text-gray-400 hover:text-gray-600">← App</Link>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
