import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { CostItemUpdateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const existing = await db.costItem.findFirst({
      where: {
        id: params.id,
        event: { orgId: auth.orgId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item de custo não encontrado" }, { status: 404 });
    }

    const json = await request.json();
    const result = CostItemUpdateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const qty = data.qty !== undefined ? data.qty : Number(existing.qty);
    const unitCost = data.unitCost !== undefined ? data.unitCost : Number(existing.unitCost);
    const totalCost = data.totalCost !== undefined ? data.totalCost : Number((qty * unitCost).toFixed(2));

    // Se o status mudou para 'paid' e paidAt não veio, preenche agora
    let paidAt = data.paidAt ? new Date(data.paidAt) : existing.paidAt;
    if (data.status === "paid" && !existing.paidAt && !data.paidAt) {
      paidAt = new Date();
    }

    const updated = await db.costItem.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        qty,
        unitCost,
        totalCost,
        ...(data.status && { status: data.status }),
        paidAt,
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.accountId !== undefined && { accountId: data.accountId }),
        ...(data.supplierId !== undefined && { supplierId: data.supplierId }),
        ...(data.attachmentUrl !== undefined && { attachmentUrl: data.attachmentUrl }),
      },
      include: {
        supplier: true,
        event: true,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "FINANCE_COST_UPDATE",
      entity: "CostItem",
      entityId: updated.id,
      payload: { status: updated.status, totalCost },
      request,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar custo: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const existing = await db.costItem.findFirst({
      where: {
        id: params.id,
        event: { orgId: auth.orgId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item de custo não encontrado" }, { status: 404 });
    }

    await db.costItem.delete({
      where: { id: params.id },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "FINANCE_COST_DELETE",
      entity: "CostItem",
      entityId: params.id,
      payload: { title: existing.title },
      request,
    });

    return NextResponse.json({ success: true, message: "Item excluído com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao excluir custo: " + error.message },
      { status: 500 }
    );
  }
}
