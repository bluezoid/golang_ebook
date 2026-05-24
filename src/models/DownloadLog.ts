import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IDownloadLog extends Document {
  orderId: Types.ObjectId;
  internalOrderId: string;
  tokenHash: string;           // SHA-256 of the one-time token — never store plaintext
  ipAddress: string;
  userAgent: string;
  downloadedAt: Date;
  outcome: 'success' | 'token_invalid' | 'token_expired' | 'token_used' | 'ip_mismatch' | 'not_eligible';
  fileKey: string;             // R2 key (logged for audit, not served)
}

const DownloadLogSchema = new Schema<IDownloadLog>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    internalOrderId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: '' },
    downloadedAt: { type: Date, default: () => new Date() },
    outcome: {
      type: String,
      enum: ['success', 'token_invalid', 'token_expired', 'token_used', 'ip_mismatch', 'not_eligible'],
      required: true,
    },
    fileKey: { type: String, default: '' },
  },
  { timestamps: false }
);

DownloadLogSchema.index({ tokenHash: 1 });
DownloadLogSchema.index({ ipAddress: 1, downloadedAt: -1 });

const DownloadLog: Model<IDownloadLog> =
  mongoose.models.DownloadLog ?? mongoose.model<IDownloadLog>('DownloadLog', DownloadLogSchema);

export default DownloadLog;
