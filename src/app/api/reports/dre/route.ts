import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const where: any = { orgId: auth.orgId };
    if (eventId) {
      where.id = eventId;
    }

    const events = await db.event.findMany({
      where,
      include: {
        tickets: true,
        revenues: true,
        costItems: {
          include: {
            supplier: true,
            account: true,
          },
        },
        campaigns: {
          include: {
            promoSales: true,
          },
        },
      },
    });

    const reportData = events.map((event) => {
      const revenues = event.revenues.map((r) => ({
        id: r.id,
        source: r.source,
        amount: Number(r.amount),
        receivedAt: r.receivedAt,
        reference: r.reference,
      }));

      const totalDirectRevenues = revenues.reduce((s, r) => s + r.amount, 0);
      const ticketRevenue = event.tickets.reduce((s, t) => s + Number(t.price) * t.qtySold, 0);
      const grossRevenue = Math.max(totalDirectRevenues, ticketRevenue);

      const costs = event.costItems.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.account?.name || c.supplier?.category || "Geral",
        supplier: c.supplier?.name || "N/A",
        qty: Number(c.qty),
        unitCost: Number(c.unitCost),
        totalCost: Number(c.totalCost),
        status: c.status,
        dueDate: c.dueDate,
        paidAt: c.paidAt,
      }));

      const totalCosts = costs.reduce((s, c) => s + c.totalCost, 0);

      let totalCommissions = 0;
      event.campaigns.forEach((camp) => {
        const rate = Number(camp.commissionValue);
        camp.promoSales.forEach((sale) => {
          if (camp.commissionType === "percent") {
            totalCommissions += (Number(sale.amount) * rate) / 100;
          } else {
            totalCommissions += rate * sale.qty;
          }
        });
      });

      const netProfit = grossRevenue - (totalCosts + totalCommissions);
      const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

      return {
        eventId: event.id,
        eventName: event.name,
        grossRevenue,
        totalCosts,
        totalCommissions,
        netProfit,
        profitMargin: Number(profitMargin.toFixed(1)),
        revenues,
        costs,
      };
    });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      organizationId: auth.orgId,
      events: reportData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao gerar relatório DRE: " + error.message },
      { status: 500 }
    );
  }
}
