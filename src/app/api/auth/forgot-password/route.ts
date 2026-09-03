import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from "@/lib/rate-limit";
import { createHmac } from "crypto";

/**
 * Gera um token de reset de senha simples (HMAC-SHA256 com expiração).
 * Não requer dependência externa — usa apenas o QR_SECRET existente.
 *
 * Formato: base64url(userId:timestamp:hmac)
 */
function generateResetToken(userId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${userId}:${timestamp}`;
  const signature = createHmac("sha256", process.env.NEXTAUTH_SECRET!)
    .update(payload)
    .digest("hex")
    .slice(0, 32);

  const data = `${payload}:${signature}`;
  return Buffer.from(data).toString("base64url");
}

function decodeResetToken(token: string): {
  valid: boolean;
  userId?: string;
  reason?: string;
} {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return { valid: false, reason: "Formato inválido" };

    const [userId, timestampStr, signature] = parts;
    const payload = `${userId}:${timestampStr}`;

    // Verificar assinatura
    const expectedSig = createHmac("sha256", process.env.NEXTAUTH_SECRET!)
      .update(payload)
      .digest("hex")
      .slice(0, 32);

    if (signature !== expectedSig) {
      return { valid: false, reason: "Token inválido ou adulterado" };
    }

    // Verificar expiração (15 minutos)
    const timestamp = parseInt(timestampStr, 10);
    const age = Date.now() - timestamp;
    if (age > 15 * 60 * 1000) {
      return { valid: false, reason: "Token expirado (válido por 15 minutos)" };
    }

    return { valid: true, userId };
  } catch {
    return { valid: false, reason: "Token inválido" };
  }
}

/**
 * POST /api/auth/forgot-password
 * Envia link de recuperação de senha por e-mail.
 */
export async function POST(request: Request) {
  try {
    // Rate limit: 3 tentativas por IP a cada 15 minutos
    const key = getRateLimitKey(request, "forgot-password");
    const rl = checkRateLimit(key, 3, 15 * 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const body = await request.json();
    const email = body?.email?.toLowerCase?.().trim();

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
    }

    // Buscar usuário — resposta sempre 200 para não vazar se o e-mail existe
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      const token = generateResetToken(user.id);
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL || "Pulse8 <noreply@pulse8.app>",
              to: [user.email],
              subject: "Recuperar senha — Pulse8",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2 style="color: #4c6ef5;">Recuperação de Senha</h2>
                  <p>Olá, <strong>${user.name || "usuário"}</strong>!</p>
                  <p>Recebemos uma solicitação para redefinir a senha da sua conta Pulse8.</p>
                  <p>
                    <a href="${resetUrl}"
                       style="display: inline-block; background: #4c6ef5; color: white;
                              padding: 12px 24px; border-radius: 8px; text-decoration: none;
                              font-weight: bold;">
                      Redefinir Minha Senha
                    </a>
                  </p>
                  <p style="color: #666; font-size: 13px;">
                    Este link expira em <strong>15 minutos</strong>.
                    Se você não solicitou, ignore este e-mail.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="color: #999; font-size: 12px;">Pulse8 — Gestão de Eventos</p>
                </div>
              `,
            }),
          });
        } catch (emailErr) {
          console.error("[forgot-password] Erro ao enviar e-mail:", emailErr);
          // Não expõe o erro ao cliente
        }
      } else {
        // Desenvolvimento: logar o link no console
        console.log(`[forgot-password] RESEND_API_KEY não configurado.`);
        console.log(`[forgot-password] Link de reset: ${resetUrl}`);
      }
    }

    // Sempre retornar 200 para não vazar se o e-mail existe no sistema
    return NextResponse.json({
      message: "Se este e-mail estiver cadastrado, você receberá um link de recuperação em breve.",
    });
  } catch (error) {
    console.error("[forgot-password] Erro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

/**
 * POST /api/auth/reset-password
 * Verifica o token e atualiza a senha do usuário.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const decoded = decodeResetToken(token);
    if (!decoded.valid || !decoded.userId) {
      return NextResponse.json(
        { error: decoded.reason || "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Importar bcrypt dinamicamente para evitar dependência em edge runtime
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: decoded.userId },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Senha redefinida com sucesso. Faça login com sua nova senha." });
  } catch (error) {
    console.error("[reset-password] Erro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
