import { useState } from 'react';

// ── Design tokens ──────────────────────────────────────────────────────────────

const C = {
  bg:      '#05050a',
  surface: '#09090f',
  border:  '#111118',
  muted:   '#1a1a26',
  text:    '#b8b8c8',
  dim:     '#505060',
  green:   '#3dffa0',
  CRITICAL:'#ff4f4f',
  HIGH:    '#ff9f3d',
  MEDIUM:  '#ffe050',
  LOW:     '#3dffa0',
};

const SEV_COLOR = { CRITICAL: C.CRITICAL, HIGH: C.HIGH, MEDIUM: C.MEDIUM, LOW: C.LOW };
const SEV_BG    = { CRITICAL: '#ff4f4f12', HIGH: '#ff9f3d12', MEDIUM: '#ffe05012', LOW: '#3dffa012' };

// ── Shared atoms ───────────────────────────────────────────────────────────────

const mono = { fontFamily: "'JetBrains Mono', 'Fira Mono', monospace" };
const sans = { fontFamily: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif" };

function Label({ children, style }) {
  return <div style={{ ...mono, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.dim, marginBottom: 10, ...style }}>{children}</div>;
}

function Chip({ children, sev }) {
  const col = SEV_COLOR[sev] || C.green;
  return (
    <span style={{ ...mono, fontSize: 9, letterSpacing: '0.15em', padding: '3px 8px', borderRadius: 4, background: SEV_BG[sev] || '#3dffa012', border: `1px solid ${col}30`, color: col }}>
      {sev || children}
    </span>
  );
}

function Btn({ children, onClick, disabled, style, variant = 'primary' }) {
  const base = {
    padding: '9px 20px', borderRadius: 7, fontSize: 11, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1, transition: 'all 0.15s', ...mono, letterSpacing: '0.1em',
    textTransform: 'uppercase', border: '1px solid',
  };
  const styles = {
    primary: { background: '#3dffa015', borderColor: C.green, color: C.green },
    ghost:   { background: 'transparent', borderColor: C.border, color: C.dim },
    danger:  { background: '#ff4f4f0a', borderColor: '#ff4f4f40', color: C.CRITICAL },
  };
  return <button style={{ ...base, ...styles[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Card({ children, style }) {
  return <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', ...style }}>{children}</div>;
}

// ── DEMO CODE (for "Try Example" button) ──────────────────────────────────────

// No static demo code stored here — fetched at runtime from /api/aegis/demo-code
// so service-specific key patterns never appear as literal strings in source.

// ── BLUEPRINT DATA ─────────────────────────────────────────────────────────────

const BLUEPRINT_SECTIONS = [
  { title: 'Product', icon: '🛡', summary: 'Three core features shipped in sequence.', items: [
    'Feature 1 — API Key Scanner: paste code or a GitHub URL, Aegis flags exposed keys (OpenAI, Stripe, AWS, Twilio, 20+ types) with severity scores.',
    'Feature 2 — Live Site Monitor: connect your domain, Aegis checks security headers, exposed paths, SSL issues, and CORS misconfigs.',
    'Feature 3 — Fix Engine: Claude-powered remediation per finding — not just "you have an issue" but the exact code change to fix it.',
  ]},
  { title: 'Tech Stack', icon: '⚙️', summary: 'Lean, fast to ship, no DevOps overhead.', items: [
    'Frontend: React + Vite + Tailwind — fast to build and deploy.',
    'Backend: Node.js + Express — scanner engine, site monitor, and Claude API calls run server-side so secrets stay hidden.',
    'AI Layer: Claude API (claude-haiku) for fix generation and severity analysis.',
    'Scanning Engine: 24-pattern regex library covering the most common key types.',
  ]},
  { title: 'Week 1 Build', icon: '⚡', summary: 'Scanner live and publicly usable by end of week 1.', items: [
    'Day 1-2: Project scaffold — Vite + Express + auth skeleton.',
    'Day 3-4: Scanner engine — regex patterns for top 10 key types, paste/URL input, results UI with severity.',
    'Day 5: Claude integration — per-finding AI fix with exact code diff and .env.example line.',
    'Day 6-7: Stripe paywall — free (3 findings/scan), Pro $29/mo (unlimited + fix engine + monitor).',
  ]},
  { title: 'Revenue Model', icon: '💰', summary: 'Three tiers. Free converts, Pro scales.', items: [
    'Free: 3 findings per scan, no fix engine — enough to show value, not enough to rely on.',
    'Pro — $29/month: unlimited scans, fix engine, 3 domain monitors, weekly email reports.',
    'Agency — $99/month: unlimited everything, white-label PDF reports, 20 monitors.',
    'Path to $10k/month: 30 Agency OR 120 Pro seats — achievable at 3-4 signups/week.',
  ]},
  { title: 'Go-to-Market', icon: '📡', summary: 'Organic first. Find people when they have the problem.', items: [
    'X/Twitter: post daily about real exposed key incidents (they happen constantly). Build authority before selling.',
    'Reddit: r/webdev, r/SaaS — answer security questions genuinely, link Aegis when relevant.',
    'GitHub: scan public repos, open issues with a free scan offer — high-conversion cold outreach.',
    'ProductHunt launch at end of Week 2.',
  ]},
  { title: 'Risks', icon: '⚠️', summary: 'Each risk has a direct counter built into the plan.', items: [
    'Risk: Claude API costs spike. Counter: cache fix responses — same finding never calls the API twice.',
    'Risk: False positives destroy trust. Counter: high-specificity patterns, confidence labels, user feedback.',
    'Risk: Competitors (GitGuardian, Trufflehog). Counter: they target enterprise. Aegis targets solo founders — different buyer, price, UI.',
    'Risk: Nobody converts. Counter: the fix engine is the paywall. Anyone with a finding and urgency will pay.',
  ]},
];

// ── Scanner Tab ────────────────────────────────────────────────────────────────

function FindingCard({ finding, fix, loadingFix, onGetFix }) {
  const col  = SEV_COLOR[finding.severity] || C.green;
  const [showFix, setShowFix] = useState(false);

  return (
    <div style={{ border: `1px solid ${col}22`, borderRadius: 8, overflow: 'hidden', background: SEV_BG[finding.severity] }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
            <Chip sev={finding.severity} />
            <span style={{ ...mono, fontSize: 11, color: col, fontWeight: 700 }}>{finding.type}</span>
            <span style={{ ...mono, fontSize: 9, color: C.dim }}>line {finding.line}</span>
          </div>
          <div style={{ ...mono, fontSize: 11, color: C.dim, marginBottom: 6 }}>{finding.masked}</div>
          <div style={{ ...mono, fontSize: 10, color: '#404050', background: '#0a0a12', border: `1px solid ${C.border}`, borderRadius: 5, padding: '5px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {finding.context}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
          {!fix && (
            <Btn
              variant="ghost"
              style={{ fontSize: 9, padding: '5px 10px', color: C.green, borderColor: '#3dffa025' }}
              disabled={loadingFix}
              onClick={() => { onGetFix(finding); setShowFix(true); }}
            >
              {loadingFix ? '⟳' : '⚡ Fix'}
            </Btn>
          )}
          {fix && (
            <Btn
              variant="ghost"
              style={{ fontSize: 9, padding: '5px 10px' }}
              onClick={() => setShowFix(s => !s)}
            >
              {showFix ? 'Hide' : '▸ View Fix'}
            </Btn>
          )}
        </div>
      </div>

      {fix && showFix && (
        <div style={{ borderTop: `1px solid ${col}20`, padding: '14px 16px', background: '#0a0a14' }}>
          {fix.error ? (
            <div style={{ ...mono, fontSize: 10, color: C.CRITICAL }}>{fix.error}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fix._demo && (
                <div style={{ ...mono, fontSize: 9, color: C.MEDIUM, background: '#ffe05010', border: '1px solid #ffe05025', borderRadius: 5, padding: '5px 10px' }}>
                  DEMO MODE — set ANTHROPIC_API_KEY for AI-powered fixes
                </div>
              )}
              <FixRow label="⚡ Immediate" value={fix.immediate_action} color={C.CRITICAL} />
              {fix.code_before && <CodeDiff before={fix.code_before} after={fix.code_after} />}
              {fix.env_example && <FixRow label=".env.example" value={fix.env_example} mono />}
              <FixRow label="Prevention" value={fix.prevention} color={C.dim} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FixRow({ label, value, color, mono: useMono }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ ...mono, fontSize: 9, color: C.green, minWidth: 80, paddingTop: 1 }}>{label}</span>
      <span style={{ ...(useMono ? mono : sans), fontSize: 11, color: color || C.text, lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

function CodeDiff({ before, after }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ ...mono, fontSize: 10, background: '#ff4f4f0a', border: '1px solid #ff4f4f20', borderRadius: 5, padding: '6px 10px', color: '#ff6666' }}>
        <span style={{ color: '#ff4f4f60', marginRight: 8 }}>−</span>{before}
      </div>
      <div style={{ ...mono, fontSize: 10, background: '#3dffa00a', border: '1px solid #3dffa020', borderRadius: 5, padding: '6px 10px', color: '#5dffb0' }}>
        <span style={{ color: '#3dffa060', marginRight: 8 }}>+</span>{after}
      </div>
    </div>
  );
}

function ScannerTab() {
  const [input,        setInput]        = useState('');
  const [scanning,     setScanning]     = useState(false);
  const [findings,     setFindings]     = useState(null);
  const [scannedLines, setScannedLines] = useState(0);
  const [error,        setError]        = useState('');
  const [fixes,        setFixes]        = useState({});
  const [loadingFix,   setLoadingFix]   = useState({});
  const [loadingDemo,  setLoadingDemo]  = useState(false);

  async function scan() {
    if (!input.trim()) return;
    setScanning(true);
    setError('');
    setFindings(null);
    setFixes({});
    try {
      const isUrl = /^https?:\/\//.test(input.trim());
      const r = await fetch('/api/aegis/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isUrl ? { url: input.trim() } : { code: input }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setFindings(data.findings);
      setScannedLines(data.scanned_lines || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setScanning(false);
    }
  }

  async function loadDemo() {
    setLoadingDemo(true);
    try {
      const r = await fetch('/api/aegis/demo-code');
      if (r.ok) { setInput(await r.text()); setFindings(null); setFixes({}); }
    } catch { /* server not running — clear to empty */ }
    finally { setLoadingDemo(false); }
  }

  async function getFix(finding) {
    setLoadingFix(s => ({ ...s, [finding.id]: true }));
    try {
      const r = await fetch('/api/aegis/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: finding.type, masked: finding.masked, line: finding.line, context: finding.context, filename: finding.filename }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setFixes(s => ({ ...s, [finding.id]: data.fix }));
    } catch (e) {
      setFixes(s => ({ ...s, [finding.id]: { error: e.message } }));
    } finally {
      setLoadingFix(s => ({ ...s, [finding.id]: false }));
    }
  }

  const critCount = findings?.filter(f => f.severity === 'CRITICAL').length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <Label style={{ marginBottom: 0 }}>Paste code or enter a GitHub file URL</Label>
        </div>
        <div style={{ padding: 16 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'// Paste source code here, or enter a GitHub URL on the first line\n// e.g. https://github.com/user/repo/blob/main/config.js'}
            style={{ width: '100%', minHeight: 160, background: '#07070e', border: `1px solid ${C.border}`, borderRadius: 7, color: '#9090b0', ...mono, fontSize: 11, padding: '12px 14px', resize: 'vertical', outline: 'none', lineHeight: 1.65 }}
            spellCheck={false}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Btn onClick={scan} disabled={scanning || !input.trim()}>
              {scanning ? '⟳ Scanning…' : '🔍 Scan'}
            </Btn>
            <Btn variant="ghost" disabled={loadingDemo} onClick={loadDemo}>
              {loadingDemo ? '⟳' : 'Try Example'}
            </Btn>
            {(findings || input) && (
              <Btn variant="ghost" style={{ marginLeft: 'auto' }} onClick={() => { setInput(''); setFindings(null); setFixes({}); setError(''); }}>
                Clear
              </Btn>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <div style={{ ...mono, fontSize: 11, color: C.CRITICAL, background: '#ff4f4f0a', border: `1px solid #ff4f4f25`, borderRadius: 8, padding: '10px 14px' }}>
          {error}
        </div>
      )}

      {findings !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Label style={{ marginBottom: 0 }}>
              {findings.length === 0 ? '✓ No findings' : `${findings.length} finding${findings.length !== 1 ? 's' : ''} — ${scannedLines} lines scanned`}
            </Label>
            {critCount > 0 && (
              <span style={{ ...mono, fontSize: 9, color: C.CRITICAL, background: '#ff4f4f10', border: '1px solid #ff4f4f30', borderRadius: 4, padding: '2px 8px' }}>
                {critCount} CRITICAL
              </span>
            )}
          </div>

          {findings.length === 0 ? (
            <Card>
              <div style={{ padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                <div style={{ ...mono, fontSize: 12, color: C.green }}>No exposed secrets detected</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>
                  {scannedLines} lines scanned across {new Set(findings.map(f => f.filename)).size || 1} file(s)
                </div>
              </div>
            </Card>
          ) : (
            findings.map(f => (
              <FindingCard
                key={f.id}
                finding={f}
                fix={fixes[f.id]}
                loadingFix={loadingFix[f.id]}
                onGetFix={getFix}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Monitor Tab ────────────────────────────────────────────────────────────────

const SEV_ICON = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵' };

function MonitorTab() {
  const [domain,    setDomain]    = useState('');
  const [checking,  setChecking]  = useState(false);
  const [findings,  setFindings]  = useState(null);
  const [checked,   setChecked]   = useState('');
  const [error,     setError]     = useState('');

  async function check() {
    if (!domain.trim()) return;
    setChecking(true);
    setError('');
    setFindings(null);
    try {
      const r = await fetch('/api/aegis/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setFindings(data.findings);
      setChecked(data.domain);
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  }

  const score = findings
    ? Math.max(0, 100 - (findings.filter(f => f.severity === 'CRITICAL').length * 25) - (findings.filter(f => f.severity === 'HIGH').length * 15) - (findings.filter(f => f.severity === 'MEDIUM').length * 8) - (findings.filter(f => f.severity === 'LOW').length * 3))
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <Label style={{ marginBottom: 0 }}>Enter a domain to check its security posture</Label>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="https://yourdomain.com"
              style={{ flex: 1, background: '#07070e', border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, ...mono, fontSize: 12, padding: '10px 14px', outline: 'none' }}
            />
            <Btn onClick={check} disabled={checking || !domain.trim()}>
              {checking ? '⟳ Checking…' : '📡 Check'}
            </Btn>
          </div>
          <div style={{ ...mono, fontSize: 9, color: '#303040', marginTop: 8 }}>
            Checks: HTTPS · security headers (6) · exposed sensitive paths (10) · no data stored
          </div>
        </div>
      </Card>

      {error && (
        <div style={{ ...mono, fontSize: 11, color: C.CRITICAL, background: '#ff4f4f0a', border: `1px solid #ff4f4f25`, borderRadius: 8, padding: '10px 14px' }}>
          {error}
        </div>
      )}

      {findings !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Score card */}
          <Card>
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center', minWidth: 64 }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: score >= 80 ? C.green : score >= 50 ? C.MEDIUM : C.CRITICAL, lineHeight: 1 }}>{score}</div>
                <div style={{ ...mono, fontSize: 9, color: C.dim, marginTop: 4 }}>SCORE / 100</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{checked}</div>
                <div style={{ fontSize: 12, color: C.dim }}>
                  {findings.length === 0
                    ? 'No issues found — site looks clean.'
                    : `${findings.length} issue${findings.length !== 1 ? 's' : ''} detected`}
                </div>
              </div>
            </div>
          </Card>

          {findings.length === 0 ? (
            <Card>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                <div style={{ ...mono, fontSize: 12, color: C.green }}>All checks passed</div>
              </div>
            </Card>
          ) : (
            findings.map((f, i) => (
              <div key={i} style={{ border: `1px solid ${SEV_COLOR[f.severity]}22`, borderRadius: 8, padding: '12px 16px', background: SEV_BG[f.severity] }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{SEV_ICON[f.severity]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <Chip sev={f.severity} />
                      <span style={{ ...mono, fontSize: 11, color: SEV_COLOR[f.severity], fontWeight: 700 }}>{f.type}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.text, marginBottom: 4 }}>{f.detail}</div>
                    {f.path && f.path !== checked && (
                      <div style={{ ...mono, fontSize: 10, color: C.dim }}>{f.path}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Blueprint Tab ──────────────────────────────────────────────────────────────

function BlueprintTab() {
  const [active, setActive] = useState(0);
  const s = BLUEPRINT_SECTIONS[active];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {BLUEPRINT_SECTIONS.map((sec, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ padding: '7px 14px', border: `1px solid ${active === i ? C.green : C.border}`, background: active === i ? '#3dffa010' : 'transparent', color: active === i ? C.green : C.dim, ...mono, fontSize: 9, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 100, textTransform: 'uppercase', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
            {sec.icon} {sec.title}
          </button>
        ))}
      </div>
      <Card style={{ animation: 'up 0.2s ease' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#f0f0fa', marginBottom: 5 }}>{s.icon} {s.title}</div>
          <div style={{ fontSize: 12, color: C.dim }}>{s.summary}</div>
        </div>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {s.items.map((item, i) => {
            let bold = '', rest = item;
            if (item.includes(' — ')) { const idx = item.indexOf(' — '); bold = item.slice(0, idx); rest = item.slice(idx + 3); }
            else if (item.match(/^[A-Z][^:]{2,30}: /)) { const idx = item.indexOf(': '); bold = item.slice(0, idx); rest = item.slice(idx + 2); }
            return (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                <span style={{ ...mono, fontSize: 9, color: C.green, minWidth: 18, paddingTop: 3 }}>0{i + 1}</span>
                <span style={{ fontSize: 13, color: '#8888a0', lineHeight: 1.7 }}>
                  {bold
                    ? <><strong style={{ color: '#c8c8e0' }}>{bold}</strong>{item.includes(' — ') ? ' — ' : ': '}{rest}</>
                    : item}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ ...mono, fontSize: 9, color: '#1a1a28', letterSpacing: '0.1em', textAlign: 'center' }}>
        aegis · $1k budget · 2-week build · $10k/month target
      </div>
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function Aegis({ onBack }) {
  const [tab, setTab] = useState('scanner');

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, ...sans }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #202030; border-radius: 2px; }
        textarea:focus, input:focus { border-color: #3dffa040 !important; }
        @keyframes up { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
      `}</style>

      {/* Header */}
      <div style={{ padding: '15px 26px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,5,10,0.96)', backdropFilter: 'blur(12px)' }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}`, animation: 'pulse 2s ease-in-out infinite' }} />
        <div>
          <div style={{ ...mono, fontSize: 9, color: C.green, letterSpacing: '0.28em', textTransform: 'uppercase' }}>Aegis · API Security</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f8' }}>Find and fix exposed credentials</div>
        </div>
        {onBack && (
          <button onClick={onBack} style={{ marginLeft: 'auto', background: 'transparent', border: `1px solid ${C.border}`, color: C.dim, ...mono, fontSize: 9, letterSpacing: '0.15em', padding: '5px 12px', borderRadius: 100, cursor: 'pointer', textTransform: 'uppercase' }}>
            ← Automater
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, padding: '0 26px' }}>
        {[['scanner', '🔍 Scanner'], ['monitor', '📡 Monitor'], ['blueprint', '📋 Blueprint']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '12px 18px', border: 'none', borderBottom: `2px solid ${tab === key ? C.green : 'transparent'}`, background: 'transparent', color: tab === key ? C.green : C.dim, ...mono, fontSize: 10, letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '26px 26px 80px' }}>
        {tab === 'scanner'   && <ScannerTab  />}
        {tab === 'monitor'   && <MonitorTab  />}
        {tab === 'blueprint' && <BlueprintTab />}
      </div>
    </div>
  );
}
