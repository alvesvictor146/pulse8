import { describe, it, expect } from "vitest";
import { generateSignedQrCode, verifySignedQrCode } from "../../../lib/crypto";
import { generateBase32Secret, generateTotpCode, verifyTotpCode } from "../../../lib/totp";
import { checkRateLimit } from "../../../lib/rate-limit";

// Garante QR_SECRET no ambiente de teste
process.env.QR_SECRET = process.env.QR_SECRET || "test-qr-secret-key-32-chars-long!!";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "test-nextauth-secret-key-32-chars!!";

describe("Segurança & Criptografia (Pulse8)", () => {
  describe("QR Code HMAC Assinado", () => {
    it("deve gerar QR code no formato P8:<guestId>:<eventId>:<timestamp>:<sig>", () => {
      const qr = generateSignedQrCode("g-123", "ev-456");
      expect(qr).toMatch(/^P8:g-123:ev-456:\d+:[a-f0-9]{16}$/);
    });

    it("deve validar com sucesso um QR Code assinado legitimamente", () => {
      const qr = generateSignedQrCode("guest-abc", "event-xyz");
      const result = verifySignedQrCode(qr);
      expect(result.valid).toBe(true);
      expect(result.guestId).toBe("guest-abc");
      expect(result.eventId).toBe("event-xyz");
    });

    it("deve rejeitar QR Code com assinatura adulterada", () => {
      const qr = generateSignedQrCode("guest-abc", "event-xyz");
      const tampered = qr.slice(0, -4) + "0000";
      const result = verifySignedQrCode(tampered);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Assinatura digital inválida");
    });

    it("deve rejeitar QR Code com timestamp antigo (> 48h)", () => {
      const oldTimestamp = Date.now() - (49 * 60 * 60 * 1000); // 49h atrás
      const payload = `guest-old:event-xyz:${oldTimestamp}`;
      const crypto = require("crypto");
      const sig = crypto.createHmac("sha256", process.env.QR_SECRET!).update(payload).digest("hex").slice(0, 16);
      const expiredQr = `P8:${payload}:${sig}`;

      const result = verifySignedQrCode(expiredQr);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("expirado");
    });
  });

  describe("Autenticação 2FA TOTP (RFC 6238)", () => {
    it("deve gerar secret Base32 válido de 32 caracteres", () => {
      const secret = generateBase32Secret(20);
      expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    it("deve gerar e validar código TOTP de 6 dígitos", () => {
      const secret = generateBase32Secret(20);
      const token = generateTotpCode(secret);
      expect(token).toMatch(/^\d{6}$/);

      const isValid = verifyTotpCode(token, secret);
      expect(isValid).toBe(true);
    });

    it("deve rejeitar código TOTP incorreto", () => {
      const secret = generateBase32Secret(20);
      const isValid = verifyTotpCode("000000", secret);
      expect(isValid).toBe(false);
    });
  });

  describe("Rate Limiter em Memória", () => {
    it("deve permitir requisições dentro do limite", () => {
      const key = `test:${Date.now()}`;
      const rl1 = checkRateLimit(key, 3, 10000);
      expect(rl1.allowed).toBe(true);
      expect(rl1.remaining).toBe(2);

      const rl2 = checkRateLimit(key, 3, 10000);
      expect(rl2.allowed).toBe(true);
      expect(rl2.remaining).toBe(1);
    });

    it("deve bloquear requisições quando exceder o limite", () => {
      const key = `test-block:${Date.now()}`;
      checkRateLimit(key, 2, 10000);
      checkRateLimit(key, 2, 10000);

      const rl3 = checkRateLimit(key, 2, 10000);
      expect(rl3.allowed).toBe(false);
      expect(rl3.remaining).toBe(0);
    });
  });
});
