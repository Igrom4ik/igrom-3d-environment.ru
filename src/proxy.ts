import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
// Note: In a serverless environment (Vercel), this map might be reset frequently.
// For robust rate limiting, use Redis (e.g., @upstash/ratelimit).
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 200; // 200 requests per minute (generous for assets)

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (now - record.lastReset > WINDOW_MS) {
    record.count = 1;
    record.lastReset = now;
    return false;
  }

  record.count += 1;
  return record.count > MAX_REQUESTS;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Rate Limiting for Admin/Keystatic API to prevent blocking the dashboard
  if (pathname.startsWith("/api/keystatic") || pathname.startsWith("/keystatic")) {
    // Pass through to the Auth check below
  } else {
    // 1. Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Stricter limit for API
    const isApi = pathname.startsWith('/api');
    // const limit = isApi ? 60 : 200; // Unused in current isRateLimited implementation which uses global MAX_REQUESTS

    if (isRateLimited(ip)) {
       return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // 2. Admin / Keystatic Protection
  if (pathname === "/@vite/client") {
    return new NextResponse(null, { status: 200 });
  }

  // Allow Keystatic API requests to pass through
  if (pathname.startsWith("/api/keystatic")) {
    return NextResponse.next();
  }

  // Only protect /keystatic routes
  // Exclude explicit file extensions to avoid blocking JS/CSS assets
  if (pathname.startsWith("/keystatic") && !pathname.match(/\.[a-zA-Z0-9]+$/)) {
    // TEMPORARY: Disable auth check for debugging
    // const adminAccess = request.cookies.get("admin-access");
    // if (!adminAccess || adminAccess.value !== "true") { ... }
    
    // Check if we are in dev mode
    const adminAccess = request.cookies.get("admin-access");
    if (!adminAccess || adminAccess.value !== "true") {
      if (process.env.NODE_ENV === "development") {
         // In development, we can be more lenient or just redirect to secret-login
         return NextResponse.redirect(new URL("/secret-login", request.url));
      } else {
         return NextResponse.rewrite(new URL("/404-not-found", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc) - hard to detect without regex on extension
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
