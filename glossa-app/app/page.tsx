import Link from "next/link";

const stats = [
  { value: "1.5B", label: "Active Language Learners Worldwide" },
  { value: "316M", label: "Language App Downloads in 2024" },
  { value: "304M", label: "International Migrants Globally" },
  { value: "$90B", label: "Market Size by 2030" },
];

const segments = [
  {
    icon: "🏥",
    title: "Healthcare Workers",
    description:
      "27% of US physicians are foreign-born. Language certification requirements and daily clinical communication barriers cost careers and lives. Glossa provides healthcare-specific vocabulary and real-time support.",
    tag: "Highest urgency",
    tagColor: "bg-orange/10 text-orange",
  },
  {
    icon: "🌎",
    title: "Immigrant Workforce",
    description:
      "23.5 million LEP adults in the US alone face a 25–40% income penalty. 2 million college-educated immigrants are underemployed due to language barriers. Glossa closes that gap.",
    tag: "Largest volume",
    tagColor: "bg-royal/10 text-royal",
  },
  {
    icon: "💻",
    title: "Remote International Teams",
    description:
      "40%+ of global remote workers cite miscommunication as their #1 productivity obstacle. Glossa's real-time translation networking keeps cross-border teams aligned without friction.",
    tag: "Fastest growing",
    tagColor: "bg-gold/10 text-gold",
  },
  {
    icon: "🏢",
    title: "Global Business Professionals",
    description:
      "68% of Fortune 1000 companies operate in 5+ countries. Industry-specific vocabulary, real-time call translation, and business communication coaching — built for professionals.",
    tag: "Highest ARPU",
    tagColor: "bg-navy/10 text-navy",
  },
];

const features = [
  {
    product: "Learn",
    headline: "Conquer Languages Like a Warrior",
    description:
      "Glossa's AI-powered adaptive curriculum learns how you learn. Real-time pronunciation feedback, spaced repetition, and immersive conversation practice accelerate fluency — whether you have 10 minutes or 2 hours a day.",
    bullets: [
      "Adaptive AI curriculum that adjusts to your pace and goals",
      "Healthcare, business, and travel-specific vocabulary tracks",
      "Real-time pronunciation coaching with instant feedback",
      "Progress streaks, XP, and community leaderboards",
    ],
    cta: { href: "/learn", label: "Explore Learning Features" },
    accent: "navy",
    side: "left",
  },
  {
    product: "Connect",
    headline: "Communicate Across Borders Instantly",
    description:
      "Our translation networking layer overlays real-time translations on your existing apps and conversations. See the original message, the translation, and a natural back-translation in your language — simultaneously.",
    bullets: [
      "Real-time translation for messages, emails, and documents",
      "See translations inline without switching apps",
      "AI generates natural-sounding responses in the target language",
      "Learn from every translated conversation automatically",
    ],
    cta: { href: "/connect", label: "Explore Connect Features" },
    accent: "orange",
    side: "right",
  },
];

