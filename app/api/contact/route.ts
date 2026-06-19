import { NextRequest, NextResponse } from "next/server";

/* ─── Simple in-memory rate limiter ──────────────────────────────
   Tracks requests per IP. Resets per process lifetime.
   For production, replace with Redis or Upstash.             */
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const limit  = 5;

  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/* ─── Validation ──────────────────────────────────────────────── */
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str: string): string {
  return String(str).trim().slice(0, 2000);
}

/* ─── POST /api/contact ───────────────────────────────────────── */
export async function POST(req: NextRequest) {
  // IP-based rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please wait a minute." },
      { status: 429 }
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

  // Field extraction + sanitization
  const name     = sanitize((body.name     as string) ?? "");
  const email    = sanitize((body.email    as string) ?? "");
  const product  = sanitize((body.product  as string) ?? "");
  const quantity = sanitize((body.quantity as string) ?? "1");
  const message  = sanitize((body.message  as string) ?? "");

  // Validation
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
  if (!product) {
    return NextResponse.json(
      { success: false, message: "Please select a product of interest." },
      { status: 422 }
    );
  }

  /* ── Delivery layer ────────────────────────────────────────────
     Swap the console.log below for your email provider:
     - Nodemailer: nodemailer.createTransport(...)
     - Resend:     resend.emails.send(...)
     - SendGrid:   @sendgrid/mail
     All are drop-in replacements for this log block.          */
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
    {
      success: true,
      message: "Your inquiry has been received. We'll respond within 24 hours.",
    },
    { status: 200 }
  );
}

/* Disallow GET */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
