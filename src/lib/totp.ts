import { createHmac, randomBytes } from "crypto";

/**
 * Converte Buffer/Array para Base32 string (RFC 4648)
 */
export function generateBase32Secret(length = 20): string {
  const bytes = randomBytes(length);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  let val = 0;
  let bits = 0;

  for (let i = 0; i < bytes.length; i++) {
    val = (val << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      secret += alphabet[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    secret += alphabet[(val << (5 - bits)) & 31];
  }

  return secret;
}

/**
 * Decodifica string Base32 em Buffer
 */
function base32ToBuffer(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let val = 0;
  let bits = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx === -1) continue;
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((val >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Calcula o código TOTP de 6 dígitos para o secret Base32 fornecido em determinado timestamp (RFC 6238)
 */
export function generateTotpCode(secretBase32: string, time = Date.now(), step = 30): string {
  const counter = Math.floor(time / 1000 / step);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(0, 0);
  counterBuffer.writeUInt32BE(counter, 4);

  const key = base32ToBuffer(secretBase32);
  const hmac = createHmac("sha1", key).update(counterBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const token = (code % 1000000).toString().padStart(6, "0");
  return token;
}

/**
 * Valida se um código TOTP é válido para o secret Base32 (janela de +/- 1 passo para compensar desvio de relógio)
 */
export function verifyTotpCode(token: string, secretBase32: string, step = 30): boolean {
  if (!token || token.length !== 6) return false;

  const now = Date.now();
  const windows = [-1, 0, 1];

  for (const w of windows) {
    const time = now + w * step * 1000;
    const generated = generateTotpCode(secretBase32, time, step);
    if (generated === token) return true;
  }

  return false;
}

/**
 * Gera URL otpauth:// para escanear em aplicativos como Google Authenticator ou Authy
 */
export function generateOtpAuthUrl(label: string, secret: string, issuer = "Pulse8"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;
}
