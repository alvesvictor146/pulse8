import { createHmac } from "crypto";

function getQrSecret(): string {
  return process.env.QR_SECRET || "pulse8_dev_secret_key_change_in_production";
}

/** Janela máxima de validade de um QR Code (48 horas) */
const MAX_QR_AGE_MS = 48 * 60 * 60 * 1000;

/**
 * Gera um QR code seguro assinado com HMAC-SHA256 no formato:
 * P8:<guestId>:<eventId>:<timestamp>:<signature>
 */
export function generateSignedQrCode(guestId: string, eventId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${guestId}:${eventId}:${timestamp}`;
  const signature = createHmac("sha256", getQrSecret())
    .update(payload)
    .digest("hex")
    .slice(0, 16);

  return `P8:${payload}:${signature}`;
}

export interface QrVerificationResult {
  valid: boolean;
  guestId?: string;
  eventId?: string;
  timestamp?: number;
  reason?: string;
}

/**
 * Valida a integridade, assinatura HMAC-SHA256 e expiração de um QR code.
 *
 * Critérios de rejeição:
 * - Formato inválido (não começa com P8 ou não tem 5 partes)
 * - Assinatura HMAC diferente da esperada (falsificação)
 * - Timestamp mais antigo que MAX_QR_AGE_MS (48h) — ingresso expirado
 */
export function verifySignedQrCode(qrString: string): QrVerificationResult {
  if (!qrString || typeof qrString !== "string") {
    return { valid: false, reason: "Código QR ausente ou inválido" };
  }

  const parts = qrString.trim().split(":");
  if (parts.length < 5 || parts[0] !== "P8") {
    return { valid: false, reason: "Formato de QR Code desconhecido ou violado" };
  }

  const [, guestId, eventId, timestampStr, signature] = parts;
  const payload = `${guestId}:${eventId}:${timestampStr}`;

  // 1. Verificar assinatura HMAC
  const expectedSig = createHmac("sha256", getQrSecret())
    .update(payload)
    .digest("hex")
    .slice(0, 16);

  if (signature.toLowerCase() !== expectedSig.toLowerCase()) {
    return { valid: false, reason: "Assinatura digital inválida — QR Code falsificado" };
  }

  // 2. Verificar expiração temporal
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: "Timestamp do QR Code inválido" };
  }

  const age = Date.now() - timestamp;
  if (age > MAX_QR_AGE_MS) {
    const hoursOld = Math.floor(age / (60 * 60 * 1000));
    return {
      valid: false,
      reason: `QR Code expirado (emitido há ${hoursOld}h — validade máxima: 48h)`,
    };
  }

  return {
    valid: true,
    guestId,
    eventId,
    timestamp,
  };
}
