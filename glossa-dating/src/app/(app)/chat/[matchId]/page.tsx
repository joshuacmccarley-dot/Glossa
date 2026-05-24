"use client";
import { useState, useEffect, useRef, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message, Profile } from "@/types";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Send, ArrowLeft, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";
import { ProfilePrompt, getPrompt } from "@/lib/prompts";

function hoursLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

// Fallback generic conversation starters
const ICEBREAKERS = [
  "What's something you've been really into lately?",
  "If you could teleport anywhere right now, where would you go?",
  "What's the best meal you've cooked recently?",
  "What hobby have you picked up in the last year?",
  "What's a place on your bucket list?",
];

export default function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [otherPrompts, setOtherPrompts] = useState<ProfilePrompt[]>([]);
  const [matchExpiry, setMatchExpiry] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const [myUserId, setMyUserId] = useState<string>("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChat = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMyUserId(user.id);

    const { data: match } = await supabase.from("matches").select("*").eq("id", matchId).single();
    if (!match) return;
    setMatchExpiry(match.expires_at);
    setIsExpired(match.is_expired || new Date(match.expires_at) < new Date());

    const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", otherId).single();
    setOtherProfile(profile);

    // Load other person's prompts for icebreaker cards
    if (profile && Array.isArray(profile.profile_prompts)) {
      setOtherPrompts(profile.profile_prompts as ProfilePrompt[]);
    }

    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });
    setMessages(msgs || []);
    setLoading(false);

    // Subscribe to realtime
    supabase.channel(`chat-${matchId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    // Mark messages as read
    await supabase.from("messages").update({ read: true }).eq("match_id", matchId).neq("sender_id", user.id);
  };

  const send = async () => {
    if (!text.trim() || sending || isExpired) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: myUserId,
      content: text.trim(),
    });
    setText("");
    setSending(false);
    inputRef.current?.focus();
  };

  const sendIcebreaker = (msg: string) => setText(msg);

  const sendPromptIcebreaker = (prompt: ProfilePrompt) => {
    const p = getPrompt(prompt.id);
    if (!p) return;
    setText(`I saw you said "${prompt.answer}" to "${p.question}" — tell me more!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#C4A44A]/30 border-t-[#C4A44A] rounded-full animate-spin" />
      </div>
    );
  }

  // Use prompt-based icebreakers if available, otherwise fall back to generics
  const hasPrompts = otherPrompts.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-w-lg mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <Link href="/chat" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={otherProfile?.photos?.[0] || `https://api.dicebear.com/9.x/personas/svg?seed=${otherProfile?.user_id}&backgroundColor=d1fae5`}
          alt={otherProfile?.display_name}
          className="w-10 h-10 rounded-xl object-cover bg-[#FDF6E3]"
        />
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">{otherProfile?.display_name}</p>
          {!isExpired && matchExpiry && (
            <div className="flex items-center gap-1 text-xs text-[#003526]">
              <Clock className="w-3 h-3" />
              <span>{hoursLeft(matchExpiry)} remaining</span>
            </div>
          )}
          {isExpired && <p className="text-xs text-red-500 font-medium">Match expired</p>}
        </div>
      </div>

      {/* Expiry warning banner */}
      {!isExpired && matchExpiry && parseInt(hoursLeft(matchExpiry)) < 2 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 text-center font-medium">
          <Clock className="w-3.5 h-3.5 inline mr-0.5" />Hurry! Only {hoursLeft(matchExpiry)} left to keep this match alive.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && !isExpired && (
          <div className="text-center py-4">
            <MessageCircle className="w-10 h-10 text-[#C4A44A]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700 mb-1">Break the ice!</p>
            <p className="text-xs text-gray-400 mb-4">You matched with {otherProfile?.display_name}. Say something genuine.</p>

            {hasPrompts ? (
              <div className="space-y-2 text-left">
                <p className="text-xs text-gray-400 font-medium text-center mb-2">
                  Ask about their answers:
                </p>
                {otherPrompts.map((pp, idx) => {
                  const prompt = getPrompt(pp.id);
                  if (!prompt || !pp.answer) return null;
                  return (
                    <button
                      key={idx}
                      onClick={() => sendPromptIcebreaker(pp)}
                      className="w-full text-left bg-white border border-[#C4A44A]/20 rounded-xl px-4 py-3 hover:border-[#C4A44A] hover:bg-[#FDF6E3] transition"
                    >
                      <p className="text-[10px] text-gray-400 mb-0.5">{prompt.question}</p>
                      <p className="text-sm font-semibold text-gray-800">{pp.answer}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 text-left">
                <p className="text-xs text-gray-400 font-medium text-center mb-2">Try one of these:</p>
                {ICEBREAKERS.map((msg) => (
                  <button
                    key={msg}
                    onClick={() => sendIcebreaker(msg)}
                    className="w-full text-left text-sm bg-white border border-[#C4A44A]/20 rounded-xl px-4 py-3 text-gray-700 hover:border-[#C4A44A] hover:bg-[#FDF6E3] transition"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {isExpired && messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">This match expired before a message was sent.</p>
            <Link href="/pricing" className="text-sm text-[#003526] underline mt-2 inline-block">
              Upgrade to recover it →
            </Link>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === myUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isExpired ? (
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something real..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C4A44A]/30 transition"
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-11 h-11 bg-[#003526] rounded-2xl flex items-center justify-center shadow-md disabled:opacity-40 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 bg-white border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 mb-2">This match has expired.</p>
          <Link href="/pricing" className="text-sm font-semibold text-[#003526]">
            Upgrade to recover this match →
          </Link>
        </div>
      )}
    </div>
  );
}
