import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    const supabase = await createClient();
    // Simple ping — count profiles (uses index, fast)
    const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const latency = Date.now() - start;
    if (error) throw error;
    return NextResponse.json({ status: "ok", db_latency_ms: latency, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
