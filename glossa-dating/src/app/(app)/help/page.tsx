"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HelpPost } from "@/types";
import { HELP_CATEGORIES } from "@/lib/modes";
import { distanceMiles, formatDistance, DISTANCE_PRESETS } from "@/lib/location";
import { Plus, MapPin, MessageCircle, CheckCircle, Zap, HandHeart } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

function getCatInfo(id: string) {
  return HELP_CATEGORIES.find((c) => c.id === id);
}

export default function HelpPage() {
  const [posts, setPosts] = useState<HelpPost[]>([]);
  const [filtered, setFiltered] = useState<HelpPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeKind, setActiveKind] = useState<"all" | "need" | "offer">("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [distanceMax, setDistanceMax] = useState<number>(Infinity);
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [myUserId, setMyUserId] = useState("");
  const [respondingTo, setRespondingTo] = useState<HelpPost | null>(null);
  const [responseText, setResponseText] = useState("");

  // Resolve flow state
  const [resolvingPost, setResolvingPost] = useState<HelpPost | null>(null);
  const [resolverName, setResolverName] = useState("");

  // Create form
  const [form, setForm] = useState({ kind: "need" as "need" | "offer", title: "", description: "", category: "other", location_name: "", is_urgent: false });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilters(posts); }, [posts, activeKind, activeCategory, distanceMax, myLat]);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMyUserId(user.id);

    const { data: profile } = await supabase.from("profiles").select("latitude, longitude").eq("user_id", user.id).single();
    if (profile?.latitude) { setMyLat(profile.latitude); setMyLng(profile.longitude); }

    const { data } = await supabase.from("help_posts").select("*").eq("is_resolved", false).order("created_at", { ascending: false }).limit(80);

    const postsData = data || [];

    // Batch-fetch all poster profiles in ONE query (N+1 fix)
    const posterIds = [...new Set(postsData.map((p) => p.user_id))];
    let posterProfilesMap: Record<string, { display_name: string; photos: string[] | null; user_id: string }> = {};
    if (posterIds.length > 0) {
      const { data: posterProfiles } = await supabase
        .from("profiles")
        .select("display_name, photos, user_id")
        .in("user_id", posterIds);
      for (const pp of posterProfiles ?? []) {
        posterProfilesMap[pp.user_id] = pp;
      }
    }

    const enriched = postsData.map((p) => ({
      ...p,
      poster_profile: posterProfilesMap[p.user_id] ?? null,
      distance_miles: (profile?.latitude && p.latitude) ? distanceMiles(profile.latitude, profile.longitude!, p.latitude, p.longitude!) : undefined,
    }));

    setPosts(enriched);
    setLoading(false);
  };

  const applyFilters = (allPosts: HelpPost[]) => {
    let result = [...allPosts];
    if (activeKind !== "all") result = result.filter((p) => p.kind === activeKind);
    if (activeCategory !== "all") result = result.filter((p) => p.category === activeCategory);
    if (distanceMax !== Infinity) result = result.filter((p) => (p.distance_miles ?? Infinity) <= distanceMax);
    // Urgent posts first, then by distance/time
    result.sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return (a.distance_miles ?? 9999) - (b.distance_miles ?? 9999);
    });
    setFiltered(result);
  };

  const createPost = async () => {
    if (!form.title || !form.description) return;
    setFormLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("help_posts").insert({
      user_id: user.id,
      kind: form.kind,
      title: form.title.slice(0, 120),
      description: form.description.slice(0, 600),
      category: form.category,
      location_name: form.location_name.slice(0, 100) || null,
      latitude: myLat,
      longitude: myLng,
      is_urgent: form.is_urgent,
    });
    setForm({ kind: "need", title: "", description: "", category: "other", location_name: "", is_urgent: false });
    setCreating(false);
    setFormLoading(false);
    await load();
  };

  const initiateResolve = (post: HelpPost) => {
    setResolvingPost(post);
    setResolverName("");
  };

  const confirmResolve = async () => {
    if (!resolvingPost) return;
    const supabase = createClient();
    await supabase.from("help_posts").update({ is_resolved: true }).eq("id", resolvingPost.id);
    setPosts((prev) => prev.filter((p) => p.id !== resolvingPost.id));
    setResolvingPost(null);
    setResolverName("");
  };

  const sendResponse = async () => {
    if (!respondingTo || !responseText.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const text = responseText.trim().slice(0, 600);
    await supabase.from("help_responses").upsert({
      post_id: respondingTo.id,
      responder_id: user.id,
      message: text,
    }, { onConflict: "post_id,responder_id" });
    setRespondingTo(null);
    setResponseText("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      {/* Response modal */}
      {respondingTo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-1">Respond to {respondingTo.poster_profile?.display_name}</h3>
            <p className="text-sm text-gray-500 mb-4 bg-blue-50 rounded-xl p-3">{respondingTo.title}</p>
            <textarea
              placeholder="How can you help? Keep it genuine..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              maxLength={600}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none resize-none mb-3"
            />
            <div className="flex gap-2">
              <button onClick={() => setRespondingTo(null)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-500">Cancel</button>
              <button onClick={sendResponse} disabled={!responseText.trim()} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50">Send response</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve confirmation modal */}
      {resolvingPost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-1">Mark as resolved</h3>
            <p className="text-sm text-gray-500 mb-4 bg-emerald-50 rounded-xl p-3">{resolvingPost.title}</p>
            <p className="text-sm font-medium text-gray-700 mb-2">Did someone help you? <span className="text-gray-400 font-normal">(Optional)</span></p>
            <input
              placeholder="Responder's name (or leave blank)"
              value={resolverName}
              onChange={(e) => setResolverName(e.target.value)}
              maxLength={80}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setResolvingPost(null)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium text-gray-500">Cancel</button>
              <button onClick={confirmResolve} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl text-sm font-bold">Mark resolved</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-black text-xl text-gray-900">Lend a Hand</h1>
          <p className="text-xs text-gray-400">Give or receive — no strings</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow">
          <Plus className="w-3.5 h-3.5" /> Post
        </button>
      </div>

      {/* Create panel */}
      {creating && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-5 mb-5 space-y-3">
          <h3 className="font-bold text-gray-900">New post</h3>
          <div className="flex gap-2">
            {(["need", "offer"] as const).map((k) => (
              <button key={k} onClick={() => setForm({ ...form, kind: k })} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition ${form.kind === k ? "border-blue-500 bg-blue-500 text-white" : "border-gray-200 text-gray-600"}`}>
                {k === "need" ? "I need help" : "I can help"}
              </button>
            ))}
          </div>
          <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none" />
          <textarea placeholder="Details * (what do you need or offer?)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={600} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none resize-none" />
          <input placeholder="Location (optional)" value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none" />
          <div className="flex flex-wrap gap-1.5">
            {HELP_CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setForm({ ...form, category: c.id })} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${form.category === c.id ? "border-blue-500 bg-blue-500 text-white" : "border-gray-200 text-gray-600"}`}>
                {c.label}
              </button>
            ))}
          </div>
          {/* Urgent toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_urgent}
              onChange={(e) => setForm({ ...form, is_urgent: e.target.checked })}
              className="w-4 h-4 rounded accent-red-500"
            />
            <span className={`text-sm font-semibold ${form.is_urgent ? "text-red-600" : "text-gray-500"}`}>
              {form.is_urgent ? <><Zap className="w-3 h-3 inline mr-1" />Urgent</> : "Urgent"}
            </span>
            {form.is_urgent && <span className="text-xs text-red-400">(shown prominently to nearby people)</span>}
          </label>
          <div className="flex gap-2">
            <button onClick={() => setCreating(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-500">Cancel</button>
            <button onClick={createPost} disabled={formLoading || !form.title || !form.description} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
              {formLoading ? "Posting..." : "Post it"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        {(["all", "need", "offer"] as const).map((k) => (
          <button key={k} onClick={() => setActiveKind(k)} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeKind === k ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {k === "all" ? "All" : k === "need" ? "Needs" : "Offers"}
          </button>
        ))}
        <div className="flex gap-1 ml-auto">
          {DISTANCE_PRESETS.filter((_, i) => i < 3).map((d) => (
            <button key={d.label} onClick={() => setDistanceMax(d.value)} className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold ${distanceMax === d.value ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}`}>{d.label}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-1 mb-5 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveCategory("all")} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${activeCategory === "all" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>All</button>
        {HELP_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${activeCategory === c.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-3"><HandHeart className="w-12 h-12 text-gray-200" /></div>
          <p className="font-bold text-gray-900">Nothing here yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Be the first to offer or ask for help.</p>
          <button onClick={() => setCreating(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-semibold text-sm">Post something</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => {
            const cat = getCatInfo(post.category);
            const isOwn = post.user_id === myUserId;
            return (
              <div key={post.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${post.is_urgent ? "border-red-200 ring-1 ring-red-200" : post.kind === "need" ? "border-blue-100" : "border-teal-100"}`}>
                <div className={`px-4 py-2.5 flex items-center gap-2 text-xs font-bold ${post.kind === "need" ? "bg-blue-50 text-blue-600" : "bg-teal-50 text-teal-600"}`}>
                  <span>{post.kind === "need" ? "Needs help" : "Offering help"}</span>
                  {post.is_urgent && (
                    <span className="flex items-center gap-0.5 bg-red-500 text-white px-2 py-0.5 rounded-full font-bold text-[11px]">
                      <Zap className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  {cat && <span className="ml-auto">{cat.label}</span>}
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-start gap-3 mb-2">
                    <img
                      src={post.poster_profile?.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${post.user_id}&backgroundColor=d1fae5`}
                      alt=""
                      className="w-9 h-9 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{post.title}</p>
                      <p className="text-xs text-gray-400">{post.poster_profile?.display_name} · {formatTimeAgo(post.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{post.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    {post.location_name && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.location_name}</span>}
                    {post.distance_miles !== undefined && <span>{formatDistance(post.distance_miles)}</span>}
                  </div>
                  <div className="flex gap-2">
                    {!isOwn && (
                      <button onClick={() => setRespondingTo(post)} className="flex items-center gap-1.5 flex-1 justify-center bg-blue-50 border border-blue-200 text-blue-700 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-100 transition">
                        <MessageCircle className="w-3.5 h-3.5" /> Respond
                      </button>
                    )}
                    {isOwn && (
                      <button onClick={() => initiateResolve(post)} className="flex items-center gap-1.5 flex-1 justify-center bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition">
                        <CheckCircle className="w-3.5 h-3.5" /> Mark resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
