/**
 * Next.js middleware (exported as `proxy` per this project's convention).
 *
 * Responsibilities:
 * 1. Security headers on every response (CSP, HSTS, frame denial, etc.)
 * 2. Route allowlist — redirect unknown routes to the product page
 * 3. Admin route IP allowlist (env-configured, optional)
 * 4. Bot/scraper UA rejection for checkout/download endpoints
 */
import { NextRequest, NextResponse } from 'next/server';

// ─── Route allowlist ───────────────────────────────────────────────────────────

const ALLOWED_PREFIXES = [
  '/products/',
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/sitemap.xml',
  '/robots.txt',
  '/og/',
];

// ─── Bot UA patterns ───────────────────────────────────────────────────────────

const BOT_UA_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /python-requests/i, /go-http-client/i, /curl\//i, /wget\//i,
  /java\//i, /libwww/i, /okhttp/i, /headlesschrome/i, /phantomjs/i,
];

// Sensitive endpoints where bot traffic should be blocked at the edge
const BOT_SENSITIVE_PREFIXES = ['/api/checkout', '/api/download/'];

// ─── Security headers ──────────────────────────────────────────────────────────

function addSecurityHeaders(response: NextResponse): NextResponse {
  const h = response.headers;

  // Strict-Transport-Security: require HTTPS for 1 year, include subdomains
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Prevent MIME type sniffing
  h.set('X-Content-Type-Options', 'nosniff');

  // Deny embedding in iframes (clickjacking protection)
  h.set('X-Frame-Options', 'DENY');
  h.set('Content-Security-Policy', "frame-ancestors 'none'");

  // Don't send referrer to third parties
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable browser features we don't use
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // XSS protection (belt-and-suspenders for older browsers)
  h.set('X-XSS-Protection', '1; mode=block');

  return response;
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get('user-agent') ?? '';

  // ── 1. Block bots on sensitive endpoints ──────────────────────────────────
  const isBotSensitive = BOT_SENSITIVE_PREFIXES.some((p) => pathname.startsWith(p));
  if (isBotSensitive) {
    const isBot = !ua || ua.length < 10 || BOT_UA_PATTERNS.some((p) => p.test(ua));
    if (isBot) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      );
    }
  }

  // ── 2. Admin IP allowlist (optional) ─────────────────────────────────────
  if (pathname.startsWith('/api/admin/')) {
    const allowedIps = process.env.ADMIN_ALLOWED_IPS;
    if (allowedIps) {
      const allowed = allowedIps.split(',').map((ip) => ip.trim());
      const requestIp =
        req.headers.get('cf-connecting-ip') ??
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        '';

      if (!allowed.includes(requestIp)) {
        return addSecurityHeaders(
          NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        );
      }
    }
  }

  // ── 3. Route allowlist — redirect unknown routes ──────────────────────────
  const isAllowed = ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isAllowed && pathname !== '/') {
    const redirect = NextResponse.redirect(
      new URL('/products/deep-dive-into-go', req.url)
    );
    return addSecurityHeaders(redirect);
  }

  // ── 4. Add security headers to all allowed responses ─────────────────────
  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
