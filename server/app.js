// server/app.js — Express app factory (testable, no listen call)

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import * as prompts from './prompts.js';
import { genProductForge, genRedTeam, genSafety, genWebsite, genDeploy } from './deterministic.js';
import {
  rateLimiter, sseGuard, securityHeaders,
  circuitBreaker, auditLog, getAuditLog, errorHandler,
} from './security.js';

export const NICHES = [
  "Independent Restaurants", "Boutique Law Firms",   "Auto Repair Shops",
  "Home Services & HVAC",    "Independent Gyms",      "Medical Spas & Aesthetics",
  "Commercial Real Estate",  "Independent Insurance", "Childcare Centers",
  "Specialty Food & Beverage",
];

export const STAGE_IDS = [
  'research','strategy','build','test','optimize','implement',
  'backtest','forge','redteam','safety','website','prospect','deploy',
];

// Parallel groups that must start together.
// Indices into STAGE_IDS — matches App.jsx GROUPS.
export const PARALLEL_PAIRS = [
  ['forge','redteam'],
  ['website','prospect'],
];

/**
 * createApp(options)
 *
 * options.claudeOverride  — async (prompt, model) => object  inject for tests
 * options.allowedOrigins  — string[] override ALLOWED_ORIGINS env
 * options.adminToken      — string   override ADMIN_TOKEN env
 */
export function createApp({ claudeOverride = null, allowedOrigins = null, adminToken = null } = {}) {
  const app    = express();
  const origins = allowedOrigins
    ?? (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
         .split(',').map(o => o.trim());
  const token  = adminToken ?? process.env.ADMIN_TOKEN ?? null;

  // Anthropic client — only created if a real key exists (not needed when claudeOverride is set)
  const rawClient = !claudeOverride && process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

  // Per-app circuit breakers (fresh keys → isolated from other app instances in tests)
  const stamp   = Date.now();
  const haikuCB = circuitBreaker(`haiku-${stamp}`);
  const sonnetCB = circuitBreaker(`sonnet-${stamp}`);

  async function callClaude(prompt, model = 'claude-haiku-4-5-20251001') {
    if (claudeOverride) return claudeOverride(prompt, model);
    if (!rawClient)    throw new Error('ANTHROPIC_API_KEY not set');
    const breaker = model.includes('sonnet') ? sonnetCB : haikuCB;
    const msg = await breaker.call(() =>
      rawClient.messages.create({ model, max_tokens: 1024, messages: [{ role:'user', content:prompt }] })
    );
    const text  = msg.content[0].text;
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    return JSON.parse(match[1].trim());
  }

  function buildStages(niche, all) {
    return [
      { id:'research',  run: () => callClaude(prompts.researchPrompt(niche)) },
      { id:'strategy',  run: () => callClaude(prompts.strategyPrompt(niche, all.research)) },
      { id:'build',     run: () => callClaude(prompts.buildPrompt(niche, all.research, all.strategy)) },
      { id:'test',      run: () => callClaude(prompts.testPrompt(niche, all.build)) },
      { id:'optimize',  run: () => callClaude(prompts.optimizePrompt(niche, all.test, all.strategy)) },
      { id:'implement', run: () => callClaude(prompts.implementPrompt(niche, all.research, all.strategy, all.build, all.test, all.optimize), 'claude-sonnet-4-6') },
      { id:'backtest',  run: () => callClaude(prompts.backtestPrompt(niche, all.optimize)) },
      { id:'forge',    parallel: true, run: () => genProductForge(niche, all) },
      { id:'redteam',  parallel: true, run: () => genRedTeam(niche) },
      { id:'safety',   run: () => genSafety(niche, all.redteam) },
      { id:'website',  parallel: true, run: () => genWebsite(niche, all) },
      { id:'prospect', parallel: true, run: () => callClaude(prompts.prospectPrompt(niche, all.research, all.build), 'claude-sonnet-4-6') },
      { id:'deploy',   run: () => genDeploy(niche, all) },
    ];
  }

  function toGroups(stages) {
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
    return groups;
  }

  // ── Middleware ─────────────────────────────────────────────────────────────

  app.use(securityHeaders);
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));

  app.use(cors({
    origin(origin, cb) {
      if (!origin || origins.includes(origin)) return cb(null, true);
      auditLog('CORS_BLOCKED', { origin });
      cb(Object.assign(new Error('Origin not allowed'), { status: 403 }));
    },
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'X-Admin-Token'],
    credentials: false,
  }));

  // ── Routes ─────────────────────────────────────────────────────────────────

  app.get(
    '/api/pipeline/stream',
    rateLimiter(20, 60_000),
    sseGuard(3),
    async (req, res) => {
      const nicheIdx = parseInt(req.query.niche, 10);
      if (Number.isNaN(nicheIdx) || nicheIdx < 0 || nicheIdx >= NICHES.length) {
        auditLog('INVALID_NICHE', { raw: String(req.query.niche).slice(0, 20) });
        return res.status(400).json({ error: 'Invalid niche index' });
      }
      const niche = NICHES[nicheIdx];
      const all   = {};

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-store');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      const timeout = setTimeout(() => {
        auditLog('SSE_TIMEOUT', { niche });
        emit('error', { message: 'Pipeline timed out' });
        res.end();
      }, 10 * 60 * 1000);
      res.on('close', () => clearTimeout(timeout));

      const emit = (event, data) => {
        if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      try {
        const groups = toGroups(buildStages(niche, all));
        for (const group of groups) {
          group.forEach(s => emit('stage-start', { stageId: s.id }));
          const results = await Promise.all(
            group.map(async s => {
              try   { return { stageId: s.id, result: await s.run(), error: null }; }
              catch (err) {
                auditLog('STAGE_ERROR', { stageId: s.id, msg: err.message?.slice(0, 100) });
                return { stageId: s.id, result: null, error: 'Stage failed — see server logs' };
              }
            })
          );
          for (const { stageId, result, error } of results) {
            if (error) emit('stage-error', { stageId, error });
            else { all[stageId] = result; emit('stage-complete', { stageId, result }); }
          }
        }
        emit('pipeline-complete', { niche, stageCount: STAGE_IDS.length });
      } catch (err) {
        auditLog('PIPELINE_FATAL', { niche, msg: err.message?.slice(0, 100) });
        emit('error', { message: 'Pipeline encountered a fatal error' });
      } finally {
        clearTimeout(timeout);
        res.end();
      }
    }
  );

  app.get('/api/health', rateLimiter(60, 60_000), (req, res) => {
    res.json({
      ok: true,
      ai: !!(rawClient || claudeOverride),
      ts: new Date().toISOString(),
      circuits: { haiku: haikuCB.status(), sonnet: sonnetCB.status() },
    });
  });

  app.get('/api/admin/audit', rateLimiter(10, 60_000), (req, res) => {
    const reqToken = req.headers['x-admin-token'];
    if (!token || reqToken !== token) {
      auditLog('UNAUTHORIZED_AUDIT_ACCESS', {
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const last = Math.min(parseInt(req.query.last || '50', 10), 500);
    res.json({ entries: getAuditLog(last), total: last });
  });

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);

  return app;
}
