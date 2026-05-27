import Link from "next/link";

const plans = [
  {
    name: "Student",
    price: "$9.99",
    period: "/ month",
    annualPrice: "$7.99",
    description: "For personal language learning goals — students, travelers, and curious minds.",
    cta: "Get Started Free",
    ctaHref: "/get-started",
    featured: false,
    features: [
      "Access to 1 learning track",
      "40+ languages",
      "Adaptive AI curriculum",
      "Pronunciation coaching",
      "Progress tracking & streaks",
      "Basic community access",
      "Mobile & web app",
    ],
    missing: ["Glossa Connect (translation networking)", "Multiple learning tracks", "Team/admin dashboard"],
  },
  {
    name: "Professional",
    price: "$24.99",
    period: "/ month",
    annualPrice: "$19.99",
    description: "For professionals who need to learn and communicate — healthcare workers, immigrants, remote workers.",
    cta: "Start Professional Trial",
    ctaHref: "/get-started",
    featured: true,
    features: [
      "Unlimited learning tracks",
      "40+ languages",
      "Adaptive AI curriculum",
      "Pronunciation coaching",
      "Progress tracking & streaks",
      "Glossa Connect — real-time translation",
      "Email & message translation",
      "Document translation (50 pages/mo)",
      "Video call subtitles",
      "Priority support",
    ],
    missing: ["Team management dashboard", "Custom vocabulary packs", "API access"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    annualPrice: "",
    description: "For organizations, healthcare systems, and global teams who need language support at scale.",
    cta: "Contact Sales",
    ctaHref: "/get-started",
    featured: false,
    features: [
      "Everything in Professional",
      "Unlimited team seats",
      "Team admin dashboard",
      "Custom vocabulary packs",
      "Industry-specific modules",
      "Unlimited document translation",
      "Slack / Teams integration",
      "SSO & enterprise security",
      "Dedicated account manager",
      "Custom API access",
      "SLA & uptime guarantee",
    ],
    missing: [],
  },
];

const faq = [
  {
    q: "Is there a free trial?",
    a: "Yes. The Student plan includes a 14-day free trial — no credit card required. Professional plans include a 7-day trial.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Absolutely. Upgrade, downgrade, or cancel any time from your account dashboard. Changes take effect at the next billing cycle.",
  },
  {
    q: "What languages does Glossa support?",
    a: "Glossa supports 40+ languages for learning and 100+ languages for Connect translation. New languages are added monthly.",
  },
  {
    q: "Is Glossa Connect available on mobile?",
    a: "Yes. Glossa Connect is available on iOS, Android, and as a browser extension for desktop. Translation works across any app on your device.",
  },
  {
    q: "Does Glossa work for corporate language training programs?",
    a: "Yes — Enterprise plans include admin dashboards, team progress reporting, and custom content packages. Contact sales for volume pricing.",
  },
  {
    q: "How accurate is the translation?",
    a: "Glossa uses a combination of Claude AI and specialized NLP models fine-tuned for accuracy and cultural nuance. Translation quality exceeds standard machine translation, especially for professional and domain-specific content.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-surface py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display font-extrabold text-5xl md:text-6xl text-navy mb-4">
            Simple, Honest Pricing
          </h1>
          <p className="text-navy/60 text-lg">
            Every plan includes a free trial. No hidden fees. Cancel anytime.
          </p>
          <div className="inline-flex items-center gap-2 mt-6 bg-gold/10 border border-gold/30 rounded-full px-4 py-2">
            <span className="text-gold font-bold text-sm">Save 20%</span>
            <span className="text-navy/60 text-sm">with annual billing</span>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 card-hover ${plan.featured ? "bg-navy text-white border-navy shadow-2xl" : "bg-white border-surface-dark"}`}
              >
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full mb-4">
                    ⭐ Most Popular
                  </div>
                )}
                <h2 className={`font-display font-extrabold text-2xl mb-1 ${plan.featured ? "text-white" : "text-navy"}`}>
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`font-display font-extrabold text-5xl ${plan.featured ? "text-gold" : "text-navy"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.featured ? "text-white/50" : "text-navy/40"}`}>{plan.period}</span>
                </div>
                {plan.annualPrice && (
                  <p className={`text-xs mb-4 ${plan.featured ? "text-white/40" : "text-navy/40"}`}>
                    {plan.annualPrice}/mo billed annually
                  </p>
                )}
                <p className={`text-sm leading-relaxed mb-6 ${plan.featured ? "text-white/60" : "text-navy/60"}`}>
                  {plan.description}
                </p>
                <Link
                  href={plan.ctaHref}
                  className={`block text-center font-bold text-sm px-6 py-3.5 rounded-full transition-colors mb-8 ${
                    plan.featured
                      ? "bg-gold hover:bg-gold-light text-navy"
                      : "bg-navy hover:bg-navy-dark text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
                <div className="border-t border-white/10 pt-6">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-4 ${plan.featured ? "text-white/40" : "text-navy/40"}`}>
                    What&apos;s included
                  </p>
                  <ul className="flex flex-col gap-3 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/80" : "text-navy/70"}`}>
                        <span className="mt-0.5 text-gold flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.missing.length > 0 && (
                    <ul className="flex flex-col gap-2 mt-4">
                      {plan.missing.map((f) => (
                        <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/30" : "text-navy/30"}`}>
                          <span className="mt-0.5 flex-shrink-0">✕</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-navy/40 text-sm mt-8">
            All plans include 14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-navy text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-6">
            {faq.map((item) => (
              <div key={item.q} className="bg-white rounded-2xl p-6 border border-surface-dark">
                <h3 className="font-display font-bold text-navy mb-2">{item.q}</h3>
                <p className="text-navy/60 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-extrabold text-4xl mb-4">Start Free Today</h2>
          <p className="text-white/60 text-lg mb-8">
            No risk. No credit card. Full access to your plan for 14 days.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy font-bold px-10 py-4 rounded-full transition-colors"
          >
            Begin Your Free Trial
          </Link>
        </div>
      </section>
    </>
  );
}
