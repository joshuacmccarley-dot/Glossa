import { createClient } from "@/lib/supabase/server";

async function getStat(supabase: Awaited<ReturnType<typeof createClient>>, table: string, filter?: { col: string; val: string | boolean }) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter.col, filter.val);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [users, activeMatches, pendingVerifications, openReports, subscriptions] = await Promise.all([
    getStat(supabase, "profiles"),
    getStat(supabase, "matches", { col: "is_expired", val: false }),
    getStat(supabase, "photo_verifications", { col: "status", val: "pending" }),
    getStat(supabase, "reports", { col: "resolved", val: false }),
    getStat(supabase, "subscriptions", { col: "status", val: "active" }),
  ]);

  const stats = [
    { label: "Total users", value: users, color: "emerald" },
    { label: "Active matches", value: activeMatches, color: "teal" },
    { label: "Pending verifications", value: pendingVerifications, color: "amber", urgent: pendingVerifications > 0 },
    { label: "Open reports", value: openReports, color: "red", urgent: openReports > 0 },
    { label: "Paid subscribers", value: subscriptions, color: "emerald" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-6">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-2xl p-5 shadow-sm border ${s.urgent ? "border-red-200 bg-red-50" : "border-gray-100"}`}
          >
            <div className={`text-3xl font-black mb-1 ${s.urgent ? "text-red-600" : "text-[#003526]"}`}>{s.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <a href="/admin/verifications" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors block">
          <div className="font-bold text-gray-900 mb-1">Photo Verifications →</div>
          <div className="text-sm text-gray-500">Review selfie submissions for photo verification badges.</div>
        </a>
        <a href="/admin/reports" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors block">
          <div className="font-bold text-gray-900 mb-1">User Reports →</div>
          <div className="text-sm text-gray-500">Review and action user-submitted reports.</div>
        </a>
      </div>
    </div>
  );
}
