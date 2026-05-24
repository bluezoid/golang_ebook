import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock Mongoose models ──────────────────────────────────────────────────────

const mockOrderFindOne = vi.fn();
const mockAuditLogCreate = vi.fn();

vi.mock('@/models/Order', () => ({
  default: { findOne: mockOrderFindOne },
}));

vi.mock('@/models/AuditLog', () => ({
  default: { create: mockAuditLogCreate },
}));

vi.mock('@/lib/mongoose', () => ({
  connectMongoose: vi.fn().mockResolvedValue({}),
}));

// ── Import route after mocks ──────────────────────────────────────────────────

const { POST } = await import('@/app/api/verify-payment/route');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_PAID_ORDER = {
  _id: 'mongo-id-1',
  internalOrderId: 'BLZ-TEST0000000001',
  status: 'paid',
  customerEmail: 'arjun@gmail.com',
  isDownloadEligible: true,
  lockedProductTitle: 'Deep Dive Into Go',
  paidAt: new Date('2025-05-24T10:00:00Z'),
  signedUrlMeta: null,
};

const MOCK_PENDING_ORDER = {
  ...MOCK_PAID_ORDER,
  internalOrderId: 'BLZ-TEST0000000002',
  status: 'payment_initiated',
  isDownloadEligible: false,
  paidAt: null,
};

describe('POST /api/verify-payment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuditLogCreate.mockResolvedValue({});
  });

  // ── Happy path — paid order ────────────────────────────────────────────────

  it('200 paid — returns paid=true and downloadEmailSent=true', async () => {
    mockOrderFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(MOCK_PAID_ORDER) }),
    });

    const res = await POST(makeRequest({ orderId: 'BLZ-TEST0000000001' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.paid).toBe(true);
    expect(json.status).toBe('paid');
    expect(json.downloadEmailSent).toBe(true);
    expect(json.productTitle).toBe('Deep Dive Into Go');
    expect(json.paidAt).toBeDefined();
    // Must not leak token or sensitive fields
    expect(json.token).toBeUndefined();
    expect(json.tokenHash).toBeUndefined();
    expect(json.customerEmail).toBeUndefined();
  });

  it('200 pending — returns paid=false for payment_initiated orders', async () => {
    mockOrderFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(MOCK_PENDING_ORDER) }),
    });

    const res = await POST(makeRequest({ orderId: 'BLZ-TEST0000000002' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.paid).toBe(false);
    expect(json.status).toBe('pending');
    expect(json.downloadEmailSent).toBe(false);
  });

  it('200 pending — returns pending for pending status', async () => {
    mockOrderFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ ...MOCK_PENDING_ORDER, status: 'pending' }),
      }),
    });

    const res = await POST(makeRequest({ orderId: 'BLZ-TEST0000000002' }));
    const json = await res.json();

    expect(json.status).toBe('pending');
  });

  it('200 failed — returns failed for fraud_blocked orders', async () => {
    mockOrderFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ ...MOCK_PENDING_ORDER, status: 'fraud_blocked' }),
      }),
    });

    const res = await POST(makeRequest({ orderId: 'BLZ-TEST0000000002' }));
    const json = await res.json();

    expect(json.status).toBe('failed');
  });

  // ── Validation failures ────────────────────────────────────────────────────

  it('400 — missing orderId', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('400 — orderId not a string', async () => {
    const res = await POST(makeRequest({ orderId: 12345 }));
    expect(res.status).toBe(400);
  });

  it('400 — orderId wrong format (not BLZ-)', async () => {
    const res = await POST(makeRequest({ orderId: 'CF-NOTOURFORMAT' }));
    expect(res.status).toBe(400);
  });

  // ── Not found ──────────────────────────────────────────────────────────────

  it('404 — order not found in MongoDB', async () => {
    mockOrderFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
    });

    const res = await POST(makeRequest({ orderId: 'BLZ-NONEXISTENT0001' }));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe('Order not found');
  });

  // ── No Cashfree calls ─────────────────────────────────────────────────────

  it('does NOT call Cashfree — order status comes from our DB only', async () => {
    mockOrderFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(MOCK_PAID_ORDER) }),
    });

    await POST(makeRequest({ orderId: 'BLZ-TEST0000000001' }));

    // No Cashfree mock needed — if any cashfree call happened, the test would throw
    // because cashfree-pg is not mocked in this test file
    expect(mockOrderFindOne).toHaveBeenCalledOnce();
  });
});
