import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type FraudSignalType =
  | 'velocity_ip'
  | 'velocity_email'
  | 'disposable_email'
  | 'duplicate_order'
  | 'bot_fingerprint'
  | 'amount_probe'
  | 'webhook_spoof_attempt'
  | 'nosql_injection'
  | 'replay_attack';

export interface IFraudMonitoring extends Document {
  signalType: FraudSignalType;
  ipAddress: string;
  email: string;
  userAgent: string;
  orderId: string;
  description: string;
  metadata: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isBlocked: boolean;
  detectedAt: Date;
}

const FraudMonitoringSchema = new Schema<IFraudMonitoring>(
  {
    signalType: {
      type: String,
      enum: [
        'velocity_ip', 'velocity_email', 'disposable_email',
        'duplicate_order', 'bot_fingerprint', 'amount_probe',
        'webhook_spoof_attempt', 'nosql_injection', 'replay_attack',
      ],
      required: true,
    },
    ipAddress: { type: String, default: '', index: true },
    email: { type: String, default: '', lowercase: true },
    userAgent: { type: String, default: '' },
    orderId: { type: String, default: '' },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    isBlocked: { type: Boolean, default: false },
    detectedAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: false }
);

FraudMonitoringSchema.index({ signalType: 1, detectedAt: -1 });
FraudMonitoringSchema.index({ ipAddress: 1, detectedAt: -1 });
FraudMonitoringSchema.index({ severity: 1, isBlocked: 1 });

const FraudMonitoring: Model<IFraudMonitoring> =
  mongoose.models.FraudMonitoring ??
  mongoose.model<IFraudMonitoring>('FraudMonitoring', FraudMonitoringSchema);

export default FraudMonitoring;
