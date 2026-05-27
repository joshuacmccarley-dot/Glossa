import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation";

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  // Must be premium
  const { data: profile } = await supabase.from("profiles").select("is_premium").eq("user_id", user.id).single();
  if (!profile?.is_premium) return err("Match recovery requires sinc'd Premium", 403);

  let body: { match_id?: unknown };
  try { body = await req.json(); }
  catch { return err("Invalid request body"); }

  const matchId = String(body.match_id ?? "");
  if (!isValidUUID(matchId)) return err("Invalid match ID");

  // Verify user is in this match
  const { data: match } = await supabase.from("matches")
    .select("id, user1_id, user2_id, is_expired")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) return err("Match not found", 404);
  if (match.user1_id !== user.id && match.user2_id !== user.id) return err("Not your match", 403);
  if (!match.is_expired) return err("Match is not expired");

  const { error } = await supabase.from("matches").update({
    is_expired: false,
    expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    recovered_by: user.id,
  }).eq("id", matchId);

  if (error) return err("Failed to recover match", 500);
  return NextResponse.json({ recovered: true });
}
