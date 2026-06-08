// tests/stages.test.js — unit tests for server/deterministic.js
// Verifies output shape, field types, cross-stage data wiring, and edge cases.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  genProductForge, genRedTeam, genSafety, genWebsite, genDeploy,
} from '../server/deterministic.js';

// ── Synthetic prior-stage data ─────────────────────────────────────────────────

const NICHE = 'Independent Restaurants';

const mockResearch = {
  niche: NICHE,
  gap_score: 8,
  confirmed_pains: ['No-shows drain margins', 'Manual scheduling', 'No real-time ops data'],
  monthly_revenue_potential: '$18,000/mo',
  top_opportunity: 'AI scheduling cuts costs 22%',
  difficulty: 'medium',
  contrarian_insight: 'Most operators think they dont need AI',
  why_tools_fail: 'Generic tools arent built for this industry',
};

const mockStrategy = {
  strategy_name: 'Restaurant AI OS',
  revenue_model: 'Productized SaaS + Onboarding Fee',
  core_offer: 'Done-for-you AI installed in 2 weeks',
  pricing_tiers: [
    { tier: 'Starter',    price: '$497/mo',   what: 'Core automation + check-in',  customers_needed: 21 },
    { tier: 'Pro',        price: '$997/mo',   what: 'Full stack + weekly calls',    customers_needed: 11 },
    { tier: 'Enterprise', price: '$1,997/mo', what: 'Custom build + support',       customers_needed: 6 },
  ],
  top_channel: 'Instagram DMs + Google Maps cold email',
  day_30_goal: '$3,000 MRR',
  day_90_goal: '$10,000 MRR',
  unfair_advantage: 'Deep Restaurant domain knowledge',
  first_action: 'Build 50-owner outreach list',
};

const mockBuild = {
  product_name: 'RestaurantAI',
  tagline: 'Turn no-shows into revenue',
  core_capability: 'AI monitoring ops in real time',
  tech_stack: { frontend: 'React + Tailwind', backend: 'Node.js + Supabase', ai: 'Claude API', integration: 'Zapier + Make' },
  mvp_features: ['Smart scheduling', 'Review bot', 'Weekly digest', 'Re-engagement', 'ROI dashboard'],
  killer_prompt: 'You are an expert ops assistant for a restaurant',
  build_weeks: { week_1: 'Auth', week_2: 'AI scheduling', week_3: 'Reviews', week_4: 'Dashboard' },
  launch_checklist: ['3 pilot clients', 'Case study', 'Pricing page', 'Demo video', 'Outreach template'],
  demo_pitch: 'AI installed in your restaurant that eliminates top 3 time-wasters',
};

const mockOptimize = {
  optimization_score: 8,
  week_1_fixes: [{ fix: 'Guided wizard', impact: '40% drop-off reduction' }],
  revenue_levers: [{ lever: 'Annual plan', monthly_added: '+$1,200' }],
  churn_plays: ['Monthly ROI report', 'Day 14 check-in'],
  month_3_revenue: '$6,500 MRR',
  month_6_revenue: '$10,800 MRR',
  north_star: 'NRR',
  final_verdict: 'Real $10K/month within 6 months.',
};

// genRedTeam is self-contained; use its output for genSafety
const redTeamResult = genRedTeam(NICHE);

const mockAll = {
  research:  mockResearch,
  strategy:  mockStrategy,
  build:     mockBuild,
  optimize:  mockOptimize,
  redteam:   redTeamResult,
};

// ── genRedTeam ─────────────────────────────────────────────────────────────────

describe('genRedTeam', () => {
  test('returns required top-level fields', () => {
    const r = genRedTeam(NICHE);
    assert.ok(r.attack_summary,   'attack_summary');
    assert.ok(r.breach_score,     'breach_score');
    assert.ok(Array.isArray(r.attacks),          'attacks is array');
    assert.ok(Array.isArray(r.weaknesses),        'weaknesses is array');
    assert.ok(Array.isArray(r.modules_breached),  'modules_breached is array');
    assert.ok(Array.isArray(r.modules_clean),     'modules_clean is array');
    assert.ok(r.verdict,           'verdict');
  });

  test('produces exactly 6 attacks', () => {
    const { attacks } = genRedTeam(NICHE);
    assert.equal(attacks.length, 6);
  });

  test('each attack has required fields', () => {
    const { attacks } = genRedTeam(NICHE);
    for (const a of attacks) {
      assert.ok(a.vector,  `attack.vector for "${a.vector}"`);
      assert.ok(a.target,  `attack.target for "${a.vector}"`);
      assert.ok(a.sev,     `attack.sev for "${a.vector}"`);
      assert.ok(a.method,  `attack.method for "${a.vector}"`);
      assert.ok(a.code,    `attack.code for "${a.vector}"`);
    }
  });

  test('severity values are valid', () => {
    const valid = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
    const { attacks } = genRedTeam(NICHE);
    for (const a of attacks) {
      assert.ok(valid.has(a.sev), `invalid severity "${a.sev}"`);
    }
  });

  test('has at least one CRITICAL attack', () => {
    const { attacks } = genRedTeam(NICHE);
    assert.ok(attacks.some(a => a.sev === 'CRITICAL'), 'should have at least one CRITICAL attack');
  });

  test('verdict matches expected format', () => {
    const { verdict } = genRedTeam(NICHE);
    assert.ok(verdict.length > 0, 'verdict should not be empty');
    assert.ok(verdict.toUpperCase().includes('DEPLOY') || verdict.includes('DO NOT'), 'verdict should be actionable');
  });
});

