"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, MapPin, Briefcase, ArrowUpDown, Flag, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DiscoverProfile } from "@/types";
import { calculateAge as calcAge } from "@/lib/utils";
import { getInterestById } from "@/lib/interests";
import { getWantById } from "@/lib/wants";
import { MODES, DATING_INTENTIONS, getModeById } from "@/lib/modes";
import { distanceMiles, formatDistance, DISTANCE_PRESETS, getUserLocation } from "@/lib/location";
import { rankScore, rankProfiles } from "@/lib/scoring";
import { ReportModal } from "@/components/ui/report-modal";
import { PushPrompt } from "@/components/push-prompt";
import type { ConnectionMode } from "@/lib/modes";
import Link from "next/link";

type SortDir = "smart" | "closest" | "furthest";

interface MyContext {
  id: string;
  interests: string[];
  wants: string[];
  latitude: number | null;
  longitude: number | null;
  connection_modes: string[];
  is_premium: boolean;
}

export default function DiscoverPage() {
  const [allProfiles, setAllProfiles] = useState<DiscoverProfile[]>([]);
  const [filtered, setFiltered] = useState<DiscoverProfile[]>([]);
  const [selected, setSelected] = useState<DiscoverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<{ name: string; matchId: string } | null>(null);
  const [myCtx, setMyCtx] = useState<MyContext | null>(null);
  const [reporting, setReporting] = useState<DiscoverProfile | null>(null);

  // Filters
  const [activeMode, setActiveMode] = useState<ConnectionMode | "all">("all");
  const [distanceMax, setDistanceMax] = useState<number>(Infinity);
  const [sortDir, setSortDir] = useState<SortDir>("smart");
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const blockedRef = useRef<Set<string>>(new Set());

  useEffect(() => { loadProfiles(); }, []);

  useEffect(() => {
    applyFilters(allProfiles);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProfiles, activeMode, distanceMax, sortDir, myLat, myLng, myCtx]);

  const loadProfiles = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: me } = await supabase
      .from("profiles")
      .select("id, interests, wants, is_premium, latitude, longitude, connection_modes, updated_at")
      .eq("id", user.id)
      .single();

    const ctx: MyContext = {
      id: user.id,
      interests: me?.interests ?? [],
      wants: me?.wants ?? [],
      latitude: me?.latitude ?? null,
      longitude: me?.longitude ?? null,
      connection_modes: me?.connection_modes ?? [],
      is_premium: me?.is_premium ?? false,
    };
    setMyCtx(ctx);
    if (me?.latitude) { setMyLat(me.latitude); setMyLng(me.longitude); }

    const { data: blockRows } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    const blocked = new Set((blockRows ?? []).map((b) => b.blocked_id as string));
    blockedRef.current = blocked;

    const { data: likedRows } = await supabase
      .from("likes")
      .select("liked_id")
      .eq("liker_id", user.id);
    const alreadyLiked = new Set((likedRows ?? []).map((l) => l.liked_id as string));
    setLikedIds(alreadyLiked);

    const excluded = [user.id, ...alreadyLiked, ...blocked];

    const { data: candidates } = await supabase
      .from("profiles")
      .select("*")
      .eq("onboarding_complete", true)
      .eq("profile_paused", false)
      .not("id", "in", `(${excluded.join(",")})`)
      .limit(200);

    const scored: DiscoverProfile[] = (candidates ?? []).map((p) => ({
      ...p,
      age: calcAge(p.birthdate),
      compatibility_score: rankScore(ctx, {
        id: p.id,
        interests: p.interests ?? [],
        wants: p.wants ?? [],
        latitude: p.latitude,
        longitude: p.longitude,
        updated_at: p.updated_at,
        connection_modes: p.connection_modes ?? [],
      }),
      distance_miles: (ctx.latitude && p.latitude)
        ? distanceMiles(ctx.latitude, ctx.longitude!, p.latitude, p.longitude!)
        : undefined,
    }));

    setAllProfiles(scored);
    setLoading(false);
  };

  const applyFilters = (profiles: DiscoverProfile[]) => {
    let result = [...profiles];

    if (activeMode !== "all") {
      result = result.filter((p) => (p.connection_modes ?? []).includes(activeMode));
    }

    if (distanceMax !== Infinity && myLat !== null) {
      result = result.filter((p) => (p.distance_miles ?? Infinity) <= distanceMax);
    }

    result.sort((a, b) => {
      if (sortDir === "smart") return b.compatibility_score - a.compatibility_score;
      const da = a.distance_miles ?? Infinity;
      const db = b.distance_miles ?? Infinity;
      return sortDir === "closest" ? da - db : db - da;
    });

    setFiltered(result);
  };

  const requestLocation = async () => {
    setLocating(true);
    try {
      const pos = await getUserLocation();
      setMyLat(pos.lat);
      setMyLng(pos.lng);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ latitude: pos.lat, longitude: pos.lng }).eq("id", user.id);
      }
      setAllProfiles((prev) => prev.map((p) => ({
        ...p,
        distance_miles: p.latitude ? distanceMiles(pos.lat, pos.lng, p.latitude, p.longitude!) : undefined,
      })));
    } catch { /* denied */ }
    finally { setLocating(false); }
  };

  const handleLike = useCallback(async (profile: DiscoverProfile) => {
    if (likedIds.has(profile.id)) return;
    setLikedIds((prev) => new Set([...prev, profile.id]));

    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked_id: profile.id }),
    });
    const json = await res.json();

    if (json.matched) {
      setMatched({ name: profile.display_name, matchId: json.match_id });
      setSelected(null);
    } else if (!res.ok) {
      // Revert optimistic update on error
      setLikedIds((prev) => { const next = new Set(prev); next.delete(profile.id); return next; });
    }
  }, [likedIds]);

  const handleBlock = useCallback((profile: DiscoverProfile) => {
    blockedRef.current.add(profile.id);
    setAllProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    setSelected(null);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Finding your people...</p>
      </div>
    );
  }

  const intentionLabel = (p: DiscoverProfile) => DATING_INTENTIONS.find((r) => r.id === p.relationship_intention);

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <PushPrompt />

      {/* Report modal */}
      {reporting && (
        <ReportModal
          reportedId={reporting.id}
          reportedName={reporting.display_name}
          onClose={() => setReporting(null)}
          onBlock={() => handleBlock(reporting)}
        />
      )}

      {/* Match modal */}
      {matched && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-8 sm:pb-0">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-full max-w-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <span className="text-3xl">💚</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">You&apos;re sinc&apos;d!</h2>
            <p className="text-gray-500 mb-2">You and <strong>{matched.name}</strong> connected.</p>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-6 text-sm">
              <p className="font-semibold text-amber-800">⏱️ 12-hour window is open</p>
              <p className="text-amber-600 mt-0.5 text-xs">Start a conversation before time closes.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMatched(null)}
                className="flex-1 border-2 border-gray-200 py-3 rounded-2xl text-sm font-semibold text-gray-600"
              >
                Keep browsing
              </button>
              <Link
                href={`/chat/${matched.matchId}`}
                onClick={() => setMatched(null)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-2xl text-sm font-bold text-center"
              >
                Say something →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.avatar_url ?? `https://api.dicebear.com/9.x/personas/svg?seed=${selected.id}&backgroundColor=d1fae5,99f6e4`}
                alt={selected.display_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 left-4 w-9 h-9 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white text-sm"
              >
                ✕
              </button>
              <button
                onClick={() => setReporting(selected)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur rounded-full flex items-center justify-center"
              >
                <Flag className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-black text-white">
                  {selected.display_name}{selected.show_age !== false ? `, ${selected.age}` : ""}
                </h2>
                {selected.location && !selected.hide_distance && (
                  <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {selected.location}
                    {selected.distance_miles !== undefined && (
                      <span className="ml-1 text-white/60">· {formatDistance(selected.distance_miles)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4 pb-8">
              {/* Compatibility score */}
              {selected.compatibility_score > 0 && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-700 text-sm">{selected.compatibility_score}% match for you</span>
                </div>
              )}

              {/* Modes + occupation + intention */}
              <div className="flex flex-wrap gap-2">
                {(selected.connection_modes ?? []).map((m) => {
                  const mode = getModeById(m);
                  if (!mode) return null;
                  return (
                    <span key={m} className={`text-xs font-medium px-3 py-1.5 rounded-full ${mode.color} ${mode.textColor}`}>
                      {mode.emoji} {mode.label}
                    </span>
                  );
                })}
                {selected.occupation && (
                  <span className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-600">
                    <Briefcase className="w-3.5 h-3.5" /> {selected.occupation}
                  </span>
                )}
                {intentionLabel(selected) && (
                  <span className="flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full px-3 py-1.5 text-sm font-medium">
                    {intentionLabel(selected)!.emoji} {intentionLabel(selected)!.label}
                  </span>
                )}
              </div>

              {selected.bio && (
                <p className="text-gray-700 leading-relaxed text-sm">{selected.bio}</p>
              )}

              {/* Shared wants */}
              {selected.wants && selected.wants.length > 0 && myCtx && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Here for</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.wants.map((id) => {
                      const want = getWantById(id);
                      if (!want) return null;
                      const isShared = (myCtx.wants ?? []).includes(id);
                      return (
                        <span
                          key={id}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
                            isShared
                              ? "bg-teal-500 text-white border-teal-500"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {want.emoji} {want.label}{isShared ? " ✓" : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interests */}
              {selected.interests && selected.interests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.interests.map((id) => {
                      const interest = getInterestById(id);
                      if (!interest) return null;
                      const isShared = (myCtx?.interests ?? []).includes(id);
                      return (
                        <span
                          key={id}
                          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border ${
                            isShared
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {interest.emoji} {interest.label}{isShared ? " ✓" : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleBlock(selected)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleLike(selected)}
                  disabled={likedIds.has(selected.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 transition active:scale-[0.98]"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  {likedIds.has(selected.id) ? "Connected!" : "Connect"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setActiveMode("all")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeMode === "all" ? "bg-emerald-500 text-white shadow" : "bg-gray-100 text-gray-600"}`}
        >
          🌐 All
        </button>
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMode(m.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeMode === m.id ? "bg-emerald-500 text-white shadow" : "bg-gray-100 text-gray-600"}`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {DISTANCE_PRESETS.map((d) => (
          <button
            key={d.label}
            onClick={() => {
              setDistanceMax(d.value);
              if (myLat === null) requestLocation();
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${distanceMax === d.value ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {d.label}
          </button>
        ))}
        <div className="ml-auto flex-shrink-0 flex gap-1.5">
          {(["smart", "closest", "furthest"] as SortDir[]).map((s) => (
            <button
              key={s}
              onClick={() => setSortDir(s)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${sortDir === s ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {s === "smart" && <Zap className="w-3 h-3" />}
              {s === "closest" && <MapPin className="w-3 h-3" />}
              {s === "furthest" && <ArrowUpDown className="w-3 h-3" />}
              {s === "smart" ? "Best" : s === "closest" ? "Near" : "Far"}
            </button>
          ))}
        </div>
      </div>

      {/* Location request if no lat */}
      {myLat === null && (
        <button
          onClick={requestLocation}
          disabled={locating}
          className="w-full flex items-center justify-center gap-2 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-xl text-sm font-semibold"
        >
          <MapPin className="w-4 h-4" />
          {locating ? "Detecting location..." : "Enable location for distance filters"}
        </button>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-3">
        {filtered.length} {filtered.length === 1 ? "person" : "people"}
        {activeMode !== "all" ? ` in ${getModeById(activeMode)?.label}` : " nearby"}
        {sortDir === "smart" ? " · Ranked for you" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌿</div>
          <p className="font-bold text-gray-900">
            {activeMode !== "all" ? `Nobody in ${getModeById(activeMode)?.label} nearby yet` : "You've seen everyone nearby"}
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Try expanding your distance or switching modes.</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => { setActiveMode("all"); setDistanceMax(Infinity); }}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm"
            >
              See everyone
            </button>
            <button onClick={loadProfiles} className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-full font-semibold text-sm">
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => {
            const liked = likedIds.has(p.id);
            const intention = intentionLabel(p);
            const primaryMode = (p.connection_modes ?? [])[0];
            const modeInfo = primaryMode ? getModeById(primaryMode) : null;
            const sharedWants = (p.wants ?? []).filter((w) => (myCtx?.wants ?? []).includes(w)).length;

            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="text-left rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98] group"
              >
                <div className="relative" style={{ aspectRatio: "4/5" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.avatar_url ?? `https://api.dicebear.com/9.x/personas/svg?seed=${p.id}&backgroundColor=d1fae5,99f6e4`}
                    alt={p.display_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                  {modeInfo && (
                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white font-semibold">
                      {modeInfo.emoji}
                    </div>
                  )}

                  {/* Score badge — show wants overlap first, then interest score */}
                  {!liked && p.compatibility_score >= 30 && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-emerald-500 rounded-full px-2 py-0.5">
                      <Zap className="w-2.5 h-2.5 text-white" />
                      <span className="text-[10px] font-bold text-white">{p.compatibility_score}%</span>
                    </div>
                  )}

                  {liked && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                      <Heart className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">
                      {p.display_name}{p.show_age !== false ? `, ${p.age}` : ""}
                    </p>
                    {p.distance_miles !== undefined && !p.hide_distance && (
                      <p className="text-white/60 text-[10px]">📍 {formatDistance(p.distance_miles)}</p>
                    )}
                    {intention && (
                      <p className="text-white/70 text-[10px] mt-0.5">{intention.emoji} {intention.label}</p>
                    )}
                  </div>
                </div>

                <div className="px-3 py-2.5">
                  {p.occupation && <p className="text-xs text-gray-500 truncate">💼 {p.occupation}</p>}
                  <div className="flex gap-1 mt-1.5 flex-wrap items-center">
                    {(p.interests ?? []).slice(0, 2).map((id) => {
                      const interest = getInterestById(id);
                      return interest ? (
                        <span key={id} className="text-[10px] bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5">
                          {interest.emoji}
                        </span>
                      ) : null;
                    })}
                    {sharedWants > 0 && (
                      <span className="text-[10px] bg-teal-50 text-teal-700 rounded-full px-2 py-0.5 font-semibold">
                        {sharedWants} shared goal{sharedWants > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
