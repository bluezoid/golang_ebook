/**
 * POST /api/webhooks/cashfree
 *
 * This is the server-authoritative payment confirmation endpoint.
 *
 * Security guarantees:
 * 1. Signature is verified via HMAC-SHA256 before ANY processing.
 * 2. Timestamp freshness check prevents replay attacks.
 * 3. Idempotency key prevents duplicate payment processing.
 * 4. Amount reconciliation confirms paidAmount === lockedOrderAmount.
 * 5. Order status transitions are guarded — can only move forward.
 * 6. All events logged to WebhookLog and AuditLog.
 * 7. Frontend redirect is NEVER trusted — only this webhook is authoritative.
 *
 * IMPORTANT: This route must use the raw request body (not parsed JSON)
 * for signature verification. We read it as text first, then parse.
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongoose';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import WebhookLog from '@/models/WebhookLog';
import { verifyCashfreeWebhook, reconcileAmounts } from '@/lib/cashfree';
// R2 import reserved for future pre-signed URL generation in webhook
import { generateDownloadToken } from '@/lib/security';
import { auditLog } from '@/lib/audit';
import { sendEbookDeliveryEmail } from '@/lib/brevo';
import FraudMonitoring from '@/models/FraudMonitoring';

// Cashfree may retry webhooks — always return 200 to stop retries
const WEBHOOK_OK = NextResponse.json({ received: true }, { status: 200 });
const WEBHOOK_REJECT = NextResponse.json({ received: false }, { status: 200 }); // 200 to stop retries

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Read raw body as text FIRST (required for signature verification) ──────
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return WEBHOOK_REJECT;
  }

  if (!rawBody || rawBody.length === 0) return WEBHOOK_REJECT;

  // ── 2. Verify webhook signature + timestamp (replay protection) ───────────────
  const headers: Record<string, string | null> = {
    'x-webhook-signature': req.headers.get('x-webhook-signature'),
    'x-webhook-timestamp': req.headers.get('x-webhook-timestamp'),
  };

  const verification = verifyCashfreeWebhook(rawBody, headers);

  await connectMongoose();

  // ── 3. Log ALL webhook events — valid or not ──────────────────────────────────
  // We log before processing so we have a record even if processing fails
  const logEntry = {
    provider: 'cashfree',
    eventType: verification.eventType ?? 'UNKNOWN',
    cfOrderId: verification.cfOrderId ?? '',
    cfPaymentId: verification.cfPaymentId ?? '',
    signatureValid: verification.valid,
    isReplay: verification.isReplay,
    idempotencyKey: verification.idempotencyKey || `invalid-${Date.now()}`,
    rawHeaders: {
      'x-webhook-signature': headers['x-webhook-signature'] ?? '',
      'x-webhook-timestamp': headers['x-webhook-timestamp'] ?? '',
    },
    rawBody: rawBody.length > 10_000 ? { truncated: true } : (() => {
      try { return JSON.parse(rawBody); } catch { return { raw: rawBody }; }
    })(),
    receivedAt: new Date(),
    processedAt: null,
    processingError: '',
    processingResult: 'pending' as const,
  };

  if (!verification.valid) {
    // Invalid signature — log as rejected and alert fraud monitoring
    await WebhookLog.create({
      ...logEntry,
      processingResult: 'rejected',
      processingError: verification.error ?? 'Signature invalid',
    }).catch((e) => console.error('[webhook] log write failed:', e));

    if (verification.isReplay) {
      FraudMonitoring.create({
        signalType: 'replay_attack',
        ipAddress: req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '',
        description: `Webhook replay attempt: ${verification.error}`,
        severity: 'high',
        isBlocked: false,
        metadata: { timestamp: headers['x-webhook-timestamp'] },
        detectedAt: new Date(),
      }).catch(() => {});
    } else {
      FraudMonitoring.create({
        signalType: 'webhook_spoof_attempt',
        ipAddress: req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? '',
        description: `Invalid webhook signature: ${verification.error}`,
        severity: 'critical',
        isBlocked: false,
        metadata: { headers: logEntry.rawHeaders },
        detectedAt: new Date(),
      }).catch(() => {});
    }

    auditLog({
      action: 'payment.webhook_received',
      actor: 'cashfree-webhook',
      resourceType: 'webhook',
      resourceId: verification.cfOrderId ?? 'unknown',
      severity: 'critical',
      metadata: { valid: false, reason: verification.error },
    });

    return WEBHOOK_REJECT;
  }

  // ── 4. Idempotency guard — prevent duplicate processing ───────────────────────
  const existingLog = await WebhookLog.findOne({
    idempotencyKey: verification.idempotencyKey,
    processingResult: 'accepted',
  }).lean();

  if (existingLog) {
    await WebhookLog.create({
      ...logEntry,
      processingResult: 'duplicate',
      processingError: 'Already processed',
      processedAt: new Date(),
    }).catch(() => {});
    return WEBHOOK_OK; // Already processed — return 200 to stop Cashfree retries
  }

  // ── 5. Only process PAYMENT_SUCCESS events ────────────────────────────────────
  const eventType = verification.eventType ?? '';
  const paymentStatus = verification.paymentStatus ?? '';
  const isSuccessEvent =
    eventType.includes('PAYMENT_SUCCESS') ||
    paymentStatus === 'SUCCESS';

  if (!isSuccessEvent) {
    await WebhookLog.create({
      ...logEntry,
      processingResult: 'accepted',
      processingError: '',
      processedAt: new Date(),
    }).catch(() => {});
    return WEBHOOK_OK; // Non-success events are logged but ignored
  }

  // ── 6. Find the order ─────────────────────────────────────────────────────────
  // Cashfree sandbox sends order.order_id as our internal BLZ-... ID,
  // but production sends the numeric cf_order_id. Try both.
  const cfOrderId = verification.cfOrderId!;
  const order =
    await Order.findOne({ cashfreeOrderId: cfOrderId }) ??
    await Order.findOne({ internalOrderId: cfOrderId });

  if (!order) {
    await WebhookLog.create({
      ...logEntry,
      processingResult: 'error',
      processingError: `Order not found for cfOrderId: ${cfOrderId}`,
      processedAt: new Date(),
    }).catch(() => {});
    console.error(`[webhook] Order not found for cfOrderId=${cfOrderId}`);
    return WEBHOOK_OK; // Return 200 to prevent Cashfree retries for unknown orders
  }

  // ── 7. Guard against re-processing already-paid orders ───────────────────────
  if (order.status === 'paid') {
    await WebhookLog.create({
      ...logEntry,
      processingResult: 'duplicate',
      processingError: 'Order already paid',
      processedAt: new Date(),
    }).catch(() => {});
    return WEBHOOK_OK;
  }

  // ── 8. Amount reconciliation — paidAmount MUST equal lockedAmount ─────────────
  const { matched, delta } = reconcileAmounts(
    order.lockedAmount,
    verification.paidAmount ?? 0,
    order.lockedCurrency
  );

  if (!matched) {
    // Amount mismatch — this is a critical security event
    await Order.findByIdAndUpdate(order._id, {
      status: 'fraud_blocked',
      fraudFlag: 'amount_mismatch',
    });

    const paymentRecord = await Payment.create({
      orderId: order._id,
      internalOrderId: order.internalOrderId,
      cfPaymentId: verification.cfPaymentId ?? '',
      cfOrderId,
      webhookSignatureVerified: true,
      webhookTimestamp: new Date(),
      webhookIdempotencyKey: verification.idempotencyKey,
      isReplay: false,
      paidAmount: verification.paidAmount ?? 0,
      paidCurrency: verification.paidCurrency ?? 'INR',
      lockedAmount: order.lockedAmount,
      reconciliationStatus: 'amount_mismatch',
      amountDelta: delta,
      paymentMethod: verification.paymentMethod ?? '',
      paymentStatus: verification.paymentStatus ?? '',
      rawWebhookPayload: verification.rawPayload ?? {},
      rawCashfreeResponse: {},
    });

    await WebhookLog.create({
      ...logEntry,
      processingResult: 'rejected',
      processingError: `Amount mismatch: paid=${verification.paidAmount}, locked=${order.lockedAmount}, delta=${delta}`,
      processedAt: new Date(),
    }).catch(() => {});

    auditLog({
      action: 'payment.amount_mismatch',
      actor: 'cashfree-webhook',
      resourceType: 'order',
      resourceId: order.internalOrderId,
      severity: 'critical',
      metadata: {
        lockedAmount: order.lockedAmount,
        paidAmount: verification.paidAmount,
        delta,
        cfOrderId,
      },
    });

    FraudMonitoring.create({
      signalType: 'amount_probe',
      email: order.customerEmail,
      orderId: order.internalOrderId,
      description: `Amount mismatch: expected ${order.lockedAmount}, got ${verification.paidAmount}`,
      severity: 'critical',
      isBlocked: true,
      metadata: { delta, cfOrderId, paymentId: paymentRecord._id.toString() },
      detectedAt: new Date(),
    }).catch(() => {});

    return WEBHOOK_OK; // 200 to prevent infinite retries
  }

  // ── 9. Record payment — idempotent upsert ─────────────────────────────────────
  let paymentDoc;
  try {
    paymentDoc = await Payment.create({
      orderId: order._id,
      internalOrderId: order.internalOrderId,
      cfPaymentId: verification.cfPaymentId ?? '',
      cfOrderId,
      webhookSignatureVerified: true,
      webhookTimestamp: new Date(),
      webhookIdempotencyKey: verification.idempotencyKey,
      isReplay: false,
      paidAmount: verification.paidAmount ?? 0,
      paidCurrency: verification.paidCurrency ?? 'INR',
      lockedAmount: order.lockedAmount,
      reconciliationStatus: 'matched',
      amountDelta: 0,
      paymentMethod: verification.paymentMethod ?? '',
      paymentStatus: verification.paymentStatus ?? '',
      rawWebhookPayload: verification.rawPayload ?? {},
      rawCashfreeResponse: {},
    });
  } catch (err: unknown) {
    // Duplicate key on webhookIdempotencyKey = already processed
    if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      await WebhookLog.create({ ...logEntry, processingResult: 'duplicate', processedAt: new Date() }).catch(() => {});
      return WEBHOOK_OK;
    }
    throw err;
  }

  // ── 10. Generate one-time download token ──────────────────────────────────────
  const { token, tokenHash } = generateDownloadToken();
  const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // ── 11. Mark order as PAID with token ─────────────────────────────────────────
  await Order.findByIdAndUpdate(order._id, {
    status: 'paid',
    isDownloadEligible: true,
    paidAt: new Date(),
    signedUrlMeta: {
      token,              // cleartext token — only stored temporarily, sent in email
      tokenHash,          // this is what we verify against
      issuedAt: new Date(),
      expiresAt: tokenExpiry,
      usedAt: null,
      usedByIp: null,
    },
  });

  // ── 12. Generate signed R2 URL and send email ─────────────────────────────────
  let emailSent = false;
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bluezoid.in';
    // The download link goes through our /api/download/[token] endpoint —
    // NOT directly to R2. This lets us enforce one-time use and access logging.
    const downloadLink = `${appUrl}/api/download/${token}`;

    await sendEbookDeliveryEmail({
      toEmail: order.customerEmail,
      toName: order.customerName,
      downloadUrl: downloadLink,
      orderId: order.internalOrderId,
    });
    emailSent = true;
  } catch (err) {
    // Email failure must not block the webhook from returning 200
    // The user can contact support with their order ID
    console.error('[webhook] Email delivery failed:', err);
  }

  // ── 13. Finalize webhook log ───────────────────────────────────────────────────
  await WebhookLog.create({
    ...logEntry,
    processingResult: 'accepted',
    processingError: emailSent ? '' : 'Email delivery failed',
    processedAt: new Date(),
  }).catch(() => {});

  auditLog({
    action: 'order.paid',
    actor: 'cashfree-webhook',
    resourceType: 'order',
    resourceId: order.internalOrderId,
    after: {
      status: 'paid',
      paidAmount: verification.paidAmount,
      currency: verification.paidCurrency,
      emailSent,
      paymentId: paymentDoc._id.toString(),
    },
    severity: 'info',
    metadata: { cfOrderId, cfPaymentId: verification.cfPaymentId },
  });

  return WEBHOOK_OK;
}
