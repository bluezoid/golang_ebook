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
const { createCashfreeOrder, verifyCashfreeOrder } = await import('@/lib/cashfree');

const BASE_PARAMS = {
  orderId: 'BLZ-TESTORDER001',
  amount: 149,
  customerName: 'Arjun Sharma',
  customerEmail: 'arjun@gmail.com',
  customerPhone: '+919876543210',
  returnUrl: 'http://localhost:3000/products/deep-dive-into-go/success?order_id={order_id}',
  appUrl: 'http://localhost:3000',
};

const MOCK_ORDER_RESPONSE = {
  order_id: 'CF-TEST-001',
  payment_session_id: 'session_abc123',
  order_status: 'ACTIVE',
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
    expect(arg.order_meta.notify_url).toBe(`${BASE_PARAMS.appUrl}/api/verify-payment`);
  });

  it('sets product tag', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    await createCashfreeOrder(BASE_PARAMS);

    const arg = mockPGCreateOrder.mock.calls[0][0];
    expect(arg.order_tags.product).toBe('deep-dive-into-go');
  });

  it('returns response.data', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    const result = await createCashfreeOrder(BASE_PARAMS);
    expect(result).toEqual(MOCK_ORDER_RESPONSE);
  });

  it('propagates error when PGCreateOrder throws', async () => {
    mockPGCreateOrder.mockRejectedValue(new Error('Cashfree API down'));

    await expect(createCashfreeOrder(BASE_PARAMS)).rejects.toThrow('Cashfree API down');
  });

  it('truncates customer_id at 50 chars for very long emails', async () => {
    mockPGCreateOrder.mockResolvedValue({ data: MOCK_ORDER_RESPONSE });

    const longEmail = 'a'.repeat(60) + '@gmail.com';
    await createCashfreeOrder({ ...BASE_PARAMS, customerEmail: longEmail });

    const arg = mockPGCreateOrder.mock.calls[0][0];
    expect(arg.customer_details.customer_id.length).toBe(50);
  });
});

describe('verifyCashfreeOrder', () => {
  beforeEach(() => {
    mockPGFetchOrder.mockReset();
  });

  it('calls PGFetchOrder with the given orderId', async () => {
    mockPGFetchOrder.mockResolvedValue({ data: { order_status: 'PAID' } });

    await verifyCashfreeOrder('CF-ORDER-123');

    expect(mockPGFetchOrder).toHaveBeenCalledWith('CF-ORDER-123');
  });

  it('returns response.data', async () => {
    const mockData = { order_status: 'PAID', cf_order_id: 12345 };
    mockPGFetchOrder.mockResolvedValue({ data: mockData });

    const result = await verifyCashfreeOrder('CF-ORDER-123');
    expect(result).toEqual(mockData);
  });

  it('propagates error when PGFetchOrder throws', async () => {
    mockPGFetchOrder.mockRejectedValue(new Error('Order not found'));

    await expect(verifyCashfreeOrder('NONEXISTENT')).rejects.toThrow('Order not found');
  });
});