// ── genSafety ──────────────────────────────────────────────────────────────────

describe('genSafety', () => {
  test('returns required top-level fields', () => {
    const s = genSafety(NICHE, redTeamResult);
    assert.ok(Array.isArray(s.patches),           'patches is array');
    assert.ok(Array.isArray(s.security_layers),   'security_layers is array');
    assert.ok(s.safety_score_before,              'safety_score_before');
    assert.ok(s.safety_score_after,               'safety_score_after');
    assert.ok(s.recommendation,                   'recommendation');
    assert.ok(Array.isArray(s.deployment_checklist), 'deployment_checklist is array');
    assert.ok(s.final_verdict,                    'final_verdict');
    assert.ok(typeof s.auto_responses === 'object', 'auto_responses is object');
  });

  test('number of patches matches number of redteam attacks', () => {
    const s = genSafety(NICHE, redTeamResult);
    assert.equal(s.patches.length, redTeamResult.attacks.length);
  });

  test('each patch is marked PATCHED', () => {
    const { patches } = genSafety(NICHE, redTeamResult);
    for (const p of patches) {
      assert.equal(p.status, 'PATCHED', `patch for "${p.vector}" should be PATCHED`);
    }
  });

  test('has 7 security layers', () => {
    const { security_layers } = genSafety(NICHE, redTeamResult);
    assert.equal(security_layers.length, 7);
  });

  test('recommendation signals clearance', () => {
    const { recommendation } = genSafety(NICHE, redTeamResult);
    assert.ok(recommendation.toUpperCase().includes('CLEARED') || recommendation.toUpperCase().includes('PRODUCTION'),
      'recommendation should clear for deployment');
  });

  test('score improves after patches', () => {
    const { safety_score_before, safety_score_after } = genSafety(NICHE, redTeamResult);
    const parse = s => parseFloat(s.split('/')[0]);
    assert.ok(parse(safety_score_after) > parse(safety_score_before),
      'score after patches should exceed score before');
  });
});

// ── genProductForge ────────────────────────────────────────────────────────────

describe('genProductForge', () => {
  test('returns required top-level fields', () => {
    const f = genProductForge(NICHE, mockAll);
    assert.ok(Array.isArray(f.agent_contributions),     'agent_contributions');
    assert.ok(Array.isArray(f.modules),                 'modules');
    assert.ok(Array.isArray(f.inter_module_messages),   'inter_module_messages');
    assert.ok(f.deployable_package,                     'deployable_package');
    assert.ok(f.forge_summary,                          'forge_summary');
  });

  test('has exactly 7 agent contributions (one per prior stage)', () => {
    const { agent_contributions } = genProductForge(NICHE, mockAll);
    assert.equal(agent_contributions.length, 7);
  });

  test('has exactly 7 modules', () => {
    const { modules } = genProductForge(NICHE, mockAll);
    assert.equal(modules.length, 7);
  });

  test('each module has endpoint and desc', () => {
    const { modules } = genProductForge(NICHE, mockAll);
    for (const m of modules) {
      assert.ok(m.name,     `module.name missing`);
      assert.ok(m.endpoint, `module.endpoint missing for "${m.name}"`);
      assert.ok(m.desc,     `module.desc missing for "${m.name}"`);
    }
  });

  test('deployable_package has required infra keys', () => {
    const { deployable_package } = genProductForge(NICHE, mockAll);
    assert.ok(deployable_package.repo,       'repo');
    assert.ok(deployable_package.deploy,     'deploy');
    assert.ok(deployable_package.ci_cd,      'ci_cd');
    assert.ok(Array.isArray(deployable_package.env_vars), 'env_vars');
    assert.ok(deployable_package.infra_cost, 'infra_cost');
  });

  test('inter-module messages reference modules by name', () => {
    const { modules, inter_module_messages } = genProductForge(NICHE, mockAll);
    const moduleNames = new Set(modules.map(m => m.name));
    for (const msg of inter_module_messages) {
      assert.ok(moduleNames.has(msg.from) || moduleNames.has(msg.to),
        `message between "${msg.from}" → "${msg.to}" should reference known modules`);
    }
  });
});

// ── genWebsite ─────────────────────────────────────────────────────────────────

