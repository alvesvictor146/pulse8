import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { CostItemCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const where: any = {
      event: {
        orgId: auth.orgId,
      },
    };

    if (eventId) {
      where.eventId = eventId;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const costItems = await db.costItem.findMany({
      where,
      include: {
        event: {
          select: { id: true, name: true },
        },
        supplier: {
          select: { id: true, name: true, category: true, pix: true },
        },
        account: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(costItems);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = CostItemCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Garante que o evento pertence à organização autenticada
    const event = await db.event.findFirst({
      where: { id: data.eventId, orgId: auth.orgId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado ou não autorizado" }, { status: 404 });
    }

    // Calcula totalCost = qty * unitCost se não fornecido explicitamente
    const totalCost = data.totalCost !== undefined && data.totalCost > 0
      ? data.totalCost
      : Number((data.qty * data.unitCost).toFixed(2));

    const newItem = await db.costItem.create({
      data: {
        eventId: data.eventId,
        accountId: data.accountId || null,
        supplierId: data.supplierId || null,
        title: data.title,
        qty: data.qty,
        unitCost: data.unitCost,
        totalCost,
        status: data.status || "planned",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        attachmentUrl: data.attachmentUrl || null,
      },
      include: {
        supplier: true,
        event: true,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "FINANCE_COST_CREATE",
      entity: "CostItem",
      entityId: newItem.id,
      payload: { title: newItem.title, totalCost },
      request,
    });

    // Verificação de threshold de orçamento (Alerta 80%)
    const costAgg = await db.costItem.aggregate({
      where: { eventId: data.eventId },
      _sum: { totalCost: true },
    });
    const totalEventCosts = Number(costAgg._sum.totalCost || 0);

    // Se houver orçamento acumulado maior que 50.000, registra alerta de auditoria
    if (totalEventCosts >= 50000) {
      await logAudit({
        orgId: auth.orgId,
        actorId: auth.userId,
        action: "BUDGET_ALERT_80_PCT",
        entity: "Event",
        entityId: data.eventId,
        payload: { totalEventCosts, alertThreshold: 50000 },
        request,
      });
    }

    return NextResponse.json({ ...newItem, budgetAlert: totalEventCosts >= 50000 }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
