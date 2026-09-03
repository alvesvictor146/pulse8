import { db } from "./db";

export interface LogAuditParams {
  orgId: string;
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  payload?: any;
  request?: Request;
  ipAddress?: string;
}

export function extractClientIp(request?: Request): string {
  if (!request) return "127.0.0.1";
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Registra um evento imutável na tabela de auditoria (AuditLog).
 */
export async function logAudit({
  orgId,
  actorId,
  action,
  entity,
  entityId,
  payload,
  request,
  ipAddress,
}: LogAuditParams) {
  try {
    const ip = ipAddress || extractClientIp(request);
    await db.auditLog.create({
      data: {
        orgId,
        actorId: actorId || null,
        action,
        entity,
        entityId: entityId || null,
        payload: payload ? JSON.stringify(payload) : null,
        ipAddress: ip,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
