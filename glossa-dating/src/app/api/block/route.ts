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

  let body: { blocked_id?: unknown };
  try { body = await req.json(); }
  catch { return err("Invalid request body"); }

  const blockedId = String(body.blocked_id ?? "");
  if (!isValidUUID(blockedId)) return err("Invalid user ID");
  if (blockedId === user.id) return err("You cannot block yourself");

  await supabase.from("blocks").upsert(
    { blocker_id: user.id, blocked_id: blockedId },
    { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true }
  );

  // Also expire any active matches between the two
  await supabase.from("matches").update({ is_expired: true })
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${blockedId}),and(user1_id.eq.${blockedId},user2_id.eq.${user.id})`);

  return NextResponse.json({ blocked: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  const url = new URL(req.url);
  const blockedId = url.searchParams.get("blocked_id") ?? "";
  if (!isValidUUID(blockedId)) return err("Invalid user ID");

  await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", blockedId);
  return NextResponse.json({ unblocked: true });
}
