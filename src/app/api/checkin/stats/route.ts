import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const where: any = {
      guestList: {
        event: {
          orgId: auth.orgId,
          ...(eventId ? { id: eventId } : {}),
        },
      },
    };

    const guests = await db.guest.findMany({
      where,
      select: {
        id: true,
        status: true,
        checkedInAt: true,
        guestList: {
          select: { name: true, type: true },
        },
      },
    });

    const totalIssued = guests.length;
    const checkedInCount = guests.filter((g) => g.status === "checked_in").length;
    const pendingCount = totalIssued - checkedInCount;
    const checkinRate = totalIssued > 0 ? (checkedInCount / totalIssued) * 100 : 0;

    // Checkins por lista
    const listBreakdown: Record<string, { total: number; checkedIn: number }> = {};
    guests.forEach((g) => {
      const listName = g.guestList.name || "Geral";
      if (!listBreakdown[listName]) {
        listBreakdown[listName] = { total: 0, checkedIn: 0 };
      }
      listBreakdown[listName].total += 1;
      if (g.status === "checked_in") {
        listBreakdown[listName].checkedIn += 1;
      }
    });

    return NextResponse.json({
      totalIssued,
      checkedInCount,
      pendingCount,
      checkinRate: Number(checkinRate.toFixed(1)),
      listBreakdown,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas de check-in: " + error.message },
      { status: 500 }
    );
  }
}
