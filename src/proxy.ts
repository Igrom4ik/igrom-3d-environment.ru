import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/@vite/client') {
    return new NextResponse(null, { status: 200 })
  }

  // Allow Keystatic API requests to pass through
  if (request.nextUrl.pathname.startsWith('/api/keystatic')) {
    return NextResponse.next()
  }

  // Only protect /keystatic routes
  if (request.nextUrl.pathname.startsWith('/keystatic')) {
    // Check for the secret cookie
    const adminAccess = request.cookies.get('admin-access')

    // If no cookie or wrong value, rewrite to 404 (hide existence of admin)
    if (!adminAccess || adminAccess.value !== 'true') {
      // Using rewrite to /404 to show the custom Not Found page without changing URL
      return NextResponse.rewrite(new URL('/404-not-found', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
