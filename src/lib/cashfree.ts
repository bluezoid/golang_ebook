/**
 * Cashfree PG v6 integration — fully hardened.
 *
 * Security properties:
 * - Order amount is NEVER accepted from the frontend; always comes from the DB.
 * - Webhook signature is verified via HMAC-SHA256 before any processing.
 * - Replay attacks are prevented by timestamp freshness + idempotency key.
 * - Amount reconciliation confirms paidAmount === lockedAmount to the paisa.
 */
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import {
  verifyCashfreeWebhookSignature,
  isWebhookTimestampFresh,
  buildWebhookIdempotencyKey,
} from './security';

// ─── Client singleton ──────────────────────────────────────────────────────────

const env =
  process.env.CASHFREE_ENV === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

const cf = new Cashfree(
  env,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY,
);

// ─── Order creation ────────────────────────────────────────────────────────────

export interface CreateOrderParams {
  orderId: string;          // Our internal BLZ-XXXX id
  amount: number;           // ALWAYS from DB — never from frontend
  currency: string;         // ALWAYS from DB
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;        // contains {order_id} placeholder
  notifyUrl: string;        // webhook endpoint
  productTitle: string;
}

export interface CashfreeOrderResponse {
  orderId: string;
  cfOrderId: string;
  paymentSessionId: string;
  orderStatus: string;
  orderAmount: number;
}

export async function createCashfreeOrder(
  params: CreateOrderParams
): Promise<CashfreeOrderResponse> {
  const response = await cf.PGCreateOrder({
    order_id: params.orderId,
    order_amount: params.amount,           // from DB
    order_currency: params.currency,       // from DB
    customer_details: {
      // customer_id must be alphanumeric + underscore, max 50 chars
      customer_id: params.customerEmail
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 50),
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
    },
    order_meta: {
      return_url: params.returnUrl,        // {order_id} resolved by Cashfree
      notify_url: params.notifyUrl,        // webhook receiver
    },
    order_tags: {
      product: params.productTitle,
      platform: 'bluezoid',
    },
  });

  const data = response.data;
  if (!data?.payment_session_id) {
    throw new Error('Cashfree did not return a payment session ID');
  }

  return {
    orderId: data.order_id ?? '',
    cfOrderId: data.cf_order_id?.toString() ?? data.order_id ?? '',
    paymentSessionId: data.payment_session_id,
    orderStatus: data.order_status ?? 'ACTIVE',
    orderAmount: data.order_amount ?? 0,
  };
}

// ─── Order verification ────────────────────────────────────────────────────────

export interface CashfreeOrderDetails {
  cfOrderId: string;
  orderId: string;
  orderStatus: string;   // PAID | ACTIVE | EXPIRED | CANCELLED
  orderAmount: number;
  orderCurrency: string;
  paymentMethod?: string;
  cfPaymentId?: string;
}

export async function fetchCashfreeOrder(
  cfOrderId: string
): Promise<CashfreeOrderDetails> {
  const response = await cf.PGFetchOrder(cfOrderId);
  const data = response.data;

  return {
    cfOrderId: data?.cf_order_id?.toString() ?? cfOrderId,
    orderId: data?.order_id ?? '',
    orderStatus: data?.order_status ?? 'UNKNOWN',
    orderAmount: data?.order_amount ?? 0,
    orderCurrency: data?.order_currency ?? 'INR',
  };
}

// ─── Webhook verification ──────────────────────────────────────────────────────

export interface WebhookVerificationResult {
  valid: boolean;
  isReplay: boolean;
  idempotencyKey: string;
  error?: string;
  // Extracted payload fields (only present when valid=true)
  cfOrderId?: string;
  cfPaymentId?: string;
  eventType?: string;
  paidAmount?: number;
  paidCurrency?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  rawPayload?: Record<string, unknown>;
}

/**
 * Fully verifies a Cashfree webhook:
 * 1. Signature check (HMAC-SHA256)
 * 2. Timestamp freshness (replay protection)
 * 3. Idempotency key extraction (duplicate prevention)
 */
export function verifyCashfreeWebhook(
  rawBody: string,
  headers: Record<string, string | null>
): WebhookVerificationResult {
  const timestamp = headers['x-webhook-timestamp'] ?? '';
  const signature = headers['x-webhook-signature'] ?? '';
  const secret = process.env.CASHFREE_SECRET_KEY ?? '';

  // 1. Verify signature
  const signatureValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature, secret);
  if (!signatureValid) {
    return {
      valid: false,
      isReplay: false,
      idempotencyKey: '',
      error: 'Invalid webhook signature',
    };
  }

  // 2. Timestamp freshness — reject stale/replay webhooks
  const isFresh = isWebhookTimestampFresh(timestamp);
  if (!isFresh) {
    return {
      valid: false,
      isReplay: true,
      idempotencyKey: '',
      error: `Webhook timestamp too old: ${timestamp}`,
    };
  }

  // 3. Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { valid: false, isReplay: false, idempotencyKey: '', error: 'Invalid JSON body' };
  }

  // Extract standardised Cashfree webhook fields
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const order = (data.order ?? {}) as Record<string, unknown>;
  const payment = (data.payment ?? {}) as Record<string, unknown>;

  const cfOrderId = String(order.order_id ?? payload.order_id ?? '');
  const cfPaymentId = String(payment.cf_payment_id ?? payload.cf_payment_id ?? '');
  const eventType = String(payload.type ?? payload.event_type ?? 'PAYMENT_SUCCESS');
  const paidAmount = Number(payment.payment_amount ?? order.order_amount ?? 0);
  const paidCurrency = String(payment.payment_currency ?? order.order_currency ?? 'INR');
  const paymentStatus = String(payment.payment_status ?? payload.payment_status ?? '');
  const paymentMethod = String(payment.payment_method ?? '');

  const idempotencyKey = buildWebhookIdempotencyKey(cfOrderId, cfPaymentId, eventType);

  return {
    valid: true,
    isReplay: false,
    idempotencyKey,
    cfOrderId,
    cfPaymentId,
    eventType,
    paidAmount,
    paidCurrency,
    paymentStatus,
    paymentMethod,
    rawPayload: payload,
  };
}

// ─── Amount reconciliation ─────────────────────────────────────────────────────

/**
 * Verifies that the amount Cashfree reports matches what we locked in the DB.
 * Uses integer comparison in paise to avoid floating-point precision bugs.
 */
export function reconcileAmounts(
  lockedAmount: number,
  paidAmount: number,
  currency = 'INR'
): { matched: boolean; delta: number } {
  // Convert to smallest unit (paise for INR) for integer comparison
  const factor = currency === 'INR' ? 100 : 100;
  const locked = Math.round(lockedAmount * factor);
  const paid = Math.round(paidAmount * factor);
  const delta = paid - locked;
  return { matched: delta === 0, delta: delta / factor };
}
