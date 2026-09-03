import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { RevenueCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const where: any = {
      event: {
        orgId: auth.orgId,
      },
    };

    if (eventId) {
      where.eventId = eventId;
    }

    const revenues = await db.revenue.findMany({
      where,
      include: {
        event: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(revenues);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar receitas: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = RevenueCreateSchema.safeParse(json);

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

    const revenue = await db.revenue.create({
      data: {
        eventId: data.eventId,
        source: data.source,
        amount: data.amount,
        receivedAt: data.receivedAt ? new Date(data.receivedAt) : new Date(),
        reference: data.reference || null,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "FINANCE_REVENUE_CREATE",
      entity: "Revenue",
      entityId: revenue.id,
      payload: { source: revenue.source, amount: data.amount },
      request,
    });

    return NextResponse.json(revenue, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao registrar receita: " + error.message },
      { status: 500 }
    );
  }
}
