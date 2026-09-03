import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

// ── Startup Validation ──────────────────────────────────────────────────────
// Falha imediatamente se secrets obrigatórios não estiverem configurados.
// Isso evita que o app suba em produção com secrets hardcoded.
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "FATAL: Variável de ambiente NEXTAUTH_SECRET não definida.\n" +
      "Execute: echo NEXTAUTH_SECRET=$(openssl rand -base64 32) >> .env.local"
  );
}

if (!process.env.QR_SECRET) {
  throw new Error(
    "FATAL: Variável de ambiente QR_SECRET não definida.\n" +
      "Execute: echo QR_SECRET=$(openssl rand -base64 32) >> .env.local"
  );
}
// ────────────────────────────────────────────────────────────────────────────

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: {
            memberships: {
              include: {
                organization: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("Usuário ou senha incorretos");
        }

        if (!user.passwordHash) {
          throw new Error("Conta sem senha configurada. Contate o administrador.");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isMatch) {
          throw new Error("Usuário ou senha incorretos");
        }

        const activeMembership = user.memberships[0];
        if (!activeMembership) {
          throw new Error("Usuário não está vinculado a nenhuma organização.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          organizationId: activeMembership.organizationId,
          role: activeMembership.role || "member",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = (user as { organizationId?: string }).organizationId;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { organizationId?: string }).organizationId = token.organizationId as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
