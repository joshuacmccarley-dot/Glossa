// server/prompts.js — Claude prompt templates for each pipeline stage

export function researchPrompt(niche) {
  return `You are a market research analyst specializing in AI adoption for small businesses.

Analyze the "${niche}" niche for an AI SaaS opportunity. Be specific, data-driven, and brutally honest.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "niche": "${niche}",
  "gap_score": <integer 1-10, how underserved by AI tools — 10 = massive gap>,
  "confirmed_pains": ["<specific operational pain 1>", "<specific pain 2>", "<specific pain 3>"],
  "why_tools_fail": "<1-2 sentences: why generic SaaS tools fail this specific niche>",
  "top_opportunity": "<the single highest-ROI AI automation for this niche>",
  "monthly_revenue_potential": "<e.g. '$18,000/mo' — realistic for a focused AI SaaS at $497-$1997/mo>",
  "difficulty": "<'easy' | 'medium' | 'hard'>",
  "contrarian_insight": "<non-obvious insight about AI adoption in this niche that most people miss>"
}`;
}

export function strategyPrompt(niche, research) {
  return `You are a go-to-market strategist for a bootstrapped AI SaaS targeting ${niche}.

Research context:
- Gap score: ${research.gap_score}/10
- Top pain: ${research.confirmed_pains?.[0]}
- Opportunity: ${research.top_opportunity}
- Revenue potential: ${research.monthly_revenue_potential}

Design a $10K/month revenue strategy. Return ONLY valid JSON:
{
  "strategy_name": "<niche> AI Operating System",
  "revenue_model": "<e.g. Productized SaaS + Onboarding Fee>",
  "core_offer": "<1-sentence done-for-you offer>",
  "pricing_tiers": [
    {"tier": "Starter", "price": "$497/mo", "what": "<what's included>", "customers_needed": <integer>},
    {"tier": "Pro",     "price": "$997/mo", "what": "<what's included>", "customers_needed": <integer>},
    {"tier": "Enterprise", "price": "$1,997/mo", "what": "<what's included>", "customers_needed": <integer>}
  ],
  "top_channel": "<best acquisition channel for this niche>",
  "day_30_goal": "<MRR target and how>",
  "day_90_goal": "<MRR target and how>",
  "unfair_advantage": "<why you win before any tech company arrives>",
  "first_action": "<the single most important action to take today>"
}`;
}

export function buildPrompt(niche, research, strategy) {
  return `You are a product architect building an AI SaaS for ${niche} owners.

Context:
- Core pain: ${research.confirmed_pains?.[0]}
- Core offer: ${strategy.core_offer}
- Top channel: ${strategy.top_channel}

Design the MVP. Return ONLY valid JSON:
{
  "product_name": "<NicheWordAI>",
  "tagline": "<turn [pain] into [benefit]>",
  "core_capability": "<1 sentence: what the AI actually does>",
  "tech_stack": {"frontend": "React + Tailwind", "backend": "Node.js + Supabase", "ai": "Claude API", "integration": "Zapier + Make"},
  "mvp_features": [
    "<feature 1 — most impactful>",
    "<feature 2>",
    "<feature 3>",
    "<feature 4>",
    "<feature 5>"
  ],
  "killer_prompt": "<the Claude system prompt that powers the core AI agent for ${niche}>",
  "build_weeks": {"week_1": "<tasks>", "week_2": "<tasks>", "week_3": "<tasks>", "week_4": "<tasks>"},
  "launch_checklist": ["<item 1>", "<item 2>", "<item 3>", "<item 4>", "<item 5>"],
  "demo_pitch": "<1-2 sentence demo pitch to a ${niche} owner>"
}`;
}

