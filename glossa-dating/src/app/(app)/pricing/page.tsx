"use client";
import { useState } from "react";
import { Crown, Check, RefreshCw, Heart, Star, Clock, Zap, Shield } from "lucide-react";
import Link from "next/link";

const FEATURES_FREE = [
  "10 likes per day",
  "Basic interest matching",
  "View your matches",
  "Chat with matches (12-hour window)",
];

const FEATURES_PREMIUM = [
  { icon: <Heart className="w-4 h-4 text-emerald-500" />, text: "Unlimited likes" },
  { icon: <Star className="w-4 h-4 text-emerald-500" />, text: "See who liked you — no guessing" },
  { icon: <RefreshCw className="w-4 h-4 text-emerald-500" />, text: "Recover any expired match" },
  { icon: <Zap className="w-4 h-4 text-emerald-500" />, text: "Advanced interest & intention filters" },
  { icon: <Clock className="w-4 h-4 text-emerald-500" />, text: "Read receipts in chat" },
  { icon: <Crown className="w-4 h-4 text-emerald-500" />, text: "1x profile boost per month" },
  { icon: <Shield className="w-4 h-4 text-emerald-500" />, text: "No ads, ever" },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // Stripe Checkout — set up with your price ID
    const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full mb-4">
          <Crown className="w-3.5 h-3.5" />
          sinc&apos;d Premium
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Everything, for $5</h1>
        <p className="text-gray-500">
          Tinder Gold: $32/mo. Hinge Preferred: $36/mo. sinc&apos;d: <strong className="text-gray-900">$5/mo</strong>. Same features. No tricks.
        </p>
      </div>

      {/* Pricing card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-1 shadow-2xl shadow-emerald-200 mb-6">
        <div className="bg-white rounded-[22px] p-6">
          <div className="flex items-end gap-1 mb-1">
            <span className="text-5xl font-black text-gray-900">$5</span>
            <span className="text-gray-400 mb-2">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Cancel any time. No questions asked.</p>

          <div className="space-y-3 mb-8">
            {FEATURES_PREMIUM.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm text-gray-700 font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-4 rounded-2xl hover:from-emerald-700 hover:to-teal-600 transition shadow-lg disabled:opacity-60"
          >
            {loading ? "Loading..." : "Get sinc'd Premium →"}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Secure payment via Stripe</p>
        </div>
      </div>

      {/* Free vs Premium */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4 text-sm">Free vs Premium</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="font-semibold text-gray-700 mb-2">Free</p>
            {FEATURES_FREE.map((f) => (
              <div key={f} className="flex items-center gap-2 py-1 text-gray-500">
                <Check className="w-3.5 h-3.5 text-gray-400" />
                {f}
              </div>
            ))}
          </div>
          <div>
            <p className="font-semibold text-emerald-700 mb-2">Premium ✦</p>
            {FEATURES_PREMIUM.slice(0, 4).map((f) => (
              <div key={f.text} className="flex items-center gap-2 py-1 text-emerald-700">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                {f.text.split(" — ")[0]}
              </div>
            ))}
            <p className="text-xs text-emerald-600 mt-1">+ 3 more</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        Questions?{" "}
        <Link href="/contact" className="text-emerald-600 underline">Contact us</Link>
      </p>
    </div>
  );
}
