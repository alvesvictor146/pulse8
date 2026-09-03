import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSignedQrCode } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";
import { verifySymplaWebhookSignature } from "@/lib/sympla-webhook";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-sympla-signature") || request.headers.get("x-signature");

    // 1. Validação de Assinatura Criptográfica
    if (!verifySymplaWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Assinatura do webhook inválida (X-Sympla-Signature)" },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Payload JSON inválido" }, { status: 400 });
    }

    const eventType = payload.event || payload.type || "order.approved";
    const data = payload.data || payload;

    // 2. Extração de informações do pedido
    const orderId = data.order_id || data.id || `SYM-${Date.now()}`;
    const buyerName = data.buyer?.name || data.buyer_name || data.client_name || "Comprador Sympla";
    const buyerEmail = data.buyer?.email || data.buyer_email || data.client_email || "";
    const totalAmount = parseFloat(data.total_amount || data.price || data.amount || "0") || 0;
    const symplaEventId = String(data.event_id || "");
    const promoCode = data.affiliate_code || data.utm_source || data.promoter_code || null;

    // 3. Localizar evento associado no Pulse8
    let event = await db.event.findFirst({
      where: {
        OR: [
          ...(symplaEventId ? [{ description: { contains: symplaEventId } }] : []),
          { status: "in_sales" },
        ],
      },
    });

    if (!event) {
      event = await db.event.findFirst();
    }

    if (!event) {
      return NextResponse.json({ error: "Nenhum evento ativo encontrado para associação" }, { status: 404 });
    }

    // 4. Tratar Cancelamentos / Estornos
    if (eventType === "order.refunded" || eventType === "order.cancelled") {
      // Bloquear ingressos gerados para este pedido
      await db.guest.updateMany({
        where: {
          notes: { contains: orderId },
        },
        data: {
          status: "blocked",
        },
      });

      await logAudit({
        orgId: event.orgId,
        action: "SYMPLA_WEBHOOK_ORDER_CANCELLED",
        entity: "Revenue",
        entityId: event.id,
        payload: { orderId, buyerName, totalAmount },
        request,
      });

      return NextResponse.json({
        success: true,
        message: `Pedido ${orderId} cancelado e ingressos bloqueados com sucesso.`,
      });
    }

    // 5. Tratar Aprovação de Venda (order.approved) em Transação Atômica
    const result = await db.$transaction(async (tx) => {
      // Registrar Receita
      const revenue = await tx.revenue.create({
        data: {
          eventId: event!.id,
          source: "Sympla",
          amount: totalAmount,
          receivedAt: new Date(),
          reference: `Webhook Sympla (Pedido #${orderId})`,
        },
      });

      // Garantir GuestList
      let symplaList = await tx.guestList.findFirst({
        where: { eventId: event!.id, name: "Sympla Ingressos" },
      });

      if (!symplaList) {
        symplaList = await tx.guestList.create({
          data: {
            eventId: event!.id,
            name: "Sympla Ingressos",
            type: "Geral",
          },
        });
      }

      // Criar participantes / ingressos
      const attendees = Array.isArray(data.attendees) && data.attendees.length > 0
        ? data.attendees
        : [{ name: buyerName, email: buyerEmail, ticket_name: data.ticket_name || "Ingresso Geral" }];

      const createdGuests = [];
      for (const att of attendees) {
        const guestId = randomUUID();
        const qrCode = generateSignedQrCode(guestId, event!.id);

        const guest = await tx.guest.create({
          data: {
            id: guestId,
            guestlistId: symplaList.id,
            fullName: att.name || buyerName,
            email: att.email || buyerEmail || null,
            source: "sympla_webhook",
            qrCode,
            status: "issued",
            notes: `Pedido #${orderId} | Ingresso: ${att.ticket_name || "Geral"} | R$ ${totalAmount.toFixed(2)}`,
          },
        });
        createdGuests.push(guest);
      }

      // Atribuir comissão de promoter se código UTM estiver presente
      if (promoCode) {
        const promoLink = await tx.promoLink.findFirst({
          where: { code: promoCode.toUpperCase().trim() },
          include: { campaign: true },
        });

        if (promoLink) {
          await tx.promoSale.create({
            data: {
              campaignId: promoLink.campaignId,
              promoterId: promoLink.promoterId,
              code: promoLink.code,
              buyerName,
              buyerEmail,
              qty: attendees.length,
              amount: totalAmount,
              channel: "sympla",
              ticketingTxId: orderId,
            },
          });
        }
      }

      return { revenue, guestsCount: createdGuests.length };
    });

    await logAudit({
      orgId: event.orgId,
      action: "SYMPLA_WEBHOOK_ORDER_APPROVED",
      entity: "Revenue",
      entityId: event.id,
      payload: {
        orderId,
        buyerName,
        totalAmount,
        guestsCount: result.guestsCount,
        promoCode,
      },
      request,
    });

    return NextResponse.json({
      success: true,
      message: `Webhook Sympla processado com sucesso! ${result.guestsCount} ingresso(s) emitido(s).`,
      orderId,
      totalAmount,
    });
  } catch (error: any) {
    console.error("Error processing Sympla webhook:", error);
    return NextResponse.json(
      { error: "Erro interno no processamento do webhook: " + error.message },
      { status: 500 }
    );
  }
}
