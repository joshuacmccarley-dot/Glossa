"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, MessageCircle, Calendar, HandHeart, Zap, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { NotificationsDrawer } from "@/components/notifications-drawer";
import type { RealtimeChannel } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/discover",  icon: Search,       label: "Discover" },
  { href: "/matches",   icon: Heart,        label: "Matches"  },
  { href: "/events",    icon: Calendar,     label: "Events"   },
  { href: "/help",      icon: HandHeart,    label: "Help"     },
  { href: "/chat",      icon: MessageCircle,label: "Chat"     },
];

export function AppNavbar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch initial unread count
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnreadCount(count ?? 0);

      // Subscribe to new notifications in real-time
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      <NotificationsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">sinc&apos;d</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              onClick={handleOpenDrawer}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <Link href="/pricing" className="text-[11px] font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-3 py-1.5 rounded-full shadow-sm">
              $5/mo Premium
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 safe-area-bottom">
        <div className="max-w-lg mx-auto flex">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors min-w-0",
                  active ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon
                  className={cn("w-5 h-5", active ? "stroke-emerald-600" : "")}
                  strokeWidth={active ? 2.5 : 1.8}
                  fill={active ? "rgb(209 250 229)" : "none"}
                />
                <span className="text-[9px] font-semibold tracking-tight truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
