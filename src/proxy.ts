import { NextRequest, NextResponse } from 'next/server';

// Routes that are allowed to exist
const ALLOWED_PREFIXES = [
  '/products/deep-dive-into-go',
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/sitemap.xml',
  '/robots.txt',
  '/og/',
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all defined routes
  const isAllowed = ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAllowed) {
    return NextResponse.next();
  }

  // Redirect everything else to the product page
  return NextResponse.redirect(new URL('/products/deep-dive-into-go', req.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
