import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { PromoLinkCreateSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const json = await request.json();
    const result = PromoLinkCreateSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { campaignId, promoterId, code, url, utmSource, utmMedium } = result.data;

    // Validar promoter
    const promoter = await db.promoter.findFirst({
      where: { id: promoterId, orgId: auth.orgId },
    });

    if (!promoter) {
      return NextResponse.json({ error: "Promoter não encontrado" }, { status: 404 });
    }

    // Verificar se o código já existe
    const existingCode = await db.promoLink.findUnique({
      where: { code },
    });

    if (existingCode) {
      return NextResponse.json({ error: "Este código de link já está em uso" }, { status: 409 });
    }

    const promoLink = await db.promoLink.create({
      data: {
        campaignId,
        promoterId,
        code: code.toUpperCase().trim(),
        url,
        utmSource: utmSource || "promoter",
        utmMedium: utmMedium || code.toLowerCase().trim(),
      },
      include: {
        campaign: true,
        promoter: { include: { person: true } },
      },
    });

    return NextResponse.json(promoLink, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao gerar link de promoter: " + error.message },
      { status: 500 }
    );
  }
}
