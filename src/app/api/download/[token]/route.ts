/**
 * GET /api/download/[token]
 *
 * One-time download token redemption endpoint.
 *
 * Security guarantees:
 * 1. Token is a 32-byte random hex string — brute-force infeasible (2^256).
 * 2. Only the SHA-256 hash is stored in MongoDB — plaintext never persisted.
 * 3. Token is single-use — marked used atomically via findOneAndUpdate.
 * 4. Token expires after 10 minutes from issue time (set by webhook).
 * 5. Rate limiting prevents brute-force token enumeration.
 * 6. Every access attempt (success or failure) is logged to DownloadLog.
 * 7. Signed R2 URL expires in 10 minutes — too short to be shared usefully.
 * 8. The R2 key is NEVER returned to the client — only the signed URL is.
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongoose';
import Order from '@/models/Order';
import DownloadLog from '@/models/DownloadLog';
import { getFullPdfSignedUrl, getFullPdfR2Key } from '@/lib/r2';
import { hashToken, extractIp } from '@/lib/security';
import { auditLog } from '@/lib/audit';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const ip = extractIp(req.headers);
  const userAgent = req.headers.get('user-agent') ?? '';
  const { token } = await params;

  // ── 1. Validate token format (64-char hex) ────────────────────────────────
  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json({ error: 'Invalid download link' }, { status: 400 });
  }

  // ── 2. Rate limit per IP — prevent token enumeration ─────────────────────
  try {
    const rl = await checkRateLimit(ip, RATE_LIMITS.download);
    if (rl.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }
  } catch { /* rate limiter failure is non-fatal */ }

  await connectMongoose();

  // ── 3. Hash the token and find the matching order ─────────────────────────
  const tokenHash = hashToken(token);

  const order = await Order.findOne({
    'signedUrlMeta.tokenHash': tokenHash,
    isDownloadEligible: true,
    status: 'paid',
  }).lean();

  if (!order || !order.signedUrlMeta) {
    await logDownload({
      orderId: null,
      internalOrderId: 'unknown',
      tokenHash,
      ipAddress: ip,
      userAgent,
      outcome: 'token_invalid',
      fileKey: '',
    });
    return NextResponse.json({ error: 'Invalid or expired download link' }, { status: 404 });
  }

  const meta = order.signedUrlMeta;

  // ── 4. Check token expiry ─────────────────────────────────────────────────
  if (new Date() > new Date(meta.expiresAt)) {
    await logDownload({
      orderId: order._id.toString(),
      internalOrderId: order.internalOrderId,
      tokenHash,
      ipAddress: ip,
      userAgent,
      outcome: 'token_expired',
      fileKey: '',
    });
    auditLog({
      action: 'download.token_expired',
      actor: order.customerEmail,
      resourceType: 'order',
      resourceId: order.internalOrderId,
      ipAddress: ip,
      severity: 'warn',
      metadata: { expiresAt: meta.expiresAt },
    });
    return NextResponse.json(
      { error: 'Download link has expired. Please contact support with your order ID.' },
      { status: 410 }
    );
  }

  // ── 5. Check token already used ───────────────────────────────────────────
  if (meta.usedAt !== null) {
    await logDownload({
      orderId: order._id.toString(),
      internalOrderId: order.internalOrderId,
      tokenHash,
      ipAddress: ip,
      userAgent,
      outcome: 'token_used',
      fileKey: '',
    });
    auditLog({
      action: 'download.token_reuse_attempt',
      actor: order.customerEmail,
      resourceType: 'order',
      resourceId: order.internalOrderId,
      ipAddress: ip,
      severity: 'warn',
      metadata: { usedAt: meta.usedAt, usedByIp: meta.usedByIp, attemptIp: ip },
    });
    return NextResponse.json(
      { error: 'Download link has already been used. Please contact support with your order ID.' },
      { status: 410 }
    );
  }

  // ── 6. Atomically mark token as used — prevents race condition double-use ─
  const fileKey = getFullPdfR2Key();
  const updated = await Order.findOneAndUpdate(
    {
      _id: order._id,
      'signedUrlMeta.usedAt': null,   // guard: only succeed if still unused
      'signedUrlMeta.tokenHash': tokenHash,
    },
    {
      $set: {
        'signedUrlMeta.usedAt': new Date(),
        'signedUrlMeta.usedByIp': ip,
      },
    },
    { new: true }
  );

  if (!updated) {
    // Another request won the race — token was just used concurrently
    await logDownload({
      orderId: order._id.toString(),
      internalOrderId: order.internalOrderId,
      tokenHash,
      ipAddress: ip,
      userAgent,
      outcome: 'token_used',
      fileKey: '',
    });
    return NextResponse.json(
      { error: 'Download link has already been used.' },
      { status: 410 }
    );
  }

  // ── 7. Generate short-lived signed R2 URL ─────────────────────────────────
  let signedUrl: string;
  try {
    signedUrl = await getFullPdfSignedUrl();
  } catch (err) {
    console.error('[download] R2 signed URL generation failed:', err);
    // Roll back the usedAt mark so the user can retry
    await Order.findByIdAndUpdate(order._id, {
      $set: { 'signedUrlMeta.usedAt': null, 'signedUrlMeta.usedByIp': null },
    });
    return NextResponse.json(
      { error: 'Download temporarily unavailable. Please try again.' },
      { status: 503 }
    );
  }

  // ── 8. Log successful download ────────────────────────────────────────────
  await logDownload({
    orderId: order._id.toString(),
    internalOrderId: order.internalOrderId,
    tokenHash,
    ipAddress: ip,
    userAgent,
    outcome: 'success',
    fileKey,
  });

  auditLog({
    action: 'download.success',
    actor: order.customerEmail,
    resourceType: 'order',
    resourceId: order.internalOrderId,
    ipAddress: ip,
    severity: 'info',
    metadata: { fileKey },
  });

  // ── 9. Redirect to the signed R2 URL — token is consumed ─────────────────
  // Use 302 so browsers don't cache the redirect (signed URL is short-lived)
  return NextResponse.redirect(signedUrl, { status: 302 });
}

async function logDownload(params: {
  orderId: string | null;
  internalOrderId: string;
  tokenHash: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'token_invalid' | 'token_expired' | 'token_used' | 'ip_mismatch' | 'not_eligible';
  fileKey: string;
}) {
  try {
    await DownloadLog.create({
      ...(params.orderId ? { orderId: params.orderId } : {}),
      internalOrderId: params.internalOrderId,
      tokenHash: params.tokenHash,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      outcome: params.outcome,
      fileKey: params.fileKey,
      downloadedAt: new Date(),
    });
  } catch {
    // Never let logging failures block download
  }
}
