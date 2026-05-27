"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTimeAgo } from "@/lib/utils";

interface EventMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: { display_name: string; avatar_url: string | null } | null;
}

interface EventInfo {
  id: string;
  title: string;
  creator_id: string;
}

export default function EventChatPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);

      const [{ data: ev }, { data: msgs }] = await Promise.all([
        supabase.from("events").select("id, title, creator_id").eq("id", eventId).single(),
        supabase
          .from("event_messages")
          .select("id, content, created_at, sender_id, profiles(display_name, avatar_url)")
          .eq("event_id", eventId)
          .order("created_at", { ascending: true })
          .limit(100),
      ]);

      setEvent(ev);
      setMessages((msgs ?? []) as unknown as EventMessage[]);
      setLoading(false);

      channel = supabase.channel(`event-chat-${eventId}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "event_messages",
          filter: `event_id=eq.${eventId}`,
        }, async (payload) => {
          const { data } = await supabase
            .from("event_messages")
            .select("id, content, created_at, sender_id, profiles(display_name, avatar_url)")
            .eq("id", payload.new.id)
            .single();
          if (data) setMessages((prev) => [...prev, data as unknown as EventMessage]);
        })
        .subscribe();
    };

    init();
    return () => { channel?.unsubscribe(); };
  }, [eventId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from("event_messages").insert({
      event_id: eventId,
      sender_id: userId,
      content: text.trim(),
    });
    setText("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)]">
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">{event?.title}</h1>
          <p className="text-xs text-gray-400">Event group chat</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet — say hello to the group!</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === userId;
          const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
          return (
            <div key={msg.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
              {!isOwn && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
              )}
              <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {!isOwn && <span className="text-[11px] text-gray-400 px-1">{profile?.display_name}</span>}
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${isOwn ? "bg-[#003526] text-white rounded-tr-sm" : "bg-gray-100 text-gray-900 rounded-tl-sm"}`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-300 px-1">{formatTimeAgo(msg.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Message the group..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-10 h-10 bg-[#003526] hover:bg-[#004535] text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
