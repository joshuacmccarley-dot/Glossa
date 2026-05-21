"use client";
import { useState } from "react";
import { Crown, Check, RefreshCw, Heart, Star, Clock, Zap } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [success] = useState(
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "1"
  );

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
          <Crown className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Welcome to Premium</h1>
        <p className="text-gray-500 mb-8">You now have full access to everything sinc&apos;d has to offer. Go find your person.</p>
        <Link href="/discover" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-emerald-200">
          <Heart className="w-5 h-5 fill-white" /> Back to discovering
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">sinc&apos;d Premium</h1>
        <p className="text-gray-500 text-base">
          One price. Everything included. No games.
        </p>
      </div>

      {/* Price card */}
      <div className="relative mb-8">
        {/* Emerald glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl blur-xl opacity-30 scale-95" />
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-7 text-white shadow-2xl">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-6xl font-black">$5</span>
            <span className="text-white/70 text-lg">/month</span>
          </div>
          <p className="text-white/70 text-sm mb-7">Cancel any time — no questions asked.</p>

          <div className="space-y-3 mb-8">
            {[
              { icon: <Heart className="w-4 h-4" />, text: "Unlimited likes" },
              { icon: <Star className="w-4 h-4" />, text: "See exactly who liked you" },
              { icon: <RefreshCw className="w-4 h-4" />, text: "Recover any expired match" },
              { icon: <Zap className="w-4 h-4" />, text: "Filter by interests & relationship goals" },
              { icon: <Clock className="w-4 h-4" />, text: "Read receipts in chat" },
              { icon: <Crown className="w-4 h-4" />, text: "Monthly profile boost" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-white/90 font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-white text-emerald-700 font-bold py-4 rounded-2xl text-base hover:bg-emerald-50 transition shadow-lg disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? "Loading..." : "Get Premium for $5/month"}
          </button>
          <p className="text-center text-white/50 text-xs mt-3">Secure checkout via Stripe</p>
        </div>
      </div>

      {/* Why $5 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="font-bold text-gray-900 mb-3">Why only $5?</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Tinder and Hinge charge $30–$36/month and deliberately hide features to push you to upgrade. We think that&apos;s predatory. sinc&apos;d is built to get you into real conversations quickly — not to keep you swiping forever. $5 covers our costs and keeps the lights on. That&apos;s it.
        </p>
      </div>

      {/* Free tier — no pressure */}
      <div className="bg-gray-50 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">What&apos;s free</h3>
        <div className="space-y-2">
          {[
            "Browse all profiles",
            "10 connection requests per day",
            "Chat in active matches",
            "Full interest-based matching",
            "Complete profile with intentions + interests",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> {f}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Free is genuinely useful. Premium just removes the 10/day limit and unlocks recovery.</p>
      </div>
    </div>
  );
}
