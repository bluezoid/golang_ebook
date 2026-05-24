import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type AuditAction =
  | 'order.created'
  | 'order.paid'
  | 'order.failed'
  | 'order.fraud_blocked'
  | 'payment.webhook_received'
  | 'payment.verified'
  | 'payment.verify_polled'
  | 'payment.replay_detected'
  | 'payment.amount_mismatch'
  | 'download.issued'
  | 'download.redeemed'
  | 'download.abuse_detected'
  | 'download.success'
  | 'download.token_expired'
  | 'download.token_reuse_attempt'
  | 'admin.product_updated'
  | 'admin.price_changed'
  | 'admin.product_deactivated'
  | 'security.rate_limit_exceeded'
  | 'security.nosql_injection_attempt'
  | 'security.suspicious_request';

export interface IAuditLog extends Document {
  action: AuditAction;
  actor: string;           // email, IP, or 'system'
  resourceType: string;    // 'order', 'product', 'payment', etc.
  resourceId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warn' | 'critical';
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, index: true },
    actor: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['info', 'warn', 'critical'],
      default: 'info',
    },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: false }
);

// Audit logs are append-only — no updates, never deleted
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
