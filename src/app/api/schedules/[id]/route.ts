import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { ScheduleUpdateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const existing = await db.schedule.findFirst({
      where: {
        id: params.id,
        event: { orgId: auth.orgId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item do cronograma não encontrado" }, { status: 404 });
    }

    const json = await request.json();
    const result = ScheduleUpdateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const updated = await db.schedule.update({
      where: { id: params.id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startAt !== undefined && { startAt: data.startAt ? new Date(data.startAt) : null }),
        ...(data.endAt !== undefined && { endAt: data.endAt ? new Date(data.endAt) : null }),
        ...(data.ownerName !== undefined && { ownerName: data.ownerName }),
        ...(data.status && { status: data.status }),
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "SCHEDULE_UPDATE",
      entity: "Schedule",
      entityId: updated.id,
      payload: data,
      request,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar item do cronograma: " + error.message },
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
    const existing = await db.schedule.findFirst({
      where: {
        id: params.id,
        event: { orgId: auth.orgId },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item do cronograma não encontrado" }, { status: 404 });
    }

    await db.schedule.delete({
      where: { id: params.id },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "SCHEDULE_DELETE",
      entity: "Schedule",
      entityId: params.id,
      payload: { title: existing.title },
      request,
    });

    return NextResponse.json({ success: true, message: "Item removido do cronograma" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao excluir item do cronograma: " + error.message },
      { status: 500 }
    );
  }
}
