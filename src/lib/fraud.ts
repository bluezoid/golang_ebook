/**
 * Fraud detection hooks.
 *
 * Checks run synchronously before order creation. If a check fires,
 * the order is either blocked or flagged for manual review depending on severity.
 */
import FraudMonitoring, { type FraudSignalType } from '@/models/FraudMonitoring';
import Order from '@/models/Order';
import { looksLikeBot } from './security';

export interface FraudCheckInput {
  email: string;
  ip: string;
  userAgent: string;
  productSlug: string;
}

export interface FraudCheckResult {
  blocked: boolean;
  flag: string;
  reason: string;
}

// ─── Disposable email domains ──────────────────────────────────────────────────
// Kept here (not in validators.ts) because this is the authoritative server-side
// list. The client-side validator has a subset for UX feedback only.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'yopmail.com',
  'sharklasers.com', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'maildrop.cc', 'fakeinbox.com', '10minutemail.com', 'discard.email',
  'throwam.com', 'spamgourmet.com', 'tempr.email', 'getnada.com',
  'minutemail.com', 'dispostable.com', 'mailnull.com', 'temp-mail.org',
  'burnermail.io', 'getairmail.com', 'mailsac.com', 'filzmail.com',
  'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
  'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr',
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return Boolean(domain && DISPOSABLE_DOMAINS.has(domain));
}

// ─── Velocity check ────────────────────────────────────────────────────────────

async function checkIpVelocity(ip: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await Order.countDocuments({
    ipAddress: ip,
    createdAt: { $gte: oneHourAgo },
  });
  return count >= 5; // more than 5 orders from same IP in 1h = suspicious
}

async function checkEmailVelocity(email: string): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await Order.countDocuments({
    customerEmail: email.toLowerCase(),
    createdAt: { $gte: oneDayAgo },
  });
  return count >= 3;
}

async function checkDuplicateOrder(email: string, productSlug: string): Promise<boolean> {
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  const exists = await Order.exists({
    customerEmail: email.toLowerCase(),
    productSlug,
    status: { $in: ['pending', 'payment_initiated'] },
    createdAt: { $gte: tenMinAgo },
  });
  return Boolean(exists);
}

// ─── Record fraud signal ───────────────────────────────────────────────────────

function recordSignal(
  signalType: FraudSignalType,
  params: FraudCheckInput,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  block: boolean
): void {
  FraudMonitoring.create({
    signalType,
    ipAddress: params.ip,
    email: params.email,
    userAgent: params.userAgent,
    orderId: '',
    description,
    metadata: { productSlug: params.productSlug },
    severity,
    isBlocked: block,
    detectedAt: new Date(),
  }).catch((e) => console.error('[fraud] signal write failed:', e));
}

// ─── Main check ────────────────────────────────────────────────────────────────

export async function runFraudChecks(params: FraudCheckInput): Promise<FraudCheckResult> {
  const PASS: FraudCheckResult = { blocked: false, flag: 'none', reason: '' };

  // 1. Bot/automation detection
  if (looksLikeBot(params.userAgent)) {
    recordSignal('bot_fingerprint', params, `Bot UA detected: ${params.userAgent}`, 'high', true);
    return { blocked: true, flag: 'suspicious_user_agent', reason: 'Automated request detected' };
  }

  // 2. Disposable email
  if (isDisposableEmail(params.email)) {
    recordSignal('disposable_email', params, `Disposable email: ${params.email}`, 'medium', true);
    return { blocked: true, flag: 'disposable_email', reason: 'Temporary email addresses are not allowed' };
  }

  // 3. Duplicate order (same email + product, pending, < 10 min ago)
  try {
    if (await checkDuplicateOrder(params.email, params.productSlug)) {
      recordSignal('duplicate_order', params, 'Duplicate pending order detected', 'medium', false);
      // Don't block — just flag. The user might be retrying after a failure.
      return { blocked: false, flag: 'duplicate_order', reason: '' };
    }
  } catch { /* non-blocking */ }

  // 4. IP velocity
  try {
    if (await checkIpVelocity(params.ip)) {
      recordSignal('velocity_ip', params, `IP velocity exceeded: ${params.ip}`, 'high', true);
      return { blocked: true, flag: 'velocity_exceeded', reason: 'Too many requests from this location' };
    }
  } catch { /* non-blocking */ }

  // 5. Email velocity
  try {
    if (await checkEmailVelocity(params.email)) {
      recordSignal('velocity_email', params, `Email velocity exceeded: ${params.email}`, 'high', true);
      return { blocked: true, flag: 'velocity_exceeded', reason: 'Too many orders from this account' };
    }
  } catch { /* non-blocking */ }

  return PASS;
}