export function testPrompt(niche, build) {
  return `You are a QA analyst and user researcher simulating launch testing for a ${niche} AI SaaS.

Product: ${build.product_name}
Features: ${build.mvp_features?.join(', ')}

Run realistic tests and user simulations. Return ONLY valid JSON:
{
  "readiness_score": <integer 1-10>,
  "tests": [
    {"name": "Core Workflow",       "result": "pass|warning|fail", "finding": "<specific finding>"},
    {"name": "AI Response Quality", "result": "pass|warning|fail", "finding": "<specific finding>"},
    {"name": "Onboarding Friction", "result": "pass|warning|fail", "finding": "<specific finding>"},
    {"name": "Mobile Experience",   "result": "pass|warning|fail", "finding": "<specific finding>"},
    {"name": "ROI Visibility",      "result": "pass|warning|fail", "finding": "<specific finding>"}
  ],
  "user_simulations": [
    {"type": "Owner (50s)", "sentiment": "positive|neutral|negative", "quote": "<realistic quote>", "concern": "<their concern>"},
    {"type": "Manager (30s)", "sentiment": "positive|neutral|negative", "quote": "<realistic quote>", "concern": "<their concern>"},
    {"type": "Staff (20s)",  "sentiment": "positive|neutral|negative", "quote": "<realistic quote>", "concern": "<their concern>"}
  ],
  "top_objections": ["<objection 1>", "<objection 2>", "<objection 3>"],
  "trial_to_paid": "<e.g. '21%'>",
  "biggest_dropoff": "<where users drop off most>",
  "verdict": "LAUNCH NOW | NEEDS WORK | DO NOT LAUNCH",
  "verdict_reason": "<2 sentences justifying the verdict>"
}`;
}

export function optimizePrompt(niche, test, strategy) {
  return `You are a SaaS growth engineer optimizing a ${niche} AI product post-launch.

Test results: readiness ${test.readiness_score}/10
Top issues: ${test.tests?.filter(t => t.result !== 'pass').map(t => t.finding).join('; ')}
Conversion: ${test.trial_to_paid}
Drop-off: ${test.biggest_dropoff}
Pricing: ${strategy.pricing_tiers?.map(t => t.price).join(' / ')}

Return ONLY valid JSON:
{
  "optimization_score": <integer 1-10>,
  "week_1_fixes": [
    {"fix": "<specific fix>", "impact": "<measurable impact>"},
    {"fix": "<specific fix>", "impact": "<measurable impact>"},
    {"fix": "<specific fix>", "impact": "<measurable impact>"}
  ],
  "revenue_levers": [
    {"lever": "<pricing or packaging change>", "monthly_added": "<+$X>"},
    {"lever": "<retention or expansion move>", "monthly_added": "<+$X>"}
  ],
  "churn_plays": ["<play 1>", "<play 2>", "<play 3>"],
  "month_3_revenue": "<e.g. '$6,500 MRR'>",
  "month_6_revenue": "<e.g. '$10,800 MRR'>",
  "north_star": "<single metric to track>",
  "final_verdict": "<2-3 sentence realistic growth outlook>"
}`;
}

export function implementPrompt(niche, research, strategy, build, test, optimize) {
  return `You are a lead engineer synthesizing all signals into a concrete implementation plan for a ${niche} AI SaaS.

Signals:
- Research: gap ${research.gap_score}/10, pain: ${research.confirmed_pains?.[0]}
- Strategy: ${strategy.core_offer}, price: ${strategy.pricing_tiers?.[1]?.price} Pro tier
- Build: ${build.product_name}, lead feature: ${build.mvp_features?.[0]}
- Test: fix first: ${test.tests?.find(t => t.result === 'warning')?.finding}
- Optimize: north star: ${optimize.north_star}

Return ONLY valid JSON:
{
  "agent_signals": [
    {"from": "Research Agent", "directive": "<key directive>", "priority": "CRITICAL|HIGH|MEDIUM"},
    {"from": "Strategy Agent", "directive": "<key directive>", "priority": "CRITICAL|HIGH|MEDIUM"},
    {"from": "Build Agent",    "directive": "<key directive>", "priority": "CRITICAL|HIGH|MEDIUM"},
    {"from": "Test Agent",     "directive": "<key directive>", "priority": "CRITICAL|HIGH|MEDIUM"},
    {"from": "Optimize Agent", "directive": "<key directive>", "priority": "CRITICAL|HIGH|MEDIUM"}
  ],
  "what_we_are_building": "<2-3 sentences: concrete product description>",
  "architecture": {
    "Frontend": "<specific stack and screens>",
    "Backend": "<specific stack and endpoints>",
    "AI Layer": "<how Claude is integrated>",
    "Automation": "<specific automation triggers>",
    "Notifications": "<channels and tools>"
  },
  "file_structure": ["<path — description>", "<path — description>", "<path — description>", "<path — description>", "<path — description>", "<path — description>"],
  "build_timeline": [
    {"week": 1, "tasks": ["<task>", "<task>", "<task>"]},
    {"week": 2, "tasks": ["<task>", "<task>", "<task>"]},
    {"week": 3, "tasks": ["<task>", "<task>", "<task>"]},
    {"week": 4, "tasks": ["<task>", "<task>", "<task>"]}
  ],
  "cross_agent_optimizations": ["<optimization 1>", "<optimization 2>", "<optimization 3>", "<optimization 4>"],
  "code_snippets": {
    "ops-agent.js": "<10-15 lines of real, working Node.js code for the core AI agent>",
    "webhook.js": "<10-15 lines of real Express webhook handler>",
    "roi.js": "<10-15 lines of ROI calculation function>"
  },
  "launch_sequence": ["<day 1 action>", "<day 2-3>", "<day 4-5>", "<day 6-7>", "<day 8+>"],
  "dev_cost": "<realistic estimate>",
  "days_to_first_dollar": "<integer as string, e.g. '18 days'>",
  "builder_confidence": "<X.X/10 — reason>"
}`;
}

