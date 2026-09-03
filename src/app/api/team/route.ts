import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { PersonCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: Prisma.PeopleWhereInput = {
      orgId: auth.orgId,
    };

    if (search) {
      where.fullName = { contains: search };
    }

    const people = await db.people.findMany({
      where,
      include: {
        assignments: {
          include: {
            event: { select: { id: true, name: true } },
            role: { select: { id: true, name: true, department: true, color: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(people);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = PersonCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const newPerson = await db.people.create({
      data: {
        orgId: auth.orgId,
        fullName: data.fullName,
        doc: data.doc || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        pix: data.pix || null,
        notes: data.notes || null,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "TEAM_PERSON_CREATE",
      entity: "People",
      entityId: newPerson.id,
      payload: { fullName: newPerson.fullName },
      request,
    });

    return NextResponse.json(newPerson, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
