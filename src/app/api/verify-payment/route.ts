import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeOrder } from '@/lib/cashfree';
import { getFullPdfSignedUrl } from '@/lib/r2';
import { sendEbookDeliveryEmail } from '@/lib/brevo';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    // Re-import to pick up any reconnected promise after a prior TLS failure
    const { default: freshClientPromise } = await import('@/lib/mongodb');
    const client = await freshClientPromise;
    const db = client.db('bluezoid');
    const order = await db.collection('orders').findOne({ orderId });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Already fulfilled — avoid re-sending email
    if (order.status === 'paid') {
      return NextResponse.json({ status: 'already_fulfilled' });
    }

    const cfData = await verifyCashfreeOrder(order.cashfreeOrderId);
    const cfStatus = cfData?.order_status;

    if (cfStatus === 'CANCELLED' || cfStatus === 'EXPIRED') {
      return NextResponse.json({ status: 'failed', cashfreeStatus: cfStatus });
    }

    if (cfStatus !== 'PAID') {
      return NextResponse.json({ status: 'pending', cashfreeStatus: cfStatus });
    }

    // Generate 15-minute signed URL for the full PDF
    const downloadUrl = await getFullPdfSignedUrl();
    const fullName = `${order.firstName} ${order.lastName}`;

    await sendEbookDeliveryEmail({
      toEmail: order.email,
      toName: fullName,
      downloadUrl,
      orderId,
    });

    await db.collection('orders').updateOne(
      { orderId },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(),
          cashfreePaymentId: cfData?.cf_order_id,
        },
      }
    );

    return NextResponse.json({ status: 'fulfilled', email: order.email });
  } catch (err) {
    console.error('[verify-payment] Error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
