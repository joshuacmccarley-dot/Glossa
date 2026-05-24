"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, MapPin, Briefcase, ArrowUpDown, Flag, Heart, MessageSquare, Leaf, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DiscoverProfile } from "@/types";
import { getInterestById } from "@/lib/interests";
import { getWantById } from "@/lib/wants";
import { MODES, DATING_INTENTIONS, getModeById } from "@/lib/modes";
import { formatDistance, DISTANCE_PRESETS, getUserLocation } from "@/lib/location";
import { ReportModal } from "@/components/ui/report-modal";
import { PushPrompt } from "@/components/push-prompt";
import { ProfileCompletion } from "@/components/profile-completion";
import type { ConnectionMode } from "@/lib/modes";
import { getPrompt } from "@/lib/prompts";
import Link from "next/link";

// ─── Active badge helper ────────────────────────────────────────────────────
function ActiveBadge({ lastActiveAt }: { lastActiveAt: string | null }) {
  if (!lastActiveAt) return null;
  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  const diffHours = diffMs / 3_600_000;
  if (diffHours < 24) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        Today
      </span>
    );
  }
  if (diffHours < 168) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        This week
      </span>
    );
  }
  return null;
}

type SortDir = "smart" | "closest" | "furthest";

interface MyContext {
  interests: string[];
  wants: string[];
  latitude: number | null;
  longitude: number | null;
  connection_modes: string[];
  is_premium: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: "4/5" }} />
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [selected, setSelected] = useState<DiscoverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<{ name: string; matchId: string } | null>(null);
  const [myCtx, setMyCtx] = useState<MyContext | null>(null);
  const [reporting, setReporting] = useState<DiscoverProfile | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Filters
  const [activeMode, setActiveMode] = useState<ConnectionMode | "all">("all");
  const [distanceMax, setDistanceMax] = useState<number>(Infinity);
  const [sortDir, setSortDir] = useState<SortDir>("smart");
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const blockedRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  // Load user context on mount
  useEffect(() => {
    const initCtx = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: me } = await supabase
        .from("profiles")
        .select("interests, wants, is_premium, latitude, longitude, connection_modes")
        .eq("user_id", user.id)
        .single();

      const ctx: MyContext = {
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
      blockedRef.current = new Set((blockRows ?? []).map((b) => b.blocked_id as string));

      const { data: likedRows } = await supabase
        .from("likes")
        .select("liked_id")
        .eq("liker_id", user.id);
      setLikedIds(new Set((likedRows ?? []).map((l) => l.liked_id as string)));

      initializedRef.current = true;
    };
    initCtx();
  }, []);

  const buildParams = useCallback((pg: number, lat: number | null, lng: number | null) => {
    const params = new URLSearchParams();
    params.set("page", String(pg));
    params.set("mode", activeMode);
    params.set("sort", sortDir);
    if (distanceMax !== Infinity) params.set("distance_max", String(distanceMax));
    if (lat !== null) params.set("lat", String(lat));
    if (lng !== null) params.set("lng", String(lng));
    return params;
  }, [activeMode, distanceMax, sortDir]);

  const loadProfiles = useCallback(async (pg: number, lat: number | null, lng: number | null, append = false) => {
    if (pg === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = buildParams(pg, lat, lng);
      const res = await fetch("/api/discover?" + params.toString());
      if (!res.ok) return;
      const json = await res.json() as { profiles: DiscoverProfile[]; total: number; hasMore: boolean };
      if (append) {
        setProfiles((prev) => [...prev, ...json.profiles]);
      } else {
        setProfiles(json.profiles);
      }
      setTotal(json.total);
      setHasMore(json.hasMore);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildParams]);

  // Re-fetch when filters change (reset to page 0)
  useEffect(() => {
    if (!initializedRef.current) return;
    setPage(0);
    loadProfiles(0, myLat, myLng, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, distanceMax, sortDir]);

  // Initial load (after ctx is available)
  useEffect(() => {
    if (!initializedRef.current) return;
    loadProfiles(0, myLat, myLng, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myLat, myLng]);

  // Poll for initialization
  useEffect(() => {
    const timer = setInterval(() => {
      if (initializedRef.current) {
        clearInterval(timer);
        loadProfiles(0, myLat, myLng, false);
      }
    }, 100);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProfiles(nextPage, myLat, myLng, true);
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
        await supabase.from("profiles").update({ latitude: pos.lat, longitude: pos.lng }).eq("user_id", user.id);
      }
    } catch { /* denied */ }
    finally { setLocating(false); }
  };

  const handleLike = useCallback(async (profile: DiscoverProfile) => {
    // Use profile.user_id (auth ID) for the like, not profile.id (row PK)
    const authId = profile.user_id;
    if (likedIds.has(authId)) return;
    setLikedIds((prev) => new Set([...prev, authId]));

    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked_id: authId }),
    });
    const json = await res.json();

    if (json.matched) {
      setMatched({ name: profile.display_name, matchId: json.match_id });
      setSelected(null);
    } else if (!res.ok) {
      // Revert optimistic update on error
      setLikedIds((prev) => { const next = new Set(prev); next.delete(authId); return next; });
    }
  }, [likedIds]);

  const handleBlock = useCallback((profile: DiscoverProfile) => {
    blockedRef.current.add(profile.user_id);
    setProfiles((prev) => prev.filter((p) => p.user_id !== profile.user_id));
    setSelected(null);
  }, []);

  const handleFilterChange = (fn: () => void) => {
    fn();
    setPage(0);
  };

  const intentionLabel = (p: DiscoverProfile) => DATING_INTENTIONS.find((r) => r.id === p.relationship_intention);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-5">
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <PushPrompt />
      <ProfileCompletion />

      {/* Report modal */}
      {reporting && (
        <ReportModal
          reportedId={reporting.user_id}
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
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">You&apos;re sinc&apos;d!</h2>
            <p className="text-gray-500 mb-2">You and <strong>{matched.name}</strong> connected.</p>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-6 text-sm">
              <p className="font-semibold text-amber-800">12-hour window is open</p>
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
                <X className="w-4 h-4" />
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
                      {mode.label}
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
                    {intentionLabel(selected)!.label}
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
                          {want.label}{isShared ? " ✓" : ""}
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
                          {interest.label}{isShared ? " ✓" : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active badge in drawer */}
              {selected.last_active_at && (
                <div className="flex items-center gap-2">
                  <ActiveBadge lastActiveAt={selected.last_active_at} />
                </div>
              )}

              {/* Profile prompts / conversation starters */}
              {selected.profile_prompts && selected.profile_prompts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Conversation starters
                  </p>
                  <div className="space-y-2">
                    {selected.profile_prompts.map((pp, idx) => {
                      const prompt = getPrompt(pp.id);
                      if (!prompt || !pp.answer) return null;
                      return (
                        <div key={idx} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-xs text-gray-400 mb-1">{prompt.question}</p>
                          <p className="text-sm font-semibold text-gray-900">{pp.answer}</p>
                        </div>
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
                  disabled={likedIds.has(selected.user_id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 transition active:scale-[0.98]"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  {likedIds.has(selected.user_id) ? "Connected!" : "Connect"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => handleFilterChange(() => setActiveMode("all"))}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${activeMode === "all" ? "bg-emerald-500 text-white shadow" : "bg-gray-100 text-gray-600"}`}
        >
          🌐 All
        </button>
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => handleFilterChange(() => setActiveMode(m.id))}
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
              handleFilterChange(() => setDistanceMax(d.value));
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
              onClick={() => handleFilterChange(() => setSortDir(s))}
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
        {total} {total === 1 ? "person" : "people"}
        {activeMode !== "all" ? ` in ${getModeById(activeMode)?.label}` : " nearby"}
        {sortDir === "smart" ? " · Ranked for you" : ""}
      </p>

      {/* Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌿</div>
          <p className="font-bold text-gray-900">
            {activeMode !== "all" ? `Nobody in ${getModeById(activeMode)?.label} nearby yet` : "You've seen everyone nearby"}
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Try expanding your distance or switching modes.</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => { handleFilterChange(() => { setActiveMode("all"); setDistanceMax(Infinity); }); }}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm"
            >
              See everyone
            </button>
            <button onClick={() => loadProfiles(0, myLat, myLng, false)} className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-full font-semibold text-sm">
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((p) => {
              const liked = likedIds.has(p.user_id);
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

                    {!liked && p.compatibility_score >= 30 && (
                      <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-emerald-500 rounded-full px-2 py-0.5">
                        <Zap className="w-2.5 h-2.5 text-white" />
                        <span className="text-[10px] font-bold text-white">{p.compatibility_score}% match</span>
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
                      <ActiveBadge lastActiveAt={p.last_active_at} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold text-sm transition disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
