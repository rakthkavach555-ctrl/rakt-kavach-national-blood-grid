import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";

export async function auditLog(params: {
  action: string;
  userId: number;
  resourceType?: string;
  resourceId?: number;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await db.insert(auditLogsTable).values({
      action: params.action,
      userId: params.userId,
      resourceType: params.resourceType ?? null,
      resourceId: params.resourceId ?? null,
      metadata: params.metadata ?? null,
      ipAddress: params.ipAddress ?? null,
    });
  } catch {
    // Don't fail the request if audit logging fails
  }
}
