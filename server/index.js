// server/index.js — Express backend, security-hardened

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as prompts from './prompts.js';
import { genProductForge, genRedTeam, genSafety, genWebsite, genDeploy } from './deterministic.js';
import {
  rateLimiter, sseGuard, securityHeaders,
  circuitBreaker, sanitizeInput,
  auditLog, getAuditLog, errorHandler,
} from './security.js';

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
const PORT = process.env.PORT || 3001;

// ── Global middleware ──────────────────────────────────────────────────────────

app.use(securityHeaders);

// Hard cap on request body size — prevent payload-based memory exhaustion
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// CORS — only allow configured origins, default to local Vite ports
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173'
).split(',').map(o => o.trim());

app.use(cors({
  origin(origin, cb) {
    // Allow same-origin (no Origin header) and the allowed list
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    auditLog('CORS_BLOCKED', { origin });
    cb(Object.assign(new Error('Origin not allowed'), { status: 403 }));
  },
  methods: ['GET'],          // API is read-only — no POST surface for CSRF
  allowedHeaders: ['Content-Type', 'X-Admin-Token'],
  credentials: false,
}));

// ── Claude helpers ─────────────────────────────────────────────────────────────

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Circuit breakers — open after 5 consecutive Claude API failures,
// retry after 60 s. Prevents runaway billing if the upstream is degraded.
const haikuCB  = circuitBreaker('haiku');
const sonnetCB = circuitBreaker('sonnet');

async function callClaude(prompt, model = 'claude-haiku-4-5-20251001') {
  if (!client) throw new Error('ANTHROPIC_API_KEY not set');
  const breaker = model.includes('sonnet') ? sonnetCB : haikuCB;
  const msg = await breaker.call(() =>
    client.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
  );
  const text = msg.content[0].text;
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  return JSON.parse(match[1].trim());
}

// ── Niche list (server-side source of truth) ────────────────────────────────

const NICHES = [
  "Independent Restaurants", "Boutique Law Firms",   "Auto Repair Shops",
  "Home Services & HVAC",    "Independent Gyms",      "Medical Spas & Aesthetics",
  "Commercial Real Estate",  "Independent Insurance", "Childcare Centers",
  "Specialty Food & Beverage",
];

// ── Pipeline SSE endpoint ──────────────────────────────────────────────────────

app.get(
  '/api/pipeline/stream',
  rateLimiter(20, 60_000),  // 20 pipeline starts / min / IP
  sseGuard(3),              // max 3 concurrent SSE connections / IP
  async (req, res) => {
    // Validate niche — only accepts integers 0–9, nothing else reaches Claude
    const nicheIdx = parseInt(req.query.niche, 10);
    if (Number.isNaN(nicheIdx) || nicheIdx < 0 || nicheIdx >= NICHES.length) {
      auditLog('INVALID_NICHE', { raw: String(req.query.niche).slice(0, 20) });
      return res.status(400).json({ error: 'Invalid niche index' });
    }
    const niche = NICHES[nicheIdx];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx proxy buffering
    res.flushHeaders();

    // Hard timeout: force-close after 10 minutes regardless of progress.
    // Prevents a stuck pipeline from holding a connection open indefinitely.
    const TIMEOUT_MS = 10 * 60 * 1000;
    const timeout = setTimeout(() => {
      auditLog('SSE_TIMEOUT', { niche });
      emit('error', { message: 'Pipeline timed out — please try again' });
      res.end();
    }, TIMEOUT_MS);
    res.on('close', () => clearTimeout(timeout));

    const emit = (event, data) => {
      if (!res.writableEnded) {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    };

    const all = {};

    const stages = [
      { id:'research',  run: () => callClaude(prompts.researchPrompt(niche)) },
      { id:'strategy',  run: () => callClaude(prompts.strategyPrompt(niche, all.research)) },
      { id:'build',     run: () => callClaude(prompts.buildPrompt(niche, all.research, all.strategy)) },
      { id:'test',      run: () => callClaude(prompts.testPrompt(niche, all.build)) },
      { id:'optimize',  run: () => callClaude(prompts.optimizePrompt(niche, all.test, all.strategy)) },
      { id:'implement', run: () => callClaude(prompts.implementPrompt(niche, all.research, all.strategy, all.build, all.test, all.optimize), 'claude-sonnet-4-6') },
      { id:'backtest',  run: () => callClaude(prompts.backtestPrompt(niche, all.optimize)) },
      // parallel group 1
      { id:'forge',    parallel: true, run: () => genProductForge(niche, all) },
      { id:'redteam',  parallel: true, run: () => genRedTeam(niche) },
      // sequential
      { id:'safety',   run: () => genSafety(niche, all.redteam) },
      // parallel group 2
      { id:'website',  parallel: true, run: () => genWebsite(niche, all) },
      { id:'prospect', parallel: true, run: () => callClaude(prompts.prospectPrompt(niche, all.research, all.build), 'claude-sonnet-4-6') },
      // final
      { id:'deploy',   run: () => genDeploy(niche, all) },
    ];

    // Build execution groups (sequential stages run alone; adjacent parallel stages coalesce)
    const groups = [];
    let i = 0;
    while (i < stages.length) {
      if (stages[i].parallel) {
        const g = [];
        while (i < stages.length && stages[i].parallel) g.push(stages[i++]);
        groups.push(g);
      } else {
        groups.push([stages[i++]]);
      }
    }

    try {
      for (const group of groups) {
        group.forEach(s => emit('stage-start', { stageId: s.id }));

        const results = await Promise.all(
          group.map(async s => {
            try {
              return { stageId: s.id, result: await s.run(), error: null };
            } catch (err) {
              // Log full error server-side; send only a sanitized message to client
              auditLog('STAGE_ERROR', { stageId: s.id, msg: err.message?.slice(0, 100) });
              return { stageId: s.id, result: null, error: 'Stage failed — see server logs' };
            }
          })
        );

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
      auditLog('PIPELINE_FATAL', { niche, msg: err.message?.slice(0, 100) });
      emit('error', { message: 'Pipeline encountered a fatal error' });
    } finally {
      clearTimeout(timeout);
      res.end();
    }
  }
);

// ── Health check ───────────────────────────────────────────────────────────────

app.get('/api/health', rateLimiter(60, 60_000), (req, res) => {
  res.json({
    ok:   true,
    ai:   !!client,
    ts:   new Date().toISOString(),
    circuits: {
      haiku:  haikuCB.status(),
      sonnet: sonnetCB.status(),
    },
  });
});

// ── Audit log — token-gated ────────────────────────────────────────────────────
// Set ADMIN_TOKEN in .env to enable. Returns the last N security events.

app.get('/api/admin/audit', rateLimiter(10, 60_000), (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    auditLog('UNAUTHORIZED_AUDIT_ACCESS', {
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const last = Math.min(parseInt(req.query.last || '50', 10), 500);
  res.json({ entries: getAuditLog(last), total: last });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
// Return structured JSON — never expose route listings or stack traces.

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error handler (must be registered last) ───────────────────────────────────

app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Automater backend on :${PORT}`);
  console.log(`AI: ${client ? 'ENABLED' : 'DISABLED — set ANTHROPIC_API_KEY'}`);
  if (!process.env.ADMIN_TOKEN) {
    console.warn('[WARN] ADMIN_TOKEN not set — /api/admin/audit will reject all requests');
  }
});
