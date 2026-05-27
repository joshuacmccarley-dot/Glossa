import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sanitizeText,
  validateAge,
  validateInterests,
  validateDisplayName,
  validateGender,
  validateIntention,
  validateWorkField,
} from "@/lib/validation";

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
  if (error) return err("Profile not found", 404);
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON body");
  }

  // Build a safe update object — only allow specific fields
  const update: Record<string, unknown> = {};

  if ("display_name" in body) {
    const name = String(body.display_name ?? "");
    if (!validateDisplayName(name)) return err("Invalid display name (2-50 characters)");
    update.display_name = sanitizeText(name, 50);
  }

  if ("bio" in body) {
    update.bio = sanitizeText(String(body.bio ?? ""), 400);
  }

  if ("location" in body) {
    update.location = sanitizeText(String(body.location ?? ""), 100);
  }

  if ("occupation" in body) {
    update.occupation = sanitizeText(String(body.occupation ?? ""), 100);
  }

  if ("work_field" in body) {
    const wf = String(body.work_field ?? "");
    if (wf && !validateWorkField(wf)) return err("Invalid work field");
    update.work_field = wf || null;
  }

  if ("relationship_intention" in body) {
    const ri = String(body.relationship_intention ?? "");
    if (ri && !validateIntention(ri)) return err("Invalid relationship intention");
    update.relationship_intention = ri || null;
  }

  if ("interests" in body) {
    if (!validateInterests(body.interests)) return err("Invalid interests — max 15, alphanumeric IDs only");
    update.interests = body.interests;
  }

  if ("gender" in body) {
    const g = String(body.gender ?? "");
    if (!validateGender(g)) return err("Invalid gender value");
    update.gender = g;
  }

  if ("birthdate" in body) {
    const bd = String(body.birthdate ?? "");
    if (!validateAge(bd)) return err("You must be 18+ to use sinc'd");
    update.birthdate = bd;
  }

  if ("looking_for" in body) {
    const lf = body.looking_for;
    if (!Array.isArray(lf) || lf.length > 4) return err("Invalid looking_for");
    const allowed = ["Men", "Women", "Non-binary people", "Everyone"];
    if (!lf.every((v) => allowed.includes(String(v)))) return err("Invalid looking_for values");
    update.looking_for = lf;
  }

  if (Object.keys(update).length === 0) {
    return err("No valid fields to update");
  }

  const { data, error } = await supabase.from("profiles").update(update).eq("user_id", user.id).select().single();
  if (error) return err("Failed to update profile", 500);
  return NextResponse.json(data);
}
