import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { GuestCreateSchema } from "@/lib/validations";
import { generateSignedQrCode } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.GuestWhereInput = {
      guestList: {
        event: {
          orgId: auth.orgId,
        },
      },
    };

    if (eventId) {
      where.guestList = {
        eventId,
        event: {
          orgId: auth.orgId,
        },
      };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.fullName = { contains: search };
    }

    const guests = await db.guest.findMany({
      where,
      include: {
        guestList: {
          select: {
            id: true,
            name: true,
            type: true,
            event: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [
        { checkedInAt: { sort: "desc", nulls: "last" } },
        { fullName: "asc" },
      ],
    });

    return NextResponse.json(guests);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = GuestCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { eventId, listName, fullName, email, phone, notes, promoterId } = result.data;

    // Buscar ou criar evento da organização
    let targetEventId = eventId;
    if (!targetEventId) {
      let event = await db.event.findFirst({
        where: { orgId: auth.orgId },
      });
      if (!event) {
        event = await db.event.create({
          data: {
            orgId: auth.orgId,
            name: "Evento Principal",
          },
        });
      }
      targetEventId = event.id;
    } else {
      const validEvent = await db.event.findFirst({
        where: { id: targetEventId, orgId: auth.orgId },
      });
      if (!validEvent) {
        return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
      }
    }

    // Buscar ou criar GuestList
    let guestList = await db.guestList.findFirst({
      where: { eventId: targetEventId, name: listName || "Lista VIP" },
    });

    if (!guestList) {
      guestList = await db.guestList.create({
        data: {
          eventId: targetEventId,
          name: listName || "Lista VIP",
          type: "VIP",
        },
      });
    }

    const newGuestId = randomUUID();
    // Gera QR code assinado com HMAC-SHA256
    const qrCode = generateSignedQrCode(newGuestId, targetEventId);

    const newGuest = await db.guest.create({
      data: {
        id: newGuestId,
        guestlistId: guestList.id,
        fullName,
        email: email || null,
        phone: phone || null,
        promoterId: promoterId || null,
        qrCode,
        status: "issued",
        notes: notes || null,
      },
      include: {
        guestList: true,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "GUEST_CREATE",
      entity: "Guest",
      entityId: newGuest.id,
      payload: { fullName: newGuest.fullName, qrCode: newGuest.qrCode },
      request,
    });

    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
