/**
 * Admin authentication helper.
 *
 * Uses a static bearer token stored in ADMIN_API_KEY env var.
 * Simple but sufficient for a single-operator product — no session management needed.
 * Swap for a proper RBAC system when team grows.
 */
import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

export function verifyAdminToken(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;

  const authHeader = req.headers.get('authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return false;

  const provided = authHeader.slice(7).trim();
  if (!provided) return false;

  try {
    const a = Buffer.from(adminKey, 'utf8');
    const b = Buffer.from(provided, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
