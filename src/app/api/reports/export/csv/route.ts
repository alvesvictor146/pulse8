import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "guests"; // guests | costs | revenues
    const eventId = searchParams.get("eventId");

    let csvContent = "";
    let filename = `pulse8_${type}_export.csv`;

    if (type === "guests") {
      filename = "pulse8_convidados.csv";
      const guests = await db.guest.findMany({
        where: {
          guestList: {
            event: {
              orgId: auth.orgId,
              ...(eventId ? { id: eventId } : {}),
            },
          },
        },
        include: {
          guestList: {
            include: { event: { select: { name: true } } },
          },
        },
      });

      const headers = ["ID", "Evento", "Lista", "Nome Completo", "Email", "Telefone", "Status", "Checkin Em"];
      const rows = guests.map((g) => [
        `"${g.id}"`,
        `"${g.guestList.event.name.replace(/"/g, '""')}"`,
        `"${g.guestList.name.replace(/"/g, '""')}"`,
        `"${g.fullName.replace(/"/g, '""')}"`,
        `"${g.email || ""}"`,
        `"${g.phone || ""}"`,
        `"${g.status}"`,
        `"${g.checkedInAt ? new Date(g.checkedInAt).toLocaleString("pt-BR") : ""}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    } else if (type === "costs") {
      filename = "pulse8_custos_dre.csv";
      const costs = await db.costItem.findMany({
        where: {
          event: {
            orgId: auth.orgId,
            ...(eventId ? { id: eventId } : {}),
          },
        },
        include: {
          event: { select: { name: true } },
          supplier: { select: { name: true, category: true } },
        },
      });

      const headers = ["ID", "Evento", "Titulo", "Fornecedor", "Categoria", "Qtd", "Custo Unitario", "Custo Total", "Status", "Vencimento", "Data Pagamento"];
      const rows = costs.map((c) => [
        `"${c.id}"`,
        `"${c.event.name.replace(/"/g, '""')}"`,
        `"${c.title.replace(/"/g, '""')}"`,
        `"${(c.supplier?.name || "").replace(/"/g, '""')}"`,
        `"${(c.supplier?.category || "").replace(/"/g, '""')}"`,
        `"${c.qty}"`,
        `"${c.unitCost}"`,
        `"${c.totalCost}"`,
        `"${c.status}"`,
        `"${c.dueDate ? new Date(c.dueDate).toLocaleDateString("pt-BR") : ""}"`,
        `"${c.paidAt ? new Date(c.paidAt).toLocaleDateString("pt-BR") : ""}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao exportar CSV: " + error.message },
      { status: 500 }
    );
  }
}
