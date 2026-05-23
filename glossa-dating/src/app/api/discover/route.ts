import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rankScore } from "@/lib/scoring";
import { distanceMiles } from "@/lib/location";
import { calculateAge } from "@/lib/utils";
import type { DiscoverProfile } from "@/types";

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return err("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "all";
  const distanceMax = parseFloat(searchParams.get("distance_max") ?? "Infinity");
  const sort = (searchParams.get("sort") ?? "smart") as "smart" | "closest" | "furthest";
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const queryLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
  const queryLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;

  // Load requesting user's profile
  const { data: me } = await supabase
    .from("profiles")
    .select("id, user_id, interests, wants, latitude, longitude, connection_modes, is_premium")
    .eq("user_id", user.id)
    .single();

  await supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("user_id", user.id);

  const myLat = queryLat ?? me?.latitude ?? null;
  const myLng = queryLng ?? me?.longitude ?? null;

  const myCtx = {
    interests: me?.interests ?? [],
    wants: me?.wants ?? [],
    latitude: myLat,
    longitude: myLng,
    connection_modes: me?.connection_modes ?? [],
  };

  // Load blocked users
  const { data: blockRows } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id);
  const blockedIds = (blockRows ?? []).map((b: { blocked_id: string }) => b.blocked_id);

  // Load already-liked user IDs
  const { data: likedRows } = await supabase
    .from("likes")
    .select("liked_id")
    .eq("liker_id", user.id);
  const alreadyLikedIds = (likedRows ?? []).map((l: { liked_id: string }) => l.liked_id);

  // Build exclusion list: self + blocked + already-liked
  const excluded = [user.id, ...alreadyLikedIds, ...blockedIds];

  // Fetch candidates
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("onboarding_complete", true)
    .eq("profile_paused", false)
    .eq("banned", false)
    .not("user_id", "in", `(${excluded.join(",")})`);

  // Apply mode filter at DB level if possible
  if (mode !== "all") {
    query = query.contains("connection_modes", [mode]);
  }

  const { data: candidates } = await query.limit(200);

  const PAGE_SIZE = 20;

  // Score and enrich each candidate
  const scored: DiscoverProfile[] = (candidates ?? []).map((p: Record<string, unknown>) => {
    const distMiles =
      myLat !== null && myLng !== null && p.latitude !== null && p.longitude !== null
        ? distanceMiles(myLat, myLng, p.latitude as number, p.longitude as number)
        : undefined;

    const score = rankScore(myCtx, {
      id: p.id as string,
      interests: (p.interests as string[]) ?? [],
      wants: (p.wants as string[]) ?? [],
      latitude: (p.latitude as number | null) ?? null,
      longitude: (p.longitude as number | null) ?? null,
      updated_at: (p.updated_at as string) ?? new Date().toISOString(),
      connection_modes: (p.connection_modes as string[]) ?? [],
    });

    return {
      ...(p as object),
      age: p.birthdate ? calculateAge(p.birthdate as string) : 0,
      compatibility_score: score,
      distance_miles: distMiles,
    } as DiscoverProfile;
  });

  // Apply distance filter
  let result = scored;
  if (!isNaN(distanceMax) && isFinite(distanceMax) && myLat !== null) {
    result = result.filter((p) => (p.distance_miles ?? Infinity) <= distanceMax);
  }

  // Sort
  result.sort((a, b) => {
    if (sort === "smart") return b.compatibility_score - a.compatibility_score;
    const da = a.distance_miles ?? Infinity;
    const db = b.distance_miles ?? Infinity;
    return sort === "closest" ? da - db : db - da;
  });

  const total = result.length;
  const paginated = result.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const hasMore = (page + 1) * PAGE_SIZE < total;

  return NextResponse.json({ profiles: paginated, total, hasMore });
}
