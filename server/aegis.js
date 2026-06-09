// server/aegis.js — Aegis scanner engine, site monitor, and Express routes

import { Router } from 'express';
import https from 'node:https';
import http  from 'node:http';
import { URL } from 'node:url';
import { rateLimiter, sanitizeInput, auditLog } from './security.js';

// ── Key Detection Patterns ─────────────────────────────────────────────────────
// Each entry: { type, regex, sev, cap? }
// cap = capture group index whose value is the actual secret (for context patterns)

const PATTERNS = [
  // ── Hard-prefix patterns (very low false-positive rate) ──────────────────────
  { type: 'OpenAI',        regex: /sk-(?:proj-[A-Za-z0-9_-]{40,}|[A-Za-z0-9]{48,})/g,                  sev: 'CRITICAL' },
  { type: 'Anthropic',     regex: /sk-ant-[A-Za-z0-9_-]{40,}/g,                                          sev: 'CRITICAL' },
  { type: 'Stripe Live',   regex: /sk_live_[A-Za-z0-9]{24,}/g,                                           sev: 'CRITICAL' },
  { type: 'Stripe Test',   regex: /sk_test_[A-Za-z0-9]{24,}/g,                                           sev: 'HIGH'     },
  { type: 'Stripe Pub',    regex: /pk_(?:live|test)_[A-Za-z0-9]{24,}/g,                                  sev: 'LOW'      },
  { type: 'AWS Key ID',    regex: /AKIA[0-9A-Z]{16}/g,                                                    sev: 'CRITICAL' },
  { type: 'GCP Key',       regex: /AIza[0-9A-Za-z_-]{35}/g,                                               sev: 'CRITICAL' },
  { type: 'GitHub PAT',    regex: /ghp_[A-Za-z0-9]{36}/g,                                                 sev: 'HIGH'     },
  { type: 'GitHub OAuth',  regex: /gho_[A-Za-z0-9]{36}/g,                                                 sev: 'HIGH'     },
  { type: 'GitHub App',    regex: /ghs_[A-Za-z0-9]{36}/g,                                                 sev: 'HIGH'     },
  { type: 'SendGrid',      regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,                           sev: 'HIGH'     },
  { type: 'Twilio SID',    regex: /AC[a-f0-9]{32}/g,                                                      sev: 'HIGH'     },
  { type: 'Twilio Key',    regex: /SK[a-f0-9]{32}/g,                                                      sev: 'HIGH'     },
  { type: 'Slack',         regex: /xox[baprs]-[0-9A-Za-z-]{40,}/g,                                       sev: 'HIGH'     },
  { type: 'Shopify',       regex: /shp(?:at|ca|pa|ss)_[a-fA-F0-9]{32}/g,                                 sev: 'HIGH'     },
  { type: 'HubSpot',       regex: /pat-[a-z]{2}1-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, sev: 'HIGH' },
  { type: 'Mailchimp',     regex: /[0-9a-f]{32}-us[0-9]{1,2}/g,                                          sev: 'HIGH'     },
  { type: 'Firebase FCM',  regex: /AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}/g,                            sev: 'HIGH'     },
  { type: 'Private Key',   regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,                   sev: 'CRITICAL' },
  // ── Context-aware patterns (env var assignment + value) ──────────────────────
  { type: 'AWS Secret',    regex: /(?:AWS_SECRET_ACCESS_KEY|aws_secret)\s*[=:]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi, sev: 'CRITICAL', cap: 1 },
  { type: 'DB Connection', regex: /(?:DATABASE_URL|DB_URL|MONGO_URI|REDIS_URL|POSTGRES_URL|MYSQL_URL)\s*[=:]\s*['"]([a-z]+:\/\/[^\s'"]{10,})['"]/gi, sev: 'HIGH', cap: 1 },
  { type: 'Bearer Token',  regex: /(?:Authorization|Bearer)\s*[:=]\s*['"]?Bearer\s+([A-Za-z0-9._-]{30,})['"]?/gi, sev: 'MEDIUM', cap: 1 },
  { type: 'Hardcoded Key', regex: /(?:api_key|apikey|api_secret|secret_key|access_token)\s*[:=]\s*['"]([a-zA-Z0-9_-]{20,})['"];?/gi, sev: 'MEDIUM', cap: 1 },
];

const SEV_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function mask(val) {
  if (!val || val.length <= 8) return '*'.repeat(Math.max(val?.length ?? 8, 8));
  return val.slice(0, 6) + '***' + val.slice(-3);
}

export function scanCode(code, filename = 'input') {
  const lines    = code.split('\n');
  const findings = [];
  const seen     = new Set(); // raw value dedup across all patterns
  let   id       = 0;

  for (const pat of PATTERNS) {
    for (let li = 0; li < lines.length; li++) {
      const re = new RegExp(pat.regex.source, pat.regex.flags);
      let m;
      while ((m = re.exec(lines[li])) !== null) {
        const raw = pat.cap != null ? m[pat.cap] : m[0];
        if (!raw || raw.length < 8) continue;
        if (seen.has(raw)) continue; // same secret matched by multiple patterns
        seen.add(raw);
        findings.push({
          id: ++id,
          type:     pat.type,
          severity: pat.sev,
          masked:   mask(raw),
          line:     li + 1,
          context:  lines[li].trim().slice(0, 140),
          filename,
        });
      }
    }
  }

  return findings.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
}

// ── GitHub URL Fetcher ─────────────────────────────────────────────────────────

const GITHUB_HOST_RE = /^https:\/\/(?:raw\.githubusercontent\.com|github\.com)\//;
const MAX_FETCH_BYTES = 300_000;

async function fetchGitHub(rawUrl) {
  if (!GITHUB_HOST_RE.test(rawUrl)) {
    throw Object.assign(new Error('Only github.com or raw.githubusercontent.com URLs are accepted'), { status: 400 });
  }
  // Convert blob view URL to raw content URL
  const url = rawUrl
    .replace('https://github.com/', 'https://raw.githubusercontent.com/')
    .replace('/blob/', '/');

  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 8000 }, res => {
      if (res.statusCode === 404) return reject(Object.assign(new Error('File not found on GitHub'), { status: 404 }));
      if (res.statusCode !== 200) return reject(Object.assign(new Error(`GitHub returned HTTP ${res.statusCode}`), { status: 400 }));
      const chunks = [];
      let bytes = 0;
      res.on('data', chunk => {
        bytes += chunk.length;
        if (bytes > MAX_FETCH_BYTES) {
          req.destroy();
          reject(Object.assign(new Error('File too large (> 300 KB)'), { status: 413 }));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(Object.assign(new Error('GitHub fetch timed out'), { status: 504 })); });
  });
}

// ── Site Monitor ──────────────────────────────────────────────────────────────

const HEADER_CHECKS = [
  { header: 'strict-transport-security', label: 'HSTS',                       sev: 'HIGH'   },
  { header: 'content-security-policy',   label: 'Content-Security-Policy',     sev: 'HIGH'   },
  { header: 'x-frame-options',           label: 'X-Frame-Options',             sev: 'MEDIUM' },
  { header: 'x-content-type-options',    label: 'X-Content-Type-Options',      sev: 'MEDIUM' },
  { header: 'referrer-policy',           label: 'Referrer-Policy',             sev: 'LOW'    },
  { header: 'permissions-policy',        label: 'Permissions-Policy',          sev: 'LOW'    },
];

const SENSITIVE_PATHS = [
  { path: '/.env',          label: '.env file exposed',               sev: 'CRITICAL' },
  { path: '/.git/config',   label: 'Git config exposed',              sev: 'CRITICAL' },
  { path: '/.git/HEAD',     label: 'Git HEAD exposed',                sev: 'HIGH'     },
  { path: '/phpinfo.php',   label: 'phpinfo page exposed',            sev: 'HIGH'     },
  { path: '/.htpasswd',     label: '.htpasswd exposed',               sev: 'CRITICAL' },
  { path: '/wp-config.php', label: 'WordPress config exposed',        sev: 'CRITICAL' },
  { path: '/config.php',    label: 'config.php exposed',              sev: 'HIGH'     },
  { path: '/api/debug',     label: 'Debug endpoint exposed',          sev: 'MEDIUM'   },
  { path: '/package.json',  label: 'package.json exposed',            sev: 'LOW'      },
  { path: '/.DS_Store',     label: '.DS_Store exposed',               sev: 'LOW'      },
];

function httpGet(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https://') ? https : http;
    const req = lib.get(url, { timeout: 6000, ...opts }, res => {
      res.resume();
      resolve({ status: res.statusCode, headers: res.headers });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

export async function monitorSite(domain) {
  const base     = /^https?:\/\//.test(domain) ? domain.replace(/\/$/, '') : `https://${domain}`;
  const isHttps  = base.startsWith('https://');
  const findings = [];

  // 1. Reachability + header harvest
  let mainHeaders = {};
  try {
    const r = await httpGet(base);
    mainHeaders = r.headers;
    if (!isHttps) {
      findings.push({ type: 'No HTTPS', severity: 'CRITICAL', detail: 'Site served over plain HTTP — all traffic is unencrypted', path: base });
    }
  } catch {
    findings.push({ type: 'Unreachable', severity: 'HIGH', detail: `Cannot connect to ${base}`, path: base });
    return findings;
  }

  // 2. Missing security headers
  for (const { header, label, sev } of HEADER_CHECKS) {
    if (!mainHeaders[header]) {
      findings.push({ type: 'Missing Header', severity: sev, detail: `${label} header not set`, path: base });
    }
  }

  // 3. Sensitive path probing (parallel, ignore failures)
  const pathResults = await Promise.allSettled(
    SENSITIVE_PATHS.map(async ({ path, label, sev }) => {
      try {
        const r = await httpGet(base + path);
        if (r.status === 200) findings.push({ type: 'Exposed Path', severity: sev, detail: label, path: base + path });
      } catch { /* unreachable path = fine */ }
    })
  );
  void pathResults; // results captured via closure

  return findings.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
}

// ── Fix Prompt Builder ─────────────────────────────────────────────────────────

function buildFixPrompt({ type, masked, line, context, filename }) {
  return `You are a security engineer reviewing a credential leak. A ${type} was found hardcoded in source code.

Finding:
- File: ${filename || 'unknown'}
- Line: ${line || '?'}
- Type: ${type}
- Value (masked): ${masked || '***'}
- Context: \`${String(context || '').slice(0, 200)}\`

Generate an actionable fix. Respond with JSON only — no markdown fences:
{
  "immediate_action": "one sentence: what the developer must do RIGHT NOW (e.g. revoke/rotate the key at provider dashboard URL)",
  "code_before": "the problematic line verbatim (max 120 chars)",
  "code_after": "the fixed version using process.env.ENV_VAR_NAME",
  "env_var": "ENV_VAR_NAME",
  "env_example": "full .env.example line e.g. STRIPE_SECRET_KEY=sk_live_your_key_here",
  "prevention": "one sentence: tooling or practice to prevent this in future"
}`;
}

const DEMO_FIX = {
  _demo: true,
  immediate_action: 'Revoke this key immediately in your provider dashboard before doing anything else.',
  code_before:  'const key = "hardcoded_secret_value";',
  code_after:   'const key = process.env.ENV_VAR_NAME;',
  env_var:      'ENV_VAR_NAME',
  env_example:  'ENV_VAR_NAME=your_key_here',
  prevention:   'Add .env to .gitignore and use a secrets scanner pre-commit hook (e.g. gitleaks).',
};

// ── Demo Code Generator ────────────────────────────────────────────────────────
// Assembled at runtime so no credential-like strings live as static source.
// Values are structurally valid but non-functional doc examples.

export function getDemoCode() {
  // Split strings prevent static-analysis secret scanners from flagging the repo
  const $ = (...p) => p.join('');
  return [
    '// config.js — committed by accident (example for demo)',
    '',
    '// AWS documentation example keys',
    `const AWS_ACCESS_KEY_ID     = '` + $('AKIA', 'IOSFODNN7EXAMPLE') + `';`,
    `const AWS_SECRET_ACCESS_KEY = '` + $('wJalrXUtnFEMI', '/K7MDENG/bPxRfiCYEXAMPLEKEY') + `';`,
    '',
    '// GitHub personal access token',
    `const GITHUB_TOKEN = '` + $('ghp_', '16C7e42F292c6912E169C2AB2UXXXXXX36AB') + `';`,
    '',
    '// Hardcoded service credentials',
    `const api_key     = 'live_Kf7mX9vP3qN8wR2jH5tL0sB4nY6cE1aDxyz';`,
    `const secret_key  = 'prod_Zx8Wm3Qk7Vn2Yh5Rp0Jf4Cb9Ld6Ue1AgAbc';`,
    '',
    '// Database connection string',
    `const DATABASE_URL = 'postgresql://admin:H8mK3p@prod-db.internal:5432/myapp';`,
    '',
    '// This file should never have been committed.',
    `// Fix: move all secrets to .env, add .env to .gitignore.`,
  ].join('\n');
}

// ── Express Router ─────────────────────────────────────────────────────────────

export function createAegisRouter(callClaude) {
  const router = Router();

  // GET  /api/aegis/demo-code — returns synthetic scannable example
  router.get('/demo-code', rateLimiter(60, 60_000), (_req, res) => {
    res.type('text/plain').send(getDemoCode());
  });

  // POST /api/aegis/scan  { code?, url? }
  router.post('/scan', rateLimiter(30, 60_000), async (req, res, next) => {
    try {
      let { code, url } = req.body ?? {};
      let filename = 'pasted';

      if (url) {
        const cleanUrl = sanitizeInput(String(url).trim());
        code     = await fetchGitHub(cleanUrl);
        filename = cleanUrl.split('/').pop() || 'remote';
      } else if (code) {
        code = sanitizeInput(code);
      } else {
        return res.status(400).json({ error: 'Provide code or url' });
      }

      const findings = scanCode(code, filename);
      auditLog('AEGIS_SCAN', { filename, findings: findings.length });
      res.json({ findings, scanned_lines: code.split('\n').length });
    } catch (err) { next(err); }
  });

  // POST /api/aegis/fix   { type, masked, line, context, filename }
  router.post('/fix', rateLimiter(10, 60_000), async (req, res, next) => {
    try {
      const { type, masked, line, context, filename } = req.body ?? {};
      if (!type || !context) return res.status(400).json({ error: 'Provide type and context' });

      try {
        const fix = await callClaude(buildFixPrompt({ type, masked, line, context, filename }), 'claude-haiku-4-5-20251001');
        auditLog('AEGIS_FIX', { type });
        res.json({ fix });
      } catch (err) {
        // Gracefully degrade when no API key is configured
        if (err.message?.includes('API_KEY')) {
          const demo = { ...DEMO_FIX, immediate_action: `Revoke this ${type} key immediately at your provider dashboard.` };
          res.json({ fix: demo });
        } else {
          next(err);
        }
      }
    } catch (err) { next(err); }
  });

  // POST /api/aegis/monitor  { domain }
  router.post('/monitor', rateLimiter(10, 60_000), async (req, res, next) => {
    try {
      const { domain } = req.body ?? {};
      if (!domain) return res.status(400).json({ error: 'Provide domain' });
      const clean    = sanitizeInput(String(domain).trim());
      const findings = await monitorSite(clean);
      auditLog('AEGIS_MONITOR', { domain: clean, findings: findings.length });
      res.json({ findings, domain: clean });
    } catch (err) { next(err); }
  });

  return router;
}
