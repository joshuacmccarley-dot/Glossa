// server/index.js — entry point; load env, create app, listen

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createApp } from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env if present
try {
  const env = readFileSync(join(__dirname, '../.env'), 'utf8');
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const PORT = process.env.PORT || 3001;
const app  = createApp();

app.listen(PORT, () => {
  console.log(`Automater backend on :${PORT}`);
  console.log(`AI: ${process.env.ANTHROPIC_API_KEY ? 'ENABLED' : 'DISABLED — set ANTHROPIC_API_KEY'}`);
  if (!process.env.ADMIN_TOKEN) {
    console.warn('[WARN] ADMIN_TOKEN not set — /api/admin/audit will reject all requests');
  }
});
