import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In-memory rate limiter (use Redis/Upstash in production)
const rateLimit = new Map<string, { count: number; reset: number }>();

function getRateLimitKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.reset) {
    rateLimit.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// Clean up old entries periodically to prevent memory leak
let lastCleanup = Date.now();
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup > 60000) {
    for (const [key, val] of rateLimit.entries()) {
      if (now > val.reset) rateLimit.delete(key);
    }
    lastCleanup = now;
  }
}

export async function middleware(request: NextRequest) {
  maybeCleanup();

  const { pathname } = request.nextUrl;
  const ip = getRateLimitKey(request);

  // Strict rate limit on auth endpoints: 10 req/min
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/stripe")) {
    if (!checkRateLimit(`${ip}:auth`, 10, 60000)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // General API rate limit: 120 req/min
  if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(`${ip}:api`, 120, 60000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Supabase session refresh + auth redirect
  const response = await updateSession(request);

  // Security headers on all responses
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://api.dicebear.com data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com;"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
