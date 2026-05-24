import Link from "next/link";
import { ArrowRight } from "lucide-react";

const MODES = [
  {
    emoji: "💚",
    label: "Dating",
    desc: "Find someone who just gets it. Matched by interests, intentions, and compatibility — not algorithms.",
    color: "from-rose-50 to-pink-50",
    badge: "bg-rose-100 text-rose-700",
    examples: ["Long-term / marriage", "Casual dating", "Friends first", "Open to anything"],
  },
  {
    emoji: "🎉",
    label: "Events",
    desc: "Create or discover local events. Find people already going to the same concerts, hikes, or hangouts.",
    color: "from-amber-50 to-yellow-50",
    badge: "bg-amber-100 text-amber-700",
    examples: ["Weekend hikes", "Open mic nights", "Cooking classes", "Volunteering days"],
  },
  {
    emoji: "🤝",
    label: "Lend a Hand",
    desc: "Offer a skill. Ask for help. Swap favors with neighbors. Community built on genuine generosity.",
    color: "from-blue-50 to-cyan-50",
    badge: "bg-blue-100 text-blue-700",
    examples: ["Moving help", "Language exchange", "Tech support", "A listening ear"],
  },
  {
    emoji: "🌱",
    label: "Community",
    desc: "Friends, mentors, accountability partners, neighbours. Build your people — no pressure, no agenda.",
    color: "from-emerald-50 to-teal-50",
    badge: "bg-emerald-100 text-emerald-700",
    examples: ["Local friends", "Fitness buddies", "Mentorship", "Interest groups"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#003526] border-b border-[#004535]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.svg" alt="sinc'd" className="w-8 h-10 object-contain" />
            <span className="font-black text-xl text-white tracking-tight">sinc&apos;d</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-white/70 hover:text-white transition">Log in</Link>
            <Link href="/auth/register" className="text-sm font-bold bg-[#C4A44A] hover:bg-[#D4BA70] text-[#003526] px-4 py-2 rounded-full shadow-md transition">
              Join free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-b from-[#003526] to-[#004535]">
        <div className="max-w-3xl mx-auto text-center">
          <img src="/logo.svg" alt="sinc'd" className="w-40 mx-auto mb-8" />
          <div className="inline-flex items-center gap-2 bg-white/10 text-[#C4A44A] text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-sm border border-[#C4A44A]/30">
            Connecting everyone, without the questioning
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
            Feel connected<br />
            <span className="text-[#C4A44A]">
              without questioning
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-xl mx-auto mb-4 leading-relaxed">
            sinc&apos;d isn&apos;t just a dating app. It&apos;s how your community connects — for romance, events, lending a hand, or simply finding your people.
          </p>
          <p className="text-base text-white/50 mb-10">
            One app. Four ways to connect. One flat price — <strong className="text-white/80">$5/month</strong> for everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-[#C4A44A] hover:bg-[#D4BA70] text-[#003526] text-lg font-black px-8 py-4 rounded-full shadow-xl transition-all active:scale-[0.98]"
            >
              Get sinc&apos;d — it&apos;s free
            </Link>
            <Link
              href="#modes"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white text-lg font-semibold px-8 py-4 rounded-full hover:border-white/60 hover:text-white transition"
            >
              See how it works <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-white/40">No credit card to join. No algorithms hiding your matches.</p>
        </div>
      </section>

      {/* Slogan callout */}
      <section className="py-10 px-4 bg-gradient-to-r from-emerald-600 to-teal-500">
        <div className="max-w-2xl mx-auto text-center text-white">
          <p className="text-2xl md:text-3xl font-black leading-snug">
            &ldquo;sinc&apos;d — feel connected without questioning&rdquo;
          </p>
          <p className="text-white/70 mt-2 text-base">
            No interrogation. No endless profiles. Just real connection across every part of life.
          </p>
        </div>
      </section>

      {/* 4 Modes */}
      <section id="modes" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-3">
            One app. Four ways to connect.
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            sinc&apos;d adapts to what you need right now — not just what a dating app thinks you need.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {MODES.map((m) => (
              <div key={m.label} className={`rounded-3xl bg-gradient-to-br ${m.color} p-6 border border-white shadow-sm`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{m.emoji}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${m.badge}`}>{m.label}</span>
                </div>
                <p className="text-gray-700 text-base mb-4 leading-relaxed">{m.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {m.examples.map((ex) => (
                    <span key={ex} className="text-xs bg-white/70 text-gray-600 rounded-full px-3 py-1 font-medium">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Distance & filters feature */}
      <section className="py-16 px-4 bg-gray-50/80">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-3xl mb-3">📍</div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">Your neighborhood or the whole world</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Filter by distance — 5 miles, 25, 50, 100, or Anywhere. Sort closest to furthest or furthest to closest. Meet the neighbor next door, or the person across the country you just have to talk to.
              </p>
              <ul className="space-y-2 text-sm">
                {["5 mi · 25 mi · 50 mi · 100 mi · Anywhere", "Closest first or furthest first", "Works for Dating, Events, and Lend a Hand", "Location is never shared publicly"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-600">
                    <span className="text-emerald-500">✦</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
              <div className="flex gap-2 mb-3">
                {["5 mi", "25 mi", "50 mi", "100 mi", "Anywhere"].map((d, i) => (
                  <div key={d} className={`flex-1 text-center text-xs py-2 rounded-xl font-semibold transition ${i === 1 ? "bg-emerald-500 text-white shadow" : "bg-gray-100 text-gray-500"}`}>
                    {d}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 text-center bg-emerald-50 border-2 border-emerald-400 rounded-xl py-2.5 text-sm font-bold text-emerald-700">↑ Closest first</div>
                <div className="flex-1 text-center bg-gray-50 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-500">↓ Furthest first</div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">Tap any filter — it updates instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12-hour rule */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-10 text-center text-white shadow-2xl shadow-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
            <div className="text-4xl mb-3">⏱️</div>
            <h2 className="text-2xl font-black mb-3">The 12-Hour Rule</h2>
            <p className="text-white/85 leading-relaxed mb-5">
              When two people connect, a 12-hour window opens. Say something real before it closes. No more ghost matches. No more conversations that go nowhere for weeks.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-2xl px-5 py-3 text-sm font-semibold">
              🔄 Premium: recover any expired match, any time
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="py-16 px-4 bg-emerald-50/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Built to make the world warmer</h2>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto">
            Every feature in sinc&apos;d was built with one question: does this create real, positive human connection?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🚫", label: "No swiping", sub: "Browse intentionally" },
              { icon: "🎯", label: "Interest-matched", sub: "Not just photos" },
              { icon: "🏘️", label: "Community-first", sub: "Beyond dating" },
              { icon: "💚", label: "No dark patterns", sub: "Honest pricing" },
            ].map((v) => (
              <div key={v.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                <div className="text-2xl mb-1.5">{v.icon}</div>
                <p className="font-bold text-gray-900 text-sm">{v.label}</p>
                <p className="text-gray-400 text-xs">{v.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-3">$5 a month. All of it.</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
            Every mode. Every filter. Match recovery. Who liked you. No tier system. Just $5, flat.
          </p>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 to-teal-300 rounded-3xl blur-xl opacity-40 scale-95" />
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-8 text-white shadow-xl">
              <div className="text-6xl font-black mb-1">$5</div>
              <div className="text-white/70 mb-7">per month · cancel any time</div>
              <ul className="text-sm space-y-2.5 text-left mb-8">
                {[
                  "All 4 connection modes",
                  "Unlimited connection requests",
                  "See who liked you",
                  "12-hour match recovery",
                  "Distance filters & sorting",
                  "Read receipts",
                  "Monthly profile boost",
                  "Zero ads",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-300">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="block w-full text-center bg-white text-emerald-700 font-bold py-4 rounded-2xl hover:bg-emerald-50 transition shadow-md text-base">
                Join sinc&apos;d free →
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-400">Free accounts get full browsing and 10 connections/day.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo-mark.svg" alt="sinc'd" className="w-5 h-6 object-contain" />
          <span className="font-black text-gray-900">sinc&apos;d</span>
        </div>
        <p className="mb-4 text-gray-500 text-xs font-medium italic">&ldquo;Feel connected without questioning&rdquo;</p>
        <div className="flex justify-center gap-6 text-xs">
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          <Link href="/safety" className="hover:text-gray-600">Safety</Link>
          <Link href="/contact" className="hover:text-gray-600">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
