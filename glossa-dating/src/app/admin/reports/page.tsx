import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function resolveReport(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const action = formData.get("action") as string;

  await supabase.from("reports").update({ resolved: true, resolution: action }).eq("id", id);

  if (action === "ban") {
    const reportedId = formData.get("reported_id") as string;
    await supabase.from("profiles").update({ banned: true }).eq("id", reportedId);
  }

  revalidatePath("/admin/reports");
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, reason, details, created_at, reporter_id, reported_id, profiles!reports_reported_id_fkey(display_name)")
    .eq("resolved", false)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-6">
        Open Reports
        {reports && reports.length > 0 && (
          <span className="ml-3 text-sm font-semibold bg-red-100 text-red-700 px-3 py-1 rounded-full">
            {reports.length}
          </span>
        )}
      </h2>

      {!reports || reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
          No open reports. All clear.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reported = Array.isArray(report.profiles) ? report.profiles[0] : report.profiles;
            return (
              <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-gray-900">{reported?.display_name ?? report.reported_id}</span>
                    <span className="ml-2 text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">{report.reason}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                {report.details && <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-xl p-3">{report.details}</p>}
                <form action={resolveReport} className="flex gap-2 flex-wrap">
                  <input type="hidden" name="id" value={report.id} />
                  <input type="hidden" name="reported_id" value={report.reported_id} />
                  <button name="action" value="dismissed" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-full">
                    Dismiss
                  </button>
                  <button name="action" value="warned" className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-semibold rounded-full">
                    Warn user
                  </button>
                  <button name="action" value="ban" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full">
                    Ban user
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
