// tests/pipeline.test.js — full 13-stage pipeline integration test
// Starts a real HTTP server with a mock Claude, runs the SSE pipeline,
// verifies every stage fires, parallel groups start together, and
// data flows correctly between stages.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp, STAGE_IDS, PARALLEL_PAIRS } from '../server/app.js';

// ── Mock Claude ────────────────────────────────────────────────────────────────
// Returns realistic data for each stage, detected by unique strings in the prompt.

function mockClaude(prompt) {
  if (prompt.includes('market research analyst')) {
    return Promise.resolve({
      niche: 'test', gap_score: 8,
      confirmed_pains: ['No-shows drain margins', 'Manual scheduling', 'No real-time data'],
      monthly_revenue_potential: '$18,000/mo',
      top_opportunity: 'AI scheduling', difficulty: 'medium',
      contrarian_insight: 'Most operators think they dont need AI',
      why_tools_fail: 'Generic tools',
    });
  }
  if (prompt.includes('go-to-market strategist')) {
    return Promise.resolve({
      strategy_name: 'Test AI OS', revenue_model: 'Productized SaaS',
      core_offer: 'Done-for-you AI', top_channel: 'Instagram DMs',
      pricing_tiers: [
        { tier: 'Starter', price: '$497/mo', what: 'Core', customers_needed: 21 },
        { tier: 'Pro',     price: '$997/mo', what: 'Full', customers_needed: 11 },
        { tier: 'Enterprise', price: '$1,997/mo', what: 'Custom', customers_needed: 6 },
      ],
      day_30_goal: '$3,000 MRR', day_90_goal: '$10,000 MRR',
      unfair_advantage: 'Deep domain knowledge', first_action: 'Build list',
    });
  }
  if (prompt.includes('product architect')) {
    return Promise.resolve({
      product_name: 'MockAI', tagline: 'Turn problems into advantage',
      core_capability: 'AI monitoring ops',
      tech_stack: { frontend: 'React', backend: 'Node.js', ai: 'Claude API', integration: 'Zapier' },
      mvp_features: ['Smart scheduling', 'Review bot', 'Weekly digest', 'Re-engagement', 'ROI dashboard'],
      killer_prompt: 'You are an expert ops assistant',
      build_weeks: { week_1: 'Auth', week_2: 'AI', week_3: 'Reviews', week_4: 'Dashboard' },
      launch_checklist: ['3 pilots', 'Case study', 'Pricing page', 'Demo video', 'Outreach'],
      demo_pitch: 'AI installed in 2 hours. ROI in week one.',
    });
  }
  if (prompt.includes('QA analyst')) {
    return Promise.resolve({
      readiness_score: 7,
      tests: [
        { name: 'Core Workflow',       result: 'pass',    finding: 'Works' },
        { name: 'AI Response Quality', result: 'pass',    finding: 'On-brand' },
        { name: 'Onboarding Friction', result: 'warning', finding: 'Step 3 causes drop-off' },
        { name: 'Mobile Experience',   result: 'pass',    finding: 'Readable' },
        { name: 'ROI Visibility',      result: 'warning', finding: 'Needs attribution' },
      ],
      user_simulations: [
        { type: 'Owner (50s)',   sentiment: 'positive', quote: 'Worth $500/mo', concern: 'Setup' },
        { type: 'Manager (30s)', sentiment: 'positive', quote: 'Digest is worth it', concern: 'Control' },
        { type: 'Staff (20s)',   sentiment: 'neutral',  quote: 'If it helps', concern: 'Replacement' },
      ],
      top_objections: ['Already using tools', 'No time', 'Mistakes risk'],
      trial_to_paid: '21%', biggest_dropoff: 'Integration setup',
      verdict: 'LAUNCH NOW', verdict_reason: 'Fixable UX gaps only.',
    });
  }
  if (prompt.includes('SaaS growth engineer')) {
    return Promise.resolve({
      optimization_score: 8,
      week_1_fixes: [
        { fix: 'Guided wizard', impact: '40% drop-off reduction' },
        { fix: 'Revenue widget', impact: 'Reduces churn' },
        { fix: 'Override toggle', impact: 'Kills objection' },
      ],
      revenue_levers: [
        { lever: 'Annual plan', monthly_added: '+$1,200' },
        { lever: 'Setup fee',   monthly_added: '+$500' },
      ],
      churn_plays: ['Monthly ROI report', 'Day 14 check-in', '30-day milestones'],
      month_3_revenue: '$6,500 MRR', month_6_revenue: '$10,800 MRR',
      north_star: 'Net Revenue Retained', final_verdict: 'Real $10K/month within 6 months.',
    });
  }
  if (prompt.includes('lead engineer')) {
    return Promise.resolve({
      agent_signals: [
        { from: 'Research Agent', directive: 'Gap 8/10',         priority: 'CRITICAL' },
        { from: 'Strategy Agent', directive: 'Gate behind Pro',  priority: 'HIGH' },
        { from: 'Build Agent',    directive: 'Lead scheduling',  priority: 'HIGH' },
        { from: 'Test Agent',     directive: 'Fix integration',  priority: 'HIGH' },
        { from: 'Optimize Agent', directive: 'ROI widget first', priority: 'MEDIUM' },
      ],
      what_we_are_building: 'Full-stack AI ops platform',
      architecture: { Frontend: 'React', Backend: 'Node.js', 'AI Layer': 'Claude', Automation: 'Make', Notifications: 'Resend' },
      file_structure: ['/app', '/api', '/agents', '/automations', '/db', '/security'],
      build_timeline: [
        { week: 1, tasks: ['Schema', 'Auth', 'Webhook'] },
        { week: 2, tasks: ['AI scheduling', 'SMS', 'No-show prediction'] },
        { week: 3, tasks: ['Review AI', 'Weekly digest', 'ROI widget'] },
        { week: 4, tasks: ['Beta', 'Fixes', 'Testimonial'] },
      ],
      cross_agent_optimizations: ['Research → Builder: Pain → Feature #1'],
      code_snippets: {
        'ops-agent.js': 'async function run() { return {}; }',
        'webhook.js': 'app.post("/event", (req, res) => res.json({ ok: true }));',
        'roi.js': 'function calcROI(b, a, c) { return b - a - c; }',
      },
      launch_sequence: ['Day 1: Deploy', 'Day 2-3: Connect pilot', 'Day 4-5: Shadow mode'],
      dev_cost: '$4,200', days_to_first_dollar: '18 days', builder_confidence: '9.1/10',
    });
  }
  if (prompt.includes('financial modeler')) {
    return Promise.resolve({
      summary: '6-month simulation hits $10K MRR by month 5.',
      growth_model: Array.from({ length: 6 }, (_, i) => ({
        month: `M${i+1}`, outreach: 120, trials: 10, converted: 2,
        churned: i > 0 ? 1 : 0, clients: (i+1)*2, mrr: (i+1)*994,
        on_track: (i+1)*994 >= 10000*((i+1)/6),
      })),
      stress_tests: [
        { scenario: 'Bear', conv: '10.5%', churn: '12%', m3: '$2,100', m6: '$5,400', prob: '15%', verdict: 'Double outreach' },
        { scenario: 'Base', conv: '21%',   churn: '7%',  m3: '$6,500 MRR', m6: '$10,800 MRR', prob: '55%', verdict: 'Execute' },
        { scenario: 'Bull', conv: '31%',   churn: '4%',  m3: '$9,200', m6: '$16,500', prob: '30%', verdict: 'Hire support' },
      ],
      assumptions: [
        { a: '8% outreach books trial', conf: 'HIGH', v: 'Industry benchmark' },
        { a: '21% trial-to-paid',        conf: 'HIGH', v: 'Test validated' },
        { a: '7% monthly churn',         conf: 'MEDIUM', v: 'Check-in drops this' },
        { a: '$10K MRR by M6',           conf: 'HIGH', v: '13 Pro clients needed' },
      ],
      red_flags: [
        { flag: 'Onboarding drop-off', sev: 'HIGH', fix: 'Guided wizard' },
        { flag: 'ROI unclear',         sev: 'MEDIUM', fix: 'Delta widget' },
        { flag: 'Staff resistance',    sev: 'MEDIUM', fix: 'Frame as assistant' },
      ],
      final_score: '8.4/10', go_no_go: 'GO',
      go_no_go_reason: 'All 3 scenarios positive.',
      kill_conditions: ['Month 2 MRR under $1K after 400 outreaches'],
    });
  }
  if (prompt.includes('business development specialist')) {
    return Promise.resolve({
      target_profile: { size: '1-15 employees', revenue_range: '$300K-$3M', tech_maturity: 'Basic tools', decision_maker: 'Owner', best_time: 'Tue-Thu' },
      search_queries: ['restaurant owner Google Maps', 'restaurant owner yelp', 'restaurant owner linkedin'],
      directories: ['Yelp', 'OpenTable', 'Toast', 'Restaurant Business'],
      social_signals: ['#restaurantowner', '#independentrestaurant', '#foodbiz', 'LinkedIn: owner'],
      prospect_list: Array.from({ length: 8 }, (_, i) => ({
        name: `Mock Restaurant ${i+1} — Austin TX`, location: 'Austin TX',
        signal: 'No owner review responses', priority: i < 3 ? 'HIGH' : i < 6 ? 'MEDIUM' : 'LOW',
        channel: 'Cold Email', est_mrr: '$997',
      })),
      outreach_sequence: [
        { day: 1, channel: 'Cold Email',          action: 'Personalized email', cta: '15-min call?' },
        { day: 3, channel: 'Follow-up Email',      action: 'Add proof point',   cta: 'Worth 10 min?' },
        { day: 5, channel: 'Instagram DM',         action: 'Short DM',          cta: 'Free audit?' },
        { day: 7, channel: 'Break-up Email',       action: 'Low pressure final', cta: 'Whenever ready.' },
      ],
      email_template: 'Subject: Restaurant AI\n\nHi [Owner],\n\nTest.\n\n[Name]',
      dm_template: 'Hey [name] — quick question about your restaurant.',
      free_value_offer: 'Free 15-min AI ops audit',
      tools_to_find_contacts: ['Hunter.io', 'Apollo.io', 'PhantomBuster', 'GMass', 'Outscraper'],
      weekly_targets: { outreach: 50, expected_trials: 4, expected_paid: 1, projected_mrr_m3: '$5,000+' },
      locator_confidence: '9.2/10 — 8 high-signal prospects',
    });
  }
  return Promise.resolve({ mock: true });
}

