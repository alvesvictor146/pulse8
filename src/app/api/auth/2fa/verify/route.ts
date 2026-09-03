import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { verifyTotpCode } from "@/lib/totp";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const body = await request.json();
    const { token, secret } = body;

    if (!token || !secret) {
      return NextResponse.json(
        { error: "Código TOTP (6 dígitos) e secret são obrigatórios" },
        { status: 400 }
      );
    }

    const isValid = verifyTotpCode(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: "Código de verificação 2FA inválido ou expirado" },
        { status: 400 }
      );
    }

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "AUTH_2FA_VERIFIED",
      entity: "User",
      entityId: auth.userId,
      request,
    });

    return NextResponse.json({
      success: true,
      message: "Autenticação em duas etapas (2FA) verificada com sucesso!",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
