import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation";
import { sendMatchEmail } from "@/lib/email";
import { sendMatchPush } from "@/lib/push";
import type { PushSubscriptionRecord } from "@/lib/push";

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  let body: { liked_id?: unknown };
  try { body = await req.json(); }
  catch { return err("Invalid request body"); }

  const likedId = String(body.liked_id ?? "");
  if (!isValidUUID(likedId)) return err("Invalid user ID");
  if (likedId === user.id) return err("Cannot like yourself");

  // Check block
  const { data: block } = await supabase.from("blocks")
    .select("id")
    .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`)
    .or(`blocker_id.eq.${likedId},blocked_id.eq.${likedId}`)
    .maybeSingle();
  if (block) return err("Action not allowed", 403);

  // Check target exists
  const { data: target } = await supabase.from("profiles").select("id, display_name").eq("id", likedId).single();
  if (!target) return err("User not found", 404);

  // Free tier daily limit (10/day)
  const { data: myProfile } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single();
  if (!myProfile?.is_premium) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const { count } = await supabase.from("likes")
      .select("id", { count: "exact", head: true })
      .eq("liker_id", user.id)
      .gte("created_at", dayStart.toISOString());
    if ((count ?? 0) >= 10) return err("Daily like limit reached. Upgrade to Premium for unlimited likes.", 403);
  }

  const { error: likeError } = await supabase.from("likes").upsert(
    { liker_id: user.id, liked_id: likedId },
    { onConflict: "liker_id,liked_id", ignoreDuplicates: true }
  );
  if (likeError) return err("Failed to record like", 500);

  // Check mutual
  const { data: mutual } = await supabase.from("likes")
    .select("id")
    .eq("liker_id", likedId)
    .eq("liked_id", user.id)
    .maybeSingle();

  let matchId: string | null = null;

  if (mutual) {
    const u1 = user.id < likedId ? user.id : likedId;
    const u2 = user.id < likedId ? likedId : user.id;
    const { data: existing } = await supabase.from("matches")
      .select("id").eq("user1_id", u1).eq("user2_id", u2).maybeSingle();

    if (!existing) {
      const { data: newMatch } = await supabase.from("matches").insert({
        user1_id: u1,
        user2_id: u2,
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      }).select("id").single();
      matchId = newMatch?.id ?? null;
    } else {
      matchId = existing.id;
    }

    if (matchId) {
      // Mark like as mutual
      await supabase.from("likes").update({ is_mutual: true }).or(`liker_id.eq.${user.id},liker_id.eq.${likedId}`).or(`liked_id.eq.${user.id},liked_id.eq.${likedId}`);

      // Get both users' emails + names for notifications
      const [{ data: myData }, { data: theirData }] = await Promise.all([
        supabase.auth.admin ? supabase.from("profiles").select("display_name").eq("id", user.id).single() : Promise.resolve({ data: null }),
        supabase.from("profiles").select("display_name").eq("id", likedId).single(),
      ]);

      const myName = (myData as { display_name: string } | null)?.display_name ?? "Someone";
      const theirName = (theirData as { display_name: string } | null)?.display_name ?? target.display_name;

      // Fetch emails from auth.users via service role — best effort
      const getEmail = async (uid: string) => {
        try { return await supabase.rpc("get_user_email", { uid }).maybeSingle(); }
        catch { return { data: null }; }
      };
      const [{ data: myEmail }, { data: theirEmail }] = await Promise.all([getEmail(user.id), getEmail(likedId)]);

      if (myEmail) sendMatchEmail(myEmail as string, myName, theirName, matchId).catch(() => {});
      if (theirEmail) sendMatchEmail(theirEmail as string, theirName, myName, matchId).catch(() => {});

      // Push notifications (best effort)
      const [{ data: myPush }, { data: theirPush }] = await Promise.all([
        supabase.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id", user.id).maybeSingle(),
        supabase.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id", likedId).maybeSingle(),
      ]);
      if (myPush) sendMatchPush(myPush as PushSubscriptionRecord, theirName, matchId).catch(() => {});
      if (theirPush) sendMatchPush(theirPush as PushSubscriptionRecord, myName, matchId).catch(() => {});

      // In-app notifications
      await supabase.from("notifications").insert([
        { user_id: user.id, kind: "match", title: `You matched with ${theirName}!`, body: "12-hour window is open — say something.", action_url: `/chat/${matchId}` },
        { user_id: likedId, kind: "match", title: `You matched with ${myName}!`, body: "12-hour window is open — say something.", action_url: `/chat/${matchId}` },
      ]);
    }
  }

  return NextResponse.json({ liked: true, matched: !!mutual, match_id: matchId });
}
