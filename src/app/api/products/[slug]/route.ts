/**
 * GET /api/products/[slug]
 *
 * Public product data endpoint — serves all content the frontend needs to render
 * the product page and checkout modal. All data comes from MongoDB; nothing is
 * hardcoded in the frontend.
 *
 * Security:
 * - fullPdfR2Key is NEVER returned (stripped by Product.toJSON transform).
 * - Only active, sale-enabled, non-deleted products are served.
 * - Cache headers allow CDN caching for 60s; revalidation is stale-while-revalidate.
 * - Slug is validated to prevent injection.
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  // Validate slug format
  if (!slug || !/^[a-z0-9-]{1,100}$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid product slug' }, { status: 400 });
  }

  await connectMongoose();

  const product = await Product.findOne({
    slug,
    isActive: true,
    isSaleEnabled: true,
    deletedAt: null,
  })
    .select('-fullPdfR2Key -__v')
    .lean();

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(
    { product },
    {
      status: 200,
      headers: {
        // Allow CDN to cache for 60s; serve stale for up to 5 min while revalidating
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}
