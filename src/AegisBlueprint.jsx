import { useState } from "react";

const BLUEPRINT = {
  brand: "Aegis",
  tagline: "AI-powered API security for developers and founders who can't afford a breach.",
  verdict: "This is a real problem with real daily pain — exposed keys cost companies millions and it happens to everyone from solo founders to Series A teams. Your edge is speed: you understand the customer, you have the domain clarity, and $1k is enough to ship an MVP that charges from day one.",
  firstMove: "Register aegis.dev or getaegis.io today, spin up a Next.js + Supabase project on Vercel, and build the key scanner as your first working feature this week.",
  sections: [
    {
      title: "Product",
      icon: "🛡",
      summary: "Three core features shipped in sequence. Scanner first, monitor second, fix third.",
      items: [
        "Feature 1 — API Key Scanner: paste a GitHub repo URL or raw code, Aegis scans and flags exposed keys (OpenAI, Stripe, AWS, Twilio, etc.) with severity scores.",
        "Feature 2 — Live Site Monitor: connect your domain, Aegis runs weekly crawls checking headers, CORS policy, exposed endpoints, SSL issues, and leaked secrets in JS bundles.",
        "Feature 3 — Fix Engine: AI-generated remediation steps per finding — not just 'you have an issue' but 'here is the exact code change to fix it.'"
      ]
    },
    {
      title: "Tech Stack",
      icon: "⚙️",
      summary: "Lean, fast to ship, scalable without DevOps overhead.",
      items: [
        "Frontend: Next.js 14 (App Router) + Tailwind — fast to build, easy to deploy on Vercel. shadcn/ui for components.",
        "Backend: Supabase (Postgres + Auth + Edge Functions) handles auth, user data, scan results, and subscriptions without a separate server.",
        "AI Layer: Claude API (claude-sonnet) for fix generation and severity analysis. Use Anthropic SDK server-side via Supabase Edge Functions to keep your key hidden.",
        "Payments: Stripe Checkout + webhooks wired to Supabase to gate features by plan tier.",
        "Scanning Engine: custom regex pattern library for 40+ key types (start with the top 10: OpenAI, Stripe, AWS, GCP, GitHub, Twilio, SendGrid, Slack, HubSpot, Shopify)."
      ]
    },
    {
      title: "Week 1 Build",
      icon: "⚡",
      summary: "Repo scanner live and publicly usable by end of week 1.",
      items: [
        "Day 1-2: Project scaffold — Next.js + Supabase + Tailwind + Stripe setup. Auth (email + GitHub OAuth via Supabase). Deploy skeleton to Vercel.",
        "Day 3-4: Build the scanner — regex pattern library for top 10 key types, paste-or-URL input, results UI showing file path, line number, key type, severity.",
        "Day 5: Claude integration — on each scan result, call Claude to generate a plain-English fix with exact code. Cache results in Supabase.",
        "Day 6-7: Stripe paywall — free tier (1 scan/day, no fix engine), Pro $29/mo (unlimited scans + fix engine + monitor). Launch on X and indie hacker communities."
      ]
    },
    {
      title: "Week 2 Build",
      icon: "🔧",
      summary: "Site monitor live, onboarding polished, first paying customers.",
      items: [
        "Day 8-9: Site monitor — user connects domain, Aegis runs Puppeteer/Playwright crawl via Supabase Edge Function checking headers, CORS, SSL, exposed JS secrets.",
        "Day 10-11: Dashboard — scan history, monitor status per domain, severity trend over time, fix status (open/resolved).",
        "Day 12-13: Email alerts — Resend or Postmark integration. Alert users when monitor detects a new issue. This is the retention hook.",
        "Day 14: Polish, bug fix, and outreach. Post on ProductHunt, X, Reddit r/webdev and r/SaaS. DM 20 founders directly with a free scan of their repo."
      ]
    },
    {
      title: "Revenue Model",
      icon: "💰",
      summary: "Three tiers. Free drives signups, Pro drives revenue, Agency drives $10k.",
      items: [
        "Free: 1 repo scan/day, top 3 findings only, no fix engine — enough to show value, not enough to rely on.",
        "Pro — $29/month: unlimited scans, full findings, Claude fix engine, 3 domain monitors, weekly email reports. Target: solo devs and indie founders.",
        "Agency — $99/month: unlimited everything, 20 domain monitors, white-label PDF reports, priority support. Target: freelance devs and small agencies managing client sites.",
        "Path to $10k/month: 30 Agency seats OR 120 Pro seats OR a mix. At 4-6 months with consistent outreach this is achievable — 2-3 signups/week compounds fast.",
        "Upsell: one-time Security Audit report at $299 — you run it manually using Aegis output, deliver a branded PDF. Immediate revenue before SaaS scales."
      ]
    },
    {
      title: "Go-to-Market",
      icon: "📡",
      summary: "Organic first. Find people the moment they have the problem.",
      items: [
        "X/Twitter: post daily about exposed API key incidents (they happen publicly all the time). Build authority before selling. Link Aegis in bio.",
        "Reddit: r/webdev, r/SaaS, r/startups, r/node — answer security questions genuinely, drop Aegis when relevant. Never spam.",
        "ProductHunt launch at end of Week 2. Prep assets early. Ask your network for upvotes day-of.",
        "GitHub: scan public repos for exposed keys (ethically — no data stored), open issues with a 'found this with Aegis' message linking to a free scan. High-conversion cold outreach.",
        "The $1k budget: $0 on ads. Spend on domain ($15), Vercel Pro ($20/mo), Supabase Pro ($25/mo), Resend ($0 to start), Anthropic API credits (~$50 to start). Keep $890 as runway."
      ]
    },
    {
      title: "Risks & Counters",
      icon: "⚠️",
      summary: "Three real risks. Each has a direct counter built into the plan.",
      items: [
        "Risk: Claude API costs spike with scale. Counter: cache all fix responses in Supabase — same repo+finding never calls the API twice. Add rate limits per free tier user.",
        "Risk: False positives on key detection destroy trust. Counter: tune regex patterns aggressively before launch, add confidence scores, let users mark false positives to improve the model.",
        "Risk: 10hrs/week isn't enough to maintain and grow simultaneously. Counter: Week 1-2 is pure build. Week 3+ split 6hrs build / 4hrs outreach. Once paying customers arrive, automate support with a Claude-powered FAQ bot.",
        "Risk: Competitors (GitGuardian, Trufflehog) already exist. Counter: they target enterprise and dev teams. Aegis targets non-technical founders and solo builders — different buyer, different UI, different price point.",
        "Risk: Nobody converts from free to paid. Counter: the fix engine is the paywall. Anyone who finds an issue and wants to fix it fast will pay $29. That's the conversion mechanic."
      ]
    }
  ]
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #05050a; }
  .root { min-height: 100vh; background: #05050a; color: #b8b8c8; font-family: 'Space Grotesk', sans-serif; }
  .header { padding: 18px 32px; border-bottom: 1px solid #10101a; display: flex; align-items: center; gap: 10px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #3dffa0; box-shadow: 0 0 8px #3dffa0; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.35;} }
  .header-text { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .22em; color: #3dffa0; text-transform: uppercase; }
  .back-btn { margin-left: auto; background: transparent; border: 1px solid #202030; color: #404050; font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: .15em; padding: 5px 12px; border-radius: 100px; cursor: pointer; text-transform: uppercase; transition: all .15s; }
  .back-btn:hover { border-color: #3dffa0; color: #3dffa0; }
  .hero { padding: 56px 32px 0; max-width: 820px; margin: 0 auto; }
  .hero-eye { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .3em; color: #3dffa0; text-transform: uppercase; margin-bottom: 14px; }
  .hero-title { font-size: clamp(42px, 7vw, 80px); font-weight: 700; color: #f0f0fa; letter-spacing: -.03em; line-height: 1; margin-bottom: 12px; }
  .hero-title span { color: #3dffa0; }
  .hero-sub { font-size: 14px; color: #404050; line-height: 1.6; max-width: 480px; margin-bottom: 40px; }
  .cards-top { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-width: 820px; margin: 0 auto 0; padding: 0 32px; }
  .verdict-card { border: 1px solid #3dffa025; background: #3dffa008; border-radius: 10px; padding: 18px 22px; }
  .move-card { border: 1px solid #10101a; background: #0a0a10; border-radius: 10px; padding: 18px 22px; }
  .card-eye { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: .25em; text-transform: uppercase; margin-bottom: 9px; }
  .verdict-card .card-eye { color: #3dffa0; }
  .move-card .card-eye { color: #ff9f3d; }
  .card-text { font-size: 12.5px; line-height: 1.7; color: #9090a8; }
  .body { max-width: 820px; margin: 0 auto; padding: 40px 32px 80px; }
  .section-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: .25em; color: #303040; text-transform: uppercase; margin-bottom: 14px; }
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 22px; }
  .tab { padding: 8px 16px; border: 1px solid #13131e; background: transparent; color: #383848; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .06em; cursor: pointer; border-radius: 100px; transition: all .15s; white-space: nowrap; }
  .tab:hover:not(.active) { border-color: #202030; color: #606078; }
  .tab.active { border-color: #3dffa0; color: #3dffa0; background: #3dffa010; }
  .card { border: 1px solid #10101a; border-radius: 10px; overflow: hidden; animation: up .22s ease; }
  @keyframes up { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
  .card-head { padding: 20px 24px; border-bottom: 1px solid #10101a; background: #08080e; }
  .card-title { font-size: 18px; font-weight: 700; color: #f0f0fa; letter-spacing: -.01em; }
  .card-sum { font-size: 12px; color: #303040; margin-top: 5px; line-height: 1.5; }
  .card-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
  .item { display: flex; gap: 16px; }
  .item-n { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #3dffa0; min-width: 16px; padding-top: 4px; }
  .item-t { font-size: 13px; color: #8888a0; line-height: 1.7; }
  .item-t strong { color: #c8c8e0; font-weight: 600; }
  hr { border: none; border-top: 1px solid #10101a; margin: 40px 0; }
  .footer-note { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #202028; letter-spacing: .08em; text-align: center; }
  @media(max-width:600px) {
    .cards-top { grid-template-columns: 1fr; }
    .hero, .body, .cards-top { padding-left: 20px; padding-right: 20px; }
  }
`;

export default function AegisBlueprint({ onBack }) {
  const [activeTab, setActiveTab] = useState(0);
  const s = BLUEPRINT.sections[activeTab];

  return (
    <div className="root">
      <style>{STYLES}</style>

      <div className="header">
        <div className="dot" />
        <span className="header-text">Aegis — Product Blueprint</span>
        {onBack && (
          <button className="back-btn" onClick={onBack}>← Automater</button>
        )}
      </div>

      <div className="hero">
        <div className="hero-eye">Venture Blueprint · June 2026</div>
        <h1 className="hero-title"><span>Aegis</span></h1>
        <p className="hero-sub">{BLUEPRINT.tagline}</p>
      </div>

      <div className="cards-top">
        <div className="verdict-card">
          <div className="card-eye">⚡ Advisor Verdict</div>
          <div className="card-text">{BLUEPRINT.verdict}</div>
        </div>
        <div className="move-card">
          <div className="card-eye">🎯 First Move — Do Today</div>
          <div className="card-text">{BLUEPRINT.firstMove}</div>
        </div>
      </div>

      <div className="body">
        <div className="section-label">Blueprint Sections</div>
        <div className="tabs">
          {BLUEPRINT.sections.map((sec, i) => (
            <button key={i} className={"tab" + (activeTab === i ? " active" : "")} onClick={() => setActiveTab(i)}>
              {sec.icon} {sec.title}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">{s.icon} {s.title}</div>
            <div className="card-sum">{s.summary}</div>
          </div>
          <div className="card-body">
            {s.items.map((item, i) => {
              let bold = "", rest = item;
              if (item.includes(" — ")) {
                const idx = item.indexOf(" — ");
                bold = item.slice(0, idx); rest = item.slice(idx + 3);
              } else if (item.match(/^[A-Z][^:]{2,30}: /)) {
                const idx = item.indexOf(": ");
                bold = item.slice(0, idx); rest = item.slice(idx + 2);
              }
              return (
                <div key={i} className="item">
                  <span className="item-n">0{i + 1}</span>
                  <span className="item-t">
                    {bold
                      ? <><strong>{bold}</strong>{item.includes(" — ") ? " — " : ": "}{rest}</>
                      : item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <hr />
        <div className="footer-note">aegis · $1k budget · 2-week build · $10k/month target · built with Claude</div>
      </div>
    </div>
  );
}