// ── SSE stream reader ──────────────────────────────────────────────────────────

function collectSSE(port, path, timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    const events = [];
    const req = http.get(`http://127.0.0.1:${port}${path}`, res => {
      let buf = '';
      let current = null;
      res.on('data', chunk => {
        buf += chunk.toString();
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (line.startsWith('event: ')) { current = line.slice(7).trim(); }
          else if (line.startsWith('data: ') && current) {
            try {
              const data = JSON.parse(line.slice(6));
              events.push({ event: current, data });
              if (current === 'pipeline-complete' || current === 'error') {
                req.destroy(); resolve(events); return;
              }
            } catch { /* ignore parse errors */ }
            current = null;
          }
        }
      });
      res.on('end', () => resolve(events));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(events); });
  });
}

// ── Test server lifecycle ──────────────────────────────────────────────────────

let server;
let port;

before(() => new Promise((resolve, reject) => {
  const app = createApp({ claudeOverride: mockClaude, allowedOrigins: ['http://localhost:5173'] });
  server = app.listen(0, '127.0.0.1', () => {
    port = server.address().port;
    resolve();
  });
  server.on('error', reject);
}));

after(() => new Promise(resolve => server.close(resolve)));

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Pipeline: all stages fire', () => {
  let events;

  before(async () => {
    events = await collectSSE(port, '/api/pipeline/stream?niche=0');
  });

  test('receives pipeline-complete as final event', () => {
    const last = events[events.length - 1];
    assert.equal(last?.event, 'pipeline-complete', 'last event should be pipeline-complete');
  });

  test('stageCount equals 13', () => {
    const complete = events.find(e => e.event === 'pipeline-complete');
    assert.equal(complete?.data?.stageCount, 13);
  });

  test('niche is correctly set in pipeline-complete', () => {
    const complete = events.find(e => e.event === 'pipeline-complete');
    assert.equal(complete?.data?.niche, 'Independent Restaurants');
  });

  for (const id of STAGE_IDS) {
    test(`stage-start received for "${id}"`, () => {
      const found = events.some(e => e.event === 'stage-start' && e.data.stageId === id);
      assert.ok(found, `missing stage-start for ${id}`);
    });

    test(`stage-complete received for "${id}"`, () => {
      const found = events.some(e => e.event === 'stage-complete' && e.data.stageId === id);
      assert.ok(found, `missing stage-complete for ${id}`);
    });
  }
});

