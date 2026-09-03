import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { PromoterCreateSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: Prisma.PromoterWhereInput = {
      orgId: auth.orgId,
    };

    if (search) {
      where.person = {
        fullName: { contains: search },
      };
    }

    const promoters = await db.promoter.findMany({
      where,
      include: {
        person: { select: { id: true, fullName: true, email: true, phone: true, pix: true } },
        promoLinks: {
          include: {
            campaign: { select: { name: true, commissionType: true, commissionValue: true } },
          },
        },
        promosales: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promoters);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = PromoterCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, phone, pix, team, level } = result.data;

    const person = await db.people.create({
      data: {
        orgId: auth.orgId,
        fullName,
        email: email || null,
        phone: phone || null,
        pix: pix || null,
      },
    });

    const promoter = await db.promoter.create({
      data: {
        orgId: auth.orgId,
        personId: person.id,
        team: team || "Equipe Alpha",
        level: level || "junior",
      },
      include: {
        person: true,
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "PROMOTER_CREATE",
      entity: "Promoter",
      entityId: promoter.id,
      payload: { name: fullName, team: promoter.team },
      request,
    });

    return NextResponse.json(promoter, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
