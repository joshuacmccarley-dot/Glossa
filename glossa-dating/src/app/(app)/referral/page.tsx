"use client";
import { useState, useEffect } from "react";
import { Gift, Copy, Share2, Users, CheckCircle } from "lucide-react";

interface ReferralData {
  code: string;
  uses: number;
  link: string;
}

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ rewarded: boolean; referrerName?: string; reason?: string } | null>(null);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const copyLink = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback: ignore */ }
  };

  const share = async () => {
    if (!data) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on sinc'd",
          text: "Come join sinc'd — we'll both get 30 days of Premium free!",
          url: data.link,
        });
      } catch { /* dismissed */ }
    } else {
      copyLink();
    }
  };

  const claimReward = async () => {
    setClaiming(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });
      const json = await res.json();
      setClaimResult(json);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#003526] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#003526]/20">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Get 30 days free</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Invite a friend to sinc&apos;d. When they join, you both get 30 days of Premium free.
        </p>
      </div>

      {/* Stats */}
      {data && (
        <div className="bg-[#003526]/5 border border-[#003526]/10 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <Users className="w-5 h-5 text-[#003526] flex-shrink-0" />
          <div>
            <p className="font-bold text-[#003526] text-sm">
              {data.uses} {data.uses === 1 ? "person has" : "people have"} used your code
            </p>
            <p className="text-xs text-[#003526]/70">Every referral earns you both 30 days free</p>
          </div>
        </div>
      )}

      {/* Referral link card */}
      {data && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your referral link</p>
          <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2 overflow-hidden">
            <p className="text-sm text-gray-700 font-mono truncate flex-1">{data.link}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 bg-[#003526] hover:bg-[#004535] active:bg-[#002518] text-white py-3 rounded-2xl font-semibold text-sm transition"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy link
                </>
              )}
            </button>
            <button
              onClick={share}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">How it works</p>
        <ol className="space-y-3">
          {[
            { step: "1", text: "Share your link with a friend" },
            { step: "2", text: "They sign up using your link" },
            { step: "3", text: "You both get 30 days of Premium free" },
          ].map((item) => (
            <li key={item.step} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#C4A44A]/20 text-[#003526] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {item.step}
              </div>
              <p className="text-sm text-gray-600">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Claim reward section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <p className="font-semibold text-gray-900 text-sm mb-1">Were you referred by someone?</p>
        <p className="text-xs text-gray-400 mb-4">If a friend invited you to sinc&apos;d, claim your reward here.</p>

        {claimResult ? (
          claimResult.rewarded ? (
            <div className="bg-[#003526]/5 border border-[#003526]/10 rounded-2xl px-4 py-4 text-center">
              <Gift className="w-6 h-6 text-[#C4A44A] mx-auto mb-2" />
              <p className="font-bold text-[#003526] text-sm">
                Reward claimed! You and {claimResult.referrerName} both got 30 days free.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-center">
              <p className="text-sm text-gray-500">
                {claimResult.reason === "Already claimed"
                  ? "You&apos;ve already claimed your referral reward."
                  : "No referral found for your account."}
              </p>
            </div>
          )
        ) : (
          <button
            onClick={claimReward}
            disabled={claiming}
            className="w-full py-3 border-2 border-[#003526]/30 text-[#003526] rounded-2xl font-semibold text-sm hover:bg-[#003526]/5 transition disabled:opacity-50"
          >
            {claiming ? "Checking..." : "Claim my referral reward"}
          </button>
        )}
      </div>
    </div>
  );
}
