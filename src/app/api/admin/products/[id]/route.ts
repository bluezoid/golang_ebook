/**
 * PATCH /api/admin/products/[id]
 *
 * Admin endpoint to update product fields — price, title, CTA, active status, etc.
 * Updates MongoDB; the product page fetches live data from /api/products/[slug]
 * so changes take effect immediately without redeployment.
 *
 * Security:
 * - Bearer token auth via ADMIN_API_KEY env var (timing-safe comparison).
 * - Input validated with Zod — only whitelisted fields accepted.
 * - All updates audit-logged with before/after values.
 * - fullPdfR2Key can be updated but is never returned in responses.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectMongoose } from '@/lib/mongoose';
import Product from '@/models/Product';
import { verifyAdminToken } from '@/lib/admin-auth';
import { auditLog } from '@/lib/audit';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().min(1).max(300).optional(),
  shortDescription: z.string().min(1).max(1000).optional(),
  detailedDescription: z.string().min(1).optional(),
  currentPrice: z.number().positive().max(100_000).optional(),
  originalPrice: z.number().positive().max(100_000).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountLabel: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  isSaleEnabled: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  ctaPrimary: z.string().max(100).optional(),
  ctaSecondary: z.string().max(100).optional(),
  features: z.array(z.string().max(200)).max(20).optional(),
  trustBadges: z.array(z.string().max(100)).max(10).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  coverImageUrl: z.string().url().max(500).optional(),
  samplePdfUrl: z.string().url().max(500).optional(),
  fullPdfR2Key: z.string().max(200).optional(),
  seo: z.object({
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    ogImageUrl: z.string().url().optional(),
    canonicalUrl: z.string().url().optional(),
  }).optional(),
}).strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id || !/^[0-9a-f]{24}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  let updates: z.infer<typeof updateSchema>;
  try {
    const raw = await req.json();
    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    updates = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  await connectMongoose();

  const before = await Product.findById(id).select('-__v').lean();
  if (!before) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Flatten seo updates for MongoDB dot-notation update
  const flatUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'seo' && typeof value === 'object' && value !== null) {
      for (const [seoKey, seoValue] of Object.entries(value)) {
        flatUpdates[`seo.${seoKey}`] = seoValue;
      }
    } else {
      flatUpdates[key] = value;
    }
  }

  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: flatUpdates, $inc: { version: 1 } },
    { new: true, runValidators: true }
  )
    .select('-fullPdfR2Key -__v')
    .lean();

  auditLog({
    action: 'admin.product_updated',
    actor: 'admin',
    resourceType: 'product',
    resourceId: id,
    before: { ...before, fullPdfR2Key: '[redacted]' },
    after: { ...updated, fullPdfR2Key: '[redacted]' },
    severity: 'info',
    metadata: { updatedFields: Object.keys(flatUpdates) },
  });

  return NextResponse.json({ product: updated });
}
