import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

// Photo verification submission — user submits a selfie URL for review
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  let body: { selfie_url?: unknown };
  try { body = await req.json(); }
  catch { return err("Invalid request body"); }

  const selfieUrl = String(body.selfie_url ?? "").trim();
  if (!selfieUrl || !selfieUrl.startsWith("https://")) return err("Invalid photo URL");
  if (selfieUrl.length > 500) return err("URL too long");

  // Upsert verification request (replace pending if they re-submit)
  const { error } = await supabase.from("photo_verifications").upsert(
    { user_id: user.id, selfie_url: selfieUrl, status: "pending" },
    { onConflict: "user_id" }
  );

  // Update profile to track submission time
  await supabase.from("profiles").update({ verification_submitted_at: new Date().toISOString() }).eq("user_id", user.id);

  if (error) return err("Failed to submit verification", 500);
  return NextResponse.json({ submitted: true, message: "Photo submitted for review. This usually takes under 24 hours." });
}

// Get current verification status
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  const { data } = await supabase.from("photo_verifications").select("status, created_at").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ status: data?.status ?? "not_submitted", submitted_at: data?.created_at ?? null });
}
