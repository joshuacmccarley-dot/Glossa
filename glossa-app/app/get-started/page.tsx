"use client";

import { useState } from "react";
import Link from "next/link";

const goals = [
  { id: "healthcare", label: "Healthcare / Medical", icon: "🏥" },
  { id: "business", label: "Business / Professional", icon: "💼" },
  { id: "immigration", label: "Immigration / Relocation", icon: "🌍" },
  { id: "remote", label: "Remote Work / International Teams", icon: "💻" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "personal", label: "Personal Interest", icon: "🎓" },
];

const languages = [
  "Spanish", "English", "French", "German", "Mandarin",
  "Japanese", "Portuguese", "Arabic", "Italian", "Korean",
  "Hindi", "Polish", "Russian", "Dutch", "Swedish",
];

export default function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    goal: "",
    language: "",
    plan: "professional",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="hero-gradient min-h-screen flex items-center justify-center text-white">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-7xl mb-6">⚔️</div>
          <h1 className="font-display font-extrabold text-5xl mb-4">
            You&apos;re on the List!
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Welcome to Glossa, <strong className="text-gold">{form.name}</strong>. We&apos;ll send your early access invite to <strong className="text-gold">{form.email}</strong> shortly.
          </p>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-display font-bold text-white mb-4">While you wait, spread the word:</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Share on Twitter/X", icon: "🐦" },
                { label: "Post in r/languagelearning", icon: "🟠" },
                { label: "Tell your Discord community", icon: "💬" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 text-white/70 text-sm">
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
              <span className="text-gold font-display font-bold text-sm">G</span>
            </div>
            <span className="font-display font-bold text-navy text-lg">Glossa</span>
          </Link>
          <h1 className="font-display font-extrabold text-4xl text-navy mb-2">
            Join the Waitlist
          </h1>
          <p className="text-navy/60">Early access · No credit card required · Cancel anytime</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s <= step ? "bg-navy text-gold" : "bg-surface-dark text-navy/30"}`}>
                {s < step ? "✓" : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-12 ${s < step ? "bg-navy" : "bg-surface-dark"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-8 border border-surface-dark">
              <h2 className="font-display font-bold text-2xl text-navy mb-6">Tell us about yourself</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-surface-dark rounded-xl px-4 py-3 text-navy placeholder-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-surface-dark rounded-xl px-4 py-3 text-navy placeholder-navy/30 focus:outline-none focus:ring-2 focus:ring-navy/30 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={!form.name || !form.email}
                  onClick={() => setStep(2)}
                  className="mt-2 w-full bg-navy hover:bg-navy-dark disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Goal + language */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-8 border border-surface-dark">
              <h2 className="font-display font-bold text-2xl text-navy mb-6">What&apos;s your goal?</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setForm({ ...form, goal: g.id })}
                    className={`text-left p-4 rounded-xl border text-sm transition-colors ${form.goal === g.id ? "border-navy bg-navy/5 text-navy font-semibold" : "border-surface-dark text-navy/60 hover:border-navy/30"}`}
                  >
                    <span className="text-xl block mb-1">{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-navy mb-1.5">Target Language</label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full border border-surface-dark rounded-xl px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-navy/30 text-sm"
                >
                  <option value="">Select a language...</option>
                  {languages.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-surface-dark text-navy font-semibold py-3.5 rounded-xl hover:bg-surface transition-colors">
                  Back
                </button>
                <button
                  type="button"
                  disabled={!form.goal || !form.language}
                  onClick={() => setStep(3)}
                  className="flex-1 bg-navy hover:bg-navy-dark disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Plan selection */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-8 border border-surface-dark">
              <h2 className="font-display font-bold text-2xl text-navy mb-2">Choose your plan</h2>
              <p className="text-navy/50 text-sm mb-6">All plans include a 14-day free trial.</p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { id: "student", name: "Student", price: "$9.99/mo", desc: "Learning only · Personal goals" },
                  { id: "professional", name: "Professional", price: "$24.99/mo", desc: "Learning + Connect · Best for professionals", popular: true },
                  { id: "enterprise", name: "Enterprise", price: "Custom", desc: "Team plans · Contact sales" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setForm({ ...form, plan: p.id })}
                    className={`text-left p-4 rounded-xl border flex justify-between items-start transition-colors ${form.plan === p.id ? "border-navy bg-navy/5" : "border-surface-dark hover:border-navy/30"}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-navy text-sm">{p.name}</span>
                        {p.popular && <span className="text-xs bg-gold text-navy font-bold px-2 py-0.5 rounded-full">Popular</span>}
                      </div>
                      <div className="text-navy/50 text-xs mt-0.5">{p.desc}</div>
                    </div>
                    <span className="font-display font-bold text-navy text-sm ml-4 flex-shrink-0">{p.price}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 border border-surface-dark text-navy font-semibold py-3.5 rounded-xl hover:bg-surface transition-colors">
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold-light text-navy font-bold py-3.5 rounded-xl transition-colors"
                >
                  Join the Waitlist ⚔️
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-navy/40 text-xs mt-6">
          By joining, you agree to our{" "}
          <Link href="#" className="underline hover:text-navy">Terms of Service</Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-navy">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  );
}
