import Link from "next/link";

const learnSteps = [
  {
    number: "01",
    title: "Choose Your Track",
    description: "Select your goal — healthcare, business, immigration, travel, or general fluency. Pick your target language from 40+. Tell Glossa your current level and how much time you have each day.",
    icon: "🎯",
  },
  {
    number: "02",
    title: "Take a Diagnostic",
    description: "A 5-minute adaptive diagnostic places you precisely on the CEFR scale (A1 to C2) across reading, listening, speaking, and writing. No over- or under-placement.",
    icon: "📊",
  },
  {
    number: "03",
    title: "Learn Daily",
    description: "Your personalized daily session mixes vocabulary, grammar, pronunciation, and dialogue — calibrated to your performance the day before. Sessions take 10–30 minutes.",
    icon: "🧠",
  },
  {
    number: "04",
    title: "Practice Real Conversations",
    description: "AI dialogue scenarios drop you into realistic situations — a nurse's admission consultation, a business negotiation, a housing office visit. Practice until it feels natural.",
    icon: "💬",
  },
  {
    number: "05",
    title: "Track Your Progress",
    description: "Watch your CEFR level rise. See exactly which skills are improving and where to focus next. Streaks, XP, and leaderboards keep you motivated.",
    icon: "📈",
  },
];

const connectSteps = [
  {
    number: "01",
    title: "Activate Glossa Connect",
    description: "Install the Glossa browser extension or mobile overlay. It runs quietly in the background — no setup required beyond your language preferences.",
    icon: "⚡",
  },
  {
    number: "02",
    title: "Receive Foreign-Language Content",
    description: "A message, email, document, or webpage arrives in a language you don't speak fluently. Glossa detects it automatically.",
    icon: "📥",
  },
  {
    number: "03",
    title: "See Instant Translation",
    description: "The translation appears inline — original text above, your language below. Cultural context notes surface when relevant. No switching apps.",
    icon: "🔄",
  },
  {
    number: "04",
    title: "Reply Naturally",
    description: "Type your response in your language. Glossa generates a natural, culturally appropriate reply in the target language — which you can review, edit, and send.",
    icon: "✉️",
  },
  {
    number: "05",
    title: "Learn From the Conversation",
    description: "New phrases and vocabulary from the exchange are automatically added to your Glossa learning queue. Your next session includes them — reinforcing real conversations with deliberate practice.",
    icon: "🎓",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="hero-gradient text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-extrabold text-5xl md:text-6xl mb-6">
            How Glossa Works
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto">
            Two connected systems that reinforce each other. Learn a language deliberately. Use it in the real world. Let every real interaction accelerate your learning. Repeat.
          </p>
        </div>
      </section>

      {/* Learn Flow */}
      <section className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-navy text-gold font-bold text-sm px-4 py-1.5 rounded-full uppercase tracking-widest">Learn</div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy">
              The Language Learning Engine
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            {learnSteps.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-navy text-gold font-display font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {step.number}
                  </div>
                  {i < learnSteps.length - 1 && <div className="w-0.5 h-full bg-surface-dark flex-grow min-h-8" />}
                </div>
                <div className="bg-surface rounded-2xl p-6 flex-1 border border-surface-dark mb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{step.icon}</span>
                    <h3 className="font-display font-bold text-xl text-navy">{step.title}</h3>
                  </div>
                  <p className="text-navy/60 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect Flow */}
      <section className="bg-surface py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-orange text-white font-bold text-sm px-4 py-1.5 rounded-full uppercase tracking-widest">Connect</div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy">
              The Translation Network
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            {connectSteps.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-orange text-white font-display font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {step.number}
                  </div>
                  {i < connectSteps.length - 1 && <div className="w-0.5 h-full bg-surface-dark flex-grow min-h-8" />}
                </div>
                <div className="bg-white rounded-2xl p-6 flex-1 border border-surface-dark mb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{step.icon}</span>
                    <h3 className="font-display font-bold text-xl text-navy">{step.title}</h3>
                  </div>
                  <p className="text-navy/60 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The loop callout */}
      <section className="bg-navy py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-extrabold text-4xl mb-6">
            The Glossa Flywheel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: "⚔️", label: "Learn Deliberately", desc: "Adaptive curriculum builds the foundation" },
              { icon: "🌐", label: "Use in the Real World", desc: "Connect translates real conversations" },
              { icon: "📚", label: "Reinforce Automatically", desc: "Real exchanges feed back into learning" },
            ].map((item, i) => (
              <div key={item.label} className="relative">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="font-display font-bold text-white mb-1">{item.label}</div>
                  <div className="text-white/50 text-sm">{item.desc}</div>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 text-gold text-xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-white/50 text-base max-w-xl mx-auto mb-8">
            Every translated conversation makes you a better learner. Every learning session makes your translations more natural. Glossa compounds your progress.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy font-bold px-10 py-4 rounded-full transition-colors"
          >
            Start the Flywheel — Free
          </Link>
        </div>
      </section>
    </>
  );
}
