import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(request);
    const promoter = await db.promoter.findFirst({
      where: { id: params.id, orgId: auth.orgId },
      include: {
        person: true,
        promosales: {
          include: {
            campaign: {
              include: {
                event: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { soldAt: "desc" },
        },
      },
    });

    if (!promoter) {
      return NextResponse.json({ error: "Promoter não encontrado" }, { status: 404 });
    }

    let totalAmount = 0;
    let totalTickets = 0;
    let totalCommission = 0;

    const sales = promoter.promosales.map((sale) => {
      const amt = Number(sale.amount);
      const rate = Number(sale.campaign.commissionValue);
      const comm = sale.campaign.commissionType === "percent"
        ? (amt * rate) / 100
        : rate * sale.qty;

      totalAmount += amt;
      totalTickets += sale.qty;
      totalCommission += comm;

      return {
        id: sale.id,
        eventName: sale.campaign.event.name,
        campaignName: sale.campaign.name,
        buyerName: sale.buyerName,
        buyerEmail: sale.buyerEmail,
        qty: sale.qty,
        amount: amt,
        commission: comm,
        soldAt: sale.soldAt,
        channel: sale.channel,
      };
    });

    return NextResponse.json({
      promoter: {
        id: promoter.id,
        name: promoter.person.fullName,
        pix: promoter.person.pix,
        team: promoter.team,
      },
      summary: {
        totalAmount,
        totalTickets,
        totalCommission,
        salesCount: sales.length,
      },
      sales,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar extrato de comissões: " + error.message },
      { status: 500 }
    );
  }
}
