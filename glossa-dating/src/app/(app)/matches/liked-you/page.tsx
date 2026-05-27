"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Crown, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Liker {
  id: string;
  liker_id: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
    occupation: string | null;
    city: string | null;
  } | null;
}

export default function LikedYouPage() {
  const router = useRouter();
  const [likers, setLikers] = useState<Liker[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const [{ data: sub }, { data: likes }] = await Promise.all([
        supabase.from("subscriptions").select("status").eq("user_id", user.id).eq("status", "active").maybeSingle(),
        supabase
          .from("likes")
          .select("id, liker_id, created_at, profiles!likes_liker_id_fkey(display_name, avatar_url, occupation, city)")
          .eq("liked_id", user.id)
          .eq("is_mutual", false)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      setIsPremium(!!sub);
      setLikers((likes ?? []) as unknown as Liker[]);
      setLoading(false);
    };
    init();
  }, [router]);

  const likeback = async (likerId: string) => {
    setLiking(likerId);
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked_id: likerId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.matched) {
        router.push(`/chat/${data.match_id}`);
        return;
      }
      setLikers((prev) => prev.filter((l) => l.liker_id !== likerId));
    }
    setLiking(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-yellow-400" />
        <h1 className="text-2xl font-black text-gray-900">Who liked you</h1>
      </div>

      {!isPremium ? (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-200">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Premium feature</h2>
          <p className="text-gray-500 text-sm mb-2">
            {likers.length > 0
              ? `${likers.length} ${likers.length === 1 ? "person has" : "people have"} already liked your profile.`
              : "See who's already liked your profile."}
          </p>
          <p className="text-gray-500 text-sm mb-6">Upgrade to sinc&apos;d Premium to see who they are and like them back instantly.</p>

          {likers.length > 0 && (
            <div className="flex justify-center mb-6">
              {likers.slice(0, 5).map((l, i) => (
                <div
                  key={l.id}
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-gray-100 -ml-2 first:ml-0 filter blur-sm relative"
                  style={{ zIndex: 10 - i }}
                >
                  {l.profiles?.avatar_url ? (
                    <Image src={l.profiles.avatar_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          )}

          <Button onClick={() => router.push("/pricing")} className="w-full" size="lg">
            Get sinc&apos;d Premium — $5/mo
          </Button>
        </div>
      ) : likers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-semibold mb-2">No new likes yet</p>
          <p className="text-sm">Complete your profile to attract more matches.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {likers.map((liker) => (
            <div key={liker.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                {liker.profiles?.avatar_url ? (
                  <Image src={liker.profiles.avatar_url} alt={liker.profiles.display_name} width={56} height={56} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">{liker.profiles?.display_name}</div>
                {liker.profiles?.occupation && <div className="text-sm text-gray-500 truncate">{liker.profiles.occupation}</div>}
                {liker.profiles?.city && <div className="text-xs text-gray-400">{liker.profiles.city}</div>}
              </div>
              <Button
                size="sm"
                onClick={() => likeback(liker.liker_id)}
                loading={liking === liker.liker_id}
              >
                Like back
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
