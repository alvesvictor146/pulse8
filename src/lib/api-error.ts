import { NextResponse } from "next/server";

/**
 * Erro de autenticação/autorização que carrega HTTP status code.
 * Lançado por getAuthContext e requireRole — capturado nos handlers de rota.
 */
export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Trata erros de API de forma padronizada:
 * - AuthError → retorna status correto (401/403) com mensagem
 * - Outros erros → retorna 500 sem vazar detalhes internos para o cliente
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  // Log interno completo para debugging
  console.error("[API Error]", error);

  // Resposta externa sem vazar detalhes do stack/banco
  return NextResponse.json(
    { error: "Erro interno do servidor" },
    { status: 500 }
  );
}
