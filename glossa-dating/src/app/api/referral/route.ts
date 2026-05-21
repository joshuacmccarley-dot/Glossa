import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sincd.app";

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function generateCode(displayName: string): string {
  const prefix = (displayName ?? "usr").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 3).padEnd(3, "x");
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}_${suffix}`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  // Check if code already exists
  const { data: existing } = await supabase
    .from("referral_codes")
    .select("code, uses")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      code: existing.code,
      uses: existing.uses ?? 0,
      link: `${APP_URL}/auth/register?ref=${existing.code}`,
    });
  }

  // Create a new code — fetch display_name for prefix
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const code = generateCode(profile?.display_name ?? "");

  const { data: created, error: insertError } = await supabase
    .from("referral_codes")
    .insert({ user_id: user.id, code, uses: 0 })
    .select("code, uses")
    .single();

  if (insertError || !created) return err("Failed to create referral code", 500);

  return NextResponse.json({
    code: created.code,
    uses: created.uses ?? 0,
    link: `${APP_URL}/auth/register?ref=${created.code}`,
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  let body: { action?: unknown };
  try { body = await req.json(); }
  catch { return err("Invalid request body"); }

  if (body.action !== "claim") return err("Unknown action");

  // Find the referral use for this user
  const { data: referralUse } = await supabase
    .from("referral_uses")
    .select("id, referrer_user_id, rewarded, code")
    .eq("referred_user_id", user.id)
    .maybeSingle();

  if (!referralUse) return NextResponse.json({ rewarded: false, reason: "No referral found" });
  if (referralUse.rewarded) return NextResponse.json({ rewarded: false, reason: "Already claimed" });

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const referrerId = referralUse.referrer_user_id;

  // Give both users 30 days of Premium
  await Promise.all([
    supabase.from("subscriptions").upsert(
      { user_id: user.id, status: "trialing", current_period_end: thirtyDaysFromNow },
      { onConflict: "user_id" }
    ),
    supabase.from("subscriptions").upsert(
      { user_id: referrerId, status: "trialing", current_period_end: thirtyDaysFromNow },
      { onConflict: "user_id" }
    ),
    supabase.from("profiles").update({ is_premium: true }).eq("user_id", user.id),
    supabase.from("profiles").update({ is_premium: true }).eq("user_id", referrerId),
  ]);

  // Mark rewarded
  await supabase.from("referral_uses").update({ rewarded: true }).eq("id", referralUse.id);

  // Increment uses on referral code (best-effort)
  try {
    await supabase.rpc("increment_referral_uses", { code_val: referralUse.code });
  } catch { /* ignore */ }

  // Get referrer name
  const { data: referrerProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", referrerId)
    .maybeSingle();

  return NextResponse.json({
    rewarded: true,
    referrerName: referrerProfile?.display_name ?? "your friend",
  });
}
