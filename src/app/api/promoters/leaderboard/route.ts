import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const promoters = await db.promoter.findMany({
      where: { orgId: auth.orgId },
      include: {
        person: { select: { fullName: true, email: true, pix: true } },
        promosales: {
          where: eventId
            ? { campaign: { eventId } }
            : undefined,
          include: {
            campaign: { select: { commissionType: true, commissionValue: true } },
          },
        },
      },
    });

    const leaderboard = promoters.map((p) => {
      const totalTickets = p.promosales.reduce((sum, s) => sum + s.qty, 0);
      const totalRevenue = p.promosales.reduce((sum, s) => sum + Number(s.amount), 0);

      let totalCommission = 0;
      p.promosales.forEach((s) => {
        const rate = Number(s.campaign?.commissionValue || 0);
        if (s.campaign?.commissionType === "percent") {
          totalCommission += (Number(s.amount) * rate) / 100;
        } else {
          totalCommission += rate * s.qty;
        }
      });

      return {
        id: p.id,
        name: p.person.fullName,
        email: p.person.email,
        team: p.team || "Equipe Alpha",
        level: p.level || "junior",
        totalTickets,
        totalRevenue,
        totalCommission,
        salesCount: p.promosales.length,
      };
    });

    // Ordenar pelo faturamento total gerado
    leaderboard.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return NextResponse.json(leaderboard);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao gerar leaderboard de promoters: " + error.message },
      { status: 500 }
    );
  }
}
