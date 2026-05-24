/**
 * Rate limiter backed by MongoDB RateLimitTracking collection.
 *
 * Uses a sliding-window counter per (endpoint, IP) pair.
 * Falls back to an in-memory map if the DB is unreachable — ensures
 * the application stays up but logs the degradation.
 */
import mongoose from 'mongoose';
import RateLimitTracking from '@/models/RateLimitTracking';

export interface RateLimitConfig {
  endpoint: string;
  windowMs: number;    // window duration in ms
  maxRequests: number; // max allowed in window
  blockDurationMs?: number; // how long to block after violation (default: windowMs)
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: Date;
}

// ─── In-memory fallback (per-process) ─────────────────────────────────────────
const memoryFallback = new Map<string, { count: number; windowStart: number }>();

function checkMemoryFallback(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = memoryFallback.get(key);

  if (!entry || now - entry.windowStart > config.windowMs) {
    memoryFallback.set(key, { count: 1, windowStart: now });
    return { limited: false, remaining: config.maxRequests - 1, resetAt: new Date(now + config.windowMs) };
  }

  entry.count++;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  return {
    limited: entry.count > config.maxRequests,
    remaining,
    resetAt: new Date(entry.windowStart + config.windowMs),
  };
}

// ─── DB-backed rate limiter ────────────────────────────────────────────────────

export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.endpoint}:${ip}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  // Use MongoDB findOneAndUpdate for atomic increment
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('[rate-limiter] MongoDB not ready, using in-memory fallback');
      return checkMemoryFallback(key, config);
    }

    const record = await RateLimitTracking.findOneAndUpdate(
      { key, windowStart: { $gte: windowStart } },
      {
        $inc: { requestCount: 1 },
        $set: { lastSeen: now, endpoint: config.endpoint, ipAddress: ip },
        $setOnInsert: { windowStart: now, isBlocked: false, blockedUntil: null },
      },
      { upsert: true, new: true }
    );

    if (!record) {
      return { limited: false, remaining: config.maxRequests - 1, resetAt: new Date(now.getTime() + config.windowMs) };
    }

    const count = record.requestCount;
    const limited = count > config.maxRequests || record.isBlocked;
    const remaining = Math.max(0, config.maxRequests - count);
    const resetAt = new Date(record.windowStart.getTime() + config.windowMs);

    // Mark as blocked if exceeded
    if (count > config.maxRequests && !record.isBlocked) {
      const blockDuration = config.blockDurationMs ?? config.windowMs;
      await RateLimitTracking.updateOne(
        { key },
        { $set: { isBlocked: true, blockedUntil: new Date(now.getTime() + blockDuration) } }
      );
    }

    return { limited, remaining, resetAt };
  } catch (err) {
    console.error('[rate-limiter] DB error, falling back to memory:', err);
    return checkMemoryFallback(key, config);
  }
}

// ─── Endpoint-specific configs ─────────────────────────────────────────────────

export const RATE_LIMITS = {
  checkout: { endpoint: 'checkout', windowMs: 60_000, maxRequests: 5, blockDurationMs: 300_000 },
  verifyPayment: { endpoint: 'verify-payment', windowMs: 60_000, maxRequests: 10 },
  sampleDownload: { endpoint: 'sample-download', windowMs: 60_000, maxRequests: 5 },
  download: { endpoint: 'download', windowMs: 60_000, maxRequests: 3, blockDurationMs: 900_000 },
  productsApi: { endpoint: 'products-api', windowMs: 60_000, maxRequests: 30 },
  adminApi: { endpoint: 'admin-api', windowMs: 60_000, maxRequests: 60 },
  webhook: { endpoint: 'webhook', windowMs: 60_000, maxRequests: 100 }, // Cashfree may batch
} satisfies Record<string, RateLimitConfig>;
