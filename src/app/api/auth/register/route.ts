import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { checkRateLimit, getRateLimitKey, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit: 5 registros por IP por hora
    const key = getRateLimitKey(request, "register");
    const rl = checkRateLimit(key, 5, 60 * 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const json = await request.json();
    const result = RegisterSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, orgName } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe uma conta cadastrada com este e-mail" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Cria Organização, Usuário e Membership numa transação atômica
    const created = await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName || `Produtora ${name}`,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          status: "active",
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "ADMIN",
        },
      });

      return { user, organization, membership };
    });

    await logAudit({
      orgId: created.organization.id,
      actorId: created.user.id,
      action: "AUTH_REGISTER",
      entity: "User",
      entityId: created.user.id,
      payload: { email: normalizedEmail, orgName: created.organization.name },
      request,
    });

    return NextResponse.json(
      {
        message: "Conta criada com sucesso",
        user: {
          id: created.user.id,
          name: created.user.name,
          email: created.user.email,
          organizationId: created.organization.id,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in registration:", error);
    return NextResponse.json(
      { error: "Erro ao registrar usuário: " + (error?.message || "Erro desconhecido") },
      { status: 500 }
    );
  }
}
