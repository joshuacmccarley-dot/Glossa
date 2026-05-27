import Link from "next/link";

const tracks = [
  {
    icon: "🏥",
    title: "Healthcare & Medical",
    description: "Clinical terminology, patient communication, medical certification prep (OET, IELTS Healthcare). Built for nurses, doctors, and allied health professionals working in a second language.",
    languages: ["English", "Spanish", "German", "French", "Portuguese"],
  },
  {
    icon: "💼",
    title: "Business & Finance",
    description: "Negotiation language, corporate communication, financial terminology, and presentation skills. Close deals and lead meetings with confidence in any language.",
    languages: ["English", "Mandarin", "Japanese", "Spanish", "Arabic"],
  },
  {
    icon: "🏗️",
    title: "Trades & Manufacturing",
    description: "Safety instructions, equipment vocabulary, and workplace compliance language. Reduce accidents and improve team coordination on the job site.",
    languages: ["English", "Spanish", "Polish", "Portuguese", "Vietnamese"],
  },
  {
    icon: "✈️",
    title: "Travel & Immigration",
    description: "Conversational fluency for daily life, navigating government processes, housing, banking, and social integration. Built for immigrants and long-term travelers.",
    languages: ["English", "Spanish", "French", "German", "Italian"],
  },
  {
    icon: "🎓",
    title: "Academic & Test Prep",
    description: "IELTS, TOEFL, DELE, DELF, JLPT, and more. Structured exam preparation with adaptive practice tests and AI scoring for writing and speaking.",
    languages: ["English", "Spanish", "French", "Japanese", "Korean"],
  },
  {
    icon: "🌍",
    title: "General Conversational",
    description: "For learners who want broad fluency fast. Conversational modules, cultural context, and real-world dialogue practice — no dry textbook methods.",
    languages: ["40+ languages"],
  },
];

const methods = [
  {
    title: "Adaptive AI Curriculum",
    description: "Every session adapts to your performance in real time. Glossa identifies gaps and reinforces exactly what you need — no wasted time on things you already know.",
    icon: "🧠",
  },
  {
    title: "Spaced Repetition",
    description: "Scientifically proven memory technique that shows you vocabulary and phrases at the optimal moment for retention — not too early, not too late.",
    icon: "🔁",
  },
  {
    title: "Pronunciation Coaching",
    description: "AI-powered speech analysis gives you instant, specific feedback on your pronunciation. Hear your voice, compare it to a native speaker, and improve immediately.",
    icon: "🎙️",
  },
  {
    title: "Immersive Dialogue",
    description: "Practice real conversations with AI characters in realistic scenarios — job interviews, doctor's appointments, business negotiations — before you need them in real life.",
    icon: "💬",
  },
  {
    title: "Progress Tracking",
    description: "CEFR-aligned proficiency levels, streak tracking, XP points, and detailed analytics. See exactly how far you've come and what's coming next.",
    icon: "📈",
  },
  {
    title: "Community Challenges",
    description: "Weekly challenges, leaderboards, and language exchange matching with other Glossa learners. Progress is faster when you're competing and collaborating.",
    icon: "🏆",
  },
];

export default function LearnPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 right-10 text-9xl">⚔</div>
          <div className="absolute bottom-10 left-10 text-7xl">✦</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6 bg-gold text-navy">
              Learn
            </div>
            <h1 className="font-display font-extrabold text-5xl md:text-6xl leading-tight mb-6">
              Language Learning Built for the{" "}
              <span className="gradient-text">Real World</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-2xl">
              Generic apps teach you to count to ten. Glossa teaches you to negotiate a contract, pass your nursing certification, or navigate your first month in a new country. Purpose-built tracks for every goal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center bg-gold hover:bg-gold-light text-navy font-bold text-base px-8 py-4 rounded-full transition-colors"
              >
                Start Learning Free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 text-white font-semibold text-base px-8 py-4 rounded-full transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Methods */}
      <section className="bg-surface py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy mb-4">
              The Science Behind Glossa
            </h2>
            <p className="text-navy/60 text-lg max-w-2xl mx-auto">
              Every method is evidence-backed. Every session is optimized. Every minute counts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((m) => (
              <div key={m.title} className="bg-white rounded-2xl p-8 card-hover border border-surface-dark">
                <div className="text-4xl mb-4">{m.icon}</div>
                <h3 className="font-display font-bold text-lg text-navy mb-3">{m.title}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy mb-4">
              Purpose-Built Learning Tracks
            </h2>
            <p className="text-navy/60 text-lg max-w-2xl mx-auto">
              Not everyone learns for the same reason. Glossa meets you exactly where you are.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tracks.map((t) => (
              <div key={t.title} className="bg-surface rounded-2xl p-8 card-hover border border-surface-dark">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{t.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-xl text-navy mb-2">{t.title}</h3>
                    <p className="text-navy/60 text-sm leading-relaxed mb-4">{t.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {t.languages.map((lang) => (
                        <span key={lang} className="text-xs bg-navy/10 text-navy font-semibold px-2.5 py-1 rounded-full">
                          {lang}
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

      {/* CTA */}
      <section className="bg-navy py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-extrabold text-4xl mb-4">
            Your Goal. Your Language. Your Schedule.
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Pick your track, set your pace, and let Glossa do the heavy lifting.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy font-bold px-10 py-4 rounded-full transition-colors"
          >
            Choose Your Track — It&apos;s Free
          </Link>
        </div>
      </section>
    </>
  );
}
