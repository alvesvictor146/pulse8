import { AuthError } from "./api-error";
import type { AuthContext } from "./session";

/** Roles disponíveis no sistema, em ordem crescente de permissão */
export type AppRole = "promoter" | "staff" | "finance" | "producer" | "admin";

const ROLE_HIERARCHY: Record<AppRole, number> = {
  promoter: 1,
  staff: 2,
  finance: 3,
  producer: 4,
  admin: 5,
};

/**
 * Verifica se o usuário autenticado tem a role mínima exigida.
 * @throws {AuthError} 403 se o usuário não tiver permissão suficiente.
 */
export function requireRole(auth: AuthContext, minRole: AppRole): void {
  const userLevel = ROLE_HIERARCHY[auth.role as AppRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole];

  if (userLevel < requiredLevel) {
    throw new AuthError(
      `Acesso negado. Esta ação exige permissão de ${minRole} ou superior. Sua role: ${auth.role}.`,
      403
    );
  }
}

/**
 * Verifica se o usuário é admin.
 */
export function requireAdmin(auth: AuthContext): void {
  requireRole(auth, "admin");
}

/**
 * Verifica se o usuário tem acesso financeiro (finance ou superior).
 */
export function requireFinance(auth: AuthContext): void {
  requireRole(auth, "finance");
}

/**
 * Verifica se o usuário é ao menos producer.
 */
export function requireProducer(auth: AuthContext): void {
  requireRole(auth, "producer");
}
