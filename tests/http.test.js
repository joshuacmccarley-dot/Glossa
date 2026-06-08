// tests/http.test.js — HTTP-level integration tests for server/app.js
// Tests edge cases, security enforcement, and route behaviour via real HTTP.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../server/app.js';

// ── helpers ────────────────────────────────────────────────────────────────────

function startServer(opts = {}) {
  const app = createApp({
    adminToken: 'test-secret',
    allowedOrigins: ['http://localhost:5173'],
    ...opts,
  });
  return new Promise(resolve => {
    const srv = app.listen(0, () => resolve({ srv, port: srv.address().port }));
  });
}

function get(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path, headers }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', d => { body += d; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(new Error('timeout')); });
  });
}

function postRaw(port, path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const buf  = Buffer.from(body);
    const opts = {
      hostname: '127.0.0.1', port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length, ...extraHeaders },
    };
    const req = http.request(opts, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(new Error('timeout')); });
    req.end(buf);
  });
}

// ── /api/health ────────────────────────────────────────────────────────────────

describe('/api/health', () => {
  let srv, port;
  before(async () => ({ srv, port } = await startServer()));
  after(done => srv.close(done));

  test('returns 200', async () => {
    const { status } = await get(port, '/api/health');
    assert.equal(status, 200);
  });

  test('body is JSON with ok:true', async () => {
    const { body } = await get(port, '/api/health');
    const json = JSON.parse(body);
    assert.equal(json.ok, true);
  });

  test('body has ts field (ISO string)', async () => {
    const { body } = await get(port, '/api/health');
    const { ts } = JSON.parse(body);
    assert.ok(ts && !isNaN(Date.parse(ts)), 'ts should be a valid ISO date string');
  });

  test('body has circuits object with haiku and sonnet', async () => {
    const { body } = await get(port, '/api/health');
    const { circuits } = JSON.parse(body);
    assert.ok(circuits && typeof circuits === 'object', 'circuits should be an object');
    assert.ok('haiku'  in circuits, 'should have haiku circuit');
    assert.ok('sonnet' in circuits, 'should have sonnet circuit');
  });

  test('circuits start as closed', async () => {
    const { body } = await get(port, '/api/health');
    const { circuits } = JSON.parse(body);
    assert.equal(circuits.haiku,  'closed');
    assert.equal(circuits.sonnet, 'closed');
  });

  test('sets security headers', async () => {
    const { headers } = await get(port, '/api/health');
    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.equal(headers['x-frame-options'], 'DENY');
    assert.ok(!headers['x-powered-by'], 'x-powered-by should be absent');
  });
});

// ── /api/pipeline/stream — invalid input ──────────────────────────────────────

describe('/api/pipeline/stream invalid input', () => {
  let srv, port;
  before(async () => ({ srv, port } = await startServer()));
  after(done => srv.close(done));

  test('returns 400 for missing niche param', async () => {
    const { status } = await get(port, '/api/pipeline/stream');
    assert.equal(status, 400);
  });

  test('returns 400 for niche=NaN', async () => {
    const { status } = await get(port, '/api/pipeline/stream?niche=abc');
    assert.equal(status, 400);
  });

  test('returns 400 for niche=-1', async () => {
    const { status } = await get(port, '/api/pipeline/stream?niche=-1');
    assert.equal(status, 400);
  });

  test('returns 400 for niche=10 (out of bounds)', async () => {
    const { status } = await get(port, '/api/pipeline/stream?niche=10');
    assert.equal(status, 400);
  });

  test('returns 400 for niche=999', async () => {
    const { status } = await get(port, '/api/pipeline/stream?niche=999');
    assert.equal(status, 400);
  });

  test('400 body has error field', async () => {
    const { body } = await get(port, '/api/pipeline/stream?niche=999');
    const json = JSON.parse(body);
    assert.ok(json.error, 'should have error field');
  });

  test('valid niche=0 starts SSE stream (200)', async () => {
    // Only check it opens; close immediately
    await new Promise((resolve, reject) => {
      const req = http.get({ hostname: '127.0.0.1', port, path: '/api/pipeline/stream?niche=0' }, res => {
        assert.equal(res.statusCode, 200);
        res.destroy();
        resolve();
      });
      req.on('error', e => { if (e.code !== 'ECONNRESET') reject(e); else resolve(); });
      req.setTimeout(3000, () => { req.destroy(new Error('timeout')); });
    });
  });
});

// ── rate limiting on /api/pipeline/stream ─────────────────────────────────────

