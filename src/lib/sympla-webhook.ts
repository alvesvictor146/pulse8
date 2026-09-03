import { createHmac } from "crypto";

const SYMPLA_WEBHOOK_SECRET = process.env.SYMPLA_WEBHOOK_SECRET || "pulse8-sympla-webhook-secret-2026";

/**
 * Valida a assinatura HMAC-SHA256 enviada pelo Sympla no header X-Sympla-Signature
 */
export function verifySymplaWebhookSignature(payloadRaw: string, signatureHeader?: string | null): boolean {
  if (!signatureHeader) {
    if (process.env.NODE_ENV !== "production") return true;
    return false;
  }

  const expectedSignature = createHmac("sha256", SYMPLA_WEBHOOK_SECRET)
    .update(payloadRaw)
    .digest("hex");

  return expectedSignature.toLowerCase() === signatureHeader.toLowerCase().trim();
}
