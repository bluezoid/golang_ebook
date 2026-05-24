import { http, HttpResponse } from 'msw';

const CASHFREE_BASE = 'https://sandbox.cashfree.com/pg';

export const mockCashfreeOrder = {
  order_id: 'CF-TEST-ORDER-001',
  order_amount: 149,
  order_currency: 'INR',
  order_status: 'ACTIVE',
  payment_session_id: 'session_test_abc123xyz',
  cf_order_id: 9876543,
};

export const mockCashfreeVerifyPaid = {
  order_id: 'CF-TEST-ORDER-001',
  order_status: 'PAID',
  cf_order_id: 9876543,
  order_amount: 149,
  order_currency: 'INR',
};

export const cashfreeCreateOrderHandler = http.post(
  `${CASHFREE_BASE}/orders`,
  () => HttpResponse.json(mockCashfreeOrder, { status: 200 })
);

export const cashfreeFetchOrderPaidHandler = http.get(
  `${CASHFREE_BASE}/orders/:orderId`,
  () => HttpResponse.json(mockCashfreeVerifyPaid, { status: 200 })
);

export const cashfreeFetchOrderCancelledHandler = http.get(
  `${CASHFREE_BASE}/orders/:orderId`,
  () => HttpResponse.json({ ...mockCashfreeVerifyPaid, order_status: 'CANCELLED' }, { status: 200 })
);

export const cashfreeFetchOrderExpiredHandler = http.get(
  `${CASHFREE_BASE}/orders/:orderId`,
  () => HttpResponse.json({ ...mockCashfreeVerifyPaid, order_status: 'EXPIRED' }, { status: 200 })
);

export const cashfreeFetchOrderPendingHandler = http.get(
  `${CASHFREE_BASE}/orders/:orderId`,
  () => HttpResponse.json({ ...mockCashfreeVerifyPaid, order_status: 'ACTIVE' }, { status: 200 })
);

export const cashfreeCreateOrderFailHandler = http.post(
  `${CASHFREE_BASE}/orders`,
  () => HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
);

export const defaultCashfreeHandlers = [
  cashfreeCreateOrderHandler,
  cashfreeFetchOrderPaidHandler,
];
