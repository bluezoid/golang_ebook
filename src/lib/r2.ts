import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

export async function getSamplePdfSignedUrl(): Promise<string> {
  return getSignedDownloadUrl(process.env.R2_SAMPLE_PDF_KEY!, 3600);
}

export async function getFullPdfSignedUrl(): Promise<string> {
  // Short-lived — 15 minutes, used only after payment verification
  return getSignedDownloadUrl(process.env.R2_FULL_PDF_KEY!, 900);
}
