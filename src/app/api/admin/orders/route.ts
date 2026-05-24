/**
 * GET /api/admin/orders
 *
 * Admin order monitoring endpoint.
 * Supports filtering by status, email, and date range.
 * Paginated — max 100 per page.
 *
 * Security:
 * - Bearer token auth (same ADMIN_API_KEY).
 * - Sensitive fields (full signedUrlMeta token) are excluded from the response.
 * - Results are sorted newest-first.
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongoose';
import Order from '@/models/Order';
import { verifyAdminToken } from '@/lib/admin-auth';

const PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;

  const status = searchParams.get('status');
  const email = searchParams.get('email');
  const from = searchParams.get('from');   // ISO date string
  const to = searchParams.get('to');       // ISO date string
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') ?? String(PAGE_SIZE), 10)));

  const filter: Record<string, unknown> = {};

  if (status) {
    const validStatuses = ['pending', 'payment_initiated', 'paid', 'failed', 'cancelled', 'refunded', 'fraud_blocked'];
    if (validStatuses.includes(status)) {
      filter.status = status;
    }
  }

  if (email) {
    // Exact match on lowercase email
    filter.customerEmail = email.toLowerCase().trim().slice(0, 254);
  }

  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) dateFilter.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) dateFilter.$lte = toDate;
    }
    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }
  }

  await connectMongoose();

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select('-signedUrlMeta.token -__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
