import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { verifySymplaWebhookSignature } from "@/lib/sympla-webhook";

describe("Webhook Sympla em Tempo Real (EP-13 & CA-13.7)", () => {
  const SECRET = process.env.SYMPLA_WEBHOOK_SECRET || "pulse8-sympla-webhook-secret-2026";

  it("deve validar com sucesso a assinatura HMAC-SHA256 correta", () => {
    const rawPayload = JSON.stringify({
      event: "order.approved",
      data: {
        order_id: "PED-9999",
        buyer_name: "Mariana Costa",
        total_amount: 250.0,
      },
    });

    const signature = createHmac("sha256", SECRET)
      .update(rawPayload)
      .digest("hex");

    const isValid = verifySymplaWebhookSignature(rawPayload, signature);
    expect(isValid).toBe(true);
  });

  it("deve rejeitar uma requisição com assinatura forjada ou alterada", () => {
    const rawPayload = JSON.stringify({
      event: "order.approved",
      data: { order_id: "PED-9999" },
    });

    const fakeSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    const isValid = verifySymplaWebhookSignature(rawPayload, fakeSignature);
    expect(isValid).toBe(false);
  });

  it("deve rejeitar se o corpo do payload for modificado após a assinatura", () => {
    const originalPayload = JSON.stringify({ order_id: "123", amount: 100 });
    const signature = createHmac("sha256", SECRET)
      .update(originalPayload)
      .digest("hex");

    const tamperedPayload = JSON.stringify({ order_id: "123", amount: 9999 });

    const isValid = verifySymplaWebhookSignature(tamperedPayload, signature);
    expect(isValid).toBe(false);
  });
});
