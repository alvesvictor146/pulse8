import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { SupplierCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Prisma.SupplierWhereInput = {
      orgId: auth.orgId,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.name = { contains: search };
    }

    const suppliers = await db.supplier.findMany({
      where,
      include: {
        costItems: {
          select: {
            id: true,
            title: true,
            totalCost: true,
            status: true,
          },
        },
        _count: {
          select: { costItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = SupplierCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    const supplier = await db.supplier.create({
      data: {
        orgId: auth.orgId,
        name: data.name,
        cnpjCpf: data.cnpjCpf || null,
        contact: data.contact || null,
        email: data.email || null,
        phone: data.phone || null,
        pix: data.pix || null,
        category: data.category || "Geral",
        rating: data.rating || 5.0,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "SUPPLIER_CREATE",
      entity: "Supplier",
      entityId: supplier.id,
      payload: { name: supplier.name, category: supplier.category },
      request,
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
