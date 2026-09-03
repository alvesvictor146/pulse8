import { describe, it, expect } from "vitest";
import { generateSignedQrCode, verifySignedQrCode } from "./crypto";

describe("HMAC-SHA256 QR Code Security (EP-05)", () => {
  it("deve gerar um QR code assinado no padrão P8 com 5 partes", () => {
    const guestId = "guest-12345";
    const eventId = "event-67890";
    const qr = generateSignedQrCode(guestId, eventId);

    expect(qr).toMatch(/^P8:guest-12345:event-67890:\d+:[a-f0-9]{16}$/);
  });

  it("deve validar com sucesso um QR code gerado legitimamente", () => {
    const guestId = "guest-abc";
    const eventId = "event-xyz";
    const qr = generateSignedQrCode(guestId, eventId);

    const result = verifySignedQrCode(qr);

    expect(result.valid).toBe(true);
    expect(result.guestId).toBe(guestId);
    expect(result.eventId).toBe(eventId);
    expect(result.timestamp).toBeGreaterThan(0);
  });

  it("deve rejeitar um QR code adulterado no guestId", () => {
    const guestId = "guest-original";
    const eventId = "event-original";
    const qr = generateSignedQrCode(guestId, eventId);

    // Adulterar guestId mantendo a assinatura antiga
    const parts = qr.split(":");
    parts[1] = "guest-fake-hacker";
    const tamperedQr = parts.join(":");

    const result = verifySignedQrCode(tamperedQr);

    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Assinatura digital inválida");
  });

  it("deve rejeitar um QR code adulterado no eventId", () => {
    const guestId = "guest-1";
    const eventId = "event-1";
    const qr = generateSignedQrCode(guestId, eventId);

    const parts = qr.split(":");
    parts[2] = "event-outro";
    const tamperedQr = parts.join(":");

    const result = verifySignedQrCode(tamperedQr);

    expect(result.valid).toBe(false);
  });

  it("deve rejeitar formato inválido de string", () => {
    expect(verifySignedQrCode("").valid).toBe(false);
    expect(verifySignedQrCode("INVALID_CODE").valid).toBe(false);
    expect(verifySignedQrCode("OUTRO:123:456").valid).toBe(false);
  });
});
