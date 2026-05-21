"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/types";
import { EVENT_CATEGORIES } from "@/lib/modes";
import { distanceMiles, formatDistance, DISTANCE_PRESETS } from "@/lib/location";
import { Calendar, MapPin, Users, Plus, Clock, ArrowUpDown, MessageCircle } from "lucide-react";
import { sendEventRsvpEmail } from "@/lib/email";
import { format } from "date-fns";
import Link from "next/link";

type SortDir = "closest" | "soonest";

function getCategoryInfo(id: string) {
  return EVENT_CATEGORIES.find((c) => c.id === id);
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [distanceMax, setDistanceMax] = useState<number>(Infinity);
  const [sortDir, setSortDir] = useState<SortDir>("soonest");
  const [activeCategory, setActiveCategory] = useState("all");
  const [myUserId, setMyUserId] = useState("");
  const [myName, setMyName] = useState("");

  // Create form
  const [form, setForm] = useState({
    title: "", description: "", category: "hangout",
    location_name: "", starts_at: "", max_attendees: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { load(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { applyFilters(events); }, [events, distanceMax, sortDir, activeCategory, myLat]);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMyUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("latitude, longitude, display_name")
      .eq("id", user.id)
      .single();

    if (profile?.latitude) { setMyLat(profile.latitude); setMyLng(profile.longitude); }
    if (profile?.display_name) setMyName(profile.display_name);

    const now = new Date().toISOString();
    const { data } = await supabase
      .from("events")
      .select("*, event_rsvps(user_id, status)")
      .gte("starts_at", now)
      .order("starts_at");

    const enriched = await Promise.all((data ?? []).map(async (e) => {
      const { data: creator } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, id")
        .eq("id", e.creator_id)
        .single();
      const rsvps = e.event_rsvps ?? [];
      return {
        ...e,
        creator_profile: creator,
        rsvp_count: rsvps.filter((r: { status: string }) => r.status === "going").length,
        user_rsvp: rsvps.find((r: { user_id: string }) => r.user_id === user.id)?.status ?? null,
        distance_miles: (profile?.latitude && e.latitude)
          ? distanceMiles(profile.latitude, profile.longitude!, e.latitude, e.longitude!)
          : undefined,
      };
    }));

    setEvents(enriched);
    setLoading(false);
  };

  const applyFilters = (evts: Event[]) => {
    let result = [...evts];
    if (activeCategory !== "all") result = result.filter((e) => e.category === activeCategory);
    if (distanceMax !== Infinity) result = result.filter((e) => (e.distance_miles ?? Infinity) <= distanceMax);
    result.sort((a, b) =>
      sortDir === "soonest"
        ? new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        : (a.distance_miles ?? 999) - (b.distance_miles ?? 999)
    );
    setFiltered(result);
  };

  const rsvp = async (evt: Event, status: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const wasGoing = evt.user_rsvp === "going";
    const nowGoing = status === "going" && !wasGoing;

    await supabase.from("event_rsvps").upsert(
      { event_id: evt.id, user_id: user.id, status },
      { onConflict: "event_id,user_id" }
    );

    // Notify event creator when someone RSVPs "going"
    if (nowGoing && evt.creator_id !== user.id) {
      const getEmail = async (uid: string) => {
        try {
          const { data } = await supabase.rpc("get_user_email", { uid }).maybeSingle();
          return data as string | null;
        } catch { return null; }
      };
      const creatorEmail = await getEmail(evt.creator_id);
      const creatorName = (evt.creator_profile as { display_name: string } | null)?.display_name ?? "Event creator";
      if (creatorEmail) {
        sendEventRsvpEmail(creatorEmail, creatorName, myName, evt.title, evt.id).catch(() => {});
      }
    }

    await load();
  };

  const createEvent = async () => {
    if (!form.title || !form.starts_at) return;
    setFormLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("events").insert({
      creator_id: user.id,
      title: form.title.slice(0, 120),
      description: form.description.slice(0, 800) || null,
      category: form.category,
      location_name: form.location_name.slice(0, 150) || null,
      latitude: myLat,
      longitude: myLng,
      starts_at: form.starts_at,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
    });
    setForm({ title: "", description: "", category: "hangout", location_name: "", starts_at: "", max_attendees: "" });
    setCreating(false);
    setFormLoading(false);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-black text-xl text-gray-900">Events</h1>
          <p className="text-xs text-gray-400">Show up together</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow"
        >
          <Plus className="w-3.5 h-3.5" /> Create event
        </button>
      </div>

      {/* Create panel */}
      {creating && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-md p-5 mb-5 space-y-3">
          <h3 className="font-bold text-gray-900">New event</h3>
          <input
            placeholder="Event title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={120}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={800}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none resize-none"
          />
          <input
            placeholder="Location name (e.g. Zilker Park)"
            value={form.location_name}
            onChange={(e) => setForm({ ...form, location_name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Starts *</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max guests (opt.)</label>
              <input
                type="number"
                placeholder="∞"
                value={form.max_attendees}
                onChange={(e) => setForm({ ...form, max_attendees: e.target.value })}
                min="2" max="500"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.id })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${form.category === c.id ? "border-amber-500 bg-amber-500 text-white" : "border-gray-200 text-gray-600"}`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCreating(false)}
              className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={createEvent}
              disabled={formLoading || !form.title || !form.starts_at}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-400 text-white py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {formLoading ? "Creating..." : "Create event"}
            </button>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${activeCategory === "all" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"}`}
        >
          All
        </button>
        {EVENT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${activeCategory === c.id ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Distance + sort */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {DISTANCE_PRESETS.map((d) => (
          <button
            key={d.label}
            onClick={() => setDistanceMax(d.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold ${distanceMax === d.value ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}
          >
            {d.label}
          </button>
        ))}
        <button
          onClick={() => setSortDir((s) => s === "soonest" ? "closest" : "soonest")}
          className="flex items-center gap-1 ml-auto flex-shrink-0 bg-gray-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600"
        >
          <ArrowUpDown className="w-3 h-3" />
          {sortDir === "soonest" ? "Soonest" : "Closest"}
        </button>
      </div>

      {/* Events list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🎉</div>
          <p className="font-bold text-gray-900">No events nearby yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Be the first — create one!</p>
          <button
            onClick={() => setCreating(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-400 text-white px-6 py-3 rounded-full font-semibold text-sm"
          >
            Create an event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((evt) => {
            const cat = getCategoryInfo(evt.category);
            const isCreator = evt.creator_id === myUserId;
            const userGoing = evt.user_rsvp === "going";
            const isFull = evt.max_attendees !== null && (evt.rsvp_count ?? 0) >= evt.max_attendees;
            const canChat = isCreator || userGoing;

            return (
              <div key={evt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 flex items-center gap-2">
                  <span className="text-xl">{cat?.emoji || "🎉"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{evt.title}</p>
                    <p className="text-xs text-amber-600 font-medium">{cat?.label || "Event"}</p>
                  </div>
                  {isCreator && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Yours</span>
                  )}
                  {canChat && (
                    <Link
                      href={`/events/${evt.id}`}
                      className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Chat
                    </Link>
                  )}
                </div>
                <div className="px-4 py-3 space-y-2">
                  {evt.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{evt.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(evt.starts_at), "MMM d, h:mm a")}
                    </span>
                    {evt.location_name && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />{evt.location_name}
                      </span>
                    )}
                    {evt.distance_miles !== undefined && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />{formatDistance(evt.distance_miles)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {evt.rsvp_count ?? 0} going{evt.max_attendees ? ` / ${evt.max_attendees}` : ""}
                    </span>
                  </div>

                  {!isCreator && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => rsvp(evt, userGoing ? "not_going" : "going")}
                        disabled={isFull && !userGoing}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                          userGoing
                            ? "bg-amber-500 text-white"
                            : isFull
                              ? "bg-gray-100 text-gray-400"
                              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {userGoing ? "✓ Going!" : isFull ? "Full" : "I'm going"}
                      </button>
                      {!userGoing && !isFull && (
                        <button
                          onClick={() => rsvp(evt, "interested")}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                            evt.user_rsvp === "interested"
                              ? "border-amber-400 bg-amber-50 text-amber-700"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Interested
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
