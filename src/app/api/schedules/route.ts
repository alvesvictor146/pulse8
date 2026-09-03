import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { ScheduleCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const type = searchParams.get("type");

    const where: any = {
      event: {
        orgId: auth.orgId,
      },
    };

    if (eventId) {
      where.eventId = eventId;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    const schedules = await db.schedule.findMany({
      where,
      include: {
        event: { select: { id: true, name: true } },
      },
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar cronogramas: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = ScheduleCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const event = await db.event.findFirst({
      where: { id: data.eventId, orgId: auth.orgId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const schedule = await db.schedule.create({
      data: {
        eventId: data.eventId,
        type: data.type,
        title: data.title,
        description: data.description || null,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        ownerName: data.ownerName || null,
        status: data.status,
      },
      include: {
        event: true,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "SCHEDULE_CREATE",
      entity: "Schedule",
      entityId: schedule.id,
      payload: { title: schedule.title, type: schedule.type },
      request,
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao criar marco no cronograma: " + error.message },
      { status: 500 }
    );
  }
}
