"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, MessageCircle, Calendar, HandHeart, Bell } from "lucide-react";
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
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#003526] border-b border-[#004535]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2.5">
            <Image src="/logo-mark.svg" alt="sinc'd" width={32} height={40} className="object-contain" unoptimized />
            <span className="font-black text-white text-lg tracking-tight [font-family:var(--font-playfair)]">sinc&apos;d</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              onClick={handleOpenDrawer}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition"
            >
              <Bell className="w-5 h-5 text-white/80" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-[#C4A44A] text-[#003526] text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <Link href="/pricing" className="text-[11px] font-bold bg-[#C4A44A] hover:bg-[#D4BA70] text-[#003526] px-3 py-1.5 rounded-full shadow-sm transition">
              $5/mo Premium
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#003526] border-t border-[#004535] safe-area-bottom">
        <div className="max-w-lg mx-auto flex">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors min-w-0",
                  active ? "text-[#C4A44A]" : "text-white/50 hover:text-white/80"
                )}
              >
                <Icon
                  className={cn("w-5 h-5", active ? "stroke-[#C4A44A]" : "")}
                  strokeWidth={active ? 2.5 : 1.8}
                  fill={active ? "rgba(196,164,74,0.15)" : "none"}
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
