import { describe, it, expect } from "vitest";

interface CalculateDreInput {
  revenues: Array<{ source: string; amount: number }>;
  costItems: Array<{ title: string; qty: number; unitCost: number; status: string }>;
  promoterSales: Array<{
    amount: number;
    qty: number;
    commissionType: "percent" | "fixed";
    commissionValue: number;
  }>;
}

function calculateDRE(input: CalculateDreInput) {
  const totalRevenue = input.revenues.reduce((sum, r) => sum + r.amount, 0);

  const totalCosts = input.costItems.reduce((sum, c) => sum + c.qty * c.unitCost, 0);

  let totalCommissions = 0;
  input.promoterSales.forEach((s) => {
    if (s.commissionType === "percent") {
      totalCommissions += (s.amount * s.commissionValue) / 100;
    } else {
      totalCommissions += s.commissionValue * s.qty;
    }
  });

  const totalDeductions = totalCosts + totalCommissions;
  const netProfit = totalRevenue - totalDeductions;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCosts,
    totalCommissions,
    totalDeductions,
    netProfit,
    profitMargin: Number(profitMargin.toFixed(1)),
  };
}

describe("Cálculo Matemático de DRE & Margens (EP-04 & Skill pulse8-domain-model)", () => {
  it("deve calcular corretamente o Lucro Líquido e Margem percentual", () => {
    const dre = calculateDRE({
      revenues: [
        { source: "Ingressos", amount: 100000 },
        { source: "Bar", amount: 30000 },
        { source: "Patrocinio", amount: 20000 },
      ], // Total Receita: 150.000
      costItems: [
        { title: "Locação do Espaço", qty: 1, unitCost: 35000, status: "paid" },
        { title: "Som & Palco", qty: 1, unitCost: 25000, status: "paid" },
        { title: "Diárias Segurança", qty: 20, unitCost: 250, status: "pending" }, // 5.000
      ], // Total Custos: 65.000
      promoterSales: [
        { amount: 50000, qty: 500, commissionType: "percent", commissionValue: 10 }, // 5.000
        { amount: 10000, qty: 100, commissionType: "fixed", commissionValue: 15 }, // 1.500
      ], // Total Comissões: 6.500
    });

    expect(dre.totalRevenue).toBe(150000);
    expect(dre.totalCosts).toBe(65000);
    expect(dre.totalCommissions).toBe(6500);
    expect(dre.totalDeductions).toBe(71500);
    expect(dre.netProfit).toBe(78500);
    expect(dre.profitMargin).toBe(52.3);
  });

  it("deve calcular margem negativa e prejuízo quando deduções superam receitas", () => {
    const dre = calculateDRE({
      revenues: [{ source: "Ingressos", amount: 20000 }],
      costItems: [{ title: "Estrutura", qty: 1, unitCost: 30000, status: "planned" }],
      promoterSales: [],
    });

    expect(dre.netProfit).toBe(-10000);
    expect(dre.profitMargin).toBe(-50.0);
  });
});
