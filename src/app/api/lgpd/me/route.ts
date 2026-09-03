import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { logAudit } from "@/lib/audit";

/**
 * Anonimiza os dados do usuário autenticado (LGPD Art. 18)
 */
export async function DELETE(request: Request) {
  try {
    const auth = await getAuthContext(request);

    if (!auth.userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const anonymizedEmail = `anon-${Date.now()}@pulse8-anonymized.local`;
    const anonymizedName = "Usuário Anonimizado";

    const user = await db.user.update({
      where: { id: auth.userId },
      data: {
        name: anonymizedName,
        email: anonymizedEmail,
        phone: null,
        avatarUrl: null,
        status: "anonymized",
      },
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "LGPD_ANONYMIZE_USER",
      entity: "User",
      entityId: user.id,
      payload: { anonymizedAt: new Date() },
      request,
    });

    return NextResponse.json({
      success: true,
      message: "Dados pessoais anonimizados em conformidade com a LGPD.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao processar anonimização de dados: " + error.message },
      { status: 500 }
    );
  }
}
