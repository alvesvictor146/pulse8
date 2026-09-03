import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { EventCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.EventWhereInput = {
      orgId: auth.orgId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.name = {
        contains: search,
      };
    }

    const events = await db.event.findMany({
      where,
      include: {
        areas: {
          include: {
            tickets: true,
          },
        },
        tickets: true,
        _count: {
          select: {
            guestLists: true,
            costItems: true,
            assignments: true,
            revenues: true,
            campaigns: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = EventCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const newEvent = await db.event.create({
      data: {
        orgId: auth.orgId,
        name: data.name,
        theme: data.theme || null,
        description: data.description || null,
        venue: data.venue || null,
        city: data.city || null,
        state: data.state || null,
        capacity: data.capacity || 0,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        status: data.status || "draft",
        coverUrl: data.coverUrl || null,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "EVENT_CREATE",
      entity: "Event",
      entityId: newEvent.id,
      payload: { name: newEvent.name, status: newEvent.status },
      request,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
