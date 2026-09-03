import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

/**
 * Retorna o manifesto completo de convidados para download offline do PWA de Check-in
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const event = await db.event.findFirst({
      where: { id: params.id, orgId: auth.orgId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const guestLists = await db.guestList.findMany({
      where: { eventId: params.id },
      include: {
        guests: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            qrCode: true,
            status: true,
            checkedInAt: true,
            notes: true,
          },
        },
      },
    });

    const manifest = guestLists.flatMap((list) =>
      list.guests.map((g) => ({
        ...g,
        listName: list.name,
        listType: list.type,
      }))
    );

    return NextResponse.json({
      eventId: params.id,
      eventName: event.name,
      totalGuests: manifest.length,
      generatedAt: new Date().toISOString(),
      guests: manifest,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao gerar manifesto de convidados: " + error.message },
      { status: 500 }
    );
  }
}
