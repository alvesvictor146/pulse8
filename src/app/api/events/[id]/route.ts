import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { EventUpdateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const event = await db.event.findFirst({
      where: {
        id: params.id,
        orgId: auth.orgId,
      },
      include: {
        areas: {
          include: {
            tickets: true,
          },
        },
        tickets: true,
        guestLists: {
          include: {
            guests: true,
          },
        },
        costItems: {
          include: {
            supplier: true,
          },
        },
        revenues: true,
        campaigns: {
          include: {
            promoLinks: true,
            promoSales: true,
          },
        },
        assignments: {
          include: {
            person: true,
            role: true,
          },
        },
        schedules: true,
        postQueue: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar evento: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = EventUpdateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await db.event.findFirst({
      where: { id: params.id, orgId: auth.orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const data = result.data;
    const updated = await db.event.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.startAt !== undefined && { startAt: data.startAt ? new Date(data.startAt) : null }),
        ...(data.endAt !== undefined && { endAt: data.endAt ? new Date(data.endAt) : null }),
        ...(data.status && { status: data.status }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "EVENT_UPDATE",
      entity: "Event",
      entityId: updated.id,
      payload: data,
      request,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar evento: " + error.message },
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
    const existing = await db.event.findFirst({
      where: { id: params.id, orgId: auth.orgId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    await db.event.delete({
      where: { id: params.id },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "EVENT_DELETE",
      entity: "Event",
      entityId: params.id,
      payload: { name: existing.name },
      request,
    });

    return NextResponse.json({ success: true, message: "Evento excluído com sucesso" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao excluir evento: " + error.message },
      { status: 500 }
    );
  }
}
