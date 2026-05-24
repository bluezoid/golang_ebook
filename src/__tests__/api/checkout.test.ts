import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock all external dependencies ───────────────────────────────────────────

const mockPGCreateOrder = vi.fn();
vi.mock('cashfree-pg', () => ({
  Cashfree: vi.fn().mockImplementation(() => ({ PGCreateOrder: mockPGCreateOrder })),
  CFEnvironment: { SANDBOX: 'sandbox', PRODUCTION: 'production' },
}));

const mockInsertOne = vi.fn();
const mockDb = { collection: vi.fn().mockReturnValue({ insertOne: mockInsertOne }) };
const mockClient = { db: vi.fn().mockReturnValue(mockDb) };
vi.mock('@/lib/mongodb', () => ({ default: Promise.resolve(mockClient) }));

// ── Import route after mocks are in place ────────────────────────────────────
const { POST } = await import('@/app/api/checkout/route');

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  firstName: 'Arjun',
  lastName: 'Sharma',
  email: 'arjun@gmail.com',
  phone: '+919876543210',
};

const MOCK_CF_RESPONSE = {
  order_id: 'CF-TEST-001',
  payment_session_id: 'session_abc123',
  order_status: 'ACTIVE',
};

describe('POST /api/checkout', () => {
  beforeEach(() => {
    mockPGCreateOrder.mockReset();
    mockInsertOne.mockReset();
    mockInsertOne.mockResolvedValue({ insertedId: 'mongo-id-1' });
  });

  // ── Happy path ──────────────────────────────────────────────────────────
  it('200 — returns orderId, paymentSessionId, cfOrderId on valid input', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_CF_RESPONSE });

    const res = await POST(makeRequest(VALID_BODY));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.paymentSessionId).toBe('session_abc123');
    expect(json.cfOrderId).toBe('CF-TEST-001');
    expect(json.orderId).toMatch(/^BLZ-[A-Z0-9]{16}$/);
  });

  it('orderId format is BLZ- followed by 16 uppercase alphanumerics', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_CF_RESPONSE });

    const res = await POST(makeRequest(VALID_BODY));
    const { orderId } = await res.json();

    expect(orderId).toMatch(/^BLZ-[A-Z0-9]{16}$/);
  });

  it('return_url in Cashfree payload contains {order_id} placeholder', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_CF_RESPONSE });

    await POST(makeRequest(VALID_BODY));

    const cfArg = mockPGCreateOrder.mock.calls[0][0];
    expect(cfArg.order_meta.return_url).toContain('{order_id}');
  });

  it('notify_url is /api/verify-payment on the app URL', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_CF_RESPONSE });

    await POST(makeRequest(VALID_BODY));

    const cfArg = mockPGCreateOrder.mock.calls[0][0];
    expect(cfArg.order_meta.notify_url).toContain('/api/verify-payment');
  });

  // ── MongoDB fire-and-forget ─────────────────────────────────────────────
  it('200 — MongoDB failure does NOT block the response', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_CF_RESPONSE });
    mockInsertOne.mockRejectedValue(new Error('MongoDB TLS error'));

    const res = await POST(makeRequest(VALID_BODY));

    // Should still succeed despite MongoDB failing
    expect(res.status).toBe(200);
  });

  // ── Validation failures ─────────────────────────────────────────────────
  it('400 — missing firstName', async () => {
    const { firstName: _, ...body } = VALID_BODY;
    const res = await POST(makeRequest(body));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.details?.firstName).toBeDefined();
  });

  it('400 — missing lastName', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, lastName: undefined }));
    expect(res.status).toBe(400);
  });

  it('400 — invalid email format', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, email: 'notanemail' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.details?.email).toBeDefined();
  });

  it('400 — disposable email domain is rejected', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, email: 'test@mailinator.com' }));
    expect(res.status).toBe(400);
  });

  it('400 — invalid phone number', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, phone: '123' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.details?.phone).toBeDefined();
  });

  it('400 — empty body', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  // ── Cashfree failures ───────────────────────────────────────────────────
  it('500 — Cashfree API throws', async () => {
    mockPGCreateOrder.mockRejectedValue(new Error('Cashfree API 503'));

    const res = await POST(makeRequest(VALID_BODY));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe('Failed to create order');
  });

  it('500 — Cashfree returns no payment_session_id', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: { order_id: 'CF-001' } }); // no session id

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
  });
});
