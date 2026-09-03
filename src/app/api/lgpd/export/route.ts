import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

/**
 * Exporta todos os dados vinculados ao usuário autenticado (LGPD Art. 19)
 */
export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);

    if (!auth.userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
        auditLogs: {
          take: 100,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
      },
      memberships: user.memberships.map((m) => ({
        organizationName: m.organization.name,
        role: m.role,
        joinedAt: m.createdAt,
      })),
      recentActivityLogs: user.auditLogs.map((l) => ({
        action: l.action,
        entity: l.entity,
        createdAt: l.createdAt,
      })),
    };

    return NextResponse.json(exportData);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao exportar dados LGPD: " + error.message },
      { status: 500 }
    );
  }
}
