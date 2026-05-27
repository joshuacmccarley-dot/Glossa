import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText, isValidUUID } from "@/lib/validation";
import { REPORT_REASONS } from "@/lib/moderation";

const VALID_REASONS = REPORT_REASONS.map((r) => r.id);

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  let body: { reported_id?: unknown; reason?: unknown; details?: unknown; message_id?: unknown };
  try { body = await req.json(); }
  catch { return err("Invalid request body"); }

  const reportedId = String(body.reported_id ?? "");
  if (reportedId && !isValidUUID(reportedId)) return err("Invalid user ID");
  if (reportedId === user.id) return err("You cannot report yourself");

  const reason = String(body.reason ?? "");
  if (!VALID_REASONS.includes(reason as typeof VALID_REASONS[number])) return err("Invalid report reason");

  const details = body.details ? sanitizeText(String(body.details), 500) : null;
  const messageId = body.message_id && isValidUUID(String(body.message_id)) ? String(body.message_id) : null;

  // Rate limit: max 10 reports per day per user
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", user.id)
    .gte("created_at", dayStart.toISOString());
  if ((count ?? 0) >= 10) return err("You've reached the daily report limit. Contact support if urgent.", 429);

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: reportedId || null,
    reported_message_id: messageId,
    reason,
    details,
  });

  if (error) return err("Failed to submit report", 500);
  return NextResponse.json({ reported: true, message: "Thank you. Our safety team will review this shortly." });
}
