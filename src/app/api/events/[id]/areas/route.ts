import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { AreaSchema } from "@/lib/validations";

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
    const result = AreaSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const area = await db.area.create({
      data: {
        eventId: params.id,
        name: result.data.name,
        capacity: result.data.capacity,
        accessLevel: result.data.accessLevel,
      },
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao criar área do evento: " + error.message },
      { status: 500 }
    );
  }
}