describe('genWebsite', () => {
  const safetyResult = genSafety(NICHE, redTeamResult);
  const allWithSafety = { ...mockAll, safety: safetyResult };

  test('returns required top-level fields', () => {
    const w = genWebsite(NICHE, allWithSafety);
    assert.ok(w.product_name,               'product_name');
    assert.equal(w.niche, NICHE,            'niche matches');
    assert.ok(typeof w.html === 'string',   'html is string');
    assert.ok(Array.isArray(w.sections),    'sections is array');
    assert.ok(w.pages_built >= 1,           'pages_built >= 1');
    assert.ok(w.lines_of_html > 50,         'lines_of_html > 50');
    assert.equal(w.responsive, true,        'responsive flag');
    assert.equal(w.security_integrated, true, 'security_integrated flag');
  });

  test('HTML starts with DOCTYPE', () => {
    const { html } = genWebsite(NICHE, allWithSafety);
    assert.ok(html.startsWith('<!DOCTYPE html>'), 'should be valid HTML document');
  });

  test('HTML contains the product name', () => {
    const w = genWebsite(NICHE, allWithSafety);
    assert.ok(w.html.includes(w.product_name), 'product name should appear in HTML');
  });

  test('produces 7 sections', () => {
    const { sections } = genWebsite(NICHE, allWithSafety);
    assert.equal(sections.length, 7);
  });

  test('HTML references security score from Safety Agent', () => {
    const w = genWebsite(NICHE, allWithSafety);
    assert.ok(w.html.includes('9.3') || w.html.includes('/10'), 'security score should appear in HTML');
  });

  test('works with missing prior data (fallbacks applied)', () => {
    const w = genWebsite(NICHE, {});
    assert.ok(w.html.startsWith('<!DOCTYPE html>'), 'should produce HTML even with empty all object');
    assert.ok(w.lines_of_html > 50, 'should produce substantial HTML');
  });

  test('product_name derives from niche', () => {
    const w = genWebsite(NICHE, allWithSafety);
    const expected = NICHE.split(' ')[0] + 'AI';
    assert.equal(w.product_name, expected);
  });
});

// ── genDeploy ──────────────────────────────────────────────────────────────────

describe('genDeploy', () => {
  const safetyResult = genSafety(NICHE, redTeamResult);
  const websiteResult = genWebsite(NICHE, { ...mockAll, safety: safetyResult });
  const allWithWebsite = { ...mockAll, safety: safetyResult, website: websiteResult };

  test('returns status deployed', () => {
    const d = genDeploy(NICHE, allWithWebsite);
    assert.equal(d.status, 'deployed');
  });

  test('carries html from website stage', () => {
    const d = genDeploy(NICHE, allWithWebsite);
    assert.ok(d.html.startsWith('<!DOCTYPE html>'), 'deploy.html should be the generated website HTML');
  });

  test('includes deploy_targets', () => {
    const { deploy_targets } = genDeploy(NICHE, allWithWebsite);
    assert.ok(Array.isArray(deploy_targets), 'deploy_targets is array');
    assert.ok(deploy_targets.length >= 3, 'should have at least 3 deploy targets');
    const names = deploy_targets.map(t => t.name);
    assert.ok(names.includes('Vercel'), 'should include Vercel');
    assert.ok(names.includes('Netlify'), 'should include Netlify');
  });

  test('includes edit_capabilities', () => {
    const { edit_capabilities } = genDeploy(NICHE, allWithWebsite);
    assert.ok(Array.isArray(edit_capabilities) && edit_capabilities.length > 0, 'edit_capabilities populated');
  });

  test('returns error status when website is missing', () => {
    const d = genDeploy(NICHE, {});
    assert.equal(d.status, 'error', 'should gracefully handle missing website output');
  });
});

// ── cross-stage data flow ──────────────────────────────────────────────────────

describe('cross-stage data flow', () => {
  test('genSafety patches map 1:1 to redTeam attacks', () => {
    const rt = genRedTeam(NICHE);
    const safety = genSafety(NICHE, rt);
    // Each patch should reference a vector from the attacks
    const attackVectors = new Set(rt.attacks.map(a => a.vector));
    for (const p of safety.patches) {
      assert.ok(attackVectors.has(p.vector),
        `safety patch vector "${p.vector}" should exist in redTeam attacks`);
    }
  });

  test('genWebsite embeds pain points from research', () => {
    const safetyResult = genSafety(NICHE, redTeamResult);
    const w = genWebsite(NICHE, { ...mockAll, safety: safetyResult });
    // The first confirmed pain should appear in the HTML
    const pain = mockResearch.confirmed_pains[0].toLowerCase().slice(0, 20);
    assert.ok(w.html.toLowerCase().includes(pain),
      `HTML should embed research pain: "${pain}"`);
  });

  test('genDeploy html matches genWebsite html', () => {
    const safetyResult = genSafety(NICHE, redTeamResult);
    const websiteResult = genWebsite(NICHE, { ...mockAll, safety: safetyResult });
    const d = genDeploy(NICHE, { ...mockAll, safety: safetyResult, website: websiteResult });
    assert.equal(d.html, websiteResult.html, 'deploy html should be identical to website html');
  });

  test('genProductForge forge_summary mentions all 7 agents', () => {
    const { forge_summary } = genProductForge(NICHE, mockAll);
    assert.ok(forge_summary.includes('7'), 'forge summary should reference 7 agents');
  });
});