export function backtestPrompt(niche, optimize) {
  return `You are a financial modeler stress-testing a ${niche} AI SaaS business model.

Base metrics: month 3 target ${optimize.month_3_revenue}, month 6 target ${optimize.month_6_revenue}

Run a 6-month Monte Carlo simulation with 3 scenarios. Return ONLY valid JSON:
{
  "summary": "<2 sentences: headline result of the simulation>",
  "growth_model": [
    {"month": "M1", "outreach": <int>, "trials": <int>, "converted": <int>, "churned": <int>, "clients": <int>, "mrr": <int>, "on_track": <bool>},
    {"month": "M2", "outreach": <int>, "trials": <int>, "converted": <int>, "churned": <int>, "clients": <int>, "mrr": <int>, "on_track": <bool>},
    {"month": "M3", "outreach": <int>, "trials": <int>, "converted": <int>, "churned": <int>, "clients": <int>, "mrr": <int>, "on_track": <bool>},
    {"month": "M4", "outreach": <int>, "trials": <int>, "converted": <int>, "churned": <int>, "clients": <int>, "mrr": <int>, "on_track": <bool>},
    {"month": "M5", "outreach": <int>, "trials": <int>, "converted": <int>, "churned": <int>, "clients": <int>, "mrr": <int>, "on_track": <bool>},
    {"month": "M6", "outreach": <int>, "trials": <int>, "converted": <int>, "churned": <int>, "clients": <int>, "mrr": <int>, "on_track": <bool>}
  ],
  "stress_tests": [
    {"scenario": "Bear (50% lower conv)", "conv": "<pct>", "churn": "<pct>", "m3": "<$>", "m6": "<$>", "prob": "15%", "verdict": "<action>"},
    {"scenario": "Base (modeled)",        "conv": "<pct>", "churn": "<pct>", "m3": "<$>", "m6": "<$>", "prob": "55%", "verdict": "<action>"},
    {"scenario": "Bull (word-of-mouth)",  "conv": "<pct>", "churn": "<pct>", "m3": "<$>", "m6": "<$>", "prob": "30%", "verdict": "<action>"}
  ],
  "assumptions": [
    {"a": "<assumption>", "conf": "HIGH|MEDIUM|LOW", "v": "<validation>"},
    {"a": "<assumption>", "conf": "HIGH|MEDIUM|LOW", "v": "<validation>"},
    {"a": "<assumption>", "conf": "HIGH|MEDIUM|LOW", "v": "<validation>"},
    {"a": "<assumption>", "conf": "HIGH|MEDIUM|LOW", "v": "<validation>"}
  ],
  "red_flags": [
    {"flag": "<risk>", "sev": "HIGH|MEDIUM|LOW", "fix": "<mitigation>"},
    {"flag": "<risk>", "sev": "HIGH|MEDIUM|LOW", "fix": "<mitigation>"},
    {"flag": "<risk>", "sev": "HIGH|MEDIUM|LOW", "fix": "<mitigation>"}
  ],
  "final_score": "<X.X/10>",
  "go_no_go": "GO | NO-GO",
  "go_no_go_reason": "<2 sentences>",
  "kill_conditions": ["<condition 1>", "<condition 2>", "<condition 3>"]
}`;
}

