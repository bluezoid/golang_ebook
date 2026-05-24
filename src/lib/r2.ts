/**
 * Cloudflare R2 signed URL implementation — fully hardened.
 *
 * Security properties:
 * - Full PDF R2 key is NEVER exposed to the client.
 * - Signed URLs are short-lived (10 min for full PDF, 1h for sample).
 * - Full PDF access requires a valid one-time token stored in MongoDB.
 * - Download events are logged for abuse monitoring.
 * - The download API (/api/download/[token]) is the only path that redeems
 *   a token and generates a final signed URL — this file only produces URLs
 *   after the token has been verified and marked used.
 */
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ─── R2 client singleton ───────────────────────────────────────────────────────

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (r2Client) return r2Client;
  r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return r2Client;
}

// ─── Internal URL generation ───────────────────────────────────────────────────

async function createSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a signed URL for the full PDF.
 *
 * MUST only be called after:
 * 1. Payment is verified as PAID
 * 2. One-time download token has been validated and consumed
 * 3. IP address has been checked against the token's issuing IP
 *
 * Expires in 10 minutes — short enough to prevent sharing, long enough
 * for a real download to complete.
 */
export async function getFullPdfSignedUrl(): Promise<string> {
  const key = process.env.R2_FULL_PDF_KEY;
  if (!key) throw new Error('R2_FULL_PDF_KEY is not configured');
  return createSignedUrl(key, 600); // 10 minutes
}

/**
 * Generate a signed URL for the free sample PDF.
 * Sample is less sensitive — 1h expiry, no token required.
 * Still not public — requires a valid signed URL so direct R2 URLs never work.
 */
export async function getSamplePdfSignedUrl(): Promise<string> {
  const key = process.env.R2_SAMPLE_PDF_KEY;
  if (!key) throw new Error('R2_SAMPLE_PDF_KEY is not configured');
  return createSignedUrl(key, 3600); // 1 hour
}

/**
 * Get the raw R2 key for the full PDF.
 * Used internally when logging the key to DownloadLog — NEVER returned to the client.
 */
export function getFullPdfR2Key(): string {
  const key = process.env.R2_FULL_PDF_KEY;
  if (!key) throw new Error('R2_FULL_PDF_KEY is not configured');
  return key;
}
