import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const events = await db.event.findMany({
      where: {
        orgId: auth.orgId,
        ...(eventId ? { id: eventId } : {}),
      },
      include: {
        guestLists: {
          include: {
            guests: {
              select: {
                id: true,
                fullName: true,
                status: true,
                checkedInAt: true,
              },
            },
          },
        },
      },
    });

    const report = events.map((event) => {
      let totalIssued = 0;
      let totalCheckedIn = 0;

      event.guestLists.forEach((list) => {
        list.guests.forEach((guest) => {
          totalIssued++;
          if (guest.status === "checked_in") {
            totalCheckedIn++;
          }
        });
      });

      const noShowCount = totalIssued - totalCheckedIn;
      const noShowRate = totalIssued > 0 ? (noShowCount / totalIssued) * 100 : 0;
      const attendanceRate = totalIssued > 0 ? (totalCheckedIn / totalIssued) * 100 : 0;

      return {
        eventId: event.id,
        eventName: event.name,
        totalIssued,
        totalCheckedIn,
        noShowCount,
        noShowRate: Number(noShowRate.toFixed(1)),
        attendanceRate: Number(attendanceRate.toFixed(1)),
      };
    });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao calcular relatório de no-show: " + error.message },
      { status: 500 }
    );
  }
}
