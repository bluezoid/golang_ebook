import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'payment_initiated'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'fraud_blocked';

export type FraudFlag =
  | 'none'
  | 'duplicate_ip'
  | 'duplicate_order'
  | 'velocity_exceeded'
  | 'disposable_email'
  | 'suspicious_user_agent'
  | 'amount_mismatch'
  | 'manual_review';

export interface ISignedUrlMeta {
  token: string;         // one-time download token (opaque, stored hashed)
  tokenHash: string;     // SHA-256 hash of the token
  issuedAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
  usedByIp: string | null;
}

export interface IOrder extends Document {
  internalOrderId: string;        // BLZ-XXXXXXXXXXXXXXXX
  productId: Types.ObjectId;
  productSlug: string;
  // Snapshot of product at time of purchase — NEVER changes after creation
  lockedAmount: number;
  lockedCurrency: string;
  lockedProductTitle: string;
  // Customer details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  // Payment
  cashfreeOrderId: string;
  status: OrderStatus;
  fraudFlag: FraudFlag;
  isDownloadEligible: boolean;
  signedUrlMeta: ISignedUrlMeta | null;
  // Request context
  ipAddress: string;
  userAgent: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
}

const SignedUrlMetaSchema = new Schema<ISignedUrlMeta>(
  {
    token: { type: String, required: true },     // cleartext stored only briefly in memory
    tokenHash: { type: String, required: true },  // what's persisted
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    usedByIp: { type: String, default: null },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    internalOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productSlug: { type: String, required: true },
    // Price LOCKED at order creation — product price changes never affect paid orders
    lockedAmount: { type: Number, required: true, min: 0 },
    lockedCurrency: { type: String, required: true, default: 'INR', uppercase: true },
    lockedProductTitle: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    customerPhone: { type: String, required: true },
    cashfreeOrderId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'payment_initiated', 'paid', 'failed', 'cancelled', 'refunded', 'fraud_blocked'],
      default: 'pending',
    },
    fraudFlag: {
      type: String,
      enum: ['none', 'duplicate_ip', 'duplicate_order', 'velocity_exceeded', 'disposable_email', 'suspicious_user_agent', 'amount_mismatch', 'manual_review'],
      default: 'none',
    },
    isDownloadEligible: { type: Boolean, default: false },
    signedUrlMeta: { type: SignedUrlMetaSchema, default: null },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: '' },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Query patterns
OrderSchema.index({ customerEmail: 1, status: 1 });
OrderSchema.index({ cashfreeOrderId: 1 });
OrderSchema.index({ ipAddress: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
// Fraud velocity check: orders from same email in last 24h
OrderSchema.index({ customerEmail: 1, createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
