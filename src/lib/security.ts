/**
 * Core security utilities.
 *
 * All cryptographic operations use Node.js built-in `crypto` — no third-party
 * crypto dependency so the attack surface stays minimal.
 */
import { createHmac, timingSafeEqual, randomBytes, createHash } from 'crypto';

// ─── Constants ────────────────────────────────────────────────────────────────

// Cashfree webhook signatures must not be older than this
export const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

// One-time download tokens expire after this period
export const DOWNLOAD_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── HMAC helpers ─────────────────────────────────────────────────────────────

/**
 * Constant-time HMAC-SHA256 comparison.
 * Prevents timing attacks when validating webhook signatures.
 */
export function verifyHmacSha256(
  payload: string,
  secret: string,
  receivedSignature: string
): boolean {
  try {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(receivedSignature, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ─── Cashfree webhook signature ───────────────────────────────────────────────

/**
 * Cashfree PG v3+ webhook signature verification.
 *
 * Cashfree signs as: HMAC-SHA256( timestamp + rawBody, CLIENT_SECRET )
 * Header: x-webhook-signature   (hex or base64)
 *         x-webhook-timestamp   (Unix seconds as string)
 *
 * Reference: https://docs.cashfree.com/docs/payment-gateway-webhooks
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  receivedSignature: string,
  secret: string
): boolean {
  if (!rawBody || !timestamp || !receivedSignature || !secret) return false;

  const message = `${timestamp}${rawBody}`;
  const expectedHex = createHmac('sha256', secret).update(message).digest('hex');
  const expectedB64 = createHmac('sha256', secret).update(message).digest('base64');

  // Accept both hex and base64 — Cashfree sandbox vs production may differ
  const sigHex = Buffer.from(receivedSignature, 'hex');
  const expectedHexBuf = Buffer.from(expectedHex, 'hex');

  try {
    if (sigHex.length === expectedHexBuf.length && timingSafeEqual(sigHex, expectedHexBuf)) {
      return true;
    }
  } catch { /* fall through */ }

  try {
    const sigB64 = Buffer.from(receivedSignature, 'base64');
    const expectedB64Buf = Buffer.from(expectedB64, 'base64');
    if (sigB64.length === expectedB64Buf.length && timingSafeEqual(sigB64, expectedB64Buf)) {
      return true;
    }
  } catch { /* fall through */ }

  return false;
}

// ─── Replay attack prevention ─────────────────────────────────────────────────

/**
 * Returns true if the webhook timestamp is within the acceptable window.
 * Rejects stale webhooks that could be replayed.
 */
export function isWebhookTimestampFresh(timestampSeconds: string): boolean {
  const ts = parseInt(timestampSeconds, 10);
  if (isNaN(ts)) return false;
  const ageMs = Date.now() - ts * 1000;
  return ageMs >= 0 && ageMs <= WEBHOOK_MAX_AGE_MS;
}

// ─── One-time download token ──────────────────────────────────────────────────

/**
 * Generates a cryptographically secure one-time download token.
 * Returns the plaintext token (sent to the user once) and its SHA-256 hash
 * (what we store in MongoDB — never store the plaintext).
 */
export function generateDownloadToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('hex'); // 64-char hex
  const tokenHash = sha256Hex(token);
  return { token, tokenHash };
}

/**
 * Hash a token for storage/lookup. Uses SHA-256 — not bcrypt because
 * download tokens are random 256-bit values (brute-force impossible).
 */
export function hashToken(token: string): string {
  return sha256Hex(token);
}

// ─── General hashing ──────────────────────────────────────────────────────────

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

// ─── NoSQL injection sanitization ─────────────────────────────────────────────

const NOSQL_OPERATOR_PATTERN = /^\$/;
const NESTED_OPERATOR_PATTERN = /\.\$/;

/**
 * Recursively strips MongoDB operator keys ($where, $gt, $in, etc.)
 * from an arbitrary object to prevent NoSQL injection.
 */
export function sanitizeMongoInput<T>(input: T): T {
  if (typeof input === 'string') {
    // Block query-string injection attempts
    if (NOSQL_OPERATOR_PATTERN.test(input) || NESTED_OPERATOR_PATTERN.test(input)) {
      throw new Error('Invalid input: MongoDB operators not allowed');
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeMongoInput) as unknown as T;
  }

  if (input !== null && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (NOSQL_OPERATOR_PATTERN.test(key)) {
        throw new Error(`Invalid input: MongoDB operator key "${key}" is not allowed`);
      }
      sanitized[key] = sanitizeMongoInput(value);
    }
    return sanitized as T;
  }

  return input;
}

// ─── Request fingerprinting ───────────────────────────────────────────────────

interface RequestContext {
  ip: string;
  userAgent: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
}

/**
 * Generates a lightweight request fingerprint for bot / automation detection.
 * Not a substitute for a real bot-detection service, but catches naive scrapers.
 */
export function buildRequestFingerprint(ctx: RequestContext): string {
  const raw = [ctx.ip, ctx.userAgent, ctx.acceptLanguage ?? '', ctx.acceptEncoding ?? ''].join('|');
  return sha256Hex(raw).slice(0, 16); // short prefix — enough for bucketing
}

// ─── IP extraction ────────────────────────────────────────────────────────────

export function extractIp(headers: Headers): string {
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const xfwd = headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0].trim();

  return headers.get('x-real-ip')?.trim() ?? 'unknown';
}

// ─── Bot signal detection ─────────────────────────────────────────────────────

const KNOWN_BOT_UA_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /python-requests/i, /go-http-client/i, /curl\//i, /wget\//i,
  /java\//i, /libwww/i, /okhttp/i, /axios\/[0-9]/i,
  /headlesschrome/i, /phantomjs/i,
];

export function looksLikeBot(userAgent: string): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  return KNOWN_BOT_UA_PATTERNS.some((p) => p.test(userAgent));
}

// ─── Idempotency key ──────────────────────────────────────────────────────────

/**
 * Builds a deterministic idempotency key for a webhook event.
 * Cashfree guarantees cfOrderId + cfPaymentId is unique per payment event.
 */
export function buildWebhookIdempotencyKey(cfOrderId: string, cfPaymentId: string, eventType: string): string {
  return sha256Hex(`${cfOrderId}:${cfPaymentId}:${eventType}`);
}
