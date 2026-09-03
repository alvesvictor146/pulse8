import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { CampaignCreateSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = CampaignCreateSchema.safeParse(json);

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

    const campaign = await db.promoCampaign.create({
      data: {
        eventId: data.eventId,
        name: data.name,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        commissionType: data.commissionType,
        commissionValue: data.commissionValue,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao criar campanha de promoters: " + error.message },
      { status: 500 }
    );
  }
}
