import { describe, it, expect } from "vitest";
import {
  EventCreateSchema,
  CostItemCreateSchema,
  RevenueCreateSchema,
  GuestCreateSchema,
  CheckinScanSchema,
  SupplierCreateSchema,
} from "./index";

describe("Esquemas Zod de Validação de Domínio", () => {
  describe("EventCreateSchema", () => {
    it("deve validar payload completo de evento com sucesso", () => {
      const payload = {
        name: "Festival Pulse 2026",
        theme: "Eletrônica & House",
        venue: "Arena Festival",
        city: "São Paulo",
        state: "SP",
        capacity: 5000,
        status: "planning",
      };
      const result = EventCreateSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar evento sem nome", () => {
      const result = EventCreateSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("CostItemCreateSchema", () => {
    it("deve validar custo com cálculo de totalCost", () => {
      const payload = {
        eventId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        title: "Locação de Gerador 250kVA",
        qty: 2,
        unitCost: 3500,
        status: "planned",
      };
      const result = CostItemCreateSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar custo sem eventId UUID válido", () => {
      const result = CostItemCreateSchema.safeParse({
        eventId: "id-invalido",
        title: "Segurança",
        qty: 1,
        unitCost: 100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("CheckinScanSchema", () => {
    it("deve aceitar payload de scan de QR code", () => {
      const result = CheckinScanSchema.safeParse({
        qrCode: "P8:guest-1:evt-1:1700000000:abcd1234abcd1234",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar QR code vazio", () => {
      const result = CheckinScanSchema.safeParse({ qrCode: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("SupplierCreateSchema", () => {
    it("deve aceitar fornecedor com CNPJ válido", () => {
      const result = SupplierCreateSchema.safeParse({
        name: "Stage Sound & Light",
        cnpjCpf: "00000000000191",
        category: "Som & Iluminação",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar fornecedor com CNPJ inválido", () => {
      const result = SupplierCreateSchema.safeParse({
        name: "Stage Sound & Light",
        cnpjCpf: "12345678901234",
      });
      expect(result.success).toBe(false);
    });
  });
});
