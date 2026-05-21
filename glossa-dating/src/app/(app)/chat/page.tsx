"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Match } from "@/types";
import { calculateAge, formatTimeAgo } from "@/lib/utils";
import { Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

function hoursLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

export default function ChatListPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: matchRows } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq("is_expired", false)
      .order("created_at", { ascending: false });

    const enriched = await Promise.all(
      (matchRows || []).map(async (m) => {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", otherId).single();
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", m.id)
          .order("created_at", { ascending: false })
          .limit(1);
        return { ...m, profile, last_message: msgs?.[0] || null };
      })
    );

    setMatches(enriched);
    setLoading(false);
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
      <h1 className="font-black text-xl text-gray-900 mb-6">Messages</h1>

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-700">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Match with someone to start chatting</p>
          <Link href="/discover" className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-full font-semibold text-sm">
            Discover people
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => {
            const timeLeft = hoursLeft(m.expires_at);
            const isExpiring = timeLeft !== "Expired" && parseInt(timeLeft) < 2;
            return (
              <Link
                key={m.id}
                href={`/chat/${m.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <img
                  src={m.profile?.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${m.profile?.user_id}&backgroundColor=d1fae5`}
                  alt={m.profile?.display_name}
                  className="w-14 h-14 rounded-2xl object-cover bg-emerald-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-gray-900 truncate">
                      {m.profile?.display_name}
                      {m.profile?.birthdate && `, ${calculateAge(m.profile.birthdate)}`}
                    </p>
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${isExpiring ? "text-amber-500" : "text-emerald-600"}`}>
                      <Clock className="w-3 h-3" />
                      {timeLeft}
                    </span>
                  </div>
                  {m.last_message ? (
                    <p className="text-sm text-gray-500 truncate">{m.last_message.content}</p>
                  ) : (
                    <p className="text-sm text-emerald-600 font-medium">Start the conversation ✨</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
