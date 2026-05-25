/**
 * POST /api/checkout
 *
 * Security guarantees:
 * 1. Amount is NEVER accepted from the frontend — fetched from MongoDB only.
 * 2. Product existence, active status, and sale eligibility are verified server-side.
 * 3. Price is LOCKED in the Order document before Cashfree is called.
 * 4. Fraud checks run before any order is created.
 * 5. Rate limiting enforced per IP.
 * 6. All events are audit-logged.
 *
 * Frontend sends ONLY: productSlug, firstName, lastName, email, phone.
 * Frontend sends NOTHING about amount, currency, or pricing.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { connectMongoose } from '@/lib/mongoose';
import Product from '@/models/Product';
import Order, { type IOrder } from '@/models/Order';
import PaymentAttempt from '@/models/PaymentAttempt';
import { createCashfreeOrder } from '@/lib/cashfree';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';
import { runFraudChecks } from '@/lib/fraud';
import { auditLog } from '@/lib/audit';
import { extractIp, sanitizeMongoInput } from '@/lib/security';
import { checkoutSchema } from '@/lib/validators';

// ─── Request schema ────────────────────────────────────────────────────────────
// The frontend ONLY sends identity + product slug.
// Amount, currency, and price data are NEVER accepted from the client.

const checkoutRequestSchema = checkoutSchema.extend({
  productSlug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Invalid product slug'),
});

type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

// ─── Secure headers helper ─────────────────────────────────────────────────────

function secureHeaders(): HeadersInit {
  return {
    'Cache-Control': 'no-store, no-cache',
    'X-Content-Type-Options': 'nosniff',
  };
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = extractIp(req.headers);
  const userAgent = req.headers.get('user-agent') ?? '';

  // ── 1. Rate limiting ─────────────────────────────────────────────────────────
  try {
    const rl = await checkRateLimit(ip, RATE_LIMITS.checkout);
    if (rl.limited) {
      auditLog({
        action: 'security.rate_limit_exceeded',
        actor: ip,
        resourceType: 'api',
        resourceId: 'checkout',
        ipAddress: ip,
        userAgent,
        severity: 'warn',
        metadata: { endpoint: 'checkout' },
      });
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429, headers: { ...secureHeaders(), 'Retry-After': '60' } }
      );
    }
  } catch { /* rate limiter failure is non-fatal */ }

  // ── 2. Parse and validate request body ───────────────────────────────────────
  let body: CheckoutRequest;
  try {
    const raw = await req.json();

    // Sanitize against NoSQL injection before Zod parsing
    const sanitized = sanitizeMongoInput(raw);
    const parsed = checkoutRequestSchema.safeParse(sanitized);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: secureHeaders() }
      );
    }
    body = parsed.data;
  } catch (err) {
    if (err instanceof Error && err.message.includes('MongoDB operators')) {
      auditLog({
        action: 'security.nosql_injection_attempt',
        actor: ip,
        resourceType: 'api',
        resourceId: 'checkout',
        ipAddress: ip,
        userAgent,
        severity: 'critical',
      });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: secureHeaders() });
  }

  await connectMongoose();

  // ── 3. Fraud pre-checks ───────────────────────────────────────────────────────
  const fraud = await runFraudChecks({
    email: body.email,
    ip,
    userAgent,
    productSlug: body.productSlug,
  });

  if (fraud.blocked) {
    auditLog({
      action: 'order.fraud_blocked',
      actor: body.email,
      resourceType: 'order',
      resourceId: body.productSlug,
      ipAddress: ip,
      userAgent,
      severity: 'critical',
      metadata: { flag: fraud.flag, reason: fraud.reason },
    });
    return NextResponse.json(
      { error: fraud.reason || 'Request blocked' },
      { status: 403, headers: secureHeaders() }
    );
  }

  // ── 4. Fetch product from DB — PRICE ALWAYS FROM DB ──────────────────────────
  const product = await Product.findOne({
    slug: body.productSlug,
    isActive: true,
    isSaleEnabled: true,
    deletedAt: null,
  }).lean();

  if (!product) {
    return NextResponse.json(
      { error: 'Product not available' },
      { status: 404, headers: secureHeaders() }
    );
  }

  // Validate that price is a safe positive number
  if (!product.currentPrice || product.currentPrice <= 0) {
    console.error(`[checkout] Product ${body.productSlug} has invalid price: ${product.currentPrice}`);
    return NextResponse.json(
      { error: 'Product pricing error. Please contact support.' },
      { status: 500, headers: secureHeaders() }
    );
  }

  // ── 5. Create internal order with LOCKED amount ───────────────────────────────
  const internalOrderId = `BLZ-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
  const fullName = `${body.firstName} ${body.lastName}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://deepdiveintogo.in';

  let order!: IOrder;
  try {
    order = await Order.create({
      internalOrderId,
      productId: product._id,
      productSlug: product.slug,
      // LOCK the price — never changes after this point
      lockedAmount: product.currentPrice,
      lockedCurrency: product.currency,
      lockedProductTitle: product.title,
      customerName: fullName,
      customerEmail: body.email.toLowerCase(),
      customerPhone: body.phone,
      cashfreeOrderId: '',   // filled in next step
      status: 'pending',
      fraudFlag: (fraud.flag ?? 'none') as IOrder['fraudFlag'],
      ipAddress: ip,
      userAgent,
    });
  } catch (err) {
    console.error('[checkout] Order creation failed:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500, headers: secureHeaders() });
  }

  auditLog({
    action: 'order.created',
    actor: body.email,
    resourceType: 'order',
    resourceId: internalOrderId,
    after: { amount: product.currentPrice, currency: product.currency, productSlug: product.slug },
    ipAddress: ip,
    userAgent,
    severity: 'info',
  });

  // ── 6. Create Cashfree order using LOCKED amount ──────────────────────────────
  let cfOrder;
  try {
    cfOrder = await createCashfreeOrder({
      orderId: internalOrderId,
      amount: product.currentPrice,       // FROM DB — never from request
      currency: product.currency,         // FROM DB — never from request
      customerName: fullName,
      customerEmail: body.email,
      customerPhone: body.phone,
      returnUrl: `${appUrl}/products/${product.slug}/success?order_id={order_id}`,
      notifyUrl: `${appUrl}/api/webhooks/cashfree`,
      productTitle: product.title,
    });
  } catch (err) {
    console.error('[checkout] Cashfree order creation failed:', err);
    // Clean up the pending order
    await Order.findByIdAndUpdate(order._id, { status: 'failed' });
    await PaymentAttempt.create({
      internalOrderId,
      ipAddress: ip,
      userAgent,
      outcome: 'failed',
      failureReason: err instanceof Error ? err.message : 'Cashfree error',
    });
    return NextResponse.json({ error: 'Payment setup failed. Please try again.' }, { status: 502, headers: secureHeaders() });
  }

  // ── 7. Update order with Cashfree IDs ─────────────────────────────────────────
  await Order.findByIdAndUpdate(order._id, {
    cashfreeOrderId: cfOrder.cfOrderId,
    status: 'payment_initiated',
  });

  await PaymentAttempt.create({
    internalOrderId,
    ipAddress: ip,
    userAgent,
    outcome: 'initiated',
    cashfreeOrderId: cfOrder.cfOrderId,
  });

  // ── 8. Return ONLY the payment session — never amount, never pricing ──────────
  // The frontend receives nothing about pricing — just a session token.
  return NextResponse.json(
    {
      orderId: internalOrderId,
      paymentSessionId: cfOrder.paymentSessionId,
    },
    { status: 200, headers: secureHeaders() }
  );
}
