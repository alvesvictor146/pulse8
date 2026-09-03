import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { generateBase32Secret, generateOtpAuthUrl } from "@/lib/totp";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);

    // Gerar novo secret Base32 para o usuário
    const secret = generateBase32Secret();
    const otpauthUrl = generateOtpAuthUrl(auth.user.email || auth.userId, secret);

    return NextResponse.json({
      secret,
      otpauthUrl,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`,
      message: "Escaneie o QR Code no seu aplicativo autenticador (Google Authenticator / Authy)",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
