import Link from "next/link";
import { Heart, Zap, Clock, RefreshCw, Star, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight">sinc&apos;d</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
              Log in
            </Link>
            <Link href="/auth/register" className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-2 rounded-full shadow-md shadow-emerald-100 hover:shadow-lg transition">
              Join free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-20 px-4 text-center bg-gradient-to-b from-emerald-50/80 to-white">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5" />
            Built to get you off the app — and into real life
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-6">
            Connect with people{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              who get you
            </span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-xl mx-auto">
            sinc&apos;d matches you by hobbies, work, and what you&apos;re actually looking for. Browse real profiles, connect intentionally. No swiping. No algorithms designed to keep you scrolling.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl shadow-emerald-200 hover:shadow-2xl hover:shadow-emerald-300 transition-all"
            >
              <Heart className="w-5 h-5 fill-white" />
              Find your sinc
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 text-lg font-semibold px-8 py-4 rounded-full hover:border-emerald-200 hover:text-emerald-700 transition"
            >
              How it works <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-5 text-sm text-gray-400">Free to join · $5/month for full access · No credit card required to start</p>
        </div>
      </section>

      {/* Sample profiles */}
      <section className="py-12 px-4 bg-gradient-to-br from-emerald-50 to-teal-50/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">People on sinc&apos;d right now</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Jordan, 27", work: "Software Engineer", interests: ["🎸 Music", "🥾 Hiking"], compat: 94, seed: "alex", intent: "💍 Serious" },
              { name: "Mia, 24", work: "Nurse", interests: ["📸 Photography", "☕ Coffee"], compat: 87, seed: "mia", intent: "🤝 Friends first" },
              { name: "Sam, 29", work: "Designer", interests: ["🎮 Gaming", "🍕 Cooking"], compat: 79, seed: "sam", intent: "✨ Casual" },
              { name: "Riley, 26", work: "Teacher", interests: ["🌍 Travel", "📖 Reading"], compat: 91, seed: "riley", intent: "💍 Serious" },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100">
                <div className="relative" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={`https://api.dicebear.com/9.x/personas/svg?seed=${p.seed}&backgroundColor=d1fae5,99f6e4,ccfbf1`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <div className="absolute top-2 left-2 bg-emerald-500 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                    ✦ {p.compat}%
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm">{p.name}</p>
                    <p className="text-white/70 text-[10px]">{p.work}</p>
                    <p className="text-emerald-300 text-[10px] mt-0.5">{p.intent}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.interests.map((i) => (
                        <span key={i} className="text-white/80 text-[9px] bg-white/15 rounded-full px-1.5 py-0.5">{i}</span>
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
      <section id="how" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-3">How sinc&apos;d works</h2>
          <p className="text-center text-gray-500 mb-14 max-w-lg mx-auto">Designed for people who want real relationships, not an endless game.</p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: "🎯",
                title: "Tell us who you really are",
                desc: "Your hobbies, occupation, relationship goal — casual, serious, friendship-first, or marriage-minded. Your profile reflects your actual life, not a highlight reel.",
              },
              {
                icon: "👁️",
                title: "Browse, don't swipe",
                desc: "See profiles sorted by how well you match on interests. Tap someone you genuinely like the look of. One intentional tap beats 200 mindless swipes.",
              },
              {
                icon: "⏱️",
                title: "12 hours to say something real",
                desc: "When it's mutual, you both get 12 hours to open up. It creates energy. It filters out ghosts. Premium members can recover expired matches.",
              },
            ].map((s) => (
              <div key={s.title} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12-hour rule highlight */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-10 text-center text-white shadow-2xl shadow-emerald-100 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 20%, white 0%, transparent 50%)" }} />
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-black mb-4">The 12-Hour Rule</h2>
            <p className="text-white/85 text-lg leading-relaxed mb-6">
              When you match, a 12-hour clock starts. One of you needs to break the ice before it closes. It creates momentum. It eliminates ghost matches. It means every conversation you have is with someone who actually wanted to talk.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-2xl px-5 py-3 text-sm font-semibold">
              <RefreshCw className="w-4 h-4" />
              Premium: recover any expired match, any time
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50/80">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Built different</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: <Heart className="w-5 h-5 text-emerald-500" />, title: "No swiping", desc: "Browse profiles intentionally. See who they are before you decide." },
              { icon: <Clock className="w-5 h-5 text-teal-500" />, title: "12-hour connection window", desc: "Eliminates ghost matches. Every conversation starts with energy." },
              { icon: <RefreshCw className="w-5 h-5 text-emerald-600" />, title: "Match recovery (Premium)", desc: "Life gets in the way. Never lose a connection you actually wanted." },
              { icon: <Star className="w-5 h-5 text-amber-500" />, title: "See who liked you", desc: "Know who's interested. Start conversations from a place of confidence." },
              { icon: <Shield className="w-5 h-5 text-emerald-500" />, title: "No dark patterns", desc: "We don't hide features or throttle your reach to sell upgrades." },
              { icon: <Zap className="w-5 h-5 text-teal-500" />, title: "Interest-scored matching", desc: "Ranked by real shared passions — not by who paid for a boost." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-0.5">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price CTA */}
      <section className="py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-3">$5 a month. That&apos;s it.</h2>
          <p className="text-gray-500 mb-8 text-base leading-relaxed">
            Tinder charges $32/month. Hinge charges $36/month. They add tiers and features deliberately to extract more money. sinc&apos;d has one plan, one price. $5 for everything, forever.
          </p>
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 to-teal-300 rounded-3xl blur-2xl opacity-40 scale-95" />
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-8 text-white shadow-xl">
              <div className="text-6xl font-black mb-1">$5</div>
              <div className="text-white/70 mb-7">per month · cancel any time</div>
              <ul className="text-sm space-y-2.5 text-left mb-8">
                {[
                  "Unlimited connection requests",
                  "See who liked you",
                  "Recover expired matches",
                  "Advanced filters",
                  "Read receipts",
                  "Monthly profile boost",
                  "Zero ads",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-300">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="block w-full text-center bg-white text-emerald-700 font-bold py-4 rounded-2xl hover:bg-emerald-50 transition shadow-md text-base"
              >
                Join sinc&apos;d free →
              </Link>
            </div>
          </div>
          <p className="text-sm text-gray-400">Free accounts can browse and send 10 connection requests per day.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-black text-gray-900">sinc&apos;d</span>
        </div>
        <p className="mb-4">Real connections, real fast.</p>
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
