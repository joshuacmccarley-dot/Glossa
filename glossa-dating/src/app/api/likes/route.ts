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

  let body: { to_user_id?: unknown };
  try { body = await req.json(); }
  catch { return err("Invalid request body"); }

  const toUserId = String(body.to_user_id ?? "");
  if (!isValidUUID(toUserId)) return err("Invalid user ID");
  if (toUserId === user.id) return err("Cannot like yourself");

  // Check target profile exists
  const { data: target } = await supabase.from("profiles").select("user_id").eq("user_id", toUserId).single();
  if (!target) return err("User not found", 404);

  // Check free tier like limit (10/day)
  const { data: myProfile } = await supabase.from("profiles").select("is_premium").eq("user_id", user.id).single();
  if (!myProfile?.is_premium) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const { count } = await supabase.from("likes")
      .select("id", { count: "exact", head: true })
      .eq("from_user_id", user.id)
      .gte("created_at", dayStart.toISOString());
    if ((count ?? 0) >= 10) return err("Daily like limit reached. Upgrade to Premium for unlimited likes.", 403);
  }

  // Insert like (ignore conflict if already liked)
  const { error: likeError } = await supabase.from("likes").upsert(
    { from_user_id: user.id, to_user_id: toUserId },
    { onConflict: "from_user_id,to_user_id", ignoreDuplicates: true }
  );
  if (likeError) return err("Failed to record like", 500);

  // Check for mutual like
  const { data: mutual } = await supabase.from("likes")
    .select("id")
    .eq("from_user_id", toUserId)
    .eq("to_user_id", user.id)
    .maybeSingle();

  let matchId: string | null = null;
  if (mutual) {
    // Ensure match doesn't already exist
    const u1 = user.id < toUserId ? user.id : toUserId;
    const u2 = user.id < toUserId ? toUserId : user.id;
    const { data: existingMatch } = await supabase.from("matches")
      .select("id")
      .eq("user1_id", u1)
      .eq("user2_id", u2)
      .maybeSingle();

    if (!existingMatch) {
      const { data: newMatch } = await supabase.from("matches").insert({
        user1_id: u1,
        user2_id: u2,
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      }).select("id").single();
      matchId = newMatch?.id ?? null;
    } else {
      matchId = existingMatch.id;
    }
  }

  return NextResponse.json({ liked: true, matched: !!mutual, match_id: matchId });
}
