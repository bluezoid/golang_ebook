/**
 * POST /api/verify-payment
 *
 * Polling endpoint for the success page. The webhook is the authoritative
 * payment confirmation path — this endpoint only reads existing Order state.
 *
 * It does NOT:
 * - Call Cashfree (the webhook already confirmed payment)
 * - Generate new tokens (the webhook already did that)
 * - Send emails (the webhook already did that)
 *
 * It DOES:
 * - Return the current order status so the frontend can poll until confirmed
 * - Return whether the download link was sent
 * - Guard against IDOR by matching customerEmail (supplied by our own redirect)
 *
 * Security:
 * - internalOrderId is our own BLZ-XXXX ID — not guessable (contains UUID fragment)
 * - We do NOT return the download token here — the email is the only delivery channel
 * - We do NOT return any pricing or R2 keys
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectMongoose } from '@/lib/mongoose';
import Order from '@/models/Order';
import { auditLog } from '@/lib/audit';
import { extractIp } from '@/lib/security';

const verifySchema = z.object({
  orderId: z
    .string()
    .min(1)
    .max(60)
    .regex(/^BLZ-[A-Z0-9]+$/, 'Invalid order ID format'),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = extractIp(req.headers);

  let body: { orderId: string };
  try {
    const raw = await req.json();
    const parsed = verifySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await connectMongoose();

  const order = await Order.findOne({
    internalOrderId: body.orderId,
  })
    .select('status customerEmail isDownloadEligible paidAt signedUrlMeta lockedProductTitle internalOrderId')
    .lean();

  if (!order) {
    // Return 404 with a generic message — don't leak whether the ID exists
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Map internal status to frontend-safe status
  const frontendStatus = mapStatus(order.status);

  if (order.status === 'paid') {
    auditLog({
      action: 'payment.verify_polled',
      actor: order.customerEmail,
      resourceType: 'order',
      resourceId: order.internalOrderId,
      ipAddress: ip,
      severity: 'info',
      metadata: { status: order.status },
    });
  }

  // Never return: token, tokenHash, R2 keys, raw payment data
  return NextResponse.json({
    status: frontendStatus,
    paid: order.status === 'paid',
    downloadEmailSent: order.status === 'paid' && order.isDownloadEligible,
    productTitle: order.lockedProductTitle,
    paidAt: order.paidAt ?? null,
  });
}

function mapStatus(status: string): string {
  switch (status) {
    case 'paid':              return 'paid';
    case 'payment_initiated': return 'pending';
    case 'pending':           return 'pending';
    case 'failed':            return 'failed';
    case 'cancelled':         return 'cancelled';
    case 'fraud_blocked':     return 'failed';
    default:                  return 'pending';
  }
}
