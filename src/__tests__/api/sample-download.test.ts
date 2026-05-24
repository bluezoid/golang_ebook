import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetSignedUrl = vi.fn();
vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: mockGetSignedUrl }));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({})),
  GetObjectCommand: vi.fn().mockImplementation((p) => p),
}));

const MOCK_PDF_URL = 'https://r2.test/sample.pdf?sig=xyz&expires=3600';

// Each test gets an isolated module to avoid rate-limit state leaking between tests
async function importFreshRoute() {
  vi.resetModules();
  // Re-apply mocks after reset
  vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: mockGetSignedUrl }));
  vi.mock('@aws-sdk/client-s3', () => ({
    S3Client: vi.fn().mockImplementation(() => ({})),
    GetObjectCommand: vi.fn().mockImplementation((p) => p),
  }));
  const mod = await import('@/app/api/sample-download/route');
  return mod.GET;
}

function makeRequest(ip = '1.2.3.4') {
  return new Request('http://localhost:3000/api/sample-download', {
    method: 'GET',
    headers: { 'x-forwarded-for': ip },
  });
}

describe('GET /api/sample-download', () => {
  beforeEach(() => {
    mockGetSignedUrl.mockReset();
    mockGetSignedUrl.mockResolvedValue(MOCK_PDF_URL);
  });

  it('302 — redirects to signed URL on first request', async () => {
    const GET = await importFreshRoute();
    const res = await GET(makeRequest('10.0.0.1'));

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(MOCK_PDF_URL);
  });

  it('calls getSamplePdfSignedUrl (uses sample PDF key)', async () => {
    const GET = await importFreshRoute();
    await GET(makeRequest('10.0.0.2'));

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 3600 }
    );
  });

  it('rate limits: allows exactly 5 requests per IP then returns 429', async () => {
    const GET = await importFreshRoute();
    const ip = '99.99.99.99';

    for (let i = 0; i < 5; i++) {
      const res = await GET(makeRequest(ip));
      expect(res.status).toBe(302);
    }

    const res = await GET(makeRequest(ip));
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toBe('Too many requests');
  });

  it('different IPs have independent rate limit buckets', async () => {
    const GET = await importFreshRoute();

    // Exhaust IP A
    for (let i = 0; i < 5; i++) {
      await GET(makeRequest('5.5.5.5'));
    }
    const ipABlocked = await GET(makeRequest('5.5.5.5'));
    expect(ipABlocked.status).toBe(429);

    // IP B should still work
    const ipBRes = await GET(makeRequest('6.6.6.6'));
    expect(ipBRes.status).toBe(302);
  });

  it('extracts first IP from multi-value x-forwarded-for header', async () => {
    const GET = await importFreshRoute();
    const req = new Request('http://localhost:3000/api/sample-download', {
      headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' },
    });

    const res = await GET(req);
    expect(res.status).toBe(302);
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    const GET = await importFreshRoute();
    const req = new Request('http://localhost:3000/api/sample-download', {
      headers: { 'x-real-ip': '7.7.7.7' },
    });

    const res = await GET(req);
    expect(res.status).toBe(302);
  });

  it('falls back to "unknown" when no IP headers present', async () => {
    const GET = await importFreshRoute();
    const req = new Request('http://localhost:3000/api/sample-download');

    const res = await GET(req);
    expect(res.status).toBe(302); // "unknown" treated as a single IP
  });

  it('rate limit resets after 1-minute window', async () => {
    vi.useFakeTimers();
    const GET = await importFreshRoute();
    const ip = '50.50.50.50';

    // Exhaust the limit
    for (let i = 0; i < 5; i++) {
      await GET(makeRequest(ip));
    }
    expect((await GET(makeRequest(ip))).status).toBe(429);

    // Advance time past the 60-second window
    vi.advanceTimersByTime(61_000);

    // Should work again
    const res = await GET(makeRequest(ip));
    expect(res.status).toBe(302);

    vi.useRealTimers();
  });

  it('500 — R2 signing fails returns 500 with error message', async () => {
    mockGetSignedUrl.mockRejectedValue(new Error('R2 unreachable'));
    const GET = await importFreshRoute();

    const res = await GET(makeRequest('20.20.20.20'));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe('Download unavailable');
  });
});
