import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
);

// Role-based route access
const routePermissions: Record<string, string[]> = {
  '/benchmarks': ['admin', 'analyst'],
  '/audit': ['admin', 'auditor'],
  '/settings/users': ['admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('refreshToken')?.value;

  // Public routes
  if (pathname === '/login') {
    // If already logged in, redirect to documents
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/documents', request.url));
      } catch {
        // Token invalid, allow access to login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protected routes - check for token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Check role-based access for specific routes
    for (const [route, allowedRoles] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        // Redirect to documents if role doesn't match
        return NextResponse.redirect(new URL('/documents', request.url));
      }
    }

    // Add role header for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-role', role);
    requestHeaders.set('x-user-id', payload.sub as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // Token invalid or expired
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('refreshToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};
