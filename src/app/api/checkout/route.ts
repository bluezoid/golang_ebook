import { NextRequest, NextResponse } from 'next/server';
import { createCashfreeOrder } from '@/lib/cashfree';
import { checkoutSchema } from '@/lib/validators';
import clientPromise from '@/lib/mongodb';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone } = parsed.data;
    const fullName = `${firstName} ${lastName}`;
    const orderId = `BLZ-${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bluezoid.in';
    const returnUrl = `${appUrl}/products/deep-dive-into-go/success?order_id={order_id}`;

    const order = await createCashfreeOrder({
      orderId,
      amount: 149,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phone,
      returnUrl,
      appUrl,
    });

    if (!order?.payment_session_id) {
      throw new Error('No payment session returned from Cashfree');
    }

    // Persist pending order to MongoDB — fire-and-forget so a DB hiccup never
    // blocks the user from reaching the payment page
    clientPromise
      .then((client) =>
        client.db('bluezoid').collection('orders').insertOne({
          orderId,
          firstName,
          lastName,
          email,
          phone,
          product: 'deep-dive-into-go',
          amount: 149,
          status: 'pending',
          cashfreeOrderId: order.order_id,
          createdAt: new Date(),
        })
      )
      .catch((err) => console.error('[checkout] MongoDB write failed:', err));

    return NextResponse.json({
      orderId,
      paymentSessionId: order.payment_session_id,
      cfOrderId: order.order_id,
    });
  } catch (err) {
    console.error('[checkout] Error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
