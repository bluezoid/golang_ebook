import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetSignedUrl = vi.fn();

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({})),
  GetObjectCommand: vi.fn().mockImplementation((params) => ({ ...params, _type: 'GetObjectCommand' })),
}));

const { getSamplePdfSignedUrl, getFullPdfSignedUrl, getFullPdfR2Key } = await import('@/lib/r2');

const MOCK_SIGNED_URL = 'https://test.r2.cloudflarestorage.com/bucket/key?X-Amz-Expires=600&X-Amz-Signature=abc';

describe('getSamplePdfSignedUrl', () => {
  beforeEach(() => mockGetSignedUrl.mockReset());

  it('uses R2_SAMPLE_PDF_KEY env var', async () => {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);

    await getSamplePdfSignedUrl();

    expect(GetObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({ Key: process.env.R2_SAMPLE_PDF_KEY })
    );
  });

  it('uses 3600 second expiry (1 hour)', async () => {
    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);

    await getSamplePdfSignedUrl();

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 3600 }
    );
  });

});

describe('getFullPdfSignedUrl', () => {
  beforeEach(() => mockGetSignedUrl.mockReset());

  it('uses R2_FULL_PDF_KEY env var', async () => {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);

    await getFullPdfSignedUrl();

    expect(GetObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({ Key: process.env.R2_FULL_PDF_KEY })
    );
  });

  it('uses 600 second expiry (10 minutes)', async () => {
    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);

    await getFullPdfSignedUrl();

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 600 }
    );
  });

});

describe('getFullPdfR2Key', () => {
  it('returns the R2_FULL_PDF_KEY env value', () => {
    process.env.R2_FULL_PDF_KEY = 'ebooks/test.pdf';
    const key = getFullPdfR2Key();
    expect(key).toBe('ebooks/test.pdf');
  });

  it('throws if R2_FULL_PDF_KEY is not set', () => {
    const original = process.env.R2_FULL_PDF_KEY;
    delete process.env.R2_FULL_PDF_KEY;
    expect(() => getFullPdfR2Key()).toThrow('R2_FULL_PDF_KEY');
    process.env.R2_FULL_PDF_KEY = original;
  });
});