export function prospectPrompt(niche, research, build) {
  return `You are a business development specialist locating high-intent prospects for a ${niche} AI SaaS.

Product: ${build?.product_name}
Core pain solved: ${research?.confirmed_pains?.[0]}
Offer: ${build?.demo_pitch}

Generate a realistic, specific prospect locator playbook. Return ONLY valid JSON:
{
  "target_profile": {
    "size": "<employee count range>",
    "revenue_range": "<annual revenue range>",
    "tech_maturity": "<description of their current tech>",
    "decision_maker": "<who to contact and why>",
    "best_time": "<when to reach them>"
  },
  "search_queries": [
    "<specific Google/Yelp/Maps search string 1>",
    "<specific search string 2>",
    "<specific search string 3>"
  ],
  "directories": ["<directory 1>", "<directory 2>", "<directory 3>", "<directory 4>"],
  "social_signals": [
    "<hashtag or LinkedIn filter 1>",
    "<hashtag or filter 2>",
    "<hashtag or filter 3>",
    "<hashtag or filter 4>"
  ],
  "prospect_list": [
    {"name": "<realistic business name — City ST>", "location": "<City ST>", "signal": "<specific pain signal observed>", "priority": "HIGH|MEDIUM|LOW", "channel": "<outreach channel>", "est_mrr": "$497|$997|$1,997"},
    {"name": "<name>", "location": "<loc>", "signal": "<signal>", "priority": "HIGH", "channel": "<channel>", "est_mrr": "$997"},
    {"name": "<name>", "location": "<loc>", "signal": "<signal>", "priority": "HIGH", "channel": "<channel>", "est_mrr": "$1,997"},
    {"name": "<name>", "location": "<loc>", "signal": "<signal>", "priority": "MEDIUM", "channel": "<channel>", "est_mrr": "$497"},
    {"name": "<name>", "location": "<loc>", "signal": "<signal>", "priority": "MEDIUM", "channel": "<channel>", "est_mrr": "$997"},
    {"name": "<name>", "location": "<loc>", "signal": "<signal>", "priority": "MEDIUM", "channel": "<channel>", "est_mrr": "$997"},
    {"name": "<name>", "location": "<loc>", "signal": "<signal>", "priority": "LOW", "channel": "<channel>", "est_mrr": "$497"},
    {"name": "<name>", "location": "<loc>", "signal": "<signal>", "priority": "LOW", "channel": "<channel>", "est_mrr": "$1,997"}
  ],
  "outreach_sequence": [
    {"day": 1, "channel": "Cold Email",          "action": "<specific action for ${niche}>",   "cta": "<call to action>"},
    {"day": 3, "channel": "Follow-up Email",      "action": "<follow-up action>",               "cta": "<call to action>"},
    {"day": 5, "channel": "Instagram/LinkedIn DM","action": "<DM action>",                      "cta": "<call to action>"},
    {"day": 7, "channel": "Break-up Email",       "action": "<final touch action>",             "cta": "<call to action>"}
  ],
  "email_template": "<full personalized email template with [placeholders] for ${niche}>",
  "dm_template": "<short DM template for ${niche}>",
  "free_value_offer": "<specific free audit or value drop for ${niche} owners>",
  "tools_to_find_contacts": ["Hunter.io — find owner email from domain", "<tool 2>", "<tool 3>", "<tool 4>", "<tool 5>"],
  "weekly_targets": {"outreach": 50, "expected_trials": 4, "expected_paid": 1, "projected_mrr_m3": "$5,000+"},
  "locator_confidence": "<X.X/10 — reason>"
}`;
}
