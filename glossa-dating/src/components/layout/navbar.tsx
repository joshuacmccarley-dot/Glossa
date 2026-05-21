"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, Search, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/discover", icon: Search, label: "Discover" },
  { href: "/matches", icon: Heart, label: "Matches" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function AppNavbar() {
  const pathname = usePathname();
  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">sinc&apos;d</span>
          </Link>
          <Link href="/pricing" className="text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-3 py-1.5 rounded-full shadow">
            $5/mo Premium
          </Link>
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
                  "flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors",
                  active ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon
                  className={cn("w-5 h-5", active && "stroke-emerald-600")}
                  strokeWidth={active ? 2.5 : 2}
                  fill={active ? "rgb(209 250 229)" : "none"}
                />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
