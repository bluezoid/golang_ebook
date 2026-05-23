import { Cashfree, CFEnvironment } from 'cashfree-pg';

const env =
  process.env.CASHFREE_ENV === 'production'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

const cf = new Cashfree(
  env,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY,
);

export interface CreateOrderParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  appUrl: string;
}

export async function createCashfreeOrder(params: CreateOrderParams) {
  const response = await cf.PGCreateOrder({
    order_id: params.orderId,
    order_amount: params.amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: params.customerEmail.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50),
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
    },
    order_meta: {
      return_url: params.returnUrl,
      notify_url: `${params.appUrl}/api/verify-payment`,
    },
    order_tags: {
      product: 'deep-dive-into-go',
    },
  });

  return response.data;
}

export async function verifyCashfreeOrder(orderId: string) {
  const response = await cf.PGFetchOrder(orderId);
  return response.data;
}