describe('Pipeline: parallel group ordering', () => {
  let events;

  before(async () => {
    events = await collectSSE(port, '/api/pipeline/stream?niche=0');
  });

  for (const [stageA, stageB] of PARALLEL_PAIRS) {
    test(`${stageA} and ${stageB} both start before either completes`, () => {
      const startA  = events.findIndex(e => e.event === 'stage-start'    && e.data.stageId === stageA);
      const startB  = events.findIndex(e => e.event === 'stage-start'    && e.data.stageId === stageB);
      const doneA   = events.findIndex(e => e.event === 'stage-complete' && e.data.stageId === stageA);
      const doneB   = events.findIndex(e => e.event === 'stage-complete' && e.data.stageId === stageB);
      assert.ok(startA >= 0, `stage-start for ${stageA} not found`);
      assert.ok(startB >= 0, `stage-start for ${stageB} not found`);
      // Both starts must appear before either completion
      assert.ok(startA < doneA && startA < doneB, `${stageA} starts before either completes`);
      assert.ok(startB < doneA && startB < doneB, `${stageB} starts before either completes`);
    });
  }
});

describe('Pipeline: data flow between stages', () => {
  let events;

  before(async () => {
    events = await collectSSE(port, '/api/pipeline/stream?niche=0');
  });

  function getResult(stageId) {
    return events.find(e => e.event === 'stage-complete' && e.data.stageId === stageId)?.data?.result;
  }

  test('research.confirmed_pains is array[3]', () => {
    const r = getResult('research');
    assert.ok(Array.isArray(r?.confirmed_pains) && r.confirmed_pains.length === 3,
      'research should have 3 confirmed pains');
  });

  test('strategy.pricing_tiers has 3 tiers', () => {
    const s = getResult('strategy');
    assert.ok(Array.isArray(s?.pricing_tiers) && s.pricing_tiers.length === 3,
      'strategy should have 3 pricing tiers');
  });

  test('build.mvp_features has 5 features', () => {
    const b = getResult('build');
    assert.ok(Array.isArray(b?.mvp_features) && b.mvp_features.length === 5,
      'build should have 5 MVP features');
  });

  test('test.verdict is a valid value', () => {
    const t = getResult('test');
    const valid = new Set(['LAUNCH NOW', 'NEEDS WORK', 'DO NOT LAUNCH']);
    assert.ok(valid.has(t?.verdict), `test.verdict "${t?.verdict}" should be valid`);
  });

  test('implement.agent_signals has 5 entries (one per prior AI stage)', () => {
    const impl = getResult('implement');
    assert.equal(impl?.agent_signals?.length, 5,
      'implement should synthesize signals from 5 prior stages');
  });

  test('backtest.growth_model has 6 months', () => {
    const bt = getResult('backtest');
    assert.equal(bt?.growth_model?.length, 6, 'backtest should simulate 6 months');
  });

  test('redteam.attacks has 6 vectors', () => {
    const rt = getResult('redteam');
    assert.equal(rt?.attacks?.length, 6);
  });

  test('safety.patches covers all redteam attacks', () => {
    const rt     = getResult('redteam');
    const safety = getResult('safety');
    assert.equal(safety?.patches?.length, rt?.attacks?.length,
      'safety should patch every redteam attack');
  });

  test('website.html is a full HTML document', () => {
    const w = getResult('website');
    assert.ok(w?.html?.startsWith('<!DOCTYPE html>'), 'website.html should be a valid HTML document');
    assert.ok(w?.lines_of_html > 100, 'website should be substantial (>100 lines)');
  });

  test('deploy.html matches website.html', () => {
    const w = getResult('website');
    const d = getResult('deploy');
    assert.equal(d?.html, w?.html, 'deploy stage should forward the website HTML unchanged');
  });

  test('prospect.prospect_list has 8 prospects', () => {
    const p = getResult('prospect');
    assert.equal(p?.prospect_list?.length, 8,
      'prospect stage should produce 8 prioritized prospects');
  });

  test('forge has 7 modules (one per prior agent)', () => {
    const f = getResult('forge');
    assert.equal(f?.modules?.length, 7);
  });
});

