import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetSignedUrl = vi.fn();

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({})),
  GetObjectCommand: vi.fn().mockImplementation((params) => ({ ...params, _type: 'GetObjectCommand' })),
}));

const { getSignedDownloadUrl, getSamplePdfSignedUrl, getFullPdfSignedUrl } = await import('@/lib/r2');

const MOCK_SIGNED_URL = 'https://test.r2.cloudflarestorage.com/bucket/key?X-Amz-Expires=3600&X-Amz-Signature=abc';

describe('getSignedDownloadUrl', () => {
  beforeEach(() => {
    mockGetSignedUrl.mockReset();
  });

  it('calls getSignedUrl and returns the resulting URL', async () => {
    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);

    const result = await getSignedDownloadUrl('some/path/file.pdf', 3600);
    expect(result).toBe(MOCK_SIGNED_URL);
    expect(mockGetSignedUrl).toHaveBeenCalledOnce();
  });

  it('passes correct Bucket and Key to GetObjectCommand', async () => {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);

    await getSignedDownloadUrl('ebooks/test.pdf', 900);

    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: 'ebooks/test.pdf',
    });
  });

  it('passes expiresIn to getSignedUrl options', async () => {
    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);

    await getSignedDownloadUrl('key', 1800);

    const callArgs = mockGetSignedUrl.mock.calls[0];
    expect(callArgs[2]).toEqual({ expiresIn: 1800 });
  });

  it('propagates error from getSignedUrl', async () => {
    mockGetSignedUrl.mockRejectedValue(new Error('R2 connection failed'));

    await expect(getSignedDownloadUrl('key', 3600)).rejects.toThrow('R2 connection failed');
  });
});

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

  it('uses 900 second expiry (15 minutes) for security', async () => {
    mockGetSignedUrl.mockResolvedValue(MOCK_SIGNED_URL);

    await getFullPdfSignedUrl();

    expect(mockGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { expiresIn: 900 }
    );
  });
});
