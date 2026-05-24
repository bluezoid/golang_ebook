import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

// ── Mock Cashfree SDK ─────────────────────────────────────────────────────────

const mockPGCreateOrder = vi.fn();
vi.mock('cashfree-pg', () => ({
  Cashfree: vi.fn().mockImplementation(() => ({ PGCreateOrder: mockPGCreateOrder })),
  CFEnvironment: { SANDBOX: 'sandbox', PRODUCTION: 'production' },
}));

// ── Mock Mongoose models ──────────────────────────────────────────────────────

const mockProductFindOne = vi.fn();
const mockOrderCreate = vi.fn();
const mockOrderFindByIdAndUpdate = vi.fn();
const mockPaymentAttemptCreate = vi.fn();
const mockRateLimitFindOneAndUpdate = vi.fn();
const mockFraudMonitoringCreate = vi.fn();
const mockAuditLogCreate = vi.fn();

vi.mock('@/models/Product', () => ({
  default: { findOne: mockProductFindOne },
}));

vi.mock('@/models/Order', () => ({
  default: {
    create: mockOrderCreate,
    findByIdAndUpdate: mockOrderFindByIdAndUpdate,
  },
}));

vi.mock('@/models/PaymentAttempt', () => ({
  default: { create: mockPaymentAttemptCreate },
}));

vi.mock('@/models/RateLimitTracking', () => ({
  default: { findOneAndUpdate: mockRateLimitFindOneAndUpdate },
}));

// Mock rate limiter to never block
vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ limited: false }),
  RATE_LIMITS: {
    checkout: { endpoint: 'checkout', windowMs: 60000, maxRequests: 5 },
    download: { endpoint: 'download', windowMs: 60000, maxRequests: 3 },
    webhook: { endpoint: 'webhook', windowMs: 60000, maxRequests: 100 },
  },
}));

// Mock fraud checks to always pass
vi.mock('@/lib/fraud', () => ({
  runFraudChecks: vi.fn().mockResolvedValue({ blocked: false, flag: 'none', reason: '' }),
}));

vi.mock('@/models/FraudMonitoring', () => ({
  default: { create: mockFraudMonitoringCreate },
}));

vi.mock('@/models/AuditLog', () => ({
  default: { create: mockAuditLogCreate },
}));

vi.mock('@/lib/mongoose', () => ({
  connectMongoose: vi.fn().mockResolvedValue({}),
}));

// ── Import route after mocks ──────────────────────────────────────────────────

const { POST } = await import('@/app/api/checkout/route');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'user-agent': 'Mozilla/5.0 TestBrowser/1.0' },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  firstName: 'Arjun',
  lastName: 'Sharma',
  email: 'arjun@gmail.com',
  phone: '+919876543210',
  productSlug: 'deep-dive-into-go',
};

const MOCK_PRODUCT = {
  _id: new mongoose.Types.ObjectId(),
  slug: 'deep-dive-into-go',
  title: 'Deep Dive Into Go',
  currentPrice: 149,
  currency: 'INR',
  isActive: true,
  isSaleEnabled: true,
  deletedAt: null,
};

const MOCK_ORDER = {
  _id: new mongoose.Types.ObjectId(),
  internalOrderId: 'BLZ-AAAA0000BBBB0000',
  status: 'pending',
};

const MOCK_CF_RESPONSE = {
  order_id: 'BLZ-AAAA0000BBBB0000',
  cf_order_id: 12345,
  payment_session_id: 'session_abc123',
  order_status: 'ACTIVE',
  order_amount: 149,
};

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProductFindOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(MOCK_PRODUCT) });
    mockOrderCreate.mockResolvedValue(MOCK_ORDER);
    mockOrderFindByIdAndUpdate.mockResolvedValue({});
    mockPaymentAttemptCreate.mockResolvedValue({});
    mockFraudMonitoringCreate.mockResolvedValue({});
    mockAuditLogCreate.mockResolvedValue({});
    mockRateLimitFindOneAndUpdate.mockResolvedValue(null);
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_CF_RESPONSE });
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  it('200 — returns orderId and paymentSessionId on valid input', async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.paymentSessionId).toBe('session_abc123');
    expect(json.orderId).toMatch(/^BLZ-[A-Z0-9]{16}$/);
    // Amount and cfOrderId MUST NOT be returned to the client
    expect(json.amount).toBeUndefined();
    expect(json.cfOrderId).toBeUndefined();
  });

  it('orderId format is BLZ- followed by 16 uppercase alphanumerics', async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const { orderId } = await res.json();
    expect(orderId).toMatch(/^BLZ-[A-Z0-9]{16}$/);
  });

  it('passes locked amount (from DB) to Cashfree — never from request', async () => {
    await POST(makeRequest({ ...VALID_BODY, amount: 1, price: 1 })); // attacker sends fake amounts

    const cfArg = mockPGCreateOrder.mock.calls[0][0];
    expect(cfArg.order_amount).toBe(149); // DB price, not attacker's price
    expect(cfArg.order_currency).toBe('INR');
  });

  it('return_url in Cashfree payload contains {order_id} placeholder', async () => {
    await POST(makeRequest(VALID_BODY));

    const cfArg = mockPGCreateOrder.mock.calls[0][0];
    expect(cfArg.order_meta.return_url).toContain('{order_id}');
  });

  it('notify_url is /api/webhooks/cashfree', async () => {
    await POST(makeRequest(VALID_BODY));

    const cfArg = mockPGCreateOrder.mock.calls[0][0];
    expect(cfArg.order_meta.notify_url).toContain('/api/webhooks/cashfree');
  });

  it('creates Order with lockedAmount from DB, not from request', async () => {
    await POST(makeRequest({ ...VALID_BODY, amount: 1 }));

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({ lockedAmount: 149, lockedCurrency: 'INR' })
    );
  });

  // ── Validation failures ────────────────────────────────────────────────────

  it('400 — missing firstName', async () => {
    const { firstName: _fn, ...body } = VALID_BODY; void _fn;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details?.firstName).toBeDefined();
  });

  it('400 — missing lastName', async () => {
    const { lastName: _ln, ...body } = VALID_BODY; void _ln;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
  });

  it('400 — invalid email format', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, email: 'notanemail' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details?.email).toBeDefined();
  });

  it('400 — disposable email domain is rejected', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, email: 'test@mailinator.com' }));
    expect(res.status).toBe(400);
  });

  it('400 — invalid phone number', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, phone: '123' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details?.phone).toBeDefined();
  });

  it('400 — empty body', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('400 — missing productSlug', async () => {
    const { productSlug: _ps, ...body } = VALID_BODY; void _ps;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
  });

  it('400 — invalid productSlug with special chars', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, productSlug: 'product/../etc' }));
    expect(res.status).toBe(400);
  });

  // ── Product not found ──────────────────────────────────────────────────────

  it('404 — product not found or inactive', async () => {
    mockProductFindOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(404);
  });

  // ── Cashfree failures ──────────────────────────────────────────────────────

  it('502 — Cashfree API throws', async () => {
    mockPGCreateOrder.mockRejectedValue(new Error('Cashfree API 503'));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
  });

  it('502 — Cashfree returns no payment_session_id', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: { order_id: 'CF-001' } }); // no session id

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
  });
});
