import Link from "next/link";
import { Heart, Zap, Clock, RefreshCw, Star, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight">sinc&apos;d</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Log in
            </Link>
            <Link href="/auth/register" className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-2 rounded-full shadow hover:shadow-md transition">
              Join free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            No swipe fatigue. Real connections.
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Match on what{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              actually matters
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 leading-relaxed">
            sinc&apos;d connects you with people who share your passions — hobbies, lifestyle, and what you&apos;re truly looking for.
          </p>
          <p className="text-base text-gray-500 mb-10">
            One simple plan. <span className="font-semibold text-gray-800">$5/month</span> for everything. No hidden paywalls, no tricks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl shadow-emerald-200 hover:shadow-2xl hover:shadow-emerald-300 transition-all"
            >
              <Heart className="w-5 h-5 fill-white" />
              Start for free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 text-lg font-semibold px-8 py-4 rounded-full hover:border-gray-300 transition"
            >
              See pricing →
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">Free to join. No credit card required.</p>
        </div>
      </section>

      {/* Preview cards */}
      <section className="py-12 px-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Jordan, 27", interests: ["🎸 Music", "🥾 Hiking"], compat: 94, img: "alex" },
              { name: "Mia, 24", interests: ["📸 Photography", "☕ Coffee"], compat: 87, img: "mia" },
              { name: "Sam, 29", interests: ["🎮 Gaming", "🍕 Food"], compat: 79, img: "sam" },
              { name: "Riley, 26", interests: ["🌍 Travel", "📖 Reading"], compat: 91, img: "riley" },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl overflow-hidden shadow-lg bg-white">
                <div className="relative" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={`https://api.dicebear.com/9.x/personas/svg?seed=${p.img}&backgroundColor=d1fae5,99f6e4,ccfbf1`}
                    alt={p.name}
                    className="w-full h-full object-cover bg-emerald-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-bold text-emerald-600">
                    ✦ {p.compat}%
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm">{p.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.interests.map((i) => (
                        <span key={i} className="text-white/80 text-[10px] bg-white/20 rounded-full px-2 py-0.5">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-4">How sinc&apos;d works</h2>
          <p className="text-center text-gray-500 mb-12">Built for real conversations, not endless swiping</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎯", title: "Build your true self", desc: "Pick your hobbies, share your work, and tell us what you're actually looking for — casual, serious, friendship-first, or marriage-minded." },
              { icon: "⚡", title: "Get sinc'd", desc: "Our algorithm surfaces people with real shared passions and compatible intentions, not just attractive photos." },
              { icon: "⏱️", title: "12 hours to connect", desc: "When you match, you have 12 hours to say something real. It creates urgency. Premium users can recover expired matches." },
            ].map((s) => (
              <div key={s.title} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12-hour mechanic highlight */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-teal-500">
        <div className="max-w-2xl mx-auto text-center text-white">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-black mb-4">The 12-Hour Rule</h2>
          <p className="text-white/90 text-lg leading-relaxed mb-6">
            Every match comes with a 12-hour countdown. Send a message before time runs out — or the match expires. No more ghosting. No more dead-end conversations sitting for weeks.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-5 py-3 text-sm font-semibold">
            <RefreshCw className="w-4 h-4" />
            Premium members can recover any expired match, any time
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Everything you need</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Heart className="w-5 h-5 text-emerald-500" />, title: "Interest-based matching", desc: "Matched by real shared hobbies and passions — not algorithms that optimize for screen time." },
              { icon: <Clock className="w-5 h-5 text-teal-500" />, title: "12-hour match timer", desc: "Creates real urgency. Conversations start fresh and energetic, not stale after weeks of silence." },
              { icon: <RefreshCw className="w-5 h-5 text-amber-500" />, title: "Match recovery (Premium)", desc: "Life gets busy. Premium members can revive any expired match — no connection lost forever." },
              { icon: <Star className="w-5 h-5 text-yellow-500" />, title: "See who liked you", desc: "Cut straight to the connections. Know instantly who's already interested in you." },
              { icon: <Shield className="w-5 h-5 text-green-500" />, title: "Safe & verified", desc: "Photo verification, block & report tools, and privacy controls built in from day one." },
              { icon: <Zap className="w-5 h-5 text-cyan-500" />, title: "No algorithm tricks", desc: "We don't hide matches to push upgrades. $5/month means full access, full transparency." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-3">Just $5 a month</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Everything included. No tiers. No tricks. Tinder charges $30+/month for the same features we give everyone.
          </p>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-200 mb-6">
            <div className="text-6xl font-black mb-1">$5</div>
            <div className="text-white/80 mb-6">per month · cancel anytime</div>
            <ul className="text-sm space-y-2 text-left mb-8">
              {[
                "Unlimited likes",
                "See who liked you",
                "12-hour match recovery",
                "Advanced interest filters",
                "Read receipts in chat",
                "Profile boost (1x/month)",
                "No ads, ever",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-emerald-200">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="block w-full text-center bg-white text-emerald-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition shadow"
            >
              Start free, upgrade anytime
            </Link>
          </div>
          <p className="text-sm text-gray-400">Free accounts get 10 likes/day and basic matching.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4 text-center text-gray-400 text-sm">
        <p className="font-black text-gray-900 text-lg mb-2">sinc&apos;d</p>
        <p>Real connections, real fast.</p>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          <Link href="/safety" className="hover:text-gray-600">Safety</Link>
          <Link href="/contact" className="hover:text-gray-600">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
