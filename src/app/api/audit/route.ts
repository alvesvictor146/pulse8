import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { extractClientIp } from "@/lib/audit";
import { requireFinance } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    // Apenas roles finance, producer e admin podem ler logs de auditoria
    requireFinance(auth);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const skip = (page - 1) * limit;

    const [auditLogs, total] = await db.$transaction([
      db.auditLog.findMany({
        where: { orgId: auth.orgId },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      db.auditLog.count({ where: { orgId: auth.orgId } }),
    ]);

    return NextResponse.json({
      data: auditLogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST removido intencionalmente — logs de auditoria são imutáveis.
// Apenas o helper logAudit() pode criar entradas via código interno.

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const body = await request.json();
    const { action, entity, entityId, payload } = body;

    if (!action || !entity) {
      return NextResponse.json(
        { error: "Campos 'action' e 'entity' são obrigatórios" },
        { status: 400 }
      );
    }

    const ipAddress = extractClientIp(request);

    const log = await db.auditLog.create({
      data: {
        orgId: auth.orgId,
        actorId: auth.userId || null,
        action,
        entity,
        entityId: entityId || null,
        payload: payload ? JSON.stringify(payload) : null,
        ipAddress,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
