import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { buildMongoOrder } from '../factories/order.factory';

// ── Mock all dependencies ─────────────────────────────────────────────────────

const mockPGFetchOrder = vi.fn();
vi.mock('cashfree-pg', () => ({
  Cashfree: vi.fn().mockImplementation(() => ({ PGFetchOrder: mockPGFetchOrder })),
  CFEnvironment: { SANDBOX: 'sandbox', PRODUCTION: 'production' },
}));

const mockGetSignedUrl = vi.fn();
vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: mockGetSignedUrl }));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({})),
  GetObjectCommand: vi.fn().mockImplementation((p) => p),
}));

const mockSendTransacEmail = vi.fn();
vi.mock('@getbrevo/brevo', () => ({
  BrevoClient: vi.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: mockSendTransacEmail },
  })),
}));

const mockFindOne = vi.fn();
const mockUpdateOne = vi.fn();
const mockCollection = vi.fn().mockReturnValue({ findOne: mockFindOne, updateOne: mockUpdateOne });
const mockDb = { collection: mockCollection };
const mockClient = { db: vi.fn().mockReturnValue(mockDb) };

vi.mock('@/lib/mongodb', () => ({ default: Promise.resolve(mockClient) }));

// ── Import route after mocks ─────────────────────────────────────────────────
const { POST } = await import('@/app/api/verify-payment/route');

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const MOCK_SIGNED_URL = 'https://r2.test/pdf?sig=abc&expires=900';
const MOCK_ORDER = buildMongoOrder({ orderId: 'BLZ-TEST123', status: 'pending' });

describe('POST /api/verify-payment', () => {
  beforeEach(() => {
    mockPGFetchOrder.mockReset();
    mockFindOne.mockReset();
    mockUpdateOne.mockReset();
    mockSendTransacEmail.mockReset();
    mockGetSignedUrl.mockReset();

    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);
    mockSendTransacEmail.mockResolvedValue({ messageId: 'msg-1' });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  });

  // ── Happy path ──────────────────────────────────────────────────────────
  it('200 fulfilled — PAID status triggers email and returns fulfilled', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'PAID', cf_order_id: 999 } });

    const res = await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('fulfilled');
    expect(json.email).toBe(MOCK_ORDER.email);
  });

  it('sends email with correct params on PAID', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'PAID', cf_order_id: 999 } });

    await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));

    expect(mockSendTransacEmail).toHaveBeenCalledOnce();
    const emailArg = mockSendTransacEmail.mock.calls[0][0];
    expect(emailArg.to[0].email).toBe(MOCK_ORDER.email);
  });

  it('uses the full PDF signed URL (900s expiry) in the email', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'PAID', cf_order_id: 999 } });

    await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 900 }
    );
  });

  it('updates MongoDB status to paid with paidAt date', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'PAID', cf_order_id: 999 } });

    await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));

    expect(mockUpdateOne).toHaveBeenCalledWith(
      { orderId: MOCK_ORDER.orderId },
      expect.objectContaining({
        $set: expect.objectContaining({
          status: 'paid',
          paidAt: expect.any(Date),
        }),
      })
    );
  });

  // ── Already fulfilled ───────────────────────────────────────────────────
  it('200 already_fulfilled — does not re-send email', async () => {
    mockFindOne.mockResolvedValue({ ...MOCK_ORDER, status: 'paid' });

    const res = await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('already_fulfilled');
    expect(mockSendTransacEmail).not.toHaveBeenCalled();
    expect(mockPGFetchOrder).not.toHaveBeenCalled();
  });

  // ── Failed / cancelled states ───────────────────────────────────────────
  it('200 failed — CANCELLED status returns failed with cashfreeStatus', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'CANCELLED' } });

    const res = await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));
    const json = await res.json();

    expect(json.status).toBe('failed');
    expect(json.cashfreeStatus).toBe('CANCELLED');
    expect(mockSendTransacEmail).not.toHaveBeenCalled();
  });

  it('200 failed — EXPIRED status returns failed', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'EXPIRED' } });

    const res = await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));
    const json = await res.json();

    expect(json.status).toBe('failed');
    expect(json.cashfreeStatus).toBe('EXPIRED');
  });

  it('200 pending — ACTIVE status (not yet settled)', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'ACTIVE' } });

    const res = await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));
    const json = await res.json();

    expect(json.status).toBe('pending');
    expect(json.cashfreeStatus).toBe('ACTIVE');
  });

  // ── Error cases ─────────────────────────────────────────────────────────
  it('400 — missing orderId', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('400 — orderId is not a string', async () => {
    const res = await POST(makeRequest({ orderId: 12345 }));
    expect(res.status).toBe(400);
  });

  it('404 — order not found in MongoDB', async () => {
    mockFindOne.mockResolvedValue(null);

    const res = await POST(makeRequest({ orderId: 'BLZ-NONEXISTENT' }));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe('Order not found');
  });

  it('500 — MongoDB findOne throws', async () => {
    mockFindOne.mockRejectedValue(new Error('Atlas connection error'));

    const res = await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));
    expect(res.status).toBe(500);
  });

  it('500 — email sending throws', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'PAID', cf_order_id: 1 } });
    mockSendTransacEmail.mockRejectedValue(new Error('Brevo down'));

    const res = await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));
    expect(res.status).toBe(500);
  });

  it('500 — R2 signed URL generation throws', async () => {
    mockFindOne.mockResolvedValue(MOCK_ORDER);
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'PAID', cf_order_id: 1 } });
    mockGetSignedUrl.mockRejectedValue(new Error('R2 bucket unreachable'));

    const res = await POST(makeRequest({ orderId: MOCK_ORDER.orderId }));
    expect(res.status).toBe(500);
  });
});
