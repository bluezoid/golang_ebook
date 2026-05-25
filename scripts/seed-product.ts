/**
 * Seed the Deep Dive Into Go product into MongoDB.
 *
 * Usage:
 *   npx tsx scripts/seed-product.ts
 *
 * Requires MONGODB_URI and R2_FULL_PDF_KEY to be set in .env.local
 * (loaded automatically by dotenv below).
 *
 * This script is idempotent — running it multiple times will update
 * the existing record, not create duplicates.
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load .env.local from project root
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const R2_FULL_PDF_KEY = process.env.R2_FULL_PDF_KEY;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set in .env.local');
  process.exit(1);
}
if (!R2_FULL_PDF_KEY) {
  console.error('ERROR: R2_FULL_PDF_KEY is not set in .env.local');
  process.exit(1);
}

// ─── Product seed data ─────────────────────────────────────────────────────────

const PRODUCT_SEED = {
  slug: 'deep-dive-into-go',
  title: 'Deep Dive Into Go',
  subtitle: 'Building Production-Ready Systems',
  shortDescription:
    'A comprehensive Golang engineering handbook covering 102 chapters, 10 capstone projects, and 315 runnable programs. From syntax to distributed systems.',
  detailedDescription: `Master Go from first principles to production-grade distributed systems.

This ebook covers:
- Part 1: Go Fundamentals — syntax, types, control flow, functions, packages
- Part 2: Concurrency — goroutines, channels, select, sync primitives, race conditions
- Part 3: Standard Library Deep Dive — io, net/http, encoding, context, testing
- Part 4: Data & Storage — PostgreSQL, MongoDB, Redis, migrations, ORMs
- Part 5: APIs & Services — REST, gRPC, middleware, authentication, rate limiting
- Part 6: Infrastructure — Docker, Kubernetes, observability, distributed tracing
- Part 7: Production Systems — microservices, event sourcing, CQRS, interview prep

All 315 programs are runnable with Go 1.22+. Includes 300+ interview Q&A and a complete Go spec appendix.`,
  currentPrice: 179,
  originalPrice: 999,
  currency: 'INR',
  discountPercent: 82,
  discountLabel: 'Launch Price',
  isActive: true,
  isFeatured: true,
  isSaleEnabled: true,
  tags: ['golang', 'go', 'backend', 'systems', 'concurrency', 'microservices', 'ebook'],
  seo: {
    metaTitle: 'Deep Dive Into Go — Production-Ready Golang Engineering Handbook',
    metaDescription:
      'Master Go with 102 chapters, 315 runnable programs, 10 capstone projects, and 300+ interview Q&A. One-time purchase, lifetime access.',
    keywords: ['golang ebook', 'go programming', 'learn go', 'go concurrency', 'go microservices'],
    ogImageUrl: '',
    canonicalUrl: 'https://deepdiveintogo.in/products/deep-dive-into-go',
  },
  samplePdfUrl: '',              // Served via /api/sample-download → R2
  fullPdfR2Key: R2_FULL_PDF_KEY, // Set from env — never hardcoded
  coverImageUrl: '',
  features: [
    'Instant PDF delivery to your email',
    'Lifetime access — no expiry',
    'Free future edition updates',
    '102 chapters · 315 runnable programs',
    '10 real-world capstone projects',
    '300+ interview Q&A appendix',
    'Email support included',
    'Secure one-time payment',
  ],
  ctaPrimary: 'Buy Now',
  ctaSecondary: 'Preview Book',
  trustBadges: [
    'Secure checkout',
    'One-time payment',
    'Instant delivery',
  ],
  version: 1,
  deletedAt: null,
};

// ─── Minimal schema for seeding ────────────────────────────────────────────────
// We use a raw collection update so we don't need to import the full model

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI!, { dbName: 'bluezoid' });
  console.log('Connected.');

  const db = mongoose.connection.db!;
  const products = db.collection('products');

  const result = await products.findOneAndUpdate(
    { slug: PRODUCT_SEED.slug },
    {
      $set: { ...PRODUCT_SEED, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const action = result ? 'Updated' : 'Inserted';
  console.log(`✓ ${action} product: ${PRODUCT_SEED.slug}`);
  console.log(`  _id: ${(result as { _id?: unknown })?._id}`);
  console.log(`  currentPrice: ₹${PRODUCT_SEED.currentPrice}`);
  console.log(`  fullPdfR2Key: ${PRODUCT_SEED.fullPdfR2Key}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
