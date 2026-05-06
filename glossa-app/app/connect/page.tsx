import Link from "next/link";

const useCases = [
  {
    icon: "📧",
    title: "Email & Messaging",
    description: "Read incoming messages in your language instantly. Glossa overlays translations inline — you see the original, the translation, and a natural reply suggestion. No copy-paste, no switching tabs.",
  },
  {
    icon: "📹",
    title: "Video Calls & Meetings",
    description: "Real-time subtitles in your language on any video call. Follow every word of a Zoom, Teams, or Google Meet call in a second language — and speak with AI-assisted phrasing support.",
  },
  {
    icon: "📄",
    title: "Documents & Contracts",
    description: "Upload any document — contract, manual, report — and read it in your language with the original text side by side. Never sign something you don't fully understand again.",
  },
  {
    icon: "🌐",
    title: "Web Browsing",
    description: "Browse foreign-language websites as if they were written in your language. Hover over any text for instant translation with cultural context notes.",
  },
  {
    icon: "💬",
    title: "Live Chat & Support",
    description: "Communicate with international customer support, suppliers, or partners in real time. Glossa translates both sides of the conversation as it happens.",
  },
  {
    icon: "📱",
    title: "Social Media",
    description: "Follow global conversations, engage with international communities, and post content in multiple languages — Glossa handles the translation while you focus on the message.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Receive a Message",
    description: "A message, email, or document arrives in a foreign language.",
  },
  {
    step: "02",
    title: "Glossa Translates Instantly",
    description: "The translation appears inline — original text visible, translation beneath. Context preserved.",
  },
  {
    step: "03",
    title: "Respond Naturally",
    description: "Type your reply in your language. Glossa converts it into natural, culturally appropriate phrasing in the target language.",
  },
  {
    step: "04",
    title: "Learn From the Exchange",
    description: "Every conversation feeds your learning queue. New phrases surface in your next Glossa session — so every real interaction builds fluency.",
  },
];

export default function ConnectPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-orange text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 text-9xl">🌐</div>
          <div className="absolute bottom-10 left-10 text-7xl">✦</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6 bg-white text-orange">
              Connect
            </div>
            <h1 className="font-display font-extrabold text-5xl md:text-6xl leading-tight mb-6">
              The Language Barrier Ends{" "}
              <span className="text-navy">Right Here</span>
            </h1>
            <p className="text-white/85 text-lg leading-relaxed mb-10 max-w-2xl">
              Glossa&apos;s translation networking layer sits on top of your existing tools — email, video calls, documents, messaging apps — and translates everything in real time. You communicate. Glossa handles the language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center bg-navy hover:bg-navy-dark text-white font-bold text-base px-8 py-4 rounded-full transition-colors"
              >
                Try Connect Free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center border border-white/40 hover:bg-white/10 text-white font-semibold text-base px-8 py-4 rounded-full transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How the loop works */}
      <section className="bg-navy py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">
              The Translate → Learn Loop
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Unlike every other translation tool, Glossa doesn&apos;t just convert text. It turns every real conversation into a language lesson.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((h) => (
              <div key={h.step} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="font-display font-extrabold text-4xl text-gold/30 mb-4">{h.step}</div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{h.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-surface py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy mb-4">
              Works Everywhere You Work
            </h2>
            <p className="text-navy/60 text-lg max-w-2xl mx-auto">
              Glossa Connect integrates with the tools you already use — no new workflow required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((u) => (
              <div key={u.title} className="bg-white rounded-2xl p-8 card-hover border border-surface-dark">
                <div className="text-4xl mb-4">{u.icon}</div>
                <h3 className="font-display font-bold text-lg text-navy mb-3">{u.title}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator banner */}
      <section className="bg-orange/10 border-y border-orange/20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-extrabold text-3xl text-navy mb-4">
            Google Translate Converts. Glossa Teaches.
          </h2>
          <p className="text-navy/60 text-lg max-w-2xl mx-auto mb-8">
            Every other translation tool gives you the words and walks away. Glossa Connect is the only translation tool that feeds your learning queue — so every real-world conversation accelerates your fluency.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            {[
              { label: "Google Translate", features: ["Translates text", "No context", "No learning", "No memory"] },
              { label: "DeepL", features: ["High accuracy", "Document translation", "No learning", "No real-time"] },
              { label: "Glossa Connect", features: ["Real-time translation", "Cultural context", "Learns with you", "Feeds your fluency"], highlight: true },
            ].map((c) => (
              <div key={c.label} className={`rounded-xl p-5 border ${c.highlight ? "bg-navy text-white border-navy" : "bg-white border-surface-dark"}`}>
                <div className={`font-display font-bold text-sm mb-3 ${c.highlight ? "text-gold" : "text-navy/50"}`}>{c.label}</div>
                <ul className="flex flex-col gap-1.5">
                  {c.features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${c.highlight ? "text-white/80" : "text-navy/50"}`}>
                      <span className={`text-xs ${c.highlight ? "text-gold" : "text-navy/30"}`}>{c.highlight ? "✓" : "•"}</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-extrabold text-4xl text-navy mb-4">
            Start Communicating Without Limits
          </h2>
          <p className="text-navy/60 text-lg mb-8">
            Join Glossa Connect and make every conversation a language lesson.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-light text-white font-bold px-10 py-4 rounded-full transition-colors"
          >
            Activate Glossa Connect Free
          </Link>
        </div>
      </section>
    </>
  );
}
