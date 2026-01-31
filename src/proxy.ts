import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 200; // 200 requests per minute

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. NextAuth Protection for /admin
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // 2. Rate Limiting (Skip for Keystatic/Admin to prevent blocking)
  if (!pathname.startsWith("/api/keystatic") && !pathname.startsWith("/keystatic") && !pathname.startsWith("/admin")) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // 3. Vite Client (Dev mode)
  if (pathname === "/@vite/client") {
    return new NextResponse(null, { status: 200 });
  }

  // 4. Keystatic API
  if (pathname.startsWith("/api/keystatic")) {
    return NextResponse.next();
  }

  // 5. Keystatic Admin Protection
  if (pathname.startsWith("/keystatic") && !pathname.match(/\.[a-zA-Z0-9]+$/)) {
    const adminAccess = request.cookies.get("admin-access");
    if (!adminAccess || adminAccess.value !== "true") {
      if (process.env.NODE_ENV === "development") {
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
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
