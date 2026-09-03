import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { db } from "./db";
import { AuthError } from "./api-error";

export { AuthError };

export interface AuthContext {
  userId: string;
  orgId: string;
  role: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  isAuthenticated: true;
}

/**
 * Extrai e valida o contexto autenticado da requisição.
 * Garante isolamento multi-tenant entre produtoras.
 *
 * @throws {AuthError} com status 401 se não houver sessão válida.
 * @throws {AuthError} com status 401 se a sessão não tiver orgId.
 */
export async function getAuthContext(request?: Request): Promise<AuthContext> {
  let session: any = null;

  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.warn("[getAuthContext] Falha ao ler sessão NextAuth:", err);
  }

  if (!session?.user) {
    throw new AuthError("Sessão inválida ou expirada. Faça login novamente.", 401);
  }

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    organizationId?: string;
    role?: string;
  };

  let orgId = user.organizationId;

  // Se a sessão não tiver orgId explícito (ex: primeiro login sem org),
  // tenta buscar o membership do usuário
  if (!orgId && user.id) {
    const membership = await db.membership.findFirst({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    orgId = membership?.organizationId;
  }

  if (!orgId) {
    throw new AuthError(
      "Usuário não está vinculado a nenhuma organização. Contate o administrador.",
      401
    );
  }

  return {
    userId: user.id,
    orgId,
    role: user.role || "member",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    isAuthenticated: true,
  };
}
