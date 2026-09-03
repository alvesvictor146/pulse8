import { describe, it, expect } from "vitest";
import Papa from "papaparse";

describe("Parser de Vendas Sympla RFC 4180 (EP-13 & Skill pulse8-sympla-parser)", () => {
  it("deve processar corretamente linhas CSV com campos contendo vírgulas entre aspas", () => {
    const csvData = `Número do Pedido,Nome Comprador,Email Comprador,Nome Participante,Email Participante,Ingresso,Preço (R$),Status
"PED-1001","Silva, João","joao@email.com","Silva, João","joao@email.com","1º Lote Geral","R$ 150,00","Aprovado"
"PED-1002","Oliveira, Maria","maria@email.com","Oliveira, Maria","maria@email.com","VIP Frontstage","R$ 300,50","Aprovado"
"PED-1003","Santos, Pedro","pedro@email.com","Santos, Pedro","pedro@email.com","1º Lote Geral","R$ 150,00","Cancelado"`;

    const parsed = Papa.parse<Record<string, string>>(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    expect(parsed.data.length).toBe(3);

    // Filtragem e mapeamento
    const approvedSales = parsed.data
      .filter((row) => !row["Status"].toLowerCase().includes("cancel"))
      .map((row) => {
        const rawPrice = (row["Preço (R$)"] || "0")
          .replace("R$", "")
          .replace(/\./g, "")
          .replace(",", ".")
          .trim();

        return {
          orderNumber: row["Número do Pedido"],
          buyerName: row["Nome Comprador"],
          guestName: row["Nome Participante"],
          ticketCategory: row["Ingresso"],
          pricePaid: parseFloat(rawPrice),
          isVip: row["Ingresso"].toUpperCase().includes("VIP"),
        };
      });

    expect(approvedSales.length).toBe(2);
    expect(approvedSales[0].buyerName).toBe("Silva, João");
    expect(approvedSales[0].pricePaid).toBe(150.0);
    expect(approvedSales[0].isVip).toBe(false);

    expect(approvedSales[1].buyerName).toBe("Oliveira, Maria");
    expect(approvedSales[1].pricePaid).toBe(300.5);
    expect(approvedSales[1].isVip).toBe(true);

    const totalRevenue = approvedSales.reduce((sum, s) => sum + s.pricePaid, 0);
    expect(totalRevenue).toBe(450.5);
  });
});
