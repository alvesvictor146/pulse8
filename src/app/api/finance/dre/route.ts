import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    // 1. Filtrar eventos da organização
    const eventWhere: any = { orgId: auth.orgId };
    if (eventId) {
      eventWhere.id = eventId;
    }

    const events = await db.event.findMany({
      where: eventWhere,
      include: {
        tickets: true,
        revenues: true,
        costItems: {
          include: {
            account: true,
            supplier: true,
          },
        },
        campaigns: {
          include: {
            promoSales: true,
          },
        },
      },
    });

    if (events.length === 0 && eventId) {
      return NextResponse.json({ error: "Evento não encontrado ou sem dados" }, { status: 404 });
    }

    // 2. Totalizar Receitas
    const revenuesBySource: Record<string, number> = {
      Ingressos: 0,
      Bar: 0,
      Patrocinio: 0,
      Estacionamento: 0,
      Outros: 0,
    };

    let totalRevenue = 0;

    events.forEach((evt) => {
      // Receitas declaradas
      evt.revenues.forEach((rev) => {
        const amt = Number(rev.amount);
        totalRevenue += amt;
        const src = rev.source in revenuesBySource ? rev.source : "Outros";
        revenuesBySource[src] = (revenuesBySource[src] || 0) + amt;
      });

      // Se ingressos vendidos no modelo Ticket não foram somados em Revenue, somar em Ingressos
      const ticketSum = evt.tickets.reduce((sum, t) => sum + Number(t.price) * t.qtySold, 0);
      if (ticketSum > revenuesBySource["Ingressos"]) {
        const diff = ticketSum - revenuesBySource["Ingressos"];
        revenuesBySource["Ingressos"] += diff;
        totalRevenue += diff;
      }
    });

    // 3. Totalizar Custos
    let totalCosts = 0;
    let paidCosts = 0;
    let pendingCosts = 0;
    let plannedCosts = 0;

    const costsByCategory: Record<string, number> = {};

    events.forEach((evt) => {
      evt.costItems.forEach((cost) => {
        const amt = Number(cost.totalCost);
        totalCosts += amt;

        if (cost.status === "paid") paidCosts += amt;
        else if (cost.status === "pending" || cost.status === "approved" || cost.status === "overdue") pendingCosts += amt;
        else plannedCosts += amt;

        const cat = cost.account?.name || cost.supplier?.category || "Geral";
        costsByCategory[cat] = (costsByCategory[cat] || 0) + amt;
      });
    });

    // 4. Totalizar Comissões de Promoters
    let totalCommissions = 0;
    events.forEach((evt) => {
      evt.campaigns.forEach((camp) => {
        const rate = Number(camp.commissionValue);
        camp.promoSales.forEach((sale) => {
          const saleAmount = Number(sale.amount);
          if (camp.commissionType === "percent") {
            totalCommissions += (saleAmount * rate) / 100;
          } else {
            totalCommissions += rate * sale.qty;
          }
        });
      });
    });

    // 5. Lucro Líquido e Margem
    const totalDeductions = totalCosts + totalCommissions;
    const netProfit = totalRevenue - totalDeductions;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalCosts,
        totalCommissions,
        totalDeductions,
        netProfit,
        profitMargin: Number(profitMargin.toFixed(1)),
        paidCosts,
        pendingCosts,
        plannedCosts,
      },
      revenuesBySource,
      costsByCategory,
      eventCount: events.length,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
