import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IRateLimitTracking extends Document {
  key: string;              // composite: "endpoint:ip" e.g. "checkout:1.2.3.4"
  endpoint: string;
  ipAddress: string;
  windowStart: Date;
  requestCount: number;
  isBlocked: boolean;
  blockedUntil: Date | null;
  lastSeen: Date;
}

const RateLimitTrackingSchema = new Schema<IRateLimitTracking>(
  {
    key: { type: String, required: true, unique: true, index: true },
    endpoint: { type: String, required: true },
    ipAddress: { type: String, required: true },
    windowStart: { type: Date, required: true },
    requestCount: { type: Number, default: 1 },
    isBlocked: { type: Boolean, default: false },
    blockedUntil: { type: Date, default: null },
    lastSeen: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

// TTL: auto-expire records after 1 hour (3600s)
RateLimitTrackingSchema.index({ windowStart: 1 }, { expireAfterSeconds: 3600 });
RateLimitTrackingSchema.index({ ipAddress: 1, endpoint: 1 });

const RateLimitTracking: Model<IRateLimitTracking> =
  mongoose.models.RateLimitTracking ??
  mongoose.model<IRateLimitTracking>('RateLimitTracking', RateLimitTrackingSchema);

export default RateLimitTracking;
