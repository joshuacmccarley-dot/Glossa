// server/index.js — Express backend with Claude API + SSE streaming

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as prompts from './prompts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env if present
try {
  const env = readFileSync(join(__dirname, '../.env'), 'utf8');
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const NICHES = [
  "Independent Restaurants","Boutique Law Firms","Auto Repair Shops",
  "Home Services & HVAC","Independent Gyms","Medical Spas & Aesthetics",
  "Commercial Real Estate","Independent Insurance","Childcare Centers",
  "Specialty Food & Beverage",
];

// ── Claude helper ─────────────────────────────────────────────────────────────

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

async function callClaude(prompt, model = 'claude-haiku-4-5-20251001') {
  if (!client) throw new Error('ANTHROPIC_API_KEY not set');
  const msg = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = msg.content[0].text;
  // Extract JSON — strip markdown fences if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  return JSON.parse(match[1].trim());
}

// Forge and RedTeam are deterministic since they synthesize prior outputs
import {
  genProductForge, genRedTeam, genSafety, genWebsite, genDeploy
} from './deterministic.js';

// ── SSE pipeline endpoint ─────────────────────────────────────────────────────

app.get('/api/pipeline/stream', async (req, res) => {
  const nicheIdx = parseInt(req.query.niche, 10);
  if (isNaN(nicheIdx) || nicheIdx < 0 || nicheIdx >= NICHES.length) {
    return res.status(400).json({ error: 'Invalid niche index' });
  }
  const niche = NICHES[nicheIdx];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const emit = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const all = {};

  const stages = [
    {
      id: 'research', label: 'Niche Research',
      run: async () => callClaude(prompts.researchPrompt(niche)),
    },
    {
      id: 'strategy', label: 'Strategy',
      run: async () => callClaude(prompts.strategyPrompt(niche, all.research)),
    },
    {
      id: 'build', label: 'Builder',
      run: async () => callClaude(prompts.buildPrompt(niche, all.research, all.strategy)),
    },
    {
      id: 'test', label: 'QA & Test',
      run: async () => callClaude(prompts.testPrompt(niche, all.build)),
    },
    {
      id: 'optimize', label: 'Optimization',
      run: async () => callClaude(prompts.optimizePrompt(niche, all.test, all.strategy)),
    },
    {
      id: 'implement', label: 'Implementation',
      model: 'claude-sonnet-4-6',
      run: async () => callClaude(
        prompts.implementPrompt(niche, all.research, all.strategy, all.build, all.test, all.optimize),
        'claude-sonnet-4-6'
      ),
    },
    {
      id: 'backtest', label: 'Backtest',
      run: async () => callClaude(prompts.backtestPrompt(niche, all.optimize)),
    },
    // Stage 8+9 run in parallel
    {
      id: 'forge', label: 'Product Forge', parallel: true,
      run: async () => genProductForge(niche, all),
    },
    {
      id: 'redteam', label: 'Red Team', parallel: true,
      run: async () => genRedTeam(niche),
    },
    {
      id: 'safety', label: 'Safety',
      run: async () => genSafety(niche, all.redteam),
    },
    // Stage 11+13 run in parallel
    {
      id: 'website', label: 'Website Builder', parallel: true,
      run: async () => genWebsite(niche, all),
    },
    {
      id: 'prospect', label: 'Business Locator', parallel: true,
      run: async () => callClaude(
        prompts.prospectPrompt(niche, all.research, all.build),
        'claude-sonnet-4-6'
      ),
    },
    {
      id: 'deploy', label: 'Deploy',
      run: async () => genDeploy(niche, all),
    },
  ];

  // Group stages: sequential until we hit a parallel group
  const groups = [];
  let i = 0;
  while (i < stages.length) {
    if (stages[i].parallel) {
      const group = [];
      while (i < stages.length && stages[i].parallel) group.push(stages[i++]);
      groups.push(group);
    } else {
      groups.push([stages[i++]]);
    }
  }

  try {
    for (const group of groups) {
      // Emit start for all stages in the group
      group.forEach(s => emit('stage-start', { stageId: s.id }));

      // Run them in parallel
      const results = await Promise.all(
        group.map(async s => {
          try {
            const result = await s.run();
            return { stageId: s.id, result, error: null };
          } catch (err) {
            return { stageId: s.id, result: null, error: err.message };
          }
        })
      );

      // Emit completions
      for (const { stageId, result, error } of results) {
        if (error) {
          emit('stage-error', { stageId, error });
        } else {
          all[stageId] = result;
          emit('stage-complete', { stageId, result });
        }
      }
    }

    emit('pipeline-complete', { niche, stageCount: stages.length });
  } catch (err) {
    emit('error', { message: err.message });
  } finally {
    res.end();
  }
});

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    ai: !!client,
    model: 'claude-haiku-4-5-20251001 / claude-sonnet-4-6',
  });
});

app.listen(PORT, () => {
  console.log(`Automater backend running on :${PORT}`);
  console.log(`AI mode: ${client ? 'ENABLED (Claude API)' : 'DISABLED (set ANTHROPIC_API_KEY)'}`);
});
