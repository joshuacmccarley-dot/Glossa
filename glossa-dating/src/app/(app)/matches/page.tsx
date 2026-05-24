"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Match } from "@/types";
import { calculateAge } from "@/lib/utils";
import { Clock, RefreshCw, MessageCircle, Heart } from "lucide-react";
import Link from "next/link";
import { getInterestById } from "@/lib/interests";

interface MatchWithCountdown extends Match {
  hoursLeft: number;
  minutesLeft: number;
  isUrgent: boolean;
}

function getTimeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { hoursLeft: 0, minutesLeft: 0, isUrgent: false };
  const totalMins = Math.floor(diff / 60000);
  const hoursLeft = Math.floor(totalMins / 60);
  const minutesLeft = totalMins % 60;
  return { hoursLeft, minutesLeft, isUrgent: hoursLeft < 2 };
}

export default function MatchesPage() {
  const [activeMatches, setActiveMatches] = useState<MatchWithCountdown[]>([]);
  const [expiredMatches, setExpiredMatches] = useState<Match[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "expired">("active");
  const [recovering, setRecovering] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  // Refresh countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMatches((prev) =>
        prev.map((m) => ({ ...m, ...getTimeLeft(m.expires_at) }))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("is_premium").eq("user_id", user.id).single();
    setIsPremium(profile?.is_premium ?? false);

    const { data: matches } = await supabase
      .from("matches")
      .select("*, messages(id, content, created_at, sender_id)")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const matchRows = matches || [];

    // Batch-fetch all other-user profiles in ONE query (N+1 fix)
    const otherIds = matchRows.map((m) => m.user1_id === user.id ? m.user2_id : m.user1_id);
    const uniqueOtherIds = [...new Set(otherIds)];
    let profilesMap: Record<string, Record<string, unknown>> = {};
    if (uniqueOtherIds.length > 0) {
      const { data: profilesList } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", uniqueOtherIds);
      for (const p of profilesList ?? []) {
        profilesMap[(p as Record<string, unknown>).user_id as string] = p as Record<string, unknown>;
      }
    }

    const enriched = matchRows.map((m) => {
      const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
      const otherProfile = profilesMap[otherId] || null;
      const msgs = m.messages || [];
      const lastMsg = msgs[msgs.length - 1] || null;
      return { ...m, profile: otherProfile, last_message: lastMsg };
    });

    // Check expired
    const now = new Date();
    const active = enriched.filter((m) => !m.is_expired && new Date(m.expires_at) > now);
    const expired = enriched.filter((m) => m.is_expired || new Date(m.expires_at) <= now);

    setActiveMatches(active.map((m) => ({ ...m, ...getTimeLeft(m.expires_at) })));
    setExpiredMatches(expired);
    setLoading(false);
  };

  const recoverMatch = async (matchId: string) => {
    setRecovering(matchId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("matches").update({
      is_expired: false,
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      recovered_by: user.id,
    }).eq("id", matchId);
    setRecovering(null);
    await loadMatches();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="font-black text-xl text-gray-900 mb-4">Matches</h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "active" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
        >
          Active ({activeMatches.length})
        </button>
        <button
          onClick={() => setTab("expired")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "expired" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
        >
          Expired ({expiredMatches.length})
        </button>
      </div>

      {tab === "active" && (
        <div className="space-y-3">
          {activeMatches.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">No active matches yet</p>
              <p className="text-gray-500 text-sm mt-1">Keep discovering to find your sinc</p>
              <Link href="/discover" className="inline-block mt-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-full font-semibold text-sm">
                Go discover
              </Link>
            </div>
          ) : (
            activeMatches.map((m) => (
              <Link key={m.id} href={`/chat/${m.id}`} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="relative">
                  <img
                    src={m.profile?.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${m.profile?.user_id}&backgroundColor=d1fae5`}
                    alt={m.profile?.display_name}
                    className="w-14 h-14 rounded-2xl object-cover bg-emerald-100"
                  />
                  {m.isUrgent && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">!</span>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">{m.profile?.display_name}, {m.profile && calculateAge(m.profile.birthdate)}</p>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${m.isUrgent ? "text-amber-500" : "text-emerald-600"}`}>
                      <Clock className="w-3 h-3" />
                      {m.hoursLeft}h {m.minutesLeft}m
                    </div>
                  </div>
                  {m.last_message ? (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{m.last_message.content}</p>
                  ) : (
                    <p className="text-sm text-emerald-600 font-medium mt-0.5">Say something first!</p>
                  )}
                </div>
                <MessageCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "expired" && (
        <div className="space-y-3">
          {!isPremium && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-5 text-white mb-4">
              <p className="font-bold mb-1">Recover your expired matches</p>
              <p className="text-sm text-white/80 mb-3">With sinc&apos;d Premium you can revive any expired match for just $5/month.</p>
              <Link href="/pricing" className="inline-block bg-white text-emerald-700 font-bold px-4 py-2 rounded-full text-sm">
                Upgrade for $5/mo
              </Link>
            </div>
          )}
          {expiredMatches.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400">No expired matches yet.</p>
            </div>
          ) : (
            expiredMatches.map((m) => (
              <div key={m.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 opacity-60">
                <img
                  src={m.profile?.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${m.profile?.user_id}&backgroundColor=d1fae5`}
                  alt={m.profile?.display_name}
                  className="w-14 h-14 rounded-2xl object-cover bg-gray-200 grayscale"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-700">{m.profile?.display_name}</p>
                  <p className="text-sm text-gray-400">Match expired</p>
                </div>
                {isPremium && (
                  <button
                    onClick={() => recoverMatch(m.id)}
                    disabled={recovering === m.id}
                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${recovering === m.id ? "animate-spin" : ""}`} />
                    Recover
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
