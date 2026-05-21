import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMatchExpiringEmail } from "@/lib/email";
import { sendMatchExpiringPush } from "@/lib/push";
import type { PushSubscriptionRecord } from "@/lib/push";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date();

  // Expire matches that are past their expiry time
  const { data: expiredMatches } = await supabase
    .from("matches")
    .update({ is_expired: true })
    .lt("expires_at", now.toISOString())
    .eq("is_expired", false)
    .select("id, user1_id, user2_id");

  // Send 2-hour expiry warnings (matches expiring in 1–3 hours)
  const warnFrom = new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString();
  const warnTo = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();

  const { data: expiring } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id, expires_at, warned_expiry")
    .eq("is_expired", false)
    .gte("expires_at", warnFrom)
    .lte("expires_at", warnTo)
    .eq("warned_expiry", false);

  if (expiring && expiring.length > 0) {
    for (const match of expiring) {
      const hoursLeft = Math.max(1, Math.round((new Date(match.expires_at).getTime() - now.getTime()) / 3600000));

      const [{ data: p1 }, { data: p2 }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", match.user1_id).single(),
        supabase.from("profiles").select("display_name").eq("user_id", match.user2_id).single(),
      ]);
      const name1 = (p1 as { display_name: string } | null)?.display_name ?? "Your match";
      const name2 = (p2 as { display_name: string } | null)?.display_name ?? "Your match";

      const [{ data: push1 }, { data: push2 }] = await Promise.all([
        supabase.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id", match.user1_id).maybeSingle(),
        supabase.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id", match.user2_id).maybeSingle(),
      ]);

      const getEmail = async (uid: string) => {
        try { return await supabase.rpc("get_user_email", { uid }).maybeSingle(); }
        catch { return { data: null }; }
      };
      const [{ data: e1 }, { data: e2 }] = await Promise.all([getEmail(match.user1_id), getEmail(match.user2_id)]);

      if (e1) sendMatchExpiringEmail(e1 as string, name1, name2, match.id, hoursLeft).catch(() => {});
      if (e2) sendMatchExpiringEmail(e2 as string, name2, name1, match.id, hoursLeft).catch(() => {});
      if (push1) sendMatchExpiringPush(push1 as PushSubscriptionRecord, name2, match.id, hoursLeft).catch(() => {});
      if (push2) sendMatchExpiringPush(push2 as PushSubscriptionRecord, name1, match.id, hoursLeft).catch(() => {});
    }

    await supabase.from("matches")
      .update({ warned_expiry: true })
      .in("id", expiring.map((m) => m.id));
  }

  return NextResponse.json({
    expired: expiredMatches?.length ?? 0,
    warned: expiring?.length ?? 0,
  });
}
