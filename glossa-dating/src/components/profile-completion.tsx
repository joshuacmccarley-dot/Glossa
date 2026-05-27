"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const SESSION_KEY = "sincd_profile_prompt_dismissed";

interface ProfileData {
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
  location: string | null;
}

interface CompletionItem {
  done: boolean;
  cta: string;
  benefit: string;
}

function calcCompletion(p: ProfileData): { pct: number; items: CompletionItem[] } {
  const items: CompletionItem[] = [
    {
      done: !!p.avatar_url,
      cta: "Add a photo",
      benefit: "10× more connections",
    },
    {
      done: !!p.bio && p.bio.length > 20,
      cta: "Write a bio",
      benefit: "5× more connections",
    },
    {
      done: (p.interests?.length ?? 0) >= 3,
      cta: "Add 3+ interests",
      benefit: "3× better matches",
    },
    {
      done: !!p.location,
      cta: "Set your location",
      benefit: "find nearby people",
    },
  ];
  const pts = items.filter((i) => i.done).length * 25;
  return { pct: pts, items };
}

export function ProfileCompletion() {
  const [pct, setPct] = useState<number | null>(null);
  const [firstMissing, setFirstMissing] = useState<{ cta: string; benefit: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      setDismissed(true);
      return;
    }

    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, bio, interests, location")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) return;

      const { pct: p, items } = calcCompletion(data as ProfileData);
      setPct(p);
      const missing = items.find((i) => !i.done);
      setFirstMissing(missing ?? null);
    };

    load();
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  if (dismissed || pct === null || pct >= 100 || !firstMissing) return null;

  return (
    <div className="relative flex items-start gap-3 bg-white rounded-2xl shadow-sm border-l-4 border-l-[#C4A44A] border border-gray-100 px-4 py-3 mb-4">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm">
          Your profile is {pct}% complete
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          <Link href="/profile" className="text-[#003526] font-semibold hover:underline">
            {firstMissing.cta}
          </Link>
          {" "}&rarr; {firstMissing.benefit}
        </p>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#003526] to-[#C4A44A] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <button
        onClick={dismiss}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5 text-gray-400" />
      </button>
    </div>
  );
}
