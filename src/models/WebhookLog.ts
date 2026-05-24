import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IWebhookLog extends Document {
  provider: string;
  eventType: string;
  cfOrderId: string;
  cfPaymentId: string;
  signatureValid: boolean;
  isReplay: boolean;
  idempotencyKey: string;
  rawHeaders: Record<string, string>;
  rawBody: Record<string, unknown>;
  processingResult: 'accepted' | 'rejected' | 'duplicate' | 'error';
  processingError: string;
  receivedAt: Date;
  processedAt: Date | null;
}

const WebhookLogSchema = new Schema<IWebhookLog>(
  {
    provider: { type: String, required: true, default: 'cashfree' },
    eventType: { type: String, required: true },
    cfOrderId: { type: String, default: '', index: true },
    cfPaymentId: { type: String, default: '' },
    signatureValid: { type: Boolean, required: true },
    isReplay: { type: Boolean, default: false },
    idempotencyKey: { type: String, required: true },
    rawHeaders: { type: Schema.Types.Mixed, default: {} },
    rawBody: { type: Schema.Types.Mixed, default: {} },
    processingResult: {
      type: String,
      enum: ['accepted', 'rejected', 'duplicate', 'error'],
      required: true,
    },
    processingError: { type: String, default: '' },
    receivedAt: { type: Date, default: () => new Date() },
    processedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

WebhookLogSchema.index({ cfOrderId: 1, receivedAt: -1 });
WebhookLogSchema.index({ idempotencyKey: 1 }, { unique: true });
WebhookLogSchema.index({ processingResult: 1, receivedAt: -1 });

const WebhookLog: Model<IWebhookLog> =
  mongoose.models.WebhookLog ?? mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema);

export default WebhookLog;
