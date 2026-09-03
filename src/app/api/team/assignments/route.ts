import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { AssignmentCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = AssignmentCreateSchema.safeParse(json);

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

    const person = await db.people.findFirst({
      where: { id: data.personId, orgId: auth.orgId },
    });

    if (!person) {
      return NextResponse.json({ error: "Membro da equipe não encontrado" }, { status: 404 });
    }

    const assignment = await db.assignment.create({
      data: {
        eventId: data.eventId,
        personId: data.personId,
        roleId: data.roleId,
        shiftStart: data.shiftStart ? new Date(data.shiftStart) : null,
        shiftEnd: data.shiftEnd ? new Date(data.shiftEnd) : null,
        payRate: data.payRate || 0,
        payType: data.payType || "daily",
        status: data.status || "scheduled",
      },
      include: {
        person: true,
        role: true,
        event: true,
      },
    });

    // Se houver valor a ser pago, criar automaticamente o CostItem de staff do evento
    if (data.payRate && Number(data.payRate) > 0) {
      await db.costItem.create({
        data: {
          eventId: data.eventId,
          title: `Diária Staff: ${person.fullName} (${assignment.role.name})`,
          qty: 1,
          unitCost: data.payRate,
          totalCost: data.payRate,
          status: "planned",
        },
      });
    }

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "TEAM_ASSIGNMENT_CREATE",
      entity: "Assignment",
      entityId: assignment.id,
      payload: { person: person.fullName, role: assignment.role.name, payRate: data.payRate },
      request,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao alocar membro da equipe: " + error.message },
      { status: 500 }
    );
  }
}
