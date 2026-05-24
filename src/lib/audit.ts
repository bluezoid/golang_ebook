/**
 * Audit logging — append-only, fire-and-forget.
 *
 * Audit records are never modified or deleted. If the DB write fails
 * we log to stderr so an external log shipper (Datadog, Loki) can capture it,
 * but we never let an audit failure block a user-facing request.
 */
import AuditLog, { type AuditAction } from '@/models/AuditLog';

export interface AuditParams {
  action: AuditAction;
  actor: string;               // email, IP, or 'system'
  resourceType: string;
  resourceId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'info' | 'warn' | 'critical';
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await AuditLog.create({
      action: params.action,
      actor: params.actor,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      before: params.before ?? null,
      after: params.after ?? null,
      metadata: params.metadata ?? {},
      ipAddress: params.ipAddress ?? '',
      userAgent: params.userAgent ?? '',
      severity: params.severity ?? 'info',
      timestamp: new Date(),
    });
  } catch (err) {
    // Structured stderr so a log shipper captures it even when Mongo is down
    console.error(JSON.stringify({
      level: 'error',
      msg: 'audit_log_write_failed',
      action: params.action,
      actor: params.actor,
      resourceId: params.resourceId,
      error: err instanceof Error ? err.message : String(err),
      ts: new Date().toISOString(),
    }));
  }
}

// Fire-and-forget variant — never awaited, never blocks the caller
export function auditLog(params: AuditParams): void {
  writeAuditLog(params).catch(() => { /* already handled inside */ });
}
