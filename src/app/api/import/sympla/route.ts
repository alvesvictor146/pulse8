import { NextResponse } from "next/server";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";
import { generateSignedQrCode } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let eventId = formData.get("eventId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo CSV enviado" }, { status: 400 });
    }

    // 1. Validar e associar ao evento da organização
    let event;
    if (eventId) {
      event = await db.event.findFirst({
        where: { id: eventId, orgId: auth.orgId },
      });
      if (!event) {
        return NextResponse.json({ error: "Evento não encontrado ou não pertence à organização" }, { status: 404 });
      }
    } else {
      event = await db.event.findFirst({
        where: { orgId: auth.orgId },
      });
      if (!event) {
        event = await db.event.create({
          data: {
            orgId: auth.orgId,
            name: "Evento Sympla Import",
          },
        });
      }
      eventId = event.id;
    }

    // 2. Parser RFC 4180 robusto com Papaparse
    const text = await file.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json(
        { error: "Erro ao processar CSV: " + parsed.errors[0]?.message },
        { status: 400 }
      );
    }

    const rows = parsed.data;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Arquivo CSV sem linhas de dados" }, { status: 400 });
    }

    // 3. Normalização de colunas Sympla conforme skill pulse8-sympla-parser
    const validSales: Array<{
      orderNumber: string;
      buyerName: string;
      buyerEmail: string;
      guestName: string;
      guestEmail: string;
      ticketCategory: string;
      pricePaid: number;
      ticketStatus: string;
    }> = [];

    for (const row of rows) {
      const orderNumber = row["Número do Pedido"] || row["Pedido"] || row["orderNumber"] || `SYM-${Date.now()}`;
      const buyerName = row["Nome Comprador"] || row["Comprador"] || row["buyerName"] || row["Nome"] || "Comprador Sympla";
      const buyerEmail = row["Email Comprador"] || row["E-mail Comprador"] || row["buyerEmail"] || row["Email"] || "";
      const guestName = row["Nome Participante"] || row["Participante"] || row["guestName"] || buyerName;
      const guestEmail = row["Email Participante"] || row["E-mail Participante"] || row["guestEmail"] || buyerEmail;
      const ticketCategory = row["Ingresso"] || row["Tipo de Ingresso"] || row["ticketCategory"] || "Geral";
      
      const priceRaw = (row["Preço (R$)"] || row["Preço"] || row["Valor"] || row["pricePaid"] || "0")
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim();
      const pricePaid = parseFloat(priceRaw) || 0;

      const ticketStatus = row["Status"] || row["ticketStatus"] || "Aprovado";

      // Ignora cancelados
      if (ticketStatus.toLowerCase().includes("cancel")) {
        continue;
      }

      validSales.push({
        orderNumber,
        buyerName,
        buyerEmail,
        guestName,
        guestEmail,
        ticketCategory,
        pricePaid,
        ticketStatus,
      });
    }

    if (validSales.length === 0) {
      return NextResponse.json({ error: "Nenhuma venda válida ou aprovada encontrada no arquivo" }, { status: 400 });
    }

    const totalRevenue = validSales.reduce((acc, s) => acc + s.pricePaid, 0);

    // 4. Persistência atômica no banco via db.$transaction
    await db.$transaction(async (tx) => {
      // Registrar Receita Global da Importação
      await tx.revenue.create({
        data: {
          eventId,
          source: "Sympla",
          amount: totalRevenue,
          receivedAt: new Date(),
          reference: `Importação Sympla (${validSales.length} ingressos) - ${new Date().toLocaleDateString("pt-BR")}`,
        },
      });

      // Garantir existência da lista de convidados para o Sympla
      let symplaList = await tx.guestList.findFirst({
        where: { eventId, name: "Sympla Ingressos" },
      });

      if (!symplaList) {
        symplaList = await tx.guestList.create({
          data: {
            eventId,
            name: "Sympla Ingressos",
            type: "Geral",
          },
        });
      }

      // Inserir cada participante como Guest com QR Code assinado
      for (const sale of validSales) {
        const guestId = randomUUID();
        const qrCode = generateSignedQrCode(guestId, eventId);

        await tx.guest.create({
          data: {
            id: guestId,
            guestlistId: symplaList.id,
            fullName: sale.guestName,
            email: sale.guestEmail || null,
            phone: null,
            source: "sympla_import",
            qrCode,
            status: "issued",
            notes: `Pedido: ${sale.orderNumber} | Lote: ${sale.ticketCategory} | R$ ${sale.pricePaid.toFixed(2)}`,
          },
        });
      }
    });

    await logAudit({
      orgId: auth.orgId,
      actorId: auth.userId,
      action: "SYMPLA_IMPORT_SUCCESS",
      entity: "Revenue",
      entityId: eventId,
      payload: {
        importedCount: validSales.length,
        totalRevenue,
      },
      request,
    });

    return NextResponse.json({
      success: true,
      importedCount: validSales.length,
      totalRevenue,
      message: `${validSales.length} ingressos importados e persistidos com sucesso! Faturamento: R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
