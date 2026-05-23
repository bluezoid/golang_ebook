import { NextResponse } from 'next/server';
import { getSamplePdfSignedUrl } from '@/lib/r2';

// Rate limiting via simple in-memory store (per-process)
// For production, use Upstash Redis or similar
const requestLog = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  times.push(now);
  requestLog.set(ip, times);
  return times.length > MAX_REQUESTS;
}

export async function GET(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const url = await getSamplePdfSignedUrl();
    return NextResponse.redirect(url, { status: 302 });
  } catch (err) {
    console.error('[sample-download] Error:', err);
    return NextResponse.json({ error: 'Download unavailable' }, { status: 500 });
  }
}
