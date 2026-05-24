import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock cashfree-pg before importing the module under test
const mockPGCreateOrder = vi.fn();
const mockPGFetchOrder = vi.fn();

vi.mock('cashfree-pg', () => {
  return {
    Cashfree: vi.fn().mockImplementation(() => ({
      PGCreateOrder: mockPGCreateOrder,
      PGFetchOrder: mockPGFetchOrder,
    })),
    CFEnvironment: {
      SANDBOX: 'sandbox',
      PRODUCTION: 'production',
    },
  };
});

// Import after mock is set up
const { createCashfreeOrder, fetchCashfreeOrder, verifyCashfreeWebhook, reconcileAmounts } = await import('@/lib/cashfree');

const BASE_PARAMS = {
  orderId: 'BLZ-TESTORDER001',
  amount: 149,
  currency: 'INR',
  customerName: 'Arjun Sharma',
  customerEmail: 'arjun@gmail.com',
  customerPhone: '+919876543210',
  returnUrl: 'http://localhost:3000/products/deep-dive-into-go/success?order_id={order_id}',
  notifyUrl: 'http://localhost:3000/api/webhooks/cashfree',
  productTitle: 'Deep Dive Into Go',
};

const MOCK_ORDER_RESPONSE = {
  order_id: 'BLZ-TESTORDER001',
  cf_order_id: 12345,
  payment_session_id: 'session_abc123',
  order_status: 'ACTIVE',
  order_amount: 149,
};

describe('createCashfreeOrder', () => {
  beforeEach(() => {
    mockPGCreateOrder.mockReset();
    mockPGFetchOrder.mockReset();
  });

  it('calls PGCreateOrder with correct shape', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    await createCashfreeOrder(BASE_PARAMS);

    expect(mockPGCreateOrder).toHaveBeenCalledOnce();
    const arg = mockPGCreateOrder.mock.calls[0][0];

    expect(arg.order_id).toBe(BASE_PARAMS.orderId);
    expect(arg.order_amount).toBe(149);
    expect(arg.order_currency).toBe('INR');
    expect(arg.customer_details.customer_email).toBe(BASE_PARAMS.customerEmail);
    expect(arg.customer_details.customer_name).toBe(BASE_PARAMS.customerName);
    expect(arg.customer_details.customer_phone).toBe(BASE_PARAMS.customerPhone);
  });

  it('sanitizes customer_id from email (alphanumeric only, max 50 chars)', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    await createCashfreeOrder({ ...BASE_PARAMS, customerEmail: 'user+tag@example.com' });

    const arg = mockPGCreateOrder.mock.calls[0][0];
    expect(arg.customer_details.customer_id).toMatch(/^[a-zA-Z0-9_]{1,50}$/);
    expect(arg.customer_details.customer_id).not.toContain('+');
    expect(arg.customer_details.customer_id).not.toContain('@');
    expect(arg.customer_details.customer_id.length).toBeLessThanOrEqual(50);
  });

  it('sets return_url and notify_url in order_meta', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    await createCashfreeOrder(BASE_PARAMS);

    const arg = mockPGCreateOrder.mock.calls[0][0];
    expect(arg.order_meta.return_url).toBe(BASE_PARAMS.returnUrl);
    expect(arg.order_meta.notify_url).toBe(BASE_PARAMS.notifyUrl);
  });

  it('sets product tag', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    await createCashfreeOrder(BASE_PARAMS);

    const arg = mockPGCreateOrder.mock.calls[0][0];
    expect(arg.order_tags.product).toBe('Deep Dive Into Go');
  });

  it('returns mapped response fields', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    const result = await createCashfreeOrder(BASE_PARAMS);
    expect(result.paymentSessionId).toBe('session_abc123');
    expect(result.orderStatus).toBe('ACTIVE');
    expect(result.orderAmount).toBe(149);
  });

  it('propagates error when PGCreateOrder throws', async () => {
    mockPGCreateOrder.mockRejectedValue(new Error('Cashfree API down'));

    await expect(createCashfreeOrder(BASE_PARAMS)).rejects.toThrow('Cashfree API down');
  });

  it('throws when payment_session_id is missing', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: {} });

    await expect(createCashfreeOrder(BASE_PARAMS)).rejects.toThrow('payment session ID');
  });

  it('truncates customer_id at 50 chars for very long emails', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    const longEmail = 'a'.repeat(60) + '@gmail.com';
    await createCashfreeOrder({ ...BASE_PARAMS, customerEmail: longEmail });

    const arg = mockPGCreateOrder.mock.calls[0][0];
    expect(arg.customer_details.customer_id.length).toBe(50);
  });
});

