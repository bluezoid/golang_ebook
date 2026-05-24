import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPaymentAttempt extends Document {
  internalOrderId: string;
  ipAddress: string;
  userAgent: string;
  attemptedAt: Date;
  outcome: 'initiated' | 'success' | 'failed' | 'cancelled' | 'timeout';
  failureReason: string;
  cashfreeOrderId: string;
}

const PaymentAttemptSchema = new Schema<IPaymentAttempt>(
  {
    internalOrderId: { type: String, required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: '' },
    attemptedAt: { type: Date, default: () => new Date() },
    outcome: {
      type: String,
      enum: ['initiated', 'success', 'failed', 'cancelled', 'timeout'],
      required: true,
    },
    failureReason: { type: String, default: '' },
    cashfreeOrderId: { type: String, default: '' },
  },
  { timestamps: false }
);

// Velocity: how many attempts from same IP in last N minutes
PaymentAttemptSchema.index({ ipAddress: 1, attemptedAt: -1 });
// Duplicate detection
PaymentAttemptSchema.index({ internalOrderId: 1, outcome: 1 });

const PaymentAttempt: Model<IPaymentAttempt> =
  mongoose.models.PaymentAttempt ??
  mongoose.model<IPaymentAttempt>('PaymentAttempt', PaymentAttemptSchema);

export default PaymentAttempt;
