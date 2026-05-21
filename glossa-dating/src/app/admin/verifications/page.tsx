import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function reviewVerification(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const userId = formData.get("user_id") as string;
  const action = formData.get("action") as "approved" | "rejected";

  await supabase.from("photo_verifications").update({ status: action, reviewed_at: new Date().toISOString() }).eq("id", id);

  if (action === "approved") {
    await supabase.from("profiles").update({ photo_verified: true }).eq("id", userId);
  }

  revalidatePath("/admin/verifications");
}

export default async function VerificationsPage() {
  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("photo_verifications")
    .select("id, user_id, selfie_url, submitted_at, profiles(display_name, avatar_url)")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true })
    .limit(50);

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-6">
        Photo Verifications
        {pending && pending.length > 0 && (
          <span className="ml-3 text-sm font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
            {pending.length} pending
          </span>
        )}
      </h2>

      {!pending || pending.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
          All clear — no pending verifications.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => {
            const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex gap-4 items-start">
                  <div className="flex gap-3">
                    {profile?.avatar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="Profile" className="w-16 h-16 rounded-xl object-cover" />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.selfie_url} alt="Selfie" className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">{profile?.display_name ?? "Unknown"}</div>
                    <div className="text-xs text-gray-400 mb-3">
                      Submitted {new Date(item.submitted_at).toLocaleDateString()}
                    </div>
                    <form action={reviewVerification} className="flex gap-2">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="user_id" value={item.user_id} />
                      <button
                        name="action"
                        value="approved"
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-full transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        name="action"
                        value="rejected"
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold rounded-full transition-colors"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
