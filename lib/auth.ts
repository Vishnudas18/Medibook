import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { JwtPayload, AuthUser, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

/**
 * Sign an access token (15 min expiry)
 */
export function signAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Sign a refresh token (7 day expiry)
 */
export function signRefreshToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

/**
 * Extract auth user from request
 * Reads the Authorization header: "Bearer <accessToken>"
 */
export function getAuthUser(request: NextRequest): AuthUser {
  let token: string | null = null;

  // 1. Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check cookies if no header
  if (!token) {
    token = request.cookies.get('accessToken')?.value || null;
  }

  if (!token) {
    throw new Error('No access token provided');
  }

  try {
    const payload = verifyAccessToken(token);
    return { userId: payload.userId, role: payload.role };
  } catch {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Role guard — check if user has required role
 */
export function requireRole(user: AuthUser, ...roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden: insufficient permissions');
  }
}
