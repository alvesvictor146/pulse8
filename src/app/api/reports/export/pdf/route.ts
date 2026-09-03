import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthContext } from "@/lib/session";
import { handleApiError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const where: any = { orgId: auth.orgId };
    if (eventId) {
      where.id = eventId;
    }

    const event = await db.event.findFirst({
      where,
      include: {
        organization: true,
        tickets: true,
        revenues: true,
        costItems: {
          include: { supplier: true, account: true },
        },
        campaigns: {
          include: { promoSales: true },
        },
        guestLists: {
          include: { guests: true },
        },
      },
    });

    if (!event) {
      return new Response("<h1>Evento não encontrado</h1>", {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Cálculos DRE
    const totalRevenues = event.revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const ticketSum = event.tickets.reduce((sum, t) => sum + Number(t.price) * t.qtySold, 0);
    const grossRevenue = Math.max(totalRevenues, ticketSum);

    const totalCosts = event.costItems.reduce((sum, c) => sum + Number(c.totalCost), 0);

    let totalCommissions = 0;
    event.campaigns.forEach((camp) => {
      const rate = Number(camp.commissionValue);
      camp.promoSales.forEach((s) => {
        if (camp.commissionType === "percent") {
          totalCommissions += (Number(s.amount) * rate) / 100;
        } else {
          totalCommissions += rate * s.qty;
        }
      });
    });

    const netProfit = grossRevenue - (totalCosts + totalCommissions);
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Presença
    let totalIssued = 0;
    let totalCheckedIn = 0;
    event.guestLists.forEach((l) => {
      l.guests.forEach((g) => {
        totalIssued++;
        if (g.status === "checked_in") totalCheckedIn++;
      });
    });
    const noShowCount = totalIssued - totalCheckedIn;
    const attendanceRate = totalIssued > 0 ? ((totalCheckedIn / totalIssued) * 100).toFixed(1) : "0.0";

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Pulse8 — Relatório Executivo DRE (${event.name})</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #ffffff; color: #1e293b; padding: 36px; max-width: 900px; margin: auto; }
    @media print {
      body { padding: 16px; }
      .no-print { display: none !important; }
      @page { margin: 12mm; size: A4; }
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
    .logo-badge { display: inline-flex; align-items: center; gap: 8px; background: #4c6ef5; color: white; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 14px; }
    .org-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; font-weight: 700; margin-top: 6px; }
    .title { font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center; }
    .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .kpi-value { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
    .text-emerald { color: #059669 !important; }
    .text-rose { color: #e11d48 !important; }
    .text-brand { color: #4c6ef5 !important; }

    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 800; color: #0f172a; border-left: 4px solid #4c6ef5; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
    
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
    th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 8px 12px; border-bottom: 1px solid #cbd5e1; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    .footer-sign { margin-top: 48px; padding-top: 24px; border-top: 1px dashed #cbd5e1; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
    .sign-line { border-top: 1px solid #64748b; padding-top: 6px; text-align: center; font-size: 11px; color: #475569; font-weight: 600; }
    
    .btn-print { background: #4c6ef5; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer; float: right; margin-bottom: 16px; }
    .btn-print:hover { background: #3b5bdb; }
  </style>
</head>
<body>
  <div class="no-print" style="overflow: hidden; margin-bottom: 16px;">
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="logo-badge">PULSE8 · RELATÓRIO EXECUTIVO</div>
      <div class="org-title">${event.organization?.name || "Produtora Oficial"}</div>
      <h1 class="title">${event.name}</h1>
      <div class="meta">
        ${event.venue || "Local Geral"} · ${event.city || ""} - ${event.state || ""} | Gerado em: ${new Date().toLocaleString("pt-BR")}
      </div>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Faturamento Total</div>
      <div class="kpi-value text-emerald">R$ ${grossRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Custos Operacionais</div>
      <div class="kpi-value text-rose">R$ ${totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Lucro Líquido</div>
      <div class="kpi-value ${netProfit >= 0 ? "text-emerald" : "text-rose"}">R$ ${netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Margem de Lucro</div>
      <div class="kpi-value text-brand">${profitMargin.toFixed(1)}%</div>
    </div>
  </div>

  <!-- Demonstrativo DRE -->
  <div class="section">
    <div class="section-title">Demonstrativo de Resultado do Exercício (DRE)</div>
    <table>
      <thead>
        <tr>
          <th>Conta / Rubrica</th>
          <th>Classificação</th>
          <th class="text-right">Valor Consolidado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>(+) Receita Bruta de Ingressos & Bar</strong></td>
          <td>Receitas Operacionais</td>
          <td class="text-right font-mono text-emerald">R$ ${grossRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td><strong>(-) Custos Fixos e Variáveis de Produção</strong></td>
          <td>Despesas Operacionais</td>
          <td class="text-right font-mono text-rose">R$ ${totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td><strong>(-) Comissões de Promoters</strong></td>
          <td>Custo de Vendas</td>
          <td class="text-right font-mono text-rose">R$ ${totalCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr style="background: #f8fafc; font-weight: 800;">
          <td><strong>(=) RESULTADO LÍQUIDO DO EVENTO</strong></td>
          <td>Lucro Apurado</td>
          <td class="text-right font-mono ${netProfit >= 0 ? "text-emerald" : "text-rose"}">R$ ${netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Detalhamento de Custos -->
  <div class="section">
    <div class="section-title">Detalhamento dos Principais Custos</div>
    <table>
      <thead>
        <tr>
          <th>Item / Fornecedor</th>
          <th>Categoria</th>
          <th>Status</th>
          <th class="text-right">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${event.costItems.length === 0 ? `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">Nenhum custo registrado</td></tr>` : event.costItems.slice(0, 10).map((c) => `
          <tr>
            <td>${c.title} <span style="font-size: 10px; color: #64748b;">(${c.supplier?.name || "N/A"})</span></td>
            <td>${c.account?.name || c.supplier?.category || "Geral"}</td>
            <td>${c.status === "paid" ? "Pago" : "Pendente"}</td>
            <td class="text-right font-mono">R$ ${Number(c.totalCost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </div>

  <!-- Métricas de Portaria & Presença -->
  <div class="section">
    <div class="section-title">Estatísticas de Presença e Portaria</div>
    <table>
      <thead>
        <tr>
          <th>Total Ingressos Emitidos</th>
          <th>Check-in Realizado</th>
          <th>No-Show (Ausentes)</th>
          <th class="text-right">Taxa de Presença</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-mono">${totalIssued}</td>
          <td class="font-mono text-emerald">${totalCheckedIn}</td>
          <td class="font-mono text-rose">${noShowCount}</td>
          <td class="text-right font-mono font-bold">${attendanceRate}%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Signatures -->
  <div class="footer-sign">
    <div class="sign-line">
      Diretor Financeiro / Produtor Geral
    </div>
    <div class="sign-line">
      Auditoria / Responsável Pulse8
    </div>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    return new Response(`Erro ao gerar PDF: ${error.message}`, { status: 500 });
  }
}
