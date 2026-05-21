"use client";
import { useState, useEffect, useCallback } from "react";
import { Heart, X, Star, SlidersHorizontal, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DiscoverProfile } from "@/types";
import { calculateAge as calcAge } from "@/lib/utils";
import { scoreCompatibility } from "@/lib/interests";
import { getInterestById } from "@/lib/interests";
import Link from "next/link";

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matched, setMatched] = useState(false);
  const [matchedName, setMatchedName] = useState("");
  const [myProfile, setMyProfile] = useState<{ user_id: string; interests: string[]; is_premium: boolean } | null>(null);
  const [likesLeft, setLikesLeft] = useState(10);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get my profile
    const { data: me } = await supabase
      .from("profiles")
      .select("user_id, interests, is_premium, looking_for, gender")
      .eq("user_id", user.id)
      .single();

    setMyProfile(me);

    // Get already-seen users (liked or passed)
    const { data: likedRows } = await supabase
      .from("likes")
      .select("to_user_id")
      .eq("from_user_id", user.id);

    const likedIds = (likedRows || []).map((l) => l.to_user_id);
    const excluded = [user.id, ...likedIds];

    const { data: candidates } = await supabase
      .from("profiles")
      .select("*")
      .eq("onboarding_complete", true)
      .not("user_id", "in", `(${excluded.join(",")})`)
      .limit(20);

    const scored: DiscoverProfile[] = (candidates || []).map((p) => ({
      ...p,
      age: calcAge(p.birthdate),
      compatibility_score: me
        ? scoreCompatibility(me.interests || [], p.interests || [])
        : 0,
    })).sort((a, b) => b.compatibility_score - a.compatibility_score);

    setProfiles(scored);
    setLoading(false);
  };

  const current = profiles[currentIndex];

  const handleLike = useCallback(async () => {
    if (!current || !myProfile) return;
    if (!myProfile.is_premium && likesLeft <= 0) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("likes").insert({ from_user_id: user.id, to_user_id: current.user_id });
    if (!myProfile.is_premium) setLikesLeft((l) => l - 1);

    // Check for mutual like (match!)
    const { data: mutualLike } = await supabase
      .from("likes")
      .select("id")
      .eq("from_user_id", current.user_id)
      .eq("to_user_id", user.id)
      .maybeSingle();

    if (mutualLike) {
      // Create match with 12-hour expiry
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id")
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${current.user_id}),and(user1_id.eq.${current.user_id},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (!existingMatch) {
        await supabase.from("matches").insert({
          user1_id: user.id,
          user2_id: current.user_id,
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        });
      }
      setMatchedName(current.display_name);
      setMatched(true);
    }

    setCurrentIndex((i) => i + 1);
  }, [current, myProfile, likesLeft]);

  const handlePass = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Finding your matches...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-black text-xl text-gray-900">Discover</h1>
          {!myProfile?.is_premium && (
            <p className="text-xs text-gray-400">{likesLeft} likes remaining today</p>
          )}
        </div>
        <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow border border-gray-100">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Match notification */}
      {matched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full">
            <div className="text-6xl mb-4">💚</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">You&apos;re sinc&apos;d!</h2>
            <p className="text-gray-500 mb-2">You and <span className="font-bold text-gray-900">{matchedName}</span> liked each other.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 text-sm">
              <p className="font-semibold text-amber-800">⏱️ 12-hour countdown started!</p>
              <p className="text-amber-600 mt-1">Send a message before time runs out.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMatched(false)}
                className="flex-1 border-2 border-gray-200 py-3 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep swiping
              </button>
              <Link
                href="/matches"
                onClick={() => setMatched(false)}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-2xl font-semibold text-center"
              >
                Message them
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      {!current ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-5xl mb-4">🌿</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;ve seen everyone!</h2>
          <p className="text-gray-500 text-sm mb-6">Check back soon — new people join every day.</p>
          <button onClick={loadProfiles} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-full font-semibold">
            Refresh
          </button>
        </div>
      ) : (
        <div className="relative select-none">
          {/* Profile card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900" style={{ aspectRatio: "3/4" }}>
            <img
              src={current.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${current.user_id}&backgroundColor=d1fae5,99f6e4,ccfbf1`}
              alt={current.display_name}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

            {/* Compatibility */}
            {current.compatibility_score > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-gray-800">{current.compatibility_score}% match</span>
              </div>
            )}

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    {current.display_name}, {current.age}
                  </h2>
                  {current.location && (
                    <p className="text-white/70 text-sm mt-0.5">📍 {current.location}</p>
                  )}
                  {current.occupation && (
                    <p className="text-white/70 text-sm">💼 {current.occupation}</p>
                  )}
                </div>
              </div>
              {current.bio && (
                <p className="text-white/90 text-sm line-clamp-2 mb-3">{current.bio}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {current.interests.slice(0, 5).map((id) => {
                  const interest = getInterestById(id);
                  if (!interest) return null;
                  return (
                    <span key={id} className="flex items-center gap-1 bg-white/20 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full font-medium">
                      {interest.emoji} {interest.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center items-center gap-5 mt-6">
            <button
              onClick={handlePass}
              className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center hover:border-red-300 hover:shadow-xl active:scale-95 transition-all"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
            <button
              onClick={handleLike}
              disabled={!myProfile?.is_premium && likesLeft <= 0}
              className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-200 flex items-center justify-center hover:shadow-2xl active:scale-95 transition-all disabled:opacity-40"
            >
              <Heart className="w-7 h-7 text-white fill-white" />
            </button>
            <button className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center hover:border-amber-300 hover:shadow-xl active:scale-95 transition-all">
              <Star className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {!myProfile?.is_premium && likesLeft <= 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="font-semibold text-amber-800 text-sm">You&apos;ve used all 10 free likes today</p>
              <Link href="/pricing" className="text-xs text-amber-600 underline mt-1 inline-block">
                Get unlimited likes for $5/month →
              </Link>
            </div>
          )}

          {/* Next card peek */}
          {profiles[currentIndex + 1] && (
            <p className="text-center text-xs text-gray-400 mt-3">
              {profiles.length - currentIndex - 1} more people nearby
            </p>
          )}
        </div>
      )}
    </div>
  );
}
