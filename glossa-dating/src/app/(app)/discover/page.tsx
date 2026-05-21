"use client";
import { useState, useEffect, useCallback } from "react";
import { Heart, SlidersHorizontal, Zap, MapPin, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DiscoverProfile } from "@/types";
import { calculateAge as calcAge } from "@/lib/utils";
import { scoreCompatibility, getInterestById, RELATIONSHIP_INTENTIONS } from "@/lib/interests";
import Link from "next/link";

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [selected, setSelected] = useState<DiscoverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<{ name: string; matchId: string } | null>(null);
  const [myProfile, setMyProfile] = useState<{ user_id: string; interests: string[] } | null>(null);

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: me } = await supabase.from("profiles").select("user_id, interests").eq("user_id", user.id).single();
    setMyProfile(me);

    const { data: likedRows } = await supabase.from("likes").select("to_user_id").eq("from_user_id", user.id);
    const alreadyLiked = new Set((likedRows || []).map((l) => l.to_user_id));
    const excluded = [user.id, ...alreadyLiked];

    const { data: candidates } = await supabase.from("profiles").select("*").eq("onboarding_complete", true).not("user_id", "in", `(${excluded.join(",")})`).limit(50);

    const scored: DiscoverProfile[] = (candidates || []).map((p) => ({
      ...p,
      age: calcAge(p.birthdate),
      compatibility_score: me ? scoreCompatibility(me.interests || [], p.interests || []) : 0,
    })).sort((a, b) => b.compatibility_score - a.compatibility_score);

    setProfiles(scored);
    setLoading(false);
  };

  const handleLike = useCallback(async (profile: DiscoverProfile) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLikedIds((prev) => new Set([...prev, profile.user_id]));

    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user_id: profile.user_id }),
    });
    const json = await res.json();

    if (json.matched) {
      setMatched({ name: profile.display_name, matchId: json.match_id });
      setSelected(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Finding your people...</p>
      </div>
    );
  }

  const intentionForProfile = (p: DiscoverProfile) =>
    RELATIONSHIP_INTENTIONS.find((r) => r.id === p.relationship_intention);

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-black text-xl text-gray-900">Discover</h1>
          <p className="text-xs text-gray-400">Sorted by how well you match</p>
        </div>
        <button className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow border border-gray-100">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Match notification modal */}
      {matched && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-8 sm:pb-0">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-full max-w-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <Heart className="w-9 h-9 text-white fill-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">It&apos;s a match!</h2>
            <p className="text-gray-500 mb-2">You and <span className="font-bold text-gray-900">{matched.name}</span> are sinc&apos;d.</p>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-6 text-sm">
              <p className="font-semibold text-amber-800">⏱️ 12-hour window open</p>
              <p className="text-amber-600 mt-0.5 text-xs">Say something before it closes — real talk only.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMatched(null)} className="flex-1 border-2 border-gray-200 py-3 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Keep browsing
              </button>
              <Link href={`/chat/${matched.matchId}`} onClick={() => setMatched(null)} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-2xl text-sm font-bold text-center">
                Start chatting →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo */}
            <div className="relative h-72 bg-emerald-100">
              <img
                src={selected.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${selected.user_id}&backgroundColor=d1fae5,99f6e4`}
                alt={selected.display_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white">
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-black text-white">{selected.display_name}, {selected.age}</h2>
                {selected.location && (
                  <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {selected.location}
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              {/* Compatibility */}
              {selected.compatibility_score > 0 && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-700 text-sm">{selected.compatibility_score}% interest match</span>
                </div>
              )}

              {/* Work & intention */}
              <div className="flex flex-wrap gap-2">
                {selected.occupation && (
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-600">
                    <Briefcase className="w-3.5 h-3.5" /> {selected.occupation}
                  </div>
                )}
                {intentionForProfile(selected) && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1.5 text-sm font-medium">
                    {intentionForProfile(selected)!.emoji} {intentionForProfile(selected)!.label}
                  </div>
                )}
              </div>

              {/* Bio */}
              {selected.bio && (
                <p className="text-gray-700 leading-relaxed text-sm">{selected.bio}</p>
              )}

              {/* Shared interests first */}
              {selected.interests.length > 0 && myProfile && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.interests.map((id) => {
                      const interest = getInterestById(id);
                      if (!interest) return null;
                      const isShared = myProfile.interests.includes(id);
                      return (
                        <span
                          key={id}
                          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border ${
                            isShared
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {interest.emoji} {interest.label}
                          {isShared && " ✓"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-safe">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 border-2 border-gray-200 py-3.5 rounded-2xl font-semibold text-gray-500 hover:bg-gray-50 transition"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleLike(selected)}
                  disabled={likedIds.has(selected.user_id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 transition active:scale-[0.98]"
                >
                  <Heart className={`w-5 h-5 ${likedIds.has(selected.user_id) ? "fill-white" : ""}`} />
                  {likedIds.has(selected.user_id) ? "Liked!" : "Connect"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌿</div>
          <p className="font-bold text-gray-900">You&apos;ve seen everyone nearby</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">New people join every day — check back soon.</p>
          <button onClick={loadProfiles} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-full font-semibold text-sm">
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {profiles.map((p) => {
            const liked = likedIds.has(p.user_id);
            const intention = intentionForProfile(p);
            return (
              <button
                key={p.user_id}
                onClick={() => setSelected(p)}
                className="text-left rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98] group"
              >
                {/* Photo */}
                <div className="relative aspect-[4/5] bg-emerald-50">
                  <img
                    src={p.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${p.user_id}&backgroundColor=d1fae5,99f6e4`}
                    alt={p.display_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Compatibility badge */}
                  {p.compatibility_score >= 40 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500 rounded-full px-2 py-0.5">
                      <Zap className="w-2.5 h-2.5 text-white" />
                      <span className="text-[10px] font-bold text-white">{p.compatibility_score}%</span>
                    </div>
                  )}

                  {/* Liked indicator */}
                  {liked && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{p.display_name}, {p.age}</p>
                    {intention && (
                      <p className="text-white/70 text-[10px] mt-0.5">{intention.emoji} {intention.label}</p>
                    )}
                  </div>
                </div>

                {/* Bottom row */}
                <div className="px-3 py-2.5">
                  {p.occupation ? (
                    <p className="text-xs text-gray-500 truncate">💼 {p.occupation}</p>
                  ) : p.location ? (
                    <p className="text-xs text-gray-500 truncate">📍 {p.location}</p>
                  ) : null}
                  {p.interests.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {p.interests.slice(0, 2).map((id) => {
                        const interest = getInterestById(id);
                        if (!interest) return null;
                        return (
                          <span key={id} className="text-[10px] bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5">
                            {interest.emoji}
                          </span>
                        );
                      })}
                      {p.interests.length > 2 && (
                        <span className="text-[10px] text-gray-400">+{p.interests.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
