import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Delete profile (cascades to likes, matches, messages via FK)
  await supabase.from("profiles").delete().eq("user_id", user.id);
  // Sign out
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
