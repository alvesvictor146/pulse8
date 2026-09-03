import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Rotas públicas — sem autenticação necessária
        if (
          pathname === "/" ||
          pathname.startsWith("/registro") ||
          pathname.startsWith("/recuperar-senha") ||
          pathname.startsWith("/reset-password") ||
          pathname.startsWith("/api/auth") ||         // NextAuth endpoints
          pathname.startsWith("/api/webhooks") ||     // Webhooks externos (validam HMAC internamente)
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.startsWith("/manifest.json") ||
          pathname.startsWith("/sw.js") ||
          pathname.startsWith("/icon-")
        ) {
          return true;
        }

        // Todas as demais rotas (páginas + APIs) exigem token JWT válido
        return !!token;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: [
    // Páginas protegidas
    "/dashboard/:path*",
    "/eventos/:path*",
    "/financeiro/:path*",
    "/convidados/:path*",
    "/equipe/:path*",
    "/promoters/:path*",
    "/fornecedores/:path*",
    "/cronogramas/:path*",
    "/marketing/:path*",
    "/relatorios/:path*",
    "/seguranca/:path*",
    "/configuracoes/:path*",
    "/funcoes/:path*",
    "/checkin/:path*",

    // ✅ APIs protegidas (exceto auth e webhooks — tratados acima)
    "/api/((?!auth|webhooks).*)",
  ],
};