describe('Pipeline: sequential ordering', () => {
  let events;

  before(async () => {
    events = await collectSSE(port, '/api/pipeline/stream?niche=0');
  });

  test('research completes before strategy starts', () => {
    const researchDone   = events.findIndex(e => e.event === 'stage-complete' && e.data.stageId === 'research');
    const strategyStart  = events.findIndex(e => e.event === 'stage-start'    && e.data.stageId === 'strategy');
    assert.ok(researchDone < strategyStart, 'research must complete before strategy starts');
  });

  test('safety completes before website starts', () => {
    const safetyDone   = events.findIndex(e => e.event === 'stage-complete' && e.data.stageId === 'safety');
    const websiteStart = events.findIndex(e => e.event === 'stage-start'    && e.data.stageId === 'website');
    assert.ok(safetyDone < websiteStart, 'safety must complete before website starts');
  });

  test('website completes before deploy starts', () => {
    const websiteDone  = events.findIndex(e => e.event === 'stage-complete' && e.data.stageId === 'website');
    const deployStart  = events.findIndex(e => e.event === 'stage-start'    && e.data.stageId === 'deploy');
    assert.ok(websiteDone < deployStart, 'website must complete before deploy starts');
  });
});

describe('Pipeline: niche coverage', () => {
  test('runs successfully for niche index 9 (Specialty Food & Beverage)', async () => {
    const evts = await collectSSE(port, '/api/pipeline/stream?niche=9');
    const complete = evts.find(e => e.event === 'pipeline-complete');
    assert.ok(complete, 'pipeline-complete should fire for last niche');
    assert.ok(complete.data.niche.includes('Specialty'), 'niche name should match');
  });
});
