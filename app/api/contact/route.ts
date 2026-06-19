import { NextRequest, NextResponse } from "next/server";

/* ─── Valid product allowlist ─────────────────────────────────── */
const VALID_PRODUCTS = new Set([
  "reta", "ghk-cu", "bac-water", "tesa", "mots-c", "mt2", "cjc-ipa",
  "reta-kit", "ghk-kit", "mt2-kit", "cjc-ipa-kit", "tesa-kit", "multiple",
]);

/* ─── In-memory rate limiter ──────────────────────────────────────
   Capped at 500 entries to prevent unbounded memory growth.
   For production, replace with Redis or Upstash.               */
const MAX_RATE_ENTRIES = 500;
const rateMap = new Map<string, { count: number; resetAt: number }>();

function pruneRateMap(now: number) {
  if (rateMap.size < MAX_RATE_ENTRIES) return;
  for (const [key, entry] of rateMap) {
    if (entry.resetAt < now) rateMap.delete(key);
  }
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now    = Date.now();
  const window = 60_000;
  const limit  = 5;

  pruneRateMap(now);

  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + window });
    return { allowed: true, retryAfter: 0 };
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

/* ─── Sanitization & validation ──────────────────────────────── */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").replace(/&(?:[a-z]+|#\d+);/gi, " ");
}

function sanitize(str: string): string {
  return stripHtml(String(str).trim()).slice(0, 2000);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── POST /api/contact ───────────────────────────────────────── */
export async function POST(req: NextRequest) {
  // Enforce application/json content type
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      { success: false, message: "Invalid content type." },
      { status: 415 }
    );
  }

  // IP-based rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please wait a minute." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot — always empty for real users; bots fill it in
  if (body._hp && String(body._hp).trim().length > 0) {
    return NextResponse.json(
      { success: true, message: "Your inquiry has been received. We'll respond within 24 hours." },
      { status: 200 }
    );
  }

  // Field extraction + HTML stripping
  const name    = sanitize((body.name    as string) ?? "");
  const email   = sanitize((body.email   as string) ?? "");
  const product = sanitize((body.product as string) ?? "");
  const message = sanitize((body.message as string) ?? "");

  // Quantity: must be an integer 1–100
  const rawQty  = Number(body.quantity);
  const quantity = Number.isInteger(rawQty) && rawQty >= 1 && rawQty <= 100 ? rawQty : 1;

  // Field validation
  if (!name || name.length < 2) {
    return NextResponse.json(
      { success: false, message: "Please provide your full name." },
      { status: 422 }
    );
  }
  if (!email || !validateEmail(email)) {
    return NextResponse.json(
      { success: false, message: "Please provide a valid email address." },
      { status: 422 }
    );
  }
  if (!product || !VALID_PRODUCTS.has(product)) {
    return NextResponse.json(
      { success: false, message: "Please select a valid product of interest." },
      { status: 422 }
    );
  }

  /* ── Delivery layer ────────────────────────────────────────────
     Swap the console.log below for your email provider:
     - Nodemailer: nodemailer.createTransport(...)
     - Resend:     resend.emails.send(...)
     - SendGrid:   @sendgrid/mail                               */
  console.log("[Lone Star Peptides] New inquiry:", {
    timestamp: new Date().toISOString(),
    name,
    email,
    product,
    quantity,
    message: message || "(none)",
    ip,
  });

  return NextResponse.json(
    { success: true, message: "Your inquiry has been received. We'll respond within 24 hours." },
    { status: 200 }
  );
}

/* Disallow all other methods */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
