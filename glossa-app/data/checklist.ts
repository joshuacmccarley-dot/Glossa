export type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  priority: "critical" | "high" | "medium";
};

export type Phase = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  items: ChecklistItem[];
};

export const phases: Phase[] = [
  {
    id: "foundation",
    title: "Phase 1 — Foundation",
    subtitle: "Website, brand, and infrastructure",
    icon: "⚔️",
    color: "navy",
    items: [
      { id: "f1", label: "Build core website (Home, Learn, Connect, Pricing, How It Works)", description: "Public-facing marketing site live and deployed", priority: "critical" },
      { id: "f2", label: "Add brand logo to all pages", description: "SVG logo in Nav and Footer", priority: "critical" },
      { id: "f3", label: "Deploy to Vercel", description: "Connect GitHub repo to Vercel for auto-deploys on push", priority: "critical" },
      { id: "f4", label: "Configure custom domain (glossaapp.com or similar)", description: "Point domain DNS to Vercel deployment", priority: "critical" },
      { id: "f5", label: "Set up analytics (Plausible or GA4)", description: "Track page views, signups, and conversion funnels", priority: "high" },
      { id: "f6", label: "Configure email capture (ConvertKit or Resend)", description: "Waitlist emails flow into a list you can message", priority: "critical" },
      { id: "f7", label: "Add Open Graph / social preview images", description: "Every page shows a branded preview when shared on social", priority: "high" },
      { id: "f8", label: "Set up Sentry error monitoring", description: "Catch frontend errors in production automatically", priority: "medium" },
      { id: "f9", label: "Configure SEO metadata on all pages", description: "Title, description, canonical URLs, robots.txt, sitemap.xml", priority: "high" },
    ],
  },
  {
    id: "tech",
    title: "Phase 2 — Technical Stack",
    subtitle: "Backend, AI, auth, and real-time infrastructure",
    icon: "🛠️",
    color: "royal",
    items: [
      { id: "t1", label: "Set up Clerk authentication", description: "Social login (Google, Apple), email/password, MFA", priority: "critical" },
      { id: "t2", label: "Configure PostgreSQL database (Railway or Neon)", description: "User accounts, learning progress, vocabulary history", priority: "critical" },
      { id: "t3", label: "Set up Redis cache (Upstash)", description: "Real-time session data and translation caching", priority: "high" },
      { id: "t4", label: "Connect Claude API for learning engine", description: "Adaptive curriculum generation and conversation practice", priority: "critical" },
      { id: "t5", label: "Connect DeepL or Claude API for translation", description: "Power the Glossa Connect real-time translation layer", priority: "critical" },
      { id: "t6", label: "Implement Socket.io WebSocket server", description: "Live bidirectional translation for the Connect product", priority: "high" },
      { id: "t7", label: "Set up BullMQ job queue", description: "Async AI processing without blocking the UI", priority: "high" },
      { id: "t8", label: "Integrate ElevenLabs for TTS pronunciation", description: "Native-speaker audio for vocabulary and dialogue practice", priority: "medium" },
      { id: "t9", label: "Deploy WebSocket server to Railway", description: "Persistent server for Socket.io (Vercel is serverless)", priority: "high" },
      { id: "t10", label: "Build browser extension (Glossa Connect overlay)", description: "Chrome/Firefox extension for inline real-time translation", priority: "high" },
    ],
  },
  {
    id: "prelaunch",
    title: "Phase 3 — Pre-Launch",
    subtitle: "Community seeding and launch preparation",
    icon: "🎯",
    color: "gold",
    items: [
      { id: "p1", label: "Create and warm up Reddit account", description: "Begin genuine participation in r/languagelearning, r/expats, r/immigration", priority: "critical" },
      { id: "p2", label: "Join 5 Discord language learning servers", description: "Language Cafe, Language Learning Community, niche language servers", priority: "critical" },
      { id: "p3", label: "Create TikTok account and post 3 demo videos", description: "Show real-time translation in surprising real-world scenarios", priority: "critical" },
      { id: "p4", label: "Create LinkedIn company page", description: "B2B credibility and organic content distribution", priority: "high" },
      { id: "p5", label: "Create Twitter/X account", description: "Builder narrative, tech community, and language learner community", priority: "high" },
      { id: "p6", label: "Set up Product Hunt 'Coming Soon' page", description: "2 weeks before launch to build a follower base", priority: "critical" },
      { id: "p7", label: "Line up 50+ Product Hunt supporters", description: "Friends, communities, early users who will upvote on launch day", priority: "critical" },
      { id: "p8", label: "Email outreach to 15 language learning bloggers", description: "Fluent in 3 Months, All Language Resources, Lingo Mastery, etc.", priority: "high" },
      { id: "p9", label: "Personal outreach to 50 target users", description: "DM healthcare workers, immigrants, remote workers offering free beta", priority: "critical" },
      { id: "p10", label: "Contact 5 Discord server admins for partnerships", description: "Offer free Glossa Pro in exchange for pinned announcement", priority: "high" },
    ],
  },
  {
    id: "launch",
    title: "Phase 4 — Launch Week",
    subtitle: "Go live and drive first 500 users",
    icon: "🚀",
    color: "orange",
    items: [
      { id: "l1", label: "Launch on Product Hunt (Tue–Thu)", description: "Coordinate all supporters — respond to every comment within minutes", priority: "critical" },
      { id: "l2", label: "Post 'Show HN' on Hacker News same day", description: "Technical angle: AI-powered language learning + real-time translation", priority: "critical" },
      { id: "l3", label: "Post launch thread in r/languagelearning", description: "Founder story post — not promotional. 'I built this because...'", priority: "critical" },
      { id: "l4", label: "Send launch email to full waitlist", description: "Personal, story-driven email with the Product Hunt link", priority: "critical" },
      { id: "l5", label: "Announce on LinkedIn with founder post", description: "Case study angle: 'Language barriers cost immigrants 25–40% income'", priority: "high" },
      { id: "l6", label: "Post TikTok launch video", description: "'We just launched' framing with the real-time translation demo", priority: "high" },
      { id: "l7", label: "Go live in 5 Discord server partner announcements", description: "Coordinate all server admin posts on launch day", priority: "high" },
      { id: "l8", label: "Monitor and respond to all comments within 1 hour", description: "Product Hunt, HN, Reddit, Discord — speed of response = momentum", priority: "critical" },
    ],
  },
  {
    id: "growth",
    title: "Phase 5 — Growth (Month 1)",
    subtitle: "Reach 1,000 users and first revenue",
    icon: "📈",
    color: "navy",
    items: [
      { id: "g1", label: "Reach 100 users", description: "First major milestone — validate the channel mix", priority: "critical" },
      { id: "g2", label: "Reach 250 users", description: "Quarter of the way to the 1,000-user goal", priority: "critical" },
      { id: "g3", label: "Reach 500 users", description: "Halfway — double down on the top 2 acquisition channels", priority: "critical" },
      { id: "g4", label: "Reach 1,000 users in 30 days", description: "The core Month 1 goal", priority: "critical" },
      { id: "g5", label: "First paid subscriber", description: "Someone converts from free trial to paid plan", priority: "critical" },
      { id: "g6", label: "Reach $100 MRR", description: "First revenue milestone — proof of willingness to pay", priority: "high" },
      { id: "g7", label: "Publish 4 SEO blog posts", description: "Target: 'language learning for healthcare workers', 'real-time translation app'", priority: "high" },
      { id: "g8", label: "Secure first YouTuber review", description: "Mid-tier language learning YouTuber (50K–500K subscribers)", priority: "high" },
      { id: "g9", label: "Launch referral program ('Refer 3, get 3 months free')", description: "Turn every satisfied user into a distribution channel", priority: "high" },
      { id: "g10", label: "Post '100/500/1000 users' milestone update on Reddit", description: "Progress posts go viral in builder and language communities", priority: "medium" },
    ],
  },
  {
    id: "scale",
    title: "Phase 6 — Scale (Month 2+)",
    subtitle: "Product expansion, revenue growth, and market penetration",
    icon: "🌍",
    color: "orange",
    items: [
      { id: "s1", label: "Launch iOS app on the App Store", description: "Mobile-first experience for language learning on the go", priority: "critical" },
      { id: "s2", label: "Launch Android app on Google Play", description: "Android represents 72% of global smartphone market", priority: "critical" },
      { id: "s3", label: "Reach $1,000 MRR", description: "Meaningful recurring revenue — early product-market fit signal", priority: "critical" },
      { id: "s4", label: "Close first enterprise pilot", description: "Healthcare system, staffing agency, or multinational team", priority: "high" },
      { id: "s5", label: "Reach 10,000 total users", description: "10x the launch milestone — scale what worked in Month 1", priority: "high" },
      { id: "s6", label: "Reach $5,000 MRR", description: "Sustainable growth trajectory established", priority: "high" },
      { id: "s7", label: "Launch healthcare sector vertical", description: "Dedicated marketing, track, and certification prep for healthcare workers", priority: "high" },
      { id: "s8", label: "Launch affiliate program", description: "Language learning bloggers and YouTubers earn % on referrals", priority: "medium" },
      { id: "s9", label: "Publish partnership with 1 healthcare or immigration org", description: "Institutional credibility unlocks B2B sales pipeline", priority: "medium" },
      { id: "s10", label: "Raise pre-seed or angel funding", description: "Use user growth and MRR traction to raise $250K–$1M", priority: "medium" },
    ],
  },
];