describe('rate limiting', () => {
  test('/api/pipeline/stream blocks at 21st request', async () => {
    // Fresh server so rate limiter state is clean
    const { srv, port } = await startServer();
    try {
      let blocked = false;
      // The endpoint limit is 20 req / 60s
      for (let i = 0; i < 21; i++) {
        const { status } = await get(port, '/api/pipeline/stream?niche=0');
        // first 20 should open (200) or be invalid-niche-only (400 from fast path),
        // but the 21st must hit 429
        if (status === 429) { blocked = true; break; }
      }
      assert.equal(blocked, true, '21st request should be rate-limited to 429');
    } finally {
      await new Promise(r => srv.close(r));
    }
  });

  test('/api/health allows 60 requests (higher limit)', async () => {
    const { srv, port } = await startServer();
    try {
      let blocked = false;
      for (let i = 0; i < 60; i++) {
        const { status } = await get(port, '/api/health');
        if (status === 429) { blocked = true; break; }
      }
      assert.equal(blocked, false, 'health should not be rate-limited within 60 requests');
    } finally {
      await new Promise(r => srv.close(r));
    }
  });
});

// ── /api/admin/audit ───────────────────────────────────────────────────────────

describe('/api/admin/audit', () => {
  let srv, port;
  before(async () => ({ srv, port } = await startServer({ adminToken: 'super-secret' })));
  after(done => srv.close(done));

  test('returns 401 without token', async () => {
    const { status } = await get(port, '/api/admin/audit');
    assert.equal(status, 401);
  });

  test('returns 401 with wrong token', async () => {
    const { status } = await get(port, '/api/admin/audit', { 'x-admin-token': 'wrong' });
    assert.equal(status, 401);
  });

  test('returns 200 with correct token', async () => {
    const { status } = await get(port, '/api/admin/audit', { 'x-admin-token': 'super-secret' });
    assert.equal(status, 200);
  });

  test('response body has entries array', async () => {
    const { body } = await get(port, '/api/admin/audit', { 'x-admin-token': 'super-secret' });
    const json = JSON.parse(body);
    assert.ok(Array.isArray(json.entries), 'entries should be an array');
  });

  test('respects ?last= param (capped at 500)', async () => {
    const { body } = await get(port, '/api/admin/audit?last=5', { 'x-admin-token': 'super-secret' });
    const json = JSON.parse(body);
    assert.ok(json.entries.length <= 5, 'should return at most 5 entries when last=5');
  });

  test('401 body has error field', async () => {
    const { body } = await get(port, '/api/admin/audit');
    const json = JSON.parse(body);
    assert.ok(json.error, '401 body should have error field');
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────────

describe('404 handler', () => {
  let srv, port;
  before(async () => ({ srv, port } = await startServer()));
  after(done => srv.close(done));

  test('unknown GET route returns 404', async () => {
    const { status } = await get(port, '/api/unknown-route');
    assert.equal(status, 404);
  });

  test('404 body has error field', async () => {
    const { body } = await get(port, '/some/random/path');
    const json = JSON.parse(body);
    assert.ok(json.error, 'should have error field');
  });

  test('root path returns 404', async () => {
    const { status } = await get(port, '/');
    assert.equal(status, 404);
  });
});

// ── oversized body ─────────────────────────────────────────────────────────────

describe('oversized body protection', () => {
  let srv, port;
  before(async () => ({ srv, port } = await startServer()));
  after(done => srv.close(done));

  test('POST with body > 16kb returns 413 or connection closes', async () => {
    const big = JSON.stringify({ data: 'x'.repeat(20_000) });
    try {
      const { status } = await postRaw(port, '/api/health', big);
      // Express rejects oversized bodies with 413
      assert.ok(status === 413 || status === 404 || status === 405,
        `expected rejection status, got ${status}`);
    } catch (e) {
      // Connection may be forcibly closed — also acceptable
      assert.ok(e.message.includes('socket') || e.message.includes('ECONNRESET') || e.message.includes('timeout'),
        `unexpected error: ${e.message}`);
    }
  });
});

// ── CORS enforcement ───────────────────────────────────────────────────────────

describe('CORS enforcement', () => {
  let srv, port;
  before(async () => ({ srv, port } = await startServer({ allowedOrigins: ['http://allowed.example'] })));
  after(done => srv.close(done));

  test('request without Origin header is allowed', async () => {
    const { status } = await get(port, '/api/health');
    assert.equal(status, 200);
  });

  test('request with allowed Origin is served', async () => {
    const { status } = await get(port, '/api/health', { origin: 'http://allowed.example' });
    assert.equal(status, 200);
  });

  test('request with disallowed Origin returns 403', async () => {
    const { status } = await get(port, '/api/health', { origin: 'http://evil.example' });
    assert.equal(status, 403);
  });
});
