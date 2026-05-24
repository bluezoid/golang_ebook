import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockProductFindOne = vi.fn();

vi.mock('@/models/Product', () => ({
  default: { findOne: mockProductFindOne },
}));

vi.mock('@/lib/mongoose', () => ({
  connectMongoose: vi.fn().mockResolvedValue({}),
}));

const { GET } = await import('@/app/api/products/[slug]/route');

function makeRequest(slug: string) {
  return new NextRequest(`http://localhost:3000/api/products/${slug}`, { method: 'GET' });
}

function makeParams(slug: string): { params: Promise<{ slug: string }> } {
  return { params: Promise.resolve({ slug }) };
}

const MOCK_PRODUCT = {
  _id: 'prod-id-1',
  slug: 'deep-dive-into-go',
  title: 'Deep Dive Into Go',
  currentPrice: 149,
  originalPrice: 999,
  currency: 'INR',
  discountPercent: 85,
  discountLabel: 'Launch Price',
  isActive: true,
  isSaleEnabled: true,
  ctaPrimary: 'Buy Now',
  ctaSecondary: 'Preview Book',
};

describe('GET /api/products/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('200 — returns product data for valid slug', async () => {
    mockProductFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(MOCK_PRODUCT) }),
    });

    const res = await GET(makeRequest('deep-dive-into-go'), makeParams('deep-dive-into-go'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.product.slug).toBe('deep-dive-into-go');
    expect(json.product.currentPrice).toBe(149);
    // R2 key must not be returned
    expect(json.product.fullPdfR2Key).toBeUndefined();
  });

  it('200 — sets Cache-Control header', async () => {
    mockProductFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(MOCK_PRODUCT) }),
    });

    const res = await GET(makeRequest('deep-dive-into-go'), makeParams('deep-dive-into-go'));
    expect(res.headers.get('cache-control')).toContain('s-maxage=60');
  });

  it('404 — product not found', async () => {
    mockProductFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
    });

    const res = await GET(makeRequest('nonexistent'), makeParams('nonexistent'));
    expect(res.status).toBe(404);
  });

  it('400 — invalid slug with special characters', async () => {
    const res = await GET(makeRequest('../../etc/passwd'), makeParams('../../etc/passwd'));
    expect(res.status).toBe(400);
  });

  it('400 — empty slug', async () => {
    const res = await GET(makeRequest(''), makeParams(''));
    expect(res.status).toBe(400);
  });
});
