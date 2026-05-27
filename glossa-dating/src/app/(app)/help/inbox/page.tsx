"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTimeAgo } from "@/lib/utils";

interface HelpResponse {
  id: string;
  content: string;
  created_at: string;
  resolved: boolean;
  post_id: string;
  responder_id: string;
  help_posts: { title: string } | null;
  profiles: { display_name: string; avatar_url: string | null } | null;
}

export default function HelpInboxPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<HelpResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"open" | "resolved">("open");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("help_responses")
        .select(`
          id, content, created_at, resolved, post_id, responder_id,
          help_posts!inner(title, poster_id),
          profiles!help_responses_responder_id_fkey(display_name, avatar_url)
        `)
        .eq("help_posts.poster_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      setResponses((data ?? []) as unknown as HelpResponse[]);
      setLoading(false);
    };
    init();
  }, [router]);

  const markResolved = async (id: string) => {
    const supabase = createClient();
    await supabase.from("help_responses").update({ resolved: true }).eq("id", id);
    setResponses((prev) => prev.map((r) => r.id === id ? { ...r, resolved: true } : r));
  };

  const filtered = responses.filter((r) => (tab === "open" ? !r.resolved : r.resolved));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Inbox className="w-6 h-6 text-emerald-500" />
        <h1 className="text-2xl font-black text-gray-900">Help inbox</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(["open", "resolved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === t ? "bg-[#003526] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "open" ? "Open" : "Resolved"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">{tab === "open" ? "No open responses" : "No resolved responses"}</p>
          <p className="text-sm mt-1">{tab === "open" ? "Responses to your posts will appear here." : ""}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
            const post = Array.isArray(r.help_posts) ? r.help_posts[0] : r.help_posts;
            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt={profile.display_name ?? "User"} width={40} height={40} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">{profile?.display_name}</div>
                    <div className="text-xs text-gray-400">
                      responded to &ldquo;{post?.title}&rdquo; · {formatTimeAgo(r.created_at)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 mb-3">{r.content}</p>
                {!r.resolved && (
                  <button
                    onClick={() => markResolved(r.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#003526] hover:text-[#004535]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as resolved
                  </button>
                )}
                {r.resolved && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
