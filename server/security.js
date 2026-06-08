// server/security.js — security primitives, zero external deps

// ── Prompt Injection Shield ────────────────────────────────────────────────────

const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|all)\s+instructions?/i,
  /\[SYSTEM\s*[:\]]/i,
  /override\s+(all\s+)?(previous\s+)?instructions?/i,
  /disregard\s+(all|previous|prior|your)/i,
  /forget\s+(all|previous|your|everything)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /act\s+as\s+(a|an)\s+/i,
  /<\s*system\s*>/i,
  /\bprompt\s+injection\b/i,
  /jailbreak/i,
];

export function sanitizeInput(text) {
  if (typeof text !== 'string') throw mkErr('INPUT_TYPE_ERROR', 400);
  if (text.length > 2000)       throw mkErr('INPUT_TOO_LONG', 400);
  for (const p of INJECTION_PATTERNS) {
    if (p.test(text)) {
      auditLog('INJECTION_ATTEMPT', { preview: text.slice(0, 80) });
      throw mkErr('INPUT_REJECTED', 400);
    }
  }
  return text.trim();
}

// ── Sliding-Window Rate Limiter ────────────────────────────────────────────────
// Keyed by path + IP. GC kicks in when the map exceeds 5 k entries.

const windows = new Map();

export function rateLimiter(maxReqs, windowMs) {
  return (req, res, next) => {
    const ip = getIP(req);
    const key = `${req.path}::${ip}`;
    const now = Date.now();
    const hits = (windows.get(key) || []).filter(t => now - t < windowMs);
    if (hits.length >= maxReqs) {
      auditLog('RATE_LIMIT_HIT', { ip, path: req.path });
      return res.status(429).json({ error: 'Rate limit exceeded — slow down.' });
    }
    hits.push(now);
    windows.set(key, hits);
    if (windows.size > 5000) {
      for (const [k, v] of windows) {
        if (v.every(t => now - t > windowMs)) windows.delete(k);
      }
    }
    next();
  };
}

// ── SSE Concurrent Connection Guard ───────────────────────────────────────────
// Prevents a single IP from holding open many SSE streams simultaneously.

const sseConns = new Map();

export function sseGuard(maxPerIp = 3) {
  return (req, res, next) => {
    const ip = getIP(req);
    const count = sseConns.get(ip) || 0;
    if (count >= maxPerIp) {
      auditLog('SSE_FLOOD', { ip, count });
      return res.status(429).json({ error: 'Too many concurrent streams from this IP.' });
    }
    sseConns.set(ip, count + 1);
    res.on('close', () => {
      const c = sseConns.get(ip) || 1;
      if (c <= 1) sseConns.delete(ip);
      else sseConns.set(ip, c - 1);
    });
    next();
  };
}

// ── Security Headers ───────────────────────────────────────────────────────────

export function securityHeaders(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
}

// ── Circuit Breaker ────────────────────────────────────────────────────────────
// Opens after CB_THRESHOLD consecutive failures per key.
// Half-opens after CB_RESET_MS, allowing one probe request.

const circuits  = new Map();
const CB_THRESHOLD = 5;
const CB_RESET_MS  = 60_000;

export function circuitBreaker(key) {
  return {
    async call(fn) {
      const c = circuits.get(key) || { failures: 0, openAt: null };
      if (c.openAt) {
        const elapsed = Date.now() - c.openAt;
        if (elapsed < CB_RESET_MS) {
          auditLog('CIRCUIT_OPEN', { key, reopensInMs: CB_RESET_MS - elapsed });
          throw mkErr('SERVICE_UNAVAILABLE', 503);
        }
        // Half-open: reset to let one probe through
        c.openAt = null;
        c.failures = 0;
      }
      try {
        const result = await fn();
        circuits.set(key, { failures: 0, openAt: null });
        return result;
      } catch (err) {
        c.failures += 1;
        if (c.failures >= CB_THRESHOLD) {
          c.openAt = Date.now();
          auditLog('CIRCUIT_TRIPPED', { key, failures: c.failures });
        }
        circuits.set(key, c);
        throw err;
      }
    },
    status() {
      const c = circuits.get(key);
      if (!c || !c.openAt) return 'closed';
      if (Date.now() - c.openAt >= CB_RESET_MS) return 'half-open';
      return 'open';
    },
  };
}

// ── Audit Log (ring buffer) ────────────────────────────────────────────────────

const AUDIT_MAX   = 500;
const auditRing   = [];
const WARN_EVENTS = new Set([
  'INJECTION_ATTEMPT', 'SSE_FLOOD', 'CIRCUIT_TRIPPED', 'CIRCUIT_OPEN',
  'CORS_BLOCKED', 'UNAUTHORIZED_AUDIT_ACCESS', 'OVERSIZED_BODY',
]);

export function auditLog(event, meta = {}) {
  const entry = { ts: new Date().toISOString(), event, ...meta };
  auditRing.push(entry);
  if (auditRing.length > AUDIT_MAX) auditRing.shift();
  if (WARN_EVENTS.has(event)) console.warn(`[SECURITY] ${event}`, meta);
}

export function getAuditLog(last = 50) {
  return auditRing.slice(-Math.min(last, AUDIT_MAX));
}

// ── Error Sanitizer (final Express error handler) ──────────────────────────────
// Maps known internal error codes to safe HTTP responses.
// In production, unknown errors return a generic message — no stack traces.

const SAFE_ERRORS = {
  INPUT_REJECTED:    [400, 'Input rejected by security filter'],
  INPUT_TOO_LONG:    [400, 'Input exceeds maximum length'],
  INPUT_TYPE_ERROR:  [400, 'Invalid input type'],
  SERVICE_UNAVAILABLE: [503, 'Upstream service temporarily unavailable — try again shortly'],
};

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  auditLog('SERVER_ERROR', { path: req.path, msg: String(err.message).slice(0, 120) });
  const known = SAFE_ERRORS[err.message];
  if (known) return res.status(known[0]).json({ error: known[1] });
  const status = err.status || 500;
  const body   = process.env.NODE_ENV === 'development'
    ? err.message
    : 'Internal server error';
  return res.status(status).json({ error: body });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getIP(req) {
  return (
    (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
      .split(',')[0].trim()
  );
}

function mkErr(message, status) {
  return Object.assign(new Error(message), { status });
}
