import { describe, it, expect } from "vitest";
import { isValidCPF, isValidCNPJ, isValidCpfOrCnpj } from "./cpf-cnpj";

describe("Algoritmo de Validação de CPF e CNPJ (EP-08)", () => {
  describe("Validação de CPF", () => {
    it("deve aceitar CPFs válidos conhecidos", () => {
      // CPFs válidos de teste com dígitos verificadores matematicamente corretos
      expect(isValidCPF("52998224725")).toBe(true);
      expect(isValidCPF("529.982.247-25")).toBe(true);
      expect(isValidCPF("11144477735")).toBe(true);
    });

    it("deve rejeitar CPFs com dígitos repetidos", () => {
      expect(isValidCPF("00000000000")).toBe(false);
      expect(isValidCPF("11111111111")).toBe(false);
      expect(isValidCPF("99999999999")).toBe(false);
    });

    it("deve rejeitar CPFs com tamanho incorreto ou caracteres inválidos", () => {
      expect(isValidCPF("123456789")).toBe(false);
      expect(isValidCPF("123456789012")).toBe(false);
      expect(isValidCPF("abc")).toBe(false);
    });

    it("deve rejeitar CPF com dígito verificador incorreto", () => {
      expect(isValidCPF("52998224729")).toBe(false);
    });
  });

  describe("Validação de CNPJ", () => {
    it("deve aceitar CNPJs válidos conhecidos", () => {
      expect(isValidCNPJ("00.000.000/0001-91")).toBe(true);
      expect(isValidCNPJ("00000000000191")).toBe(true);
      expect(isValidCNPJ("11.222.333/0001-81")).toBe(true);
    });

    it("deve rejeitar CNPJs com dígitos repetidos ou inválidos", () => {
      expect(isValidCNPJ("00000000000000")).toBe(false);
      expect(isValidCNPJ("11111111111111")).toBe(false);
      expect(isValidCNPJ("12.345.678/0001-00")).toBe(false);
    });
  });

  describe("Validação unificada CPF ou CNPJ", () => {
    it("deve validar CPF e CNPJ indistintamente e permitir nulo/vazio", () => {
      expect(isValidCpfOrCnpj("")).toBe(true);
      expect(isValidCpfOrCnpj(null)).toBe(true);
      expect(isValidCpfOrCnpj("52998224725")).toBe(true);
      expect(isValidCpfOrCnpj("00000000000191")).toBe(true);
      expect(isValidCpfOrCnpj("123")).toBe(false);
    });
  });
});
