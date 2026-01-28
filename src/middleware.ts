import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    
    // We can't use our fs-based logger here because middleware runs in Edge Runtime
    // But we can use console.log which will show up in Vercel logs and local terminal
    console.log(`[REQUEST] ${new Date().toISOString()} ${request.method} ${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
