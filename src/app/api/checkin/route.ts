import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { CheckinScanSchema } from "@/lib/validations";
import { verifySignedQrCode } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);

    // Rate limit: 60 scans por minuto por organização
    const rl = checkRateLimit(`checkin:${auth.orgId}`, 60, 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const json = await request.json();
    const result = CheckinScanSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { qrCode, eventId } = result.data;

    // 1. Validação Criptográfica HMAC
    const verification = verifySignedQrCode(qrCode);
    if (!verification.valid) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_SIGNATURE",
          message: verification.reason || "Código QR inválido ou violado.",
        },
        { status: 400 }
      );
    }

    // 2. Busca o convidado pelo QR Code ou pelo guestId verificado
    const guest = await db.guest.findFirst({
      where: {
        OR: [
          { qrCode },
          ...(verification.guestId ? [{ id: verification.guestId }] : []),
        ],
        guestList: {
          event: {
            orgId: auth.orgId,
            ...(eventId ? { id: eventId } : {}),
          },
        },
      },
      include: {
        guestList: {
          include: {
            event: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          code: "NOT_FOUND",
          message: "Ingresso/Convidado não encontrado para este evento.",
        },
        { status: 404 }
      );
    }

    // 3. Verificação de status prévio
    if (guest.status === "checked_in") {
      return NextResponse.json(
        {
          success: false,
          code: "ALREADY_CHECKED_IN",
          message: `Ingresso já utilizado em ${new Date(guest.checkedInAt!).toLocaleTimeString("pt-BR")}.`,
          guest: {
            id: guest.id,
            fullName: guest.fullName,
            listName: guest.guestList.name,
            checkedInAt: guest.checkedInAt,
          },
        },
        { status: 409 }
      );
    }

    if (guest.status === "blocked") {
      return NextResponse.json(
        {
          success: false,
          code: "BLOCKED",
          message: "Acesso bloqueado pela organização.",
          guest: {
            id: guest.id,
            fullName: guest.fullName,
          },
        },
        { status: 403 }
      );
    }

    // 4. Executa Check-in com sucesso
    const now = new Date();
    const updatedGuest = await db.guest.update({
      where: { id: guest.id },
      data: {
        status: "checked_in",
        checkedInAt: now,
      },
      include: {
        guestList: true,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "GATE_CHECKIN_SUCCESS",
      entity: "Guest",
      entityId: guest.id,
      payload: {
        guestName: guest.fullName,
        listName: guest.guestList.name,
        eventName: guest.guestList.event.name,
        checkedInAt: now,
      },
      request,
    });

    return NextResponse.json({
      success: true,
      code: "AUTHORIZED",
      message: `Acesso liberado: ${guest.fullName}`,
      guest: {
        id: updatedGuest.id,
        fullName: updatedGuest.fullName,
        listName: updatedGuest.guestList.name,
        type: updatedGuest.guestList.type,
        checkedInAt: now,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