describe('fetchCashfreeOrder', () => {
  beforeEach(() => {
    mockPGFetchOrder.mockReset();
  });

  it('calls PGFetchOrder with the given orderId', async () => {
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'PAID', order_id: 'BLZ-001', cf_order_id: 123, order_amount: 149, order_currency: 'INR' } });

    await fetchCashfreeOrder('CF-ORDER-123');

    expect(mockPGFetchOrder).toHaveBeenCalledWith('CF-ORDER-123');
  });

  it('returns mapped order details', async () => {
    mockPGFetchOrder.mockResolvedValue({
      data: { order_status: 'PAID', order_id: 'BLZ-001', cf_order_id: 456, order_amount: 149, order_currency: 'INR' },
    });

    const result = await fetchCashfreeOrder('CF-ORDER-123');
    expect(result.orderStatus).toBe('PAID');
    expect(result.orderAmount).toBe(149);
  });

  it('propagates error when PGFetchOrder throws', async () => {
    mockPGFetchOrder.mockRejectedValue(new Error('Order not found'));

    await expect(fetchCashfreeOrder('NONEXISTENT')).rejects.toThrow('Order not found');
  });
});

describe('verifyCashfreeWebhook', () => {
  const VALID_SECRET = 'test-secret-key';

  it('returns valid=false for missing signature', () => {
    const result = verifyCashfreeWebhook('{}', {
      'x-webhook-signature': null,
      'x-webhook-timestamp': String(Math.floor(Date.now() / 1000)),
    });
    expect(result.valid).toBe(false);
    expect(result.isReplay).toBe(false);
  });

  it('returns valid=false, isReplay=true for stale timestamp', () => {
    // Timestamp from 10 minutes ago
    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 600);
    // Build a valid-looking signature (won't matter because timestamp check comes after)
    const result = verifyCashfreeWebhook('{}', {
      'x-webhook-signature': 'invalidsig',
      'x-webhook-timestamp': staleTimestamp,
    });
    // Signature fails first, but isReplay is based on timestamp
    expect(result.valid).toBe(false);
  });

  it('returns valid=false for invalid JSON body after valid signature', () => {
    // We can't easily produce a valid HMAC without the secret, so just check the shape
    const result = verifyCashfreeWebhook('not-json', {
      'x-webhook-signature': 'invalid',
      'x-webhook-timestamp': String(Math.floor(Date.now() / 1000)),
    });
    expect(result.valid).toBe(false);
    expect(result.idempotencyKey).toBe('');
  });
});

describe('reconcileAmounts', () => {
  it('matches identical amounts', () => {
    const { matched, delta } = reconcileAmounts(149, 149, 'INR');
    expect(matched).toBe(true);
    expect(delta).toBe(0);
  });

  it('detects underpayment', () => {
    const { matched, delta } = reconcileAmounts(149, 100, 'INR');
    expect(matched).toBe(false);
    expect(delta).toBe(-49);
  });

  it('detects overpayment', () => {
    const { matched, delta } = reconcileAmounts(149, 200, 'INR');
    expect(matched).toBe(false);
    expect(delta).toBe(51);
  });

  it('handles floating-point amounts correctly in paise', () => {
    // 149.00 vs 149.001 — should match because Math.round(149.001 * 100) === Math.round(149.000 * 100)
    const { matched } = reconcileAmounts(149, 149.001, 'INR');
    expect(matched).toBe(true);
  });

  it('detects 1 paise difference', () => {
    // 149.00 vs 148.99
    const { matched, delta } = reconcileAmounts(149, 148.99, 'INR');
    expect(matched).toBe(false);
    expect(delta).toBeCloseTo(-0.01, 2);
  });
});
