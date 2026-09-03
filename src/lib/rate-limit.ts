import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store em memória — substituir por Upstash Redis em produção para escalonamento horizontal
const store = new Map<string, RateLimitEntry>();

/**
 * Rate limiter simples baseado em Map em memória.
 *
 * @param key     Identificador único (IP, orgId, userId)
 * @param limit   Número máximo de requisições na janela
 * @param windowMs Duração da janela em milissegundos
 * @returns { allowed, remaining, resetAt }
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  entry.count++;
  store.set(key, entry);

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Resposta padronizada 429 Too Many Requests.
 */
export function rateLimitResponse(resetAt: number): Response {
  const retryAfterSec = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Muitas requisições. Tente novamente em breve." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Reset": String(resetAt),
      },
    }
  );
}

/**
 * Extrai a chave de identificação para rate limiting a partir da request.
 * Usa IP do cliente ou fallback para "unknown".
 */
export function getRateLimitKey(request: Request, prefix: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}
