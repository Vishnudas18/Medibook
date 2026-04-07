import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

interface TokenPayload {
  userId: string;
  role: 'patient' | 'doctor' | 'admin';
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// Routes that require specific roles
const protectedRoutes: Record<string, string[]> = {
  '/patient': ['patient'],
  '/doctor': ['doctor'],
  '/admin': ['admin'],
};

const protectedApiRoutes: Record<string, string[]> = {
  '/api/admin': ['admin'],
  '/api/doctors/availability': ['doctor'],
  '/api/doctors/leave': ['doctor'],
  '/api/doctors/profile': ['doctor'],
  '/api/appointments/doctor': ['doctor'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/doctor-register' ||
    pathname.startsWith('/api/auth') ||
    (pathname.startsWith('/api/doctors') &&
      !pathname.startsWith('/api/doctors/profile') &&
      !pathname.startsWith('/api/doctors/availability') &&
      !pathname.startsWith('/api/doctors/leave')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/api/payment/webhook'
  ) {
    return NextResponse.next();
  }

  // Get token from Authorization header or cookie
  let token: string | null = null;

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    token = request.cookies.get('accessToken')?.value || null;
  }

  // Check if it's a protected page route
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (!roles.includes(payload.role)) {
        // Redirect to their own dashboard
        const redirectPath = `/${payload.role}/dashboard`;
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }

      return NextResponse.next();
    }
  }

  // Check if it's a protected API route
  for (const [route, roles] of Object.entries(protectedApiRoutes)) {
    if (pathname.startsWith(route)) {
      if (!token) {
        return Response.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      const payload = await verifyToken(token);
      if (!payload) {
        return Response.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      if (!roles.includes(payload.role)) {
        return Response.json(
          { success: false, error: 'Forbidden: insufficient permissions' },
          { status: 403 }
        );
      }

      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
