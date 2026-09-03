import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { TicketSchema } from "@/lib/validations";

export async function POST(
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

    const json = await request.json();
    const result = TicketSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { areaId, lot, price, qtyTotal } = result.data;

    const ticket = await db.ticket.create({
      data: {
        eventId: params.id,
        areaId,
        lot,
        price,
        qtyTotal,
        qtySold: 0,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao criar lote de ingresso: " + error.message },
      { status: 500 }
    );
  }
}
