import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Called by a cron job (e.g., Vercel cron, Supabase edge function, or external scheduler)
// Marks all matches past their expiry as expired.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Require a secret to prevent unauthorized triggering
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("matches")
    .update({ is_expired: true })
    .lt("expires_at", new Date().toISOString())
    .eq("is_expired", false)
    .select("id");

  if (error) {
    return NextResponse.json({ error: "Failed to expire matches" }, { status: 500 });
  }

  return NextResponse.json({ expired: "done" });
}