const steps = [
  {
    number: "01",
    title: "Set Your Goal",
    description:
      "Tell Glossa why you're learning — healthcare certification, business expansion, immigration, travel, or personal growth. Your path is built around your real-world use case.",
  },
  {
    number: "02",
    title: "Learn Adaptively",
    description:
      "Our AI identifies your current level, your strongest learning modality, and your schedule. Daily sessions are personalized — you make measurable progress every single day.",
  },
  {
    number: "03",
    title: "Connect and Communicate",
    description:
      "Activate the translation network in any conversation. See real-time translations, learn from each exchange, and watch your fluency compound with every interaction.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          <div className="absolute top-10 left-10 text-8xl">⚔</div>
          <div className="absolute top-20 right-20 text-6xl">🛡</div>
          <div className="absolute bottom-20 left-1/4 text-5xl">✦</div>
          <div className="absolute bottom-10 right-1/3 text-7xl">✦</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
              <span className="text-gold text-xs font-semibold tracking-wide uppercase">
                Now Open — Join the Waitlist
              </span>
            </div>
            <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Master Any Language.{" "}
              <span className="gradient-text">Connect With Any World.</span>
            </h1>
            <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              Glossa combines AI-powered language learning with real-time translation networking — so you learn faster and communicate instantly. Built for healthcare workers, immigrants, remote teams, and global professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center bg-gold hover:bg-gold-light text-navy font-bold text-base px-8 py-4 rounded-full transition-colors shadow-lg"
              >
                Start Learning Free
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 text-white font-semibold text-base px-8 py-4 rounded-full transition-colors"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display font-extrabold text-2xl md:text-3xl text-gold">{s.value}</div>
                  <div className="text-white/50 text-xs mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-surface py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy mb-4">
              The Language Barrier Is Costing People — Every Day
            </h2>
            <p className="text-navy/60 text-lg max-w-2xl mx-auto">
              Glossa targets the highest-stakes language gaps with purpose-built tools, not generic vocabulary lists.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {segments.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-2xl p-8 card-hover border border-surface-dark"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{s.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-display font-bold text-xl text-navy">{s.title}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.tagColor}`}>
                        {s.tag}
                      </span>
                    </div>
                    <p className="text-navy/60 text-sm leading-relaxed">{s.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy mb-4">
              Two Products. One Mission.
            </h2>
            <p className="text-navy/60 text-lg max-w-2xl mx-auto">
              Learn the language. Then use it — right now. Glossa is the only platform that bridges both.
            </p>
          </div>
          <div className="flex flex-col gap-20">
            {features.map((f) => (
              <div
                key={f.product}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${f.side === "right" ? "lg:grid-flow-dense" : ""}`}
              >
                <div className={f.side === "right" ? "lg:col-start-2" : ""}>
                  <div className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${f.accent === "navy" ? "bg-navy text-gold" : "bg-orange text-white"}`}>
                    {f.product}
                  </div>
                  <h3 className="font-display font-extrabold text-3xl md:text-4xl text-navy mb-4">
                    {f.headline}
                  </h3>
                  <p className="text-navy/60 text-base leading-relaxed mb-6">{f.description}</p>
                  <ul className="flex flex-col gap-3 mb-8">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-gold/20 text-gold flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                        <span className="text-navy/70 text-sm">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={f.cta.href}
                    className="inline-flex items-center gap-2 text-navy font-bold text-sm border-2 border-navy hover:bg-navy hover:text-white px-6 py-3 rounded-full transition-colors"
                  >
                    {f.cta.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
                <div className={f.side === "right" ? "lg:col-start-1 lg:row-start-1" : ""}>
                  <div className={`rounded-3xl h-80 flex items-center justify-center relative overflow-hidden ${f.accent === "navy" ? "bg-navy" : "bg-orange"}`}>
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute top-4 left-4 text-6xl">✦</div>
                      <div className="absolute bottom-4 right-4 text-8xl">✦</div>
                    </div>
                    <div className="text-center text-white relative z-10 p-8">
                      <div className="text-7xl mb-4">{f.side === "left" ? "⚔️" : "🌐"}</div>
                      <div className="font-display font-bold text-2xl">{f.product}</div>
                      <div className="text-white/60 text-sm mt-1">
                        {f.side === "left" ? "Language Learning Engine" : "Translation Network"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy mb-4">
              From Zero to Fluent — Here&apos;s How
            </h2>
            <p className="text-navy/60 text-lg max-w-2xl mx-auto">
              Three steps to breaking the barrier that&apos;s held you back.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gold/30 z-0 -translate-x-4" />
                )}
                <div className="bg-white rounded-2xl p-8 card-hover border border-surface-dark relative z-10">
                  <div className="font-display font-extrabold text-5xl text-gold/20 mb-4">{step.number}</div>
                  <h3 className="font-display font-bold text-xl text-navy mb-3">{step.title}</h3>
                  <p className="text-navy/60 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-navy font-semibold hover:text-navy-dark"
            >
              See the full walkthrough
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy mb-4">
              Plans for Every Language Warrior
            </h2>
            <p className="text-navy/60 text-lg">From students to enterprise teams.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Student", price: "$9.99", per: "/ month", note: "For personal learning goals", featured: false },
              { name: "Professional", price: "$24.99", per: "/ month", note: "Learning + Translation Network", featured: true },
              { name: "Enterprise", price: "Custom", per: "", note: "Volume + B2B integrations", featured: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-8 card-hover border ${p.featured ? "bg-navy text-white border-navy shadow-xl scale-105" : "bg-white text-navy border-surface-dark"}`}
              >
                {p.featured && (
                  <div className="text-xs font-bold text-navy bg-gold px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className={`font-display font-bold text-xl mb-2 ${p.featured ? "text-white" : "text-navy"}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`font-display font-extrabold text-4xl ${p.featured ? "text-gold" : "text-navy"}`}>{p.price}</span>
                  <span className={`text-sm ${p.featured ? "text-white/50" : "text-navy/50"}`}>{p.per}</span>
                </div>
                <p className={`text-sm mb-6 ${p.featured ? "text-white/60" : "text-navy/60"}`}>{p.note}</p>
                <Link
                  href="/pricing"
                  className={`block text-center font-bold text-sm px-6 py-3 rounded-full transition-colors ${p.featured ? "bg-gold hover:bg-gold-light text-navy" : "border-2 border-navy hover:bg-navy hover:text-white"}`}
                >
                  {p.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-navy/60 hover:text-navy text-sm font-medium">
              Compare all plans in detail →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="hero-gradient py-24 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl mb-6">
            Ready to Conquer the Language Barrier?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of healthcare workers, immigrants, remote teams, and global professionals who are breaking barriers with Glossa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center bg-gold hover:bg-gold-light text-navy font-bold text-base px-10 py-4 rounded-full transition-colors shadow-lg"
            >
              Start for Free — No Credit Card
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center border border-white/30 hover:bg-white/10 text-white font-semibold text-base px-10 py-4 rounded-full transition-colors"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-white/40 text-xs mt-6">Free plan available · Cancel anytime · Used in 40+ countries</p>
        </div>
      </section>
    </>
  );
}
