import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const orgId = auth.orgId;

    // 1. Eventos da organização
    const events = await db.event.findMany({
      where: { orgId },
      include: {
        tickets: true,
        revenues: true,
        costItems: true,
        _count: {
          select: {
            guestLists: true,
            assignments: true,
          },
        },
      },
      orderBy: { startAt: "asc" },
    });

    const activeEventsCount = events.filter((e) => e.status !== "closed" && e.status !== "draft").length;
    const totalEventsCount = events.length;

    // 2. Receitas e Custos
    let totalRevenue = 0;
    let totalCosts = 0;
    let totalTicketsSold = 0;
    let totalCapacity = 0;

    for (const evt of events) {
      totalCapacity += evt.capacity;
      for (const t of evt.tickets) {
        totalTicketsSold += t.qtySold;
      }
      for (const r of evt.revenues) {
        totalRevenue += Number(r.amount);
      }
      for (const c of evt.costItems) {
        totalCosts += Number(c.totalCost);
      }
    }

    // Se houver vendas diretas registradas em tickets mas sem Revenue model criado ainda, somar
    const ticketRevenue = events.reduce((sum, evt) => {
      return sum + evt.tickets.reduce((tSum, t) => tSum + Number(t.price) * t.qtySold, 0);
    }, 0);

    const consolidatedRevenue = Math.max(totalRevenue, ticketRevenue);
    const netProfit = consolidatedRevenue - totalCosts;
    const profitMargin = consolidatedRevenue > 0 ? (netProfit / consolidatedRevenue) * 100 : 0;

    // 3. Próximos eventos (máx 5)
    const recentEvents = events.slice(0, 5).map((e) => ({
      id: e.id,
      name: e.name,
      theme: e.theme,
      venue: e.venue,
      city: e.city,
      state: e.state,
      startAt: e.startAt,
      status: e.status,
      capacity: e.capacity,
      soldCount: e.tickets.reduce((acc, t) => acc + t.qtySold, 0),
    }));

    return NextResponse.json({
      metrics: {
        totalRevenue: consolidatedRevenue,
        totalCosts,
        netProfit,
        profitMargin: Number(profitMargin.toFixed(1)),
        totalTicketsSold,
        totalCapacity,
        activeEventsCount,
        totalEventsCount,
      },
      recentEvents,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
