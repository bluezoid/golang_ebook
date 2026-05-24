import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export type ReconciliationStatus = 'pending' | 'matched' | 'amount_mismatch' | 'order_mismatch' | 'failed';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  internalOrderId: string;
  // Cashfree identifiers
  cfPaymentId: string;
  cfOrderId: string;
  // Verification
  webhookSignatureVerified: boolean;
  webhookTimestamp: Date | null;
  webhookIdempotencyKey: string;          // prevents duplicate processing
  isReplay: boolean;
  // Amount reconciliation
  paidAmount: number;
  paidCurrency: string;
  lockedAmount: number;                   // copied from order at time of verification
  reconciliationStatus: ReconciliationStatus;
  amountDelta: number;                    // paidAmount - lockedAmount (should be 0)
  // Payment details
  paymentMethod: string;
  paymentStatus: string;                  // raw Cashfree status
  // Raw payloads (stored for audit, never served to client)
  rawWebhookPayload: Record<string, unknown>;
  rawCashfreeResponse: Record<string, unknown>;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    internalOrderId: { type: String, required: true, index: true },
    cfPaymentId: { type: String, default: '', index: true },
    cfOrderId: { type: String, required: true, index: true },
    webhookSignatureVerified: { type: Boolean, default: false },
    webhookTimestamp: { type: Date, default: null },
    // Idempotency key: cfOrderId + cfPaymentId combo
    webhookIdempotencyKey: { type: String, required: true, unique: true },
    isReplay: { type: Boolean, default: false },
    paidAmount: { type: Number, required: true },
    paidCurrency: { type: String, required: true },
    lockedAmount: { type: Number, required: true },
    reconciliationStatus: {
      type: String,
      enum: ['pending', 'matched', 'amount_mismatch', 'order_mismatch', 'failed'],
      default: 'pending',
    },
    amountDelta: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'unknown' },
    paymentStatus: { type: String, required: true },
    rawWebhookPayload: { type: Schema.Types.Mixed, default: {} },
    rawCashfreeResponse: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PaymentSchema.index({ webhookIdempotencyKey: 1 }, { unique: true });
PaymentSchema.index({ cfOrderId: 1, createdAt: -1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
