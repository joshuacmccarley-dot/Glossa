import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText, isValidUUID } from "@/lib/validation";

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  let body: { match_id?: unknown; content?: unknown };
  try { body = await req.json(); }
  catch { return err("Invalid request body"); }

  const matchId = String(body.match_id ?? "");
  if (!isValidUUID(matchId)) return err("Invalid match ID");

  const rawContent = String(body.content ?? "").trim();
  if (!rawContent) return err("Message cannot be empty");
  const content = sanitizeText(rawContent, 2000);
  if (content.length < 1) return err("Message is too short");

  // Verify user is in this match and it's not expired
  const { data: match } = await supabase.from("matches")
    .select("id, user1_id, user2_id, is_expired, expires_at")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) return err("Match not found", 404);
  if (match.user1_id !== user.id && match.user2_id !== user.id) return err("Not your match", 403);
  if (match.is_expired || new Date(match.expires_at) < new Date()) {
    return err("This match has expired. Upgrade to Premium to recover it.", 403);
  }

  const { data, error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: user.id,
    content,
  }).select().single();

  if (error) return err("Failed to send message", 500);
  return NextResponse.json(data, { status: 201 });
}
