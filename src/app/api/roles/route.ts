import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { RoleCreateSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const roles = await db.role.findMany({
      where: { orgId: auth.orgId },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(roles);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar cargos: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = RoleCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, department, color, accessLevel } = result.data;

    const role = await db.role.create({
      data: {
        orgId: auth.orgId,
        name,
        department: department || null,
        color: color || "bg-brand-500",
        accessLevel: accessLevel || "staff",
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao criar cargo: " + error.message },
      { status: 500 }
    );
  }
}
