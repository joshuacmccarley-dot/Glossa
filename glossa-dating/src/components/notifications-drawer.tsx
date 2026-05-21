"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string | null;
  action_url: string | null;
  read: boolean;
  created_at: string;
}

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

function kindIcon(kind: string): string {
  switch (kind) {
    case "match": return "💚";
    case "match_expiring": return "⏱️";
    case "liked_you": return "❤️";
    case "help_response": return "🤝";
    case "event_rsvp": return "🎉";
    default: return "🔔";
  }
}

function kindBg(kind: string): string {
  switch (kind) {
    case "match": return "bg-emerald-50 border-emerald-100";
    case "match_expiring": return "bg-amber-50 border-amber-100";
    case "liked_you": return "bg-rose-50 border-rose-100";
    case "help_response": return "bg-blue-50 border-blue-100";
    case "event_rsvp": return "bg-amber-50 border-amber-100";
    default: return "bg-gray-50 border-gray-100";
  }
}

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      setNotifications((data ?? []) as Notification[]);

      // Mark all as read
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      setLoading(false);
    };

    load();
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">Notifications</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <span className="text-4xl mb-3">💚</span>
              <p className="font-semibold text-gray-700">You&apos;re all caught up</p>
              <p className="text-sm text-gray-400 mt-1">No new notifications</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {notifications.map((n) => {
                const content = (
                  <div className={`flex gap-3 items-start px-5 py-4 ${!n.read ? "bg-gray-50" : ""}`}>
                    <span className="text-xl flex-shrink-0 mt-0.5">{kindIcon(n.kind)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">{formatTimeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );

                return (
                  <li key={n.id} className={`${kindBg(n.kind)} border-l-4`}>
                    {n.action_url ? (
                      <Link href={n.action_url} onClick={onClose}>
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
